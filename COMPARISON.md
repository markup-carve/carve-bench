# Same-language comparison

Parse + render to HTML, in-process. Each result is the fastest of five warmed
trials; every trial runs the iteration count shown. Inputs carry equivalent
logical content in native Carve, Djot, or Markdown syntax and are 48.1–48.4 KiB.
The libraries do not have identical feature sets or output, so this compares
rendering cost for representative documents—not semantic equivalence.

Locked comparison versions: djot.js 0.3.2, markdown-it 15.0.0, djot-php
0.1.32, league/commonmark 2.10.0, jotdown 0.10.0, comrak 0.54.0, and
pulldown-cmark 0.13.4. The checked snapshot used the machine, runtimes, and
Carve engine heads recorded in `RESULTS.md`.

Every configured engine earns the same 18 workload feature points; see
`FEATURES.md` for the auditable scoring rubric and why it is context rather
than a throughput normalization.

![Bar chart of same-language render throughput, normalized within each language](./charts/comparison.svg)

## Rust

| Engine | Feature points | MB/s | ms/op | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|
| carve-rs | 18 | 5.30 | 8.8659 | 1.00x | 5 × 200 |
| jotdown | 18 | 34.39 | 1.3738 | 6.49x | 5 × 200 |
| comrak | 18 | 31.36 | 1.5063 | 5.92x | 5 × 200 |
| pulldown-cmark | 18 | 94.94 | 0.4976 | 17.91x | 5 × 200 |

## JavaScript

| Engine | Feature points | MB/s | ms/op | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|
| carve-js | 18 | 2.14 | 21.9211 | 1.00x | 5 × 100 |
| djot.js | 18 | 5.94 | 7.9518 | 2.77x | 5 × 100 |
| markdown-it | 18 | 5.96 | 7.9328 | 2.78x | 5 × 100 |

## PHP

| Engine | Feature points | MB/s | ms/op | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|
| carve-php | 18 | 1.21 | 38.8709 | 1.00x | 5 × 50 |
| djot-php | 18 | 3.82 | 12.3675 | 3.16x | 5 × 50 |
| league/commonmark-gfm | 18 | 1.56 | 30.2136 | 1.29x | 5 × 50 |

Language groups should be run in isolation. Sustained host load can reduce
absolute throughput substantially even when within-language ordering stays
similar; contaminated groups should be rerun rather than published.
