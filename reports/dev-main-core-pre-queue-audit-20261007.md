# Core throughput using Carve development main

Measured 2026-10-07T17:18:48.112Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v22.22.2. Benchmark harness checkout: 9ca2a4427601f634049b828781ddc66db14a2c0f; cached remote main: 9ca2a4427601f634049b828781ddc66db14a2c0f; dirty tracked tree: false. Harness hashes are recorded in the JSON.

Carve js: [a5c6d6457438a2d0519d474b752a6dac5c0d00bc](https://github.com/markup-carve/carve-js/commit/a5c6d6457438a2d0519d474b752a6dac5c0d00bc).
Carve php: [46da1921cfa92f82b85793138da008581b3a42e2](https://github.com/markup-carve/carve-php/commit/46da1921cfa92f82b85793138da008581b3a42e2).
Carve rs: [2246a9b2b6e68b10530736af611ac0263c951d39](https://github.com/markup-carve/carve-rs/commit/2246a9b2b6e68b10530736af611ac0263c951d39).

Djot PHP: [77e5b6c83978b28b72f314fe52c0a200856ad3f9](https://github.com/php-collective/djot-php/commit/77e5b6c83978b28b72f314fe52c0a200856ad3f9), installed from the Composer lock.

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads.

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 3.9859 | 14.99 |
| djot.js | JavaScript | 12.6423 | 4.74 |
| markdown-it | JavaScript | 12.9784 | 4.65 |
| carve-php | PHP | 3.5911 | 16.63 |
| djot-php | PHP | 3.1201 | 19.19 |
| league/commonmark-gfm | PHP | 46.2902 | 1.30 |
| carve-rs | Rust | 0.4432 | 134.76 |
| jotdown | Rust | 1.3409 | 44.65 |
| comrak | Rust | 1.4992 | 40.22 |
| pulldown-cmark | Rust | 0.4734 | 127.37 |

[Raw samples, output checks and source hashes](dev-main-core-pre-queue-audit-20261007.json). The [compiled Rust dependency lock](dev-main-rust-pre-queue-audit-20261007.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Use Node v22.22.2 for this snapshot.

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.

Rust is pinned to merged commit 2246a9b2b; the newer main at setup changes only CHANGELOG.md and tests. Runtime sources and dependency manifests are identical.
