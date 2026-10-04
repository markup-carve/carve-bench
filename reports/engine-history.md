# Engine release history

Sessions began 2026-10-02T12:21:26.895588+00:00. 4 stable tags per engine plus a pinned dev-main when measured source differs from the newest tag.

Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.

The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.

[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)

## Measurement sessions

Release-tag measurements retain their original sessions on CPU 12. All three merged main points were refreshed on October 4, 2026 on CPU 13, with the same fixtures, workers and sampling counts. Main and tags were measured in separate sessions on a shared host; differences do not isolate code changes.

js retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

php retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

rs retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

js dev-main refresh: 2026-10-04T02:57:04.633269+00:00 to 2026-10-04T02:57:30.593595+00:00. [Point provenance](engine-history.json).

php dev-main refresh: 2026-10-04T02:57:04.633269+00:00 to 2026-10-04T02:58:42.579287+00:00. [Point provenance](engine-history.json).

rs dev-main refresh: 2026-10-04T02:57:04.633269+00:00 to 2026-10-04T02:58:43.393952+00:00. [Point provenance](engine-history.json).

## Shared-host spread

Initial load average: [5.18994140625, 5.53466796875, 5.52490234375]. Final load average: [7.6640625, 8.294921875, 7.34130859375]. Whiskers show sample ranges; medians from noisy sessions are descriptive readings, not confirmed speed changes.

js: widest sample range is 12.9x for 0.1.8 verse_equivalent n=128 (0.748 to 9.631 ms). Inspect round medians in the JSON before attributing a difference to code.

php: widest sample range is 5.5x for 0.1.9 paragraphs n=128 (0.274 to 1.495 ms). Inspect round medians in the JSON before attributing a difference to code.

rs: widest sample range is 7.2x for 0.1.6 verse_equivalent n=128 (0.115 to 0.829 ms). Inspect round medians in the JSON before attributing a difference to code.

## Watchpoints



- php dev-main html_definition_list n=128: 14.179 ms versus 2.418 ms on 0.1.7 (+486.3%). Output hashes match and sample ranges are separate; investigate this older-baseline cost.
- php dev-main html_table n=1024: 372.417 ms versus 176.754 ms on 0.1.7 (+110.7%). Output hashes match and sample ranges are separate; investigate this older-baseline cost.
- php dev-main html_definition_list n=1024: 136.992 ms versus 19.463 ms on 0.1.7 (+603.9%). Output hashes match and sample ranges are separate; investigate this older-baseline cost.

## js

Runtime: v22.22.2. Latest tag: 0.1.9.

![js history](engine-history-js.svg)

| Revision | Commit |
|---|---|
| 0.1.6 | `379474fbc87a9afe36620e2b71902f88d2b757b5` |
| 0.1.7 | `680af386605367bb86a07c2b258673c6514c4005` |
| 0.1.8 | `23204e8982012a4b3900dc735e46b3c2630803c2` |
| 0.1.9 | `a0cb0ad18fc4da223e46cfb77672e4dec537a83b` |
| dev-main | `604c2223de4a2bfe6133adcc8cce9ac5a8ba0391` |

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.311 | 0.227 | -26.8% | 0.227 | +0.0% | yes | 0.254 to 1.718 | 0.214 to 0.957 |
| dev-main | verse_definitions | 128 | 0.744 | 0.601 | -19.1% | 0.601 | +0.0% | yes | 0.656 to 2.999 | 0.562 to 0.954 |
| dev-main | verse_equivalent | 128 | 0.850 | 0.605 | -28.8% | 0.605 | +0.0% | yes | 0.686 to 1.712 | 0.531 to 6.290 |
| dev-main | paragraphs | 128 | 0.079 | 0.071 | -10.3% | 0.071 | +0.0% | yes | 0.075 to 0.101 | 0.068 to 0.134 |
| dev-main | mixed_document | 128 | 1.451 | 1.142 | -21.3% | 1.142 | +0.0% | yes | 1.217 to 2.254 | 1.060 to 2.717 |
| dev-main | quoted_fences | 1024 | 2.401 | 1.665 | -30.7% | 1.665 | +0.0% | yes | 1.997 to 5.849 | 1.570 to 2.908 |
| dev-main | verse_definitions | 1024 | 6.334 | 4.534 | -28.4% | 4.534 | +0.0% | yes | 5.014 to 11.435 | 3.819 to 5.943 |
| dev-main | verse_equivalent | 1024 | 7.843 | 5.012 | -36.1% | 5.012 | +0.0% | yes | 5.643 to 13.768 | 4.211 to 7.526 |
| dev-main | paragraphs | 1024 | 0.673 | 0.573 | -14.9% | 0.573 | +0.0% | yes | 0.634 to 1.763 | 0.544 to 0.782 |
| dev-main | mixed_document | 1024 | 26.744 | 15.565 | -41.8% | 15.565 | +0.0% | yes | 21.797 to 63.089 | 12.487 to 24.366 |

## php

Runtime: 8.5.11. Latest tag: 0.1.10.

![php history](engine-history-php.svg)

| Revision | Commit |
|---|---|
| 0.1.7 | `9fd773b229d4d63b8b468b87b122943d563c80dc` |
| 0.1.8 | `93409af08040344221ff0d2d2d40351c8105e413` |
| 0.1.9 | `d4b53388df891158c9c868177a4213a5e8b2f608` |
| 0.1.10 | `6d94607eaa9d51c9ed782342161beca77b05aaf9` |
| dev-main | `363f0d3e26093857325255bef3497661c6ba5324` |

