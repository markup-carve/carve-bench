import {launchWorker} from './worker.mjs'
import {families, sizesFor} from './fixtures.mjs'
import assert from 'node:assert/strict'
import {resolve} from 'node:path'
import {provenance} from './provenance.mjs'
import fs from 'node:fs'
import os from 'node:os'
import {createHash} from 'node:crypto'
import {parseFragment} from '../../engines/js/node_modules/parse5/dist/index.js'
const manifest=JSON.parse(fs.readFileSync(process.argv[2]))
const metadata = provenance(manifest, 'php')
const {parse, renderHTML} = await import(manifest.native.module)
const output = process.argv[3]
if (!output) throw new Error('Usage: node scripts/djot-growth/php.mjs <config.json> <output.json>')
const sha=s=>createHash('sha256').update(s).digest('hex')
const shape=html=>{const rows=[],pending=[[parseFragment(html),0]];while(pending.length){const[n,d]=pending.pop();if('value'in n){const t=n.value.replace(/[\t\r\n ]+/g,' ').trim();if(t)rows.push(['text',d,t])}else if(n.nodeName!=='#document-fragment')rows.push([n.nodeName,d,(n.attrs??[]).filter(a=>!['data-delim','aria-label','data-task-state'].includes(a.name)).map(a=>[a.name,a.value]).sort()]);for(const c of [...(n.childNodes??[])].reverse())pending.push([c,d+Number(n.nodeName!=='#document-fragment')])}return JSON.stringify(rows)}
function worker(root){return launchWorker('php',['-n','-d','extension=ctype','-d','extension=mbstring','-d','memory_limit=512M','-d','opcache.enable_cli=1','-d','opcache.jit_buffer_size=128M','-d','opcache.jit=tracing',new URL('./worker.php', import.meta.url).pathname,root])}
const engines=['release','main'].map(k=>worker(manifest[k].root)),versions=await Promise.all(engines.map(e=>e.ready)).catch(error=>{for(const e of engines)e.child.kill();throw error}),results=[]
for (const [i, revision] of ['release','main'].entries()) {assert.equal(resolve(versions[i].source),resolve(manifest[revision].path,'src/Converter/DjotToCarve.php'));assert.ok(versions[i].jit && versions[i].jitOn)}

try{for(const[family,make]of Object.entries(families).filter(([name])=>!manifest.onlyFamilies||manifest.onlyFamilies.includes(name)))for(const size of sizesFor(family))for(const operation of ['import','render']){const source=make(size),warm=[];for(const e of engines)warm.push(await e.call({source,operation,warmupMs:500}));const iterations=warm.map(w=>Math.max(1,Math.min(1000,Math.ceil(50/w.milliseconds)))),samples=[[],[]];for(let round=0;round<7;round++)for(const i of round%2?[1,0]:[0,1])samples[i].push((await engines[i].call({source,operation,iterations:iterations[i]})).milliseconds);const native=shape(renderHTML(parse(source))),row={family,size,operation,sourceBytes:Buffer.byteLength(source),sourceSha256:sha(source),outputBytes:warm.map(w=>Buffer.byteLength(w.converted)),outputSha256:warm.map(w=>sha(w.converted)),htmlSha256:warm.map(w=>sha(w.html)),nativeEquivalent:warm.map(w=>shape(w.html)===native),betweenRevisionsEquivalent:shape(warm[0].html)===shape(warm[1].html),iterations,samples,medianMs:samples.map(s=>[...s].sort((a,b)=>a-b)[3]),hostLoad:os.loadavg()};row.comparisonEligible=row.nativeEquivalent.every(Boolean)&&row.betweenRevisionsEquivalent&&row.outputSha256[0]===row.outputSha256[1];results.push(row);fs.writeFileSync(output,JSON.stringify({metadata,measuredAt:new Date().toISOString(),versions,manifest,nativeCommit:manifest.native.commit,warmupMilliseconds:500,samples:7,results},null,2)+'\n');process.stderr.write(`${family} ${size} ${operation}: native=${row.nativeEquivalent.join('/')} revisions=${row.betweenRevisionsEquivalent}\n`)}}finally{for(const e of engines)e.child.stdin.end()}
