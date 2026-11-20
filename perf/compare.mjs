// Verdict for a perf run: node perf/compare.mjs <run.json> [--ref name] [--md out.md] [--json verdict.json]
// FAIL when a head cell's median is more than limits.ratio x its baseline cell's, when a head cell
// grows from 32 to 128 KB with an exponent above limits.exponent and above the baseline's own
// exponent (fastest samples, so one slow call cannot fake growth), or when a head cell crashes,
// panics or times out. A head error the baseline does not raise is reported, not gated: engines
// refuse some input on purpose. 2 KB cells under limits.minMs are reported but do not gate.
// Exit code 1 on FAIL.
import fs from 'node:fs'
const argv = process.argv.slice(2)
const opt = name => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined }
const file = argv[0]
if (!file || file.startsWith('--')) throw new Error('usage: compare.mjs <run.json> [--md out.md] [--json verdict.json]')
const run = JSON.parse(fs.readFileSync(file, 'utf8'))
const { ratio: RATIO, exponent: EXP, minMs: MIN } = run.config.limits
const ENG = ['js', 'php', 'rs']
const med = a => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1] / 1e6 }
const cell = (op, f, e) => run.cells[`${op}|${f}|${e}`]
const ms = c => c && !c.err && c.ns.length ? med(c.ns) : undefined
const minMs = c => c && !c.err && c.ns.length ? Math.min(...c.ns) / 1e6 : undefined
const realErr = c => c && c.err && c.err !== 'unsupported' ? c.err : undefined
const crash = e => /^(panic|timeout|driver died)$/.test(e)
const doc = f => f.replace(/\.crv$/, '').replace(/^real-/, '')
const fmt = v => v === undefined ? '-' : v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)
const keys = [...new Set(Object.values(run.cells).map(c => `${c.op}|${c.file}`))]
const OPS = ['parse', 'render', 'ext', 'lint', 'fmt', 'fix', 'import', 'include']
keys.sort((a, b) => { const [oa, fa] = a.split('|'), [ob, fb] = b.split('|'); return OPS.indexOf(oa) - OPS.indexOf(ob) || fa.localeCompare(fb, 'en', { numeric: true }) })
const failures = [], notes = [], rows = []
let compared = 0
for (const k of keys) {
  const [op, f] = k.split('|')
  const row = { op, file: f }
  for (const e of ENG) {
    const h = cell(op, f, `${e}-head`), b = cell(op, f, `${e}-base`)
    const hm = ms(h), bm = ms(b)
    row[e] = { head: hm, base: bm, ratio: hm !== undefined && bm !== undefined ? hm / bm : undefined }
    const he = realErr(h)
    if (he) {
      if (crash(he)) failures.push({ check: 'error', engine: e, op, doc: doc(f), detail: he })
      else notes.push(`${e} ${op} ${doc(f)}: head errors${realErr(b) ? ', baseline too' : ', baseline does not'} (${he})`)
      continue
    }
    if (row[e].ratio === undefined) continue
    compared++
    if (/-2k\.crv$/.test(f) && hm < MIN) { row[e].quiet = true; continue }
    if (row[e].ratio > RATIO) failures.push({ check: 'ratio', engine: e, op, doc: doc(f), head: hm, base: bm, value: row[e].ratio })
  }
  rows.push(row)
}
const growth = []
for (const k of keys) {
  const [op, f] = k.split('|')
  if (!/-32k\.crv$/.test(f)) continue
  const big = f.replace('-32k.crv', '-128k.crv')
  for (const e of ENG) {
    const s = minMs(cell(op, f, `${e}-head`)), l = minMs(cell(op, big, `${e}-head`))
    if (s === undefined || l === undefined) continue
    const x = Math.log(l / s) / Math.log(4)
    const bs = minMs(cell(op, f, `${e}-base`)), bl = minMs(cell(op, big, `${e}-base`))
    const bx = bs !== undefined && bl !== undefined ? Math.log(bl / bs) / Math.log(4) : undefined
    growth.push({ engine: e, op, shape: f.replace('-32k.crv', ''), head32: s, head128: l, exp: x, baseExp: bx })
    if (x > EXP && !(bx >= x)) failures.push({ check: 'growth', engine: e, op, doc: f.replace('-32k.crv', '-{32,128}k'), head: l, base: s, value: x, baseExp: bx })
  }
}
const pass = failures.length === 0
const S = run.setup, short = c => c.slice(0, 8), ref = opt('ref') || 'local'
const heads = ENG.map(e => `carve-${e} \`${short(S.head[e].commit)}\``).join(', ')
const L = []
L.push(`# Perf gate: ${pass ? 'PASS' : 'FAIL'} on ${ref}`, '')
L.push(`Head: ${heads}. Baseline ${S.baseline.label}: carve-js ${S.baseline.js}, carve-php ${S.baseline.php}, carve-rs ${S.baseline.rs}.`, '')
L.push(`Run ${run.started} to ${run.ended || '(unfinished)'}, ${run.rounds} rounds, ${run.host.cpus} CPUs (${run.host.model}), load at round ends ${run.load.map(l => l[0].toFixed(1)).join(', ')}.`, '')
L.push(`Limits: head/base median at most ${RATIO}x; 32 to 128 KB growth exponent (fastest samples) at most ${EXP} unless the baseline grows as fast; no crash, panic or timeout. 2 KB cells under ${MIN} ms do not gate.`, '')
L.push(pass ? `${compared} head/base cells and ${growth.length} growth pairs within limits.` : `${failures.length} failures (${compared} head/base cells, ${growth.length} growth pairs checked).`, '')
if (!pass) {
  L.push('| check | engine | op | document | head ms | base ms | value |', '|---|---|---|---|---:|---:|---:|')
  for (const x of failures) {
    if (x.check === 'error') L.push(`| error | ${x.engine} | ${x.op} | ${x.doc} | - | - | ${x.detail.replace(/\|/g, '\\|').slice(0, 120)} |`)
    else if (x.check === 'growth') L.push(`| growth | ${x.engine} | ${x.op} | ${x.doc} | ${fmt(x.head)} (128k) | ${fmt(x.base)} (32k) | exp ${x.value.toFixed(2)}${x.baseExp === undefined ? '' : `, base ${x.baseExp.toFixed(2)}`} |`)
    else L.push(`| ratio | ${x.engine} | ${x.op} | ${x.doc} | ${fmt(x.head)} | ${fmt(x.base)} | ${x.value.toFixed(2)}x |`)
  }
  L.push('')
}
for (const n of notes) L.push(`- ${n}`)
if (notes.length) L.push('')
L.push('<details><summary>All cells (median ms, head/base)</summary>', '')
L.push('| op | document | js | js base | js x | php | php base | php x | rs | rs base | rs x |', '|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|')
for (const r of rows) {
  const c = e => { const v = r[e]; return [fmt(v.head), fmt(v.base), v.ratio === undefined ? '-' : `${v.ratio.toFixed(2)}${v.quiet ? ' (quiet)' : ''}`] }
  L.push(`| ${r.op} | ${doc(r.file)} | ${ENG.flatMap(c).join(' | ')} |`)
}
L.push('', '</details>', '')
L.push('<details><summary>Growth 32 to 128 KB (exponent of the fastest samples, head and base)</summary>', '')
L.push('| op | shape | js | js base | php | php base | rs | rs base |', '|---|---|---:|---:|---:|---:|---:|---:|')
const gk = [...new Set(growth.map(g => `${g.op}|${g.shape}`))]
for (const k of gk) {
  const [op, shape] = k.split('|')
  const g = e => { const x = growth.find(y => y.op === op && y.shape === shape && y.engine === e); return [x ? x.exp.toFixed(2) : '-', x?.baseExp === undefined ? '-' : x.baseExp.toFixed(2)] }
  L.push(`| ${op} | ${shape} | ${ENG.flatMap(g).join(' | ')} |`)
}
L.push('', '</details>', '')
const md = L.join('\n')
if (opt('md')) fs.writeFileSync(opt('md'), md)
else console.log(md)
if (opt('json')) fs.writeFileSync(opt('json'), JSON.stringify({ pass, ref, failures, notes, compared, heads: S.head, baseline: S.baseline, started: run.started }, null, 2) + '\n')
console.error(pass ? 'perf gate: PASS' : `perf gate: FAIL (${failures.length})`)
process.exitCode = pass ? 0 : 1
