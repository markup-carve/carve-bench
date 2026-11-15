# carve-bench: Carve 0.2 on the normal path

This branch measures the three Carve 0.2 engines against their Carve 0.1 engines and against the
peers of their own language. Every engine takes the normal path: parse the source to the full
tree, then render HTML from that tree. The fast paths of the 0.1 engines, which write HTML without
building a tree, are not measured anywhere on this branch.

The numbers below were **measured under load, to be repeated** on a quiet machine. They are from a
laptop that ran other jobs at the same time (load average in the tables).

## What is measured

| Language | Carve 0.2 | Carve 0.1, tree route | Peers (default configuration) |
|---|---|---|---|
| JavaScript | `parse(src)` and `render(src)` of carve-js `v2/src` | `resolve(parse(src))`, and `renderHtml(resolve(parse(src, { positions })))` | markdown-it, commonmark.js, djot.js |
| Rust | `carve2::parse_resolved` and `carve2::render` | `carve::parse`, and `carve::render_html(&carve::parse(src))` | pulldown-cmark, comrak, jotdown |
| PHP | `Carve2::parse` and `Carve2::toHtml` | `CarveConverter::parse`, and `render(parse(src))` | league/commonmark (GFM converter), php-collective/djot (`parse`, then `render`) |

Two measures per engine and document: **parse to tree** (source to the tree the engine renders
from) and **parse plus HTML**. Each is given in microseconds per document and in MB/s of the
engine's own input (1 MB = 10^6 bytes). The tables here show MB/s from the median; every median
and minimum in microseconds is in [`results/RESULTS.md`](results/RESULTS.md), every sample in the
JSON files next to it.

Documents (see [`documents/SOURCE.md`](documents/SOURCE.md)): the four document triples of carve-js
`next2`, each in Carve (`.crv`), Markdown (`.md`) and Djot (`.dj`) with the same content, and a
`1mb` document built from their concatenation. Each engine reads its own language.

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

**Measured under load, to be repeated.** Measured 2026-11-15T18:44:55.494Z to 2026-11-15T19:02:09.320Z on AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics (16 threads), Linux 7.0.0-38-generic. v22.22.2, PHP 8.5.12, rustc 1.97.1 (8bab26f4f 2026-07-14). Harness commit `6e367be8e9a8300970f79fbaa1eeb4702b6cb1b6`. Engine commits: carve-js `c27a9dd40c1c0a359ebb2f3c3c44edbd0d429ae8`, carve-rs `8c70808759761875a7beba9289eb9c236ceda6e2`, carve-php `a9679962657af56f1b743ba7a1910e279fb935a5`. Load average at start 14.09, 11.29, 9.75, at end 8.66, 9.15, 9.57.

### Parse plus HTML, normal path

| JavaScript: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 9.7 | 26.9 | 15.6 | 20.6 | 11.9 |
| Carve 0.1 | 0.4 | 5.2 | 1.4 | 1.7 | 0.9 |
| markdown-it | 5.1 | 13.7 | 9.6 | 10.7 | 6.2 |
| commonmark.js | 9.0 | 36.3 | 30.1 | 28.9 | 9.2 |
| djot.js | 4.1 | 16.3 | 9.2 | 14.0 | 5.2 |

| Rust: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 9.4 | 23.3 | 16.9 | 21.2 | 7.0 |
| Carve 0.1 | 5.8 | 29.7 | 25.6 | 7.4 | 2.1 |
| pulldown-cmark | 113.5 | 236.9 | 215.5 | 198.1 | 149.1 |
| comrak | 40.6 | 96.2 | 80.0 | 80.9 | 29.8 |
| jotdown | 47.1 | 97.5 | 73.0 | 90.6 | 57.9 |

| PHP, JIT off: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 1.4 | 4.8 | 3.1 | 4.3 | 2.0 |
| Carve 0.1 | 0.2 | 2.4 | 0.8 | 1.2 | 0.3 |
| league/commonmark GFM | 0.9 | 2.7 | 1.9 | 2.7 | 1.3 |
| php-collective/djot | 2.1 | 4.3 | 3.0 | 4.2 | 3.2 |

| PHP, opcache.jit=tracing: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 1.2 | 4.0 | 2.7 | 4.0 | 1.9 |
| Carve 0.1 | 0.2 | 2.4 | 0.8 | 1.2 | 0.2 |
| league/commonmark GFM | 0.9 | 2.7 | 1.7 | 2.3 | 1.2 |
| php-collective/djot | 2.0 | 4.6 | 2.9 | 4.2 | 2.7 |

### Parse to tree

| JavaScript: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 9.6 | 24.6 | 17.5 | 21.6 | 11.5 |
| Carve 0.1 | 0.4 | 5.7 | 1.2 | 1.7 | 1.0 |
| markdown-it | 5.5 | 14.8 | 10.8 | 12.8 | 6.6 |
| commonmark.js | 17.4 | 51.4 | 43.7 | 42.1 | 14.3 |
| djot.js | 5.0 | 18.6 | 10.0 | 15.3 | 7.1 |

| Rust: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 13.0 | 32.1 | 23.6 | 30.0 | 10.0 |
| Carve 0.1 | 6.9 | 36.5 | 33.5 | 9.8 | 2.7 |
| pulldown-cmark | 111.1 | 262.7 | 238.8 | 213.3 | 146.9 |
| comrak | 51.0 | 122.1 | 97.6 | 94.0 | 41.5 |
| jotdown | 50.9 | 114.5 | 84.0 | 112.0 | 64.6 |

| PHP, JIT off: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 1.9 | 5.0 | 3.3 | 4.8 | 3.1 |
| Carve 0.1 | 0.2 | 3.6 | 1.0 | 1.6 | 0.4 |
| league/commonmark GFM | 1.1 | 3.4 | 2.3 | 3.1 | 1.8 |
| php-collective/djot | 3.6 | 6.6 | 4.4 | 6.2 | 5.1 |

