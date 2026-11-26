# carve-bench: Carve 0.2 on the normal path

This branch measures the three Carve 0.2 engines against their Carve 0.1 engines and against the
peers of their own language. Every engine takes the normal path: parse the source to the full
tree, then render HTML from that tree. The fast paths of the 0.1 engines, which write HTML without
building a tree, are not measured anywhere on this branch.

The numbers below are from a laptop with a desktop session open and no other jobs running (load
average 2 to 4 on 16 threads, given with the results).

## What is measured

| Language | Carve 0.2 | Carve 0.1, tree route | Peers (default configuration) |
|---|---|---|---|
| JavaScript | `parse(src)` and `render(src)` of the carve-js package build (`dist/index.js`) | `resolve(parse(src))`, and `renderHtml(resolve(parse(src, { positions })))` | markdown-it, commonmark.js, djot.js |
| Rust | `carve::parse_resolved_in` (the arena tree the renderer works on) and `carve::render` | `carve::parse`, and `carve::render_html(&carve::parse(src))` of the 0.1 crate | pulldown-cmark, comrak, jotdown |
| PHP | `Carve::parse` and `Carve::toHtml` | `CarveConverter::parse`, and `render(parse(src))` | league/commonmark (GFM converter), php-collective/djot (`parse`, then `render`) |

Two measures per engine and document: **parse to tree** (source to the tree the engine renders
from) and **parse plus HTML**. Each is given in microseconds per document and in MB/s of the
engine's own input (1 MB = 10^6 bytes). The tables here show MB/s from the median; every median
and minimum in microseconds is in [`results/RESULTS.md`](results/RESULTS.md), every sample in the
JSON files next to it.

Documents (see [`documents/SOURCE.md`](documents/SOURCE.md)): the four document triples of carve-js
`next2`, each in Carve (`.crv`), Markdown (`.md`) and Djot (`.dj`) with the same content, and a
`1mb` document built from their concatenation. Each engine reads its own language.

## Not like for like: what each engine builds

The peers do not all do the same job, and the fastest ones do the least. Read every comparison with
this table next to it.

| Engine | What "parse" gives | Tree? |
|---|---|---|
| Carve 0.2, Carve 0.1 | a typed document tree with a source span on every block and inline node, then a resolve step (references, heading ids, footnote and caption numbers, sections) | yes |
| commonmark.js | a node tree | yes |
| djot.js | a node tree | yes |
| comrak | a node tree in an arena | yes |
| league/commonmark | a node tree | yes |
| php-collective/djot | a node tree | yes |
| markdown-it | a flat list of tokens; inline content hangs below block tokens | **no tree** |
| pulldown-cmark | a stream of events, pulled by the renderer | **no tree** |
| jotdown | a stream of events, pulled by the renderer | **no tree** |

What follows from it:

- **pulldown-cmark and jotdown are a different kind of program.** They never hold the document.
  Their HTML is written while the source is read, which is what the fast paths of Carve 0.1 did and
  what this branch leaves out for Carve. Their "parse to tree" number here is the event stream
  collected into a list, so that there is a number at all. Part of their lead over Carve 0.2 in Rust
  (pulldown-cmark 3.7x to 5.8x, jotdown 1.5x to 2.3x) is the tree they do not build; this benchmark cannot say how large that part is. No tree
  also means no formatter, no linter with positions, no round trip and nothing for other tools to
  work on. They are in the tables as a ceiling, marked "(no tree)".
- **The like-for-like peers are the ones with a tree:** commonmark.js and djot.js in JavaScript,
  comrak in Rust, league/commonmark and php-collective/djot in PHP.
- **Even those do less per node.** Carve 0.2 keeps a source span on every node, inline nodes
  included, keeps the facts a writer needs to give the source back, and runs a resolve step before
  it renders. The CommonMark engines also read a smaller language in their default configuration
  (no attributes, no footnotes, no captions or cross-references; tables only where the engine has
  them on). This benchmark does not try to equalize that; it says so here instead.

