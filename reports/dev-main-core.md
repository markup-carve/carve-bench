# Core throughput using Carve development main

Measured 2026-10-15T22:33:18.478Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v22.22.2. Benchmark harness checkout: bc10d75f810abd48df926c34fd50460f144adbb6; cached remote main: 2c1c9d1e949af63f278dcd469e099d84d16d5105; dirty tracked tree: false. Harness hashes are recorded in the JSON.

Pinned merged-main snapshots are retained; later main commits are recorded as observations and are outside this measurement.

Carve js: [f0acfa305f9a888bfeb49b11c597b510a3ffa524](https://github.com/markup-carve/carve-js/commit/f0acfa305f9a888bfeb49b11c597b510a3ffa524).
Carve php: [3b3a09ff793fbc11b5c32bae6d74bee4d7676516](https://github.com/markup-carve/carve-php/commit/3b3a09ff793fbc11b5c32bae6d74bee4d7676516).
Carve rs: [08d65a58329ace4b388729e6981bbc76cc154136](https://github.com/markup-carve/carve-rs/commit/08d65a58329ace4b388729e6981bbc76cc154136).

Djot PHP: [77e5b6c83978b28b72f314fe52c0a200856ad3f9](https://github.com/php-collective/djot-php/commit/77e5b6c83978b28b72f314fe52c0a200856ad3f9), installed from the Composer lock.

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads.

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 4.9340 | 12.11 |
| djot.js | JavaScript | 19.6224 | 3.05 |
| markdown-it | JavaScript | 16.7687 | 3.60 |
| carve-php | PHP | 4.5568 | 13.11 |
| djot-php | PHP | 3.8906 | 15.39 |
| league/commonmark-gfm | PHP | 55.0455 | 1.10 |
| carve-rs | Rust | 0.5177 | 115.37 |
| jotdown | Rust | 1.6810 | 35.62 |
| comrak | Rust | 1.8180 | 33.17 |
| pulldown-cmark | Rust | 0.5823 | 103.56 |

[Raw samples, output checks and source hashes](dev-main-core.json). The [compiled Rust dependency lock](dev-main-rust.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Use Node v22.22.2 for this snapshot.

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.
