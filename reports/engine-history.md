# Engine release history

PHP is pinned to merged commit 40653c424; the newer main at setup changes only CHANGELOG.md. Runtime sources and dependency manifests are identical.

Retained sessions began 2026-10-02T12:21:26.895588+00:00. 4 stable tags per engine plus a pinned dev-main when measured source differs from the newest tag.

Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.

The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.

[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)

## Measurement sessions

Release-tag measurements retain their original sessions. All three merged main points were refreshed 2026-10-07T11:06:48.553026+00:00 with the same fixtures, workers and sampling counts on CPU 13. Separate shared-host sessions and build configurations do not isolate code speedups.

js retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

php retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

rs retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

js dev-main refresh: 2026-10-07T11:05:08.587349+00:00 to 2026-10-07T11:05:34.556255+00:00; driver `37db57fe9693193149d42dd07faf231770138af4`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

php dev-main refresh: 2026-10-07T11:05:34.805182+00:00 to 2026-10-07T11:06:47.706499+00:00; driver `37db57fe9693193149d42dd07faf231770138af4`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

rs dev-main refresh: 2026-10-07T11:06:47.723904+00:00 to 2026-10-07T11:06:48.538775+00:00; driver `37db57fe9693193149d42dd07faf231770138af4`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

## Shared-host spread

Retained session initial load average: [5.18994140625, 5.53466796875, 5.52490234375]. Final load average: [7.6640625, 8.294921875, 7.34130859375]. Whiskers show sample ranges; medians from noisy sessions are descriptive readings, not confirmed speed changes.

js dev-main refresh load average: initial [1.6943359375, 2.181640625, 2.2548828125]; final [2.39794921875, 2.3115234375, 2.29638671875].

php dev-main refresh load average: initial [2.39794921875, 2.3115234375, 2.29638671875]; final [1.8603515625, 2.15380859375, 2.240234375].

rs dev-main refresh load average: initial [1.8603515625, 2.15380859375, 2.240234375]; final [1.8603515625, 2.15380859375, 2.240234375].

js: widest sample range is 12.9x for 0.1.8 verse_equivalent n=128 (0.748 to 9.631 ms). Inspect round medians in the JSON before attributing a difference to code.

php: widest sample range is 5.5x for 0.1.9 paragraphs n=128 (0.274 to 1.495 ms). Inspect round medians in the JSON before attributing a difference to code.

rs: widest sample range is 7.2x for 0.1.6 verse_equivalent n=128 (0.115 to 0.829 ms). Inspect round medians in the JSON before attributing a difference to code.

## Watchpoints



