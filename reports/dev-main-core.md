# Core throughput using Carve development main

Measured 2026-10-21T02:51:04.375Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v22.22.2. Benchmark harness checkout: cf53642e64e010b828475c46a702f8f9ef7994a2; cached remote main: cf53642e64e010b828475c46a702f8f9ef7994a2; dirty tracked tree: true. Harness hashes are recorded in the JSON.

Carve js: [2ce388c2897f2a93e13de8832b3d1c3a5788735c](https://github.com/markup-carve/carve-js/commit/2ce388c2897f2a93e13de8832b3d1c3a5788735c).
Carve php: [2a7a38145ae88e8dce294b924e937537b4a69399](https://github.com/markup-carve/carve-php/commit/2a7a38145ae88e8dce294b924e937537b4a69399).
Carve rs: [47fdd7e487fc793133cf6af8396f653975454dd9](https://github.com/markup-carve/carve-rs/commit/47fdd7e487fc793133cf6af8396f653975454dd9).

Djot PHP: [77e5b6c83978b28b72f314fe52c0a200856ad3f9](https://github.com/php-collective/djot-php/commit/77e5b6c83978b28b72f314fe52c0a200856ad3f9), installed from the Composer lock.

Allowed CPUs: 12. Child processes inherit this affinity, including Node compiler and GC threads.

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 7.9741 | 7.49 |
| djot.js | JavaScript | 17.9396 | 3.34 |
| markdown-it | JavaScript | 14.1605 | 4.26 |
| carve-php | PHP | 4.7916 | 12.47 |
| djot-php | PHP | 3.7775 | 15.85 |
| league/commonmark-gfm | PHP | 60.8010 | 0.99 |
| carve-rs | Rust | 0.8989 | 66.45 |
| jotdown | Rust | 2.4666 | 24.27 |
| comrak | Rust | 3.1685 | 19.03 |
| pulldown-cmark | Rust | 0.7125 | 84.63 |

[Raw samples, output checks and source hashes](dev-main-core.json). The [compiled Rust dependency lock](dev-main-rust.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Use Node v22.22.2 for this snapshot.

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.
