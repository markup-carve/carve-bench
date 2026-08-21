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

**Run:** 2026-08-21 on Linux 7.0 x86_64, AMD Ryzen 9 PRO 7940HS (8C/16T), pinned to logical CPU 15; Node.js 22.22.2, PHP 8.5.9 NTS tracing JIT, rustc 1.97.1.

**Engine heads:** carve-js `5695480e`, carve-php `8abc2204`, carve-rs `78a88c34`.

**Corpus snapshot:** carve `d909dcf0` (1,325 documents).

![Bar chart of Carve engine throughput for each corpus size](./charts/full-corpus.svg)

## small (1.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 1.0204 | 1.15 | 11.41x |
| carve-php | 1.0652 | 1.10 | 11.91x |
| carve-rs | 0.0894 | 13.15 | 1.00x |

## medium (40.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 38.1450 | 1.03 | 6.06x |
| carve-php | 81.8392 | 0.48 | 13.01x |
| carve-rs | 6.2923 | 6.23 | 1.00x |

## large (321.4 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 308.6712 | 1.02 | 4.89x |
| carve-php | 1174.7688 | 0.27 | 18.62x |
| carve-rs | 63.0914 | 4.97 | 1.00x |

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
| Tier 1 core/default | 0 | 2.53 | 18.59 | baseline |
| Tier 2 stack | 8 | 2.77 | 16.93 | +10% |
| Tier 3 stack | 20 | 3.25 | 14.47 | +29% |

![Bar chart of carve-php Tier 1, Tier 2, and Tier 3 profile throughput](./charts/php-tiers.svg)

The exact extension bundles and interpretation are documented in
[`FINDINGS.md`](./FINDINGS.md#extension-tier-cost). There is no normative Tier
3 profile; it is a reproducible internal stress stack.

## Why Track B has no competitor rows

The corpus uses Carve syntax and capabilities that peer libraries do not
accept equivalently. Feeding it to Djot/CommonMark parsers would benchmark
literal/error recovery rather than the same work. Track A therefore uses
equivalent native-language fixtures for competitors.
