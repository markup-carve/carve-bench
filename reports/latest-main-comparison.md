# Latest merged main versus the last two tags

This table combines retained release-history measurements with the PHP main refresh completed on 2026-10-02 at 14:08 UTC. Tags and main were measured in separate sessions on the shared host. Lower milliseconds are faster. Only matching output hashes receive percentage comparisons. Shared-host sample ranges and source/build provenance are in the [history report](engine-history.md) and [raw JSON](engine-history.json).

| Engine | Main commit | Recent tags |
|---|---|---|
| js | `d39de173734a075e18b6d797fb199de94efec159` | 0.1.8, 0.1.9 |
| php | `8deb237e1129af59f7efa5e5e3522340d08a5ae4` | 0.1.9, 0.1.10 |
| rs | `2668992f289c9029ae1d42350c1cca5883f773e8` | 0.1.6, 0.1.7 |

[CSV](latest-main-comparison.csv)

| Engine | Case | n | Tag | Tag ms | Main ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | quoted_fences | 128 | 0.1.8 | 0.364 | 0.288 | -20.8% |
| js | quoted_fences | 128 | 0.1.9 | 0.311 | 0.288 | -7.3% |
| js | verse_definitions | 128 | 0.1.8 | 0.833 | 0.709 | -14.9% |
| js | verse_definitions | 128 | 0.1.9 | 0.744 | 0.709 | -4.6% |
| js | verse_equivalent | 128 | 0.1.8 | 1.002 | 0.748 | -25.3% |
| js | verse_equivalent | 128 | 0.1.9 | 0.850 | 0.748 | -12.0% |
| js | paragraphs | 128 | 0.1.8 | 0.083 | 0.086 | +2.8% |
| js | paragraphs | 128 | 0.1.9 | 0.079 | 0.086 | +8.3% |
| js | mixed_document | 128 | 0.1.8 | 1.465 | 1.498 | +2.2% |
| js | mixed_document | 128 | 0.1.9 | 1.451 | 1.498 | +3.2% |
| js | quoted_fences | 1024 | 0.1.8 | 2.584 | 1.822 | -29.5% |
| js | quoted_fences | 1024 | 0.1.9 | 2.401 | 1.822 | -24.1% |
| js | verse_definitions | 1024 | 0.1.8 | 7.014 | 5.385 | -23.2% |
| js | verse_definitions | 1024 | 0.1.9 | 6.334 | 5.385 | -15.0% |
| js | verse_equivalent | 1024 | 0.1.8 | 8.962 | 5.520 | -38.4% |
| js | verse_equivalent | 1024 | 0.1.9 | 7.843 | 5.520 | -29.6% |
| js | paragraphs | 1024 | 0.1.8 | 0.751 | 0.694 | -7.6% |
| js | paragraphs | 1024 | 0.1.9 | 0.673 | 0.694 | +3.1% |
| js | mixed_document | 1024 | 0.1.8 | 25.526 | 26.721 | +4.7% |
| js | mixed_document | 1024 | 0.1.9 | 26.744 | 26.721 | -0.1% |
| php | quoted_fences | 128 | 0.1.9 | 1.667 | 1.311 | -21.4% |
| php | quoted_fences | 128 | 0.1.10 | 1.255 | 1.311 | +4.4% |
| php | verse_definitions | 128 | 0.1.9 | 3.983 | 3.436 | -13.7% |
| php | verse_definitions | 128 | 0.1.10 | 17.196 | 3.436 | -80.0% |
| php | verse_equivalent | 128 | 0.1.9 | 3.699 | 3.653 | -1.2% |
| php | verse_equivalent | 128 | 0.1.10 | 24.120 | 3.653 | -84.9% |
| php | paragraphs | 128 | 0.1.9 | 0.372 | 0.269 | -27.7% |
| php | paragraphs | 128 | 0.1.10 | 0.337 | 0.269 | -20.1% |
| php | mixed_document | 128 | 0.1.9 | 4.062 | 3.232 | -20.4% |
| php | mixed_document | 128 | 0.1.10 | 4.114 | 3.232 | -21.4% |
| php | quoted_false_mixed_closer | 128 | 0.1.9 | 1.428 | 1.383 | -3.1% |
| php | quoted_false_mixed_closer | 128 | 0.1.10 | 1.303 | 1.383 | +6.1% |
| php | quoted_indented_closer | 128 | 0.1.9 | 1.367 | 1.510 | +10.4% |
| php | quoted_indented_closer | 128 | 0.1.10 | 1.294 | 1.510 | +16.7% |
| php | html_table | 128 | 0.1.9 | 75.185 | 40.912 | -45.6% |
| php | html_table | 128 | 0.1.10 | 86.981 | 40.912 | -53.0% |
| php | html_definition_list | 128 | 0.1.9 | 36.865 | 15.937 | -56.8% |
| php | html_definition_list | 128 | 0.1.10 | 44.049 | 15.937 | -63.8% |
| php | quoted_fences | 1024 | 0.1.9 | 9.164 | 9.798 | +6.9% |
| php | quoted_fences | 1024 | 0.1.10 | 10.285 | 9.798 | -4.7% |
| php | verse_definitions | 1024 | 0.1.9 | 27.927 | 28.864 | +3.4% |
| php | verse_definitions | 1024 | 0.1.10 | 800.499 | 28.864 | -96.4% |
| php | verse_equivalent | 1024 | 0.1.9 | 26.715 | 29.360 | +9.9% |
| php | verse_equivalent | 1024 | 0.1.10 | 1174.312 | 29.360 | -97.5% |
| php | paragraphs | 1024 | 0.1.9 | 2.240 | 2.109 | -5.8% |
| php | paragraphs | 1024 | 0.1.10 | 2.593 | 2.109 | -18.7% |
| php | mixed_document | 1024 | 0.1.9 | 927.353 | 445.282 | -52.0% |
| php | mixed_document | 1024 | 0.1.10 | 557.954 | 445.282 | -20.2% |
| php | quoted_false_mixed_closer | 1024 | 0.1.9 | 7.992 | 9.784 | +22.4% |
| php | quoted_false_mixed_closer | 1024 | 0.1.10 | 10.379 | 9.784 | -5.7% |
| php | quoted_indented_closer | 1024 | 0.1.9 | 7.642 | 9.659 | +26.4% |
| php | quoted_indented_closer | 1024 | 0.1.10 | 9.795 | 9.659 | -1.4% |
| php | html_table | 1024 | 0.1.9 | 703.066 | 445.698 | -36.6% |
| php | html_table | 1024 | 0.1.10 | 1499.097 | 445.698 | -70.3% |
| php | html_definition_list | 1024 | 0.1.9 | 312.732 | 174.641 | -44.2% |
| php | html_definition_list | 1024 | 0.1.10 | 1190.962 | 174.641 | -85.3% |
| rs | quoted_fences | 128 | 0.1.6 | 0.091 | 0.085 | -7.3% |
| rs | quoted_fences | 128 | 0.1.7 | 0.101 | 0.085 | -15.9% |
| rs | verse_definitions | 128 | 0.1.6 | 0.163 | 0.175 | different output |
| rs | verse_definitions | 128 | 0.1.7 | 0.184 | 0.175 | different output |
| rs | verse_equivalent | 128 | 0.1.6 | 0.136 | 0.204 | +50.0% |
| rs | verse_equivalent | 128 | 0.1.7 | 0.197 | 0.204 | +3.1% |
| rs | paragraphs | 128 | 0.1.6 | 0.025 | 0.030 | +16.2% |
| rs | paragraphs | 128 | 0.1.7 | 0.028 | 0.030 | +7.1% |
| rs | mixed_document | 128 | 0.1.6 | 0.282 | 0.320 | +13.5% |
| rs | mixed_document | 128 | 0.1.7 | 0.389 | 0.320 | -17.8% |
| rs | quoted_fences | 1024 | 0.1.6 | 1.841 | 0.792 | -57.0% |
| rs | quoted_fences | 1024 | 0.1.7 | 2.208 | 0.792 | -64.1% |
| rs | verse_definitions | 1024 | 0.1.6 | 1.075 | 1.101 | different output |
| rs | verse_definitions | 1024 | 0.1.7 | 1.821 | 1.101 | different output |
| rs | verse_equivalent | 1024 | 0.1.6 | 1.248 | 1.835 | +47.0% |
| rs | verse_equivalent | 1024 | 0.1.7 | 1.788 | 1.835 | +2.6% |
| rs | paragraphs | 1024 | 0.1.6 | 0.199 | 0.245 | +23.4% |
| rs | paragraphs | 1024 | 0.1.7 | 0.218 | 0.245 | +12.7% |
| rs | mixed_document | 1024 | 0.1.6 | 2.421 | 2.796 | +15.5% |
| rs | mixed_document | 1024 | 0.1.7 | 2.649 | 2.796 | +5.5% |
