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

**Run:** 2026-10-15T22:19:07.811Z; serial processes; Node v22.22.2; PHP 8.5.11 (cli) (built: Sep 24 2026 13:49:29) (NTS); rustc 1.97.1 (8bab26f4f 2026-07-14).

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads.

One-minute host load was 16.03 at start and 5.20 at end. CPU affinity does not reserve a core; these shared-host samples do not isolate code speedups.

The `rel` column compares elapsed time. Check the
[output byte counts and hashes](reports/dev-main-full-output-controls.json)
before treating cross-engine results as equal work.

**Engines measured:** carve-js `@markup-carve/carve 0.1.12 (local checkout carve-js-main @ f0acfa305)`, carve-php `markup-carve/carve-php (local checkout carve-php-main @ 3b3a09ff7)`, carve-rs `carve-lang 0.1.9 (local checkout carve-rs-main @ 08d65a583)`

**Corpus snapshot:** Existing committed benchmark corpus retained without regeneration.

![Bar chart of Carve engine throughput for each corpus size](./charts/full-corpus.svg)

## small (1.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 1.4395 | 0.82 | 10.64x |
| carve-php | 2.7090 | 0.43 | 20.02x |
| carve-rs | 0.1353 | 8.69 | 1.00x |

## medium (63.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 135.5894 | 0.46 | 3.48x |
| carve-php | 262.4616 | 0.24 | 6.73x |
| carve-rs | 38.9883 | 1.59 | 1.00x |

## large (508.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 989.3555 | 0.50 | 2.97x |
| carve-php | 2354.5748 | 0.21 | 7.07x |
| carve-rs | 333.2327 | 1.49 | 1.00x |

## PHP authoritative extension tiers

Current tier values use the [balanced paired recheck](reports/php-tier-pairs.md) at the same PHP commit, `3b3a09ff793fbc11b5c32bae6d74bee4d7676516`. Each value is the median of eight round medians, with seven warmed batches per round. These are separate measurements from the full-corpus rows above.

The [original unpaired tier observations](reports/php-tiers-unpaired-20261015.md) and full-run JSON remain unchanged as historical evidence. Tier 1 is the default route; Tier 2 and Tier 3 register extensions on the same core document.

| Profile | Registered extensions | ms/op | MB/s | cost vs Tier 1 |
|---|---:|---:|---:|---:|
| Tier 1 core/default | 0 | 3.39 | 13.86 | baseline |
| Tier 2 stack | 8 | 3.69 | 12.74 | +9% |
| Tier 3 stack | 20 | 4.17 | 11.26 | +23% |

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
