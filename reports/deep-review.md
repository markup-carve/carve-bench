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

[Diagnostic raw samples](deep-review-rust-controls.json) · [Archived binary verification](rust-control-binary-verification.json)

The diagnostic producer inherited binary hashes from the original session. Hashes of the archived binaries were checked after the run, not by the diagnostic producer at run time. Formal follow-ups below have stronger provenance.

| Case | n | Positions | Main ms | Draft ms | Change |
|---|---:|---|---:|---:|---:|
| group | 1024 | false | 0.120 | 0.117 | -2.0% |
| group | 8192 | false | 0.970 | 0.965 | -0.5% |
| plain | 128 | false | 0.311 | 0.309 | -0.6% |
| plain | 1024 | false | 2.747 | 2.858 | +4.0% |
| plain | 1024 | true | 3.195 | 3.187 | -0.3% |

## Final Rust fix versus pre-review main

4 alternating rounds on CPU 6 use 11 samples per case. Rust control cases use 401 samples per round. Every output hash matches.

[Raw session](rust-hybrid-session.json) · [CSV](rust-hybrid-session.csv) · [Graph](../charts/rust-hybrid-session.svg)

| Engine | Main | Candidate |
|---|---|---|
| rs | `7ed272c59455b59593823bf5cf7837689b6491bb` | `2f84a90c8812a169a0ac12cac2a7ff7ff56adae8` |

A bounded 64-byte scan avoids allocating a whole-run map for short citations. Longer or unmatched spans still build the shared map once. The first Rust draft slowed ordinary nested citations; this follow-up removes that allocation cost. Positions and all output hashes are preserved.

| Engine | Case | n | Stage / positions | Main ms | Candidate ms | Change |
|---|---|---:|---|---:|---:|---:|
| rs | group | 128 | true | 0.021 | 0.016 | -23.0% |
| rs | group | 128 | false | 0.014 | 0.014 | -0.2% |
| rs | group | 1024 | true | 0.255 | 0.106 | -58.4% |
| rs | group | 1024 | false | 0.098 | 0.096 | -2.4% |
| rs | group | 4096 | true | 3.358 | 1.182 | -64.8% |
| rs | group | 4096 | false | 1.183 | 1.186 | +0.3% |
| rs | group | 8192 | true | 11.241 | 2.730 | -75.7% |
| rs | group | 8192 | false | 0.792 | 0.808 | +1.9% |
| rs | unclosed | 128 | true | 0.018 | 0.009 | -48.3% |
| rs | unclosed | 128 | false | 0.020 | 0.009 | -55.9% |
| rs | unclosed | 1024 | true | 0.549 | 0.058 | -89.5% |
| rs | unclosed | 1024 | false | 0.544 | 0.054 | -90.1% |
| rs | unclosed | 4096 | true | 8.020 | 0.220 | -97.3% |
| rs | unclosed | 4096 | false | 8.003 | 0.204 | -97.4% |
| rs | unclosed | 8192 | true | 32.046 | 0.650 | -98.0% |
| rs | unclosed | 8192 | false | 32.152 | 0.512 | -98.4% |
| rs | nested | 128 | true | 0.142 | 0.132 | -7.0% |
| rs | nested | 128 | false | 0.134 | 0.133 | -1.3% |
| rs | nested | 1024 | true | 1.755 | 1.627 | -7.3% |
| rs | nested | 1024 | false | 1.648 | 1.582 | -4.0% |
| rs | nested | 4096 | true | 8.958 | 9.076 | +1.3% |
| rs | nested | 4096 | false | 8.582 | 8.244 | -3.9% |
| rs | plain | 128 | true | 0.303 | 0.306 | +0.8% |
| rs | plain | 128 | false | 0.266 | 0.259 | -2.8% |
| rs | plain | 1024 | true | 2.663 | 2.672 | +0.3% |
| rs | plain | 1024 | false | 2.229 | 2.217 | -0.6% |

## Rust short scan versus newly merged main

4 alternating rounds on CPU 6 use 11 samples per case. Rust control cases use 401 samples per round. Every output hash matches.

[Raw session](rust-current-main-session.json) · [CSV](rust-current-main-session.csv) · [Graph](../charts/rust-current-main-session.svg)

