# Core throughput using Carve development main

Measured 2026-10-08T14:09:23.438Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v22.22.2. Benchmark harness checkout: 668d8a1c5d70b0b9925fcba1e93c86ff8c64bc2e; cached remote main: 668d8a1c5d70b0b9925fcba1e93c86ff8c64bc2e; dirty tracked tree: true. Harness hashes are recorded in the JSON.

Carve js: [e57653b22896118d3cd9e1457c9bdc36aec52d9c](https://github.com/markup-carve/carve-js/commit/e57653b22896118d3cd9e1457c9bdc36aec52d9c).
Carve php: [19745164a182951f90a58620722e8e8f3418fd10](https://github.com/markup-carve/carve-php/commit/19745164a182951f90a58620722e8e8f3418fd10).
Carve rs: [2a183262f866d0dca2ae515d8b655d21e01ade90](https://github.com/markup-carve/carve-rs/commit/2a183262f866d0dca2ae515d8b655d21e01ade90).

Djot PHP: [77e5b6c83978b28b72f314fe52c0a200856ad3f9](https://github.com/php-collective/djot-php/commit/77e5b6c83978b28b72f314fe52c0a200856ad3f9), installed from the Composer lock.

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads.

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 4.9268 | 12.12 |
| djot.js | JavaScript | 17.8586 | 3.35 |
| markdown-it | JavaScript | 15.3261 | 3.93 |
| carve-php | PHP | 4.0828 | 14.63 |
| djot-php | PHP | 4.5280 | 13.22 |
| league/commonmark-gfm | PHP | 62.3746 | 0.97 |
| carve-rs | Rust | 0.4897 | 121.97 |
| jotdown | Rust | 1.4663 | 40.83 |
| comrak | Rust | 1.6242 | 37.13 |
| pulldown-cmark | Rust | 0.5156 | 116.96 |

[Raw samples, output checks and source hashes](dev-main-core.json). The [compiled Rust dependency lock](dev-main-rust.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Use Node v22.22.2 for this snapshot.

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.
