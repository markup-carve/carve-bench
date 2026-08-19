# Same-language comparison

Parse + render to HTML, in-process. Each result is the fastest of five warmed
trials; every trial runs the iteration count shown. Inputs carry equivalent
logical content in native Carve, Djot, or Markdown syntax and are 48.1–48.4 KiB.
The libraries do not have identical feature sets or output, so this compares
rendering cost for representative documents—not semantic equivalence.

Locked comparison versions: djot.js 0.3.2, markdown-it 15.0.0, djot-php
0.1.32, league/commonmark 2.10.0, jotdown 0.10.0, comrak 0.54.0, and
pulldown-cmark 0.13.4. The checked snapshot used Carve engine heads
carve-js `528b845a`, carve-php `5325a97c`, and carve-rs `e867367a` on
Linux 7.0, Node.js 22.22.2, PHP 8.5.9 tracing JIT, and rustc 1.97.1.

Every configured engine earns the same 18 workload points. Core capability
points separately expose the much wider syntax surface an engine recognizes
by default. See `FEATURES.md` for the auditable matrix and limitations.

![Bar chart of same-language render throughput, normalized within each language](./charts/comparison.svg)

![Bar chart of enabled core capability points](./charts/capabilities.svg)

## Rust

| Engine | Workload points | Core capability points | MB/s | Breadth index | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|---:|
| carve-rs | 18 | 43 | 7.16 | 307.9 | 1.00x | 5 × 200 |
| jotdown | 18 | 32 | 31.20 | 998.4 | 4.36x | 5 × 200 |
| comrak | 18 | 16 | 29.47 | 471.5 | 4.12x | 5 × 200 |
| pulldown-cmark | 18 | 16 | 86.77 | 1388.3 | 12.12x | 5 × 200 |

## JavaScript

| Engine | Workload points | Core capability points | MB/s | Breadth index | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|---:|
| carve-js | 18 | 43 | 1.94 | 83.4 | 1.00x | 5 × 100 |
| djot.js | 18 | 32 | 4.91 | 157.1 | 2.53x | 5 × 100 |
| markdown-it | 18 | 17 | 4.48 | 76.2 | 2.31x | 5 × 100 |

## PHP

| Engine | Workload points | Core capability points | MB/s | Breadth index | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|---:|
| carve-php | 18 | 43 | 0.89 | 38.3 | 1.00x | 5 × 50 |
| djot-php | 18 | 32 | 2.58 | 82.6 | 2.91x | 5 × 50 |
| league/commonmark-gfm | 18 | 18 | 1.09 | 19.7 | 1.23x | 5 × 50 |

Language groups should be run in isolation. Sustained host load can reduce
absolute throughput substantially even when within-language ordering stays
similar; contaminated groups should be rerun rather than published.
