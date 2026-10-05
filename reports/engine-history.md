# Engine release history

Retained sessions began 2026-10-02T12:21:26.895588+00:00. 4 stable tags per engine plus a pinned dev-main when measured source differs from the newest tag.

Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.

The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.

[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)

## Measurement sessions

Release-tag measurements retain their original sessions. All three merged main points were refreshed 2026-10-05T18:31:36.874617+00:00 with the same fixtures, workers and sampling counts on CPU 13. Separate shared-host sessions and build configurations do not isolate code speedups.

js retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

php retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

rs retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

js dev-main refresh: 2026-10-05T18:29:50.888505+00:00 to 2026-10-05T18:30:16.959113+00:00; driver `f301b42a95213b8350591c3a44e63f967e9e9b4c`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

php dev-main refresh: 2026-10-05T18:30:16.975205+00:00 to 2026-10-05T18:31:35.996446+00:00; driver `f301b42a95213b8350591c3a44e63f967e9e9b4c`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

rs dev-main refresh: 2026-10-05T18:31:36.016886+00:00 to 2026-10-05T18:31:36.859789+00:00; driver `f301b42a95213b8350591c3a44e63f967e9e9b4c`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

## Shared-host spread

Retained session initial load average: [5.18994140625, 5.53466796875, 5.52490234375]. Final load average: [7.6640625, 8.294921875, 7.34130859375]. Whiskers show sample ranges; medians from noisy sessions are descriptive readings, not confirmed speed changes.

js dev-main refresh load average: initial [1.05078125, 1.29150390625, 1.603515625]; final [3.32177734375, 1.775390625, 1.75439453125].

php dev-main refresh load average: initial [3.32177734375, 1.775390625, 1.75439453125]; final [2.328125, 1.81640625, 1.76904296875].

rs dev-main refresh load average: initial [2.328125, 1.81640625, 1.76904296875]; final [2.328125, 1.81640625, 1.76904296875].

js: widest sample range is 12.9x for 0.1.8 verse_equivalent n=128 (0.748 to 9.631 ms). Inspect round medians in the JSON before attributing a difference to code.

php: widest sample range is 5.5x for 0.1.9 paragraphs n=128 (0.274 to 1.495 ms). Inspect round medians in the JSON before attributing a difference to code.

rs: widest sample range is 7.2x for 0.1.6 verse_equivalent n=128 (0.115 to 0.829 ms). Inspect round medians in the JSON before attributing a difference to code.

## Watchpoints



