# Pinned merged main commits versus the last two retained tags

Pinned to the October 6 audit merges. Later main changes affect documentation, tests and release tooling; runtime source and dependency manifests match those pins.

Release tags retain their original history measurements; each main point records its refresh session in the raw JSON. Check the recorded sessions and build configurations before attributing a difference to code. Lower milliseconds are faster. Percentage differences appear only when output hashes match and sample ranges do not overlap; they do not isolate code speedups. Sample ranges and source/build provenance are in the [history report](engine-history.md) and [raw JSON](engine-history.json).

| Engine | Main commit | Recent tags |
|---|---|---|
| js | `355d6de61406342d8aa989afed358f0d004ff586` | 0.1.8, 0.1.9 |
| php | `45de896cea3d8944287f28ca155dea3afe04feec` | 0.1.9, 0.1.10 |
| rs | `5b7bea1ada2a507867d62278145fd7f9fd3f000d` | 0.1.6, 0.1.7 |

js: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [3.4912109375, 4.6884765625, 5.751953125] to [4.279296875, 4.765625, 5.74365234375].


php: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [4.279296875, 4.765625, 5.74365234375] to [4.064453125, 4.591796875, 5.58740234375].


rs: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [4.064453125, 4.591796875, 5.58740234375] to [4.064453125, 4.591796875, 5.58740234375].


[CSV](latest-main-comparison.csv)

