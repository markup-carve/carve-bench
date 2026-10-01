import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { collect, sections } from './build.mjs'
const root = new URL('../../', import.meta.url)
const comparison = readFileSync(new URL('COMPARISON.md', root), 'utf8')
const results = readFileSync(new URL('RESULTS.md', root), 'utf8')
test('site retains all measured engines, tables, corpus sizes and provenance', () => {
  const data = collect(comparison, results, 'revision')
  assert.equal(data.peers.filter(row => row.engine.startsWith('carve-')).length, 3)
  assert.ok(data.full.some(group => group.title === 'PHP authoritative extension tiers'))
  assert.ok(data.engines.includes('carve-rs'))
  assert.ok(data.peerVersions.includes('djot.js 0.3.2'))
})
test('incomplete or malformed results fail the build', () => {
  assert.throws(() => collect(comparison.replace('| Rust | carve-rs', '| Other | carve-rs'), results, 'revision'))
  assert.throws(() => collect(comparison, results.replace(/^\*\*Engines measured:.*$/m, ''), 'revision'))
  assert.throws(() => collect(comparison, results.replace(/carve-rs `([^`]+)`/, (_, identity) => 'carve-rs `' + identity + ' altered`'), 'revision'))
  assert.throws(() => sections('## Test\n| A | B |\n|---|---|\n| one |'))
})

test('history measurement identities agree with the current workers', async () => {
  const { createHash } = await import('node:crypto')
  const history = JSON.parse(readFileSync(new URL('reports/engine-history.json', root), 'utf8'))
  assert.equal(history.schema, 1)
  assert.deepEqual(Object.keys(history.engines).sort(), ['js', 'php', 'rs'])
  for (const name of ['run.py', 'worker.mjs', 'worker.php', 'worker.rs']) {
    assert.equal(history.harness_sha256[name], createHash('sha256').update(readFileSync(new URL(`scripts/history/${name}`, root))).digest('hex'))
  }
  for (const engine of Object.values(history.engines)) {
    assert.equal(engine.revisions.filter(revision => revision.label !== 'dev-main').length, history.tags_per_engine)
    assert.ok(engine.rows.length > 0)
    for (const row of engine.rows) {
      assert.equal(row.samples.length, history.rounds)
      assert.ok(row.samples.every(sample => sample.samples_ms.length === history.samples_per_round))
    }
  }
})
