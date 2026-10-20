import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { performance } from 'node:perf_hooks'
import { createHash } from 'node:crypto'

const [root, fixture, count, warm] = process.argv.slice(2)
const { carveToHtml } = await import(pathToFileURL(`${root}/dist/index.js`))
const source = readFileSync(fixture, 'utf8')
const warmupStart = performance.now()
let warmupIterations = 0
while (warmupIterations < Number(warm) || performance.now() - warmupStart < 500) {
  carveToHtml(source)
  warmupIterations++
}
const warmupMs = performance.now() - warmupStart
const samples = []
const cpuSamples = []
let output
for (let i = 0; i < Number(count); i++) {
  const cpuStart = process.cpuUsage()
  const start = performance.now()
  output = carveToHtml(source)
  const elapsed = performance.now() - start
  const cpu = process.cpuUsage(cpuStart)
  samples.push(elapsed)
  cpuSamples.push((cpu.user + cpu.system) / 1000)
}
console.log(JSON.stringify({ samples_ms: samples, cpu_samples_ms: cpuSamples, hash: createHash('sha256').update(output).digest('hex'), warmup_iterations: warmupIterations, warmup_ms: warmupMs }))
