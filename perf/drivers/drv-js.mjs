// JS driver: node drv-js.mjs <api 0.1|0.2> <dist dir> <corpus dir>
// Reads JSON lines {op,file,reps,warm} on stdin and answers {ns:[...]} or {err} per line.
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
const [api, dist, corpus] = process.argv.slice(2)
const cache = new Map()
const read = f => { if (!cache.has(f)) cache.set(f, fs.readFileSync(path.join(corpus, f), 'utf8')); return cache.get(f) }
const load = name => import(path.join(path.resolve(dist), name))
let ops
if (api === '0.2') {
  const m = await load('index.js')
  const x = await load('extensions.js')
  const imp = await load('import.js')
  const tabs = { extensions: m.tabsExtensions, renderers: { 'carve.tabs': x.standardTabsRenderer() } }
  const bundle = x.withExtensions(x.codeGroup(), x.mathBlock(), x.mermaid(), x.details(), x.spoiler(), x.citations(),
    x.wikilinks(), { extensions: x.imgFenceExtensions, renderers: x.imgFenceRenderers }, tabs)
  const { transforms, ...extOpts } = bundle
  const resolver = req => {
    try { return { text: read(req.path), id: req.path } } catch { return { error: 'not_found' } }
  }
  ops = {
    parse: s => m.parse(s),
    render: s => m.render(s),
    ext: s => transforms && transforms.length ? m.renderWithDocumentTransforms(s, transforms, extOpts) : m.render(s, extOpts),
    lint: s => m.lint(s),
    fmt: s => m.format(s),
    fix: s => m.fix(s),
    import: s => imp.importDocument(s, { from: 'html' }),
    include: s => m.render(s, { includes: { resolver, file: 'entry.crv' } }),
  }
} else if (api === '0.1') {
  const m = await load('index.js')
  ops = {
    parse: s => m.resolve(m.parse(s)),
    render: s => m.carveToHtml(s),
    lint: s => m.lintCarve(s),
    fmt: s => m.carveToCarve(s),
    import: s => m.htmlToCarve(s),
  }
} else {
  throw new Error(`unknown api ${api}`)
}
const rl = readline.createInterface({ input: process.stdin })
for await (const line of rl) {
  const { op, file, reps, warm = 0 } = JSON.parse(line)
  const f = ops[op]
  if (!f) { console.log(JSON.stringify({ err: 'unsupported' })); continue }
  try {
    const s = read(file)
    for (let i = 0; i < warm; i++) f(s)
    const ns = []
    for (let i = 0; i < reps; i++) { const t = process.hrtime.bigint(); f(s); ns.push(Number(process.hrtime.bigint() - t)) }
    console.log(JSON.stringify({ ns }))
  } catch (e) { console.log(JSON.stringify({ err: String(e && e.message || e).slice(0, 200) })) }
}
