import assert from 'node:assert/strict'
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {families, sizesFor} from './fixtures.mjs'

const [directory, destination = 'reports'] = process.argv.slice(2)
assert.ok(directory, 'Usage: node scripts/djot-growth/report.mjs RAW_DIRECTORY [OUTPUT_DIRECTORY]')
mkdirSync(destination, {recursive: true})
const records = Object.fromEntries(['js', 'php', 'rs'].map(engine => [engine,
  JSON.parse(readFileSync(resolve(directory, `carve-2962-final-growth-${engine}.json`)))]))
const lines = ['# Djot import growth after issue 2962', '',
  'Released tags versus fixed merged-main snapshots. Each operation uses seven alternating pairs after a 500 ms warmup per revision and point. Raw conversion excludes loss-report traversal; rendering uses the converted text. CPU affinity does not reserve a core.', '',
  '| Engine | Released tag and commit | Merged main | Measurement started |',
  '| --- | --- | --- | --- |']
for (const [engine, record] of Object.entries(records)) {
  const {release, main} = record.metadata.sources
  lines.push(`| ${engine} | ${release.revision}, \`${release.commit}\` | \`${main.commit}\` | ${record.metadata.startedAt} |`)
  assert.equal(record.samples, 7)
  for (const [family] of Object.entries(families)) for (const size of sizesFor(family)) for (const operation of ['import', 'render']) {
    const points = record.results.filter(row => row.family === family && row.size === size && row.operation === operation)
    assert.equal(points.length, 1, `Missing or duplicate ${engine}/${family}/${size}/${operation}`)
    for (const samples of points[0].samples) assert.equal(samples.length, 7)
    assert.ok(!points[0].nativeEquivalent[0] || points[0].nativeEquivalent[1], 'New Native HTML regression')
  }
  writeFileSync(resolve(destination, `djot-growth-${engine}.json`), JSON.stringify(record, null, 2) + '\n')
}
lines.push('', '## Largest measured points', '',
  'Times are medians in milliseconds. Eligible rows have matching converted text and Native HTML in both revisions. Other rows are observations with different output or a parser budget limit; their ratios are omitted.', '',
  '| Engine | Family | Operation | Count | Release ms | Main ms | Main/release |',
  '| --- | --- | --- | ---: | ---: | ---: | ---: |')
for (const [engine, record] of Object.entries(records)) for (const family of Object.keys(families)) for (const operation of ['import', 'render']) {
  const rows = record.results.filter(row => row.family === family && row.operation === operation).sort((a, b) => a.size - b.size)
  const row = rows.at(-1)
  lines.push(`| ${engine} | ${family} | ${operation} | ${row.size} | ${row.medianMs[0].toFixed(3)} | ${row.medianMs[1].toFixed(3)} | ${row.comparisonEligible ? (row.medianMs[1] / row.medianMs[0]).toFixed(3) : 'excluded'} |`)
}
lines.push('', '## Growth across eligible points', '',
  'The exponent is a least-squares fit of log time against log input bytes. It describes these measurements, not an asymptotic bound. Excluded points do not enter the fit. Ratios across separate full-fleet sessions are not paired speedups.', '',
  '| Engine | Family | Operation | Eligible points | Release exponent | Main exponent |',
  '| --- | --- | --- | ---: | ---: | ---: |')
function exponent(rows, revision) {
  const x = rows.map(row => Math.log(row.sourceBytes)), y = rows.map(row => Math.log(row.medianMs[revision]))
  const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length
  const mx = mean(x), my = mean(y)
  return x.reduce((sum, value, i) => sum + (value - mx) * (y[i] - my), 0) / x.reduce((sum, value) => sum + (value - mx) ** 2, 0)
}
for (const [engine, record] of Object.entries(records)) for (const family of Object.keys(families)) for (const operation of ['import', 'render']) {
  const rows = record.results.filter(row => row.family === family && row.operation === operation && row.comparisonEligible)
  lines.push(`| ${engine} | ${family} | ${operation} | ${rows.length} | ${rows.length > 2 ? exponent(rows, 0).toFixed(2) : 'insufficient'} | ${rows.length > 2 ? exponent(rows, 1).toFixed(2) : 'insufficient'} |`)
}
lines.push('', 'Raw samples, source/build hashes, output hashes, Native checks and host load are retained in [JavaScript](djot-growth-js.json), [PHP](djot-growth-php.json) and [Rust](djot-growth-rs.json). Reproduction instructions are in [the runner README](../scripts/djot-growth/README.md). These results do not claim that every import family scales linearly. Native parser performance remains a separate follow-up in [carve#2958](https://github.com/markup-carve/carve/issues/2958).', '')
writeFileSync(resolve(destination, 'djot-growth-2962.md'), lines.join('\n'))
