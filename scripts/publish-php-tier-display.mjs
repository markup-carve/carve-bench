import {readFileSync, writeFileSync} from 'node:fs'
import {displayedPhpTiers} from './php-tier-display.mjs'
const record = JSON.parse(readFileSync('reports/php-tier-pairs.json'))
const full = JSON.parse(readFileSync('reports/dev-main-full.json'))
const rows = displayedPhpTiers(record, full.metadata.source_commits.php.commit)
const labels = ['Tier 1 core/default', 'Tier 2 stack', 'Tier 3 stack']
const text = ['## PHP authoritative extension tiers', '',
  `Current tier values use the [balanced paired recheck](reports/php-tier-pairs.md) at the same PHP commit, \`${record.metadata.sources.published.commit}\`. Each value is the median of eight round medians, with seven warmed batches per round. These are separate measurements from the full-corpus rows above.`, '',
  'The [original unpaired tier observations](reports/php-tiers-unpaired-20261015.md) and full-run JSON remain unchanged as historical evidence. Tier 1 is the default route; Tier 2 and Tier 3 register extensions on the same core document.', '',
  '| Profile | Registered extensions | ms/op | MB/s | cost vs Tier 1 |', '|---|---:|---:|---:|---:|',
  ...rows.map((row, i) => `| ${labels[i]} | ${row.extensions} | ${row.ms_per_op.toFixed(2)} | ${row.mb_per_s.toFixed(2)} | ${i ? '+' + ((row.ms_per_op / rows[0].ms_per_op - 1) * 100).toFixed(0) + '%' : 'baseline'} |`), '', ''].join('\n')
const path = 'RESULTS.md'
writeFileSync(path, readFileSync(path, 'utf8').replace(/## PHP authoritative extension tiers\n[\s\S]*?(?=!\[Bar chart of carve-php Tier)/, text))
