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

**Run:** 2026-10-05T23:57:04.965Z; 2026-10-06 Europe/Berlin; pinned merged performance commits; serial run on a shared host; Node v22.22.2, PHP 8.5.11 tracing JIT, rustc 1.97.1; source hashes in the full-run JSON. Separate snapshots do not isolate engine speed changes.

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads.

One-minute host load was 2.15 at start and 2.41 at end. CPU affinity does not reserve a core; these shared-host samples do not isolate code speedups.

The `rel` column compares elapsed time. Check the
[output byte counts and hashes](reports/dev-main-full-output-controls.json)
before treating cross-engine results as equal work.

**Engines measured:** carve-js `@markup-carve/carve 0.1.10 (local checkout carve-js-main @ a7c80d37f)`, carve-php `markup-carve/carve-php (local checkout carve-php-main @ 49c235d76)`, carve-rs `carve-lang 0.1.8 (local checkout carve-rs-main @ ae44de38b)`

**Corpus snapshot:** carve `9db91206d1a4a8a8cf795c48210bca49d66f14d6` (2,134 documents); fixed committed corpus retained

![Bar chart of Carve engine throughput for each corpus size](./charts/full-corpus.svg)

## small (1.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 0.8168 | 1.44 | 7.27x |
| carve-php | 1.4763 | 0.80 | 13.13x |
| carve-rs | 0.1124 | 10.47 | 1.00x |

## medium (63.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 98.8697 | 0.63 | 3.52x |
| carve-php | 153.8950 | 0.40 | 5.48x |
| carve-rs | 28.1016 | 2.21 | 1.00x |

## large (508.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 1173.6643 | 0.42 | 3.49x |
| carve-php | 1901.7255 | 0.26 | 5.65x |
| carve-rs | 336.5027 | 1.48 | 1.00x |

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
| Tier 1 core/default | 0 | 2.72 | 17.26 | baseline |
| Tier 2 stack | 8 | 2.94 | 15.96 | +8% |
| Tier 3 stack | 20 | 3.33 | 14.11 | +22% |

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
