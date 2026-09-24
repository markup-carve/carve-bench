// Asserts every place that names a carve engine release names the same one.
//
// This repo's product is comparability, so a version printed anywhere has to be
// the version that ran. Four places name it independently - the manifest, the
// lockfile, the installed tree, and the README's provenance table - and nothing
// forced them to agree. PR #17 moved the first three and left the fourth at the
// previous release, so the section documenting the pins named engines no table
// in the repo had been measured against.
//
// Run with --require-installed to make a missing install a failure instead of a
// skip. CI passes it, so the check reads what is on disk rather than what a
// manifest asked for: a pin bump with no reinstall must not pass.
//
// Usage: node scripts/check-engine-pins.mjs [--require-installed]

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const requireInstalled = process.argv.includes('--require-installed')

const read = (...parts) => readFileSync(join(root, ...parts), 'utf8')
const readJson = (...parts) => JSON.parse(read(...parts))
const has = (...parts) => existsSync(join(root, ...parts))

// A requirement may carry Cargo's `=` operator; the resolved artifacts never do.
const bare = (requirement) => requirement.replace(/^=/, '')

const problems = []
const rows = []

function lane(name, { requirement, lock, installed }) {
  rows.push({ name, requirement, lock, installed })
  if (lock !== null && lock !== bare(requirement)) {
    problems.push(`${name}: lockfile resolves ${lock}, manifest requires ${requirement}`)
  }
  if (installed === null) {
    const note = `${name}: nothing installed to verify (run the install step first)`
    if (requireInstalled) problems.push(note)
  } else if (installed !== bare(requirement)) {
    problems.push(`${name}: installed tree is ${installed}, manifest requires ${requirement}`)
  }
}

// carve-js: npm, exact by virtue of having no range operator.
{
  const requirement = readJson('engines/js/package.json').dependencies['@markup-carve/carve']
  const lockEntry = readJson('engines/js/package-lock.json')
    .packages['node_modules/@markup-carve/carve']
  const installedManifest = 'engines/js/node_modules/@markup-carve/carve/package.json'
  lane('carve-js', {
    requirement,
    lock: lockEntry?.version ?? null,
    installed: has(installedManifest) ? readJson(installedManifest).version : null,
  })
}

// carve-php: Composer, likewise exact without an operator.
{
  const requirement = readJson('engines/php/composer.json').require['markup-carve/carve-php']
  const locked = readJson('engines/php/composer.lock').packages
    .find((pkg) => pkg.name === 'markup-carve/carve-php')
  const installedManifest = 'engines/php/vendor/composer/installed.json'
  let installed = null
  if (has(installedManifest)) {
    const entries = readJson(installedManifest)
    const list = Array.isArray(entries) ? entries : entries.packages
    installed = list.find((pkg) => pkg.name === 'markup-carve/carve-php')?.version ?? null
  }
  lane('carve-php', { requirement, lock: locked?.version ?? null, installed })
}

// carve-rs: the `=` is load-bearing, so the requirement is compared verbatim
// against the README and only stripped when matching resolved artifacts.
{
  const toml = read('engines/rs/Cargo.toml')
  const requirement = toml.match(/package\s*=\s*"carve-lang"[^}]*version\s*=\s*"([^"]+)"/)?.[1]
  if (!requirement) throw new Error('engines/rs/Cargo.toml: no carve-lang requirement found')

  const block = read('engines/rs/Cargo.lock')
    .split('[[package]]')
    .find((part) => /^\s*name\s*=\s*"carve-lang"\s*$/m.test(part))
  const lock = block?.match(/^\s*version\s*=\s*"([^"]+)"/m)?.[1] ?? null

  // The binary is the installed tree here: build.rs bakes the resolved engine
  // into it, so asking the artifact beats re-reading the lock it was built from.
  lane('carve-rs', { requirement, lock, installed: builtRustEngine() })
}

// The README table is prose, so it drifts silently. Compare it to the manifests.
{
  const readme = read('README.md')
  const manifests = {
    'carve-js': 'engines/js/package.json',
    'carve-php': 'engines/php/composer.json',
    'carve-rs': 'engines/rs/Cargo.toml',
  }
  for (const { name, requirement } of rows) {
    const row = readme
      .split('\n')
      .find((line) => line.startsWith(`| ${name} |`) && line.includes(manifests[name]))
    if (!row) {
      problems.push(`README.md: no provenance row for ${name}`)
      continue
    }
    const documented = row.split('|')[3]?.match(/`([^`]+)`/)?.[1]
    if (documented !== requirement) {
      problems.push(
        `README.md: provenance table says ${name} is \`${documented}\`, manifest requires \`${requirement}\``,
      )
    }
  }
}

function builtRustEngine() {
  const bin = join(root, 'engines/rs/target/release/carve-bench-rs')
  if (!existsSync(bin)) return null
  try {
    const line = execFileSync(bin, [join(root, 'corpus/small.crv'), '1'], { encoding: 'utf8' })
    return JSON.parse(line).carve_source?.match(/carve-lang (\S+)/)?.[1] ?? null
  } catch {
    return null
  }
}

const cell = (value) => (value === null ? 'not installed' : value)
console.log('engine pins (requirement / lockfile / installed):')
for (const { name, requirement, lock, installed } of rows) {
  console.log(`  ${name.padEnd(10)} ${requirement.padEnd(8)} ${cell(lock).padEnd(13)} ${cell(installed)}`)
}

if (problems.length > 0) {
  console.error(`\nengine pins disagree:\n  ${problems.join('\n  ')}`)
  process.exit(1)
}
console.log('\nall four places agree with the manifests.')
