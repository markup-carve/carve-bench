# JavaScript core comparison including commonmark.js

Measured 2026-10-02T15:23:36.952Z, Node v24.19.0, AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics, 16 logical CPUs. Benchmark main at setup: `15dfd8dababc7bd47297a06bf933bb09dfac199e`.

Carve JS merged main 0.1.10 at `e3b19ed3189da28ed467981a4fe04dc1760de822`; fast path verified. Released peers: Djot 0.3.2, markdown-it 15.0.0, commonmark.js 0.31.2.

This shared workload excludes pipe tables, which commonmark.js does not support. All four libraries receive 150 equivalent sections in native syntax. The 14 exercised points are the existing 18-point rubric without its three table-grid points and one alignment point. These measurements form a separate lane from [the comparison with pipe tables](../COMPARISON.md); their throughput values must not be mixed.

Before timing, all engines agree under an HTML projection that ignores section wrappers, generated IDs, list paragraph wrappers and non-code whitespace formatting. It preserves element hierarchy, emphasis versus strong, resolved link destinations, code language and code bytes. This is scoped workload verification, not general language conformance.

## Final chart values

The charts and site show one final value per engine: throughput computed from median timing across all trial samples from both measurement rounds. The diagnostic round tables below show each round's fastest trial.

| Engine | Median ms/op | MB/s |
|---|---:|---:|
| carve-js | 2.7563 | 17.21 |
| djot.js | 5.9481 | 7.97 |
| markdown-it | 5.5511 | 8.65 |
| commonmark.js | 2.5776 | 18.62 |

![Final JavaScript throughput](../charts/commonmark-js.svg)

## Reused public conversion APIs

| Engine | Bytes | Round 1 fastest MB/s | Round 2 fastest MB/s |
|---|---:|---:|---:|
| carve-js | 49732 | 18.00 | 17.66 |
| djot.js | 49732 | 8.40 | 8.22 |
| markdown-it | 50332 | 9.04 | 8.99 |
| commonmark.js | 50332 | 19.33 | 19.63 |

## CommonMark constructor control

| API lifetime | Round 1 fastest ms/op | Round 2 fastest ms/op |
|---|---:|---:|
| Reuse parser and renderer | 2.4834 | 2.4453 |
| Construct both per call | 2.4447 | 2.2620 |

The lifetime control investigates the parser-construction concern in [djot.js #13](https://github.com/jgm/djot.js/issues/13). markdown-it also reuses its instance; Carve and Djot use their public conversion functions. These are default API costs, not equal object lifetimes. Round variation makes the constructor-cost comparison inconclusive.

One-minute host load was 3.47 at start and 4.35 at end. Timings are observations on this host; the reversed rounds retain order variation. No universal speed ranking is established.

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
