# Conversion controls for the pinned benchmark revisions

The baseline published in [benchmark #48](https://github.com/markup-carve/carve-bench/pull/48) and the pinned merged main run in two reversed rounds on CPU 13. Both PHP revisions use tracing JIT and a 512 MiB memory limit.

Two serial rounds reverse before/after order on one CPU. Every process warms up twenty conversions. Core, small and medium inputs use five timed trials; large uses two. JS also includes the core input without tables. Iteration counts match within every pair. Rows with different outputs within an engine and input are marked non-comparable and have no paired change. Rust input hashes identify the requested fixtures; its worker reports bytes, not an independently computed source hash. Changes are the arithmetic mean of the two per-round ratios. Change display is suppressed when same-revision drift exceeds the observed change or a timed window is shorter than one second. The ms columns are medians of all timed samples for each revision. Observed changes average the two per-round median ratios and can differ from the ratio of pooled medians. Positive paired changes mean more elapsed time. Two pairs expose output differences and timing instability, and do not establish statistical significance.

Measured 2026-10-08T14:41:56Z to 2026-10-08T14:54:56Z. Exact source pins and build hashes are in the [paired build report](final-audit-pairs-pre-pin-refresh-20261014.json).

| Engine | Case | Before ms | After ms | Mean paired change | Status |
|---|---|---:|---:|---:|---|
| js | core | 4.9625 | 4.9552 | suppressed | contended |
| js | small | 0.7565 | 0.7142 | suppressed | contended |
| js | medium | 132.0675 | 139.3292 | suppressed | output-mismatch |
| js | large | 1503.2871 | 1598.8768 | suppressed | output-mismatch |
| js | js-without-tables | 2.9572 | 2.8373 | suppressed | contended |
| php | core | 4.1370 | 3.9921 | -3.7% | observed |
| php | small | 1.6714 | 1.7686 | suppressed | contended |
| php | medium | 203.2486 | 207.8141 | suppressed | output-mismatch |
| php | large | 2625.9903 | 2676.0826 | suppressed | output-mismatch |
| rs | core | 0.4250 | 0.4326 | suppressed | short-window |
| rs | small | 0.1162 | 0.1151 | -0.9% | observed |
| rs | medium | 31.9547 | 31.4262 | suppressed | output-mismatch |
| rs | large | 376.6086 | 373.1605 | suppressed | output-mismatch |

Positive changes mean more elapsed time. Suppressed changes have different outputs, short timing windows, or drift larger than the observed change. The raw report retains every sample, output hash and suppression reason. These two pairs do not establish statistical significance.

[Raw samples and provenance](final-audit-conversion-checks-pre-pin-refresh-20261014.json).
