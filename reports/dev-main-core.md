# Core throughput using Carve development main

Measured 2026-10-04T16:33:07.040Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v22.22.2. Benchmark harness checkout: 0dcf34e96a3c25b37a451d99ec8ffdcafc6e4a78; cached remote main: 442633c4ba9d32d7b8b0e9469b7e04a8353e66db; dirty tracked tree: false. Harness hashes are recorded in the JSON.

Carve js: [a0e996083129b9d51e63be6982d79843fd35ea32](https://github.com/markup-carve/carve-js/commit/a0e996083129b9d51e63be6982d79843fd35ea32).
Carve php: [41c9fe6026e91ee0396dc98ee65be64b6080d3b3](https://github.com/markup-carve/carve-php/commit/41c9fe6026e91ee0396dc98ee65be64b6080d3b3).
Carve rs: [914704f80c08bc3b52703c9bc06dc3ff89ded7f4](https://github.com/markup-carve/carve-rs/commit/914704f80c08bc3b52703c9bc06dc3ff89ded7f4).

Djot PHP: [c8416eec035b97b56f25df64e941b637830a8187](https://github.com/php-collective/djot-php/commit/c8416eec035b97b56f25df64e941b637830a8187), installed from the Composer lock.

Allowed CPUs: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15. Child processes inherit this affinity, including Node compiler and GC threads.

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 3.6100 | 16.55 |
| djot.js | JavaScript | 9.1706 | 6.53 |
| markdown-it | JavaScript | 9.9005 | 6.09 |
| carve-php | PHP | 3.4803 | 17.16 |
| djot-php | PHP | 3.0378 | 19.71 |
| league/commonmark-gfm | PHP | 38.0302 | 1.59 |
| carve-rs | Rust | 0.4746 | 125.84 |
| jotdown | Rust | 1.3699 | 43.71 |
| comrak | Rust | 1.4139 | 42.65 |
| pulldown-cmark | Rust | 0.4635 | 130.10 |

[Raw samples, output checks and source hashes](dev-main-core.json). The [compiled Rust dependency lock](dev-main-rust.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Use Node v22.22.2 for this snapshot.

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.
