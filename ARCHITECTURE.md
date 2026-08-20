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

### Clean design

Split parsing into two explicit stages:

1. A block/layout stage produces a lightweight block skeleton and definition
   events with already-resolved container/fence context.
2. A semantic/inline stage builds the public node objects after the complete
   definition index is known.

This replaces three subtly different container recognizers with the block
parser's single structural answer. It should preserve the public mutable AST,
extension hooks, parent pointers, and source positions; no compact parallel AST
is required.

**Cost:** high (approximately 3–5 focused PRs). Start with a read-only
`BlockLayout`/definition-event index used by the existing collectors, prove
parity, then remove duplicated state machines one at a time. The theoretical
large-input ceiling is substantial, but no partial prototype met the merge bar,
so no PHP implementation PR is recommended yet.

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
2. Design PHP's block-layout definition event index; do not optimize the three
   existing state machines independently again.
3. Merge Rust's first parsed-artifact handoff after CI, then measure any further
   semantic index independently.
4. Keep the four-size benchmark and output-parity checks as acceptance gates;
   a comparison-only win is insufficient.