| Engine | Case | n | Tag | Tag ms | Main ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | quoted_fences | 128 | 0.1.8 | 0.364 | 0.290 | ranges overlap |
| js | quoted_fences | 128 | 0.1.9 | 0.311 | 0.290 | ranges overlap |
| js | verse_definitions | 128 | 0.1.8 | 0.833 | 0.784 | ranges overlap |
| js | verse_definitions | 128 | 0.1.9 | 0.744 | 0.784 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.8 | 1.002 | 0.798 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.9 | 0.850 | 0.798 | ranges overlap |
| js | paragraphs | 128 | 0.1.8 | 0.083 | 0.086 | ranges overlap |
| js | paragraphs | 128 | 0.1.9 | 0.079 | 0.086 | ranges overlap |
| js | mixed_document | 128 | 0.1.8 | 1.465 | 1.483 | ranges overlap |
| js | mixed_document | 128 | 0.1.9 | 1.451 | 1.483 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.8 | 2.584 | 2.194 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.9 | 2.401 | 2.194 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.8 | 7.014 | 5.802 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.9 | 6.334 | 5.802 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.8 | 8.962 | 6.407 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.9 | 7.843 | 6.407 | ranges overlap |
| js | paragraphs | 1024 | 0.1.8 | 0.751 | 0.739 | ranges overlap |
| js | paragraphs | 1024 | 0.1.9 | 0.673 | 0.739 | ranges overlap |
| js | mixed_document | 1024 | 0.1.8 | 25.526 | 19.464 | ranges overlap |
| js | mixed_document | 1024 | 0.1.9 | 26.744 | 19.464 | ranges overlap |
| php | quoted_fences | 128 | 0.1.9 | 1.667 | 1.788 | ranges overlap |
| php | quoted_fences | 128 | 0.1.10 | 1.255 | 1.788 | ranges overlap |
| php | verse_definitions | 128 | 0.1.9 | 3.983 | 4.470 | ranges overlap |
| php | verse_definitions | 128 | 0.1.10 | 17.196 | 4.470 | -74.0% |
| php | verse_equivalent | 128 | 0.1.9 | 3.699 | 4.631 | ranges overlap |
| php | verse_equivalent | 128 | 0.1.10 | 24.120 | 4.631 | -80.8% |
| php | paragraphs | 128 | 0.1.9 | 0.372 | 0.244 | -34.4% |
| php | paragraphs | 128 | 0.1.10 | 0.337 | 0.244 | -27.4% |
| php | mixed_document | 128 | 0.1.9 | 4.062 | 3.291 | ranges overlap |
| php | mixed_document | 128 | 0.1.10 | 4.114 | 3.291 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.9 | 1.428 | 1.721 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.10 | 1.303 | 1.721 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.9 | 1.367 | 1.704 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.10 | 1.294 | 1.704 | ranges overlap |
| php | html_table | 128 | 0.1.9 | 75.185 | 50.393 | -33.0% |
| php | html_table | 128 | 0.1.10 | 86.981 | 50.393 | -42.1% |
| php | html_definition_list | 128 | 0.1.9 | 36.865 | 18.056 | ranges overlap |
| php | html_definition_list | 128 | 0.1.10 | 44.049 | 18.056 | -59.0% |
| php | quoted_fences | 1024 | 0.1.9 | 9.164 | 12.197 | ranges overlap |
| php | quoted_fences | 1024 | 0.1.10 | 10.285 | 12.197 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.9 | 27.927 | 35.369 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.10 | 800.499 | 35.369 | -95.6% |
| php | verse_equivalent | 1024 | 0.1.9 | 26.715 | 36.706 | ranges overlap |
| php | verse_equivalent | 1024 | 0.1.10 | 1174.312 | 36.706 | -96.9% |
| php | paragraphs | 1024 | 0.1.9 | 2.240 | 1.913 | -14.6% |
| php | paragraphs | 1024 | 0.1.10 | 2.593 | 1.913 | -26.2% |
| php | mixed_document | 1024 | 0.1.9 | 927.353 | 474.028 | -48.9% |
| php | mixed_document | 1024 | 0.1.10 | 557.954 | 474.028 | ranges overlap |
| php | quoted_false_mixed_closer | 1024 | 0.1.9 | 7.992 | 12.107 | ranges overlap |
| php | quoted_false_mixed_closer | 1024 | 0.1.10 | 10.379 | 12.107 | ranges overlap |
| php | quoted_indented_closer | 1024 | 0.1.9 | 7.642 | 11.817 | ranges overlap |
| php | quoted_indented_closer | 1024 | 0.1.10 | 9.795 | 11.817 | ranges overlap |
| php | html_table | 1024 | 0.1.9 | 703.066 | 517.361 | ranges overlap |
| php | html_table | 1024 | 0.1.10 | 1499.097 | 517.361 | -65.5% |
| php | html_definition_list | 1024 | 0.1.9 | 312.732 | 202.244 | -35.3% |
| php | html_definition_list | 1024 | 0.1.10 | 1190.962 | 202.244 | -83.0% |
| rs | quoted_fences | 128 | 0.1.6 | 0.091 | 0.070 | ranges overlap |
| rs | quoted_fences | 128 | 0.1.7 | 0.101 | 0.070 | -30.1% |
| rs | verse_definitions | 128 | 0.1.6 | 0.163 | 0.152 | n/a: different output |
| rs | verse_definitions | 128 | 0.1.7 | 0.184 | 0.152 | n/a: different output |
| rs | verse_equivalent | 128 | 0.1.6 | 0.136 | 0.168 | ranges overlap |
| rs | verse_equivalent | 128 | 0.1.7 | 0.197 | 0.168 | ranges overlap |
| rs | paragraphs | 128 | 0.1.6 | 0.025 | 0.020 | ranges overlap |
| rs | paragraphs | 128 | 0.1.7 | 0.028 | 0.020 | -27.0% |
| rs | mixed_document | 128 | 0.1.6 | 0.282 | 0.208 | -26.1% |
| rs | mixed_document | 128 | 0.1.7 | 0.389 | 0.208 | -46.5% |
| rs | quoted_fences | 1024 | 0.1.6 | 1.841 | 0.646 | -64.9% |
| rs | quoted_fences | 1024 | 0.1.7 | 2.208 | 0.646 | -70.8% |
| rs | verse_definitions | 1024 | 0.1.6 | 1.075 | 1.439 | n/a: different output |
| rs | verse_definitions | 1024 | 0.1.7 | 1.821 | 1.439 | n/a: different output |
| rs | verse_equivalent | 1024 | 0.1.6 | 1.248 | 1.551 | ranges overlap |
| rs | verse_equivalent | 1024 | 0.1.7 | 1.788 | 1.551 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.6 | 0.199 | 0.157 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.7 | 0.218 | 0.157 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.6 | 2.421 | 1.721 | -28.9% |
| rs | mixed_document | 1024 | 0.1.7 | 2.649 | 1.721 | -35.0% |
