# Engine release history

Retained sessions began 2026-10-02T12:21:26.895588+00:00. 4 stable tags per engine plus a pinned dev-main when measured source differs from the newest tag.

Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.

The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.

[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)

## Measurement sessions

Release-tag measurements retain their original sessions. All three merged main points were refreshed 2026-10-08T14:28:52.594287+00:00 with the same fixtures, workers and sampling counts on CPU 13. Separate shared-host sessions and build configurations do not isolate code speedups.

js retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

php retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

rs retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

js dev-main refresh: 2026-10-08T14:26:52.536516+00:00 to 2026-10-08T14:27:20.095634+00:00; driver `668d8a1c5d70b0b9925fcba1e93c86ff8c64bc2e`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

php dev-main refresh: 2026-10-08T14:27:20.273368+00:00 to 2026-10-08T14:28:51.597385+00:00; driver `668d8a1c5d70b0b9925fcba1e93c86ff8c64bc2e`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

rs dev-main refresh: 2026-10-08T14:28:51.612918+00:00 to 2026-10-08T14:28:52.579028+00:00; driver `668d8a1c5d70b0b9925fcba1e93c86ff8c64bc2e`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

## Shared-host spread

Retained session initial load average: [5.18994140625, 5.53466796875, 5.52490234375]. Final load average: [7.6640625, 8.294921875, 7.34130859375]. Whiskers show sample ranges; medians from noisy sessions are descriptive readings, not confirmed speed changes.

js dev-main refresh load average: initial [15.07275390625, 9.0908203125, 8.0322265625]; final [11.8369140625, 8.8876953125, 7.99755859375].

php dev-main refresh load average: initial [11.8369140625, 8.8876953125, 7.99755859375]; final [6.828125, 7.9228515625, 7.73388671875].

rs dev-main refresh load average: initial [6.828125, 7.9228515625, 7.73388671875]; final [6.828125, 7.9228515625, 7.73388671875].

js: widest sample range is 12.9x for 0.1.8 verse_equivalent n=128 (0.748 to 9.631 ms). Inspect round medians in the JSON before attributing a difference to code.

php: widest sample range is 5.5x for 0.1.9 paragraphs n=128 (0.274 to 1.495 ms). Inspect round medians in the JSON before attributing a difference to code.

rs: widest sample range is 7.2x for 0.1.6 verse_equivalent n=128 (0.115 to 0.829 ms). Inspect round medians in the JSON before attributing a difference to code.

## Watchpoints



