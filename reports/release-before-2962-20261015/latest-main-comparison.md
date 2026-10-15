# Pinned merged main commits versus the last two retained tags

The measured merged-main commits were pinned at the start of this refresh, around 09:20 UTC on 2026-10-14. Current core, separate JavaScript, full-corpus, history and latest output checks share those pins. Paired diagnostics also record the earlier baseline. Later merges, including carve-rs#2754, landed after pinning and were not measured. Release tags retain their earlier samples.

Release tags retain their original history measurements; each main point records its refresh session in the raw JSON. Check the recorded sessions and build configurations before attributing a difference to code. Lower milliseconds are faster. Percentage differences appear only when output hashes match and sample ranges do not overlap; they do not isolate code speedups. Sample ranges and source/build provenance are in the [history report](engine-history.md) and [raw JSON](engine-history.json).

| Engine | Main commit | Recent tags |
|---|---|---|
| js | `43c888310a8b1f96b77e0a79672e96d6cfbe1b86` | 0.1.8, 0.1.9 |
| php | `cb3dec89cba4bfeb7ea15861c952073ec4825567` | 0.1.9, 0.1.10 |
| rs | `61b673ce9d8c5628f4d4e3882d1fcb19f6002b2d` | 0.1.6, 0.1.7 |

js: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [4.63330078125, 7.29638671875, 8.15625] to [4.19384765625, 6.98095703125, 8.02880859375].


php: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [4.19384765625, 6.98095703125, 8.02880859375] to [3.20263671875, 6.04541015625, 7.609375].


rs: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [3.20263671875, 6.04541015625, 7.609375] to [3.20263671875, 6.04541015625, 7.609375].


[CSV](latest-main-comparison.csv)

