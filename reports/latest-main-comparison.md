# Latest merged main versus the last two retained tags

Release tags retain their original history measurements; each main point records its refresh session in the raw JSON. Check the recorded sessions and build configurations before attributing a difference to code. Lower milliseconds are faster. Percentage differences appear only when output hashes match; they do not isolate code speedups. Sample ranges and source/build provenance are in the [history report](engine-history.md) and [raw JSON](engine-history.json).

| Engine | Main commit | Recent tags |
|---|---|---|
| js | `a7c80d37fb322d28bc5061175bbd9c7f7638c175` | 0.1.8, 0.1.9 |
| php | `49c235d768ea6faec074d4b561ed3783d99b6fbd` | 0.1.9, 0.1.10 |
| rs | `8ee78ecb83d82ed81c544c17483e0eb111398f9d` | 0.1.6, 0.1.7 |

[CSV](latest-main-comparison.csv)

| Engine | Case | n | Tag | Tag ms | Main ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | quoted_fences | 128 | 0.1.8 | 0.364 | 0.231 | -36.5% |
| js | quoted_fences | 128 | 0.1.9 | 0.311 | 0.231 | -25.6% |
| js | verse_definitions | 128 | 0.1.8 | 0.833 | 0.610 | -26.8% |
| js | verse_definitions | 128 | 0.1.9 | 0.744 | 0.610 | -17.9% |
| js | verse_equivalent | 128 | 0.1.8 | 1.002 | 0.619 | -38.2% |
| js | verse_equivalent | 128 | 0.1.9 | 0.850 | 0.619 | -27.1% |
| js | paragraphs | 128 | 0.1.8 | 0.083 | 0.071 | -14.9% |
| js | paragraphs | 128 | 0.1.9 | 0.079 | 0.071 | -10.3% |
| js | mixed_document | 128 | 0.1.8 | 1.465 | 1.098 | -25.1% |
| js | mixed_document | 128 | 0.1.9 | 1.451 | 1.098 | -24.3% |
| js | quoted_fences | 1024 | 0.1.8 | 2.584 | 1.778 | -31.2% |
| js | quoted_fences | 1024 | 0.1.9 | 2.401 | 1.778 | -25.9% |
| js | verse_definitions | 1024 | 0.1.8 | 7.014 | 4.700 | -33.0% |
| js | verse_definitions | 1024 | 0.1.9 | 6.334 | 4.700 | -25.8% |
| js | verse_equivalent | 1024 | 0.1.8 | 8.962 | 4.855 | -45.8% |
| js | verse_equivalent | 1024 | 0.1.9 | 7.843 | 4.855 | -38.1% |
| js | paragraphs | 1024 | 0.1.8 | 0.751 | 0.570 | -24.2% |
| js | paragraphs | 1024 | 0.1.9 | 0.673 | 0.570 | -15.4% |
| js | mixed_document | 1024 | 0.1.8 | 25.526 | 15.851 | -37.9% |
| js | mixed_document | 1024 | 0.1.9 | 26.744 | 15.851 | -40.7% |
| php | quoted_fences | 128 | 0.1.9 | 1.667 | 1.380 | -17.2% |
| php | quoted_fences | 128 | 0.1.10 | 1.255 | 1.380 | +10.0% |
| php | verse_definitions | 128 | 0.1.9 | 3.983 | 3.417 | -14.2% |
| php | verse_definitions | 128 | 0.1.10 | 17.196 | 3.417 | -80.1% |
| php | verse_equivalent | 128 | 0.1.9 | 3.699 | 3.593 | -2.9% |
| php | verse_equivalent | 128 | 0.1.10 | 24.120 | 3.593 | -85.1% |
| php | paragraphs | 128 | 0.1.9 | 0.372 | 0.196 | -47.4% |
| php | paragraphs | 128 | 0.1.10 | 0.337 | 0.196 | -41.9% |
| php | mixed_document | 128 | 0.1.9 | 4.062 | 2.536 | -37.6% |
| php | mixed_document | 128 | 0.1.10 | 4.114 | 2.536 | -38.4% |
| php | quoted_false_mixed_closer | 128 | 0.1.9 | 1.428 | 1.389 | -2.8% |
| php | quoted_false_mixed_closer | 128 | 0.1.10 | 1.303 | 1.389 | +6.5% |
| php | quoted_indented_closer | 128 | 0.1.9 | 1.367 | 1.358 | -0.7% |
| php | quoted_indented_closer | 128 | 0.1.10 | 1.294 | 1.358 | +5.0% |
| php | html_table | 128 | 0.1.9 | 75.185 | 37.738 | -49.8% |
| php | html_table | 128 | 0.1.10 | 86.981 | 37.738 | -56.6% |
| php | html_definition_list | 128 | 0.1.9 | 36.865 | 13.961 | -62.1% |
| php | html_definition_list | 128 | 0.1.10 | 44.049 | 13.961 | -68.3% |
| php | quoted_fences | 1024 | 0.1.9 | 9.164 | 9.390 | +2.5% |
| php | quoted_fences | 1024 | 0.1.10 | 10.285 | 9.390 | -8.7% |
| php | verse_definitions | 1024 | 0.1.9 | 27.927 | 27.581 | -1.2% |
| php | verse_definitions | 1024 | 0.1.10 | 800.499 | 27.581 | -96.6% |
| php | verse_equivalent | 1024 | 0.1.9 | 26.715 | 28.615 | +7.1% |
| php | verse_equivalent | 1024 | 0.1.10 | 1174.312 | 28.615 | -97.6% |
| php | paragraphs | 1024 | 0.1.9 | 2.240 | 1.542 | -31.2% |
| php | paragraphs | 1024 | 0.1.10 | 2.593 | 1.542 | -40.5% |
| php | mixed_document | 1024 | 0.1.9 | 927.353 | 369.113 | -60.2% |
| php | mixed_document | 1024 | 0.1.10 | 557.954 | 369.113 | -33.8% |
| php | quoted_false_mixed_closer | 1024 | 0.1.9 | 7.992 | 9.468 | +18.5% |
| php | quoted_false_mixed_closer | 1024 | 0.1.10 | 10.379 | 9.468 | -8.8% |
| php | quoted_indented_closer | 1024 | 0.1.9 | 7.642 | 9.686 | +26.7% |
| php | quoted_indented_closer | 1024 | 0.1.10 | 9.795 | 9.686 | -1.1% |
| php | html_table | 1024 | 0.1.9 | 703.066 | 369.634 | -47.4% |
| php | html_table | 1024 | 0.1.10 | 1499.097 | 369.634 | -75.3% |
| php | html_definition_list | 1024 | 0.1.9 | 312.732 | 136.761 | -56.3% |
| php | html_definition_list | 1024 | 0.1.10 | 1190.962 | 136.761 | -88.5% |
| rs | quoted_fences | 128 | 0.1.6 | 0.091 | 0.067 | -26.7% |
| rs | quoted_fences | 128 | 0.1.7 | 0.101 | 0.067 | -33.5% |
| rs | verse_definitions | 128 | 0.1.6 | 0.163 | 0.141 | n/a: different output |
| rs | verse_definitions | 128 | 0.1.7 | 0.184 | 0.141 | n/a: different output |
| rs | verse_equivalent | 128 | 0.1.6 | 0.136 | 0.166 | +22.7% |
| rs | verse_equivalent | 128 | 0.1.7 | 0.197 | 0.166 | -15.7% |
| rs | paragraphs | 128 | 0.1.6 | 0.025 | 0.021 | -18.1% |
| rs | paragraphs | 128 | 0.1.7 | 0.028 | 0.021 | -24.6% |
| rs | mixed_document | 128 | 0.1.6 | 0.282 | 0.212 | -24.8% |
| rs | mixed_document | 128 | 0.1.7 | 0.389 | 0.212 | -45.6% |
| rs | quoted_fences | 1024 | 0.1.6 | 1.841 | 0.651 | -64.6% |
| rs | quoted_fences | 1024 | 0.1.7 | 2.208 | 0.651 | -70.5% |
| rs | verse_definitions | 1024 | 0.1.6 | 1.075 | 1.393 | n/a: different output |
| rs | verse_definitions | 1024 | 0.1.7 | 1.821 | 1.393 | n/a: different output |
| rs | verse_equivalent | 1024 | 0.1.6 | 1.248 | 1.496 | +19.9% |
| rs | verse_equivalent | 1024 | 0.1.7 | 1.788 | 1.496 | -16.3% |
| rs | paragraphs | 1024 | 0.1.6 | 0.199 | 0.164 | -17.6% |
| rs | paragraphs | 1024 | 0.1.7 | 0.218 | 0.164 | -24.7% |
| rs | mixed_document | 1024 | 0.1.6 | 2.421 | 1.759 | -27.3% |
| rs | mixed_document | 1024 | 0.1.7 | 2.649 | 1.759 | -33.6% |
