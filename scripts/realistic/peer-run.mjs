import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { cpus, loadavg, platform, release } from 'node:os'
import { resolve, dirname } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { coreProjection } from '../../engines/js/commonmark-core.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const provenance = JSON.parse(readFileSync(resolve(root, 'corpus/realistic/peer/provenance.json')))
const pins = JSON.parse(readFileSync(resolve(root, 'scripts/realistic/peer-pins.json')))
for (const engine of ['js', 'php', 'rs']) {
  const commit = process.env[`CARVE_${engine.toUpperCase()}_COMMIT`]
  if (commit) pins[engine] = commit
}
const trees = {
  js: process.env.CARVE_JS_TREE,
  php: process.env.CARVE_PHP_TREE,
  rs: process.env.CARVE_RS_TREE,
}
const rustBinary = process.env.CARVE_RS_COMPARE_BIN
for (const [engine, tree] of Object.entries(trees)) {
  assert.ok(tree, `CARVE_${engine.toUpperCase()}_TREE is required`)
  const commit = execFileSync('git', ['-C', tree, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  assert.equal(commit, pins[engine], `${engine} commit differs from realistic engine report`)
}
assert.ok(rustBinary, 'CARVE_RS_COMPARE_BIN is required')
const sha = value => createHash('sha256').update(value).digest('hex')
const binarySha = sha(readFileSync(rustBinary))
const expectedBinarySha = process.env.CARVE_RS_EXPECTED_SHA256
  ?? JSON.parse(readFileSync(resolve(root, 'reports/rust-core-recheck-20261021-rerun.json'))).metadata.binary_sha256
assert.equal(binarySha, expectedBinarySha, 'Rust comparison binary differs from pinned core run')

const engines = [
  ['carve-js', 'js', 'crv'], ['djot.js', 'js', 'dj'], ['markdown-it', 'js', 'md'], ['commonmark.js', 'js', 'md'],
  ['carve-php', 'php', 'crv'], ['djot-php', 'php', 'dj'], ['league/commonmark-gfm', 'php', 'md'],
  ['carve-rs', 'rs', 'crv'], ['jotdown', 'rs', 'dj'], ['comrak', 'rs', 'md'], ['pulldown-cmark', 'rs', 'md'],
]
const phpLock = JSON.parse(readFileSync(resolve(root, 'scripts/realistic/peer-composer.lock')))
const phpInstalled = JSON.parse(readFileSync(resolve(root, 'engines/php/vendor/composer/installed.json'))).packages
const djotPhpCommit = phpLock.packages.find(row => row.name === 'php-collective/djot')?.source?.reference
assert.equal(djotPhpCommit, '4ccf5ccf8f105e08bb32ceff7821c510d181457d')
assert.equal(phpInstalled.find(row => row.name === 'php-collective/djot')?.source?.reference, djotPhpCommit)
const iterations = { js: 30, php: 20, rs: 100 }
const warmup = { js: 200, php: 20, rs: 20 }
const trials = 5
const rounds = 8
const cpu = 12
const loadGate = Number(process.env.CARVE_PEER_MAX_LOAD ?? 20)
assert.ok(Number.isFinite(loadGate) && loadGate >= 0)
const median = values => {
  const sorted = [...values].sort((a, b) => a - b)
  return (sorted[(sorted.length - 1) >> 1] + sorted[sorted.length >> 1]) / 2
}
const rotate = (values, offset) => [...values.slice(offset % values.length), ...values.slice(0, offset % values.length)]

function run(entry, document, observe) {
  const [engine, language, extension] = entry
  const path = resolve(root, document.fixtures[extension].path)
  const command = language === 'js' ? process.execPath : language === 'php' ? 'php' : rustBinary
  const prefix = language === 'js' ? [resolve(root, 'engines/js/compare.mjs')]
    : language === 'php' ? ['-n', '-d', 'extension=ctype', '-d', 'extension=mbstring', '-d', 'opcache.enable_cli=1',
      '-d', 'opcache.jit_buffer_size=128M', '-d', 'opcache.jit=tracing', resolve(root, 'engines/php/compare.php')] : []
  const env = { ...process.env, CARVE_JS: pathToFileURL(resolve(trees.js, 'dist/index.js')).href,
    CARVE_PHP_SRC: resolve(trees.php, 'src'), CARVE_COMPARE_OBSERVE: observe ? '1' : '0',
    CARVE_COMPARE_WARMUP: String(warmup[language]) }
  const output = execFileSync('taskset', ['-c', String(cpu), command, ...prefix, engine, path,
    String(observe ? 1 : iterations[language]), String(observe ? 1 : trials)],
  { encoding: 'utf8', env, maxBuffer: 20_000_000, timeout: 180_000 })
  const row = JSON.parse(output)
  const html = row.html ?? (row.output_hex ? Buffer.from(row.output_hex, 'hex').toString('utf8') : null)
  if (language === 'rs') row.output_sha256 = sha(html)
  assert.equal(row.source_sha256 ?? sha(readFileSync(path)), document.fixtures[extension].sha256)
  if (html !== null) assert.equal(row.output_sha256, sha(html))
  assert.equal(row.bytes, document.fixtures[extension].bytes)
  if (language === 'php') assert.equal(row.jit_on, true, 'PHP tracing JIT must be active')
  if (engine.startsWith('carve-')) assert.ok(row.carve_source?.includes(pins[language].slice(0, 8)))
  assert.equal(row.cpu_samples_ms.length, observe ? 1 : trials)
  assert.ok(row.cpu_samples_ms.every(value => Number.isFinite(value) && value > 0))
  return { row, html }
}

function normalizedProjection(html) {
  return { projection: coreProjection(html), exceptions: [] }
}

for (const document of provenance.documents) {
  for (const fixture of Object.values(document.fixtures)) {
    assert.equal(sha(readFileSync(resolve(root, fixture.path))), fixture.sha256)
  }
}

const controls = []
for (const document of provenance.documents) {
  let baseline
  for (const entry of engines) {
    const { row, html } = run(entry, document, true)
    const { projection, exceptions } = normalizedProjection(html, document, entry[0])
    baseline ??= projection
    assert.deepEqual(projection, baseline, `${document.name}: ${entry[0]} output differs`)
    controls.push({ document: document.name, engine: entry[0], source_sha256: row.source_sha256 ?? document.fixtures[entry[2]].sha256,
      output_sha256: row.output_sha256, projection_sha256: sha(JSON.stringify(projection)), code_span_space_exceptions: exceptions })
  }
  console.log(`${document.name}: ${engines.length} output controls passed`)
}

const rows = provenance.documents.flatMap(document => engines.map(([engine, language, extension]) => ({
  document: document.name, engine, language, extension, input_bytes: document.fixtures[extension].bytes, rounds: [],
})))
const order = []
const loadStart = loadavg()
for (let round = 0; round < rounds; round++) {
  while (loadavg()[0] > loadGate) {
    console.log(`waiting for host load below ${loadGate} before round ${round + 1}: ${loadavg()[0].toFixed(2)}`)
    await new Promise(resolve => setTimeout(resolve, 15_000))
  }
  for (const [documentIndex, document] of rotate(provenance.documents, round).entries()) {
    const entries = rotate(engines, (round * 3 + documentIndex) % engines.length)
    order.push({ round: round + 1, document: document.name, load: loadavg(), engines: entries.map(entry => entry[0]) })
    for (const entry of entries) {
      const { row } = run(entry, document, false)
      const control = controls.find(item => item.document === document.name && item.engine === entry[0])
      assert.equal(row.output_sha256, control.output_sha256, `${document.name}: ${entry[0]} output changed while timing`)
      rows.find(item => item.document === document.name && item.engine === entry[0]).rounds.push({
        samples_ms: row.samples, cpu_samples_ms: row.cpu_samples_ms, output_sha256: row.output_sha256,
      })
    }
    console.log(`round ${round + 1}/${rounds}: ${document.name} complete`)
  }
}
for (const row of rows) {
  row.median_cpu_ms = median(row.rounds.flatMap(round => round.cpu_samples_ms))
  row.median_wall_ms = median(row.rounds.flatMap(round => round.samples_ms))
  row.round_median_cpu_ms = row.rounds.map(round => median(round.cpu_samples_ms))
}
const record = { schema: 1, generated_at: new Date().toISOString(), source_commits: pins,
  benchmark_commit: execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  fixture_provenance_sha256: sha(readFileSync(resolve(root, 'corpus/realistic/peer/provenance.json'))),
  binary_sha256: binarySha, harness_sha256: Object.fromEntries(['scripts/realistic/peer-run.mjs',
    'engines/js/compare.mjs', 'engines/php/compare.php', 'engines/rs/src/compare.rs'].map(file => [file, sha(readFileSync(resolve(root, file)))])),
  dependency_lock_sha256: Object.fromEntries(['engines/js/package-lock.json', 'scripts/realistic/peer-composer.lock',
    'reports/dev-main-rust.Cargo.lock'].map(file => [file, sha(readFileSync(resolve(root, file)))])),
  host: `${platform()} ${release()}`, logical_cpus: cpus().length, cpu_affinity: [cpu], load_start: loadStart,
  load_end: loadavg(), load_gate: loadGate, rounds, trials_per_round: trials, iterations, warmup, order, controls, rows }
writeFileSync(resolve(root, 'reports/realistic-peer.json'), JSON.stringify(record, null, 2) + '\n')
console.log('Wrote reports/realistic-peer.json')
