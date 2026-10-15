import {families, sizesFor} from './fixtures.mjs'
import {provenance} from './provenance.mjs'
import fs from 'node:fs'
import os from 'node:os'
import { createHash } from 'node:crypto'
import { performance } from 'node:perf_hooks'
import { parseFragment } from '../../engines/js/node_modules/parse5/dist/index.js'
const manifest = JSON.parse(fs.readFileSync(process.argv[2]))
const metadata = provenance(manifest, 'js')
const {parse, renderHTML} = await import(manifest.native.module)
const output = process.argv[3]
if (!output) throw new Error('Usage: node scripts/djot-growth/js.mjs <config.json> <output.json>')
const engines = await Promise.all(['release', 'main'].map(label => import(manifest[label].module)))
const sha = text => createHash('sha256').update(text).digest('hex')
const shape = html => {
 const result = [], pending = [[parseFragment(html), 0]]
 while (pending.length) {
  const [node, depth] = pending.pop()
  if ('value' in node) { const text = node.value.replace(/[\t\r\n ]+/g, ' ').trim(); if (text) result.push(['text', depth, text]); }
  else if (node.nodeName !== '#document-fragment') result.push([node.nodeName, depth, (node.attrs ?? []).filter(a => !['data-delim','aria-label','data-task-state'].includes(a.name)).map(a => [a.name, a.value]).sort()])
  for (const child of [...(node.childNodes ?? [])].reverse()) pending.push([child, depth + Number(node.nodeName !== '#document-fragment')])
 }
 return JSON.stringify(result)
}

const results = []
for (const [family, make] of Object.entries(families).filter(([name]) => !manifest.onlyFamilies || manifest.onlyFamilies.includes(name))) {
 const sizes = sizesFor(family)
 for (const size of sizes) {
  const source = make(size), converted = engines.map(e => e.djotToCarve(source)), html = converted.map((s,i) => engines[i].carveToHtml(s))
  const native = renderHTML(parse(source)), equivalence = html.map(s => shape(s) === shape(native))
  for (const operation of ['import','render']) {
   const tasks = engines.map((e,i) => operation === 'import' ? () => e.djotToCarve(source) : () => e.carveToHtml(converted[i]))
   const samples = [[],[]], iterations = []
   for (let i=0;i<2;i++) {
    let runs=0; const start=performance.now(); do { tasks[i](); runs++ } while(performance.now()-start<500)
    iterations[i] = Math.max(1,Math.min(1000,Math.ceil(50*runs/(performance.now()-start))))
   }
   for(let round=0;round<7;round++) for(const i of round%2 ? [1,0] : [0,1]) {
    const start=performance.now(); for(let k=0;k<iterations[i];k++) tasks[i](); samples[i].push((performance.now()-start)/iterations[i])
   }
   const row = {family,size,operation,sourceBytes:Buffer.byteLength(source),sourceSha256:sha(source),outputBytes:converted.map(s=>Buffer.byteLength(s)),outputSha256:converted.map(sha),htmlSha256:html.map(sha),nativeEquivalent:equivalence,betweenRevisionsEquivalent:shape(html[0])===shape(html[1]),iterations,samples,medianMs:samples.map(s=>[...s].sort((a,b)=>a-b)[3]),hostLoad:os.loadavg()}
   row.comparisonEligible=row.nativeEquivalent.every(Boolean)&&row.betweenRevisionsEquivalent&&row.outputSha256[0]===row.outputSha256[1]; results.push(row); fs.writeFileSync(output,JSON.stringify({metadata,measuredAt:new Date().toISOString(),node:process.version,manifest,nativeCommit:manifest.native.commit,warmupMilliseconds:500,samples:7,results},null,2)+'\n')
   process.stderr.write(`${family} ${size} ${operation}: native=${equivalence.join('/')} revisions=${row.betweenRevisionsEquivalent}\n`)
  }
 }
}
