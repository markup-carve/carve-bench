import assert from 'node:assert/strict'
import { cpSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { test } from 'node:test'

import { build, collect } from './build.mjs'

const root = resolve(import.meta.dirname, '../..')

test('evidence carries every committed cell with the MB/s the report prints', () => {
  const { lanes, evidence } = collect(root)
  assert.equal(evidence.lanes.length, lanes.length)
  for (const [index, lane] of evidence.lanes.entries()) {
    const parseOnly = lanes[index].data.cells.filter((cell) => cell.phase === 'html' && cell.engine.endsWith('-parse-only')).length
    assert.equal(lane.rows.length, lanes[index].data.cells.length - parseOnly)
    assert.ok(!lane.rows.some((row) => row.phase === 'html' && row.engine.endsWith('-parse-only')))
    for (const row of lane.rows) assert.ok(row.mbps > 0 && Number.isFinite(row.medianUs))
    assert.ok(lane.ratios.every((item) => item.ratio > 0))
  }
})

test('a results report that disagrees with the lane files stops the build', () => {
  const copy = mkdtempSync(join(tmpdir(), 'bench-site-'))
  cpSync(resolve(root, 'results'), join(copy, 'results'), { recursive: true })
  const report = join(copy, 'results/RESULTS.md')
  writeFileSync(report, readFileSync(report, 'utf8').replace('| Carve 0.2 | 15.8 |', '| Carve 0.2 | 99.9 |'))
  assert.throws(() => collect(copy), /RESULTS\.md is not what the lane files give/)
})

test('without a 0.1 checkout the archive link still resolves', async () => {
  const out = join(mkdtempSync(join(tmpdir(), 'bench-site-')), '_site')
  const { archived } = await build(root, out, join(out, 'no-such-checkout'))
  assert.equal(archived, false)
  const landing = readFileSync(join(out, 'index.html'), 'utf8')
  assert.match(landing, /href="0\.1\/"/)
  assert.match(readFileSync(join(out, '0.1/index.html'), 'utf8'), /href="\.\.\/">Current Carve 0\.2 results/)
  for (const src of landing.matchAll(/src="([^"]+)"/g)) assert.ok(existsSync(join(out, src[1])), src[1])
  for (const href of landing.matchAll(/href="(results\/[^"]+)"/g)) assert.ok(existsSync(join(out, href[1])), href[1])
})
