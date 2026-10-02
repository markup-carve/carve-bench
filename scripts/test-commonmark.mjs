import assert from 'node:assert/strict'
import { test } from 'node:test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { coreSources, coreProjection } from '../engines/js/commonmark-core.mjs'

test('shared native syntax produces equivalent HTML through all public APIs', () => {
  const directory = mkdtempSync(resolve(tmpdir(), 'commonmark-control-'))
  try {
    for (const [flavor, name] of [['carve', 'carve.crv'], ['djot', 'djot.dj'], ['markdown', 'markdown.md']]) assert.equal(readFileSync(`corpus/commonmark-core/${name}`, 'utf8'), coreSources()[flavor])
    const sources = coreSources(2)
    const environment = { ...process.env, CARVE_COMPARE_OBSERVE: '1' }
    delete environment.CARVE_JS
    const render = (engine, source) => {
      const file = resolve(directory, 'input')
      writeFileSync(file, source)
      return JSON.parse(execFileSync(process.execPath, ['engines/js/compare.mjs', engine, file, '1', '1'], {
        encoding: 'utf8', env: environment,
      })).html
    }
    const baseline = render('commonmark.js', sources.markdown)
    for (const [engine, flavor] of [['carve-js', 'carve'], ['djot.js', 'djot'], ['markdown-it', 'markdown'], ['commonmark.js-fresh', 'markdown']]) {
      assert.deepEqual(coreProjection(render(engine, sources[flavor])), coreProjection(baseline), engine)
    }
    const table = '| a | b |\n| --- | --- |\n| c | d |\n'
    assert.doesNotMatch(render('commonmark.js', table), /<table>/)
    assert.match(render('markdown-it', table), /<table>/)
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

test('projection retains meaningful inline semantics and exact code bytes', () => {
  for (const [left, right] of [
    ['<li><strong>a</strong> <em>b</em></li>', '<li><strong>a</strong><em>b</em></li>'],
    ['<p>has <strong>x</strong></p>', '<p>has<strong>x</strong></p>'],
    ['<p><em>x</em></p>', '<p><strong>x</strong></p>'],
    ['<a href="/a">x</a>', '<a href="/b">x</a>'],
    ['<pre><code>a  b\n</code></pre>', '<pre><code>a b\n</code></pre>'],
    ['<code class="language-js">x</code>', '<code class="language-rs">x</code>'],
  ]) assert.notDeepEqual(coreProjection(left), coreProjection(right))
})


test('published shared-workload samples retain measured source and harness provenance', async () => {
  const { createHash } = await import('node:crypto')
  const sha = value => createHash('sha256').update(value).digest('hex')
  const record = JSON.parse(readFileSync('reports/commonmark-js.json', 'utf8'))
  const { sections } = await import('./site/build.mjs')
  const tables = sections(readFileSync('reports/commonmark-js.md', 'utf8'))
  const shared = tables.find(group => group.title === 'Reused public conversion APIs').tables[0]
  for (const row of shared.rows) {
    const measured = record.rounds.map(round => round.rows.find(item => item.engine === row[0]))
    assert.deepEqual(row.slice(1), [String(measured[0].bytes), ...measured.map(item => item.mb_per_s.toFixed(2))])
  }
  const constructor = tables.find(group => group.title === 'CommonMark constructor control').tables[0]
  for (const [index, engine] of ['commonmark.js', 'commonmark.js-fresh'].entries()) {
    assert.deepEqual(constructor.rows[index].slice(1), record.rounds.map(round => round.rows.find(item => item.engine === engine).ms_per_op.toFixed(4)))
  }
  assert.equal(record.schema, 1)
  assert.equal(record.metadata.workload_points, 14)
  for (const [file, hash] of Object.entries(record.metadata.harness_sha256)) assert.equal(sha(readFileSync(file)), hash, file)
  assert.equal(sha(readFileSync('engines/js/package-lock.json')), record.metadata.lock_sha256)
  assert.deepEqual(record.rounds[1].order, [...record.rounds[0].order].reverse())
  const expected = ['carve-js', 'commonmark.js', 'commonmark.js-fresh', 'djot.js', 'markdown-it']
  assert.deepEqual(record.controls.map(row => row.engine).sort(), expected)
  assert.equal(new Set(record.controls.map(row => row.projection_sha256)).size, 1)
  for (const round of record.rounds) {
    assert.deepEqual(round.rows.map(row => row.engine).sort(), expected)
    for (const row of round.rows) {
      assert.equal(row.samples.length, row.trials)
      assert.ok(row.samples.every(sample => sample > 0))
      assert.equal(row.ms_per_op, Math.min(...row.samples))
      const control = record.controls.find(item => item.engine === row.engine)
      assert.equal(row.source_sha256, control.source_sha256)
      assert.equal(row.output_sha256, control.output_sha256)
    }
  }
})
