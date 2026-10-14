# JavaScript core comparison including commonmark.js

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads. Measured 2026-10-08T14:12:56.366Z, Node v22.22.2, AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics, 16 logical CPUs. Benchmark harness checkout: `668d8a1c5d70b0b9925fcba1e93c86ff8c64bc2e`; cached remote main: `668d8a1c5d70b0b9925fcba1e93c86ff8c64bc2e`; dirty tracked tree: true. Harness hashes are recorded in the JSON.

Carve JS merged main 0.1.11-dev at `e57653b22896118d3cd9e1457c9bdc36aec52d9c`; fast path verified. Released peers: Djot 0.3.2, markdown-it 15.0.0, commonmark.js 0.31.2.

This shared workload excludes pipe tables, which commonmark.js does not support. All four libraries receive 150 equivalent sections in native syntax. The 14 exercised points are the existing 18-point rubric without its three table-grid points and one alignment point. These measurements form a separate lane from [the comparison with pipe tables](dev-main-core.md); their throughput values must not be mixed.

Before timing, all engines agree under an HTML projection that ignores section wrappers, generated IDs, list paragraph wrappers and non-code whitespace formatting. It preserves element hierarchy, emphasis versus strong, resolved link destinations, code language and code bytes. This is scoped workload verification, not general language conformance.

## Final chart values

The charts and site show one final value per engine: throughput computed from median timing across all trial samples from both measurement rounds. The diagnostic round tables below show each round's fastest trial.

| Engine | Median ms/op | MB/s |
|---|---:|---:|
| carve-js | 2.6851 | 17.66 |
| djot.js | 10.4887 | 4.52 |
| markdown-it | 7.8428 | 6.12 |
| commonmark.js | 3.6637 | 13.10 |

![Final JavaScript throughput](../charts/commonmark-js-pre-pin-refresh-20261014.svg)

## Reused public conversion APIs

| Engine | Bytes | Round 1 fastest MB/s | Round 2 fastest MB/s |
|---|---:|---:|---:|
| carve-js | 49732 | 17.73 | 19.17 |
| djot.js | 49732 | 4.63 | 4.98 |
| markdown-it | 50332 | 6.35 | 6.78 |
| commonmark.js | 50332 | 13.45 | 13.55 |

## CommonMark constructor control

| API lifetime | Round 1 fastest ms/op | Round 2 fastest ms/op |
|---|---:|---:|
| Reuse parser and renderer | 3.5689 | 3.5431 |
| Construct both per call | 3.3677 | 3.3019 |

The lifetime control investigates the parser-construction concern in [djot.js #13](https://github.com/jgm/djot.js/issues/13). markdown-it also reuses its instance; Carve and Djot use their public conversion functions. These are default API costs, not equal object lifetimes. The table records both lifetimes; it does not isolate constructor cost from runtime optimization.

One-minute host load was 7.99 at start and 5.57 at end. Timings are observations on this host; the reversed rounds retain order variation. No universal speed ranking is established.

## Reproduce

Use Node v22.22.2 for this snapshot.

```sh
cd engines/js
npm ci
cd ../..
git clone https://github.com/markup-carve/carve-js.git /tmp/carve-js-main
git -C /tmp/carve-js-main checkout e57653b22896118d3cd9e1457c9bdc36aec52d9c
npm ci --prefix /tmp/carve-js-main
taskset -c 13 node scripts/compare-commonmark.mjs --carve-main /tmp/carve-js-main --carve-revision e57653b22896118d3cd9e1457c9bdc36aec52d9c
node scripts/gen-charts.mjs
```

The [previous released snapshot](commonmark-js-release-0.1.9.md) preserves Carve JS 0.1.9 measurements and samples.

The [raw record](commonmark-js-pre-pin-refresh-20261014.json) retains all trial samples, both rounds, source/output hashes, workload controls, exact package versions and harness hashes.
