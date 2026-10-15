# Earlier pinned merged main commits versus the last two retained tags

These October 15 history pins precede the current core and full-corpus snapshots. Use their recorded commits for comparisons within this report.

Pinned merged-main snapshots are retained; later main commits are recorded as observations and are outside this measurement.

Release tags retain their original history measurements; each main point records its refresh session in the raw JSON. Check the recorded sessions and build configurations before attributing a difference to code. Lower milliseconds are faster. Percentage differences appear only when output hashes match and sample ranges do not overlap; they do not isolate code speedups. Sample ranges and source/build provenance are in the [history report](engine-history.md) and [raw JSON](engine-history.json).

| Engine | Main commit | Recent tags |
|---|---|---|
| js | `224b0c32e22480571c99aae3f0055a6e5a091f74` | 0.1.8, 0.1.9 |
| php | `967f253974433dbc53534df74b7abeae10f26458` | 0.1.9, 0.1.10 |
| rs | `76f95de6b62cfc0088312b0b9336390fd2cfd5f0` | 0.1.6, 0.1.7 |

js: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [23.4150390625, 36.88916015625, 31.81005859375] to [35.05517578125, 38.1591796875, 32.5205078125].


php: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [35.05517578125, 38.1591796875, 32.5205078125] to [22.509765625, 32.1611328125, 31.2568359375].


rs: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [22.509765625, 32.1611328125, 31.2568359375] to [22.509765625, 32.1611328125, 31.2568359375].


[CSV](latest-main-comparison.csv)

