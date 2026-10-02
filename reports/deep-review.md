# Focused engine review, 2026-10-02

4 alternating rounds of 11 samples compare pinned main with the earlier drafts. Lower milliseconds are faster. Every case has the same complete output hash across both revisions and all rounds. Final Rust and current-main follow-ups appear below; the original session remains intact.

[Raw session](deep-review.json) · [CSV](deep-review.csv) · [Graph](../charts/deep-review.svg)

## Sources

| Engine | Main | Candidate |
|---|---|---|
| js | `8dcafd7c2248fb8b8db94e573ab28c84cec385e2` | `df6ec4662f726218881a5887174f1848fd809bd6` |
| php | `9558a932e0944ea71e9eb2cb9327a8bf3ffda896` | `307b6469ff4a741d419eef1024105abcfaff9d74` |
| rs | `7ed272c59455b59593823bf5cf7837689b6491bb` | `d2788f06204f615cefada95c355f9b9cee8980c1` |

## Scope and timing

JS and Rust measure parsing with the citations extension enabled. PHP measures AST encoding, importer AST decoding, full HTML import with its report, and a parse plus encode control. These are comparisons within each engine; their timing boundaries differ.

Node warms each case for at least 500 ms and three calls. PHP and Rust warm three calls. Rust uses a release build seeded from the main engine dependency lock; the final worker lock and binary hashes are recorded. PHP CLI opcache, coverage and Xdebug are disabled. Serialization used to check output parity is outside the timed citation parsing.

All workers, including Node helper threads, run on CPU 6. The shared host can still interrupt them. Raw samples, round medians, ranges, load, frequency, runtime versions, dependency metadata and artifact hashes are recorded. Small changes need more evidence. The earlier release history remains a separate measurement session.

## Findings

JS now keeps citation bracket maps with the parse context. Nested citation prefixes, emphasis and link labels reuse the outer map, and completed parses release the maps. The guards fail on the previous implementation.

Rust caches raw citation bracket matches for each inline run and stores only matched openers. It also removes a redundant position pass that repeatedly counted source prefixes. The existing position map remains responsible for item spans, including Unicode and multiline sources.

PHP caches fixed encoding metadata by class and wire type. Node values and conditional empty titles are still evaluated for each node. Validation and report generation remain in the import path.

## Measurements

