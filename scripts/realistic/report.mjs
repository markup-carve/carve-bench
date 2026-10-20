import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')
const read = file => readFileSync(resolve(root, file), 'utf8')
const data = JSON.parse(read('reports/realistic-engine.json'))
const outputs = JSON.parse(read('reports/realistic-output-control.json'))
const provenance = JSON.parse(read('corpus/realistic/provenance.json'))
const pins = JSON.parse(read('scripts/realistic/pins.json'))
const sha = source => createHash('sha256').update(source).digest('hex')
assert.equal(data.schema, 2)
assert.equal(data.order, 'fixtures and engines rotate one position per round')
assert.deepEqual(data.source_commits, pins)
assert.equal(data.fixture_provenance_sha256, sha(read('corpus/realistic/provenance.json')))
assert.equal(data.rows.length, provenance.fixtures.length * 3)
assert.deepEqual(outputs.source_commits, pins)
assert.equal(outputs.rows.length, provenance.fixtures.length)
for (const fixture of provenance.fixtures) {
  assert.equal(fixture.fixture_sha256, sha(read(fixture.fixture)))
  const rows = data.rows.filter(row => row.document === fixture.name)
  assert.deepEqual(rows.map(row => row.engine).sort(), ['js', 'php', 'rs'])
  const control = outputs.rows.find(row => row.document === fixture.name)
  assert.equal(control?.fixture_sha256, fixture.fixture_sha256)
  const expectedHashes = { js: control.js_sha256, php: control.php_serialized_sha256, rs: control.rs_sha256 }
  for (const row of rows) {
    assert.equal(row.route, 'ast')
    assert.equal(row.output_sha256, expectedHashes[row.engine])
    assert.equal(row.rounds.length, data.rounds)
    assert.ok(row.rounds.every(round => round.samples_ms.length === data.samples_per_round && round.cpu_samples_ms.length === data.samples_per_round && round.output_sha256 === row.output_sha256))
    assert.ok(row.rounds.every(round => round.warmups === (row.engine === 'php' ? 5 : 20)))
  }
}

const labels = { js: 'JavaScript', php: 'PHP', rs: 'Rust' }
const escape = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const ms = value => value < 1 ? value.toFixed(3) : value.toFixed(2)
const size = bytes => `${(bytes / 1024).toFixed(1)} KiB`
const rows = provenance.fixtures.map(fixture => {
  const measured = Object.fromEntries(data.rows.filter(row => row.document === fixture.name).map(row => [row.engine, row]))
  return { fixture, measured }
})

const width = 1050
const height = 600
const left = 245
const right = 930
const axis = value => left + (Math.log10(value) + 2) / 5 * (right - left)
const ticks = [0.01, 0.1, 1, 10, 100, 1000]
const svg = [`<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc" viewBox="0 0 ${width} ${height}">`,
  '<title id="title">Structured document conversion (AST) on three public documents</title>',
  '<desc id="desc">Median process CPU milliseconds per conversion for Carve JavaScript, PHP, and Rust on three adapted documentation files. The horizontal axis uses a logarithmic scale.</desc>',
  '<style>text{font-family:system-ui,sans-serif;fill:#1c2734}.background{fill:#fff}.grid{stroke:#e1e6ec}.js{fill:#2d6cdf}.php{fill:#a850ac}.rs{fill:#16865c}.sub{fill:#596778;font-size:14px}.name{font-size:18px;font-weight:700}.engine{font-size:14px}.value{font-size:14px;font-weight:700}@media(prefers-color-scheme:dark){text,.value{fill:#f0f6fc}.background{fill:#0d1117}.grid{stroke:#30363d}.sub{fill:#9aa9ba}.js{fill:#79a6ff}.php{fill:#d9a2e0}.rs{fill:#65c5a0}}</style>',
  '<rect class="background" width="100%" height="100%"/>',
  '<text x="28" y="35" class="name">Structured document conversion (AST)</text>',
  '<text x="28" y="58" class="sub">Process CPU milliseconds per conversion, lower is faster; logarithmic scale</text>']
