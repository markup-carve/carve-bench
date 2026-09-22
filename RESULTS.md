# Benchmark results: authoritative/full parser

This is **Track B**, the Carve-owned authoritative/full-parser view. The mixed
corpus falls outside the conservative borrowed facades and therefore exercises
normal AST construction, extension-capable parsing, and rendering. It answers
how the three Carve implementations scale on their full language—not how their
fastest core-only convenience API compares with another library.

For **Track A**, the primary core source-to-HTML comparison against the
same-language libraries, see [`COMPARISON.md`](./COMPARISON.md).

Parse + render to HTML, in-process, averaged over many iterations. Lower
ms/op and higher MB/s are better. `rel` is relative to the fastest engine for
that document (1.00x = fastest). Numbers are machine-specific - run it yourself
with `node run.mjs`; see README for setup.

**Run:** 2026-09-23 on Linux 7.0 x86_64, AMD Ryzen 9 PRO 7940HS (8C/16T), pinned to logical CPU 15; Node.js 22.22.2, PHP 8.5.10 NTS tracing JIT, rustc 1.97.1. The machine was not idle - load average around 7 of 16 throughout, with other work running - so read the cross-engine ratios rather than the absolute throughput.

**Engines measured:** carve-js `@markup-carve/carve 0.1.7 (npm package)`, carve-php `markup-carve/carve-php 0.1.9 (Composer package, reference d4b53388)`, carve-rs `carve-lang 0.1.6 (crates.io, checksum 87fdad4ca9cefc50)`

**Corpus snapshot:** carve `d909dcf0` (1,325 documents).

![Bar chart of Carve engine throughput for each corpus size](./charts/full-corpus.svg)

## small (1.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 1.3053 | 0.90 | 9.15x |
| carve-php | 1.5201 | 0.77 | 10.66x |
| carve-rs | 0.1426 | 8.25 | 1.00x |

## medium (40.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 52.2992 | 0.75 | 5.65x |
| carve-php | 127.2477 | 0.31 | 13.74x |
| carve-rs | 9.2581 | 4.24 | 1.00x |

## large (321.4 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 389.8942 | 0.80 | 4.55x |
| carve-php | 1638.2237 | 0.19 | 19.11x |
| carve-rs | 85.7241 | 3.66 | 1.00x |

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
| Tier 1 core/default | 0 | 3.31 | 14.20 | baseline |
| Tier 2 stack | 8 | 3.62 | 12.98 | +9% |
| Tier 3 stack | 20 | 4.29 | 10.96 | +30% |

![Bar chart of carve-php Tier 1, Tier 2, and Tier 3 profile throughput](./charts/php-tiers.svg)

The exact extension bundles and interpretation are documented in
[`FINDINGS.md`](./FINDINGS.md#extension-tier-cost). There is no normative Tier
3 profile; it is a reproducible internal stress stack.

## Why Track B has no competitor rows

The corpus uses Carve syntax and capabilities that peer libraries do not
accept equivalently. Feeding it to Djot/CommonMark parsers would benchmark
literal/error recovery rather than the same work. Track A therefore uses
equivalent native-language fixtures for competitors.
