# Engine release history

Sessions began 2026-10-01T20:02:58.582388+00:00. 4 stable tags per engine plus a pinned dev-main when measured source differs from the newest tag. Candidate PR points are included when requested.

Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.

The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.

[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)

## Measurement sessions

JavaScript and Rust retain the complete four-round session recorded before the PHP definition-list scan fix. PHP was repeated across all four tags, main and the updated draft after that fix. Both sessions used four rounds of eleven samples, sizes 128 and 1024, and CPU 6. Each engine carries its own original driver, invocation, timestamps and clean-tree state. No timestamps or timing signatures were backfilled.

js: driver `7b740fa84321e24eb542fef97de544ef0409d871`, session started 2026-10-01T20:02:58.582388+00:00, CPU affinity [6]; dirty benchmark tree: False.

php: driver `709ee4fe875c1d175f6a87111931ba5daf27cb69`, session started 2026-10-01T20:30:24.445991+00:00, CPU affinity [6]; dirty benchmark tree: False.

rs: driver `7b740fa84321e24eb542fef97de544ef0409d871`, session started 2026-10-01T20:02:58.582388+00:00, CPU affinity [6]; dirty benchmark tree: False.

## Watchpoints

- php dev-main html_table n=128: 48.038 ms versus 21.446 ms on 0.1.7 (+124.0%). Output hashes match; investigate the additional cost against this older baseline.
- php dev-main html_definition_list n=128: 31.417 ms versus 2.383 ms on 0.1.7 (+1218.2%). Output hashes match; investigate the additional cost against this older baseline.
- php dev-main html_table n=1024: 506.343 ms versus 165.348 ms on 0.1.7 (+206.2%). Output hashes match; investigate the additional cost against this older baseline.
- php dev-main html_definition_list n=1024: 908.358 ms versus 18.385 ms on 0.1.7 (+4840.8%). Output hashes match; investigate the additional cost against this older baseline.
- php dev-main html_definition_list n=1024: 908.358 ms versus 264.155 ms on 0.1.8 (+243.9%). Output hashes match; investigate the additional cost against this older baseline.
- php dev-main html_definition_list n=1024: 908.358 ms versus 280.440 ms on 0.1.9 (+223.9%). Output hashes match; investigate the additional cost against this older baseline.
- php PR-2815 html_table n=128: 51.197 ms versus 21.446 ms on 0.1.7 (+138.7%). Output hashes match; investigate the additional cost against this older baseline.
- php PR-2815 html_definition_list n=128: 17.907 ms versus 2.383 ms on 0.1.7 (+651.4%). Output hashes match; investigate the additional cost against this older baseline.
- php PR-2815 html_table n=1024: 514.973 ms versus 165.348 ms on 0.1.7 (+211.4%). Output hashes match; investigate the additional cost against this older baseline.
- php PR-2815 html_definition_list n=1024: 198.262 ms versus 18.385 ms on 0.1.7 (+978.4%). Output hashes match; investigate the additional cost against this older baseline.

## js

Runtime: v22.22.2. Latest tag: 0.1.9.

![js history](engine-history-js.svg)

| Revision | Commit |
|---|---|
| 0.1.6 | `379474fbc87a9afe36620e2b71902f88d2b757b5` |
| 0.1.7 | `680af386605367bb86a07c2b258673c6514c4005` |
| 0.1.8 | `23204e8982012a4b3900dc735e46b3c2630803c2` |
| 0.1.9 | `a0cb0ad18fc4da223e46cfb77672e4dec537a83b` |
| dev-main | `8534bde0ecf823a0b60ae990bd973d9625fcf966` |
| PR-2445 | `9fbb98d44155930d0e2f6ed4f304f83203478270` |

