// Verdict for a perf run: node perf/compare.mjs <run.json> [--ref name] [--md out.md] [--json verdict.json]
// The checks are in gate.mjs. Exit code 1 on FAIL.
import fs from 'node:fs'
import { ENG, verdict } from './gate.mjs'
const argv = process.argv.slice(2)
const opt = name => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined }
const file = argv[0]
if (!file || file.startsWith('--')) throw new Error('usage: compare.mjs <run.json> [--md out.md] [--json verdict.json]')
const run = JSON.parse(fs.readFileSync(file, 'utf8'))
const { ratio: RATIO, exponent: EXP, minMs: MIN } = run.config.limits
const doc = f => f.replace(/\.crv$/, '').replace(/^real-/, '')
const fmt = v => v === undefined ? '-' : v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)
const { pass, failures, notes, rows, growth, compared } = verdict(run)
const S = run.setup, short = c => c.slice(0, 8), ref = opt('ref') || 'local'
const heads = ENG.filter(e => S.head[e]).map(e => `carve-${e} \`${short(S.head[e].commit)}\``).join(', ')
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
