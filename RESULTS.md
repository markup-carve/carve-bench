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

**Run:** 2026-09-30 Europe/Berlin; 16 logical CPUs, local shared host under other load (load average around 8 of 16), so read the cross-engine ratios rather than absolute throughput. Every lane on its pinned published release.

**Engines measured:** carve-js `@markup-carve/carve 0.1.9 (npm package)`, carve-php `markup-carve/carve-php 0.1.10 (Composer package, reference 6d94607e)`, carve-rs `carve-lang 0.1.7 (crates.io, checksum bade620457149d66)`

**Corpus snapshot:** carve `9db91206d1a4a8a8cf795c48210bca49d66f14d6` (2,134 documents); byte-exact regeneration verified.

![Bar chart of Carve engine throughput for each corpus size](./charts/full-corpus.svg)

## small (1.2 KB)

Small-input timings are unstable. Read the [recorded diagnostic](reports/performance-refresh.md#small-input-diagnostic) before comparing small-document speed.

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 0.7797 | 1.51 | 5.51x |
| carve-php | 2.1370 | 0.55 | 15.09x |
| carve-rs | 0.1416 | 8.30 | 1.00x |

## medium (63.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 63.9000 | 0.97 | 3.57x |
| carve-php | 222.7445 | 0.28 | 12.46x |
| carve-rs | 17.8804 | 3.47 | 1.00x |

## large (508.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 477.8236 | 1.04 | 3.04x |
| carve-php | 1674.7409 | 0.30 | 10.67x |
| carve-rs | 156.9412 | 3.17 | 1.00x |

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
| Tier 1 core/default | 0 | 4.67 | 10.05 | baseline |
| Tier 2 stack | 8 | 4.54 | 10.35 | -3% |
| Tier 3 stack | 20 | 4.94 | 9.50 | +6% |

![Bar chart of carve-php Tier 1, Tier 2, and Tier 3 profile throughput](./charts/php-tiers.svg)

The exact extension bundles and interpretation are documented in
[`FINDINGS.md`](./FINDINGS.md#extension-tier-cost). There is no normative Tier
3 profile; it is a reproducible internal stress stack.

## Why Track B has no competitor rows

The corpus uses Carve syntax and capabilities that peer libraries do not
accept equivalently. Feeding it to Djot/CommonMark parsers would benchmark
literal/error recovery rather than the same work. Track A therefore uses
equivalent native-language fixtures for competitors.
