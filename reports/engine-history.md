# Engine release history

Retained sessions began 2026-10-02T12:21:26.895588+00:00. 4 stable tags per engine plus a pinned dev-main when measured source differs from the newest tag.

Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.

The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.

[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)

## Measurement sessions

Release-tag measurements retain their original sessions. All three merged main points were refreshed 2026-10-07T18:09:24.675228+00:00 with the same fixtures, workers and sampling counts on CPU 13. Separate shared-host sessions and build configurations do not isolate code speedups.

js retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

php retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

rs retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

js dev-main refresh: 2026-10-07T18:07:30.877601+00:00 to 2026-10-07T18:07:57.395392+00:00; driver `9ca2a4427601f634049b828781ddc66db14a2c0f`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

php dev-main refresh: 2026-10-07T18:07:57.588669+00:00 to 2026-10-07T18:09:23.710220+00:00; driver `9ca2a4427601f634049b828781ddc66db14a2c0f`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

rs dev-main refresh: 2026-10-07T18:09:23.727483+00:00 to 2026-10-07T18:09:24.659203+00:00; driver `9ca2a4427601f634049b828781ddc66db14a2c0f`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

## Shared-host spread

Retained session initial load average: [5.18994140625, 5.53466796875, 5.52490234375]. Final load average: [7.6640625, 8.294921875, 7.34130859375]. Whiskers show sample ranges; medians from noisy sessions are descriptive readings, not confirmed speed changes.

js dev-main refresh load average: initial [5.69287109375, 6.599609375, 6.95947265625]; final [5.5126953125, 6.48583984375, 6.91162109375].

php dev-main refresh load average: initial [5.5126953125, 6.48583984375, 6.91162109375]; final [5.78955078125, 6.28857421875, 6.8017578125].

rs dev-main refresh load average: initial [5.78955078125, 6.28857421875, 6.8017578125]; final [5.72607421875, 6.26708984375, 6.7919921875].

js: widest sample range is 12.9x for 0.1.8 verse_equivalent n=128 (0.748 to 9.631 ms). Inspect round medians in the JSON before attributing a difference to code.

php: widest sample range is 5.5x for 0.1.9 paragraphs n=128 (0.274 to 1.495 ms). Inspect round medians in the JSON before attributing a difference to code.

rs: widest sample range is 7.2x for 0.1.6 verse_equivalent n=128 (0.115 to 0.829 ms). Inspect round medians in the JSON before attributing a difference to code.

## Watchpoints



