// Turns the lane results into results/RESULTS.md, the tables in README.md and the charts.
//   node scripts/report.mjs [RESULTS_DIR]
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { writeCharts } from './charts.mjs'

const ROOT = join(import.meta.dirname, '..')
export const LANES = [
  { id: 'js', title: 'JavaScript' },
  { id: 'rust', title: 'Rust' },
  { id: 'php-jit-off', title: 'PHP, JIT off' },
  { id: 'php-jit-tracing', title: 'PHP, opcache.jit=tracing' },
]
export const PHASE_TITLE = { parse: 'parse to tree', html: 'parse plus HTML' }
const ELEMENTS = ['p', 'li', 'h1-h6', 'a', 'td/th', 'code']

export function loadLanes(dir) {
  return LANES.filter(({ id }) => existsSync(join(dir, `${id}.json`)))
    .map((lane) => ({ ...lane, data: JSON.parse(readFileSync(join(dir, `${lane.id}.json`), 'utf8')) }))
}

export function cell(lane, engine, document, phase) {
  return lane.data.cells.find((c) => c.engine === engine && c.document === document && c.phase === phase)
}

export const mbps = (c) => c.bytes / c.medianUs
export const names = (lane) => lane.data.documents.map((d) => d.name)
const fmt = (value, digits = 1) => value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })

/** Speed of Carve 0.2 over Carve 0.1 from the medians: above 1 means 0.2 is faster. */
export function ratio(lane, document, phase) {
  return cell(lane, 'carve01', document, phase).medianUs / cell(lane, 'carve02', document, phase).medianUs
}

function throughputTable(lane, phase) {
  const docs = names(lane)
  const rows = lane.data.engines.map((engine) =>
    `| ${engine.label} | ${docs.map((d) => fmt(mbps(cell(lane, engine.id, d, phase)))).join(' | ')} |`)
  return [`| ${lane.title}: ${PHASE_TITLE[phase]}, MB/s | ${docs.join(' | ')} |`, `|---|${docs.map(() => '--:').join('|')}|`, ...rows].join('\n')
}

function ratioTable(lanes) {
  const docs = names(lanes[0])
  const rows = lanes.flatMap((lane) => ['parse', 'html'].map((phase) =>
    `| ${lane.title} | ${PHASE_TITLE[phase]} | ${docs.map((d) => `${fmt(ratio(lane, d, phase), 2)}x`).join(' | ')} |`))
  return ['| Lane | Measure | ' + docs.join(' | ') + ' |', `|---|---|${docs.map(() => '--:').join('|')}|`, ...rows].join('\n')
}

function agreement(row) {
  const worst = Math.max(...ELEMENTS.map((e) => {
    const a = row.carve01[e]
    const b = row.carve02[e]
    return a === b ? 0 : Math.abs(a - b) / Math.max(a, b)
  }))
  return worst <= 0.01 ? `agrees (largest difference ${fmt(worst * 100)}%)` : `**does not agree** (largest difference ${fmt(worst * 100)}%)`
}

function verifyTable(lane) {
  const head = `| ${lane.title}: document | ${ELEMENTS.map((e) => `${e} 0.1 / 0.2`).join(' | ')} | Within 1% |`
  const rows = lane.data.verify.map((row) =>
    `| ${row.document} | ${ELEMENTS.map((e) => `${row.carve01[e]} / ${row.carve02[e]}`).join(' | ')} | ${agreement(row)} |`)
  return [head, `|---|${ELEMENTS.map(() => '--:').join('|')}|---|`, ...rows].join('\n')
}

function detailTable(lane) {
  const head = '| Engine | Document | Bytes | Parse median µs | Parse min µs | Parse MB/s | HTML median µs | HTML min µs | HTML MB/s |'
  const rows = lane.data.documents.flatMap(({ name }) => lane.data.engines.map((engine) => {
    const p = cell(lane, engine.id, name, 'parse')
    const h = cell(lane, engine.id, name, 'html')
    return `| ${engine.label} | ${name} | ${p.bytes.toLocaleString('en-US')} | ${fmt(p.medianUs)} | ${fmt(p.minUs)} | ${fmt(mbps(p))} | ${fmt(h.medianUs)} | ${fmt(h.minUs)} | ${fmt(mbps(h))} |`
  }))
  return [`### ${lane.title}`, '', `Runtime: ${lane.data.runtime}. Load average (1, 5, 15 min) at start ${lane.data.load.start.loadavg.join(', ')}, at end ${lane.data.load.end.loadavg.join(', ')}.`, '',
    head, '|---|---|--:|--:|--:|--:|--:|--:|--:|', ...rows].join('\n')
}

function engineList(lanes) {
  return lanes.map((lane) => `- ${lane.title}: ${lane.data.engines.map((e) => `${e.label} ${e.version}`).join(', ')}`).join('\n')
}

function environmentText(env) {
  const commits = Object.entries(env.engines).map(([name, sha]) => `${name} \`${sha}\``).join(', ')
  return [`Measured ${env.startedAt} to ${env.finishedAt} on ${env.cpu} (${env.cores} threads), Linux ${env.kernel}.`,
    `${env.node}, PHP ${env.php}, ${env.rustc}. Harness commit \`${env.benchCommit}\`. Engine commits: ${commits}.`,
    `Load average at start ${env.loadAtStart.join(', ')}, at end ${env.loadAtEnd.join(', ')}.`].join(' ')
}

export function summary(lanes, env) {
  const parts = [
    environmentText(env),
    '### Parse plus HTML, normal path', ...lanes.map((lane) => throughputTable(lane, 'html')),
    '### Parse to tree', ...lanes.map((lane) => throughputTable(lane, 'parse')),
    '### Carve 0.2 against Carve 0.1 (speed ratio of the medians, above 1x means 0.2 is faster)', ratioTable(lanes),
    '### Element counts of the 0.1 and the 0.2 HTML of the `.crv` documents', ...lanes.filter((l) => l.id !== 'php-jit-tracing').map(verifyTable),
  ]
  return parts.join('\n\n')
}

function main(dir) {
  const lanes = loadLanes(dir)
  const env = JSON.parse(readFileSync(join(dir, 'environment.json'), 'utf8'))
  const full = ['# Results', '', summary(lanes, env), '', '## Every cell', '', ...lanes.map(detailTable), '',
    '## Engines', '', engineList(lanes), ''].join('\n')
  writeFileSync(join(dir, 'RESULTS.md'), full)
  const chartDir = env.quick ? join(dir, 'charts') : join(ROOT, 'charts')
  writeCharts(lanes, chartDir)
  if (env.quick) return
  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8')
  const start = '<!-- results:start -->'
  const end = '<!-- results:end -->'
  const at = readme.indexOf(start)
  const to = readme.indexOf(end)
  if (at < 0 || to < at) throw new Error('README.md lacks the results markers')
  writeFileSync(join(ROOT, 'README.md'), readme.slice(0, at + start.length) + '\n\n' + summary(lanes, env) + '\n\n' + readme.slice(to))
}

if (process.argv[1] === import.meta.filename) main(process.argv[2] ?? join(ROOT, 'results'))