| Engine | Main | Candidate |
|---|---|---|
| rs | `3b2a24a8e2b6f9e730b42490573db19b846c8aa6` | `852cc1e517044981783eef9bae1aef74cf628ce3` |

A bounded 64-byte scan avoids allocating a whole-run map for short citations. Longer or unmatched spans still build the shared map once. The first Rust draft slowed ordinary nested citations; this follow-up removes that allocation cost. Positions and all output hashes are preserved.

| Engine | Case | n | Stage / positions | Main ms | Candidate ms | Change |
|---|---|---:|---|---:|---:|---:|
| rs | group | 128 | true | 0.029 | 0.028 | -5.5% |
| rs | group | 128 | false | 0.026 | 0.025 | -4.7% |
| rs | group | 1024 | true | 0.201 | 0.196 | -2.5% |
| rs | group | 1024 | false | 0.186 | 0.177 | -4.8% |
| rs | group | 4096 | true | 1.948 | 1.899 | -2.5% |
| rs | group | 4096 | false | 1.861 | 1.822 | -2.1% |
| rs | group | 8192 | true | 4.231 | 4.193 | -0.9% |
| rs | group | 8192 | false | 1.467 | 1.406 | -4.2% |
| rs | unclosed | 128 | true | 0.018 | 0.018 | +0.4% |
| rs | unclosed | 128 | false | 0.017 | 0.017 | -0.1% |
| rs | unclosed | 1024 | true | 0.120 | 0.120 | -0.5% |
| rs | unclosed | 1024 | false | 0.112 | 0.110 | -1.3% |
| rs | unclosed | 4096 | true | 0.466 | 0.456 | -2.2% |
| rs | unclosed | 4096 | false | 0.435 | 0.428 | -1.6% |
| rs | unclosed | 8192 | true | 1.245 | 1.252 | +0.6% |
| rs | unclosed | 8192 | false | 1.022 | 1.022 | +0.0% |
| rs | nested | 128 | true | 0.278 | 0.236 | -15.0% |
| rs | nested | 128 | false | 0.266 | 0.229 | -13.8% |
| rs | nested | 1024 | true | 2.986 | 2.665 | -10.7% |
| rs | nested | 1024 | false | 2.910 | 2.527 | -13.2% |
| rs | nested | 4096 | true | 14.345 | 13.165 | -8.2% |
| rs | nested | 4096 | false | 14.090 | 12.677 | -10.0% |
| rs | plain | 128 | true | 0.537 | 0.561 | +4.5% |
| rs | plain | 128 | false | 0.491 | 0.490 | -0.2% |
| rs | plain | 1024 | true | 5.018 | 4.802 | -4.3% |
| rs | plain | 1024 | false | 4.160 | 4.057 | -2.5% |

## PHP table and definition-list building versus newly merged main

4 alternating rounds on CPU 6 use 11 samples per case. Every output hash matches.

[Raw session](php-import-current-main-session.json) · [CSV](php-import-current-main-session.csv) · [Graph](../charts/php-import-current-main-session.svg)

| Engine | Main | Candidate |
|---|---|---|
| php | `d14268ab2bc5ed579b834a73def0ba993dceae20` | `8aa397a5b448222eb7cd1c500cd34a1ad34d3e09` |

This session measures HTML-to-AST building only, including DOM loading. Row and section indexes replace full-row searches, section paths reuse the table path, and adjacent definition lists append items. It does not measure full import and report generation. The later invariant check validates each merge target once; that small review correction is not included in this pinned measurement.

| Engine | Case | n | Stage / positions | Main ms | Candidate ms | Change |
|---|---|---:|---|---:|---:|---:|
| php | table-sections | 128 | build | 5.564 | 4.094 | -26.4% |
| php | table-sections | 1024 | build | 142.466 | 52.318 | -63.3% |
| php | table-sections | 4096 | build | 1919.733 | 288.994 | -84.9% |
| php | adjacent-definitions | 128 | build | 9.233 | 6.213 | -32.7% |
| php | adjacent-definitions | 1024 | build | 261.831 | 87.741 | -66.5% |
| php | adjacent-definitions | 4096 | build | 4698.225 | 317.423 | -93.2% |

## Citation item fixes in JavaScript and Rust

4 alternating rounds on CPU 6 use 11 samples per case. Rust control cases use 401 samples per round. Every output hash matches.

