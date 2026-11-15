// Reruns the whole benchmark: fetch and build the engines, run the four lanes one after another, rewrite results/ and charts/.
//   npm run bench                 15 rounds of at least 200 ms
//   npm run bench -- --quick      2 rounds of 20 ms, for a smoke test (results go to build/quick, nothing published)
import { execFileSync } from 'node:child_process'
import { cpus, loadavg, release } from 'node:os'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { writeDocuments } from './documents.mjs'

const ROOT = join(import.meta.dirname, '..')
const quick = process.argv.includes('--quick')
const ROUNDS = quick ? '2' : '15'
const SAMPLE_MS = quick ? '20' : '200'
const OUT = quick ? join(ROOT, 'build/quick') : join(ROOT, 'results')
const TARGET = process.env.CARGO_TARGET_DIR ?? join(ROOT, 'engines/rs/target')
const PHP_EXT = ['-n', '-d', 'extension=ctype', '-d', 'extension=mbstring', '-d', 'extension=intl', '-d', 'extension=dom',
  '-d', 'extension=tokenizer', '-d', 'memory_limit=4G', '-d', 'opcache.enable_cli=1']
const JIT = { off: ['-d', 'opcache.jit=disable'], tracing: ['-d', 'opcache.jit=tracing', '-d', 'opcache.jit_buffer_size=64M'] }

function run(cmd, args, cwd = ROOT) {
  execFileSync(cmd, args, { cwd, stdio: 'inherit', env: { ...process.env, CARGO_TARGET_DIR: TARGET } })
}

function read(cmd, args, cwd = ROOT) {
  return execFileSync(cmd, args, { cwd, encoding: 'utf8' }).trim()
}

function build() {
  run('node', ['scripts/fetch.mjs'])
  run('npm', ['ci', '--no-audit', '--no-fund', '--silent'], join(ROOT, 'engines/js'))
  run('composer', ['install', '--no-interaction', '--prefer-dist', '--quiet'], join(ROOT, 'engines/php'))
  run('cargo', ['build', '--release', '--locked', '--quiet', '--manifest-path', 'engines/rs/Cargo.toml'])
}

const load = () => loadavg().map((value) => Number(value.toFixed(2)))

function lane(id, cmd, args) {
  const file = join(OUT, `${id}.json`)
  const start = { at: new Date().toISOString(), loadavg: load() }
  console.log(`lane ${id}: start, load ${start.loadavg.join(' ')}`)
  run(cmd, [...args(file)])
  const end = { at: new Date().toISOString(), loadavg: load() }
  console.log(`lane ${id}: end, load ${end.loadavg.join(' ')}`)
  const result = JSON.parse(readFileSync(file, 'utf8'))
  result.lane = id
  result.load = { start, end }
  writeFileSync(file, JSON.stringify(result, null, 2) + '\n')
}

function environment() {
  const pins = JSON.parse(readFileSync(join(ROOT, 'pins.json'), 'utf8'))
  const engines = Object.fromEntries(Object.keys(pins).map((name) => [name, read('git', ['rev-parse', 'HEAD'], join(ROOT, '.engines', name))]))
  return {
    benchCommit: read('git', ['rev-parse', 'HEAD']),
    cpu: cpus()[0].model,
    cores: cpus().length,
    kernel: release(),
    node: process.version,
    php: read('php', ['-n', '-r', 'echo PHP_VERSION;']),
    rustc: read('rustc', ['--version']),
    engines,
  }
}

mkdirSync(OUT, { recursive: true })
build()
const docs = writeDocuments()
const env = { ...environment(), quick, startedAt: new Date().toISOString(), loadAtStart: load() }
lane('js', 'node', (file) => ['engines/js/bench.mjs', '--docs', docs, '--out', file, '--rounds', ROUNDS, '--sample-ms', SAMPLE_MS])
lane('rust', join(TARGET, 'release/carve-bench-rs'), (file) => [docs, file, ROUNDS, SAMPLE_MS])
for (const [mode, flags] of Object.entries(JIT)) {
  lane(`php-jit-${mode}`, 'php', (file) => [...PHP_EXT, ...flags, 'engines/php/bench.php', docs, file, ROUNDS, SAMPLE_MS])
}
env.finishedAt = new Date().toISOString()
env.loadAtEnd = load()
writeFileSync(join(OUT, 'environment.json'), JSON.stringify(env, null, 2) + '\n')
run('node', ['scripts/report.mjs', OUT])
