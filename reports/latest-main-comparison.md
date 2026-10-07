# Pinned merged main commits versus the last two retained tags

The measured source pins were frozen at the start of this refresh. Later include fixes merged during the run and were not measured. All current core, corpus, paired controls and history reports retain the same frozen pins. The core report records newer heads observed at repeat setup; earlier workloads retain their own measurement-time provenance.

Release tags retain their original history measurements; each main point records its refresh session in the raw JSON. Check the recorded sessions and build configurations before attributing a difference to code. Lower milliseconds are faster. Percentage differences appear only when output hashes match and sample ranges do not overlap; they do not isolate code speedups. Sample ranges and source/build provenance are in the [history report](engine-history.md) and [raw JSON](engine-history.json).

| Engine | Main commit | Recent tags |
|---|---|---|
| js | `72f7d1333bf4a271a7371b62c6c599d280412e68` | 0.1.8, 0.1.9 |
| php | `9570a261517b26e0ad866087ef28a5679b8d8435` | 0.1.9, 0.1.10 |
| rs | `7a68f74a39c785549130abd97218a282cbce5b77` | 0.1.6, 0.1.7 |

js: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [7.75341796875, 5.6064453125, 6.19970703125] to [6.6279296875, 5.521484375, 6.15087890625].


php: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [6.6279296875, 5.521484375, 6.15087890625] to [5.06103515625, 5.3681640625, 6.033203125].


rs: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [5.06103515625, 5.3681640625, 6.033203125] to [5.13623046875, 5.37890625, 6.03271484375].


[CSV](latest-main-comparison.csv)