[Raw session](citation-items-current-main-session.json) · [CSV](citation-items-current-main-session.csv) · [Graph](../charts/citation-items-current-main-session.svg)

| Engine | Main | Candidate |
|---|---|---|
| js | `bdd11682cbbcbac7dbf089f587f86caf0e488ea9` | `6ac359b75eaf70dfdaa2795a484d9526938a9a67` |
| rs | `3b2a24a8e2b6f9e730b42490573db19b846c8aa6` | `7eeb70fb565bbd45660f230812093ef582dfd621` |

| Engine | Case | n | Stage / positions | Main ms | Candidate ms | Change |
|---|---|---:|---|---:|---:|---:|
| rs | group | 128 | true | 0.017 | 0.023 | +33.0% |
| rs | group | 128 | false | 0.014 | 0.015 | +0.5% |
| rs | group | 1024 | true | 0.115 | 0.120 | +4.5% |
| rs | group | 1024 | false | 0.110 | 0.107 | -2.7% |
| rs | group | 4096 | true | 1.213 | 1.169 | -3.6% |
| rs | group | 4096 | false | 1.244 | 1.221 | -1.9% |
| rs | group | 8192 | true | 2.698 | 2.576 | -4.5% |
| rs | group | 8192 | false | 0.881 | 0.858 | -2.7% |
| rs | unclosed | 128 | true | 0.009 | 0.011 | +19.8% |
| rs | unclosed | 128 | false | 0.009 | 0.008 | -5.5% |
| rs | unclosed | 1024 | true | 0.058 | 0.058 | -0.0% |
| rs | unclosed | 1024 | false | 0.063 | 0.053 | -15.7% |
| rs | unclosed | 4096 | true | 0.223 | 0.224 | +0.7% |
| rs | unclosed | 4096 | false | 0.210 | 0.206 | -2.1% |
| rs | unclosed | 8192 | true | 0.675 | 0.651 | -3.5% |
| rs | unclosed | 8192 | false | 0.529 | 0.519 | -2.0% |
| rs | nested | 128 | true | 0.160 | 0.167 | +4.1% |
| rs | nested | 128 | false | 0.158 | 0.165 | +4.3% |
| rs | nested | 1024 | true | 1.809 | 1.833 | +1.3% |
| rs | nested | 1024 | false | 1.667 | 1.742 | +4.5% |
| rs | nested | 4096 | true | 10.647 | 10.336 | -2.9% |
| rs | nested | 4096 | false | 9.623 | 10.294 | +7.0% |
| js | nested | 128 | true | 0.505 | 0.487 | -3.7% |
| js | nested | 1024 | true | 4.859 | 4.323 | -11.0% |
| js | nested | 2048 | true | 11.812 | 11.499 | -2.7% |
| js | emphasis | 128 | true | 0.537 | 0.524 | -2.4% |
| js | emphasis | 1024 | true | 5.117 | 5.038 | -1.5% |
| js | emphasis | 2048 | true | 12.232 | 12.789 | +4.5% |
| js | link | 128 | true | 1.022 | 0.741 | -27.5% |
| js | link | 1024 | true | 11.610 | 7.570 | -34.8% |
| js | link | 2048 | true | 25.794 | 25.143 | -2.5% |
| js | group | 128 | true | 0.034 | 0.037 | +7.4% |
| js | group | 1024 | true | 0.266 | 0.271 | +1.9% |
| js | group | 2048 | true | 0.507 | 0.547 | +7.8% |
| js | unclosed | 128 | true | 0.081 | 0.074 | -8.0% |
| js | unclosed | 1024 | true | 0.611 | 0.605 | -1.1% |
| js | unclosed | 2048 | true | 1.184 | 1.142 | -3.6% |
| js | plain | 128 | true | 1.137 | 1.148 | +1.0% |
| js | plain | 1024 | true | 10.775 | 10.473 | -2.8% |
| js | plain | 2048 | true | 24.234 | 25.225 | +4.1% |
| rs | plain | 128 | true | 0.321 | 0.317 | -1.2% |
| rs | plain | 128 | false | 0.276 | 0.281 | +1.6% |
| rs | plain | 1024 | true | 2.697 | 2.738 | +1.5% |
| rs | plain | 1024 | false | 2.283 | 2.359 | +3.3% |