The merged main point was refreshed on October 4, 2026. Release tags retain their original samples; cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 1.255 | 1.327 | +5.7% | 1.327 | +0.0% | yes | 1.187 to 1.458 | 1.181 to 1.416 |
| dev-main | verse_definitions | 128 | 17.196 | 3.472 | -79.8% | 3.472 | +0.0% | yes | 15.922 to 19.451 | 2.988 to 4.870 |
| dev-main | verse_equivalent | 128 | 24.120 | 3.591 | -85.1% | 3.591 | +0.0% | yes | 21.500 to 32.741 | 3.173 to 5.515 |
| dev-main | paragraphs | 128 | 0.337 | 0.189 | -43.7% | 0.189 | +0.0% | yes | 0.314 to 0.538 | 0.170 to 0.234 |
| dev-main | mixed_document | 128 | 4.114 | 2.601 | -36.8% | 2.601 | +0.0% | yes | 3.662 to 6.599 | 2.425 to 4.051 |
| dev-main | quoted_false_mixed_closer | 128 | 1.303 | 1.324 | +1.6% | 1.324 | +0.0% | yes | 1.208 to 2.339 | 1.171 to 2.875 |
| dev-main | quoted_indented_closer | 128 | 1.294 | 1.331 | +2.8% | 1.331 | +0.0% | yes | 1.190 to 2.059 | 1.180 to 1.391 |
| dev-main | html_table | 128 | 86.981 | 40.685 | -53.2% | 40.685 | +0.0% | yes | 74.461 to 143.771 | 36.049 to 50.083 |
| dev-main | html_definition_list | 128 | 44.049 | 14.179 | -67.8% | 14.179 | +0.0% | yes | 39.431 to 76.770 | 12.356 to 17.609 |
| dev-main | quoted_fences | 1024 | 10.285 | 9.117 | -11.4% | 9.117 | +0.0% | yes | 8.763 to 15.076 | 8.374 to 11.945 |
| dev-main | verse_definitions | 1024 | 800.499 | 27.603 | -96.6% | 27.603 | +0.0% | yes | 721.439 to 981.896 | 24.592 to 35.958 |
| dev-main | verse_equivalent | 1024 | 1174.312 | 27.706 | -97.6% | 27.706 | +0.0% | yes | 1069.473 to 1300.351 | 25.597 to 32.032 |
| dev-main | paragraphs | 1024 | 2.593 | 1.537 | -40.7% | 1.537 | +0.0% | yes | 2.510 to 3.375 | 1.354 to 1.645 |
| dev-main | mixed_document | 1024 | 557.954 | 386.791 | -30.7% | 386.791 | +0.0% | yes | 481.274 to 719.898 | 366.743 to 440.134 |
| dev-main | quoted_false_mixed_closer | 1024 | 10.379 | 9.390 | -9.5% | 9.390 | +0.0% | yes | 8.490 to 18.159 | 8.468 to 12.041 |
| dev-main | quoted_indented_closer | 1024 | 9.795 | 9.263 | -5.4% | 9.263 | +0.0% | yes | 8.413 to 13.812 | 8.347 to 11.274 |
| dev-main | html_table | 1024 | 1499.097 | 372.417 | -75.2% | 372.417 | +0.0% | yes | 1315.302 to 1868.470 | 354.086 to 464.190 |
| dev-main | html_definition_list | 1024 | 1190.962 | 136.992 | -88.5% | 136.992 | +0.0% | yes | 1064.362 to 1774.015 | 122.768 to 178.582 |

## rs

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Latest tag: 0.1.7.

![rs history](engine-history-rs.svg)

| Revision | Commit |
|---|---|
| 0.1.4 | `2e9c43f22c5ed05dbd93323ae6b9c94bb867b285` |
| 0.1.5 | `56cb353657375e1a85965d5fcf00a234831d82c6` |
| 0.1.6 | `d7837249c64b88879b04cd71b8b5555ff246e16f` |
| 0.1.7 | `9f3f334c7d5c91c57e4e6269b32599af1062fdde` |
| dev-main | `bfe862698546268486f5cc19451a622801a176e8` |

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.101 | 0.073 | -27.6% | 0.073 | +0.0% | yes | 0.099 to 0.125 | 0.070 to 0.105 |
| dev-main | verse_definitions | 128 | 0.184 | 0.128 | n/a: different output | 0.128 | +0.0% | no | 0.176 to 0.231 | 0.124 to 0.157 |
| dev-main | verse_equivalent | 128 | 0.197 | 0.164 | -16.8% | 0.164 | +0.0% | yes | 0.181 to 0.311 | 0.155 to 0.201 |
| dev-main | paragraphs | 128 | 0.028 | 0.020 | -26.2% | 0.020 | +0.0% | yes | 0.026 to 0.044 | 0.020 to 0.047 |
| dev-main | mixed_document | 128 | 0.389 | 0.217 | -44.3% | 0.217 | +0.0% | yes | 0.296 to 0.504 | 0.210 to 0.263 |
| dev-main | quoted_fences | 1024 | 2.208 | 0.620 | -71.9% | 0.620 | +0.0% | yes | 2.070 to 2.663 | 0.444 to 0.738 |
| dev-main | verse_definitions | 1024 | 1.821 | 1.232 | n/a: different output | 1.232 | +0.0% | no | 1.730 to 3.594 | 1.157 to 1.324 |
| dev-main | verse_equivalent | 1024 | 1.788 | 1.468 | -17.9% | 1.468 | +0.0% | yes | 1.354 to 3.493 | 1.202 to 1.558 |
| dev-main | paragraphs | 1024 | 0.218 | 0.159 | -27.1% | 0.159 | +0.0% | yes | 0.199 to 0.391 | 0.137 to 0.177 |
| dev-main | mixed_document | 1024 | 2.649 | 1.775 | -33.0% | 1.775 | +0.0% | yes | 2.552 to 4.102 | 1.745 to 2.034 |

