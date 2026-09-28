// Builds the Rust harness and states which carve-rs tree it compiled against.
//
// The Rust lane pins one published `carve-lang` release exactly, because a table
// mixing engine revisions is not a comparison. Measuring an unreleased engine is
// therefore an override, and the override this repo used to document was a
// `[patch]` to a checkout:
//
//   cargo build --release --config 'patch.crates-io.carve-lang.path=../../../carve-rs'
//
// Cargo refuses a patch whose version does not satisfy the requirement, and also
// one that disagrees with the lockfile. It refuses it by WARNING, building the
// registry release, and exiting 0 - so once carve-rs `main` moved past the pin,
// that command measured the published release while reading like a checkout run
// (carve-bench#19). Neither relaxing the requirement nor bumping the pin closes
// that: the lock pins the release too, and the next carve-rs release re-breaks a
// bumped pin.
//
// So a checkout is built as a PATH DEPENDENCY instead, from a generated manifest
// with no version requirement at all and its own lockfile. There is no
// requirement left to mismatch, so there is no fallback to fall back to. Both
// modes then resolve before they compile, refuse anything but the tree that was
// asked for, and read the built binary back to confirm it agrees.
//
// Usage:
//   node scripts/build-rs-engine.mjs                       # the pinned release
//   node scripts/build-rs-engine.mjs --carve-rs ../carve-rs # a local checkout
//   node scripts/build-rs-engine.mjs --carve-rs ... --debug # skip optimization
//   node scripts/build-rs-engine.mjs ... --resolve-only     # resolve, do not build

import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ENGINE = 'carve-lang'
const root = dirname(dirname(fileURLToPath(import.meta.url)))
const lane = join(root, 'engines/rs')
// The generated crate and its build output are siblings: regenerating the crate
// must not throw away the compiled dependencies, or every checkout build starts
// from nothing and even a resolve-only check deletes a usable harness.
const overrideDir = join(lane, 'target/local-override')
const crateDir = join(overrideDir, 'crate')
const overrideTarget = join(overrideDir, 'target')

const args = process.argv.slice(2)
if (args.includes('--help')) {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n\n')[0])
  process.exit(0)
}
const debug = args.includes('--debug')
// Resolution is where a substituted engine is decided, so it can be checked on
// its own: seconds, and no compiler.
const resolveOnly = args.includes('--resolve-only')
const profile = debug ? 'debug' : 'release'
const flag = args.indexOf('--carve-rs')
if (flag >= 0 && !args[flag + 1]) die('--carve-rs needs the path to a carve-rs checkout')
const checkout = flag >= 0 ? resolve(root, args[flag + 1]) : envCheckout()

const built = checkout ? buildCheckout(checkout) : buildPinnedRelease()
console.log(`\n${resolveOnly ? 'resolves to' : 'measured tree'}: ${built.source}`)
if (!resolveOnly) {
  console.log(`  ${relative(root, built.bin)}`)
  console.log(`  ${relative(root, built.compareBin)}`)
}
if (checkout && !resolveOnly) {
  console.log(
    '\nRun against it by naming the same tree, which run.mjs and compare.mjs verify\n' +
      'against what the harness reports:\n' +
      `  export CARVE_RS_SRC=${relative(root, checkout) || checkout}\n` +
      '  node run.mjs',
  )
}

/** The pinned release: resolve under `--locked`, then confirm the binary agrees. */
function buildPinnedRelease() {
  const manifest = join(lane, 'Cargo.toml')
  const targetDir = join(lane, 'target')
  const resolved = resolveEngine(manifest, ['--locked'])
  if (resolved.source === null) {
    die(
      `${manifest} resolves ${ENGINE} ${resolved.version} from ${resolved.manifest_path}, not a\n` +
        'published release. Something is overriding this lane - a [patch] in a cargo config,\n' +
        'or a path dependency in the manifest. Pass --carve-rs to measure a checkout on purpose.',
    )
  }
  const expected = `${ENGINE} ${resolved.version} (crates.io`
  if (resolveOnly) return { source: `${expected}, ...) from ${resolved.source}` }
  cargo(manifest, targetDir, ['--locked'], {})
  return verify(targetDir, expected)
}

/**
 * A checkout: generate a manifest whose carve dependency is a path, so the
 * resolution cannot silently land anywhere else, and build that.
 */
function buildCheckout(tree) {
  const manifest = join(tree, 'Cargo.toml')
  if (!existsSync(manifest)) die(`no ${manifest} - --carve-rs wants a carve-rs checkout`)
  const pkg = readFileSync(manifest, 'utf8').split(/^\[/m)[1] ?? ''
  const name = pkg.match(/^\s*name\s*=\s*"([^"]+)"/m)?.[1]
  const version = pkg.match(/^\s*version\s*=\s*"([^"]+)"/m)?.[1]
  if (name !== ENGINE) die(`${manifest} is \`${name}\`, not ${ENGINE} - is that a carve-rs checkout?`)

  generateOverrideCrate(tree)
  const generated = join(crateDir, 'Cargo.toml')
  const resolved = resolveEngine(generated, [])
  if (resolved.source !== null || resolved.manifest_path !== manifest) {
    die(
      `asked for ${tree}, but cargo resolves ${ENGINE} ${resolved.version} from\n` +
        `  ${resolved.manifest_path}${resolved.source ? ` (${resolved.source})` : ''}`,
    )
  }
  const stamp = `${tree}${revisionOf(tree)}`
  const expected = `${ENGINE} ${version} (local checkout ${stamp})`
  if (resolveOnly) return { source: expected }
  cargo(generated, overrideTarget, [], { CARVE_BENCH_RS_OVERRIDE: stamp })
  return verify(overrideTarget, expected)
}

