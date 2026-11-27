// Builds the benchmark site into _site from the committed results: Carve 0.2 as the landing page,
// the 0.1 site as an archive under _site/0.1/.
//   node scripts/site/build.mjs            (archive from $CARVE_BENCH_ARCHIVE or .archive-0.1/)
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { cell, loadLanes, mbps, names, PHASE_TITLE, ratio, summary } from '../report.mjs'

const REPO = 'https://github.com/markup-carve/carve-bench'
const PHASES = ['html', 'parse']
const LANGUAGE = { js: 'JavaScript', rust: 'Rust', 'php-jit-off': 'PHP', 'php-jit-tracing': 'PHP' }
const CHARTS = [
  ['carve02-engines', 'engines'],
  ['carve02-vs-carve01', 'versus'],
]

export const escape = (text) => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
// A parse-only row renders with the same function as its full row, so it has no HTML measure of its own.
const measured = (engine, phase) => phase !== 'html' || !engine.id.endsWith('-parse-only')
const fixed = (value, digits = 1) => value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })

/** Every number the page shows, from the lane files; the committed RESULTS.md must agree with it. */
export function collect(root) {
  const dir = resolve(root, 'results')
  const lanes = loadLanes(dir)
  assert.ok(lanes.length, 'No lane results in results/')
  const environment = JSON.parse(readFileSync(resolve(dir, 'environment.json'), 'utf8'))
  assert.ok(!environment.quick, 'results/ holds a quick run')
  const report = readFileSync(resolve(dir, 'RESULTS.md'), 'utf8')
  assert.ok(report.includes(summary(lanes, environment)), 'results/RESULTS.md is not what the lane files give; run npm run report')
  const evidence = {
    environment,
    lanes: lanes.map((lane) => ({
      id: lane.id,
      title: lane.title,
      language: LANGUAGE[lane.id] ?? lane.title,
      runtime: lane.data.runtime,
      documents: names(lane),
      engines: lane.data.engines.map(({ id, label, version }) => ({ id, label, version })),
      rows: lane.data.engines.flatMap((engine) => names(lane).flatMap((document) => PHASES.filter((phase) => measured(engine, phase)).map((phase) => {
        const measured = cell(lane, engine.id, document, phase)
        assert.ok(measured, `Missing cell ${lane.id} ${engine.id} ${document} ${phase}`)
        return { engine: engine.id, document, phase, medianUs: measured.medianUs, mbps: Number(mbps(measured).toFixed(2)) }
      }))),
      ratios: names(lane).flatMap((document) => PHASES.map((phase) => ({ document, phase, ratio: Number(ratio(lane, document, phase).toFixed(2)) }))),
    })),
  }
  return { lanes, environment, evidence }
}

function svgAttributes(root, name) {
  const svg = readFileSync(resolve(root, 'charts', `${name}.svg`), 'utf8').match(/<svg\b[^>]*>/)?.[0] ?? ''
  const width = svg.match(/\bwidth="([\d.]+)"/)?.[1]
  const height = svg.match(/\bheight="([\d.]+)"/)?.[1]
  const label = svg.match(/\baria-label="([^"]*)"/)?.[1]
  assert.ok(width && height && label, `charts/${name}.svg lacks width, height or aria-label`)
  return { width, height, label }
}

function figure(root, name) {
  const { width, height, label } = svgAttributes(root, name)
  // label is already attribute-escaped in the SVG source
  return `<figure><img loading="lazy" width="${width}" height="${height}" src="charts/${name}.svg" alt="${label}"><figcaption><a href="charts/${name}.svg" download>Download SVG</a></figcaption></figure>`
}

function throughputTable(lane, phase) {
  const documents = names(lane)
  const head = `<tr><th scope="col">${escape(`${lane.title}: ${PHASE_TITLE[phase]}, MB/s`)}</th>${documents.map((d) => `<th scope="col">${escape(d)}</th>`).join('')}</tr>`
  const rows = lane.data.engines.filter((engine) => measured(engine, phase)).map((engine) => `<tr${engine.id.startsWith('carve02') ? ' class="carve"' : ''}><th scope="row">${escape(engine.label)}</th>${documents.map((d) => `<td>${fixed(mbps(cell(lane, engine.id, d, phase)))}</td>`).join('')}</tr>`)
  return `<div class="table-scroll language-table" data-language="${escape(LANGUAGE[lane.id] ?? lane.title)}"><table><thead>${head}</thead><tbody>${rows.join('')}</tbody></table></div>`
}