for (const tick of ticks) {
  const x = axis(tick)
  svg.push(`<line class="grid" x1="${x}" y1="90" x2="${x}" y2="540"/>`)
  svg.push(`<text x="${x}" y="559" text-anchor="middle" class="sub">${tick}</text>`)
}
rows.forEach(({ fixture, measured }, index) => {
  const top = 108 + index * 145
  svg.push(`<text x="28" y="${top}" class="name">${escape(fixture.name)}</text>`)
  svg.push(`<text x="28" y="${top + 22}" class="sub">${size(fixture.fixture_bytes)}</text>`)
  for (const [engineIndex, engine] of ['js', 'php', 'rs'].entries()) {
    const row = measured[engine]
    const y = top + 32 + engineIndex * 28
    const end = axis(row.median_cpu_ms)
    svg.push(`<text x="150" y="${y + 14}" class="engine">${labels[engine]}</text>`)
    svg.push(`<circle class="${engine}" cx="${end.toFixed(1)}" cy="${y + 10}" r="7"/>`)
    svg.push(`<text x="${Math.min(end + 12, 1005).toFixed(1)}" y="${y + 15}" class="value">${ms(row.median_cpu_ms)} ms</text>`)
  }
})
svg.push('</svg>')
writeFileSync(resolve(root, 'charts/realistic-full-parse.svg'), svg.join('\n') + '\n')

const roundRanges = rows.flatMap(({ fixture, measured }) => ['js', 'php', 'rs'].map(engine => {
  const medians = measured[engine].rounds.map(round => round.median_cpu_ms)
  return `| ${fixture.name} | ${labels[engine]} | ${ms(Math.min(...medians))}–${ms(Math.max(...medians))} |`
})).join('\n')
const table = rows.map(({ fixture, measured }) => `| ${fixture.name} | ${size(fixture.fixture_bytes)} | ${ms(measured.js.median_cpu_ms)} | ${ms(measured.php.median_cpu_ms)} | ${ms(measured.rs.median_cpu_ms)} |`).join('\n')
const report = `# Structured document conversion (AST)

Measured ${data.generated_at.slice(0, 10)}. Three public documentation files from [Carve ${provenance.source_commit.slice(0, 10)}](https://github.com/markup-carve/carve/tree/${provenance.source_commit}/docs) were converted once with \`markdownToCarve\` from [carve-js ${provenance.migrator_commit.slice(0, 10)}](https://github.com/markup-carve/carve-js/tree/${provenance.migrator_commit}). The committed fixtures preserve the prose, examples, links, and document structure. They are examples of real documentation, not a sample of all Carve files.

The pinned JavaScript and PHP probes call the direct renderers used by their default APIs. Rust's pinned default guard rejects the \`:::\` marker in each fixture. Thus all three default APIs used full parse (AST). The same fixture bytes went to all three engines. [Output controls](realistic-output-control.json) found byte-identical JavaScript and Rust HTML; PHP added one final newline to each. Timed output hashes matched those controls and stayed stable across rounds; PHP worker hashes use PHP serialization. Compare these times within a document. The [chart](../charts/realistic-full-parse.svg) uses a logarithmic axis.

| Document | Size | JavaScript CPU ms/op | PHP CPU ms/op | Rust CPU ms/op |
|---|---:|---:|---:|---:|
${table}

${data.rounds} rotating rounds used ${data.samples_per_round} in-process samples per engine and document, on ${data.host} with CPU affinity ${data.cpu_affinity.join(', ')}. JavaScript warmed for at least 20 calls and 500 ms; PHP warmed for 5 calls and Rust for 20. PHP used a clean CLI configuration with ctype and mbstring, without opcache or JIT; Rust used a release build. Process startup was excluded. The chart uses process CPU time to reduce host scheduling noise. JavaScript CPU time includes all Node process threads. Elapsed wall times and round variation remain in the [raw samples](realistic-engine.json). [Fixture provenance](../corpus/realistic/provenance.json) and the [runner](../scripts/realistic/run.py) show the inputs and exact sources.

| Document | Engine | Round median range, CPU ms/op |\n|---|---|---:|\n${roundRanges}\n\nEngine commits: JavaScript \`${pins.js}\`, PHP \`${pins.php}\`, Rust \`${pins.rs}\`.
`
writeFileSync(resolve(root, 'reports/realistic-engine.md'), report)
console.log('Wrote realistic full-parse chart and report')
