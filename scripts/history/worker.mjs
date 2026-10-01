import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { performance } from 'node:perf_hooks'
import { createHash } from 'node:crypto'

const [root, fixture, count, warm] = process.argv.slice(2)
const { carveToHtml } = await import(pathToFileURL(`${root}/dist/index.js`))
const source = readFileSync(fixture, 'utf8')
for (let i = 0; i < Number(warm); i++) carveToHtml(source)
const samples = []
let output
for (let i = 0; i < Number(count); i++) {
  const start = performance.now()
  output = carveToHtml(source)
  samples.push(performance.now() - start)
}
console.log(JSON.stringify({ samples_ms: samples, hash: createHash('sha256').update(output).digest('hex') }))
