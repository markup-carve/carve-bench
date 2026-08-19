# Performance findings — 2026-08-19

These are measured leads, not promises. Any engine change must preserve its
conformance and security contracts and should prove the gain with a focused
benchmark plus the existing regression gates.

## What changed

- The current spec corpus contains 1,301 documents. Regeneration grew the
  medium input from 12.6 to 40.2 KiB and the large input from 100.6 to 321.4
  KiB, so the old and new `ms/op` values are not directly comparable.
- On the full mixed-feature corpus, throughput declines from small to large:
  carve-js 1.07 → 0.92 MB/s, carve-rs 5.01 → 3.13 MB/s, and carve-php
  0.41 → 0.15 MB/s. PHP has the strongest size sensitivity and should get the
  first scaling investigation.
- On equivalent ~48 KiB documents, the current same-language gaps are 2.9–3.1x
  for JS, 3.8–10.5x for PHP, and 5.0–16.1x for Rust. Pull/event parsers have a
  structural advantage over Carve's owned AST; the ratios are not all removable
  overhead.

## carve-js

A Node CPU profile over the comparison document collected 1,389 samples. The
largest directly attributable buckets were garbage collection (128 samples,
9.2%), `collectDocumentIds` (71, 5.1%), and `collectLinkDefs` (65, 4.7%), then
block/list/table parsing, smart-token scanning, emphasis matching, text-run
coalescing, and rendering.

Actionable experiments, in order:

1. Measure allocation count/bytes by node kind and text run. GC is the largest
   single sampled bucket, so reducing short-lived slices, arrays, and copied
   strings has a credible ceiling of roughly 10% before secondary effects.
2. Fuse or cache document-wide metadata walks where their invalidation rules
   permit it. Definition collection and document-ID collection together account
   for about another 10% of sampled time, but they happen on opposite sides of
   the AST boundary and should not be joined without a clean ownership design.
3. Add phase benchmarks for definition-heavy, table-heavy, and inline-heavy
   documents. Optimize `smartToken`/`matchEmphasis` only against those focused
   measurements; neither dominates this representative profile alone.
4. Consider a render-only metadata cache on an immutable parsed document. Cost:
   API/lifetime complexity and explicit invalidation for extensions or AST
   mutation.

## carve-php

An isolated clean-INI phase run measured carve-php at 102.20 ms parse + 26.50 ms
render on the 48 KiB input; djot-php measured 15.66 + 3.18 ms. About 79% of
Carve's time is parsing, so renderer-only tuning cannot close the observed gap.
The full corpus fall from 0.41 to 0.15 MB/s also indicates that large
mixed-feature documents—not fixed startup—are the priority.

The initially checked PHP and release-comparison figures are invalid. Composer
registered the comparison dependency autoloader after `CARVE_PHP_AUTOLOAD`, so
its vendored carve-php won class resolution and every purported checkout loaded
the same code. The fixed harness reverses that precedence and reports the
resolved source directory. Current main then measured 0.39 MB/s (121.26 ms/op).
No release-regression conclusion should be drawn until the release matrix is
rerun with this corrected harness.

### Extension-tier cost

There is no normative Tier-3 “full” profile: Tier 3 is app-specific and may
include host callbacks or external services. To make the term reproducible,
`engines/php/tiers.php` defines three explicit stacks and runs the *same* core
document through each:

| Profile | Registered extensions | ms/op | MB/s | cost vs Tier 1 |
|---|---:|---:|---:|---:|
| Tier 1 core/default | 0 opt-in | 107.90 | 0.44 | baseline |
| Tier 1 + Tier 2 | 8 | 144.68 | 0.32 | +34% |
| Tier 1 + Tier 2 + zero-config Tier 3 bundle | 20 | 183.90 | 0.26 | +70% |

These are best warmed trials from a clean-INI, tracing-JIT run. The Tier-2 set
is Autolink, Citations, CodeCallouts, SemanticSpan, ListTable, Details, Spoiler,
and Tabs. The documented Tier-3 bundle adds twelve composable zero-config
extensions; it deliberately excludes host-dependent render callbacks and
external bibliography data. Because the input contains core content, this
isolates registration and whole-document hook overhead rather than claiming to
measure every extension's active workload. The large Tier-2 tax makes extension
dispatch and unconditional post-parse walks a concrete PHP profiling target.

An implementation draft at `markup-carve/carve-php#1489` fixes measured
unnecessary work: explicit references no longer force the collapsed-heading
scratch parse; absent definition families skip their full prepasses; the link
definition scan stops after its last possible candidate; and hot inline/event
dispatch paths are gated. With this corrected loader, that branch measured
40.09 ms/op (1.17 MB/s), about 3.0x the current-main throughput. It is still
below league/commonmark and djot-php; list/table-heavy parsing remains the main
measured parser bottleneck.

Actionable experiments, in order:

1. Add a sampling profiler job or optional php-spx/XHProf recipe. The current
   environment exposes no time profiler, and line coverage is not a substitute;
   do not optimize the 13.7k-line block parser by intuition alone.
2. Benchmark the mandatory post-parse `TextRunCoalescer` separately and test
   coalescing while appending children. Cost: every AST-producing extension and
   decoder must retain the published no-adjacent-text invariant.
3. Continue replacing prefix `substr`/regex copies with offset-based scans—the
   recent heading, list-marker, and prepass fixes establish that this produces
   real wins. Target fixtures should include the 321 KiB mixed corpus, where the
   scaling loss is clearest.
4. Audit object/array allocation per AST node and renderer dispatch. A compact
   internal parse representation converted once at the public AST boundary may
   help, but it is a medium/high-cost architectural change.
5. Keep JIT and non-JIT numbers separate. This run excluded pcov and verified
   tracing JIT; silently comparing a coverage-loaded process would invalidate
   the result.

## carve-rs

Hardware sampling was unavailable (`perf_event_paranoid=4`), so the current
evidence is throughput/scaling plus architecture. carve-rs builds a complete
owned AST; jotdown and pulldown-cmark stream events directly to HTML. That
explains a substantial part of the 5–16x gap and sets expectations for local
micro-optimizations.

Actionable experiments, in order:

1. Add Criterion phase benchmarks and an allocation-counting build for the
   48 KiB and 321 KiB inputs. Split parse, metadata resolution, and render.
2. Test borrowed/Cow text runs and capacity estimates for child vectors and
   output strings. Cost: lifetimes across the public owned AST and extension
   boundary; keep the existing owned API as the baseline.
3. Reuse document-wide definition/ID indexes between parse and render where
   mutation rules make that safe.
4. Treat a streaming `to_html` fast path as a separate high-cost design option,
   not a refactor. It could approach the event parsers, but duplicates logic and
   weakens the single-AST architecture that extensions, transforms, positions,
   and security checks rely on.

## Recommended order

1. Profile PHP with time attribution and fix any remaining superlinear scans.
2. Reduce JS transient allocation and remeasure the two whole-document passes.
3. Add Rust phase/allocation benchmarks before choosing between local ownership
   improvements and a deliberately separate streaming renderer.
4. Re-run `compare.mjs` and the full corpus after every accepted engine change;
   require conformance CI alongside performance evidence.
