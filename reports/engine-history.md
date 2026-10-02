# Engine release history

Sessions began 2026-10-02T11:15:17.492954+00:00. 4 stable tags per engine plus a pinned dev-main when measured source differs from the newest tag. Candidate PR points are included when requested.

Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.

The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.

[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)

Timing driver: `99064f0d21d903454b7bc7739a610b8225c91ab8`; CPU affinity: [12]; dirty benchmark tree: False. Report generation may use later metadata-only corrections.

## Shared-host spread

Initial load average: [33.22998046875, 32.18408203125, 26.439453125]. Final load average: [5.34619140625, 9.1748046875, 16.30029296875]. Whiskers show sample ranges; medians from noisy sessions are descriptive readings, not confirmed speed changes.

js: widest sample range is 14.0x for 0.1.8 quoted_fences n=128 (0.309 to 4.345 ms). Inspect round medians in the JSON before attributing a difference to code.

php: widest sample range is 7.8x for 0.1.7 paragraphs n=128 (0.458 to 3.581 ms). Inspect round medians in the JSON before attributing a difference to code.

rs: widest sample range is 4.2x for 0.1.6 verse_equivalent n=128 (0.220 to 0.932 ms). Inspect round medians in the JSON before attributing a difference to code.

## Watchpoints

- php dev-main quoted_fences n=128: 2.602 ms versus 1.053 ms on 0.1.9 (+147.2%). Output hashes match and sample ranges are separate; investigate this older-baseline cost.
- php dev-main html_definition_list n=128: 29.605 ms versus 4.386 ms on 0.1.7 (+574.9%). Output hashes match and sample ranges are separate; investigate this older-baseline cost.
- php dev-main html_table n=1024: 834.547 ms versus 275.740 ms on 0.1.7 (+202.7%). Output hashes match and sample ranges are separate; investigate this older-baseline cost.
- php dev-main html_definition_list n=1024: 341.948 ms versus 32.009 ms on 0.1.7 (+968.3%). Output hashes match and sample ranges are separate; investigate this older-baseline cost.
- rs dev-main verse_equivalent n=1024: 3.326 ms versus 1.533 ms on 0.1.4 (+116.9%). Output hashes match and sample ranges are separate; investigate this older-baseline cost.

## Uncertain +100% readings

