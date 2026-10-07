import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { finalCommonmarkResults } from './commonmark-results.mjs'

test('throughput graph uses pinned Carve main in both workloads', () => {
  const record = JSON.parse(readFileSync('reports/dev-main-core.json'))
  assert.equal(record.metadata.workload_points, 18)
  assert.ok(!record.metadata.php_dependencies['markup-carve/carve-php'])
  assert.match(record.metadata.benchmark_base_commit, /^[a-f0-9]{40}$/)
  const phpLock = JSON.parse(readFileSync('engines/php/composer.lock'))
  const djot = phpLock.packages.find(info => info.name === 'php-collective/djot')
  assert.deepEqual(record.metadata.php_dependencies[djot.name], { version: djot.version, reference: djot.source.reference })
  assert.ok(readFileSync('reports/dev-main-core.md', 'utf8').includes(djot.source.reference))
  assert.equal(record.controls.length, 10)
  assert.equal(new Set(record.controls.map(row => row.projection_sha256)).size, 1)
  for (const [engine, value] of Object.entries(record.metadata.carve_main)) {
    assert.equal(value.kind, 'merged-main')
    if (value.commit !== value.latest_at_setup) {
      const retained = record.metadata.retained_main_snapshot?.[engine]
      assert.equal(retained?.measured_commit, value.commit, 'Older pin needs an explicit retained-snapshot record')
      assert.equal(retained.latest_at_core_repeat_setup, value.latest_at_setup)
      assert.equal(retained.head_observation_phase, 'core repeat setup')
      assert.equal(retained.head_observed_at, record.metadata.generated_at)
      assert.ok(retained.changed_paths.length > 0 && retained.reason.length > 0)
      assert.ok(record.metadata.main_selection_note && readFileSync('reports/dev-main-core.md', 'utf8').includes(record.metadata.main_selection_note))
      const full = JSON.parse(readFileSync('reports/dev-main-full.json'))
      const history = JSON.parse(readFileSync('reports/engine-history.json'))
      assert.deepEqual(full.metadata.retained_main_snapshot?.[engine], retained)
      assert.deepEqual(history.retained_main_snapshot?.[engine], retained)
      for (const file of ['RESULTS.md', 'reports/engine-history.md', 'reports/latest-main-comparison.md']) {
        assert.ok(readFileSync(file, 'utf8').includes(record.metadata.main_selection_note), file)
      }
    }
    assert.equal(value.repository, `https://github.com/markup-carve/carve-${engine}`)
    assert.match(value.commit, /^[a-f0-9]{40}$/)
    for (const round of record.rounds) {
      assert.equal(round.rows.find(row => row.engine === `carve-${engine}`).carve_source, `carve-${engine} (merged main ${value.commit})`)
    }
  }
  assert.deepEqual(record.rounds[1].rows.map(row => row.engine), record.rounds[0].rows.map(row => row.engine).reverse())
  for (const round of record.rounds) for (const row of round.rows) {
    const control = record.controls.find(item => item.engine === row.engine)
    assert.equal(row.output_sha256, control.output_sha256)
    assert.equal(row.source_sha256, control.source_sha256)
    assert.equal(row.samples.length, 7)
  }
  assert.deepEqual(record.final.map(({ language, ...row }) => row), finalCommonmarkResults(record))
  for (const [file, hash] of Object.entries(record.metadata.harness_sha256)) assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), hash, file)
  assert.equal(createHash('sha256').update(readFileSync('reports/dev-main-rust.Cargo.lock')).digest('hex'), record.metadata.rust_lock_sha256)
  const shared = JSON.parse(readFileSync('reports/commonmark-js.json'))
  assert.equal(shared.metadata.carve_main.commit, record.metadata.carve_main.js.commit)
  assert.equal(shared.metadata.carve_main.fast_path, true)
  assert.deepEqual(shared.metadata.carve_main.dist_sha256, record.metadata.carve_main.js.dist_sha256)
  assert.equal(shared.metadata.carve_main.lock_sha256, record.metadata.carve_main.js.lock_sha256)
  for (const round of record.rounds) for (const row of round.rows.filter(row => row.language === 'PHP')) assert.ok(row.jit && row.jit_on)
  assert.doesNotMatch(readFileSync('COMPARISON.md', 'utf8'), /charts\/(?:core-throughput|carve-core-throughput)\.svg/)
  const archive = JSON.parse(readFileSync('reports/commonmark-js-release-0.1.9.json'))
  assert.equal(archive.metadata.package_versions['@markup-carve/carve'], '0.1.9')
  assert.ok(!archive.metadata.carve_main)
  assert.match(readFileSync('charts/core-throughput.svg', 'utf8'), /Carve dev-main in every panel/)
})

