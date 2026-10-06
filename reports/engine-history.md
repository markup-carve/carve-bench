# Engine release history

Pinned to the October 6 audit merges. Later main changes affect documentation, tests and release tooling; runtime source and dependency manifests match those pins.

Retained sessions began 2026-10-02T12:21:26.895588+00:00. 4 stable tags per engine plus a pinned dev-main when measured source differs from the newest tag.

Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.

The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.

[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)

## Measurement sessions

Release-tag measurements retain their original sessions. All three merged main points were refreshed 2026-10-06T21:10:26.372158+00:00 with the same fixtures, workers and sampling counts on CPU 6. Separate shared-host sessions and build configurations do not isolate code speedups.

js retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

php retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

rs retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

js dev-main refresh: 2026-10-06T21:08:25.165399+00:00 to 2026-10-06T21:08:53.318887+00:00; driver `b4f8e1e130dbae0036c7b8d3a17f9320e93c1e63`, CPU affinity [6]; dirty benchmark tree: True. [Point provenance](engine-history.json).

php dev-main refresh: 2026-10-06T21:08:53.658286+00:00 to 2026-10-06T21:10:25.493595+00:00; driver `b4f8e1e130dbae0036c7b8d3a17f9320e93c1e63`, CPU affinity [6]; dirty benchmark tree: True. [Point provenance](engine-history.json).

rs dev-main refresh: 2026-10-06T21:10:25.510122+00:00 to 2026-10-06T21:10:26.356128+00:00; driver `b4f8e1e130dbae0036c7b8d3a17f9320e93c1e63`, CPU affinity [6]; dirty benchmark tree: True. [Point provenance](engine-history.json).

## Shared-host spread

Retained session initial load average: [5.18994140625, 5.53466796875, 5.52490234375]. Final load average: [7.6640625, 8.294921875, 7.34130859375]. Whiskers show sample ranges; medians from noisy sessions are descriptive readings, not confirmed speed changes.

js dev-main refresh load average: initial [3.4912109375, 4.6884765625, 5.751953125]; final [4.279296875, 4.765625, 5.74365234375].

php dev-main refresh load average: initial [4.279296875, 4.765625, 5.74365234375]; final [4.064453125, 4.591796875, 5.58740234375].

rs dev-main refresh load average: initial [4.064453125, 4.591796875, 5.58740234375]; final [4.064453125, 4.591796875, 5.58740234375].

js: widest sample range is 12.9x for 0.1.8 verse_equivalent n=128 (0.748 to 9.631 ms). Inspect round medians in the JSON before attributing a difference to code.

php: widest sample range is 5.5x for 0.1.9 paragraphs n=128 (0.274 to 1.495 ms). Inspect round medians in the JSON before attributing a difference to code.

rs: widest sample range is 7.2x for 0.1.6 verse_equivalent n=128 (0.115 to 0.829 ms). Inspect round medians in the JSON before attributing a difference to code.

## Watchpoints



