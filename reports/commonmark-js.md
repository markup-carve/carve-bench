# JavaScript core comparison including commonmark.js

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads. Measured 2026-10-14T09:26:26.460Z, Node v22.22.2, AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics, 16 logical CPUs. Benchmark harness checkout: `fad0676e00c91c6224bc1b792297ecdeb12a8a84`; cached remote main: `3cd57d814cc5752af6ec2af7e31a82e45fc99add`; dirty tracked tree: true. Harness hashes are recorded in the JSON.

Carve JS merged main 0.1.11 at `43c888310a8b1f96b77e0a79672e96d6cfbe1b86`; fast path verified. Released peers: Djot 0.3.2, markdown-it 15.0.0, commonmark.js 0.31.2.

This shared workload excludes pipe tables, which commonmark.js does not support. All four libraries receive 150 equivalent sections in native syntax. The 14 exercised points are the existing 18-point rubric without its three table-grid points and one alignment point. These measurements form a separate lane from [the comparison with pipe tables](dev-main-core.md); their throughput values must not be mixed.

Before timing, all engines agree under an HTML projection that ignores section wrappers, generated IDs, list paragraph wrappers and non-code whitespace formatting. It preserves element hierarchy, emphasis versus strong, resolved link destinations, code language and code bytes. This is scoped workload verification, not general language conformance.

## Final chart values

The charts and site show one final value per engine: throughput computed from median timing across all trial samples from both measurement rounds. The diagnostic round tables below show each round's fastest trial.

| Engine | Median ms/op | MB/s |
|---|---:|---:|
| carve-js | 2.6709 | 17.76 |
| djot.js | 9.0726 | 5.23 |
| markdown-it | 8.5384 | 5.62 |
| commonmark.js | 3.6761 | 13.06 |

![Final JavaScript throughput](../charts/commonmark-js.svg)

## Reused public conversion APIs

| Engine | Bytes | Round 1 fastest MB/s | Round 2 fastest MB/s |
|---|---:|---:|---:|
| carve-js | 49732 | 17.77 | 18.93 |
| djot.js | 49732 | 5.16 | 5.93 |
| markdown-it | 50332 | 5.77 | 5.81 |
| commonmark.js | 50332 | 13.70 | 13.87 |

## CommonMark constructor control

| API lifetime | Round 1 fastest ms/op | Round 2 fastest ms/op |
|---|---:|---:|
| Reuse parser and renderer | 3.5025 | 3.4596 |
| Construct both per call | 3.0138 | 3.1436 |

The lifetime control investigates the parser-construction concern in [djot.js #13](https://github.com/jgm/djot.js/issues/13). markdown-it also reuses its instance; Carve and Djot use their public conversion functions. These are default API costs, not equal object lifetimes. The table records both lifetimes; it does not isolate constructor cost from runtime optimization.

One-minute host load was 6.21 at start and 7.01 at end. Timings are observations on this host; the reversed rounds retain order variation. No universal speed ranking is established.

## Reproduce

Use Node v22.22.2 for this snapshot.

```sh
cd engines/js
npm ci
cd ../..
git clone https://github.com/markup-carve/carve-js.git /tmp/carve-js-main
git -C /tmp/carve-js-main checkout 43c888310a8b1f96b77e0a79672e96d6cfbe1b86
npm ci --prefix /tmp/carve-js-main
taskset -c 13 node scripts/compare-commonmark.mjs --carve-main /tmp/carve-js-main --carve-revision 43c888310a8b1f96b77e0a79672e96d6cfbe1b86
node scripts/gen-charts.mjs
```

The [previous released snapshot](commonmark-js-release-0.1.9.md) preserves Carve JS 0.1.9 measurements and samples.

The [raw record](commonmark-js.json) retains all trial samples, both rounds, source/output hashes, workload controls, exact package versions and harness hashes.
