# Engine release history

Sessions began 2026-10-01T20:02:58.582388+00:00. 4 stable tags per engine plus a pinned dev-main when measured source differs from the newest tag. Candidate PR points are included when requested.

Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.

The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.

[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)

Timing driver: `7b740fa84321e24eb542fef97de544ef0409d871`; CPU affinity: [6]; dirty benchmark tree: False. Report generation may use later metadata-only corrections.

## Watchpoints

- php dev-main html_table n=128: 48.489 ms versus 20.840 ms on 0.1.7 (+132.7%). Output hashes match; investigate the additional cost against this older baseline.
- php dev-main html_definition_list n=128: 28.706 ms versus 2.223 ms on 0.1.7 (+1191.4%). Output hashes match; investigate the additional cost against this older baseline.
- php dev-main html_table n=1024: 510.152 ms versus 164.232 ms on 0.1.7 (+210.6%). Output hashes match; investigate the additional cost against this older baseline.
- php dev-main html_definition_list n=1024: 842.552 ms versus 17.854 ms on 0.1.7 (+4619.2%). Output hashes match; investigate the additional cost against this older baseline.
- php dev-main html_definition_list n=1024: 842.552 ms versus 274.369 ms on 0.1.8 (+207.1%). Output hashes match; investigate the additional cost against this older baseline.
- php dev-main html_definition_list n=1024: 842.552 ms versus 271.014 ms on 0.1.9 (+210.9%). Output hashes match; investigate the additional cost against this older baseline.
- php PR-2815 html_table n=128: 47.780 ms versus 20.840 ms on 0.1.7 (+129.3%). Output hashes match; investigate the additional cost against this older baseline.
- php PR-2815 html_definition_list n=128: 28.342 ms versus 2.223 ms on 0.1.7 (+1175.0%). Output hashes match; investigate the additional cost against this older baseline.
- php PR-2815 html_table n=1024: 502.802 ms versus 164.232 ms on 0.1.7 (+206.2%). Output hashes match; investigate the additional cost against this older baseline.
- php PR-2815 html_definition_list n=1024: 838.838 ms versus 17.854 ms on 0.1.7 (+4598.4%). Output hashes match; investigate the additional cost against this older baseline.
- php PR-2815 html_definition_list n=1024: 838.838 ms versus 274.369 ms on 0.1.8 (+205.7%). Output hashes match; investigate the additional cost against this older baseline.
- php PR-2815 html_definition_list n=1024: 838.838 ms versus 271.014 ms on 0.1.9 (+209.5%). Output hashes match; investigate the additional cost against this older baseline.

## js

Runtime: v22.22.2. Latest tag: 0.1.9.

![js history](engine-history-js.svg)

| Revision | Commit |
|---|---|
| 0.1.6 | `379474fbc87a9afe36620e2b71902f88d2b757b5` |
| 0.1.7 | `680af386605367bb86a07c2b258673c6514c4005` |
| 0.1.8 | `23204e8982012a4b3900dc735e46b3c2630803c2` |
| 0.1.9 | `a0cb0ad18fc4da223e46cfb77672e4dec537a83b` |
| dev-main | `8534bde0ecf823a0b60ae990bd973d9625fcf966` |
| PR-2445 | `9fbb98d44155930d0e2f6ed4f304f83203478270` |

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag |
|---|---|---:|---:|---:|---:|---:|---:|:---:|
| dev-main | quoted_fences | 128 | 0.290 | 0.314 | +8.5% | 0.314 | +0.0% | yes |
| dev-main | verse_definitions | 128 | 0.769 | 0.771 | +0.2% | 0.771 | +0.0% | yes |
| dev-main | verse_equivalent | 128 | 0.832 | 0.894 | +7.4% | 0.894 | +0.0% | yes |
| dev-main | paragraphs | 128 | 0.088 | 0.090 | +2.4% | 0.090 | +0.0% | yes |
| dev-main | mixed_document | 128 | 1.443 | 1.772 | +22.8% | 1.772 | +0.0% | yes |
| dev-main | quoted_fences | 1024 | 2.214 | 2.448 | +10.5% | 2.448 | +0.0% | yes |
| dev-main | verse_definitions | 1024 | 6.937 | 6.288 | -9.4% | 6.288 | +0.0% | yes |
| dev-main | verse_equivalent | 1024 | 7.928 | 6.572 | -17.1% | 6.572 | +0.0% | yes |
| dev-main | paragraphs | 1024 | 0.699 | 0.712 | +2.0% | 0.712 | +0.0% | yes |
| dev-main | mixed_document | 1024 | 26.607 | 27.273 | +2.5% | 27.273 | +0.0% | yes |
| PR-2445 | quoted_fences | 128 | 0.290 | 0.268 | -7.5% | 0.314 | -14.7% | yes |
| PR-2445 | verse_definitions | 128 | 0.769 | 0.685 | -10.9% | 0.771 | -11.1% | yes |
| PR-2445 | verse_equivalent | 128 | 0.832 | 0.745 | -10.4% | 0.894 | -16.6% | yes |
| PR-2445 | paragraphs | 128 | 0.088 | 0.086 | -1.5% | 0.090 | -3.8% | yes |
| PR-2445 | mixed_document | 128 | 1.443 | 1.428 | -1.1% | 1.772 | -19.4% | yes |
| PR-2445 | quoted_fences | 1024 | 2.214 | 1.910 | -13.7% | 2.448 | -22.0% | yes |
| PR-2445 | verse_definitions | 1024 | 6.937 | 5.506 | -20.6% | 6.288 | -12.4% | yes |
| PR-2445 | verse_equivalent | 1024 | 7.928 | 6.037 | -23.8% | 6.572 | -8.1% | yes |
| PR-2445 | paragraphs | 1024 | 0.699 | 0.726 | +3.9% | 0.712 | +1.9% | yes |
| PR-2445 | mixed_document | 1024 | 26.607 | 25.718 | -3.3% | 27.273 | -5.7% | yes |

