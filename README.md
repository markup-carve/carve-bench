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
| PHP | `Carve2::parse` and `Carve2::toHtml` | `CarveConverter::parse`, and `render(parse(src))` | league/commonmark (GFM converter), php-collective/djot |

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

**Measured under load, to be repeated.** Measured 2026-11-15T18:09:20.452Z to 2026-11-15T18:25:55.545Z on AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics (16 threads), Linux 7.0.0-38-generic. v22.22.2, PHP 8.5.12, rustc 1.97.1 (8bab26f4f 2026-07-14). Harness commit `f771a04f0686cd1c375f6c8fb52f235b2c2b5d8c`. Engine commits: carve-js `c27a9dd40c1c0a359ebb2f3c3c44edbd0d429ae8`, carve-rs `8c70808759761875a7beba9289eb9c236ceda6e2`, carve-php `a9679962657af56f1b743ba7a1910e279fb935a5`. Load average at start 6.73, 5.76, 5.92, at end 13.08, 10.05, 8.01.

### Parse plus HTML, normal path

| JavaScript: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 11.0 | 26.8 | 18.8 | 21.2 | 13.4 |
| Carve 0.1 | 0.8 | 6.5 | 2.4 | 2.5 | 1.2 |
| markdown-it | 5.4 | 12.9 | 10.1 | 11.8 | 7.3 |
| commonmark.js | 11.2 | 36.2 | 29.1 | 30.2 | 9.6 |
| djot.js | 4.9 | 19.6 | 10.9 | 16.5 | 7.2 |

| Rust: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 8.5 | 20.5 | 15.7 | 18.8 | 6.5 |
| Carve 0.1 | 5.6 | 25.1 | 22.8 | 6.9 | 1.9 |
| pulldown-cmark | 102.9 | 217.6 | 191.4 | 179.8 | 126.2 |
| comrak | 39.3 | 78.8 | 71.7 | 70.5 | 28.5 |
| jotdown | 41.1 | 87.2 | 68.5 | 77.4 | 50.4 |

| PHP, JIT off: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 1.5 | 5.7 | 3.9 | 4.4 | 1.8 |
| Carve 0.1 | 0.2 | 1.6 | 0.7 | 0.9 | 0.2 |
| league/commonmark GFM | 0.1 | 2.3 | 1.5 | 2.0 | 1.1 |
| php-collective/djot | 10.7 | 4.4 | 2.5 | 4.0 | 2.1 |

| PHP, opcache.jit=tracing: parse plus HTML, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 1.2 | 3.9 | 2.6 | 3.6 | 1.9 |
| Carve 0.1 | 0.2 | 2.1 | 0.8 | 1.1 | 0.2 |
| league/commonmark GFM | 0.1 | 2.4 | 1.6 | 2.1 | 1.0 |
| php-collective/djot | 9.3 | 4.2 | 2.4 | 3.4 | 1.9 |

### Parse to tree

| JavaScript: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 11.1 | 25.9 | 18.6 | 23.5 | 13.7 |
| Carve 0.1 | 0.7 | 7.2 | 1.9 | 2.6 | 1.2 |
| markdown-it | 6.0 | 14.3 | 11.0 | 12.6 | 7.9 |
| commonmark.js | 17.2 | 47.3 | 38.3 | 39.8 | 13.9 |
| djot.js | 5.6 | 20.4 | 11.6 | 19.0 | 8.0 |

| Rust: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 11.8 | 27.2 | 21.6 | 27.5 | 9.4 |
| Carve 0.1 | 6.1 | 32.8 | 31.2 | 8.8 | 2.5 |
| pulldown-cmark | 100.5 | 238.7 | 212.8 | 195.7 | 131.1 |
| comrak | 49.5 | 107.9 | 90.5 | 86.1 | 39.1 |
| jotdown | 44.4 | 102.0 | 78.0 | 98.1 | 55.9 |

| PHP, JIT off: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 1.9 | 6.0 | 4.1 | 4.4 | 2.8 |
| Carve 0.1 | 0.2 | 4.2 | 1.0 | 1.4 | 0.4 |
| league/commonmark GFM | 1.1 | 0.8 | 0.6 | 2.3 | 1.4 |
| php-collective/djot | 2.3 | 4.5 | 3.8 | 5.2 | 3.7 |

| PHP, opcache.jit=tracing: parse to tree, MB/s | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|--:|--:|--:|--:|--:|
| Carve 0.2 | 1.6 | 4.6 | 2.9 | 4.1 | 2.7 |
| Carve 0.1 | 0.2 | 4.6 | 1.0 | 1.6 | 0.4 |
| league/commonmark GFM | 1.0 | 0.1 | 0.5 | 1.9 | 1.3 |
| php-collective/djot | 3.1 | 3.2 | 3.2 | 4.9 | 3.4 |

### Carve 0.2 against Carve 0.1 (speed ratio of the medians, above 1x means 0.2 is faster)

| Lane | Measure | commonmark-core | prose | lists-tables | reference-heavy | 1mb |
|---|---|--:|--:|--:|--:|--:|
| JavaScript | parse to tree | 15.62x | 3.61x | 9.79x | 8.89x | 11.00x |
| JavaScript | parse plus HTML | 13.89x | 4.12x | 7.71x | 8.57x | 11.14x |
| Rust | parse to tree | 1.92x | 0.83x | 0.69x | 3.12x | 3.77x |
| Rust | parse plus HTML | 1.53x | 0.82x | 0.69x | 2.72x | 3.51x |
| PHP, JIT off | parse to tree | 10.59x | 1.42x | 4.09x | 3.14x | 7.14x |
| PHP, JIT off | parse plus HTML | 7.49x | 3.54x | 5.25x | 4.64x | 7.46x |
| PHP, opcache.jit=tracing | parse to tree | 9.71x | 1.01x | 2.81x | 2.61x | 6.24x |
| PHP, opcache.jit=tracing | parse plus HTML | 6.51x | 1.88x | 3.28x | 3.21x | 8.12x |

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
