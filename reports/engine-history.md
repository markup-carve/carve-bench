# Engine release history

Retained sessions began 2026-10-02T12:21:26.895588+00:00. 4 stable tags per engine plus a pinned dev-main when measured source differs from the newest tag.

Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.

The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.

[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)

## Measurement sessions

Release-tag measurements retain their original sessions. All three merged main points were refreshed on October 4, 2026 with the same fixtures, workers and sampling counts. Main points use CPU 13; release tags retain their original CPU 12 sessions. Main and tags were measured in separate sessions on a shared host; differences do not isolate code changes.

js retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

php retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

rs retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

js dev-main refresh: 2026-10-04T16:43:44.181700+00:00 to 2026-10-04T16:44:10.006706+00:00; driver `0dcf34e96a3c25b37a451d99ec8ffdcafc6e4a78`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

php dev-main refresh: 2026-10-04T16:43:44.181700+00:00 to 2026-10-04T16:45:21.217199+00:00; driver `0dcf34e96a3c25b37a451d99ec8ffdcafc6e4a78`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

rs dev-main refresh: 2026-10-04T16:43:44.181700+00:00 to 2026-10-04T16:45:22.019227+00:00; driver `0dcf34e96a3c25b37a451d99ec8ffdcafc6e4a78`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

## Shared-host spread

Retained session initial load average: [5.18994140625, 5.53466796875, 5.52490234375]. Final load average: [7.6640625, 8.294921875, 7.34130859375]. Whiskers show sample ranges; medians from noisy sessions are descriptive readings, not confirmed speed changes.

js dev-main refresh load average: initial [1.3544921875, 1.49267578125, 2.693359375]; final [1.44287109375, 1.50146484375, 2.66357421875].

php dev-main refresh load average: initial [1.3544921875, 1.49267578125, 2.693359375]; final [1.75146484375, 1.60205078125, 2.6123046875].

rs dev-main refresh load average: initial [1.3544921875, 1.49267578125, 2.693359375]; final [1.75146484375, 1.60205078125, 2.6123046875].

js: widest sample range is 12.9x for 0.1.8 verse_equivalent n=128 (0.748 to 9.631 ms). Inspect round medians in the JSON before attributing a difference to code.

php: widest sample range is 5.5x for 0.1.9 paragraphs n=128 (0.274 to 1.495 ms). Inspect round medians in the JSON before attributing a difference to code.

rs: widest sample range is 9.4x for dev-main verse_equivalent n=128 (0.146 to 1.363 ms). Inspect round medians in the JSON before attributing a difference to code.

## Watchpoints



- php dev-main html_definition_list n=128: 14.348 ms versus 2.418 ms on 0.1.7 (+493.3%). Output hashes match and sample ranges are separate; investigate this older-baseline cost.
- php dev-main html_table n=1024: 367.911 ms versus 176.754 ms on 0.1.7 (+108.1%). Output hashes match and sample ranges are separate; investigate this older-baseline cost.
- php dev-main html_definition_list n=1024: 138.459 ms versus 19.463 ms on 0.1.7 (+611.4%). Output hashes match and sample ranges are separate; investigate this older-baseline cost.

## js

Runtime: v22.22.2. Latest tag: 0.1.9.

![js history](engine-history-js.svg)

