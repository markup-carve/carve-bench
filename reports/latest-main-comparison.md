# Pinned merged main commits versus the last two retained tags

The measured merged-main commits were pinned at the start of this refresh. Current core, separate JavaScript, full-corpus, history and latest output checks share those pins. Paired diagnostics also record the earlier baseline. Later JS/PHP include-path escape fixes and Markdown footnote import fixes merged after pinning and were not measured. Release tags retain their earlier samples.

Release tags retain their original history measurements; each main point records its refresh session in the raw JSON. Check the recorded sessions and build configurations before attributing a difference to code. Lower milliseconds are faster. Percentage differences appear only when output hashes match and sample ranges do not overlap; they do not isolate code speedups. Sample ranges and source/build provenance are in the [history report](engine-history.md) and [raw JSON](engine-history.json).

| Engine | Main commit | Recent tags |
|---|---|---|
| js | `e57653b22896118d3cd9e1457c9bdc36aec52d9c` | 0.1.8, 0.1.9 |
| php | `19745164a182951f90a58620722e8e8f3418fd10` | 0.1.9, 0.1.10 |
| rs | `2a183262f866d0dca2ae515d8b655d21e01ade90` | 0.1.6, 0.1.7 |

js: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [15.07275390625, 9.0908203125, 8.0322265625] to [11.8369140625, 8.8876953125, 7.99755859375].


php: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [11.8369140625, 8.8876953125, 7.99755859375] to [6.828125, 7.9228515625, 7.73388671875].


rs: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [6.828125, 7.9228515625, 7.73388671875] to [6.828125, 7.9228515625, 7.73388671875].


[CSV](latest-main-comparison.csv)

