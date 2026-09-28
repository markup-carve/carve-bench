// Proves the override check can FIRE, not just that it stays quiet.
//
// A check against a silent fallback is worth nothing until it has been seen to
// detect one, so the first cases here are the exact readings carve-bench#19
// shipped: an override asking for a checkout while the harness reports the
// published release. Each case states the source line a harness really emits.
//
// The crafted cases pin the check against source lines written out here, so
// `--binary <harness> --tree <checkout>` additionally runs a real harness and
// asserts the check accepts what it reports. That is the half a crafted string
// cannot cover: the wording `engines/rs/build.rs` bakes in and the wording this
// check reads have to be the same wording.
//
// Usage: node scripts/test-measured-sources.mjs [--binary <path> --tree <path>]

import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { overrideProblems, requestedOverrides } from './measured-sources.mjs'

// A stand-in for a checkout beside this repo. The subpaths exist because the JS
// and PHP overrides name one inside the checkout, not the checkout itself.
const tree = mkdtempSync(join(tmpdir(), 'carve-bench-tree-'))
const other = mkdtempSync(join(tmpdir(), 'carve-bench-other-'))
mkdirSync(join(tree, 'src'), { recursive: true })
mkdirSync(join(tree, 'dist'), { recursive: true })
writeFileSync(join(tree, 'dist/index.js'), '')

const RELEASES = {
  'carve-rs': 'carve-lang 0.1.6 (crates.io, checksum 87fdad4ca9cefc50)',
  'carve-js': '@markup-carve/carve 0.1.7 (npm package)',
  'carve-php': 'markup-carve/carve-php 0.1.9 (Composer package, reference d4b53388)',
}
const checkoutOf = (engine, dir) =>
  engine === 'carve-rs'
    ? `carve-lang 0.1.7 (local checkout ${dir} @ 219c770b)`
    : `${engine} (local checkout ${dir} @ 219c770b)`

const cases = [
  // The defect, on every lane that can express it.
  ...Object.entries(RELEASES).map(([engine, source]) => ({
    name: `${engine}: asked for a checkout, measured the release`,
    env: envFor(engine, tree),
    sources: { [engine]: [source] },
    fires: 'measured `',
  })),
  {
    name: 'carve-rs: measured a checkout, but not the one asked for',
    env: { CARVE_RS_SRC: tree },
    sources: { 'carve-rs': [checkoutOf('carve-rs', other)] },
    fires: 'measured the checkout at',
  },
  {
    name: 'carve-rs: a build that did not record which tree it used',
    env: { CARVE_RS_SRC: tree },
    sources: { 'carve-rs': ['carve-lang 0.1.7 (local checkout, tree not recorded)'] },
    fires: 'does not name the tree it measured',
  },
  {
    name: 'carve-rs: the lane failed, so nothing reported a source',
    env: { CARVE_RS_SRC: tree },
    sources: {},
    fires: 'reported no carve_source',
  },
  {
    name: 'carve-rs: the override names a path that is not there',
    env: { CARVE_RS_SRC: join(tree, 'absent') },
    sources: { 'carve-rs': [checkoutOf('carve-rs', tree)] },
    fires: 'does not exist',
  },
  {
    name: 'carve-rs: a worktree nested inside the checkout that was asked for',
    env: { CARVE_RS_SRC: tree },
    sources: { 'carve-rs': [checkoutOf('carve-rs', join(tree, 'worktrees/experiment'))] },
    fires: 'measured the checkout at',
  },
  {
    name: 'carve-php: one row from the checkout and one from the vendored release',
    env: { CARVE_PHP_SRC: join(tree, 'src') },
    sources: { 'carve-php': [checkoutOf('carve-php', tree), RELEASES['carve-php']] },
    fires: 'measured `',
  },

  // Honored overrides and plain release runs stay silent.
  ...Object.keys(RELEASES).map((engine) => ({
    name: `${engine}: the checkout that was asked for is the one measured`,
    env: envFor(engine, tree),
    sources: { [engine]: [checkoutOf(engine, tree)] },
    fires: null,
  })),
  {
    name: 'no override set: a release run is not an unmet claim',
    env: {},
    sources: { 'carve-rs': [RELEASES['carve-rs']] },
    fires: null,
  },
  {
    name: 'CARVE_JS naming the npm package is not a checkout request',
    env: { CARVE_JS: '@markup-carve/carve' },
    sources: { 'carve-js': [RELEASES['carve-js']] },
    fires: null,
  },
]

