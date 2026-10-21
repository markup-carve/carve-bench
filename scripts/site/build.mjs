import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync, cpSync, rmSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {displayedPhpTiers} from '../php-tier-display.mjs'
import {tierResults} from '../php-tier-results.mjs'
import { affinityDescription } from '../benchmark-metadata.mjs'
import { engineLabel } from '../engine-labels.mjs'
import { finalCommonmarkResults } from '../commonmark-results.mjs'
import { pairedSummary, pairedTableRows, requireMatchingOutputs } from '../paired-full-results.mjs'
import { directHtmlResults } from '../direct-html-display.mjs'

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

export function collect(comparison, results, revision, fullRecord = null, phpTierRecord = null) {
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
    for (const row of phpTierRecord ? displayedPhpTiers(phpTierRecord, fullRecord.metadata.source_commits.php.commit) : fullRecord.tiers) {
      const index = ['tier1', 'tier2', 'tier3'].indexOf(row.profile)
      assert.deepEqual(tiers.rows[index].slice(2, 4), [row.ms_per_op.toFixed(2), row.mb_per_s.toFixed(2)], 'PHP tier report and worker timings differ')
    }
  } else {
    assert.deepEqual(coreIdentities, identities(engines), 'Core and full engine sources differ')
  }
  const peerVersions = comparison.match(/Locked comparison versions: ([\s\S]+?)The Carve engines/)?.[1].trim().replace(/\s+/g, ' ')
  assert.ok(peerVersions, 'Missing core peer versions')
  const smallInputNote = results.includes('Small-input timings are unstable.') ? 'Small-input timings are unstable.' : null
  const smallInputEvidence = smallInputNote ? results.match(/^Small-input timings are unstable\..*?\[[^\]]+\]\((reports\/[^)]+)\)/m)?.[1] : null
  if (smallInputNote) assert.ok(smallInputEvidence, 'Small-input warning requires its diagnostic link')
  return { revision, headline, peers, core, full, run, corpus, engines, host, peerVersions, smallInputNote, smallInputEvidence }
}

