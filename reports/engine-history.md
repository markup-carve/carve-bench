# Engine release history

Retained sessions began 2026-10-02T12:21:26.895588+00:00. 4 stable tags per engine plus a pinned dev-main when measured source differs from the newest tag.

Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.

The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.

[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)

## Measurement sessions

Release-tag measurements retain their original sessions. All three merged main points were refreshed 2026-10-05T18:19:33.383246+00:00 with the same fixtures, workers and sampling counts on CPU 13. Separate shared-host sessions and build configurations do not isolate code speedups.

js retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

php retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

rs retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

js dev-main refresh: 2026-10-05T18:17:55.718706+00:00 to 2026-10-05T18:18:21.772263+00:00; driver `ed2d02d031d1427f428a632568b9e9f4637ce1e8`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

php dev-main refresh: 2026-10-05T18:18:22.027007+00:00 to 2026-10-05T18:19:32.523613+00:00; driver `ed2d02d031d1427f428a632568b9e9f4637ce1e8`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

rs dev-main refresh: 2026-10-05T18:19:32.541554+00:00 to 2026-10-05T18:19:33.370203+00:00; driver `ed2d02d031d1427f428a632568b9e9f4637ce1e8`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

## Shared-host spread

Retained session initial load average: [5.18994140625, 5.53466796875, 5.52490234375]. Final load average: [7.6640625, 8.294921875, 7.34130859375]. Whiskers show sample ranges; medians from noisy sessions are descriptive readings, not confirmed speed changes.

js dev-main refresh load average: initial [2.36328125, 2.3935546875, 1.99853515625]; final [2.33642578125, 2.37939453125, 2.00537109375].

php dev-main refresh load average: initial [2.33642578125, 2.37939453125, 2.00537109375]; final [1.64306640625, 2.16259765625, 1.95849609375].

rs dev-main refresh load average: initial [1.64306640625, 2.16259765625, 1.95849609375]; final [1.64306640625, 2.16259765625, 1.95849609375].

js: widest sample range is 12.9x for 0.1.8 verse_equivalent n=128 (0.748 to 9.631 ms). Inspect round medians in the JSON before attributing a difference to code.

php: widest sample range is 5.5x for 0.1.9 paragraphs n=128 (0.274 to 1.495 ms). Inspect round medians in the JSON before attributing a difference to code.

rs: widest sample range is 7.2x for 0.1.6 verse_equivalent n=128 (0.115 to 0.829 ms). Inspect round medians in the JSON before attributing a difference to code.

## Watchpoints



