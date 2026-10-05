# Engine release history

Retained sessions began 2026-10-02T12:21:26.895588+00:00. 4 stable tags per engine plus a pinned dev-main when measured source differs from the newest tag.

Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.

The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.

[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)

## Measurement sessions

Release-tag measurements retain their original sessions. All three merged main points were refreshed 2026-10-05T18:27:00.295057+00:00 with the same fixtures, workers and sampling counts on CPU 13. Separate shared-host sessions and build configurations do not isolate code speedups.

js retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

php retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

rs retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

js dev-main refresh: 2026-10-05T18:25:23.960290+00:00 to 2026-10-05T18:25:49.714883+00:00; driver `47d9c4ea458e940d7394b5bd76cbb91d9ac20a04`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

php dev-main refresh: 2026-10-05T18:25:49.728323+00:00 to 2026-10-05T18:26:59.468928+00:00; driver `47d9c4ea458e940d7394b5bd76cbb91d9ac20a04`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

rs dev-main refresh: 2026-10-05T18:26:59.482876+00:00 to 2026-10-05T18:27:00.281213+00:00; driver `47d9c4ea458e940d7394b5bd76cbb91d9ac20a04`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

## Shared-host spread

Retained session initial load average: [5.18994140625, 5.53466796875, 5.52490234375]. Final load average: [7.6640625, 8.294921875, 7.34130859375]. Whiskers show sample ranges; medians from noisy sessions are descriptive readings, not confirmed speed changes.

js dev-main refresh load average: initial [0.90234375, 1.5078125, 1.7451171875]; final [1.73046875, 1.64599609375, 1.78369140625].

php dev-main refresh load average: initial [1.73046875, 1.64599609375, 1.78369140625]; final [1.3935546875, 1.5673828125, 1.74560546875].

rs dev-main refresh load average: initial [1.3935546875, 1.5673828125, 1.74560546875]; final [1.4423828125, 1.57470703125, 1.7470703125].

js: widest sample range is 12.9x for 0.1.8 verse_equivalent n=128 (0.748 to 9.631 ms). Inspect round medians in the JSON before attributing a difference to code.

php: widest sample range is 5.5x for 0.1.9 paragraphs n=128 (0.274 to 1.495 ms). Inspect round medians in the JSON before attributing a difference to code.

rs: widest sample range is 7.2x for 0.1.6 verse_equivalent n=128 (0.115 to 0.829 ms). Inspect round medians in the JSON before attributing a difference to code.

## Watchpoints