## How the 0.1 fast paths are avoided

- **JavaScript.** `carveToHtml` first tries `tryFastHtml`, then `tryFastAstDocument` and an internal
  HTML-only parse. The benchmark calls the public `parse`, `resolve` and `renderHtml` instead, none
  of which reaches those functions. For the HTML measure, positions are on only when the source
  holds an image, the rule `carveToHtml` itself applies; the parse measure uses the default
  (positions on), as Carve 0.2's `parse` does.
- **Rust.** `carve::to_html` first tries `try_layout_html`. The benchmark calls `carve::parse` and
  then `carve::render_html(&doc)`, which takes only the tree and has no source to lay out from.
- **PHP.** `CarveConverter::convert` first tries the borrowed HTML layout and hands the source to
  the renderer. The benchmark calls `parse` and then `render($document)`; `render` alone has no
  source, so the renderer takes its tree route.

Each harness proves the route on the input `# Title\n\nHello *world*.\n`, which the JavaScript and
PHP fast paths serve (checked through their internal planners): it parses, edits the first text
node of the tree, renders again, and records that the edit shows in the HTML and that the unedited
HTML equals the engine's one-call output. The records are the `route` fields of the result files.

## Results

<!-- results:start -->

Measured 2026-11-16T05:19:16.102Z to 2026-11-16T05:34:19.382Z on AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics (16 threads), Linux 7.0.0-38-generic. v22.22.2, PHP 8.5.12, rustc 1.97.1 (8bab26f4f 2026-07-14). Harness commit `24a1ece42a5d1df4d06c5b888cfce546f4b74111`. Engine commits: carve-js `6f5a23b8e7094d3eb88d0b535868edd94650455b`, carve-rs `267507b146eae4a70751f2d9d256976acb8ea8b1`, carve-php `ba3e789b1d02e89da1233e8ba9fbf2cb75d183c8`. Load average at start 1.16, 1.01, 1.05, at end 1.51, 1.55, 1.47.

### Parse plus HTML, normal path

| JavaScript: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 15.8 | 36.2 | 24.5 | 29.6 | 16.7 |
| Carve 0.1 | 0.7 | 8.5 | 2.4 | 2.7 | 1.2 |
| markdown-it (token list) | 7.7 | 18.9 | 13.6 | 16.9 | 8.8 |
| commonmark.js | 17.7 | 51.7 | 40.8 | 41.3 | 12.3 |
| djot.js | 7.2 | 26.3 | 15.2 | 21.9 | 8.8 |

| Rust: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 33.3 | 78.6 | 52.6 | 63.5 | 31.1 |
| Carve 0.1 | 9.5 | 37.9 | 32.8 | 9.6 | 2.9 |
| pulldown-cmark (no tree) | 140.1 | 294.3 | 258.4 | 234.7 | 180.4 |
| comrak | 55.0 | 118.2 | 98.7 | 96.8 | 43.5 |
| comrak + extensions | 49.6 | 103.8 | 79.2 | 85.6 | 31.0 |
| jotdown (no tree) | 55.8 | 118.3 | 89.0 | 105.9 | 70.6 |

| PHP, JIT off: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 2.8 | 8.6 | 5.9 | 7.8 | 2.7 |
| Carve 0.1 | 0.3 | 3.2 | 1.1 | 1.7 | 0.4 |
| league/commonmark GFM | 1.3 | 3.7 | 2.6 | 3.5 | 1.7 |
| php-collective/djot | 3.0 | 6.8 | 4.7 | 6.7 | 4.1 |

| PHP, opcache.jit=tracing: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 2.7 | 8.5 | 5.9 | 7.8 | 2.7 |
| Carve 0.1 | 0.4 | 3.8 | 1.3 | 2.0 | 0.4 |
| league/commonmark GFM | 1.3 | 3.7 | 2.5 | 3.5 | 1.7 |
| php-collective/djot | 3.1 | 6.5 | 4.7 | 6.4 | 4.1 |

