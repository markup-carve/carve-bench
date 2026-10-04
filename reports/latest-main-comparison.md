# Latest merged main versus the last two tags

All three main points were refreshed on October 4, 2026. Release tags retain their original history measurements. Tags and main were measured in separate sessions on the shared host. Lower milliseconds are faster. Percentage differences appear only when output hashes match; they do not isolate the effect of code changes. Sample ranges, runtime settings and source/build provenance are in the [history report](engine-history.md) and [raw JSON](engine-history.json).

| Engine | Main commit | Recent tags |
|---|---|---|
| js | `604c2223de4a2bfe6133adcc8cce9ac5a8ba0391` | 0.1.8, 0.1.9 |
| php | `363f0d3e26093857325255bef3497661c6ba5324` | 0.1.9, 0.1.10 |
| rs | `bfe862698546268486f5cc19451a622801a176e8` | 0.1.6, 0.1.7 |

[CSV](latest-main-comparison.csv)

| Engine | Case | n | Tag | Tag ms | Main ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | quoted_fences | 128 | 0.1.8 | 0.364 | 0.227 | -37.5% |
| js | quoted_fences | 128 | 0.1.9 | 0.311 | 0.227 | -26.8% |
| js | verse_definitions | 128 | 0.1.8 | 0.833 | 0.601 | -27.8% |
| js | verse_definitions | 128 | 0.1.9 | 0.744 | 0.601 | -19.1% |
| js | verse_equivalent | 128 | 0.1.8 | 1.002 | 0.605 | -39.6% |
| js | verse_equivalent | 128 | 0.1.9 | 0.850 | 0.605 | -28.8% |
| js | paragraphs | 128 | 0.1.8 | 0.083 | 0.071 | -14.8% |
| js | paragraphs | 128 | 0.1.9 | 0.079 | 0.071 | -10.3% |
| js | mixed_document | 128 | 0.1.8 | 1.465 | 1.142 | -22.1% |
| js | mixed_document | 128 | 0.1.9 | 1.451 | 1.142 | -21.3% |
| js | quoted_fences | 1024 | 0.1.8 | 2.584 | 1.665 | -35.6% |
| js | quoted_fences | 1024 | 0.1.9 | 2.401 | 1.665 | -30.7% |
| js | verse_definitions | 1024 | 0.1.8 | 7.014 | 4.534 | -35.4% |
| js | verse_definitions | 1024 | 0.1.9 | 6.334 | 4.534 | -28.4% |
| js | verse_equivalent | 1024 | 0.1.8 | 8.962 | 5.012 | -44.1% |
| js | verse_equivalent | 1024 | 0.1.9 | 7.843 | 5.012 | -36.1% |
| js | paragraphs | 1024 | 0.1.8 | 0.751 | 0.573 | -23.7% |
| js | paragraphs | 1024 | 0.1.9 | 0.673 | 0.573 | -14.9% |
| js | mixed_document | 1024 | 0.1.8 | 25.526 | 15.565 | -39.0% |
| js | mixed_document | 1024 | 0.1.9 | 26.744 | 15.565 | -41.8% |
| php | quoted_fences | 128 | 0.1.9 | 1.667 | 1.327 | -20.4% |
| php | quoted_fences | 128 | 0.1.10 | 1.255 | 1.327 | +5.7% |
| php | verse_definitions | 128 | 0.1.9 | 3.983 | 3.472 | -12.8% |
| php | verse_definitions | 128 | 0.1.10 | 17.196 | 3.472 | -79.8% |
| php | verse_equivalent | 128 | 0.1.9 | 3.699 | 3.591 | -2.9% |
| php | verse_equivalent | 128 | 0.1.10 | 24.120 | 3.591 | -85.1% |
| php | paragraphs | 128 | 0.1.9 | 0.372 | 0.189 | -49.1% |
| php | paragraphs | 128 | 0.1.10 | 0.337 | 0.189 | -43.7% |
| php | mixed_document | 128 | 0.1.9 | 4.062 | 2.601 | -36.0% |
| php | mixed_document | 128 | 0.1.10 | 4.114 | 2.601 | -36.8% |
| php | quoted_false_mixed_closer | 128 | 0.1.9 | 1.428 | 1.324 | -7.3% |
| php | quoted_false_mixed_closer | 128 | 0.1.10 | 1.303 | 1.324 | +1.6% |
| php | quoted_indented_closer | 128 | 0.1.9 | 1.367 | 1.331 | -2.7% |
| php | quoted_indented_closer | 128 | 0.1.10 | 1.294 | 1.331 | +2.8% |
| php | html_table | 128 | 0.1.9 | 75.185 | 40.685 | -45.9% |
| php | html_table | 128 | 0.1.10 | 86.981 | 40.685 | -53.2% |
| php | html_definition_list | 128 | 0.1.9 | 36.865 | 14.179 | -61.5% |
| php | html_definition_list | 128 | 0.1.10 | 44.049 | 14.179 | -67.8% |
| php | quoted_fences | 1024 | 0.1.9 | 9.164 | 9.117 | -0.5% |
| php | quoted_fences | 1024 | 0.1.10 | 10.285 | 9.117 | -11.4% |
| php | verse_definitions | 1024 | 0.1.9 | 27.927 | 27.603 | -1.2% |
| php | verse_definitions | 1024 | 0.1.10 | 800.499 | 27.603 | -96.6% |
| php | verse_equivalent | 1024 | 0.1.9 | 26.715 | 27.706 | +3.7% |
| php | verse_equivalent | 1024 | 0.1.10 | 1174.312 | 27.706 | -97.6% |
| php | paragraphs | 1024 | 0.1.9 | 2.240 | 1.537 | -31.4% |
| php | paragraphs | 1024 | 0.1.10 | 2.593 | 1.537 | -40.7% |
| php | mixed_document | 1024 | 0.1.9 | 927.353 | 386.791 | -58.3% |
| php | mixed_document | 1024 | 0.1.10 | 557.954 | 386.791 | -30.7% |
| php | quoted_false_mixed_closer | 1024 | 0.1.9 | 7.992 | 9.390 | +17.5% |
| php | quoted_false_mixed_closer | 1024 | 0.1.10 | 10.379 | 9.390 | -9.5% |
| php | quoted_indented_closer | 1024 | 0.1.9 | 7.642 | 9.263 | +21.2% |
| php | quoted_indented_closer | 1024 | 0.1.10 | 9.795 | 9.263 | -5.4% |
| php | html_table | 1024 | 0.1.9 | 703.066 | 372.417 | -47.0% |
| php | html_table | 1024 | 0.1.10 | 1499.097 | 372.417 | -75.2% |
| php | html_definition_list | 1024 | 0.1.9 | 312.732 | 136.992 | -56.2% |
| php | html_definition_list | 1024 | 0.1.10 | 1190.962 | 136.992 | -88.5% |
| rs | quoted_fences | 128 | 0.1.6 | 0.091 | 0.073 | -20.2% |
| rs | quoted_fences | 128 | 0.1.7 | 0.101 | 0.073 | -27.6% |
| rs | verse_definitions | 128 | 0.1.6 | 0.163 | 0.128 | n/a: different output |
| rs | verse_definitions | 128 | 0.1.7 | 0.184 | 0.128 | n/a: different output |
| rs | verse_equivalent | 128 | 0.1.6 | 0.136 | 0.164 | +21.1% |
| rs | verse_equivalent | 128 | 0.1.7 | 0.197 | 0.164 | -16.8% |
| rs | paragraphs | 128 | 0.1.6 | 0.025 | 0.020 | -19.8% |
| rs | paragraphs | 128 | 0.1.7 | 0.028 | 0.020 | -26.2% |
| rs | mixed_document | 128 | 0.1.6 | 0.282 | 0.217 | -23.0% |
| rs | mixed_document | 128 | 0.1.7 | 0.389 | 0.217 | -44.3% |
| rs | quoted_fences | 1024 | 0.1.6 | 1.841 | 0.620 | -66.3% |
| rs | quoted_fences | 1024 | 0.1.7 | 2.208 | 0.620 | -71.9% |
| rs | verse_definitions | 1024 | 0.1.6 | 1.075 | 1.232 | n/a: different output |
| rs | verse_definitions | 1024 | 0.1.7 | 1.821 | 1.232 | n/a: different output |
| rs | verse_equivalent | 1024 | 0.1.6 | 1.248 | 1.468 | +17.6% |
| rs | verse_equivalent | 1024 | 0.1.7 | 1.788 | 1.468 | -17.9% |
| rs | paragraphs | 1024 | 0.1.6 | 0.199 | 0.159 | -20.1% |
| rs | paragraphs | 1024 | 0.1.7 | 0.218 | 0.159 | -27.1% |
| rs | mixed_document | 1024 | 0.1.6 | 2.421 | 1.775 | -26.7% |
| rs | mixed_document | 1024 | 0.1.7 | 2.649 | 1.775 | -33.0% |
