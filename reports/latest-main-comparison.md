# Latest merged main versus the last two retained tags

Release tags retain their original history measurements; each main point records its refresh session in the raw JSON. Check the recorded sessions and build configurations before attributing a difference to code. Lower milliseconds are faster. Percentage differences appear only when output hashes match and sample ranges do not overlap; they do not isolate code speedups. Sample ranges and source/build provenance are in the [history report](engine-history.md) and [raw JSON](engine-history.json).

| Engine | Main commit | Recent tags |
|---|---|---|
| js | `ccbbdcc983b01ffb9a53e4293bd63d0540325643` | 0.1.8, 0.1.9 |
| php | `8752b183da661c5fec5296657b56ddb7025a0f4c` | 0.1.9, 0.1.10 |
| rs | `f95434c91c0faca54fb221281b82e999ecb7cf3c` | 0.1.6, 0.1.7 |

js: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [7.30908203125, 17.38232421875, 23.75] to [9.56298828125, 16.8330078125, 23.3291015625].


php: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [9.56298828125, 16.8330078125, 23.3291015625] to [17.001953125, 17.40283203125, 21.98291015625].


rs: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [17.001953125, 17.40283203125, 21.98291015625] to [17.001953125, 17.40283203125, 21.98291015625].


[CSV](latest-main-comparison.csv)

