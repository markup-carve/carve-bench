import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { finalCommonmarkResults } from './commonmark-results.mjs'

test('throughput graph uses pinned Carve main in both workloads', () => {
  const record = JSON.parse(readFileSync('reports/dev-main-core.json'))
  assert.equal(record.metadata.workload_points, 18)
  assert.equal(record.controls.length, 10)
  assert.equal(new Set(record.controls.map(row => row.projection_sha256)).size, 1)
  for (const [engine, value] of Object.entries(record.metadata.carve_main)) {
    assert.equal(value.kind, 'merged-main')
    assert.equal(value.repository, `https://github.com/markup-carve/carve-${engine}`)
    assert.match(value.commit, /^[a-f0-9]{40}$/)
    for (const round of record.rounds) {
      assert.equal(round.rows.find(row => row.engine === `carve-${engine}`).carve_source, `carve-${engine} (merged main ${value.commit})`)
    }
  }
  assert.deepEqual(record.rounds[1].rows.map(row => row.engine), record.rounds[0].rows.map(row => row.engine).reverse())
  for (const round of record.rounds) for (const row of round.rows) {
    const control = record.controls.find(item => item.engine === row.engine)
    assert.equal(row.output_sha256, control.output_sha256)
    assert.equal(row.source_sha256, control.source_sha256)
    assert.equal(row.samples.length, 7)
  }
  assert.deepEqual(record.final.map(({ language, ...row }) => row), finalCommonmarkResults(record))
  for (const [file, hash] of Object.entries(record.metadata.harness_sha256)) assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), hash, file)
  const shared = JSON.parse(readFileSync('reports/commonmark-js.json'))
  assert.equal(shared.metadata.carve_main.commit, record.metadata.carve_main.js.commit)
  assert.equal(shared.metadata.carve_main.fast_path, true)
  const archive = JSON.parse(readFileSync('reports/commonmark-js-release-0.1.9.json'))
  assert.equal(archive.metadata.package_versions['@markup-carve/carve'], '0.1.9')
  assert.ok(!archive.metadata.carve_main)
  assert.match(readFileSync('charts/core-throughput.svg', 'utf8'), /Carve dev-main in every panel/)
})
