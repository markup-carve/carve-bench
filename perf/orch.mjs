// Round-robin orchestrator: node perf/orch.mjs <out.json> [--work perf/.work] [--rounds N] [--reps N] [--filter s]
//   [--engines js,php,rs] [--ops fmt,import,...] [--docs table,prose,...]
// One long-lived driver per engine and side (head checkout, pinned base), interleaved per cell.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import readline from 'node:readline'
import { cells as select } from './gate.mjs'
const H = path.dirname(new URL(import.meta.url).pathname)
const argv = process.argv.slice(2)
const opt = (name, d) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : d }
const out = argv[0]
if (!out || out.startsWith('--')) throw new Error('usage: orch.mjs <out.json> [--work dir] [--rounds N] [--reps N] [--filter s] [--engines list] [--ops list] [--docs list]')
const config = JSON.parse(fs.readFileSync(path.join(H, 'config.json'), 'utf8'))
const work = path.resolve(opt('work', path.join(H, '.work')))
const setup = JSON.parse(fs.readFileSync(path.join(work, 'setup.json'), 'utf8'))
const rounds = +opt('rounds', config.run.rounds), per = +opt('reps', config.run.reps), filter = opt('filter', '')
const { slowSeconds, settleFactor, slowMinSamples = 1 } = config.run
const list = name => opt(name) ? opt(name).split(',').map(s => s.trim()).filter(Boolean) : undefined
const only = list('engines')
const C = setup.corpus, D = setup.drivers, api = setup.baseline.api
const php = ['-d', 'memory_limit=4G', '-d', 'opcache.enable_cli=1', '-d', 'opcache.jit=disable', '-d', 'default_socket_timeout=-1']
const ALL = {
  'js-head': ['node', [path.join(H, 'drivers/drv-js.mjs'), '0.2', D.js?.head, C]],
  'js-base': ['node', [path.join(H, 'drivers/drv-js.mjs'), api, D.js?.base, C]],
  'php-head': ['php', [...php, path.join(H, 'drivers/drv-php.php'), '0.2', D.php?.head, C]],
  'php-base': ['php', [...php, path.join(H, 'drivers/drv-php.php'), api, D.php?.base, C]],
  'rs-head': [D.rs?.bin, ['head', C, D.rs?.rules]],
  'rs-base': [D.rs?.bin, ['base', C, D.rs?.rules]],
}
for (const e of only || []) if (!setup.head[e]) throw new Error(`--engines ${e}: not in ${path.join(work, 'setup.json')}`)
const ENGINES = Object.fromEntries(Object.entries(ALL).filter(([n]) => (only || Object.keys(setup.head)).includes(n.split('-')[0])))
let closing = false
function start(name) {
  const [cmd, args] = ENGINES[name]
  const p = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'inherit'] })
  const rl = readline.createInterface({ input: p.stdout })
  const d = { p, waiters: [] }
  rl.on('line', l => { const w = d.waiters.shift(); if (w) w(JSON.parse(l)) })
  p.on('exit', (code, sig) => {
    for (const w of d.waiters.splice(0)) w({ err: d.timedOut ? 'timeout' : 'driver died' })
    if (closing) return
    console.error(`driver ${name} exited code ${code} signal ${sig}${d.timedOut ? ' (timeout)' : ''}, restarting`)
    drivers[name] = start(name)
  })
  d.ask = req => new Promise(r => {
    const t = setTimeout(() => { d.timedOut = true; p.kill('SIGKILL') }, 60000 * (req.reps + (req.warm || 0)))
    d.waiters.push(a => { clearTimeout(t); r(a) })
    p.stdin.write(JSON.stringify(req) + '\n')
  })
  return d
}
const drivers = {}
for (const n of Object.keys(ENGINES)) drivers[n] = start(n)
const files = fs.readdirSync(C).filter(f => f.endsWith('.crv') && f.includes(filter)).sort()
const cells = select(files, { ops: list('ops'), docs: list('docs') })
if (!cells.length) throw new Error('no cells selected')
const res = { started: new Date().toISOString(), host: { cpus: os.cpus().length, model: os.cpus()[0]?.model, node: process.version }, setup: { head: setup.head, baseline: setup.baseline }, config, rounds, engines: Object.keys(ENGINES), load: [os.loadavg()], cells: {} }
const skip = new Set()
const names = Object.keys(ENGINES)
const med = a => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1] }
for (let r = 0; r < rounds; r++) {
  for (const [ci, c] of cells.entries()) {
    const order = names.map((_, i) => names[(i + r + ci) % names.length])
    for (const e of order) {
      const key = `${c.op}|${c.src}|${e}`
      if (skip.has(key)) continue
      let a = await drivers[e].ask({ op: c.op, file: c.file, reps: 1, warm: r === 0 ? 1 : 0 })
      if (a.err) { skip.add(key); res.cells[key] = { op: c.op, file: c.src, engine: e, err: a.err, ns: res.cells[key]?.ns || [] }; continue }
      const cell = res.cells[key] ??= { op: c.op, file: c.src, engine: e, ns: [] }
      cell.ns.push(...a.ns)
      // Slow cells take one call per round, topped up so the last round ends at slowMinSamples.
      const extra = a.ns[0] > slowSeconds * 1e9 ? Math.ceil(slowMinSamples * (r + 1) / rounds) - cell.ns.length : per - 1
      if (extra < 1) continue
      a = await drivers[e].ask({ op: c.op, file: c.file, reps: extra, warm: 0 })
      if (a.err) { skip.add(key); cell.err = a.err } else cell.ns.push(...a.ns)
    }
    // A base cell already settleFactor x slower than its head cannot decide the ratio; stop sampling it.
    for (const eng of ['js', 'php', 'rs']) {
      const h = res.cells[`${c.op}|${c.src}|${eng}-head`], b = res.cells[`${c.op}|${c.src}|${eng}-base`]
      if (h?.ns.length && b?.ns.length && Math.min(...b.ns) > settleFactor * med(h.ns)) skip.add(`${c.op}|${c.src}|${eng}-base`)
    }
    if (ci % 20 === 0) { fs.writeFileSync(out, JSON.stringify(res)); console.error(`r${r} cell ${ci}/${cells.length} ${new Date().toISOString()}`) }
  }
  res.load.push(os.loadavg())
  fs.writeFileSync(out, JSON.stringify(res))
  console.error(`round ${r + 1}/${rounds} done ${new Date().toISOString()} load ${os.loadavg().map(x => x.toFixed(1)).join(' ')}`)
}
res.ended = new Date().toISOString()
fs.writeFileSync(out, JSON.stringify(res))
closing = true
for (const d of Object.values(drivers)) d.p.stdin.end()
