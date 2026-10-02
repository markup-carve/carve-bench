// A benchmark report records the machine that produced it, and the generators
// write into reports/ on every run, so a developer's home directory reaches
// public history unless something fails the suite over it. carve-bench shipped
// `/home/mark/.cargo/config.toml` and an absolute `nvm` interpreter path this way.
import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { portablePath, portableArgs, portableValues } from './portable-paths.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))

// CI runners and documentation placeholders are not anybody's machine.
const allowedOwners = new Set(['runner', 'user', 'users', 'you', 'example', 'name', 'path'])

// Files that carry a host path on purpose, to prove a generator does not leak
// one. Adding to this list is a reviewed decision, not a workaround.
const allowedFiles = new Set(['scripts/test-host-paths.mjs', 'scripts/test-html-import-comparison.py'])

const pattern = /\/(home|Users|media)\/([A-Za-z0-9._@-]+)/g

export function hostPaths(text) {
  return [...text.matchAll(pattern)]
    .filter(([, , owner]) => !allowedOwners.has(owner.toLowerCase()))
    .map(([match]) => match)
}

function trackedFiles() {
  return execFileSync('git', ['-C', root, 'ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean)
}

test('the guard recognizes a host path and spares runner and placeholder paths', () => {
  assert.deepEqual(hostPaths('"command": "/home/mark/.nvm/versions/node/v24.19.0/bin/node"'), ['/home/mark'])
  assert.deepEqual(hostPaths('cache: /media/mark/data/work'), ['/media/mark'])
  assert.deepEqual(hostPaths('/Users/alice/carve'), ['/Users/alice'])
  assert.deepEqual(hostPaths('/home/runner/work/carve-bench and /Users/runner/x and /home/you/x'), [])
})

test('no tracked file records a host path', () => {
  const offenders = []
  for (const file of trackedFiles()) {
    if (allowedFiles.has(file)) continue
    let text
    try {
      text = readFileSync(resolve(root, file), 'utf8')
    } catch {
      continue
    }
    for (const found of new Set(hostPaths(text))) offenders.push(`${file}: ${found}`)
  }
  assert.deepEqual(offenders, [], `Host paths in tracked files:\n${offenders.join('\n')}`)
})

test('every generated report under reports/ is free of host paths', () => {
  const reports = trackedFiles().filter(file => file.startsWith('reports/'))
  assert.ok(reports.length > 0, 'Expected committed reports to scan')
  for (const file of reports) assert.deepEqual(hostPaths(readFileSync(resolve(root, file), 'utf8')), [], file)
})

// The other half: what the generators now record for the values that leaked.
test('the report helpers reduce the paths that reached the committed reports', () => {
  const root = '/tmp/carve-bench-20260930/'
  assert.equal(portablePath('/home/mark/.nvm/versions/node/v24.19.0/bin/node', root), 'node')
  assert.equal(portablePath('/tmp/carve-bench-20260930/engines/js/bench.mjs', root), 'engines/js/bench.mjs')
  assert.equal(portablePath('/tmp/carve-js-perf-baseline-20260930', root), 'carve-js-perf-baseline-20260930')
  assert.deepEqual(portableArgs(['/tmp/carve-bench-20260930/corpus/small.crv', '20', '-n'], root), ['corpus/small.crv', '20', '-n'])
  assert.deepEqual(portableValues({ CARVE_JS: '/home/mark/checkouts/carve-js/dist/index.js' }, root), { CARVE_JS: 'index.js' })
  for (const value of [portablePath('/home/mark/x/y', root), ...portableArgs(['/media/mark/data'], root), ...Object.values(portableValues({ A: '/Users/mark/a' }, root))]) {
    assert.deepEqual(hostPaths(value), [], value)
  }
})
