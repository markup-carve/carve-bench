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
carve-js `@markup-carve/carve 0.1.8 (local checkout /tmp/bench-latest-carve-js @ 23204e898)`, carve-php `markup-carve/carve-php (local checkout /tmp/bench-latest-carve-php @ 04563673d)`, carve-rs `carve-lang 0.1.7 (local checkout /tmp/bench-latest-carve-rs @ 6b36a74e1)`, measured
2026-09-29 on Linux 7.0.0, Node.js 22.22.2, PHP 8.5.11 tracing JIT, and rustc 1.97.1. Host load was around 5-6 of 16 logical CPUs; other work was running, so absolute throughput can vary.

Every configured engine earns the same 18 workload points. Core capability
points separately expose the much wider syntax surface an engine recognizes
by default. See `FEATURES.md` for the auditable matrix and limitations.

![Bar chart of same-language render throughput, normalized within each language](./charts/comparison.svg)

![Bar chart of core route throughput across every measured engine](./charts/core-throughput.svg)

![Bar chart of enabled core capability points](./charts/capabilities.svg)

## Headline: core route vs the fastest same-language peer

| Language | Carve | MB/s | Fastest peer | MB/s | Carve vs peer |
|---|---|---:|---|---:|---:|
| Rust | carve-rs | 97.59 | pulldown-cmark | 116.99 | 0.83x |
| JavaScript | carve-js | 11.50 | markdown-it | 4.96 | 2.32x |
| PHP | carve-php | 11.15 | djot-php | 17.66 | 0.63x |

Every row above is the default core route with no opt-in extensions registered.
The per-language tables below add each remaining peer and the capability breadth
each engine recognizes in that same configuration.

## The three Carve engines on the same document

| Engine | Language | ms/op | MB/s | rel |
|---|---|---:|---:|---:|
| carve-js | JavaScript | 4.0843 | 11.50 | 8.48x |
| carve-php | PHP | 4.2137 | 11.15 | 8.75x |
| carve-rs | Rust | 0.4815 | 97.59 | 1.00x |

Same input, same core route, so this is the direct cross-language cost of the
implementation rather than of the language surface. Full-corpus scaling for the
same three engines is in [`RESULTS.md`](./RESULTS.md).

## Rust

| Engine | Workload points | Core capability points | MB/s | Breadth index | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|---:|
| carve-rs | 18 | 43 | 97.59 | 4196.4 | 1.00x | 5 × 200 |
| jotdown | 18 | 32 | 41.61 | 1331.5 | 0.43x | 5 × 200 |
| comrak | 18 | 16 | 37.15 | 594.4 | 0.38x | 5 × 200 |
| pulldown-cmark | 18 | 16 | 116.99 | 1871.8 | 1.20x | 5 × 200 |

## JavaScript

| Engine | Workload points | Core capability points | MB/s | Breadth index | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|---:|
| carve-js | 18 | 43 | 11.50 | 494.7 | 1.00x | 5 × 100 |
| djot.js | 18 | 32 | 4.84 | 154.7 | 0.42x | 5 × 100 |
| markdown-it | 18 | 17 | 4.96 | 84.4 | 0.43x | 5 × 100 |

## PHP

| Engine | Workload points | Core capability points | MB/s | Breadth index | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|---:|
| carve-php | 18 | 43 | 11.15 | 479.5 | 1.00x | 5 × 50 |
| djot-php | 18 | 32 | 17.66 | 565.0 | 1.58x | 5 × 50 |
| league/commonmark-gfm | 18 | 18 | 1.35 | 24.4 | 0.12x | 5 × 50 |

Language groups should be run in isolation. Sustained host load can reduce
absolute throughput substantially even when within-language ordering stays
similar; contaminated groups should be rerun rather than published.