| Engine | Case | n | Tag | Tag ms | Main ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | quoted_fences | 128 | 0.1.8 | 0.364 | 0.249 | ranges overlap |
| js | quoted_fences | 128 | 0.1.9 | 0.311 | 0.249 | ranges overlap |
| js | verse_definitions | 128 | 0.1.8 | 0.833 | 0.659 | ranges overlap |
| js | verse_definitions | 128 | 0.1.9 | 0.744 | 0.659 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.8 | 1.002 | 0.662 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.9 | 0.850 | 0.662 | ranges overlap |
| js | paragraphs | 128 | 0.1.8 | 0.083 | 0.069 | ranges overlap |
| js | paragraphs | 128 | 0.1.9 | 0.079 | 0.069 | ranges overlap |
| js | mixed_document | 128 | 0.1.8 | 1.465 | 1.100 | ranges overlap |
| js | mixed_document | 128 | 0.1.9 | 1.451 | 1.100 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.8 | 2.584 | 1.680 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.9 | 2.401 | 1.680 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.8 | 7.014 | 4.846 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.9 | 6.334 | 4.846 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.8 | 8.962 | 5.400 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.9 | 7.843 | 5.400 | ranges overlap |
| js | paragraphs | 1024 | 0.1.8 | 0.751 | 0.559 | ranges overlap |
| js | paragraphs | 1024 | 0.1.9 | 0.673 | 0.559 | ranges overlap |
| js | mixed_document | 1024 | 0.1.8 | 25.526 | 15.862 | -37.9% |
| js | mixed_document | 1024 | 0.1.9 | 26.744 | 15.862 | -40.7% |
| php | quoted_fences | 128 | 0.1.9 | 1.667 | 2.109 | ranges overlap |
| php | quoted_fences | 128 | 0.1.10 | 1.255 | 2.109 | +68.0% |
| php | verse_definitions | 128 | 0.1.9 | 3.983 | 3.787 | ranges overlap |
| php | verse_definitions | 128 | 0.1.10 | 17.196 | 3.787 | -78.0% |
| php | verse_equivalent | 128 | 0.1.9 | 3.699 | 4.059 | ranges overlap |
| php | verse_equivalent | 128 | 0.1.10 | 24.120 | 4.059 | -83.2% |
| php | paragraphs | 128 | 0.1.9 | 0.372 | 0.192 | -48.4% |
| php | paragraphs | 128 | 0.1.10 | 0.337 | 0.192 | -42.9% |
| php | mixed_document | 128 | 0.1.9 | 4.062 | 2.575 | ranges overlap |
| php | mixed_document | 128 | 0.1.10 | 4.114 | 2.575 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.9 | 1.428 | 2.093 | +46.5% |
| php | quoted_false_mixed_closer | 128 | 0.1.10 | 1.303 | 2.093 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.9 | 1.367 | 1.515 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.10 | 1.294 | 1.515 | ranges overlap |
| php | html_table | 128 | 0.1.9 | 75.185 | 47.965 | ranges overlap |
| php | html_table | 128 | 0.1.10 | 86.981 | 47.965 | -44.9% |
| php | html_definition_list | 128 | 0.1.9 | 36.865 | 16.455 | -55.4% |
| php | html_definition_list | 128 | 0.1.10 | 44.049 | 16.455 | -62.6% |
| php | quoted_fences | 1024 | 0.1.9 | 9.164 | 16.027 | ranges overlap |
| php | quoted_fences | 1024 | 0.1.10 | 10.285 | 16.027 | +55.8% |
| php | verse_definitions | 1024 | 0.1.9 | 27.927 | 31.712 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.10 | 800.499 | 31.712 | -96.0% |
| php | verse_equivalent | 1024 | 0.1.9 | 26.715 | 33.454 | ranges overlap |
| php | verse_equivalent | 1024 | 0.1.10 | 1174.312 | 33.454 | -97.2% |
| php | paragraphs | 1024 | 0.1.9 | 2.240 | 1.504 | -32.9% |
| php | paragraphs | 1024 | 0.1.10 | 2.593 | 1.504 | -42.0% |
| php | mixed_document | 1024 | 0.1.9 | 927.353 | 434.768 | -53.1% |
| php | mixed_document | 1024 | 0.1.10 | 557.954 | 434.768 | ranges overlap |
| php | quoted_false_mixed_closer | 1024 | 0.1.9 | 7.992 | 16.115 | +101.6% |
| php | quoted_false_mixed_closer | 1024 | 0.1.10 | 10.379 | 16.115 | ranges overlap |
| php | quoted_indented_closer | 1024 | 0.1.9 | 7.642 | 11.163 | +46.1% |
| php | quoted_indented_closer | 1024 | 0.1.10 | 9.795 | 11.163 | ranges overlap |
| php | html_table | 1024 | 0.1.9 | 703.066 | 460.000 | -34.6% |
| php | html_table | 1024 | 0.1.10 | 1499.097 | 460.000 | -69.3% |
| php | html_definition_list | 1024 | 0.1.9 | 312.732 | 154.355 | -50.6% |
| php | html_definition_list | 1024 | 0.1.10 | 1190.962 | 154.355 | -87.0% |
| rs | quoted_fences | 128 | 0.1.6 | 0.091 | 0.047 | -48.2% |
| rs | quoted_fences | 128 | 0.1.7 | 0.101 | 0.047 | -53.0% |
| rs | verse_definitions | 128 | 0.1.6 | 0.163 | 0.157 | n/a: different output |
| rs | verse_definitions | 128 | 0.1.7 | 0.184 | 0.157 | n/a: different output |
| rs | verse_equivalent | 128 | 0.1.6 | 0.136 | 0.133 | ranges overlap |
| rs | verse_equivalent | 128 | 0.1.7 | 0.197 | 0.133 | ranges overlap |
| rs | paragraphs | 128 | 0.1.6 | 0.025 | 0.019 | ranges overlap |
| rs | paragraphs | 128 | 0.1.7 | 0.028 | 0.019 | ranges overlap |
| rs | mixed_document | 128 | 0.1.6 | 0.282 | 0.197 | -30.0% |
| rs | mixed_document | 128 | 0.1.7 | 0.389 | 0.197 | -49.3% |
| rs | quoted_fences | 1024 | 0.1.6 | 1.841 | 0.539 | ranges overlap |
| rs | quoted_fences | 1024 | 0.1.7 | 2.208 | 0.539 | -75.6% |
| rs | verse_definitions | 1024 | 0.1.6 | 1.075 | 1.115 | n/a: different output |
| rs | verse_definitions | 1024 | 0.1.7 | 1.821 | 1.115 | n/a: different output |
| rs | verse_equivalent | 1024 | 0.1.6 | 1.248 | 0.869 | -30.4% |
| rs | verse_equivalent | 1024 | 0.1.7 | 1.788 | 0.869 | -51.4% |
| rs | paragraphs | 1024 | 0.1.6 | 0.199 | 0.151 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.7 | 0.218 | 0.151 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.6 | 2.421 | 1.650 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.7 | 2.649 | 1.650 | -37.7% |
