# Second Rust core ranking recheck, 21 October 2026

The [published direct-conversion chart](dev-main-core.md) puts pulldown-cmark ahead of carve-rs. The [first recheck](rust-core-recheck-20261021.md) reversed that order in six of eight paired rounds. I ran the same pair again to see whether that result repeated.

This run used the same Rust comparison binary (`1279ea0cabe1ea59b137c3f6c71cee610d0e04df78f4ddbf56d5087dbf1d992b`), pinned carve-rs commit (`47fdd7e487fc793133cf6af8396f653975454dd9`), and fixture hashes as the published chart. Each worker was pinned to CPU 12, warmed for 20 conversions, then measured seven batches of 200 conversions. Engine order alternated across 24 rounds. Each output hash matched the published control.

| Engine | Pooled median process CPU ms/op | Pooled median wall ms/op | Faster round medians |
|---|---:|---:|---:|
| carve-rs | 0.539 | 0.539 | 22 of 24 |
| pulldown-cmark | 0.605 | 0.605 | 2 of 24 |

Carve used about 11% less process CPU time per conversion in this run. One-minute host load ranged from 19.25 to 31.01 on a 16-logical-CPU machine, and early rounds were slower for both libraries. The paired order helps compare them within this session, but it does not make the host quiet. These libraries render equivalent core content from different native markup and produce different HTML bytes. The result does not compare Rust commits or establish a speed change in carve-rs.

[Raw rounds](rust-core-recheck-20261021-rerun.json) retain every wall and CPU sample, run order, host load, fixture and output hashes, and binary identity. The published chart remains the original two-round wall-time snapshot; this report measures the two Rust rows again using process CPU time.
