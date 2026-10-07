# Core throughput using Carve development main

PHP is pinned to merged commit 40653c424; the newer main at setup changes only CHANGELOG.md. Runtime sources and dependency manifests are identical.

Measured 2026-10-07T10:45:20.158Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v22.22.2. Benchmark harness checkout: 37db57fe9693193149d42dd07faf231770138af4; cached remote main: b4f8e1e130dbae0036c7b8d3a17f9320e93c1e63; dirty tracked tree: true. Harness hashes are recorded in the JSON.

Carve js: [5b9ca1632e179418944bc869ddd4dbc4165f9485](https://github.com/markup-carve/carve-js/commit/5b9ca1632e179418944bc869ddd4dbc4165f9485).
Carve php: [40653c424dc9d3cc063aeb542696d42ffb58ea79](https://github.com/markup-carve/carve-php/commit/40653c424dc9d3cc063aeb542696d42ffb58ea79).
Carve rs: [2246a9b2b6e68b10530736af611ac0263c951d39](https://github.com/markup-carve/carve-rs/commit/2246a9b2b6e68b10530736af611ac0263c951d39).

Djot PHP: [77e5b6c83978b28b72f314fe52c0a200856ad3f9](https://github.com/php-collective/djot-php/commit/77e5b6c83978b28b72f314fe52c0a200856ad3f9), installed from the Composer lock.

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads.

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 3.8716 | 15.43 |
| djot.js | JavaScript | 12.5987 | 4.75 |
| markdown-it | JavaScript | 12.0288 | 5.01 |
| carve-php | PHP | 3.5405 | 16.87 |
| djot-php | PHP | 3.1451 | 19.04 |
| league/commonmark-gfm | PHP | 40.7975 | 1.48 |
| carve-rs | Rust | 0.4391 | 136.03 |
| jotdown | Rust | 1.3157 | 45.51 |
| comrak | Rust | 1.4186 | 42.51 |
| pulldown-cmark | Rust | 0.4597 | 131.17 |

[Raw samples, output checks and source hashes](dev-main-core-pre-final-audit-20261007.json). The [compiled Rust dependency lock](dev-main-rust-pre-final-audit-20261007.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Use Node v22.22.2 for this snapshot.

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.
