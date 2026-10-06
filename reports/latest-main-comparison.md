# Pinned merged main commits versus the last two retained tags

JS and PHP use retained merged performance commits, not current main heads. Later main changes fix description-list or reference correctness and update lint or corpus coverage. They were excluded from this Rust performance refresh; these fixtures do not validate the newer fixes.

Release tags retain their original history measurements; each main point records its refresh session in the raw JSON. Check the recorded sessions and build configurations before attributing a difference to code. Lower milliseconds are faster. Percentage differences appear only when output hashes match and sample ranges do not overlap; they do not isolate code speedups. Sample ranges and source/build provenance are in the [history report](engine-history.md) and [raw JSON](engine-history.json).

| Engine | Main commit | Recent tags |
|---|---|---|
| js | `a7c80d37fb322d28bc5061175bbd9c7f7638c175` | 0.1.8, 0.1.9 |
| php | `49c235d768ea6faec074d4b561ed3783d99b6fbd` | 0.1.9, 0.1.10 |
| rs | `ae44de38b6ecf468212cac117f83158f7c3988c2` | 0.1.6, 0.1.7 |

js: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [1.23828125, 1.71142578125, 4.29638671875] to [1.54248046875, 1.74951171875, 4.23974609375].


php: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [1.54248046875, 1.74951171875, 4.23974609375] to [1.388671875, 1.65283203125, 4.02197265625].


rs: retained-tag load [5.18994140625, 5.53466796875, 5.52490234375] to [7.6640625, 8.294921875, 7.34130859375]; main load [1.388671875, 1.65283203125, 4.02197265625] to [1.388671875, 1.65283203125, 4.02197265625].


[CSV](latest-main-comparison.csv)

