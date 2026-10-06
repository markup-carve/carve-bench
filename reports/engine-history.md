# Engine release history

Retained sessions began 2026-10-02T12:21:26.895588+00:00. 4 stable tags per engine plus a pinned dev-main when measured source differs from the newest tag.

Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.

The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.

[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)

## Measurement sessions

Release-tag measurements retain their original sessions. All three merged main points were refreshed 2026-10-06T00:04:00.832526+00:00 with the same fixtures, workers and sampling counts on CPU 13. Separate shared-host sessions and build configurations do not isolate code speedups. JS and PHP use retained merged performance commits, not current main heads. Later main changes fix description-list or reference correctness and update lint or corpus coverage. They were excluded from this Rust performance refresh; these fixtures do not validate the newer fixes.

js retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

php retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

rs retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

js dev-main refresh: 2026-10-06T00:02:26.110587+00:00 to 2026-10-06T00:02:52.090384+00:00; driver `5d6a5fe056f3f2ddca50abec9f89d28f5fc847d7`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

php dev-main refresh: 2026-10-06T00:02:52.178736+00:00 to 2026-10-06T00:04:00.011010+00:00; driver `5d6a5fe056f3f2ddca50abec9f89d28f5fc847d7`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

rs dev-main refresh: 2026-10-06T00:04:00.030990+00:00 to 2026-10-06T00:04:00.818693+00:00; driver `5d6a5fe056f3f2ddca50abec9f89d28f5fc847d7`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

## Shared-host spread

Retained session initial load average: [5.18994140625, 5.53466796875, 5.52490234375]. Final load average: [7.6640625, 8.294921875, 7.34130859375]. Whiskers show sample ranges; medians from noisy sessions are descriptive readings, not confirmed speed changes.

js dev-main refresh load average: initial [1.23828125, 1.71142578125, 4.29638671875]; final [1.54248046875, 1.74951171875, 4.23974609375].

php dev-main refresh load average: initial [1.54248046875, 1.74951171875, 4.23974609375]; final [1.388671875, 1.65283203125, 4.02197265625].

rs dev-main refresh load average: initial [1.388671875, 1.65283203125, 4.02197265625]; final [1.388671875, 1.65283203125, 4.02197265625].

js: widest sample range is 12.9x for 0.1.8 verse_equivalent n=128 (0.748 to 9.631 ms). Inspect round medians in the JSON before attributing a difference to code.

php: widest sample range is 5.5x for 0.1.9 paragraphs n=128 (0.274 to 1.495 ms). Inspect round medians in the JSON before attributing a difference to code.

rs: widest sample range is 7.2x for 0.1.6 verse_equivalent n=128 (0.115 to 0.829 ms). Inspect round medians in the JSON before attributing a difference to code.

## Watchpoints



