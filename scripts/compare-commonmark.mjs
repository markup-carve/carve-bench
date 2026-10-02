import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { cpus, loadavg, platform, arch } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { coreSources, coreProjection } from '../engines/js/commonmark-core.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
execFileSync('git', ['fetch', 'origin', 'main'], { cwd: root, stdio: 'pipe' })
const sha = text => createHash('sha256').update(text).digest('hex')
const sources = coreSources(), files = { carve: 'carve.crv', djot: 'djot.dj', markdown: 'markdown.md' }
const out = resolve(root, 'corpus/commonmark-core')
mkdirSync(out, { recursive: true })
for (const [flavor, source] of Object.entries(sources)) writeFileSync(resolve(out, files[flavor]), source)
const engines = [['carve-js', 'carve'], ['djot.js', 'djot'], ['markdown-it', 'markdown'], ['commonmark.js', 'markdown'], ['commonmark.js-fresh', 'markdown']]
const harness = resolve(root, 'engines/js/compare.mjs')
const run = (engine, flavor, iterations, trials, observe = false) => JSON.parse(execFileSync(process.execPath,
  [harness, engine, resolve(out, files[flavor]), String(iterations), String(trials)],
  { encoding: 'utf8', timeout: 120000, env: { ...process.env, CARVE_COMPARE_OBSERVE: observe ? '1' : '0', CARVE_COMPARE_WARMUP: '200' } }))
assert.ok(!process.env.CARVE_JS, 'Published core results use the locked released Carve package')
const manifest = JSON.parse(readFileSync(resolve(root, 'engines/js/package.json')))
const lock = JSON.parse(readFileSync(resolve(root, 'engines/js/package-lock.json')))
const installed = JSON.parse(readFileSync(resolve(root, 'engines/js/node_modules/.package-lock.json')))
for (const [name, version] of Object.entries(manifest.dependencies)) {
  assert.equal(lock.packages['node_modules/' + name].version, version)
  assert.equal(installed.packages['node_modules/' + name].version, version)
  assert.equal(installed.packages['node_modules/' + name].integrity, lock.packages['node_modules/' + name].integrity)
}
const controls = [], baseline = coreProjection(run('commonmark.js', 'markdown', 1, 1, true).html)
for (const [engine, flavor] of engines) {
  const result = run(engine, flavor, 1, 1, true)
  assert.equal(result.source_sha256, sha(sources[flavor]))
  assert.deepEqual(coreProjection(result.html), baseline, `${engine}: shared core projection differs`)
  controls.push({ engine, source_sha256: result.source_sha256, output_sha256: result.output_sha256, projection_sha256: sha(JSON.stringify(coreProjection(result.html))) })
}
const metadata = { generated_at: new Date().toISOString(), benchmark_base_commit: execFileSync('git', ['rev-parse', 'origin/main'], { cwd: root, encoding: 'utf8' }).trim(),
  node: process.version, platform: platform(), arch: arch(), cpu: cpus()[0].model, logical_cpus: cpus().length, load_start: loadavg(),
  package_versions: manifest.dependencies, lock_sha256: sha(readFileSync(resolve(root, 'engines/js/package-lock.json'))),
  harness_sha256: Object.fromEntries(['scripts/compare-commonmark.mjs', 'engines/js/compare.mjs', 'engines/js/commonmark-core.mjs'].map(path => [path, sha(readFileSync(resolve(root, path)))])),
  method: 'Two serial fresh-worker rounds, reverse order in round two. Each worker warms 200 conversions, then records seven trials of 200 calls. Samples exclude process startup and output verification. Reused commonmark.js parser/renderer; separate per-call construction control. Default options. Best trial per round; both rounds retained.',
  workload_points: 14, sections: 150, projection: 'Ignore section wrappers, generated IDs, list paragraph wrappers and non-code whitespace formatting. Preserve element hierarchy, strong/emphasis, link destinations, code language and code bytes.' }