## Rust short-input controls with longer sampling

4 alternating rounds on CPU 6 use 401 samples per case. Every output hash matches.

[Raw session](citation-short-controls-session.json) · [CSV](citation-short-controls-session.csv) · [Graph](../charts/citation-short-controls-session.svg)

| Engine | Main | Candidate |
|---|---|---|
| rs | `3b2a24a8e2b6f9e730b42490573db19b846c8aa6` | `7eeb70fb565bbd45660f230812093ef582dfd621` |

The earlier short Rust cases varied by a few microseconds. Longer sampling measures positioned groups at -2.0% and unmatched openers at +0.2%; it does not support the earlier +33%/+20% readings as repeatable regressions.

| Engine | Case | n | Stage / positions | Main ms | Candidate ms | Change |
|---|---|---:|---|---:|---:|---:|
| rs | group | 128 | true | 0.019 | 0.019 | -2.0% |
| rs | group | 128 | false | 0.017 | 0.016 | -8.3% |
| rs | unclosed | 128 | true | 0.011 | 0.011 | +0.2% |
| rs | unclosed | 128 | false | 0.010 | 0.010 | +0.4% |

## Merged engine fixes and the first JavaScript importer draft

4 alternating rounds on CPU 6 use 3 samples per case. Rust control cases use 401 samples per round. Every output hash matches.

[Raw session](merged-engines-final-session.json) · [CSV](merged-engines-final-session.csv) · [Graph](../charts/merged-engines-final-session.svg)

| Engine | Main | Candidate |
|---|---|---|
| js | `c77d85ead683bffc534d50ab18c1df95f1821c8b` | `0fe9653ad250bd813314b7f031f659ee79d6da9f` |
| php | `d14268ab2bc5ed579b834a73def0ba993dceae20` | `4c1cf690ea57e6ce035dfbecce932d42684c1018` |
| rs | `3b2a24a8e2b6f9e730b42490573db19b846c8aa6` | `1aa51a380af1c5407fba49a476497ac4795adaeb` |

| Engine | Case | n | Stage / positions | Main ms | Candidate ms | Change |
|---|---|---:|---|---:|---:|---:|
| rs | nested | 128 | true | 0.257 | 0.222 | -13.7% |
| rs | nested | 128 | false | 0.242 | 0.219 | -9.4% |
| rs | nested | 1024 | true | 2.811 | 2.566 | -8.7% |
| rs | nested | 1024 | false | 2.663 | 2.527 | -5.1% |
| rs | nested | 4096 | true | 15.398 | 13.366 | -13.2% |
| rs | nested | 4096 | false | 14.683 | 13.246 | -9.8% |
| js | nested | 128 | true | 0.928 | 0.847 | -8.7% |
| js | nested | 1024 | true | 6.889 | 7.704 | +11.8% |
| js | nested | 2048 | true | 15.964 | 18.476 | +15.7% |
| js | plain | 128 | true | 2.049 | 2.301 | +12.3% |
| js | plain | 1024 | true | 16.006 | 18.195 | +13.7% |
| js | plain | 2048 | true | 28.488 | 30.420 | +6.8% |
| js | empty-table-rows | 128 | html-import | 11.232 | 1.286 | -88.6% |
| js | empty-table-rows | 1024 | html-import | 653.072 | 42.894 | -93.4% |
| js | empty-table-rows | 4096 | html-import | 10177.689 | 63.589 | -99.4% |
| js | empty-tables | 128 | html-import | 27.509 | 7.100 | -74.2% |
| js | empty-tables | 1024 | html-import | 1022.399 | 100.443 | -90.2% |
| js | empty-tables | 4096 | html-import | 31505.093 | 726.269 | -97.7% |
| rs | plain | 128 | true | 0.596 | 0.590 | -1.0% |
| rs | plain | 128 | false | 0.347 | 0.333 | -4.1% |
| rs | plain | 1024 | true | 3.397 | 3.674 | +8.2% |
| rs | plain | 1024 | false | 3.201 | 3.298 | +3.0% |
| php | table-sections | 128 | build | 5.265 | 3.605 | -31.5% |
| php | table-sections | 1024 | build | 152.594 | 50.443 | -66.9% |
| php | table-sections | 4096 | build | 1787.805 | 321.845 | -82.0% |
| php | adjacent-definitions | 128 | build | 9.079 | 6.648 | -26.8% |
| php | adjacent-definitions | 1024 | build | 293.263 | 68.930 | -76.5% |
| php | adjacent-definitions | 4096 | build | 6360.140 | 343.703 | -94.6% |
| php | plain | 1024 | parse+encode | 51.410 | 51.039 | -0.7% |

