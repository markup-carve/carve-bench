// Generate accessible SVG charts from the checked-in Markdown result tables.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

function sections(path, valueColumn) {
  const groups = []
  let group = null
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (line.startsWith('## ')) {
      group = { name: line.slice(3), rows: [] }
      groups.push(group)
      continue
    }
    if (!group || !line.startsWith('|') || line.includes('---')) continue
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
    const value = Number(cells[valueColumn])
    if (cells[0] !== 'Engine' && Number.isFinite(value)) group.rows.push({ name: cells[0], value })
  }
  return groups.filter((group) => group.rows.length)
}

function chart(title, subtitle, groups, unit = 'MB/s') {
  const width = 1000
  const left = 245
  const barWidth = 650
  const rowHeight = 34
  const panelGap = 55
  const height = 105 + groups.reduce((sum, group) => sum + 35 + group.rows.length * rowHeight + panelGap, 0)
  const colors = ['#7357d9', '#24a37a', '#e58b25', '#3f88c5']
  const out = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">`,
    `<title id="title">${escape(title)}</title>`, `<desc id="desc">${escape(subtitle)}</desc>`,
    '<style>text{font-family:ui-sans-serif,system-ui,sans-serif;fill:#24292f}.title{font-size:25px;font-weight:700}.sub{font-size:14px;fill:#57606a}.group{font-size:19px;font-weight:650}.label{font-size:14px}.value{font-size:13px;font-weight:650;fill:#24292f}.track{fill:#eaeef2}@media(prefers-color-scheme:dark){text,.value{fill:#f0f6fc}.sub{fill:#8c959f}.track{fill:#30363d}}</style>',
    `<text id="chart-title" class="title" x="24" y="36">${escape(title)}</text>`,
    `<text class="sub" x="24" y="62">${escape(subtitle)}</text>`,
  ]
  let y = 105
  for (const group of groups) {
    const best = Math.max(...group.rows.map((row) => row.value))
    out.push(`<text class="group" x="24" y="${y}">${escape(group.name)}</text>`)
    y += 24
    group.rows.forEach((row, index) => {
      const ratio = row.value / best
      const bar = Math.max(2, ratio * barWidth)
      const cy = y + index * rowHeight
      out.push(`<text class="label" x="${left - 12}" y="${cy + 17}" text-anchor="end">${escape(row.name)}</text>`)
      out.push(`<rect class="track" x="${left}" y="${cy + 4}" width="${barWidth}" height="20" rx="4"/>`)
      out.push(`<rect x="${left}" y="${cy + 4}" width="${bar.toFixed(1)}" height="20" rx="4" fill="${colors[index % colors.length]}"/>`)
      out.push(`<text class="value" x="${left + Math.min(bar + 8, barWidth - 70)}" y="${cy + 19}">${row.value.toFixed(2)} ${unit}</text>`)
    })
    y += group.rows.length * rowHeight + panelGap
  }
  out.push('</svg>')
  return out.join('\n') + '\n'
}

mkdirSync(resolve(root, 'charts'), { recursive: true })
writeFileSync(resolve(root, 'charts/comparison.svg'), chart(
  'Same-language render throughput',
  'Each panel is normalized visually to its fastest engine; labels show absolute MB/s.',
  sections(resolve(root, 'COMPARISON.md'), 3),
))
writeFileSync(resolve(root, 'charts/capabilities.svg'), chart(
  'Enabled core capability breadth',
  'One point per grouped syntax family; this is scope context, not speed normalization.',
  sections(resolve(root, 'COMPARISON.md'), 2),
  'points',
))
writeFileSync(resolve(root, 'charts/full-corpus.svg'), chart(
  'Carve engines on the full spec corpus',
  'Each document-size panel is normalized visually to its fastest engine; labels show absolute MB/s.',
  sections(resolve(root, 'RESULTS.md'), 2),
))
writeFileSync(resolve(root, 'charts/php-tiers.svg'), chart(
  'carve-php extension profile throughput',
  'Internal diagnostic only; competitor comparisons use Tier 1/core.',
  sections(resolve(root, 'FINDINGS.md'), 3).filter((group) => group.name === 'carve-php'),
))
