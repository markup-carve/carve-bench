# Benchmark results

Parse + render to HTML, in-process, averaged over many iterations. Lower
ms/op and higher MB/s are better. `rel` is relative to the fastest engine for
that document (1.00x = fastest). Numbers are machine-specific - run it yourself
with `node run.mjs`; see README for setup.

**Run:** 2026-08-20 on Linux 7.0 x86_64, AMD Ryzen 9 PRO 7940HS (8C/16T), Node.js 22.22.2, PHP 8.5.9 NTS tracing JIT, rustc 1.97.1. The run was pinned to logical CPU 15.

**Engine heads:** carve-js `e4ca018b`, carve-php `3592b1e2`, carve-rs `52c9fe35`.

**Corpus snapshot:** carve `d909dcf0` (1,325 documents).

![Bar chart of Carve engine throughput for each corpus size](./charts/full-corpus.svg)

## small (1.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 1.4769 | 0.80 | 11.62x |
| carve-php | 1.9068 | 0.62 | 15.00x |
| carve-rs | 0.1271 | 9.25 | 1.00x |

## medium (40.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 54.2456 | 0.72 | 5.47x |
| carve-php | 179.1832 | 0.22 | 18.07x |
| carve-rs | 9.9180 | 3.96 | 1.00x |

## large (321.4 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 461.1391 | 0.68 | 5.80x |
| carve-php | 1848.9070 | 0.17 | 23.25x |
| carve-rs | 79.5384 | 3.95 | 1.00x |