## Rust citation rejection and PHP sibling paths

4 alternating rounds on CPU 10 use 3 samples per case. Rust control cases use 401 samples per round. Every output hash matches.

[Raw session](rejected-citations-and-paths-session.json) · [CSV](rejected-citations-and-paths-session.csv) · [Graph](../charts/rejected-citations-and-paths-session.svg)

| Engine | Main | Candidate |
|---|---|---|
| js | `c77d85ead683bffc534d50ab18c1df95f1821c8b` | `29e41db6b8ff1644e2f8ddd122e2d3b15b7f6eec` |
| php | `4c1cf690ea57e6ce035dfbecce932d42684c1018` | `23350fb058dded3bd85ed08239e5db03b0679a02` |
| rs | `1aa51a380af1c5407fba49a476497ac4795adaeb` | `338a17ea3b33f782c91b686e1bfd0265b52ea02f` |

The JavaScript candidate in this session is an intermediate draft. Its ordinary citation controls led to the bounded short scan measured in the final JavaScript session below. PHP caches sibling positions once per parent and resets them for each HTML import. Rust omits lexically invalid citation groups while indexing brackets.

| Engine | Case | n | Stage / positions | Main ms | Candidate ms | Change |
|---|---|---:|---|---:|---:|---:|
| rs | nested | 128 | true | 0.272 | 0.260 | -4.4% |
| rs | nested | 128 | false | 0.264 | 0.254 | -3.6% |
| rs | nested | 1024 | true | 3.042 | 3.063 | +0.7% |
| rs | nested | 1024 | false | 3.021 | 2.866 | -5.1% |
| rs | nested | 4096 | true | 15.806 | 15.917 | +0.7% |
| rs | nested | 4096 | false | 15.035 | 14.669 | -2.4% |
| js | nested | 128 | true | 0.938 | 1.047 | +11.6% |
| js | nested | 1024 | true | 8.534 | 11.050 | +29.5% |
| js | nested | 2048 | true | 19.002 | 25.046 | +31.8% |
| js | plain | 128 | true | 2.408 | 2.273 | -5.6% |
| js | plain | 1024 | true | 20.258 | 21.775 | +7.5% |
| js | plain | 2048 | true | 47.596 | 45.334 | -4.8% |
| rs | plain | 128 | true | 0.624 | 0.612 | -1.9% |
| rs | plain | 128 | false | 0.558 | 0.541 | -3.1% |
| rs | plain | 1024 | true | 5.956 | 6.012 | +1.0% |
| rs | plain | 1024 | false | 5.223 | 5.277 | +1.0% |
| php | plain | 1024 | parse+encode | 59.660 | 63.176 | +5.9% |
| js | rejected-wrappers | 4096 | false | 7.550 | 5.276 | -30.1% |
| js | rejected-wrappers | 16384 | false | 41.492 | 25.341 | -38.9% |
| js | rejected-wrappers | 65536 | false | 308.988 | 122.028 | -60.5% |
| js | rejected-suffixes | 4096 | false | 9.636 | 7.333 | -23.9% |
| js | rejected-suffixes | 16384 | false | 121.178 | 64.228 | -47.0% |
| js | rejected-suffixes | 65536 | false | 394.772 | 193.423 | -51.0% |
| js | rejected-whitespace | 4096 | false | 9.647 | 8.544 | -11.4% |
| js | rejected-whitespace | 16384 | false | 117.628 | 37.263 | -68.3% |
| js | rejected-whitespace | 65536 | false | 393.822 | 203.293 | -48.4% |
| js | rejected-commas | 4096 | false | 12.504 | 7.330 | -41.4% |
| js | rejected-commas | 16384 | false | 76.871 | 46.789 | -39.1% |
| js | rejected-commas | 65536 | false | 406.852 | 171.152 | -57.9% |
| js | rejected-items | 128 | false | 16.084 | 0.490 | -97.0% |
| js | rejected-items | 512 | false | 236.405 | 2.117 | -99.1% |
| js | rejected-items | 1024 | false | 896.704 | 4.499 | -99.5% |
| js | rejected-middle-items | 128 | false | 1.917 | 1.075 | -43.9% |
| js | rejected-middle-items | 512 | false | 15.697 | 5.092 | -67.6% |
| js | rejected-middle-items | 1024 | false | 56.336 | 10.747 | -80.9% |
| rs | rejected-wrappers | 4096 | false | 5.077 | 0.593 | -88.3% |
| rs | rejected-wrappers | 16384 | false | 63.249 | 3.106 | -95.1% |
| rs | rejected-wrappers | 65536 | false | 933.472 | 12.876 | -98.6% |
| rs | rejected-suffixes | 4096 | false | 6.882 | 0.831 | -87.9% |
| rs | rejected-suffixes | 16384 | false | 88.744 | 4.330 | -95.1% |
| rs | rejected-suffixes | 65536 | false | 1275.178 | 18.008 | -98.6% |
| rs | rejected-whitespace | 4096 | false | 6.856 | 0.799 | -88.3% |
| rs | rejected-whitespace | 16384 | false | 88.362 | 4.382 | -95.0% |
| rs | rejected-whitespace | 65536 | false | 1287.199 | 18.221 | -98.6% |
| rs | rejected-commas | 4096 | false | 7.544 | 0.818 | -89.2% |
| rs | rejected-commas | 16384 | false | 99.891 | 4.439 | -95.6% |
| rs | rejected-commas | 65536 | false | 1447.186 | 18.567 | -98.7% |
| rs | rejected-items | 128 | false | 4.503 | 0.152 | -96.6% |
| rs | rejected-items | 512 | false | 68.317 | 0.612 | -99.1% |
| rs | rejected-items | 1024 | false | 272.397 | 1.264 | -99.5% |
| rs | rejected-middle-items | 128 | false | 0.332 | 0.284 | -14.5% |
| rs | rejected-middle-items | 512 | false | 1.209 | 1.049 | -13.2% |
| rs | rejected-middle-items | 1024 | false | 2.681 | 2.127 | -20.7% |
| php | sibling-partitioned-tables | 128 | build | 13.715 | 13.564 | -1.1% |
| php | sibling-partitioned-tables | 1024 | build | 175.346 | 165.527 | -5.6% |
| php | sibling-partitioned-tables | 4096 | build | 1096.561 | 853.722 | -22.1% |

