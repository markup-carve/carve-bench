# Paired conversion checks after the queue audit

The previous published snapshot and the merged queue fixes run in two reversed rounds on CPU 13. Both PHP revisions use tracing JIT and a 512 MiB memory limit.

Two serial rounds reverse before/after order on one CPU. Every process warms up twenty conversions. Core, small and medium inputs use five timed trials; large uses two. JS also includes the core input without tables. Iteration counts match within every pair. Rows with different outputs within an engine and input are marked non-comparable and have no paired change. Rust input hashes identify the requested fixtures; its worker reports bytes, not an independently computed source hash. Changes are the arithmetic mean of the two per-round ratios. Change display is suppressed when same-revision drift exceeds the observed change or a timed window is shorter than one second. The ms columns are medians of all timed samples for each revision. Observed changes average the two per-round median ratios and can differ from the ratio of pooled medians. Positive paired changes mean more elapsed time. Two pairs expose output differences and timing instability, and do not establish statistical significance.

Measured 2026-10-07T22:02:44Z to 2026-10-07T22:17:13Z. Exact source pins and build hashes are in the [paired build report](final-audit-pairs.json).

| Engine | Case | Before ms | After ms | Mean paired change | Status |
|---|---|---:|---:|---:|---|
| js | core | 5.0683 | 5.0632 | suppressed | contended |
| js | small | 0.8769 | 0.8915 | suppressed | contended |
| js | medium | 167.3313 | 162.0345 | suppressed | contended |
| js | large | 1480.3941 | 1587.3036 | suppressed | contended |
| js | js-without-tables | 2.8662 | 2.8282 | suppressed | contended |
| php | core | 4.1165 | 4.1062 | suppressed | contended |
| php | small | 1.8406 | 1.8053 | suppressed | contended |
| php | medium | 238.4817 | 252.0956 | suppressed | contended |
| php | large | 3083.7766 | 2985.7774 | suppressed | contended |
| rs | core | 0.5255 | 0.5275 | suppressed | contended |
| rs | small | 0.1388 | 0.1405 | suppressed | contended |
| rs | medium | 41.5616 | 40.4300 | suppressed | short-window |
| rs | large | 451.3212 | 431.4755 | suppressed | contended |

Positive changes mean more elapsed time. Suppressed changes have different outputs, short timing windows, or drift larger than the observed change. The raw report retains every sample, output hash and suppression reason. These two pairs do not establish statistical significance.

[Raw samples and provenance](final-audit-conversion-checks.json).
