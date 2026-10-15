# PHP tier timing follow-up

The preceding full-run snapshots reported Tier 1 at 4.69 ms and 3.31 ms. They ran separately under different host loads. This follow-up compares their exact PHP commits in alternating order on the same unchanged input. Historical full-run records are preserved.

| Snapshot | Merged commit |
| --- | --- |
| previous | [`967f253974433dbc53534df74b7abeae10f26458`](https://github.com/markup-carve/carve-php/commit/967f253974433dbc53534df74b7abeae10f26458) |
| published | [`3b3a09ff793fbc11b5c32bae6d74bee4d7676516`](https://github.com/markup-carve/carve-php/commit/3b3a09ff793fbc11b5c32bae6d74bee4d7676516) |

Measured 2026-10-15T22:25:16.274Z, PHP 8.5.11 (cli) (built: Sep 24 2026 13:49:29) (NTS). Allowed CPU: 13. One-minute host load: 5.29 to 3.22. CPU affinity does not reserve a core.

## Paired results

Times are medians of eight round medians. Each round retains seven batches of forty conversions after at least 100 warmup conversions and 500 ms. Revision and profile order reverse on alternate rounds. Wall time includes scheduling delays; process CPU time measures user and system CPU consumed by the worker. Neither isolates every shared-host effect.

| Profile | Metric | Previous ms | Published ms | Median paired ratio | 95% interval |
| --- | --- | ---: | ---: | ---: | --- |
| tier1 | wall | 3.420 | 3.390 | 0.989 | 0.983 to 1.002 |
| tier1 | CPU | 3.420 | 3.390 | 0.989 | 0.983 to 1.002 |
| tier2 | wall | 3.690 | 3.689 | 0.999 | 0.990 to 1.000 |
| tier2 | CPU | 3.690 | 3.689 | 0.999 | 0.990 to 1.000 |
| tier3 | wall | 4.188 | 4.174 | 0.996 | 0.990 to 1.002 |
| tier3 | CPU | 4.188 | 4.174 | 0.996 | 0.990 to 1.003 |

The median paired ratio can differ from the ratio of the two displayed median times. Intervals use 10,000 seeded bootstrap resamples of the eight paired round ratios. They describe this run and do not account for every source of systematic error. Identical output hashes are required across revisions and rounds for each profile. The worker hashes the last conversion of every measured batch; it does not hash each timed conversion.

The unpaired full-run tier rows come from separate snapshots and cannot establish a code effect. Use the paired ratios and their intervals when assessing changes. The raw record includes wall and CPU samples, output hashes, JIT state, exact source commits, producer hashes and host load.

## Reproduce

Install the benchmark PHP dependencies with `composer install --working-dir=engines/php`. Check out the two commits above in clean official carve-php clones. Create a local JSON configuration with `previous` and `published` entries, each containing `path` and `commit`. All revisions share the benchmark Composer loader; loaded Carve classes, interfaces and traits are checked against the requested source tree.

```sh
taskset -c 13 node scripts/php-tier-pairs.mjs CONFIG.json /tmp/php-tier-pairs.json
node scripts/php-tier-report.mjs /tmp/php-tier-pairs.json reports/dev-main-full-pre-postfix-20261015.json
python3 scripts/public_report.py reports/php-tier-pairs.json
```

The runner refuses to overwrite an existing measurement. PHP uses `-n`, ctype and mbstring, a 512M memory limit, CLI opcache and tracing JIT. The existing tier harness configures the converter; its initial one-trial result is retained as `startup`, not used in the paired summary. [Raw samples and provenance](php-tier-pairs.json).
