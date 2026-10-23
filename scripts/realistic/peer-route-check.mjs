import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const provenance = JSON.parse(readFileSync(resolve(root, 'corpus/realistic/peer/provenance.json')))
const pins = JSON.parse(readFileSync(resolve(root, 'scripts/realistic/peer-pins.json')))
for (const engine of ['js', 'php', 'rs']) {
  const commit = process.env[`CARVE_${engine.toUpperCase()}_COMMIT`]
  if (commit) pins[engine] = commit
}
const trees = { js: process.env.CARVE_JS_TREE, php: process.env.CARVE_PHP_TREE, rs: process.env.CARVE_RS_TREE }
const rustBinary = process.env.CARVE_RS_ROUTE_BIN
const sha = value => createHash('sha256').update(value).digest('hex')
for (const [engine, tree] of Object.entries(trees)) {
  assert.ok(tree, `CARVE_${engine.toUpperCase()}_TREE is required`)
  assert.equal(execFileSync('git', ['-C', tree, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), pins[engine])
}
assert.ok(rustBinary, 'CARVE_RS_ROUTE_BIN is required')

const rows = []
for (const document of provenance.documents) {
  const input = resolve(root, document.fixtures.crv.path)
  assert.equal(sha(readFileSync(input)), document.fixtures.crv.sha256)
  const commands = {
    js: [process.execPath, [resolve(root, 'scripts/realistic/route.mjs'), trees.js, input]],
    php: ['php', [resolve(root, 'scripts/realistic/route.php'), trees.php, input]],
    rs: [rustBinary, [input]],
  }
  for (const [engine, [command, args]] of Object.entries(commands)) {
    const route = execFileSync(command, args, { encoding: 'utf8' }).trim()
    assert.equal(route, 'ast', `${document.name}: ${engine} used ${route}`)
    rows.push({ document: document.name, engine, route, fixture_sha256: document.fixtures.crv.sha256 })
  }
}
const report = { schema: 1, generated_at: new Date().toISOString(), source_commits: pins,
  benchmark_commit: execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  fixture_provenance_sha256: sha(readFileSync(resolve(root, 'corpus/realistic/peer/provenance.json'))),
  route_probe_sha256: Object.fromEntries(['scripts/realistic/route.mjs', 'scripts/realistic/route.php',
    'scripts/realistic/peer-route.rs'].map(file => [file, sha(readFileSync(resolve(root, file)))])),
  rust_binary_sha256: sha(readFileSync(rustBinary)), rows }
writeFileSync(resolve(root, 'reports/realistic-peer-routes.json'), JSON.stringify(report, null, 2) + '\n')
console.log(`Verified ${rows.length} pinned AST routes`)