## Final JavaScript batching through captions and composites

4 alternating rounds on CPU 11 use 3 samples per case. Every output hash matches.

[Raw session](js-session-refusals-session.json) · [CSV](js-session-refusals-session.csv) · [Graph](../charts/js-session-refusals-session.svg)

| Engine | Main | Candidate |
|---|---|---|
| js | `0fe9653ad250bd813314b7f031f659ee79d6da9f` | `d9eecc702bbbbc3d86a488bd991e038e3fc70885` |

The final renderer collects refused rows once per render pass, replacing the first draft’s per-block exception bookkeeping. Lists, blockquotes and captioned tables now batch too. No partial source is returned; earlier rows are reported before a later refusal. Complete source and loss-report hashes match.

| Engine | Case | n | Stage / positions | Main ms | Candidate ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | captioned-blank-tables | 128 | html-import | 224.951 | 44.335 | -80.3% |
| js | captioned-blank-tables | 1024 | html-import | 11966.613 | 142.960 | -98.8% |
| js | quoted-blank-tables | 128 | html-import | 176.442 | 28.975 | -83.6% |
| js | quoted-blank-tables | 1024 | html-import | 10513.844 | 142.860 | -98.6% |
| js | listed-blank-tables | 128 | html-import | 179.191 | 29.106 | -83.8% |
| js | listed-blank-tables | 1024 | html-import | 12654.871 | 216.410 | -98.3% |

## Final JavaScript citation fix with bounded short scans

4 alternating rounds on CPU 13 use 11 samples per case. Every output hash matches.

[Raw session](js-citation-final-session.json) · [CSV](js-citation-final-session.csv) · [Graph](../charts/js-citation-final-session.svg)

