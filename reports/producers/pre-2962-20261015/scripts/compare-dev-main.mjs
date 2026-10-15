import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { cpus, loadavg } from 'node:os'
import { coreSources, coreProjection } from '../engines/js/commonmark-core.mjs'
import { cpuAffinity, affinityDescription, benchmarkCheckout } from './benchmark-metadata.mjs'
import { finalCommonmarkResults } from './commonmark-results.mjs'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const config = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const sha = value => createHash('sha256').update(value).digest('hex')
const git = (tree, ...args) => execFileSync('git', ['-C', tree, ...args], { encoding: 'utf8' }).trim()
const sources = Object.fromEntries(Object.entries(coreSources()).map(([flavor, source]) => [flavor, (flavor === 'djot' ? source : source.replaceAll('- second list item\n\n  -', '- second list item\n  -')).replaceAll('\n---\n', '\n| Name | Value | Note |\n|:---|---:|:---:|\n| alpha | 1 | first |\n| beta | 2 | second |\n\n---\n')]))
const files = { carve: 'carve.crv', djot: 'djot.dj', markdown: 'markdown.md' }
const corpus = resolve(root, 'corpus/dev-main-core')
mkdirSync(corpus, { recursive: true })
for (const [flavor, source] of Object.entries(sources)) writeFileSync(resolve(corpus, files[flavor]), source)
const commits = {}
for (const [engine, entry] of Object.entries(config)) {
  assert.ok(['js', 'php', 'rs'].includes(engine))
  assert.match(entry.commit, /^[a-f0-9]{40}$/)
  const repository = `https://github.com/markup-carve/carve-${engine}`
  assert.ok([repository, repository + '.git', `git@github.com:markup-carve/carve-${engine}.git`].includes(git(entry.path, 'remote', 'get-url', 'origin')))
  git(entry.path, 'fetch', 'origin', 'main')
  assert.equal(git(entry.path, 'rev-parse', 'HEAD'), entry.commit)
  git(entry.path, 'merge-base', '--is-ancestor', entry.commit, 'FETCH_HEAD')
  commits[engine] = { latest_at_setup: git(entry.path, 'rev-parse', 'FETCH_HEAD') }
  assert.equal(git(entry.path, 'status', '--porcelain'), '')
  commits[engine] = { ...commits[engine], repository, commit: entry.commit, kind: 'merged-main' }
}
assert.equal(Object.keys(commits).length, 3)
function verifyNpm(tree) {
  const lock = JSON.parse(readFileSync(resolve(tree, 'package-lock.json')))
  const installed = JSON.parse(readFileSync(resolve(tree, 'node_modules/.package-lock.json')))
  for (const [name, info] of Object.entries(installed.packages)) {
    assert.equal(info.version, lock.packages[name]?.version, name)
    assert.equal(info.integrity, lock.packages[name]?.integrity, name)
  }
  for (const name of Object.keys(lock.packages).filter(name => name && !lock.packages[name].optional)) assert.ok(installed.packages[name], name)
}
verifyNpm(config.js.path)
verifyNpm(resolve(root, 'engines/js'))
const environment = { ...process.env }
for (const key of Object.keys(environment)) if (key.startsWith('CARVE_')) delete environment[key]
const composerLock = JSON.parse(readFileSync(resolve(root, 'engines/php/composer.lock')))
const phpInstalled = JSON.parse(readFileSync(resolve(root, 'engines/php/vendor/composer/installed.json'))).packages
const phpPackages = [...composerLock.packages, ...composerLock['packages-dev']]
assert.equal(phpInstalled.length, phpPackages.length)
for (const info of phpPackages) {
  const actual = phpInstalled.find(item => item.name === info.name)
  assert.equal(actual?.version, info.version, info.name)
  assert.equal(actual?.source?.reference, info.source?.reference, info.name)
}
rmSync(resolve(config.js.path, 'dist'), { recursive: true, force: true })
execFileSync('npm', ['run', 'build'], { cwd: config.js.path, env: environment, stdio: 'pipe', timeout: 120000 })
commits.js.lock_sha256 = sha(readFileSync(resolve(config.js.path, 'package-lock.json')))
commits.js.dist_sha256 = Object.fromEntries(readdirSync(resolve(config.js.path, 'dist'), { recursive: true }).filter(file => file.endsWith('.js')).sort().map(file => [file, sha(readFileSync(resolve(config.js.path, 'dist', file)))]))
execFileSync(process.execPath, [resolve(root, 'scripts/build-rs-engine.mjs'), '--carve-rs', config.rs.path], { cwd: root, env: environment, stdio: 'pipe', timeout: 1800000 })
const measuredRustLock = readFileSync(resolve(root, 'engines/rs/target/local-override/crate/Cargo.lock'))
writeFileSync(resolve(root, 'reports/dev-main-rust.Cargo.lock'), measuredRustLock)

