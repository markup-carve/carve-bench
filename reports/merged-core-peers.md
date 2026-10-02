# Merged main versus PHP and Rust peers

These measurements use the normal fastest public source-to-HTML API on the existing core comparison documents. The documents use equivalent logical content; the Djot and Markdown inputs share the same syntax subset and bytes. Peer output and feature sets differ; matching hashes compare Carve revisions, not Carve with its peer.

Four rounds contain 21 warmed trials each on CPU 12. PHP alternates revision order; Rust uses fixed engine order. Runs completed on 2026-10-02. The table uses the median of all 84 trials. PHP uses tracing JIT and 50 iterations per trial; Rust uses an optimized LTO build and 400. These medians differ from the fastest-of-five statistic in older headline reports. The host is shared.

PHP main: `8deb237e1129af59f7efa5e5e3522340d08a5ae4`. Rust main: `2668992f289c9029ae1d42350c1cca5883f773e8`. The PHP peer is Djot PHP `fab953f6`; the Rust peer is pulldown-cmark 0.13.4.

| Language | Engine | Revision | Median ms | MB/s |
|---|---|---|---:|---:|
| PHP | carve-php | main | 3.348 | 14.04 |
| PHP | carve-php-0.1.9 | 0.1.9 | 2.938 | 15.99 |
| PHP | djot-php | peer | 2.615 | 18.07 |
| Rust | carve-rs | main | 0.462 | 101.60 |
| Rust | carve-rs-0.1.6 | 0.1.6 | 0.409 | 114.87 |
| Rust | pulldown-cmark | peer | 0.397 | 118.97 |

PHP main is slower than 0.1.9. Rust main is slower than 0.1.6. Carve output hashes match their tagged controls in both languages.

Composer installed metadata identifies the PHP peer; its individual source files were not guarded. PHP records an end time; Rust records the raw artifact write time. Separate peer-run start times were not recorded.

[Raw samples and provenance](merged-core-peers.json) · [CSV](merged-core-peers.csv) · [Last two tags versus main](latest-main-comparison.md)
