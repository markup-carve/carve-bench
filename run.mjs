// carve-bench orchestrator.
// Runs each engine harness over each corpus document and writes RESULTS.md.
//
// Engine resolution (override via env):
//   CARVE_JS              path/specifier for carve-js          (default: carve-js)
//   CARVE_PHP_AUTOLOAD    path to carve-php vendor/autoload.php (default: engines/php/vendor/autoload.php)
//   CARVE_RS_BIN          path to the built rust harness        (default: engines/rs/target/release/carve-bench-rs)
//
// Usage: node run.mjs [--quick]
import { execFileSync } from 'node:child_process'
import { readdirSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, basename } from 'node:path'

const root = dirname(fileURLToPath(import.meta.url))
const quick = process.argv.includes('--quick')

// Iterations per document size (fewer for the big one to keep wall time sane).
const ITERS = quick
  ? { small: 20, medium: 10, large: 3 }
  : { small: 2000, medium: 500, large: 50 }

const RS_BIN = process.env.CARVE_RS_BIN ?? resolve(root, 'engines/rs/target/release/carve-bench-rs')

const engines = [
  {
    name: 'carve-js',
    run: (doc, iters) =>
      execFileSync('node', [resolve(root, 'engines/js/bench.mjs'), doc, String(iters)], {
        encoding: 'utf8',
        env: process.env,
      }),
  },
  {
    name: 'carve-php',
    run: (doc, iters) => {
      // Enable opcache + tracing JIT so PHP is measured the way production runs it.
      // Append extra ini flags via CARVE_PHP_INI (space-separated -d flags/values), e.g.
      //   CARVE_PHP_INI="-d opcache.jit=off" node run.mjs
      const iniFlags = [
        '-d', 'opcache.enable_cli=1',
        '-d', 'opcache.jit_buffer_size=128M',
        '-d', 'opcache.jit=tracing',
      ]
      const extraIni = process.env.CARVE_PHP_INI
        ? process.env.CARVE_PHP_INI.trim().split(/\s+/)
        : []
      return execFileSync(
        'php',
        [...iniFlags, ...extraIni, resolve(root, 'engines/php/bench.php'), doc, String(iters)],
        { encoding: 'utf8', env: process.env },
      )
    },
  },
  {
    name: 'carve-rs',
    run: (doc, iters) => execFileSync(RS_BIN, [doc, String(iters)], { encoding: 'utf8' }),
  },
]

const corpusDir = resolve(root, 'corpus')
const SIZE_ORDER = ['small', 'medium', 'large']
const docs = readdirSync(corpusDir)
  .filter((f) => f.endsWith('.crv'))
  .sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(basename(a, '.crv'))
    const ib = SIZE_ORDER.indexOf(basename(b, '.crv'))
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b)
  })

const results = {} // doc -> engine -> {ms_per_op, mb_per_s, bytes}
for (const doc of docs) {
  const key = basename(doc, '.crv')
  const iters = ITERS[key] ?? 100
  results[key] = {}
  for (const engine of engines) {
    try {
      const line = engine.run(resolve(corpusDir, doc), iters).trim().split('\n').pop()
      results[key][engine.name] = JSON.parse(line)
      const r = results[key][engine.name]
      const extra = r.jit !== undefined ? ` jit=${r.jit}` : ''
      console.error(`${key.padEnd(8)} ${engine.name.padEnd(10)} ${r.ms_per_op} ms/op${extra}`)
    } catch (e) {
      console.error(`${key} ${engine.name}: FAILED - ${e.message.split('\n')[0]}`)
      results[key][engine.name] = null
    }
  }
}

// PHP extension tiers, measured over the comparison document so the table in
// RESULTS.md is a reading from this run rather than transcribed constants.
const TIER_LABELS = {
  tier1: 'Tier 1 core/default',
  tier2: 'Tier 2 stack',
  tier3: 'Tier 3 stack',
}
const TIER_DOC = resolve(root, 'corpus/comparison/carve.crv')
const TIER_ITERS = quick ? 2 : 5
const tiers = []
if (existsSync(TIER_DOC)) {
  const tierIni = [
    '-n', '-d', 'extension=ctype', '-d', `extension=${process.env.CARVE_PHP_MBSTRING ?? 'mbstring'}`,
    '-d', 'opcache.enable_cli=1', '-d', 'opcache.jit_buffer_size=128M', '-d', 'opcache.jit=tracing',
  ]
  for (const profile of Object.keys(TIER_LABELS)) {
    try {
      const line = execFileSync(
        'php',
        [...tierIni, resolve(root, 'engines/php/tiers.php'), profile, TIER_DOC, String(TIER_ITERS), '5'],
        { encoding: 'utf8', env: process.env },
      ).trim().split('\n').pop()
      const tier = JSON.parse(line)
      tiers.push(tier)
      console.error(`${profile.padEnd(8)} carve-php  ${tier.ms_per_op.toFixed(2)} ms/op jit=${tier.jit}`)
    } catch (e) {
      console.error(`${profile} carve-php: FAILED - ${e.message.split('\n')[0]}`)
    }
  }
}

