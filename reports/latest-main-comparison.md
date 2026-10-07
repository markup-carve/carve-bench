# Pinned merged main commits versus the last two retained tags

PHP is pinned to merged commit 40653c424; the newer main at setup changes only CHANGELOG.md. Runtime sources and dependency manifests are identical.

Release tags retain their original history measurements; each main point records its refresh session in the raw JSON. Check the recorded sessions and build configurations before attributing a difference to code. Lower milliseconds are faster. Percentage differences appear only when output hashes match and sample ranges do not overlap; they do not isolate code speedups. Sample ranges and source/build provenance are in the [history report](engine-history.md) and [raw JSON](engine-history.json).

| Engine | Main commit | Recent tags |
|---|---|---|
| js | `5b9ca1632e179418944bc869ddd4dbc4165f9485` | 0.1.8, 0.1.9 |
| php | `40653c424dc9d3cc063aeb542696d42ffb58ea79` | 0.1.9, 0.1.10 |
| rs | `2246a9b2b6e68b10530736af611ac0263c951d39` | 0.1.6, 0.1.7 |

js: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [1.6943359375, 2.181640625, 2.2548828125] to [2.39794921875, 2.3115234375, 2.29638671875].


php: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [2.39794921875, 2.3115234375, 2.29638671875] to [1.8603515625, 2.15380859375, 2.240234375].


rs: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [1.8603515625, 2.15380859375, 2.240234375] to [1.8603515625, 2.15380859375, 2.240234375].


[CSV](latest-main-comparison.csv)

