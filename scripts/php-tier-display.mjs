import assert from 'node:assert/strict'
import {tierResults} from './php-tier-results.mjs'

export function displayedPhpTiers(record, commit) {
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
