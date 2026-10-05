# Latest merged main versus the last two retained tags

Release tags retain their original history measurements; each main point records its refresh session in the raw JSON. Check the recorded sessions and build configurations before attributing a difference to code. Lower milliseconds are faster. Percentage differences appear only when output hashes match and sample ranges do not overlap; they do not isolate code speedups. Sample ranges and source/build provenance are in the [history report](engine-history.md) and [raw JSON](engine-history.json).

| Engine | Main commit | Recent tags |
|---|---|---|
| js | `a7c80d37fb322d28bc5061175bbd9c7f7638c175` | 0.1.8, 0.1.9 |
| php | `49c235d768ea6faec074d4b561ed3783d99b6fbd` | 0.1.9, 0.1.10 |
| rs | `8ee78ecb83d82ed81c544c17483e0eb111398f9d` | 0.1.6, 0.1.7 |

js: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [1.05078125, 1.29150390625, 1.603515625] to [3.32177734375, 1.775390625, 1.75439453125].


php: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [3.32177734375, 1.775390625, 1.75439453125] to [2.328125, 1.81640625, 1.76904296875].


rs: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [2.328125, 1.81640625, 1.76904296875] to [2.328125, 1.81640625, 1.76904296875].


[CSV](latest-main-comparison.csv)

| Engine | Case | n | Tag | Tag ms | Main ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | quoted_fences | 128 | 0.1.8 | 0.364 | 0.229 | ranges overlap |
| js | quoted_fences | 128 | 0.1.9 | 0.311 | 0.229 | ranges overlap |
| js | verse_definitions | 128 | 0.1.8 | 0.833 | 0.569 | ranges overlap |
| js | verse_definitions | 128 | 0.1.9 | 0.744 | 0.569 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.8 | 1.002 | 0.612 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.9 | 0.850 | 0.612 | ranges overlap |
| js | paragraphs | 128 | 0.1.8 | 0.083 | 0.071 | ranges overlap |
| js | paragraphs | 128 | 0.1.9 | 0.079 | 0.071 | ranges overlap |
| js | mixed_document | 128 | 0.1.8 | 1.465 | 1.068 | ranges overlap |
| js | mixed_document | 128 | 0.1.9 | 1.451 | 1.068 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.8 | 2.584 | 1.680 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.9 | 2.401 | 1.680 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.8 | 7.014 | 4.796 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.9 | 6.334 | 4.796 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.8 | 8.962 | 4.656 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.9 | 7.843 | 4.656 | ranges overlap |
| js | paragraphs | 1024 | 0.1.8 | 0.751 | 0.564 | ranges overlap |
| js | paragraphs | 1024 | 0.1.9 | 0.673 | 0.564 | ranges overlap |
| js | mixed_document | 1024 | 0.1.8 | 25.526 | 15.259 | -40.2% |
| js | mixed_document | 1024 | 0.1.9 | 26.744 | 15.259 | -42.9% |
| php | quoted_fences | 128 | 0.1.9 | 1.667 | 1.402 | ranges overlap |
| php | quoted_fences | 128 | 0.1.10 | 1.255 | 1.402 | ranges overlap |
| php | verse_definitions | 128 | 0.1.9 | 3.983 | 3.545 | ranges overlap |
| php | verse_definitions | 128 | 0.1.10 | 17.196 | 3.545 | -79.4% |
| php | verse_equivalent | 128 | 0.1.9 | 3.699 | 3.816 | ranges overlap |
| php | verse_equivalent | 128 | 0.1.10 | 24.120 | 3.816 | -84.2% |
| php | paragraphs | 128 | 0.1.9 | 0.372 | 0.198 | -46.9% |
| php | paragraphs | 128 | 0.1.10 | 0.337 | 0.198 | -41.3% |
| php | mixed_document | 128 | 0.1.9 | 4.062 | 2.627 | ranges overlap |
| php | mixed_document | 128 | 0.1.10 | 4.114 | 2.627 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.9 | 1.428 | 1.375 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.10 | 1.303 | 1.375 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.9 | 1.367 | 1.387 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.10 | 1.294 | 1.387 | ranges overlap |
| php | html_table | 128 | 0.1.9 | 75.185 | 41.151 | -45.3% |
| php | html_table | 128 | 0.1.10 | 86.981 | 41.151 | -52.7% |
| php | html_definition_list | 128 | 0.1.9 | 36.865 | 15.368 | -58.3% |
| php | html_definition_list | 128 | 0.1.10 | 44.049 | 15.368 | -65.1% |
| php | quoted_fences | 1024 | 0.1.9 | 9.164 | 9.918 | ranges overlap |
| php | quoted_fences | 1024 | 0.1.10 | 10.285 | 9.918 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.9 | 27.927 | 29.180 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.10 | 800.499 | 29.180 | -96.4% |
| php | verse_equivalent | 1024 | 0.1.9 | 26.715 | 30.352 | ranges overlap |
| php | verse_equivalent | 1024 | 0.1.10 | 1174.312 | 30.352 | -97.4% |
| php | paragraphs | 1024 | 0.1.9 | 2.240 | 1.553 | -30.6% |
| php | paragraphs | 1024 | 0.1.10 | 2.593 | 1.553 | -40.1% |
| php | mixed_document | 1024 | 0.1.9 | 927.353 | 422.297 | -54.5% |
| php | mixed_document | 1024 | 0.1.10 | 557.954 | 422.297 | -24.3% |
| php | quoted_false_mixed_closer | 1024 | 0.1.9 | 7.992 | 9.950 | ranges overlap |
| php | quoted_false_mixed_closer | 1024 | 0.1.10 | 10.379 | 9.950 | ranges overlap |
| php | quoted_indented_closer | 1024 | 0.1.9 | 7.642 | 10.096 | ranges overlap |
| php | quoted_indented_closer | 1024 | 0.1.10 | 9.795 | 10.096 | ranges overlap |
| php | html_table | 1024 | 0.1.9 | 703.066 | 423.339 | -39.8% |
| php | html_table | 1024 | 0.1.10 | 1499.097 | 423.339 | -71.8% |
| php | html_definition_list | 1024 | 0.1.9 | 312.732 | 160.698 | -48.6% |
| php | html_definition_list | 1024 | 0.1.10 | 1190.962 | 160.698 | -86.5% |
| rs | quoted_fences | 128 | 0.1.6 | 0.091 | 0.072 | -20.8% |
| rs | quoted_fences | 128 | 0.1.7 | 0.101 | 0.072 | -28.1% |
| rs | verse_definitions | 128 | 0.1.6 | 0.163 | 0.146 | n/a: different output |
| rs | verse_definitions | 128 | 0.1.7 | 0.184 | 0.146 | n/a: different output |
| rs | verse_equivalent | 128 | 0.1.6 | 0.136 | 0.170 | ranges overlap |
| rs | verse_equivalent | 128 | 0.1.7 | 0.197 | 0.170 | ranges overlap |
| rs | paragraphs | 128 | 0.1.6 | 0.025 | 0.021 | -18.4% |
| rs | paragraphs | 128 | 0.1.7 | 0.028 | 0.021 | -24.8% |
| rs | mixed_document | 128 | 0.1.6 | 0.282 | 0.213 | ranges overlap |
| rs | mixed_document | 128 | 0.1.7 | 0.389 | 0.213 | -45.2% |
| rs | quoted_fences | 1024 | 0.1.6 | 1.841 | 0.649 | -64.8% |
| rs | quoted_fences | 1024 | 0.1.7 | 2.208 | 0.649 | -70.6% |
| rs | verse_definitions | 1024 | 0.1.6 | 1.075 | 1.417 | n/a: different output |
| rs | verse_definitions | 1024 | 0.1.7 | 1.821 | 1.417 | n/a: different output |
| rs | verse_equivalent | 1024 | 0.1.6 | 1.248 | 1.542 | ranges overlap |
| rs | verse_equivalent | 1024 | 0.1.7 | 1.788 | 1.542 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.6 | 0.199 | 0.164 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.7 | 0.218 | 0.164 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.6 | 2.421 | 1.785 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.7 | 2.649 | 1.785 | ranges overlap |
