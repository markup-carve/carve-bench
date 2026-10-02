# Engine release history

Sessions began 2026-10-02T12:21:26.895588+00:00. 4 stable tags per engine plus a pinned dev-main when measured source differs from the newest tag.

Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.

The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.

[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)

## Measurement sessions

Retained tag, JavaScript and Rust timings are unchanged. PHP main was refreshed at 8deb237 after markup-carve/carve-php#2832, markup-carve/carve-php#2833 and markup-carve/carve-php#2834 merged. The PHP point records its own session times and worker hashes; the top-level harness describes the retained history session. JavaScript and Rust main advanced through CI-timeout-only commits; their source fingerprints match the measured commits recorded on each revision.

js retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

php retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

rs retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

php dev-main refresh: 2026-10-02T14:07:06.099883+00:00 to 2026-10-02T14:08:28.843824+00:00. [Point provenance](php-latest-main-history-point.json).

## Shared-host spread

Initial load average: [5.18994140625, 5.53466796875, 5.52490234375]. Final load average: [7.6640625, 8.294921875, 7.34130859375]. Whiskers show sample ranges; medians from noisy sessions are descriptive readings, not confirmed speed changes.

js: widest sample range is 13.7x for dev-main quoted_fences n=128 (0.226 to 3.108 ms). Inspect round medians in the JSON before attributing a difference to code.

php: widest sample range is 7.2x for dev-main paragraphs n=128 (0.250 to 1.792 ms). Inspect round medians in the JSON before attributing a difference to code.

rs: widest sample range is 7.2x for 0.1.6 verse_equivalent n=128 (0.115 to 0.829 ms). Inspect round medians in the JSON before attributing a difference to code.

## Watchpoints



- php dev-main html_definition_list n=128: 15.937 ms versus 2.418 ms on 0.1.7 (+559.0%). Output hashes match and sample ranges are separate; investigate this older-baseline cost.
- php dev-main html_table n=1024: 445.698 ms versus 176.754 ms on 0.1.7 (+152.2%). Output hashes match and sample ranges are separate; investigate this older-baseline cost.
- php dev-main html_definition_list n=1024: 174.641 ms versus 19.463 ms on 0.1.7 (+797.3%). Output hashes match and sample ranges are separate; investigate this older-baseline cost.
- rs dev-main verse_equivalent n=1024: 1.835 ms versus 0.910 ms on 0.1.4 (+101.6%). Output hashes match and sample ranges are separate; investigate this older-baseline cost.

## js

Runtime: v22.22.2. Latest tag: 0.1.9.

![js history](engine-history-js.svg)

| Revision | Commit |
|---|---|
| 0.1.6 | `379474fbc87a9afe36620e2b71902f88d2b757b5` |
| 0.1.7 | `680af386605367bb86a07c2b258673c6514c4005` |
| 0.1.8 | `23204e8982012a4b3900dc735e46b3c2630803c2` |
| 0.1.9 | `a0cb0ad18fc4da223e46cfb77672e4dec537a83b` |
| dev-main | `d5f82cf4f87828c101dbb9a284a9fcd843ba0151` |

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.311 | 0.288 | -7.3% | 0.288 | +0.0% | yes | 0.254 to 1.718 | 0.226 to 3.108 |
| dev-main | verse_definitions | 128 | 0.744 | 0.709 | -4.6% | 0.709 | +0.0% | yes | 0.656 to 2.999 | 0.600 to 1.703 |
| dev-main | verse_equivalent | 128 | 0.850 | 0.748 | -12.0% | 0.748 | +0.0% | yes | 0.686 to 1.712 | 0.619 to 4.173 |
| dev-main | paragraphs | 128 | 0.079 | 0.086 | +8.3% | 0.086 | +0.0% | yes | 0.075 to 0.101 | 0.077 to 0.381 |
| dev-main | mixed_document | 128 | 1.451 | 1.498 | +3.2% | 1.498 | +0.0% | yes | 1.217 to 2.254 | 1.219 to 5.484 |
| dev-main | quoted_fences | 1024 | 2.401 | 1.822 | -24.1% | 1.822 | +0.0% | yes | 1.997 to 5.849 | 1.590 to 4.143 |
| dev-main | verse_definitions | 1024 | 6.334 | 5.385 | -15.0% | 5.385 | +0.0% | yes | 5.014 to 11.435 | 4.368 to 8.069 |
| dev-main | verse_equivalent | 1024 | 7.843 | 5.520 | -29.6% | 5.520 | +0.0% | yes | 5.643 to 13.768 | 4.700 to 12.696 |
| dev-main | paragraphs | 1024 | 0.673 | 0.694 | +3.1% | 0.694 | +0.0% | yes | 0.634 to 1.763 | 0.638 to 1.617 |
| dev-main | mixed_document | 1024 | 26.744 | 26.721 | -0.1% | 26.721 | +0.0% | yes | 21.797 to 63.089 | 20.821 to 50.063 |