- php dev-main html_definition_list n=128: 15.368 ms versus 2.418 ms on 0.1.7 (+535.5%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_table n=1024: 423.339 ms versus 176.754 ms on 0.1.7 (+139.5%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_definition_list n=1024: 160.698 ms versus 19.463 ms on 0.1.7 (+725.7%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.

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

Merged main refreshed 2026-10-05T18:30:16.959133+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.311 | 0.229 | ranges overlap | 0.229 | +0.0% | yes | 0.254 to 1.718 | 0.207 to 0.486 |
| dev-main | verse_definitions | 128 | 0.744 | 0.569 | ranges overlap | 0.569 | +0.0% | yes | 0.656 to 2.999 | 0.534 to 0.921 |
| dev-main | verse_equivalent | 128 | 0.850 | 0.612 | ranges overlap | 0.612 | +0.0% | yes | 0.686 to 1.712 | 0.540 to 0.992 |
| dev-main | paragraphs | 128 | 0.079 | 0.071 | ranges overlap | 0.071 | +0.0% | yes | 0.075 to 0.101 | 0.064 to 0.578 |
| dev-main | mixed_document | 128 | 1.451 | 1.068 | ranges overlap | 1.068 | +0.0% | yes | 1.217 to 2.254 | 1.022 to 2.568 |
| dev-main | quoted_fences | 1024 | 2.401 | 1.680 | ranges overlap | 1.680 | +0.0% | yes | 1.997 to 5.849 | 1.530 to 3.608 |
| dev-main | verse_definitions | 1024 | 6.334 | 4.796 | ranges overlap | 4.796 | +0.0% | yes | 5.014 to 11.435 | 4.235 to 11.029 |
| dev-main | verse_equivalent | 1024 | 7.843 | 4.656 | ranges overlap | 4.656 | +0.0% | yes | 5.643 to 13.768 | 4.113 to 7.179 |
| dev-main | paragraphs | 1024 | 0.673 | 0.564 | ranges overlap | 0.564 | +0.0% | yes | 0.634 to 1.763 | 0.500 to 0.829 |
| dev-main | mixed_document | 1024 | 26.744 | 15.259 | -42.9% | 15.259 | +0.0% | yes | 21.797 to 63.089 | 13.122 to 19.707 |

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

Merged main refreshed 2026-10-05T18:31:35.996470+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 1.255 | 1.402 | ranges overlap | 1.402 | +0.0% | yes | 1.187 to 1.458 | 1.335 to 1.499 |
| dev-main | verse_definitions | 128 | 17.196 | 3.545 | -79.4% | 3.545 | +0.0% | yes | 15.922 to 19.451 | 3.406 to 5.400 |
| dev-main | verse_equivalent | 128 | 24.120 | 3.816 | -84.2% | 3.816 | +0.0% | yes | 21.500 to 32.741 | 3.458 to 6.000 |
| dev-main | paragraphs | 128 | 0.337 | 0.198 | -41.3% | 0.198 | +0.0% | yes | 0.314 to 0.538 | 0.171 to 0.236 |
| dev-main | mixed_document | 128 | 4.114 | 2.627 | ranges overlap | 2.627 | +0.0% | yes | 3.662 to 6.599 | 2.470 to 4.187 |
| dev-main | quoted_false_mixed_closer | 128 | 1.303 | 1.375 | ranges overlap | 1.375 | +0.0% | yes | 1.208 to 2.339 | 1.246 to 3.073 |
| dev-main | quoted_indented_closer | 128 | 1.294 | 1.387 | ranges overlap | 1.387 | +0.0% | yes | 1.190 to 2.059 | 1.248 to 3.140 |
| dev-main | html_table | 128 | 86.981 | 41.151 | -52.7% | 41.151 | +0.0% | yes | 74.461 to 143.771 | 39.489 to 46.199 |
| dev-main | html_definition_list | 128 | 44.049 | 15.368 | -65.1% | 15.368 | +0.0% | yes | 39.431 to 76.770 | 13.272 to 19.332 |
| dev-main | quoted_fences | 1024 | 10.285 | 9.918 | ranges overlap | 9.918 | +0.0% | yes | 8.763 to 15.076 | 9.461 to 13.021 |
| dev-main | verse_definitions | 1024 | 800.499 | 29.180 | -96.4% | 29.180 | +0.0% | yes | 721.439 to 981.896 | 27.334 to 31.913 |
| dev-main | verse_equivalent | 1024 | 1174.312 | 30.352 | -97.4% | 30.352 | +0.0% | yes | 1069.473 to 1300.351 | 28.458 to 34.462 |
| dev-main | paragraphs | 1024 | 2.593 | 1.553 | -40.1% | 1.553 | +0.0% | yes | 2.510 to 3.375 | 1.520 to 1.627 |
| dev-main | mixed_document | 1024 | 557.954 | 422.297 | -24.3% | 422.297 | +0.0% | yes | 481.274 to 719.898 | 409.802 to 454.074 |
| dev-main | quoted_false_mixed_closer | 1024 | 10.379 | 9.950 | ranges overlap | 9.950 | +0.0% | yes | 8.490 to 18.159 | 9.474 to 13.365 |
| dev-main | quoted_indented_closer | 1024 | 9.795 | 10.096 | ranges overlap | 10.096 | +0.0% | yes | 8.413 to 13.812 | 9.397 to 13.490 |
| dev-main | html_table | 1024 | 1499.097 | 423.339 | -71.8% | 423.339 | +0.0% | yes | 1315.302 to 1868.470 | 398.187 to 472.891 |
| dev-main | html_definition_list | 1024 | 1190.962 | 160.698 | -86.5% | 160.698 | +0.0% | yes | 1064.362 to 1774.015 | 139.605 to 181.237 |

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

Rust main and retained tags record different Cargo configuration fingerprints or build recipes. Their timings do not isolate engine speed changes; compare build_configuration for each revision.

Merged main refreshed 2026-10-05T18:31:36.859817+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.101 | 0.072 | -28.1% | 0.072 | +0.0% | yes | 0.099 to 0.125 | 0.070 to 0.086 |
| dev-main | verse_definitions | 128 | 0.184 | 0.146 | n/a: different output | 0.146 | +0.0% | no | 0.176 to 0.231 | 0.131 to 0.195 |
| dev-main | verse_equivalent | 128 | 0.197 | 0.170 | ranges overlap | 0.170 | +0.0% | yes | 0.181 to 0.311 | 0.162 to 0.195 |
| dev-main | paragraphs | 128 | 0.028 | 0.021 | -24.8% | 0.021 | +0.0% | yes | 0.026 to 0.044 | 0.021 to 0.023 |
| dev-main | mixed_document | 128 | 0.389 | 0.213 | -45.2% | 0.213 | +0.0% | yes | 0.296 to 0.504 | 0.210 to 0.281 |
| dev-main | quoted_fences | 1024 | 2.208 | 0.649 | -70.6% | 0.649 | +0.0% | yes | 2.070 to 2.663 | 0.498 to 0.828 |
| dev-main | verse_definitions | 1024 | 1.821 | 1.417 | n/a: different output | 1.417 | +0.0% | no | 1.730 to 3.594 | 1.359 to 1.663 |
| dev-main | verse_equivalent | 1024 | 1.788 | 1.542 | ranges overlap | 1.542 | +0.0% | yes | 1.354 to 3.493 | 1.505 to 1.834 |
| dev-main | paragraphs | 1024 | 0.218 | 0.164 | ranges overlap | 0.164 | +0.0% | yes | 0.199 to 0.391 | 0.161 to 0.204 |
| dev-main | mixed_document | 1024 | 2.649 | 1.785 | ranges overlap | 1.785 | +0.0% | yes | 2.552 to 4.102 | 1.562 to 3.358 |

