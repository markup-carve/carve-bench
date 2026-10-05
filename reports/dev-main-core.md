# Core throughput using Carve development main

Measured 2026-10-05T18:05:43.267Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v22.22.2. Benchmark harness checkout: ed2d02d031d1427f428a632568b9e9f4637ce1e8; cached remote main: ed2d02d031d1427f428a632568b9e9f4637ce1e8; dirty tracked tree: true. Harness hashes are recorded in the JSON.

Carve js: [a7c80d37fb322d28bc5061175bbd9c7f7638c175](https://github.com/markup-carve/carve-js/commit/a7c80d37fb322d28bc5061175bbd9c7f7638c175).
Carve php: [49c235d768ea6faec074d4b561ed3783d99b6fbd](https://github.com/markup-carve/carve-php/commit/49c235d768ea6faec074d4b561ed3783d99b6fbd).
Carve rs: [8ee78ecb83d82ed81c544c17483e0eb111398f9d](https://github.com/markup-carve/carve-rs/commit/8ee78ecb83d82ed81c544c17483e0eb111398f9d).

Djot PHP: [77e5b6c83978b28b72f314fe52c0a200856ad3f9](https://github.com/php-collective/djot-php/commit/77e5b6c83978b28b72f314fe52c0a200856ad3f9), installed from the Composer lock.

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads.

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 3.5303 | 16.92 |
| djot.js | JavaScript | 11.6733 | 5.13 |
| markdown-it | JavaScript | 11.4126 | 5.28 |
| carve-php | PHP | 3.4428 | 17.35 |
| djot-php | PHP | 3.0366 | 19.72 |
| league/commonmark-gfm | PHP | 37.4694 | 1.61 |
| carve-rs | Rust | 0.4921 | 121.38 |
| jotdown | Rust | 1.2942 | 46.26 |
| comrak | Rust | 1.4023 | 43.00 |
| pulldown-cmark | Rust | 0.4573 | 131.87 |

[Raw samples, output checks and source hashes](dev-main-core.json). The [compiled Rust dependency lock](dev-main-rust.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Use Node v22.22.2 for this snapshot.

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.