- php dev-main html_definition_list n=128: 16.387 ms versus 2.418 ms on 0.1.7 (+577.6%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_table n=1024: 471.890 ms versus 176.754 ms on 0.1.7 (+167.0%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_definition_list n=1024: 165.573 ms versus 19.463 ms on 0.1.7 (+750.7%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.

## js

Runtime: v22.22.2. Latest tag: 0.1.9.

![js history](engine-history-js.svg)

| Revision | Commit |
|---|---|
| 0.1.6 | `379474fbc87a9afe36620e2b71902f88d2b757b5` |
| 0.1.7 | `680af386605367bb86a07c2b258673c6514c4005` |
| 0.1.8 | `23204e8982012a4b3900dc735e46b3c2630803c2` |
| 0.1.9 | `a0cb0ad18fc4da223e46cfb77672e4dec537a83b` |
| dev-main | `a5c6d6457438a2d0519d474b752a6dac5c0d00bc` |

Merged main refreshed 2026-10-07T18:07:57.395413+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.311 | 0.242 | ranges overlap | 0.242 | +0.0% | yes | 0.254 to 1.718 | 0.220 to 0.769 |
| dev-main | verse_definitions | 128 | 0.744 | 0.626 | ranges overlap | 0.626 | +0.0% | yes | 0.656 to 2.999 | 0.588 to 3.726 |
| dev-main | verse_equivalent | 128 | 0.850 | 0.639 | ranges overlap | 0.639 | +0.0% | yes | 0.686 to 1.712 | 0.597 to 1.103 |
| dev-main | paragraphs | 128 | 0.079 | 0.073 | ranges overlap | 0.073 | +0.0% | yes | 0.075 to 0.101 | 0.069 to 0.233 |
| dev-main | mixed_document | 128 | 1.451 | 1.154 | ranges overlap | 1.154 | +0.0% | yes | 1.217 to 2.254 | 1.113 to 1.558 |
| dev-main | quoted_fences | 1024 | 2.401 | 1.752 | ranges overlap | 1.752 | +0.0% | yes | 1.997 to 5.849 | 1.587 to 3.430 |
| dev-main | verse_definitions | 1024 | 6.334 | 4.791 | ranges overlap | 4.791 | +0.0% | yes | 5.014 to 11.435 | 4.161 to 6.150 |
| dev-main | verse_equivalent | 1024 | 7.843 | 5.120 | ranges overlap | 5.120 | +0.0% | yes | 5.643 to 13.768 | 4.520 to 7.076 |
| dev-main | paragraphs | 1024 | 0.673 | 0.619 | ranges overlap | 0.619 | +0.0% | yes | 0.634 to 1.763 | 0.560 to 0.943 |
| dev-main | mixed_document | 1024 | 26.744 | 16.864 | ranges overlap | 16.864 | +0.0% | yes | 21.797 to 63.089 | 14.455 to 21.896 |

## php

Runtime: 8.5.11. Latest tag: 0.1.10.

![php history](engine-history-php.svg)

| Revision | Commit |
|---|---|
| 0.1.7 | `9fd773b229d4d63b8b468b87b122943d563c80dc` |
| 0.1.8 | `93409af08040344221ff0d2d2d40351c8105e413` |
| 0.1.9 | `d4b53388df891158c9c868177a4213a5e8b2f608` |
| 0.1.10 | `6d94607eaa9d51c9ed782342161beca77b05aaf9` |
| dev-main | `46da1921cfa92f82b85793138da008581b3a42e2` |

Merged main refreshed 2026-10-07T18:09:23.710246+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 1.255 | 1.410 | ranges overlap | 1.410 | +0.0% | yes | 1.187 to 1.458 | 1.323 to 1.713 |
| dev-main | verse_definitions | 128 | 17.196 | 3.661 | -78.7% | 3.661 | +0.0% | yes | 15.922 to 19.451 | 3.407 to 4.794 |
| dev-main | verse_equivalent | 128 | 24.120 | 3.842 | -84.1% | 3.842 | +0.0% | yes | 21.500 to 32.741 | 3.604 to 4.715 |
| dev-main | paragraphs | 128 | 0.337 | 0.202 | -40.0% | 0.202 | +0.0% | yes | 0.314 to 0.538 | 0.196 to 0.271 |
| dev-main | mixed_document | 128 | 4.114 | 2.640 | ranges overlap | 2.640 | +0.0% | yes | 3.662 to 6.599 | 2.564 to 3.710 |
| dev-main | quoted_false_mixed_closer | 128 | 1.303 | 1.423 | ranges overlap | 1.423 | +0.0% | yes | 1.208 to 2.339 | 1.358 to 1.749 |
| dev-main | quoted_indented_closer | 128 | 1.294 | 1.433 | ranges overlap | 1.433 | +0.0% | yes | 1.190 to 2.059 | 1.334 to 2.411 |
| dev-main | html_table | 128 | 86.981 | 43.377 | -50.1% | 43.377 | +0.0% | yes | 74.461 to 143.771 | 39.812 to 57.967 |
| dev-main | html_definition_list | 128 | 44.049 | 16.387 | -62.8% | 16.387 | +0.0% | yes | 39.431 to 76.770 | 14.032 to 24.495 |
| dev-main | quoted_fences | 1024 | 10.285 | 10.781 | ranges overlap | 10.781 | +0.0% | yes | 8.763 to 15.076 | 9.633 to 14.123 |
| dev-main | verse_definitions | 1024 | 800.499 | 30.337 | -96.2% | 30.337 | +0.0% | yes | 721.439 to 981.896 | 27.496 to 36.038 |
| dev-main | verse_equivalent | 1024 | 1174.312 | 31.494 | -97.3% | 31.494 | +0.0% | yes | 1069.473 to 1300.351 | 29.390 to 43.740 |
| dev-main | paragraphs | 1024 | 2.593 | 1.601 | -38.2% | 1.601 | +0.0% | yes | 2.510 to 3.375 | 1.548 to 1.862 |
| dev-main | mixed_document | 1024 | 557.954 | 464.685 | ranges overlap | 464.685 | +0.0% | yes | 481.274 to 719.898 | 410.313 to 550.490 |
| dev-main | quoted_false_mixed_closer | 1024 | 10.379 | 10.837 | ranges overlap | 10.837 | +0.0% | yes | 8.490 to 18.159 | 9.657 to 14.621 |
| dev-main | quoted_indented_closer | 1024 | 9.795 | 10.659 | ranges overlap | 10.659 | +0.0% | yes | 8.413 to 13.812 | 9.708 to 13.221 |
| dev-main | html_table | 1024 | 1499.097 | 471.890 | -68.5% | 471.890 | +0.0% | yes | 1315.302 to 1868.470 | 417.531 to 519.045 |
| dev-main | html_definition_list | 1024 | 1190.962 | 165.573 | -86.1% | 165.573 | +0.0% | yes | 1064.362 to 1774.015 | 138.958 to 195.270 |

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

Merged main refreshed 2026-10-07T18:09:24.659235+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.101 | 0.073 | ranges overlap | 0.073 | +0.0% | yes | 0.099 to 0.125 | 0.071 to 0.116 |
| dev-main | verse_definitions | 128 | 0.184 | 0.161 | n/a: different output | 0.161 | +0.0% | no | 0.176 to 0.231 | 0.137 to 0.212 |
| dev-main | verse_equivalent | 128 | 0.197 | 0.186 | ranges overlap | 0.186 | +0.0% | yes | 0.181 to 0.311 | 0.175 to 0.228 |
| dev-main | paragraphs | 128 | 0.028 | 0.022 | ranges overlap | 0.022 | +0.0% | yes | 0.026 to 0.044 | 0.021 to 0.039 |
| dev-main | mixed_document | 128 | 0.389 | 0.219 | ranges overlap | 0.219 | +0.0% | yes | 0.296 to 0.504 | 0.212 to 0.354 |
| dev-main | quoted_fences | 1024 | 2.208 | 0.694 | -68.6% | 0.694 | +0.0% | yes | 2.070 to 2.663 | 0.521 to 0.950 |
| dev-main | verse_definitions | 1024 | 1.821 | 1.601 | n/a: different output | 1.601 | +0.0% | no | 1.730 to 3.594 | 1.441 to 2.356 |
| dev-main | verse_equivalent | 1024 | 1.788 | 1.727 | ranges overlap | 1.727 | +0.0% | yes | 1.354 to 3.493 | 1.630 to 2.564 |
| dev-main | paragraphs | 1024 | 0.218 | 0.174 | ranges overlap | 0.174 | +0.0% | yes | 0.199 to 0.391 | 0.166 to 0.208 |
| dev-main | mixed_document | 1024 | 2.649 | 1.844 | -30.4% | 1.844 | +0.0% | yes | 2.552 to 4.102 | 1.773 to 2.341 |

Rust is pinned to merged commit 2246a9b2b; the newer main at setup changes only CHANGELOG.md and tests. Runtime sources and dependency manifests are identical.