const rounds = []
for (let round = 0; round < 2; round++) {
  const order = round ? [...engines].reverse() : engines
  const rows = []
  for (const [engine, flavor] of order) {
    const row = run(engine, flavor, 200, 7)
    assert.equal(row.source_sha256, sha(sources[flavor]))
    assert.equal(row.output_sha256, controls.find(item => item.engine === engine).output_sha256)
    if (engine === 'carve-js') assert.equal(row.carve_source, `@markup-carve/carve ${manifest.dependencies['@markup-carve/carve']} (npm package)`)
    rows.push(row)
    console.log(`${round + 1}/${engine}: ${row.mb_per_s.toFixed(2)} MB/s`)
  }
  rounds.push({ round, order: order.map(([engine]) => engine), load_end: loadavg(), rows })
}
metadata.load_end = loadavg()
const record = { schema: 1, metadata, controls, rounds }
writeFileSync(resolve(root, 'reports/commonmark-js.json'), JSON.stringify(record, null, 2) + '\n')
const lines = ['# JavaScript core comparison including commonmark.js', '',
  `Measured ${metadata.generated_at}, Node ${metadata.node}, ${metadata.cpu}, ${metadata.logical_cpus} logical CPUs. Benchmark main at setup: \`${metadata.benchmark_base_commit}\`.`, '',
  `Released packages: Carve JS ${manifest.dependencies['@markup-carve/carve']}, Djot ${manifest.dependencies['@djot/djot']}, markdown-it ${manifest.dependencies['markdown-it']}, commonmark.js ${manifest.dependencies.commonmark}.`, '',
  'This shared workload excludes pipe tables, which commonmark.js does not support. All four libraries receive 150 equivalent sections in native syntax. The 14 exercised points are the existing 18-point rubric without its three table-grid points and one alignment point. These measurements form a separate lane from [the table-capable comparison](../COMPARISON.md); their throughput values must not be mixed.', '',
  'Before timing, all engines agree under an HTML projection that ignores section wrappers, generated IDs, list paragraph wrappers and non-code whitespace formatting. It preserves element hierarchy, emphasis versus strong, resolved link destinations, code language and code bytes. This is scoped workload verification, not general language conformance.', '',
  '## Reused public conversion APIs', '',
  '| Engine | Bytes | Round 1 MB/s | Round 2 MB/s |', '|---|---:|---:|---:|']
for (const [engine] of engines.filter(([name]) => name !== 'commonmark.js-fresh')) {
  const rows = rounds.map(round => round.rows.find(row => row.engine === engine))
  lines.push(`| ${engine} | ${rows[0].bytes} | ${rows[0].mb_per_s.toFixed(2)} | ${rows[1].mb_per_s.toFixed(2)} |`)
}
lines.push('', '![Shared JavaScript core throughput](../charts/commonmark-js.svg)', '',
  '## CommonMark constructor control', '',
  '| API lifetime | Round 1 ms/op | Round 2 ms/op |', '|---|---:|---:|')
for (const engine of ['commonmark.js', 'commonmark.js-fresh']) {
  const rows = rounds.map(round => round.rows.find(row => row.engine === engine))
  lines.push(`| ${engine === 'commonmark.js' ? 'Reuse parser and renderer' : 'Construct both per call'} | ${rows[0].ms_per_op.toFixed(4)} | ${rows[1].ms_per_op.toFixed(4)} |`)
}
lines.push('', 'The lifetime control investigates the parser-construction concern in [djot.js #13](https://github.com/jgm/djot.js/issues/13). markdown-it also reuses its instance; Carve and Djot use their public conversion functions. These are default API costs, not equal object lifetimes. Round variation makes the constructor-cost comparison inconclusive.', '',
  `One-minute host load was ${metadata.load_start[0].toFixed(2)} at start and ${metadata.load_end[0].toFixed(2)} at end. Timings are observations on this host; the reversed rounds retain order variation. No universal speed ranking is established.`, '',
  '## Reproduce', '', '```sh', 'cd engines/js', 'npm ci', 'cd ../..', 'node scripts/compare-commonmark.mjs', 'node scripts/gen-charts.mjs', '```', '',
  'The [raw record](commonmark-js.json) retains all trial samples, both rounds, source/output hashes, workload controls, exact package versions and harness hashes.', '')
writeFileSync(resolve(root, 'reports/commonmark-js.md'), lines.join('\n'))
