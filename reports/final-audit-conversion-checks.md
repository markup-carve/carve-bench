# Paired conversion checks after the final audit

The previous published snapshot and the current merged fixes run in two reversed rounds on CPU 13. Both PHP revisions use tracing JIT and a 512 MiB memory limit. The older PHP baseline exceeds 128 MiB on the large input. Rust uses identical binaries on both sides.

Two serial rounds reverse before/after order on one CPU. Every process warms up twenty conversions. Core, small and medium inputs use five timed trials; large uses two. JS also includes the core input without tables. Iteration counts match within every pair. Rows with different outputs within an engine and input are marked non-comparable and have no paired change. Rust input hashes identify the requested fixtures; its worker reports bytes, not an independently computed source hash. Changes are the arithmetic mean of the two per-round ratios. Change display is suppressed when same-revision drift exceeds the observed change or a timed window is shorter than one second. The ms columns are medians of all timed samples for each revision. Observed changes average the two per-round median ratios and can differ from the ratio of pooled medians. Positive paired changes mean more elapsed time. Two pairs check for output differences and timing instability, and do not establish statistical significance.

Measured 2026-10-07T17:54:01Z to 2026-10-07T18:07:12Z. Exact source pins and build hashes are in the [paired build report](final-audit-pairs.json).

| Engine | Case | Before ms | After ms | Mean paired change | Status |
|---|---|---:|---:|---:|---|
| js | core | 4.1392 | 4.6599 | suppressed | contended |
| js | small | 0.6998 | 0.6455 | suppressed | contended |
| js | medium | 117.2293 | 117.1733 | suppressed | short-window |
| js | large | 1264.0866 | 1321.0456 | suppressed | contended |
| js | js-without-tables | 2.3814 | 2.5004 | suppressed | short-window |
| php | core | 4.2864 | 4.0793 | suppressed | contended |
| php | small | 2.2415 | 2.0149 | -13.4% | observed |
| php | medium | 234.7738 | 215.3822 | suppressed | short-window |
| php | large | 2862.4277 | 3084.6867 | +7.5% | observed |
| rs | core | 0.4768 | 0.4547 | suppressed | short-window |
| rs | small | 0.1321 | 0.1182 | -8.4% | observed |
| rs | medium | 33.9265 | 34.9578 | suppressed | short-window |
| rs | large | 372.0280 | 385.2912 | suppressed | contended |

Positive changes mean more elapsed time. A suppressed change has different outputs, short timing windows, or drift larger than the observed change. The raw report retains every sample, range, output hash and suppression reason. These two pairs do not establish statistical significance.

The [full-corpus snapshot](dev-main-full.json) is a separate run with the same engine pins. Its timings describe that session, rather than a paired change. The [previous full-corpus snapshot](dev-main-full-pre-final-audit-20261007.json) and [historical memory control](php-large-memory-control.json) retain the older measurements.

[Raw samples and provenance](final-audit-conversion-checks.json).

To reproduce, use the before and after pins from the paired build report. Run the paired build with a fresh `artifact_directory`, then retain its exported JSON as `reports/final-audit-pairs.json`. Install the locked dependencies and select an available CPU:

```sh
taskset -c CPU python3 scripts/check-conversion-snapshots.py CONFIG.json \
  --rust-binaries ARTIFACT_DIRECTORY \
  --build-manifest reports/final-audit-pairs.json \
  --php-memory-limit 512M \
  --output reports/final-audit-conversion-checks.json
python3 scripts/public_report.py reports/final-audit-conversion-checks.json
```
