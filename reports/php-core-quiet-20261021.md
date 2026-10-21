# PHP direct HTML lower-load recheck

Measured 21 October 2026 on CPU 12 with PHP 8.5 tracing JIT. The Carve row uses merged [carve-php `760df44b`](https://github.com/markup-carve/carve-php/commit/760df44b19013a6b1ae07f7a2cb71da08da84d0c); Djot uses the locked `77e5b6c` revision. Both use the pinned 150-section core input in native syntax and accept their borrowed HTML routes. Source and output hashes match the published controls.

| Session | Round-start load | Carve CPU ms/op | Djot CPU ms/op | Median paired Carve/Djot CPU | Carve faster rounds |
|---|---:|---:|---:|---:|---:|
| Archived A | 6.93–8.11 | 3.613 | 3.514 | 1.027 | 6/16 |
| New A | 6.88–7.99 | 3.234 | 3.206 | 0.991 | 9/16 |
| Combined | 6.88–8.11 | 3.391 | 3.405 | 1.010 | 15/32 |

The pooled medians yield 17.62 MB/s for Carve and 17.58 MB/s for Djot. The 0.04 MB/s chart lead is too small to establish a stable ordering: Carve used less CPU in 15 of 32 rounds, and the median paired CPU ratio slightly favors Djot. The paired ratio uses each round's median CPU time and can differ from the ratio of pooled medians. The inputs also differ slightly in byte count.

Each session alternated worker order for 16 rounds. Each worker warmed for 30 conversions, then measured five batches of 60 conversions using process user plus system CPU time; startup was excluded. The sessions used different clean benchmark commits, but the worker, runner, snapshot, PHP engine, locked Djot revision, and input/output hashes match. The [combined record](php-core-quiet-20261021.json) links its [archived session](php-core-recheck-runs/20261021-a.json) and [new session](php-core-quiet-runs/20261021-lower-a.json) by SHA-256.

The [earlier 32-round recheck](php-core-recheck-20261021.md) included a second session whose round-start load reached 19.72. That session remains published but is not used for the displayed lower-load PHP pair. This recheck changes the chart's absolute PHP values and removes the apparent 10% gap; it does not show that either library consistently leads.
