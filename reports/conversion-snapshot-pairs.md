# Exact-corpus revision checks

These diagnostic runs compare the previous published development snapshots with the pinned audit merges on the committed benchmark inputs. They predate later parser follow-ups. The raw record retains every timed sample and output control. They do not isolate the audit changes from other commits between these pins.

Measured 2026-10-06T22:33:20Z to 2026-10-06T22:44:41Z; CPU affinity `[13]`. Host load changed from `[7.16357421875, 14.2197265625, 13.392578125]` to `[2.37109375, 5.55224609375, 9.09130859375]`. The host is shared.

Two serial rounds reverse revision order. Each process warms up twenty conversions. Core, small and medium inputs use five trials; large uses two. JS also measures the core input without tables. Iteration counts match within each pair. The milliseconds below are medians of all timed samples; observed changes average the two per-round median ratios. Those are different summaries.

A change is suppressed when same-revision drift exceeds the observed change, when any timed window lasts less than one second, or when output controls differ. This is a diagnostic filter, not a statistical confidence test. Unsuppressed values remain observations, not estimates of code regressions. Positive means more elapsed time.

| Engine | Input | Before ms | After ms | Observed change | Round range | Status |
|---|---|---:|---:|---:|---|---|
| js | core | 4.0955 | 4.4382 | suppressed | +9.1% to +154.8% | within same-revision drift |
| js | small | 0.6455 | 0.6452 | suppressed | -3.1% to +3.2% | within same-revision drift |
| js | medium | 116.0132 | 121.6995 | +4.4% | +3.5% to +5.4% | observed |
| js | large | 1403.3596 | 1286.7809 | suppressed | -19.7% to +29.8% | within same-revision drift |
| js | js-without-tables | 2.4070 | 2.4320 | suppressed | +0.8% to +1.0% | short-window |
| php | core | 4.3568 | 3.7439 | suppressed | -18.8% to +3.0% | within same-revision drift |
| php | small | 1.5487 | 1.5495 | suppressed | -3.8% to +3.5% | within same-revision drift |
| php | medium | 173.4575 | 167.1812 | suppressed | +0.4% to +9.7% | short-window |
| php | large | 2066.9791 | 2250.6658 | suppressed | see raw record | output-mismatch |
| rs | core | 0.4649 | 0.4742 | suppressed | +1.9% to +2.1% | short-window |
| rs | small | 0.1152 | 0.1169 | +1.5% | +0.5% to +2.5% | observed |
| rs | medium | 29.8653 | 29.8590 | suppressed | -1.1% to +2.1% | short-window |
| rs | large | 349.4296 | 355.0943 | suppressed | +1.3% to +2.5% | within same-revision drift |

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
