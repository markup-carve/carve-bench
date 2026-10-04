import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, statSync, readdirSync, realpathSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { cpus } from 'node:os'
import { cpuAffinity, benchmarkCheckout } from './benchmark-metadata.mjs'
import { requestedOverrides } from './measured-sources.mjs'

const git = (tree, ...args) => execFileSync('git', ['-C', tree, ...args], { encoding: 'utf8' }).trim()

export function validateFullReportSources(root, rustBinary, env = process.env, checkRustBuild = true) {
  const core = JSON.parse(readFileSync(resolve(root, 'reports/dev-main-core.json')))
  const sha = value => createHash('sha256').update(value).digest('hex')
  const sourceCommits = {}
  for (const override of requestedOverrides(env, root, process.cwd())) {
    const engine = override.engine.slice(6)
    const directory = statSync(override.tree).isFile() ? dirname(override.tree) : override.tree
    const tree = git(directory, 'rev-parse', '--show-toplevel')
    const canonical = resolve(tree, engine === 'js' ? 'dist/index.js' : engine === 'php' ? 'src' : '.')
    assert.equal(realpathSync(override.tree), realpathSync(canonical), 'Full report requires the canonical engine entry point')
    const repository = `https://github.com/markup-carve/carve-${engine}`
    assert.ok([repository, repository + '.git', `git@github.com:markup-carve/carve-${engine}.git`].includes(git(tree, 'remote', 'get-url', 'origin')), 'Full report requires an official Carve checkout')
    assert.equal(git(tree, 'status', '--porcelain', '--untracked-files=no'), '', 'Full report requires clean engine source')
    sourceCommits[engine] = { repository, commit: git(tree, 'rev-parse', 'HEAD'), kind: 'merged-main' }
    assert.equal(sourceCommits[engine].commit, core.metadata.carve_main[engine].commit, 'Full and verified core source commits differ')
    git(tree, 'merge-base', '--is-ancestor', sourceCommits[engine].commit, 'origin/main')
    if (engine === 'js') {
      const dist = resolve(tree, 'dist')
      const digests = Object.fromEntries(readdirSync(dist, { recursive: true }).filter(file => file.endsWith('.js')).sort().map(file => [file, sha(readFileSync(resolve(dist, file)))]))
      assert.deepEqual(digests, core.metadata.carve_main.js.dist_sha256, 'Full JS artifacts differ from the fresh verified core build')
      assert.equal(sha(readFileSync(resolve(tree, 'package-lock.json'))), core.metadata.carve_main.js.lock_sha256, 'Full JS dependency lock differs from verified core')
      sourceCommits.js.dist_sha256 = digests
      sourceCommits.js.lock_sha256 = core.metadata.carve_main.js.lock_sha256
    }
  }
  assert.deepEqual(Object.keys(sourceCommits).sort(), ['js', 'php', 'rs'], 'Full main report requires all three checkout overrides')
  assert.equal(resolve(rustBinary), resolve(root, 'engines/rs/target/local-override/target/release/carve-bench-rs'), 'Full main report requires the release binary built by build-rs-engine.mjs')
  if (!checkRustBuild) return { sourceCommits, rustLock: null }
  const rustLock = readFileSync(resolve(root, 'engines/rs/target/local-override/crate/Cargo.lock'))
  assert.deepEqual(rustLock, readFileSync(resolve(root, 'reports/dev-main-rust.Cargo.lock')), 'Full Rust build and core report dependency locks differ')
  assert.equal(sha(rustLock), core.metadata.rust_lock_sha256, 'Full Rust dependency lock differs from verified core metadata')
  return { sourceCommits, rustLock }
}

export function fullResults(root, results, tiers, rustBinary, env = process.env) {
  const hash = file => createHash('sha256').update(readFileSync(resolve(root, file))).digest('hex')
  const { sourceCommits, rustLock } = validateFullReportSources(root, rustBinary, env)
  const corpus = Object.entries(results).flatMap(([name, rows]) => Object.entries(rows).map(([engine, row]) => {
    assert.ok(row && row.engine === engine && row.ms_per_op > 0, 'Missing full-corpus measurement')
    return { document: `corpus/${name}.crv`, ...row }
  }))
  assert.equal(corpus.length, 9)
  assert.deepEqual(tiers.map(row => row.profile), ['tier1', 'tier2', 'tier3'])
  for (const row of [...corpus, ...tiers]) {
    const engine = row.engine?.slice(6) ?? 'php'
    const commit = row.carve_source.match(/ @ ([0-9a-f]{9,40})\)$/)?.[1]
    assert.ok(commit && sourceCommits[engine].commit.startsWith(commit), 'Worker source differs from recorded commit')
  }
  const files = ['run.mjs', 'scripts/full-results.mjs', 'scripts/benchmark-metadata.mjs', 'engines/js/bench.mjs', 'engines/js/carve-src.mjs', 'engines/php/bench.php', 'engines/php/tiers.php', 'engines/php/carve-src.php', 'engines/rs/src/main.rs', 'engines/rs/build.rs', 'scripts/measured-sources.mjs', 'scripts/build-rs-engine.mjs']
  const inputs = [...new Set(corpus.map(row => row.document)), 'corpus/comparison/carve.crv']
  const dependencies = ['engines/js/package-lock.json', 'engines/php/composer.lock', 'reports/dev-main-rust.Cargo.lock']
  return {
    schema: 1,
    metadata: {
      ...benchmarkCheckout(root), completed_at: new Date().toISOString(),
      cpu_affinity: cpuAffinity(), cpu: cpus()[0].model, logical_cpus: cpus().length,
      runtimes: { node: process.version, php: execFileSync('php', ['-n', '-v'], { encoding: 'utf8' }).split('\n')[0], rustc: execFileSync('rustc', ['--version'], { encoding: 'utf8' }).trim() },
      method: 'Serial full run.mjs workload. Corpus rows average in-process iterations after warm-up; PHP tier rows report minimum of five trials and retain every trial. Measurements are host-specific snapshots, not paired speedup evidence.',
      capture: 'Worker JSON stdout returned to run.mjs. Corpus times and throughput are rounded by the workers.',
      source_commits: sourceCommits,
      environment: { CARVE_JS: '<carve-js-checkout>/dist/index.js', CARVE_PHP_SRC: '<carve-php-checkout>/src', CARVE_RS_SRC: '<carve-rs-checkout>', CARVE_PHP_INI: env.CARVE_PHP_INI ?? null, NODE_OPTIONS: env.NODE_OPTIONS ?? null, RUSTFLAGS: env.RUSTFLAGS ?? null },
      input_sha256: Object.fromEntries(inputs.map(file => [file, hash(file)])),
      harness_sha256: Object.fromEntries(files.map(file => [file, hash(file)])),
      dependency_sha256: Object.fromEntries(dependencies.map(file => [file, hash(file)])),
      rust_binary_sha256: hash(rustBinary),
      rust_dependency_lock_sha256: createHash('sha256').update(rustLock).digest('hex'),
    },
    corpus, tiers,
  }
}