### Parse to tree

| JavaScript: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 15.3 | 33.5 | 24.2 | 30.2 | 16.9 |
| Carve 0.1 | 0.7 | 9.5 | 2.1 | 3.0 | 1.4 |
| markdown-it (token list) | 8.8 | 20.5 | 15.3 | 17.7 | 9.4 |
| commonmark.js | 27.1 | 72.2 | 56.3 | 56.3 | 19.8 |
| djot.js | 8.4 | 29.0 | 16.7 | 25.3 | 10.6 |

| Rust: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 42.4 | 93.6 | 66.6 | 91.1 | 39.8 |
| Carve 0.2, no resolve | 54.3 | 126.4 | 87.9 | 124.4 | 68.4 |
| Carve 0.1 | 10.3 | 47.9 | 42.8 | 12.1 | 3.6 |
| pulldown-cmark (no tree) | 139.4 | 328.1 | 281.8 | 261.6 | 174.0 |
| comrak | 67.3 | 149.5 | 122.9 | 115.7 | 60.3 |
| comrak + extensions | 62.6 | 134.7 | 103.5 | 108.6 | 43.1 |
| jotdown (no tree) | 60.0 | 137.5 | 101.4 | 129.5 | 79.1 |

| PHP, JIT off: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 2.9 | 9.6 | 7.0 | 9.4 | 4.1 |
| Carve 0.1 | 0.3 | 5.8 | 1.6 | 2.1 | 0.6 |
| league/commonmark GFM | 1.4 | 4.2 | 3.0 | 3.8 | 2.2 |
| php-collective/djot | 3.0 | 8.2 | 6.1 | 8.1 | 5.4 |

| PHP, opcache.jit=tracing: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 2.9 | 10.0 | 7.0 | 9.6 | 4.0 |
| Carve 0.1 | 0.4 | 6.9 | 1.8 | 2.8 | 0.7 |
| league/commonmark GFM | 1.5 | 4.3 | 2.9 | 3.9 | 2.2 |
| php-collective/djot | 3.0 | 8.6 | 6.4 | 8.5 | 5.4 |

### Carve 0.2 against Carve 0.1 (speed ratio of the medians, above 1x means 0.2 is faster)

| Lane | Measure | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|---|--:|--:|--:|--:|--:|
| JavaScript | parse to tree | 20.56x | 3.53x | 11.66x | 9.90x | 11.87x |
| JavaScript | parse plus HTML | 22.32x | 4.24x | 10.32x | 11.14x | 13.37x |
| Rust | parse to tree | 4.10x | 1.95x | 1.56x | 7.50x | 11.20x |
| Rust | parse plus HTML | 3.50x | 2.08x | 1.60x | 6.65x | 10.89x |
| PHP, JIT off | parse to tree | 8.39x | 1.65x | 4.46x | 4.53x | 6.61x |
| PHP, JIT off | parse plus HTML | 8.42x | 2.68x | 5.22x | 4.49x | 6.81x |
| PHP, opcache.jit=tracing | parse to tree | 7.07x | 1.46x | 3.89x | 3.48x | 5.52x |
| PHP, opcache.jit=tracing | parse plus HTML | 7.15x | 2.26x | 4.54x | 3.94x | 6.16x |

### Element counts of the 0.1 and the 0.2 HTML of the `.crv` documents

