# Paired full-feature benchmark

Eight serial rounds alternate before/after order. A pilot calibrates identical iteration counts within each pair for a 1.5-second target; every timed window must exceed one second. Workers warm up to 20 calls. Exact output hashes must match within each engine. PHP tracing JIT is required. Median per-round ratios and their full ranges describe these samples; they are not significance tests. Six cases are reported without multiple-comparison adjustment. The host is shared and CPU affinity applies to compiler and GC threads.

Measured 2026-10-05T20:44:17.842Z; CPU affinity [13]. All source builds completed before timing. The closed-block workload exercises formatting, quotations, nested lists, definition lists, tables, code, raw HTML and footnotes.

Before commits are the development snapshots published by benchmark commit `ed2d02d031d1427f428a632568b9e9f4637ce1e8`, from its full-corpus report. They are merged main heads, not release tags. After commits are the newer merged main heads named below.

| Engine | Before commit | After commit |
|---|---|---|
| js | `a0e996083129b9d51e63be6982d79843fd35ea32` | `a7c80d37fb322d28bc5061175bbd9c7f7638c175` |
| php | `41c9fe6026e91ee0396dc98ee65be64b6080d3b3` | `49c235d768ea6faec074d4b561ed3783d99b6fbd` |
| rs | `914704f80c08bc3b52703c9bc06dc3ff89ded7f4` | `8ee78ecb83d82ed81c544c17483e0eb111398f9d` |

| Engine | Sections | Before ms | After ms | Median paired change | Paired range |
|---|---:|---:|---:|---:|---|
| js | 128 | 42.8161 | 41.8894 | +0.3% | -7.6% to +14.8% |
| js | 512 | 164.6276 | 174.4375 | +4.5% | -1.2% to +9.4% |
| php | 128 | 82.5829 | 90.6050 | +8.4% | -2.7% to +23.0% |
| php | 512 | 476.3319 | 427.3964 | -9.4% | -17.2% to -4.9% |
| rs | 128 | 7.2467 | 7.1344 | -0.6% | -4.7% to +2.3% |
| rs | 512 | 36.8687 | 36.1876 | -0.9% | -4.3% to +2.6% |

Positive changes mean more elapsed time; negative changes mean less. All changes are observed per-round ratios, not significance claims. The full range shows run-to-run variation, and testing several cases increases the risk of chance patterns.

Output hashes agree within each engine at every size. This checks before/after equivalence, not byte-identical HTML across implementations. The concatenated corpus remains a separate stress workload. Historical rows with changed output or CPU settings cannot establish code speedups.

Rust binary and generated-manifest hashes identify the local artifacts. Checkout locations affect those hashes, so another machine need not reproduce them byte for byte.

[Raw controls, samples and provenance](paired-full-feature-20261005T204417842.json).

To reproduce, provide a local config with `baseline_benchmark_commit`, `before` and `after`. Each revision map contains `js`, `php` and `rs` entries with `path` and full `commit`. The baseline benchmark commit must contain the before source pins in `reports/dev-main-full.json`. Install locked JS dependencies and the benchmark PHP dependencies. On Linux, select an available CPU and run `taskset -c CPU node scripts/compare-full-feature.mjs CONFIG.json`. Both revisions inherit the same affinity. The runner exports portable metadata and archives a previously committed paired report before replacing it.
