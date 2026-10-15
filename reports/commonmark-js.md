# JavaScript core comparison including commonmark.js

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads. Measured 2026-10-15T11:43:38.586Z, Node v22.22.2, AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics, 16 logical CPUs. Benchmark harness checkout: `485ff55d6f89a5c26035ccb7dbdc2d26324ca9d5`; cached remote main: `485ff55d6f89a5c26035ccb7dbdc2d26324ca9d5`; dirty tracked tree: true. Harness hashes are recorded in the JSON.

Carve JS merged main 0.1.12 at `224b0c32e22480571c99aae3f0055a6e5a091f74`; fast path verified. Released peers: Djot 0.3.2, markdown-it 15.0.0, commonmark.js 0.31.2.

This shared workload excludes pipe tables, which commonmark.js does not support. All four libraries receive 150 equivalent sections in native syntax. The 14 exercised points are the existing 18-point rubric without its three table-grid points and one alignment point. These measurements form a separate lane from [the comparison with pipe tables](dev-main-core.md); their throughput values must not be mixed.

Before timing, all engines agree under an HTML projection that ignores section wrappers, generated IDs, list paragraph wrappers and non-code whitespace formatting. It preserves element hierarchy, emphasis versus strong, resolved link destinations, code language and code bytes. This is scoped workload verification, not general language conformance.

## Final chart values

The charts and site show one final value per engine: throughput computed from median timing across all trial samples from both measurement rounds. The diagnostic round tables below show each round's fastest trial.

| Engine | Median ms/op | MB/s |
|---|---:|---:|
| carve-js | 2.6967 | 17.59 |
| djot.js | 9.9339 | 4.77 |
| markdown-it | 8.0208 | 5.98 |
| commonmark.js | 4.2009 | 11.43 |

![Final JavaScript throughput](../charts/commonmark-js.svg)

## Reused public conversion APIs

| Engine | Bytes | Round 1 fastest MB/s | Round 2 fastest MB/s |
|---|---:|---:|---:|
| carve-js | 49732 | 17.02 | 19.76 |
| djot.js | 49732 | 4.57 | 5.72 |
| markdown-it | 50332 | 6.12 | 6.17 |
| commonmark.js | 50332 | 12.08 | 14.78 |

## CommonMark constructor control

| API lifetime | Round 1 fastest ms/op | Round 2 fastest ms/op |
|---|---:|---:|
| Reuse parser and renderer | 3.9733 | 3.2485 |
| Construct both per call | 3.2853 | 2.9926 |

The lifetime control investigates the parser-construction concern in [djot.js #13](https://github.com/jgm/djot.js/issues/13). markdown-it also reuses its instance; Carve and Djot use their public conversion functions. These are default API costs, not equal object lifetimes. The table records both lifetimes; it does not isolate constructor cost from runtime optimization.

One-minute host load was 18.02 at start and 9.10 at end. Timings are observations on this host; the reversed rounds retain order variation. No universal speed ranking is established.

## Reproduce

Use Node v22.22.2 for this snapshot.

```sh
cd engines/js
npm ci
cd ../..
git clone https://github.com/markup-carve/carve-js.git /tmp/carve-js-main
git -C /tmp/carve-js-main checkout 224b0c32e22480571c99aae3f0055a6e5a091f74
npm ci --prefix /tmp/carve-js-main
taskset -c 13 node scripts/compare-commonmark.mjs --carve-main /tmp/carve-js-main --carve-revision 224b0c32e22480571c99aae3f0055a6e5a091f74
node scripts/gen-charts.mjs
```

The [previous released snapshot](commonmark-js-release-0.1.9.md) preserves Carve JS 0.1.9 measurements and samples.

The [raw record](commonmark-js.json) retains all trial samples, both rounds, source/output hashes, workload controls, exact package versions and harness hashes.
