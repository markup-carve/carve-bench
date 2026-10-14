# Paired full-feature benchmark

Eight serial rounds alternate before/after order. A pilot calibrates identical iteration counts within each pair for a 1.5-second target; every timed window must exceed one second. Workers warm up to 20 calls. Exact output hashes must match within each engine. PHP tracing JIT is required. Median per-round ratios and their full ranges describe these samples; they are not significance tests. Six cases are reported without multiple-comparison adjustment. The host is shared and CPU affinity applies to compiler and GC threads.

Measured 2026-10-08T14:35:55.252Z; CPU affinity [13]. All source builds completed before timing. The closed-block workload exercises formatting, quotations, nested lists, definition lists, tables, code, raw HTML and footnotes.

Before commits are the development snapshots published by benchmark commit `9b742aca7d2a73251fd74f9f4bbb880beffe2d8b`, from its full-corpus report. They are merged main heads, not release tags. After commits are the newer merged main heads named below.

| Engine | Before commit | After commit |
|---|---|---|
| js | `a5c6d6457438a2d0519d474b752a6dac5c0d00bc` | `e57653b22896118d3cd9e1457c9bdc36aec52d9c` |
| php | `46da1921cfa92f82b85793138da008581b3a42e2` | `19745164a182951f90a58620722e8e8f3418fd10` |
| rs | `2246a9b2b6e68b10530736af611ac0263c951d39` | `2a183262f866d0dca2ae515d8b655d21e01ade90` |

| Engine | Sections | Before ms | After ms | Median paired change | Paired range |
|---|---:|---:|---:|---:|---|
| js | 128 | 59.3815 | 54.8689 | -8.3% | -16.9% to +12.3% |
| js | 512 | 228.4856 | 241.3281 | -0.9% | -32.0% to +25.5% |
| php | 128 | 130.1561 | 128.5155 | -0.2% | -32.3% to +37.0% |
| php | 512 | 507.7413 | 542.3835 | +4.0% | -15.6% to +25.6% |
| rs | 128 | 8.7932 | 8.5381 | -2.1% | -6.0% to +18.9% |
| rs | 512 | 43.9276 | 43.0660 | -1.0% | -8.6% to +3.0% |

Positive changes mean more elapsed time; negative changes mean less. All changes are observed per-round ratios, not significance claims. The full range shows run-to-run variation, and testing several cases increases the risk of chance patterns.

Output hashes agree within each engine at every size. This checks before/after equivalence, not byte-identical HTML across implementations. The concatenated corpus remains a separate stress workload. Historical rows with changed output or CPU settings cannot establish code speedups.

Rust binary and generated-manifest hashes identify the local artifacts. Checkout locations affect those hashes, so another machine need not reproduce them byte for byte.

[Raw controls, samples and provenance](final-audit-pairs-pre-pin-refresh-20261014.json).

To reproduce, provide a local config with `baseline_benchmark_commit`, `before` and `after`. Each revision map contains `js`, `php` and `rs` entries with `path` and full `commit`. The baseline benchmark commit must contain the before source pins in `reports/dev-main-full.json`. Install locked JS dependencies and the benchmark PHP dependencies. On Linux, select an available CPU and run `taskset -c CPU node scripts/compare-full-feature.mjs CONFIG.json`. Both revisions inherit the same affinity. The runner exports portable metadata and archives a previously committed paired report before replacing it.
