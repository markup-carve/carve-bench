# Benchmark results: core source-to-HTML vs same-language peers

This is **Track A**, the competitor-facing view, and the primary number: every
engine uses its normal fastest public source-to-HTML route in its default core
configuration, with no opt-in extensions registered. For Carve,
that deliberately includes the conservative borrowed facade where it accepts
the input. It answers the common conversion-API question; it is not a claim
that every row builds an equivalent owned AST or supports equivalent syntax.

For **Track B**, normal authoritative/full-parser scaling on the mixed Carve
corpus plus the PHP Tier 1/2/3 diagnostic, see [`RESULTS.md`](./RESULTS.md). That file measures
pinned merged main; the Track B run on the same pinned releases as this page is
in [`reports/release-full.md`](reports/release-full.md).

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
carve-js `@markup-carve/carve 0.1.10 (npm package)`, carve-php `markup-carve/carve-php 0.1.11 (Composer package, reference 61a3519e)`, carve-rs `carve-lang 0.1.8 (crates.io, checksum 0889683244be278d)`, measured
2026-10-09 UTC on Linux 7.0.0, Node.js 22.22.2, PHP 8.5.11 tracing JIT, and rustc 1.97.1. Every lane on its pinned published release; CPU 13; local shared host, one-minute load 17.35 at start and 12.19 at end on 16 CPUs, so read the within-language ratios rather than absolute throughput.

Every configured engine earns the same 18 workload points. Core capability
points separately expose the much wider syntax surface an engine recognizes
by default. See `FEATURES.md` for the auditable matrix and limitations.

![Bar chart of same-language render throughput, normalized within each language](./charts/comparison.svg)

The [current development-main charts](https://github.com/markup-carve/carve-bench#results) use separate measurements.

![Bar chart of enabled core capability points](./charts/capabilities.svg)

## Headline: core route vs the fastest same-language peer

| Language | Carve | MB/s | Fastest peer | MB/s | Carve vs peer |
|---|---|---:|---|---:|---:|
| Rust | carve-rs | 136.27 | pulldown-cmark | 123.13 | 1.11x |
| JavaScript | carve-js | 16.32 | djot.js | 5.25 | 3.11x |
| PHP | carve-php | 16.98 | djot-php | 17.70 | 0.96x |

Every row above is the default core route with no opt-in extensions registered.
The per-language tables below add each remaining peer and the capability breadth
each engine recognizes in that same configuration.

## The three Carve engines on the same document

| Engine | Language | ms/op | MB/s | rel |
|---|---|---:|---:|---:|
| carve-js | JavaScript | 2.8799 | 16.32 | 8.35x |
| carve-php | PHP | 2.7670 | 16.98 | 8.02x |
| carve-rs | Rust | 0.3448 | 136.27 | 1.00x |

Same input, same core route, so this is the direct cross-language cost of the
implementation rather than of the language surface. Full-corpus scaling for the
same three engines is in [`RESULTS.md`](./RESULTS.md).

## Rust

| Engine | Workload points | Core capability points | MB/s | Breadth index | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|---:|
| carve-rs | 18 | 43 | 136.27 | 5859.6 | 1.00x | 5 × 200 |
| jotdown | 18 | 32 | 45.51 | 1456.3 | 0.33x | 5 × 200 |
| comrak | 18 | 16 | 41.59 | 665.4 | 0.31x | 5 × 200 |
| pulldown-cmark | 18 | 16 | 123.13 | 1970.1 | 0.90x | 5 × 200 |

## JavaScript

| Engine | Workload points | Core capability points | MB/s | Breadth index | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|---:|
| carve-js | 18 | 43 | 16.32 | 701.6 | 1.00x | 5 × 100 |
| djot.js | 18 | 32 | 5.25 | 168.1 | 0.32x | 5 × 100 |
| markdown-it | 18 | 17 | 4.85 | 82.5 | 0.30x | 5 × 100 |

## PHP

| Engine | Workload points | Core capability points | MB/s | Breadth index | vs Carve | trials × iterations |
|---|---:|---:|---:|---:|---:|---:|
| carve-php | 18 | 43 | 16.98 | 730.2 | 1.00x | 5 × 50 |
| djot-php | 18 | 32 | 17.70 | 566.2 | 1.04x | 5 × 50 |
| league/commonmark-gfm | 18 | 18 | 1.59 | 28.7 | 0.09x | 5 × 50 |

Language groups should be run in isolation. Sustained host load can reduce
absolute throughput substantially even when within-language ordering stays
similar; contaminated groups should be rerun rather than published.

## Table-free JavaScript comparison

[Commonmark.js 0.31.2 joins a separate four-library comparison](reports/commonmark-js.md).
Its workload excludes pipe tables and exercises 14 of this report's 18 points.
The runner checks projected HTML, preserves both timing rounds and includes a
parser/renderer constructor control. Its throughput values use different inputs
and must stay separate from the historical tables above.
