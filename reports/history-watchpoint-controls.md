# Older-tag cost checks

Four alternating rounds of 21 samples per revision on CPU 12 repeat PHP cases and Rust verse/paragraph controls from the release-history fixtures. The revision order reverses for each case. Every output hash matches its original history point. The shared host still affects timings. These diagnostics supplement the original history, whose raw samples remain intact.

[Raw controls](history-watchpoint-controls.json) · [CSV](history-watchpoint-controls.csv) · [Source verification](history-watchpoint-source-verification.json)

The diagnostic producer did not enforce source/artifact checks itself. Cached source cleanliness, PHP autoload origins and Rust embedded revisions were checked during the run and afterward. The original immutable source pins and unchanged history workers identify the inputs; this is weaker provenance than the guarded focused sessions.

## Results

Most PHP parser cases against 0.1.9 measure about +21% to +58%, below the earlier +100% readings. The larger mixed_document case improves by 35.2%. At n=1024, verse_definitions measures 23.086 to 34.629 ms (+50.0%), compared with 826.618 ms on 0.1.10. PHP full imports improve against 0.1.9 and 0.1.10, but remain much slower than 0.1.7. That version wrote directly from the DOM; current imports build and validate an AST, render it, then inspect loss decisions. Code reading suggests that the decoder draft can reduce part of this cost; it is measured separately in the focused sessions. These history fixtures contain no comments, so the comment-cache draft does not affect them.

Rust verse_equivalent at n=1024 measures 0.951 to 1.842 ms against 0.1.4 (+93.7%). It is 1.898 ms on 0.1.7. The increased cost predates the current review fixes; code reading found no safe shortcut in the ownership checks. This remains a control to monitor, without treating the earlier +116.9% reading as a repeatable percentage.

