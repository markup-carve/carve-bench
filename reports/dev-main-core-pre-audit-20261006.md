# Core throughput using Carve development main

Measured 2026-10-05T23:44:50.004Z. AMD Ryzen 9 PRO 7940HS w/ Radeon 780M Graphics; Node v22.22.2. Benchmark harness checkout: 5d6a5fe056f3f2ddca50abec9f89d28f5fc847d7; cached remote main: 5d6a5fe056f3f2ddca50abec9f89d28f5fc847d7; dirty tracked tree: true. Harness hashes are recorded in the JSON.

Carve js: [a7c80d37fb322d28bc5061175bbd9c7f7638c175](https://github.com/markup-carve/carve-js/commit/a7c80d37fb322d28bc5061175bbd9c7f7638c175).
Carve php: [49c235d768ea6faec074d4b561ed3783d99b6fbd](https://github.com/markup-carve/carve-php/commit/49c235d768ea6faec074d4b561ed3783d99b6fbd).
Carve rs: [ae44de38b6ecf468212cac117f83158f7c3988c2](https://github.com/markup-carve/carve-rs/commit/ae44de38b6ecf468212cac117f83158f7c3988c2).

JS and PHP use retained merged performance commits, not current main heads. Later main changes fix description-list or reference correctness and update lint or corpus coverage. They were excluded from this Rust performance refresh; these fixtures do not validate the newer fixes.

Djot PHP: [77e5b6c83978b28b72f314fe52c0a200856ad3f9](https://github.com/php-collective/djot-php/commit/77e5b6c83978b28b72f314fe52c0a200856ad3f9), installed from the Composer lock.

Allowed CPUs: 13. Child processes inherit this affinity, including Node compiler and GC threads.

The shared host's one-minute load average changed from 3.40 to 2.21. CPU affinity does not reserve a core. Carve Rust and pulldown-cmark are effectively tied in this snapshot; this does not establish an engine-only speedup.

Two earlier runs were excluded before publication because competing test jobs caused large within-session slowdowns in Rust and peer engines. Their raw records remain local. This run began after those jobs ended.

Two serial rounds in reversed engine order. Twenty warmup calls; seven trials per round. JavaScript 100, PHP 50 and Rust 200 calls per trial. Final throughput uses median elapsed time across all fourteen samples.

The 18-point fixture includes pipe tables. Carve and Markdown use compact nested lists; Djot requires a blank before the nested list. The 150-section workload differs from the historical release fixture, so changes in peer throughput or Carve ratios are not engine-only improvements. Native markup differs by language; the HTML control checks equivalent hierarchy, text, emphasis, links and code. Table alignment is not part of the normalized output check. Compare engines within this workload; the 14-point workload without tables is measured separately.

| Engine | Language | Median ms/op | MB/s |
|---|---|---:|---:|
| carve-js | JavaScript | 3.7409 | 15.97 |
| djot.js | JavaScript | 12.7363 | 4.70 |
| markdown-it | JavaScript | 11.9665 | 5.04 |
| carve-php | PHP | 3.6015 | 16.58 |
| djot-php | PHP | 3.1340 | 19.10 |
| league/commonmark-gfm | PHP | 40.4285 | 1.49 |
| carve-rs | Rust | 0.4626 | 129.12 |
| jotdown | Rust | 1.3262 | 45.15 |
| comrak | Rust | 1.4302 | 42.16 |
| pulldown-cmark | Rust | 0.4680 | 128.85 |

[Raw samples, output checks and source hashes](dev-main-core-pre-audit-20261006.json). The [compiled Rust dependency lock](dev-main-rust.Cargo.lock) records its resolved dependencies. Historical release results remain in [COMPARISON.md](../COMPARISON.md).

## Reproduce

Use Node v22.22.2 for this snapshot.

Check out the three commits above and install the locked dependencies in `engines/js` and `engines/php`. Build Carve JS with `npm ci && npm run build` in its checkout. Build the Rust worker with `node scripts/build-rs-engine.mjs --carve-rs CHECKOUT`. Create a local JSON configuration with `js`, `php` and `rs` entries, each containing `path` and `commit`. Run `node scripts/compare-dev-main.mjs CONFIG.json`, then `node scripts/gen-charts.mjs`. The runner rebuilds JS and Rust and accepts the pinned commits as merged ancestors after main advances.
