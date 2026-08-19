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
  for JS, 3.8–8.2x for PHP, and 5.0–16.1x for Rust. Pull/event parsers have a
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

The phase harness measured carve-php at 111.86 ms parse + 23.53 ms render on
the 48 KiB input; djot-php measured 12.27 + 3.17 ms. About 83% of Carve's time
is parsing, so renderer-only tuning cannot close the observed gap. The full
corpus fall from 0.41 to 0.15 MB/s also indicates that large mixed-feature
documents—not fixed startup—are the priority.

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
