import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve(import.meta.dirname, '../..')
const provenance = JSON.parse(readFileSync(resolve(root, 'corpus/realistic/provenance.json'), 'utf8'))
const [sourceRepo, migratorTree, mode = '--check'] = process.argv.slice(2)
if (!sourceRepo || !migratorTree || !['--check', '--write'].includes(mode)) {
  throw new Error('Usage: node scripts/realistic/fixtures.mjs <carve-repo> <pinned-carve-js-tree> [--check|--write]')
}
const commit = (directory) => execFileSync('git', ['-C', directory, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
assert.equal(commit(migratorTree), provenance.migrator_commit)
execFileSync('git', ['-C', sourceRepo, 'cat-file', '-e', `${provenance.source_commit}^{commit}`])
const { markdownToCarve } = await import(pathToFileURL(resolve(migratorTree, 'dist/index.js')).href)
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
for (const fixture of provenance.fixtures) {
  const source = execFileSync('git', ['-C', sourceRepo, 'show', `${provenance.source_commit}:${fixture.path}`], { maxBuffer: 4 * 1024 * 1024 })
  assert.equal(sha(source), fixture.source_sha256)
  assert.equal(source.length, fixture.source_bytes)
  const converted = Buffer.from(markdownToCarve(source.toString('utf8')))
  assert.equal(sha(converted), fixture.fixture_sha256)
  assert.equal(converted.length, fixture.fixture_bytes)
  const path = resolve(root, fixture.fixture)
  if (mode === '--write') writeFileSync(path, converted)
  else assert.deepEqual(readFileSync(path), converted)
}
console.log(`Verified ${provenance.fixtures.length} pinned fixture conversions`)