## php

Runtime: 8.5.11. Latest tag: 0.1.10.

![php history](engine-history-php.svg)

| Revision | Commit |
|---|---|
| 0.1.7 | `9fd773b229d4d63b8b468b87b122943d563c80dc` |
| 0.1.8 | `93409af08040344221ff0d2d2d40351c8105e413` |
| 0.1.9 | `d4b53388df891158c9c868177a4213a5e8b2f608` |
| 0.1.10 | `6d94607eaa9d51c9ed782342161beca77b05aaf9` |
| dev-main | `de9b7ea63c3d079920923f7b3516d2bab1eff516` |
| PR-2815 | `bacc8a128e0575af8791722ac41e8164b667010f` |

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag |
|---|---|---:|---:|---:|---:|---:|---:|:---:|
| dev-main | quoted_fences | 128 | 1.254 | 1.395 | +11.3% | 1.395 | +0.0% | yes |
| dev-main | verse_definitions | 128 | 15.600 | 3.699 | -76.3% | 3.699 | +0.0% | yes |
| dev-main | verse_equivalent | 128 | 21.521 | 3.973 | -81.5% | 3.973 | +0.0% | yes |
| dev-main | paragraphs | 128 | 0.308 | 0.307 | -0.3% | 0.307 | +0.0% | yes |
| dev-main | mixed_document | 128 | 3.602 | 3.461 | -3.9% | 3.461 | +0.0% | yes |
| dev-main | quoted_false_mixed_closer | 128 | 1.165 | 1.439 | +23.5% | 1.439 | +0.0% | yes |
| dev-main | quoted_indented_closer | 128 | 1.169 | 1.424 | +21.8% | 1.424 | +0.0% | yes |
| dev-main | html_table | 128 | 79.032 | 48.489 | -38.6% | 48.489 | +0.0% | yes |
| dev-main | html_definition_list | 128 | 38.034 | 28.706 | -24.5% | 28.706 | +0.0% | yes |
| dev-main | quoted_fences | 1024 | 8.445 | 10.268 | +21.6% | 10.268 | +0.0% | yes |
| dev-main | verse_definitions | 1024 | 728.829 | 31.092 | -95.7% | 31.092 | +0.0% | yes |
| dev-main | verse_equivalent | 1024 | 1064.620 | 31.730 | -97.0% | 31.730 | +0.0% | yes |
| dev-main | paragraphs | 1024 | 2.383 | 2.357 | -1.1% | 2.357 | +0.0% | yes |
| dev-main | mixed_document | 1024 | 485.291 | 492.559 | +1.5% | 492.559 | +0.0% | yes |
| dev-main | quoted_false_mixed_closer | 1024 | 8.327 | 10.877 | +30.6% | 10.877 | +0.0% | yes |
| dev-main | quoted_indented_closer | 1024 | 8.333 | 10.554 | +26.7% | 10.554 | +0.0% | yes |
| dev-main | html_table | 1024 | 1305.128 | 510.152 | -60.9% | 510.152 | +0.0% | yes |
| dev-main | html_definition_list | 1024 | 962.252 | 842.552 | -12.4% | 842.552 | +0.0% | yes |
| PR-2815 | quoted_fences | 128 | 1.254 | 1.383 | +10.3% | 1.395 | -0.9% | yes |
| PR-2815 | verse_definitions | 128 | 15.600 | 3.707 | -76.2% | 3.699 | +0.2% | yes |
| PR-2815 | verse_equivalent | 128 | 21.521 | 3.952 | -81.6% | 3.973 | -0.5% | yes |
| PR-2815 | paragraphs | 128 | 0.308 | 0.299 | -2.8% | 0.307 | -2.4% | yes |
| PR-2815 | mixed_document | 128 | 3.602 | 3.542 | -1.7% | 3.461 | +2.3% | yes |
| PR-2815 | quoted_false_mixed_closer | 128 | 1.165 | 1.411 | +21.2% | 1.439 | -1.9% | yes |
| PR-2815 | quoted_indented_closer | 128 | 1.169 | 1.443 | +23.5% | 1.424 | +1.4% | yes |
| PR-2815 | html_table | 128 | 79.032 | 47.780 | -39.5% | 48.489 | -1.5% | yes |
| PR-2815 | html_definition_list | 128 | 38.034 | 28.342 | -25.5% | 28.706 | -1.3% | yes |
| PR-2815 | quoted_fences | 1024 | 8.445 | 10.569 | +25.1% | 10.268 | +2.9% | yes |
| PR-2815 | verse_definitions | 1024 | 728.829 | 30.512 | -95.8% | 31.092 | -1.9% | yes |
| PR-2815 | verse_equivalent | 1024 | 1064.620 | 31.379 | -97.1% | 31.730 | -1.1% | yes |
| PR-2815 | paragraphs | 1024 | 2.383 | 2.399 | +0.7% | 2.357 | +1.8% | yes |
| PR-2815 | mixed_document | 1024 | 485.291 | 476.209 | -1.9% | 492.559 | -3.3% | yes |
| PR-2815 | quoted_false_mixed_closer | 1024 | 8.327 | 10.564 | +26.9% | 10.877 | -2.9% | yes |
| PR-2815 | quoted_indented_closer | 1024 | 8.333 | 11.483 | +37.8% | 10.554 | +8.8% | yes |
| PR-2815 | html_table | 1024 | 1305.128 | 502.802 | -61.5% | 510.152 | -1.4% | yes |
| PR-2815 | html_definition_list | 1024 | 962.252 | 838.838 | -12.8% | 842.552 | -0.4% | yes |

