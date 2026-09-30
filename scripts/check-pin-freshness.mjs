// Reports when a lane's pinned engine release is no longer the newest published one.
//
// check-engine-pins.mjs asks whether the four places that name a release agree.
// They can agree perfectly and still name an engine two releases old, which is
// what happened three times in five weeks: the manifests moved on 2026-09-23,
// the README caught up on 2026-09-24, and by 2026-09-30 all four named releases
// the registries had already superseded. Nothing in the repo could see that,
// because every check compared the repo against itself.
//
// So this one leaves the repo. It asks each registry for the newest stable
// release and fails when a pin is behind it. A failure is not a defect in the
// tables; it means the tables describe an engine nobody installs any more, and
// the fix is a pin bump plus a re-measure - never a pin bump alone, which would
// leave the numbers describing the old engine under the new version's name.
//
// Pre-releases are ignored: a lane pins what an ordinary user would install.
//
// Usage: node scripts/check-pin-freshness.mjs [--json]

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const asJson = process.argv.includes('--json')

const read = (...parts) => readFileSync(join(root, ...parts), 'utf8')
const readJson = (...parts) => JSON.parse(read(...parts))

const bare = (requirement) => requirement.replace(/^=/, '')
const isStable = (version) => /^\d+\.\d+\.\d+$/.test(version)

// Semver ordering over the stable triples, newest first.
function compare(a, b) {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pb[i] - pa[i]
  }
  return 0
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'carve-bench pin freshness check' } })
  if (!response.ok) throw new Error(`${url} answered ${response.status}`)
  return response.json()
}

const lanes = [
  {
    name: 'carve-js',
    registry: 'npm @markup-carve/carve',
    pinned: () => readJson('engines/js/package.json').dependencies['@markup-carve/carve'],
    latest: async () => {
      const body = await fetchJson('https://registry.npmjs.org/@markup-carve/carve')
      return Object.keys(body.versions).filter(isStable).sort(compare)[0]
    },
  },
  {
    name: 'carve-php',
    registry: 'Packagist markup-carve/carve-php',
    pinned: () => readJson('engines/php/composer.json').require['markup-carve/carve-php'],
    latest: async () => {
      const body = await fetchJson('https://repo.packagist.org/p2/markup-carve/carve-php.json')
      return body.packages['markup-carve/carve-php']
        .map((entry) => entry.version.replace(/^v/, ''))
        .filter(isStable)
        .sort(compare)[0]
    },
  },
  {
    name: 'carve-rs',
    registry: 'crates.io carve-lang',
    pinned: () => {
      const manifest = read('engines/rs/Cargo.toml')
      const match = manifest.match(/package\s*=\s*"carve-lang",\s*version\s*=\s*"([^"]+)"/)
      if (!match) throw new Error('engines/rs/Cargo.toml no longer names a carve-lang version')
      return match[1]
    },
    latest: async () => {
      const body = await fetchJson('https://crates.io/api/v1/crates/carve-lang')
      return body.crate.max_stable_version ?? body.crate.max_version
    },
  },
]

const rows = []
for (const lane of lanes) {
  const pinned = bare(lane.pinned())
  const latest = await lane.latest()
  rows.push({ lane: lane.name, registry: lane.registry, pinned, latest, behind: compare(pinned, latest) > 0 })
}

if (asJson) {
  process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`)
} else {
  process.stdout.write('engine pins against the newest published release:\n')
  for (const row of rows) {
    const verdict = row.behind ? `BEHIND ${row.latest}` : 'current'
    process.stdout.write(`  ${row.lane.padEnd(10)} ${row.pinned.padEnd(8)} ${verdict}\n`)
  }
}

const behind = rows.filter((row) => row.behind)
if (behind.length > 0) {
  process.stderr.write('\nA pin is behind its registry. Bump it AND re-run both tracks:\n')
  for (const row of behind) {
    process.stderr.write(`  ${row.lane}: pinned ${row.pinned}, published ${row.latest} (${row.registry})\n`)
  }
  process.stderr.write('A bump without a re-measure publishes the old engine\'s numbers under the new version.\n')
  process.exit(1)
}
