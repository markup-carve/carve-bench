import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { validateFullReportSources } from './full-results.mjs'

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'carve-full-source-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const env = {}, commits = {}
  for (const engine of ['js', 'php', 'rs']) {
    const tree = join(root, engine)
    mkdirSync(tree)
    const git = (...args) => execFileSync('git', ['-C', tree, ...args], { encoding: 'utf8' }).trim()
    git('init', '-q', '-b', 'main')
    git('config', 'user.name', 'Test')
    git('config', 'user.email', 'test@example.com')
    git('commit', '--allow-empty', '-q', '-m', 'Fixture')
    git('remote', 'add', 'origin', `https://github.com/markup-carve/carve-${engine}.git`)
    commits[engine] = git('rev-parse', 'HEAD')
    git('update-ref', 'refs/remotes/origin/main', commits[engine])
    if (engine === 'js') {
      mkdirSync(join(tree, 'dist'))
      writeFileSync(join(tree, 'dist/index.js'), '')
      env.CARVE_JS = join(tree, 'dist/index.js')
      writeFileSync(join(tree, 'package-lock.json'), '{}')
    } else if (engine === 'php') {
      mkdirSync(join(tree, 'src'))
      env.CARVE_PHP_SRC = join(tree, 'src')
    } else env.CARVE_RS_SRC = tree
  }
  const binary = join(root, 'engines/rs/target/local-override/target/release/carve-bench-rs')
  const lock = join(root, 'engines/rs/target/local-override/crate/Cargo.lock')
  const reportLock = join(root, 'reports/dev-main-rust.Cargo.lock')
  for (const file of [binary, lock, reportLock]) {
    mkdirSync(join(file, '..'), { recursive: true })
    writeFileSync(file, file === binary ? '' : 'version = 4\n')
  }
  const sha = text => createHash('sha256').update(text).digest('hex')
  const core = { metadata: { carve_main: Object.fromEntries(Object.entries(commits).map(([engine, commit]) => [engine, { commit }])) } }
  core.metadata.carve_main.js.dist_sha256 = { 'index.js': sha('') }
  core.metadata.carve_main.js.lock_sha256 = sha('{}')
  core.metadata.rust_lock_sha256 = sha('version = 4\n')
  writeFileSync(join(root, 'reports/dev-main-core.json'), JSON.stringify(core))
  return { root, env, commits, binary, lock }
}

test('full report resolves a JS module file and PHP src directory to their Git roots', t => {
  const f = fixture(t)
  const record = validateFullReportSources(f.root, f.binary, f.env)
  for (const engine of ['js', 'php', 'rs']) assert.equal(record.sourceCommits[engine].commit, f.commits[engine])
})

test('full report rejects a Rust build lock differing from the published core lock', t => {
  const f = fixture(t)
  writeFileSync(f.lock, 'version = 3\n')
  assert.throws(() => validateFullReportSources(f.root, f.binary, f.env), /dependency locks differ/)
})

test('full report rejects an unofficial source remote before timing', t => {
  const f = fixture(t)
  execFileSync('git', ['-C', join(f.root, 'js'), 'remote', 'set-url', 'origin', 'https://example.com/other.git'])
  assert.throws(() => validateFullReportSources(f.root, f.binary, f.env), /official Carve checkout/)
})

test('full report rejects stale JS build output despite a clean source tree', t => {
  const f = fixture(t)
  writeFileSync(f.env.CARVE_JS, 'stale build')
  assert.throws(() => validateFullReportSources(f.root, f.binary, f.env), /JS artifacts differ/)
})

test('full report rejects a stale alternate JS entry point in the correct repository', t => {
  const f = fixture(t)
  const old = join(f.root, 'js/dist/old.js')
  writeFileSync(old, '')
  assert.throws(() => validateFullReportSources(f.root, f.binary, { ...f.env, CARVE_JS: old }), /canonical engine entry point/)
})

test('full report rejects a commit differing from the core record', t => {
  const f = fixture(t)
  execFileSync('git', ['-C', join(f.root, 'js'), 'commit', '--allow-empty', '-q', '-m', 'Changed fixture'])
  assert.throws(() => validateFullReportSources(f.root, f.binary, f.env), /source commits differ/)
})

test('full report rejects a staged source change before timing', t => {
  const f = fixture(t)
  writeFileSync(join(f.root, 'js/source.js'), '')
  execFileSync('git', ['-C', join(f.root, 'js'), 'add', 'source.js'])
  assert.throws(() => validateFullReportSources(f.root, f.binary, f.env), /clean engine source/)
})

test('source preflight permits a missing Rust build lock so the build can create it', t => {
  const f = fixture(t)
  rmSync(f.lock)
  assert.equal(validateFullReportSources(f.root, f.binary, f.env, false).rustLock, null)
  assert.throws(() => validateFullReportSources(f.root, f.binary, f.env), /ENOENT/)
})
