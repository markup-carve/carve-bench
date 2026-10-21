# Rust core ranking recheck, 21 October 2026

The published [core snapshot](dev-main-core.md) puts pulldown-cmark at 84.63 MB/s and carve-rs at 66.45 MB/s. That run started at a one-minute host load of 46.54 on a 16-logical-CPU machine. Its two serial rounds used reversed engine order and showed substantial timing movement.

I repeated only those two Rust rows with the exact comparison binary recorded in the snapshot, the same pinned carve-rs commit (`47fdd7e4`), and the same fixture files. Eight rounds alternated engine order on CPU 12. Each worker warmed for 20 conversions, then measured seven batches of 200 conversions. The input and output hashes matched the published controls. Process CPU time excludes startup and reduces scheduler effects.

| Engine | Pooled median CPU ms/op | Round medians won |
|---|---:|---:|
| carve-rs | 0.716 | 6 of 8 |
| pulldown-cmark | 0.866 | 2 of 8 |

Carve used about 17% less CPU per conversion in this recheck. The rounds still varied, and the libraries render equivalent core content from different native markup and produce different HTML bytes. The published second-place position is a snapshot under heavy contention, not evidence of a repeatable Rust regression. This recheck does not compare Rust commits; it tests the ranking at the published commit. [Raw rounds, source hashes, output hashes, and binary identity](rust-core-recheck-20261021.json) are available for inspection.
