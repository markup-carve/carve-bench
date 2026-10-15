import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'

const archive = JSON.parse(readFileSync(new URL('../reports/producer-archive-20261015.json', import.meta.url)))
const sha = file => createHash('sha256').update(readFileSync(file)).digest('hex')

export function requireRecordedProducer(file, expected) {
  if (sha(file) === expected) return
  const retained = archive.sources[file]
  assert.ok(retained, `Missing measured producer: ${file}`)
  assert.ok(retained.path.startsWith('reports/producers/'))
  assert.equal(retained.sha256, expected, file)
  assert.equal(sha(retained.path), expected, retained.path)
}

export function requireRecordedMeasurement(record) {
  assert.equal(sha(record), archive.records[record]?.sha256, 'Historical raw measurements must remain unchanged')
}

export function historicalSnapshot(record, kind) {
  requireRecordedMeasurement(record)
  assert.ok(['core', 'full'].includes(kind))
  assert.equal(sha(archive[kind + 'Snapshot']), archive[kind + 'SnapshotSha256'], 'Archived snapshot changed')
  return JSON.parse(readFileSync(archive[kind + 'Snapshot']))
}
