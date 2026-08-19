# Benchmark feature points

Two different scores answer two different questions. Keeping them separate is
important: the comparison document is deliberately portable, while the parsers
are not equally broad.

## Workload coverage: 18 points for every engine

The workload score describes syntax exercised by the comparison corpus. An
engine only enters the timing table after it handles all 18 points, using the
equivalent native syntax for its markup family.

| Exercised capability | Points |
|---|---:|
| ATX headings, paragraphs, strong, emphasis, code, inline links | 6 |
| Reference links and definitions | 2 |
| Bullet lists | 1 |
| Nested lists | 2 |
| Block quotes | 1 |
| Fenced code with info string | 1 |
| Pipe-table grid | 3 |
| Per-column table alignment | 1 |
| Thematic breaks | 1 |
| **Total** | **18** |

Ordinary syntax families receive one point, cross-document or recursive work
two, and the table grid three. These weights were fixed independently of the
timings. Equal workload points mean that a competitor is not made faster by
treating a construct in this particular input as plain text.

## Core capability breadth

The breadth score instead counts distinct syntax families available in the
exact benchmark configuration. Each row is one point; related AST nodes are
grouped, so Carve does not gain artificial points for representing a table as
`table` + `table_row` + `table_cell`. A feature is counted only when parsing
and HTML rendering are both available. Off-by-default extensions are excluded.

The table groups identical configurations. `MD-it` is markdown-it's defaults,
`GFM` is League CommonMark's GFM environment, and `CM+table` is the Rust
CommonMark engines with only the table option added by the harness.

| Core syntax family | Carve | Djot | MD-it | GFM | CM+table |
|---|:---:|:---:|:---:|:---:|:---:|
| Paragraphs | ✓ | ✓ | ✓ | ✓ | ✓ |
| ATX headings | ✓ | ✓ | ✓ | ✓ | ✓ |
| Automatic section structure | ✓ | ✓ | — | — | — |
| Thematic breaks | ✓ | ✓ | ✓ | ✓ | ✓ |
| Fenced code blocks | ✓ | ✓ | ✓ | ✓ | ✓ |
| Block quotes | ✓ | ✓ | ✓ | ✓ | ✓ |
| Bullet and ordered lists | ✓ | ✓ | ✓ | ✓ | ✓ |
| Alpha/roman ordered-list dialects | ✓ | ✓ | — | — | — |
| Task lists | ✓ | ✓ | — | ✓ | — |
| Definition lists | ✓ | ✓ | — | — | — |
| Pipe tables | ✓ | ✓ | ✓ | ✓ | ✓ |
| Table captions | ✓ | ✓ | — | — | — |
| Header rows/cells | ✓ | ✓ | ✓ | ✓ | ✓ |
| Footer rows | ✓ | — | — | — | — |
| Table alignment | ✓ | ✓ | ✓ | ✓ | ✓ |
| Row/column spans and multiline cells | ✓ | — | — | — | — |
| Generic containers / admonitions | ✓ | ✓ | — | — | — |
| Figures and general captions | ✓ | — | — | — | — |
| Raw blocks | ✓ | ✓ | ✓ | ✓ | ✓ |
| Structural comments | ✓ | — | — | — | — |
| Frontmatter | ✓ | — | — | — | — |
| Line blocks | ✓ | — | — | — | — |
| Emphasis and strong | ✓ | ✓ | ✓ | ✓ | ✓ |
| Underline | ✓ | — | — | — | — |
| Strikethrough/delete | ✓ | ✓ | ✓ | ✓ | — |
| Highlight/mark | ✓ | ✓ | — | — | — |
| Superscript and subscript | ✓ | ✓ | — | — | — |
| Code spans | ✓ | ✓ | ✓ | ✓ | ✓ |
| Links, references, and images | ✓ | ✓ | ✓ | ✓ | ✓ |
| URL and email autolinks | ✓ | ✓ | ✓ | ✓ | ✓ |
| Generic spans and attributes | ✓ | ✓ | — | — | — |
| Raw inline content | ✓ | ✓ | ✓ | ✓ | ✓ |
| Inline and display math | ✓ | ✓ | — | — | — |
| Reference footnotes | ✓ | ✓ | — | — | — |
| Inline footnotes | ✓ | — | — | — | — |
| Abbreviations | ✓ | — | — | — | — |
| Editorial insert/delete | ✓ | ✓ | — | — | — |
| Critic comments and substitutions | ✓ | — | — | — | — |
| Heading cross-references | ✓ | ✓ | — | — | — |
| Smart typography | ✓ | ✓ | — | — | — |
| Mentions and tags | ✓ | — | — | — | — |
| Named symbols | ✓ | ✓ | — | — | — |
| Hard and soft breaks | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Capability points** | **43** | **32** | **17** | **18** | **16** |

This rubric is derived from the [Carve Tier-1 conformance boundary](https://github.com/markup-carve/carve/blob/main/docs/native-features-analysis.md#conformance-core-what-every-implementation-must-produce),
the [Djot language reference](https://djot.net/), the
[CommonMark specification](https://spec.commonmark.org/), and the
[GitHub Flavored Markdown additions](https://github.github.com/gfm/). The
checked-in dependency versions and exact option sets are listed in
`COMPARISON.md` and encoded by the harnesses.

## How to read both numbers

| Metric | What it establishes | What it does not establish |
|---|---|---|
| Workload points | Every timed engine handles the same 18-point document | Overall language breadth |
| Capability points | Size of the always-enabled parser/render surface | Exact cost of features absent from this document |
| MB/s | Observed throughput for the portable workload | Feature-adjusted value or quality |
| MB/s × capability points | A visible secondary breadth/throughput index | A physical or normalized speed measurement |

Carve's core must recognize substantially more possible openers and delimiter
families even when a document does not use them. That is a credible source of
dispatch and branch overhead and belongs beside the raw result. It is not,
however, valid to claim that 43 versus 16 points mechanically justifies a
43/16 speed ratio: feature checks have very different costs, and inactive paths
do not run their full implementations. Raw MB/s therefore remains the primary
benchmark; the breadth index is explicitly supplementary.

Tier 2 and Tier 3 remain excluded from competitor-facing timings and from this
core score. They are measured separately only as internal Carve diagnostics.
