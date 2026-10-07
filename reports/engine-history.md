# Engine release history

Retained sessions began 2026-10-02T12:21:26.895588+00:00. 4 stable tags per engine plus a pinned dev-main when measured source differs from the newest tag.

Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.

The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.

[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)

## Measurement sessions

Release-tag measurements retain their original sessions. All three merged main points were refreshed 2026-10-07T22:22:28.086177+00:00 with the same fixtures, workers and sampling counts on CPU 13. Separate shared-host sessions and build configurations do not isolate code speedups.

js retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

php retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

rs retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

js dev-main refresh: 2026-10-07T22:20:16.525480+00:00 to 2026-10-07T22:20:45.088445+00:00; driver `a4553ecdc352668ab057eb0d2fa3a979a66decdc`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

php dev-main refresh: 2026-10-07T22:20:45.402951+00:00 to 2026-10-07T22:22:27.052611+00:00; driver `a4553ecdc352668ab057eb0d2fa3a979a66decdc`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

rs dev-main refresh: 2026-10-07T22:22:27.072282+00:00 to 2026-10-07T22:22:28.067071+00:00; driver `a4553ecdc352668ab057eb0d2fa3a979a66decdc`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

## Shared-host spread

Retained session initial load average: [5.18994140625, 5.53466796875, 5.52490234375]. Final load average: [7.6640625, 8.294921875, 7.34130859375]. Whiskers show sample ranges; medians from noisy sessions are descriptive readings, not confirmed speed changes.

js dev-main refresh load average: initial [7.75341796875, 5.6064453125, 6.19970703125]; final [6.6279296875, 5.521484375, 6.15087890625].

php dev-main refresh load average: initial [6.6279296875, 5.521484375, 6.15087890625]; final [5.06103515625, 5.3681640625, 6.033203125].

rs dev-main refresh load average: initial [5.06103515625, 5.3681640625, 6.033203125]; final [5.13623046875, 5.37890625, 6.03271484375].

js: widest sample range is 12.9x for 0.1.8 verse_equivalent n=128 (0.748 to 9.631 ms). Inspect round medians in the JSON before attributing a difference to code.

php: widest sample range is 5.5x for 0.1.9 paragraphs n=128 (0.274 to 1.495 ms). Inspect round medians in the JSON before attributing a difference to code.

rs: widest sample range is 7.2x for 0.1.6 verse_equivalent n=128 (0.115 to 0.829 ms). Inspect round medians in the JSON before attributing a difference to code.

## Watchpoints



