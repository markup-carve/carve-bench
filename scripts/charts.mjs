// SVG charts from the lane results: horizontal grouped bars with a value on every bar, light and dark surfaces.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const WIDTH = 900
const LABEL_W = 190
const RIGHT_PAD = 70
const BAR_H = 15
const BAR_GAP = 3
const GROUP_GAP = 14
const HEADER_H = 20
const TOP = 78
const FONT = 'font-family="system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif"'

// Slot 1 is the Carve 0.2 accent in every chart; the other slots follow the fixed categorical order.
const STYLE = `<style>
.surface{fill:#fcfcfb}.ink{fill:#0b0b0b}.ink2{fill:#52514e}.grid{stroke:#e4e3df}.ref{stroke:#52514e}
.s1{fill:#2a78d6}.s2{fill:#eb6834}.s3{fill:#1baf7a}.s4{fill:#eda100}.s5{fill:#e87ba4}
@media (prefers-color-scheme: dark){.surface{fill:#1a1a19}.ink{fill:#f0efec}.ink2{fill:#c3c2b7}.grid{stroke:#3a3a37}.ref{stroke:#c3c2b7}
.s1{fill:#3987e5}.s2{fill:#d95926}.s3{fill:#199e70}.s4{fill:#c98500}.s5{fill:#d55181}}
</style>`

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function niceMax(value) {
  const step = 10 ** Math.floor(Math.log10(value))
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * step >= value) return m * step
  return 10 * step
}

function axis(max, plotW, height, unit) {
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max)
  return ticks.map((t) => {
    const x = LABEL_W + (t / max) * plotW
    return `<line class="grid" x1="${x}" x2="${x}" y1="${TOP - 6}" y2="${height - 28}" stroke-width="1"/>` +
      `<text class="ink2" x="${x}" y="${height - 12}" font-size="11" text-anchor="middle">${esc(+t.toPrecision(3))}${unit}</text>`
  }).join('')
}

function legend(series) {
  let x = LABEL_W
  return series.map((s) => {
    const item = `<rect class="${s.cls}" x="${x}" y="50" width="12" height="12" rx="2"/>` +
      `<text class="ink" x="${x + 17}" y="60" font-size="12">${esc(s.label)}</text>`
    x += 30 + s.label.length * 7
    return item
  }).join('')
}

function bars(groups, max, plotW, digits, unit) {
  let y = TOP
  const out = []
  for (const group of groups) {
    out.push(`<text class="ink" x="12" y="${y + 14}" font-size="13" font-weight="600">${esc(group.label)}</text>`)
    y += HEADER_H
    for (const bar of group.bars) {
      const w = Math.max(4, (bar.value / max) * plotW)
      const value = `${bar.value.toFixed(digits)}${unit}`
      out.push(`<text class="ink2" x="${LABEL_W - 8}" y="${y + BAR_H - 3}" font-size="12" text-anchor="end">${esc(bar.name)}</text>`,
        `<path class="${bar.cls}" d="M${LABEL_W},${y}h${w - 3}a3,3 0 0 1 3,3v${BAR_H - 6}a3,3 0 0 1 -3,3h${-(w - 3)}z"><title>${esc(`${group.label}, ${bar.name}: ${value}`)}</title></path>`,
        `<text class="ink" x="${LABEL_W + w + 5}" y="${y + BAR_H - 3}" font-size="12">${esc(value)}</text>`)
      y += BAR_H + BAR_GAP
    }
    y += GROUP_GAP
  }
  return { svg: out.join(''), bottom: y }
}

/** groups: [{ label, bars: [{ name, value, cls }] }], series for the legend (empty for one series). */
export function barChart({ title, subtitle, groups, series, unit = '', digits = 1, reference = null }) {
  const max = niceMax(Math.max(...groups.flatMap((g) => g.bars.map((b) => b.value)), reference ?? 0) * 1.08)
  const plotW = WIDTH - LABEL_W - RIGHT_PAD
  const body = bars(groups, max, plotW, digits, unit)
  const height = body.bottom + 30
  const ref = reference === null ? '' : (() => {
    const x = LABEL_W + (reference / max) * plotW
    return `<line class="ref" x1="${x}" x2="${x}" y1="${TOP - 6}" y2="${height - 28}" stroke-width="2" stroke-dasharray="5 4"/>`
  })()
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" ${FONT} role="img" aria-label="${esc(title)}">
${STYLE}<rect class="surface" width="${WIDTH}" height="${height}" rx="8"/>
<text class="ink" x="12" y="24" font-size="16" font-weight="700">${esc(title)}</text>
<text class="ink2" x="12" y="42" font-size="12">${esc(subtitle)}</text>
${legend(series)}${axis(max, plotW, height, unit)}${ref}${body.svg}
</svg>
`
}

const CLASSES = ['s1', 's2', 's3', 's4', 's5']
const cellOf = (lane, engine, doc, phase) => lane.data.cells.find((c) => c.engine === engine && c.document === doc && c.phase === phase)
const docsOf = (lane) => lane.data.documents.map((d) => d.name)
const MEASURE = { parse: 'parse to tree', html: 'parse plus HTML, normal path' }

function laneChart(lane, phase) {
  const series = lane.data.engines.map((e, at) => ({ id: e.id, label: e.label, cls: CLASSES[at] }))
  const groups = docsOf(lane).map((doc) => ({
    label: doc,
    bars: series.map((s) => {
      const c = cellOf(lane, s.id, doc, phase)
      return { name: s.label, value: c.bytes / c.medianUs, cls: s.cls }
    }),
  }))
  return barChart({ title: `${lane.title}: ${MEASURE[phase]}`, subtitle: `MB/s of each engine's own input (median of ${lane.data.method.rounds} rounds), higher is faster`, groups, series })
}

function ratioChart(lanes) {
  const groups = docsOf(lanes[0]).map((doc) => ({
    label: doc,
    bars: lanes.map((lane) => ({
      name: lane.title,
      value: cellOf(lane, 'carve01', doc, 'html').medianUs / cellOf(lane, 'carve02', doc, 'html').medianUs,
      cls: 's1',
    })),
  }))
  return barChart({ title: 'Carve 0.2 against Carve 0.1: parse plus HTML', subtitle: `Speed ratio of the medians; right of the dashed line at 1x, 0.2 is faster`,
    groups, series: [], unit: 'x', digits: 2, reference: 1 })
}

function enginesChart(lanes) {
  const groups = docsOf(lanes[0]).map((doc) => ({
    label: doc,
    bars: lanes.map((lane) => {
      const c = cellOf(lane, 'carve02', doc, 'html')
      return { name: lane.title, value: c.bytes / c.medianUs, cls: 's1' }
    }),
  }))
  return barChart({ title: 'The Carve 0.2 engines against each other: parse plus HTML', subtitle: `MB/s of the .crv input (median of ${lanes[0].data.method.rounds} rounds), higher is faster`, groups, series: [] })
}

export function writeCharts(lanes, dir) {
  mkdirSync(dir, { recursive: true })
  const written = []
  const put = (name, svg) => {
    writeFileSync(join(dir, name), svg)
    written.push(join(dir, name))
  }
  for (const lane of lanes) {
    put(`${lane.id}-html.svg`, laneChart(lane, 'html'))
    put(`${lane.id}-parse.svg`, laneChart(lane, 'parse'))
  }
  put('carve02-vs-carve01.svg', ratioChart(lanes))
  put('carve02-engines.svg', enginesChart(lanes))
  return written
}
