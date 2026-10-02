# Core throughput using Carve development main

Measured 2026-10-02T15:09:52.687Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v24.19.0.

Carve js: [e3b19ed3189da28ed467981a4fe04dc1760de822](https://github.com/markup-carve/carve-js/commit/e3b19ed3189da28ed467981a4fe04dc1760de822).
Carve php: [ffadbccece109ceb3c049b22a1a46e67eaed6fc9](https://github.com/markup-carve/carve-php/commit/ffadbccece109ceb3c049b22a1a46e67eaed6fc9).
Carve rs: [0b4cd93ffe733d136b9396e041e902e14a3c7db1](https://github.com/markup-carve/carve-rs/commit/0b4cd93ffe733d136b9396e041e902e14a3c7db1).

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 4.7286 | 12.63 |
| djot.js | JavaScript | 10.6018 | 5.65 |
| markdown-it | JavaScript | 9.7787 | 6.17 |
| carve-php | PHP | 4.2316 | 14.12 |
| djot-php | PHP | 16.4398 | 3.64 |
| league/commonmark-gfm | PHP | 46.8206 | 1.29 |
| carve-rs | Rust | 0.6276 | 95.17 |
| jotdown | Rust | 1.4055 | 42.60 |
| comrak | Rust | 1.5952 | 37.80 |
| pulldown-cmark | Rust | 0.4957 | 121.65 |

[Raw samples, output checks and source hashes](dev-main-core.json). Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`.
