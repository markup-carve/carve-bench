import { performance } from 'node:perf_hooks'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const [root, fixture, positions, count] = process.argv.slice(2)
const { parse, citations, htmlToCarve } = await import(pathToFileURL(`${root}/dist/index.js`))
const source = readFileSync(fixture, 'utf8')
const options = { extensions: [citations()], positions: positions === 'true' }
const run = positions === 'html-import' ? () => htmlToCarve(source) : () => parse(source, options)
const warmupStart = performance.now()
let warmups = 0
while (warmups < 3 || performance.now() - warmupStart < 500) {
  run()
  warmups++
}
const warmupMs = performance.now() - warmupStart
const samples = []
for (let i = 0; i < Number(count); i++) {
  const start = performance.now()
  run()
  samples.push(performance.now() - start)
}
console.log(JSON.stringify({
  samples,
  hash: createHash('sha256').update(JSON.stringify(run())).digest('hex'),
  warmups,
  warmup_ms: warmupMs,
}))
