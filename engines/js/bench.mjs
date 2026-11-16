// JavaScript lane: Carve 0.2, Carve 0.1 on its tree route, and the Markdown and Djot peers, parse and parse plus HTML.
//   node engines/js/bench.mjs --docs DIR --out FILE [--rounds 15] [--sample-ms 200]
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import MarkdownIt from 'markdown-it'
import * as commonmark from 'commonmark'
import * as djot from '@djot/djot'

const ROOT = join(import.meta.dirname, '../..')
const CARVE_JS = join(ROOT, '.engines/carve-js')

function option(name, fallback) {
  const at = process.argv.indexOf(`--${name}`)
  return at >= 0 ? process.argv[at + 1] : fallback
}

function packageVersion(dir) {
  return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).version
}

const v2 = await import(pathToFileURL(join(CARVE_JS, 'v2/src/index.ts')).href)
const v1 = await import(pathToFileURL(join(CARVE_JS, 'dist/index.js')).href)
const v1Fast = await import(pathToFileURL(join(CARVE_JS, 'dist/fast-html.js')).href)
const pins = JSON.parse(readFileSync(join(ROOT, 'pins.json'), 'utf8'))

function engines() {
  const md = new MarkdownIt()
  const cmParser = new commonmark.Parser()
  const cmRenderer = new commonmark.HtmlRenderer()
  const nm = (name) => packageVersion(join(import.meta.dirname, 'node_modules', name))
  const carveVersion = packageVersion(CARVE_JS)
  const commit = pins['carve-js'].commit
  // 0.1 normal path: parse, resolve, renderHtml. carveToHtml would try tryFastHtml and tryFastAstDocument first.
  // Positions for the HTML follow carveToHtml's own rule (on only when the source holds an image).
  const v1Tree = (src) => v1.resolve(v1.parse(src))
  const v1Html = (src) => v1.renderHtml(v1.resolve(v1.parse(src, { positions: src.includes('![') })))
  return [
    { id: 'carve02', label: 'Carve 0.2', version: `0.2 (v2/src, ${carveVersion} repo)`, commit, lang: 'crv',
      parse: (src) => v2.parse(src), html: (src) => v2.render(src) },
    { id: 'carve01', label: 'Carve 0.1', version: carveVersion, commit, lang: 'crv', parse: v1Tree, html: v1Html },
    { id: 'markdown-it', label: 'markdown-it (token list)', version: nm('markdown-it'), lang: 'md',
      parse: (src) => md.parse(src, {}), html: (src) => md.render(src) },
    { id: 'commonmark.js', label: 'commonmark.js', version: nm('commonmark'), lang: 'md',
      parse: (src) => cmParser.parse(src), html: (src) => cmRenderer.render(cmParser.parse(src)) },
    { id: 'djot.js', label: 'djot.js', version: nm('@djot/djot'), lang: 'dj',
      parse: (src) => djot.parse(src), html: (src) => djot.renderHTML(djot.parse(src)) },
  ]
}

const ELEMENTS = [
  ['p', /<p[\s>]/g], ['li', /<li[\s>]/g], ['h1-h6', /<h[1-6][\s>]/g], ['a', /<a\s/g], ['td/th', /<t[dh][\s>]/g],
  ['code', /<code[\s>]/g],
]

function counts(html) {
  return Object.fromEntries(ELEMENTS.map(([name, pattern]) => [name, html.match(pattern)?.length ?? 0]))
}

function firstText(node) {
  if (node === null || typeof node !== 'object') return null
  if (node.type === 'text' && typeof node.value === 'string') return node
  for (const child of node.children ?? []) {
    const found = firstText(child)
    if (found !== null) return found
  }
  return null
}

// An input that carveToHtml serves from its fast path: the tree route must still render an edit made to the tree.
function routeProof() {
  const src = '# Title\n\nHello *world*.\n'
  const tree = v1.resolve(v1.parse(src))
  const text = firstText(tree)
  if (text === null) throw new Error('Carve 0.1: no text node in the parsed tree')
  const before = v1.renderHtml(tree)
  text.value = 'TREE-ROUTE'
  const after = v1.renderHtml(tree)
  return {
    engine: 'Carve 0.1 (JavaScript)',
    input: src,
    fastPathWouldServeInput: v1Fast.tryFastHtml(src, {}) !== undefined,
    treeRouteHtml: before,
    treeRouteHtmlAfterTreeEdit: after,
    builtFromTree: after.includes('TREE-ROUTE') && before === v1.carveToHtml(src),
  }
}

const docsDir = option('docs', join(ROOT, 'build/documents'))
const names = readFileSync(join(docsDir, 'list.txt'), 'utf8').split('\n').filter(Boolean)
const source = (name, lang) => readFileSync(join(docsDir, `${name}.${lang}`), 'utf8')

const all = engines()
const verify = names.map((name) => {
  const src = source(name, 'crv')
  return { document: name, carve01: counts(all[1].html(src)), carve02: counts(all[0].html(src)) }
})

const { measure } = await import('./measure.mjs')
const result = measure({
  engines: all, names, source, rounds: Number(option('rounds', '15')), sampleMs: Number(option('sample-ms', '200')),
})
result.language = 'JavaScript'
result.runtime = `Node ${process.version}`
result.verify = verify
result.route = routeProof()
writeFileSync(option('out', join(ROOT, 'results/js.json')), JSON.stringify(result, null, 2) + '\n')
