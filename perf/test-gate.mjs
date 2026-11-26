// node --test perf/test-gate.mjs: the verdict fails on each check it claims, the issue step's dry run,
// and bench-cells' subset selection and verdict.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { OPS, cells, shape, verdict } from './gate.mjs'
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

test('a head crash, panic or timeout fails; a refusal is only reported', () => {
  const r = compare('err', { ...ok, 'fmt|real-conformance.crv|php-head': 'ImportInputError: nesting', 'fmt|real-conformance.crv|php-base': 2, 'import|prose-32k.crv|js-head': 'timeout', 'import|prose-32k.crv|js-base': 3, 'render|prose-32k.crv|rs-head': 'panic' })
  assert.equal(r.status, 1)
  assert.deepEqual(r.verdict.failures.map(f => [f.check, f.engine, f.op]), [['error', 'rs', 'render'], ['error', 'js', 'import']])
  assert.deepEqual(r.verdict.notes, ['php fmt conformance: head errors, baseline does not (ImportInputError: nesting)'])
})

test('growth the baseline shares does not gate', () => {
  const r = compare('shared-growth', { ...ok, 'fix|lists-32k.crv|php-head': 10, 'fix|lists-128k.crv|php-head': 80, 'fix|lists-32k.crv|php-base': 20, 'fix|lists-128k.crv|php-base': 200 })
  assert.equal(r.status, 0)
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

test('bench-cells selects the cells the nightly runs for the chosen ops and documents', () => {
  const files = ['includes-2k.crv', 'real-conformance.crv', 'table-2k.crv', 'table-128k.crv', 'prose-2k.crv']
  assert.deepEqual(cells(files, { ops: ['fmt', 'import', 'include'], docs: ['table', 'includes'] }).map(c => `${c.op}|${c.file}`),
    ['include|includes-2k.crv', 'fmt|table-128k.crv', 'import|html/table-128k.html', 'fmt|table-2k.crv', 'import|html/table-2k.html'])
  assert.deepEqual(cells(files, { docs: ['conformance'] }).map(c => c.op), OPS.filter(o => o !== 'include'))
  assert.equal(cells(files).length, 2 + 4 * 7)
})

test('a subset run gets the full run\'s verdict for its cells', () => {
  const files = ['table-2k.crv', 'table-32k.crv', 'table-128k.crv', 'nesting-32k.crv', 'nesting-128k.crv', 'prose-2k.crv', 'real-conformance.crv']
  const full = {}
  let i = 0
  for (const c of cells(files)) for (const e of ['js', 'php', 'rs']) {
    // Deterministic spread: some cells over the ratio limit, quiet 2 KB cells, superlinear growth, one crash.
    const base = /128k/.test(c.src) ? 40 : /32k/.test(c.src) ? 10 : /-2k/.test(c.src) ? 0.3 : 3
    const head = base * [0.9, 1.05, 1.3, 1.6][(i++) % 4] * (c.op === 'fix' && /128k/.test(c.src) ? 1.8 : 1)
    full[`${c.op}|${c.src}|${e}-base`] = base
    full[`${c.op}|${c.src}|${e}-head`] = c.op === 'lint' && e === 'php' && /conformance/.test(c.src) ? 'panic' : head
  }
  const all = JSON.parse(fs.readFileSync(runFile('full', full), 'utf8'))
  const whole = verdict(all)
  assert.ok(['ratio', 'growth', 'error'].every(k => whole.failures.some(f => f.check === k)))
  const pick = [['js', ['fix', 'fmt'], ['nesting', 'table']], ['php', ['lint'], ['conformance', 'prose']], ['rs', undefined, ['table']], ['js', ['import'], undefined]]
  for (const [engine, ops, docs] of pick) {
    const keys = new Set(cells(files, { ops, docs }).map(c => `${c.op}|${c.src}|`))
    const sub = { ...all, cells: Object.fromEntries(Object.entries(all.cells).filter(([k]) => keys.has(k.replace(/[^|]*$/, '')) && k.split('|')[2].startsWith(`${engine}-`))) }
    const inSub = f => f.engine === engine && (!ops || ops.includes(f.op)) && (!docs || docs.includes(shape(f.doc.replace(/-\{32,128\}k$/, '-32k'))))
    const got = verdict(sub)
    assert.deepEqual(got.failures, whole.failures.filter(inSub), `${engine} ${ops} ${docs}`)
    assert.ok(got.failures.length > 0, `${engine} ${ops} ${docs} exercises a failure`)
    assert.equal(got.pass, got.failures.length === 0)
  }
})