test('benchmark provenance distinguishes the measured checkout from remote main', async () => {
  const { mkdtempSync, writeFileSync, rmSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const { join } = await import('node:path')
  const { execFileSync } = await import('node:child_process')
  const { benchmarkCheckout } = await import('./benchmark-metadata.mjs')
  const tree = mkdtempSync(join(tmpdir(), 'bench-checkout-'))
  const git = (...args) => execFileSync('git', ['-C', tree, ...args], { encoding: 'utf8' }).trim()
  try {
    git('init', '-q')
    writeFileSync(join(tree, 'fixture'), 'first')
    git('add', 'fixture')
    git('-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '-qm', 'first')
    const remote = git('rev-parse', 'HEAD')
    git('update-ref', 'refs/remotes/origin/main', remote)
    writeFileSync(join(tree, 'fixture'), 'second')
    git('-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '-qam', 'second')
    assert.deepEqual(benchmarkCheckout(tree), {
      benchmark_base_commit: remote,
      benchmark_checkout_commit: git('rev-parse', 'HEAD'),
      benchmark_dirty_paths: [],
      benchmark_dirty: false,
    })
    writeFileSync(join(tree, 'fixture'), 'uncommitted')
    assert.equal(benchmarkCheckout(tree).benchmark_dirty, true)
    assert.deepEqual(benchmarkCheckout(tree).benchmark_dirty_paths, ['fixture'])
  } finally {
    rmSync(tree, { recursive: true, force: true })
  }
})


test('refreshed history points record the current worker and build driver', () => {
  const record = JSON.parse(readFileSync('reports/engine-history.json'))
  for (const [engine, snapshot] of Object.entries(record.engines)) {
    const point = snapshot.point_sessions?.['dev-main']
    if (!point) continue
    const worker = { js: 'worker.mjs', php: 'worker.php', rs: 'worker.rs' }[engine]
    for (const file of [worker, 'run.py', 'refresh-main.py']) {
      assert.equal(point.harness_sha256[file], createHash('sha256').update(readFileSync(`scripts/history/${file}`)).digest('hex'), file)
    }
    assert.equal(point.source_commit, snapshot.revisions.find(row => row.label === 'dev-main').sha)
  }
  assert.equal(record.publication_exporter_sha256, createHash('sha256').update(readFileSync('scripts/public_report.py')).digest('hex'))
  assert.equal(record.publication_report_sha256, createHash('sha256').update(readFileSync('scripts/history/report.py')).digest('hex'))
})


test('full output controls match the measured commits and control producers', () => {
  const full = JSON.parse(readFileSync('reports/dev-main-full.json'))
  const controls = JSON.parse(readFileSync('reports/dev-main-full-output-controls.json')).latest_merged_main_output_checks
  assert.equal(controls.rows.length, 9)
  assert.equal(new Set(controls.rows.map(row => `${row.engine}:${row.size}`)).size, 9)
  for (const row of controls.rows) {
    assert.equal(row.commit, full.metadata.source_commits[row.engine].commit)
    if (row.engine === 'rs') {
      assert.match(row.control_binary_sha256, /^[a-f0-9]{64}$/)
      assert.equal(row.measured_binary_sha256, full.metadata.rust_binary_sha256)
    }
    assert.equal(row.source_sha256, createHash('sha256').update(readFileSync(`corpus/${row.size}.crv`)).digest('hex'))
  }
  for (const file of ['scripts/check-full-outputs.mjs', 'scripts/full-output-control.php']) {
    assert.equal(controls.producer_sha256[file], createHash('sha256').update(readFileSync(file)).digest('hex'))
  }
})
