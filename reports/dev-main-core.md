# Core throughput using Carve development main

Measured 2026-10-02T15:37:22.352Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v24.19.0.

Carve js: [475f96b3058c3f08d98a429ea698e3e5708c882c](https://github.com/markup-carve/carve-js/commit/475f96b3058c3f08d98a429ea698e3e5708c882c).
Carve php: [6c0fb9c646d323a1906c81236985a73a63c2f875](https://github.com/markup-carve/carve-php/commit/6c0fb9c646d323a1906c81236985a73a63c2f875).
Carve rs: [84f603430ba083530062a0fc880e086ad0ea29be](https://github.com/markup-carve/carve-rs/commit/84f603430ba083530062a0fc880e086ad0ea29be).

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 5.0713 | 11.78 |
| djot.js | JavaScript | 10.2304 | 5.85 |
| markdown-it | JavaScript | 8.7275 | 6.91 |
| carve-php | PHP | 4.1121 | 14.53 |
| djot-php | PHP | 19.2360 | 3.11 |
| league/commonmark-gfm | PHP | 43.5934 | 1.38 |
| carve-rs | Rust | 0.6286 | 95.02 |
| jotdown | Rust | 1.3308 | 44.99 |
| comrak | Rust | 1.4488 | 41.62 |
| pulldown-cmark | Rust | 0.4745 | 127.08 |

[Raw samples, output checks and source hashes](dev-main-core.json). The [compiled Rust dependency lock](dev-main-rust.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.