| Engine | Case | n | Tag | Tag ms | Main ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | quoted_fences | 128 | 0.1.8 | 0.364 | 0.501 | ranges overlap |
| js | quoted_fences | 128 | 0.1.9 | 0.311 | 0.501 | ranges overlap |
| js | verse_definitions | 128 | 0.1.8 | 0.833 | 0.940 | ranges overlap |
| js | verse_definitions | 128 | 0.1.9 | 0.744 | 0.940 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.8 | 1.002 | 1.075 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.9 | 0.850 | 1.075 | ranges overlap |
| js | paragraphs | 128 | 0.1.8 | 0.083 | 0.087 | ranges overlap |
| js | paragraphs | 128 | 0.1.9 | 0.079 | 0.087 | ranges overlap |
| js | mixed_document | 128 | 0.1.8 | 1.465 | 1.683 | ranges overlap |
| js | mixed_document | 128 | 0.1.9 | 1.451 | 1.683 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.8 | 2.584 | 2.554 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.9 | 2.401 | 2.554 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.8 | 7.014 | 7.384 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.9 | 6.334 | 7.384 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.8 | 8.962 | 8.304 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.9 | 7.843 | 8.304 | ranges overlap |
| js | paragraphs | 1024 | 0.1.8 | 0.751 | 0.682 | ranges overlap |
| js | paragraphs | 1024 | 0.1.9 | 0.673 | 0.682 | ranges overlap |
| js | mixed_document | 1024 | 0.1.8 | 25.526 | 23.023 | ranges overlap |
| js | mixed_document | 1024 | 0.1.9 | 26.744 | 23.023 | ranges overlap |
| php | quoted_fences | 128 | 0.1.9 | 1.667 | 2.660 | ranges overlap |
| php | quoted_fences | 128 | 0.1.10 | 1.255 | 2.660 | +112.0% |
| php | verse_definitions | 128 | 0.1.9 | 3.983 | 5.474 | ranges overlap |
| php | verse_definitions | 128 | 0.1.10 | 17.196 | 5.474 | ranges overlap |
| php | verse_equivalent | 128 | 0.1.9 | 3.699 | 6.135 | ranges overlap |
| php | verse_equivalent | 128 | 0.1.10 | 24.120 | 6.135 | ranges overlap |
| php | paragraphs | 128 | 0.1.9 | 0.372 | 0.255 | ranges overlap |
| php | paragraphs | 128 | 0.1.10 | 0.337 | 0.255 | ranges overlap |
| php | mixed_document | 128 | 0.1.9 | 4.062 | 3.935 | ranges overlap |
| php | mixed_document | 128 | 0.1.10 | 4.114 | 3.935 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.9 | 1.428 | 2.243 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.10 | 1.303 | 2.243 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.9 | 1.367 | 2.836 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.10 | 1.294 | 2.836 | +119.2% |
| php | html_table | 128 | 0.1.9 | 75.185 | 84.977 | ranges overlap |
| php | html_table | 128 | 0.1.10 | 86.981 | 84.977 | ranges overlap |
| php | html_definition_list | 128 | 0.1.9 | 36.865 | 27.303 | ranges overlap |
| php | html_definition_list | 128 | 0.1.10 | 44.049 | 27.303 | ranges overlap |
| php | quoted_fences | 1024 | 0.1.9 | 9.164 | 17.030 | ranges overlap |
| php | quoted_fences | 1024 | 0.1.10 | 10.285 | 17.030 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.9 | 27.927 | 47.988 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.10 | 800.499 | 47.988 | -94.0% |
| php | verse_equivalent | 1024 | 0.1.9 | 26.715 | 48.529 | ranges overlap |
| php | verse_equivalent | 1024 | 0.1.10 | 1174.312 | 48.529 | -95.9% |
| php | paragraphs | 1024 | 0.1.9 | 2.240 | 1.888 | ranges overlap |
| php | paragraphs | 1024 | 0.1.10 | 2.593 | 1.888 | ranges overlap |
| php | mixed_document | 1024 | 0.1.9 | 927.353 | 686.946 | ranges overlap |
| php | mixed_document | 1024 | 0.1.10 | 557.954 | 686.946 | ranges overlap |
| php | quoted_false_mixed_closer | 1024 | 0.1.9 | 7.992 | 16.427 | +105.5% |
| php | quoted_false_mixed_closer | 1024 | 0.1.10 | 10.379 | 16.427 | ranges overlap |
| php | quoted_indented_closer | 1024 | 0.1.9 | 7.642 | 18.399 | +140.8% |
| php | quoted_indented_closer | 1024 | 0.1.10 | 9.795 | 18.399 | +87.8% |
| php | html_table | 1024 | 0.1.9 | 703.066 | 855.043 | ranges overlap |
| php | html_table | 1024 | 0.1.10 | 1499.097 | 855.043 | ranges overlap |
| php | html_definition_list | 1024 | 0.1.9 | 312.732 | 322.696 | ranges overlap |
| php | html_definition_list | 1024 | 0.1.10 | 1190.962 | 322.696 | ranges overlap |
| rs | quoted_fences | 128 | 0.1.6 | 0.091 | 0.056 | ranges overlap |
| rs | quoted_fences | 128 | 0.1.7 | 0.101 | 0.056 | ranges overlap |
| rs | verse_definitions | 128 | 0.1.6 | 0.163 | 0.220 | n/a: different output |
| rs | verse_definitions | 128 | 0.1.7 | 0.184 | 0.220 | n/a: different output |
| rs | verse_equivalent | 128 | 0.1.6 | 0.136 | 0.157 | ranges overlap |
| rs | verse_equivalent | 128 | 0.1.7 | 0.197 | 0.157 | ranges overlap |
| rs | paragraphs | 128 | 0.1.6 | 0.025 | 0.023 | ranges overlap |
| rs | paragraphs | 128 | 0.1.7 | 0.028 | 0.023 | ranges overlap |
| rs | mixed_document | 128 | 0.1.6 | 0.282 | 0.244 | ranges overlap |
| rs | mixed_document | 128 | 0.1.7 | 0.389 | 0.244 | ranges overlap |
| rs | quoted_fences | 1024 | 0.1.6 | 1.841 | 0.433 | -76.5% |
| rs | quoted_fences | 1024 | 0.1.7 | 2.208 | 0.433 | -80.4% |
| rs | verse_definitions | 1024 | 0.1.6 | 1.075 | 1.616 | n/a: different output |
| rs | verse_definitions | 1024 | 0.1.7 | 1.821 | 1.616 | n/a: different output |
| rs | verse_equivalent | 1024 | 0.1.6 | 1.248 | 1.186 | ranges overlap |
| rs | verse_equivalent | 1024 | 0.1.7 | 1.788 | 1.186 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.6 | 0.199 | 0.194 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.7 | 0.218 | 0.194 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.6 | 2.421 | 2.011 | ranges overlap |
| rs | mixed_document | 1024 | 0.1.7 | 2.649 | 2.011 | ranges overlap |
