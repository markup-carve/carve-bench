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

**Run:** 2026-10-07T21:52:36.972Z; Fresh merged-main benchmark after the October 7 queue and HTML import fixes; CPU 13; PHP memory limit 512M for the concatenated corpus.

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads.

One-minute host load was 16.02 at start and 6.88 at end. CPU affinity does not reserve a core; these shared-host samples do not isolate code speedups.

The `rel` column compares elapsed time. Check the
[output byte counts and hashes](reports/dev-main-full-output-controls.json)
before treating cross-engine results as equal work.
PHP output controls use a clean configuration without JIT, while these timings use tracing JIT.
The controls do not establish what every timed conversion rendered.

**Engines measured:** carve-js `@markup-carve/carve 0.1.10 (local checkout carve-js-main @ 72f7d1333)`, carve-php `markup-carve/carve-php (local checkout carve-php-main @ 9570a2615)`, carve-rs `carve-lang 0.1.8 (local checkout carve-rs-main @ 7a68f74a3)`

**Corpus snapshot:** carve 9db91206d1a4a8a8cf795c48210bca49d66f14d6 (2,134 documents); fixed committed corpus retained.

![Bar chart of Carve engine throughput for each corpus size](./charts/full-corpus.svg)

## small (1.2 KB)

Small-input timings are unstable. The [paired controls](reports/final-audit-conversion-checks.md) record repeated timings for these same pins and input. These rows describe this run; their `rel` values do not establish stable engine speed ratios.

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 1.3944 | 0.84 | 9.76x |
| carve-php | 2.1317 | 0.55 | 14.93x |
| carve-rs | 0.1428 | 8.23 | 1.00x |

## medium (63.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 167.3836 | 0.37 | 4.03x |
| carve-php | 262.8248 | 0.24 | 6.33x |
| carve-rs | 41.5139 | 1.50 | 1.00x |

## large (508.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 2323.9467 | 0.21 | 4.77x |
| carve-php | 3543.9278 | 0.14 | 7.28x |
| carve-rs | 486.8878 | 1.02 | 1.00x |

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
| Tier 1 core/default | 0 | 3.34 | 14.07 | baseline |
| Tier 2 stack | 8 | 3.62 | 12.96 | +9% |
| Tier 3 stack | 20 | 4.05 | 11.60 | +21% |

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

The measured source pins were frozen at the start of this refresh. Later include fixes merged during the run and were not measured. All current core, corpus, paired controls and history reports retain the same frozen pins. The core report records newer heads observed at repeat setup; earlier workloads retain their own measurement-time provenance.
