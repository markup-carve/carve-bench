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

**Run:** 2026-10-04T16:39:40.574Z; Node v22.22.2; PHP 8.5.11 (cli) (built: Sep 24 2026 13:49:29) (NTS), tracing JIT; rustc 1.97.1 (8bab26f4f 2026-07-14); serial processes on a shared host. Full-run load was not recorded. Separate snapshots do not isolate engine speed changes.

The measured harness checkout, changed tracked paths and source hashes are recorded in the full-run JSON.

Allowed CPUs: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15. Child processes inherit this affinity, including Node compiler and GC threads.

**Engines measured:** carve-js `@markup-carve/carve 0.1.10 (local checkout carve-bench-final-js @ a0e996083)`, carve-php `markup-carve/carve-php (local checkout carve-bench-final-php @ 41c9fe602)`, carve-rs `carve-lang 0.1.8 (local checkout carve-bench-final-rs @ 914704f80)`

**Corpus snapshot:** carve `9db91206d1a4a8a8cf795c48210bca49d66f14d6` (2,134 documents); fixed committed corpus retained

![Bar chart of Carve engine throughput for each corpus size](./charts/full-corpus.svg)

## small (1.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 0.6323 | 1.86 | 5.47x |
| carve-php | 1.3894 | 0.85 | 12.02x |
| carve-rs | 0.1156 | 10.18 | 1.00x |

## medium (63.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 75.9697 | 0.82 | 2.73x |
| carve-php | 133.5394 | 0.46 | 4.80x |
| carve-rs | 27.7994 | 2.23 | 1.00x |

## large (508.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 583.0828 | 0.85 | 1.67x |
| carve-php | 1435.7923 | 0.35 | 4.11x |
| carve-rs | 349.0153 | 1.42 | 1.00x |

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
| Tier 1 core/default | 0 | 2.65 | 17.74 | baseline |
| Tier 2 stack | 8 | 2.95 | 15.91 | +12% |
| Tier 3 stack | 20 | 3.37 | 13.95 | +27% |

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
