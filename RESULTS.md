# Benchmark results

Parse + render to HTML, in-process, averaged over many iterations. Lower
ms/op and higher MB/s are better. `rel` is relative to the fastest engine for
that document (1.00x = fastest). Numbers are machine-specific - run it yourself
with `node run.mjs`; see README for setup.

**Methodology:** measured with `opcache.enable_cli=1` + `opcache.jit=tracing` and
NO coverage/debug extension loaded (pcov absent, confirmed via `php -m`); PHP
`jit=true` was verified in each run's JSON output. Previous numbers were polluted
by pcov which disables JIT and inflated PHP timings by ~3-6x.

**Machine:** Linux x86\_64 - PHP 8.5.7 (NTS) - Node.js v22.22.2 - Rust/carve-rs 0.1.0

## small (1.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 0.6444 | 1.87 | 4.80x |
| carve-php | 1.1865 | 1.01 | 8.84x |
| carve-rs | 0.1342 | 8.96 | 1.00x |

## medium (12.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 9.7625 | 1.26 | 6.41x |
| carve-php | 10.0969 | 1.22 | 6.63x |
| carve-rs | 1.5233 | 8.06 | 1.00x |

## large (100.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 72.3597 | 1.36 | 5.53x |
| carve-php | 98.4652 | 1.00 | 7.53x |
| carve-rs | 13.0814 | 7.51 | 1.00x |
