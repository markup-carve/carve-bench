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

**Run:** 2026-10-15T12:00:05.521Z; Pinned merged-main snapshots are retained; later main commits are recorded as observations and are outside this measurement.

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads.

One-minute host load was 19.31 at start and 24.32 at end. CPU affinity does not reserve a core; these shared-host samples do not isolate code speedups.

The `rel` column compares elapsed time. Check the
[output byte counts and hashes](reports/dev-main-full-output-controls.json)
before treating cross-engine results as equal work.
PHP output controls use a clean configuration without JIT, while these timings use tracing JIT.
The controls do not establish what every timed conversion rendered.

**Engines measured:** carve-js `@markup-carve/carve 0.1.12 (local checkout carve-js-main @ 224b0c32e)`, carve-php `markup-carve/carve-php (local checkout carve-php-main @ 967f25397)`, carve-rs `carve-lang 0.1.9 (local checkout carve-rs-main @ 76f95de6b)`

**Corpus snapshot:** Existing committed benchmark corpus retained without regeneration.

![Bar chart of Carve engine throughput for each corpus size](./charts/full-corpus.svg)

## small (1.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 1.3834 | 0.85 | 13.47x |
| carve-php | 2.1393 | 0.55 | 20.83x |
| carve-rs | 0.1027 | 11.45 | 1.00x |

## medium (63.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 140.2475 | 0.44 | 3.43x |
| carve-php | 609.3825 | 0.10 | 14.92x |
| carve-rs | 40.8552 | 1.52 | 1.00x |

## large (508.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 1866.8130 | 0.27 | 4.25x |
| carve-php | 3518.3657 | 0.14 | 8.01x |
| carve-rs | 438.9798 | 1.13 | 1.00x |

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
| Tier 1 core/default | 0 | 4.69 | 10.01 | baseline |
| Tier 2 stack | 8 | 4.04 | 11.63 | -14% |
| Tier 3 stack | 20 | 5.04 | 9.32 | +7% |

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