let failed = 0
for (const { name, env, sources, fires } of cases) {
  const problems = overrideProblems(asMap(sources), env, tree)
  const fired = problems.length > 0
  const matched = fires === null ? !fired : fired && problems.some((p) => p.includes(fires))
  console.log(`${matched ? 'ok  ' : 'FAIL'} ${name}`)
  if (matched) continue
  failed += 1
  console.log(`       expected ${fires === null ? 'no problem' : `a problem saying "${fires}"`}`)
  console.log(`       got ${problems.length === 0 ? 'none' : problems.map((p) => `"${p}"`).join('; ')}`)
}

// CARVE_JS is the one override that doubles as a registry specifier.
for (const [spec, expected] of [['@markup-carve/carve', 0], [tree, 1], ['../carve-js/dist/index.js', 1]]) {
  const asked = requestedOverrides({ CARVE_JS: spec }, tree).length
  const ok = asked === expected
  console.log(`${ok ? 'ok  ' : 'FAIL'} CARVE_JS=${spec} asks for ${expected} checkout(s)`)
  if (!ok) failed += 1
}

// A relative override has to be read from the same place its consumer reads it:
// CARVE_JS from `engines/js/`, the other two from the directory the run started
// in. Reading one against the other looks for a tree the harness never loaded.
for (const [env, expected] of [
  [{ CARVE_JS: '../../../carve-js' }, join(tree, 'carve-js')],
  [{ CARVE_PHP_SRC: '../carve-php/src' }, join(tree, '../carve-php/src')],
  [{ CARVE_RS_SRC: '../carve-rs' }, join(tree, '../carve-rs')],
]) {
  const [asked] = requestedOverrides(env, join(tree, 'root'), tree)
  const ok = asked?.tree === expected
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${asked?.variable} resolves to ${expected}`)
  if (!ok) {
    failed += 1
    console.log(`       got ${asked?.tree}`)
  }
}

// A real harness, when one is offered: what it reports for a checkout has to be
// what this check recognizes as that checkout.
const binary = valueOf('--binary')
if (binary) {
  const asked = valueOf('--tree') ?? die('--binary also needs --tree, the checkout that was asked for')
  const corpus = new URL('../corpus/small.crv', import.meta.url).pathname
  const source = JSON.parse(
    execFileSync(binary, [corpus, '1'], { encoding: 'utf8' }).trim().split('\n').pop(),
  ).carve_source
  const problems = overrideProblems(asMap({ 'carve-rs': [source] }), { CARVE_RS_SRC: asked }, process.cwd())
  const ok = problems.length === 0
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${binary} reports \`${source}\`, accepted for ${asked}`)
  if (!ok) {
    failed += 1
    console.log(`       ${problems.join('\n       ')}`)
  }
}

console.log(failed === 0 ? '\nthe override check fires on every silent fallback above.' : `\n${failed} failed`)
process.exit(failed === 0 ? 0 : 1)

function valueOf(flag) {
  const at = process.argv.indexOf(flag)
  return at > 0 ? process.argv[at + 1] : undefined
}

function die(message) {
  console.error(`test-measured-sources: ${message}`)
  process.exit(1)
}

function envFor(engine, dir) {
  if (engine === 'carve-rs') return { CARVE_RS_SRC: dir }
  if (engine === 'carve-php') return { CARVE_PHP_SRC: join(dir, 'src') }
  return { CARVE_JS: join(dir, 'dist/index.js') }
}

function asMap(sources) {
  return new Map(Object.entries(sources).map(([engine, seen]) => [engine, new Set(seen)]))
}