| JavaScript: document | p 0.1 / 0.2 | li 0.1 / 0.2 | h1-h6 0.1 / 0.2 | a 0.1 / 0.2 | td/th 0.1 / 0.2 | code 0.1 / 0.2 | Within 1% |
|---|--:|--:|--:|--:|--:|--:|---|
| commonmark-core | 600 / 450 | 600 / 600 | 151 / 151 | 300 / 300 | 0 / 0 | 300 / 300 | **does not agree** (largest difference 25.0%) |
| prose | 55 / 55 | 0 / 0 | 20 / 20 | 109 / 109 | 0 / 0 | 118 / 118 | agrees (largest difference 0.0%) |
| lists-tables | 34 / 34 | 96 / 96 | 19 / 19 | 59 / 59 | 86 / 86 | 81 / 81 | agrees (largest difference 0.0%) |
| reference-heavy | 53 / 53 | 30 / 30 | 16 / 16 | 154 / 154 | 0 / 0 | 41 / 41 | agrees (largest difference 0.0%) |
| 1mb | 6438 / 5088 | 6294 / 6294 | 1854 / 1854 | 5422 / 5422 | 774 / 774 | 4748 / 4748 | **does not agree** (largest difference 21.0%) |

| Rust: document | p 0.1 / 0.2 | li 0.1 / 0.2 | h1-h6 0.1 / 0.2 | a 0.1 / 0.2 | td/th 0.1 / 0.2 | code 0.1 / 0.2 | Within 1% |
|---|--:|--:|--:|--:|--:|--:|---|
| commonmark-core | 600 / 450 | 600 / 600 | 151 / 151 | 300 / 300 | 0 / 0 | 300 / 300 | **does not agree** (largest difference 25.0%) |
| prose | 55 / 55 | 0 / 0 | 20 / 20 | 109 / 109 | 0 / 0 | 118 / 118 | agrees (largest difference 0.0%) |
| lists-tables | 34 / 34 | 96 / 96 | 19 / 19 | 59 / 59 | 86 / 86 | 81 / 81 | agrees (largest difference 0.0%) |
| reference-heavy | 53 / 53 | 30 / 30 | 16 / 16 | 154 / 154 | 0 / 0 | 41 / 41 | agrees (largest difference 0.0%) |
| 1mb | 6438 / 5088 | 6294 / 6294 | 1854 / 1854 | 5422 / 5422 | 774 / 774 | 4748 / 4748 | **does not agree** (largest difference 21.0%) |

| PHP, JIT off: document | p 0.1 / 0.2 | li 0.1 / 0.2 | h1-h6 0.1 / 0.2 | a 0.1 / 0.2 | td/th 0.1 / 0.2 | code 0.1 / 0.2 | Within 1% |
|---|--:|--:|--:|--:|--:|--:|---|
| commonmark-core | 600 / 450 | 600 / 600 | 151 / 151 | 300 / 300 | 0 / 0 | 300 / 300 | **does not agree** (largest difference 25.0%) |
| prose | 55 / 55 | 0 / 0 | 20 / 20 | 109 / 109 | 0 / 0 | 118 / 118 | agrees (largest difference 0.0%) |
| lists-tables | 34 / 34 | 96 / 96 | 19 / 19 | 59 / 59 | 86 / 86 | 81 / 81 | agrees (largest difference 0.0%) |
| reference-heavy | 53 / 53 | 30 / 30 | 16 / 16 | 154 / 154 | 0 / 0 | 41 / 41 | agrees (largest difference 0.0%) |
| 1mb | 6438 / 5088 | 6294 / 6294 | 1854 / 1854 | 5422 / 5422 | 774 / 774 | 4748 / 4748 | **does not agree** (largest difference 21.0%) |

<!-- results:end -->

### Reading the results (run of 2026-11-16)

- **JavaScript.** Carve 0.2 is faster than Carve 0.1 on every document, 3.5x to 22x. It is faster
  than markdown-it (which builds no tree) and djot.js everywhere. commonmark.js parses faster than Carve 0.2 on every
  document, and is 1.1x to 1.7x faster to HTML on four of five (Carve 0.2 leads on `1mb`); commonmark.js reads
  no tables or footnotes.
