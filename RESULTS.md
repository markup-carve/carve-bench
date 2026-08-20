# Benchmark results

Parse + render to HTML, in-process, averaged over many iterations. Lower
ms/op and higher MB/s are better. `rel` is relative to the fastest engine for
that document (1.00x = fastest). Numbers are machine-specific - run it yourself
with `node run.mjs`; see README for setup.

**Run:** 2026-08-20 on Linux 7.0 x86_64, AMD Ryzen 9 PRO 7940HS (8C/16T),
Node.js 22.22.2, PHP 8.5.9 NTS, rustc 1.97.1. The run was pinned to one
logical CPU. PHP used a clean INI with CLI opcache and tracing JIT and reported
`jit=true` for every document.

**Engine heads:** carve-js `21876359`, carve-php `5325a97c`, carve-rs
`619f7d7f`.

**Corpus snapshot:** carve `d4e90cfd` (1,301 documents).

![Bar chart of Carve engine throughput for each corpus size](./charts/full-corpus.svg)

## small (1.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 1.0147 | 1.16 | 6.77x |
| carve-php | 1.1866 | 0.99 | 7.92x |
| carve-rs | 0.1499 | 7.85 | 1.00x |

## medium (40.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 41.1326 | 0.95 | 5.24x |
| carve-php | 149.9125 | 0.26 | 19.10x |
| carve-rs | 7.8486 | 5.00 | 1.00x |

## large (321.4 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 356.7034 | 0.88 | 4.31x |
| carve-php | 1577.9478 | 0.20 | 19.07x |
| carve-rs | 82.7357 | 3.79 | 1.00x |