- php dev-main html_definition_list n=128: 14.554 ms versus 2.418 ms on 0.1.7 (+501.8%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_table n=1024: 384.436 ms versus 176.754 ms on 0.1.7 (+117.5%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_definition_list n=1024: 147.269 ms versus 19.463 ms on 0.1.7 (+656.7%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.

## js

Runtime: v22.22.2. Latest tag: 0.1.9.

![js history](engine-history-js.svg)

| Revision | Commit |
|---|---|
| 0.1.6 | `379474fbc87a9afe36620e2b71902f88d2b757b5` |
| 0.1.7 | `680af386605367bb86a07c2b258673c6514c4005` |
| 0.1.8 | `23204e8982012a4b3900dc735e46b3c2630803c2` |
| 0.1.9 | `a0cb0ad18fc4da223e46cfb77672e4dec537a83b` |
| dev-main | `5b9ca1632e179418944bc869ddd4dbc4165f9485` |

Merged main refreshed 2026-10-07T11:05:34.556275+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.311 | 0.230 | ranges overlap | 0.230 | +0.0% | yes | 0.254 to 1.718 | 0.201 to 2.140 |
| dev-main | verse_definitions | 128 | 0.744 | 0.589 | ranges overlap | 0.589 | +0.0% | yes | 0.656 to 2.999 | 0.547 to 0.814 |
| dev-main | verse_equivalent | 128 | 0.850 | 0.610 | ranges overlap | 0.610 | +0.0% | yes | 0.686 to 1.712 | 0.571 to 1.046 |
| dev-main | paragraphs | 128 | 0.079 | 0.070 | ranges overlap | 0.070 | +0.0% | yes | 0.075 to 0.101 | 0.066 to 0.187 |
| dev-main | mixed_document | 128 | 1.451 | 1.135 | ranges overlap | 1.135 | +0.0% | yes | 1.217 to 2.254 | 1.043 to 1.481 |
| dev-main | quoted_fences | 1024 | 2.401 | 1.640 | ranges overlap | 1.640 | +0.0% | yes | 1.997 to 5.849 | 1.593 to 2.213 |
| dev-main | verse_definitions | 1024 | 6.334 | 4.591 | ranges overlap | 4.591 | +0.0% | yes | 5.014 to 11.435 | 4.042 to 11.269 |
| dev-main | verse_equivalent | 1024 | 7.843 | 4.725 | ranges overlap | 4.725 | +0.0% | yes | 5.643 to 13.768 | 4.156 to 5.760 |
| dev-main | paragraphs | 1024 | 0.673 | 0.575 | ranges overlap | 0.575 | +0.0% | yes | 0.634 to 1.763 | 0.544 to 0.783 |
| dev-main | mixed_document | 1024 | 26.744 | 15.812 | -40.9% | 15.812 | +0.0% | yes | 21.797 to 63.089 | 12.899 to 19.658 |

## php

Runtime: 8.5.11. Latest tag: 0.1.10.

![php history](engine-history-php.svg)

| Revision | Commit |
|---|---|
| 0.1.7 | `9fd773b229d4d63b8b468b87b122943d563c80dc` |
| 0.1.8 | `93409af08040344221ff0d2d2d40351c8105e413` |
| 0.1.9 | `d4b53388df891158c9c868177a4213a5e8b2f608` |
| 0.1.10 | `6d94607eaa9d51c9ed782342161beca77b05aaf9` |
| dev-main | `40653c424dc9d3cc063aeb542696d42ffb58ea79` |

Merged main refreshed 2026-10-07T11:06:47.706526+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 1.255 | 1.371 | ranges overlap | 1.371 | +0.0% | yes | 1.187 to 1.458 | 1.254 to 1.488 |
| dev-main | verse_definitions | 128 | 17.196 | 3.494 | -79.7% | 3.494 | +0.0% | yes | 15.922 to 19.451 | 3.096 to 6.844 |
| dev-main | verse_equivalent | 128 | 24.120 | 3.650 | -84.9% | 3.650 | +0.0% | yes | 21.500 to 32.741 | 3.230 to 4.506 |
| dev-main | paragraphs | 128 | 0.337 | 0.194 | -42.4% | 0.194 | +0.0% | yes | 0.314 to 0.538 | 0.186 to 0.240 |
| dev-main | mixed_document | 128 | 4.114 | 2.604 | ranges overlap | 2.604 | +0.0% | yes | 3.662 to 6.599 | 2.304 to 4.306 |
| dev-main | quoted_false_mixed_closer | 128 | 1.303 | 1.325 | ranges overlap | 1.325 | +0.0% | yes | 1.208 to 2.339 | 1.222 to 2.937 |
| dev-main | quoted_indented_closer | 128 | 1.294 | 1.374 | ranges overlap | 1.374 | +0.0% | yes | 1.190 to 2.059 | 1.213 to 2.848 |
| dev-main | html_table | 128 | 86.981 | 39.560 | -54.5% | 39.560 | +0.0% | yes | 74.461 to 143.771 | 36.938 to 44.227 |
| dev-main | html_definition_list | 128 | 44.049 | 14.554 | -67.0% | 14.554 | +0.0% | yes | 39.431 to 76.770 | 12.742 to 19.013 |
| dev-main | quoted_fences | 1024 | 10.285 | 9.729 | ranges overlap | 9.729 | +0.0% | yes | 8.763 to 15.076 | 8.796 to 12.913 |
| dev-main | verse_definitions | 1024 | 800.499 | 28.274 | -96.5% | 28.274 | +0.0% | yes | 721.439 to 981.896 | 25.735 to 35.773 |
| dev-main | verse_equivalent | 1024 | 1174.312 | 29.197 | -97.5% | 29.197 | +0.0% | yes | 1069.473 to 1300.351 | 26.327 to 35.699 |
| dev-main | paragraphs | 1024 | 2.593 | 1.552 | ranges overlap | 1.552 | +0.0% | yes | 2.510 to 3.375 | 1.519 to 3.015 |
| dev-main | mixed_document | 1024 | 557.954 | 379.399 | -32.0% | 379.399 | +0.0% | yes | 481.274 to 719.898 | 347.679 to 429.382 |
| dev-main | quoted_false_mixed_closer | 1024 | 10.379 | 9.755 | ranges overlap | 9.755 | +0.0% | yes | 8.490 to 18.159 | 8.826 to 13.045 |
| dev-main | quoted_indented_closer | 1024 | 9.795 | 9.751 | ranges overlap | 9.751 | +0.0% | yes | 8.413 to 13.812 | 9.150 to 12.642 |
| dev-main | html_table | 1024 | 1499.097 | 384.436 | -74.4% | 384.436 | +0.0% | yes | 1315.302 to 1868.470 | 351.945 to 460.756 |
| dev-main | html_definition_list | 1024 | 1190.962 | 147.269 | -87.6% | 147.269 | +0.0% | yes | 1064.362 to 1774.015 | 126.077 to 206.679 |

## rs

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Latest tag: 0.1.7.

![rs history](engine-history-rs.svg)

| Revision | Commit |
|---|---|
| 0.1.4 | `2e9c43f22c5ed05dbd93323ae6b9c94bb867b285` |
| 0.1.5 | `56cb353657375e1a85965d5fcf00a234831d82c6` |
| 0.1.6 | `d7837249c64b88879b04cd71b8b5555ff246e16f` |
| 0.1.7 | `9f3f334c7d5c91c57e4e6269b32599af1062fdde` |
| dev-main | `2246a9b2b6e68b10530736af611ac0263c951d39` |

Rust main and retained tags record different Cargo configuration fingerprints or build recipes. Their timings do not isolate engine speed changes; compare build_configuration for each revision.

Merged main refreshed 2026-10-07T11:06:48.538804+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.101 | 0.070 | ranges overlap | 0.070 | +0.0% | yes | 0.099 to 0.125 | 0.065 to 0.112 |
| dev-main | verse_definitions | 128 | 0.184 | 0.150 | n/a: different output | 0.150 | +0.0% | no | 0.176 to 0.231 | 0.129 to 0.211 |
| dev-main | verse_equivalent | 128 | 0.197 | 0.170 | ranges overlap | 0.170 | +0.0% | yes | 0.181 to 0.311 | 0.155 to 0.197 |
| dev-main | paragraphs | 128 | 0.028 | 0.021 | ranges overlap | 0.021 | +0.0% | yes | 0.026 to 0.044 | 0.020 to 0.027 |
| dev-main | mixed_document | 128 | 0.389 | 0.208 | -46.6% | 0.208 | +0.0% | yes | 0.296 to 0.504 | 0.192 to 0.261 |
| dev-main | quoted_fences | 1024 | 2.208 | 0.642 | -70.9% | 0.642 | +0.0% | yes | 2.070 to 2.663 | 0.452 to 0.968 |
| dev-main | verse_definitions | 1024 | 1.821 | 1.382 | n/a: different output | 1.382 | +0.0% | no | 1.730 to 3.594 | 1.264 to 2.944 |
| dev-main | verse_equivalent | 1024 | 1.788 | 1.531 | ranges overlap | 1.531 | +0.0% | yes | 1.354 to 3.493 | 1.366 to 2.902 |
| dev-main | paragraphs | 1024 | 0.218 | 0.163 | ranges overlap | 0.163 | +0.0% | yes | 0.199 to 0.391 | 0.146 to 0.213 |
| dev-main | mixed_document | 1024 | 2.649 | 1.727 | ranges overlap | 1.727 | +0.0% | yes | 2.552 to 4.102 | 1.500 to 2.668 |