| Engine | Case | n | Tag | Tag ms | Main ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | quoted_fences | 128 | 0.1.8 | 0.364 | 0.730 | ranges overlap |
| js | quoted_fences | 128 | 0.1.9 | 0.311 | 0.730 | ranges overlap |
| js | verse_definitions | 128 | 0.1.8 | 0.833 | 2.242 | ranges overlap |
| js | verse_definitions | 128 | 0.1.9 | 0.744 | 2.242 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.8 | 1.002 | 2.732 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.9 | 0.850 | 2.732 | ranges overlap |
| js | paragraphs | 128 | 0.1.8 | 0.083 | 0.300 | ranges overlap |
| js | paragraphs | 128 | 0.1.9 | 0.079 | 0.300 | +278.3% |
| js | mixed_document | 128 | 0.1.8 | 1.465 | 3.268 | ranges overlap |
| js | mixed_document | 128 | 0.1.9 | 1.451 | 3.268 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.8 | 2.584 | 5.967 | +130.9% |
| js | quoted_fences | 1024 | 0.1.9 | 2.401 | 5.967 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.8 | 7.014 | 13.996 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.9 | 6.334 | 13.996 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.8 | 8.962 | 17.669 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.9 | 7.843 | 17.669 | ranges overlap |
| js | paragraphs | 1024 | 0.1.8 | 0.751 | 1.568 | ranges overlap |
| js | paragraphs | 1024 | 0.1.9 | 0.673 | 1.568 | ranges overlap |
| js | mixed_document | 1024 | 0.1.8 | 25.526 | 40.835 | ranges overlap |
| js | mixed_document | 1024 | 0.1.9 | 26.744 | 40.835 | ranges overlap |
| php | quoted_fences | 128 | 0.1.9 | 1.667 | 5.317 | +218.9% |
| php | quoted_fences | 128 | 0.1.10 | 1.255 | 5.317 | +323.7% |
| php | verse_definitions | 128 | 0.1.9 | 3.983 | 8.198 | ranges overlap |
| php | verse_definitions | 128 | 0.1.10 | 17.196 | 8.198 | -52.3% |
| php | verse_equivalent | 128 | 0.1.9 | 3.699 | 8.347 | +125.7% |
| php | verse_equivalent | 128 | 0.1.10 | 24.120 | 8.347 | -65.4% |
| php | paragraphs | 128 | 0.1.9 | 0.372 | 0.346 | ranges overlap |
| php | paragraphs | 128 | 0.1.10 | 0.337 | 0.346 | ranges overlap |
| php | mixed_document | 128 | 0.1.9 | 4.062 | 5.219 | ranges overlap |
| php | mixed_document | 128 | 0.1.10 | 4.114 | 5.219 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.9 | 1.428 | 4.923 | +244.7% |
| php | quoted_false_mixed_closer | 128 | 0.1.10 | 1.303 | 4.923 | +277.7% |
| php | quoted_indented_closer | 128 | 0.1.9 | 1.367 | 3.910 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.10 | 1.294 | 3.910 | ranges overlap |
| php | html_table | 128 | 0.1.9 | 75.185 | 95.627 | ranges overlap |
| php | html_table | 128 | 0.1.10 | 86.981 | 95.627 | ranges overlap |
| php | html_definition_list | 128 | 0.1.9 | 36.865 | 31.048 | ranges overlap |
| php | html_definition_list | 128 | 0.1.10 | 44.049 | 31.048 | ranges overlap |
| php | quoted_fences | 1024 | 0.1.9 | 9.164 | 25.987 | +183.6% |
| php | quoted_fences | 1024 | 0.1.10 | 10.285 | 25.987 | +152.7% |
| php | verse_definitions | 1024 | 0.1.9 | 27.927 | 55.513 | +98.8% |
| php | verse_definitions | 1024 | 0.1.10 | 800.499 | 55.513 | -93.1% |
| php | verse_equivalent | 1024 | 0.1.9 | 26.715 | 64.487 | +141.4% |
| php | verse_equivalent | 1024 | 0.1.10 | 1174.312 | 64.487 | -94.5% |
| php | paragraphs | 1024 | 0.1.9 | 2.240 | 3.010 | ranges overlap |
| php | paragraphs | 1024 | 0.1.10 | 2.593 | 3.010 | ranges overlap |
| php | mixed_document | 1024 | 0.1.9 | 927.353 | 862.371 | ranges overlap |
| php | mixed_document | 1024 | 0.1.10 | 557.954 | 862.371 | ranges overlap |
| php | quoted_false_mixed_closer | 1024 | 0.1.9 | 7.992 | 30.298 | +279.1% |
| php | quoted_false_mixed_closer | 1024 | 0.1.10 | 10.379 | 30.298 | +191.9% |
| php | quoted_indented_closer | 1024 | 0.1.9 | 7.642 | 20.311 | +165.8% |
| php | quoted_indented_closer | 1024 | 0.1.10 | 9.795 | 20.311 | ranges overlap |
| php | html_table | 1024 | 0.1.9 | 703.066 | 962.283 | ranges overlap |
| php | html_table | 1024 | 0.1.10 | 1499.097 | 962.283 | ranges overlap |
| php | html_definition_list | 1024 | 0.1.9 | 312.732 | 309.777 | ranges overlap |
| php | html_definition_list | 1024 | 0.1.10 | 1190.962 | 309.777 | -74.0% |
| rs | quoted_fences | 128 | 0.1.6 | 0.091 | 0.056 | ranges overlap |
| rs | quoted_fences | 128 | 0.1.7 | 0.101 | 0.056 | ranges overlap |
| rs | verse_definitions | 128 | 0.1.6 | 0.163 | 0.202 | n/a: different output |
| rs | verse_definitions | 128 | 0.1.7 | 0.184 | 0.202 | n/a: different output |
| rs | verse_equivalent | 128 | 0.1.6 | 0.136 | 0.141 | ranges overlap |
| rs | verse_equivalent | 128 | 0.1.7 | 0.197 | 0.141 | ranges overlap |
| rs | paragraphs | 128 | 0.1.6 | 0.025 | 0.024 | ranges overlap |
| rs | paragraphs | 128 | 0.1.7 | 0.028 | 0.024 | ranges overlap |
| rs | mixed_document | 128 | 0.1.6 | 0.282 | 0.245 | ranges overlap |
| rs | mixed_document | 128 | 0.1.7 | 0.389 | 0.245 | ranges overlap |
| rs | quoted_fences | 1024 | 0.1.6 | 1.841 | 0.577 | -68.7% |
| rs | quoted_fences | 1024 | 0.1.7 | 2.208 | 0.577 | -73.9% |
| rs | verse_definitions | 1024 | 0.1.6 | 1.075 | 1.387 | n/a: different output |
| rs | verse_definitions | 1024 | 0.1.7 | 1.821 | 1.387 | n/a: different output |
| rs | verse_equivalent | 1024 | 0.1.6 | 1.248 | 1.702 | ranges overlap |
| rs | verse_equivalent | 1024 | 0.1.7 | 1.788 | 1.702 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.6 | 0.199 | 0.189 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.7 | 0.218 | 0.189 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.6 | 2.421 | 2.044 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.7 | 2.649 | 2.044 | ranges overlap |
