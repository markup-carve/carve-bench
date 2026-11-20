// node --test perf/test-gate.mjs: the verdict fails on each check it claims, and the issue step's dry run.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
const H = path.dirname(new URL(import.meta.url).pathname)
const config = JSON.parse(fs.readFileSync(path.join(H, 'config.json'), 'utf8'))
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'perf-gate-test-'))
const commit = c => ({ commit: c.repeat(40), ref: 'next2' })

function runFile(name, cells) {
  const run = {
    started: '2026-11-20T00:00:00Z', ended: '2026-11-20T00:10:00Z', rounds: 3, load: [[1, 1, 1]],
    host: { cpus: 4, model: 'test', node: 'v0' }, config,
    setup: { head: { js: commit('a'), php: commit('b'), rs: commit('c') }, baseline: { label: '0.1', api: '0.1', js: '0.1.17', php: '0.1.17', rs: '0.1.14' } },
    cells: {},
  }
  for (const [key, val] of Object.entries(cells)) {
    const [op, file, engine] = key.split('|')
    run.cells[key] = typeof val === 'string' ? { op, file, engine, err: val, ns: [] } : { op, file, engine, ns: [val * 1e6, val * 1e6, val * 1e6] }
  }
  const p = path.join(dir, `${name}.json`)
  fs.writeFileSync(p, JSON.stringify(run))
  return p
}
function compare(name, cells) {
  const p = runFile(name, cells)
  const r = spawnSync('node', [path.join(H, 'compare.mjs'), p, '--ref', 'next2', '--md', `${p}.md`, '--json', `${p}.verdict.json`], { encoding: 'utf8' })
  return { status: r.status, verdict: JSON.parse(fs.readFileSync(`${p}.verdict.json`, 'utf8')), md: fs.readFileSync(`${p}.md`, 'utf8'), files: { verdict: `${p}.verdict.json`, md: `${p}.md` } }
}
const ok = {
  'parse|prose-32k.crv|rs-head': 2, 'parse|prose-32k.crv|rs-base': 2,
  'parse|prose-128k.crv|rs-head': 8, 'parse|prose-128k.crv|rs-base': 8,
  'ext|prose-32k.crv|rs-base': 'unsupported', 'ext|prose-32k.crv|rs-head': 5,
}

test('a run within the limits passes', () => {
  const r = compare('pass', ok)
  assert.equal(r.status, 0)
  assert.equal(r.verdict.pass, true)
  assert.match(r.md, /^# Perf gate: PASS on next2/)
})

test('a fabricated slow cell fails with exit code 1', () => {
  const r = compare('slow', { ...ok, 'lint|prose-32k.crv|rs-head': 20, 'lint|prose-32k.crv|rs-base': 10 })
  assert.equal(r.status, 1)
  assert.deepEqual(r.verdict.failures.map(f => [f.check, f.engine, f.op, f.doc]), [['ratio', 'rs', 'lint', 'prose-32k']])
  assert.match(r.md, /\| ratio \| rs \| lint \| prose-32k \| 20\.0 \| 10\.0 \| 2\.00x \|/)
})

test('a 2 KB cell under minMs reports but does not gate', () => {
  const r = compare('quiet', { ...ok, 'parse|prose-2k.crv|js-head': 0.2, 'parse|prose-2k.crv|js-base': 0.1 })
  assert.equal(r.status, 0)
  assert.match(r.md, /2\.00 \(quiet\)/)
})

test('superlinear growth from 32 to 128 KB fails', () => {
  const r = compare('growth', { ...ok, 'fix|lists-32k.crv|php-head': 10, 'fix|lists-128k.crv|php-head': 80 })
  assert.equal(r.status, 1)
  assert.equal(r.verdict.failures[0].check, 'growth')
  assert.equal(r.verdict.failures[0].value.toFixed(2), '1.50')
})

test('a head error fails unless the baseline errors too', () => {
  const r = compare('err', { ...ok, 'fmt|real-conformance.crv|php-head': 'boom', 'fmt|real-conformance.crv|php-base': 'boom too', 'import|prose-32k.crv|js-head': 'timeout', 'import|prose-32k.crv|js-base': 3 })
  assert.equal(r.status, 1)
  assert.deepEqual(r.verdict.failures.map(f => [f.check, f.engine, f.op]), [['error', 'js', 'import']])
  assert.equal(r.verdict.notes.length, 1)
})

test('the issue dry run names the title and the engine commit range', () => {
  const r = compare('issue', { ...ok, 'lint|prose-32k.crv|rs-head': 20, 'lint|prose-32k.crv|rs-base': 10 })
  const prev = path.join(dir, 'prev.json')
  fs.writeFileSync(prev, JSON.stringify({ pass: true, ref: 'next2', started: '2026-11-19T02:30:00Z', heads: { js: commit('a'), php: commit('d'), rs: commit('e') } }))
  const out = spawnSync(process.execPath, [path.join(H, 'issue.mjs'), '--verdict', r.files.verdict, '--report', r.files.md, '--repo', 'markup-carve/carve-bench', '--previous', prev, '--run-url', 'https://example.invalid/run/1', '--dry-run'],
    { encoding: 'utf8', env: { ...process.env, GH_TOKEN: '', GITHUB_TOKEN: '', PATH: '' } })
  assert.equal(out.status, 0, out.stderr)
  assert.match(out.stdout, /^DRY RUN: would run\n {2}gh issue create --repo markup-carve\/carve-bench --title "Perf gate: regression on next2"/)
  assert.match(out.stdout, /carve-rs: \[`eeeeeeee\.\.\.cccccccc`\]\(https:\/\/github\.com\/markup-carve\/carve-rs\/compare\/e{40}\.\.\.c{40}\)/)
  assert.match(out.stdout, /carve-js: `aaaaaaaa`, unchanged since the last green run/)
  assert.match(out.stdout, /\| ratio \| rs \| lint \| prose-32k \|/)
})