- php dev-main html_definition_list n=128: 13.961 ms versus 2.418 ms on 0.1.7 (+477.3%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_table n=1024: 369.634 ms versus 176.754 ms on 0.1.7 (+109.1%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_definition_list n=1024: 136.761 ms versus 19.463 ms on 0.1.7 (+602.7%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.

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

The merged main point was refreshed on October 5, 2026. Release tags retain their original samples; cross-session differences do not establish code speedups.

Merged main refreshed 2026-10-05T18:18:21.772282+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.311 | 0.231 | -25.6% | 0.231 | +0.0% | yes | 0.254 to 1.718 | 0.212 to 0.486 |
| dev-main | verse_definitions | 128 | 0.744 | 0.610 | -17.9% | 0.610 | +0.0% | yes | 0.656 to 2.999 | 0.517 to 1.491 |
| dev-main | verse_equivalent | 128 | 0.850 | 0.619 | -27.1% | 0.619 | +0.0% | yes | 0.686 to 1.712 | 0.567 to 1.178 |
| dev-main | paragraphs | 128 | 0.079 | 0.071 | -10.3% | 0.071 | +0.0% | yes | 0.075 to 0.101 | 0.066 to 0.223 |
| dev-main | mixed_document | 128 | 1.451 | 1.098 | -24.3% | 1.098 | +0.0% | yes | 1.217 to 2.254 | 1.039 to 1.544 |
| dev-main | quoted_fences | 1024 | 2.401 | 1.778 | -25.9% | 1.778 | +0.0% | yes | 1.997 to 5.849 | 1.583 to 3.376 |
| dev-main | verse_definitions | 1024 | 6.334 | 4.700 | -25.8% | 4.700 | +0.0% | yes | 5.014 to 11.435 | 4.023 to 7.622 |
| dev-main | verse_equivalent | 1024 | 7.843 | 4.855 | -38.1% | 4.855 | +0.0% | yes | 5.643 to 13.768 | 4.200 to 8.910 |
| dev-main | paragraphs | 1024 | 0.673 | 0.570 | -15.4% | 0.570 | +0.0% | yes | 0.634 to 1.763 | 0.542 to 0.892 |
| dev-main | mixed_document | 1024 | 26.744 | 15.851 | -40.7% | 15.851 | +0.0% | yes | 21.797 to 63.089 | 13.263 to 18.965 |

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

The merged main point was refreshed on October 5, 2026. Release tags retain their original samples; cross-session differences do not establish code speedups.

Merged main refreshed 2026-10-05T18:19:32.523640+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 1.255 | 1.380 | +10.0% | 1.380 | +0.0% | yes | 1.187 to 1.458 | 1.272 to 2.896 |
| dev-main | verse_definitions | 128 | 17.196 | 3.417 | -80.1% | 3.417 | +0.0% | yes | 15.922 to 19.451 | 3.090 to 5.013 |
| dev-main | verse_equivalent | 128 | 24.120 | 3.593 | -85.1% | 3.593 | +0.0% | yes | 21.500 to 32.741 | 3.420 to 5.281 |
| dev-main | paragraphs | 128 | 0.337 | 0.196 | -41.9% | 0.196 | +0.0% | yes | 0.314 to 0.538 | 0.181 to 0.211 |
| dev-main | mixed_document | 128 | 4.114 | 2.536 | -38.4% | 2.536 | +0.0% | yes | 3.662 to 6.599 | 2.490 to 2.603 |
| dev-main | quoted_false_mixed_closer | 128 | 1.303 | 1.389 | +6.5% | 1.389 | +0.0% | yes | 1.208 to 2.339 | 1.290 to 1.917 |
| dev-main | quoted_indented_closer | 128 | 1.294 | 1.358 | +5.0% | 1.358 | +0.0% | yes | 1.190 to 2.059 | 1.248 to 3.098 |
| dev-main | html_table | 128 | 86.981 | 37.738 | -56.6% | 37.738 | +0.0% | yes | 74.461 to 143.771 | 36.306 to 44.931 |
| dev-main | html_definition_list | 128 | 44.049 | 13.961 | -68.3% | 13.961 | +0.0% | yes | 39.431 to 76.770 | 12.512 to 21.005 |
| dev-main | quoted_fences | 1024 | 10.285 | 9.390 | -8.7% | 9.390 | +0.0% | yes | 8.763 to 15.076 | 8.714 to 11.652 |
| dev-main | verse_definitions | 1024 | 800.499 | 27.581 | -96.6% | 27.581 | +0.0% | yes | 721.439 to 981.896 | 25.555 to 34.585 |
| dev-main | verse_equivalent | 1024 | 1174.312 | 28.615 | -97.6% | 28.615 | +0.0% | yes | 1069.473 to 1300.351 | 26.747 to 36.303 |
| dev-main | paragraphs | 1024 | 2.593 | 1.542 | -40.5% | 1.542 | +0.0% | yes | 2.510 to 3.375 | 1.508 to 3.076 |
| dev-main | mixed_document | 1024 | 557.954 | 369.113 | -33.8% | 369.113 | +0.0% | yes | 481.274 to 719.898 | 344.163 to 429.239 |
| dev-main | quoted_false_mixed_closer | 1024 | 10.379 | 9.468 | -8.8% | 9.468 | +0.0% | yes | 8.490 to 18.159 | 9.028 to 14.803 |
| dev-main | quoted_indented_closer | 1024 | 9.795 | 9.686 | -1.1% | 9.686 | +0.0% | yes | 8.413 to 13.812 | 8.943 to 13.047 |
| dev-main | html_table | 1024 | 1499.097 | 369.634 | -75.3% | 369.634 | +0.0% | yes | 1315.302 to 1868.470 | 343.834 to 415.533 |
| dev-main | html_definition_list | 1024 | 1190.962 | 136.761 | -88.5% | 136.761 | +0.0% | yes | 1064.362 to 1774.015 | 118.588 to 169.103 |

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

The merged main point was refreshed on October 5, 2026. Release tags retain their original samples; cross-session differences do not establish code speedups.

Merged main refreshed 2026-10-05T18:19:33.370222+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.101 | 0.067 | -33.5% | 0.067 | +0.0% | yes | 0.099 to 0.125 | 0.064 to 0.115 |
| dev-main | verse_definitions | 128 | 0.184 | 0.141 | n/a: different output | 0.141 | +0.0% | no | 0.176 to 0.231 | 0.128 to 0.163 |
| dev-main | verse_equivalent | 128 | 0.197 | 0.166 | -15.7% | 0.166 | +0.0% | yes | 0.181 to 0.311 | 0.157 to 0.182 |
| dev-main | paragraphs | 128 | 0.028 | 0.021 | -24.6% | 0.021 | +0.0% | yes | 0.026 to 0.044 | 0.020 to 0.027 |
| dev-main | mixed_document | 128 | 0.389 | 0.212 | -45.6% | 0.212 | +0.0% | yes | 0.296 to 0.504 | 0.201 to 0.254 |
| dev-main | quoted_fences | 1024 | 2.208 | 0.651 | -70.5% | 0.651 | +0.0% | yes | 2.070 to 2.663 | 0.497 to 1.165 |
| dev-main | verse_definitions | 1024 | 1.821 | 1.393 | n/a: different output | 1.393 | +0.0% | no | 1.730 to 3.594 | 1.299 to 1.537 |
| dev-main | verse_equivalent | 1024 | 1.788 | 1.496 | -16.3% | 1.496 | +0.0% | yes | 1.354 to 3.493 | 1.349 to 1.806 |
| dev-main | paragraphs | 1024 | 0.218 | 0.164 | -24.7% | 0.164 | +0.0% | yes | 0.199 to 0.391 | 0.149 to 0.200 |
| dev-main | mixed_document | 1024 | 2.649 | 1.759 | -33.6% | 1.759 | +0.0% | yes | 2.552 to 4.102 | 1.530 to 2.038 |

