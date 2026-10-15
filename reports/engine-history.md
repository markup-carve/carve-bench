# Engine release history

The October 15 development-main points are earlier pins than the current core and full-corpus reports. This history has its own measured source commits.

Retained sessions began 2026-10-02T12:21:26.895588+00:00. 4 stable tags per engine plus a pinned dev-main when measured source differs from the newest tag.

Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.

The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.

[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)

Pinned merged-main snapshots are retained; later main commits are recorded as observations and are outside this measurement.

## Measurement sessions

Release-tag measurements retain their original sessions. All three merged main points were refreshed 2026-10-15T12:11:20.328771+00:00 with the same fixtures, workers and sampling counts on CPU 13. Separate shared-host sessions and build configurations do not isolate code speedups.

js retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

php retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

rs retained measurements: driver `70fe1de88f1b7e9705c65d831d2e3bcf4cc9d537`, session started 2026-10-02T12:21:26.895588+00:00, CPU affinity [12]; dirty benchmark tree: False.

js dev-main refresh: 2026-10-15T12:07:36.184924+00:00 to 2026-10-15T12:08:23.741784+00:00; driver `485ff55d6f89a5c26035ccb7dbdc2d26324ca9d5`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

php dev-main refresh: 2026-10-15T12:08:24.524686+00:00 to 2026-10-15T12:11:19.355941+00:00; driver `485ff55d6f89a5c26035ccb7dbdc2d26324ca9d5`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

rs dev-main refresh: 2026-10-15T12:11:19.378416+00:00 to 2026-10-15T12:11:20.304980+00:00; driver `485ff55d6f89a5c26035ccb7dbdc2d26324ca9d5`, CPU affinity [13]; dirty benchmark tree: True. [Point provenance](engine-history.json).

## Shared-host spread

Retained session initial load average: [5.18994140625, 5.53466796875, 5.52490234375]. Final load average: [7.6640625, 8.294921875, 7.34130859375]. Whiskers show sample ranges; medians from noisy sessions are descriptive readings, not confirmed speed changes.

js dev-main refresh load average: initial [23.4150390625, 36.88916015625, 31.81005859375]; final [35.05517578125, 38.1591796875, 32.5205078125].

php dev-main refresh load average: initial [35.05517578125, 38.1591796875, 32.5205078125]; final [22.509765625, 32.1611328125, 31.2568359375].

rs dev-main refresh load average: initial [22.509765625, 32.1611328125, 31.2568359375]; final [22.509765625, 32.1611328125, 31.2568359375].

js: widest sample range is 12.9x for 0.1.8 verse_equivalent n=128 (0.748 to 9.631 ms). Inspect round medians in the JSON before attributing a difference to code.

php: widest sample range is 31.5x for dev-main quoted_indented_closer n=128 (1.980 to 62.461 ms). Inspect round medians in the JSON before attributing a difference to code.

rs: widest sample range is 7.2x for 0.1.6 verse_equivalent n=128 (0.115 to 0.829 ms). Inspect round medians in the JSON before attributing a difference to code.

## Watchpoints