- php dev-main verse_definitions n=128: 7.028 ms versus 3.325 ms on 0.1.9 (+111.4%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main verse_equivalent n=128: 7.084 ms versus 3.503 ms on 0.1.9 (+102.2%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main mixed_document n=128: 7.058 ms versus 3.278 ms on 0.1.9 (+115.4%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main quoted_false_mixed_closer n=128: 2.676 ms versus 1.230 ms on 0.1.8 (+117.5%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main quoted_false_mixed_closer n=128: 2.676 ms versus 1.092 ms on 0.1.9 (+145.1%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main quoted_indented_closer n=128: 2.611 ms versus 1.267 ms on 0.1.9 (+106.1%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main html_table n=128: 82.922 ms versus 38.474 ms on 0.1.7 (+115.5%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main verse_definitions n=1024: 56.596 ms versus 27.327 ms on 0.1.8 (+107.1%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main verse_definitions n=1024: 56.596 ms versus 26.499 ms on 0.1.9 (+113.6%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main verse_equivalent n=1024: 57.910 ms versus 27.148 ms on 0.1.8 (+113.3%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main verse_equivalent n=1024: 57.910 ms versus 27.581 ms on 0.1.9 (+110.0%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main quoted_false_mixed_closer n=1024: 19.415 ms versus 9.020 ms on 0.1.8 (+115.2%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main quoted_indented_closer n=1024: 19.813 ms versus 8.431 ms on 0.1.8 (+135.0%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main quoted_indented_closer n=1024: 19.813 ms versus 9.465 ms on 0.1.9 (+109.3%). Sample ranges overlap; this session does not establish a +100% regression.

## js

Runtime: v22.22.2. Latest tag: 0.1.9.

![js history](engine-history-js.svg)

| Revision | Commit |
|---|---|
| 0.1.6 | `379474fbc87a9afe36620e2b71902f88d2b757b5` |
| 0.1.7 | `680af386605367bb86a07c2b258673c6514c4005` |
| 0.1.8 | `23204e8982012a4b3900dc735e46b3c2630803c2` |
| 0.1.9 | `a0cb0ad18fc4da223e46cfb77672e4dec537a83b` |
| dev-main | `c77d85ead683bffc534d50ab18c1df95f1821c8b` |

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.621 | 0.298 | -52.0% | 0.298 | +0.0% | yes | 0.330 to 2.198 | 0.276 to 0.816 |
| dev-main | verse_definitions | 128 | 1.368 | 0.892 | -34.8% | 0.892 | +0.0% | yes | 1.000 to 3.448 | 0.772 to 5.431 |
| dev-main | verse_equivalent | 128 | 1.373 | 1.038 | -24.4% | 1.038 | +0.0% | yes | 0.952 to 3.220 | 0.814 to 1.844 |
| dev-main | paragraphs | 128 | 0.099 | 0.103 | +4.6% | 0.103 | +0.0% | yes | 0.094 to 0.366 | 0.095 to 0.134 |
| dev-main | mixed_document | 128 | 1.816 | 1.938 | +6.7% | 1.938 | +0.0% | yes | 1.562 to 3.885 | 1.597 to 3.643 |
| dev-main | quoted_fences | 1024 | 2.994 | 2.552 | -14.8% | 2.552 | +0.0% | yes | 2.465 to 4.592 | 2.032 to 4.468 |
| dev-main | verse_definitions | 1024 | 14.047 | 8.514 | -39.4% | 8.514 | +0.0% | yes | 8.591 to 40.576 | 5.614 to 12.242 |
| dev-main | verse_equivalent | 1024 | 8.587 | 7.513 | -12.5% | 7.513 | +0.0% | yes | 7.095 to 20.322 | 6.203 to 10.683 |
| dev-main | paragraphs | 1024 | 0.799 | 0.808 | +1.1% | 0.808 | +0.0% | yes | 0.768 to 1.672 | 0.784 to 1.617 |
| dev-main | mixed_document | 1024 | 36.609 | 34.805 | -4.9% | 34.805 | +0.0% | yes | 27.624 to 54.609 | 27.838 to 52.019 |

## php

Runtime: 8.5.11. Latest tag: 0.1.10.

![php history](engine-history-php.svg)

| Revision | Commit |
|---|---|
| 0.1.7 | `9fd773b229d4d63b8b468b87b122943d563c80dc` |
| 0.1.8 | `93409af08040344221ff0d2d2d40351c8105e413` |
| 0.1.9 | `d4b53388df891158c9c868177a4213a5e8b2f608` |
| 0.1.10 | `6d94607eaa9d51c9ed782342161beca77b05aaf9` |
| dev-main | `4c1cf690ea57e6ce035dfbecce932d42684c1018` |

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 2.082 | 2.602 | +24.9% | 2.602 | +0.0% | yes | 1.346 to 2.702 | 1.772 to 3.083 |
| dev-main | verse_definitions | 128 | 23.855 | 7.028 | -70.5% | 7.028 | +0.0% | yes | 17.745 to 25.986 | 4.592 to 7.419 |
| dev-main | verse_equivalent | 128 | 25.409 | 7.084 | -72.1% | 7.084 | +0.0% | yes | 24.401 to 34.995 | 5.000 to 7.596 |
| dev-main | paragraphs | 128 | 0.349 | 0.550 | +57.6% | 0.550 | +0.0% | yes | 0.340 to 0.646 | 0.340 to 0.704 |
| dev-main | mixed_document | 128 | 4.827 | 7.058 | +46.2% | 7.058 | +0.0% | yes | 4.123 to 8.780 | 4.314 to 9.182 |
| dev-main | quoted_false_mixed_closer | 128 | 1.445 | 2.676 | +85.2% | 2.676 | +0.0% | yes | 1.340 to 2.554 | 1.649 to 3.328 |
| dev-main | quoted_indented_closer | 128 | 1.399 | 2.611 | +86.7% | 2.611 | +0.0% | yes | 1.293 to 2.612 | 1.807 to 3.574 |
| dev-main | html_table | 128 | 99.196 | 82.922 | -16.4% | 82.922 | +0.0% | yes | 87.212 to 160.241 | 52.194 to 90.560 |
| dev-main | html_definition_list | 128 | 49.388 | 29.605 | -40.1% | 29.605 | +0.0% | yes | 44.594 to 83.889 | 18.891 to 42.820 |
| dev-main | quoted_fences | 1024 | 10.571 | 18.438 | +74.4% | 18.438 | +0.0% | yes | 9.665 to 18.238 | 11.949 to 20.502 |
| dev-main | verse_definitions | 1024 | 914.125 | 56.596 | -93.8% | 56.596 | +0.0% | yes | 798.408 to 1220.057 | 35.498 to 67.014 |
| dev-main | verse_equivalent | 1024 | 1241.967 | 57.910 | -95.3% | 57.910 | +0.0% | yes | 1168.814 to 1804.389 | 37.153 to 62.232 |
| dev-main | paragraphs | 1024 | 2.849 | 4.524 | +58.8% | 4.524 | +0.0% | yes | 2.688 to 4.701 | 2.702 to 4.953 |
| dev-main | mixed_document | 1024 | 589.869 | 746.783 | +26.6% | 746.783 | +0.0% | yes | 569.980 to 795.525 | 561.305 to 791.476 |
| dev-main | quoted_false_mixed_closer | 1024 | 11.210 | 19.415 | +73.2% | 19.415 | +0.0% | yes | 9.610 to 16.847 | 11.861 to 22.374 |
| dev-main | quoted_indented_closer | 1024 | 11.862 | 19.813 | +67.0% | 19.813 | +0.0% | yes | 9.614 to 18.015 | 11.721 to 22.859 |
| dev-main | html_table | 1024 | 1625.485 | 834.547 | -48.7% | 834.547 | +0.0% | yes | 1523.534 to 2404.293 | 574.634 to 891.817 |
| dev-main | html_definition_list | 1024 | 1790.719 | 341.948 | -80.9% | 341.948 | +0.0% | yes | 1159.053 to 2078.557 | 226.580 to 393.106 |

## rs

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Latest tag: 0.1.7.

![rs history](engine-history-rs.svg)

| Revision | Commit |
|---|---|
| 0.1.4 | `2e9c43f22c5ed05dbd93323ae6b9c94bb867b285` |
| 0.1.5 | `56cb353657375e1a85965d5fcf00a234831d82c6` |
| 0.1.6 | `d7837249c64b88879b04cd71b8b5555ff246e16f` |
| 0.1.7 | `9f3f334c7d5c91c57e4e6269b32599af1062fdde` |
| dev-main | `1aa51a380af1c5407fba49a476497ac4795adaeb` |

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.196 | 0.161 | -17.7% | 0.161 | +0.0% | yes | 0.171 to 0.254 | 0.124 to 0.211 |
| dev-main | verse_definitions | 128 | 0.362 | 0.300 | n/a: different output | 0.300 | +0.0% | no | 0.334 to 0.436 | 0.238 to 0.350 |
| dev-main | verse_equivalent | 128 | 0.356 | 0.365 | +2.5% | 0.365 | +0.0% | yes | 0.334 to 0.404 | 0.345 to 0.447 |
| dev-main | paragraphs | 128 | 0.048 | 0.053 | +10.5% | 0.053 | +0.0% | yes | 0.045 to 0.052 | 0.045 to 0.059 |
| dev-main | mixed_document | 128 | 0.596 | 0.553 | -7.2% | 0.553 | +0.0% | yes | 0.524 to 0.678 | 0.448 to 0.669 |
| dev-main | quoted_fences | 1024 | 3.856 | 1.341 | -65.2% | 1.341 | +0.0% | yes | 3.346 to 4.139 | 1.029 to 1.633 |
| dev-main | verse_definitions | 1024 | 3.401 | 2.174 | n/a: different output | 2.174 | +0.0% | no | 2.939 to 3.726 | 1.947 to 2.549 |
| dev-main | verse_equivalent | 1024 | 3.101 | 3.326 | +7.2% | 3.326 | +0.0% | yes | 2.544 to 3.526 | 2.612 to 3.650 |
| dev-main | paragraphs | 1024 | 0.387 | 0.430 | +11.1% | 0.430 | +0.0% | yes | 0.350 to 0.474 | 0.363 to 0.487 |
| dev-main | mixed_document | 1024 | 5.180 | 4.673 | -9.8% | 4.673 | +0.0% | yes | 3.890 to 5.998 | 4.157 to 5.689 |

