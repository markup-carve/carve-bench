# Paired full-feature benchmark

Eight serial rounds alternate before/after order. A pilot calibrates identical iteration counts within each pair for a 1.5-second target; every timed window must exceed one second. Workers warm up to 20 calls. Exact output hashes must match within each engine. PHP tracing JIT is required. Median per-round ratios and their full ranges describe these samples; they are not significance tests. Six cases are reported without multiple-comparison adjustment. The host is shared and CPU affinity applies to compiler and GC threads.

Measured 2026-10-07T17:36:53.948Z; CPU affinity [13]. All source builds completed before timing. The closed-block workload exercises formatting, quotations, nested lists, definition lists, tables, code, raw HTML and footnotes.

Before commits are the development snapshots published by benchmark commit `9ca2a4427601f634049b828781ddc66db14a2c0f`, from its full-corpus report. They are merged main heads, not release tags. After revisions use the merged JS and PHP fixes and retain the same Rust commit.

| Engine | Before commit | After commit |
|---|---|---|
| js | `5b9ca1632e179418944bc869ddd4dbc4165f9485` | `a5c6d6457438a2d0519d474b752a6dac5c0d00bc` |
| php | `40653c424dc9d3cc063aeb542696d42ffb58ea79` | `46da1921cfa92f82b85793138da008581b3a42e2` |
| rs | `2246a9b2b6e68b10530736af611ac0263c951d39` | `2246a9b2b6e68b10530736af611ac0263c951d39` |

| Engine | Sections | Before ms | After ms | Median paired change | Paired range |
|---|---:|---:|---:|---:|---|
| js | 128 | 51.6886 | 52.8331 | +0.7% | -52.5% to +10.1% |
| js | 512 | 203.7054 | 217.1527 | +2.2% | -9.9% to +45.1% |
| php | 128 | 113.1521 | 124.2146 | +4.5% | -10.1% to +71.1% |
| php | 512 | 529.2614 | 511.9532 | -3.8% | -29.7% to +14.8% |
| rs | 128 | 8.7721 | 9.0796 | +1.2% | -35.8% to +9.8% |
| rs | 512 | 44.6376 | 42.9887 | -5.2% | -9.1% to +1.5% |

Positive changes mean more elapsed time; negative changes mean less. All changes are observed per-round ratios, not significance claims. The full range shows run-to-run variation, and testing several cases increases the risk of chance patterns.

Output hashes agree within each engine at every size. This checks before/after equivalence, not byte-identical HTML across implementations. The concatenated corpus remains a separate stress workload. Historical rows with changed output or CPU settings cannot establish code speedups.

Rust binary and generated-manifest hashes identify the local artifacts. Checkout locations affect those hashes, so another machine need not reproduce them byte for byte.

[Raw controls, samples and provenance](final-audit-pairs.json).

To reproduce, provide a local config with `baseline_benchmark_commit`, `before` and `after`. Each revision map contains `js`, `php` and `rs` entries with `path` and full `commit`. The baseline benchmark commit must contain the before source pins in `reports/dev-main-full.json`. Install locked JS dependencies and the benchmark PHP dependencies. On Linux, select an available CPU and run `taskset -c CPU node scripts/compare-full-feature.mjs CONFIG.json`. Both revisions inherit the same affinity. The runner exports portable metadata and archives a previously committed paired report before replacing it.