- **Rust.** Carve 0.2 is faster than Carve 0.1 on every document for parse plus HTML:
  `commonmark-core` 3.5x, `prose` 2.1x, `lists-tables` 1.6x, `reference-heavy` 6.7x, `1mb` 10.9x.
  `lists-tables` is the one document under 2x. Of the peers, only comrak builds a tree. In its
  default configuration it is 1.4x to 1.9x faster than Carve 0.2. With tables, footnotes, task
  lists, strikethrough and heading ids switched on ("comrak + extensions"), which is closer to what
  Carve reads, it is 1.3x to 1.5x faster on four documents and level on `1mb`. pulldown-cmark (3.7x
  to 5.8x) and jotdown (1.5x to 2.3x) build no tree.
- **What the resolve step costs (Rust).** "Carve 0.2, no resolve" is the parse without the resolve
  step (references, heading ids, footnote and caption numbers, sections); it is in the parse tables
  only. Resolve takes 22% to 27% of the parse time on the four small documents and 42% on `1mb`.
  Without it, Carve 0.2 parses within 7% to 18% of comrak with extensions on three documents and
  faster than it on `reference-heavy` and `1mb`.
- **PHP.** Carve 0.2 is faster than Carve 0.1 everywhere, least on `prose` (1.5x to 2.7x). The
  tracing JIT makes no difference for Carve 0.2. Carve 0.2 is faster than league/commonmark
  everywhere. Against php-collective/djot it is faster on `prose`, `lists-tables` and
  `reference-heavy` and slower on `commonmark-core` and `1mb`, for both measures.
- **The 0.2 engines against each other.** Rust is about 2x faster than JavaScript on every
  document. PHP is 4x to 6x slower than JavaScript and 8x to 12x slower than Rust.
- **Context for the large JavaScript ratios.** Carve 0.1's public tree route is much slower than
  its fast path: a spot check on `commonmark-core` gave about 4 ms for `carveToHtml` and 50 to 75
  ms for `parse` plus `renderHtml`. Carve 0.2's normal path (about 5 ms) is therefore faster than
  0.1's tree route but not faster than 0.1's fast path on that document. Fast paths are outside this
  benchmark; this is a single unrepeated measurement.

## Charts

![JavaScript, parse plus HTML](charts/js-html.svg)
![Rust, parse plus HTML](charts/rust-html.svg)
![PHP JIT off, parse plus HTML](charts/php-jit-off-html.svg)
![PHP JIT tracing, parse plus HTML](charts/php-jit-tracing-html.svg)
![JavaScript, parse to tree](charts/js-parse.svg)
![Rust, parse to tree](charts/rust-parse.svg)
![PHP JIT off, parse to tree](charts/php-jit-off-parse.svg)
![PHP JIT tracing, parse to tree](charts/php-jit-tracing-parse.svg)
![Carve 0.2 against Carve 0.1](charts/carve02-vs-carve01.svg)
![The three Carve 0.2 engines](charts/carve02-engines.svg)

## Method

The same in all three languages:

- One process per language (PHP: one process with the JIT off, one with `opcache.jit=tracing`),
  run one after another.
- Engines are built once, outside the timed loop, with their default options.
- Each cell (engine, document, measure) is warmed up with one loop of at least 200 ms, then
  measured for 15 rounds. In a round every cell runs a timed loop of at least 200 ms; the order of
  the cells rotates from round to round so that drift hits every engine alike. The median and the
  minimum of the 15 rounds are reported.
- Before every timed loop the garbage collector runs once, untimed (PHP `gc_collect_cycles()`, Node
  `gc()` through `--expose-gc`), so that garbage one cell leaves behind is not collected inside the
  loop of another. A first run without it gave league/commonmark cells a median up to seven times
  their minimum.
- Every output is kept or read (string lengths and node counts go into a sink that is written to
  the result file), so no engine can skip work.
