# Latest merged main versus the last two retained tags

Release tags retain their original history measurements; each main point records its refresh session in the raw JSON. Check the recorded sessions and build configurations before attributing a difference to code. Lower milliseconds are faster. Percentage differences appear only when output hashes match and sample ranges do not overlap; they do not isolate code speedups. Sample ranges and source/build provenance are in the [history report](engine-history.md) and [raw JSON](engine-history.json).

| Engine | Main commit | Recent tags |
|---|---|---|
| js | `a7c80d37fb322d28bc5061175bbd9c7f7638c175` | 0.1.8, 0.1.9 |
| php | `49c235d768ea6faec074d4b561ed3783d99b6fbd` | 0.1.9, 0.1.10 |
| rs | `8ee78ecb83d82ed81c544c17483e0eb111398f9d` | 0.1.6, 0.1.7 |

js: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [0.90234375, 1.5078125, 1.7451171875] to [1.73046875, 1.64599609375, 1.78369140625].


php: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [1.73046875, 1.64599609375, 1.78369140625] to [1.3935546875, 1.5673828125, 1.74560546875].


rs: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [1.3935546875, 1.5673828125, 1.74560546875] to [1.4423828125, 1.57470703125, 1.7470703125].


[CSV](latest-main-comparison.csv)

| Engine | Case | n | Tag | Tag ms | Main ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | quoted_fences | 128 | 0.1.8 | 0.364 | 0.220 | ranges overlap |
| js | quoted_fences | 128 | 0.1.9 | 0.311 | 0.220 | ranges overlap |
| js | verse_definitions | 128 | 0.1.8 | 0.833 | 0.591 | ranges overlap |
| js | verse_definitions | 128 | 0.1.9 | 0.744 | 0.591 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.8 | 1.002 | 0.608 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.9 | 0.850 | 0.608 | ranges overlap |
| js | paragraphs | 128 | 0.1.8 | 0.083 | 0.069 | ranges overlap |
| js | paragraphs | 128 | 0.1.9 | 0.079 | 0.069 | ranges overlap |
| js | mixed_document | 128 | 0.1.8 | 1.465 | 1.059 | ranges overlap |
| js | mixed_document | 128 | 0.1.9 | 1.451 | 1.059 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.8 | 2.584 | 1.682 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.9 | 2.401 | 1.682 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.8 | 7.014 | 4.344 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.9 | 6.334 | 4.344 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.8 | 8.962 | 4.643 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.9 | 7.843 | 4.643 | ranges overlap |
| js | paragraphs | 1024 | 0.1.8 | 0.751 | 0.567 | ranges overlap |
| js | paragraphs | 1024 | 0.1.9 | 0.673 | 0.567 | ranges overlap |
| js | mixed_document | 1024 | 0.1.8 | 25.526 | 14.898 | ranges overlap |
| js | mixed_document | 1024 | 0.1.9 | 26.744 | 14.898 | -44.3% |
| php | quoted_fences | 128 | 0.1.9 | 1.667 | 1.308 | ranges overlap |
| php | quoted_fences | 128 | 0.1.10 | 1.255 | 1.308 | ranges overlap |
| php | verse_definitions | 128 | 0.1.9 | 3.983 | 3.366 | ranges overlap |
| php | verse_definitions | 128 | 0.1.10 | 17.196 | 3.366 | -80.4% |
| php | verse_equivalent | 128 | 0.1.9 | 3.699 | 3.514 | ranges overlap |
| php | verse_equivalent | 128 | 0.1.10 | 24.120 | 3.514 | -85.4% |
| php | paragraphs | 128 | 0.1.9 | 0.372 | 0.185 | -50.3% |
| php | paragraphs | 128 | 0.1.10 | 0.337 | 0.185 | -45.0% |
| php | mixed_document | 128 | 0.1.9 | 4.062 | 2.495 | ranges overlap |
| php | mixed_document | 128 | 0.1.10 | 4.114 | 2.495 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.9 | 1.428 | 1.338 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.10 | 1.303 | 1.338 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.9 | 1.367 | 1.357 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.10 | 1.294 | 1.357 | ranges overlap |
| php | html_table | 128 | 0.1.9 | 75.185 | 39.117 | -48.0% |
| php | html_table | 128 | 0.1.10 | 86.981 | 39.117 | -55.0% |
| php | html_definition_list | 128 | 0.1.9 | 36.865 | 13.960 | -62.1% |
| php | html_definition_list | 128 | 0.1.10 | 44.049 | 13.960 | -68.3% |
| php | quoted_fences | 1024 | 0.1.9 | 9.164 | 9.328 | ranges overlap |
| php | quoted_fences | 1024 | 0.1.10 | 10.285 | 9.328 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.9 | 27.927 | 26.673 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.10 | 800.499 | 26.673 | -96.7% |
| php | verse_equivalent | 1024 | 0.1.9 | 26.715 | 28.099 | ranges overlap |
| php | verse_equivalent | 1024 | 0.1.10 | 1174.312 | 28.099 | -97.6% |
| php | paragraphs | 1024 | 0.1.9 | 2.240 | 1.528 | -31.8% |
| php | paragraphs | 1024 | 0.1.10 | 2.593 | 1.528 | -41.1% |
| php | mixed_document | 1024 | 0.1.9 | 927.353 | 365.259 | -60.6% |
| php | mixed_document | 1024 | 0.1.10 | 557.954 | 365.259 | -34.5% |
| php | quoted_false_mixed_closer | 1024 | 0.1.9 | 7.992 | 9.277 | ranges overlap |
| php | quoted_false_mixed_closer | 1024 | 0.1.10 | 10.379 | 9.277 | ranges overlap |
| php | quoted_indented_closer | 1024 | 0.1.9 | 7.642 | 9.295 | ranges overlap |
| php | quoted_indented_closer | 1024 | 0.1.10 | 9.795 | 9.295 | ranges overlap |
| php | html_table | 1024 | 0.1.9 | 703.066 | 360.606 | -48.7% |
| php | html_table | 1024 | 0.1.10 | 1499.097 | 360.606 | -75.9% |
| php | html_definition_list | 1024 | 0.1.9 | 312.732 | 139.086 | -55.5% |
| php | html_definition_list | 1024 | 0.1.10 | 1190.962 | 139.086 | -88.3% |
| rs | quoted_fences | 128 | 0.1.6 | 0.091 | 0.070 | ranges overlap |
| rs | quoted_fences | 128 | 0.1.7 | 0.101 | 0.070 | ranges overlap |
| rs | verse_definitions | 128 | 0.1.6 | 0.163 | 0.141 | n/a: different output |
| rs | verse_definitions | 128 | 0.1.7 | 0.184 | 0.141 | n/a: different output |
| rs | verse_equivalent | 128 | 0.1.6 | 0.136 | 0.164 | ranges overlap |
| rs | verse_equivalent | 128 | 0.1.7 | 0.197 | 0.164 | ranges overlap |
| rs | paragraphs | 128 | 0.1.6 | 0.025 | 0.021 | ranges overlap |
| rs | paragraphs | 128 | 0.1.7 | 0.028 | 0.021 | ranges overlap |
| rs | mixed_document | 128 | 0.1.6 | 0.282 | 0.204 | -27.6% |
| rs | mixed_document | 128 | 0.1.7 | 0.389 | 0.204 | -47.6% |
| rs | quoted_fences | 1024 | 0.1.6 | 1.841 | 0.632 | -65.7% |
| rs | quoted_fences | 1024 | 0.1.7 | 2.208 | 0.632 | -71.4% |
| rs | verse_definitions | 1024 | 0.1.6 | 1.075 | 1.354 | n/a: different output |
| rs | verse_definitions | 1024 | 0.1.7 | 1.821 | 1.354 | n/a: different output |
| rs | verse_equivalent | 1024 | 0.1.6 | 1.248 | 1.444 | ranges overlap |
| rs | verse_equivalent | 1024 | 0.1.7 | 1.788 | 1.444 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.6 | 0.199 | 0.162 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.7 | 0.218 | 0.162 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.6 | 2.421 | 1.740 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.7 | 2.649 | 1.740 | ranges overlap |