| Engine | Case | n | Tag | Tag ms | Main ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | quoted_fences | 128 | 0.1.8 | 0.364 | 0.309 | ranges overlap |
| js | quoted_fences | 128 | 0.1.9 | 0.311 | 0.309 | ranges overlap |
| js | verse_definitions | 128 | 0.1.8 | 0.833 | 0.768 | ranges overlap |
| js | verse_definitions | 128 | 0.1.9 | 0.744 | 0.768 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.8 | 1.002 | 0.759 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.9 | 0.850 | 0.759 | ranges overlap |
| js | paragraphs | 128 | 0.1.8 | 0.083 | 0.083 | ranges overlap |
| js | paragraphs | 128 | 0.1.9 | 0.079 | 0.083 | ranges overlap |
| js | mixed_document | 128 | 0.1.8 | 1.465 | 1.438 | ranges overlap |
| js | mixed_document | 128 | 0.1.9 | 1.451 | 1.438 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.8 | 2.584 | 2.007 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.9 | 2.401 | 2.007 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.8 | 7.014 | 5.523 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.9 | 6.334 | 5.523 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.8 | 8.962 | 7.008 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.9 | 7.843 | 7.008 | ranges overlap |
| js | paragraphs | 1024 | 0.1.8 | 0.751 | 0.726 | ranges overlap |
| js | paragraphs | 1024 | 0.1.9 | 0.673 | 0.726 | ranges overlap |
| js | mixed_document | 1024 | 0.1.8 | 25.526 | 20.894 | ranges overlap |
| js | mixed_document | 1024 | 0.1.9 | 26.744 | 20.894 | ranges overlap |
| php | quoted_fences | 128 | 0.1.9 | 1.667 | 1.735 | ranges overlap |
| php | quoted_fences | 128 | 0.1.10 | 1.255 | 1.735 | +38.3% |
| php | verse_definitions | 128 | 0.1.9 | 3.983 | 4.476 | ranges overlap |
| php | verse_definitions | 128 | 0.1.10 | 17.196 | 4.476 | -74.0% |
| php | verse_equivalent | 128 | 0.1.9 | 3.699 | 4.682 | ranges overlap |
| php | verse_equivalent | 128 | 0.1.10 | 24.120 | 4.682 | -80.6% |
| php | paragraphs | 128 | 0.1.9 | 0.372 | 0.235 | ranges overlap |
| php | paragraphs | 128 | 0.1.10 | 0.337 | 0.235 | ranges overlap |
| php | mixed_document | 128 | 0.1.9 | 4.062 | 3.166 | ranges overlap |
| php | mixed_document | 128 | 0.1.10 | 4.114 | 3.166 | -23.0% |
| php | quoted_false_mixed_closer | 128 | 0.1.9 | 1.428 | 1.705 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.10 | 1.303 | 1.705 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.9 | 1.367 | 1.831 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.10 | 1.294 | 1.831 | ranges overlap |
| php | html_table | 128 | 0.1.9 | 75.185 | 51.273 | ranges overlap |
| php | html_table | 128 | 0.1.10 | 86.981 | 51.273 | -41.1% |
| php | html_definition_list | 128 | 0.1.9 | 36.865 | 18.390 | -50.1% |
| php | html_definition_list | 128 | 0.1.10 | 44.049 | 18.390 | -58.3% |
| php | quoted_fences | 1024 | 0.1.9 | 9.164 | 12.426 | ranges overlap |
| php | quoted_fences | 1024 | 0.1.10 | 10.285 | 12.426 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.9 | 27.927 | 35.315 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.10 | 800.499 | 35.315 | -95.6% |
| php | verse_equivalent | 1024 | 0.1.9 | 26.715 | 39.184 | ranges overlap |
| php | verse_equivalent | 1024 | 0.1.10 | 1174.312 | 39.184 | -96.7% |
| php | paragraphs | 1024 | 0.1.9 | 2.240 | 1.946 | ranges overlap |
| php | paragraphs | 1024 | 0.1.10 | 2.593 | 1.946 | -25.0% |
| php | mixed_document | 1024 | 0.1.9 | 927.353 | 514.590 | -44.5% |
| php | mixed_document | 1024 | 0.1.10 | 557.954 | 514.590 | ranges overlap |
| php | quoted_false_mixed_closer | 1024 | 0.1.9 | 7.992 | 12.231 | +53.0% |
| php | quoted_false_mixed_closer | 1024 | 0.1.10 | 10.379 | 12.231 | ranges overlap |
| php | quoted_indented_closer | 1024 | 0.1.9 | 7.642 | 12.342 | +61.5% |
| php | quoted_indented_closer | 1024 | 0.1.10 | 9.795 | 12.342 | ranges overlap |
| php | html_table | 1024 | 0.1.9 | 703.066 | 545.454 | ranges overlap |
| php | html_table | 1024 | 0.1.10 | 1499.097 | 545.454 | -63.6% |
| php | html_definition_list | 1024 | 0.1.9 | 312.732 | 215.205 | -31.2% |
| php | html_definition_list | 1024 | 0.1.10 | 1190.962 | 215.205 | -81.9% |
| rs | quoted_fences | 128 | 0.1.6 | 0.091 | 0.084 | ranges overlap |
| rs | quoted_fences | 128 | 0.1.7 | 0.101 | 0.084 | ranges overlap |
| rs | verse_definitions | 128 | 0.1.6 | 0.163 | 0.178 | n/a: different output |
| rs | verse_definitions | 128 | 0.1.7 | 0.184 | 0.178 | n/a: different output |
| rs | verse_equivalent | 128 | 0.1.6 | 0.136 | 0.202 | ranges overlap |
| rs | verse_equivalent | 128 | 0.1.7 | 0.197 | 0.202 | ranges overlap |
| rs | paragraphs | 128 | 0.1.6 | 0.025 | 0.025 | ranges overlap |
| rs | paragraphs | 128 | 0.1.7 | 0.028 | 0.025 | ranges overlap |
| rs | mixed_document | 128 | 0.1.6 | 0.282 | 0.249 | ranges overlap |
| rs | mixed_document | 128 | 0.1.7 | 0.389 | 0.249 | -35.9% |
| rs | quoted_fences | 1024 | 0.1.6 | 1.841 | 0.801 | -56.5% |
| rs | quoted_fences | 1024 | 0.1.7 | 2.208 | 0.801 | -63.7% |
| rs | verse_definitions | 1024 | 0.1.6 | 1.075 | 1.653 | n/a: different output |
| rs | verse_definitions | 1024 | 0.1.7 | 1.821 | 1.653 | n/a: different output |
| rs | verse_equivalent | 1024 | 0.1.6 | 1.248 | 1.853 | ranges overlap |
| rs | verse_equivalent | 1024 | 0.1.7 | 1.788 | 1.853 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.6 | 0.199 | 0.205 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.7 | 0.218 | 0.205 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.6 | 2.421 | 2.025 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.7 | 2.649 | 2.025 | -23.5% |
