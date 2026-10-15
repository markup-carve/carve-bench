import assert from 'node:assert/strict'
export function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

export function tierResults(record) {
  const names = Object.keys(record.metadata.sources)
  assert.deepEqual(names, ['previous', 'published'])
  assert.equal(record.rows.length, 48)
  const results = []
  for (const profile of ['tier1', 'tier2', 'tier3']) {
    const rows = record.rows.filter(row => row.profile === profile)
    assert.equal(new Set(rows.map(row => row.control.output_sha256)).size, 1, `${profile}: outputs differ`)
    for (const metric of ['wall_ms', 'cpu_ms']) {
      const points = names.map(name => Array.from({length: 8}, (_, round) => {
        const point = rows.filter(row => row.revision === name && row.round === round)
        assert.equal(point.length, 1, `Missing or duplicate ${name}/${profile}/${round}`)
        const samples = point[0].control[metric]
        assert.equal(samples.length, 7)
        assert.ok(samples.every(value => Number.isFinite(value) && value > 0))
        assert.ok(point[0].control.jit_on)
        return median(samples)
      }))
      const ratios = points[0].map((value, i) => points[1][i] / value)
      let seed = 2962
      const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296)
      const bootstrap = Array.from({length: 10000}, () => median(Array.from({length: 8}, () => ratios[Math.floor(random() * 8)]))).sort((a, b) => a - b)
      results.push({profile, metric, previous: median(points[0]), published: median(points[1]), ratio: median(ratios), interval95: [bootstrap[250], bootstrap[9749]]})
    }
  }
  return results
}