- php dev-main html_definition_list n=128: 17.171 ms versus 2.418 ms on 0.1.7 (+610.1%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_table n=1024: 482.248 ms versus 176.754 ms on 0.1.7 (+172.8%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_definition_list n=1024: 183.663 ms versus 19.463 ms on 0.1.7 (+843.7%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.

## js

Runtime: v22.22.2. Latest tag: 0.1.9.

![js history](engine-history-js.svg)

| Revision | Commit |
|---|---|
| 0.1.6 | `379474fbc87a9afe36620e2b71902f88d2b757b5` |
| 0.1.7 | `680af386605367bb86a07c2b258673c6514c4005` |
| 0.1.8 | `23204e8982012a4b3900dc735e46b3c2630803c2` |
| 0.1.9 | `a0cb0ad18fc4da223e46cfb77672e4dec537a83b` |
| dev-main | `e57653b22896118d3cd9e1457c9bdc36aec52d9c` |

Merged main refreshed 2026-10-08T14:27:20.095655+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.311 | 0.273 | ranges overlap | 0.273 | +0.0% | yes | 0.254 to 1.718 | 0.225 to 2.798 |
| dev-main | verse_definitions | 128 | 0.744 | 0.746 | ranges overlap | 0.746 | +0.0% | yes | 0.656 to 2.999 | 0.644 to 2.453 |
| dev-main | verse_equivalent | 128 | 0.850 | 0.923 | ranges overlap | 0.923 | +0.0% | yes | 0.686 to 1.712 | 0.622 to 2.564 |
| dev-main | paragraphs | 128 | 0.079 | 0.077 | ranges overlap | 0.077 | +0.0% | yes | 0.075 to 0.101 | 0.073 to 0.215 |
| dev-main | mixed_document | 128 | 1.451 | 1.252 | ranges overlap | 1.252 | +0.0% | yes | 1.217 to 2.254 | 1.135 to 2.580 |
| dev-main | quoted_fences | 1024 | 2.401 | 2.448 | ranges overlap | 2.448 | +0.0% | yes | 1.997 to 5.849 | 1.686 to 5.877 |
| dev-main | verse_definitions | 1024 | 6.334 | 5.055 | ranges overlap | 5.055 | +0.0% | yes | 5.014 to 11.435 | 4.368 to 6.867 |
| dev-main | verse_equivalent | 1024 | 7.843 | 5.586 | ranges overlap | 5.586 | +0.0% | yes | 5.643 to 13.768 | 4.670 to 9.485 |
| dev-main | paragraphs | 1024 | 0.673 | 0.633 | ranges overlap | 0.633 | +0.0% | yes | 0.634 to 1.763 | 0.602 to 1.422 |
| dev-main | mixed_document | 1024 | 26.744 | 20.862 | ranges overlap | 20.862 | +0.0% | yes | 21.797 to 63.089 | 15.683 to 32.891 |

## php

Runtime: 8.5.11. Latest tag: 0.1.10.

![php history](engine-history-php.svg)

| Revision | Commit |
|---|---|
| 0.1.7 | `9fd773b229d4d63b8b468b87b122943d563c80dc` |
| 0.1.8 | `93409af08040344221ff0d2d2d40351c8105e413` |
| 0.1.9 | `d4b53388df891158c9c868177a4213a5e8b2f608` |
| 0.1.10 | `6d94607eaa9d51c9ed782342161beca77b05aaf9` |
| dev-main | `19745164a182951f90a58620722e8e8f3418fd10` |

Merged main refreshed 2026-10-08T14:28:51.597405+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 1.255 | 1.443 | ranges overlap | 1.443 | +0.0% | yes | 1.187 to 1.458 | 1.321 to 2.126 |
| dev-main | verse_definitions | 128 | 17.196 | 4.209 | -75.5% | 4.209 | +0.0% | yes | 15.922 to 19.451 | 3.697 to 6.105 |
| dev-main | verse_equivalent | 128 | 24.120 | 4.338 | -82.0% | 4.338 | +0.0% | yes | 21.500 to 32.741 | 3.843 to 6.071 |
| dev-main | paragraphs | 128 | 0.337 | 0.203 | -39.6% | 0.203 | +0.0% | yes | 0.314 to 0.538 | 0.196 to 0.289 |
| dev-main | mixed_document | 128 | 4.114 | 2.900 | ranges overlap | 2.900 | +0.0% | yes | 3.662 to 6.599 | 2.570 to 3.782 |
| dev-main | quoted_false_mixed_closer | 128 | 1.303 | 1.545 | ranges overlap | 1.545 | +0.0% | yes | 1.208 to 2.339 | 1.356 to 3.146 |
| dev-main | quoted_indented_closer | 128 | 1.294 | 1.552 | ranges overlap | 1.552 | +0.0% | yes | 1.190 to 2.059 | 1.362 to 1.995 |
| dev-main | html_table | 128 | 86.981 | 44.680 | -48.6% | 44.680 | +0.0% | yes | 74.461 to 143.771 | 42.005 to 52.195 |
| dev-main | html_definition_list | 128 | 44.049 | 17.171 | -61.0% | 17.171 | +0.0% | yes | 39.431 to 76.770 | 14.494 to 23.527 |
| dev-main | quoted_fences | 1024 | 10.285 | 11.161 | ranges overlap | 11.161 | +0.0% | yes | 8.763 to 15.076 | 10.355 to 13.421 |
| dev-main | verse_definitions | 1024 | 800.499 | 32.357 | -96.0% | 32.357 | +0.0% | yes | 721.439 to 981.896 | 28.887 to 39.547 |
| dev-main | verse_equivalent | 1024 | 1174.312 | 33.193 | -97.2% | 33.193 | +0.0% | yes | 1069.473 to 1300.351 | 31.160 to 42.684 |
| dev-main | paragraphs | 1024 | 2.593 | 1.643 | ranges overlap | 1.643 | +0.0% | yes | 2.510 to 3.375 | 1.536 to 2.889 |
| dev-main | mixed_document | 1024 | 557.954 | 470.640 | ranges overlap | 470.640 | +0.0% | yes | 481.274 to 719.898 | 422.794 to 589.508 |
| dev-main | quoted_false_mixed_closer | 1024 | 10.379 | 11.875 | ranges overlap | 11.875 | +0.0% | yes | 8.490 to 18.159 | 10.375 to 17.551 |
| dev-main | quoted_indented_closer | 1024 | 9.795 | 11.422 | ranges overlap | 11.422 | +0.0% | yes | 8.413 to 13.812 | 10.487 to 14.138 |
| dev-main | html_table | 1024 | 1499.097 | 482.248 | -67.8% | 482.248 | +0.0% | yes | 1315.302 to 1868.470 | 432.928 to 671.450 |
| dev-main | html_definition_list | 1024 | 1190.962 | 183.663 | -84.6% | 183.663 | +0.0% | yes | 1064.362 to 1774.015 | 140.514 to 244.441 |

## rs

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Latest tag: 0.1.7.

![rs history](engine-history-rs.svg)

| Revision | Commit |
|---|---|
| 0.1.4 | `2e9c43f22c5ed05dbd93323ae6b9c94bb867b285` |
| 0.1.5 | `56cb353657375e1a85965d5fcf00a234831d82c6` |
| 0.1.6 | `d7837249c64b88879b04cd71b8b5555ff246e16f` |
| 0.1.7 | `9f3f334c7d5c91c57e4e6269b32599af1062fdde` |
| dev-main | `2a183262f866d0dca2ae515d8b655d21e01ade90` |

Rust main and retained tags record different Cargo configuration fingerprints or build recipes. Their timings do not isolate engine speed changes; compare build_configuration for each revision.

Merged main refreshed 2026-10-08T14:28:52.579084+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.101 | 0.075 | ranges overlap | 0.075 | +0.0% | yes | 0.099 to 0.125 | 0.072 to 0.147 |
| dev-main | verse_definitions | 128 | 0.184 | 0.157 | n/a: different output | 0.157 | +0.0% | no | 0.176 to 0.231 | 0.139 to 0.218 |
| dev-main | verse_equivalent | 128 | 0.197 | 0.177 | ranges overlap | 0.177 | +0.0% | yes | 0.181 to 0.311 | 0.165 to 0.278 |
| dev-main | paragraphs | 128 | 0.028 | 0.021 | ranges overlap | 0.021 | +0.0% | yes | 0.026 to 0.044 | 0.020 to 0.031 |
| dev-main | mixed_document | 128 | 0.389 | 0.234 | ranges overlap | 0.234 | +0.0% | yes | 0.296 to 0.504 | 0.212 to 0.458 |
| dev-main | quoted_fences | 1024 | 2.208 | 0.751 | -66.0% | 0.751 | +0.0% | yes | 2.070 to 2.663 | 0.523 to 1.456 |
| dev-main | verse_definitions | 1024 | 1.821 | 1.547 | n/a: different output | 1.547 | +0.0% | no | 1.730 to 3.594 | 1.412 to 2.085 |
| dev-main | verse_equivalent | 1024 | 1.788 | 1.775 | ranges overlap | 1.775 | +0.0% | yes | 1.354 to 3.493 | 1.612 to 2.577 |
| dev-main | paragraphs | 1024 | 0.218 | 0.174 | ranges overlap | 0.174 | +0.0% | yes | 0.199 to 0.391 | 0.157 to 0.303 |
| dev-main | mixed_document | 1024 | 2.649 | 2.077 | -21.6% | 2.077 | +0.0% | yes | 2.552 to 4.102 | 1.859 to 2.525 |