function ratioTable(lanes) {
  const documents = names(lanes[0])
  const head = `<tr><th scope="col">Lane</th><th scope="col">Measure</th>${documents.map((d) => `<th scope="col">${escape(d)}</th>`).join('')}</tr>`
  const rows = lanes.flatMap((lane) => ['parse', 'html'].map((phase) => `<tr><th scope="row">${escape(lane.title)}</th><td>${PHASE_TITLE[phase]}</td>${documents.map((d) => `<td>${ratio(lane, d, phase).toFixed(2)}x</td>`).join('')}</tr>`))
  return `<div class="table-scroll"><table class="ratios"><thead>${head}</thead><tbody>${rows.join('')}</tbody></table></div>`
}

function laneSection(root, lane) {
  const charts = PHASES.map((phase) => `${lane.id}-${phase}`).filter((name) => existsSync(resolve(root, 'charts', `${name}.svg`)))
  return `<article class="lane" id="lane-${lane.id}" data-language="${escape(LANGUAGE[lane.id] ?? lane.title)}"><h3>${escape(lane.title)}</h3><p class="run">${escape(lane.data.runtime)}. Load average at start ${lane.data.load.start.loadavg.join(', ')}, at end ${lane.data.load.end.loadavg.join(', ')}.</p>${PHASES.map((phase) => throughputTable(lane, phase)).join('')}${charts.map((name) => figure(root, name)).join('')}</article>`
}

const ARCHIVE_BANNER = '<p class="archive-banner" role="note">Archived Carve 0.1 results, frozen at the 0.1 release line. <a href="../">Current Carve 0.2 results</a></p>'

