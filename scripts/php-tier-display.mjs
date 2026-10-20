import assert from 'node:assert/strict'
import {tierResults} from './php-tier-results.mjs'

export function displayedPhpTiers(record, commit) {
  if (record.metadata.source_commit) {
    assert.equal(record.metadata.source_commit, commit, 'Displayed tiers must match the fleet PHP commit')
    assert.deepEqual(record.rows.map(row => row.profile), ['tier1', 'tier2', 'tier3'])
    assert.ok(record.rows.every(row => row.jit && row.samples.length === row.rounds && row.rounds > 0 && row.rounds % 2 === 1 && row.samples.every(value => Number.isFinite(value) && value > 0)))
    assert.ok(record.rows.every(row => row.carve_source.includes(` @ ${commit.slice(0, 9)}`)))
    assert.equal(record.rows[0].html_sha256, record.rows[1].html_sha256, 'Tier 1 and Tier 2 must render the same HTML')
    return record.rows.map(row => {
      const sorted = [...row.samples].sort((a, b) => a - b)
      const milliseconds = sorted[Math.floor(sorted.length / 2)]
      assert.equal(row.ms_per_op, milliseconds)
      assert.equal(row.bytes, record.rows[0].bytes)
      return {profile: row.profile, extensions: row.tier2_extensions + row.tier3_extensions, ms_per_op: milliseconds, mb_per_s: row.bytes / 1048576 / (milliseconds / 1000)}
    })
  }
  assert.equal(record.metadata.sources.published.commit, commit, 'Displayed tiers must match the fleet PHP commit')
  const summary = tierResults(record)
  assert.deepEqual(record.summary, summary)
  return ['tier1', 'tier2', 'tier3'].map(profile => {
    const points = record.rows.filter(row => row.revision === 'published' && row.profile === profile)
    const bytes = points[0].startup.bytes
    const extensions = points[0].startup.tier2_extensions + points[0].startup.tier3_extensions
    assert.ok(bytes > 0 && points.every(row => row.startup.bytes === bytes && row.startup.tier2_extensions + row.startup.tier3_extensions === extensions))
    const milliseconds = summary.find(row => row.profile === profile && row.metric === 'wall_ms').published
    return {profile, extensions, ms_per_op: milliseconds, mb_per_s: bytes / 1048576 / (milliseconds / 1000)}
  })
}
