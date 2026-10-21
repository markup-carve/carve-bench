import assert from 'node:assert/strict'
import { finalCommonmarkResults } from './commonmark-results.mjs'

const median = values => {
  assert.ok(values.length > 0 && values.every(value => Number.isFinite(value) && value > 0))
  const sorted = [...values].sort((a, b) => a - b)
  return (sorted[(sorted.length - 1) >> 1] + sorted[sorted.length >> 1]) / 2
}

export function directHtmlResults(snapshot, rustRerun = null, phpRerun = null) {
  const rows = finalCommonmarkResults(snapshot)
  const rustPair = new Set(['carve-rs', 'pulldown-cmark'])
  const phpPair = new Set(['carve-php', 'djot-php'])
  if (rustRerun) {
    assert.equal(rustRerun.metadata.rust_engine_commit, snapshot.metadata.carve_main.rs.commit)
    assert.equal(rustRerun.metadata.binary_sha256, snapshot.metadata.rust_binary_sha256)
    assert.equal(rustRerun.rounds.length, rustRerun.summary.rounds)
    for (const engine of rustPair) {
      const control = snapshot.controls.find(row => row.engine === engine)
      assert.ok(control, `Missing ${engine} core control`)
      assert.equal(rustRerun.metadata.inputs[engine].source_sha256, control.source_sha256)
      assert.equal(rustRerun.metadata.inputs[engine].output_sha256, control.output_sha256)
      const samples = rustRerun.rounds.flatMap(round => round.rows[engine].cpu_samples_ms)
      assert.equal(median(samples), rustRerun.summary.engines[engine].pooled_median_cpu_ms)
    }
    const wins = rustRerun.rounds.filter(round =>
      median(round.rows['carve-rs'].cpu_samples_ms) < median(round.rows['pulldown-cmark'].cpu_samples_ms)).length
    assert.equal(wins, rustRerun.summary.carve_faster_rounds)
  }
  if (phpRerun) {
    assert.match(phpRerun.metadata.carve_engine_commit, /^[0-9a-f]{40}$/)
    assert.equal(phpRerun.metadata.djot_reference, snapshot.metadata.php_dependencies['php-collective/djot'].reference)
    assert.equal(phpRerun.metadata.cpu_affinity.length, 1)
    assert.equal(phpRerun.rounds.length, 32)
    assert.equal(phpRerun.sessions.length, 2)
    for (const engine of phpPair) {
      const control = snapshot.controls.find(row => row.engine === engine)
      assert.ok(control, `Missing ${engine} core control`)
      const samples = phpRerun.rounds.flatMap(round => {
        const row = round.rows[engine]
        assert.equal(row.source_sha256, control.source_sha256)
        assert.equal(row.output_sha256, control.output_sha256)
        assert.equal(row.jit, true)
        assert.equal(row.iterations, 60)
        assert.equal(row.trials, 5)
        assert.equal(row.cpu_samples_ms.length, 5)
        return row.cpu_samples_ms
      })
      assert.equal(median(samples), phpRerun.summary.engines[engine].pooled_median_cpu_ms)
    }
    const ratios = phpRerun.rounds.map(round => median(round.rows['carve-php'].cpu_samples_ms) / median(round.rows['djot-php'].cpu_samples_ms))
    assert.equal(median(ratios), phpRerun.summary.median_paired_carve_over_djot_cpu)
    assert.equal(ratios.filter(ratio => ratio < 1).length, phpRerun.summary.carve_faster_rounds)
  }

  return rows.map(row => {
    const recorded = snapshot.final.find(item => item.engine === row.engine)
    assert.ok(recorded && recorded.bytes > 0, `Missing ${row.engine} core row`)
    const samples = snapshot.rounds.flatMap(round => {
      const measured = round.rows.find(item => item.engine === row.engine)
      assert.ok(measured, `Missing ${row.engine} round`)
      return measured.cpu_samples_ms
    })
    const ms_per_op = rustRerun && rustPair.has(row.engine)
      ? rustRerun.summary.engines[row.engine].pooled_median_cpu_ms
      : phpRerun && phpPair.has(row.engine)
        ? phpRerun.summary.engines[row.engine].pooled_median_cpu_ms
        : median(samples)
    return { ...row, ms_per_op, mb_per_s: recorded.bytes / 1048576 / (ms_per_op / 1000) }
  })
}
