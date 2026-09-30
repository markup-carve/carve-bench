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
rendering cost for representative documents, not semantic equivalence.

Do not compare a Track-A Carve number directly with a Track-B number: the first
may render borrowed source slices, while the second materializes the public AST
and runs the full semantic pipeline.

See [`COMPETITOR_ARCHITECTURE.md`](./COMPETITOR_ARCHITECTURE.md) for the
source-checked reading of each peer's architecture and where each one's
cost sits against Carve's in the same language.

Locked comparison versions: djot.js 0.3.2, markdown-it 15.0.0, djot-php
dev-master (`fab953f6`), league/commonmark 2.10.0, jotdown 0.10.0,
comrak 0.54.0, and pulldown-cmark 0.13.4. The Carve engines this run
actually loaded, as each harness reported them back, were
carve-js `@markup-carve/carve 0.1.9 (local checkout /tmp/carve-js-perf-20260930 @ 6d02fa706)`, carve-php `markup-carve/carve-php (local checkout /tmp/carve-php-perf-20260930 @ 7033d04b1)`, carve-rs `carve-lang 0.1.7 (local checkout /tmp/carve-rs-perf-20260930 @ 9f3f334c7)`, measured
2026-09-30 UTC on Linux 7.0.0, Node.js 24.19.0, PHP 8.5.11 tracing JIT, and rustc 1.97.1. Development checkouts; fixed comparison inputs retained. This core comparison was not repeated with the full-corpus rerun. The shared host had 16 logical CPUs; load at its initial summary was 5.69, 10.42, 12.16. Timings do not establish a speed change.

Every configured engine earns the same 18 workload points. Core capability
points separately expose the much wider syntax surface an engine recognizes
by default. See `FEATURES.md` for the auditable matrix and limitations.

![Bar chart of same-language render throughput, normalized within each language](./charts/comparison.svg)

![Bar chart of core route throughput across every measured engine](./charts/core-throughput.svg)

![Bar chart of enabled core capability points](./charts/capabilities.svg)

## Headline: core route vs the fastest same-language peer

| Language | Carve | MB/s | Fastest peer | MB/s | Carve vs peer |
|---|---|---:|---|---:|---:|
| Rust | carve-rs | 89.26 | pulldown-cmark | 102.44 | 0.87x |
| JavaScript | carve-js | 12.92 | djot.js | 6.26 | 2.06x |
| PHP | carve-php | 10.31 | djot-php | 15.65 | 0.66x |

Every row above is the default core route with no opt-in extensions registered.
The per-language tables below add each remaining peer and the capability breadth
each engine recognizes in that same configuration.

## The three Carve engines on the same document

| Engine | Language | ms/op | MB/s | rel |
|---|---|---:|---:|---:|
| carve-js | JavaScript | 3.6374 | 12.92 | 6.91x |
| carve-php | PHP | 4.5574 | 10.31 | 8.66x |
| carve-rs | Rust | 0.5264 | 89.26 | 1.00x |

Same input, same core route, so this is the direct cross-language cost of the
implementation rather than of the language surface. Full-corpus scaling for the
same three engines is in [`RESULTS.md`](./RESULTS.md).

## Rust

| Engine | Workload points | Core capability points | MB/s | Breadth index | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|---:|
| carve-rs | 18 | 43 | 89.26 | 3838.2 | 1.00x | 5 × 200 |
| jotdown | 18 | 32 | 37.12 | 1187.8 | 0.42x | 5 × 200 |
| comrak | 18 | 16 | 34.69 | 555.0 | 0.39x | 5 × 200 |
| pulldown-cmark | 18 | 16 | 102.44 | 1639.0 | 1.15x | 5 × 200 |

## JavaScript

| Engine | Workload points | Core capability points | MB/s | Breadth index | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|---:|
| carve-js | 18 | 43 | 12.92 | 555.5 | 1.00x | 5 × 100 |
| djot.js | 18 | 32 | 6.26 | 200.2 | 0.48x | 5 × 100 |
| markdown-it | 18 | 17 | 6.07 | 103.2 | 0.47x | 5 × 100 |

## PHP

| Engine | Workload points | Core capability points | MB/s | Breadth index | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|---:|
| carve-php | 18 | 43 | 10.31 | 443.3 | 1.00x | 5 × 50 |
| djot-php | 18 | 32 | 15.65 | 500.8 | 1.52x | 5 × 50 |
| league/commonmark-gfm | 18 | 18 | 1.31 | 23.6 | 0.13x | 5 × 50 |

Language groups should be run in isolation. Sustained host load can reduce
absolute throughput substantially even when within-language ordering stays
similar; contaminated groups should be rerun rather than published.