- Rust: release build with the release profile of carve-rs (`lto = "thin"`, `codegen-units = 1`).
- PHP: CLI with `-n` and only `ctype`, `mbstring`, `intl`, `dom` and `tokenizer` loaded (no pcov, no
  xdebug: the harness refuses to run with either), opcache on for the CLI, measured with
  `opcache.jit=disable` and with `opcache.jit=tracing`.
- Node: the installed version.
- The run records versions, the commit of every engine and of this harness, the CPU model and the
  load average at the start and end of the run and of every lane (`results/environment.json` and
  the `load` field of each lane file).

Engines are pinned by commit in [`pins.json`](pins.json): Carve 0.2 at the `next2` heads of carve-js,
carve-rs and carve-php, Carve 0.1 at their latest 0.1 release tags. `scripts/fetch.mjs` checks them
out into `.engines/` (not committed) and builds both JavaScript engines. The Rust lane takes Carve
0.1 from crates.io (`carve-lang =0.1.14`, the release the pin names): two path dependencies with one
package name and version collide in the lockfile. Carve 0.1 and 0.2 share the `MarkupCarve\Carve`
namespace in PHP, so the PHP lane measures Carve 0.1 in a second process (`engines/php01`) and
`scripts/run.mjs` merges it into the lane file. The peers are pinned by the lock files in `engines/`.

## Rerun

Needs git, Node 22 or later, PHP 8.2 or later with Composer, and Rust.

```sh
npm run bench            # fetch, build, measure, rewrite results/, charts/ and the tables above
npm run bench:quick      # 2 short rounds into build/quick, to check that everything runs
npm run report           # tables and charts again from the committed results
```

A full run takes about 20 minutes. Set `CARGO_TARGET_DIR` to reuse a Rust build directory.

## Perf gate

`.github/workflows/perf-nightly.yml` measures carve-js, carve-php and carve-rs
at an engine ref (default `next2`) against the release baselines pinned in
`perf/config.json` (carve-js 0.1.17 from npm, carve-php 0.1.18 from Packagist,
carve-lang 0.1.14 from crates.io). It runs nightly at 02:30 UTC and by hand
from Actions > perf-nightly > Run workflow, which is how a release cut uses it.

Each engine and side runs as one long-lived driver process. Calls are
interleaved round-robin per cell, so head and baseline see the same machine
state. Ops: `parse`, `render`, `ext` (every standard extension), `lint`, `fmt`,
`fix`, `import` (HTML rendered by the baseline) and `include`. Documents: seven
generated shapes at 2, 8, 32 and 128 KB (`perf/gen.mjs`, deterministic) plus
the committed real documents in `perf/corpus/real/`.

The run fails when any of these holds:

- a head cell's median is more than 1.1x its baseline cell's;
- a head cell grows from 32 to 128 KB with an exponent above 1.2 and above
  the baseline's own exponent, both taken from the fastest samples;
- a head cell crashes, panics or times out.

A head error that is a deliberate refusal (an exception or `Err` from the
engine, such as a nesting limit) is listed under the verdict but does not
gate.

2 KB cells under 0.5 ms are reported but do not gate. A baseline cell already
twice as slow as its head stops being sampled after one round, since it cannot
decide the ratio. The job summary carries the verdict and every cell; the JSON
run, the Markdown report and `verdict.json` are uploaded as the `perf-report`
artifact. A failed nightly run creates or updates the issue
"Perf gate: regression on <ref>" with the failures and the engine commit range
since the last green run. A dispatched run with `issue_dry_run` prints that
issue instead. A pull request that changes `perf/` or the workflow runs the
gate too, reports the verdict without failing on it, and prints the issue as a
dry run.

Local run, with the three engines checked out side by side:

```bash
node perf/setup.mjs --js ../carve-js --php ../carve-php --rs ../carve-rs
node perf/orch.mjs perf/.work/run.json --rounds 3
node perf/compare.mjs perf/.work/run.json --ref next2 --md perf/.work/report.md --json perf/.work/verdict.json
node --test perf/test-gate.mjs
```

