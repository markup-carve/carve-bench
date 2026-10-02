# JavaScript core comparison including commonmark.js

Measured 2026-10-02T15:11:57.370Z, Node v24.19.0, AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics, 16 logical CPUs. Benchmark main at setup: `811e73f4612eacacfb5b5449104130d28b1091c8`.

Carve JS merged main 0.1.10 at `e3b19ed3189da28ed467981a4fe04dc1760de822`; fast path verified. Released peers: Djot 0.3.2, markdown-it 15.0.0, commonmark.js 0.31.2.

This shared workload excludes pipe tables, which commonmark.js does not support. All four libraries receive 150 equivalent sections in native syntax. The 14 exercised points are the existing 18-point rubric without its three table-grid points and one alignment point. These measurements form a separate lane from [the comparison with pipe tables](../COMPARISON.md); their throughput values must not be mixed.

Before timing, all engines agree under an HTML projection that ignores section wrappers, generated IDs, list paragraph wrappers and non-code whitespace formatting. It preserves element hierarchy, emphasis versus strong, resolved link destinations, code language and code bytes. This is scoped workload verification, not general language conformance.

## Final chart values

The charts and site show one final value per engine: throughput computed from median timing across all trial samples from both measurement rounds. The diagnostic round tables below show each round's fastest trial.

| Engine | Median ms/op | MB/s |
|---|---:|---:|
| carve-js | 3.2053 | 14.80 |
| djot.js | 6.5232 | 7.27 |
| markdown-it | 5.9148 | 8.12 |
| commonmark.js | 2.7153 | 17.68 |

![Final JavaScript throughput](../charts/commonmark-js.svg)

## Reused public conversion APIs

| Engine | Bytes | Round 1 fastest MB/s | Round 2 fastest MB/s |
|---|---:|---:|---:|
| carve-js | 49732 | 15.33 | 15.02 |
| djot.js | 49732 | 7.85 | 7.15 |
| markdown-it | 50332 | 8.24 | 8.23 |
| commonmark.js | 50332 | 18.10 | 18.06 |

## CommonMark constructor control

| API lifetime | Round 1 fastest ms/op | Round 2 fastest ms/op |
|---|---:|---:|
| Reuse parser and renderer | 2.6527 | 2.6580 |
| Construct both per call | 2.5068 | 2.4754 |

The lifetime control investigates the parser-construction concern in [djot.js #13](https://github.com/jgm/djot.js/issues/13). markdown-it also reuses its instance; Carve and Djot use their public conversion functions. These are default API costs, not equal object lifetimes. Round variation makes the constructor-cost comparison inconclusive.

One-minute host load was 4.52 at start and 6.63 at end. Timings are observations on this host; the reversed rounds retain order variation. No universal speed ranking is established.

## Reproduce

```sh
cd engines/js
npm ci
cd ../..
git clone https://github.com/markup-carve/carve-js.git /tmp/carve-js-main
git -C /tmp/carve-js-main checkout e3b19ed3189da28ed467981a4fe04dc1760de822
npm ci --prefix /tmp/carve-js-main
node scripts/compare-commonmark.mjs --carve-main /tmp/carve-js-main --carve-revision e3b19ed3189da28ed467981a4fe04dc1760de822
node scripts/gen-charts.mjs
```

The [previous released snapshot](commonmark-js-release-0.1.9.md) preserves Carve JS 0.1.9 measurements and samples.

The [raw record](commonmark-js.json) retains all trial samples, both rounds, source/output hashes, workload controls, exact package versions and harness hashes.