| Engine | Case | n | Tag | Tag ms | Main ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | quoted_fences | 128 | 0.1.8 | 0.364 | 0.273 | ranges overlap |
| js | quoted_fences | 128 | 0.1.9 | 0.311 | 0.273 | ranges overlap |
| js | verse_definitions | 128 | 0.1.8 | 0.833 | 0.746 | ranges overlap |
| js | verse_definitions | 128 | 0.1.9 | 0.744 | 0.746 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.8 | 1.002 | 0.923 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.9 | 0.850 | 0.923 | ranges overlap |
| js | paragraphs | 128 | 0.1.8 | 0.083 | 0.077 | ranges overlap |
| js | paragraphs | 128 | 0.1.9 | 0.079 | 0.077 | ranges overlap |
| js | mixed_document | 128 | 0.1.8 | 1.465 | 1.252 | ranges overlap |
| js | mixed_document | 128 | 0.1.9 | 1.451 | 1.252 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.8 | 2.584 | 2.448 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.9 | 2.401 | 2.448 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.8 | 7.014 | 5.055 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.9 | 6.334 | 5.055 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.8 | 8.962 | 5.586 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.9 | 7.843 | 5.586 | ranges overlap |
| js | paragraphs | 1024 | 0.1.8 | 0.751 | 0.633 | ranges overlap |
| js | paragraphs | 1024 | 0.1.9 | 0.673 | 0.633 | ranges overlap |
| js | mixed_document | 1024 | 0.1.8 | 25.526 | 20.862 | ranges overlap |
| js | mixed_document | 1024 | 0.1.9 | 26.744 | 20.862 | ranges overlap |
| php | quoted_fences | 128 | 0.1.9 | 1.667 | 1.443 | ranges overlap |
| php | quoted_fences | 128 | 0.1.10 | 1.255 | 1.443 | ranges overlap |
| php | verse_definitions | 128 | 0.1.9 | 3.983 | 4.209 | ranges overlap |
| php | verse_definitions | 128 | 0.1.10 | 17.196 | 4.209 | -75.5% |
| php | verse_equivalent | 128 | 0.1.9 | 3.699 | 4.338 | ranges overlap |
| php | verse_equivalent | 128 | 0.1.10 | 24.120 | 4.338 | -82.0% |
| php | paragraphs | 128 | 0.1.9 | 0.372 | 0.203 | ranges overlap |
| php | paragraphs | 128 | 0.1.10 | 0.337 | 0.203 | -39.6% |
| php | mixed_document | 128 | 0.1.9 | 4.062 | 2.900 | ranges overlap |
| php | mixed_document | 128 | 0.1.10 | 4.114 | 2.900 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.9 | 1.428 | 1.545 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.10 | 1.303 | 1.545 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.9 | 1.367 | 1.552 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.10 | 1.294 | 1.552 | ranges overlap |
| php | html_table | 128 | 0.1.9 | 75.185 | 44.680 | -40.6% |
| php | html_table | 128 | 0.1.10 | 86.981 | 44.680 | -48.6% |
| php | html_definition_list | 128 | 0.1.9 | 36.865 | 17.171 | -53.4% |
| php | html_definition_list | 128 | 0.1.10 | 44.049 | 17.171 | -61.0% |
| php | quoted_fences | 1024 | 0.1.9 | 9.164 | 11.161 | ranges overlap |
| php | quoted_fences | 1024 | 0.1.10 | 10.285 | 11.161 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.9 | 27.927 | 32.357 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.10 | 800.499 | 32.357 | -96.0% |
| php | verse_equivalent | 1024 | 0.1.9 | 26.715 | 33.193 | ranges overlap |
| php | verse_equivalent | 1024 | 0.1.10 | 1174.312 | 33.193 | -97.2% |
| php | paragraphs | 1024 | 0.1.9 | 2.240 | 1.643 | ranges overlap |
| php | paragraphs | 1024 | 0.1.10 | 2.593 | 1.643 | ranges overlap |
| php | mixed_document | 1024 | 0.1.9 | 927.353 | 470.640 | -49.2% |
| php | mixed_document | 1024 | 0.1.10 | 557.954 | 470.640 | ranges overlap |
| php | quoted_false_mixed_closer | 1024 | 0.1.9 | 7.992 | 11.875 | +48.6% |
| php | quoted_false_mixed_closer | 1024 | 0.1.10 | 10.379 | 11.875 | ranges overlap |
| php | quoted_indented_closer | 1024 | 0.1.9 | 7.642 | 11.422 | +49.5% |
| php | quoted_indented_closer | 1024 | 0.1.10 | 9.795 | 11.422 | ranges overlap |
| php | html_table | 1024 | 0.1.9 | 703.066 | 482.248 | ranges overlap |
| php | html_table | 1024 | 0.1.10 | 1499.097 | 482.248 | -67.8% |
| php | html_definition_list | 1024 | 0.1.9 | 312.732 | 183.663 | -41.3% |
| php | html_definition_list | 1024 | 0.1.10 | 1190.962 | 183.663 | -84.6% |
| rs | quoted_fences | 128 | 0.1.6 | 0.091 | 0.075 | ranges overlap |
| rs | quoted_fences | 128 | 0.1.7 | 0.101 | 0.075 | ranges overlap |
| rs | verse_definitions | 128 | 0.1.6 | 0.163 | 0.157 | n/a: different output |
| rs | verse_definitions | 128 | 0.1.7 | 0.184 | 0.157 | n/a: different output |
| rs | verse_equivalent | 128 | 0.1.6 | 0.136 | 0.177 | ranges overlap |
| rs | verse_equivalent | 128 | 0.1.7 | 0.197 | 0.177 | ranges overlap |
| rs | paragraphs | 128 | 0.1.6 | 0.025 | 0.021 | ranges overlap |
| rs | paragraphs | 128 | 0.1.7 | 0.028 | 0.021 | ranges overlap |
| rs | mixed_document | 128 | 0.1.6 | 0.282 | 0.234 | ranges overlap |
| rs | mixed_document | 128 | 0.1.7 | 0.389 | 0.234 | ranges overlap |
| rs | quoted_fences | 1024 | 0.1.6 | 1.841 | 0.751 | -59.2% |
| rs | quoted_fences | 1024 | 0.1.7 | 2.208 | 0.751 | -66.0% |
| rs | verse_definitions | 1024 | 0.1.6 | 1.075 | 1.547 | n/a: different output |
| rs | verse_definitions | 1024 | 0.1.7 | 1.821 | 1.547 | n/a: different output |
| rs | verse_equivalent | 1024 | 0.1.6 | 1.248 | 1.775 | ranges overlap |
| rs | verse_equivalent | 1024 | 0.1.7 | 1.788 | 1.775 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.6 | 0.199 | 0.174 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.7 | 0.218 | 0.174 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.6 | 2.421 | 2.077 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.7 | 2.649 | 2.077 | -21.6% |
