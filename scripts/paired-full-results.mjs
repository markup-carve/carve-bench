import assert from 'node:assert/strict'

export function requireMatchingOutputs(before, after) {
  assert.equal(before.output_bytes, after.output_bytes, 'Different output sizes; reject speed comparison')
  assert.equal(before.output_sha256, after.output_sha256, 'Different output hashes; reject speed comparison')
}

export function pairedSummary(rows) {
  const median = values => {
    const sorted = [...values].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
  }
  return [...new Set(rows.map(row => row.engine))].flatMap(engine =>
    [...new Set(rows.filter(row => row.engine === engine).map(row => row.sections))].map(sections => {
      const samples = rows.filter(row => row.engine === engine && row.sections === sections)
      const rounds = [...new Set(samples.map(row => row.round))].sort((a, b) => a - b)
      assert.ok(rounds.length > 0)
      const before = [], after = [], changes = []
      for (const round of rounds) {
        const pair = samples.filter(row => row.round === round)
        assert.equal(pair.length, 2, 'Each round needs exactly one before and one after')
        const old = pair.find(row => row.revision === 'before')
        const current = pair.find(row => row.revision === 'after')
        assert.ok(old && current && old.ms_per_op > 0 && current.ms_per_op > 0)
        before.push(old.ms_per_op); after.push(current.ms_per_op)
        changes.push(100 * (current.ms_per_op / old.ms_per_op - 1))
      }
      return { engine, sections, before_ms: median(before), after_ms: median(after), paired_change_percent: median(changes),
        min_paired_change_percent: Math.min(...changes), max_paired_change_percent: Math.max(...changes), paired_changes_percent: changes }
    }))
}

export function pairedTableRows(summary) {
  const percent = value => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  return summary.map(row => [row.engine, String(row.sections), row.before_ms.toFixed(4), row.after_ms.toFixed(4), percent(row.paired_change_percent),
    `${percent(row.min_paired_change_percent)} to ${percent(row.max_paired_change_percent)}`])
}

export function requireWorkerSource(source, entry) {
  const match = source.match(/\(local checkout (.+) @ ([a-f0-9]{7,40})\)$/)
  assert.ok(match, 'Worker must identify a checkout and revision')
  assert.equal(match[1].replaceAll('\\', '/'), entry.path.replaceAll('\\', '/'))
  assert.ok(entry.commit.startsWith(match[2]), 'Worker revision differs from requested commit')
}
