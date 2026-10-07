import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const read = file => JSON.parse(readFileSync(file))
const sha = file => createHash('sha256').update(readFileSync(file)).digest('hex')
const median = values => {
  const sorted = [...values].sort((a, b) => a - b)
  return (sorted[Math.floor((sorted.length - 1) / 2)] + sorted[Math.floor(sorted.length / 2)]) / 2
}

test('final audit controls match the published baseline, current pins and measured producers', () => {
  const control = read('reports/final-audit-conversion-checks.json')
  const paired = read('reports/final-audit-pairs.json')
  const before = read('reports/dev-main-full-pre-queue-audit-20261007.json')
  const core = read('reports/dev-main-core.json')
  const full = read('reports/dev-main-full.json')
  assert.equal(control.metadata.build_manifest_sha256, sha('reports/final-audit-pairs.json'))
  assert.deepEqual(control.metadata.php_ini_flags.slice(-2), ['-d', 'memory_limit=512M'])
  assert.deepEqual(control.metadata.php_ini_flags.slice(0, -2), paired.metadata.php_ini_flags)
  for (const engine of ['js', 'php', 'rs']) {
    assert.equal(control.metadata.sources.before[engine].commit, before.metadata.source_commits[engine].commit)
    assert.equal(control.metadata.sources.after[engine].commit, core.metadata.carve_main[engine].commit)
    assert.equal(control.metadata.sources.after[engine].commit, full.metadata.source_commits[engine].commit)
    for (const revision of ['before', 'after'])
      assert.equal(control.metadata.sources[revision][engine].commit, paired.metadata.sources[revision][engine].commit)
  }
  for (const [file, hash] of Object.entries(control.metadata.harness_sha256))
    assert.equal(sha(file), hash, file)
  assert.equal(control.publication_exporter_sha256, sha('scripts/public_report.py'))
  assert.equal(control.summary.length, 13)
  for (const result of control.summary) {
    const rows = control.rows.filter(row => row.engine === result.engine && row.case === result.case)
    assert.equal(rows.length, 4)
    const fixture = result.case === 'core' ? 'corpus/dev-main-core/carve.crv'
      : result.case === 'js-without-tables' ? 'corpus/commonmark-core/carve.crv'
      : `corpus/${result.case}.crv`
    for (const revision of ['before', 'after']) {
      const selected = rows.filter(row => row.revision === revision)
      assert.deepEqual(selected.map(row => row.round).sort(), [0, 1])
      assert.equal(new Set(selected.map(row => row.output_sha256)).size, 1)
      for (const row of selected) {
        assert.equal(row.source_sha256, sha(fixture))
        assert.equal(row.carve_source, `carve-${result.engine} (merged main ${control.metadata.sources[revision][result.engine].commit})`)
        assert.ok(Math.abs(median(row.samples) - row.median_ms) < 1e-9)
      }
    }
    assert.ok(rows.every(row => row.samples.length === (result.case === 'large' ? 2 : 5)))
    const outputs = [...new Set(rows.map(row => row.output_sha256))].sort()
    assert.deepEqual(result.output_sha256, outputs)
    assert.equal(outputs.length === 1, result.comparable)
    if (!result.comparable) assert.equal(result.timing_status, 'output-mismatch')
    const changes = [0, 1].map(round => {
      const before = rows.find(row => row.round === round && row.revision === 'before').median_ms
      const after = rows.find(row => row.round === round && row.revision === 'after').median_ms
      return (after / before - 1) * 100
    })
    if (result.comparable) {
      const mean = (changes[0] + changes[1]) / 2
      assert.ok(Math.abs(mean - result.observed_mean_paired_change_percent) < 1e-9)
      if (result.timing_status === 'observed') assert.ok(Math.abs(mean - result.paired_change_percent) < 1e-9)
    }
    if (result.timing_status !== 'observed') assert.equal(result.paired_change_percent, null)
  }
})

test('revision diagnostics retain the measured producers and paired build identity', () => {
  const conversion = read('reports/conversion-snapshot-pairs.json')
  const ranking = read('reports/rust-core-ranking.json')
  const paired = read('reports/paired-full-feature.json')
  for (const [file, hash] of Object.entries(conversion.metadata.harness_sha256))
    assert.equal(sha(file === 'scripts/check-conversion-snapshots.py'
      ? 'scripts/check-conversion-snapshots-pre-final-audit.py' : file), hash, file)
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

for (const stem of ['conversion-snapshot-pairs', 'final-audit-conversion-checks'])
test(`${stem}: Markdown shows changes only for observed comparable rows`, () => {
  const conversion = read(`reports/${stem}.json`)
  const markdown = readFileSync(`reports/${stem}.md`, 'utf8')
  for (const row of conversion.summary) {
    const line = markdown.split('\n').find(line => line.startsWith(`| ${row.engine} | ${row.case} |`))
    assert.ok(line)
    const cells = line.split('|').map(cell => cell.trim())
    if (row.timing_status === 'observed')
      assert.equal(cells[5], `${row.paired_change_percent >= 0 ? '+' : ''}${row.paired_change_percent.toFixed(1)}%`)
    else assert.equal(cells[5], 'suppressed')
  }
})

test('historical large PHP memory controls identify their measured snapshot and worker', () => {
  const control = read('reports/php-large-memory-control.json')
  const full = read('reports/dev-main-full-pre-final-audit-20261007.json')
  assert.equal(control.metadata.worker_sha256, sha('engines/php/bench.php'))
  assert.equal(control.metadata.input_sha256, sha('corpus/large.crv'))
  assert.equal(control.metadata.failed_commit, full.metadata.source_commits.php.commit)
  assert.equal(control.metadata.failed_returncode, 255)
  assert.ok(control.rows.find(row => row.revision === 'final').peak_memory_bytes > control.metadata.failed_memory_limit_bytes)
  assert.ok(control.rows.find(row => row.revision === 'audit').peak_memory_bytes < control.metadata.failed_memory_limit_bytes)
})
