import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const read = file => JSON.parse(readFileSync(file))
const sha = file => createHash('sha256').update(readFileSync(file)).digest('hex')

test('revision diagnostics retain the measured producers and paired build identity', () => {
  const conversion = read('reports/conversion-snapshot-pairs.json')
  const ranking = read('reports/rust-core-ranking.json')
  const paired = read('reports/paired-full-feature.json')
  for (const [file, hash] of Object.entries(conversion.metadata.harness_sha256))
    assert.equal(sha(file), hash, file)
  assert.equal(sha('scripts/check-rust-core-ranking.py'), ranking.metadata.producer_sha256)
  assert.equal(conversion.metadata.build_manifest_sha256, ranking.metadata.build_manifest_sha256)
  assert.equal(conversion.metadata.build_manifest_sha256, sha('reports/paired-full-feature.json'))
  for (const revision of ['before', 'after']) {
    for (const engine of ['js', 'php', 'rs'])
      assert.equal(conversion.metadata.sources[revision][engine].commit, paired.metadata.sources[revision][engine].commit)
    assert.equal(ranking.metadata.sources[revision].commit, paired.metadata.sources[revision].rs.commit)
  }
  for (const report of [conversion, ranking])
    assert.equal(report.publication_exporter_sha256, sha('scripts/public_report.py'))
})

test('ranking rows match the preserved chart input and output controls', () => {
  const ranking = read('reports/rust-core-ranking.json')
  assert.equal(sha(ranking.metadata.core_controls_report), ranking.metadata.core_controls_sha256)
  for (const engine of ['carve-rs', 'pulldown-cmark']) {
    const fixture = engine === 'carve-rs' ? 'carve.crv' : 'markdown.md'
    const rows = ranking.records.filter(row => row.engine === engine)
    assert.equal(rows.length, 16)
    assert.equal(new Set(rows.map(row => row.output_sha256)).size, 1)
    for (const row of rows) {
      assert.equal(row.source_sha256, sha(`corpus/dev-main-core/${fixture}`))
      assert.equal(row.samples.length, 3)
      assert.equal(row.iterations, 3000)
    }
    for (const revision of ['before', 'after'])
      assert.deepEqual(rows.filter(row => row.revision === revision).map(row => row.round), [1, 2, 3, 4, 5, 6, 7, 8])
  }
})

test('PHP output mismatch cannot become a published comparable timing delta', () => {
  const conversion = read('reports/conversion-snapshot-pairs.json')
  const result = conversion.summary.find(row => row.engine === 'php' && row.case === 'large')
  assert.equal(result.comparable, false)
  assert.equal(result.paired_change_percent, null)
  const controls = conversion.rows.filter(row => row.engine === 'php' && row.case === 'large')
  assert.equal(new Set(controls.map(row => row.output_sha256)).size, 2)
  for (const revision of ['before', 'after'])
    assert.equal(new Set(controls.filter(row => row.revision === revision).map(row => row.output_sha256)).size, 1)
})

test('JIT controls retain the observed revision outputs and measured worker', () => {
  const conversion = read('reports/conversion-snapshot-pairs.json')
  const jit = read('reports/php-large-jit-output-control.json')
  assert.equal(jit.publication_exporter_sha256, sha('scripts/public_report.py'))
  assert.equal(jit.metadata.worker_sha256, sha('engines/php/compare.php'))
  assert.equal(jit.metadata.source_override_sha256, sha('engines/php/carve-src.php'))
  assert.equal(jit.metadata.input_sha256, sha('corpus/large.crv'))
  for (const revision of ['before', 'after']) {
    const control = jit.rows.find(row => row.revision === revision && row.jit_mode === 'tracing')
    for (const row of conversion.rows.filter(row => row.engine === 'php' && row.case === 'large' && row.revision === revision))
      assert.equal(control.output_sha256, row.output_sha256)
  }
  assert.equal(jit.rows.find(row => row.jit_mode === 'disabled').output_sha256,
    jit.rows.find(row => row.revision === 'after').output_sha256)
})

test('diagnostic Markdown shows changes only for observed comparable rows', () => {
  const conversion = read('reports/conversion-snapshot-pairs.json')
  const markdown = readFileSync('reports/conversion-snapshot-pairs.md', 'utf8')
  for (const row of conversion.summary) {
    const line = markdown.split('\n').find(line => line.startsWith(`| ${row.engine} | ${row.case} |`))
    assert.ok(line)
    const cells = line.split('|').map(cell => cell.trim())
    if (row.timing_status === 'observed')
      assert.equal(cells[5], `${row.paired_change_percent >= 0 ? '+' : ''}${row.paired_change_percent.toFixed(1)}%`)
    else assert.equal(cells[5], 'suppressed')
  }
})
