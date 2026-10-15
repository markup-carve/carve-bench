# Core throughput using Carve development main

Measured 2026-10-14T09:24:06.322Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v22.22.2. Benchmark harness checkout: fad0676e00c91c6224bc1b792297ecdeb12a8a84; cached remote main: 3cd57d814cc5752af6ec2af7e31a82e45fc99add; dirty tracked tree: true. Harness hashes are recorded in the JSON.

Carve js: [43c888310a8b1f96b77e0a79672e96d6cfbe1b86](https://github.com/markup-carve/carve-js/commit/43c888310a8b1f96b77e0a79672e96d6cfbe1b86).
Carve php: [cb3dec89cba4bfeb7ea15861c952073ec4825567](https://github.com/markup-carve/carve-php/commit/cb3dec89cba4bfeb7ea15861c952073ec4825567).
Carve rs: [61b673ce9d8c5628f4d4e3882d1fcb19f6002b2d](https://github.com/markup-carve/carve-rs/commit/61b673ce9d8c5628f4d4e3882d1fcb19f6002b2d).

Djot PHP: [77e5b6c83978b28b72f314fe52c0a200856ad3f9](https://github.com/php-collective/djot-php/commit/77e5b6c83978b28b72f314fe52c0a200856ad3f9), installed from the Composer lock.

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads.

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 4.6555 | 12.83 |
| djot.js | JavaScript | 13.6500 | 4.39 |
| markdown-it | JavaScript | 13.8950 | 4.34 |
| carve-php | PHP | 4.2100 | 14.19 |
| djot-php | PHP | 3.5275 | 16.97 |
| league/commonmark-gfm | PHP | 48.3046 | 1.25 |
| carve-rs | Rust | 0.5042 | 118.47 |
| jotdown | Rust | 1.5748 | 38.02 |
| comrak | Rust | 1.6618 | 36.29 |
| pulldown-cmark | Rust | 0.5335 | 113.03 |

[Raw samples, output checks and source hashes](dev-main-core.json). The [compiled Rust dependency lock](dev-main-rust.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](COMPARISON.md).

## Reproduce

Use Node v22.22.2 for this snapshot.

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.
