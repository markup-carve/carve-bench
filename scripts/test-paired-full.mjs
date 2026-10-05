import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fullFeatureSizes, fullFeatureSource, requireFullFeatureOutput } from './full-feature-fixture.mjs'
import { pairedSummary, pairedTableRows, requireMatchingOutputs, requireWorkerSource } from './paired-full-results.mjs'

test('changed output blocks a speed comparison even when lengths agree', () => {
  const before = { output_bytes: 10, output_sha256: 'before' }
  assert.throws(() => requireMatchingOutputs(before, { ...before, output_sha256: 'after' }), /Different output hashes/)
  assert.throws(() => requireMatchingOutputs(before, { ...before, output_bytes: 11 }), /Different output sizes/)
  requireMatchingOutputs(before, before)
})

test('paired ratios retain a consistent change despite overlapping pooled ranges', () => {
  const rows = [1, 3].flatMap((ms, round) => [
    { engine: 'js', sections: 128, round, revision: 'before', ms_per_op: ms },
    { engine: 'js', sections: 128, round, revision: 'after', ms_per_op: ms * 2 },
  ])
  const result = pairedSummary(rows)[0]
  assert.equal(result.paired_change_percent, 100)
  assert.deepEqual(result.paired_changes_percent, [100, 100])
  assert.throws(() => pairedSummary(rows.slice(1)), /Each round/)
})

test('worker identity checks the revision token independently of the path', () => {
  const entry = { path: '/tmp/abcdef0123', commit: 'abcdef0123456789012345678901234567890123' }
  requireWorkerSource(`carve (local checkout ${entry.path} @ abcdef0)`, entry)
  assert.throws(() => requireWorkerSource(`carve (local checkout ${entry.path} @ 1234567)`, entry), /Worker revision/)
  assert.throws(() => requireWorkerSource('carve (local checkout /wrong @ abcdef0)', entry))
})

test('literal fixture output cannot masquerade as full-feature rendering', () => {
  assert.throws(() => requireFullFeatureOutput(fullFeatureSource(1)), /Missing exercised feature/)
  assert.throws(() => fullFeatureSource(0), /Positive section count/)
})

test('published paired samples match generated inputs, controls and measured producers', () => {
  const record = JSON.parse(readFileSync('reports/paired-full-feature.json'))
  for (const revision of ['before', 'after']) for (const engine of ['js', 'php', 'rs'])
    assert.match(record.metadata.sources[revision][engine].commit, /^[a-f0-9]{40}$/)
  assert.deepEqual(record.fixtures.map(row => row.sections), fullFeatureSizes)
  const sha = value => createHash('sha256').update(value).digest('hex')
  for (const fixture of record.fixtures) {
    assert.equal(fixture.source_sha256, sha(fullFeatureSource(fixture.sections)))
    assert.equal(fixture.source_sha256, sha(readFileSync(fixture.file)))
    for (const engine of ['js', 'php', 'rs']) {
      const controls = record.controls.filter(row => row.engine === engine && row.sections === fixture.sections)
      assert.equal(controls.length, 2)
      assert.deepEqual(controls.map(row => row.revision), ['before', 'after'])
      requireMatchingOutputs(...controls)
      for (const revision of ['before', 'after']) {
        const samples = record.rows.filter(row => row.engine === engine && row.sections === fixture.sections && row.revision === revision)
        assert.deepEqual(samples.map(row => row.round), [0, 1, 2, 3, 4, 5, 6, 7])
        assert.ok(samples.every(row => row.iters > 0 && row.ms_per_op * row.iters >= 1000))
      }
    }
  }
  assert.ok(record.rows.filter(row => row.engine === 'php').every(row => row.jit === true))
  assert.equal(record.publication_exporter_sha256, sha(readFileSync('scripts/public_report.py')))
  assert.deepEqual(record.summary, pairedSummary(record.rows))
  const report = readFileSync('reports/paired-full-feature.md', 'utf8')
  for (const row of pairedTableRows(record.summary)) assert.ok(report.includes(`| ${row.join(' | ')} |`))
  for (const [file, hash] of Object.entries(record.metadata.harness_sha256)) assert.equal(hash, sha(readFileSync(file)), file)
})
