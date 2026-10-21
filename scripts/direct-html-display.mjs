import assert from 'node:assert/strict'
import { finalCommonmarkResults } from './commonmark-results.mjs'

const median = values => {
  assert.ok(values.length > 0 && values.every(value => Number.isFinite(value) && value > 0))
  const sorted = [...values].sort((a, b) => a - b)
  return (sorted[(sorted.length - 1) >> 1] + sorted[sorted.length >> 1]) / 2
}

export function directHtmlResults(snapshot, rustRerun = null) {
  const rows = finalCommonmarkResults(snapshot)
  const rustPair = new Set(['carve-rs', 'pulldown-cmark'])
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
      : median(samples)
    return { ...row, ms_per_op, mb_per_s: recorded.bytes / 1048576 / (ms_per_op / 1000) }
  })
}
