# Core throughput using Carve development main

Measured 2026-10-04T13:11:12.617Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v22.22.2. Benchmark harness checkout: f02c4cac4c1214d2abad04b06331b10f961d19bc. Remote main at setup: 0a1a03d41941ed8a18a6f4c745b24ecd5876a5dc (CI-only difference).

Carve php: [03cb29aef26af2a933c8e70a90fe4f3c9a7fbf5d](https://github.com/markup-carve/carve-php/commit/03cb29aef26af2a933c8e70a90fe4f3c9a7fbf5d).
Carve js: [05778b2f76c650df71567ebb149938ce8612e9d2](https://github.com/markup-carve/carve-js/commit/05778b2f76c650df71567ebb149938ce8612e9d2).
Carve rs: [47dfe714ec0c90da12b300b87934e07688745041](https://github.com/markup-carve/carve-rs/commit/47dfe714ec0c90da12b300b87934e07688745041).

Djot PHP: [c77050223a2c257ba8a790ee501a5a87e3a377cf](https://github.com/php-collective/djot-php/commit/c77050223a2c257ba8a790ee501a5a87e3a377cf), installed from the Composer lock.

Allowed CPUs: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15. Child processes inherit this affinity, including Node compiler and GC threads.

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 4.0890 | 14.61 |
| djot.js | JavaScript | 10.6884 | 5.60 |
| markdown-it | JavaScript | 12.4138 | 4.86 |
| carve-php | PHP | 4.5245 | 13.20 |
| djot-php | PHP | 3.5168 | 17.03 |
| league/commonmark-gfm | PHP | 47.8072 | 1.26 |
| carve-rs | Rust | 0.5264 | 113.47 |
| jotdown | Rust | 1.4209 | 42.14 |
| comrak | Rust | 1.6814 | 35.86 |
| pulldown-cmark | Rust | 0.5303 | 113.72 |

[Raw samples, output checks and source hashes](dev-main-core.json). The [compiled Rust dependency lock](dev-main-rust.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Use Node v22.22.2 for this snapshot.

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.
