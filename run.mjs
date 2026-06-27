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
    run: (doc, iters) =>
      execFileSync('php', [resolve(root, 'engines/php/bench.php'), doc, String(iters)], {
        encoding: 'utf8',
        env: process.env,
      }),
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
      console.error(`${key.padEnd(8)} ${engine.name.padEnd(10)} ${results[key][engine.name].ms_per_op} ms/op`)
    } catch (e) {
      console.error(`${key} ${engine.name}: FAILED - ${e.message.split('\n')[0]}`)
      results[key][engine.name] = null
    }
  }
}

// Render RESULTS.md
const lines = []
lines.push('# Benchmark results', '')
lines.push(
  'Parse + render to HTML, in-process, averaged over many iterations. Lower',
  'ms/op and higher MB/s are better. `rel` is relative to the fastest engine for',
  'that document (1.00x = fastest). Numbers are machine-specific - run it yourself',
  'with `node run.mjs`; see README for setup.',
  '',
)
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
const out = resolve(root, 'RESULTS.md')
writeFileSync(out, lines.join('\n'))
console.error(`\nwrote ${out}`)
if (!existsSync(RS_BIN)) console.error(`note: ${RS_BIN} missing - build it: (cd engines/rs && cargo build --release)`)
