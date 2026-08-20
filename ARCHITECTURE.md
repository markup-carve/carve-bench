# Architecture performance investigation — 2026-08-20

This report separates clean pipeline changes from local micro-optimizations.
Every prototype was measured against current `main`, on the checked small,
medium, comparison, and large corpora where practical. A result is recommended
only when output parity and the largest input agree with the core benchmark.

## carve-js: explicit conversion context

### Problem

Heading resolution already visits every authored id before assigning generated
heading ids. The HTML renderer then walks the complete resolved AST again to
rebuild the same id namespace for extension-generated ids. Caching it on the
public AST is unsafe because callers and extensions may mutate that tree.

### Prototype

PR [carve-js#1239](https://github.com/markup-carve/carve-js/pull/1239) carries a
short-lived `DocumentIdRegistry` explicitly from resolution to rendering. It is
used only by the source-to-HTML core path. Public parse/resolve/render
composition and extension/profile paths retain conservative render-time
collection.

| workload | main | prototype | outcome |
|---|---:|---:|---:|
| small, 1.2 KiB | 1.08–1.28 MB/s | 1.33–1.42 | positive but noisy |
| medium, 40.2 KiB | 0.97–1.01 | 0.97–1.06 | flat to +5% |
| comparison, 48.1 KiB | 1.87 | 2.06 | **+10.4%** |
| large, 321.4 KiB | 0.87 | 0.98 | **+12.5%** |

HTML, AST JSON, canonical Carve, Markdown, and plain text were identical across
all four inputs. The complete local suite passed (12,002 tests). Unlike reverted
#1237, this removes the redundant traversal rather than changing generic object
enumeration, and the large corpus improves.

**Recommendation:** merge #1239 after CI.

## carve-php: make definitions a block-phase product

### Measured architecture

The parser currently has three independent, document-wide definition state
machines for links, footnotes, and abbreviations, followed by the block parser.
Each re-derives fence, comment, line-block, quote, list-column, and lazy-paragraph
context. On the 321 KiB mixed corpus, internal instrumentation attributed:

| phase (inclusive) | time |
|---|---:|
| reference-definition prepass | 477 ms |
| footnote prepass | 361 ms |
| abbreviation prepass | 147 ms |
| top-level block parse | 733 ms |
| total parse | 1,890 ms |

The definition scans alone account for roughly 985 ms of inclusive work. This
also explains why PHP loses much more throughput with document size than JS or
Rust.

Removing the post-parse `TextRunCoalescer` established only a ~4% core ceiling,
so moving coalescing into every AST producer is not a good first architectural
trade. Fusing one cross-reference traversal was also inconsistent (-3.8% small,
+5.7% medium, -9.5% large).

### Full structural prototype

The `perf/block-layout-definition-events` branch in carve-php implements the
complete first experiment. A private discovery mode runs the existing block
grammar, emits all three definition kinds, and keeps placeholder paragraphs
instead of building inline AST/source maps. A single definition kind retains
its specialized scanner; the shared walk is selected only when it replaces at
least two scans.

Clean tracing-JIT measurements against PHP main `91918cb1` found:

| workload | result |
|---|---:|
| no markers | unchanged by construction |
| reference-only core | unchanged by adaptive path |
| 40 KiB mixed | approximately 7–10% faster |
| 321 KiB mixed | approximately 10–17% faster |

All 16,230 PHPUnit cases pass (53 skipped), as do PHPCS and PHPStan. However,
the concatenated medium/large benchmark inputs fail byte parity on every output
form. Block consumers deliberately remove some definition-shaped lines that
the activation prepasses keep inert. Treating every consumed line as an active
definition changes abbreviation scope, footnote numbering, references, and the
public AST across long-lived malformed/container boundaries. The full suite
also rose from roughly 113 to 151 seconds because small mixed-marker documents
do not amortize the layout walk.

**Verdict: do not merge the prototype.** It proves the large-input ceiling and
also proves that consumption and definition activation are separate grammar
decisions.

### Semantics-preserving replacement

[carve-php #1498](https://github.com/markup-carve/carve-php/pull/1498)
uses the existing reference-definition prepass as the authoritative structural
walk instead of trying to infer activation from block consumption. It emits
typed immutable layout events, maintains abbreviation scope during that walk,
and lets the footnote and abbreviation collectors consume only their candidate
events. Their kind-specific grammar remains authoritative. The old paths remain
as fallbacks for isolated/internal collector calls.

This smaller design preserves the distinction the structural prototype lost:
the shared walk answers where a candidate is visible, while each definition
grammar still answers whether it activates. It also avoids building a scratch
AST or changing public nodes, extension hooks, parent pointers, or source
positions.

Clean PHP 8.5 tracing-JIT measurements used one pinned CPU, 20 warmups and seven
trials per process. Both base/candidate orders were measured against main
`91918cb1`:

| workload | first order | reverse order |
|---|---:|---:|
| 48 KiB comparison/core | 10.0% faster | 2.5% faster |
| 40 KiB mixed | 9.4% faster | 4.8% faster |
| 321 KiB mixed | 11.4% faster | 9.8% faster |

Large-corpus throughput rises from 0.195–0.202 MB/s to 0.220–0.224 MB/s. The
final branch passes 16,231 tests / 213,311 assertions, PHPStan and PHPCS. HTML,
Markdown, plain text and AST JSON are byte-identical to main for all four
benchmark corpora (16 comparisons).

**Cost:** one additional typed event list proportional to definition-shaped
candidates, plus abbreviation state maintained by the reference walk when
abbreviation syntax is present. The fallback scanners remain, so this is not a
maximum code deletion. In return, it meets both acceptance conditions the full
prototype missed: exact semantics and a repeatable speedup.

**Recommendation:** merge #1498 after CI. Any later block-skeleton redesign
should be justified by broader parser goals; it is no longer required to obtain
the measured definition-scan gain.

## carve-rs: sidecar parse artifacts before streaming

### Prototypes tested

Two ownership/allocation cleanups were implemented together on the architecture
branch:

- derive legacy table columns without cloning the complete table (rows, cells,
  and inline nodes);
- reuse one scratch buffer while rendering container children instead of
  allocating a `Vec<String>` and one string per child.

They remained statistically flat: roughly +1–2% on the comparison input and
-1–2% on the large corpus. Both are reasonable code cleanups, but neither is a
performance PR.

### Proven parse-artifact handoff

The HTML parse/render path builds document semantic indexes repeatedly:

- parse builds a heading index for reference resolution;
- parse builds a cross-reference index again to publish `href` fields;
- render rebuilds the cross-reference index;
- render separately walks the document for the generated-id namespace and
  footnote collection.

PR [carve-rs#1152](https://github.com/markup-carve/carve-rs/pull/1152) implements
the smallest safe sidecar: the final parse cross-reference builder returns its
index and `to_html` passes it into the owned renderer. Public `parse()` still
returns the owned mutable `Document`, and public tree-taking renderers still
rebuild defensively.

| workload | main | prototype | outcome |
|---|---:|---:|---:|
| small, 1.2 KiB | 3.60 MB/s | 3.88 | +7.8% |
| medium, 40.2 KiB | 1.52–1.54 | 1.45–1.54 | flat/noisy |
| comparison, 48.1 KiB | 9.23–9.89 | 9.87–9.96 | roughly +1–8%, noisy |
| large, 321.4 KiB | 1.80 | 1.84–1.87 | +2–4% |

HTML was byte-identical across all four inputs. Focused cross-reference,
generated-heading-ID, implicit-reference, and footnote tests passed. The gain
is workload-dependent, but it removes provably redundant document work without
changing the public AST or generic render contract.

**Recommendation:** merge #1152 after CI. Further sidecars for document ids or
footnotes need independent measurements; do not assume that bundling all parse
artifacts is automatically faster.

A streaming renderer remains the only credible route to the raw speed of
Jotdown/pulldown-cmark, but it is a separate high-cost product choice: it would
duplicate resolution, positions, extension, profile, and security behavior.
The sidecar artifact should be exhausted first.

## Recommended order

1. Merge the proven JS conversion-context change after CI.
2. Merge PHP's authoritative definition-layout event handoff (#1498) after CI;
   do not revive the semantically incorrect scratch block parse.
3. Merge Rust's first parsed-artifact handoff after CI, then measure any further
   semantic index independently.
4. Keep the four-size benchmark and output-parity checks as acceptance gates;
   a comparison-only win is insufficient.