JS draft head `b807d878185196b09d41be0b99a6bfe43906e0f5` adds two helper contract comments after measured commit `9fbb98d44155930d0e2f6ed4f304f83203478270`. Comment-free TypeScript transpilation is identical; no executable code changed.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag |
|---|---|---:|---:|---:|---:|---:|---:|:---:|
| dev-main | quoted_fences | 128 | 0.290 | 0.314 | +8.5% | 0.314 | +0.0% | yes |
| dev-main | verse_definitions | 128 | 0.769 | 0.771 | +0.2% | 0.771 | +0.0% | yes |
| dev-main | verse_equivalent | 128 | 0.832 | 0.894 | +7.4% | 0.894 | +0.0% | yes |
| dev-main | paragraphs | 128 | 0.088 | 0.090 | +2.4% | 0.090 | +0.0% | yes |
| dev-main | mixed_document | 128 | 1.443 | 1.772 | +22.8% | 1.772 | +0.0% | yes |
| dev-main | quoted_fences | 1024 | 2.214 | 2.448 | +10.5% | 2.448 | +0.0% | yes |
| dev-main | verse_definitions | 1024 | 6.937 | 6.288 | -9.4% | 6.288 | +0.0% | yes |
| dev-main | verse_equivalent | 1024 | 7.928 | 6.572 | -17.1% | 6.572 | +0.0% | yes |
| dev-main | paragraphs | 1024 | 0.699 | 0.712 | +2.0% | 0.712 | +0.0% | yes |
| dev-main | mixed_document | 1024 | 26.607 | 27.273 | +2.5% | 27.273 | +0.0% | yes |
| PR-2445 | quoted_fences | 128 | 0.290 | 0.268 | -7.5% | 0.314 | -14.7% | yes |
| PR-2445 | verse_definitions | 128 | 0.769 | 0.685 | -10.9% | 0.771 | -11.1% | yes |
| PR-2445 | verse_equivalent | 128 | 0.832 | 0.745 | -10.4% | 0.894 | -16.6% | yes |
| PR-2445 | paragraphs | 128 | 0.088 | 0.086 | -1.5% | 0.090 | -3.8% | yes |
| PR-2445 | mixed_document | 128 | 1.443 | 1.428 | -1.1% | 1.772 | -19.4% | yes |
| PR-2445 | quoted_fences | 1024 | 2.214 | 1.910 | -13.7% | 2.448 | -22.0% | yes |
| PR-2445 | verse_definitions | 1024 | 6.937 | 5.506 | -20.6% | 6.288 | -12.4% | yes |
| PR-2445 | verse_equivalent | 1024 | 7.928 | 6.037 | -23.8% | 6.572 | -8.1% | yes |
| PR-2445 | paragraphs | 1024 | 0.699 | 0.726 | +3.9% | 0.712 | +1.9% | yes |
| PR-2445 | mixed_document | 1024 | 26.607 | 25.718 | -3.3% | 27.273 | -5.7% | yes |

## php

Runtime: 8.5.11. Latest tag: 0.1.10.

![php history](engine-history-php.svg)

| Revision | Commit |
|---|---|
| 0.1.7 | `9fd773b229d4d63b8b468b87b122943d563c80dc` |
| 0.1.8 | `93409af08040344221ff0d2d2d40351c8105e413` |
| 0.1.9 | `d4b53388df891158c9c868177a4213a5e8b2f608` |
| 0.1.10 | `6d94607eaa9d51c9ed782342161beca77b05aaf9` |
| dev-main | `de9b7ea63c3d079920923f7b3516d2bab1eff516` |
| PR-2815 | `f2c3c0d4519fca7cc60abfb1a15688dddb3c749d` |