const engines = [
  ['carve-js', 'JavaScript', 'carve'], ['djot.js', 'JavaScript', 'djot'], ['markdown-it', 'JavaScript', 'markdown'],
  ['carve-php', 'PHP', 'carve'], ['djot-php', 'PHP', 'djot'], ['league/commonmark-gfm', 'PHP', 'markdown'],
  ['carve-rs', 'Rust', 'carve'], ['jotdown', 'Rust', 'djot'], ['comrak', 'Rust', 'markdown'], ['pulldown-cmark', 'Rust', 'markdown'],
]
const binary = resolve(root, 'engines/rs/target/local-override/target/release/carve-bench-rs-compare')
function run([engine, language, flavor], iterations, trials, observe = false) {
  const file = resolve(corpus, files[flavor])
  const command = language === 'JavaScript' ? process.execPath : language === 'PHP' ? 'php' : binary
  const args = language === 'JavaScript' ? [resolve(root, 'engines/js/compare.mjs')] : language === 'PHP' ? ['-n', '-d', 'extension=ctype', '-d', 'extension=mbstring', '-d', 'opcache.enable_cli=1', '-d', 'opcache.jit_buffer_size=128M', '-d', 'opcache.jit=tracing', resolve(root, 'engines/php/compare.php')] : []
  const row = JSON.parse(execFileSync(command, [...args, engine, file, String(iterations), String(trials)], { encoding: 'utf8', maxBuffer: 16000000, timeout: 180000,
    env: { ...environment, CARVE_COMPARE_WARMUP: '20', CARVE_JS: pathToFileURL(resolve(config.js.path, 'dist/index.js')).href, CARVE_PHP_SRC: resolve(config.php.path, 'src'), CARVE_COMPARE_OBSERVE: observe ? '1' : '0' } }))
  if (row.output_hex) {
    row.html = Buffer.from(row.output_hex, 'hex').toString('utf8')
    row.output_sha256 = sha(row.html)
    row.source_sha256 = sha(readFileSync(file))
    row.source_hash_origin = 'driver fixture; Rust worker reports input bytes'
    delete row.output_hex
  }
  if (language === 'PHP') assert.ok(row.jit && row.jit_on, 'Tracing JIT must be active')
  assert.equal(row.bytes, Buffer.byteLength(sources[flavor]))
  assert.equal(row.source_sha256, sha(sources[flavor]))
  if (engine.startsWith('carve-')) {
    const key = engine.slice(6)
    assert.ok(row.carve_source.includes(`local checkout ${config[key].path} @ ${git(config[key].path, 'rev-parse', '--short', 'HEAD')}`), `Wrong measured source: ${row.carve_source}`)
    row.carve_source = `${engine} (merged main ${commits[key].commit})`
  }
  if (!observe) delete row.html
  return { ...row, language }
}
// Table serializers vary in formatting and alignment attributes. Preserve cell
// content and row hierarchy while discarding whitespace between table rows.
function projection(html) {
  const clean = (nodes, parent = '') => nodes.filter(node => !(node.text !== undefined && !node.text.trim() && ['table', 'thead', 'tbody', 'tr'].includes(parent))).flatMap(node => {
    if (['thead', 'tbody'].includes(node.tag)) return clean(node.children, node.tag)
    if (node.tag) return { ...node, children: clean(node.children, node.tag) }
    return node
  })
  return clean(coreProjection(html))
}
const controls = []
let baseline
for (const entry of engines) {
  const row = run(entry, 1, 1, true)
  const projected = projection(row.html)
  if (!baseline) baseline = projected
  try { assert.deepEqual(projected, baseline) } catch (error) {
    writeFileSync('/tmp/carve-core-control-' + entry[0].replaceAll('/', '-') + '.html', row.html)
    throw new Error(`${entry[0]}: shared workload differs`, { cause: error })
  }
  controls.push({ engine: row.engine, source_sha256: row.source_sha256, output_sha256: row.output_sha256, projection_sha256: sha(JSON.stringify(projected)) })
}
const phpDependencies = Object.fromEntries(phpPackages.filter(info => info.name !== 'markup-carve/carve-php').map(info => [info.name, { version: info.version, reference: info.source?.reference ?? null }]))
const metadata = { cpu_affinity: cpuAffinity(), ...benchmarkCheckout(root), php_dependencies: phpDependencies, runtime_flags: { RUSTFLAGS: environment.RUSTFLAGS ?? null, NODE_OPTIONS: environment.NODE_OPTIONS ?? null }, rust_lock_sha256: sha(measuredRustLock), generated_at: new Date().toISOString(), carve_main: commits, node: process.version, php: execFileSync('php', ['-n', '-v'], { encoding: 'utf8' }).split('\n')[0], rust: execFileSync('rustc', ['--version'], { encoding: 'utf8' }).trim(), php_jit: 'tracing, CLI opcache, extensions ctype and mbstring; php -n', cpu: cpus()[0].model, logical_cpus: cpus().length, load_start: loadavg(), workload_points: 18,
  method: 'Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.',
  source_sha256: Object.fromEntries(Object.entries(sources).map(([key, value]) => [key, sha(value)])),
  harness_sha256: Object.fromEntries(['scripts/benchmark-metadata.mjs', 'scripts/compare-dev-main.mjs', 'scripts/build-rs-engine.mjs', 'scripts/commonmark-results.mjs', 'engines/rs/build.rs', 'engines/js/compare.mjs', 'engines/php/compare.php', 'engines/rs/src/compare.rs', 'engines/js/commonmark-core.mjs', 'engines/js/package-lock.json', 'engines/php/composer.lock', 'engines/rs/Cargo.lock'].map(file => [file, sha(readFileSync(resolve(root, file)))])),
  rust_binary_sha256: sha(readFileSync(binary)) }
