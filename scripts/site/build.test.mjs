import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, rmSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, collect, sections } from './build.mjs'
import { directHtmlResults } from '../direct-html-display.mjs'
const root = new URL('../../', import.meta.url)
const comparison = readFileSync(new URL('COMPARISON.md', root), 'utf8')
const results = readFileSync(new URL('RESULTS.md', root), 'utf8')
const phpTierRecord = JSON.parse(readFileSync(new URL('reports/php-tier-pairs.json', root), 'utf8'))
const fullRecord = JSON.parse(readFileSync(new URL('reports/dev-main-full.json', root), 'utf8'))
const balancedTierRecord = JSON.parse(readFileSync(new URL('reports/php-tier-balanced.json', root), 'utf8'))
assert.equal(balancedTierRecord.metadata.source_commit, fullRecord.metadata.source_commits.php.commit, 'Balanced tiers must match the fleet PHP commit')
const currentTierRecord = balancedTierRecord
test('direct HTML ranking uses verified paired CPU samples for the Rust leaders', () => {
  const snapshot = JSON.parse(readFileSync(new URL('reports/dev-main-core.json', root), 'utf8'))
  const rerun = JSON.parse(readFileSync(new URL('reports/rust-core-recheck-20261021-rerun.json', root), 'utf8'))
  const rows = directHtmlResults(snapshot, rerun)
  const rust = rows.find(row => row.engine === 'carve-rs')
  const peer = rows.find(row => row.engine === 'pulldown-cmark')
  assert.equal(rust.ms_per_op, rerun.summary.engines['carve-rs'].pooled_median_cpu_ms)
  assert.equal(peer.ms_per_op, rerun.summary.engines['pulldown-cmark'].pooled_median_cpu_ms)
  assert.ok(rust.mb_per_s > peer.mb_per_s)
  assert.equal(rust.mb_per_s.toFixed(2), '110.77')
  assert.equal(peer.mb_per_s.toFixed(2), '99.65')
  const altered = structuredClone(rerun)
  altered.metadata.binary_sha256 = 'different binary'
  assert.throws(() => directHtmlResults(snapshot, altered), /binary|Expected values to be strictly equal/)
})
test('direct HTML PHP rows use the merged-head paired sessions', () => {
  const snapshot = JSON.parse(readFileSync(new URL('reports/dev-main-core.json', root), 'utf8'))
  const rust = JSON.parse(readFileSync(new URL('reports/rust-core-recheck-20261021-rerun.json', root), 'utf8'))
  const php = JSON.parse(readFileSync(new URL('reports/php-core-recheck-20261021.json', root), 'utf8'))
  const rows = directHtmlResults(snapshot, rust, php)
  for (const engine of ['carve-php', 'djot-php']) {
    assert.equal(rows.find(row => row.engine === engine).ms_per_op, php.summary.engines[engine].pooled_median_cpu_ms)
  }
  assert.equal(php.rounds.length, 32)
  const altered = structuredClone(php)
  altered.rounds[0].rows['carve-php'].output_sha256 = 'different output'
  assert.throws(() => directHtmlResults(snapshot, rust, altered), /Expected values to be strictly equal/)
})
test('site publishes current audit reports and preserved snapshot evidence', () => {
  const destination = mkdtempSync(join(tmpdir(), 'carve-bench-site-test-'))
  try {
    build(fileURLToPath(root), destination)
    for (const file of ['final-audit-pairs.json', 'final-audit-pairs.md',
      'final-audit-conversion-checks.json', 'final-audit-conversion-checks.md',
      'dev-main-core-pre-final-audit-20261007.json', 'dev-main-core-pre-final-audit-20261007.md',
      'dev-main-full-pre-final-audit-20261007.json', 'commonmark-js-pre-final-audit-20261007.md',
      'dev-main-rust-pre-final-audit-20261007.Cargo.lock',
      'dev-main-core-pre-queue-audit-20261007.md', 'dev-main-full-pre-queue-audit-20261007.json',
      'commonmark-js-pre-queue-audit-20261007.md', 'engine-history-pre-queue-audit-20261007.json',
      'final-audit-pairs-pre-queue-audit-20261007.json', 'final-audit-conversion-checks-pre-queue-audit-20261007.md',
      'dev-main-rust-pre-queue-audit-20261007.Cargo.lock',
      'dev-main-core-pre-postfix-20261015.json', 'dev-main-full-pre-postfix-20261015.json',
      'php-tier-pairs-pre-postfix-20261015.md', 'commonmark-js-pre-postfix-20261015.json',
      'dev-main-full-output-controls-pre-postfix-20261015.json',
      'realistic-engine.json', 'realistic-output-control.json', 'rust-core-recheck-20261021.md', 'rust-core-recheck-20261021.json', 'rust-core-recheck-20261021-rerun.md', 'rust-core-recheck-20261021-rerun.json', 'engine-history-audit-20261020.md',
      'engine-history-audit-js-20261020.json', 'engine-history-audit-js-merged-128-20261020.json', 'engine-history-audit-js-11d-128-20261020.json', 'engine-history-audit-php-20261020.json', 'engine-history-audit-php-merged-1024-20261020.json', 'engine-history-audit-php-ee152-1024-20261020.json',
      'engine-history-audit-rs-128-20261020.json', 'engine-history-audit-rs-1024-20261020.json'])
      assert.equal(readFileSync(join(destination, 'reports', file), 'utf8'), readFileSync(new URL(`reports/${file}`, root), 'utf8'))
    const authoredReport = readFileSync(join(destination, 'reports/realistic-engine.md'), 'utf8')
    assert.match(authoredReport, /github\.com\/markup-carve\/carve-bench\/blob\/[a-f0-9]{40}\/corpus\/realistic\/provenance\.json/)
    assert.match(authoredReport, /github\.com\/markup-carve\/carve-bench\/blob\/[a-f0-9]{40}\/scripts\/realistic\/run\.py/)
    const archivedTier = JSON.parse(readFileSync(join(destination, 'reports/php-tier-pairs-pre-postfix-20261015.json')))
    assert.equal(archivedTier.report_md_sha256, createHash('sha256').update(readFileSync(join(destination, 'reports/php-tier-pairs-pre-postfix-20261015.md'))).digest('hex'))
    const html = readFileSync(join(destination, 'index.html'), 'utf8')
    assert.ok(html.includes('Release-tag rows retain their 2026-10-02 sessions. Merged main points were refreshed 2026-10-20'))
    assert.ok(html.includes('Structured document conversion (AST)'))
    assert.ok(html.includes('These core examples use the direct HTML route in all three engines.'))
    assert.ok(html.includes('id="rust-ranking-note"'))
    assert.ok(html.includes('carve-rs faster in 6 of 8 rounds'))
    assert.ok(html.includes('href="reports/rust-core-recheck-20261021.md"'))
    assert.ok(html.includes('carve-rs faster in 22 of 24 rounds'))
    assert.ok(html.includes('href="reports/rust-core-recheck-20261021-rerun.json"'))
    assert.ok(html.includes('id="php-rerun-note"'))
    assert.ok(html.includes('href="reports/php-core-recheck-20261021.json"'))
    const phpRecord = JSON.parse(readFileSync(new URL('reports/php-core-recheck-20261021.json', root), 'utf8'))
    assert.ok(html.includes(`Carve used less CPU in ${phpRecord.summary.carve_faster_rounds} of ${phpRecord.rounds.length} rounds`))
    assert.equal(readFileSync(join(destination, 'reports/php-core-recheck-20261021.json'), 'utf8'),
      readFileSync(new URL('reports/php-core-recheck-20261021.json', root), 'utf8'))
    for (const session of phpRecord.sessions) {
      assert.equal(readFileSync(join(destination, session.path), 'utf8'), readFileSync(new URL(session.path, root), 'utf8'))
    }
    assert.ok(html.includes('href="reports/engine-history-audit-20261020.md"'))
    assert.ok(html.includes('href="reports/realistic-engine.json"'))
    assert.ok(html.includes('charts/realistic-full-parse.svg'))
    assert.ok(html.includes('id="realistic-peers"'))
    assert.ok(html.includes('charts/realistic-peer-cpu.svg'))
    assert.ok(html.includes('href="reports/realistic-peer.crv"'))
    assert.ok(html.includes('href="reports/realistic-peer.json"'))
    const peerChart = readFileSync(join(destination, 'charts/realistic-peer-cpu.svg'), 'utf8')
    assert.equal((peerChart.match(/<polyline /g) ?? []).length, 11)
    assert.equal((peerChart.match(/<circle /g) ?? []).length, 33)
    assert.equal(readFileSync(join(destination, 'reports/realistic-peer.json'), 'utf8'),
      readFileSync(new URL('reports/realistic-peer.json', root), 'utf8'))
    const peerSessions = JSON.parse(readFileSync(new URL('reports/realistic-peer.json', root), 'utf8')).sessions
    assert.equal(peerSessions.length, 3)
    for (const session of peerSessions) {
      assert.match(session.path, /^reports\/realistic-peer-runs\/[^/]+\.json$/)
      assert.equal(readFileSync(join(destination, session.path), 'utf8'),
        readFileSync(new URL(session.path, root), 'utf8'))
    }
    assert.ok(html.includes('href="reports/final-audit-pairs.json"'))
    assert.ok(html.includes('reports/php-tier-balanced.json'))
    for (const tier of currentTierRecord.rows) assert.ok(html.includes(`<td>${tier.ms_per_op.toFixed(2)}</td>`))
    assert.match(html, /charts\/php-tiers\.svg\?v=[a-f0-9]{12}/)
    const tierChart = readFileSync(join(destination, 'charts/php-tiers.svg'), 'utf8')
    const widths = [...tierChart.matchAll(/<rect x="245"[^>]*width="([0-9.]+)"/g)].map(match => Number(match[1]))
    assert.equal(widths.length, 3)
    const speeds = currentTierRecord.rows.map(row => row.mb_per_s)
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) assert.equal(Math.sign(widths[i] - widths[j]), Math.sign(speeds[i] - speeds[j]), 'Tier chart must follow recorded throughput')
    assert.equal(readFileSync(join(destination, 'charts/php-tiers-unpaired-20261015.svg'), 'utf8'), readFileSync(new URL('charts/php-tiers-unpaired-20261015.svg', root), 'utf8'))
    assert.ok(html.includes('href="reports/final-audit-conversion-checks.md"'))
    assert.equal(readFileSync(join(destination, 'charts/commonmark-js-pre-final-audit-20261007.svg'), 'utf8'),
      readFileSync(new URL('charts/commonmark-js-pre-final-audit-20261007.svg', root), 'utf8'))
  } finally {
    rmSync(destination, { recursive: true, force: true })
  }
})
test('site retains all measured engines, tables, corpus sizes and provenance', () => {
  const data = collect(comparison, results, 'revision', fullRecord, currentTierRecord)
  assert.equal(data.peers.filter(row => row.engine.startsWith('carve-')).length, 3)
  assert.ok(data.full.some(group => group.title === 'PHP authoritative extension tiers'))
  assert.ok(data.engines.includes('carve-rs'))
  assert.ok(data.peerVersions.includes('djot.js 0.3.2'))
  if (data.smallInputNote) assert.ok(data.smallInputEvidence)
  else assert.equal(data.smallInputEvidence, null)
  const controls = JSON.parse(readFileSync(new URL('reports/dev-main-full-output-controls.json', root), 'utf8'))
  if (controls.latest_merged_main_output_checks.php_flags.includes('opcache.enable_cli=0') && fullRecord.corpus.some(row => row.engine === 'carve-php' && row.jit))
    assert.ok(results.includes('PHP output controls use a clean configuration without JIT, while these timings use tracing JIT.'))
})
test('incomplete or malformed results fail the build', () => {
  assert.throws(() => collect(comparison.replace('| Rust | carve-rs', '| Other | carve-rs'), results, 'revision', fullRecord, currentTierRecord))
  assert.throws(() => collect(comparison, results.replace(/^\*\*Engines measured:.*$/m, ''), 'revision', fullRecord, currentTierRecord))
  assert.throws(() => collect(comparison, results.replace(/carve-rs `([^`]+)`/, (_, identity) => 'carve-rs `' + identity + ' altered`'), 'revision', fullRecord, currentTierRecord))
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