- php dev-main html_table n=128: 51.273 ms versus 23.403 ms on 0.1.7 (+119.1%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_definition_list n=128: 18.390 ms versus 2.418 ms on 0.1.7 (+660.5%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_table n=1024: 545.454 ms versus 176.754 ms on 0.1.7 (+208.6%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_definition_list n=1024: 215.205 ms versus 19.463 ms on 0.1.7 (+1005.7%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- rs dev-main verse_equivalent n=1024: 1.853 ms versus 0.910 ms on 0.1.4 (+103.6%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.

## js

Runtime: v22.22.2. Latest tag: 0.1.9.

![js history](engine-history-js.svg)

| Revision | Commit |
|---|---|
| 0.1.6 | `379474fbc87a9afe36620e2b71902f88d2b757b5` |
| 0.1.7 | `680af386605367bb86a07c2b258673c6514c4005` |
| 0.1.8 | `23204e8982012a4b3900dc735e46b3c2630803c2` |
| 0.1.9 | `a0cb0ad18fc4da223e46cfb77672e4dec537a83b` |
| dev-main | `72f7d1333bf4a271a7371b62c6c599d280412e68` |

Merged main refreshed 2026-10-07T22:20:45.088467+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.311 | 0.309 | ranges overlap | 0.309 | +0.0% | yes | 0.254 to 1.718 | 0.265 to 1.956 |
| dev-main | verse_definitions | 128 | 0.744 | 0.768 | ranges overlap | 0.768 | +0.0% | yes | 0.656 to 2.999 | 0.691 to 1.515 |
| dev-main | verse_equivalent | 128 | 0.850 | 0.759 | ranges overlap | 0.759 | +0.0% | yes | 0.686 to 1.712 | 0.690 to 2.851 |
| dev-main | paragraphs | 128 | 0.079 | 0.083 | ranges overlap | 0.083 | +0.0% | yes | 0.075 to 0.101 | 0.080 to 0.141 |
| dev-main | mixed_document | 128 | 1.451 | 1.438 | ranges overlap | 1.438 | +0.0% | yes | 1.217 to 2.254 | 1.273 to 3.267 |
| dev-main | quoted_fences | 1024 | 2.401 | 2.007 | ranges overlap | 2.007 | +0.0% | yes | 1.997 to 5.849 | 1.809 to 4.796 |
| dev-main | verse_definitions | 1024 | 6.334 | 5.523 | ranges overlap | 5.523 | +0.0% | yes | 5.014 to 11.435 | 4.935 to 9.041 |
| dev-main | verse_equivalent | 1024 | 7.843 | 7.008 | ranges overlap | 7.008 | +0.0% | yes | 5.643 to 13.768 | 5.270 to 41.325 |
| dev-main | paragraphs | 1024 | 0.673 | 0.726 | ranges overlap | 0.726 | +0.0% | yes | 0.634 to 1.763 | 0.640 to 1.829 |
| dev-main | mixed_document | 1024 | 26.744 | 20.894 | ranges overlap | 20.894 | +0.0% | yes | 21.797 to 63.089 | 16.887 to 27.680 |

## php

Runtime: 8.5.11. Latest tag: 0.1.10.

![php history](engine-history-php.svg)

| Revision | Commit |
|---|---|
| 0.1.7 | `9fd773b229d4d63b8b468b87b122943d563c80dc` |
| 0.1.8 | `93409af08040344221ff0d2d2d40351c8105e413` |
| 0.1.9 | `d4b53388df891158c9c868177a4213a5e8b2f608` |
| 0.1.10 | `6d94607eaa9d51c9ed782342161beca77b05aaf9` |
| dev-main | `9570a261517b26e0ad866087ef28a5679b8d8435` |

Merged main refreshed 2026-10-07T22:22:27.052636+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 1.255 | 1.735 | +38.3% | 1.735 | +0.0% | yes | 1.187 to 1.458 | 1.549 to 2.039 |
| dev-main | verse_definitions | 128 | 17.196 | 4.476 | -74.0% | 4.476 | +0.0% | yes | 15.922 to 19.451 | 4.048 to 6.265 |
| dev-main | verse_equivalent | 128 | 24.120 | 4.682 | -80.6% | 4.682 | +0.0% | yes | 21.500 to 32.741 | 4.205 to 6.961 |
| dev-main | paragraphs | 128 | 0.337 | 0.235 | ranges overlap | 0.235 | +0.0% | yes | 0.314 to 0.538 | 0.224 to 0.345 |
| dev-main | mixed_document | 128 | 4.114 | 3.166 | -23.0% | 3.166 | +0.0% | yes | 3.662 to 6.599 | 2.980 to 3.362 |
| dev-main | quoted_false_mixed_closer | 128 | 1.303 | 1.705 | ranges overlap | 1.705 | +0.0% | yes | 1.208 to 2.339 | 1.548 to 3.224 |
| dev-main | quoted_indented_closer | 128 | 1.294 | 1.831 | ranges overlap | 1.831 | +0.0% | yes | 1.190 to 2.059 | 1.597 to 3.549 |
| dev-main | html_table | 128 | 86.981 | 51.273 | -41.1% | 51.273 | +0.0% | yes | 74.461 to 143.771 | 46.796 to 64.722 |
| dev-main | html_definition_list | 128 | 44.049 | 18.390 | -58.3% | 18.390 | +0.0% | yes | 39.431 to 76.770 | 16.411 to 25.232 |
| dev-main | quoted_fences | 1024 | 10.285 | 12.426 | ranges overlap | 12.426 | +0.0% | yes | 8.763 to 15.076 | 11.103 to 20.061 |
| dev-main | verse_definitions | 1024 | 800.499 | 35.315 | -95.6% | 35.315 | +0.0% | yes | 721.439 to 981.896 | 33.100 to 56.579 |
| dev-main | verse_equivalent | 1024 | 1174.312 | 39.184 | -96.7% | 39.184 | +0.0% | yes | 1069.473 to 1300.351 | 34.297 to 69.634 |
| dev-main | paragraphs | 1024 | 2.593 | 1.946 | -25.0% | 1.946 | +0.0% | yes | 2.510 to 3.375 | 1.784 to 2.434 |
| dev-main | mixed_document | 1024 | 557.954 | 514.590 | ranges overlap | 514.590 | +0.0% | yes | 481.274 to 719.898 | 485.545 to 602.069 |
| dev-main | quoted_false_mixed_closer | 1024 | 10.379 | 12.231 | ranges overlap | 12.231 | +0.0% | yes | 8.490 to 18.159 | 11.150 to 16.825 |
| dev-main | quoted_indented_closer | 1024 | 9.795 | 12.342 | ranges overlap | 12.342 | +0.0% | yes | 8.413 to 13.812 | 11.282 to 17.896 |
| dev-main | html_table | 1024 | 1499.097 | 545.454 | -63.6% | 545.454 | +0.0% | yes | 1315.302 to 1868.470 | 492.631 to 752.554 |
| dev-main | html_definition_list | 1024 | 1190.962 | 215.205 | -81.9% | 215.205 | +0.0% | yes | 1064.362 to 1774.015 | 178.472 to 250.437 |

## rs

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Latest tag: 0.1.7.

![rs history](engine-history-rs.svg)

| Revision | Commit |
|---|---|
| 0.1.4 | `2e9c43f22c5ed05dbd93323ae6b9c94bb867b285` |
| 0.1.5 | `56cb353657375e1a85965d5fcf00a234831d82c6` |
| 0.1.6 | `d7837249c64b88879b04cd71b8b5555ff246e16f` |
| 0.1.7 | `9f3f334c7d5c91c57e4e6269b32599af1062fdde` |
| dev-main | `7a68f74a39c785549130abd97218a282cbce5b77` |

Rust main and retained tags record different Cargo configuration fingerprints or build recipes. Their timings do not isolate engine speed changes; compare build_configuration for each revision.

Merged main refreshed 2026-10-07T22:22:28.067107+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.101 | 0.084 | ranges overlap | 0.084 | +0.0% | yes | 0.099 to 0.125 | 0.082 to 0.120 |
| dev-main | verse_definitions | 128 | 0.184 | 0.178 | n/a: different output | 0.178 | +0.0% | no | 0.176 to 0.231 | 0.155 to 0.271 |
| dev-main | verse_equivalent | 128 | 0.197 | 0.202 | ranges overlap | 0.202 | +0.0% | yes | 0.181 to 0.311 | 0.190 to 0.246 |
| dev-main | paragraphs | 128 | 0.028 | 0.025 | ranges overlap | 0.025 | +0.0% | yes | 0.026 to 0.044 | 0.024 to 0.052 |
| dev-main | mixed_document | 128 | 0.389 | 0.249 | -35.9% | 0.249 | +0.0% | yes | 0.296 to 0.504 | 0.239 to 0.294 |
| dev-main | quoted_fences | 1024 | 2.208 | 0.801 | -63.7% | 0.801 | +0.0% | yes | 2.070 to 2.663 | 0.580 to 1.052 |
| dev-main | verse_definitions | 1024 | 1.821 | 1.653 | n/a: different output | 1.653 | +0.0% | no | 1.730 to 3.594 | 1.574 to 2.074 |
| dev-main | verse_equivalent | 1024 | 1.788 | 1.853 | ranges overlap | 1.853 | +0.0% | yes | 1.354 to 3.493 | 1.733 to 2.493 |
| dev-main | paragraphs | 1024 | 0.218 | 0.205 | ranges overlap | 0.205 | +0.0% | yes | 0.199 to 0.391 | 0.191 to 0.331 |
| dev-main | mixed_document | 1024 | 2.649 | 2.025 | -23.5% | 2.025 | +0.0% | yes | 2.552 to 4.102 | 1.967 to 2.374 |

The measured source pins were frozen at the start of this refresh. Later include fixes merged during the run and were not measured. All current core, corpus, paired controls and history reports retain the same frozen pins. The core report records newer heads observed at repeat setup; earlier workloads retain their own measurement-time provenance.
