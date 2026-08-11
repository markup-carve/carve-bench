# Benchmark results

Parse + render to HTML, in-process, averaged over many iterations. Lower
ms/op and higher MB/s are better. `rel` is relative to the fastest engine for
that document (1.00x = fastest). Numbers are machine-specific - run it yourself
with `node run.mjs`; see README for setup.

**Methodology:** measured with `opcache.enable_cli=1` and tracing JIT. The PHP
scan directory omitted PCOV entirely, and every PHP result reported `jit=true`.
The before/after comparison used the same regenerated 0.2 corpus and isolated
release builds on the same machine.

**Machine:** Linux x86_64 — PHP 8.5.9 (NTS) — Node.js v22.22.2 — Rust release

## small (1.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 1.2746 | 0.92 | 4.70x |
| carve-php | 2.5953 | 0.45 | 9.57x |
| carve-rs | 0.2711 | 4.34 | 1.00x |

## medium (28.5 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 37.9659 | 0.73 | 3.74x |
| carve-php | 134.0451 | 0.21 | 13.20x |
| carve-rs | 10.1511 | 2.74 | 1.00x |

## large (228.0 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 745.7208 | 0.30 | 5.99x |
| carve-php | 1626.2902 | 0.14 | 13.07x |
| carve-rs | 124.4569 | 1.79 | 1.00x |