const escape = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const table = ({ headers, rows }) => `<div class="table-scroll"><table><thead><tr>${headers.map(header => `<th scope="col">${escape(header)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map((cell, index) => `<${index ? 'td' : 'th scope="row"'}>${escape(cell)}</${index ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</tbody></table></div>`
const chart = (name, alt, version = '') => `<figure><img loading="lazy" src="charts/${name}.svg${version ? '?v=' + version : ''}" alt="${escape(alt)}"><figcaption><a href="charts/${name}.svg${version ? '?v=' + version : ''}" download>Download SVG</a></figcaption></figure>`

export function build(root, destination) {
  const read = file => readFileSync(resolve(root, file), 'utf8')
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
  const fullRecord = existsSync(resolve(root, 'reports/dev-main-full.json')) ? JSON.parse(read('reports/dev-main-full.json')) : null
  const phpTierRecord = existsSync(resolve(root, 'reports/php-tier-pairs.json')) ? JSON.parse(read('reports/php-tier-pairs.json')) : null
  const balancedTierRecord = existsSync(resolve(root, 'reports/php-tier-balanced.json')) ? JSON.parse(read('reports/php-tier-balanced.json')) : null
  if (balancedTierRecord) {
    assert.equal(balancedTierRecord.metadata.input_sha256, createHash('sha256').update(read(balancedTierRecord.metadata.input)).digest('hex'))
    assert.equal(balancedTierRecord.metadata.harness_sha256, createHash('sha256').update(read('engines/php/tiers-balanced.php')).digest('hex'))
  }
  if (balancedTierRecord) assert.equal(balancedTierRecord.metadata.source_commit, fullRecord?.metadata.source_commits.php.commit, 'Balanced tiers must match the fleet PHP commit')
  const currentTierRecord = balancedTierRecord ?? (phpTierRecord?.metadata.sources.published.commit === fullRecord?.metadata.source_commits.php.commit ? phpTierRecord : null)
  const data = collect(read('COMPARISON.md'), read('RESULTS.md'), revision, fullRecord, currentTierRecord)
  const mainRecord = existsSync(resolve(root, 'reports/dev-main-core.json')) ? JSON.parse(read('reports/dev-main-core.json')) : null
  const rustRecheck = existsSync(resolve(root, 'reports/rust-core-recheck-20261021.json'))
    ? JSON.parse(read('reports/rust-core-recheck-20261021.json')) : null
  const rustRerun = existsSync(resolve(root, 'reports/rust-core-recheck-20261021-rerun.json'))
    ? JSON.parse(read('reports/rust-core-recheck-20261021-rerun.json')) : null
  const phpRerunPath = existsSync(resolve(root, 'reports/php-core-quiet-20261021.json'))
    ? 'reports/php-core-quiet-20261021.json' : 'reports/php-core-recheck-20261021.json'
  const phpRerun = existsSync(resolve(root, phpRerunPath))
    ? JSON.parse(read(phpRerunPath)) : null
  let phpRerunNote = ''
  if (phpRerun) {
    if (phpRerunPath === 'reports/php-core-quiet-20261021.json') {
      assert.ok(phpRerun.metadata.load_start_1m_range[1] <= 8.2)
    }
    assert.equal(phpRerun.metadata.benchmark_snapshot_sha256, createHash('sha256').update(read('reports/dev-main-core.json')).digest('hex'))
    assert.equal(phpRerun.metadata.worker_sha256, createHash('sha256').update(read('engines/php/compare-cpu.php')).digest('hex'))
    assert.equal(phpRerun.metadata.runner_sha256, createHash('sha256').update(read('scripts/php-core-recheck.py')).digest('hex'))
    assert.equal(phpRerun.sessions.length, 2)
    for (const session of phpRerun.sessions) {
      assert.match(session.path, /^reports\/php-core-(?:recheck|quiet)-runs\/[^/]+\.json$/)
      assert.equal(session.sha256, createHash('sha256').update(read(session.path)).digest('hex'))
    }
    const phpReportPath = phpRerunPath.replace(/\.json$/, '.md')
    phpRerunNote = `<p id="php-rerun-note">The displayed PHP pair comes from a ${phpRerun.rounds.length}-round process-CPU rerun of merged carve-php <code>${escape(phpRerun.metadata.carve_engine_commit.slice(0, 8))}</code> and the locked djot-php revision. Carve used less CPU in ${phpRerun.summary.carve_faster_rounds} of ${phpRerun.rounds.length} rounds. Pooled medians were ${phpRerun.summary.engines['carve-php'].pooled_median_cpu_ms.toFixed(3)} and ${phpRerun.summary.engines['djot-php'].pooled_median_cpu_ms.toFixed(3)} ms/op. One-minute load at round starts stayed between ${phpRerun.metadata.load_start_1m_range.map(value => value.toFixed(2)).join(' and ')}. <a href="${phpReportPath}">Method and load range</a> · <a href="${phpRerunPath}" download>Raw rounds</a>.</p>`
  }
  let rustRankingNote = ''
  if (rustRecheck && mainRecord &&
      rustRecheck.metadata.rust_engine_commit === mainRecord.metadata.carve_main.rs.commit &&
      rustRecheck.metadata.binary_sha256 === mainRecord.metadata.rust_binary_sha256) {
    const median = values => {
      const sorted = [...values].sort((a, b) => a - b)
      return (sorted[(sorted.length - 1) >> 1] + sorted[sorted.length >> 1]) / 2
    }
    const engines = ['carve-rs', 'pulldown-cmark']
    assert.equal(rustRecheck.rounds.length, rustRecheck.summary.rounds)
    for (const engine of engines) {
      const control = mainRecord.controls.find(row => row.engine === engine)
      assert.equal(rustRecheck.metadata.inputs[engine].source_sha256, control.source_sha256)
      assert.equal(rustRecheck.metadata.inputs[engine].output_sha256, control.output_sha256)
      const samples = rustRecheck.rounds.flatMap(round => round.rows[engine].cpu_samples_ms)
      assert.ok(samples.every(value => Number.isFinite(value) && value > 0))
      assert.equal(median(samples), rustRecheck.summary.engines[engine].pooled_median_cpu_ms)
    }
    const fasterRounds = rustRecheck.rounds.filter(round =>
      median(round.rows['carve-rs'].cpu_samples_ms) < median(round.rows['pulldown-cmark'].cpu_samples_ms)).length
    assert.equal(fasterRounds, rustRecheck.summary.carve_faster_rounds)
    rustRankingNote = `<p id="rust-ranking-note">The archived Rust wall-time snapshot came from a loaded two-round run (one-minute host load ${mainRecord.metadata.load_start[0].toFixed(2)}). An eight-round recheck with the same binary found carve-rs faster in ${fasterRounds} of ${rustRecheck.rounds.length} rounds, at ${rustRecheck.summary.engines['carve-rs'].pooled_median_cpu_ms.toFixed(3)} versus ${rustRecheck.summary.engines['pulldown-cmark'].pooled_median_cpu_ms.toFixed(3)} process CPU ms/op. The direct-HTML chart uses process CPU time from the verified 24-round rerun for these two Rust rows. <a href="reports/rust-core-recheck-20261021.md">First recheck</a>.</p>`
    if (rustRerun) {
      assert.equal(rustRerun.metadata.rust_engine_commit, rustRecheck.metadata.rust_engine_commit)
      assert.equal(rustRerun.metadata.binary_sha256, rustRecheck.metadata.binary_sha256)
      assert.deepEqual(rustRerun.metadata.inputs, rustRecheck.metadata.inputs)
      assert.equal(rustRerun.rounds.length, rustRerun.summary.rounds)
      for (const engine of engines) {
        const samples = rustRerun.rounds.flatMap(round => round.rows[engine].cpu_samples_ms)
        assert.ok(samples.every(value => Number.isFinite(value) && value > 0))
        assert.equal(median(samples), rustRerun.summary.engines[engine].pooled_median_cpu_ms)
      }
      const wins = rustRerun.rounds.filter(round =>
        median(round.rows['carve-rs'].cpu_samples_ms) < median(round.rows['pulldown-cmark'].cpu_samples_ms)).length
      assert.equal(wins, rustRerun.summary.carve_faster_rounds)
      rustRankingNote += `<p id="rust-rerun-note">The displayed 24-round paired run of that binary found carve-rs faster in ${wins} of ${rustRerun.rounds.length} rounds. Pooled process CPU time was ${rustRerun.summary.engines['carve-rs'].pooled_median_cpu_ms.toFixed(3)} ms/op for carve-rs and ${rustRerun.summary.engines['pulldown-cmark'].pooled_median_cpu_ms.toFixed(3)} ms/op for pulldown-cmark. This measures the two Rust libraries on the core fixture; the shared host remained busy. <a href="reports/rust-core-recheck-20261021-rerun.md">Rerun method</a> · <a href="reports/rust-core-recheck-20261021-rerun.json" download>Raw rounds</a>.</p>`
    }
  }
  if (mainRecord) {
    if (fullRecord) {
      for (const engine of ['js', 'php', 'rs']) {
        assert.equal(fullRecord.metadata.source_commits[engine].commit, mainRecord.metadata.carve_main[engine].commit, 'Core and full main commits differ')
      }
    }
    const rows = directHtmlResults(mainRecord, rustRerun, phpRerun)
    data.peers = rows.map(row => ({ language: mainRecord.final.find(item => item.engine === row.engine).language, engine: row.engine, throughput: row.mb_per_s }))
    data.coreTitle = `With pipe tables · 18 points (${mainRecord.metadata.generated_at.slice(0, 10)} snapshot with verified pair reruns)`
    data.coreStatistic = phpRerun
      ? `Median process CPU time; 24 paired Rust rounds, ${phpRerun.rounds.length} paired PHP rounds, two recorded rounds for JavaScript and other peers`
      : 'Median process CPU time; 24 paired rounds for carve-rs and pulldown-cmark, two recorded rounds for other engines'
    data.coreSources = { ...mainRecord.metadata.carve_main }
    if (phpRerun) data.coreSources.php = { repository: data.coreSources.php.repository, commit: phpRerun.metadata.carve_engine_commit, kind: 'merged-main' }
    data.core = ['JavaScript', 'PHP', 'Rust'].map(title => ({ title, tables: [{ headers: ['Engine', 'MB/s'], rows: data.peers.filter(row => row.language === title).map(row => [row.engine, row.throughput.toFixed(2)]) }] }))
    data.headline = { headers: ['Language', 'Carve', 'MB/s', 'Fastest peer', 'Peer MB/s'], rows: ['JavaScript', 'PHP', 'Rust'].map(language => {
      const peers = data.peers.filter(row => row.language === language)
      const carve = peers.find(row => row.engine.startsWith('carve-'))
      const best = peers.filter(row => !row.engine.startsWith('carve-')).sort((a, b) => b.throughput - a.throughput)[0]
      return [language, carve.engine, carve.throughput.toFixed(2), best.engine, best.throughput.toFixed(2)]
    }) }
    data.host = `${mainRecord.metadata.generated_at}; ${mainRecord.metadata.cpu}; Node ${mainRecord.metadata.node}; PHP ${mainRecord.metadata.php}; ${mainRecord.metadata.rust}; ${affinityDescription(mainRecord.metadata.cpu_affinity)}${phpRerun ? `; PHP pair completed ${phpRerun.metadata.completed_at}` : ''}`
    const jsPackages = JSON.parse(read('engines/js/package-lock.json')).packages
    data.peerVersions = 'djot.js ' + jsPackages['node_modules/@djot/djot'].version + '; markdown-it ' + jsPackages['node_modules/markdown-it'].version + '; Djot PHP ' + mainRecord.metadata.php_dependencies['php-collective/djot'].reference + '; league/commonmark ' + mainRecord.metadata.php_dependencies['league/commonmark'].version + '. Carve source commits: ' + Object.entries(data.coreSources).map(([engine, value]) => engine + ' ' + value.commit).join('; ') + '. Rust peer versions are recorded in the downloadable Cargo lock.'
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
  for (const file of [...readdirSync(resolve(root, 'reports')).filter(file => /^(?:final-audit-(?:pairs|conversion-checks)(?:-pre-queue-audit-\d{8})?|engine-history-pre-queue-audit-\d{8}|conversion-snapshot-pairs|rust-core-ranking|php-large-(?:jit-output|memory)-control|paired-full-feature(?:-[0-9T]+)?|(?:commonmark-js|dev-main-core|dev-main-full(?:-output-controls)?|php-tier-pairs)-(?:pre-postfix|pre-queue-audit|pre-final-audit|pre-audit|audit)-\d{8})\.(json|md)$/.test(file)), 'realistic-engine.md', 'realistic-engine.json', 'realistic-output-control.json', 'rust-core-recheck-20261021.md', 'rust-core-recheck-20261021.json', 'rust-core-recheck-20261021-rerun.md', 'rust-core-recheck-20261021-rerun.json', 'engine-history-audit-20261020.md', 'engine-history-audit-js-20261020.json', 'engine-history-audit-js-merged-128-20261020.json', 'engine-history-audit-js-11d-128-20261020.json', 'engine-history-audit-php-20261020.json', 'engine-history-audit-php-merged-1024-20261020.json', 'engine-history-audit-php-ee152-1024-20261020.json', 'engine-history-audit-rs-128-20261020.json', 'engine-history-audit-rs-1024-20261020.json', 'php-tiers-unpaired-20261015.md', 'php-tiers-unpaired-20261015.json', 'php-tier-pairs.md', 'php-tier-pairs.json', 'php-tier-balanced.json', 'latest-main-comparison.md', 'latest-main-comparison.csv', 'merged-core-peers.md', 'merged-core-peers.json', 'merged-core-peers.csv', 'dev-main-full-output-controls.json', 'dev-main-full.json', 'dev-main-rust.Cargo.lock', 'dev-main-rust-audit-20261006.Cargo.lock', 'dev-main-rust-pre-final-audit-20261007.Cargo.lock', 'dev-main-rust-pre-queue-audit-20261007.Cargo.lock', 'dev-main-core.md', 'dev-main-core.json', 'performance-refresh.md', 'performance-refresh.json', 'small-corpus-check.json', 'full-corpus-initial.json', 'commonmark-js.md', 'commonmark-js.json', 'commonmark-js-release-0.1.9.md', 'commonmark-js-release-0.1.9.json']) {
    if (existsSync(resolve(root, 'reports', file))) cpSync(resolve(root, 'reports', file), resolve(destination, 'reports', file))
  }
  for (const file of ['realistic-peer.crv', 'realistic-peer.json', 'realistic-peer-routes.json'])
    cpSync(resolve(root, 'reports', file), resolve(destination, 'reports', file))
  for (const file of ['php-core-recheck-20261021.md', 'php-core-recheck-20261021.json', 'php-core-quiet-20261021.md', 'php-core-quiet-20261021.json'])
    if (existsSync(resolve(root, 'reports', file))) cpSync(resolve(root, 'reports', file), resolve(destination, 'reports', file))
  if (phpRerun) cpSync(resolve(root, 'reports/php-core-recheck-runs'), resolve(destination, 'reports/php-core-recheck-runs'), { recursive: true })
  if (existsSync(resolve(root, 'reports/php-core-quiet-runs'))) cpSync(resolve(root, 'reports/php-core-quiet-runs'), resolve(destination, 'reports/php-core-quiet-runs'), { recursive: true })
  cpSync(resolve(root, 'reports/realistic-peer-runs'), resolve(destination, 'reports/realistic-peer-runs'), { recursive: true })
  mkdirSync(resolve(destination, 'corpus/realistic'), { recursive: true })
  cpSync(resolve(root, 'corpus/realistic/peer'), resolve(destination, 'corpus/realistic/peer'), { recursive: true })
  writeFileSync(resolve(destination, 'reports/realistic-engine.md'), read('reports/realistic-engine.md')
    .replaceAll('../corpus/realistic/provenance.json', `${source}/corpus/realistic/provenance.json`)
    .replaceAll('../scripts/realistic/run.py', `${source}/scripts/realistic/run.py`))
  if (data.smallInputNote)
    assert.ok(existsSync(resolve(destination, data.smallInputEvidence.split('#')[0])), 'Small-input diagnostic must be published with the site')
  const historyPath = resolve(root, 'reports/engine-history.json')
  let historySection = ''
  if (existsSync(historyPath)) {
    const history = JSON.parse(read('reports/engine-history.json'))
    assert.equal(history.schema, 1, 'Unknown engine history schema')
    assert.ok(history.measurement_signature, 'Missing history timing signature')
    for (const [engine, snapshot] of Object.entries(history.engines)) {
      const main = snapshot.revisions.find(row => row.label === 'dev-main') ?? snapshot.main_alias
      if (mainRecord && main) assert.match(main.sha, /^[a-f0-9]{40}$/, 'History main needs a pinned commit')
      const file = { js: 'worker.mjs', php: 'worker.php', rs: 'worker.rs' }[engine]
      const hash = createHash('sha256').update(read(`scripts/history/${file}`)).digest('hex')
      assert.equal((snapshot.measurement_session ?? history).harness_sha256[file], hash, `Engine history used a different ${file}; refresh measurements`)
    }
    const refreshDates = ['js', 'php', 'rs'].map(engine => history.engines[engine].point_sessions?.['dev-main']?.finished_at?.slice(0, 10))
    assert.ok(refreshDates.every(Boolean) && new Set(refreshDates).size === 1, 'Merged main history sessions need one recorded refresh date')
    assert.ok(history.generated_at.slice(0, 10) < refreshDates[0], 'Release-tag session must predate the merged-main refresh')
    const publishedHistory = resolve(destination, 'reports/engine-history.json')
    cpSync(historyPath, publishedHistory)
    execFileSync('python3', [resolve(root, 'scripts/history/report.py'), publishedHistory])
    historySection = `<section id="history"><h2>Engine release history</h2><p>Release-tag rows retain their ${escape(history.generated_at.slice(0, 10))} sessions. Merged main points were refreshed ${escape(refreshDates[0])} at pinned commits. Compare elapsed time within each engine; graphs mark changed output. Separate sessions do not isolate code speedups.</p><p>The broad JavaScript rise against 0.1.9 did not repeat across ordinary cases in a fresh paired run. PHP's quoted-fence rise did repeat; merged <a href="https://github.com/markup-carve/carve-php/pull/3595">PR #3595</a> and <a href="https://github.com/markup-carve/carve-php/pull/3598">PR #3598</a> reduced it. The pinned Rust recheck was faster than 0.1.6 on quoted fences and mixed documents; the latest 0.1.10 tag is close. The <a href="reports/engine-history-audit-20261020.md">paired history check</a> shows the sources and samples; the <a href="reports/realistic-engine.md">dated structured-document run</a> is measured separately.</p><p><a href="reports/engine-history.html">Explore the dated version history</a> · <a href="reports/engine-history.csv" download>History CSV</a> · <a href="reports/engine-history.json" download>Samples and source commits</a></p>${Object.keys(history.engines).map(engine => `<figure><img loading="lazy" src="reports/engine-history-${escape(engine)}.svg" alt="${escape(engine)} elapsed time across release tags and pinned merged main"><figcaption><a href="reports/engine-history-${escape(engine)}.svg" download>Download ${escape(engine)} history SVG</a></figcaption></figure>`).join('')}</section>`
  }
  writeFileSync(resolve(destination, 'evidence.json'), JSON.stringify(data, null, 2) + '\n')
  writeFileSync(resolve(destination, 'core-throughput.csv'), 'Language,Engine,MB/s\n' + data.peers.map(row => [row.language, row.engine, row.throughput].join(',')).join('\n') + '\n')
  const fullTables = data.full.map(group => `<h3>${escape(group.title)}</h3>${group.tables.map(table).join('')}`).join('')
  let phpTierNote = ''
  if (existsSync(resolve(root, 'reports/php-tier-pairs.json'))) {
    const diagnostic = JSON.parse(read('reports/php-tier-pairs.json'))
    const summary = tierResults(diagnostic)
    assert.deepEqual(diagnostic.summary, summary)
    assert.ok(fullRecord, 'Tier follow-up requires the full-corpus source record')
    const previous = JSON.parse(read('reports/dev-main-full-pre-postfix-20261015.json'))
    assert.equal(diagnostic.metadata.sources.previous.commit, previous.metadata.source_commits.php.commit)
    assert.equal(diagnostic.report_md_sha256, createHash('sha256').update(read('reports/php-tier-pairs.md')).digest('hex'))
    assert.equal(summary.length, 6)
    assert.equal(fullRecord.tiers.length, 3, 'Missing current unpaired PHP tiers')
    phpTierNote = currentTierRecord?.metadata.source_commit
      ? '<p>The PHP tier table and chart use <a href="reports/php-tier-balanced.json">15 alternating rounds in one PHP process</a> at the current PHP commit. Tier 1 and Tier 2 render identical HTML on this input. Tier 3 changes output. The earlier separate-process measurements remain available.</p>'
      : currentTierRecord
      ? '<p>The PHP tier table and chart use the <a href="reports/php-tier-pairs.md">balanced paired recheck</a> at the same PHP commit. Values are medians of eight round medians. Current unpaired full-run observations and <a href="reports/php-tiers-unpaired-20261015.md">earlier unpaired observations</a> are preserved separately.</p>'
      : '<p>The PHP tier table and chart use the current unpaired full-run observations. The <a href="reports/php-tier-pairs.md">balanced paired recheck</a> measured an earlier PHP commit and remains available as historical evidence.</p>'
  }
  const smallInputNote = data.smallInputNote ? `<p>${escape(data.smallInputNote)} <a href="${escape(data.smallInputEvidence)}" download>Download the diagnostic report</a>.</p>` : ''
  const coreTables = data.core.filter(group => ['JavaScript', 'PHP', 'Rust'].includes(group.title)).map(group => `<section class="language-table" data-language="${escape(group.title)}"><h3>${escape(group.title)}</h3>${group.tables.map(table).join('')}</section>`).join('')
  const realistic = JSON.parse(read('reports/realistic-engine.json'))
  const realisticOutputs = JSON.parse(read('reports/realistic-output-control.json'))
  const realisticProvenance = JSON.parse(read('corpus/realistic/provenance.json'))
  const realisticPins = JSON.parse(read('scripts/realistic/pins.json'))
  const jsHistoryAudit = JSON.parse(read('reports/engine-history-audit-js-11d-128-20261020.json'))
  assert.equal(jsHistoryAudit.engines.js.revisions.find(row => row.label === 'dev-main')?.sha, '11d44740af97baf1acf4967e2415ec6377643d8e')
  const jsVerseRows = ['old019', 'dev-main'].map(revision => jsHistoryAudit.engines.js.rows.find(row => row.revision === revision && row.case === 'verse_equivalent' && row.n === 128))
  assert.ok(jsVerseRows.every(Boolean))
  assert.equal(jsVerseRows[0].output_sha256, jsVerseRows[1].output_sha256)
  assert.deepEqual(jsVerseRows.map(row => row.median_ms.toFixed(3)), ['0.758', '0.772'])
  const jsQuoteRows = ['old019', 'dev-main'].map(revision => jsHistoryAudit.engines.js.rows.find(row => row.revision === revision && row.case === 'quoted_fences' && row.n === 128))
  assert.ok(jsQuoteRows.every(Boolean))
  assert.equal(jsQuoteRows[0].output_sha256, jsQuoteRows[1].output_sha256)
  assert.deepEqual(jsQuoteRows.map(row => row.median_ms.toFixed(3)), ['0.328', '0.269'])
  const phpHistoryAudit = JSON.parse(read('reports/engine-history-audit-php-ee152-1024-20261020.json'))
  assert.equal(phpHistoryAudit.engines.php.revisions.find(row => row.label === 'dev-main')?.sha, 'ee152759198a90683b9ab717e20e2b83c6033966')
  const phpQuoteRows = ['old019', '0.1.13', 'dev-main'].map(revision => phpHistoryAudit.engines.php.rows.find(row => row.revision === revision && row.case === 'quoted_fences' && row.n === 1024))
  assert.ok(phpQuoteRows.every(Boolean))
  assert.equal(new Set(phpQuoteRows.map(row => row.output_sha256)).size, 1)
  assert.deepEqual(phpQuoteRows.map(row => row.median_ms.toFixed(2)), ['6.24', '19.84', '11.46'])
  assert.equal(realistic.schema, 2)
  assert.equal(realistic.order, 'fixtures and engines rotate one position per round')
  assert.deepEqual(realistic.source_commits, realisticPins)
  assert.deepEqual(realisticOutputs.source_commits, realisticPins)
  assert.equal(realistic.fixture_provenance_sha256, createHash('sha256').update(read('corpus/realistic/provenance.json')).digest('hex'))
  assert.equal(realistic.rows.length, realisticProvenance.fixtures.length * 3)
  assert.equal(realisticOutputs.rows.length, realisticProvenance.fixtures.length)
  for (const [file, hash] of Object.entries(realistic.harness_sha256))
    assert.equal(createHash('sha256').update(read(file)).digest('hex'), hash)
  const realisticRows = realisticProvenance.fixtures.map(fixture => {
    assert.equal(createHash('sha256').update(read(fixture.fixture)).digest('hex'), fixture.fixture_sha256)
    const outputs = realisticOutputs.rows.find(row => row.document === fixture.name)
    assert.equal(outputs?.fixture_sha256, fixture.fixture_sha256)
    assert.equal(outputs.js_sha256, outputs.rs_sha256)
    assert.equal(outputs.php_bytes, outputs.js_bytes + 1)
    const rows = realistic.rows.filter(row => row.document === fixture.name)
    assert.deepEqual(rows.map(row => row.engine).sort(), ['js', 'php', 'rs'])
    assert.ok(rows.every(row => row.route === 'ast' && row.rounds.length === realistic.rounds && row.rounds.every(round => round.samples_ms.length === realistic.samples_per_round && round.cpu_samples_ms.length === realistic.samples_per_round && round.output_sha256 === row.output_sha256)))
    const byEngine = Object.fromEntries(rows.map(row => [row.engine, row]))
    assert.equal(byEngine.js.output_sha256, outputs.js_sha256)
    assert.equal(byEngine.php.output_sha256, outputs.php_serialized_sha256)
    assert.equal(byEngine.rs.output_sha256, outputs.rs_sha256)
    return [fixture.name, `${(fixture.fixture_bytes / 1024).toFixed(1)} KiB`, ...['js', 'php', 'rs'].map(engine => byEngine[engine].median_cpu_ms < 1 ? byEngine[engine].median_cpu_ms.toFixed(3) : byEngine[engine].median_cpu_ms.toFixed(2))]
  })
  const roundRangeRows = realisticProvenance.fixtures.flatMap(fixture => ['js', 'php', 'rs'].map(engine => {
    const row = realistic.rows.find(item => item.document === fixture.name && item.engine === engine)
    const medians = row.rounds.map(round => round.median_cpu_ms)
    const fmt = value => value < 1 ? value.toFixed(3) : value.toFixed(2)
    return [fixture.name, { js: 'JavaScript', php: 'PHP', rs: 'Rust' }[engine], `${fmt(Math.min(...medians))}–${fmt(Math.max(...medians))}`]
  }))
  const realisticSection = `<section id="realistic"><p class="eyebrow">Track C</p><h2>Structured document conversion (AST)</h2><p>Three public Carve documentation files were adapted to Carve once and saved as fixed inputs. All three pinned engines took the full parse route for every complete file. JavaScript and Rust produced identical HTML bytes; PHP added one final newline. This measures real prose, examples, links, and document structure through the default source-to-HTML API. The fixed documents show conversion cost for authored prose and structure; they do not measure how often users take this route.</p>${table({ headers: ['Document', 'Size', 'JavaScript CPU ms/op', 'PHP CPU ms/op', 'Rust CPU ms/op'], rows: realisticRows })}${chart('realistic-full-parse', 'Median process CPU time on three adapted documentation files, with a logarithmic axis')}<details><summary>Round median ranges</summary>${table({ headers: ['Document', 'Engine', 'Range, CPU ms/op'], rows: roundRangeRows })}</details><p>Measured ${escape(realistic.generated_at.slice(0, 10))}. Lower process CPU milliseconds are faster. The chart has a logarithmic axis; the table gives exact medians. Elapsed wall samples remain in the raw data. ${realistic.rounds} rotating rounds used ${realistic.samples_per_round} warmed samples each. <a href="reports/realistic-engine.md">Method and pinned commits</a> · <a href="reports/realistic-engine.json" download>Raw samples</a> · <a href="reports/realistic-output-control.json" download>Output controls</a> · <a href="${source}/corpus/realistic/provenance.json">Fixture provenance</a></p></section>`
  const peerRecord = JSON.parse(read('reports/realistic-peer.json'))
  const peerRoutes = JSON.parse(read('reports/realistic-peer-routes.json'))
  const peerProvenance = JSON.parse(read('corpus/realistic/peer/provenance.json'))
  assert.equal(peerRecord.schema, 1)
  assert.deepEqual(peerRecord.source_commits, JSON.parse(read('scripts/realistic/peer-pins.json')))
  assert.deepEqual(peerRoutes.source_commits, peerRecord.source_commits)
  assert.equal(peerRoutes.fixture_provenance_sha256, peerRecord.fixture_provenance_sha256)
  assert.equal(peerRoutes.rows.length, 9)
  assert.ok(peerRoutes.rows.every(row => row.route === 'ast'))
  for (const [file, hash] of Object.entries(peerRoutes.route_probe_sha256))
    assert.equal(createHash('sha256').update(read(file)).digest('hex'), hash)
  assert.equal(peerRecord.fixture_provenance_sha256, createHash('sha256').update(read('corpus/realistic/peer/provenance.json')).digest('hex'))
  assert.equal(peerRecord.rows.length, 33)
  assert.equal(peerRecord.controls.length, 33)
  for (const document of peerProvenance.documents) {
    for (const fixture of Object.values(document.fixtures))
      assert.equal(createHash('sha256').update(read(fixture.path)).digest('hex'), fixture.sha256)
    const controls = peerRecord.controls.filter(row => row.document === document.name)
    assert.equal(controls.length, 11)
    assert.equal(new Set(controls.map(row => row.projection_sha256)).size, 1)
    assert.equal(controls.find(row => row.engine === 'djot-php').code_span_space_exceptions.length, 0)
    const routes = peerRoutes.rows.filter(row => row.document === document.name)
    assert.deepEqual(routes.map(row => row.engine).sort(), ['js', 'php', 'rs'])
    assert.ok(routes.every(row => row.fixture_sha256 === document.fixtures.crv.sha256))
    const measured = peerRecord.rows.filter(row => row.document === document.name)
    assert.deepEqual(measured.map(row => row.engine).sort(), controls.map(row => row.engine).sort())
    for (const row of measured) {
      const control = controls.find(item => item.engine === row.engine)
      assert.equal(row.rounds.length, peerRecord.rounds)
      assert.ok(row.rounds.every(round => round.output_sha256 === control.output_sha256))
    }
  }
  for (const [file, hash] of Object.entries(peerRecord.harness_sha256))
    assert.equal(createHash('sha256').update(read(file)).digest('hex'), hash)
  const peerMedian = values => {
    const ordered = [...values].sort((a, b) => a - b)
    return (ordered[(ordered.length - 1) >> 1] + ordered[ordered.length >> 1]) / 2
  }
  const peerRows = peerRecord.rows.map(row => {
    assert.equal(row.rounds.length, peerRecord.rounds)
    assert.equal(peerMedian(row.rounds.flatMap(round => round.cpu_samples_ms)), row.median_cpu_ms)
    const carve = peerRecord.rows.find(item => item.document === row.document && item.engine === `carve-${row.language}`)
    assert.ok(carve)
    const ratios = carve.round_median_cpu_ms.map((value, index) => value / row.round_median_cpu_ms[index])
    return [row.document, row.engine, row.median_cpu_ms.toFixed(3), `${peerMedian(ratios).toFixed(2)}×`]
  })
  const peerSection = `<section id="realistic-peers"><p class="eyebrow">Track D</p><h2>Authored documents against peer libraries</h2><p>Three public documentation files were converted to native Carve, Djot, and Markdown inputs. All three Carve engines took the AST route through their default APIs. All eleven libraries matched the same projected HTML. The djot-php code-span discrepancy in the earlier local run was fixed by <a href="https://github.com/php-collective/djot-php/pull/325">PR #325</a>. The chart shows median within-round speed relative to Carve for each runtime and document. Carve is 1×; higher means the peer used less process CPU time. Whiskers show the round range.</p>${chart('realistic-peer-cpu', 'Paired process CPU speed relative to Carve across eleven libraries on three authored documents')}<details><summary>Absolute CPU time and paired ratios</summary>${table({ headers: ['Document', 'Library', 'CPU ms/op', 'Speed vs Carve'], rows: peerRows })}</details><p>Measured ${escape(peerRecord.generated_at.slice(0, 10))} in ${peerRecord.rounds} rotating rounds on a shared host. The libraries support different grammar and build different internal representations. <a href="reports/realistic-peer.crv">Carve report</a> · <a href="reports/realistic-peer.json" download>Raw samples and output controls</a> · <a href="reports/realistic-peer-routes.json" download>AST route checks</a> · <a href="corpus/realistic/peer/provenance.json">Fixture provenance</a>.</p></section>`
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Carve engine benchmarks, measured development snapshots, and downloadable charts."><title>Carve benchmarks</title><link rel="stylesheet" href="style.css"><script src="app.js" defer></script></head>
<body><a class="skip" href="#main">Skip to results</a><header><a class="brand" href="./">Carve / benchmarks</a><nav aria-label="Sections"><a href="#core">Direct conversion</a><a href="#full">Stress corpus</a><a href="#realistic">Structured documents</a><a href="#realistic-peers">Real-document peers</a>${pairedSection ? '<a href="#paired-full">Paired comparison</a>' : ''}<a href="#method">Method &amp; sources</a>${historySection ? '<a href="#history">History</a>' : ''}<a href="https://markup-carve.github.io/carve-conformance/proofs/">Proofs</a><a href="https://github.com/markup-carve/carve-bench">GitHub</a></nav></header>
<main id="main"><section class="intro"><p class="eyebrow">Recorded performance evidence</p><h1>How fast does Carve render?</h1><p>Measured engine snapshots on shared hardware. Compare direct conversion, full parsing of authored documents, and the stress corpus.</p><p class="run">${escape(data.run)}</p></section>
<section id="core"><p class="eyebrow">Track A</p><h2>Direct HTML conversion on core examples</h2><p>Default public conversion APIs, without opt-in extensions. Peers use equivalent logical content in their native syntax. Features and output differ; these rows measure rendering cost.</p><p id="core-route-note">These core examples use the direct HTML route in all three engines. The authored-document track below measures full parse (AST) on public documentation files. Both tracks use the default conversion APIs; document features decide the route.</p>${table({...data.headline, headers: data.headline.headers.map((header, index) => header === 'MB/s' ? (index === 2 ? 'Carve MB/s' : 'Peer MB/s') : header)})}${rustRankingNote}<p id="php-peer-route-note">The PHP peer changed route on 2 October: <a href="https://github.com/php-collective/djot-php/commit/fab953f6e4820d0d00209668062a68658589af75"><code>fab953f6</code></a> rejected this fixture in its borrowed HTML renderer, while <a href="https://github.com/php-collective/djot-php/commit/9c52e611202e7944c857a1d68c8c715b03b77a1b"><code>9c52e611</code></a> accepted it. The benchmark updated its Djot pin that day. The old and new Carve rows use the borrowed route, so rankings across those snapshots include a peer route change. </p>${phpRerunNote}
<div class="chart-controls"><span id="filter-controls" hidden><label for="language">Compare language</label><select id="language"><option value="all">All languages</option><option>JavaScript</option><option>PHP</option><option>Rust</option></select></span><a href="core-throughput.csv" download>CSV with pipe tables</a><a href="evidence.json" download>Snapshot JSON</a></div>
<p id="filter-status" class="visually-hidden" role="status"></p><div id="interactive-chart"></div>${chart('core-throughput', 'Core conversion throughput with and without pipe tables, in separate panels')}${chart('carve-core-throughput', 'Carve core throughput with pipe tables')}${coreTables}<p><a href="${source}/COMPARISON.md">Historical release comparison and capability scoring</a> · <a href="reports/dev-main-core.md">Current dev-main measurement report</a></p></section>
${commonmarkSection}
${pairedSection}
<section id="full"><p class="eyebrow">Track B</p><h2>Concatenated corpus stress test and extension tiers</h2><p>This corpus joins independent conformance examples into one document. Open fences and containers can interact, so correctness fixes may change the output and nesting. It exercises the normal parser and public AST and is separate from the paired comparison above. This stress input is designed to expose parser depth and feature interactions; the authored-document track gives complete prose examples. Competitor parsers do not accept equivalent syntax, so this track compares Carve implementations and internal PHP tiers. These are shared-host wall-time snapshots; use paired runs to assess changes between revisions.</p><p>Check the <a href="reports/dev-main-full-output-controls.json">output byte counts and hashes</a> before treating cross-engine times as equal work.</p><p class="provenance">${escape(data.corpus.replaceAll('`', ''))}</p>${smallInputNote}${phpTierNote}${chart('full-corpus', 'Throughput of the three Carve engines for each corpus size')}${fullTables}${chart('php-tiers', 'PHP throughput with core, Tier 2, and Tier 3 extension profiles', createHash('sha256').update(read('charts/php-tiers.svg')).digest('hex').slice(0, 12))}<p><a href="${source}/RESULTS.md">Full corpus report</a> · <a href="reports/dev-main-full.json" download>Worker results and provenance</a></p></section>
${realisticSection}
${peerSection}
${historySection}
<section id="method"><p class="eyebrow">Read the measurements</p><h2>Method and source commits</h2><p>Higher MB/s is better. The direct HTML chart uses median process CPU time: 24 paired rounds for the two leading Rust libraries and two recorded rounds for the other engines. The separate JavaScript chart without pipe tables uses wall time. Full-corpus rows average many in-process iterations. Each track has its own input mix and route; compare figures within that workload.</p><p>These are machine-specific snapshots. Shared host activity affects timings; controlled paired runs are needed to establish improvements or regressions.</p><h3>Core comparison host</h3><p>${escape(data.host)}</p><h3>Core peer versions</h3><p class="provenance">${escape(data.peerVersions)}</p><h3>Full-corpus engines measured</h3><p class="provenance">${escape(data.engines.replaceAll('`', ''))}</p><p>Site source: <a href="https://github.com/markup-carve/carve-bench/tree/${revision}"><code>${escape(revision)}</code></a>.</p><p><a href="${source}/README.md#running">Reproduce these runs</a> · <a href="${source}/FEATURES.md">Feature scoring</a> · <a href="${source}/docs/html-import-comparison.md">HTML import comparison</a></p><h3>Download reports</h3><p><a href="reports/dev-main-core.md" download>Current merged core peers</a> · <a href="reports/latest-main-comparison.md" download>Main versus retained tags</a> · <a href="reports/COMPARISON.md" download>Released core comparison</a> · <a href="reports/RESULTS.md" download>Full corpus</a> · <a href="reports/README.md" download>Reproduction guide</a> · <a href="reports/FEATURES.md" download>Feature scoring</a> · <a href="reports/FINDINGS.md" download>Historical findings</a> · <a href="evidence.json" download>All site data</a></p></section></main>
<footer>Built from committed reports. This site does not run benchmarks during deployment.<nav class="related" aria-label="Related sites"><a href="https://markup-carve.github.io/carve/">Docs</a><a href="https://markup-carve.github.io/carve-conformance/proofs/">Proofs</a><a href="https://markup-carve.github.io/carve-conformance/compat/">Compat</a><a href="https://markup-carve.github.io/pandoc-format-fidelity/">Fidelity</a></nav></footer></body></html>`
  writeFileSync(resolve(destination, 'index.html'), html)
  writeFileSync(resolve(destination, '.nojekyll'), '')
  return data
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  build(root, resolve(root, '_site'))
  console.log('Built benchmark site from committed reports.')
}
