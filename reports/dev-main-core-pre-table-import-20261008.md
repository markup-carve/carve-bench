# Core throughput using Carve development main

Measured 2026-10-07T22:23:41.583Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v22.22.2. Benchmark harness checkout: a4553ecdc352668ab057eb0d2fa3a979a66decdc; cached remote main: 9b742aca7d2a73251fd74f9f4bbb880beffe2d8b; dirty tracked tree: true. Harness hashes are recorded in the JSON.

Carve js: [72f7d1333bf4a271a7371b62c6c599d280412e68](https://github.com/markup-carve/carve-js/commit/72f7d1333bf4a271a7371b62c6c599d280412e68).
Carve php: [9570a261517b26e0ad866087ef28a5679b8d8435](https://github.com/markup-carve/carve-php/commit/9570a261517b26e0ad866087ef28a5679b8d8435).
Carve rs: [7a68f74a39c785549130abd97218a282cbce5b77](https://github.com/markup-carve/carve-rs/commit/7a68f74a39c785549130abd97218a282cbce5b77).

Djot PHP: [77e5b6c83978b28b72f314fe52c0a200856ad3f9](https://github.com/php-collective/djot-php/commit/77e5b6c83978b28b72f314fe52c0a200856ad3f9), installed from the Composer lock.

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads.

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 5.1824 | 11.53 |
| djot.js | JavaScript | 17.9310 | 3.34 |
| markdown-it | JavaScript | 17.5369 | 3.44 |
| carve-php | PHP | 4.2757 | 13.97 |
| djot-php | PHP | 3.7312 | 16.05 |
| league/commonmark-gfm | PHP | 53.4112 | 1.13 |
| carve-rs | Rust | 0.5131 | 116.40 |
| jotdown | Rust | 1.5883 | 37.70 |
| comrak | Rust | 1.7911 | 33.67 |
| pulldown-cmark | Rust | 0.5492 | 109.81 |

The initial complete core attempt recorded host load from 15.89 to 14.38. The full-corpus run ended at 6.88. Core and separate JavaScript comparisons were repeated once after the revision and history controls finished, with the same source pins and methods. The initial attempt remains in local evidence; this report uses the later complete repeat. Shared-host measurements do not isolate code effects.

[Raw samples, output checks and source hashes](dev-main-core-pre-table-import-20261008.json). The [compiled Rust dependency lock](dev-main-rust-pre-table-import-20261008.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Use Node v22.22.2 for this snapshot.

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.

The measured source pins were frozen at the start of this refresh. Later include fixes merged during the run and were not measured. All current core, corpus, paired controls and history reports retain the same frozen pins. The core report records newer heads observed at repeat setup; earlier workloads retain their own measurement-time provenance.