/**
 * The tracked manifest with its pinned carve requirement replaced by a path.
 *
 * Derived from the tracked file rather than written out here, so the peer
 * dependencies, the binaries and the release profile cannot drift from the lane
 * this is standing in for.
 */
function generateOverrideCrate(tree) {
  const lines = readFileSync(join(lane, 'Cargo.toml'), 'utf8').split('\n')
  let at = lines.findIndex((line) => line.startsWith('carve = '))
  if (at < 0) die(`${join(lane, 'Cargo.toml')}: no \`carve = \` dependency line to replace`)
  // The comment above it documents the pin, which this manifest does not have.
  let from = at
  while (from > 0 && lines[from - 1].startsWith('#')) from -= 1
  lines.splice(from, at - from + 1, `carve = { package = "${ENGINE}", path = ${JSON.stringify(tree)} }`)

  rmSync(crateDir, { recursive: true, force: true })
  mkdirSync(crateDir, { recursive: true })
  writeFileSync(
    join(crateDir, 'Cargo.toml'),
    [
      '# GENERATED by scripts/build-rs-engine.mjs - edit engines/rs/Cargo.toml instead.',
      '# The carve dependency is a path, so there is no version requirement that a',
      '# checkout could fail to satisfy, and no release for cargo to fall back to.',
      ...lines,
      '# Its own workspace, so cargo does not read this as a member of anything.',
      '[workspace]',
      '',
    ].join('\n'),
  )
  cpSync(join(lane, 'build.rs'), join(crateDir, 'build.rs'))
  cpSync(join(lane, 'src'), join(crateDir, 'src'), { recursive: true })
  // The lane's lockfile, so the peer libraries a checkout run is compared
  // against stay the versions the pinned lane measures. Cargo re-resolves the
  // carve entry, which is the one line that has to change.
  cpSync(join(lane, 'Cargo.lock'), join(crateDir, 'Cargo.lock'))
}

/**
 * What cargo will compile as the engine, read before anything is compiled.
 *
 * `source: null` is a path dependency or an applied patch; a registry string is
 * a published release. A refused patch is a warning on a successful command, so
 * it is caught here rather than trusted to be absent.
 */
function resolveEngine(manifest, extra) {
  const run = spawnSync(
    'cargo',
    ['metadata', '--format-version', '1', '--manifest-path', manifest, ...extra],
    // Cargo discovers `.cargo/config.toml` from the working directory, not from
    // the manifest, so both cargo calls stand in the crate's own directory: a
    // patch that a hand-run build in there would apply is a patch this sees.
    { cwd: dirname(manifest), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  )
  // A refused patch is diagnosed before the exit status, because cargo reports it
  // as a warning or as an error depending on whether the lockfile already records
  // the refusal, and the reason is the same either way.
  if (/was not used in the crate graph/.test(run.stderr ?? '')) {
    die(`cargo refused an override while resolving ${manifest}:\n${run.stderr.trim()}`)
  }
  if (run.status !== 0) die(`cargo metadata failed for ${manifest}:\n${run.stderr ?? run.error}`)
  const found = JSON.parse(run.stdout).packages.filter((entry) => entry.name === ENGINE)
  if (found.length !== 1) die(`${manifest}: expected one ${ENGINE} in the graph, found ${found.length}`)
  return found[0]
}

function cargo(manifest, targetDir, extra, env) {
  const argv = ['build', '--manifest-path', manifest, '--target-dir', targetDir, ...extra]
  if (!debug) argv.push('--release')
  console.error(`+ cargo ${argv.join(' ')}`)
  const run = spawnSync('cargo', argv, {
    cwd: dirname(manifest),
    stdio: 'inherit',
    env: { ...process.env, ...env },
  })
  if (run.status !== 0) die('cargo build failed')
}

/** Ask the binary itself, so a stale or misplaced artifact cannot pass. */
function verify(targetDir, expected) {
  const bin = join(targetDir, profile, 'carve-bench-rs')
  const compareBin = join(targetDir, profile, 'carve-bench-rs-compare')
  for (const path of [bin, compareBin]) {
    if (!existsSync(path)) die(`cargo reported success but ${path} is missing`)
  }
  const line = execFileSync(bin, [join(root, 'corpus/small.crv'), '1'], { encoding: 'utf8' })
  const source = JSON.parse(line.trim().split('\n').pop()).carve_source
  if (!source?.startsWith(expected)) {
    die(`the built harness reports \`${source}\`, expected \`${expected}...\``)
  }
  return { bin, compareBin, source }
}

function envCheckout() {
  const asked = process.env.CARVE_RS_SRC
  return asked ? resolve(root, asked) : null
}

function revisionOf(tree) {
  try {
    const rev = execFileSync('git', ['-C', tree, 'rev-parse', '--short', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    return rev ? ` @ ${rev}` : ''
  } catch {
    return ''
  }
}

function die(message) {
  console.error(`build-rs-engine: ${message}`)
  process.exit(1)
}
