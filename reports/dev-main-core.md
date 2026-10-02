# Core throughput using Carve development main

Measured 2026-10-02T15:21:28.020Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v24.19.0.

Carve js: [e3b19ed3189da28ed467981a4fe04dc1760de822](https://github.com/markup-carve/carve-js/commit/e3b19ed3189da28ed467981a4fe04dc1760de822).
Carve php: [ffadbccece109ceb3c049b22a1a46e67eaed6fc9](https://github.com/markup-carve/carve-php/commit/ffadbccece109ceb3c049b22a1a46e67eaed6fc9).
Carve rs: [0b4cd93ffe733d136b9396e041e902e14a3c7db1](https://github.com/markup-carve/carve-rs/commit/0b4cd93ffe733d136b9396e041e902e14a3c7db1).

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 4.6489 | 12.85 |
| djot.js | JavaScript | 10.4267 | 5.74 |
| markdown-it | JavaScript | 8.7718 | 6.87 |
| carve-php | PHP | 4.2000 | 14.22 |
| djot-php | PHP | 17.9556 | 3.33 |
| league/commonmark-gfm | PHP | 46.4120 | 1.30 |
| carve-rs | Rust | 0.6006 | 99.45 |
| jotdown | Rust | 1.3719 | 43.64 |
| comrak | Rust | 1.5278 | 39.47 |
| pulldown-cmark | Rust | 0.4858 | 124.12 |

[Raw samples, output checks and source hashes](dev-main-core.json). Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.
