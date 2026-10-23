import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const paths = [
  'reports/realistic-peer-runs/20261023-import-a.json',
  'reports/realistic-peer-runs/20261023-import-b.json',
]
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const inputs = paths.map(path => {
  const bytes = readFileSync(resolve(root, path))
  return { path, sha256: sha(bytes), data: JSON.parse(bytes) }
})
const reference = inputs[0].data
const sharedFields = [
  'schema', 'source_commits', 'benchmark_commit', 'fixture_provenance_sha256',
  'binary_sha256', 'dependency_lock_sha256', 'host', 'logical_cpus',
  'cpu_affinity', 'load_gate', 'trials_per_round', 'iterations', 'warmup', 'controls',
]
for (const { data } of inputs) {
  for (const field of sharedFields) assert.deepEqual(data[field], reference[field], `session ${field} differs`)
  assert.equal(data.rows.length, 33)
  assert.equal(data.controls.length, 33)
  assert.equal(data.order.length, data.rounds * 3)
  assert.ok(data.rounds > 0)
}

const median = values => {
  const sorted = [...values].sort((a, b) => a - b)
  return (sorted[(sorted.length - 1) >> 1] + sorted[sorted.length >> 1]) / 2
}
let offset = 0
const order = []
for (const { data } of inputs) {
  order.push(...data.order.map(entry => ({ ...entry, round: entry.round + offset })))
  offset += data.rounds
}
const rows = reference.rows.map((referenceRow, index) => {
  const rounds = inputs.flatMap(({ data }) => {
    const row = data.rows[index]
    for (const field of ['document', 'engine', 'language', 'extension', 'input_bytes']) {
      assert.equal(row[field], referenceRow[field], `row ${index} ${field} differs`)
    }
    assert.equal(row.rounds.length, data.rounds)
    return row.rounds
  })
  const cpuSamples = rounds.flatMap(round => round.cpu_samples_ms)
  const wallSamples = rounds.flatMap(round => round.samples_ms)
  assert.equal(cpuSamples.length, offset * reference.trials_per_round)
  return {
    document: referenceRow.document,
    engine: referenceRow.engine,
    language: referenceRow.language,
    extension: referenceRow.extension,
    input_bytes: referenceRow.input_bytes,
    rounds,
    median_cpu_ms: median(cpuSamples),
    median_wall_ms: median(wallSamples),
    round_median_cpu_ms: rounds.map(round => median(round.cpu_samples_ms)),
  }
})
const last = inputs.at(-1).data
const combined = {
  ...last,
  generated_at: new Date().toISOString(),
  rounds: offset,
  order,
  rows,
  load_start: reference.load_start,
  sessions: inputs.map(({ path, sha256, data }) => ({
    path, sha256, generated_at: data.generated_at, rounds: data.rounds,
    load_start: data.load_start, load_end: data.load_end,
    harness_sha256: data.harness_sha256,
  })),
  harness_sha256: {
    ...last.harness_sha256,
    'scripts/realistic/peer-aggregate.mjs': sha(readFileSync(fileURLToPath(import.meta.url))),
  },
}
assert.equal(combined.order.length, combined.rounds * 3)
writeFileSync(resolve(root, 'reports/realistic-peer.json'), JSON.stringify(combined, null, 2) + '\n')
console.log(`Aggregated ${combined.rounds} rounds from ${inputs.length} sessions`)
