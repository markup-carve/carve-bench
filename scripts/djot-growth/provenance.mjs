import {rustSettings} from './rust-settings.mjs'
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {readFileSync, rmSync, readdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {cpuAffinity} from '../benchmark-metadata.mjs'

export function provenance(manifest, engine) {
  const git = (tree, ...args) => execFileSync('git', ['-C', tree, ...args], {encoding: 'utf8'}).trim()
  const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex')
  assert.equal(cpuAffinity()?.length, 1, 'Pin the measurement process to one CPU')
  const native = manifest.native
  assert.equal(git(native.path, 'rev-parse', 'HEAD'), native.commit)
  assert.equal(git(native.path, 'status', '--porcelain', '--untracked-files=no'), '')
  assert.ok(['https://github.com/jgm/djot.js.git', 'https://github.com/jgm/djot.js', 'git@github.com:jgm/djot.js.git'].includes(git(native.path, 'remote', 'get-url', 'origin')))
  assert.equal(resolve(native.module), resolve(native.path, 'lib/index.js'))
  rmSync(resolve(native.path, 'lib'), {recursive: true, force: true})
  execFileSync(process.execPath, [resolve(native.path, 'node_modules/typescript/bin/tsc')], {cwd: native.path, stdio: 'pipe'})
  const sources = {}
  for (const revision of ['release', 'main']) {
    const entry = manifest[revision]
    assert.match(entry.commit, /^[a-f0-9]{40}$/)
    assert.equal(git(entry.path, 'rev-parse', 'HEAD'), entry.commit)
    assert.equal(git(entry.path, 'status', '--porcelain', '--untracked-files=no'), '')
    const repository = `https://github.com/markup-carve/carve-${engine}`
    assert.ok([repository, repository + '.git', `git@github.com:markup-carve/carve-${engine}.git`].includes(git(entry.path, 'remote', 'get-url', 'origin')))
    if (revision === 'main') git(entry.path, 'merge-base', '--is-ancestor', entry.commit, 'origin/main')
    else assert.equal(git(entry.path, 'rev-parse', `${entry.revision}^{commit}`), entry.commit)
    const files = git(entry.path, 'ls-files', '--', 'src', 'resources').split('\n').filter(Boolean).sort()
    if (engine === 'js') {
      assert.equal(resolve(entry.module), resolve(entry.path, 'dist/index.js'))
      rmSync(resolve(entry.path, 'dist'), {recursive: true, force: true})
      execFileSync('npm', ['run', 'build'], {cwd: entry.path, stdio: 'pipe'})
    }
    if (engine === 'php') assert.equal(resolve(entry.root), resolve(entry.path))
    sources[revision] = {...entry, repository,
      sourceSha256: createHash('sha256').update(JSON.stringify(files.map(file => [file, hash(resolve(entry.path, file))]))).digest('hex'),
      artifactSha256: entry.module || entry.binary ? hash(entry.module ?? entry.binary) : null}
    if (engine === 'rs') {
      const build = JSON.parse(readFileSync(entry.buildManifest))
      assert.equal(build.commit, entry.commit)
      assert.equal(build.sourceSha256, sources[revision].sourceSha256)
      assert.equal(build.binarySha256, sources[revision].artifactSha256)
      assert.equal(build.resolvedManifest, resolve(entry.path, 'Cargo.toml'))
      const rust = fileURLToPath(new URL('./rust/', import.meta.url))
      assert.equal(build.lockSha256, hash(resolve(rust, 'Cargo.lock')))
      assert.equal(build.workerSha256, hash(resolve(rust, 'src/main.rs')))
      assert.equal(build.rustc, execFileSync('rustc', ['--version'], {encoding: 'utf8'}).trim())
      assert.deepEqual(build.settings, rustSettings())
      sources[revision].build = build
    }
  }
  const here = fileURLToPath(new URL('.', import.meta.url))
  return {startedAt: new Date().toISOString(), cpuAffinity: cpuAffinity(), sources,
    harnessSha256: Object.fromEntries(readdirSync(here, {recursive: true}).filter(file => /\.(mjs|php|rs|toml|lock)$/.test(file)).sort().map(file => [file, hash(resolve(here, file))])),
    nativeModuleSha256: hash(manifest.native.module),
    api: engine === 'js' ? 'djotToCarve / carveToHtml' : engine === 'php' ? 'DjotToCarve::convert / CarveConverter::convert' : 'djot_to_carve / to_html',
    method: 'Raw Djot conversion and rendering of preconverted text measured separately. Loss-report traversal is excluded. Seven alternating pairs after 500 ms warmup per revision and point; adaptive batches target 50 ms.'}
}
