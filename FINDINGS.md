# Performance findings — 2026-08-19

These are measured leads, not promises. Any engine change must preserve its
conformance and security contracts and should prove the gain with a focused
benchmark plus the existing regression gates.

## What changed

- The current spec corpus contains 1,301 documents. Regeneration grew the
  medium input from 12.6 to 40.2 KiB and the large input from 100.6 to 321.4
  KiB, so the old and new `ms/op` values are not directly comparable.
- On the full mixed-feature corpus, throughput declines from small to large:
  carve-js 1.16 → 0.88 MB/s, carve-rs 7.85 → 3.79 MB/s, and carve-php
  0.99 → 0.20 MB/s. PHP has the strongest size sensitivity and should get the
  first scaling investigation.
- On equivalent ~48 KiB documents after the optimization pass, the current
  same-language gaps are 2.1–2.3x for JS, 1.35–2.8x for PHP, and 3.7–10.8x for
  Rust after enabling peer table parsing. Pull/event parsers have a
  structural advantage over Carve's owned AST; the ratios are not all removable
  overhead.

## carve-js

Merged carve-js #1235 scans ordinary ASCII prose as a run when no inline
extension matcher is active. Five independent interleaved baseline/candidate
pairs all favored the change; the median Tier-1 improvement was about 19.6%.
The complete CI matrix passed (Node 20/22 corpus, scaling, browser parity, and
mutation-XSS). The refreshed competitor run measures 2.09 MB/s.

The later document-ID walker experiment (#1237) initially measured 9–10%
faster on the 48 KiB comparison input and passed the existing scaling gate, but
the 321 KiB corpus exposed a severe `for...in` regression. A safer
`Object.keys` variant removed the regression but was statistically flat, so
#1238 reverted the optimization. This is why performance candidates must now
be checked at all three corpus sizes, not only against the comparison input.

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

Earlier clean-INI phase profiling showed parsing dominates Carve conversion, so
renderer-only tuning cannot close the observed gap.
The full corpus fall from 0.99 to 0.20 MB/s also indicates that large
mixed-feature documents—not fixed startup—are the priority.

The initially checked PHP and release-comparison figures were invalid. Composer
registered the comparison dependency autoloader after `CARVE_PHP_AUTOLOAD`, so
its vendored carve-php won class resolution and every purported checkout loaded
the same code. The fixed harness reverses that precedence and reports the
resolved source directory. The refreshed clean-INI comparison at `5325a97c`
measures 1.09 MB/s: about 26% behind league/commonmark GFM and 2.8x behind
djot-php on this host. A cached list-marker experiment improved a list-only
synthetic document by about 18% but was between -0.6% and +3.2% on interleaved
mixed Tier-1 runs, so it was rejected rather than publishing benchmark-specific
complexity. Escaped-text render caching and conditional line-offset
construction likewise produced no stable representative gain.

### Extension-tier cost

There is no normative Tier-3 “full” profile: Tier 3 is app-specific and may
include host callbacks or external services. To make the term reproducible,
`engines/php/tiers.php` defines three explicit stacks and runs the *same* core
document through each:

| Profile | Registered extensions | ms/op | MB/s | cost vs Tier 1 |
|---|---:|---:|---:|---:|
| Tier 1 core | 0 opt-in | 40.51 | 1.16 | baseline |
| Tier 2 stack | 8 | 48.17 | 0.98 | +19% |
| Tier 3 stack | 20 | 63.79 | 0.74 | +57% |

![Bar chart of carve-php Tier 1, Tier 2, and Tier 3 profile throughput](./charts/php-tiers.svg)

These are best warmed trials from a clean-INI, tracing-JIT run. The Tier-2 set
is Autolink, Citations, CodeCallouts, SemanticSpan, ListTable, Details, Spoiler,
and Tabs. The documented Tier-3 bundle adds twelve composable zero-config
extensions; it deliberately excludes host-dependent render callbacks and
external bibliography data. Because the input contains core content, this
isolates registration and whole-document hook overhead rather than claiming to
measure every extension's active workload. The Tier-2 registration tax is now
much smaller after carve-php #1490/#1491. Tier 3 remains expensive because this
corpus contains 121 headings, so heading numbering performs real work rather
than merely paying an inactive-hook tax.

Merged carve-php #1489–#1491 remove measured unnecessary work: absent definition
families skip full prepasses, hot inline/event dispatch paths are gated, broad
bare-email matching is inactive on text without `@`, inactive Index/Citations
avoid deep clones, and table separators are decoded once. List/table-heavy
parsing remains the main measured parser bottleneck.

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
   internal representation is not a safe incremental change: public extensions
   observe mutable concrete Nodes and parent pointers prevent structural
   sharing. Treat it as a separate architecture proposal.
5. Keep JIT and non-JIT numbers separate. This run excluded pcov and verified
   tracing JIT; silently comparing a coverage-loaded process would invalidate
   the result.

## carve-rs

Merged carve-rs #1146 removes unchanged-line allocation in the link-definition
prepass, gates absent footnote and colon-ladder scans, reserves small inline
buffers, and scans ordinary ASCII prose as runs. Five independent interleaved
baseline/candidate pairs all favored it; median Tier-1 throughput rose from
6.15 to 6.98 MB/s (+13.5%). Allocation instrumentation attributed 3,784 fewer
allocations and roughly 708 KiB less requested memory per parse to the prepass
changes alone. Full Rust CI, including the focused performance gate, passed.
The rebuilt comparison harness measures 10.33 MB/s. In addition, carve-rs
#1150 lets the source-to-HTML convenience path surrender its freshly parsed
document to the renderer instead of defensively cloning the complete AST. The
gain stayed positive from 1.2 KiB through 321 KiB (+81%, +7.9%, +16–17% on the
comparison input, and +3.5% respectively), with byte-identical HTML.

Hardware sampling was unavailable (`perf_event_paranoid=4`), so the current
evidence is throughput/scaling plus architecture. carve-rs builds a complete
owned AST; jotdown and pulldown-cmark stream events directly to HTML. That
explains a substantial part of the 5.9–17.9x gap and sets expectations for local
micro-optimizations. The peer harness now enables pipe tables for Comrak and
pulldown-cmark; the earlier default-option results gave those peers less work.

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