| Engine | Case | n | Tag | Tag ms | Main ms | Change |
|---|---|---:|---|---:|---:|---:|
| js | quoted_fences | 128 | 0.1.8 | 0.364 | 0.232 | ranges overlap |
| js | quoted_fences | 128 | 0.1.9 | 0.311 | 0.232 | ranges overlap |
| js | verse_definitions | 128 | 0.1.8 | 0.833 | 0.579 | ranges overlap |
| js | verse_definitions | 128 | 0.1.9 | 0.744 | 0.579 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.8 | 1.002 | 0.623 | ranges overlap |
| js | verse_equivalent | 128 | 0.1.9 | 0.850 | 0.623 | ranges overlap |
| js | paragraphs | 128 | 0.1.8 | 0.083 | 0.070 | ranges overlap |
| js | paragraphs | 128 | 0.1.9 | 0.079 | 0.070 | ranges overlap |
| js | mixed_document | 128 | 0.1.8 | 1.465 | 1.107 | ranges overlap |
| js | mixed_document | 128 | 0.1.9 | 1.451 | 1.107 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.8 | 2.584 | 1.709 | ranges overlap |
| js | quoted_fences | 1024 | 0.1.9 | 2.401 | 1.709 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.8 | 7.014 | 4.305 | ranges overlap |
| js | verse_definitions | 1024 | 0.1.9 | 6.334 | 4.305 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.8 | 8.962 | 4.895 | ranges overlap |
| js | verse_equivalent | 1024 | 0.1.9 | 7.843 | 4.895 | ranges overlap |
| js | paragraphs | 1024 | 0.1.8 | 0.751 | 0.562 | ranges overlap |
| js | paragraphs | 1024 | 0.1.9 | 0.673 | 0.562 | ranges overlap |
| js | mixed_document | 1024 | 0.1.8 | 25.526 | 16.299 | -36.1% |
| js | mixed_document | 1024 | 0.1.9 | 26.744 | 16.299 | -39.1% |
| php | quoted_fences | 128 | 0.1.9 | 1.667 | 1.327 | ranges overlap |
| php | quoted_fences | 128 | 0.1.10 | 1.255 | 1.327 | ranges overlap |
| php | verse_definitions | 128 | 0.1.9 | 3.983 | 3.393 | ranges overlap |
| php | verse_definitions | 128 | 0.1.10 | 17.196 | 3.393 | -80.3% |
| php | verse_equivalent | 128 | 0.1.9 | 3.699 | 3.535 | ranges overlap |
| php | verse_equivalent | 128 | 0.1.10 | 24.120 | 3.535 | -85.3% |
| php | paragraphs | 128 | 0.1.9 | 0.372 | 0.185 | -50.3% |
| php | paragraphs | 128 | 0.1.10 | 0.337 | 0.185 | -45.1% |
| php | mixed_document | 128 | 0.1.9 | 4.062 | 2.571 | ranges overlap |
| php | mixed_document | 128 | 0.1.10 | 4.114 | 2.571 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.9 | 1.428 | 1.404 | ranges overlap |
| php | quoted_false_mixed_closer | 128 | 0.1.10 | 1.303 | 1.404 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.9 | 1.367 | 1.344 | ranges overlap |
| php | quoted_indented_closer | 128 | 0.1.10 | 1.294 | 1.344 | ranges overlap |
| php | html_table | 128 | 0.1.9 | 75.185 | 36.965 | -50.8% |
| php | html_table | 128 | 0.1.10 | 86.981 | 36.965 | -57.5% |
| php | html_definition_list | 128 | 0.1.9 | 36.865 | 13.887 | -62.3% |
| php | html_definition_list | 128 | 0.1.10 | 44.049 | 13.887 | -68.5% |
| php | quoted_fences | 1024 | 0.1.9 | 9.164 | 9.260 | ranges overlap |
| php | quoted_fences | 1024 | 0.1.10 | 10.285 | 9.260 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.9 | 27.927 | 25.921 | ranges overlap |
| php | verse_definitions | 1024 | 0.1.10 | 800.499 | 25.921 | -96.8% |
| php | verse_equivalent | 1024 | 0.1.9 | 26.715 | 27.511 | ranges overlap |
| php | verse_equivalent | 1024 | 0.1.10 | 1174.312 | 27.511 | -97.7% |
| php | paragraphs | 1024 | 0.1.9 | 2.240 | 1.507 | -32.7% |
| php | paragraphs | 1024 | 0.1.10 | 2.593 | 1.507 | -41.9% |
| php | mixed_document | 1024 | 0.1.9 | 927.353 | 356.224 | -61.6% |
| php | mixed_document | 1024 | 0.1.10 | 557.954 | 356.224 | -36.2% |
| php | quoted_false_mixed_closer | 1024 | 0.1.9 | 7.992 | 9.335 | ranges overlap |
| php | quoted_false_mixed_closer | 1024 | 0.1.10 | 10.379 | 9.335 | ranges overlap |
| php | quoted_indented_closer | 1024 | 0.1.9 | 7.642 | 9.489 | ranges overlap |
| php | quoted_indented_closer | 1024 | 0.1.10 | 9.795 | 9.489 | ranges overlap |
| php | html_table | 1024 | 0.1.9 | 703.066 | 350.329 | -50.2% |
| php | html_table | 1024 | 0.1.10 | 1499.097 | 350.329 | -76.6% |
| php | html_definition_list | 1024 | 0.1.9 | 312.732 | 126.529 | -59.5% |
| php | html_definition_list | 1024 | 0.1.10 | 1190.962 | 126.529 | -89.4% |
| rs | quoted_fences | 128 | 0.1.6 | 0.091 | 0.068 | -25.2% |
| rs | quoted_fences | 128 | 0.1.7 | 0.101 | 0.068 | -32.1% |
| rs | verse_definitions | 128 | 0.1.6 | 0.163 | 0.144 | n/a: different output |
| rs | verse_definitions | 128 | 0.1.7 | 0.184 | 0.144 | n/a: different output |
| rs | verse_equivalent | 128 | 0.1.6 | 0.136 | 0.164 | ranges overlap |
| rs | verse_equivalent | 128 | 0.1.7 | 0.197 | 0.164 | ranges overlap |
| rs | paragraphs | 128 | 0.1.6 | 0.025 | 0.020 | ranges overlap |
| rs | paragraphs | 128 | 0.1.7 | 0.028 | 0.020 | ranges overlap |
| rs | mixed_document | 128 | 0.1.6 | 0.282 | 0.209 | ranges overlap |
| rs | mixed_document | 128 | 0.1.7 | 0.389 | 0.209 | ranges overlap |
| rs | quoted_fences | 1024 | 0.1.6 | 1.841 | 0.632 | -65.6% |
| rs | quoted_fences | 1024 | 0.1.7 | 2.208 | 0.632 | -71.4% |
| rs | verse_definitions | 1024 | 0.1.6 | 1.075 | 1.333 | n/a: different output |
| rs | verse_definitions | 1024 | 0.1.7 | 1.821 | 1.333 | n/a: different output |
| rs | verse_equivalent | 1024 | 0.1.6 | 1.248 | 1.481 | ranges overlap |
| rs | verse_equivalent | 1024 | 0.1.7 | 1.788 | 1.481 | ranges overlap |
| rs | paragraphs | 1024 | 0.1.6 | 0.199 | 0.153 | -23.1% |
| rs | paragraphs | 1024 | 0.1.7 | 0.218 | 0.153 | -29.8% |
| rs | mixed_document | 1024 | 0.1.6 | 2.421 | 1.703 | -29.7% |
| rs | mixed_document | 1024 | 0.1.7 | 2.649 | 1.703 | -35.7% |
