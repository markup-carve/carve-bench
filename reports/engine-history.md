# Engine release history

Sessions began 2026-10-01T16:13:00.671025+00:00. 4 stable tags per engine plus a pinned dev-main when measured source differs from the newest tag.

Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.

The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.

[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)

## Measurement sessions

PHP and Rust retain the first completed run. JS was repeated with a minimum 500 ms warmup; its per-engine measurement_session records the separate driver commit, hashes, affinity and loads.

js: driver `9594c11bb1c526f3da3182df381f851f596a630f`, session started 2026-10-01T16:21:06.569916+00:00, CPU affinity [0]; dirty benchmark tree: True.

php: driver `06457ef66aadc4ad805641093993126eb3ebf762`, session started 2026-10-01T16:13:00.671025+00:00, CPU affinity [0]; dirty benchmark tree: False.

rs: driver `06457ef66aadc4ad805641093993126eb3ebf762`, session started 2026-10-01T16:13:00.671025+00:00, CPU affinity [0]; dirty benchmark tree: False.

## Watchpoints

- php html_table n=128: 45.504 ms versus 18.017 ms on 0.1.7 (+152.6%). Output hashes match; investigate the additional cost against this older baseline.
- php html_table n=1024: 485.292 ms versus 152.234 ms on 0.1.7 (+218.8%). Output hashes match; investigate the additional cost against this older baseline.
- rs verse_equivalent n=1024: 1.584 ms versus 0.757 ms on 0.1.4 (+109.2%). Output hashes match; investigate the additional cost against this older baseline.

## js

Runtime: v22.22.2. Latest tag: 0.1.9.

![js history](engine-history-js.svg)

| Revision | Commit |
|---|---|
| 0.1.6 | `379474fbc87a9afe36620e2b71902f88d2b757b5` |
| 0.1.7 | `680af386605367bb86a07c2b258673c6514c4005` |
| 0.1.8 | `23204e8982012a4b3900dc735e46b3c2630803c2` |
| 0.1.9 | `a0cb0ad18fc4da223e46cfb77672e4dec537a83b` |
| dev-main | `4a983edecfc6549b3f73b5aeb5b563347be5ac04` |

| Case | n | Latest tag ms | Last point ms | Change | Same output |
|---|---:|---:|---:|---:|:---:|
| quoted_fences | 128 | 0.278 | 0.301 | +8.2% | yes |
| verse_definitions | 128 | 0.735 | 0.722 | -1.8% | yes |
| verse_equivalent | 128 | 0.747 | 0.801 | +7.2% | yes |
| paragraphs | 128 | 0.081 | 0.081 | -0.2% | yes |
| mixed_document | 128 | 1.481 | 1.527 | +3.1% | yes |
| quoted_fences | 1024 | 2.130 | 2.089 | -1.9% | yes |
| verse_definitions | 1024 | 5.731 | 6.091 | +6.3% | yes |
| verse_equivalent | 1024 | 7.043 | 6.742 | -4.3% | yes |
| paragraphs | 1024 | 0.661 | 0.661 | -0.1% | yes |
| mixed_document | 1024 | 24.054 | 25.626 | +6.5% | yes |

## php

Runtime: 8.5.11. Latest tag: 0.1.10.

![php history](engine-history-php.svg)

| Revision | Commit |
|---|---|
| 0.1.7 | `9fd773b229d4d63b8b468b87b122943d563c80dc` |
| 0.1.8 | `93409af08040344221ff0d2d2d40351c8105e413` |
| 0.1.9 | `d4b53388df891158c9c868177a4213a5e8b2f608` |
| 0.1.10 | `6d94607eaa9d51c9ed782342161beca77b05aaf9` |
| dev-main | `b9d4264994fdfd0bb1c6165eb7f75a2565f6632d` |

| Case | n | Latest tag ms | Last point ms | Change | Same output |
|---|---:|---:|---:|---:|:---:|
| quoted_fences | 128 | 1.086 | 1.366 | +25.7% | yes |
| verse_definitions | 128 | 14.446 | 3.520 | -75.6% | yes |
| verse_equivalent | 128 | 20.215 | 3.634 | -82.0% | yes |
| paragraphs | 128 | 0.325 | 0.279 | -13.9% | yes |
| mixed_document | 128 | 3.543 | 3.302 | -6.8% | yes |
| quoted_false_mixed_closer | 128 | 1.097 | 1.343 | +22.4% | yes |
| quoted_indented_closer | 128 | 1.109 | 1.330 | +19.9% | yes |
| html_table | 128 | 72.000 | 45.504 | -36.8% | yes |
| quoted_fences | 1024 | 8.155 | 10.001 | +22.6% | yes |
| verse_definitions | 1024 | 671.697 | 29.342 | -95.6% | yes |
| verse_equivalent | 1024 | 1004.828 | 30.019 | -97.0% | yes |
| paragraphs | 1024 | 2.224 | 2.242 | +0.8% | yes |
| mixed_document | 1024 | 473.152 | 485.844 | +2.7% | yes |
| quoted_false_mixed_closer | 1024 | 7.911 | 10.018 | +26.6% | yes |
| quoted_indented_closer | 1024 | 7.971 | 9.630 | +20.8% | yes |
| html_table | 1024 | 1259.757 | 485.292 | -61.5% | yes |

## rs

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Latest tag: 0.1.7.

![rs history](engine-history-rs.svg)

| Revision | Commit |
|---|---|
| 0.1.4 | `2e9c43f22c5ed05dbd93323ae6b9c94bb867b285` |
| 0.1.5 | `56cb353657375e1a85965d5fcf00a234831d82c6` |
| 0.1.6 | `d7837249c64b88879b04cd71b8b5555ff246e16f` |
| 0.1.7 | `9f3f334c7d5c91c57e4e6269b32599af1062fdde` |
| dev-main | `a4671198ee418f782d3cf5a68742371cde4a9e2f` |

| Case | n | Latest tag ms | Last point ms | Change | Same output |
|---|---:|---:|---:|---:|:---:|
| quoted_fences | 128 | 0.090 | 0.077 | -14.4% | yes |
| verse_definitions | 128 | 0.151 | 0.150 | n/a: different output | no |
| verse_equivalent | 128 | 0.164 | 0.173 | +5.2% | yes |
| paragraphs | 128 | 0.023 | 0.023 | -1.1% | yes |
| mixed_document | 128 | 0.263 | 0.258 | -2.1% | yes |
| quoted_fences | 1024 | 1.865 | 0.540 | -71.1% | yes |
| verse_definitions | 1024 | 1.558 | 1.411 | n/a: different output | no |
| verse_equivalent | 1024 | 1.529 | 1.584 | +3.6% | yes |
| paragraphs | 1024 | 0.190 | 0.183 | -3.9% | yes |
| mixed_document | 1024 | 2.298 | 2.217 | -3.5% | yes |

