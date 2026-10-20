# Core throughput using Carve development main

Measured 2026-10-20T12:05:36.033Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v22.22.2. Benchmark harness checkout: 25a4c19a9bd9ffe7eef232c34a26d534b5de8da7; cached remote main: 25a4c19a9bd9ffe7eef232c34a26d534b5de8da7; dirty tracked tree: true. Harness hashes are recorded in the JSON.

Carve js: [ccbbdcc983b01ffb9a53e4293bd63d0540325643](https://github.com/markup-carve/carve-js/commit/ccbbdcc983b01ffb9a53e4293bd63d0540325643).
Carve php: [8752b183da661c5fec5296657b56ddb7025a0f4c](https://github.com/markup-carve/carve-php/commit/8752b183da661c5fec5296657b56ddb7025a0f4c).
Carve rs: [f95434c91c0faca54fb221281b82e999ecb7cf3c](https://github.com/markup-carve/carve-rs/commit/f95434c91c0faca54fb221281b82e999ecb7cf3c).

Djot PHP: [77e5b6c83978b28b72f314fe52c0a200856ad3f9](https://github.com/php-collective/djot-php/commit/77e5b6c83978b28b72f314fe52c0a200856ad3f9), installed from the Composer lock.

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads.

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 5.0312 | 11.87 |
| djot.js | JavaScript | 14.7685 | 4.05 |
| markdown-it | JavaScript | 12.9064 | 4.67 |
| carve-php | PHP | 4.2476 | 14.06 |
| djot-php | PHP | 3.4423 | 17.39 |
| league/commonmark-gfm | PHP | 50.6523 | 1.19 |
| carve-rs | Rust | 0.4559 | 131.02 |
| jotdown | Rust | 1.4181 | 42.22 |
| comrak | Rust | 1.6122 | 37.40 |
| pulldown-cmark | Rust | 0.4832 | 124.79 |

[Raw samples, output checks and source hashes](dev-main-core.json). The [compiled Rust dependency lock](dev-main-rust.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Use Node v22.22.2 for this snapshot.

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.
