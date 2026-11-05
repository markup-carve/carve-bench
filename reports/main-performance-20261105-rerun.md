# Release against merged main, re-run: 2026-11-05 afternoon

This re-runs the [morning check](main-performance-20261105.md) on main as of
12:40 to answer one question: after the fixes merged since 03:40, is main
still slower than the last releases anywhere? The fixes in between were
carve-rs#3868, #3879, #3881 and #3882, carve-js#4426, #4432 and #4448,
carve-php#4652, #4653 and #4655, and the
[carve#5193](https://github.com/markup-carve/carve/issues/5193) fixes in all
three engines.

## Conditions

- Same laptop and toolchain as the morning run: AMD Ryzen 9 PRO 7940HS,
  16 cores, Linux 7.0.0, desktop in use. Node.js 22.22.2, PHP 8.5.12 with
  tracing JIT, rustc 1.97.1.
- Measured 2026-11-05: core table 12:43 to 13:01 CET, large inputs 13:05 to
  13:20 CET. One-minute load: core table 4.58 at start and 10.20 at end;
  large inputs 8.00 and 8.79.
- Same harness, operations and iteration counts as the morning run. The
  release builds and the 03:40 main builds are the ones the morning run
  measured; only main now was built fresh.

| Engine | Release | Main 03:40 | Main now |
|---|---|---|---|
| carve-js | 0.1.15 `c62fad2a9` | `0c2538a54` | `7e5f74424` |
| carve-php | 0.1.16 `20d920713` | `fc0333242` | `fa96a92de` |
| carve-rs | 0.1.13 `5ec3c8ea7` | `5572046d6` | `08e77846e` |

- Method: each sample runs in its own process. Release, main 03:40 and main
  now rotate which goes first, 7 repetitions each. A change counts only when
  the release and main-now ranges do not overlap and the median moved more
  than 10%.
- Raw samples and the rotation script are in
  [main-performance-20261105-rerun.json](main-performance-20261105-rerun.json).

## Release against main

`small` is `corpus/small.crv` (1.2 KB), `medium` is `corpus/medium.crv` (64 KB).
Median (range) in ms. The release and re-run columns come from this session;
the "first report" column repeats the morning numbers for reference. This
session ran under more load, so its 03:40 numbers for small documents read
about 10% to 30% higher than the morning ones. Compare main now with the
columns from the same session.

| Engine | Doc | Op | Release ms | Main 03:40 ms (first report) | Main 03:40 ms (re-run) | Main now ms | Now vs release | Verdict |
|---|---|---|---:|---:|---:|---:|---:|---|
| carve-js | small | render | 1.81 (1.69-2.00) | 2.00 (1.89-2.34) | 2.55 (2.43-3.21) | 2.48 (2.43-2.83) | +37% | **slower** |
| carve-js | small | ast | 1.38 (1.21-1.71) | 1.67 (1.54-1.93) | 2.23 (2.16-3.13) | 2.34 (2.14-2.81) | +69% | **slower** |
| carve-js | small | fmt | 21.2 (20.1-24.1) | 8.58 (7.77-9.96) | 9.49 (8.98-9.91) | 9.18 (8.17-10.9) | -57% | faster |
| carve-js | small | lint | 3.64 (3.27-4.77) | 4.32 (3.91-4.79) | 5.73 (4.81-6.13) | 5.45 (5.00-6.90) | +50% | **slower** |
| carve-js | medium | render | 173 (146-213) | 192 (173-211) | 162 (152-167) | 98.9 (92.9-163) | -43% | noise (ranges overlap) |
| carve-js | medium | ast | 145 (131-158) | 186 (173-254) | 175 (157-198) | 106 (99.8-118) | -27% | faster |
| carve-js | medium | fmt | 24479 (23198-27589) | 4397 (3827-4678) | 4639 (4250-5980) | 2802 (2706-3486) | -89% | faster |
| carve-js | medium | lint | 353 (330-478) | 400 (396-445) | 393 (366-422) | 393 (353-493) | +11% | noise (ranges overlap) |
| carve-php | small | render | 3.02 (2.75-3.30) | 3.73 (3.02-4.79) | 3.60 (2.94-4.08) | 3.88 (3.33-4.33) | +28% | **slower** |
| carve-php | small | ast | 2.46 (2.26-2.66) | 2.54 (2.31-3.13) | 3.06 (2.62-3.36) | 3.16 (2.80-4.09) | +29% | **slower** |
| carve-php | small | fmt | 38.5 (34.9-51.0) | 11.3 (10.5-13.6) | 11.6 (9.64-21.7) | 12.1 (10.3-51.5) | -68% | noise (ranges overlap) |
| carve-php | small | lint | 48.4 (42.7-56.5) | 86.1 (80.7-94.8) | 86.9 (77.7-94.4) | 10.8 (9.93-12.2) | -78% | faster |
| carve-php | medium | render | 426 (394-487) | 232 (217-247) | 197 (179-253) | 195 (168-282) | -54% | faster |
| carve-php | medium | ast | 363 (334-405) | 208 (196-282) | 192 (174-212) | 179 (166-208) | -51% | faster |
| carve-php | medium | fmt | 4060 (3531-5256) | 2727 (1947-3520) | 2379 (2044-2988) | 2259 (1887-2509) | -44% | faster |
| carve-php | medium | lint | 6893 (5723-11307) | 4042 (3695-5346) | 3760 (3499-4368) | 446 (428-540) | -94% | faster |
| carve-rs | small | render | 0.14 (0.11-0.14) | 0.19 (0.18-0.21) | 0.18 (0.17-0.21) | 0.20 (0.18-0.21) | +45% | **slower** |
| carve-rs | small | ast | 0.12 (0.10-0.16) | 0.17 (0.16-0.19) | 0.17 (0.15-0.21) | 0.19 (0.17-0.20) | +52% | **slower** |
| carve-rs | small | fmt | 5.17 (4.56-5.93) | 1.07 (0.98-1.35) | 1.17 (1.05-1.45) | 1.16 (1.06-1.24) | -78% | faster |
| carve-rs | small | lint | 2.33 (1.99-2.80) | 3.72 (3.43-6.84) | 4.01 (3.44-4.35) | 0.62 (0.54-0.75) | -73% | faster |
| carve-rs | medium | render | 51.0 (47.1-52.0) | 38.6 (34.9-42.3) | 34.7 (33.4-47.6) | 35.7 (32.9-40.3) | -30% | faster |
| carve-rs | medium | ast | 55.1 (46.7-66.1) | 38.3 (34.1-42.9) | 36.3 (32.2-41.0) | 33.4 (32.5-49.4) | -39% | noise (ranges overlap) |
| carve-rs | medium | fmt | 1815 (1726-2126) | 2877 (2713-3219) | 2742 (2673-2825) | 1037 (959-1112) | -43% | faster |
| carve-rs | medium | lint | 127 (117-133) | 99.5 (87.7-111) | 89.2 (80.1-96.9) | 93.0 (84.0-103) | -27% | faster |

## Earlier regressions

| Regression in the morning report | Release | Main 03:40 | Main now | Status |
|---|---:|---:|---:|---|
| carve-rs fmt, `medium.crv` | 1815 | 2742 | 1037 | fixed, 43% faster than the release ([carve-rs#3879](https://github.com/markup-carve/carve-rs/issues/3879)) |
| carve-rs fmt, corpus 128 KB | 3643 | 6248 | 2378 | fixed, faster than the release |
| carve-rs lint, `small.crv` | 2.33 | 4.01 | 0.62 | fixed, 73% faster than the release ([carve-rs#3881](https://github.com/markup-carve/carve-rs/issues/3881)) |
| carve-php lint, `small.crv` | 48.4 | 86.9 | 10.8 | fixed, 78% faster than the release |
| carve-js render, `large.crv` (509 KB) | 1538 | 1651 | 1139 | fixed, 26% faster than the release (ranges overlap) |
| carve-js lint, one 512 KB line | 795 | 3597 | 1246 | improved, still 57% slower ([carve-js#4455](https://github.com/markup-carve/carve-js/issues/4455)) |
| carve-js render, ast, lint, `small.crv` | 1.81, 1.38, 3.64 | 2.55, 2.23, 5.73 | 2.48, 2.34, 5.45 | still slower, 37% to 69% ([carve-js#4454](https://github.com/markup-carve/carve-js/issues/4454)) |
| carve-rs render, ast, `small.crv` | 0.14, 0.12 | 0.18, 0.17 | 0.20, 0.19 | still slower, 45% and 52% ([carve-rs#3900](https://github.com/markup-carve/carve-rs/issues/3900)) |
| carve-rs parse, comments shape 128 KB | 2.6 | 11.7 | 12.1 | still slower, 4.6x ([carve#5184](https://github.com/markup-carve/carve/issues/5184)) |
| carve-rs parse, comments shape 512 KB | 12.4 | 134 | 131 | still slower, 10.6x, superlinear ([carve#5184](https://github.com/markup-carve/carve/issues/5184)) |
| carve-php render, `medium.crv` (cost of carve-php#4587) | 426 | 197 | 195 | still faster than the release; carve-php line of [carve#5184](https://github.com/markup-carve/carve/issues/5184) open |

One row is new: carve-php render and AST on `small.crv` were inside the noise
in the morning run (+33% and +27%, ranges overlapping). In this run the ranges
separate, at +28% and +29%, so they are filed as
[carve-php#4674](https://github.com/markup-carve/carve-php/issues/4674). The
render ranges touch (3.30 against 3.33 ms), so that verdict is close.

carve-js lint on the long line no longer grows superlinearly: 128 KB to
512 KB is 6.5x, against 6.0x for the release and 10.6x at 03:40. The rest is
a constant factor (+29% at 32 KB, +45% at 128 KB).

## Answer

Main is faster than at 03:40 wherever a fix landed, and faster than the
releases on most operations. Small-document render and AST in carve-php and
carve-rs read 3% to 10% slower than at 03:40, within overlapping ranges, so
they count as noise. fmt is faster than the releases in all three
engines, and every medium-document operation is faster or within noise. What
remains slower than the releases is a fixed per-call cost on small documents
in all three engines, carve-js lint on one very long line, and carve-rs parse
on comment-heavy input. Each has an open ticket.
