# JavaScript core comparison including commonmark.js

Allowed CPUs: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15. Child processes inherit this affinity, including Node compiler and GC threads. Measured 2026-10-04T16:39:53.593Z, Node v22.22.2, AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics, 16 logical CPUs. Benchmark harness checkout: `0dcf34e96a3c25b37a451d99ec8ffdcafc6e4a78`; cached remote main: `442633c4ba9d32d7b8b0e9469b7e04a8353e66db`; dirty tracked tree: true. Harness hashes are recorded in the JSON.

Carve JS merged main 0.1.10 at `a0e996083129b9d51e63be6982d79843fd35ea32`; fast path verified. Released peers: Djot 0.3.2, markdown-it 15.0.0, commonmark.js 0.31.2.

This shared workload excludes pipe tables, which commonmark.js does not support. All four libraries receive 150 equivalent sections in native syntax. The 14 exercised points are the existing 18-point rubric without its three table-grid points and one alignment point. These measurements form a separate lane from [the comparison with pipe tables](../COMPARISON.md); their throughput values must not be mixed.

Before timing, all engines agree under an HTML projection that ignores section wrappers, generated IDs, list paragraph wrappers and non-code whitespace formatting. It preserves element hierarchy, emphasis versus strong, resolved link destinations, code language and code bytes. This is scoped workload verification, not general language conformance.

## Final chart values

The charts and site show one final value per engine: throughput computed from median timing across all trial samples from both measurement rounds. The diagnostic round tables below show each round's fastest trial.

| Engine | Median ms/op | MB/s |
|---|---:|---:|
| carve-js | 2.2163 | 21.40 |
| djot.js | 6.0608 | 7.83 |
| markdown-it | 5.9486 | 8.07 |
| commonmark.js | 2.8795 | 16.67 |

![Final JavaScript throughput](../charts/commonmark-js.svg)

## Reused public conversion APIs

| Engine | Bytes | Round 1 fastest MB/s | Round 2 fastest MB/s |
|---|---:|---:|---:|
| carve-js | 49732 | 21.91 | 21.83 |
| djot.js | 49732 | 7.88 | 8.15 |
| markdown-it | 50332 | 7.84 | 8.43 |
| commonmark.js | 50332 | 17.10 | 16.80 |

## CommonMark constructor control

| API lifetime | Round 1 fastest ms/op | Round 2 fastest ms/op |
|---|---:|---:|
| Reuse parser and renderer | 2.8077 | 2.8574 |
| Construct both per call | 2.5601 | 2.6020 |

The lifetime control investigates the parser-construction concern in [djot.js #13](https://github.com/jgm/djot.js/issues/13). markdown-it also reuses its instance; Carve and Djot use their public conversion functions. These are default API costs, not equal object lifetimes. The table records both lifetimes; it does not isolate constructor cost from runtime optimization.

One-minute host load was 1.47 at start and 1.55 at end. Timings are observations on this host; the reversed rounds retain order variation. No universal speed ranking is established.

## Reproduce

Use Node v22.22.2 for this snapshot.

```sh
cd engines/js
npm ci
cd ../..
git clone https://github.com/markup-carve/carve-js.git /tmp/carve-js-main
git -C /tmp/carve-js-main checkout a0e996083129b9d51e63be6982d79843fd35ea32
npm ci --prefix /tmp/carve-js-main
node scripts/compare-commonmark.mjs --carve-main /tmp/carve-js-main --carve-revision a0e996083129b9d51e63be6982d79843fd35ea32
node scripts/gen-charts.mjs
```

The [previous released snapshot](commonmark-js-release-0.1.9.md) preserves Carve JS 0.1.9 measurements and samples.

The [raw record](commonmark-js.json) retains all trial samples, both rounds, source/output hashes, workload controls, exact package versions and harness hashes.
