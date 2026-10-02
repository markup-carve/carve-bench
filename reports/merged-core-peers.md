# Historical merged main versus PHP and Rust peers

These measurements use the original core comparison documents. Carve receives 49,270 bytes; Djot and Markdown receive 49,540 bytes. Output hashes compare Carve revisions with their tagged controls. Peer outputs were not checked for equivalent structure. These retained samples are separate from the current throughput graph.

Four rounds contain 21 warmed trials each on CPU 12. PHP alternates revision order; Rust uses fixed engine order. PHP uses tracing JIT and 50 iterations per trial; Rust uses an optimized LTO build and 400. The table uses median elapsed time across 84 samples. The host is shared; fixed Rust order may affect the comparison.

PHP completed 2026-10-02T14:05:48.516193+00:00. Rust samples were written 2026-10-02T14:03:44.563231+00:00; measurement start and end times were not recorded.

PHP peer: `php-collective/djot dev-master fab953f6e4820d0d00209668062a68658589af75`. Rust peer: `pulldown-cmark 0.13.4`; its lockfile hash is recorded in the raw JSON. The selected 0.1.9 PHP and 0.1.6 Rust tags are retained controls, not the latest released tags.

| Language | Engine | Measured revision | Bytes | Median ms | Range ms | MB/s |
|---|---|---|---:|---:|---|---:|
| PHP | carve-php | 8deb237e1129af59f7efa5e5e3522340d08a5ae4 | 49270 | 3.348 | 3.144 to 4.484 | 14.04 |
| PHP | carve-php-0.1.9 | 0.1.9 | 49270 | 2.938 | 2.752 to 3.726 | 15.99 |
| PHP | djot-php | peer | 49540 | 2.615 | 2.503 to 4.226 | 18.07 |
| Rust | carve-rs | 2668992f289c9029ae1d42350c1cca5883f773e8 | 49270 | 0.462 | 0.446 to 0.700 | 101.60 |
| Rust | carve-rs-0.1.6 | 0.1.6 | 49270 | 0.409 | 0.399 to 0.499 | 114.87 |
| Rust | pulldown-cmark | peer | 49540 | 0.397 | 0.380 to 0.477 | 118.97 |

Main has higher median elapsed time than these tagged controls in this session. Shared-host variation and the retained tag choices limit regression conclusions. Carve output hashes match the tagged controls in both languages.

Composer installed metadata identifies the PHP peer; its source files were not individually guarded. The Rust row names the actual measured commit, rather than the later CI-only tip.

[Raw samples and provenance](merged-core-peers.json) · [CSV](merged-core-peers.csv) · [Separate comparison against two tags](latest-main-comparison.md)
