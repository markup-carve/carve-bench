# Benchmark results

Parse + render to HTML, in-process, averaged over many iterations. Lower
ms/op and higher MB/s are better. `rel` is relative to the fastest engine for
that document (1.00x = fastest). Numbers are machine-specific - run it yourself
with `node run.mjs`; see README for setup.

## small (1.2 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 1.2395 | 0.97 | 5.95x |
| carve-php | 6.9972 | 0.17 | 33.61x |
| carve-rs | 0.2082 | 5.78 | 1.00x |

## medium (12.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 21.6907 | 0.57 | 5.32x |
| carve-php | 53.7417 | 0.23 | 13.17x |
| carve-rs | 4.0794 | 3.01 | 1.00x |

## large (100.6 KB)

| Engine | ms/op | MB/s | rel |
|---|---:|---:|---:|
| carve-js | 123.7423 | 0.79 | 4.36x |
| carve-php | 392.5040 | 0.25 | 13.83x |
| carve-rs | 28.3746 | 3.46 | 1.00x |
