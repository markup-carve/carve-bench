# Core throughput using Carve development main

Measured 2026-10-15T11:40:28.966Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v22.22.2. Benchmark harness checkout: 485ff55d6f89a5c26035ccb7dbdc2d26324ca9d5; cached remote main: 485ff55d6f89a5c26035ccb7dbdc2d26324ca9d5; dirty tracked tree: true. Harness hashes are recorded in the JSON.

Pinned merged-main snapshots are retained; later main commits are recorded as observations and are outside this measurement.

Carve js: [224b0c32e22480571c99aae3f0055a6e5a091f74](https://github.com/markup-carve/carve-js/commit/224b0c32e22480571c99aae3f0055a6e5a091f74).
Carve php: [967f253974433dbc53534df74b7abeae10f26458](https://github.com/markup-carve/carve-php/commit/967f253974433dbc53534df74b7abeae10f26458).
Carve rs: [76f95de6b62cfc0088312b0b9336390fd2cfd5f0](https://github.com/markup-carve/carve-rs/commit/76f95de6b62cfc0088312b0b9336390fd2cfd5f0).

Djot PHP: [77e5b6c83978b28b72f314fe52c0a200856ad3f9](https://github.com/php-collective/djot-php/commit/77e5b6c83978b28b72f314fe52c0a200856ad3f9), installed from the Composer lock.

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads.

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 6.0207 | 9.92 |
| djot.js | JavaScript | 16.7811 | 3.57 |
| markdown-it | JavaScript | 17.2705 | 3.49 |
| carve-php | PHP | 6.2604 | 9.54 |
| djot-php | PHP | 5.0130 | 11.94 |
| league/commonmark-gfm | PHP | 81.1589 | 0.74 |
| carve-rs | Rust | 0.6867 | 86.98 |
| jotdown | Rust | 1.9666 | 30.45 |
| comrak | Rust | 3.5936 | 16.78 |
| pulldown-cmark | Rust | 0.8397 | 71.82 |

[Raw samples, output checks and source hashes](dev-main-core.json). The [compiled Rust dependency lock](dev-main-rust.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Use Node v22.22.2 for this snapshot.

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.
