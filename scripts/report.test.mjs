import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { writeCharts } from './charts.mjs'
import { ratio, summary } from './report.mjs'

const counts = { p: 10, li: 4, 'h1-h6': 2, a: 3, 'td/th': 0, code: 1 }

function lane(id, title, carve01Us) {
  const cells = ['parse', 'html'].flatMap((phase) => [
    { engine: 'carve02', document: 'doc', phase, bytes: 1000, medianUs: 100, minUs: 90 },
    { engine: 'carve01', document: 'doc', phase, bytes: 1000, medianUs: carve01Us, minUs: carve01Us },
    { engine: 'peer', document: 'doc', phase, bytes: 1200, medianUs: 50, minUs: 45 },
  ])
  return {
    id, title,
    data: {
      runtime: 'test', method: { rounds: 15 },
      engines: [{ id: 'carve02', label: 'Carve 0.2' }, { id: 'carve01', label: 'Carve 0.1' }, { id: 'peer', label: 'Peer' }],
      documents: [{ name: 'doc' }], cells,
      verify: [{ document: 'doc', carve01: counts, carve02: { ...counts, p: 8 } }],
      load: { start: { loadavg: [1, 1, 1] }, end: { loadavg: [1, 1, 1] } },
    },
  }
}

const env = { startedAt: 's', finishedAt: 'f', cpu: 'cpu', cores: 1, kernel: 'k', node: 'v', php: 'p', rustc: 'r', benchCommit: 'c', engines: {}, loadAtStart: [1], loadAtEnd: [1] }

test('the ratio is 0.1 time over 0.2 time', () => {
  assert.equal(ratio(lane('js', 'JavaScript', 250), 'doc', 'html'), 2.5)
  assert.equal(ratio(lane('rust', 'Rust', 50), 'doc', 'parse'), 0.5)
})

test('the summary says when 0.1 and 0.2 do not agree, and gives the load', () => {
  const text = summary([lane('js', 'JavaScript', 250)], env)
  assert.match(text, /\*\*does not agree\*\* \(largest difference 20\.0%\)/)
  assert.match(text, /Load average at start/)
  assert.match(text, /\| Peer \| 24\.0 \|/)
})

test('every chart labels its bars and draws Carve 0.2 in the accent slot', () => {
  const dir = mkdtempSync(join(tmpdir(), 'carve-bench-charts-'))
  const files = writeCharts([lane('js', 'JavaScript', 250), lane('rust', 'Rust', 50)], dir)
  assert.equal(files.length, 6)
  const html = readFileSync(join(dir, 'js-html.svg'), 'utf8')
  assert.match(html, /<path class="s1"[^>]*><title>doc, Carve 0\.2: 10\.0<\/title>/)
  assert.match(html, />24\.0</)
  assert.match(readFileSync(join(dir, 'carve02-vs-carve01.svg'), 'utf8'), />0\.50x</)
})
