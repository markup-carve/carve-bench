import {rustSettings} from './rust-settings.mjs'
import assert from 'node:assert/strict'
import {execFileSync, spawn, spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {cpSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createInterface} from 'node:readline'

const here = dirname(fileURLToPath(import.meta.url))
const config = JSON.parse(readFileSync(process.argv[2]))
const shared = process.env.CARGO_TARGET_DIR
assert.ok(shared, 'Set CARGO_TARGET_DIR to the shared carve-bench target directory')
if (process.env.CARVE_BENCH_ARTIFACT_LOCK !== resolve(shared)) {
  mkdirSync(resolve(shared), {recursive: true})
  const locked = spawnSync('flock', ['--exclusive', resolve(shared, '.build.lock'), process.execPath, fileURLToPath(import.meta.url), ...process.argv.slice(2)], {
    stdio: 'inherit', env: {...process.env, CARVE_BENCH_ARTIFACT_LOCK: resolve(shared)},
  })
  process.exit(locked.status ?? 1)
}
const sha = value => createHash('sha256').update(value).digest('hex')
for (const revision of ['release', 'main']) {
  const entry = config[revision]
  const tree = resolve(entry.path)
  const git = (...args) => execFileSync('git', ['-C', tree, ...args], {encoding: 'utf8'}).trim()
  assert.equal(git('rev-parse', 'HEAD'), entry.commit)
  assert.equal(git('status', '--porcelain', '--untracked-files=no'), '')
  const worker = resolve(dirname(entry.binary), 'growth-crate')
  mkdirSync(worker, {recursive: true})
  const template = readFileSync(resolve(here, 'rust/Cargo.toml'), 'utf8')
  writeFileSync(resolve(worker, 'Cargo.toml'), template.replace('"SOURCE_TREE"', JSON.stringify(tree)))
  cpSync(resolve(here, 'rust/src'), resolve(worker, 'src'), {recursive: true})
  cpSync(resolve(here, 'rust/Cargo.lock'), resolve(worker, 'Cargo.lock'))
  const manifest = resolve(worker, 'Cargo.toml')
  const metadata = JSON.parse(execFileSync('cargo', ['metadata', '--locked', '--format-version', '1', '--manifest-path', manifest], {encoding: 'utf8', maxBuffer: 16000000}))
  const dependency = metadata.packages.find(pkg => pkg.name === 'carve-lang')
  assert.equal(dependency.source, null)
  assert.equal(dependency.manifest_path, resolve(tree, 'Cargo.toml'))
  const files = git('ls-files', '--', 'src', 'resources').split('\n').filter(Boolean).sort()
  const sourceSha256 = sha(JSON.stringify(files.map(file => [file, sha(readFileSync(resolve(tree, file)))])))
  const child = spawn('cargo', ['build', '--locked', '--release', '--message-format=json', '--manifest-path', manifest], {
    env: {...process.env, CARGO_BUILD_JOBS: '1', CARVE_REVISION: entry.commit}, stdio: ['ignore', 'pipe', 'inherit']})
  const exited = new Promise(resolveExit => child.on('close', resolveExit))
  let captured = false
  for await (const line of createInterface({input: child.stdout})) {
    const event = JSON.parse(line)
    if (event.reason === 'compiler-message') process.stderr.write(event.message.rendered ?? '')
    if (event.reason === 'compiler-artifact' && event.manifest_path === manifest && event.executable) {
      cpSync(event.executable, entry.binary)
      captured = true
    }
  }
  assert.equal(await exited, 0)
  assert.ok(captured, 'Cargo must identify the artifact from this worker manifest')
  writeFileSync(entry.buildManifest, JSON.stringify({commit: entry.commit, resolvedManifest: dependency.manifest_path,
    sourceSha256, binarySha256: sha(readFileSync(entry.binary)), lockSha256: sha(readFileSync(resolve(worker, 'Cargo.lock'))),
    rustc: execFileSync('rustc', ['--version'], {encoding: 'utf8'}).trim(), declaredProfile: 'Cargo default release; environment and Cargo configuration may override it', settings: rustSettings(), workerSha256: sha(readFileSync(resolve(worker, 'src/main.rs')))}, null, 2) + '\n')
}
