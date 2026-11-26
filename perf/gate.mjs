// Shared by the nightly gate (orch.mjs, compare.mjs) and bench-cells (cells.mjs): which cells a run
// measures and the verdict over them. A subset run must judge its cells exactly as the full run does.
export const ENG = ['js', 'php', 'rs']
export const OPS = ['parse', 'render', 'ext', 'lint', 'fmt', 'fix', 'import', 'include']

// Document name of a corpus file: `table-128k.crv` -> `table`, `real-conformance.crv` -> `conformance`.
export const shape = f => f.replace(/\.crv$/, '').replace(/^real-/, '').replace(/-\d+k$/, '')

// files: corpus .crv names. ops / docs: optional lists; a doc matches by shape or full name.
export function cells(files, { ops = OPS, docs } = {}) {
  const out = []
  for (const f of [...files].sort()) {
    if (docs && !docs.some(d => d === shape(f) || d === f.replace(/\.crv$/, '') || d === f)) continue
    for (const op of OPS) {
      if (!ops.includes(op)) continue
      if (op === 'include' ? !f.startsWith('includes-') : f.startsWith('includes-') && op !== 'parse') continue
      out.push({ op, file: op === 'import' ? 'html/' + f.replace(/\.crv$/, '.html') : f, src: f })
    }
  }
  return out
}

// FAIL when a head cell's median is more than limits.ratio x its baseline cell's, when a head cell
// grows from 32 to 128 KB with an exponent above limits.exponent and above the baseline's own
// exponent (fastest samples, so one slow call cannot fake growth), or when a head cell crashes,
// panics or times out. A head error the baseline does not raise is reported, not gated: engines
// refuse some input on purpose. 2 KB cells under limits.minMs are reported but do not gate.
export function verdict(run) {
  const { ratio: RATIO, exponent: EXP, minMs: MIN } = run.config.limits
  const med = a => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1] / 1e6 }
  const cell = (op, f, e) => run.cells[`${op}|${f}|${e}`]
  const ms = c => c && !c.err && c.ns.length ? med(c.ns) : undefined
  const minMs = c => c && !c.err && c.ns.length ? Math.min(...c.ns) / 1e6 : undefined
  const realErr = c => c && c.err && c.err !== 'unsupported' ? c.err : undefined
  const crash = e => /^(panic|timeout|driver died)$/.test(e)
  const doc = f => f.replace(/\.crv$/, '').replace(/^real-/, '')
  const keys = [...new Set(Object.values(run.cells).map(c => `${c.op}|${c.file}`))]
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
        row[e].err = he
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
  return { pass: failures.length === 0, failures, notes, rows, growth, compared, limits: { ratio: RATIO, exponent: EXP, minMs: MIN } }
}
