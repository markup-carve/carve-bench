# PHP direct HTML comparison after the merged renderer change

Measured 21 October 2026. The Carve row uses merged [carve-php `760df44b`](https://github.com/markup-carve/carve-php/commit/760df44b19013a6b1ae07f7a2cb71da08da84d0c). The Djot row uses the locked `php-collective/djot` revision `77e5b6c`. Both use the pinned 150-section core input in their native syntax. Both converters take their borrowed HTML route on these inputs. Source and output hashes match the published core controls.

| Session | Carve CPU ms/op | Djot CPU ms/op | Median paired Carve/Djot CPU | Carve faster rounds |
|---|---:|---:|---:|---:|
| A | 3.613 | 3.514 | 1.027 | 6/16 |
| B | 6.921 | 5.953 | 1.060 | 4/16 |
| Combined | 4.155 | 3.765 | 1.032 | 10/32 |

The pooled medians give 14.38 MB/s for Carve and 15.90 MB/s for Djot. Their input sizes differ slightly. The paired ratio uses each round's median CPU time; it can differ from the ratio of pooled medians. The 32 round ratios span 0.737 to 1.832. Djot was ahead in both sessions, but the size of the gap varies with host load.

Each session rotated worker order for 16 rounds on CPU 12. Each PHP 8.5 tracing-JIT worker warmed for 30 conversions, then measured five batches of 60 conversions using process user plus system CPU time. Startup was excluded. One-minute host load at round starts ranged from 6.92 to 19.72. Another CPU-heavy process overlapped session B and raised both engines' absolute times. The combined throughput values include that session; compare the paired ratios and the separate session rows before treating them as a stable speed ranking. The benchmark checkout was clean at committed harness `f4f0a25`; the raw records include its SHA and both worker and runner hashes. The [combined record](php-core-recheck-20261021.json), [session A](php-core-recheck-runs/20261021-a.json), and [session B](php-core-recheck-runs/20261021-b.json) retain every sample and hash. Run `taskset -c 12 python3 scripts/php-core-recheck.py --carve-php PATH --output PATH` to collect a new session, then `python3 scripts/php-core-aggregate.py` to combine the two named sessions.

The earlier published PHP row used carve-php `2a7a3814` and two recorded rounds. [PR #3701](https://github.com/markup-carve/carve-php/pull/3701) reduced borrowed-route work. [The chart note added in benchmark PR #76](https://github.com/markup-carve/carve-bench/pull/76) explains the separate Djot route improvement that reversed the historical ranking.