Cells whose first call takes over 100 ms take one sample in the first round
and reach 7 by the last (`run.slowMinSamples`); faster cells take 3 per round.

### bench-cells: gate cells against a local checkout

`perf/cells.mjs` runs a subset of the gate against one local engine checkout
instead of the `next2` head: same setup, drivers, warmup, rounds, sampling,
baselines, limits and verdict (`perf/gate.mjs`, shared with `orch.mjs` and
`compare.mjs`). Only the engine, the ops and the documents are narrowed.

```bash
node perf/cells.mjs --engine carve-rs --path ../carve-rs --command import,fmt --doc table,prose
```

`--command` takes ops from the list above, `--doc` takes a shape (`table`,
`lists`, ...) or a real document (`conformance`); a shape runs at every size,
so the 32 to 128 KB growth check is included. It prints one line per cell
(ratio or growth, value, limit, PASS or FAIL) and exits 1 on any FAIL, or 2
when no selected cell can be gated (the 0.1 baseline has no `fix`, `ext` or
`include`, so those gate only on growth). An
existing `node_modules` or `vendor` in the checkout is kept; carve-js is
rebuilt unless `--no-build` is given. Wall-clock cells on a loaded machine
are noisy: a ratio near the limit needs a rerun before it counts either way.

After a release, move the baselines in `perf/config.json` to it (and set
`api` to `0.2` once the baseline speaks the 0.2 API); limits and run sizes
live there too.

## Caveats

- **One run on a laptop.** A desktop session was open (load average 2 to 4 on 16 threads). An
  earlier run under heavy load gave the same order of engines with lower numbers throughout; the
  ratios between engines measured in the same round move less than the absolute numbers.
- **The 0.1 and 0.2 HTML do not agree on `commonmark-core`** (and so on `1mb`, which contains it):
  0.1 renders its lists as loose lists with a `<p>` in each item and `---` as `<hr>`, 0.2 renders
  tight items and a paragraph. 600 against 450 paragraphs, 25%. The other element counts agree
  exactly. The speed numbers of these two documents compare engines that do not produce the same
  HTML.
- **Three peers build no tree** (pulldown-cmark, jotdown, markdown-it): see "Not like for like" above.
- **Peers run in their default configuration.** comrak and pulldown-cmark then read the GFM tables
  and footnotes of the `.md` documents as paragraphs, commonmark.js too, so on `lists-tables` and
  `reference-heavy` they do less work than the engines that support those. markdown-it's default
  preset has tables but no footnotes. league/commonmark runs its GFM converter (tables, no
  footnotes). The main branch enabled tables in comrak and pulldown-cmark; this branch does not.
- **marked is not measured**: the main branch does not measure it.
- **league/commonmark is 2.10.7**, not the 2.10.0 of the main branch: Composer refuses 2.10.0
  because of two security advisories.
- **Carve 0.1 in Rust** is built with its default features, which include the experimental event
  parser that `carve::parse` tries first. It returns the same full tree.
- **The committed results are the run of 16 November**, taken before the engines renamed their 0.2
  code to the package root. Its Carve 0.1 was the code outside `v2/` at the `next2` commits named in
  `results/environment.json`. The pins now name the renamed `next2` heads and the 0.1 releases
  (carve-js 0.1.17, carve-rs 0.1.14, carve-php 0.1.17); the next `npm run bench` measures those.

## What this branch removed

Everything of the 0.1 benchmark: the fast-path, borrowed-route and PHP tier rows and harnesses, the
tier and history reports, `reports/`, the comparison and feature documents, the 0.1 corpus and
charts, the HTML import comparison, and the benchmark site with its Pages workflow (it is fed by
the 0.1 history files; rebuilding it on the new result files was not done). The 0.1 workflows are
replaced by `check`, which measures nothing: it checks the scripts and that the committed tables and
charts follow from the committed results.
