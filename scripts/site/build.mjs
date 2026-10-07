import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync, cpSync, rmSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { affinityDescription } from '../benchmark-metadata.mjs'
import { engineLabel } from '../engine-labels.mjs'
import { finalCommonmarkResults } from '../commonmark-results.mjs'
import { pairedSummary, pairedTableRows, requireMatchingOutputs } from '../paired-full-results.mjs'

export function sections(markdown) {
  const groups = []
  let current = { title: 'Overview', tables: [] }
  groups.push(current)
  const lines = markdown.split('\n')
  for (let index = 0; index < lines.length; index++) {
    if (lines[index].startsWith('## ')) {
      current = { title: lines[index].slice(3), tables: [] }
      groups.push(current)
    }
    if (!lines[index].startsWith('|') || !/^\|[-: |]+\|$/.test(lines[index + 1] ?? '')) continue
    const cells = line => line.split('|').slice(1, -1).map(cell => cell.trim())
    const headers = cells(lines[index])
    index += 2
    const rows = []
    while (lines[index]?.startsWith('|')) {
      const row = cells(lines[index++])
      assert.equal(row.length, headers.length, `Invalid table in ${current.title}`)
      rows.push(row)
    }
    index--
    current.tables.push({ headers, rows })
  }
  return groups.filter(group => group.tables.length)
}