## php

Runtime: 8.5.11. Latest tag: 0.1.10.

![php history](engine-history-php.svg)

| Revision | Commit |
|---|---|
| 0.1.7 | `9fd773b229d4d63b8b468b87b122943d563c80dc` |
| 0.1.8 | `93409af08040344221ff0d2d2d40351c8105e413` |
| 0.1.9 | `d4b53388df891158c9c868177a4213a5e8b2f608` |
| 0.1.10 | `6d94607eaa9d51c9ed782342161beca77b05aaf9` |
| dev-main | `8deb237e1129af59f7efa5e5e3522340d08a5ae4` |

PHP dev-main was refreshed on CPU 12 after the decoder metadata and buffered writer fixes merged. Four rounds of 11 samples began 2026-10-02T14:07:06.099883+00:00. Source, Composer artifacts and autoload origins were checked before and after. [Refreshed main point](php-latest-main-history-point.json).

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 1.255 | 1.311 | +4.4% | 1.311 | +0.0% | yes | 1.187 to 1.458 | 1.237 to 3.704 |
| dev-main | verse_definitions | 128 | 17.196 | 3.436 | -80.0% | 3.436 | +0.0% | yes | 15.922 to 19.451 | 3.048 to 6.362 |
| dev-main | verse_equivalent | 128 | 24.120 | 3.653 | -84.9% | 3.653 | +0.0% | yes | 21.500 to 32.741 | 3.143 to 6.911 |
| dev-main | paragraphs | 128 | 0.337 | 0.269 | -20.1% | 0.269 | +0.0% | yes | 0.314 to 0.538 | 0.250 to 1.792 |
| dev-main | mixed_document | 128 | 4.114 | 3.232 | -21.4% | 3.232 | +0.0% | yes | 3.662 to 6.599 | 2.931 to 5.836 |
| dev-main | quoted_false_mixed_closer | 128 | 1.303 | 1.383 | +6.1% | 1.383 | +0.0% | yes | 1.208 to 2.339 | 1.261 to 2.474 |
| dev-main | quoted_indented_closer | 128 | 1.294 | 1.510 | +16.7% | 1.510 | +0.0% | yes | 1.190 to 2.059 | 1.256 to 2.935 |
| dev-main | html_table | 128 | 86.981 | 40.912 | -53.0% | 40.912 | +0.0% | yes | 74.461 to 143.771 | 36.835 to 66.861 |
| dev-main | html_definition_list | 128 | 44.049 | 15.937 | -63.8% | 15.937 | +0.0% | yes | 39.431 to 76.770 | 13.727 to 27.135 |
| dev-main | quoted_fences | 1024 | 10.285 | 9.798 | -4.7% | 9.798 | +0.0% | yes | 8.763 to 15.076 | 8.794 to 17.633 |
| dev-main | verse_definitions | 1024 | 800.499 | 28.864 | -96.4% | 28.864 | +0.0% | yes | 721.439 to 981.896 | 25.670 to 47.292 |
| dev-main | verse_equivalent | 1024 | 1174.312 | 29.360 | -97.5% | 29.360 | +0.0% | yes | 1069.473 to 1300.351 | 26.972 to 46.375 |
| dev-main | paragraphs | 1024 | 2.593 | 2.109 | -18.7% | 2.109 | +0.0% | yes | 2.510 to 3.375 | 1.889 to 3.762 |
| dev-main | mixed_document | 1024 | 557.954 | 445.282 | -20.2% | 445.282 | +0.0% | yes | 481.274 to 719.898 | 392.432 to 476.195 |
| dev-main | quoted_false_mixed_closer | 1024 | 10.379 | 9.784 | -5.7% | 9.784 | +0.0% | yes | 8.490 to 18.159 | 8.674 to 12.496 |
| dev-main | quoted_indented_closer | 1024 | 9.795 | 9.659 | -1.4% | 9.659 | +0.0% | yes | 8.413 to 13.812 | 8.088 to 12.014 |
| dev-main | html_table | 1024 | 1499.097 | 445.698 | -70.3% | 445.698 | +0.0% | yes | 1315.302 to 1868.470 | 370.441 to 523.746 |
| dev-main | html_definition_list | 1024 | 1190.962 | 174.641 | -85.3% | 174.641 | +0.0% | yes | 1064.362 to 1774.015 | 140.814 to 209.520 |

