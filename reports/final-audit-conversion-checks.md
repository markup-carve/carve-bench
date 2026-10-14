# Conversion controls for the pinned benchmark revisions

The baseline published in [benchmark #48](https://github.com/markup-carve/carve-bench/pull/48) and the pinned merged main run in two reversed rounds on CPU 13. Both PHP revisions use tracing JIT and a 512 MiB memory limit.

Two serial rounds reverse before/after order on one CPU. Every process warms up twenty conversions. Core, small and medium inputs use five timed trials; large uses two. JS also includes the core input without tables. Iteration counts match within every pair. Rows with different outputs within an engine and input are marked non-comparable and have no paired change. Rust input hashes identify the requested fixtures; its worker reports bytes, not an independently computed source hash. Changes are the arithmetic mean of the two per-round ratios. Change display is suppressed when same-revision drift exceeds the observed change or a timed window is shorter than one second. The ms columns are medians of all timed samples for each revision. Observed changes average the two per-round median ratios and can differ from the ratio of pooled medians. Positive paired changes mean more elapsed time. Two pairs expose output differences and timing instability, and do not establish statistical significance.

Measured 2026-10-14T10:46:39Z to 2026-10-14T11:04:36Z. Exact source pins and build hashes are in the [paired build report](final-audit-pairs.json).

Host load average (1, 5, 15 min) rose from 6.14, 6.42, 7.04 at the start to 27.64, 23.31, 14.91 at the end, when another build lane started; the Rust rows ran last and took the heaviest contention. Treat these rows as output controls first and timings second.

| Engine | Case | Before ms | After ms | Mean paired change | Status |
|---|---|---:|---:|---:|---|
| js | core | 4.6909 | 4.5337 | suppressed | contended |
| js | small | 0.7741 | 0.7849 | suppressed | output-mismatch |
| js | medium | 138.6421 | 137.6482 | suppressed | output-mismatch |
| js | large | 3301.1438 | 764.6812 | suppressed | output-mismatch |
| js | js-without-tables | 2.4753 | 2.3843 | suppressed | short-window |
| php | core | 4.1403 | 3.8322 | suppressed | contended |
| php | small | 1.8161 | 1.8134 | suppressed | output-mismatch |
| php | medium | 219.1877 | 240.7379 | suppressed | output-mismatch |
| php | large | 3138.8743 | 1860.3194 | suppressed | output-mismatch |
| rs | core | 0.6594 | 0.5545 | suppressed | contended |
| rs | small | 0.2903 | 0.1640 | suppressed | output-mismatch |
| rs | medium | 63.4078 | 48.0102 | suppressed | output-mismatch |
| rs | large | 1363.1229 | 1631.9542 | suppressed | output-mismatch |

Positive changes mean more elapsed time. Suppressed changes have different outputs, short timing windows, or drift larger than the observed change. The raw report retains every sample, output hash and suppression reason. These two pairs do not establish statistical significance.

[Raw samples and provenance](final-audit-conversion-checks.json).
