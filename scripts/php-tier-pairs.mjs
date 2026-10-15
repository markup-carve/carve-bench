import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {readFileSync, writeFileSync, realpathSync, existsSync} from 'node:fs'
import {loadavg} from 'node:os'
import {resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {benchmarkCheckout, cpuAffinity} from './benchmark-metadata.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const [configPath, destination] = process.argv.slice(2)
assert.ok(configPath && destination, 'Usage: node scripts/php-tier-pairs.mjs CONFIG OUTPUT.json')
assert.ok(!existsSync(destination), 'Refuse to overwrite an existing measurement')
assert.equal(cpuAffinity()?.length, 1, 'Pin the runner to one CPU')
assert.ok(!process.env.CARVE_PHP_AUTOLOAD, 'Use the recorded benchmark Composer loader')
const config = JSON.parse(readFileSync(configPath))
const sha = file => createHash('sha256').update(readFileSync(file)).digest('hex')
const git = (tree, ...args) => execFileSync('git', ['-C', tree, ...args], {encoding: 'utf8'}).trim()
const flags = ['-n', '-d', 'extension=ctype', '-d', 'extension=mbstring', '-d', 'memory_limit=512M', '-d', 'opcache.enable_cli=1', '-d', 'opcache.jit_buffer_size=128M', '-d', 'opcache.jit=tracing']
const input = 'corpus/comparison/carve.crv'
const harness = ['scripts/php-tier-pairs.mjs', 'scripts/php-tier-control.php', 'scripts/php-tier-results.mjs', 'scripts/benchmark-metadata.mjs', 'scripts/public_report.py', 'engines/php/tiers.php', 'engines/php/carve-src.php', 'engines/php/composer.lock', 'engines/php/vendor/composer/ClassLoader.php', 'engines/php/vendor/composer/installed.php']
const sources = Object.fromEntries(Object.entries(config).map(([name, entry]) => {
  const tree = resolve(entry.path)
  assert.equal(git(tree, 'rev-parse', 'HEAD'), entry.commit)
  assert.equal(git(tree, 'status', '--porcelain', '--untracked-files=no'), '')
  assert.equal(git(tree, 'status', '--porcelain', '--untracked-files=all', '--ignored', '--', 'src', 'resources'), '')
  const repository = 'https://github.com/markup-carve/carve-php'
  assert.ok([repository, repository + '.git', 'git@github.com:markup-carve/carve-php.git'].includes(git(tree, 'remote', 'get-url', 'origin')))
  git(tree, 'merge-base', '--is-ancestor', entry.commit, 'origin/main')
  const files = git(tree, 'ls-files', '--', 'src', 'resources').split('\n').filter(Boolean).sort()
  return [name, {...entry, repository, source_sha256: createHash('sha256').update(JSON.stringify(files.map(file => [file, sha(resolve(tree, file))]))).digest('hex')}]
}))
const record = {metadata: {...benchmarkCheckout(root), started_at: new Date().toISOString(), cpu_affinity: cpuAffinity(), load_start: loadavg(), sources, input, input_sha256: sha(resolve(root, input)), php: execFileSync('php', ['-n', '-v'], {encoding: 'utf8'}).split('\n')[0], flags, harness_sha256: Object.fromEntries(harness.map(file => [file, sha(resolve(root, file))])), method: 'Eight process rounds, reversed revision order on alternating rounds and reversed profile order. All revisions share the benchmark Composer loader; loaded Carve classes, traits and interfaces must come from the requested checkout. The existing tier runner configures the converter and performs its startup calls. The appended worker then warms at least 100 conversions and 500 ms before seven batches of forty conversions. It records wall and process CPU time plus the last output hash of each batch. Compare per-round median batch times; affinity does not reserve a CPU.'}, rows: []}
const names = Object.keys(sources)
assert.deepEqual(names, ['previous', 'published'])
for (let round = 0; round < 8; round++) {
  for (const profile of round % 2 ? ['tier3', 'tier2', 'tier1'] : ['tier1', 'tier2', 'tier3']) {
    for (const name of round % 2 ? [...names].reverse() : names) {
      const tree = resolve(sources[name].path)
      const output = execFileSync('php', [...flags, '-d', `auto_append_file=${resolve(root, 'scripts/php-tier-control.php')}`, resolve(root, 'engines/php/tiers.php'), profile, resolve(root, input), '1', '1'], {env: {...process.env, CARVE_PHP_SRC: resolve(tree, 'src')}, encoding: 'utf8'})
      const [timing, control] = output.trim().split('\n').map(line => JSON.parse(line))
      assert.equal(realpathSync(control.source_file), realpathSync(resolve(tree, 'src/CarveConverter.php')))
      const short = timing.carve_source.match(/ @ ([a-f0-9]+)\)$/)?.[1]
      assert.ok(short && sources[name].commit.startsWith(short))
      assert.ok(timing.jit && control.jit_on)
      assert.equal(control.wall_ms.length, 7)
      assert.equal(control.cpu_ms.length, 7)
      assert.ok(timing.samples.every(value => Number.isFinite(value) && value > 0))
      for (const metric of ['wall_ms', 'cpu_ms']) assert.ok(control[metric].every(value => Number.isFinite(value) && value > 0))
      const prior = record.rows.filter(row => row.profile === profile)
      assert.ok(prior.every(row => row.control.output_sha256 === control.output_sha256), 'Different output cannot support timing ratios')
      record.rows.push({round, revision: name, profile, startup: timing, control, host_load: loadavg()})
      record.metadata.load_end = loadavg()
      writeFileSync(destination, JSON.stringify(record, null, 2) + '\n')
      process.stderr.write(`${round + 1}/8 ${profile} ${name}: ${([...control.wall_ms].sort((a,b)=>a-b)[3]).toFixed(3)} ms\n`)
    }
  }
}
