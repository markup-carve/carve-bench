import assert from 'node:assert/strict'
import {readFileSync, writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {tierResults} from './php-tier-results.mjs'
const record = JSON.parse(readFileSync(process.argv[2]))
const summary = tierResults(record)
const snapshots = Object.fromEntries([['previous', 'reports/release-before-2962-20261015/dev-main-full.json'], ['published', 'reports/dev-main-full.json']].map(([name, path]) => {
  const content = readFileSync(path)
  const snapshot = JSON.parse(content)
  assert.equal(record.metadata.sources[name].commit, snapshot.metadata.source_commits.php.commit)
  return [name, {path, sha256: createHash('sha256').update(content).digest('hex'), tier1_ms: snapshot.tiers.find(row => row.profile === 'tier1').ms_per_op}]
}))
record.compared_snapshots = snapshots
record.summary = summary
record.publication_report_sha256 = createHash('sha256').update(readFileSync(new URL(import.meta.url))).digest('hex')
const lines = ['# PHP tier timing follow-up', '',
  `The preceding full-run snapshots reported Tier 1 at ${snapshots.previous.tier1_ms.toFixed(2)} ms and ${snapshots.published.tier1_ms.toFixed(2)} ms. They ran separately under different host loads. This follow-up compares their exact PHP commits in alternating order on the same unchanged input. Historical full-run records are preserved.`, '',
  '| Snapshot | Merged commit |', '| --- | --- |',
  ...Object.entries(record.metadata.sources).map(([name, entry]) => `| ${name} | [\`${entry.commit}\`](${entry.repository}/commit/${entry.commit}) |`), '',
  `Measured ${record.metadata.started_at}, ${record.metadata.php}. Allowed CPU: ${record.metadata.cpu_affinity.join(', ')}. One-minute host load: ${record.metadata.load_start[0].toFixed(2)} to ${record.metadata.load_end[0].toFixed(2)}. CPU affinity does not reserve a core.`, '',
  '## Paired results', '',
  'Times are medians of eight round medians. Each round retains seven batches of forty conversions after at least 100 warmup conversions and 500 ms. Revision and profile order reverse on alternate rounds. Wall time includes scheduling delays; process CPU time measures user and system CPU consumed by the worker. Neither isolates every shared-host effect.', '',
  '| Profile | Metric | Previous ms | Published ms | Median paired ratio | 95% interval |', '| --- | --- | ---: | ---: | ---: | --- |',
  ...summary.map(row => `| ${row.profile} | ${row.metric === 'wall_ms' ? 'wall' : 'CPU'} | ${row.previous.toFixed(3)} | ${row.published.toFixed(3)} | ${row.ratio.toFixed(3)} | ${row.interval95.map(value => value.toFixed(3)).join(' to ')} |`), '',
  'The median paired ratio can differ from the ratio of the two displayed median times. Intervals use 10,000 seeded bootstrap resamples of the eight paired round ratios. They describe this run and do not account for every source of systematic error. Identical output hashes are required across revisions and rounds for each profile. The worker hashes the last conversion of every measured batch; it does not hash each timed conversion.', '',
  'The original unpaired tier table does not establish an engine regression or negative extension overhead. Use the paired ratios and their intervals when assessing the reported Tier 1 increase. The raw record includes wall and CPU samples, output hashes, JIT state, exact source commits, producer hashes and host load.', '',
  '## Reproduce', '',
  'Install the benchmark PHP dependencies with `composer install --working-dir=engines/php`. Check out the two commits above in clean official carve-php clones. Create a local JSON configuration with `previous` and `published` entries, each containing `path` and `commit`. All revisions share the benchmark Composer loader; loaded Carve classes, interfaces and traits are checked against the requested source tree.', '',
  '```sh', 'taskset -c 13 node scripts/php-tier-pairs.mjs CONFIG.json /tmp/php-tier-pairs.json', 'node scripts/php-tier-report.mjs /tmp/php-tier-pairs.json', 'python3 scripts/public_report.py reports/php-tier-pairs.json', '```', '',
  'The runner refuses to overwrite an existing measurement. PHP uses `-n`, ctype and mbstring, a 512M memory limit, CLI opcache and tracing JIT. The existing tier harness configures the converter; its initial one-trial result is retained as `startup`, not used in the paired summary. [Raw samples and provenance](php-tier-pairs.json).', '']
const markdown = lines.join('\n')
record.report_md_sha256 = createHash('sha256').update(markdown).digest('hex')
writeFileSync('reports/php-tier-pairs.md', markdown)
writeFileSync('reports/php-tier-pairs.json', JSON.stringify(record, null, 2) + '\n')