- php dev-main html_table n=128: 50.393 ms versus 23.403 ms on 0.1.7 (+115.3%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_definition_list n=128: 18.056 ms versus 2.418 ms on 0.1.7 (+646.6%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_table n=1024: 517.361 ms versus 176.754 ms on 0.1.7 (+192.7%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_definition_list n=1024: 202.244 ms versus 19.463 ms on 0.1.7 (+939.1%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.

## js

Runtime: v22.22.2. Latest tag: 0.1.9.

![js history](engine-history-js.svg)

| Revision | Commit |
|---|---|
| 0.1.6 | `379474fbc87a9afe36620e2b71902f88d2b757b5` |
| 0.1.7 | `680af386605367bb86a07c2b258673c6514c4005` |
| 0.1.8 | `23204e8982012a4b3900dc735e46b3c2630803c2` |
| 0.1.9 | `a0cb0ad18fc4da223e46cfb77672e4dec537a83b` |
| dev-main | `355d6de61406342d8aa989afed358f0d004ff586` |

Merged main refreshed 2026-10-06T21:08:53.318911+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.311 | 0.290 | ranges overlap | 0.290 | +0.0% | yes | 0.254 to 1.718 | 0.271 to 0.720 |
| dev-main | verse_definitions | 128 | 0.744 | 0.784 | ranges overlap | 0.784 | +0.0% | yes | 0.656 to 2.999 | 0.720 to 4.297 |
| dev-main | verse_equivalent | 128 | 0.850 | 0.798 | ranges overlap | 0.798 | +0.0% | yes | 0.686 to 1.712 | 0.748 to 4.060 |
| dev-main | paragraphs | 128 | 0.079 | 0.086 | ranges overlap | 0.086 | +0.0% | yes | 0.075 to 0.101 | 0.083 to 0.340 |
| dev-main | mixed_document | 128 | 1.451 | 1.483 | ranges overlap | 1.483 | +0.0% | yes | 1.217 to 2.254 | 1.378 to 2.909 |
| dev-main | quoted_fences | 1024 | 2.401 | 2.194 | ranges overlap | 2.194 | +0.0% | yes | 1.997 to 5.849 | 2.005 to 2.952 |
| dev-main | verse_definitions | 1024 | 6.334 | 5.802 | ranges overlap | 5.802 | +0.0% | yes | 5.014 to 11.435 | 5.122 to 14.019 |
| dev-main | verse_equivalent | 1024 | 7.843 | 6.407 | ranges overlap | 6.407 | +0.0% | yes | 5.643 to 13.768 | 5.436 to 13.094 |
| dev-main | paragraphs | 1024 | 0.673 | 0.739 | ranges overlap | 0.739 | +0.0% | yes | 0.634 to 1.763 | 0.704 to 1.230 |
| dev-main | mixed_document | 1024 | 26.744 | 19.464 | ranges overlap | 19.464 | +0.0% | yes | 21.797 to 63.089 | 17.358 to 23.852 |

## php

Runtime: 8.5.11. Latest tag: 0.1.10.

![php history](engine-history-php.svg)

| Revision | Commit |
|---|---|
| 0.1.7 | `9fd773b229d4d63b8b468b87b122943d563c80dc` |
| 0.1.8 | `93409af08040344221ff0d2d2d40351c8105e413` |
| 0.1.9 | `d4b53388df891158c9c868177a4213a5e8b2f608` |
| 0.1.10 | `6d94607eaa9d51c9ed782342161beca77b05aaf9` |
| dev-main | `45de896cea3d8944287f28ca155dea3afe04feec` |

Merged main refreshed 2026-10-06T21:10:25.493620+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 1.255 | 1.788 | ranges overlap | 1.788 | +0.0% | yes | 1.187 to 1.458 | 1.321 to 3.349 |
| dev-main | verse_definitions | 128 | 17.196 | 4.470 | -74.0% | 4.470 | +0.0% | yes | 15.922 to 19.451 | 3.498 to 5.968 |
| dev-main | verse_equivalent | 128 | 24.120 | 4.631 | -80.8% | 4.631 | +0.0% | yes | 21.500 to 32.741 | 3.785 to 7.133 |
| dev-main | paragraphs | 128 | 0.337 | 0.244 | -27.4% | 0.244 | +0.0% | yes | 0.314 to 0.538 | 0.193 to 0.257 |
| dev-main | mixed_document | 128 | 4.114 | 3.291 | ranges overlap | 3.291 | +0.0% | yes | 3.662 to 6.599 | 2.493 to 5.484 |
| dev-main | quoted_false_mixed_closer | 128 | 1.303 | 1.721 | ranges overlap | 1.721 | +0.0% | yes | 1.208 to 2.339 | 1.603 to 2.040 |
| dev-main | quoted_indented_closer | 128 | 1.294 | 1.704 | ranges overlap | 1.704 | +0.0% | yes | 1.190 to 2.059 | 1.356 to 2.068 |
| dev-main | html_table | 128 | 86.981 | 50.393 | -42.1% | 50.393 | +0.0% | yes | 74.461 to 143.771 | 40.016 to 54.514 |
| dev-main | html_definition_list | 128 | 44.049 | 18.056 | -59.0% | 18.056 | +0.0% | yes | 39.431 to 76.770 | 13.544 to 34.005 |
| dev-main | quoted_fences | 1024 | 10.285 | 12.197 | ranges overlap | 12.197 | +0.0% | yes | 8.763 to 15.076 | 9.655 to 15.194 |
| dev-main | verse_definitions | 1024 | 800.499 | 35.369 | -95.6% | 35.369 | +0.0% | yes | 721.439 to 981.896 | 26.939 to 57.469 |
| dev-main | verse_equivalent | 1024 | 1174.312 | 36.706 | -96.9% | 36.706 | +0.0% | yes | 1069.473 to 1300.351 | 28.981 to 47.484 |
| dev-main | paragraphs | 1024 | 2.593 | 1.913 | -26.2% | 1.913 | +0.0% | yes | 2.510 to 3.375 | 1.629 to 2.120 |
| dev-main | mixed_document | 1024 | 557.954 | 474.028 | ranges overlap | 474.028 | +0.0% | yes | 481.274 to 719.898 | 404.998 to 566.378 |
| dev-main | quoted_false_mixed_closer | 1024 | 10.379 | 12.107 | ranges overlap | 12.107 | +0.0% | yes | 8.490 to 18.159 | 9.010 to 23.145 |
| dev-main | quoted_indented_closer | 1024 | 9.795 | 11.817 | ranges overlap | 11.817 | +0.0% | yes | 8.413 to 13.812 | 9.378 to 15.288 |
| dev-main | html_table | 1024 | 1499.097 | 517.361 | -65.5% | 517.361 | +0.0% | yes | 1315.302 to 1868.470 | 392.775 to 699.852 |
| dev-main | html_definition_list | 1024 | 1190.962 | 202.244 | -83.0% | 202.244 | +0.0% | yes | 1064.362 to 1774.015 | 134.014 to 239.433 |

## rs

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Latest tag: 0.1.7.

![rs history](engine-history-rs.svg)

| Revision | Commit |
|---|---|
| 0.1.4 | `2e9c43f22c5ed05dbd93323ae6b9c94bb867b285` |
| 0.1.5 | `56cb353657375e1a85965d5fcf00a234831d82c6` |
| 0.1.6 | `d7837249c64b88879b04cd71b8b5555ff246e16f` |
| 0.1.7 | `9f3f334c7d5c91c57e4e6269b32599af1062fdde` |
| dev-main | `5b7bea1ada2a507867d62278145fd7f9fd3f000d` |

Rust main and retained tags record different Cargo configuration fingerprints or build recipes. Their timings do not isolate engine speed changes; compare build_configuration for each revision.

Merged main refreshed 2026-10-06T21:10:26.356159+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.101 | 0.070 | -30.1% | 0.070 | +0.0% | yes | 0.099 to 0.125 | 0.069 to 0.093 |
| dev-main | verse_definitions | 128 | 0.184 | 0.152 | n/a: different output | 0.152 | +0.0% | no | 0.176 to 0.231 | 0.134 to 0.190 |
| dev-main | verse_equivalent | 128 | 0.197 | 0.168 | ranges overlap | 0.168 | +0.0% | yes | 0.181 to 0.311 | 0.146 to 0.206 |
| dev-main | paragraphs | 128 | 0.028 | 0.020 | -27.0% | 0.020 | +0.0% | yes | 0.026 to 0.044 | 0.018 to 0.025 |
| dev-main | mixed_document | 128 | 0.389 | 0.208 | -46.5% | 0.208 | +0.0% | yes | 0.296 to 0.504 | 0.189 to 0.265 |
| dev-main | quoted_fences | 1024 | 2.208 | 0.646 | -70.8% | 0.646 | +0.0% | yes | 2.070 to 2.663 | 0.495 to 0.990 |
| dev-main | verse_definitions | 1024 | 1.821 | 1.439 | n/a: different output | 1.439 | +0.0% | no | 1.730 to 3.594 | 1.351 to 1.904 |
| dev-main | verse_equivalent | 1024 | 1.788 | 1.551 | ranges overlap | 1.551 | +0.0% | yes | 1.354 to 3.493 | 1.366 to 3.317 |
| dev-main | paragraphs | 1024 | 0.218 | 0.157 | ranges overlap | 0.157 | +0.0% | yes | 0.199 to 0.391 | 0.144 to 0.200 |
| dev-main | mixed_document | 1024 | 2.649 | 1.721 | -35.0% | 1.721 | +0.0% | yes | 2.552 to 4.102 | 1.690 to 2.202 |