## rs

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Latest tag: 0.1.7.

![rs history](engine-history-rs.svg)

| Revision | Commit |
|---|---|
| 0.1.4 | `2e9c43f22c5ed05dbd93323ae6b9c94bb867b285` |
| 0.1.5 | `56cb353657375e1a85965d5fcf00a234831d82c6` |
| 0.1.6 | `d7837249c64b88879b04cd71b8b5555ff246e16f` |
| 0.1.7 | `9f3f334c7d5c91c57e4e6269b32599af1062fdde` |
| dev-main | `d9922c6edcf371d668ce4b5c80b2d9ddb7686b76` |

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.101 | 0.085 | -15.9% | 0.085 | +0.0% | yes | 0.099 to 0.125 | 0.081 to 0.111 |
| dev-main | verse_definitions | 128 | 0.184 | 0.175 | n/a: different output | 0.175 | +0.0% | no | 0.176 to 0.231 | 0.156 to 0.214 |
| dev-main | verse_equivalent | 128 | 0.197 | 0.204 | +3.1% | 0.204 | +0.0% | yes | 0.181 to 0.311 | 0.189 to 0.262 |
| dev-main | paragraphs | 128 | 0.028 | 0.030 | +7.1% | 0.030 | +0.0% | yes | 0.026 to 0.044 | 0.029 to 0.088 |
| dev-main | mixed_document | 128 | 0.389 | 0.320 | -17.8% | 0.320 | +0.0% | yes | 0.296 to 0.504 | 0.310 to 0.436 |
| dev-main | quoted_fences | 1024 | 2.208 | 0.792 | -64.1% | 0.792 | +0.0% | yes | 2.070 to 2.663 | 0.590 to 1.248 |
| dev-main | verse_definitions | 1024 | 1.821 | 1.101 | n/a: different output | 1.101 | +0.0% | no | 1.730 to 3.594 | 1.059 to 1.794 |
| dev-main | verse_equivalent | 1024 | 1.788 | 1.835 | +2.6% | 1.835 | +0.0% | yes | 1.354 to 3.493 | 1.472 to 2.859 |
| dev-main | paragraphs | 1024 | 0.218 | 0.245 | +12.7% | 0.245 | +0.0% | yes | 0.199 to 0.391 | 0.227 to 0.379 |
| dev-main | mixed_document | 1024 | 2.649 | 2.796 | +5.5% | 2.796 | +0.0% | yes | 2.552 to 4.102 | 2.667 to 4.875 |