const rounds = []
for (let round = 0; round < 2; round++) {
  const order = round ? [...engines].reverse() : engines
  const rows = order.map(entry => {
    const row = run(entry, entry[1] === 'PHP' ? 50 : entry[1] === 'Rust' ? 200 : 100, 7)
    assert.equal(row.output_sha256, controls.find(control => control.engine === row.engine).output_sha256)
    console.log(`${round + 1}/${row.engine}: ${row.mb_per_s.toFixed(2)} MB/s`)
    return row
  })
  rounds.push({ round, rows })
}
for (const entry of Object.values(config)) {
  assert.equal(git(entry.path, 'rev-parse', 'HEAD'), entry.commit)
  assert.equal(git(entry.path, 'status', '--porcelain'), '')
}
for (const [flavor, source] of Object.entries(sources)) assert.equal(sha(readFileSync(resolve(corpus, files[flavor]))), sha(source))
for (const [file, hash] of Object.entries(commits.js.dist_sha256)) assert.equal(sha(readFileSync(resolve(config.js.path, 'dist', file))), hash)
metadata.load_end = loadavg()
const record = { schema: 1, metadata, controls, rounds }
record.final = finalCommonmarkResults(record).map(row => ({ ...row, language: engines.find(entry => entry[0] === row.engine)[1] }))
writeFileSync(resolve(root, 'reports/dev-main-core.json'), JSON.stringify(record, null, 2) + '\n')
const lines = ['# Core throughput using Carve development main', '', `Measured ${metadata.generated_at}. ${metadata.cpu}; Node ${metadata.node}. Benchmark harness checkout: ${metadata.benchmark_checkout_commit}; cached remote main: ${metadata.benchmark_base_commit}; dirty tracked tree: ${metadata.benchmark_dirty}. Harness hashes are recorded in the JSON.`, '', ...Object.entries(commits).map(([engine, value]) => `Carve ${engine}: [${value.commit}](${value.repository}/commit/${value.commit}).`), '', `Djot PHP: [${phpDependencies['php-collective/djot'].reference}](https://github.com/php-collective/djot-php/commit/${phpDependencies['php-collective/djot'].reference}), installed from the Composer lock.`, '', affinityDescription(metadata.cpu_affinity), '', metadata.method, '', 'The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.', '', '| Engine | Language | Median ms/op | MB/s |', '|---|---|---:|---:|', ...record.final.map(row => `| ${row.engine} | ${row.language} | ${row.ms_per_op.toFixed(4)} | ${row.mb_per_s.toFixed(2)} |`), '', '[Raw samples, output checks and source hashes](dev-main-core.json). The [compiled Rust dependency lock](dev-main-rust.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](../COMPARISON.md).', '', '## Reproduce', '', `Use Node ${metadata.node} for this snapshot.`, '', 'Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.', '']
writeFileSync(resolve(root, 'reports/dev-main-core.md'), lines.join('\n'))
