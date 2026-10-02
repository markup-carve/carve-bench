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
