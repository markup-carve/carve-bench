import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { arch, cpus, homedir, loadavg, platform, tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { benchmarkCheckout, cpuAffinity } from './benchmark-metadata.mjs'
import { fullFeatureSizes, fullFeatureSource, requireFullFeatureOutput } from './full-feature-fixture.mjs'
import { pairedSummary, pairedTableRows, requireMatchingOutputs, requireWorkerSource } from './paired-full-results.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const config = JSON.parse(readFileSync(process.argv[2]))
const sha = value => createHash('sha256').update(value).digest('hex')
const command = (program, args, options = {}) => execFileSync(program, args, { cwd: root, encoding: 'utf8', timeout: 1800000, maxBuffer: 16000000, ...options }).trim()
const git = (tree, ...args) => command('git', ['-C', tree, ...args])
const cache = mkdtempSync(resolve(tmpdir(), 'carve-paired-full-'))
const cleanEnv = { ...process.env }
for (const key of Object.keys(cleanEnv)) if (key.startsWith('CARVE_')) delete cleanEnv[key]
const phpFlags = ['-n', '-d', 'extension=ctype', '-d', 'extension=mbstring', '-d', 'opcache.enable_cli=1', '-d', 'opcache.jit_buffer_size=128M', '-d', 'opcache.jit=tracing']
if (command('php', ['-n', '-r', 'echo function_exists("opcache_get_status") ? "yes" : "no";']) === 'no') phpFlags.push('-d', 'zend_extension=opcache')
const prepared = {}, sources = {}, fixtures = []
const started = new Date().toISOString()
const affinity = cpuAffinity()
const provenanceFiles = ['scripts/compare-full-feature.mjs', 'scripts/full-feature-fixture.mjs', 'scripts/paired-full-results.mjs', 'scripts/paired-full-output.php', 'scripts/public_report.py', 'scripts/benchmark-metadata.mjs', 'scripts/build-rs-engine.mjs', 'engines/js/bench.mjs', 'engines/js/carve-src.mjs', 'engines/php/bench.php', 'engines/php/carve-src.php', 'engines/rs/src/main.rs', 'engines/rs/src/compare.rs', 'engines/rs/build.rs', 'engines/rs/Cargo.toml']
const harnessHashes = Object.fromEntries(provenanceFiles.map(file => [file, sha(readFileSync(resolve(root, file)))]))
const cargoConfig = resolve(process.env.CARGO_HOME ?? resolve(homedir(), '.cargo'), 'config.toml')
const buildSettings = { rustc: command('rustc', ['--version']), cargo: command('cargo', ['--version']), cargo_home_config_sha256: existsSync(cargoConfig) ? sha(readFileSync(cargoConfig)) : null,
  rustflags: process.env.RUSTFLAGS ?? null, encoded_rustflags: process.env.CARGO_ENCODED_RUSTFLAGS ?? null }
const sourceFingerprint = tree => sha(JSON.stringify(git(tree, 'ls-files', '--', 'src', 'resources').split('\n').filter(Boolean).sort().map(file => [file, sha(readFileSync(resolve(tree, file)))])))
const baseline = config.baseline_benchmark_commit
assert.match(baseline, /^[a-f0-9]{40}$/)
assert.ok(git(root, 'rev-list', '--first-parent', 'origin/main').split('\n').includes(baseline))
const baselineReport = JSON.parse(git(root, 'show', `${baseline}:reports/dev-main-full.json`))
for (const engine of ['js', 'php', 'rs']) assert.equal(config.before[engine].commit, baselineReport.metadata.source_commits[engine].commit)

try {
  for (const revision of ['before', 'after']) {
    assert.deepEqual(Object.keys(config[revision]).sort(), ['js', 'php', 'rs'])
    prepared[revision] = {}; sources[revision] = {}
    for (const engine of ['js', 'php', 'rs']) {
      const entry = config[revision][engine]
      assert.match(entry.commit, /^[a-f0-9]{40}$/)
      const repository = `https://github.com/markup-carve/carve-${engine}`
      assert.ok([repository, repository + '.git', `git@github.com:markup-carve/carve-${engine}.git`].includes(git(entry.path, 'remote', 'get-url', 'origin')))
      git(entry.path, 'fetch', 'origin', 'main')
      assert.equal(git(entry.path, 'rev-parse', 'HEAD'), entry.commit)
      git(entry.path, 'merge-base', '--is-ancestor', entry.commit, 'origin/main')
      assert.ok(git(entry.path, 'rev-list', '--first-parent', 'origin/main').split('\n').includes(entry.commit), 'Require a published main head')
      assert.equal(git(entry.path, 'status', '--porcelain'), '')
      const identity = { repository, commit: entry.commit, source_sha256: sourceFingerprint(entry.path) }
      const environment = { ...cleanEnv, CARVE_JS: resolve(entry.path, 'dist/index.js'), CARVE_PHP_SRC: resolve(entry.path, 'src') }
      if (engine === 'js') {
        const lock = JSON.parse(readFileSync(resolve(entry.path, 'package-lock.json')))
        const installed = JSON.parse(readFileSync(resolve(entry.path, 'node_modules/.package-lock.json')))
        for (const [name, info] of Object.entries(installed.packages)) {
          assert.equal(info.version, lock.packages[name]?.version)
          assert.equal(info.integrity, lock.packages[name]?.integrity)
        }
        for (const [name, info] of Object.entries(lock.packages)) if (name && !info.optional) assert.ok(installed.packages[name])
        command('npm', ['run', 'build'], { cwd: entry.path, env: cleanEnv })
        identity.lock_sha256 = sha(readFileSync(resolve(entry.path, 'package-lock.json')))
        identity.dist_sha256 = Object.fromEntries(readdirSync(resolve(entry.path, 'dist'), { recursive: true }).filter(file => file.endsWith('.js')).sort().map(file => [file, sha(readFileSync(resolve(entry.path, 'dist', file)))]))
      } else if (engine === 'rs') {
        command(process.execPath, ['scripts/build-rs-engine.mjs', '--carve-rs', entry.path], { env: cleanEnv })
        const target = resolve(root, 'engines/rs/target/local-override')
        const binary = resolve(cache, `${revision}-rs`)
        cpSync(resolve(target, 'target/release/carve-bench-rs'), binary)
        cpSync(resolve(target, 'target/release/carve-bench-rs-compare'), binary + '-compare')
        prepared[revision].rsBinary = binary
        identity.binary_sha256 = sha(readFileSync(binary))
        identity.control_binary_sha256 = sha(readFileSync(binary + '-compare'))
        identity.lock_sha256 = sha(readFileSync(resolve(target, 'crate/Cargo.lock')))
        identity.manifest_sha256 = sha(readFileSync(resolve(target, 'crate/Cargo.toml')))
      }
      sources[revision][engine] = identity
      prepared[revision][engine] = environment
    }
  }
  for (const engine of ['js', 'php', 'rs']) git(config.after[engine].path, 'merge-base', '--is-ancestor', config.before[engine].commit, config.after[engine].commit)
  const fixtureDir = resolve(root, 'corpus/full-feature')
  mkdirSync(fixtureDir, { recursive: true })
  for (const sections of fullFeatureSizes) {
    const source = fullFeatureSource(sections)
    const file = `corpus/full-feature/${sections}.crv`
    writeFileSync(resolve(root, file), source)
    fixtures.push({ sections, file, bytes: Buffer.byteLength(source), source_sha256: sha(source) })
  }
  const controls = []
  for (const engine of ['js', 'php', 'rs']) for (const fixture of fixtures) {
    const pair = []
    for (const revision of ['before', 'after']) {
      const file = resolve(root, fixture.file)
      let result
      if (engine === 'js') {
        const { carveToHtml } = await import(pathToFileURL(prepared[revision].js.CARVE_JS))
        const html = carveToHtml(readFileSync(file, 'utf8'))
        requireFullFeatureOutput(html)
        result = { output_bytes: Buffer.byteLength(html), output_sha256: sha(html) }
      } else if (engine === 'php') {
        const row = JSON.parse(command('php', [...phpFlags, 'scripts/paired-full-output.php', file], { env: prepared[revision].php }))
        assert.equal(row.source_file, resolve(config[revision].php.path, 'src/CarveConverter.php'))
        requireFullFeatureOutput(row.html)
        result = { output_bytes: Buffer.byteLength(row.html), output_sha256: sha(row.html) }
      } else {
        const row = JSON.parse(command(prepared[revision].rsBinary + '-compare', ['carve-rs', file, '1', '1'], { env: cleanEnv }))
        requireWorkerSource(row.carve_source, config[revision].rs)
        const html = Buffer.from(row.output_hex, 'hex')
        requireFullFeatureOutput(html.toString('utf8'))
        result = { output_bytes: html.length, output_sha256: sha(html) }
      }
      pair.push(result); controls.push({ engine, revision, sections: fixture.sections, ...result })
    }
    requireMatchingOutputs(...pair)
  }
  const measure = (engine, revision, fixture, iters) => {
    const file = resolve(root, fixture.file)
    let row
    if (engine === 'js') row = JSON.parse(command(process.execPath, ['engines/js/bench.mjs', file, String(iters)], { env: prepared[revision].js }))
    else if (engine === 'php') row = JSON.parse(command('php', [...phpFlags, 'engines/php/bench.php', file, String(iters)], { env: prepared[revision].php }))
    else row = JSON.parse(command(prepared[revision].rsBinary, [file, String(iters)], { env: cleanEnv }))
    assert.ok(Number.isFinite(row.ms_per_op) && row.ms_per_op > 0)
    requireWorkerSource(row.carve_source, config[revision][engine])
    assert.equal(row.bytes, fixture.bytes)
    if (engine === 'php') assert.equal(row.jit, true)
    return row
  }
  const calibration = []
  for (const engine of ['js', 'php', 'rs']) for (const fixture of fixtures) {
    const pilots = ['before', 'after'].map(revision => ({ revision, ms_per_op: measure(engine, revision, fixture, 20).ms_per_op }))
    calibration.push({ engine, sections: fixture.sections, pilots, iters: Math.max(1, Math.ceil(1500 / Math.min(...pilots.map(row => row.ms_per_op)))) })
  }
  const measurementStart = new Date().toISOString(), loadStart = loadavg(), rows = []
  for (let round = 0; round < 8; round++) for (const engine of ['js', 'php', 'rs']) for (const fixture of fixtures) {
    for (const revision of round % 2 ? ['after', 'before'] : ['before', 'after']) {
      const iters = calibration.find(row => row.engine === engine && row.sections === fixture.sections).iters
      const row = measure(engine, revision, fixture, iters)
      assert.ok(row.ms_per_op * iters >= 1000, 'Timed window shorter than one second; rerun calibration')
      rows.push({ engine, revision, sections: fixture.sections, round, ms_per_op: row.ms_per_op, iters, jit: row.jit ?? null, load: loadavg() })
      console.log(`${round + 1}/${engine}/${fixture.sections}/${revision}: ${row.ms_per_op} ms`)
    }
  }
  assert.deepEqual(cpuAffinity(), affinity)
  for (const revision of ['before', 'after']) for (const engine of ['js', 'php', 'rs']) {
    assert.equal(git(config[revision][engine].path, 'status', '--porcelain'), '')
    assert.equal(git(config[revision][engine].path, 'rev-parse', 'HEAD'), config[revision][engine].commit)
    assert.equal(sourceFingerprint(config[revision][engine].path), sources[revision][engine].source_sha256)
    if (engine === 'js') for (const [file, hash] of Object.entries(sources[revision].js.dist_sha256)) assert.equal(sha(readFileSync(resolve(config[revision].js.path, 'dist', file))), hash)
  }
  const summary = pairedSummary(rows)
  let previousSnapshot = null
  if (git(root, 'ls-tree', '--name-only', 'HEAD', '--', 'reports/paired-full-feature.json')) {
    const old = git(root, 'show', 'HEAD:reports/paired-full-feature.json') + '\n'
    const stamp = JSON.parse(old).metadata.measurement_started_at.replace(/[^0-9T]/g, '')
    previousSnapshot = `paired-full-feature-${stamp}`
    const archived = resolve(root, `reports/${previousSnapshot}.json`)
    if (existsSync(archived)) assert.equal(readFileSync(archived, 'utf8'), old)
    else writeFileSync(archived, old)
    const oldMarkdown = git(root, 'show', 'HEAD:reports/paired-full-feature.md').replace('(paired-full-feature.json)', `(${previousSnapshot}.json)`) + '\n'
    writeFileSync(resolve(root, `reports/${previousSnapshot}.md`), oldMarkdown)
  }
  const checkout = benchmarkCheckout(root)
  checkout.benchmark_dirty_paths = [...new Set([...git(root, 'diff', '--name-only', 'HEAD').split('\n'), ...git(root, 'ls-files', '--others', '--exclude-standard').split('\n')].filter(Boolean))].sort()
  checkout.benchmark_dirty = checkout.benchmark_dirty_paths.length > 0
  const record = { schema: 1, metadata: { ...checkout, started_at: started, measurement_started_at: measurementStart, completed_at: new Date().toISOString(), cpu_affinity: affinity,
    cpu: cpus()[0].model, logical_cpus: cpus().length, platform: platform(), arch: arch(), baseline_benchmark_commit: baseline, previous_snapshot: previousSnapshot,
    node: process.version, php: command('php', ['-n', '-v']).split('\n')[0], php_ini_flags: phpFlags, build_settings: buildSettings, sources, harness_sha256: harnessHashes,
    php_dependency_lock_sha256: sha(readFileSync(resolve(root, 'engines/php/composer.lock'))), php_installed_sha256: sha(readFileSync(resolve(root, 'engines/php/vendor/composer/installed.json'))), load_start: loadStart, load_end: loadavg(),
    method: 'Eight serial rounds alternate before/after order. A pilot calibrates identical iteration counts within each pair for a 1.5-second target; every timed window must exceed one second. Workers warm up to 20 calls. Exact output hashes must match within each engine. PHP tracing JIT is required. Median per-round ratios and their full ranges describe these samples; they are not significance tests. Six cases are reported without multiple-comparison adjustment. The host is shared and CPU affinity applies to compiler and GC threads.' }, fixtures, controls, calibration, rows, summary }
  writeFileSync(resolve(root, 'reports/paired-full-feature.json'), JSON.stringify(record, null, 2) + '\n')
  const markdown = ['# Paired full-feature benchmark', '', record.metadata.method, '', `Measured ${measurementStart}; CPU affinity ${JSON.stringify(affinity)}. All source builds completed before timing. The closed-block workload exercises formatting, quotations, nested lists, definition lists, tables, code, raw HTML and footnotes.`, '', `Before commits are the development snapshots published by benchmark commit \`${baseline}\`, from its full-corpus report. They are merged main heads, not release tags. After commits are the newer merged main heads named below.`, '', '| Engine | Before commit | After commit |', '|---|---|---|', ...['js', 'php', 'rs'].map(engine => `| ${engine} | \`${sources.before[engine].commit}\` | \`${sources.after[engine].commit}\` |`), '', '| Engine | Sections | Before ms | After ms | Median paired change | Paired range |', '|---|---:|---:|---:|---:|---|', ...pairedTableRows(summary).map(row => `| ${row.join(' | ')} |`), '', 'Positive changes mean more elapsed time; negative changes mean less. All changes are observed per-round ratios, not significance claims. The full range shows run-to-run variation, and testing several cases increases the risk of chance patterns.', '', 'Output hashes agree within each engine at every size. This checks before/after equivalence, not byte-identical HTML across implementations. The concatenated corpus remains a separate stress workload. Historical rows with changed output or CPU settings cannot establish code speedups.', '', 'Rust binary and generated-manifest hashes identify the local artifacts. Checkout locations affect those hashes, so another machine need not reproduce them byte for byte.', '', '[Raw controls, samples and provenance](paired-full-feature.json).', '', 'To reproduce, provide a local config with `baseline_benchmark_commit`, `before` and `after`. Each revision map contains `js`, `php` and `rs` entries with `path` and full `commit`. The baseline benchmark commit must contain the before source pins in `reports/dev-main-full.json`. Install locked JS dependencies and the benchmark PHP dependencies. On Linux, select an available CPU and run `taskset -c CPU node scripts/compare-full-feature.mjs CONFIG.json`. Both revisions inherit the same affinity. The runner exports portable metadata and archives a previously committed paired report before replacing it.']
  writeFileSync(resolve(root, 'reports/paired-full-feature.md'), markdown.join('\n') + '\n')
  command('python3', ['scripts/public_report.py', 'reports/paired-full-feature.json'])
} finally {
  rmSync(cache, { recursive: true, force: true })
}
