import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const provenance = JSON.parse(readFileSync(resolve(root, 'corpus/realistic/peer/provenance.json')))
const [sourceRepo, migratorTree, mode = '--check'] = process.argv.slice(2)
if (!sourceRepo || !migratorTree || !['--check', '--write'].includes(mode))
  throw new Error('Usage: node scripts/realistic/peer-fixtures.mjs <carve-repo> <pinned-carve-js-tree> [--check|--write]')

const sha = value => createHash('sha256').update(value).digest('hex')
const commit = tree => execFileSync('git', ['-C', tree, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
assert.equal(commit(migratorTree), provenance.carve_migrator_commit)
execFileSync('git', ['-C', sourceRepo, 'cat-file', '-e', `${provenance.source_commit}^{commit}`])
assert.ok(execFileSync('pandoc', ['--version'], { encoding: 'utf8' }).startsWith('pandoc 3.11\n'))
const { markdownToCarve } = await import(pathToFileURL(resolve(migratorTree, 'dist/index.js')).href)

for (const document of provenance.documents) {
  const source = execFileSync('git', ['-C', sourceRepo, 'show', `${provenance.source_commit}:${document.source_path}`])
  assert.equal(sha(source), document.source_sha256)
  assert.equal(source.length, document.source_bytes)
  const markdown = source.toString('utf8').replace(/^---\n[\s\S]*?\n---\n/, '')
  const output = {
    crv: Buffer.from(markdownToCarve(source.toString('utf8'))),
    md: Buffer.from(markdown),
    dj: execFileSync('pandoc', ['-f', 'gfm', '-t', 'djot'], { input: markdown }),
  }
  for (const [extension, bytes] of Object.entries(output)) {
    const fixture = document.fixtures[extension]
    assert.equal(sha(bytes), fixture.sha256, `${document.name}.${extension} changed`)
    assert.equal(bytes.length, fixture.bytes)
    const path = resolve(root, fixture.path)
    if (mode === '--write') writeFileSync(path, bytes)
    else assert.deepEqual(readFileSync(path), bytes)
  }
}
console.log(`Verified ${provenance.documents.length} authored documents in three native formats`)
