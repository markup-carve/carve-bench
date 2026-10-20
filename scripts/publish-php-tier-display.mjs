import assert from 'node:assert/strict'
import {existsSync, readFileSync, writeFileSync} from 'node:fs'
import {displayedPhpTiers} from './php-tier-display.mjs'
const recordPath = existsSync('reports/php-tier-balanced.json') ? 'reports/php-tier-balanced.json' : 'reports/php-tier-pairs.json'
const record = JSON.parse(readFileSync(recordPath))
const full = JSON.parse(readFileSync('reports/dev-main-full.json'))
const rows = displayedPhpTiers(record, full.metadata.source_commits.php.commit)
const labels = ['Tier 1 core/default', 'Tier 2 stack', 'Tier 3 stack']
const text = ['## PHP authoritative extension tiers', '',
  record.metadata.source_commit
    ? `Current tier values use the [same-process alternating run](reports/php-tier-balanced.json) at PHP commit \`${record.metadata.source_commit}\`. Each value is the median of ${record.rows[0].rounds} rounds with ${record.rows[0].iterations} conversions per profile and round. These measurements are separate from the full-corpus rows above.`
    : `Current tier values use the [balanced paired recheck](reports/php-tier-pairs.md) at the same PHP commit, \`${record.metadata.sources.published.commit}\`. Each value is the median of eight round medians, with seven warmed batches per round. These are separate measurements from the full-corpus rows above.`, '',
  'The [original unpaired tier observations](reports/php-tiers-unpaired-20261015.md) and full-run JSON remain unchanged as historical evidence. Tier 1 and Tier 2 render identical HTML on this input. Tier 3 changes output, so its timing includes that work. The three profiles share one JIT buffer and warm up in Tier 1, Tier 2, Tier 3 order before alternating measured rounds.', '',
  '| Profile | Registered extensions | ms/op | MB/s | cost vs Tier 1 | round range, ms |', '|---|---:|---:|---:|---:|---:|',
  ...rows.map((row, i) => `| ${labels[i]} | ${row.extensions} | ${row.ms_per_op.toFixed(2)} | ${row.mb_per_s.toFixed(2)} | ${i ? (row.ms_per_op >= rows[0].ms_per_op ? '+' : '') + ((row.ms_per_op / rows[0].ms_per_op - 1) * 100).toFixed(0) + '%' : 'baseline'} | ${record.metadata.source_commit ? `${Math.min(...record.rows[i].samples).toFixed(2)} to ${Math.max(...record.rows[i].samples).toFixed(2)}` : '-'} |`), '', ''].join('\n')
const path = 'RESULTS.md'
const original = readFileSync(path, 'utf8')
const section = /## PHP authoritative extension tiers\n[\s\S]*?(?=!\[Bar chart of carve-php Tier)/
assert.ok(section.test(original), 'Missing PHP tier section')
writeFileSync(path, original.replace(section, text))