| PHP, opcache.jit=tracing: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 1.6 | 4.4 | 3.2 | 3.9 | 2.9 |
| Carve 0.1 | 0.2 | 4.0 | 1.1 | 1.7 | 0.5 |
| league/commonmark GFM | 1.1 | 3.3 | 2.1 | 2.8 | 1.6 |
| php-collective/djot | 3.3 | 6.0 | 3.8 | 5.4 | 4.4 |

### Carve 0.2 against Carve 0.1 (speed ratio of the medians, above 1x means 0.2 is faster)

| Lane | Measure | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|---|--:|--:|--:|--:|--:|
| JavaScript | parse to tree | 23.92x | 4.33x | 14.42x | 12.71x | 11.80x |
| JavaScript | parse plus HTML | 23.27x | 5.13x | 11.43x | 12.36x | 13.88x |
| Rust | parse to tree | 1.89x | 0.88x | 0.70x | 3.07x | 3.67x |
| Rust | parse plus HTML | 1.62x | 0.78x | 0.66x | 2.85x | 3.33x |
| PHP, JIT off | parse to tree | 8.63x | 1.38x | 3.16x | 3.00x | 6.91x |
| PHP, JIT off | parse plus HTML | 7.71x | 1.98x | 3.82x | 3.76x | 7.89x |
| PHP, opcache.jit=tracing | parse to tree | 7.33x | 1.11x | 2.90x | 2.31x | 6.12x |
| PHP, opcache.jit=tracing | parse plus HTML | 6.84x | 1.69x | 3.25x | 3.24x | 7.76x |

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

### Reading the results (run of 2026-11-15, under load)

- **JavaScript.** Carve 0.2 is faster than Carve 0.1 on every document, 4x to 24x. It is faster
  than markdown-it and djot.js everywhere. commonmark.js parses faster than Carve 0.2 on every
  document, and is faster to HTML on `prose`, `lists-tables` and `reference-heavy` (Carve 0.2 leads
  on `commonmark-core` and `1mb`); commonmark.js reads no tables or footnotes.
- **Rust.** Carve 0.2 is **slower than Carve 0.1 on `prose` (0.78x) and `lists-tables` (0.66x)** for
  parse plus HTML, and faster on `commonmark-core` (1.6x), `reference-heavy` (2.9x) and `1mb`
  (3.3x). The goal "clearly faster than 0.1 on the normal path" is not met in Rust on two of five
  documents. pulldown-cmark, comrak and jotdown are each about 4x to 21x faster than Carve 0.2.
- **PHP.** Carve 0.2 is faster than Carve 0.1 everywhere, least on `prose` (1.1x to 2.0x). The
  tracing JIT does not speed up Carve 0.2: it was slightly slower with it on every document. Carve 0.2 is faster
  than league/commonmark everywhere. php-collective/djot parses faster than Carve 0.2 on every
  document and renders HTML faster on `commonmark-core` and `1mb`; on the other three they are level.
- **The 0.2 engines against each other.** The JavaScript and Rust engines are within 16% of
  each other on four documents, and JavaScript is faster on `1mb` (11.9 MB/s against 7.0 MB/s).
  PHP is 3.5x to 7x slower than both.
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

Engines are pinned by commit in [`pins.json`](pins.json); `scripts/fetch.mjs` checks them out into
`.engines/` (not committed) and builds the 0.1 JavaScript engine. The 0.1 engines are the code
outside `v2/` at the same commit. The peers are pinned by the lock files in `engines/`.

## Rerun

Needs git, Node 22 or later, PHP 8.2 or later with Composer, and Rust.

```sh
npm run bench            # fetch, build, measure, rewrite results/, charts/ and the tables above
npm run bench:quick      # 2 short rounds into build/quick, to check that everything runs
npm run report           # tables and charts again from the committed results
```

A full run takes about 20 minutes. Set `CARGO_TARGET_DIR` to reuse a Rust build directory.

## Caveats

- **Measured under load.** Other jobs ran on the machine during the run (load average 6 to 16 on
  16 threads, rising toward the end, so the PHP lane with the JIT saw the most). Numbers can move
  by tens of percent between runs; the ratios between engines measured in the same round move less.
  Repeat on a quiet machine before quoting them.
- **The 0.1 and 0.2 HTML do not agree on `commonmark-core`** (and so on `1mb`, which contains it):
  0.1 renders its lists as loose lists with a `<p>` in each item and `---` as `<hr>`, 0.2 renders
  tight items and a paragraph. 600 against 450 paragraphs, 25%. The other element counts agree
  exactly. The speed numbers of these two documents compare engines that do not produce the same
  HTML.
- **pulldown-cmark and jotdown build no tree.** They are pull parsers; their "parse to tree" here is
  collecting the event stream into a `Vec`, and their HTML is rendered from a fresh event stream.
  markdown-it's "tree" is its token list.
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
- **The Carve 0.1 versions are the code outside `v2/` at the pinned `next2` commits** (carve-js
  0.1.17, carve-rs 0.1.14, carve-php after 0.1.17), not the published 0.1 releases.

## What this branch removed

Everything of the 0.1 benchmark: the fast-path, borrowed-route and PHP tier rows and harnesses, the
tier and history reports, `reports/`, the comparison and feature documents, the 0.1 corpus and
charts, the HTML import comparison, and the benchmark site with its Pages workflow (it is fed by
the 0.1 history files; rebuilding it on the new result files was not done). The 0.1 workflows are
replaced by `check`, which measures nothing: it checks the scripts and that the committed tables and
charts follow from the committed results.