| Revision | Commit |
|---|---|
| 0.1.6 | `379474fbc87a9afe36620e2b71902f88d2b757b5` |
| 0.1.7 | `680af386605367bb86a07c2b258673c6514c4005` |
| 0.1.8 | `23204e8982012a4b3900dc735e46b3c2630803c2` |
| 0.1.9 | `a0cb0ad18fc4da223e46cfb77672e4dec537a83b` |
| dev-main | `a0e996083129b9d51e63be6982d79843fd35ea32` |

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.311 | 0.235 | -24.5% | 0.235 | +0.0% | yes | 0.254 to 1.718 | 0.208 to 2.366 |
| dev-main | verse_definitions | 128 | 0.744 | 0.587 | -21.1% | 0.587 | +0.0% | yes | 0.656 to 2.999 | 0.532 to 0.778 |
| dev-main | verse_equivalent | 128 | 0.850 | 0.612 | -28.0% | 0.612 | +0.0% | yes | 0.686 to 1.712 | 0.578 to 1.062 |
| dev-main | paragraphs | 128 | 0.079 | 0.070 | -11.2% | 0.070 | +0.0% | yes | 0.075 to 0.101 | 0.059 to 0.200 |
| dev-main | mixed_document | 128 | 1.451 | 1.117 | -23.0% | 1.117 | +0.0% | yes | 1.217 to 2.254 | 0.997 to 1.443 |
| dev-main | quoted_fences | 1024 | 2.401 | 1.664 | -30.7% | 1.664 | +0.0% | yes | 1.997 to 5.849 | 1.463 to 3.127 |
| dev-main | verse_definitions | 1024 | 6.334 | 4.536 | -28.4% | 4.536 | +0.0% | yes | 5.014 to 11.435 | 3.887 to 6.309 |
| dev-main | verse_equivalent | 1024 | 7.843 | 4.741 | -39.6% | 4.741 | +0.0% | yes | 5.643 to 13.768 | 3.996 to 6.788 |
| dev-main | paragraphs | 1024 | 0.673 | 0.584 | -13.2% | 0.584 | +0.0% | yes | 0.634 to 1.763 | 0.522 to 0.842 |
| dev-main | mixed_document | 1024 | 26.744 | 15.184 | -43.2% | 15.184 | +0.0% | yes | 21.797 to 63.089 | 12.287 to 25.205 |

## php

Runtime: 8.5.11. Latest tag: 0.1.10.

![php history](engine-history-php.svg)

| Revision | Commit |
|---|---|
| 0.1.7 | `9fd773b229d4d63b8b468b87b122943d563c80dc` |
| 0.1.8 | `93409af08040344221ff0d2d2d40351c8105e413` |
| 0.1.9 | `d4b53388df891158c9c868177a4213a5e8b2f608` |
| 0.1.10 | `6d94607eaa9d51c9ed782342161beca77b05aaf9` |
| dev-main | `41c9fe6026e91ee0396dc98ee65be64b6080d3b3` |

The merged main point was refreshed on October 4, 2026. Release tags retain their original samples; cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 1.255 | 1.336 | +6.4% | 1.336 | +0.0% | yes | 1.187 to 1.458 | 1.253 to 2.559 |
| dev-main | verse_definitions | 128 | 17.196 | 3.398 | -80.2% | 3.398 | +0.0% | yes | 15.922 to 19.451 | 2.995 to 4.911 |
| dev-main | verse_equivalent | 128 | 24.120 | 3.592 | -85.1% | 3.592 | +0.0% | yes | 21.500 to 32.741 | 3.123 to 5.319 |
| dev-main | paragraphs | 128 | 0.337 | 0.190 | -43.6% | 0.190 | +0.0% | yes | 0.314 to 0.538 | 0.171 to 0.208 |
| dev-main | mixed_document | 128 | 4.114 | 2.584 | -37.2% | 2.584 | +0.0% | yes | 3.662 to 6.599 | 2.432 to 4.030 |
| dev-main | quoted_false_mixed_closer | 128 | 1.303 | 1.339 | +2.7% | 1.339 | +0.0% | yes | 1.208 to 2.339 | 1.192 to 2.851 |
| dev-main | quoted_indented_closer | 128 | 1.294 | 1.351 | +4.4% | 1.351 | +0.0% | yes | 1.190 to 2.059 | 1.136 to 1.589 |
| dev-main | html_table | 128 | 86.981 | 38.990 | -55.2% | 38.990 | +0.0% | yes | 74.461 to 143.771 | 35.166 to 44.375 |
| dev-main | html_definition_list | 128 | 44.049 | 14.348 | -67.4% | 14.348 | +0.0% | yes | 39.431 to 76.770 | 12.060 to 20.775 |
| dev-main | quoted_fences | 1024 | 10.285 | 9.156 | -11.0% | 9.156 | +0.0% | yes | 8.763 to 15.076 | 8.241 to 11.118 |
| dev-main | verse_definitions | 1024 | 800.499 | 26.930 | -96.6% | 26.930 | +0.0% | yes | 721.439 to 981.896 | 23.973 to 33.863 |
| dev-main | verse_equivalent | 1024 | 1174.312 | 28.169 | -97.6% | 28.169 | +0.0% | yes | 1069.473 to 1300.351 | 25.311 to 35.404 |
| dev-main | paragraphs | 1024 | 2.593 | 1.534 | -40.8% | 1.534 | +0.0% | yes | 2.510 to 3.375 | 1.467 to 1.658 |
| dev-main | mixed_document | 1024 | 557.954 | 383.299 | -31.3% | 383.299 | +0.0% | yes | 481.274 to 719.898 | 359.029 to 437.893 |
| dev-main | quoted_false_mixed_closer | 1024 | 10.379 | 9.309 | -10.3% | 9.309 | +0.0% | yes | 8.490 to 18.159 | 8.240 to 11.665 |
| dev-main | quoted_indented_closer | 1024 | 9.795 | 9.183 | -6.3% | 9.183 | +0.0% | yes | 8.413 to 13.812 | 8.609 to 10.973 |
| dev-main | html_table | 1024 | 1499.097 | 367.911 | -75.5% | 367.911 | +0.0% | yes | 1315.302 to 1868.470 | 348.989 to 427.454 |
| dev-main | html_definition_list | 1024 | 1190.962 | 138.459 | -88.4% | 138.459 | +0.0% | yes | 1064.362 to 1774.015 | 128.526 to 184.562 |

