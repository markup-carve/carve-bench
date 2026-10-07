# Benchmark results: authoritative/full parser

PHP is pinned to merged commit 40653c424; the newer main at setup changes only CHANGELOG.md. Runtime sources and dependency manifests are identical.

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

**Run:** 2026-10-07T11:01:57.522Z; Fresh merged-main benchmark after the October 6 parser and URL-allocation fixes; CPU 13; PHP memory limit 512M for the concatenated corpus.

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads.

One-minute host load was 2.98 at start and 1.88 at end. CPU affinity does not reserve a core; these shared-host samples do not isolate code speedups.

The `rel` column compares elapsed time. Check the
[output byte counts and hashes](reports/dev-main-full-output-controls.json)
before treating cross-engine results as equal work. PHP controls use a clean
configuration without JIT, while these timings use tracing JIT. The controls
do not establish what every timed conversion rendered.

**Engines measured:** carve-js `@markup-carve/carve 0.1.10 (local checkout carve-js-main @ 5b9ca1632)`, carve-php `markup-carve/carve-php (local checkout carve-php-main @ 40653c424)`, carve-rs `carve-lang 0.1.8 (local checkout carve-rs-main @ 2246a9b2b)`

**Corpus snapshot:** carve 9db91206d1a4a8a8cf795c48210bca49d66f14d6 (2,134 documents); fixed committed corpus retained.

![Bar chart of Carve engine throughput for each corpus size](./charts/full-corpus.svg)

## small (1.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 0.8972 | 1.31 | 7.62x |
| carve-php | 1.4927 | 0.79 | 12.68x |
| carve-rs | 0.1177 | 9.99 | 1.00x |

## medium (63.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 101.4201 | 0.61 | 3.53x |
| carve-php | 174.6947 | 0.36 | 6.09x |
| carve-rs | 28.6932 | 2.16 | 1.00x |

## large (508.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 1174.7894 | 0.42 | 3.46x |
| carve-php | 2560.1258 | 0.19 | 7.54x |
| carve-rs | 339.6045 | 1.46 | 1.00x |

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
| Tier 1 core/default | 0 | 2.67 | 17.60 | baseline |
| Tier 2 stack | 8 | 2.90 | 16.22 | +9% |
| Tier 3 stack | 20 | 3.30 | 14.24 | +24% |

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