| Engine | Case | n | Tag | Tag ms | Main ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | quoted_fences | 128 | 0.1.8 | 0.364 | 0.230 | ranges overlap |
| js | quoted_fences | 128 | 0.1.9 | 0.311 | 0.230 | ranges overlap |
| js | verse_definitions | 128 | 0.1.8 | 0.833 | 0.589 | ranges overlap |
| js | verse_definitions | 128 | 0.1.9 | 0.744 | 0.589 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.8 | 1.002 | 0.610 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.9 | 0.850 | 0.610 | ranges overlap |
| js | paragraphs | 128 | 0.1.8 | 0.083 | 0.070 | ranges overlap |
| js | paragraphs | 128 | 0.1.9 | 0.079 | 0.070 | ranges overlap |
| js | mixed_document | 128 | 0.1.8 | 1.465 | 1.135 | ranges overlap |
| js | mixed_document | 128 | 0.1.9 | 1.451 | 1.135 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.8 | 2.584 | 1.640 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.9 | 2.401 | 1.640 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.8 | 7.014 | 4.591 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.9 | 6.334 | 4.591 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.8 | 8.962 | 4.725 | -47.3% |
| js | verse_equivalent | 1024 | 0.1.9 | 7.843 | 4.725 | ranges overlap |
| js | paragraphs | 1024 | 0.1.8 | 0.751 | 0.575 | ranges overlap |
| js | paragraphs | 1024 | 0.1.9 | 0.673 | 0.575 | ranges overlap |
| js | mixed_document | 1024 | 0.1.8 | 25.526 | 15.812 | -38.1% |
| js | mixed_document | 1024 | 0.1.9 | 26.744 | 15.812 | -40.9% |
| php | quoted_fences | 128 | 0.1.9 | 1.667 | 1.371 | ranges overlap |
| php | quoted_fences | 128 | 0.1.10 | 1.255 | 1.371 | ranges overlap |
| php | verse_definitions | 128 | 0.1.9 | 3.983 | 3.494 | ranges overlap |
| php | verse_definitions | 128 | 0.1.10 | 17.196 | 3.494 | -79.7% |
| php | verse_equivalent | 128 | 0.1.9 | 3.699 | 3.650 | ranges overlap |
| php | verse_equivalent | 128 | 0.1.10 | 24.120 | 3.650 | -84.9% |
| php | paragraphs | 128 | 0.1.9 | 0.372 | 0.194 | -47.9% |
| php | paragraphs | 128 | 0.1.10 | 0.337 | 0.194 | -42.4% |
| php | mixed_document | 128 | 0.1.9 | 4.062 | 2.604 | ranges overlap |
| php | mixed_document | 128 | 0.1.10 | 4.114 | 2.604 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.9 | 1.428 | 1.325 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.10 | 1.303 | 1.325 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.9 | 1.367 | 1.374 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.10 | 1.294 | 1.374 | ranges overlap |
| php | html_table | 128 | 0.1.9 | 75.185 | 39.560 | -47.4% |
| php | html_table | 128 | 0.1.10 | 86.981 | 39.560 | -54.5% |
| php | html_definition_list | 128 | 0.1.9 | 36.865 | 14.554 | -60.5% |
| php | html_definition_list | 128 | 0.1.10 | 44.049 | 14.554 | -67.0% |
| php | quoted_fences | 1024 | 0.1.9 | 9.164 | 9.729 | ranges overlap |
| php | quoted_fences | 1024 | 0.1.10 | 10.285 | 9.729 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.9 | 27.927 | 28.274 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.10 | 800.499 | 28.274 | -96.5% |
| php | verse_equivalent | 1024 | 0.1.9 | 26.715 | 29.197 | ranges overlap |
| php | verse_equivalent | 1024 | 0.1.10 | 1174.312 | 29.197 | -97.5% |
| php | paragraphs | 1024 | 0.1.9 | 2.240 | 1.552 | ranges overlap |
| php | paragraphs | 1024 | 0.1.10 | 2.593 | 1.552 | ranges overlap |
| php | mixed_document | 1024 | 0.1.9 | 927.353 | 379.399 | -59.1% |
| php | mixed_document | 1024 | 0.1.10 | 557.954 | 379.399 | -32.0% |
| php | quoted_false_mixed_closer | 1024 | 0.1.9 | 7.992 | 9.755 | ranges overlap |
| php | quoted_false_mixed_closer | 1024 | 0.1.10 | 10.379 | 9.755 | ranges overlap |
| php | quoted_indented_closer | 1024 | 0.1.9 | 7.642 | 9.751 | ranges overlap |
| php | quoted_indented_closer | 1024 | 0.1.10 | 9.795 | 9.751 | ranges overlap |
| php | html_table | 1024 | 0.1.9 | 703.066 | 384.436 | -45.3% |
| php | html_table | 1024 | 0.1.10 | 1499.097 | 384.436 | -74.4% |
| php | html_definition_list | 1024 | 0.1.9 | 312.732 | 147.269 | -52.9% |
| php | html_definition_list | 1024 | 0.1.10 | 1190.962 | 147.269 | -87.6% |
| rs | quoted_fences | 128 | 0.1.6 | 0.091 | 0.070 | ranges overlap |
| rs | quoted_fences | 128 | 0.1.7 | 0.101 | 0.070 | ranges overlap |
| rs | verse_definitions | 128 | 0.1.6 | 0.163 | 0.150 | n/a: different output |
| rs | verse_definitions | 128 | 0.1.7 | 0.184 | 0.150 | n/a: different output |
| rs | verse_equivalent | 128 | 0.1.6 | 0.136 | 0.170 | ranges overlap |
| rs | verse_equivalent | 128 | 0.1.7 | 0.197 | 0.170 | ranges overlap |
| rs | paragraphs | 128 | 0.1.6 | 0.025 | 0.021 | ranges overlap |
| rs | paragraphs | 128 | 0.1.7 | 0.028 | 0.021 | ranges overlap |
| rs | mixed_document | 128 | 0.1.6 | 0.282 | 0.208 | -26.2% |
| rs | mixed_document | 128 | 0.1.7 | 0.389 | 0.208 | -46.6% |
| rs | quoted_fences | 1024 | 0.1.6 | 1.841 | 0.642 | -65.1% |
| rs | quoted_fences | 1024 | 0.1.7 | 2.208 | 0.642 | -70.9% |
| rs | verse_definitions | 1024 | 0.1.6 | 1.075 | 1.382 | n/a: different output |
| rs | verse_definitions | 1024 | 0.1.7 | 1.821 | 1.382 | n/a: different output |
| rs | verse_equivalent | 1024 | 0.1.6 | 1.248 | 1.531 | ranges overlap |
| rs | verse_equivalent | 1024 | 0.1.7 | 1.788 | 1.531 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.6 | 0.199 | 0.163 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.7 | 0.218 | 0.163 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.6 | 2.421 | 1.727 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.7 | 2.649 | 1.727 | ranges overlap |
