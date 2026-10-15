import {test} from 'node:test'
import assert from 'node:assert/strict'
import {tierResults, median} from './php-tier-results.mjs'
function fixture() {
  return {metadata: {sources: {previous: {}, published: {}}}, rows: ['tier1','tier2','tier3'].flatMap(profile => ['previous','published'].flatMap(revision => Array.from({length: 8}, (_, round) => ({profile, revision, round, control: {jit_on: true, output_sha256: profile, wall_ms: Array(7).fill(revision === 'previous' ? 2 : 3), cpu_ms: Array(7).fill(2)}}))))}
}
test('paired summary separates scheduling delay from CPU cost', () => {
  assert.equal(median([4, 1, 3, 2]), 2.5)
  const rows = tierResults(fixture())
  assert.equal(rows.length, 6)
  assert.deepEqual(rows[0].interval95, [1.5, 1.5])
  assert.deepEqual(rows[1].interval95, [1, 1])
})
test('different outputs and missing pairs cannot produce ratios', () => {
  const changed = fixture(); changed.rows[0].control.output_sha256 = 'different'
  assert.throws(() => tierResults(changed), /outputs differ/)
  const missing = fixture(); missing.rows[0].round = 1
  assert.throws(() => tierResults(missing), /Missing or duplicate/)
})
test('disabled JIT or invalid measurements fail closed', () => {
  const invalid = fixture(); invalid.rows[0].control.cpu_ms[0] = 0
  assert.throws(() => tierResults(invalid))
  const jit = fixture(); jit.rows[0].control.jit_on = false
  assert.throws(() => tierResults(jit))
})
