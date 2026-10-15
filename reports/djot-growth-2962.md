# Djot import growth after issue 2962

Released tags versus fixed merged-main snapshots. Each operation uses seven alternating pairs after a 500 ms warmup per revision and point. Raw conversion excludes loss-report traversal; rendering uses the converted text. CPU affinity does not reserve a core.

| Engine | Released tag and commit | Merged main | Measurement started |
| --- | --- | --- | --- |
| js | 0.1.11, `5454dafb93a89ad1dbf6c03bac7de17c1d8b1206` | `224b0c32e22480571c99aae3f0055a6e5a091f74` | 2026-10-15T12:13:05.540Z |
| php | 0.1.12, `4f85fe157afd579a4d7fbe96463dec0547718551` | `967f253974433dbc53534df74b7abeae10f26458` | 2026-10-15T12:14:24.890Z |
| rs | 0.1.9, `d9f5ea1efc0e1334cf7cb1193c2114e77706678a` | `76f95de6b62cfc0088312b0b9336390fd2cfd5f0` | 2026-10-15T11:18:20.978Z |

## Largest measured points

Times are medians in milliseconds. Eligible rows have matching converted text and Native HTML in both revisions. Other rows are observations with different output or a parser budget limit; their ratios are omitted.

| Engine | Family | Operation | Count | Release ms | Main ms | Main/release |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| js | repeated_labels | import | 512 | 122.589 | 129.556 | 1.057 |
| js | repeated_labels | render | 512 | 4.726 | 5.029 | 1.064 |
| js | shared_attributes | import | 512 | 43.387 | 47.208 | 1.088 |
| js | shared_attributes | render | 512 | 5.771 | 6.756 | 1.171 |
| js | nested_containers | import | 256 | 9.562 | 11.262 | excluded |
| js | nested_containers | render | 256 | 0.949 | 1.148 | excluded |
| js | definition_lists | import | 512 | 52.057 | 59.922 | 1.151 |
| js | definition_lists | render | 512 | 7.521 | 8.879 | 1.181 |
| js | quoted_unicode_images | import | 64 | 118.015 | 5.364 | 0.045 |
| js | quoted_unicode_images | render | 64 | 0.083 | 0.086 | 1.039 |
| php | repeated_labels | import | 512 | 237.228 | 250.716 | 1.057 |
| php | repeated_labels | render | 512 | 15.513 | 14.871 | 0.959 |
| php | shared_attributes | import | 512 | 75.557 | 83.793 | 1.109 |
| php | shared_attributes | render | 512 | 20.112 | 20.875 | 1.038 |
| php | nested_containers | import | 256 | 17.814 | 20.071 | excluded |
| php | nested_containers | render | 256 | 6.681 | 7.190 | excluded |
| php | definition_lists | import | 512 | 102.813 | 109.152 | 1.062 |
| php | definition_lists | render | 512 | 24.329 | 25.402 | 1.044 |
| php | quoted_unicode_images | import | 64 | 654.586 | 23.211 | 0.035 |
| php | quoted_unicode_images | render | 64 | 2.253 | 2.185 | 0.970 |
| rs | repeated_labels | import | 512 | 122.765 | 113.986 | 0.928 |
| rs | repeated_labels | render | 512 | 1.105 | 1.357 | 1.228 |
| rs | shared_attributes | import | 512 | 24.137 | 30.269 | 1.254 |
| rs | shared_attributes | render | 512 | 2.740 | 2.702 | 0.986 |
| rs | nested_containers | import | 256 | 8.139 | 9.444 | excluded |
| rs | nested_containers | render | 256 | 2.857 | 3.391 | excluded |
| rs | definition_lists | import | 512 | 28.542 | 33.192 | 1.163 |
| rs | definition_lists | render | 512 | 2.267 | 2.652 | 1.170 |
| rs | quoted_unicode_images | import | 64 | 113.150 | 3.901 | 0.034 |
| rs | quoted_unicode_images | render | 64 | 0.067 | 0.064 | 0.958 |

## Growth across eligible points

The exponent is a least-squares fit of log time against log input bytes. It describes these measurements, not an asymptotic bound. Excluded points do not enter the fit. Ratios across separate full-fleet sessions are not paired speedups.

| Engine | Family | Operation | Eligible points | Release exponent | Main exponent |
| --- | --- | --- | ---: | ---: | ---: |
| js | repeated_labels | import | 4 | 0.68 | 0.63 |
| js | repeated_labels | render | 4 | 1.03 | 1.02 |
| js | shared_attributes | import | 4 | 0.84 | 0.88 |
| js | shared_attributes | render | 4 | 1.00 | 1.01 |
| js | nested_containers | import | 4 | 0.92 | 0.95 |
| js | nested_containers | render | 4 | 1.09 | 1.16 |
| js | definition_lists | import | 4 | 0.64 | 0.71 |
| js | definition_lists | render | 4 | 0.92 | 0.92 |
| js | quoted_unicode_images | import | 4 | 1.30 | 0.37 |
| js | quoted_unicode_images | render | 4 | 0.60 | 0.57 |
| php | repeated_labels | import | 4 | 1.04 | 1.04 |
| php | repeated_labels | render | 4 | 1.02 | 1.00 |
| php | shared_attributes | import | 4 | 1.06 | 1.06 |
| php | shared_attributes | render | 4 | 1.10 | 1.09 |
| php | nested_containers | import | 4 | 0.98 | 0.96 |
| php | nested_containers | render | 4 | 1.04 | 1.02 |
| php | definition_lists | import | 4 | 1.00 | 0.98 |
| php | definition_lists | render | 4 | 1.03 | 1.03 |
| php | quoted_unicode_images | import | 4 | 1.96 | 1.05 |
| php | quoted_unicode_images | render | 4 | 1.11 | 1.13 |
| rs | repeated_labels | import | 4 | 0.87 | 0.91 |
| rs | repeated_labels | render | 4 | 0.92 | 1.04 |
| rs | shared_attributes | import | 4 | 0.97 | 1.01 |
| rs | shared_attributes | render | 4 | 1.09 | 1.06 |
| rs | nested_containers | import | 4 | 0.74 | 0.77 |
| rs | nested_containers | render | 4 | 0.95 | 0.91 |
| rs | definition_lists | import | 4 | 0.91 | 0.94 |
| rs | definition_lists | render | 4 | 1.08 | 1.20 |
| rs | quoted_unicode_images | import | 4 | 1.59 | 0.75 |
| rs | quoted_unicode_images | render | 4 | 0.87 | 0.89 |

Raw samples, source/build hashes, output hashes, Native checks and host load are retained in [JavaScript](djot-growth-js.json), [PHP](djot-growth-php.json) and [Rust](djot-growth-rs.json). Reproduction instructions are in [the runner README](../scripts/djot-growth/README.md). These results do not claim that every import family scales linearly. Native parser performance remains a separate follow-up in [carve#2958](https://github.com/markup-carve/carve/issues/2958).
