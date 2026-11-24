// bench-cells: run a subset of the nightly perf gate against a local engine checkout.
// node perf/cells.mjs --engine carve-js|carve-php|carve-rs --path <checkout>
//   [--command fmt,import,...] [--doc table,prose,...] [--rounds N] [--work dir] [--no-build]
// Same setup, drivers, rounds, warmup, sampling, baselines and verdict (gate.mjs) as perf-nightly.yml;
// only the engine, ops and documents are narrowed. One line per cell, exit 1 on any FAIL.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { OPS, verdict } from './gate.mjs'
const H = path.dirname(new URL(import.meta.url).pathname)
const argv = process.argv.slice(2)
const opt = name => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined }
const flag = name => argv.includes(`--${name}`)
const usage = 'usage: cells.mjs --engine carve-js|carve-php|carve-rs --path <checkout> [--command ops] [--doc docs] [--rounds N] [--work dir] [--no-build]'
const engine = (opt('engine') || '').replace(/^carve-/, '')
const checkout = opt('path') && path.resolve(opt('path'))
if (!['js', 'php', 'rs'].includes(engine) || !checkout) throw new Error(usage)
const ops = opt('command')
for (const op of ops ? ops.split(',') : []) if (!OPS.includes(op)) throw new Error(`unknown command ${op}; one of ${OPS.join(', ')}`)
const work = path.resolve(opt('work') || path.join(H, '.work', `cells-${engine}`))
const node = (script, args) => execFileSync(process.execPath, [path.join(H, script), ...args], { stdio: ['ignore', 2, 2] })

node('setup.mjs', [`--${engine}`, checkout, '--work', work, '--keep-deps', ...(flag('no-build') ? ['--no-engine-build'] : [])])
const out = path.join(work, 'run.json')
node('orch.mjs', [out, '--work', work, '--engines', engine, ...(ops ? ['--ops', ops] : []), ...(opt('doc') ? ['--docs', opt('doc')] : []), ...(opt('rounds') ? ['--rounds', opt('rounds')] : [])])

const run = JSON.parse(fs.readFileSync(out, 'utf8'))
const v = verdict(run)
const { ratio: RATIO, exponent: EXP, minMs: MIN } = v.limits
const f2 = x => x === undefined ? '-' : x.toFixed(2)
const failed = (check, op, doc) => v.failures.some(x => x.check === check && x.engine === engine && x.op === op && x.doc === doc)
const doc = f => f.replace(/\.crv$/, '').replace(/^real-/, '')
const lines = []
const line = (ok, ...cols) => lines.push([ok, ...cols].join('  '))
for (const r of v.rows) {
  const c = r[engine], d = doc(r.file)
  if (c.err) { line(failed('error', r.op, d) ? 'FAIL' : 'NOTE', 'error ', r.op.padEnd(7), d.padEnd(22), c.err.slice(0, 160)); continue }
  if (c.ratio === undefined) continue
  const tail = c.quiet ? `(quiet: 2 KB under ${MIN} ms, not gated)` : `(limit ${RATIO})`
  line(failed('ratio', r.op, d) ? 'FAIL' : 'PASS', 'ratio ', r.op.padEnd(7), d.padEnd(22), `head ${f2(c.head)} ms`, `base ${f2(c.base)} ms`, `ratio ${f2(c.ratio)}`, tail)
}
for (const g of v.growth.filter(g => g.engine === engine)) {
  const d = `${g.shape}-{32,128}k`
  line(failed('growth', g.op, d) ? 'FAIL' : 'PASS', 'growth', g.op.padEnd(7), d.padEnd(22), `head ${f2(g.head32)} -> ${f2(g.head128)} ms`, `exp ${f2(g.exp)}`, `base exp ${f2(g.baseExp)}`, `(limit ${EXP})`)
}
const fails = v.failures.filter(x => x.engine === engine).length
console.log(lines.join('\n'))
console.log(`carve-${engine} ${run.setup.head[engine].commit.slice(0, 8)} vs ${run.setup.baseline[engine]}: ${fails ? `FAIL (${fails})` : 'PASS'}, ${lines.length} cells, ${run.rounds} rounds, load ${run.load.map(l => l[0].toFixed(1)).join(' ')} on ${os.cpus().length} CPUs; run ${out}`)
process.exitCode = fails ? 1 : 0
