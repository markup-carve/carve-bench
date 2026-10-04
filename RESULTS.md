# Benchmark results: authoritative/full parser

This is **Track B**, the Carve-owned authoritative/full-parser view. The mixed
corpus falls outside the conservative borrowed facades and therefore exercises
normal AST construction, extension-capable parsing, and rendering. It answers
how the three Carve implementations scale on their full language, not how their
fastest core-only convenience API compares with another library.

For **Track A**, the primary core source-to-HTML comparison against the
same-language libraries, see [the current core report](reports/dev-main-core.md).

Parse + render to HTML, in-process, averaged over many iterations. Lower
ms/op and higher MB/s are better. `rel` is relative to the fastest engine for
that document (1.00x = fastest). Numbers are machine-specific - run it yourself
with `node run.mjs`; see README for setup.

**Run:** 2026-10-04 Europe/Berlin; merged main snapshot, serial processes with the available CPUs; Node 22.22.2, PHP 8.5.11 tracing JIT, rustc 1.97.1; local shared host. Separate snapshots do not isolate engine speed changes.

Allowed CPUs: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15. Child processes inherit this affinity, including Node compiler and GC threads.

**Engines measured:** carve-js `@markup-carve/carve 0.1.10 (local checkout /tmp/carve-bench-engine-js @ 604c2223d)`, carve-php `markup-carve/carve-php (local checkout /tmp/carve-bench-engine-php @ 363f0d3e2)`, carve-rs `carve-lang 0.1.8 (local checkout /tmp/carve-bench-engine-rs @ bfe862698)`

**Corpus snapshot:** carve `9db91206d1a4a8a8cf795c48210bca49d66f14d6` (2,134 documents); fixed corpus retained.

![Bar chart of Carve engine throughput for each corpus size](./charts/full-corpus.svg)

## small (1.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 0.5776 | 2.04 | 5.50x |
| carve-php | 1.3141 | 0.89 | 12.50x |
| carve-rs | 0.1051 | 11.19 | 1.00x |

## medium (63.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 69.0814 | 0.90 | 2.52x |
| carve-php | 133.5153 | 0.47 | 4.87x |
| carve-rs | 27.4068 | 2.27 | 1.00x |

## large (508.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 539.9727 | 0.92 | 1.65x |
| carve-php | 1422.6725 | 0.35 | 4.35x |
| carve-rs | 327.1183 | 1.52 | 1.00x |

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
| Tier 1 core/default | 0 | 2.68 | 17.53 | baseline |
| Tier 2 stack | 8 | 3.01 | 15.62 | +12% |
| Tier 3 stack | 20 | 3.32 | 14.13 | +24% |

![Bar chart of carve-php Tier 1, Tier 2, and Tier 3 profile throughput](./charts/php-tiers.svg)

The exact extension bundles and interpretation are documented in
[`FINDINGS.md`](./FINDINGS.md#extension-tier-cost). There is no normative Tier
3 profile; it is a reproducible internal stress stack.

## Why Track B has no competitor rows

The corpus uses Carve syntax and capabilities that peer libraries do not
accept equivalently. Feeding it to Djot/CommonMark parsers would benchmark
literal/error recovery rather than the same work. Track A therefore uses
equivalent native-language fixtures for competitors.

Worker results, source commits, input hashes and runtime settings are recorded
in [the full-run JSON](reports/dev-main-full.json).