| Engine | Case | n | Stage / positions | Main ms | Candidate ms | Change |
|---|---|---:|---|---:|---:|---:|
| rs | group | 128 | true | 0.021 | 0.017 | -20.6% |
| rs | group | 128 | false | 0.016 | 0.015 | -8.9% |
| rs | group | 1024 | true | 0.257 | 0.108 | -57.9% |
| rs | group | 1024 | false | 0.097 | 0.137 | +41.4% |
| rs | group | 4096 | true | 3.475 | 1.222 | -64.8% |
| rs | group | 4096 | false | 1.171 | 1.183 | +1.1% |
| rs | group | 8192 | true | 11.292 | 2.577 | -77.2% |
| rs | group | 8192 | false | 0.906 | 1.119 | +23.4% |
| rs | unclosed | 128 | true | 0.022 | 0.010 | -56.1% |
| rs | unclosed | 128 | false | 0.020 | 0.010 | -48.1% |
| rs | unclosed | 1024 | true | 0.560 | 0.059 | -89.5% |
| rs | unclosed | 1024 | false | 0.552 | 0.055 | -90.0% |
| rs | unclosed | 4096 | true | 8.329 | 0.230 | -97.2% |
| rs | unclosed | 4096 | false | 8.622 | 0.210 | -97.6% |
| rs | unclosed | 8192 | true | 32.231 | 0.650 | -98.0% |
| rs | unclosed | 8192 | false | 31.808 | 0.518 | -98.4% |
| rs | nested | 128 | true | 0.147 | 0.159 | +8.1% |
| rs | nested | 128 | false | 0.139 | 0.151 | +9.1% |
| rs | nested | 1024 | true | 1.511 | 1.533 | +1.5% |
| rs | nested | 1024 | false | 1.445 | 1.553 | +7.5% |
| rs | nested | 4096 | true | 8.086 | 8.575 | +6.0% |
| rs | nested | 4096 | false | 7.925 | 8.231 | +3.9% |
| js | nested | 128 | true | 2.143 | 0.505 | -76.4% |
| js | nested | 1024 | true | 94.778 | 3.891 | -95.9% |
| js | nested | 2048 | true | 936.939 | 10.835 | -98.8% |
| js | emphasis | 128 | true | 1.628 | 0.464 | -71.5% |
| js | emphasis | 1024 | true | 87.250 | 4.850 | -94.4% |
| js | emphasis | 2048 | true | 885.474 | 12.459 | -98.6% |
| js | link | 128 | true | 2.995 | 0.865 | -71.1% |
| js | link | 1024 | true | 261.046 | 9.987 | -96.2% |
| js | link | 2048 | true | 1630.216 | 25.251 | -98.5% |
| js | group | 128 | true | 0.032 | 0.031 | -4.0% |
| js | group | 1024 | true | 0.263 | 0.253 | -3.8% |
| js | group | 2048 | true | 0.485 | 0.467 | -3.8% |
| js | unclosed | 128 | true | 0.076 | 0.078 | +2.4% |
| js | unclosed | 1024 | true | 0.634 | 0.580 | -8.5% |
| js | unclosed | 2048 | true | 1.317 | 1.184 | -10.1% |
| js | plain | 128 | true | 1.047 | 1.063 | +1.6% |
| js | plain | 1024 | true | 9.637 | 10.090 | +4.7% |
| js | plain | 2048 | true | 24.912 | 24.013 | -3.6% |
| rs | plain | 128 | true | 0.548 | 0.309 | -43.7% |
| rs | plain | 128 | false | 0.357 | 0.418 | +17.3% |
| rs | plain | 1024 | true | 4.133 | 4.576 | +10.7% |
| rs | plain | 1024 | false | 2.509 | 3.077 | +22.6% |
| php | table | 1024 | encode | 32.981 | 29.095 | -11.8% |
| php | table | 1024 | decode | 143.529 | 137.159 | -4.4% |
| php | table | 1024 | import | 483.920 | 476.099 | -1.6% |
| php | definition | 1024 | encode | 17.953 | 17.053 | -5.0% |
| php | definition | 1024 | decode | 74.048 | 75.151 | +1.5% |
| php | definition | 1024 | import | 187.295 | 200.880 | +7.3% |
| php | plain | 1024 | parse+encode | 42.424 | 39.650 | -6.5% |

## Maintenance and remaining work

The changes remove repeated work at its owner: citation matching owns bracket lookup, one source map owns Rust citation positions, and one PHP helper owns static encoding metadata. The public grammar and extension API remain unchanged.

PHP full HTML import still includes tree building, schema checks, canonicalization, writing and report analysis. Earlier stage profiles show that removing the definition-list scan did not remove this broader cost. Further work should measure these stages separately and preserve validation and loss reporting.

## PHP citation follow-up

This separate session measures the citation position fix against the same PHP main. The encoding measurements above use a different draft. Both changes are independent.

Main: `9558a932e0944ea71e9eb2cb9327a8bf3ffda896`. Citation draft: `99b4231eb1be38cdd99dcc33a2cfc42fb58b22ec`.

[Citation raw session](php-citation-review.json) · [Citation CSV](php-citation-review.csv) · [Citation graph](../charts/php-citation-review.svg)

4 alternating rounds of 11 samples use three warmups. Parsing with positions enabled includes the whole parser. The setter case measures the public setPos() method on a prepared group. Output serialization remains outside timing. Unpositioned controls show mixed changes; the changed loop is not entered on this path.

| Stage | n | Main ms | Draft ms | Change |
|---|---:|---:|---:|---:|
| setter | 1024 | 5.614 | 0.413 | -92.6% |
| setter | 4096 | 81.913 | 2.279 | -97.2% |
| setter | 8192 | 299.561 | 4.853 | -98.4% |
| parse+positions | 128 | 0.878 | 0.749 | -14.7% |
| parse+positions | 1024 | 11.262 | 6.575 | -41.6% |
| parse+positions | 4096 | 99.566 | 30.164 | -69.7% |
| parse | 128 | 0.202 | 0.205 | +1.7% |
| parse | 1024 | 1.424 | 1.187 | -16.7% |
| parse | 4096 | 4.975 | 5.529 | +11.1% |

