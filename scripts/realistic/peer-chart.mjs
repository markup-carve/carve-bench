import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const data = JSON.parse(readFileSync(resolve(root, 'reports/realistic-peer.json')))
assert.equal(data.schema, 1)
const median = values => {
  const sorted = [...values].sort((a, b) => a - b)
  return (sorted[(sorted.length - 1) >> 1] + sorted[sorted.length >> 1]) / 2
}
const documents = ['terms', 'case-study-parsing-ast', 'spec-history']
const labels = ['Terms', 'Parsing & AST', 'Spec history']
const panels = [
  ['js', 'JavaScript', ['carve-js', 'djot.js', 'markdown-it', 'commonmark.js']],
  ['php', 'PHP', ['carve-php', 'djot-php', 'league/commonmark-gfm']],
  ['rs', 'Rust', ['carve-rs', 'jotdown', 'comrak', 'pulldown-cmark']],
]
const colors = ['#168354', '#355fc8', '#bd661e', '#914ab3']
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const width = 1120
const height = 1240
const x = [280, 590, 900]
const svg = [`<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc" viewBox="0 0 ${width} ${height}">`,
  '<title id="title">Carve AST conversion on authored documents against peer libraries</title>',
  `<desc id="desc">Three runtime panels compare peer speed relative to Carve on three authored documentation files. Each point is the median of ${data.rounds} paired round ratios from ${data.sessions.length} recorded sessions. Higher means the peer used less process CPU time. All Carve conversions used the AST route.</desc>`,
  '<style>text{font-family:system-ui,sans-serif;fill:#1d2732}.bg{fill:#fff}.grid{stroke:#dce3e9}.axis{stroke:#687889}.title{font-size:26px;font-weight:700}.panel{font-size:21px;font-weight:700}.label{font-size:15px}.note{font-size:14px;fill:#526273}.line{fill:none;stroke-width:3}.dot{stroke:#fff;stroke-width:2}@media(prefers-color-scheme:dark){text{fill:#edf3f8}.bg{fill:#0e1520}.grid{stroke:#354252}.axis{stroke:#a6b4c3}.note{fill:#a6b4c3}.dot{stroke:#0e1520}}</style>',
  '<rect class="bg" width="100%" height="100%"/>',
  '<text x="42" y="45" class="title">Carve AST conversion on authored documents</text>',
  '<text x="42" y="70" class="note">Median paired speed relative to Carve (1×). Higher means less CPU time. Whiskers show round range.</text>']

function ratios(language, engine, document) {
  const carveName = { js: 'carve-js', php: 'carve-php', rs: 'carve-rs' }[language]
  const carve = data.rows.find(item => item.document === document && item.engine === carveName)
  const peer = data.rows.find(item => item.document === document && item.engine === engine)
  assert.ok(carve && peer)
  return carve.round_median_cpu_ms.map((value, index) => value / peer.round_median_cpu_ms[index])
}

for (const [panelIndex, [language, title, engines]] of panels.entries()) {
  const top = 120 + panelIndex * 370
  const bottom = top + 260
  const y = value => bottom - (Math.log2(value) + 1) / 5 * (bottom - top)
  svg.push(`<text x="42" y="${top - 23}" class="panel">${title}</text>`)
  let legendX = 205
  for (const [index, engine] of engines.entries()) {
    svg.push(`<line x1="${legendX}" y1="${top - 31}" x2="${legendX + 18}" y2="${top - 31}" stroke="${colors[index]}" stroke-width="4"/>`)
    svg.push(`<text x="${legendX + 24}" y="${top - 26}" class="label">${escape(engine)}</text>`)
    legendX += engine.length * 8.4 + 50
  }
  for (const value of [0.5, 1, 2, 4, 8, 16]) {
    const yy = y(value)
    svg.push(`<line class="grid" x1="155" y1="${yy.toFixed(1)}" x2="1005" y2="${yy.toFixed(1)}"/>`)
    svg.push(`<text x="145" y="${(yy + 5).toFixed(1)}" text-anchor="end" class="note">${value}×</text>`)
  }
  svg.push(`<line class="axis" x1="155" y1="${bottom}" x2="1005" y2="${bottom}"/>`)
  documents.forEach((document, index) => {
    svg.push(`<text x="${x[index]}" y="${bottom + 25}" text-anchor="middle" class="label">${escape(labels[index])}</text>`)
  })
  for (const [index, engine] of engines.entries()) {
    const points = documents.map((document, docIndex) => {
      const values = ratios(language, engine, document)
      assert.ok(values.every(value => value >= 0.5 && value <= 16), `${engine}: speed ratio outside chart scale`)
      return [x[docIndex], y(median(values)), y(Math.min(...values)), y(Math.max(...values))]
    })
    svg.push(`<polyline class="line" stroke="${colors[index]}" points="${points.map(point => point.slice(0, 2).map(value => value.toFixed(1)).join(',')).join(' ')}"/>`)
    points.forEach(point => {
      if (engine !== engines[0]) svg.push(`<line x1="${point[0]}" y1="${point[2].toFixed(1)}" x2="${point[0]}" y2="${point[3].toFixed(1)}" stroke="${colors[index]}" stroke-width="2" opacity=".65"/>`)
      svg.push(`<circle class="dot" fill="${colors[index]}" cx="${point[0]}" cy="${point[1].toFixed(1)}" r="6"/>`)
    })
  }
}
svg.push('</svg>')
writeFileSync(resolve(root, 'charts/realistic-peer-cpu.svg'), svg.join('\n') + '\n')
console.log('Wrote charts/realistic-peer-cpu.svg')