- php dev-main html_definition_list n=128: 13.887 ms versus 2.418 ms on 0.1.7 (+474.3%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_definition_list n=1024: 126.529 ms versus 19.463 ms on 0.1.7 (+550.1%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.

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

Merged main refreshed 2026-10-06T00:02:52.090408+00:00; release samples retained. Cross-session differences do not establish code speedups.

JS and PHP use retained merged performance commits, not current main heads. Later main changes fix description-list or reference correctness and update lint or corpus coverage. They were excluded from this Rust performance refresh; these fixtures do not validate the newer fixes.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.311 | 0.232 | ranges overlap | 0.232 | +0.0% | yes | 0.254 to 1.718 | 0.197 to 1.025 |
| dev-main | verse_definitions | 128 | 0.744 | 0.579 | ranges overlap | 0.579 | +0.0% | yes | 0.656 to 2.999 | 0.504 to 1.068 |
| dev-main | verse_equivalent | 128 | 0.850 | 0.623 | ranges overlap | 0.623 | +0.0% | yes | 0.686 to 1.712 | 0.561 to 1.949 |
| dev-main | paragraphs | 128 | 0.079 | 0.070 | ranges overlap | 0.070 | +0.0% | yes | 0.075 to 0.101 | 0.060 to 0.194 |
| dev-main | mixed_document | 128 | 1.451 | 1.107 | ranges overlap | 1.107 | +0.0% | yes | 1.217 to 2.254 | 1.041 to 1.609 |
| dev-main | quoted_fences | 1024 | 2.401 | 1.709 | ranges overlap | 1.709 | +0.0% | yes | 1.997 to 5.849 | 1.566 to 2.347 |
| dev-main | verse_definitions | 1024 | 6.334 | 4.305 | ranges overlap | 4.305 | +0.0% | yes | 5.014 to 11.435 | 3.775 to 6.668 |
| dev-main | verse_equivalent | 1024 | 7.843 | 4.895 | ranges overlap | 4.895 | +0.0% | yes | 5.643 to 13.768 | 4.219 to 21.907 |
| dev-main | paragraphs | 1024 | 0.673 | 0.562 | ranges overlap | 0.562 | +0.0% | yes | 0.634 to 1.763 | 0.534 to 0.774 |
| dev-main | mixed_document | 1024 | 26.744 | 16.299 | -39.1% | 16.299 | +0.0% | yes | 21.797 to 63.089 | 12.802 to 19.977 |

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

Merged main refreshed 2026-10-06T00:04:00.011042+00:00; release samples retained. Cross-session differences do not establish code speedups.

JS and PHP use retained merged performance commits, not current main heads. Later main changes fix description-list or reference correctness and update lint or corpus coverage. They were excluded from this Rust performance refresh; these fixtures do not validate the newer fixes.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 1.255 | 1.327 | ranges overlap | 1.327 | +0.0% | yes | 1.187 to 1.458 | 1.241 to 1.437 |
| dev-main | verse_definitions | 128 | 17.196 | 3.393 | -80.3% | 3.393 | +0.0% | yes | 15.922 to 19.451 | 3.245 to 4.158 |
| dev-main | verse_equivalent | 128 | 24.120 | 3.535 | -85.3% | 3.535 | +0.0% | yes | 21.500 to 32.741 | 3.409 to 6.058 |
| dev-main | paragraphs | 128 | 0.337 | 0.185 | -45.1% | 0.185 | +0.0% | yes | 0.314 to 0.538 | 0.179 to 0.195 |
| dev-main | mixed_document | 128 | 4.114 | 2.571 | ranges overlap | 2.571 | +0.0% | yes | 3.662 to 6.599 | 2.474 to 4.475 |
| dev-main | quoted_false_mixed_closer | 128 | 1.303 | 1.404 | ranges overlap | 1.404 | +0.0% | yes | 1.208 to 2.339 | 1.206 to 1.693 |
| dev-main | quoted_indented_closer | 128 | 1.294 | 1.344 | ranges overlap | 1.344 | +0.0% | yes | 1.190 to 2.059 | 1.287 to 1.647 |
| dev-main | html_table | 128 | 86.981 | 36.965 | -57.5% | 36.965 | +0.0% | yes | 74.461 to 143.771 | 35.544 to 46.086 |
| dev-main | html_definition_list | 128 | 44.049 | 13.887 | -68.5% | 13.887 | +0.0% | yes | 39.431 to 76.770 | 12.393 to 18.484 |
| dev-main | quoted_fences | 1024 | 10.285 | 9.260 | ranges overlap | 9.260 | +0.0% | yes | 8.763 to 15.076 | 8.946 to 13.065 |
| dev-main | verse_definitions | 1024 | 800.499 | 25.921 | -96.8% | 25.921 | +0.0% | yes | 721.439 to 981.896 | 25.069 to 31.204 |
| dev-main | verse_equivalent | 1024 | 1174.312 | 27.511 | -97.7% | 27.511 | +0.0% | yes | 1069.473 to 1300.351 | 25.640 to 35.935 |
| dev-main | paragraphs | 1024 | 2.593 | 1.507 | -41.9% | 1.507 | +0.0% | yes | 2.510 to 3.375 | 1.454 to 1.575 |
| dev-main | mixed_document | 1024 | 557.954 | 356.224 | -36.2% | 356.224 | +0.0% | yes | 481.274 to 719.898 | 321.949 to 425.104 |
| dev-main | quoted_false_mixed_closer | 1024 | 10.379 | 9.335 | ranges overlap | 9.335 | +0.0% | yes | 8.490 to 18.159 | 8.963 to 14.624 |
| dev-main | quoted_indented_closer | 1024 | 9.795 | 9.489 | ranges overlap | 9.489 | +0.0% | yes | 8.413 to 13.812 | 8.889 to 11.944 |
| dev-main | html_table | 1024 | 1499.097 | 350.329 | -76.6% | 350.329 | +0.0% | yes | 1315.302 to 1868.470 | 327.130 to 423.121 |
| dev-main | html_definition_list | 1024 | 1190.962 | 126.529 | -89.4% | 126.529 | +0.0% | yes | 1064.362 to 1774.015 | 114.606 to 176.283 |

## rs

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Latest tag: 0.1.7.

![rs history](engine-history-rs.svg)

| Revision | Commit |
|---|---|
| 0.1.4 | `2e9c43f22c5ed05dbd93323ae6b9c94bb867b285` |
| 0.1.5 | `56cb353657375e1a85965d5fcf00a234831d82c6` |
| 0.1.6 | `d7837249c64b88879b04cd71b8b5555ff246e16f` |
| 0.1.7 | `9f3f334c7d5c91c57e4e6269b32599af1062fdde` |
| dev-main | `ae44de38b6ecf468212cac117f83158f7c3988c2` |

Rust main and retained tags record different Cargo configuration fingerprints or build recipes. Their timings do not isolate engine speed changes; compare build_configuration for each revision.

Merged main refreshed 2026-10-06T00:04:00.818733+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.101 | 0.068 | -32.1% | 0.068 | +0.0% | yes | 0.099 to 0.125 | 0.063 to 0.082 |
| dev-main | verse_definitions | 128 | 0.184 | 0.144 | n/a: different output | 0.144 | +0.0% | no | 0.176 to 0.231 | 0.128 to 0.183 |
| dev-main | verse_equivalent | 128 | 0.197 | 0.164 | ranges overlap | 0.164 | +0.0% | yes | 0.181 to 0.311 | 0.148 to 0.192 |
| dev-main | paragraphs | 128 | 0.028 | 0.020 | ranges overlap | 0.020 | +0.0% | yes | 0.026 to 0.044 | 0.018 to 0.031 |
| dev-main | mixed_document | 128 | 0.389 | 0.209 | ranges overlap | 0.209 | +0.0% | yes | 0.296 to 0.504 | 0.194 to 0.309 |
| dev-main | quoted_fences | 1024 | 2.208 | 0.632 | -71.4% | 0.632 | +0.0% | yes | 2.070 to 2.663 | 0.490 to 0.776 |
| dev-main | verse_definitions | 1024 | 1.821 | 1.333 | n/a: different output | 1.333 | +0.0% | no | 1.730 to 3.594 | 1.264 to 1.421 |
| dev-main | verse_equivalent | 1024 | 1.788 | 1.481 | ranges overlap | 1.481 | +0.0% | yes | 1.354 to 3.493 | 1.415 to 1.557 |
| dev-main | paragraphs | 1024 | 0.218 | 0.153 | -29.8% | 0.153 | +0.0% | yes | 0.199 to 0.391 | 0.140 to 0.179 |
| dev-main | mixed_document | 1024 | 2.649 | 1.703 | -35.7% | 1.703 | +0.0% | yes | 2.552 to 4.102 | 1.647 to 1.957 |

