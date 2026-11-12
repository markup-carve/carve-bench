# JavaScript core comparison including commonmark.js

Allowed CPUs: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15. Child processes inherit this affinity, including Node compiler and GC threads. Measured 2026-10-26T13:56:36.734Z, Node v22.22.2, AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics, 16 logical CPUs. Benchmark harness checkout: `a7a9e0515c356005e26fcfa1c8a576afbc2488c2`; cached remote main: `a7a9e0515c356005e26fcfa1c8a576afbc2488c2`; dirty tracked tree: true. Harness hashes are recorded in the JSON.

Released packages: Carve JS 0.1.15, Djot 0.3.2, markdown-it 15.0.0, commonmark.js 0.31.2.

This shared workload excludes pipe tables, which commonmark.js does not support. All four libraries receive 150 equivalent sections in native syntax. The 14 exercised points are the existing 18-point rubric without its three table-grid points and one alignment point. These measurements form a separate lane from [the comparison with pipe tables](../COMPARISON.md); their throughput values must not be mixed.

Before timing, all engines agree under an HTML projection that ignores section wrappers, generated IDs, list paragraph wrappers and non-code whitespace formatting. It preserves element hierarchy, emphasis versus strong, resolved link destinations, code language and code bytes. This is scoped workload verification, not general language conformance.

## Final chart values

The charts and site show one final value per engine: throughput computed from median timing across all trial samples from both measurement rounds. The diagnostic round tables below show each round's fastest trial.

| Engine | Median ms/op | MB/s |
|---|---:|---:|
| carve-js | 3.1916 | 14.86 |
| djot.js | 14.9115 | 3.18 |
| markdown-it | 9.6608 | 4.97 |
| commonmark.js | 4.4889 | 10.69 |

![Final JavaScript throughput](../charts/commonmark-js.svg)

## Reused public conversion APIs

| Engine | Bytes | Round 1 fastest MB/s | Round 2 fastest MB/s |
|---|---:|---:|---:|
| carve-js | 49732 | 14.39 | 19.00 |
| djot.js | 49732 | 3.97 | 5.85 |
| markdown-it | 50332 | 5.79 | 6.04 |
| commonmark.js | 50332 | 11.62 | 13.94 |

## CommonMark constructor control

| API lifetime | Round 1 fastest ms/op | Round 2 fastest ms/op |
|---|---:|---:|
| Reuse parser and renderer | 4.1321 | 3.4444 |
| Construct both per call | 3.4929 | 3.8935 |

The lifetime control investigates the parser-construction concern in [djot.js #13](https://github.com/jgm/djot.js/issues/13). markdown-it also reuses its instance; Carve and Djot use their public conversion functions. These are default API costs, not equal object lifetimes. The table records both lifetimes; it does not isolate constructor cost from runtime optimization.

One-minute host load was 11.40 at start and 12.39 at end. Timings are observations on this host; the reversed rounds retain order variation. No universal speed ranking is established.

## Reproduce

Use Node v22.22.2 for this snapshot.

```sh
cd engines/js
npm ci
cd ../..



node scripts/compare-commonmark.mjs
node scripts/gen-charts.mjs
```



The [raw record](commonmark-js.json) retains all trial samples, both rounds, source/output hashes, workload controls, exact package versions and harness hashes.
