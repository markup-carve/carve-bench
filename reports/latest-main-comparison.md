# Latest merged main versus the last two tags

All three main points were refreshed on October 4, 2026. Release tags retain their original history measurements. Tags and main were measured in separate sessions on the shared host. Lower milliseconds are faster. Percentage differences appear only when output hashes match; they do not isolate the effect of code changes. Sample ranges, runtime settings and source/build provenance are in the [history report](engine-history.md) and [raw JSON](engine-history.json).

| Engine | Main commit | Recent tags |
|---|---|---|
| js | `05778b2f76c650df71567ebb149938ce8612e9d2` | 0.1.8, 0.1.9 |
| php | `03cb29aef26af2a933c8e70a90fe4f3c9a7fbf5d` | 0.1.9, 0.1.10 |
| rs | `47dfe714ec0c90da12b300b87934e07688745041` | 0.1.6, 0.1.7 |

[CSV](latest-main-comparison.csv)

| Engine | Case | n | Tag | Tag ms | Main ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | quoted_fences | 128 | 0.1.8 | 0.364 | 0.241 | -33.6% |
| js | quoted_fences | 128 | 0.1.9 | 0.311 | 0.241 | -22.3% |
| js | verse_definitions | 128 | 0.1.8 | 0.833 | 0.627 | -24.7% |
| js | verse_definitions | 128 | 0.1.9 | 0.744 | 0.627 | -15.6% |
| js | verse_equivalent | 128 | 0.1.8 | 1.002 | 0.637 | -36.4% |
| js | verse_equivalent | 128 | 0.1.9 | 0.850 | 0.637 | -25.0% |
| js | paragraphs | 128 | 0.1.8 | 0.083 | 0.075 | -10.5% |
| js | paragraphs | 128 | 0.1.9 | 0.079 | 0.075 | -5.7% |
| js | mixed_document | 128 | 0.1.8 | 1.465 | 1.144 | -21.9% |
| js | mixed_document | 128 | 0.1.9 | 1.451 | 1.144 | -21.2% |
| js | quoted_fences | 1024 | 0.1.8 | 2.584 | 1.780 | -31.1% |
| js | quoted_fences | 1024 | 0.1.9 | 2.401 | 1.780 | -25.8% |
| js | verse_definitions | 1024 | 0.1.8 | 7.014 | 4.800 | -31.6% |
| js | verse_definitions | 1024 | 0.1.9 | 6.334 | 4.800 | -24.2% |
| js | verse_equivalent | 1024 | 0.1.8 | 8.962 | 5.132 | -42.7% |
| js | verse_equivalent | 1024 | 0.1.9 | 7.843 | 5.132 | -34.6% |
| js | paragraphs | 1024 | 0.1.8 | 0.751 | 0.595 | -20.8% |
| js | paragraphs | 1024 | 0.1.9 | 0.673 | 0.595 | -11.6% |
| js | mixed_document | 1024 | 0.1.8 | 25.526 | 16.823 | -34.1% |
| js | mixed_document | 1024 | 0.1.9 | 26.744 | 16.823 | -37.1% |
| php | quoted_fences | 128 | 0.1.9 | 1.667 | 1.428 | -14.4% |
| php | quoted_fences | 128 | 0.1.10 | 1.255 | 1.428 | +13.8% |
| php | verse_definitions | 128 | 0.1.9 | 3.983 | 3.720 | -6.6% |
| php | verse_definitions | 128 | 0.1.10 | 17.196 | 3.720 | -78.4% |
| php | verse_equivalent | 128 | 0.1.9 | 3.699 | 3.858 | +4.3% |
| php | verse_equivalent | 128 | 0.1.10 | 24.120 | 3.858 | -84.0% |
| php | paragraphs | 128 | 0.1.9 | 0.372 | 0.199 | -46.6% |
| php | paragraphs | 128 | 0.1.10 | 0.337 | 0.199 | -40.9% |
| php | mixed_document | 128 | 0.1.9 | 4.062 | 2.915 | -28.2% |
| php | mixed_document | 128 | 0.1.10 | 4.114 | 2.915 | -29.2% |
| php | quoted_false_mixed_closer | 128 | 0.1.9 | 1.428 | 1.414 | -1.0% |
| php | quoted_false_mixed_closer | 128 | 0.1.10 | 1.303 | 1.414 | +8.5% |
| php | quoted_indented_closer | 128 | 0.1.9 | 1.367 | 1.421 | +3.9% |
| php | quoted_indented_closer | 128 | 0.1.10 | 1.294 | 1.421 | +9.8% |
| php | html_table | 128 | 0.1.9 | 75.185 | 43.881 | -41.6% |
| php | html_table | 128 | 0.1.10 | 86.981 | 43.881 | -49.6% |
| php | html_definition_list | 128 | 0.1.9 | 36.865 | 16.762 | -54.5% |
| php | html_definition_list | 128 | 0.1.10 | 44.049 | 16.762 | -61.9% |
| php | quoted_fences | 1024 | 0.1.9 | 9.164 | 10.520 | +14.8% |
| php | quoted_fences | 1024 | 0.1.10 | 10.285 | 10.520 | +2.3% |
| php | verse_definitions | 1024 | 0.1.9 | 27.927 | 30.602 | +9.6% |
| php | verse_definitions | 1024 | 0.1.10 | 800.499 | 30.602 | -96.2% |
| php | verse_equivalent | 1024 | 0.1.9 | 26.715 | 31.829 | +19.1% |
| php | verse_equivalent | 1024 | 0.1.10 | 1174.312 | 31.829 | -97.3% |
| php | paragraphs | 1024 | 0.1.9 | 2.240 | 1.678 | -25.1% |
| php | paragraphs | 1024 | 0.1.10 | 2.593 | 1.678 | -35.3% |
| php | mixed_document | 1024 | 0.1.9 | 927.353 | 476.399 | -48.6% |
| php | mixed_document | 1024 | 0.1.10 | 557.954 | 476.399 | -14.6% |
| php | quoted_false_mixed_closer | 1024 | 0.1.9 | 7.992 | 10.461 | +30.9% |
| php | quoted_false_mixed_closer | 1024 | 0.1.10 | 10.379 | 10.461 | +0.8% |
| php | quoted_indented_closer | 1024 | 0.1.9 | 7.642 | 10.192 | +33.4% |
| php | quoted_indented_closer | 1024 | 0.1.10 | 9.795 | 10.192 | +4.0% |
| php | html_table | 1024 | 0.1.9 | 703.066 | 427.531 | -39.2% |
| php | html_table | 1024 | 0.1.10 | 1499.097 | 427.531 | -71.5% |
| php | html_definition_list | 1024 | 0.1.9 | 312.732 | 162.076 | -48.2% |
| php | html_definition_list | 1024 | 0.1.10 | 1190.962 | 162.076 | -86.4% |
| rs | quoted_fences | 128 | 0.1.6 | 0.091 | 0.075 | -17.5% |
| rs | quoted_fences | 128 | 0.1.7 | 0.101 | 0.075 | -25.2% |
| rs | verse_definitions | 128 | 0.1.6 | 0.163 | 0.149 | n/a: different output |
| rs | verse_definitions | 128 | 0.1.7 | 0.184 | 0.149 | n/a: different output |
| rs | verse_equivalent | 128 | 0.1.6 | 0.136 | 0.170 | +25.6% |
| rs | verse_equivalent | 128 | 0.1.7 | 0.197 | 0.170 | -13.7% |
| rs | paragraphs | 128 | 0.1.6 | 0.025 | 0.021 | -18.2% |
| rs | paragraphs | 128 | 0.1.7 | 0.028 | 0.021 | -24.6% |
| rs | mixed_document | 128 | 0.1.6 | 0.282 | 0.213 | -24.3% |
| rs | mixed_document | 128 | 0.1.7 | 0.389 | 0.213 | -45.2% |
| rs | quoted_fences | 1024 | 0.1.6 | 1.841 | 0.653 | -64.5% |
| rs | quoted_fences | 1024 | 0.1.7 | 2.208 | 0.653 | -70.4% |
| rs | verse_definitions | 1024 | 0.1.6 | 1.075 | 1.370 | n/a: different output |
| rs | verse_definitions | 1024 | 0.1.7 | 1.821 | 1.370 | n/a: different output |
| rs | verse_equivalent | 1024 | 0.1.6 | 1.248 | 1.511 | +21.1% |
| rs | verse_equivalent | 1024 | 0.1.7 | 1.788 | 1.511 | -15.5% |
| rs | paragraphs | 1024 | 0.1.6 | 0.199 | 0.162 | -18.4% |
| rs | paragraphs | 1024 | 0.1.7 | 0.218 | 0.162 | -25.5% |
| rs | mixed_document | 1024 | 0.1.6 | 2.421 | 1.816 | -25.0% |
| rs | mixed_document | 1024 | 0.1.7 | 2.649 | 1.816 | -31.4% |