## Longer Rust controls

A local diagnostic repeated the original Rust worker binaries with longer sampling for the five cases listed below. These repeats cover plain parsing and unpositioned citation groups. They do not cover nested citation prefixes: the initial map allocation caused a repeatable slowdown there, addressed by the final Rust short-scan follow-up below.

[Diagnostic raw samples](deep-review-rust-controls.json)

| Case | n | Positions | Main ms | Draft ms | Change |
|---|---:|---|---:|---:|---:|
| group | 1024 | false | 0.120 | 0.117 | -2.0% |
| group | 8192 | false | 0.970 | 0.965 | -0.5% |
| plain | 128 | false | 0.311 | 0.309 | -0.6% |
| plain | 1024 | false | 2.747 | 2.858 | +4.0% |
| plain | 1024 | true | 3.195 | 3.187 | -0.3% |

## Final Rust fix versus pre-review main

4 alternating rounds on CPU 6 use 11 samples per case. Longer control sampling, when enabled, uses 401 samples per round. Every output hash matches.

[Raw session](rust-hybrid-session.json) · [CSV](rust-hybrid-session.csv) · [Graph](../charts/rust-hybrid-session.svg)

| Engine | Main | Candidate |
|---|---|---|
| rs | `7ed272c59455b59593823bf5cf7837689b6491bb` | `2f84a90c8812a169a0ac12cac2a7ff7ff56adae8` |

A bounded 64-byte scan avoids allocating a whole-run map for short citations. Longer or unmatched spans still build the shared map once. The first Rust draft slowed ordinary nested citations; this follow-up removes that allocation cost. Positions and all output hashes are preserved.

| Case | n | Stage / positions | Main ms | Candidate ms | Change |
|---|---:|---|---:|---:|---:|
| group | 128 | true | 0.021 | 0.016 | -23.0% |
| group | 128 | false | 0.014 | 0.014 | -0.2% |
| group | 1024 | true | 0.255 | 0.106 | -58.4% |
| group | 1024 | false | 0.098 | 0.096 | -2.4% |
| group | 4096 | true | 3.358 | 1.182 | -64.8% |
| group | 4096 | false | 1.183 | 1.186 | +0.3% |
| group | 8192 | true | 11.241 | 2.730 | -75.7% |
| group | 8192 | false | 0.792 | 0.808 | +1.9% |
| unclosed | 128 | true | 0.018 | 0.009 | -48.3% |
| unclosed | 128 | false | 0.020 | 0.009 | -55.9% |
| unclosed | 1024 | true | 0.549 | 0.058 | -89.5% |
| unclosed | 1024 | false | 0.544 | 0.054 | -90.1% |
| unclosed | 4096 | true | 8.020 | 0.220 | -97.3% |
| unclosed | 4096 | false | 8.003 | 0.204 | -97.4% |
| unclosed | 8192 | true | 32.046 | 0.650 | -98.0% |
| unclosed | 8192 | false | 32.152 | 0.512 | -98.4% |
| nested | 128 | true | 0.142 | 0.132 | -7.0% |
| nested | 128 | false | 0.134 | 0.133 | -1.3% |
| nested | 1024 | true | 1.755 | 1.627 | -7.3% |
| nested | 1024 | false | 1.648 | 1.582 | -4.0% |
| nested | 4096 | true | 8.958 | 9.076 | +1.3% |
| nested | 4096 | false | 8.582 | 8.244 | -3.9% |
| plain | 128 | true | 0.303 | 0.306 | +0.8% |
| plain | 128 | false | 0.266 | 0.259 | -2.8% |
| plain | 1024 | true | 2.663 | 2.672 | +0.3% |
| plain | 1024 | false | 2.229 | 2.217 | -0.6% |

## Rust short scan versus newly merged main

4 alternating rounds on CPU 6 use 11 samples per case. Longer control sampling, when enabled, uses 401 samples per round. Every output hash matches.

