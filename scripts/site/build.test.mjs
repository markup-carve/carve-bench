import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, collect, sections } from './build.mjs'
const root = new URL('../../', import.meta.url)
const comparison = readFileSync(new URL('COMPARISON.md', root), 'utf8')
const results = readFileSync(new URL('RESULTS.md', root), 'utf8')
const fullRecord = JSON.parse(readFileSync(new URL('reports/dev-main-full.json', root), 'utf8'))
test('site publishes current audit reports and preserved snapshot evidence', () => {
  const destination = mkdtempSync(join(tmpdir(), 'carve-bench-site-test-'))
  try {
    build(fileURLToPath(root), destination)
    for (const file of ['final-audit-pairs.json', 'final-audit-pairs.md',
      'final-audit-conversion-checks.json', 'final-audit-conversion-checks.md',
      'dev-main-core-pre-final-audit-20261007.json', 'dev-main-core-pre-final-audit-20261007.md',
      'dev-main-full-pre-final-audit-20261007.json', 'commonmark-js-pre-final-audit-20261007.md',
      'dev-main-rust-pre-final-audit-20261007.Cargo.lock'])
      assert.equal(readFileSync(join(destination, 'reports', file), 'utf8'), readFileSync(new URL(`reports/${file}`, root), 'utf8'))
    const html = readFileSync(join(destination, 'index.html'), 'utf8')
    assert.ok(html.includes('href="reports/final-audit-pairs.json"'))
    assert.ok(html.includes('href="reports/final-audit-conversion-checks.md"'))
    assert.equal(readFileSync(join(destination, 'charts/commonmark-js-pre-final-audit-20261007.svg'), 'utf8'),
      readFileSync(new URL('charts/commonmark-js-pre-final-audit-20261007.svg', root), 'utf8'))
  } finally {
    rmSync(destination, { recursive: true, force: true })
  }
})
test('site retains all measured engines, tables, corpus sizes and provenance', () => {
  const data = collect(comparison, results, 'revision', fullRecord)
  assert.equal(data.peers.filter(row => row.engine.startsWith('carve-')).length, 3)
  assert.ok(data.full.some(group => group.title === 'PHP authoritative extension tiers'))
  assert.ok(data.engines.includes('carve-rs'))
  assert.ok(data.peerVersions.includes('djot.js 0.3.2'))
})
test('incomplete or malformed results fail the build', () => {
  assert.throws(() => collect(comparison.replace('| Rust | carve-rs', '| Other | carve-rs'), results, 'revision', fullRecord))
  assert.throws(() => collect(comparison, results.replace(/^\*\*Engines measured:.*$/m, ''), 'revision', fullRecord))
  assert.throws(() => collect(comparison, results.replace(/carve-rs `([^`]+)`/, (_, identity) => 'carve-rs `' + identity + ' altered`'), 'revision', fullRecord))
  assert.throws(() => sections('## Test\n| A | B |\n|---|---|\n| one |'))
})

test('full-corpus records retain every workload and reject mixed worker sources', () => {
  const duplicate = structuredClone(fullRecord)
  duplicate.corpus[1] = duplicate.corpus[0]
  assert.throws(() => collect(comparison, results, 'revision', duplicate), /coverage/)
  const mixed = structuredClone(fullRecord)
  mixed.tiers[0].carve_source += ' changed'
  assert.throws(() => collect(comparison, results, 'revision', mixed), /Full worker and recorded commits differ|Mixed full-corpus sources/)
  const changed = structuredClone(fullRecord)
  changed.corpus[0].ms_per_op += 1
  assert.throws(() => collect(comparison, results, 'revision', changed), /worker timings differ/)
})

test('full-corpus inputs, harnesses and dependencies match their recorded hashes', async () => {
  const { createHash } = await import('node:crypto')
  for (const group of ['input_sha256', 'harness_sha256', 'dependency_sha256']) {
    for (const [file, hash] of Object.entries(fullRecord.metadata[group])) {
      assert.equal(createHash('sha256').update(readFileSync(new URL(file, root))).digest('hex'), hash, file)
    }
  }
})

test('history measurement identities agree with the current workers', async () => {
  const { createHash } = await import('node:crypto')
  const history = JSON.parse(readFileSync(new URL('reports/engine-history.json', root), 'utf8'))
  assert.equal(history.schema, 1)
  assert.deepEqual(Object.keys(history.engines).sort(), ['js', 'php', 'rs'])
  assert.ok(history.measurement_signature)
  for (const [engine, snapshot] of Object.entries(history.engines)) {
    const name = { js: 'worker.mjs', php: 'worker.php', rs: 'worker.rs' }[engine]
    assert.equal((snapshot.measurement_session ?? history).harness_sha256[name], createHash('sha256').update(readFileSync(new URL(`scripts/history/${name}`, root))).digest('hex'))
  }
  for (const engine of Object.values(history.engines)) {
    assert.equal(engine.revisions.filter(revision => revision.label !== 'dev-main' && revision.kind !== 'candidate').length, history.tags_per_engine)
    assert.ok(engine.rows.length > 0)
    for (const row of engine.rows) {
      assert.equal(row.samples.length, history.rounds)
      assert.ok(row.samples.every(sample => sample.samples_ms.length === history.samples_per_round))
    }
  }
})
