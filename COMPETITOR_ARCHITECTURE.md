# Peer architecture and the one remaining gap

An architectural reading of the locked competitor libraries, kept because it
explains the shape of `COMPARISON.md` rather than repeating it. Implementation
claims were checked against the dependency source locked in this repo.

Measured 2026-08-21 at carve-js `5695480e`, carve-php `8abc2204`, carve-rs
`78a88c34`. On the core route Carve leads every same-language peer except
pulldown-cmark.

| Language | Peer | vs Carve | Peer's structural advantage |
|---|---|---:|---|
| Rust | pulldown-cmark | **1.11x ahead** | borrowed pull parser, events consumed straight into `push_html`, no persistent AST, 16-point core |
| Rust | jotdown | 0.40x | borrowed event iterator rendered directly, 32-point core |
| Rust | comrak | 0.36x | arena-allocated AST, 16-point core |
| JavaScript | markdown-it | 0.43x | compact token pipeline rendered directly, 17-point core |
| JavaScript | djot.js | 0.40x | event-first block scan, fewer document-wide products, 32-point core |
| PHP | djot-php | 0.22x | same mutable-AST family, fewer grammar/state/post-parse obligations, 32-point core |
| PHP | league/commonmark-gfm | 0.09x | one line-oriented block stack, 18-point core |

Capability points are scope context, not a speed normalization: one point has
no fixed CPU cost. See `FEATURES.md`.

## Why the peers are cheap

Every peer keeps a cheaper intermediate representation than Carve's owned
public AST. Some build no tree at all; the ones that do build a narrower or
arena-allocated one and skip the document-wide semantic products Carve's
contract requires.

- **pulldown-cmark** yields mostly borrowed events that `push_html` consumes
  immediately. Nothing persists. Only table support is enabled beyond
  CommonMark, for a 16-point core surface against Carve's 43.
- **jotdown** lexes into source ranges and exposes an event iterator borrowing
  from the input; the harness feeds those events straight to its HTML renderer.
- **comrak** does build an AST, which is the useful counter-example: its nodes
  and delimiters are arena-allocated, so construction and teardown are cheap.
- **markdown-it** produces a flat token stream through rule chains and renders
  the tokens directly, with no typed semantic tree and no document metadata.
- **djot.js** emits a positional event stream and builds its AST from compact
  container stacks, indexing source lines only when positions are requested.
- **league/commonmark-gfm** advances a cursor line by line over one active
  block-parser stack and parses inlines after block closure, with no definition
  or metadata prepasses - though its object and dispatch overhead is real.
- **djot-php** is the closest control: a similar mutable Node AST, separate
  block and inline parsing, and definition prepasses, over a materially smaller
  grammar and post-parse surface.

Carve answers this with a borrowed source-to-HTML facade in each engine, over a
conservative stateless subset; anything ambiguous or unsupported falls back to
the owned AST before any output is published. That is what the Track A rows
measure. Registering an extension is not automatically such a fallback: in
carve-php, #1515 keeps configured conversion on the cheap path, which is why
the Tier 2/3 rows in `RESULTS.md` cost +10%/+29% rather than several hundred
percent.

## The peer still ahead: pulldown-cmark

At 126.62 MB/s against carve-rs's 113.80, pulldown-cmark keeps an 11% lead, and
it is structural: a facade must first prove a document is inside its subset and
stay able to fall back, while a pull parser owes nothing to a tree it never
builds. Widening that path one event family at a time under exact shadow parity
is the only route at it. Incremental owned-AST tuning is not, and should not be
advertised as if it might.

## Where the gap actually lives

Outside the facade - the full 1,325-document corpus, which is the authoritative
path - carve-php runs at 0.27 MB/s and carve-js at 1.02 against carve-rs's 4.97
(`RESULTS.md`). No competitor row exists there, because those libraries do not
accept the syntax, but the peer architecture above is still the reading of why
the owned path costs what it does:

1. **Intermediate representation** - a rich mutable owned AST is the expensive
   choice, and it is the choice Carve's contract requires outside the facade.
2. **Mandatory semantic work** - definitions, IDs, positions, cross-references,
   coalescing, and richer table/list semantics are computed on that path. In
   carve-php the three definition prepasses alone account for roughly 985 ms of
   a 1,890 ms parse on the 321 KiB corpus.
3. **Core breadth** - 43 recognized families create real dispatch and
   allocation cost, though the feature-point ratio is not a numeric correction.

The costed options for attacking that path, per language, are in
[`ARCHITECTURE.md`](./ARCHITECTURE.md).
