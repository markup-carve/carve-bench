# Benchmark results: core source-to-HTML vs same-language peers

This is **Track A**, the competitor-facing view, and the primary number: every
engine uses its normal fastest public source-to-HTML route in its default core
configuration, with no opt-in extensions registered. For Carve,
that deliberately includes the conservative borrowed facade where it accepts
the input. It answers the common conversion-API question; it is not a claim
that every row builds an equivalent owned AST or supports equivalent syntax.

For **Track B**, normal authoritative/full-parser scaling on the mixed Carve
corpus plus the PHP Tier 1/2/3 diagnostic, see [`RESULTS.md`](./RESULTS.md).

Parse + render to HTML, in-process. Each result is the fastest of five warmed
trials; every trial runs the iteration count shown. Inputs carry equivalent
logical content in native Carve, Djot, or Markdown syntax and are 48.1–48.4 KiB.
The libraries do not have identical feature sets or output, so this compares
rendering cost for representative documents—not semantic equivalence.

Do not compare a Track-A Carve number directly with a Track-B number: the first
may render borrowed source slices, while the second materializes the public AST
and runs the full semantic pipeline.

See [`COMPETITOR_ARCHITECTURE.md`](./COMPETITOR_ARCHITECTURE.md) for the
source-checked reading of each peer's architecture and why pulldown-cmark
is the one peer still ahead.

Locked comparison versions: djot.js 0.3.2, markdown-it 15.0.0, djot-php
0.1.32, league/commonmark 2.10.0, jotdown 0.10.0, comrak 0.54.0, and
pulldown-cmark 0.13.4. The checked snapshot used Carve engine heads
carve-js `5695480e`, carve-php `8abc2204`, carve-rs `78a88c34` on
Linux 7.0, Node.js 22.22.2, PHP 8.5.9 tracing JIT, and rustc 1.97.1.

Every configured engine earns the same 18 workload points. Core capability
points separately expose the much wider syntax surface an engine recognizes
by default. See `FEATURES.md` for the auditable matrix and limitations.

![Bar chart of same-language render throughput, normalized within each language](./charts/comparison.svg)

![Bar chart of core route throughput across every measured engine](./charts/core-throughput.svg)

![Bar chart of enabled core capability points](./charts/capabilities.svg)

## Headline: core route vs the fastest same-language peer

| Language | Carve | MB/s | Fastest peer | MB/s | Carve vs peer |
|---|---|---:|---|---:|---:|
| Rust | carve-rs | 113.80 | pulldown-cmark | 126.62 | 0.90x |
| JavaScript | carve-js | 11.81 | markdown-it | 5.05 | 2.34x |
| PHP | carve-php | 18.41 | djot-php | 4.07 | 4.52x |

Every row above is the default core route with no opt-in extensions registered.
The per-language tables below add each remaining peer and the capability breadth
each engine recognizes in that same configuration.

## The three Carve engines on the same document

| Engine | Language | ms/op | MB/s | rel |
|---|---|---:|---:|---:|
| carve-js | JavaScript | 3.9791 | 11.81 | 9.64x |
| carve-php | PHP | 2.5528 | 18.41 | 6.18x |
| carve-rs | Rust | 0.4129 | 113.80 | 1.00x |

Same input, same core route, so this is the direct cross-language cost of the
implementation rather than of the language surface. Full-corpus scaling for the
same three engines is in [`RESULTS.md`](./RESULTS.md).

## Rust

| Engine | Workload points | Core capability points | MB/s | Breadth index | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|---:|
| carve-rs | 18 | 43 | 113.80 | 4893.4 | 1.00x | 5 × 200 |
| jotdown | 18 | 32 | 45.57 | 1458.2 | 0.40x | 5 × 200 |
| comrak | 18 | 16 | 40.91 | 654.6 | 0.36x | 5 × 200 |
| pulldown-cmark | 18 | 16 | 126.62 | 2025.9 | 1.11x | 5 × 200 |

## JavaScript

| Engine | Workload points | Core capability points | MB/s | Breadth index | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|---:|
| carve-js | 18 | 43 | 11.81 | 507.8 | 1.00x | 5 × 100 |
| djot.js | 18 | 32 | 4.75 | 151.8 | 0.40x | 5 × 100 |
| markdown-it | 18 | 17 | 5.05 | 85.8 | 0.43x | 5 × 100 |

## PHP

| Engine | Workload points | Core capability points | MB/s | Breadth index | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|---:|
| carve-php | 18 | 43 | 18.41 | 791.5 | 1.00x | 5 × 50 |
| djot-php | 18 | 32 | 4.07 | 130.3 | 0.22x | 5 × 50 |
| league/commonmark-gfm | 18 | 18 | 1.59 | 28.6 | 0.09x | 5 × 50 |

Language groups should be run in isolation. Sustained host load can reduce
absolute throughput substantially even when within-language ordering stays
similar; contaminated groups should be rerun rather than published.
