import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { displayedPhpTiers } from './php-tier-display.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const [sourceArg, destinationArg] = process.argv.slice(2)
assert.ok(sourceArg && destinationArg, 'Usage: node scripts/run-php-tier-balanced.mjs PHP_CHECKOUT OUTPUT.json')
const source = resolve(sourceArg)
const destination = resolve(destinationArg)
assert.ok(!existsSync(destination), 'Refuse to overwrite an existing measurement')
const git = (...args) => execFileSync('git', ['-C', source, ...args], { encoding: 'utf8' }).trim()
const commit = git('rev-parse', 'HEAD')
const fleet = JSON.parse(readFileSync(resolve(root, 'reports/dev-main-full.json')))
assert.equal(commit, fleet.metadata.source_commits.php.commit, 'PHP checkout must match the current fleet snapshot')
assert.equal(git('status', '--porcelain', '--untracked-files=no'), '', 'PHP checkout must be clean')
const input = 'corpus/comparison/carve.crv'
const flags = ['-n', '-d', 'extension=ctype', '-d', 'extension=mbstring', '-d', 'opcache.enable_cli=1', '-d', 'opcache.jit_buffer_size=128M', '-d', 'opcache.jit=tracing']
const output = execFileSync('php', [...flags, resolve(root, 'engines/php/tiers-balanced.php'), resolve(root, input), '40', '15'], {
  encoding: 'utf8',
  env: { ...process.env, CARVE_PHP_SRC: resolve(source, 'src'), CARVE_PHP_AUTOLOAD: resolve(root, 'engines/php/vendor/autoload.php') },
})
const rows = JSON.parse(output.trim().split('\n').pop())
assert.ok(rows.every(row => row.carve_source.includes(` @ ${commit.slice(0, 9)})`)) && rows.every(row => row.jit))
for (const row of rows) row.carve_source = `markup-carve/carve-php @ ${commit.slice(0, 9)}`
const sha256 = path => createHash('sha256').update(readFileSync(path)).digest('hex')
const record = { metadata: {
  source_commit: commit,
  benchmark_base_commit: execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  measured_at: new Date().toISOString(),
  php: execFileSync('php', ['-v'], { encoding: 'utf8' }).split('\n')[0],
  input,
  input_sha256: sha256(resolve(root, input)),
  harness_sha256: sha256(resolve(root, 'engines/php/tiers-balanced.php')),
  method: 'One PHP process, 15 alternating rounds, 40 conversions per profile and round, 20 warmup conversions per profile. Median wall time per profile; JIT enabled.',
}, rows }
displayedPhpTiers(record, commit)
writeFileSync(destination, JSON.stringify(record, null, 2) + '\n')
