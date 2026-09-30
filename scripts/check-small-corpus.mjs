import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { loadavg } from 'node:os'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import { assertMeasuredSources } from './measured-sources.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const doc = resolve(root, 'corpus/small.crv')
const variants = {
  js: { baseline: process.env.CARVE_JS_BASELINE, current: process.env.CARVE_JS },
  php: { baseline: process.env.CARVE_PHP_BASELINE_SRC, current: process.env.CARVE_PHP_SRC },
}
for (const entries of Object.values(variants)) for (const path of Object.values(entries)) assert.ok(path, 'Set baseline and current JS/PHP checkout overrides')
const sources = Object.fromEntries(Object.entries(variants).map(([engine, entries]) => [engine,
  Object.fromEntries(Object.entries(entries).map(([variant, path]) => {
    const checkout = engine === 'js' ? resolve(dirname(path), '..') : resolve(path, '..')
    const git = args => execFileSync('git', ['-C', checkout, ...args], { encoding: 'utf8' }).trim()
    assert.equal(git(['status', '--porcelain', '--untracked-files=normal']), '', `Dirty ${engine}/${variant} checkout`)
    return [variant, { checkout, commit: git(['rev-parse', 'HEAD']) }]
  })),
]))
const moduleDigest = checkout => createHash('sha256').update(JSON.stringify(
  readdirSync(resolve(checkout, 'dist'), { recursive: true }).filter(path => path.endsWith('.js')).sort()
    .map(path => [path, createHash('sha256').update(readFileSync(resolve(checkout, 'dist', path))).digest('hex')]),
)).digest('hex')
for (const source of Object.values(sources.js)) {
  execFileSync('npm', ['run', 'build'], { cwd: source.checkout, env: process.env, stdio: 'inherit' })
  source.buildCommand = ['npm', 'run', 'build']
  source.modulesSha256 = moduleDigest(source.checkout)
}
const phpRuntime = JSON.parse(execFileSync('php', ['-n', '-r', 'echo json_encode(["php" => PHP_VERSION, "opcache" => phpversion("Zend OPcache")]);'], { encoding: 'utf8' }))
const rows = []
for (const engine of ['js', 'php']) for (const iterations of [20, 2000]) for (const round of [0, 1]) {
  const order = round === 0 ? ['baseline', 'current'] : ['current', 'baseline']
  for (const variant of order) {
    const override = engine === 'js' ? { CARVE_JS: variants.js[variant] } : { CARVE_PHP_SRC: variants.php[variant] }
    const env = { ...process.env, ...override }
    const command = engine === 'js' ? process.execPath : 'php'
    const args = engine === 'js'
      ? [resolve(root, 'engines/js/bench.mjs'), doc, String(iterations)]
      : ['-n', '-d', 'extension=ctype', '-d', 'extension=mbstring', '-d', 'opcache.enable_cli=1', '-d', 'opcache.jit_buffer_size=128M', '-d', 'opcache.jit=tracing', resolve(root, 'engines/php/bench.php'), doc, String(iterations)]
    const loadBefore = loadavg()
    const result = JSON.parse(execFileSync(command, args, { encoding: 'utf8', env, timeout: 120_000 }).trim())
    assert.equal(result.iters, iterations)
    if (engine === 'php') assert.equal(result.jit, true)
    assertMeasuredSources(new Map([[`carve-${engine}`, new Set([result.carve_source])]]), override, root)
    rows.push({ engine, variant, round, order, iterations, command, args, override, loadBefore, loadAfter: loadavg(), result })
    console.log(`${engine}/${iterations}/${round}/${variant}: ${result.ms_per_op} ms/op`)
  }
}
for (const entries of Object.values(sources)) for (const source of Object.values(entries)) {
  assert.equal(execFileSync('git', ['-C', source.checkout, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), source.commit)
  assert.equal(execFileSync('git', ['-C', source.checkout, 'status', '--porcelain', '--untracked-files=normal'], { encoding: 'utf8' }).trim(), '')
}
for (const source of Object.values(sources.js)) assert.equal(moduleDigest(source.checkout), source.modulesSha256, 'JS build changed during measurement')
writeFileSync(resolve(root, 'reports/small-corpus-check.json'), JSON.stringify({
  generatedAt: new Date().toISOString(), node: process.version, phpRuntime, sources,
  inputSha256: createHash('sha256').update(readFileSync(doc)).digest('hex'),
  method: 'Rebuild both JS checkouts before timing and verify their module digests afterward. Serial fresh processes, baseline/current then current/baseline, at 20 and 2000 timed calls. Each harness warms up to 20 calls. Mean in-process wall time; builds and process startup excluded. PHP tracing JIT verified. Local shared host; two pairs per iteration count are diagnostic observations, not a performance threshold.',
  rows,
}, null, 2) + '\n')