| Engine | Main | Candidate |
|---|---|---|
| js | `c77d85ead683bffc534d50ab18c1df95f1821c8b` | `41350ea6d3a4eb2468914328ec5c0d0c5179bdd4` |

Short citations use a bounded 64-code-unit raw scan before allocating the shared index. Long candidates validate first, last and complete intervening items in one scan; the existing item parser still owns inline content. Rejected item probes use smaller sizes because the baseline builds and parses each growing item list. Ordinary flat citation groups rise from 0.068 to 0.095 ms at n=128 (+38.7%), from 0.547 to 0.682 ms at n=1024 (+24.8%) and from 1.102 to 1.285 ms at n=2048 (+16.7%); the added indexing cost remains a control to monitor.

| Engine | Case | n | Stage / positions | Main ms | Candidate ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | nested | 128 | true | 1.031 | 1.007 | -2.3% |
| js | nested | 1024 | true | 8.558 | 8.116 | -5.2% |
| js | nested | 2048 | true | 18.643 | 17.044 | -8.6% |
| js | emphasis | 128 | true | 1.070 | 0.966 | -9.7% |
| js | emphasis | 1024 | true | 8.587 | 8.958 | +4.3% |
| js | emphasis | 2048 | true | 23.781 | 23.681 | -0.4% |
| js | link | 128 | true | 1.507 | 1.430 | -5.1% |
| js | link | 1024 | true | 21.459 | 19.027 | -11.3% |
| js | link | 2048 | true | 38.519 | 40.174 | +4.3% |
| js | group | 128 | true | 0.068 | 0.095 | +38.7% |
| js | group | 1024 | true | 0.547 | 0.682 | +24.8% |
| js | group | 2048 | true | 1.102 | 1.285 | +16.7% |
| js | unclosed | 128 | true | 0.177 | 0.191 | +7.5% |
| js | unclosed | 1024 | true | 1.502 | 1.440 | -4.1% |
| js | unclosed | 2048 | true | 2.583 | 2.688 | +4.1% |
| js | plain | 128 | true | 2.062 | 2.223 | +7.8% |
| js | plain | 1024 | true | 20.311 | 18.776 | -7.6% |
| js | plain | 2048 | true | 44.980 | 45.042 | +0.1% |
| js | rejected-wrappers | 4096 | false | 7.107 | 5.373 | -24.4% |
| js | rejected-wrappers | 16384 | false | 39.363 | 23.243 | -41.0% |
| js | rejected-wrappers | 65536 | false | 265.789 | 114.052 | -57.1% |
| js | rejected-suffixes | 4096 | false | 9.884 | 7.291 | -26.2% |
| js | rejected-suffixes | 16384 | false | 53.698 | 33.011 | -38.5% |
| js | rejected-suffixes | 65536 | false | 350.668 | 161.971 | -53.8% |
| js | rejected-whitespace | 4096 | false | 10.380 | 7.072 | -31.9% |
| js | rejected-whitespace | 16384 | false | 50.130 | 32.703 | -34.8% |
| js | rejected-whitespace | 65536 | false | 349.427 | 151.603 | -56.6% |
| js | rejected-commas | 4096 | false | 9.460 | 6.355 | -32.8% |
| js | rejected-commas | 16384 | false | 51.799 | 24.673 | -52.4% |
| js | rejected-commas | 65536 | false | 363.761 | 140.151 | -61.5% |
| js | rejected-items | 128 | false | 13.865 | 0.412 | -97.0% |
| js | rejected-items | 512 | false | 192.703 | 1.844 | -99.0% |
| js | rejected-items | 1024 | false | 720.920 | 3.889 | -99.5% |
| js | rejected-middle-items | 128 | false | 1.914 | 1.100 | -42.5% |
| js | rejected-middle-items | 512 | false | 13.743 | 4.145 | -69.8% |
| js | rejected-middle-items | 1024 | false | 44.259 | 8.208 | -81.5% |

## PHP sibling paths at 16,384 tables

2 alternating rounds on CPU 14 use 3 samples per case. Every output hash matches.

[Raw session](php-large-sibling-paths-session.json) · [CSV](php-large-sibling-paths-session.csv) · [Graph](../charts/php-large-sibling-paths-session.svg)

| Engine | Main | Candidate |
|---|---|---|
| php | `4c1cf690ea57e6ce035dfbecce932d42684c1018` | `23350fb058dded3bd85ed08239e5db03b0679a02` |

