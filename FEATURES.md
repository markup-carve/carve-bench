# Benchmark feature points

Feature points describe the syntax work exercised by the same-language
comparison corpus. They are not a general quality score and are not used to
divide or normalize throughput.

The score is intentionally workload-bound. Counting every feature advertised
by a library would credit code paths the benchmark never executes, and assigning
subjective weights afterward could be used to explain away any unfavorable
result. A point here instead means that the exact benchmark configuration parses
and renders that feature in every repeated section.

## Rubric

| Exercised capability | Points | Why |
|---|---:|---|
| ATX headings | 1 | Block opener and heading rendering |
| Paragraphs | 1 | Baseline block and text rendering |
| Strong emphasis | 1 | Paired inline-delimiter scan |
| Emphasis | 1 | Separate paired inline-delimiter family |
| Inline code | 1 | Verbatim delimiter handling |
| Inline links | 1 | Label and destination parsing |
| Reference links and definitions | 2 | Cross-document lookup plus link parsing |
| Bullet lists | 1 | Container and item parsing |
| Nested lists | 2 | Recursive container/indentation handling |
| Block quotes | 1 | Recursive block container |
| Fenced code with info string | 1 | Bounded block scan and metadata |
| Pipe tables | 3 | Row/cell grid parsing and structured rendering |
| Per-column table alignment | 1 | Separator metadata applied to cells |
| **Total** | **18** | |

The weights are fixed before looking at an engine's timing: ordinary syntax
families cost one point, cross-document/recursive work costs two, and the table
grid costs three. The unweighted count is 13 capabilities; the weighted count
is 18.

## Score by exact benchmark configuration

| Language | Engine | Enabled and exercised | Points |
|---|---|---:|---:|
| JavaScript | carve-js | 13/13 | 18 |
| JavaScript | djot.js | 13/13 | 18 |
| JavaScript | markdown-it | 13/13 | 18 |
| PHP | carve-php Tier 1/core | 13/13 | 18 |
| PHP | djot-php | 13/13 | 18 |
| PHP | league/commonmark GFM | 13/13 | 18 |
| Rust | carve-rs | 13/13 | 18 |
| Rust | jotdown | 13/13 | 18 |
| Rust | comrak with tables enabled | 13/13 | 18 |
| Rust | pulldown-cmark with tables enabled | 13/13 | 18 |

Comrak and pulldown-cmark must have their table options enabled. Earlier draft
results accidentally used their default configurations, which treated the
corpus's table syntax as ordinary paragraph text and therefore did less work.
The checked-in Rust harness now enables tables explicitly.

## Interpretation

All compared engines receive the same score, so the current speed gaps cannot
honestly be attributed to Carve processing “twice as many benchmark features.”
Carve has a broader always-enabled Tier-1 grammar than some peers, and merely
checking absent syntax can have a real dispatch cost, but this score does not
pretend to measure that indirect tax. Tier 2 and Tier 3 are excluded from every
competitor-facing result and measured separately only as internal Carve
diagnostics.