PHP host load rose from 4.57 to 17.93 during the repeat. Several unchanged parse/render cases at n=128 measured 15–21% slower in the draft; these need a quiet-host repeat before attributing a regression. The definition-list improvement is much larger and also appeared in the earlier diagnostic repeat.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag |
|---|---|---:|---:|---:|---:|---:|---:|:---:|
| dev-main | quoted_fences | 128 | 1.191 | 1.401 | +17.6% | 1.401 | +0.0% | yes |
| dev-main | verse_definitions | 128 | 16.615 | 3.481 | -79.0% | 3.481 | +0.0% | yes |
| dev-main | verse_equivalent | 128 | 22.054 | 3.858 | -82.5% | 3.858 | +0.0% | yes |
| dev-main | paragraphs | 128 | 0.317 | 0.283 | -10.9% | 0.283 | +0.0% | yes |
| dev-main | mixed_document | 128 | 3.808 | 3.357 | -11.8% | 3.357 | +0.0% | yes |
| dev-main | quoted_false_mixed_closer | 128 | 1.239 | 1.363 | +10.0% | 1.363 | +0.0% | yes |
| dev-main | quoted_indented_closer | 128 | 1.163 | 1.420 | +22.1% | 1.420 | +0.0% | yes |
| dev-main | html_table | 128 | 82.685 | 48.038 | -41.9% | 48.038 | +0.0% | yes |
| dev-main | html_definition_list | 128 | 47.621 | 31.417 | -34.0% | 31.417 | +0.0% | yes |
| dev-main | quoted_fences | 1024 | 9.349 | 10.591 | +13.3% | 10.591 | +0.0% | yes |
| dev-main | verse_definitions | 1024 | 827.168 | 30.259 | -96.3% | 30.259 | +0.0% | yes |
| dev-main | verse_equivalent | 1024 | 1095.591 | 30.670 | -97.2% | 30.670 | +0.0% | yes |
| dev-main | paragraphs | 1024 | 2.510 | 2.503 | -0.3% | 2.503 | +0.0% | yes |
| dev-main | mixed_document | 1024 | 518.336 | 474.305 | -8.5% | 474.305 | +0.0% | yes |
| dev-main | quoted_false_mixed_closer | 1024 | 8.921 | 10.046 | +12.6% | 10.046 | +0.0% | yes |
| dev-main | quoted_indented_closer | 1024 | 8.658 | 10.054 | +16.1% | 10.054 | +0.0% | yes |
| dev-main | html_table | 1024 | 1326.066 | 506.343 | -61.8% | 506.343 | +0.0% | yes |
| dev-main | html_definition_list | 1024 | 989.732 | 908.358 | -8.2% | 908.358 | +0.0% | yes |
| PR-2815 | quoted_fences | 128 | 1.191 | 1.467 | +23.2% | 1.401 | +4.7% | yes |
| PR-2815 | verse_definitions | 128 | 16.615 | 4.034 | -75.7% | 3.481 | +15.9% | yes |
| PR-2815 | verse_equivalent | 128 | 22.054 | 4.220 | -80.9% | 3.858 | +9.4% | yes |
| PR-2815 | paragraphs | 128 | 0.317 | 0.334 | +5.3% | 0.283 | +18.2% | yes |
| PR-2815 | mixed_document | 128 | 3.808 | 4.025 | +5.7% | 3.357 | +19.9% | yes |
| PR-2815 | quoted_false_mixed_closer | 128 | 1.239 | 1.647 | +32.9% | 1.363 | +20.8% | yes |
| PR-2815 | quoted_indented_closer | 128 | 1.163 | 1.554 | +33.6% | 1.420 | +9.5% | yes |
| PR-2815 | html_table | 128 | 82.685 | 51.197 | -38.1% | 48.038 | +6.6% | yes |
| PR-2815 | html_definition_list | 128 | 47.621 | 17.907 | -62.4% | 31.417 | -43.0% | yes |
| PR-2815 | quoted_fences | 1024 | 9.349 | 10.948 | +17.1% | 10.591 | +3.4% | yes |
| PR-2815 | verse_definitions | 1024 | 827.168 | 29.970 | -96.4% | 30.259 | -1.0% | yes |
| PR-2815 | verse_equivalent | 1024 | 1095.591 | 33.391 | -97.0% | 30.670 | +8.9% | yes |
| PR-2815 | paragraphs | 1024 | 2.510 | 2.553 | +1.7% | 2.503 | +2.0% | yes |
| PR-2815 | mixed_document | 1024 | 518.336 | 494.901 | -4.5% | 474.305 | +4.3% | yes |
| PR-2815 | quoted_false_mixed_closer | 1024 | 8.921 | 10.548 | +18.2% | 10.046 | +5.0% | yes |
| PR-2815 | quoted_indented_closer | 1024 | 8.658 | 10.583 | +22.2% | 10.054 | +5.3% | yes |
| PR-2815 | html_table | 1024 | 1326.066 | 514.973 | -61.2% | 506.343 | +1.7% | yes |
| PR-2815 | html_definition_list | 1024 | 989.732 | 198.262 | -80.0% | 908.358 | -78.2% | yes |

