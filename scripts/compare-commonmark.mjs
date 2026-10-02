import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
import { cpus, loadavg, platform, arch } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { coreSources, coreProjection } from '../engines/js/commonmark-core.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
execFileSync('git', ['fetch', 'origin', 'main'], { cwd: root, stdio: 'pipe' })
const sha = text => createHash('sha256').update(text).digest('hex')
const args = process.argv.slice(2)
assert.ok(args.length === 0 || (args.length === 4 && args[0] === '--carve-main' && args[2] === '--carve-revision'), 'Use --carve-main CHECKOUT --carve-revision COMMIT')
assert.ok(!process.env.CARVE_JS, 'Use the explicit pinned-main option rather than CARVE_JS')
const carveTree = args.length ? resolve(args[1]) : null
let carveMain = null, expectedCarveIdentity = null, fastOutputHash = null
const git = (...args) => execFileSync('git', ['-C', carveTree, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
if (carveTree) {
  const commit = args[3]
  assert.match(commit, /^[a-f0-9]{40}$/)
  assert.match(git('remote', 'get-url', 'origin'), /^(?:https:\/\/github\.com\/|git@github\.com:)markup-carve\/carve-js(?:\.git)?$/)
  git('fetch', 'origin', 'main')
  assert.equal(git('rev-parse', 'HEAD'), commit, 'Checkout must match the pinned commit')
  git('merge-base', '--is-ancestor', commit, 'FETCH_HEAD')
  assert.equal(git('status', '--porcelain'), '', 'Merged-main source must be clean')
  const sourceLock = JSON.parse(readFileSync(resolve(carveTree, 'package-lock.json')))
  const installedLock = JSON.parse(readFileSync(resolve(carveTree, 'node_modules/.package-lock.json')))
  for (const [name, info] of Object.entries(installedLock.packages)) {
    assert.equal(info.version, sourceLock.packages[name]?.version, name)
    assert.equal(info.integrity, sourceLock.packages[name]?.integrity, name)
  }
  rmSync(resolve(carveTree, 'dist'), { recursive: true, force: true })
  execFileSync('npm', ['run', 'build'], { cwd: carveTree, stdio: 'pipe', timeout: 120000 })
  const manifest = JSON.parse(readFileSync(resolve(carveTree, 'package.json')))
  assert.equal(manifest.name, '@markup-carve/carve')
  const dist = resolve(carveTree, 'dist')
  const artifacts = readdirSync(dist, { recursive: true }).filter(file => file.endsWith('.js')).sort()
  carveMain = { kind: 'merged-main', repository: 'https://github.com/markup-carve/carve-js', commit, version: manifest.version,
    lock_sha256: sha(readFileSync(resolve(carveTree, 'package-lock.json'))),
    dist_sha256: Object.fromEntries(artifacts.map(file => [file, sha(readFileSync(resolve(dist, file)))])), fast_path: false }
  expectedCarveIdentity = `@markup-carve/carve ${manifest.version} (local checkout ${carveTree} @ ${git('rev-parse', '--short', 'HEAD')})`
}
const sources = coreSources(), files = { carve: 'carve.crv', djot: 'djot.dj', markdown: 'markdown.md' }
const out = resolve(root, 'corpus/commonmark-core')
mkdirSync(out, { recursive: true })
for (const [flavor, source] of Object.entries(sources)) writeFileSync(resolve(out, files[flavor]), source)
const engines = [['carve-js', 'carve'], ['djot.js', 'djot'], ['markdown-it', 'markdown'], ['commonmark.js', 'markdown'], ['commonmark.js-fresh', 'markdown']]
const harness = resolve(root, 'engines/js/compare.mjs')
const run = (engine, flavor, iterations, trials, observe = false) => JSON.parse(execFileSync(process.execPath,
  [harness, engine, resolve(out, files[flavor]), String(iterations), String(trials)],
  { encoding: 'utf8', timeout: 120000, env: { ...process.env, CARVE_COMPARE_OBSERVE: observe ? '1' : '0', CARVE_COMPARE_WARMUP: '200', ...(carveTree ? { CARVE_JS: pathToFileURL(resolve(carveTree, 'dist/index.js')).href } : {}) } }))
if (carveMain) {
  const { tryFastHtml } = await import(pathToFileURL(resolve(carveTree, 'dist/fast-html.js')).href)
  const fastOutput = tryFastHtml(sources.carve, {})
  assert.equal(typeof fastOutput, 'string', 'Pinned main must take the fast path for the shared fixture')
  fastOutputHash = sha(fastOutput)
  carveMain.fast_path = true
}
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
  if (engine === 'carve-js' && carveMain) assert.equal(result.output_sha256, fastOutputHash)
  assert.deepEqual(coreProjection(result.html), baseline, `${engine}: shared core projection differs`)
  controls.push({ engine, source_sha256: result.source_sha256, output_sha256: result.output_sha256, projection_sha256: sha(JSON.stringify(coreProjection(result.html))) })
}
const metadata = { generated_at: new Date().toISOString(), benchmark_base_commit: execFileSync('git', ['rev-parse', 'origin/main'], { cwd: root, encoding: 'utf8' }).trim(),
  node: process.version, platform: platform(), arch: arch(), cpu: cpus()[0].model, logical_cpus: cpus().length, load_start: loadavg(),
  package_versions: { ...manifest.dependencies, ...(carveMain ? { '@markup-carve/carve': 'merged-main ' + carveMain.commit } : {}) }, ...(carveMain ? { carve_main: carveMain } : {}), lock_sha256: sha(readFileSync(resolve(root, 'engines/js/package-lock.json'))),
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
    if (engine === 'carve-js') {
      assert.equal(row.carve_source, expectedCarveIdentity ?? `@markup-carve/carve ${manifest.dependencies['@markup-carve/carve']} (npm package)`)
      if (carveMain) row.carve_source = `@markup-carve/carve ${carveMain.version} (merged main ${carveMain.commit})`
    }
    rows.push(row)
    console.log(`${round + 1}/${engine}: ${row.mb_per_s.toFixed(2)} MB/s`)
  }
  rounds.push({ round, order: order.map(([engine]) => engine), load_end: loadavg(), rows })
}
if (carveMain) {
  assert.equal(git('rev-parse', 'HEAD'), carveMain.commit)
  assert.equal(git('status', '--porcelain'), '')
}
metadata.load_end = loadavg()
const record = { schema: 1, metadata, controls, rounds }
writeFileSync(resolve(root, 'reports/commonmark-js.json'), JSON.stringify(record, null, 2) + '\n')
const lines = ['# JavaScript core comparison including commonmark.js', '',
  `Measured ${metadata.generated_at}, Node ${metadata.node}, ${metadata.cpu}, ${metadata.logical_cpus} logical CPUs. Benchmark main at setup: \`${metadata.benchmark_base_commit}\`.`, '',
  `${carveMain ? 'Carve JS merged main ' + carveMain.version + ' at `' + carveMain.commit + '`; fast path verified. Released peers:' : 'Released packages: Carve JS ' + manifest.dependencies['@markup-carve/carve'] + ','} Djot ${manifest.dependencies['@djot/djot']}, markdown-it ${manifest.dependencies['markdown-it']}, commonmark.js ${manifest.dependencies.commonmark}.`, '',
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
  '## Reproduce', '', '```sh', 'cd engines/js', 'npm ci', 'cd ../..', carveMain ? 'git clone https://github.com/markup-carve/carve-js.git /tmp/carve-js-main' : '', carveMain ? 'git -C /tmp/carve-js-main checkout ' + carveMain.commit : '', carveMain ? 'npm ci --prefix /tmp/carve-js-main' : '', carveMain ? 'node scripts/compare-commonmark.mjs --carve-main /tmp/carve-js-main --carve-revision ' + carveMain.commit : 'node scripts/compare-commonmark.mjs', 'node scripts/gen-charts.mjs', '```', '',
  carveMain ? 'The [previous released snapshot](commonmark-js-release-0.1.9.md) preserves Carve JS 0.1.9 measurements and samples.' : '', '',
  'The [raw record](commonmark-js.json) retains all trial samples, both rounds, source/output hashes, workload controls, exact package versions and harness hashes.', '')
writeFileSync(resolve(root, 'reports/commonmark-js.md'), lines.join('\n'))
