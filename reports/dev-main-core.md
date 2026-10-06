# Core throughput using Carve development main

Pinned to the October 6 audit merges. Later main changes affect documentation, tests and release tooling; runtime source and dependency manifests match those pins.

Measured 2026-10-06T21:11:38.970Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v22.22.2. Benchmark harness checkout: b4f8e1e130dbae0036c7b8d3a17f9320e93c1e63; cached remote main: b4f8e1e130dbae0036c7b8d3a17f9320e93c1e63; dirty tracked tree: true. Harness hashes are recorded in the JSON.

Carve js: [355d6de61406342d8aa989afed358f0d004ff586](https://github.com/markup-carve/carve-js/commit/355d6de61406342d8aa989afed358f0d004ff586).
Carve php: [45de896cea3d8944287f28ca155dea3afe04feec](https://github.com/markup-carve/carve-php/commit/45de896cea3d8944287f28ca155dea3afe04feec).
Carve rs: [5b7bea1ada2a507867d62278145fd7f9fd3f000d](https://github.com/markup-carve/carve-rs/commit/5b7bea1ada2a507867d62278145fd7f9fd3f000d).

Djot PHP: [77e5b6c83978b28b72f314fe52c0a200856ad3f9](https://github.com/php-collective/djot-php/commit/77e5b6c83978b28b72f314fe52c0a200856ad3f9), installed from the Composer lock.

Allowed CPUs: 6. Child processes inherit this affinity, including Node compiler and GC threads.

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 4.0743 | 14.66 |
| djot.js | JavaScript | 13.6050 | 4.40 |
| markdown-it | JavaScript | 12.9439 | 4.66 |
| carve-php | PHP | 3.8845 | 15.38 |
| djot-php | PHP | 3.2926 | 18.18 |
| league/commonmark-gfm | PHP | 46.5551 | 1.30 |
| carve-rs | Rust | 0.5165 | 115.65 |
| jotdown | Rust | 1.4182 | 42.22 |
| comrak | Rust | 1.5571 | 38.73 |
| pulldown-cmark | Rust | 0.5018 | 120.17 |

An initial core attempt ran under higher shared-host load and remains in local evidence. This snapshot uses the later complete rerun; samples and load are recorded in the linked JSON.

[Raw samples, output checks and source hashes](dev-main-core.json). The [compiled Rust dependency lock](dev-main-rust.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Use Node v22.22.2 for this snapshot.

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.
