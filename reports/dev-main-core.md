# Core throughput using Carve development main

Measured 2026-10-02T22:56:29.830Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v22.22.2.

Carve js: [e45535d6189edda71d7e08b6f7077698e1bc30e3](https://github.com/markup-carve/carve-js/commit/e45535d6189edda71d7e08b6f7077698e1bc30e3).
Carve php: [9529fe72093e79cc9cacf3e502339859b186e53e](https://github.com/markup-carve/carve-php/commit/9529fe72093e79cc9cacf3e502339859b186e53e).
Carve rs: [4dfd8600161ffd5c68a1fd215c8ed3c7400dc492](https://github.com/markup-carve/carve-rs/commit/4dfd8600161ffd5c68a1fd215c8ed3c7400dc492).

Djot PHP: [9c52e611202e7944c857a1d68c8c715b03b77a1b](https://github.com/php-collective/djot-php/commit/9c52e611202e7944c857a1d68c8c715b03b77a1b), installed from the Composer lock.

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 3.5609 | 16.77 |
| djot.js | JavaScript | 12.4710 | 4.80 |
| markdown-it | JavaScript | 11.9555 | 5.04 |
| carve-php | PHP | 3.5592 | 16.78 |
| djot-php | PHP | 3.1041 | 19.29 |
| league/commonmark-gfm | PHP | 39.5834 | 1.52 |
| carve-rs | Rust | 0.4781 | 124.94 |
| jotdown | Rust | 1.3173 | 45.45 |
| comrak | Rust | 1.4353 | 42.01 |
| pulldown-cmark | Rust | 0.4641 | 129.93 |

[Raw samples, output checks and source hashes](dev-main-core.json). The [compiled Rust dependency lock](dev-main-rust.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.
