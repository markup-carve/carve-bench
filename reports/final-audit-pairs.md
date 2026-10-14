# Paired full-feature benchmark

Eight serial rounds alternate before/after order. A pilot calibrates identical iteration counts within each pair for a 1.5-second target; every timed window must exceed one second. Workers warm up to 20 calls. Exact output hashes must match within each engine. PHP tracing JIT is required. Median per-round ratios and their full ranges describe these samples; they are not significance tests. Six cases are reported without multiple-comparison adjustment. The host is shared and CPU affinity applies to compiler and GC threads.

Measured 2026-10-14T10:39:37.073Z; CPU affinity [13]. All source builds completed before timing. The closed-block workload exercises formatting, quotations, nested lists, definition lists, tables, code, raw HTML and footnotes.

Before commits are the development snapshots published by benchmark commit `9b742aca7d2a73251fd74f9f4bbb880beffe2d8b`, from its full-corpus report. They are merged main heads, not release tags. After commits are the newer merged main heads named below.

| Engine | Before commit | After commit |
|---|---|---|
| js | `a5c6d6457438a2d0519d474b752a6dac5c0d00bc` | `43c888310a8b1f96b77e0a79672e96d6cfbe1b86` |
| php | `46da1921cfa92f82b85793138da008581b3a42e2` | `cb3dec89cba4bfeb7ea15861c952073ec4825567` |
| rs | `2246a9b2b6e68b10530736af611ac0263c951d39` | `61b673ce9d8c5628f4d4e3882d1fcb19f6002b2d` |

| Engine | Sections | Before ms | After ms | Median paired change | Paired range |
|---|---:|---:|---:|---:|---|
| js | 128 | 52.7779 | 56.3681 | +11.2% | +3.0% to +15.7% |
| js | 512 | 205.7019 | 225.3598 | +7.6% | +4.1% to +27.7% |
| php | 128 | 119.2356 | 129.5381 | +14.7% | -0.8% to +24.6% |
| php | 512 | 490.3246 | 563.3013 | +11.7% | +7.3% to +21.1% |
| rs | 128 | 8.6648 | 8.0922 | -5.7% | -49.0% to +2.3% |
| rs | 512 | 41.4374 | 39.1201 | -6.5% | -14.0% to +192.7% |

Positive changes mean more elapsed time; negative changes mean less. All changes are observed per-round ratios, not significance claims. The full range shows run-to-run variation, and testing several cases increases the risk of chance patterns.

Output hashes agree within each engine at every size. This checks before/after equivalence, not byte-identical HTML across implementations. The concatenated corpus remains a separate stress workload. Historical rows with changed output or CPU settings cannot establish code speedups.

Rust binary and generated-manifest hashes identify the local artifacts. Checkout locations affect those hashes, so another machine need not reproduce them byte for byte.

[Raw controls, samples and provenance](final-audit-pairs.json).

To reproduce, provide a local config with `baseline_benchmark_commit`, `before` and `after`. Each revision map contains `js`, `php` and `rs` entries with `path` and full `commit`. The baseline benchmark commit must contain the before source pins in `reports/dev-main-full.json`. Install locked JS dependencies and the benchmark PHP dependencies. On Linux, select an available CPU and run `taskset -c CPU node scripts/compare-full-feature.mjs CONFIG.json`. Both revisions inherit the same affinity. The runner exports portable metadata and archives a previously committed paired report before replacing it.
