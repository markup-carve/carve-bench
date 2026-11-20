// Timing loop shared by the cells of the JavaScript lane. The Rust and PHP lanes implement the same method.
const PHASES = ['parse', 'html']

let sink = 0

function keep(value) {
  sink += typeof value === 'string' ? value.length : value === null || value === undefined ? 0 : 1
}

/** Nanoseconds per call of `fn(src)` over a loop of at least `minNanos`, after an untimed collection (`--expose-gc`). */
function sample(fn, src, minNanos) {
  globalThis.gc?.()
  let iterations = 0
  const start = process.hrtime.bigint()
  let elapsed = 0n
  do {
    keep(fn(src))
    iterations++
    elapsed = process.hrtime.bigint() - start
  } while (elapsed < minNanos)
  return Number(elapsed) / iterations
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = sorted.length >> 1
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function cellsOf(engines, names, source) {
  const cells = []
  for (const name of names) {
    for (const engine of engines) {
      const src = source(name, engine.lang)
      for (const phase of PHASES) cells.push({ engine, name, phase, src, fn: engine[phase], samples: [] })
    }
  }
  return cells
}

export function measure({ engines, names, source, rounds, sampleMs }) {
  const minNanos = BigInt(Math.round(sampleMs * 1e6))
  const cells = cellsOf(engines, names, source)
  for (const cell of cells) sample(cell.fn, cell.src, minNanos)
  for (let round = 0; round < rounds; round++) {
    const offset = Math.floor((round * cells.length) / rounds)
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[(offset + i) % cells.length]
      cell.samples.push(sample(cell.fn, cell.src, minNanos) / 1000)
    }
  }
  return {
    method: { rounds, sampleMs, warmup: `one loop of at least ${sampleMs} ms per cell`, order: 'rotated per round' },
    engines: engines.map(({ id, label, version, commit, lang }) => ({ id, label, version, commit: commit ?? null, lang })),
    documents: names.map((name) => ({
      name, bytes: Object.fromEntries(['crv', 'md', 'dj'].map((lang) => [lang, Buffer.byteLength(source(name, lang))])),
    })),
    cells: cells.map(({ engine, name, phase, src, samples }) => ({
      engine: engine.id, document: name, phase, bytes: Buffer.byteLength(src),
      medianUs: median(samples), minUs: Math.min(...samples), samplesUs: samples,
    })),
    sink,
  }
}
