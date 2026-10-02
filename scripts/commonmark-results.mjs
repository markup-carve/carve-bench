import assert from 'node:assert/strict'

export function finalCommonmarkResults(record) {
  assert.equal(record.rounds.length, 2, 'Expected two measurement rounds')
  return record.rounds[0].rows.filter(row => row.engine !== 'commonmark.js-fresh').map(first => {
    const rows = record.rounds.map(round => round.rows.find(row => row.engine === first.engine))
    const samples = rows.flatMap(row => {
      assert.ok(row, `Missing ${first.engine} round`)
      assert.equal(row.bytes, first.bytes)
      assert.equal(row.source_sha256, first.source_sha256)
      assert.equal(row.output_sha256, first.output_sha256)
      assert.equal(row.samples.length, row.trials)
      assert.ok(row.samples.every(sample => Number.isFinite(sample) && sample > 0))
      return row.samples
    }).sort((a, b) => a - b)
    const middle = Math.floor(samples.length / 2)
    const milliseconds = samples.length % 2 ? samples[middle] : (samples[middle - 1] + samples[middle]) / 2
    return { engine: first.engine, bytes: first.bytes, ms_per_op: milliseconds, mb_per_s: first.bytes / 1048576 / (milliseconds / 1000) }
  })
}

export function withFinalCommonmarkSummary(markdown, record) {
  const rows = finalCommonmarkResults(record)
  const summary = ['## Final chart values', '',
    'The charts and site show one final value per engine: throughput computed from median timing across all trial samples from both measurement rounds. The diagnostic round tables below show each round\'s fastest trial.', '',
    '| Engine | Median ms/op | MB/s |', '|---|---:|---:|',
    ...rows.map(row => `| ${row.engine} | ${row.ms_per_op.toFixed(4)} | ${row.mb_per_s.toFixed(2)} |`), '',
    '![Final JavaScript throughput](../charts/commonmark-js.svg)', '',
  ].join('\n')
  const base = markdown.replace(/## Final chart values\n[\s\S]*?(?=## )/, '')
    .replace(/!\[Shared JavaScript core throughput\]\(\.\.\/charts\/commonmark-js\.svg\)\n\n/, '')
    .replace('the table-capable comparison', 'the comparison with pipe tables')
    .replaceAll('Round 1 MB/s', 'Round 1 fastest MB/s').replaceAll('Round 2 MB/s', 'Round 2 fastest MB/s')
    .replaceAll('Round 1 ms/op', 'Round 1 fastest ms/op').replaceAll('Round 2 ms/op', 'Round 2 fastest ms/op')
  return base.replace('## Reused public conversion APIs', summary + '\n## Reused public conversion APIs')
}
