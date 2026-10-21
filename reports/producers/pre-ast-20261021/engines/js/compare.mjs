import { readFileSync } from 'node:fs'
import MarkdownIt from 'markdown-it'
import * as commonmark from 'commonmark'
import { createHash } from 'node:crypto'
import { parse as parseDjot, renderHTML as renderDjot } from '@djot/djot'
import { describeCarveSource } from './carve-src.mjs'

const [engine, docPath, iterationsArg = '100', trialsArg = '5'] = process.argv.slice(2)
const iterations = Number(iterationsArg)
const trials = Number(trialsArg)
const source = readFileSync(docPath, 'utf8')
const bytes = Buffer.byteLength(source)
const markdown = new MarkdownIt()
const cmParser = new commonmark.Parser()
const cmRenderer = new commonmark.HtmlRenderer()
const carveSpec = process.env.CARVE_JS ?? '@markup-carve/carve'
const carveResolved = safeResolve(carveSpec)
const carveModule = await import(carveSpec)

const renderers = {
  'carve-js': () => carveModule.carveToHtml(source),
  'djot.js': () => renderDjot(parseDjot(source)),
  'markdown-it': () => markdown.render(source),
  'commonmark.js': () => cmRenderer.render(cmParser.parse(source)),
  'commonmark.js-fresh': () => new commonmark.HtmlRenderer().render(new commonmark.Parser().parse(source)),
}
const render = renderers[engine]
if (!render) throw new Error(`unknown engine: ${engine}`)
const html = process.env.CARVE_COMPARE_OBSERVE === '1' ? render() : null
const sha256 = text => createHash('sha256').update(text).digest('hex')
for (let i = 0; i < Number(process.env.CARVE_COMPARE_WARMUP ?? 20); i++) render()
const samples = []
for (let trial = 0; trial < trials; trial++) {
  const start = process.hrtime.bigint()
  for (let i = 0; i < iterations; i++) render()
  samples.push(Number(process.hrtime.bigint() - start) / 1e6 / iterations)
}
const min = Math.min(...samples)
console.log(JSON.stringify({
  engine,
  source_sha256: sha256(source),
  output_sha256: sha256(html ?? render()),
  ...(process.env.CARVE_COMPARE_OBSERVE === '1' ? { html } : {}),
  bytes,
  iterations,
  trials,
  samples,
  ms_per_op: min,
  mb_per_s: bytes / 1048576 / (min / 1000),
  // Only the Carve row carries this; on a peer row it would name an engine
  // that did not produce the number.
  ...(engine === 'carve-js' ? { carve_source: describeCarveSource(carveSpec, carveResolved) } : {}),
}))

// import.meta.resolve throws on a specifier it cannot map; the import above
// reports that far better than this would, so leave it to fail there.
function safeResolve(specifier) {
  try {
    return import.meta.resolve(specifier)
  } catch {
    return null
  }
}
