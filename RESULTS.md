# Benchmark results

Parse + render to HTML, in-process, averaged over many iterations. Lower
ms/op and higher MB/s are better. `rel` is relative to the fastest engine for
that document (1.00x = fastest). Numbers are machine-specific - run it yourself
with `node run.mjs`; see README for setup.

**Run:** 2026-08-19 on Linux 7.0 x86_64, AMD Ryzen 9 PRO 7940HS (8C/16T),
Node.js 22.22.2, PHP 8.5.9 NTS, rustc 1.97.1. PHP used CLI opcache with tracing
JIT, with pcov excluded, and reported `jit=true` for every document.

**Engine heads:** carve-js `c09af042`, carve-php `7d7eb1d`, carve-rs
`f753909f`. The corpus snapshot is from carve `d4e90cfd` (1,301 documents).

![Bar chart of Carve engine throughput for each corpus size](./charts/full-corpus.svg)

## small (1.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 0.9112 | 1.29 | 4.48x |
| carve-php | 1.2468 | 0.94 | 6.13x |
| carve-rs | 0.2034 | 5.78 | 1.00x |

## medium (40.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 33.7186 | 1.16 | 2.96x |
| carve-php | 165.8647 | 0.24 | 14.58x |
| carve-rs | 11.3785 | 3.45 | 1.00x |

## large (321.4 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 378.6352 | 0.83 | 3.12x |
| carve-php | 2097.8009 | 0.15 | 17.26x |
| carve-rs | 121.5318 | 2.58 | 1.00x |
