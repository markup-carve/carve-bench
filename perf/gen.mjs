// Corpus generator: node perf/gen.mjs <outDir> <baseline js dist dir>
// Writes the generated shapes at every configured size, the include parts, the committed real
// documents, and html/<name>.html for every document (rendered by the pinned baseline, so the
// import input is the same on every run).
import fs from 'node:fs'
import path from 'node:path'
const H = path.dirname(new URL(import.meta.url).pathname)
const [OUT, baseDist] = process.argv.slice(2)
if (!OUT || !baseDist) throw new Error('usage: gen.mjs <outDir> <baseline js dist dir>')
const config = JSON.parse(fs.readFileSync(path.join(H, 'config.json'), 'utf8'))
fs.mkdirSync(path.join(OUT, 'parts'), { recursive: true })
fs.mkdirSync(path.join(OUT, 'html'), { recursive: true })
const BT = '`'
const words = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho sigma tau upsilon'.split(' ')
const w = (i, n) => Array.from({ length: n }, (_, k) => words[(i * 7 + k * 3) % words.length]).join(' ')
function fill(unit, kb, head = '') {
  const target = kb * 1024
  let s = head, i = 0
  while (Buffer.byteLength(s) < target) s += unit(i++)
  return s
}
const shapes = {
  nesting: i => `> - item ${i} ${w(i, 4)}\n>\n>   > ::: note\n>   > para *strong ${i}* and _em_ text\n>   >\n>   > 1. inner ${w(i, 3)}\n>   >\n>   >    - deeper ${BT}code ${i}${BT}\n>   > :::\n\n`,
  links: i => `Para ${i} with [link ${i}](https://example.com/p/${i}) and [ref ${i}][r${i}] then <https://auto.example/${i}> and ${w(i, 5)}.\n\n[r${i}]: https://example.org/r/${i}\n\n`,
  lists: i => `- item ${i} ${w(i, 6)} *em* ${BT}c${i}${BT}\n${i % 5 === 0 ? `  - nested ${w(i, 3)}\n  - nested two\n` : ''}`,
  chat: i => `### ${i % 2 ? 'Assistant' : 'User'}\n\n${w(i, 12)}, see ${BT}fn_${i}()${BT} and *note* this.\n\n${i % 3 === 0 ? BT.repeat(3) + 'js\nconst x' + i + ' = compute(' + i + ')\nconsole.log(x' + i + ')\n' + BT.repeat(3) + '\n\n' : ''}${i % 4 === 1 ? `- step one ${w(i, 3)}\n- step two\n- step three\n\n` : ''}`,
  prose: i => `## Section ${i}\n\n${w(i, 30)}. ${w(i + 1, 25)} with *strong*, _emphasis_, ${BT}code${BT} and a [link](https://example.com/${i}).\n\n`,
}
const docs = []
const write = (name, text) => { fs.writeFileSync(path.join(OUT, name), text); if (!name.startsWith('includes-')) docs.push(name) }
let maxParts = 0
for (const kb of config.run.sizes) {
  for (const [name, unit] of Object.entries(shapes)) write(`${name}-${kb}k.crv`, fill(unit, kb))
  write(`table-${kb}k.crv`, fill(i => `| r${i} | ${w(i, 2)} | *v${i}* | ${BT}c${BT} |\n`, kb, '|= Key |= Name |= Value |= Code |\n'))
  let n = 0
  let s = fill(i => { n = i + 1; return `Claim ${i} ${w(i, 4)}[^n${i}].\n\n` }, kb * 0.6)
  for (let i = 0; i < n; i++) s += `[^n${i}]: Note ${i} ${w(i, 3)}.\n\n`
  write(`footnotes-${kb}k.crv`, s)
  const nParts = Math.max(1, Math.round(kb))
  maxParts = Math.max(maxParts, nParts)
  let entry = ''
  for (let p = 0; p < nParts; p++) entry += `## Part ${p}\n\n{{ parts/p${p}.crv }}\n\n`
  write(`includes-${kb}k.crv`, entry)
}
for (let p = 0; p < maxParts; p++) fs.writeFileSync(path.join(OUT, 'parts', `p${p}.crv`), fill(i => `Part ${p} line ${i} ${w(i + p, 10)} *x*.\n\n`, 1))
const REAL = path.join(H, 'corpus/real')
for (const f of fs.readdirSync(REAL).filter(f => f.endsWith('.crv')).sort()) write(`real-${f}`, fs.readFileSync(path.join(REAL, f), 'utf8'))
const m = await import(path.join(path.resolve(baseDist), 'index.js'))
const toHtml = config.baseline.api === '0.1' ? s => m.carveToHtml(s) : s => m.render(s)
for (const f of docs) fs.writeFileSync(path.join(OUT, 'html', f.replace(/\.crv$/, '.html')), toHtml(fs.readFileSync(path.join(OUT, f), 'utf8')))
console.log(`corpus: ${docs.length} documents in ${OUT}`)