- js dev-main verse_equivalent n=128: 2.732 ms versus 0.731 ms on 0.1.7 (+273.8%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- js dev-main paragraphs n=128: 0.300 ms versus 0.079 ms on 0.1.9 (+278.3%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- js dev-main quoted_fences n=1024: 5.967 ms versus 2.584 ms on 0.1.8 (+130.9%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- js dev-main verse_equivalent n=1024: 17.669 ms versus 5.737 ms on 0.1.6 (+208.0%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- js dev-main verse_equivalent n=1024: 17.669 ms versus 5.603 ms on 0.1.7 (+215.4%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_fences n=128: 5.317 ms versus 0.949 ms on 0.1.7 (+460.3%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_fences n=128: 5.317 ms versus 0.986 ms on 0.1.8 (+439.2%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_fences n=128: 5.317 ms versus 1.667 ms on 0.1.9 (+218.9%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_fences n=128: 5.317 ms versus 1.255 ms on 0.1.10 (+323.7%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main verse_equivalent n=128: 8.347 ms versus 2.995 ms on 0.1.7 (+178.7%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main verse_equivalent n=128: 8.347 ms versus 3.073 ms on 0.1.8 (+171.7%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main verse_equivalent n=128: 8.347 ms versus 3.699 ms on 0.1.9 (+125.7%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_false_mixed_closer n=128: 4.923 ms versus 1.189 ms on 0.1.7 (+313.9%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_false_mixed_closer n=128: 4.923 ms versus 1.051 ms on 0.1.8 (+368.5%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_false_mixed_closer n=128: 4.923 ms versus 1.428 ms on 0.1.9 (+244.7%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_false_mixed_closer n=128: 4.923 ms versus 1.303 ms on 0.1.10 (+277.7%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_indented_closer n=128: 3.910 ms versus 0.967 ms on 0.1.7 (+304.4%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_indented_closer n=128: 3.910 ms versus 1.040 ms on 0.1.8 (+276.1%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_table n=128: 95.627 ms versus 23.403 ms on 0.1.7 (+308.6%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_definition_list n=128: 31.048 ms versus 2.418 ms on 0.1.7 (+1183.9%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_fences n=1024: 25.987 ms versus 7.126 ms on 0.1.7 (+264.7%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_fences n=1024: 25.987 ms versus 7.411 ms on 0.1.8 (+250.7%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_fences n=1024: 25.987 ms versus 9.164 ms on 0.1.9 (+183.6%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_fences n=1024: 25.987 ms versus 10.285 ms on 0.1.10 (+152.7%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main verse_definitions n=1024: 55.513 ms versus 22.188 ms on 0.1.7 (+150.2%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main verse_definitions n=1024: 55.513 ms versus 23.174 ms on 0.1.8 (+139.6%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main verse_equivalent n=1024: 64.487 ms versus 23.524 ms on 0.1.7 (+174.1%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main verse_equivalent n=1024: 64.487 ms versus 23.905 ms on 0.1.8 (+169.8%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main verse_equivalent n=1024: 64.487 ms versus 26.715 ms on 0.1.9 (+141.4%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_false_mixed_closer n=1024: 30.298 ms versus 7.244 ms on 0.1.7 (+318.3%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_false_mixed_closer n=1024: 30.298 ms versus 7.386 ms on 0.1.8 (+310.2%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_false_mixed_closer n=1024: 30.298 ms versus 7.992 ms on 0.1.9 (+279.1%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_false_mixed_closer n=1024: 30.298 ms versus 10.379 ms on 0.1.10 (+191.9%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_indented_closer n=1024: 20.311 ms versus 7.207 ms on 0.1.7 (+181.8%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_indented_closer n=1024: 20.311 ms versus 7.389 ms on 0.1.8 (+174.9%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main quoted_indented_closer n=1024: 20.311 ms versus 7.642 ms on 0.1.9 (+165.8%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_table n=1024: 962.283 ms versus 176.754 ms on 0.1.7 (+444.4%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.
- php dev-main html_definition_list n=1024: 309.777 ms versus 19.463 ms on 0.1.7 (+1491.6%). Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.

## Uncertain +100% readings



- js dev-main quoted_fences n=128: 0.730 ms versus 0.364 ms on 0.1.8 (+100.8%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main quoted_fences n=128: 0.730 ms versus 0.311 ms on 0.1.9 (+135.1%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main verse_definitions n=128: 2.242 ms versus 0.592 ms on 0.1.6 (+278.7%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main verse_definitions n=128: 2.242 ms versus 0.688 ms on 0.1.7 (+225.7%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main verse_definitions n=128: 2.242 ms versus 0.833 ms on 0.1.8 (+169.0%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main verse_definitions n=128: 2.242 ms versus 0.744 ms on 0.1.9 (+201.5%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main verse_equivalent n=128: 2.732 ms versus 0.841 ms on 0.1.6 (+224.8%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main verse_equivalent n=128: 2.732 ms versus 1.002 ms on 0.1.8 (+172.8%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main verse_equivalent n=128: 2.732 ms versus 0.850 ms on 0.1.9 (+221.4%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main paragraphs n=128: 0.300 ms versus 0.083 ms on 0.1.8 (+259.1%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main mixed_document n=128: 3.268 ms versus 1.465 ms on 0.1.8 (+123.1%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main mixed_document n=128: 3.268 ms versus 1.451 ms on 0.1.9 (+125.2%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main quoted_fences n=1024: 5.967 ms versus 2.401 ms on 0.1.9 (+148.5%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main verse_definitions n=1024: 13.996 ms versus 5.499 ms on 0.1.6 (+154.5%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main verse_definitions n=1024: 13.996 ms versus 5.036 ms on 0.1.7 (+177.9%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main verse_definitions n=1024: 13.996 ms versus 6.334 ms on 0.1.9 (+121.0%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main verse_equivalent n=1024: 17.669 ms versus 7.843 ms on 0.1.9 (+125.3%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main paragraphs n=1024: 1.568 ms versus 0.751 ms on 0.1.8 (+108.6%). Sample ranges overlap; this session does not establish a +100% regression.
- js dev-main paragraphs n=1024: 1.568 ms versus 0.673 ms on 0.1.9 (+132.8%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main verse_definitions n=128: 8.198 ms versus 3.185 ms on 0.1.7 (+157.4%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main verse_definitions n=128: 8.198 ms versus 2.801 ms on 0.1.8 (+192.6%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main verse_definitions n=128: 8.198 ms versus 3.983 ms on 0.1.9 (+105.8%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main quoted_indented_closer n=128: 3.910 ms versus 1.367 ms on 0.1.9 (+186.0%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main quoted_indented_closer n=128: 3.910 ms versus 1.294 ms on 0.1.10 (+202.2%). Sample ranges overlap; this session does not establish a +100% regression.
- php dev-main quoted_indented_closer n=1024: 20.311 ms versus 9.795 ms on 0.1.10 (+107.4%). Sample ranges overlap; this session does not establish a +100% regression.

## js

Runtime: v22.22.2. Latest tag: 0.1.9.

![js history](engine-history-js.svg)

| Revision | Commit |
|---|---|
| 0.1.6 | `379474fbc87a9afe36620e2b71902f88d2b757b5` |
| 0.1.7 | `680af386605367bb86a07c2b258673c6514c4005` |
| 0.1.8 | `23204e8982012a4b3900dc735e46b3c2630803c2` |
| 0.1.9 | `a0cb0ad18fc4da223e46cfb77672e4dec537a83b` |
| dev-main | `224b0c32e22480571c99aae3f0055a6e5a091f74` |

Merged main refreshed 2026-10-15T12:08:23.741826+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.311 | 0.730 | ranges overlap | 0.730 | +0.0% | yes | 0.254 to 1.718 | 0.329 to 1.541 |
| dev-main | verse_definitions | 128 | 0.744 | 2.242 | ranges overlap | 2.242 | +0.0% | yes | 0.656 to 2.999 | 1.006 to 4.412 |
| dev-main | verse_equivalent | 128 | 0.850 | 2.732 | ranges overlap | 2.732 | +0.0% | yes | 0.686 to 1.712 | 1.592 to 3.530 |
| dev-main | paragraphs | 128 | 0.079 | 0.300 | +278.3% | 0.300 | +0.0% | yes | 0.075 to 0.101 | 0.153 to 0.767 |
| dev-main | mixed_document | 128 | 1.451 | 3.268 | ranges overlap | 3.268 | +0.0% | yes | 1.217 to 2.254 | 1.608 to 5.636 |
| dev-main | quoted_fences | 1024 | 2.401 | 5.967 | ranges overlap | 5.967 | +0.0% | yes | 1.997 to 5.849 | 4.260 to 9.161 |
| dev-main | verse_definitions | 1024 | 6.334 | 13.996 | ranges overlap | 13.996 | +0.0% | yes | 5.014 to 11.435 | 7.721 to 35.635 |
| dev-main | verse_equivalent | 1024 | 7.843 | 17.669 | ranges overlap | 17.669 | +0.0% | yes | 5.643 to 13.768 | 12.165 to 101.708 |
| dev-main | paragraphs | 1024 | 0.673 | 1.568 | ranges overlap | 1.568 | +0.0% | yes | 0.634 to 1.763 | 1.214 to 3.134 |
| dev-main | mixed_document | 1024 | 26.744 | 40.835 | ranges overlap | 40.835 | +0.0% | yes | 21.797 to 63.089 | 33.235 to 68.738 |

## php

Runtime: 8.5.11. Latest tag: 0.1.10.

![php history](engine-history-php.svg)

| Revision | Commit |
|---|---|
| 0.1.7 | `9fd773b229d4d63b8b468b87b122943d563c80dc` |
| 0.1.8 | `93409af08040344221ff0d2d2d40351c8105e413` |
| 0.1.9 | `d4b53388df891158c9c868177a4213a5e8b2f608` |
| 0.1.10 | `6d94607eaa9d51c9ed782342161beca77b05aaf9` |
| dev-main | `967f253974433dbc53534df74b7abeae10f26458` |

Merged main refreshed 2026-10-15T12:11:19.355981+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 1.255 | 5.317 | +323.7% | 5.317 | +0.0% | yes | 1.187 to 1.458 | 2.420 to 11.116 |
| dev-main | verse_definitions | 128 | 17.196 | 8.198 | -52.3% | 8.198 | +0.0% | yes | 15.922 to 19.451 | 4.450 to 12.186 |
| dev-main | verse_equivalent | 128 | 24.120 | 8.347 | -65.4% | 8.347 | +0.0% | yes | 21.500 to 32.741 | 4.738 to 13.649 |
| dev-main | paragraphs | 128 | 0.337 | 0.346 | ranges overlap | 0.346 | +0.0% | yes | 0.314 to 0.538 | 0.203 to 0.476 |
| dev-main | mixed_document | 128 | 4.114 | 5.219 | ranges overlap | 5.219 | +0.0% | yes | 3.662 to 6.599 | 2.772 to 9.793 |
| dev-main | quoted_false_mixed_closer | 128 | 1.303 | 4.923 | +277.7% | 4.923 | +0.0% | yes | 1.208 to 2.339 | 2.533 to 11.121 |
| dev-main | quoted_indented_closer | 128 | 1.294 | 3.910 | ranges overlap | 3.910 | +0.0% | yes | 1.190 to 2.059 | 1.980 to 62.461 |
| dev-main | html_table | 128 | 86.981 | 95.627 | ranges overlap | 95.627 | +0.0% | yes | 74.461 to 143.771 | 56.450 to 414.200 |
| dev-main | html_definition_list | 128 | 44.049 | 31.048 | ranges overlap | 31.048 | +0.0% | yes | 39.431 to 76.770 | 17.973 to 56.983 |
| dev-main | quoted_fences | 1024 | 10.285 | 25.987 | +152.7% | 25.987 | +0.0% | yes | 8.763 to 15.076 | 18.854 to 75.214 |
| dev-main | verse_definitions | 1024 | 800.499 | 55.513 | -93.1% | 55.513 | +0.0% | yes | 721.439 to 981.896 | 40.097 to 90.528 |
| dev-main | verse_equivalent | 1024 | 1174.312 | 64.487 | -94.5% | 64.487 | +0.0% | yes | 1069.473 to 1300.351 | 46.481 to 93.159 |
| dev-main | paragraphs | 1024 | 2.593 | 3.010 | ranges overlap | 3.010 | +0.0% | yes | 2.510 to 3.375 | 1.753 to 7.947 |
| dev-main | mixed_document | 1024 | 557.954 | 862.371 | ranges overlap | 862.371 | +0.0% | yes | 481.274 to 719.898 | 515.653 to 1536.835 |
| dev-main | quoted_false_mixed_closer | 1024 | 10.379 | 30.298 | +191.9% | 30.298 | +0.0% | yes | 8.490 to 18.159 | 19.045 to 45.887 |
| dev-main | quoted_indented_closer | 1024 | 9.795 | 20.311 | ranges overlap | 20.311 | +0.0% | yes | 8.413 to 13.812 | 12.918 to 37.232 |
| dev-main | html_table | 1024 | 1499.097 | 962.283 | ranges overlap | 962.283 | +0.0% | yes | 1315.302 to 1868.470 | 549.759 to 1708.086 |
| dev-main | html_definition_list | 1024 | 1190.962 | 309.777 | -74.0% | 309.777 | +0.0% | yes | 1064.362 to 1774.015 | 217.535 to 544.864 |

## rs

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Latest tag: 0.1.7.

![rs history](engine-history-rs.svg)

| Revision | Commit |
|---|---|
| 0.1.4 | `2e9c43f22c5ed05dbd93323ae6b9c94bb867b285` |
| 0.1.5 | `56cb353657375e1a85965d5fcf00a234831d82c6` |
| 0.1.6 | `d7837249c64b88879b04cd71b8b5555ff246e16f` |
| 0.1.7 | `9f3f334c7d5c91c57e4e6269b32599af1062fdde` |
| dev-main | `76f95de6b62cfc0088312b0b9336390fd2cfd5f0` |

Rust main and retained tags record different Cargo configuration fingerprints or build recipes. Their timings do not isolate engine speed changes; compare build_configuration for each revision.

Merged main refreshed 2026-10-15T12:11:20.305015+00:00; release samples retained. Cross-session differences do not establish code speedups.

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |
|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| dev-main | quoted_fences | 128 | 0.101 | 0.056 | ranges overlap | 0.056 | +0.0% | yes | 0.099 to 0.125 | 0.050 to 0.101 |
| dev-main | verse_definitions | 128 | 0.184 | 0.202 | n/a: different output | 0.202 | +0.0% | no | 0.176 to 0.231 | 0.175 to 0.262 |
| dev-main | verse_equivalent | 128 | 0.197 | 0.141 | ranges overlap | 0.141 | +0.0% | yes | 0.181 to 0.311 | 0.129 to 0.196 |
| dev-main | paragraphs | 128 | 0.028 | 0.024 | ranges overlap | 0.024 | +0.0% | yes | 0.026 to 0.044 | 0.022 to 0.038 |
| dev-main | mixed_document | 128 | 0.389 | 0.245 | ranges overlap | 0.245 | +0.0% | yes | 0.296 to 0.504 | 0.231 to 0.466 |
| dev-main | quoted_fences | 1024 | 2.208 | 0.577 | -73.9% | 0.577 | +0.0% | yes | 2.070 to 2.663 | 0.384 to 1.136 |
| dev-main | verse_definitions | 1024 | 1.821 | 1.387 | n/a: different output | 1.387 | +0.0% | no | 1.730 to 3.594 | 1.287 to 2.008 |
| dev-main | verse_equivalent | 1024 | 1.788 | 1.702 | ranges overlap | 1.702 | +0.0% | yes | 1.354 to 3.493 | 1.114 to 2.783 |
| dev-main | paragraphs | 1024 | 0.218 | 0.189 | ranges overlap | 0.189 | +0.0% | yes | 0.199 to 0.391 | 0.173 to 0.224 |
| dev-main | mixed_document | 1024 | 2.649 | 2.044 | ranges overlap | 2.044 | +0.0% | yes | 2.552 to 4.102 | 1.886 to 3.059 |

