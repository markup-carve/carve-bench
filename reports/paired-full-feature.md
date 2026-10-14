# Paired full-feature benchmark

Eight serial rounds alternate before/after order. A pilot calibrates identical iteration counts within each pair for a 1.5-second target; every timed window must exceed one second. Workers warm up to 20 calls. Exact output hashes must match within each engine. PHP tracing JIT is required. Median per-round ratios and their full ranges describe these samples; they are not significance tests. Six cases are reported without multiple-comparison adjustment. The host is shared and CPU affinity applies to compiler and GC threads.

Measured 2026-10-14T11:13:24.636Z; CPU affinity [13]. All source builds completed before timing. The closed-block workload exercises formatting, quotations, nested lists, definition lists, tables, code, raw HTML and footnotes.

This rerun repeats the 2026-10-06 revision pairs against the benchmark's current dependency locks. Host load changed from [5.39, 8.74, 11.14] to [29.10, 20.72, 15.59] as other build lanes started, so the wide paired ranges reflect host contention. The output-hash checks are unaffected.

Before commits are the development snapshots published by benchmark commit `b4f8e1e130dbae0036c7b8d3a17f9320e93c1e63`, from its full-corpus report. They are merged main heads, not release tags. After commits are the newer merged main heads named below.

| Engine | Before commit | After commit |
|---|---|---|
| js | `a7c80d37fb322d28bc5061175bbd9c7f7638c175` | `355d6de61406342d8aa989afed358f0d004ff586` |
| php | `49c235d768ea6faec074d4b561ed3783d99b6fbd` | `45de896cea3d8944287f28ca155dea3afe04feec` |
| rs | `ae44de38b6ecf468212cac117f83158f7c3988c2` | `5b7bea1ada2a507867d62278145fd7f9fd3f000d` |

| Engine | Sections | Before ms | After ms | Median paired change | Paired range |
|---|---:|---:|---:|---:|---|
| js | 128 | 77.0793 | 68.0294 | +1.7% | -75.2% to +34.3% |
| js | 512 | 264.5249 | 298.7511 | +0.7% | -52.2% to +271.1% |
| php | 128 | 211.4580 | 184.5762 | +3.7% | -49.0% to +25.8% |
| php | 512 | 824.8231 | 817.4985 | -6.3% | -25.5% to +29.2% |
| rs | 128 | 15.7395 | 14.7353 | -0.8% | -18.9% to +37.3% |
| rs | 512 | 67.8210 | 72.1108 | +5.8% | -16.6% to +27.8% |

Positive changes mean more elapsed time; negative changes mean less. All changes are observed per-round ratios, not significance claims. The full range shows run-to-run variation, and testing several cases increases the risk of chance patterns.

Output hashes agree within each engine at every size. This checks before/after equivalence, not byte-identical HTML across implementations. The concatenated corpus remains a separate stress workload. Historical rows with changed output or CPU settings cannot establish code speedups.

Rust binary and generated-manifest hashes identify the local artifacts. Checkout locations affect those hashes, so another machine need not reproduce them byte for byte.

[Raw controls, samples and provenance](paired-full-feature.json).

To reproduce, provide a local config with `baseline_benchmark_commit`, `before` and `after`. Each revision map contains `js`, `php` and `rs` entries with `path` and full `commit`. The baseline benchmark commit must contain the before source pins in `reports/dev-main-full.json`. Install locked JS dependencies and the benchmark PHP dependencies. On Linux, select an available CPU and run `taskset -c CPU node scripts/compare-full-feature.mjs CONFIG.json`. Both revisions inherit the same affinity. The runner exports portable metadata and archives a previously committed paired report before replacing it.
