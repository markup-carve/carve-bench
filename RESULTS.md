# Benchmark results: authoritative/full parser

This is **Track B**, the Carve-owned authoritative/full-parser view. The mixed
corpus falls outside the conservative borrowed facades and therefore exercises
normal AST construction, extension-capable parsing, and rendering. It answers
how the three Carve implementations scale on their full language, not how their
fastest core-only convenience API compares with another library.

For **Track A**, the primary core source-to-HTML comparison against the
same-language libraries, see [`COMPARISON.md`](./COMPARISON.md).

Parse + render to HTML, in-process, averaged over many iterations. Lower
ms/op and higher MB/s are better. `rel` is relative to the fastest engine for
that document (1.00x = fastest). Numbers are machine-specific - run it yourself
with `node run.mjs`; see README for setup.

**Run:** 2026-09-30 Europe/Berlin on Linux, 16 logical CPUs; Node.js 22.22.2, PHP 8.5.11 tracing JIT, rustc 1.97.1. Shared host, load around 6-16 of 16; timings do not establish a speed change.

**Engines measured:** carve-js `@markup-carve/carve 0.1.8 (local checkout /tmp/bench-latest-carve-js @ 45bbec34e)`, carve-php `markup-carve/carve-php (local checkout /tmp/bench-latest-carve-php @ 6d94607ea)`, carve-rs `carve-lang 0.1.7 (local checkout /tmp/bench-latest-carve-rs @ 9f3f334c7)`

**Corpus snapshot:** carve `9db91206d1a4a8a8cf795c48210bca49d66f14d6` (2,134 documents).

![Bar chart of Carve engine throughput for each corpus size](./charts/full-corpus.svg)

## small (1.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 0.9256 | 1.27 | 6.55x |
| carve-php | 1.6917 | 0.70 | 11.96x |
| carve-rs | 0.1414 | 8.32 | 1.00x |

## medium (63.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 66.3025 | 0.94 | 3.72x |
| carve-php | 200.8072 | 0.31 | 11.26x |
| carve-rs | 17.8294 | 3.48 | 1.00x |

## large (508.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 1020.3245 | 0.49 | 3.87x |
| carve-php | 2212.2633 | 0.22 | 8.39x |
| carve-rs | 263.7914 | 1.88 | 1.00x |

## PHP authoritative extension tiers

These are internal Carve measurements over the same core document, measured
by this run rather than transcribed. Tier 1 is the default public conversion
route; Tier 2 and Tier 3 register opt-in extensions on top of it. Since
carve-php #1515 made configured conversion allocation-light, registering an
extension no longer forces a wholly separate slow path, so these rows read as
registration and hook costs on a document whose content does not trigger
the registered extensions. Shared host noise can affect ratios, including
apparent negative overhead. These are internal diagnostics, not competitor rows.

| Profile | Registered extensions | ms/op | MB/s | cost vs Tier 1 |
|---|---:|---:|---:|---:|
| Tier 1 core/default | 0 | 11.05 | 4.25 | baseline |
| Tier 2 stack | 8 | 10.44 | 4.50 | -6% |
| Tier 3 stack | 20 | 12.23 | 3.84 | +11% |

![Bar chart of carve-php Tier 1, Tier 2, and Tier 3 profile throughput](./charts/php-tiers.svg)

The exact extension bundles and interpretation are documented in
[`FINDINGS.md`](./FINDINGS.md#extension-tier-cost). There is no normative Tier
3 profile; it is a reproducible internal stress stack.

## Why Track B has no competitor rows

The corpus uses Carve syntax and capabilities that peer libraries do not
accept equivalently. Feeding it to Djot/CommonMark parsers would benchmark
literal/error recovery rather than the same work. Track A therefore uses
equivalent native-language fixtures for competitors.
