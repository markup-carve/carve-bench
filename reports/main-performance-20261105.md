# Release against merged main: performance check, 2026-11-05

This report answers one question: did merged main get slower than the last
released engines anywhere? It measures each engine at its newest release and
at main in the same session, with render, AST (parse), fmt and lint timed
separately. It also covers scaling from 2 KB to 128 KB inputs, a full-corpus
run, and a bisection of each slowdown to the merge that caused it.

## Conditions

- Laptop, AMD Ryzen 9 PRO 7940HS, 16 cores, 61 GB RAM, Linux 7.0.0, desktop
  in use. Node.js 22.22.2, PHP 8.5.12 with tracing JIT, rustc 1.97.1.
- One-minute load: A/B runs 5.50 at start and 6.25 at end; full-corpus run
  3.02 and 4.44; core comparison 3.64 and 3.83; scaling runs 5.46 and 6.26.
- Engines, built from fresh checkouts:

| Engine | Release | Release commit | Main commit |
|---|---|---|---|
| carve-js | 0.1.15 | `c62fad2a9` | `0c2538a54` |
| carve-php | 0.1.16 | `20d920713` | `fc0333242` |
| carve-rs | 0.1.13 | `5ec3c8ea7` | `5572046d6` |

- Method: every A/B pair runs release and main in separate processes,
  alternating which goes first, 7 repetitions; each process warms up before
  timing. A change counts only when the two ranges do not overlap and the
  median moved more than 10%. carve-rs is built in release mode with the
  engine's own profile (`lto = "thin"`, `codegen-units = 1`). carve-php runs
  with `-n`, ctype and mbstring loaded, and tracing JIT.

## Release against main

`small` is `corpus/small.crv` (1.2 KB), `medium` is `corpus/medium.crv` (64 KB).

| Engine (release → main) | Doc | Op | Release ms, median (range) | Main ms, median (range) | Change | Verdict |
|---|---|---|---:|---:|---:|---|
| carve-js 0.1.15 → main | small | render | 1.42 (1.33-1.70) | 2.00 (1.89-2.34) | +41% | **slower** |
| carve-js 0.1.15 → main | small | ast | 1.14 (1.09-1.29) | 1.67 (1.54-1.93) | +47% | **slower** |
| carve-js 0.1.15 → main | small | fmt | 18.14 (16.92-24.71) | 8.58 (7.77-9.96) | -53% | faster |
| carve-js 0.1.15 → main | small | lint | 2.69 (2.63-2.82) | 4.32 (3.91-4.79) | +61% | **slower** |
| carve-js 0.1.15 → main | medium | render | 182 (169-229) | 192 (173-211) | +6% | noise (ranges overlap) |
| carve-js 0.1.15 → main | medium | ast | 166 (153-179) | 186 (173-254) | +12% | noise (ranges overlap) |
| carve-js 0.1.15 → main | medium | fmt | 24317 (22920-35417) | 4397 (3827-4678) | -82% | faster |
| carve-js 0.1.15 → main | medium | lint | 366 (350-420) | 400 (396-445) | +9% | noise (ranges overlap) |
| carve-php 0.1.16 → main | small | render | 2.80 (2.60-3.27) | 3.73 (3.02-4.79) | +33% | noise (ranges overlap) |
| carve-php 0.1.16 → main | small | ast | 2.00 (1.92-2.77) | 2.54 (2.31-3.13) | +27% | noise (ranges overlap) |
| carve-php 0.1.16 → main | small | fmt | 40.57 (37.93-47.59) | 11.33 (10.45-13.64) | -72% | faster |
| carve-php 0.1.16 → main | small | lint | 47.57 (41.74-51.23) | 86.09 (80.71-94.84) | +81% | **slower** |
| carve-php 0.1.16 → main | medium | render | 460 (412-501) | 232 (217-247) | -50% | faster |
| carve-php 0.1.16 → main | medium | ast | 379 (362-429) | 208 (196-282) | -45% | faster |
| carve-php 0.1.16 → main | medium | fmt | 4881 (3360-10274) | 2727 (1947-3520) | -44% | noise (ranges overlap) |
| carve-php 0.1.16 → main | medium | lint | 6765 (6164-15327) | 4042 (3695-5346) | -40% | faster |
| carve-rs 0.1.13 → main | small | render | 0.14 (0.13-0.15) | 0.19 (0.18-0.21) | +37% | **slower** |
| carve-rs 0.1.13 → main | small | ast | 0.12 (0.11-0.14) | 0.17 (0.16-0.19) | +47% | **slower** |
| carve-rs 0.1.13 → main | small | fmt | 4.63 (4.36-6.01) | 1.07 (0.98-1.35) | -77% | faster |
| carve-rs 0.1.13 → main | small | lint | 2.14 (2.05-2.65) | 3.72 (3.43-6.84) | +74% | **slower** |
| carve-rs 0.1.13 → main | medium | render | 52.53 (50.80-59.58) | 38.57 (34.88-42.27) | -27% | faster |
| carve-rs 0.1.13 → main | medium | ast | 55.93 (48.99-60.06) | 38.25 (34.13-42.85) | -32% | faster |
| carve-rs 0.1.13 → main | medium | fmt | 1982 (1796-2336) | 2877 (2713-3219) | +45% | **slower** |
| carve-rs 0.1.13 → main | medium | lint | 133 (123-162) | 99.49 (87.69-111) | -25% | faster |

