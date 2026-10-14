# Exact-corpus revision checks

These diagnostic runs compare the previous published development snapshots with the pinned audit merges on the committed benchmark inputs. They predate later parser follow-ups. The raw record retains every timed sample and output control. They do not isolate the audit changes from other commits between these pins.

Measured 2026-10-14T11:25:07Z to 2026-10-14T11:49:10Z; CPU affinity `[13]`. This rerun repeats the 2026-10-06 revision pairs against the benchmark's current dependency locks. Host load changed from `[27.26, 20.70, 15.67]` to `[32.60, 35.51, 26.06]`: other build lanes held the shared host well above its 16 CPUs for the whole run, so the timings below mostly describe that contention. The output controls are the useful part of this rerun.

Two serial rounds reverse revision order. Each process warms up twenty conversions. Core, small and medium inputs use five trials; large uses two. JS also measures the core input without tables. Iteration counts match within each pair. The milliseconds below are medians of all timed samples; observed changes average the two per-round median ratios. Those are different summaries.

A change is suppressed when same-revision drift exceeds the observed change, when any timed window lasts less than one second, or when output controls differ. This is a diagnostic filter, not a statistical confidence test. Unsuppressed values remain observations, not estimates of code regressions. Positive means more elapsed time.

| Engine | Input | Before ms | After ms | Observed change | Round range | Status |
|---|---|---:|---:|---:|---|---|
| js | core | 6.8674 | 6.3362 | suppressed | -12.7% to +1.6% | within same-revision drift |
| js | small | 0.9469 | 1.2032 | suppressed | +19.6% to +40.7% | within same-revision drift |
| js | medium | 484.8336 | 166.3094 | suppressed | -83.5% to -13.8% | within same-revision drift |
| js | large | 1582.0841 | 1766.5673 | suppressed | -6.6% to +11.7% | within same-revision drift |
| js | js-without-tables | 3.1840 | 3.3746 | suppressed | +0.4% to +8.0% | within same-revision drift |
| php | core | 4.6934 | 4.5562 | suppressed | -12.3% to +2.5% | within same-revision drift |
| php | small | 2.8745 | 3.8914 | +36.2% | +5.5% to +66.9% | observed |
| php | medium | 298.7721 | 256.4945 | suppressed | -19.8% to +10.4% | within same-revision drift |
| php | large | 3402.0208 | 2795.2342 | suppressed | see raw record | output-mismatch |
| rs | core | 1.1925 | 0.8018 | suppressed | -39.3% to +7.5% | within same-revision drift |
| rs | small | 0.3725 | 0.2481 | suppressed | -83.4% to -27.3% | within same-revision drift |
| rs | medium | 258.6974 | 69.5180 | suppressed | -87.3% to -52.0% | within same-revision drift |
| rs | large | 581.2508 | 474.8825 | suppressed | -27.6% to -0.4% | within same-revision drift |

The PHP large-input output controls differ between revisions. The [JIT output control](php-large-jit-output-control.json) also records the previous revision with JIT disabled. That output matches the newer tracing-JIT control. This records three output controls; it does not establish the cause or show what every timed iteration rendered. No comparable PHP-large timing change is reported.

Rust source hashes identify the requested fixtures; the worker reports input bytes rather than computing its own source hash. Rust worker and binary hashes, source-tree fingerprints, JS build hashes, PHP dependencies and source-override shims are checked against the paired build manifest. Other timing-worker and JS dependency hashes are recorded in this run. That manifest records the build toolchain; `rustc_at_measurement` records the toolchain available when these measurements ran.

| Engine | Before commit | After commit |
|---|---|---|
| js | `a7c80d37fb322d28bc5061175bbd9c7f7638c175` | `355d6de61406342d8aa989afed358f0d004ff586` |
| php | `49c235d768ea6faec074d4b561ed3783d99b6fbd` | `45de896cea3d8944287f28ca155dea3afe04feec` |
| rs | `ae44de38b6ecf468212cac117f83158f7c3988c2` | `5b7bea1ada2a507867d62278145fd7f9fd3f000d` |

[Raw observations and provenance](conversion-snapshot-pairs.json). [Paired build method](paired-full-feature.md).

To reproduce, prepare the merged checkouts and locked dependencies listed in the paired method. Set a fresh absolute `artifact_directory` in its config and run the paired producer first. Then run:

```sh
taskset -c CPU python3 scripts/check-conversion-snapshots.py CONFIG.json --rust-binaries ARTIFACT_DIRECTORY
python3 scripts/public_report.py reports/conversion-snapshot-pairs.json
```

Keep the original raw file locally before export. Output and checkpoint paths must be fresh. CPU affinity and runtime versions must match the paired build manifest.
