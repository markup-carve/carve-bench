// Same-language Carve/Djot/CommonMark comparison from docs/performance.md.
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeFileSync } from 'node:fs'

const root = dirname(fileURLToPath(import.meta.url))
const rs = process.env.CARVE_RS_COMPARE_BIN ?? resolve(root, 'engines/rs/target/release/carve-bench-rs-compare')
const phpArgs = ['-n', '-d', `extension=${process.env.CARVE_PHP_MBSTRING ?? 'mbstring'}`, '-d', 'opcache.enable_cli=1', '-d', 'opcache.jit_buffer_size=128M', '-d', 'opcache.jit=tracing']
const cases = [
  ['JavaScript', 'carve-js', 'carve.crv', 100, ['node', [resolve(root, 'engines/js/compare.mjs')]]],
  ['JavaScript', 'djot.js', 'djot.dj', 100, ['node', [resolve(root, 'engines/js/compare.mjs')]]],
  ['JavaScript', 'markdown-it', 'markdown.md', 100, ['node', [resolve(root, 'engines/js/compare.mjs')]]],
  ['PHP', 'carve-php', 'carve.crv', 50, ['php', [...phpArgs, resolve(root, 'engines/php/compare.php')]]],
  ['PHP', 'djot-php', 'djot.dj', 50, ['php', [...phpArgs, resolve(root, 'engines/php/compare.php')]]],
  ['PHP', 'league/commonmark-gfm', 'markdown.md', 50, ['php', [...phpArgs, resolve(root, 'engines/php/compare.php')]]],
  ['Rust', 'carve-rs', 'carve.crv', 200, [rs, []]],
  ['Rust', 'jotdown', 'djot.dj', 200, [rs, []]],
  ['Rust', 'comrak', 'markdown.md', 200, [rs, []]],
  ['Rust', 'pulldown-cmark', 'markdown.md', 200, [rs, []]],
]
const rows = []
const workloadFeaturePoints = 18
const capabilityPoints = new Map([
  ['carve-js', 43], ['carve-php', 43], ['carve-rs', 43],
  ['djot.js', 32], ['djot-php', 32], ['jotdown', 32],
  ['markdown-it', 17], ['league/commonmark-gfm', 18],
  ['comrak', 16], ['pulldown-cmark', 16],
])
for (const [language, engine, file, iterations, [command, prefix]] of cases) {
  const doc = resolve(root, 'corpus/comparison', file)
  const output = execFileSync(command, [...prefix, engine, doc, String(iterations), '5'], {
    encoding: 'utf8', env: process.env, stdio: ['ignore', 'pipe', 'inherit'],
  })
  const result = JSON.parse(output.trim().split('\n').pop())
  rows.push({ language, ...result })
  console.error(`${language.padEnd(10)} ${engine.padEnd(24)} ${result.mb_per_s.toFixed(2)} MB/s`)
}

const lines = [
  '# Same-language comparison', '',
  'Parse + render to HTML, in-process. Each result is the fastest of five warmed',
  'trials; every trial runs the iteration count shown. Inputs carry equivalent',
  'logical content in native Carve, Djot, or Markdown syntax and are 48.1–48.4 KiB.',
  'The libraries do not have identical feature sets or output, so this compares',
  'rendering cost for representative documents—not semantic equivalence.', '',
  'Locked comparison versions: djot.js 0.3.2, markdown-it 15.0.0, djot-php',
  '0.1.32, league/commonmark 2.10.0, jotdown 0.10.0, comrak 0.54.0, and',
  'pulldown-cmark 0.13.4. The checked snapshot used Carve engine heads',
  'carve-js `528b845a`, carve-php `5325a97c`, and carve-rs `e867367a` on',
  'Linux 7.0, Node.js 22.22.2, PHP 8.5.9 tracing JIT, and rustc 1.97.1.', '',
  `Every configured engine earns the same ${workloadFeaturePoints} workload points. Core capability`,
  'points separately expose the much wider syntax surface an engine recognizes',
  'by default. See `FEATURES.md` for the auditable matrix and limitations.', '',
  '![Bar chart of same-language render throughput, normalized within each language](./charts/comparison.svg)', '',
  '![Bar chart of enabled core capability points](./charts/capabilities.svg)', '',
]
for (const language of ['Rust', 'JavaScript', 'PHP']) {
  const group = rows.filter((row) => row.language === language)
  const carve = group.find((row) => row.engine.startsWith('carve-'))
  lines.push(`## ${language}`, '', '| Engine | Workload points | Core capability points | MB/s | Breadth index | vs Carve | trials × iterations |', '|---|---:|---:|---:|---:|---:|---:|')
  for (const row of group) {
    const breadth = capabilityPoints.get(row.engine)
    lines.push(`| ${row.engine} | ${workloadFeaturePoints} | ${breadth} | ${row.mb_per_s.toFixed(2)} | ${(row.mb_per_s * breadth).toFixed(1)} | ${(row.mb_per_s / carve.mb_per_s).toFixed(2)}x | ${row.trials} × ${row.iterations} |`)
  }
  lines.push('')
}
lines.push(
  'Language groups should be run in isolation. Sustained host load can reduce',
  'absolute throughput substantially even when within-language ordering stays',
  'similar; contaminated groups should be rerun rather than published.', '',
)
writeFileSync(resolve(root, 'COMPARISON.md'), lines.join('\n'))
