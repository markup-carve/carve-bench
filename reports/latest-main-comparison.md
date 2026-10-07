# Pinned merged main commits versus the last two retained tags

Rust is pinned to merged commit 2246a9b2b; the newer main at setup changes only CHANGELOG.md and tests. Runtime sources and dependency manifests are identical.

Release tags retain their original history measurements; each main point records its refresh session in the raw JSON. Check the recorded sessions and build configurations before attributing a difference to code. Lower milliseconds are faster. Percentage differences appear only when output hashes match and sample ranges do not overlap; they do not isolate code speedups. Sample ranges and source/build provenance are in the [history report](engine-history.md) and [raw JSON](engine-history.json).

| Engine | Main commit | Recent tags |
|---|---|---|
| js | `a5c6d6457438a2d0519d474b752a6dac5c0d00bc` | 0.1.8, 0.1.9 |
| php | `46da1921cfa92f82b85793138da008581b3a42e2` | 0.1.9, 0.1.10 |
| rs | `2246a9b2b6e68b10530736af611ac0263c951d39` | 0.1.6, 0.1.7 |

js: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [5.69287109375, 6.599609375, 6.95947265625] to [5.5126953125, 6.48583984375, 6.91162109375].


php: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [5.5126953125, 6.48583984375, 6.91162109375] to [5.78955078125, 6.28857421875, 6.8017578125].


rs: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [5.78955078125, 6.28857421875, 6.8017578125] to [5.72607421875, 6.26708984375, 6.7919921875].


[CSV](latest-main-comparison.csv)