// Render RESULTS.md
const lines = []
lines.push(
  '# Benchmark results: authoritative/full parser', '',
  'This is **Track B**, the Carve-owned authoritative/full-parser view. The mixed',
  'corpus falls outside the conservative borrowed facades and therefore exercises',
  'normal AST construction, extension-capable parsing, and rendering. It answers',
  'how the three Carve implementations scale on their full language—not how their',
  'fastest core-only convenience API compares with another library.', '',
  'For **Track A**, the primary core source-to-HTML comparison against the',
  'same-language libraries, see [`COMPARISON.md`](./COMPARISON.md).', '',
)
lines.push(
  'Parse + render to HTML, in-process, averaged over many iterations. Lower',
  'ms/op and higher MB/s are better. `rel` is relative to the fastest engine for',
  'that document (1.00x = fastest). Numbers are machine-specific - run it yourself',
  'with `node run.mjs`; see README for setup.',
  '',
)
if (process.env.CARVE_RUN_META) lines.push(`**Run:** ${process.env.CARVE_RUN_META}`, '')
if (process.env.CARVE_ENGINE_HEADS) lines.push(`**Engine heads:** ${process.env.CARVE_ENGINE_HEADS}`, '')
if (process.env.CARVE_CORPUS_SNAPSHOT) lines.push(`**Corpus snapshot:** ${process.env.CARVE_CORPUS_SNAPSHOT}`, '')
lines.push('![Bar chart of Carve engine throughput for each corpus size](./charts/full-corpus.svg)', '')
for (const doc of docs) {
  const key = basename(doc, '.crv')
  const row = results[key]
  const bytes = Object.values(row).find(Boolean)?.bytes ?? 0
  lines.push(`## ${key} (${(bytes / 1024).toFixed(1)} KB)`, '')
  lines.push('| Engine | ms/op | MB/s | rel |', '|---|---:|---:|---:|')
  const best = Math.min(...Object.values(row).filter(Boolean).map((r) => r.ms_per_op))
  for (const engine of engines) {
    const r = row[engine.name]
    if (!r) {
      lines.push(`| ${engine.name} | - | - | - |`)
      continue
    }
    const rel = (r.ms_per_op / best).toFixed(2)
    lines.push(`| ${engine.name} | ${r.ms_per_op.toFixed(4)} | ${r.mb_per_s.toFixed(2)} | ${rel}x |`)
  }
  lines.push('')
}
const tier1 = tiers.find((tier) => tier.profile === 'tier1')
if (tier1) {
  lines.push(
    '## PHP authoritative extension tiers', '',
    'These are internal Carve measurements over the same core document, measured',
    'by this run rather than transcribed. Tier 1 is the default public conversion',
    'route; Tier 2 and Tier 3 register opt-in extensions on top of it. Since',
    'carve-php #1515 made configured conversion allocation-light, registering an',
    'extension no longer forces a wholly separate slow path, so these rows read as',
    'the registration and hook tax on a document whose content does not trigger',
    'the registered extensions. They are internal diagnostics, not competitor rows.', '',
    '| Profile | Registered extensions | ms/op | MB/s | cost vs Tier 1 |',
    '|---|---:|---:|---:|---:|',
  )
  for (const tier of tiers) {
    const cost = tier === tier1
      ? 'baseline'
      : `+${Math.round((tier.ms_per_op / tier1.ms_per_op - 1) * 100).toLocaleString('en-US')}%`
    lines.push(
      `| ${TIER_LABELS[tier.profile]} | ${tier.tier2_extensions + tier.tier3_extensions} |` +
        ` ${tier.ms_per_op.toFixed(2)} | ${tier.mb_per_s.toFixed(2)} | ${cost} |`,
    )
  }
  lines.push('')
}
lines.push(
  '![Bar chart of carve-php Tier 1, Tier 2, and Tier 3 profile throughput](./charts/php-tiers.svg)', '',
  'The exact extension bundles and interpretation are documented in',
  '[`FINDINGS.md`](./FINDINGS.md#extension-tier-cost). There is no normative Tier',
  '3 profile; it is a reproducible internal stress stack.', '',
  '## Why Track B has no competitor rows', '',
  'The corpus uses Carve syntax and capabilities that peer libraries do not',
  'accept equivalently. Feeding it to Djot/CommonMark parsers would benchmark',
  'literal/error recovery rather than the same work. Track A therefore uses',
  'equivalent native-language fixtures for competitors.', '',
)
const out = resolve(root, 'RESULTS.md')
writeFileSync(out, lines.join('\n'))
console.error(`\nwrote ${out}`)
if (!existsSync(RS_BIN)) console.error(`note: ${RS_BIN} missing - build it: (cd engines/rs && cargo build --release)`)