## rs

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Latest tag: 0.1.7.

![rs history](engine-history-rs.svg)

| Revision | Commit |
|---|---|
| 0.1.4 | `2e9c43f22c5ed05dbd93323ae6b9c94bb867b285` |
| 0.1.5 | `56cb353657375e1a85965d5fcf00a234831d82c6` |
| 0.1.6 | `d7837249c64b88879b04cd71b8b5555ff246e16f` |
| 0.1.7 | `9f3f334c7d5c91c57e4e6269b32599af1062fdde` |
| dev-main | `b4d0be3f0b76bfc0ebc50c7ca5205461ed0ed550` |
| PR-2258 | `b3fd9aafccad03dd217cfe4a705e72f8249d0ebe` |

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag |
|---|---|---:|---:|---:|---:|---:|---:|:---:|
| dev-main | quoted_fences | 128 | 0.094 | 0.080 | -14.4% | 0.080 | +0.0% | yes |
| dev-main | verse_definitions | 128 | 0.169 | 0.154 | n/a: different output | 0.154 | +0.0% | no |
| dev-main | verse_equivalent | 128 | 0.187 | 0.184 | -1.9% | 0.184 | +0.0% | yes |
| dev-main | paragraphs | 128 | 0.024 | 0.024 | -1.1% | 0.024 | +0.0% | yes |
| dev-main | mixed_document | 128 | 0.279 | 0.274 | -1.8% | 0.274 | +0.0% | yes |
| dev-main | quoted_fences | 1024 | 2.061 | 0.693 | -66.4% | 0.693 | +0.0% | yes |
| dev-main | verse_definitions | 1024 | 1.676 | 1.004 | n/a: different output | 1.004 | +0.0% | no |
| dev-main | verse_equivalent | 1024 | 1.648 | 1.616 | -1.9% | 1.616 | +0.0% | yes |
| dev-main | paragraphs | 1024 | 0.197 | 0.192 | -2.3% | 0.192 | +0.0% | yes |
| dev-main | mixed_document | 1024 | 2.400 | 2.359 | -1.7% | 2.359 | +0.0% | yes |
| PR-2258 | quoted_fences | 128 | 0.094 | 0.079 | -15.9% | 0.080 | -1.7% | yes |
| PR-2258 | verse_definitions | 128 | 0.169 | 0.154 | n/a: different output | 0.154 | -0.0% | no |
| PR-2258 | verse_equivalent | 128 | 0.187 | 0.186 | -0.9% | 0.184 | +1.0% | yes |
| PR-2258 | paragraphs | 128 | 0.024 | 0.024 | -1.6% | 0.024 | -0.5% | yes |
| PR-2258 | mixed_document | 128 | 0.279 | 0.278 | -0.4% | 0.274 | +1.3% | yes |
| PR-2258 | quoted_fences | 1024 | 2.061 | 0.728 | -64.7% | 0.693 | +5.1% | yes |
| PR-2258 | verse_definitions | 1024 | 1.676 | 1.003 | n/a: different output | 1.004 | -0.1% | no |
| PR-2258 | verse_equivalent | 1024 | 1.648 | 1.588 | -3.6% | 1.616 | -1.7% | yes |
| PR-2258 | paragraphs | 1024 | 0.197 | 0.189 | -4.0% | 0.192 | -1.8% | yes |
| PR-2258 | mixed_document | 1024 | 2.400 | 2.364 | -1.5% | 2.359 | +0.2% | yes |