[Raw session](rust-current-main-session.json) · [CSV](rust-current-main-session.csv) · [Graph](../charts/rust-current-main-session.svg)

| Engine | Main | Candidate |
|---|---|---|
| rs | `3b2a24a8e2b6f9e730b42490573db19b846c8aa6` | `852cc1e517044981783eef9bae1aef74cf628ce3` |

A bounded 64-byte scan avoids allocating a whole-run map for short citations. Longer or unmatched spans still build the shared map once. The first Rust draft slowed ordinary nested citations; this follow-up removes that allocation cost. Positions and all output hashes are preserved.

| Case | n | Stage / positions | Main ms | Candidate ms | Change |
|---|---:|---|---:|---:|---:|
| group | 128 | true | 0.029 | 0.028 | -5.5% |
| group | 128 | false | 0.026 | 0.025 | -4.7% |
| group | 1024 | true | 0.201 | 0.196 | -2.5% |
| group | 1024 | false | 0.186 | 0.177 | -4.8% |
| group | 4096 | true | 1.948 | 1.899 | -2.5% |
| group | 4096 | false | 1.861 | 1.822 | -2.1% |
| group | 8192 | true | 4.231 | 4.193 | -0.9% |
| group | 8192 | false | 1.467 | 1.406 | -4.2% |
| unclosed | 128 | true | 0.018 | 0.018 | +0.4% |
| unclosed | 128 | false | 0.017 | 0.017 | -0.1% |
| unclosed | 1024 | true | 0.120 | 0.120 | -0.5% |
| unclosed | 1024 | false | 0.112 | 0.110 | -1.3% |
| unclosed | 4096 | true | 0.466 | 0.456 | -2.2% |
| unclosed | 4096 | false | 0.435 | 0.428 | -1.6% |
| unclosed | 8192 | true | 1.245 | 1.252 | +0.6% |
| unclosed | 8192 | false | 1.022 | 1.022 | +0.0% |
| nested | 128 | true | 0.278 | 0.236 | -15.0% |
| nested | 128 | false | 0.266 | 0.229 | -13.8% |
| nested | 1024 | true | 2.986 | 2.665 | -10.7% |
| nested | 1024 | false | 2.910 | 2.527 | -13.2% |
| nested | 4096 | true | 14.345 | 13.165 | -8.2% |
| nested | 4096 | false | 14.090 | 12.677 | -10.0% |
| plain | 128 | true | 0.537 | 0.561 | +4.5% |
| plain | 128 | false | 0.491 | 0.490 | -0.2% |
| plain | 1024 | true | 5.018 | 4.802 | -4.3% |
| plain | 1024 | false | 4.160 | 4.057 | -2.5% |

## PHP table and definition-list building versus newly merged main

4 alternating rounds on CPU 6 use 11 samples per case. Longer control sampling, when enabled, uses None samples per round. Every output hash matches.

[Raw session](php-import-current-main-session.json) · [CSV](php-import-current-main-session.csv) · [Graph](../charts/php-import-current-main-session.svg)

| Engine | Main | Candidate |
|---|---|---|
| php | `d14268ab2bc5ed579b834a73def0ba993dceae20` | `8aa397a5b448222eb7cd1c500cd34a1ad34d3e09` |

This session measures HTML-to-AST building only, including DOM loading. Row and section indexes replace full-row searches, section paths reuse the table path, and adjacent definition lists append items. It does not measure full import and report generation. The later invariant check validates each merge target once; that small review correction is not included in this pinned measurement.

| Case | n | Stage / positions | Main ms | Candidate ms | Change |
|---|---:|---|---:|---:|---:|
| table-sections | 128 | build | 5.564 | 4.094 | -26.4% |
| table-sections | 1024 | build | 142.466 | 52.318 | -63.3% |
| table-sections | 4096 | build | 1919.733 | 288.994 | -84.9% |
| adjacent-definitions | 128 | build | 9.233 | 6.213 | -32.7% |
| adjacent-definitions | 1024 | build | 261.831 | 87.741 | -66.5% |
| adjacent-definitions | 4096 | build | 4698.225 | 317.423 | -93.2% |
