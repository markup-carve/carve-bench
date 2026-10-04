# Latest merged main versus the last two tags

All three main points were refreshed on October 4, 2026. Release tags retain their original history measurements. Tags and main were measured in separate sessions on the shared host. Lower milliseconds are faster. Percentage differences appear only when output hashes match; they do not isolate the effect of code changes. Sample ranges, runtime settings and source/build provenance are in the [history report](engine-history.md) and [raw JSON](engine-history.json).

| Engine | Main commit | Recent tags |
|---|---|---|
| js | `a0e996083129b9d51e63be6982d79843fd35ea32` | 0.1.8, 0.1.9 |
| php | `41c9fe6026e91ee0396dc98ee65be64b6080d3b3` | 0.1.9, 0.1.10 |
| rs | `914704f80c08bc3b52703c9bc06dc3ff89ded7f4` | 0.1.6, 0.1.7 |

[CSV](latest-main-comparison.csv)

| Engine | Case | n | Tag | Tag ms | Main ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | quoted_fences | 128 | 0.1.8 | 0.364 | 0.235 | -35.5% |
| js | quoted_fences | 128 | 0.1.9 | 0.311 | 0.235 | -24.5% |
| js | verse_definitions | 128 | 0.1.8 | 0.833 | 0.587 | -29.6% |
| js | verse_definitions | 128 | 0.1.9 | 0.744 | 0.587 | -21.1% |
| js | verse_equivalent | 128 | 0.1.8 | 1.002 | 0.612 | -38.9% |
| js | verse_equivalent | 128 | 0.1.9 | 0.850 | 0.612 | -28.0% |
| js | paragraphs | 128 | 0.1.8 | 0.083 | 0.070 | -15.7% |
| js | paragraphs | 128 | 0.1.9 | 0.079 | 0.070 | -11.2% |
| js | mixed_document | 128 | 0.1.8 | 1.465 | 1.117 | -23.8% |
| js | mixed_document | 128 | 0.1.9 | 1.451 | 1.117 | -23.0% |
| js | quoted_fences | 1024 | 0.1.8 | 2.584 | 1.664 | -35.6% |
| js | quoted_fences | 1024 | 0.1.9 | 2.401 | 1.664 | -30.7% |
| js | verse_definitions | 1024 | 0.1.8 | 7.014 | 4.536 | -35.3% |
| js | verse_definitions | 1024 | 0.1.9 | 6.334 | 4.536 | -28.4% |
| js | verse_equivalent | 1024 | 0.1.8 | 8.962 | 4.741 | -47.1% |
| js | verse_equivalent | 1024 | 0.1.9 | 7.843 | 4.741 | -39.6% |
| js | paragraphs | 1024 | 0.1.8 | 0.751 | 0.584 | -22.2% |
| js | paragraphs | 1024 | 0.1.9 | 0.673 | 0.584 | -13.2% |
| js | mixed_document | 1024 | 0.1.8 | 25.526 | 15.184 | -40.5% |
| js | mixed_document | 1024 | 0.1.9 | 26.744 | 15.184 | -43.2% |
| php | quoted_fences | 128 | 0.1.9 | 1.667 | 1.336 | -19.9% |
| php | quoted_fences | 128 | 0.1.10 | 1.255 | 1.336 | +6.4% |
| php | verse_definitions | 128 | 0.1.9 | 3.983 | 3.398 | -14.7% |
| php | verse_definitions | 128 | 0.1.10 | 17.196 | 3.398 | -80.2% |
| php | verse_equivalent | 128 | 0.1.9 | 3.699 | 3.592 | -2.9% |
| php | verse_equivalent | 128 | 0.1.10 | 24.120 | 3.592 | -85.1% |
| php | paragraphs | 128 | 0.1.9 | 0.372 | 0.190 | -49.0% |
| php | paragraphs | 128 | 0.1.10 | 0.337 | 0.190 | -43.6% |
| php | mixed_document | 128 | 0.1.9 | 4.062 | 2.584 | -36.4% |
| php | mixed_document | 128 | 0.1.10 | 4.114 | 2.584 | -37.2% |
| php | quoted_false_mixed_closer | 128 | 0.1.9 | 1.428 | 1.339 | -6.2% |
| php | quoted_false_mixed_closer | 128 | 0.1.10 | 1.303 | 1.339 | +2.7% |
| php | quoted_indented_closer | 128 | 0.1.9 | 1.367 | 1.351 | -1.2% |
| php | quoted_indented_closer | 128 | 0.1.10 | 1.294 | 1.351 | +4.4% |
| php | html_table | 128 | 0.1.9 | 75.185 | 38.990 | -48.1% |
| php | html_table | 128 | 0.1.10 | 86.981 | 38.990 | -55.2% |
| php | html_definition_list | 128 | 0.1.9 | 36.865 | 14.348 | -61.1% |
| php | html_definition_list | 128 | 0.1.10 | 44.049 | 14.348 | -67.4% |
| php | quoted_fences | 1024 | 0.1.9 | 9.164 | 9.156 | -0.1% |
| php | quoted_fences | 1024 | 0.1.10 | 10.285 | 9.156 | -11.0% |
| php | verse_definitions | 1024 | 0.1.9 | 27.927 | 26.930 | -3.6% |
| php | verse_definitions | 1024 | 0.1.10 | 800.499 | 26.930 | -96.6% |
| php | verse_equivalent | 1024 | 0.1.9 | 26.715 | 28.169 | +5.4% |
| php | verse_equivalent | 1024 | 0.1.10 | 1174.312 | 28.169 | -97.6% |
| php | paragraphs | 1024 | 0.1.9 | 2.240 | 1.534 | -31.5% |
| php | paragraphs | 1024 | 0.1.10 | 2.593 | 1.534 | -40.8% |
| php | mixed_document | 1024 | 0.1.9 | 927.353 | 383.299 | -58.7% |
| php | mixed_document | 1024 | 0.1.10 | 557.954 | 383.299 | -31.3% |
| php | quoted_false_mixed_closer | 1024 | 0.1.9 | 7.992 | 9.309 | +16.5% |
| php | quoted_false_mixed_closer | 1024 | 0.1.10 | 10.379 | 9.309 | -10.3% |
| php | quoted_indented_closer | 1024 | 0.1.9 | 7.642 | 9.183 | +20.2% |
| php | quoted_indented_closer | 1024 | 0.1.10 | 9.795 | 9.183 | -6.3% |
| php | html_table | 1024 | 0.1.9 | 703.066 | 367.911 | -47.7% |
| php | html_table | 1024 | 0.1.10 | 1499.097 | 367.911 | -75.5% |
| php | html_definition_list | 1024 | 0.1.9 | 312.732 | 138.459 | -55.7% |
| php | html_definition_list | 1024 | 0.1.10 | 1190.962 | 138.459 | -88.4% |
| rs | quoted_fences | 128 | 0.1.6 | 0.091 | 0.064 | -30.3% |
| rs | quoted_fences | 128 | 0.1.7 | 0.101 | 0.064 | -36.8% |
| rs | verse_definitions | 128 | 0.1.6 | 0.163 | 0.134 | n/a: different output |
| rs | verse_definitions | 128 | 0.1.7 | 0.184 | 0.134 | n/a: different output |
| rs | verse_equivalent | 128 | 0.1.6 | 0.136 | 0.157 | +15.8% |
| rs | verse_equivalent | 128 | 0.1.7 | 0.197 | 0.157 | -20.4% |
| rs | paragraphs | 128 | 0.1.6 | 0.025 | 0.019 | -25.9% |
| rs | paragraphs | 128 | 0.1.7 | 0.028 | 0.019 | -31.8% |
| rs | mixed_document | 128 | 0.1.6 | 0.282 | 0.208 | -26.2% |
| rs | mixed_document | 128 | 0.1.7 | 0.389 | 0.208 | -46.6% |
| rs | quoted_fences | 1024 | 0.1.6 | 1.841 | 0.625 | -66.0% |
| rs | quoted_fences | 1024 | 0.1.7 | 2.208 | 0.625 | -71.7% |
| rs | verse_definitions | 1024 | 0.1.6 | 1.075 | 1.231 | n/a: different output |
| rs | verse_definitions | 1024 | 0.1.7 | 1.821 | 1.231 | n/a: different output |
| rs | verse_equivalent | 1024 | 0.1.6 | 1.248 | 1.520 | +21.8% |
| rs | verse_equivalent | 1024 | 0.1.7 | 1.788 | 1.520 | -15.0% |
| rs | paragraphs | 1024 | 0.1.6 | 0.199 | 0.155 | -21.9% |
| rs | paragraphs | 1024 | 0.1.7 | 0.218 | 0.155 | -28.7% |
| rs | mixed_document | 1024 | 0.1.6 | 2.421 | 1.634 | -32.5% |
| rs | mixed_document | 1024 | 0.1.7 | 2.649 | 1.634 | -38.3% |