## rs

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Latest tag: 0.1.7.

![rs history](engine-history-rs.svg)

| Revision | Commit |
|---|---|
| 0.1.4 | `2e9c43f22c5ed05dbd93323ae6b9c94bb867b285` |
| 0.1.5 | `56cb353657375e1a85965d5fcf00a234831d82c6` |
| 0.1.6 | `d7837249c64b88879b04cd71b8b5555ff246e16f` |
| 0.1.7 | `9f3f334c7d5c91c57e4e6269b32599af1062fdde` |
| dev-main | `914704f80c08bc3b52703c9bc06dc3ff89ded7f4` |

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.101 | 0.064 | -36.8% | 0.064 | +0.0% | yes | 0.099 to 0.125 | 0.062 to 0.073 |
| dev-main | verse_definitions | 128 | 0.184 | 0.134 | n/a: different output | 0.134 | +0.0% | no | 0.176 to 0.231 | 0.115 to 0.205 |
| dev-main | verse_equivalent | 128 | 0.197 | 0.157 | -20.4% | 0.157 | +0.0% | yes | 0.181 to 0.311 | 0.146 to 1.363 |
| dev-main | paragraphs | 128 | 0.028 | 0.019 | -31.8% | 0.019 | +0.0% | yes | 0.026 to 0.044 | 0.017 to 0.025 |
| dev-main | mixed_document | 128 | 0.389 | 0.208 | -46.6% | 0.208 | +0.0% | yes | 0.296 to 0.504 | 0.186 to 0.265 |
| dev-main | quoted_fences | 1024 | 2.208 | 0.625 | -71.7% | 0.625 | +0.0% | yes | 2.070 to 2.663 | 0.490 to 1.904 |
| dev-main | verse_definitions | 1024 | 1.821 | 1.231 | n/a: different output | 1.231 | +0.0% | no | 1.730 to 3.594 | 1.163 to 1.426 |
| dev-main | verse_equivalent | 1024 | 1.788 | 1.520 | -15.0% | 1.520 | +0.0% | yes | 1.354 to 3.493 | 1.364 to 2.957 |
| dev-main | paragraphs | 1024 | 0.218 | 0.155 | -28.7% | 0.155 | +0.0% | yes | 0.199 to 0.391 | 0.152 to 0.248 |
| dev-main | mixed_document | 1024 | 2.649 | 1.634 | -38.3% | 1.634 | +0.0% | yes | 2.552 to 4.102 | 1.510 to 2.038 |