- php dev-main html_definition_list n=128: 13.960 ms versus 2.418 ms on 0.1.7 (+477.3%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_table n=1024: 360.606 ms versus 176.754 ms on 0.1.7 (+104.0%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_definition_list n=1024: 139.086 ms versus 19.463 ms on 0.1.7 (+614.6%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.

## js

Runtime: v22.22.2. Latest tag: 0.1.9.

![js history](engine-history-js.svg)

| Revision | Commit |
|---|---|
| 0.1.6 | `379474fbc87a9afe36620e2b71902f88d2b757b5` |
| 0.1.7 | `680af386605367bb86a07c2b258673c6514c4005` |
| 0.1.8 | `23204e8982012a4b3900dc735e46b3c2630803c2` |
| 0.1.9 | `a0cb0ad18fc4da223e46cfb77672e4dec537a83b` |
| dev-main | `a7c80d37fb322d28bc5061175bbd9c7f7638c175` |

Merged main refreshed 2026-10-05T18:25:49.714904+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.311 | 0.220 | -29.3% | 0.220 | +0.0% | yes | 0.254 to 1.718 | 0.207 to 0.477 |
| dev-main | verse_definitions | 128 | 0.744 | 0.591 | -20.6% | 0.591 | +0.0% | yes | 0.656 to 2.999 | 0.541 to 0.856 |
| dev-main | verse_equivalent | 128 | 0.850 | 0.608 | -28.5% | 0.608 | +0.0% | yes | 0.686 to 1.712 | 0.546 to 0.841 |
| dev-main | paragraphs | 128 | 0.079 | 0.069 | -12.5% | 0.069 | +0.0% | yes | 0.075 to 0.101 | 0.062 to 0.216 |
| dev-main | mixed_document | 128 | 1.451 | 1.059 | -27.0% | 1.059 | +0.0% | yes | 1.217 to 2.254 | 0.976 to 1.563 |
| dev-main | quoted_fences | 1024 | 2.401 | 1.682 | -29.9% | 1.682 | +0.0% | yes | 1.997 to 5.849 | 1.546 to 3.652 |
| dev-main | verse_definitions | 1024 | 6.334 | 4.344 | -31.4% | 4.344 | +0.0% | yes | 5.014 to 11.435 | 3.895 to 5.435 |
| dev-main | verse_equivalent | 1024 | 7.843 | 4.643 | -40.8% | 4.643 | +0.0% | yes | 5.643 to 13.768 | 4.104 to 10.912 |
| dev-main | paragraphs | 1024 | 0.673 | 0.567 | -15.8% | 0.567 | +0.0% | yes | 0.634 to 1.763 | 0.515 to 0.808 |
| dev-main | mixed_document | 1024 | 26.744 | 14.898 | -44.3% | 14.898 | +0.0% | yes | 21.797 to 63.089 | 13.013 to 21.333 |

## php

Runtime: 8.5.11. Latest tag: 0.1.10.

![php history](engine-history-php.svg)

| Revision | Commit |
|---|---|
| 0.1.7 | `9fd773b229d4d63b8b468b87b122943d563c80dc` |
| 0.1.8 | `93409af08040344221ff0d2d2d40351c8105e413` |
| 0.1.9 | `d4b53388df891158c9c868177a4213a5e8b2f608` |
| 0.1.10 | `6d94607eaa9d51c9ed782342161beca77b05aaf9` |
| dev-main | `49c235d768ea6faec074d4b561ed3783d99b6fbd` |

Merged main refreshed 2026-10-05T18:26:59.468951+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 1.255 | 1.308 | +4.2% | 1.308 | +0.0% | yes | 1.187 to 1.458 | 1.244 to 3.050 |
| dev-main | verse_definitions | 128 | 17.196 | 3.366 | -80.4% | 3.366 | +0.0% | yes | 15.922 to 19.451 | 3.215 to 5.422 |
| dev-main | verse_equivalent | 128 | 24.120 | 3.514 | -85.4% | 3.514 | +0.0% | yes | 21.500 to 32.741 | 3.191 to 5.780 |
| dev-main | paragraphs | 128 | 0.337 | 0.185 | -45.0% | 0.185 | +0.0% | yes | 0.314 to 0.538 | 0.174 to 0.210 |
| dev-main | mixed_document | 128 | 4.114 | 2.495 | -39.4% | 2.495 | +0.0% | yes | 3.662 to 6.599 | 2.272 to 4.093 |
| dev-main | quoted_false_mixed_closer | 128 | 1.303 | 1.338 | +2.7% | 1.338 | +0.0% | yes | 1.208 to 2.339 | 1.231 to 3.044 |
| dev-main | quoted_indented_closer | 128 | 1.294 | 1.357 | +4.9% | 1.357 | +0.0% | yes | 1.190 to 2.059 | 1.241 to 1.457 |
| dev-main | html_table | 128 | 86.981 | 39.117 | -55.0% | 39.117 | +0.0% | yes | 74.461 to 143.771 | 35.691 to 53.003 |
| dev-main | html_definition_list | 128 | 44.049 | 13.960 | -68.3% | 13.960 | +0.0% | yes | 39.431 to 76.770 | 12.546 to 20.247 |
| dev-main | quoted_fences | 1024 | 10.285 | 9.328 | -9.3% | 9.328 | +0.0% | yes | 8.763 to 15.076 | 8.602 to 13.261 |
| dev-main | verse_definitions | 1024 | 800.499 | 26.673 | -96.7% | 26.673 | +0.0% | yes | 721.439 to 981.896 | 24.958 to 34.651 |
| dev-main | verse_equivalent | 1024 | 1174.312 | 28.099 | -97.6% | 28.099 | +0.0% | yes | 1069.473 to 1300.351 | 26.163 to 36.635 |
| dev-main | paragraphs | 1024 | 2.593 | 1.528 | -41.1% | 1.528 | +0.0% | yes | 2.510 to 3.375 | 1.447 to 1.641 |
| dev-main | mixed_document | 1024 | 557.954 | 365.259 | -34.5% | 365.259 | +0.0% | yes | 481.274 to 719.898 | 338.868 to 412.835 |
| dev-main | quoted_false_mixed_closer | 1024 | 10.379 | 9.277 | -10.6% | 9.277 | +0.0% | yes | 8.490 to 18.159 | 8.744 to 12.949 |
| dev-main | quoted_indented_closer | 1024 | 9.795 | 9.295 | -5.1% | 9.295 | +0.0% | yes | 8.413 to 13.812 | 8.828 to 11.461 |
| dev-main | html_table | 1024 | 1499.097 | 360.606 | -75.9% | 360.606 | +0.0% | yes | 1315.302 to 1868.470 | 336.385 to 451.377 |
| dev-main | html_definition_list | 1024 | 1190.962 | 139.086 | -88.3% | 139.086 | +0.0% | yes | 1064.362 to 1774.015 | 116.313 to 226.396 |

## rs

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Latest tag: 0.1.7.

![rs history](engine-history-rs.svg)

| Revision | Commit |
|---|---|
| 0.1.4 | `2e9c43f22c5ed05dbd93323ae6b9c94bb867b285` |
| 0.1.5 | `56cb353657375e1a85965d5fcf00a234831d82c6` |
| 0.1.6 | `d7837249c64b88879b04cd71b8b5555ff246e16f` |
| 0.1.7 | `9f3f334c7d5c91c57e4e6269b32599af1062fdde` |
| dev-main | `8ee78ecb83d82ed81c544c17483e0eb111398f9d` |

Rust main and retained tags record different Cargo configuration hashes and build recipes. Their timings do not isolate engine speed changes; compare build_configuration for each revision.

Merged main refreshed 2026-10-05T18:27:00.281235+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.101 | 0.070 | -30.3% | 0.070 | +0.0% | yes | 0.099 to 0.125 | 0.061 to 0.148 |
| dev-main | verse_definitions | 128 | 0.184 | 0.141 | n/a: different output | 0.141 | +0.0% | no | 0.176 to 0.231 | 0.119 to 0.159 |
| dev-main | verse_equivalent | 128 | 0.197 | 0.164 | -16.8% | 0.164 | +0.0% | yes | 0.181 to 0.311 | 0.146 to 0.186 |
| dev-main | paragraphs | 128 | 0.028 | 0.021 | -24.8% | 0.021 | +0.0% | yes | 0.026 to 0.044 | 0.019 to 0.032 |
| dev-main | mixed_document | 128 | 0.389 | 0.204 | -47.6% | 0.204 | +0.0% | yes | 0.296 to 0.504 | 0.187 to 0.251 |
| dev-main | quoted_fences | 1024 | 2.208 | 0.632 | -71.4% | 0.632 | +0.0% | yes | 2.070 to 2.663 | 0.483 to 0.778 |
| dev-main | verse_definitions | 1024 | 1.821 | 1.354 | n/a: different output | 1.354 | +0.0% | no | 1.730 to 3.594 | 1.255 to 1.481 |
| dev-main | verse_equivalent | 1024 | 1.788 | 1.444 | -19.2% | 1.444 | +0.0% | yes | 1.354 to 3.493 | 1.307 to 2.937 |
| dev-main | paragraphs | 1024 | 0.218 | 0.162 | -25.8% | 0.162 | +0.0% | yes | 0.199 to 0.391 | 0.145 to 0.202 |
| dev-main | mixed_document | 1024 | 2.649 | 1.740 | -34.3% | 1.740 | +0.0% | yes | 2.552 to 4.102 | 1.572 to 3.211 |

