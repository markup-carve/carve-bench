# Why the comparison libraries are faster

This is an architectural reading of the locked implementations used by the
same-language benchmark. It separates measured facts from explanations. Raw
throughput and capability breadth come from `COMPARISON.md`; implementation
claims below were checked against the dependency source locked in this repo.

Feature points are not a speed normalization. They show how many opener and
delimiter families an engine must keep available by default, but one point does
not have a fixed CPU cost. The benchmark's 18-point portable document remains
the primary comparison.

## JavaScript

| Competitor | vs carve-js | Main structural advantage |
|---|---:|---|
| djot.js | 2.12x | event-first block scan, narrower semantics, fewer document-wide products |
| markdown-it | 2.30x | compact token pipeline and direct token rendering, much narrower core |

### djot.js

Djot's block reader emits a positional event stream. Its AST builder consumes
that stream with compact container stacks; source-line indexing is constructed
only when source positions are requested. It still builds an AST, so the whole
2.12x gap is not explained by streaming alone.

Carve recognizes 43 core capability families versus Djot's 32 and also pays for
semantic products required by its contract: link-definition resolution,
document-wide ID collection, source metadata, generated cross-references, and
the no-adjacent-text invariant. The sampled carve-js profile directly attributes
9.2% to GC, 5.1% to document-ID collection, and 4.7% to link-definition
collection. The remaining difference is distributed through block/list/table
parsing, inline delimiter handling, coalescing, and rendering rather than one
2x hotspot.

**What Carve can realistically copy:** reduce transient node/string allocation,
make reusable parse artifacts carry definitions and IDs into rendering, and
replace more per-character inline dispatch with run scanning. A separate event
renderer could go further, but would duplicate semantics currently centralized
in the public AST.

### markdown-it

markdown-it produces a flat/nested token stream through block and inline rule
chains and renders those tokens directly. It does not construct Carve's richer
typed semantic tree or its document metadata products. Its default core scores
17 capability points versus Carve's 43: fewer inactive opener families and far
less table, footnote, caption, attribute, editorial, cross-reference, and
structural-comment machinery.

The 2.30x lead is therefore a combination of a cheaper intermediate form and a
smaller language. It is not evidence that a single Carve rule is twice too slow.

**What Carve can realistically copy:** a compact internal token/event fast path
for source-to-HTML, provided it is validated against the AST renderer. This is a
high-cost product choice because extensions, alternate renderers, transforms,
positions, and security behavior currently share the AST.

## PHP

| Competitor | vs carve-php | Main structural advantage |
|---|---:|---|
| djot-php | 2.77x | same broad parser family, but fewer grammar/state/post-parse obligations |
| league/commonmark-gfm | 1.35x | single line-oriented block stack and narrower GFM surface |

League CommonMark is not 2x faster in the checked run. That exception matters:
its extensible object/event architecture consumes much of the advantage from
its narrower 18-point core.

### djot-php

djot-php is the most useful control because it has a similar mutable Node AST,
separate block/inline parsing, and definition prepasses. Its 2.77x lead cannot
be dismissed as merely “streaming.” The locked source has a materially smaller
grammar and post-parse surface: 32 capability families versus Carve's 43, fewer
definition kinds and table structures, and less source-map, cross-reference,
canonical-writer, and compatibility state on the hot conversion path.

Internal carve-php timing showed roughly 985 ms in the three definition scans
on the 321 KiB mixed corpus. PR #1498 safely shares their structural work and
improves that corpus by about 10%, proving one concrete part of the gap. Parsing
and AST construction still dominate after that change; renderer-only tuning
cannot recover the remaining factor.

**What Carve can realistically copy:** finish a semantics-aware shared layout
product, avoid prefix substrings and repeated regex/state walks, and reduce
Node/array allocation while preserving the public mutable AST. A compact
source-to-HTML representation is the higher-ceiling but compatibility-heavy
option.

### league/commonmark-gfm

League CommonMark advances a cursor through each input line, maintains one
active block-parser stack, and parses inlines after block closure. That avoids
Carve's current family of definition and metadata passes. But League also uses
many PHP objects, parser interfaces, environment dispatches, and an AST, which
is why its measured lead is only 1.35x rather than tracking its much smaller
18-point feature surface.

**What Carve can realistically copy:** one authoritative block/container state
product and delayed inline work. PR #1498 is an incremental version of the
first idea; a complete `BlockLayout` product remains unimplemented.

## Rust

| Competitor | vs carve-rs | Main structural advantage |
|---|---:|---|
| jotdown | 3.94x | borrowed event iterator rendered directly to HTML |
| comrak | 3.72x | arena-allocated AST and narrower grammar |
| pulldown-cmark | 10.78x | highly optimized borrowed pull parser with direct event rendering |

### jotdown

jotdown lexes into source ranges and exposes a parser iterator whose events
borrow from the input. The benchmark feeds those events directly into its HTML
renderer. It therefore avoids allocating Carve's complete owned public AST,
parent/child ownership, and later metadata/render traversals. Its default
surface is also smaller: 32 capability points versus 43.

**What Carve can realistically copy:** a separately specified streaming
source-to-HTML path or a borrowed internal event layer. The public owned AST
should remain the compatibility path for extensions, transforms, positions,
and alternate renderers.

### comrak

Comrak does build an AST, so its 3.72x lead is important counter-evidence to
“streaming explains everything.” Its nodes and delimiters are arena allocated,
which makes construction and teardown cheap, and the benchmark enables only
tables beyond its CommonMark defaults. It recognizes 16 scored core families,
versus Carve's 43, and performs fewer Carve-specific resolution and source
contract passes.

**What Carve can realistically copy:** allocation batching/capacity planning
and borrowed text where public ownership permits. This has a lower semantic
risk than a streaming renderer but cannot by itself erase the whole gap.

### pulldown-cmark

pulldown-cmark is the architectural opposite of Carve's convenience path: an
optimized pull parser yields mostly borrowed events and `push_html` consumes
them immediately. No persistent general-purpose AST is built. Only table
support is enabled, for a 16-point core surface. This combination explains why
its lead is much larger than either jotdown or Comrak.

**What Carve can realistically copy:** only a dedicated streaming fast path is
likely to approach this class of throughput. Incremental owned-AST tuning can
reduce the gap but should not be advertised as capable of matching a borrowed
pull parser without measurement.

## Cross-language conclusion

The repeated 2x+ result has three causes, in descending confidence:

1. **Intermediate representation:** direct token/event rendering beats a rich
   mutable owned AST, especially in Rust.
2. **Mandatory semantic work:** Carve computes definitions, IDs, positions,
   cross-references, coalescing, and richer table/list semantics on the core
   path.
3. **Core breadth:** 43 recognized families create real dispatch and allocation
   cost, but the feature-point ratio is not a valid numeric correction.

The next high-ceiling experiment should therefore be explicit: implement a
source-to-HTML event path in parallel with the AST path and require byte parity,
full conformance/security CI, and all-size benchmarks. Micro-optimizations remain
worth merging, but none of the current profiles identifies a safe isolated fix
that explains an entire 2x gap.