## Slowdowns traced to a merge

| Slowdown | Release | Main | Caused by | Ticket |
|---|---:|---:|---|---|
| carve-rs fmt, `medium.crv` | 1743 ms | 2685 ms | [carve-rs#3832](https://github.com/markup-carve/carve-rs/issues/3832): 924 ms before, 2630 ms after | [carve-rs#3879](https://github.com/markup-carve/carve-rs/issues/3879) |
| carve-rs lint, `small.crv` | 2.14 ms | 3.72 ms | [carve-rs#3378](https://github.com/markup-carve/carve-rs/issues/3378): flat 1.35 ms per call (regexes compiled per call) | [carve-rs#3881](https://github.com/markup-carve/carve-rs/issues/3881) |
| carve-js lint, one 512 KB line with links | 633 ms | 3615 ms | [carve-js#3870](https://github.com/markup-carve/carve-js/issues/3870): 778 ms before, 3470 ms after, quadratic | [carve-js#4426](https://github.com/markup-carve/carve-js/issues/4426) |
| carve-js render, `large.crv` (509 KB) | 1252 ms | 1431 ms | [carve-js#4364](https://github.com/markup-carve/carve-js/issues/4364): 629 ms before, 1411 ms after | [carve#5184](https://github.com/markup-carve/carve/issues/5184) |
| carve-php render, `medium.crv` | 460 ms | 232 ms (still faster than the release) | [carve-php#4587](https://github.com/markup-carve/carve-php/issues/4587): 119 ms before, 173 ms after | [carve#5184](https://github.com/markup-carve/carve/issues/5184) |
| carve-rs parse, comments shape 128 KB | 2.28 ms | 11.43 ms | [carve-rs#3830](https://github.com/markup-carve/carve-rs/issues/3830): 2.0 ms before, 10.1 ms after, superlinear | [carve#5184](https://github.com/markup-carve/carve/issues/5184), [carve-rs#3868](https://github.com/markup-carve/carve-rs/issues/3868) |

The three [carve#5012](https://github.com/markup-carve/carve/issues/5012) ports (erase single-line invisible blocks before layout) are
one cause across engines and share one tracking ticket. In carve-js, the port
cancelled a 2x render gain from the preceding week: main renders `medium.crv`
at about release speed, while the commit just before the port took 74 ms.

### Gradual slowdowns on small documents

The small-document slowdowns in the table above (carve-js render, AST and lint;
carve-php lint; carve-rs render and AST) add a fixed per-call cost of about
0.05 ms (Rust) to 0.6 ms (JavaScript). They build up across many merges
rather than coming from one:

- carve-js `small.crv` render at merges 0, 75, 150, 226, 301, 376 and 452
  after 0.1.15: 1.46, 1.60, 1.64, 1.75, 1.92, 1.96, 2.17 ms. Lint: 2.73, 3.17,
  3.34, 3.67, 3.61, 3.93, 4.05 ms. The largest single contributor found,
  [carve-js#4378](https://github.com/markup-carve/carve-js/issues/4378) (list owner columns walk every AST node), adds
  about 5%.
- carve-php `small.crv` lint at merges 0, 69, 138, 206, 275, 344 and 413:
  43, 43, 64, 54, 56, 71, 76 ms. Bisecting the 69 to 138 step found no single
  step above the noise.
- carve-rs `small.crv` render at merges 0, 62, 124, 186, 248, 310 and 372:
  0.107, 0.109, 0.106, 0.131, 0.145, 0.141, 0.145 ms. A bisection of the 124
  to 186 step pointed at [carve-rs#3516](https://github.com/markup-carve/carve-rs/issues/3516), but an interleaved
  re-check of that pair showed no difference (0.124 against 0.124 ms), so the
  step is spread over several merges.

## Scaling, main

Inputs built from six shapes at 2 KB, 8 KB, 32 KB and 128 KB: `corpus`
(prefixes of `large.crv`), `deep` (nested lists and quotes), `table` (one
long table), `comments` (inline, line and block comments), `para` (one long
paragraph on a single line) and `colon` (nested colon fences). Medians of
5 runs in ms. Linear growth is 4x per 4x input. A step above 5x was
re-measured at 512 KB; growth that continued above 8x per 4x is called
superlinear below.

Confirmed superlinear at 512 KB:

- carve-rs parse and render on the comments shape: 128 KB to 512 KB grows
  11x (0.1.13: 4.8x). [carve#5184](https://github.com/markup-carve/carve/issues/5184).
- carve-js lint on the single-line paragraph: 9.7x (0.1.15: 4.7x).
  [carve-js#4426](https://github.com/markup-carve/carve-js/issues/4426).
- fmt on corpus content: carve-rs 163 ms at 32 KB, 6097 ms at 128 KB
  ([carve-rs#3879](https://github.com/markup-carve/carve-rs/issues/3879)); carve-js 7.2x per 4x, 10.6 s at 128 KB
  ([carve-js#4427](https://github.com/markup-carve/carve-js/issues/4427), not a regression: 0.1.15 was slower still).

Steps of 5x to 7.5x in carve-rs `table` and `deep` fell back to 4.5x to 5.1x
from 128 KB to 512 KB, so they read as cache effects, not algorithmic growth.

| Engine | Shape | Op | 2 KB | 8 KB | 32 KB | 128 KB | x per 4x (8→32, 32→128) |
|---|---|---|---:|---:|---:|---:|---|
| carve-js | corpus | render | 8.04 | 29 | 83 | 406 | 2.9, 4.9 |
| carve-js | corpus | ast | 7.22 | 27 | 82 | 419 | 3.0, 5.1 |
| carve-js | corpus | fmt | 28 | 290 | 1478 | 10597 | 5.1, 7.2 |
| carve-js | corpus | lint | 16 | 60 | 202 | 908 | 3.4, 4.5 |
| carve-js | deep | render | 7.76 | 21 | 67 | 260 | 3.1, 3.9 |
| carve-js | deep | ast | 7.18 | 20 | 67 | 226 | 3.4, 3.4 |
| carve-js | deep | fmt | 15 | 48 | 182 | 688 | 3.8, 3.8 |
| carve-js | deep | lint | 14 | 41 | 187 | 700 | 4.5, 3.8 |
| carve-js | table | render | 2.02 | 6.86 | 42 | 88 | 6.1, 2.1 |
| carve-js | table | ast | 1.82 | 7.23 | 28 | 96 | 3.9, 3.4 |
| carve-js | table | fmt | 5.99 | 18 | 56 | 236 | 3.1, 4.2 |
| carve-js | table | lint | 7.05 | 27 | 107 | 418 | 3.9, 3.9 |
| carve-js | comments | render | 1.56 | 3.74 | 12 | 41 | 3.1, 3.6 |
| carve-js | comments | ast | 1.20 | 3.96 | 9.27 | 39 | 2.3, 4.2 |
| carve-js | comments | fmt | 7.88 | 21 | 89 | 357 | 4.2, 4.0 |
| carve-js | comments | lint | 3.50 | 8.50 | 29 | 130 | 3.4, 4.5 |
| carve-js | para | render | 1.57 | 5.10 | 13 | 63 | 2.6, 4.8 |
| carve-js | para | ast | 1.53 | 6.05 | 16 | 67 | 2.6, 4.2 |
| carve-js | para | fmt | 5.76 | 19 | 75 | 344 | 4.0, 4.6 |
| carve-js | para | lint | 4.24 | 14 | 58 | 402 | 4.3, 6.9 |
| carve-js | colon | render | 3.79 | 9.22 | 29 | 108 | 3.2, 3.7 |
| carve-js | colon | ast | 3.43 | 8.66 | 27 | 96 | 3.1, 3.6 |
| carve-js | colon | fmt | 9.18 | 25 | 79 | 366 | 3.2, 4.6 |
| carve-js | colon | lint | 8.16 | 23 | 90 | 417 | 4.0, 4.6 |
| carve-php | corpus | render | 17 | 38 | 94 | 371 | 2.5, 3.9 |
| carve-php | corpus | ast | 16 | 39 | 95 | 417 | 2.4, 4.4 |
| carve-php | corpus | fmt | 33 | 433 | 981 | 4487 | 2.3, 4.6 |
| carve-php | corpus | lint | 212 | 859 | 1784 | 7614 | 2.1, 4.3 |
| carve-php | deep | render | 10 | 35 | 161 | 740 | 4.6, 4.6 |
| carve-php | deep | ast | 10 | 36 | 120 | 661 | 3.4, 5.5 |
| carve-php | deep | fmt | 24 | 93 | 372 | 1562 | 4.0, 4.2 |
| carve-php | deep | lint | 209 | 778 | 3469 | 15018 | 4.5, 4.3 |
| carve-php | table | render | 6.12 | 18 | 84 | 300 | 4.6, 3.6 |
| carve-php | table | ast | 3.91 | 12 | 51 | 159 | 4.4, 3.1 |
| carve-php | table | fmt | 13 | 48 | 216 | 750 | 4.5, 3.5 |
| carve-php | table | lint | 105 | 377 | 1802 | 7642 | 4.8, 4.2 |
| carve-php | comments | render | 2.44 | 6.26 | 24 | 115 | 3.8, 4.8 |
| carve-php | comments | ast | 2.09 | 5.40 | 22 | 107 | 4.0, 5.0 |
| carve-php | comments | fmt | 12 | 39 | 164 | 754 | 4.2, 4.6 |
| carve-php | comments | lint | 34 | 140 | 571 | 2516 | 4.1, 4.4 |
| carve-php | para | render | 2.93 | 8.99 | 40 | 177 | 4.4, 4.5 |
| carve-php | para | ast | 1.88 | 5.95 | 27 | 109 | 4.5, 4.1 |
| carve-php | para | fmt | 7.25 | 29 | 151 | 816 | 5.3, 5.4 |
| carve-php | para | lint | 64 | 271 | 1263 | 6516 | 4.7, 5.2 |
| carve-php | colon | render | 6.90 | 25 | 115 | 431 | 4.7, 3.7 |
| carve-php | colon | ast | 4.60 | 18 | 70 | 275 | 3.9, 3.9 |
| carve-php | colon | fmt | 19 | 70 | 321 | 1293 | 4.6, 4.0 |
| carve-php | colon | lint | 151 | 622 | 2419 | 9753 | 3.9, 4.0 |
| carve-rs | corpus | render | 0.46 | 6.41 | 19 | 80 | 2.9, 4.3 |
| carve-rs | corpus | ast | 0.39 | 7.52 | 18 | 72 | 2.4, 4.0 |
| carve-rs | corpus | fmt | 1.90 | 70 | 163 | 6097 | 2.3, 37.4 |
| carve-rs | corpus | lint | 4.26 | 13 | 44 | 177 | 3.4, 4.0 |
| carve-rs | deep | render | 0.12 | 0.44 | 2.07 | 11 | 4.7, 5.3 |
| carve-rs | deep | ast | 0.10 | 0.37 | 1.95 | 8.53 | 5.2, 4.4 |
| carve-rs | deep | fmt | 1.27 | 4.75 | 20 | 102 | 4.3, 5.0 |
| carve-rs | deep | lint | 3.64 | 5.91 | 15 | 62 | 2.5, 4.1 |
| carve-rs | table | render | 0.21 | 0.84 | 4.57 | 28 | 5.4, 6.1 |
| carve-rs | table | ast | 0.17 | 0.70 | 3.96 | 25 | 5.7, 6.4 |
| carve-rs | table | fmt | 0.74 | 2.84 | 13 | 73 | 4.7, 5.5 |
| carve-rs | table | lint | 3.51 | 4.74 | 14 | 57 | 2.9, 4.1 |
| carve-rs | comments | render | 0.11 | 0.47 | 2.55 | 13 | 5.4, 5.3 |
| carve-rs | comments | ast | 0.09 | 0.42 | 2.06 | 15 | 4.9, 7.5 |
| carve-rs | comments | fmt | 0.60 | 2.39 | 7.60 | 41 | 3.2, 5.4 |
| carve-rs | comments | lint | 3.36 | 3.96 | 6.79 | 27 | 1.7, 4.0 |
| carve-rs | para | render | 0.15 | 0.66 | 2.91 | 13 | 4.4, 4.6 |
| carve-rs | para | ast | 0.15 | 0.53 | 2.25 | 12 | 4.2, 5.5 |
| carve-rs | para | fmt | 0.46 | 1.93 | 7.87 | 37 | 4.1, 4.7 |
| carve-rs | para | lint | 3.32 | 4.40 | 11 | 39 | 2.6, 3.5 |
| carve-rs | colon | render | 0.25 | 1.06 | 4.64 | 22 | 4.4, 4.8 |
| carve-rs | colon | ast | 0.22 | 0.76 | 4.85 | 19 | 6.4, 4.0 |
| carve-rs | colon | fmt | 1.10 | 4.54 | 18 | 91 | 4.0, 5.0 |
| carve-rs | colon | lint | 3.78 | 5.70 | 17 | 66 | 3.1, 3.8 |

## Full corpus, main against the last published runs

Render only, `node run.mjs` with the three checkouts (Track B). The
2026-10-21 column is the main snapshot in `RESULTS.md`; the 2026-10-26 column
is [the release run](release-full-20261026.md). The full-run record is
[main-full-20261105.json](main-full-20261105.json).

| Engine | Doc | 2026-10-21 main ms/op | 2026-10-26 releases ms/op | 2026-11-05 main ms/op | MB/s now | vs 2026-10-21 | vs releases |
|---|---|---:|---:|---:|---:|---:|---:|
| carve-js | small | 2.1669 | 1.2976 | 1.7654 | 0.67 | -19% | +36% **slower** |
| carve-js | medium | 244.7 | 166.5 | 158.4 | 0.39 | -35% | -5% |
| carve-js | large | 1696.7 | 1220.2 | 1385.3 | 0.36 | -18% | +14% **slower** |
| carve-php | small | 2.9667 | 2.7689 | 2.8912 | 0.41 | -3% | +4% |
| carve-php | medium | 346.8 | 410.7 | 190.4 | 0.33 | -45% | -54% |
| carve-php | large | 2622.7 | 5341.1 | 1716.0 | 0.29 | -35% | -68% |
| carve-rs | small | 0.1366 | 0.1443 | 0.1730 | 6.80 | +27% **slower** | +20% **slower** |
| carve-rs | medium | 62.8 | 49.3 | 37.7 | 1.65 | -40% | -24% |
| carve-rs | large | 481.0 | 441.8 | 293.3 | 1.69 | -39% | -34% |

The large-document gap in carve-js against the release is the [carve#5012](https://github.com/markup-carve/carve/issues/5012) port
above. carve-rs on `small.crv` is the per-call creep above.

`RESULTS.md` and its charts still show the 2026-10-21 snapshot. Publishing a
new main snapshot there also needs new Rust and PHP core rechecks, the PHP
balanced-tier run and the engine-history rows at the new commits. The site
tests check that all of these name the same commits. This run did not repeat
them.

## Core comparison against peers

`COMPARISON.md` and `charts/comparison.svg` are refreshed from `compare.mjs`
against the three main checkouts ([raw samples](main-comparison-20261105.json)).
On the 48 KB core document, interleaved release against main runs are within
10% for all three engines (carve-js 3.60 against 3.87 ms, carve-php 3.11
against 3.07 ms, carve-rs 0.417 against 0.428 ms).
