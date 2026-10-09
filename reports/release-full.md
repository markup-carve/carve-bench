# Track B on the pinned releases: authoritative/full parser

This is **Track B**, the Carve-owned authoritative/full-parser view. The mixed
corpus falls outside the conservative borrowed facades and therefore exercises
normal AST construction, extension-capable parsing, and rendering. It answers
how the three Carve implementations scale on their full language, not how their
fastest core-only convenience API compares with another library.

For **Track A**, the primary core source-to-HTML comparison against the
same-language libraries, see [`COMPARISON.md`](../COMPARISON.md).

Parse + render to HTML, in-process, averaged over many iterations. Lower
ms/op and higher MB/s are better. `rel` is relative to the fastest engine for
that document (1.00x = fastest). Numbers are machine-specific - run it yourself
with `node run.mjs`; see README for setup. The current [`RESULTS.md`](../RESULTS.md)
measures pinned merged main; this record keeps the same run on the pinned
published releases.

**Run:** Pinned published releases after the carve-js 0.1.10, carve-php 0.1.11 and carve-lang 0.1.8 pin bump; CPU 13; PHP memory limit 512M; Node.js 22.22.2, PHP 8.5.11 tracing JIT, rustc 1.97.1. One-minute host load was 8.34 at start and 18.84 at end on 16 CPUs, so these shared-host samples are noisy.

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads.

**Engines measured:** carve-js `@markup-carve/carve 0.1.10 (npm package)`, carve-php `markup-carve/carve-php 0.1.11 (Composer package, reference 61a3519e)`, carve-rs `carve-lang 0.1.8 (crates.io, checksum 0889683244be278d)`

**Corpus snapshot:** carve 9db91206d1a4a8a8cf795c48210bca49d66f14d6 (2,134 documents); fixed committed corpus retained.

## small (1.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 0.8799 | 1.34 | 7.81x |
| carve-php | 1.4666 | 0.80 | 13.02x |
| carve-rs | 0.1126 | 10.45 | 1.00x |

## medium (63.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 97.8580 | 0.63 | 3.22x |
| carve-php | 186.6795 | 0.33 | 6.15x |
| carve-rs | 30.3776 | 2.04 | 1.00x |

## large (508.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 1244.7454 | 0.40 | 2.67x |
| carve-php | 4192.2790 | 0.12 | 9.00x |
| carve-rs | 465.6854 | 1.07 | 1.00x |

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
| Tier 1 core/default | 0 | 6.28 | 7.49 | baseline |
| Tier 2 stack | 8 | 6.62 | 7.09 | +6% |
| Tier 3 stack | 20 | 4.80 | 9.79 | -24% |

The exact extension bundles and interpretation are documented in
[`FINDINGS.md`](../FINDINGS.md#extension-tier-cost). There is no normative Tier
3 profile; it is a reproducible internal stress stack.

## Why Track B has no competitor rows

The corpus uses Carve syntax and capabilities that peer libraries do not
accept equivalently. Feeding it to Djot/CommonMark parsers would benchmark
literal/error recovery rather than the same work. Track A therefore uses
equivalent native-language fixtures for competitors.