/** Builds the 0.1 site from a checkout of branch 0.1 with that checkout's own builder. */
export async function buildArchive(source, destination) {
  const target = resolve(destination, '0.1')
  const builder = source && resolve(source, 'scripts/site/build.mjs')
  if (!builder || !existsSync(builder)) {
    mkdirSync(target, { recursive: true })
    writeFileSync(resolve(target, 'index.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Carve 0.1 benchmarks (archive)</title><link rel="stylesheet" href="../style.css"></head>
<body><main id="main"><section class="intro"><p class="eyebrow">Archive</p><h1>Carve 0.1 benchmarks</h1>${ARCHIVE_BANNER}<p>This build had no checkout of the <code>0.1</code> branch, so the archived page was not rebuilt here. The reports, charts and the site source are on the <a href="${REPO}/tree/0.1">0.1 branch</a>.</p></section></main></body></html>
`)
    return false
  }
  const { build } = await import(pathToFileURL(builder).href)
  build(source, target)
  const index = resolve(target, 'index.html')
  const html = readFileSync(index, 'utf8')
  assert.ok(html.includes('<main id="main">'), 'The 0.1 page has no main element to mark as archive')
  writeFileSync(index, html
    .replace('<title>Carve benchmarks</title>', '<title>Carve 0.1 benchmarks (archive)</title>')
    .replace('<main id="main">', `<main id="main">${ARCHIVE_BANNER}`))
  return true
}

export function render(root, { lanes, environment }, revision) {
  const ratios = lanes.flatMap((lane) => names(lane).flatMap((d) => PHASES.map((phase) => ratio(lane, d, phase))))
  const day = environment.startedAt.slice(0, 10)
  const commits = Object.entries(environment.engines).map(([name, sha]) => `<li>${escape(name)} <code>${escape(sha)}</code></li>`).join('')
  const documents = names(lanes[0])
  const laneOptions = lanes.map((lane) => `<option value="${escape(lane.id)}">${escape(lane.title)}</option>`).join('')
  const documentOptions = documents.map((d) => `<option>${escape(d)}</option>`).join('')
  const downloads = ['RESULTS.md', 'environment.json', ...lanes.map((lane) => `${lane.id}.json`)]
    .map((file) => `<a href="results/${file}" download>${file}</a>`).join('')
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Carve 0.2 engine benchmarks against Carve 0.1 and peer libraries, with downloadable charts and raw samples."><title>Carve benchmarks</title><link rel="stylesheet" href="style.css"><script src="app.js" defer></script></head>
<body><a class="skip" href="#main">Skip to results</a><header><a class="brand" href="./">Carve / benchmarks</a><nav aria-label="Sections"><a href="#engines">Carve 0.2</a><a href="#versus">0.2 against 0.1</a><a href="#lanes">Per language</a><a href="#method">Method</a><a href="0.1/">0.1 archive</a></nav></header>
<main id="main"><section class="intro"><p class="eyebrow">Carve 0.2 · normal path</p><h1>How fast is Carve 0.2?</h1><p>The three Carve 0.2 engines measured against their Carve 0.1 engines and against the peers of their own language. Each Carve engine parses to its full tree and renders HTML from it; no Carve fast path is measured. Three peers build no tree (markdown-it, pulldown-cmark, jotdown); their labels say so.</p><p>Carve 0.2 is ${fixed(Math.min(...ratios), 1)}x to ${fixed(Math.max(...ratios), 1)}x as fast as Carve 0.1 across every lane, document and measure.</p><p class="run">Run of ${escape(day)} on ${escape(environment.cpu)} (${environment.cores} threads). Higher MB/s is better.</p></section>
<section id="engines"><p class="eyebrow">Carve 0.2</p><h2>Throughput by language</h2><p>Pick a language, a measure and a document to compare Carve 0.2 with Carve 0.1 and the peers of that language. The chart under it sets the three Carve 0.2 engines side by side, parse plus HTML.</p>
<div class="chart-controls" id="filter-controls" hidden><label>Language <select id="lane">${laneOptions}</select></label><label>Measure <select id="phase"><option value="html">${PHASE_TITLE.html}</option><option value="parse">${PHASE_TITLE.parse}</option></select></label><label>Document <select id="document">${documentOptions}</select></label></div>
<p id="filter-status" class="visually-hidden" role="status"></p><div id="interactive-chart"></div>${figure(root, CHARTS[0][0])}</section>
<section id="versus"><p class="eyebrow">Carve 0.2 against Carve 0.1</p><h2>Speed ratio of the medians</h2><p>Above 1x means Carve 0.2 is faster. Carve 0.1 takes its tree route here too, so both versions build the same kind of tree.</p>${figure(root, CHARTS[1][0])}${ratioTable(lanes)}</section>
<section id="lanes"><p class="eyebrow">Per language</p><h2>Every engine, every document</h2><p>MB/s of each engine's own input, from the median of ${lanes[0].data.method.rounds} rounds. Peers marked "(no tree)" stream their output and never hold the document; the like-for-like peers are the ones that build a tree. The <a href="${REPO}#not-like-for-like-what-each-engine-builds">README</a> lists what each engine builds.</p>${lanes.map((lane) => laneSection(root, lane)).join('')}</section>
<section id="method"><p class="eyebrow">Read the measurements</p><h2>Method and source commits</h2><p class="provenance">Measured ${escape(environment.startedAt)} to ${escape(environment.finishedAt)}, Linux ${escape(environment.kernel)}, Node ${escape(environment.node)}, PHP ${escape(environment.php)}, ${escape(environment.rustc)}. Load average at start ${environment.loadAtStart.join(', ')}, at end ${environment.loadAtEnd.join(', ')}. Harness commit <code>${escape(environment.benchCommit)}</code>.</p><ul class="provenance">${commits}</ul><p class="downloads">Raw results: ${downloads}<a href="evidence.json" download>evidence.json</a></p><p>The site is built from the committed results at <a href="${REPO}/commit/${escape(revision)}"><code>${escape(revision.slice(0, 12))}</code></a> and runs no benchmarks. The <a href="0.1/">Carve 0.1 archive</a> keeps the earlier site with its reports.</p></section>
</main>
<footer>Built from committed results. This site does not run benchmarks during deployment.<nav class="related" aria-label="Related sites"><a href="https://markup-carve.github.io/carve/">Docs</a><a href="https://markup-carve.github.io/carve-conformance/proofs/">Proofs</a><a href="https://markup-carve.github.io/carve-conformance/compat/">Compat</a><a href="https://markup-carve.github.io/pandoc-format-fidelity/">Fidelity</a></nav></footer>
</body></html>
`
}

export async function build(root, destination, archive = process.env.CARVE_BENCH_ARCHIVE ?? resolve(root, '.archive-0.1')) {
  const data = collect(root)
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
  rmSync(destination, { recursive: true, force: true })
  mkdirSync(destination, { recursive: true })
  for (const file of ['style.css', 'app.js']) cpSync(resolve(root, 'site', file), resolve(destination, file))
  cpSync(resolve(root, 'charts'), resolve(destination, 'charts'), { recursive: true })
  cpSync(resolve(root, 'results'), resolve(destination, 'results'), { recursive: true })
  writeFileSync(resolve(destination, 'evidence.json'), JSON.stringify(data.evidence, null, 2) + '\n')
  writeFileSync(resolve(destination, 'index.html'), render(root, data, revision))
  writeFileSync(resolve(destination, '.nojekyll'), '')
  const archived = await buildArchive(archive, destination)
  return { ...data, archived }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  const { archived } = await build(root, resolve(root, '_site'))
  console.log(`Built benchmark site from committed results${archived ? ', with the 0.1 archive' : '; 0.1 archive is a link stub (no 0.1 checkout)'}.`)
}
