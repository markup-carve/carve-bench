// carve-js render benchmark harness.
// Usage: node bench.mjs <doc-path> <iters>
// Emits one JSON line: { engine, ms_per_op, mb_per_s, iters, bytes }.
// The carve-js module is resolved from CARVE_JS (a path to its index.js or a
// bare package specifier); defaults to the published `carve-js` package.
import { readFileSync } from 'node:fs'

const docPath = process.argv[2]
const iters = Number.parseInt(process.argv[3] ?? '200', 10)
const spec = process.env.CARVE_JS ?? 'carve-js'

const { carveToHtml } = await import(spec)
const src = readFileSync(docPath, 'utf8')
const bytes = Buffer.byteLength(src)

// Warm up (JIT) before timing.
for (let i = 0; i < Math.min(20, iters); i++) carveToHtml(src)

const start = process.hrtime.bigint()
for (let i = 0; i < iters; i++) carveToHtml(src)
const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6

const msPerOp = elapsedMs / iters
const mbPerS = bytes / 1024 / 1024 / (msPerOp / 1000)
process.stdout.write(
  JSON.stringify({
    engine: 'carve-js',
    ms_per_op: Number(msPerOp.toFixed(4)),
    mb_per_s: Number(mbPerS.toFixed(2)),
    iters,
    bytes,
  }) + '\n',
)