export function collect(comparison, results, revision, fullRecord = null) {
  const core = sections(comparison)
  const full = sections(results)
  const headline = core.find(group => group.title.startsWith('Headline:'))?.tables[0]
  assert.ok(headline && headline.rows.length === 3, 'Missing three-language headline')
  const languages = ['JavaScript', 'PHP', 'Rust']
  assert.deepEqual(headline.rows.map(row => row[0]).sort(), [...languages].sort())
  const peers = languages.flatMap(language => {
    const table = core.find(group => group.title === language)?.tables[0]
    assert.ok(table, `Missing ${language} results`)
    const name = column => { const index = table.headers.indexOf(column); assert.ok(index >= 0); return index }
    return table.rows.map(row => {
      const throughput = Number(row[name('MB/s')])
      assert.ok(Number.isFinite(throughput) && throughput > 0, 'Invalid throughput')
      return { language, engine: row[name('Engine')], throughput }
    })
  })
  assert.equal(peers.length, 10, 'Missing comparison engines')
  assert.ok(['small', 'medium', 'large'].every(size => full.some(group => group.title.startsWith(`${size} (`))), 'Missing corpus size')
  const run = results.match(/^\*\*Run:\*\* (.+)$/m)?.[1]
  const corpus = results.match(/^\*\*Corpus snapshot:\*\* (.+)$/m)?.[1]
  const engines = results.match(/^\*\*Engines measured:\*\* (.+)$/m)?.[1]
  const host = comparison.split('\n').find(line => /Linux .+Node.js .+PHP .+rustc/.test(line))
  assert.ok(run && corpus && engines && host, 'Missing run provenance')
  assert.ok(!/unreported|MISMATCH/.test(engines), 'Unverified engine provenance')
  const identities = text => Object.fromEntries([...text.matchAll(/carve-(js|php|rs) `([^`]+)`/g)].map(match => [match[1], match[2]]))
  const coreIdentities = identities(comparison)
  assert.equal(Object.keys(coreIdentities).length, 3, 'Missing core engine identities')
  if (fullRecord) {
    assert.equal(fullRecord.corpus.length, 9, 'Missing full-corpus measurements')
    assert.equal(fullRecord.tiers.length, 3, 'Missing PHP tier measurements')
    assert.deepEqual(fullRecord.corpus.map(row => `${row.document}:${row.engine}`).sort(),
      ['small', 'medium', 'large'].flatMap(size => ['js', 'php', 'rs'].map(engine => `corpus/${size}.crv:carve-${engine}`)).sort(), 'Invalid full-corpus coverage')
    assert.deepEqual(fullRecord.tiers.map(row => row.profile).sort(), ['tier1', 'tier2', 'tier3'], 'Invalid PHP tier coverage')
    const measured = {}
    for (const row of [...fullRecord.corpus, ...fullRecord.tiers]) {
      assert.ok(Number.isFinite(row.ms_per_op) && row.ms_per_op > 0 && Number.isFinite(row.mb_per_s) && row.mb_per_s > 0, 'Invalid full-corpus timing')
      const engine = row.engine?.slice(6) ?? 'php'
      assert.ok(['js', 'php', 'rs'].includes(engine), 'Invalid full-corpus engine')
      const commit = row.carve_source.match(/ @ ([0-9a-f]{9,40})\)$/)?.[1]
      assert.ok(commit && fullRecord.metadata.source_commits[engine].commit.startsWith(commit), 'Full worker and recorded commits differ')
      assert.ok(!measured[engine] || measured[engine] === row.carve_source, 'Mixed full-corpus sources')
      measured[engine] = row.carve_source
    }
    assert.deepEqual(measured, identities(engines), 'Full report and worker sources differ')
    for (const row of fullRecord.corpus) {
      const size = row.document.match(/corpus\/(\w+)\.crv$/)[1]
      const table = full.find(group => group.title.startsWith(`${size} (`)).tables[0]
      const published = table.rows.find(cells => cells[0] === row.engine)
      assert.deepEqual(published?.slice(1, 3), [row.ms_per_op.toFixed(4), row.mb_per_s.toFixed(2)], 'Full report and worker timings differ')
    }
    const tiers = full.find(group => group.title === 'PHP authoritative extension tiers')?.tables[0]
    assert.ok(tiers && tiers.rows.length === 3, 'Missing published PHP tiers')
    for (const row of fullRecord.tiers) {
      const index = ['tier1', 'tier2', 'tier3'].indexOf(row.profile)
      assert.deepEqual(tiers.rows[index].slice(2, 4), [row.ms_per_op.toFixed(2), row.mb_per_s.toFixed(2)], 'PHP tier report and worker timings differ')
    }
  } else {
    assert.deepEqual(coreIdentities, identities(engines), 'Core and full engine sources differ')
  }
  const peerVersions = comparison.match(/Locked comparison versions: ([\s\S]+?)The Carve engines/)?.[1].trim().replace(/\s+/g, ' ')
  assert.ok(peerVersions, 'Missing core peer versions')
  const smallInputNote = results.includes('Small-input timings are unstable.') ? 'Small-input timings are unstable.' : null
  const smallInputEvidence = results.match(/^Small-input timings are unstable\..*?\[[^\]]+\]\((reports\/[^)]+)\)/m)?.[1] ?? 'reports/performance-refresh.md'
  return { revision, headline, peers, core, full, run, corpus, engines, host, peerVersions, smallInputNote, smallInputEvidence }
}

const escape = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const table = ({ headers, rows }) => `<div class="table-scroll"><table><thead><tr>${headers.map(header => `<th scope="col">${escape(header)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map((cell, index) => `<${index ? 'td' : 'th scope="row"'}>${escape(cell)}</${index ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</tbody></table></div>`
const chart = (name, alt) => `<figure><img loading="lazy" src="charts/${name}.svg" alt="${escape(alt)}"><figcaption><a href="charts/${name}.svg" download>Download SVG</a></figcaption></figure>`

export function build(root, destination) {
  const read = file => readFileSync(resolve(root, file), 'utf8')
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
  const fullRecord = existsSync(resolve(root, 'reports/dev-main-full.json')) ? JSON.parse(read('reports/dev-main-full.json')) : null
  const data = collect(read('COMPARISON.md'), read('RESULTS.md'), revision, fullRecord)
  const mainRecord = existsSync(resolve(root, 'reports/dev-main-core.json')) ? JSON.parse(read('reports/dev-main-core.json')) : null
  if (mainRecord) {
    if (fullRecord) {
      for (const engine of ['js', 'php', 'rs']) {
        assert.equal(fullRecord.metadata.source_commits[engine].commit, mainRecord.metadata.carve_main[engine].commit, 'Core and full main commits differ')
      }
    }
    const rows = finalCommonmarkResults(mainRecord)
    data.peers = rows.map(row => ({ language: mainRecord.final.find(item => item.engine === row.engine).language, engine: row.engine, throughput: row.mb_per_s }))
    data.coreTitle = `With pipe tables · 18 points (${mainRecord.metadata.generated_at.slice(0, 10)}, Carve dev-main)`
    data.coreStatistic = 'Median timing across fourteen samples'
    data.coreSources = mainRecord.metadata.carve_main
    data.core = ['JavaScript', 'PHP', 'Rust'].map(title => ({ title, tables: [{ headers: ['Engine', 'MB/s'], rows: data.peers.filter(row => row.language === title).map(row => [row.engine, row.throughput.toFixed(2)]) }] }))
    data.headline = { headers: ['Language', 'Carve', 'MB/s', 'Fastest peer', 'Peer MB/s'], rows: ['JavaScript', 'PHP', 'Rust'].map(language => {
      const peers = data.peers.filter(row => row.language === language)
      const carve = peers.find(row => row.engine.startsWith('carve-'))
      const best = peers.filter(row => !row.engine.startsWith('carve-')).sort((a, b) => b.throughput - a.throughput)[0]
      return [language, carve.engine, carve.throughput.toFixed(2), best.engine, best.throughput.toFixed(2)]
    }) }
    data.host = `${mainRecord.metadata.generated_at}; ${mainRecord.metadata.cpu}; Node ${mainRecord.metadata.node}; PHP ${mainRecord.metadata.php}; ${mainRecord.metadata.rust}; ${affinityDescription(mainRecord.metadata.cpu_affinity)}`
    const jsPackages = JSON.parse(read('engines/js/package-lock.json')).packages
    data.peerVersions = 'djot.js ' + jsPackages['node_modules/@djot/djot'].version + '; markdown-it ' + jsPackages['node_modules/markdown-it'].version + '; Djot PHP ' + mainRecord.metadata.php_dependencies['php-collective/djot'].reference + '; league/commonmark ' + mainRecord.metadata.php_dependencies['league/commonmark'].version + '. Carve source commits: ' + Object.entries(mainRecord.metadata.carve_main).map(([engine, value]) => engine + ' ' + value.commit).join('; ') + '. Rust peer versions are recorded in the downloadable Cargo lock.'
  }
  const sharedRecord = existsSync(resolve(root, 'reports/commonmark-js.json')) ? JSON.parse(read('reports/commonmark-js.json')) : null
  const finalRows = sharedRecord ? finalCommonmarkResults(sharedRecord) : []
  data.commonmarkLanes = finalRows.length ? [{
    title: `JavaScript without pipe tables · 14 points (${sharedRecord.metadata.generated_at.slice(0, 10)}${sharedRecord.metadata.carve_main ? ', Carve main ' + sharedRecord.metadata.carve_main.commit.slice(0, 7) : ''})`,
    statistic: 'Median timing across all samples from both measurement rounds',
    peers: finalRows.map(row => ({ language: 'JavaScript', engine: row.engine, throughput: row.mb_per_s })),
  }] : []
  for (const row of [...data.peers, ...data.commonmarkLanes.flatMap(lane => lane.peers)]) row.label = engineLabel(row.engine, row.language)
  const finalTable = { headers: ['Engine', 'Median ms/op', 'MB/s'], rows: finalRows.map(row => [row.engine, row.ms_per_op.toFixed(4), row.mb_per_s.toFixed(2)]) }
  const sharedSource = sharedRecord?.metadata.carve_main ? `Carve JS uses merged main ${sharedRecord.metadata.carve_main.commit.slice(0, 7)}, with fast-path use verified. Peers use the released packages named in the report.` : 'Engines use the released packages named in the report.'
  const commonmarkSection = `<section id="commonmark"><h2>JavaScript without pipe tables</h2><p>Carve, Djot, markdown-it and commonmark.js on equivalent content. This 14-point workload excludes pipe tables and is separate from the comparison with pipe tables above. Final values use median timing across all samples from both measurement rounds. ${escape(sharedSource)}</p>${finalRows.length ? table(finalTable) : '<p>No qualified timing snapshot is published yet.</p>'}${finalRows.length && existsSync(resolve(root, 'charts/commonmark-js.svg')) ? chart('commonmark-js', 'Final JavaScript throughput without pipe tables') : ''}<p><a href="reports/commonmark-js.md">Method, individual rounds and measurement provenance</a>${sharedRecord ? ' · <a href="reports/commonmark-js.json" download>Raw samples and controls</a>' : ''}</p></section>`
  let pairedSection = ''
  if (existsSync(resolve(root, 'reports/paired-full-feature.json'))) {
    const pairedStem = existsSync(resolve(root, 'reports/final-audit-pairs.json')) ? 'final-audit-pairs' : 'paired-full-feature'
    const paired = JSON.parse(read(`reports/${pairedStem}.json`))
    assert.equal(paired.schema, 1)
    for (const engine of ['js', 'php', 'rs']) for (const fixture of paired.fixtures) {
      const controls = paired.controls.filter(row => row.engine === engine && row.sections === fixture.sections)
      assert.equal(controls.length, 2)
      requireMatchingOutputs(...controls)
    }
    assert.deepEqual(paired.summary, pairedSummary(paired.rows))
    const results = { headers: ['Engine', 'Sections', 'Median before ms', 'Median after ms', 'Median paired change', 'Paired range'], rows: pairedTableRows(paired.summary) }
    pairedSection = `<section id="paired-full"><h2>Paired full-feature comparison</h2><p>Before and after commits render identical output within each engine. Both use the same CPU settings, with alternating run order. This workload has closed blocks and exercises formatting, quotations, lists, tables, raw HTML and footnotes. Changes describe the observed per-round ratios, not statistical significance. Positive means more elapsed time; negative means less. The range shows variation across rounds. The median paired ratio can differ from the ratio of the two median times.</p>${table(results)}<p><a href="reports/${pairedStem}.md">Exact commits and method</a> · <a href="reports/${pairedStem}.json" download>Output controls, samples and provenance</a> · <a href="reports/${pairedStem === 'final-audit-pairs' ? 'final-audit-conversion-checks' : 'conversion-snapshot-pairs'}.md">Exact-corpus revision checks</a> · <a href="reports/paired-full-feature.md">Historical paired comparison</a> · <a href="reports/rust-core-ranking.md">Historical Rust ranking check</a></p></section>`
  }
  const source = `https://github.com/markup-carve/carve-bench/blob/${revision}`
  assert.notEqual(resolve(destination), resolve(root), 'Output must differ from source directory')
  rmSync(destination, { recursive: true, force: true })
  mkdirSync(destination, { recursive: true })
  for (const file of ['style.css', 'app.js']) cpSync(resolve(root, 'site', file), resolve(destination, file))
  cpSync(resolve(root, 'charts'), resolve(destination, 'charts'), { recursive: true })
  mkdirSync(resolve(destination, 'reports'), { recursive: true })
  for (const file of ['COMPARISON.md', 'RESULTS.md', 'README.md', 'FEATURES.md', 'FINDINGS.md']) {
    writeFileSync(resolve(destination, 'reports', file), read(file).replaceAll('(reports/', '(')
    .replaceAll('(./charts/', '(../charts/')
    .replaceAll('(site/README.md)', `(${source}/site/README.md)`)
    .replaceAll('(./COMPETITOR_ARCHITECTURE.md)', `(${source}/COMPETITOR_ARCHITECTURE.md)`)
    .replaceAll('(./ARCHITECTURE.md)', `(${source}/ARCHITECTURE.md)`)
    .replaceAll('(docs/php-snapshot-check.md)', `(${source}/docs/php-snapshot-check.md)`)
    .replaceAll('(scripts/deep-review/README.md)', `(${source}/scripts/deep-review/README.md)`))
    if (['COMPARISON.md', 'RESULTS.md'].includes(file)) writeFileSync(resolve(destination, file), read(file).replaceAll('(./FINDINGS.md', '(reports/FINDINGS.md').replaceAll('(./COMPETITOR_ARCHITECTURE.md)', `(${source}/COMPETITOR_ARCHITECTURE.md)`))
  }
  for (const file of [...readdirSync(resolve(root, 'reports')).filter(file => /^(?:final-audit-(?:pairs|conversion-checks)|conversion-snapshot-pairs|rust-core-ranking|php-large-(?:jit-output|memory)-control|paired-full-feature(?:-[0-9T]+)?|(?:commonmark-js|dev-main-core|dev-main-full)-(?:pre-final-audit|pre-audit|audit)-\d{8})\.(json|md)$/.test(file)), 'latest-main-comparison.md', 'latest-main-comparison.csv', 'merged-core-peers.md', 'merged-core-peers.json', 'merged-core-peers.csv', 'dev-main-full-output-controls.json', 'dev-main-full.json', 'dev-main-rust.Cargo.lock', 'dev-main-rust-audit-20261006.Cargo.lock', 'dev-main-rust-pre-final-audit-20261007.Cargo.lock', 'dev-main-core.md', 'dev-main-core.json', 'performance-refresh.md', 'performance-refresh.json', 'small-corpus-check.json', 'full-corpus-initial.json', 'commonmark-js.md', 'commonmark-js.json', 'commonmark-js-release-0.1.9.md', 'commonmark-js-release-0.1.9.json']) {
    if (existsSync(resolve(root, 'reports', file))) cpSync(resolve(root, 'reports', file), resolve(destination, 'reports', file))
  }
  const historyPath = resolve(root, 'reports/engine-history.json')
  let historySection = ''
  if (existsSync(historyPath)) {
    const history = JSON.parse(read('reports/engine-history.json'))
    assert.equal(history.schema, 1, 'Unknown engine history schema')
    assert.ok(history.measurement_signature, 'Missing history timing signature')
    for (const [engine, snapshot] of Object.entries(history.engines)) {
      const main = snapshot.revisions.find(row => row.label === 'dev-main') ?? snapshot.main_alias
      if (mainRecord && main) assert.equal(main.sha, mainRecord.metadata.carve_main[engine].commit, 'History and core main commits differ')
      const file = { js: 'worker.mjs', php: 'worker.php', rs: 'worker.rs' }[engine]
      const hash = createHash('sha256').update(read(`scripts/history/${file}`)).digest('hex')
      assert.equal((snapshot.measurement_session ?? history).harness_sha256[file], hash, `Engine history used a different ${file}; refresh measurements`)
    }
    const publishedHistory = resolve(destination, 'reports/engine-history.json')
    cpSync(historyPath, publishedHistory)
    execFileSync('python3', [resolve(root, 'scripts/history/report.py'), publishedHistory])
    historySection = `<section id="history"><h2>Engine release history</h2><p>${history.tags_per_engine} tags per engine, a pinned development main when its measured source differs, and candidate PRs when requested. Compare elapsed time within each engine; graphs mark changed output.</p><p><a href="reports/engine-history.html">Explore the version history</a> · <a href="reports/engine-history.csv" download>History CSV</a> · <a href="reports/engine-history.json" download>Samples and source commits</a></p>${Object.keys(history.engines).map(engine => `<figure><img loading="lazy" src="reports/engine-history-${escape(engine)}.svg" alt="${escape(engine)} elapsed time across release tags, development main and candidate PRs"><figcaption><a href="reports/engine-history-${escape(engine)}.svg" download>Download ${escape(engine)} history SVG</a></figcaption></figure>`).join('')}</section>`
  }
  writeFileSync(resolve(destination, 'evidence.json'), JSON.stringify(data, null, 2) + '\n')
  writeFileSync(resolve(destination, 'core-throughput.csv'), 'Language,Engine,MB/s\n' + data.peers.map(row => [row.language, row.engine, row.throughput].join(',')).join('\n') + '\n')
  const fullTables = data.full.map(group => `<h3>${escape(group.title)}</h3>${group.tables.map(table).join('')}`).join('')
  const smallInputNote = data.smallInputNote ? `<p>${escape(data.smallInputNote)} <a href="${escape(data.smallInputEvidence)}" download>Download the diagnostic report</a>.</p>` : ''
  const coreTables = data.core.filter(group => ['JavaScript', 'PHP', 'Rust'].includes(group.title)).map(group => `<section class="language-table" data-language="${escape(group.title)}"><h3>${escape(group.title)}</h3>${group.tables.map(table).join('')}</section>`).join('')
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Carve engine benchmarks, measured development snapshots, and downloadable charts."><title>Carve benchmarks</title><link rel="stylesheet" href="style.css"><script src="app.js" defer></script></head>
<body><a class="skip" href="#main">Skip to results</a><header><a class="brand" href="./">Carve / benchmarks</a><nav aria-label="Sections"><a href="#core">Core conversion</a><a href="#full">Stress corpus</a>${pairedSection ? '<a href="#paired-full">Paired comparison</a>' : ''}<a href="#method">Method &amp; sources</a>${historySection ? '<a href="#history">History</a>' : ''}<a href="https://markup-carve.github.io/carve-proofs/">Proofs</a><a href="https://github.com/markup-carve/carve-bench">GitHub</a></nav></header>
<main id="main"><section class="intro"><p class="eyebrow">Recorded performance evidence</p><h1>How fast does Carve render?</h1><p>Measured engine snapshots on shared hardware. Explore the default conversion route and the full language corpus separately.</p><p class="run">${escape(data.run)}</p></section>
<section id="core"><p class="eyebrow">Track A</p><h2>Core source to HTML</h2><p>Default public conversion APIs, without opt-in extensions. Peers use equivalent logical content in their native syntax. Features and output differ; these rows measure rendering cost.</p>${table({...data.headline, headers: data.headline.headers.map((header, index) => header === 'MB/s' ? (index === 2 ? 'Carve MB/s' : 'Peer MB/s') : header)})}
<div class="chart-controls"><span id="filter-controls" hidden><label for="language">Compare language</label><select id="language"><option value="all">All languages</option><option>JavaScript</option><option>PHP</option><option>Rust</option></select></span><a href="core-throughput.csv" download>CSV with pipe tables</a><a href="evidence.json" download>Snapshot JSON</a></div>
<p id="filter-status" class="visually-hidden" role="status"></p><div id="interactive-chart"></div>${chart('core-throughput', 'Core conversion throughput with and without pipe tables, in separate panels')}${chart('carve-core-throughput', 'Carve core throughput with pipe tables')}${coreTables}<p><a href="${source}/COMPARISON.md">Historical release comparison and capability scoring</a> · <a href="reports/dev-main-core.md">Current dev-main measurement report</a></p></section>
${commonmarkSection}
${pairedSection}
<section id="full"><p class="eyebrow">Track B</p><h2>Concatenated corpus stress test and extension tiers</h2><p>This corpus joins independent conformance examples into one document. Open fences and containers can interact, so correctness fixes may change the output and nesting. It exercises the normal parser and public AST and is separate from the paired comparison above. Competitor parsers do not accept equivalent syntax, so this track compares Carve implementations and internal PHP tiers.</p><p>Check the <a href="reports/dev-main-full-output-controls.json">output byte counts and hashes</a> before treating cross-engine times as equal work.</p><p class="provenance">${escape(data.corpus.replaceAll('`', ''))}</p>${smallInputNote}${chart('full-corpus', 'Throughput of the three Carve engines for each corpus size')}${fullTables}${chart('php-tiers', 'PHP throughput with core, Tier 2, and Tier 3 extension profiles')}<p><a href="${source}/RESULTS.md">Full corpus report</a> · <a href="reports/dev-main-full.json" download>Worker results and provenance</a></p></section>
${historySection}
<section id="method"><p class="eyebrow">Read the measurements</p><h2>Method and source commits</h2><p>Higher MB/s is better. Current core charts use median timing across fourteen warmed samples; full-corpus rows average many in-process iterations. The two tracks have different API costs and cannot be compared as equal work.</p><p>These are machine-specific snapshots. Shared host activity affects timings; controlled paired runs are needed to establish improvements or regressions.</p><h3>Core comparison host</h3><p>${escape(data.host)}</p><h3>Core peer versions</h3><p class="provenance">${escape(data.peerVersions)}</p><h3>Full-corpus engines measured</h3><p class="provenance">${escape(data.engines.replaceAll('`', ''))}</p><p>Site source: <a href="https://github.com/markup-carve/carve-bench/tree/${revision}"><code>${escape(revision)}</code></a>.</p><p><a href="${source}/README.md#running">Reproduce these runs</a> · <a href="${source}/FEATURES.md">Feature scoring</a> · <a href="${source}/docs/html-import-comparison.md">HTML import comparison</a></p><h3>Download reports</h3><p><a href="reports/dev-main-core.md" download>Current merged core peers</a> · <a href="reports/latest-main-comparison.md" download>Main versus retained tags</a> · <a href="reports/COMPARISON.md" download>Released core comparison</a> · <a href="reports/RESULTS.md" download>Full corpus</a> · <a href="reports/README.md" download>Reproduction guide</a> · <a href="reports/FEATURES.md" download>Feature scoring</a> · <a href="reports/FINDINGS.md" download>Historical findings</a> · <a href="evidence.json" download>All site data</a></p></section></main>
<footer>Built from committed reports. This site does not run benchmarks during deployment.<nav class="related" aria-label="Related sites"><a href="https://markup-carve.github.io/carve/">Docs</a><a href="https://markup-carve.github.io/carve-proofs/">Proofs</a><a href="https://markup-carve.github.io/carve-compat/">Compat</a><a href="https://markup-carve.github.io/pandoc-format-fidelity/">Fidelity</a></nav></footer></body></html>`
  writeFileSync(resolve(destination, 'index.html'), html)
  writeFileSync(resolve(destination, '.nojekyll'), '')
  return data
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  build(root, resolve(root, '_site'))
  console.log('Built benchmark site from committed reports.')
}
