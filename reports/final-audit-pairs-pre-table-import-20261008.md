# Paired full-feature benchmark

Eight serial rounds alternate before/after order. A pilot calibrates identical iteration counts within each pair for a 1.5-second target; every timed window must exceed one second. Workers warm up to 20 calls. Exact output hashes must match within each engine. PHP tracing JIT is required. Median per-round ratios and their full ranges describe these samples; they are not significance tests. Six cases are reported without multiple-comparison adjustment. The host is shared and CPU affinity applies to compiler and GC threads.

Measured 2026-10-07T21:57:10.836Z; CPU affinity [13]. All source builds completed before timing. The closed-block workload exercises formatting, quotations, nested lists, definition lists, tables, code, raw HTML and footnotes.

Before commits are the development snapshots published by benchmark commit `9b742aca7d2a73251fd74f9f4bbb880beffe2d8b`, from its full-corpus report. They are merged main heads, not release tags. After commits are the newer merged main heads named below.

| Engine | Before commit | After commit |
|---|---|---|
| js | `a5c6d6457438a2d0519d474b752a6dac5c0d00bc` | `72f7d1333bf4a271a7371b62c6c599d280412e68` |
| php | `46da1921cfa92f82b85793138da008581b3a42e2` | `9570a261517b26e0ad866087ef28a5679b8d8435` |
| rs | `2246a9b2b6e68b10530736af611ac0263c951d39` | `7a68f74a39c785549130abd97218a282cbce5b77` |

| Engine | Sections | Before ms | After ms | Median paired change | Paired range |
|---|---:|---:|---:|---:|---|
| js | 128 | 65.3246 | 66.0208 | +0.7% | -7.5% to +17.2% |
| js | 512 | 252.4017 | 259.5467 | +5.6% | -20.0% to +14.2% |
| php | 128 | 124.6060 | 126.5800 | -1.3% | -19.1% to +18.0% |
| php | 512 | 557.0285 | 560.0456 | -0.2% | -16.2% to +3.8% |
| rs | 128 | 9.5638 | 9.3570 | -1.0% | -9.2% to +9.3% |
| rs | 512 | 46.3423 | 47.4870 | +2.0% | -5.0% to +7.1% |

Positive changes mean more elapsed time; negative changes mean less. All changes are observed per-round ratios, not significance claims. The full range shows run-to-run variation, and testing several cases increases the risk of chance patterns.

Output hashes agree within each engine at every size. This checks before/after equivalence, not byte-identical HTML across implementations. The concatenated corpus remains a separate stress workload. Historical rows with changed output or CPU settings cannot establish code speedups.

Rust binary and generated-manifest hashes identify the local artifacts. Checkout locations affect those hashes, so another machine need not reproduce them byte for byte.

[Raw controls, samples and provenance](final-audit-pairs-pre-table-import-20261008.json).

To reproduce, provide a local config with `baseline_benchmark_commit`, `before` and `after`. Each revision map contains `js`, `php` and `rs` entries with `path` and full `commit`. The baseline benchmark commit must contain the before source pins in `reports/dev-main-full.json`. Install locked JS dependencies and the benchmark PHP dependencies. On Linux, select an available CPU and run `taskset -c CPU node scripts/compare-full-feature.mjs CONFIG.json`. Both revisions inherit the same affinity. The runner exports portable metadata and archives a previously committed paired report before replacing it.