| Engine | Case | n | Older tag | Older ms | Main ms | Change |
|---|---|---:|---|---:|---:|---:|
| php | html_definition_list | 128 | 0.1.7 | 2.403 | 18.656 | +676.2% |
| php | html_definition_list | 128 | 0.1.9 | 32.976 | 18.656 | -43.4% |
| php | html_definition_list | 128 | 0.1.10 | 43.411 | 18.656 | -57.0% |
| php | html_definition_list | 1024 | 0.1.7 | 20.559 | 297.769 | +1348.3% |
| php | html_definition_list | 1024 | 0.1.9 | 337.651 | 297.769 | -11.8% |
| php | html_definition_list | 1024 | 0.1.10 | 1159.085 | 297.769 | -74.3% |
| php | html_table | 128 | 0.1.7 | 22.277 | 50.303 | +125.8% |
| php | html_table | 128 | 0.1.9 | 66.772 | 50.303 | -24.7% |
| php | html_table | 128 | 0.1.10 | 81.659 | 50.303 | -38.4% |
| php | html_table | 1024 | 0.1.7 | 182.504 | 547.909 | +200.2% |
| php | html_table | 1024 | 0.1.9 | 646.069 | 547.909 | -15.2% |
| php | html_table | 1024 | 0.1.10 | 1398.026 | 547.909 | -60.8% |
| php | mixed_document | 128 | 0.1.7 | 3.318 | 3.939 | +18.7% |
| php | mixed_document | 128 | 0.1.9 | 3.038 | 3.939 | +29.6% |
| php | mixed_document | 128 | 0.1.10 | 4.049 | 3.939 | -2.7% |
| php | mixed_document | 1024 | 0.1.7 | 712.750 | 513.118 | -28.0% |
| php | mixed_document | 1024 | 0.1.9 | 791.308 | 513.118 | -35.2% |
| php | mixed_document | 1024 | 0.1.10 | 527.761 | 513.118 | -2.8% |
| php | paragraphs | 128 | 0.1.7 | 0.385 | 0.435 | +13.0% |
| php | paragraphs | 128 | 0.1.9 | 0.359 | 0.435 | +21.4% |
| php | paragraphs | 128 | 0.1.10 | 0.449 | 0.435 | -3.0% |
| php | paragraphs | 1024 | 0.1.7 | 2.269 | 2.761 | +21.7% |
| php | paragraphs | 1024 | 0.1.9 | 2.256 | 2.761 | +22.4% |
| php | paragraphs | 1024 | 0.1.10 | 2.689 | 2.761 | +2.7% |
| php | quoted_false_mixed_closer | 128 | 0.1.7 | 0.979 | 1.601 | +63.6% |
| php | quoted_false_mixed_closer | 128 | 0.1.9 | 1.036 | 1.601 | +54.5% |
| php | quoted_false_mixed_closer | 128 | 0.1.10 | 1.288 | 1.601 | +24.3% |
| php | quoted_false_mixed_closer | 1024 | 0.1.7 | 7.307 | 11.844 | +62.1% |
| php | quoted_false_mixed_closer | 1024 | 0.1.9 | 7.963 | 11.844 | +48.7% |
| php | quoted_false_mixed_closer | 1024 | 0.1.10 | 9.763 | 11.844 | +21.3% |
| php | quoted_fences | 128 | 0.1.7 | 0.983 | 1.606 | +63.5% |
| php | quoted_fences | 128 | 0.1.9 | 1.027 | 1.606 | +56.4% |
| php | quoted_fences | 128 | 0.1.10 | 1.283 | 1.606 | +25.2% |
| php | quoted_fences | 1024 | 0.1.7 | 7.143 | 11.462 | +60.5% |
| php | quoted_fences | 1024 | 0.1.9 | 7.269 | 11.462 | +57.7% |
| php | quoted_fences | 1024 | 0.1.10 | 9.131 | 11.462 | +25.5% |
| php | quoted_indented_closer | 128 | 0.1.7 | 1.013 | 1.649 | +62.7% |
| php | quoted_indented_closer | 128 | 0.1.9 | 1.055 | 1.649 | +56.3% |
| php | quoted_indented_closer | 128 | 0.1.10 | 1.311 | 1.649 | +25.8% |
| php | quoted_indented_closer | 1024 | 0.1.7 | 6.976 | 11.737 | +68.3% |
| php | quoted_indented_closer | 1024 | 0.1.9 | 7.473 | 11.737 | +57.1% |
| php | quoted_indented_closer | 1024 | 0.1.10 | 9.422 | 11.737 | +24.6% |
| php | verse_definitions | 128 | 0.1.7 | 2.784 | 4.274 | +53.5% |
| php | verse_definitions | 128 | 0.1.9 | 2.895 | 4.274 | +47.6% |
| php | verse_definitions | 128 | 0.1.10 | 17.229 | 4.274 | -75.2% |
| php | verse_definitions | 1024 | 0.1.7 | 21.911 | 34.629 | +58.0% |
| php | verse_definitions | 1024 | 0.1.9 | 23.086 | 34.629 | +50.0% |
| php | verse_definitions | 1024 | 0.1.10 | 826.618 | 34.629 | -95.8% |
| php | verse_equivalent | 128 | 0.1.7 | 3.039 | 4.680 | +54.0% |
| php | verse_equivalent | 128 | 0.1.9 | 3.245 | 4.680 | +44.2% |
| php | verse_equivalent | 128 | 0.1.10 | 24.023 | 4.680 | -80.5% |
| php | verse_equivalent | 1024 | 0.1.7 | 23.581 | 35.724 | +51.5% |
| php | verse_equivalent | 1024 | 0.1.9 | 24.208 | 35.724 | +47.6% |
| php | verse_equivalent | 1024 | 0.1.10 | 1204.493 | 35.724 | -97.0% |
| rs | paragraphs | 128 | 0.1.4 | 0.026 | 0.031 | +17.9% |
| rs | paragraphs | 128 | 0.1.6 | 0.026 | 0.031 | +17.2% |
| rs | paragraphs | 128 | 0.1.7 | 0.028 | 0.031 | +10.7% |
| rs | paragraphs | 1024 | 0.1.4 | 0.225 | 0.248 | +10.5% |
| rs | paragraphs | 1024 | 0.1.6 | 0.216 | 0.248 | +15.0% |
| rs | paragraphs | 1024 | 0.1.7 | 0.236 | 0.248 | +5.4% |
| rs | verse_equivalent | 128 | 0.1.4 | 0.127 | 0.212 | +66.2% |
| rs | verse_equivalent | 128 | 0.1.6 | 0.134 | 0.212 | +58.3% |
| rs | verse_equivalent | 128 | 0.1.7 | 0.222 | 0.212 | -4.5% |
| rs | verse_equivalent | 1024 | 0.1.4 | 0.951 | 1.842 | +93.7% |
| rs | verse_equivalent | 1024 | 0.1.6 | 1.335 | 1.842 | +38.0% |
| rs | verse_equivalent | 1024 | 0.1.7 | 1.898 | 1.842 | -3.0% |