| Engine | Case | n | Tag | Tag ms | Main ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | quoted_fences | 128 | 0.1.8 | 0.364 | 0.242 | ranges overlap |
| js | quoted_fences | 128 | 0.1.9 | 0.311 | 0.242 | ranges overlap |
| js | verse_definitions | 128 | 0.1.8 | 0.833 | 0.626 | ranges overlap |
| js | verse_definitions | 128 | 0.1.9 | 0.744 | 0.626 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.8 | 1.002 | 0.639 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.9 | 0.850 | 0.639 | ranges overlap |
| js | paragraphs | 128 | 0.1.8 | 0.083 | 0.073 | ranges overlap |
| js | paragraphs | 128 | 0.1.9 | 0.079 | 0.073 | ranges overlap |
| js | mixed_document | 128 | 0.1.8 | 1.465 | 1.154 | ranges overlap |
| js | mixed_document | 128 | 0.1.9 | 1.451 | 1.154 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.8 | 2.584 | 1.752 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.9 | 2.401 | 1.752 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.8 | 7.014 | 4.791 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.9 | 6.334 | 4.791 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.8 | 8.962 | 5.120 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.9 | 7.843 | 5.120 | ranges overlap |
| js | paragraphs | 1024 | 0.1.8 | 0.751 | 0.619 | ranges overlap |
| js | paragraphs | 1024 | 0.1.9 | 0.673 | 0.619 | ranges overlap |
| js | mixed_document | 1024 | 0.1.8 | 25.526 | 16.864 | ranges overlap |
| js | mixed_document | 1024 | 0.1.9 | 26.744 | 16.864 | ranges overlap |
| php | quoted_fences | 128 | 0.1.9 | 1.667 | 1.410 | ranges overlap |
| php | quoted_fences | 128 | 0.1.10 | 1.255 | 1.410 | ranges overlap |
| php | verse_definitions | 128 | 0.1.9 | 3.983 | 3.661 | ranges overlap |
| php | verse_definitions | 128 | 0.1.10 | 17.196 | 3.661 | -78.7% |
| php | verse_equivalent | 128 | 0.1.9 | 3.699 | 3.842 | ranges overlap |
| php | verse_equivalent | 128 | 0.1.10 | 24.120 | 3.842 | -84.1% |
| php | paragraphs | 128 | 0.1.9 | 0.372 | 0.202 | -45.7% |
| php | paragraphs | 128 | 0.1.10 | 0.337 | 0.202 | -40.0% |
| php | mixed_document | 128 | 0.1.9 | 4.062 | 2.640 | ranges overlap |
| php | mixed_document | 128 | 0.1.10 | 4.114 | 2.640 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.9 | 1.428 | 1.423 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.10 | 1.303 | 1.423 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.9 | 1.367 | 1.433 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.10 | 1.294 | 1.433 | ranges overlap |
| php | html_table | 128 | 0.1.9 | 75.185 | 43.377 | -42.3% |
| php | html_table | 128 | 0.1.10 | 86.981 | 43.377 | -50.1% |
| php | html_definition_list | 128 | 0.1.9 | 36.865 | 16.387 | -55.5% |
| php | html_definition_list | 128 | 0.1.10 | 44.049 | 16.387 | -62.8% |
| php | quoted_fences | 1024 | 0.1.9 | 9.164 | 10.781 | ranges overlap |
| php | quoted_fences | 1024 | 0.1.10 | 10.285 | 10.781 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.9 | 27.927 | 30.337 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.10 | 800.499 | 30.337 | -96.2% |
| php | verse_equivalent | 1024 | 0.1.9 | 26.715 | 31.494 | ranges overlap |
| php | verse_equivalent | 1024 | 0.1.10 | 1174.312 | 31.494 | -97.3% |
| php | paragraphs | 1024 | 0.1.9 | 2.240 | 1.601 | -28.5% |
| php | paragraphs | 1024 | 0.1.10 | 2.593 | 1.601 | -38.2% |
| php | mixed_document | 1024 | 0.1.9 | 927.353 | 464.685 | -49.9% |
| php | mixed_document | 1024 | 0.1.10 | 557.954 | 464.685 | ranges overlap |
| php | quoted_false_mixed_closer | 1024 | 0.1.9 | 7.992 | 10.837 | ranges overlap |
| php | quoted_false_mixed_closer | 1024 | 0.1.10 | 10.379 | 10.837 | ranges overlap |
| php | quoted_indented_closer | 1024 | 0.1.9 | 7.642 | 10.659 | ranges overlap |
| php | quoted_indented_closer | 1024 | 0.1.10 | 9.795 | 10.659 | ranges overlap |
| php | html_table | 1024 | 0.1.9 | 703.066 | 471.890 | -32.9% |
| php | html_table | 1024 | 0.1.10 | 1499.097 | 471.890 | -68.5% |
| php | html_definition_list | 1024 | 0.1.9 | 312.732 | 165.573 | -47.1% |
| php | html_definition_list | 1024 | 0.1.10 | 1190.962 | 165.573 | -86.1% |
| rs | quoted_fences | 128 | 0.1.6 | 0.091 | 0.073 | ranges overlap |
| rs | quoted_fences | 128 | 0.1.7 | 0.101 | 0.073 | ranges overlap |
| rs | verse_definitions | 128 | 0.1.6 | 0.163 | 0.161 | n/a: different output |
| rs | verse_definitions | 128 | 0.1.7 | 0.184 | 0.161 | n/a: different output |
| rs | verse_equivalent | 128 | 0.1.6 | 0.136 | 0.186 | ranges overlap |
| rs | verse_equivalent | 128 | 0.1.7 | 0.197 | 0.186 | ranges overlap |
| rs | paragraphs | 128 | 0.1.6 | 0.025 | 0.022 | ranges overlap |
| rs | paragraphs | 128 | 0.1.7 | 0.028 | 0.022 | ranges overlap |
| rs | mixed_document | 128 | 0.1.6 | 0.282 | 0.219 | ranges overlap |
| rs | mixed_document | 128 | 0.1.7 | 0.389 | 0.219 | ranges overlap |
| rs | quoted_fences | 1024 | 0.1.6 | 1.841 | 0.694 | -62.3% |
| rs | quoted_fences | 1024 | 0.1.7 | 2.208 | 0.694 | -68.6% |
| rs | verse_definitions | 1024 | 0.1.6 | 1.075 | 1.601 | n/a: different output |
| rs | verse_definitions | 1024 | 0.1.7 | 1.821 | 1.601 | n/a: different output |
| rs | verse_equivalent | 1024 | 0.1.6 | 1.248 | 1.727 | ranges overlap |
| rs | verse_equivalent | 1024 | 0.1.7 | 1.788 | 1.727 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.6 | 0.199 | 0.174 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.7 | 0.218 | 0.174 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.6 | 2.421 | 1.844 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.7 | 2.649 | 1.844 | -30.4% |