## rs

Runtime: rustc 1.97.1 (8bab26f4f 2026-07-14). Latest tag: 0.1.7.

![rs history](engine-history-rs.svg)

| Revision | Commit |
|---|---|
| 0.1.4 | `2e9c43f22c5ed05dbd93323ae6b9c94bb867b285` |
| 0.1.5 | `56cb353657375e1a85965d5fcf00a234831d82c6` |
| 0.1.6 | `d7837249c64b88879b04cd71b8b5555ff246e16f` |
| 0.1.7 | `9f3f334c7d5c91c57e4e6269b32599af1062fdde` |
| dev-main | `b4d0be3f0b76bfc0ebc50c7ca5205461ed0ed550` |
| PR-2258 | `b3fd9aafccad03dd217cfe4a705e72f8249d0ebe` |

| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag |
|---|---|---:|---:|---:|---:|---:|---:|:---:|
| dev-main | quoted_fences | 128 | 0.094 | 0.080 | -14.4% | 0.080 | +0.0% | yes |
| dev-main | verse_definitions | 128 | 0.169 | 0.154 | n/a: different output | 0.154 | +0.0% | no |
| dev-main | verse_equivalent | 128 | 0.187 | 0.184 | -1.9% | 0.184 | +0.0% | yes |
| dev-main | paragraphs | 128 | 0.024 | 0.024 | -1.1% | 0.024 | +0.0% | yes |
| dev-main | mixed_document | 128 | 0.279 | 0.274 | -1.8% | 0.274 | +0.0% | yes |
| dev-main | quoted_fences | 1024 | 2.061 | 0.693 | -66.4% | 0.693 | +0.0% | yes |
| dev-main | verse_definitions | 1024 | 1.676 | 1.004 | n/a: different output | 1.004 | +0.0% | no |
| dev-main | verse_equivalent | 1024 | 1.648 | 1.616 | -1.9% | 1.616 | +0.0% | yes |
| dev-main | paragraphs | 1024 | 0.197 | 0.192 | -2.3% | 0.192 | +0.0% | yes |
| dev-main | mixed_document | 1024 | 2.400 | 2.359 | -1.7% | 2.359 | +0.0% | yes |
| PR-2258 | quoted_fences | 128 | 0.094 | 0.079 | -15.9% | 0.080 | -1.7% | yes |
| PR-2258 | verse_definitions | 128 | 0.169 | 0.154 | n/a: different output | 0.154 | -0.0% | no |
| PR-2258 | verse_equivalent | 128 | 0.187 | 0.186 | -0.9% | 0.184 | +1.0% | yes |
| PR-2258 | paragraphs | 128 | 0.024 | 0.024 | -1.6% | 0.024 | -0.5% | yes |
| PR-2258 | mixed_document | 128 | 0.279 | 0.278 | -0.4% | 0.274 | +1.3% | yes |
| PR-2258 | quoted_fences | 1024 | 2.061 | 0.728 | -64.7% | 0.693 | +5.1% | yes |
| PR-2258 | verse_definitions | 1024 | 1.676 | 1.003 | n/a: different output | 1.004 | -0.1% | no |
| PR-2258 | verse_equivalent | 1024 | 1.648 | 1.588 | -3.6% | 1.616 | -1.7% | yes |
| PR-2258 | paragraphs | 1024 | 0.197 | 0.189 | -4.0% | 0.192 | -1.8% | yes |
| PR-2258 | mixed_document | 1024 | 2.400 | 2.364 | -1.5% | 2.359 | +0.2% | yes |

