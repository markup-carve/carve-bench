# Core throughput using Carve development main

Measured 2026-10-04T03:05:36.546Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v22.22.2. Benchmark main at setup: 57b60fcc7df67087c66a4f76e8b1acf6397dcfa3.

Carve php: [363f0d3e26093857325255bef3497661c6ba5324](https://github.com/markup-carve/carve-php/commit/363f0d3e26093857325255bef3497661c6ba5324).
Carve js: [604c2223de4a2bfe6133adcc8cce9ac5a8ba0391](https://github.com/markup-carve/carve-js/commit/604c2223de4a2bfe6133adcc8cce9ac5a8ba0391).
Carve rs: [bfe862698546268486f5cc19451a622801a176e8](https://github.com/markup-carve/carve-rs/commit/bfe862698546268486f5cc19451a622801a176e8).

Djot PHP: [c77050223a2c257ba8a790ee501a5a87e3a377cf](https://github.com/php-collective/djot-php/commit/c77050223a2c257ba8a790ee501a5a87e3a377cf), installed from the Composer lock.

Allowed CPUs: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15. Child processes inherit this affinity, including Node compiler and GC threads.

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 3.5792 | 16.69 |
| djot.js | JavaScript | 9.3415 | 6.41 |
| markdown-it | JavaScript | 9.9288 | 6.07 |
| carve-php | PHP | 3.4609 | 17.26 |
| djot-php | PHP | 3.0560 | 19.59 |
| league/commonmark-gfm | PHP | 38.9147 | 1.55 |
| carve-rs | Rust | 0.4914 | 121.55 |
| jotdown | Rust | 1.3264 | 45.14 |
| comrak | Rust | 1.3961 | 43.19 |
| pulldown-cmark | Rust | 0.4715 | 127.89 |

[Raw samples, output checks and source hashes](dev-main-core.json). The [compiled Rust dependency lock](dev-main-rust.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Use Node v22.22.2 for this snapshot.

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.
