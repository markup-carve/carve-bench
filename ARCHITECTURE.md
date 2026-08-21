# Architecture performance investigation — 2026-08-20

**Status 2026-08-21: every prototype recommended below has merged** - carve-js
#1239, carve-php #1498 and #1506, carve-rs #1152, plus carve-php #1515, which
landed after this report and made configured conversion allocation-light. The
document is kept as the reasoning and the measurement method behind those
changes, and for the costed options that are still open. Current numbers live
in `COMPARISON.md` and `RESULTS.md`.

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

**Recommendation:** merge #1239 after CI. *(Merged.)*

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

**Recommendation:** merge #1498 after CI. *(Merged.)* Any later block-skeleton
redesign should be justified by broader parser goals; it is no longer required
to obtain the measured definition-scan gain.

### Borrowed default-core facade

[carve-php #1506](https://github.com/markup-carve/carve-php/pull/1506)
implements the higher-ceiling option without replacing the public parser. A
default source-to-HTML converter probes a conservative stateless subset and
renders accepted documents from borrowed source slices. Any ambiguity or
observable configuration falls back for the whole document before output.

| 48 KiB Tier-1/core | current main | #1506 |
|---|---:|---:|
| time / render, process order A | 72.70 ms | 3.81 ms |
| time / render, process order B | 72.95 ms | 3.74 ms |
| throughput | 0.64–0.65 MB/s | 12.35–12.56 MB/s |

That is a 19.2–19.5x improvement in the alternating-checkout comparison. The
absolute host was under sustained load; the same-window ratio is the acceptance
evidence. *(Merged. The refreshed same-language run at carve-php `8abc2204`
measures 15.69 MB/s; djot-php `dev-master` (`fab953f6`) now reaches 17.82 MB/s,
and league/commonmark GFM reaches 1.43 MB/s.)*

The design pins typed acceptance counters and probes all 1,325 corpus sources;
47 are accepted with zero HTML mismatches. Full default and scaling suites pass.
Speculation is capped at 64 KiB after a late-failing 50 KiB prototype exposed a
17% fallback regression; an early loose-list gate returns that adversarial case
to the base range.

**Boundary:** this closes competitor-facing default-core throughput, not the
owned AST path. The 40 KiB and 321 KiB mixed corpora measure 0.48 and 0.27 MB/s,
and any document the facade rejects deliberately uses that path. Registering an
extension no longer does: carve-php #1515 keeps configured conversion on the
cheap path, which took the Tier 2/Tier 3 tax from +1,627%/+2,413% down to
+10%/+29%.

### Remaining PHP options

1. Evolve #1498's typed layout events into a materialized block skeleton, then
   build public nodes and parse inlines from that single structural answer.
   Highest native-PHP gain for configured/large documents; 3–5 focused PRs.
2. Add a compact internal arena and lazily materialize public nodes. Higher
   allocation ceiling, but public mutable nodes and parent pointers make this a
   major lifetime/API project.
3. Widen the borrowed facade one event family per PR under exact shadow parity.
   Low incremental risk, but it never accelerates extension/configured paths.
4. Offer carve-rs through an optional native extension/FFI accelerator. Highest
   absolute ceiling; adds ABI, packaging, deployment, and crash-isolation cost.
5. Keep application output caching outside the engine. Best repeated-document
   result, but no first-render or parser improvement.

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

**Recommendation:** merge #1152 after CI. *(Merged.)* Further sidecars for
document ids or footnotes need independent measurements; do not assume that
bundling all parse artifacts is automatically faster.

A streaming renderer remains the only credible route to the raw speed of
Jotdown/pulldown-cmark, but it is a separate high-cost product choice: it would
duplicate resolution, positions, extension, profile, and security behavior.
The sidecar artifact should be exhausted first.

## Remaining order, after everything above merged

1. Profile PHP's remaining >64 KiB path and prototype the materialized block
   skeleton from #1498's typed events. The full corpus at 0.27 MB/s is the
   largest single gap left in any engine.
2. Widen the JS, PHP and Rust facades one event family at a time under exact
   parity. In Rust this is also the only credible route at pulldown-cmark's
   1.11x lead.
3. Keep the four-size benchmark and output-parity checks as acceptance gates;
   a comparison-only win is insufficient.