This opt-in case measures HTML-to-AST building at 16,384 sibling tables. Two alternating rounds use three samples per round, six per revision. Source origins for this older worker were checked after the run in the [saved PHP verification](php-source-origin-verification.json). It complements the smaller four-round sibling-path session; full import is not measured here.

| Engine | Case | n | Stage / positions | Main ms | Candidate ms | Change |
|---|---|---:|---|---:|---:|---:|
| php | sibling-partitioned-tables | 16384 | build | 5725.802 | 2861.538 | -50.0% |

## PHP bounded payload walk and unchanged arrays

4 alternating rounds on CPU 10 use 7 samples per case. Every output hash matches.

[Raw session](php-decode-passes-session.json) · [CSV](php-decode-passes-session.csv) · [Graph](../charts/php-decode-passes-session.svg)

| Engine | Main | Candidate |
|---|---|---|
| php | `4c1cf690ea57e6ce035dfbecce932d42684c1018` | `3f0f3c8c58488aac3fac578be5a53f011487d793` |

Depth checking and byte accounting share one bounded walk. NUL normalization and importer-hint pruning retain unchanged arrays and propagate child-change flags. Independent schema validation remains guarded. These measurements use the pre-path-merge main; the PR later merged the latest main into its branch.

| Engine | Case | n | Stage / positions | Main ms | Candidate ms | Change |
|---|---|---:|---|---:|---:|---:|
| php | table | 1024 | encode | 40.102 | 38.302 | -4.5% |
| php | table | 1024 | decode | 188.107 | 176.212 | -6.3% |
| php | table | 1024 | import | 684.654 | 640.570 | -6.4% |
| php | definition | 1024 | encode | 25.085 | 24.444 | -2.6% |
| php | definition | 1024 | decode | 112.108 | 102.078 | -8.9% |
| php | definition | 1024 | import | 276.767 | 268.396 | -3.0% |
| php | plain | 1024 | parse+encode | 54.354 | 56.270 | +3.5% |

## PHP multiline comments without repeated table scans

4 alternating rounds on CPU 11 use 7 samples per case. Every output hash matches.

[Raw session](php-table-comments-session.json) · [CSV](php-table-comments-session.csv) · [Graph](../charts/php-table-comments-session.svg)

| Engine | Main | Candidate |
|---|---|---|
| php | `4c1cf690ea57e6ce035dfbecce932d42684c1018` | `16d5edbc87db0d5017b8d19a7410cd7c5d9c3038` |

The builder and report inspection cache stable table-block decisions within their sessions. Both scaling guards fail on the measured main and pass on the candidate. The build-list-table stage enables list-table import explicitly; import includes complete source and its loss report. These measurements use the pre-path-merge main; the PR later merged the latest main into its branch.

| Engine | Case | n | Stage / positions | Main ms | Candidate ms | Change |
|---|---|---:|---|---:|---:|---:|
| php | multiline-table-comments | 128 | build-list-table | 17.471 | 4.351 | -75.1% |
| php | multiline-table-comments | 128 | import | 41.617 | 16.803 | -59.6% |
| php | multiline-table-comments | 512 | build-list-table | 230.447 | 20.636 | -91.0% |
| php | multiline-table-comments | 512 | import | 512.113 | 78.783 | -84.6% |
| php | multiline-table-comments | 1024 | build-list-table | 962.357 | 42.563 | -95.6% |
| php | multiline-table-comments | 1024 | import | 1926.670 | 140.700 | -92.7% |

## PHP marker cache retention

Fresh PHP processes parse unique attribute payloads longer than 4 KB. A short marker warms the parser before the live-memory baseline. The final result is released and cycles collected. These are retained bytes, not peak memory or throughput. Complete marker output hashes match.

Main: `d14268ab2bc5ed579b834a73def0ba993dceae20`. Candidate: `4c1cf690ea57e6ce035dfbecce932d42684c1018`.

[Raw retention measurement](php-cache-retention.json) · [Graph](../charts/php-cache-retention.svg)

| Unique payloads | Main bytes | Candidate bytes |
|---:|---:|---:|
| 128 | 2157248 | 0 |
| 512 | 8621760 | 0 |
| 1024 | 17243840 | 0 |
