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

## Rust

| Engine | MB/s | ms/op | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|
| carve-rs | 7.19 | 6.5357 | 1.00x | 5 × 200 |
| jotdown | 35.98 | 1.3129 | 5.00x | 5 × 200 |
| comrak | 43.93 | 1.0754 | 6.11x | 5 × 200 |
| pulldown-cmark | 115.55 | 0.4089 | 16.07x | 5 × 200 |

## JavaScript

| Engine | MB/s | ms/op | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|
| carve-js | 1.79 | 26.2054 | 1.00x | 5 × 100 |
| djot.js | 5.57 | 8.4796 | 3.11x | 5 × 100 |
| markdown-it | 5.19 | 9.1106 | 2.89x | 5 × 100 |

## PHP

| Engine | MB/s | ms/op | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|
| carve-php | 0.36 | 129.0069 | 1.00x | 5 × 50 |
| djot-php | 3.00 | 15.7414 | 8.24x | 5 × 50 |
| league/commonmark-gfm | 1.37 | 34.5595 | 3.75x | 5 × 50 |
