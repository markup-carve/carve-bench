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

**Run:** 2026-09-29 on Linux, 16 logical CPUs; Node.js 22.22.2, PHP 8.5.11 tracing JIT, rustc 1.97.1. Host load was around 5-6 of 16; timings are machine-specific.

**Engines measured:** carve-js `@markup-carve/carve 0.1.8 (local checkout /tmp/bench-latest-carve-js @ 23204e898)`, carve-php `markup-carve/carve-php (local checkout /tmp/bench-latest-carve-php @ 04563673d)`, carve-rs `carve-lang 0.1.7 (local checkout /tmp/bench-latest-carve-rs @ 6b36a74e1)`

**Corpus snapshot:** carve `9676747189e68d43bda84f7469bc200f0b11c64d` (2,134 documents).

![Bar chart of Carve engine throughput for each corpus size](./charts/full-corpus.svg)

## small (1.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 0.9603 | 1.22 | 7.62x |
| carve-php | 1.7147 | 0.69 | 13.60x |
| carve-rs | 0.1261 | 9.32 | 1.00x |

## medium (63.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 64.2218 | 0.97 | 4.10x |
| carve-php | 174.8843 | 0.36 | 11.17x |
| carve-rs | 15.6577 | 3.97 | 1.00x |

## large (508.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 482.7432 | 1.03 | 3.39x |
| carve-php | 1543.7316 | 0.32 | 10.83x |
| carve-rs | 142.5450 | 3.48 | 1.00x |

## PHP authoritative extension tiers

These are internal Carve measurements over the same core document, measured
by this run rather than transcribed. Tier 1 is the default public conversion
route; Tier 2 and Tier 3 register opt-in extensions on top of it. Since
carve-php #1515 made configured conversion allocation-light, registering an
extension no longer forces a wholly separate slow path, so these rows read as
the registration and hook tax on a document whose content does not trigger
the registered extensions. They are internal diagnostics, not competitor rows.

| Profile | Registered extensions | ms/op | MB/s | cost vs Tier 1 |
|---|---:|---:|---:|---:|
| Tier 1 core/default | 0 | 3.81 | 12.32 | baseline |
| Tier 2 stack | 8 | 4.27 | 11.00 | +12% |
| Tier 3 stack | 20 | 4.71 | 9.97 | +24% |

![Bar chart of carve-php Tier 1, Tier 2, and Tier 3 profile throughput](./charts/php-tiers.svg)

The exact extension bundles and interpretation are documented in
[`FINDINGS.md`](./FINDINGS.md#extension-tier-cost). There is no normative Tier
3 profile; it is a reproducible internal stress stack.

## Why Track B has no competitor rows

The corpus uses Carve syntax and capabilities that peer libraries do not
accept equivalently. Feeding it to Djot/CommonMark parsers would benchmark
literal/error recovery rather than the same work. Track A therefore uses
equivalent native-language fixtures for competitors.
