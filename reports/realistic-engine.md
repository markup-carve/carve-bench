# Structured document conversion (AST)

Measured 2026-10-20. Three public documentation files from [Carve a91beafced](https://github.com/markup-carve/carve/tree/a91beafced99d738e5eee950b9ac1615983add5b/docs) were converted once with `markdownToCarve` from [carve-js fa7b5b2c5e](https://github.com/markup-carve/carve-js/tree/fa7b5b2c5e00bca882ba48d33ffdff65a11c1319). The committed fixtures preserve the prose, examples, links, and document structure. They are examples of real documentation, not a sample of all Carve files.

The pinned JavaScript and PHP probes call the direct renderers used by their default APIs. Rust's pinned default guard rejects the `:::` marker in each fixture. Thus all three default APIs used full parse (AST). The same fixture bytes went to all three engines. [Output controls](realistic-output-control.json) found byte-identical JavaScript and Rust HTML; PHP added one final newline to each. Timed output hashes matched those controls and stayed stable across rounds; PHP worker hashes use PHP serialization. Compare these times within a document. The [chart](../charts/realistic-full-parse.svg) uses a logarithmic axis.

| Document | Size | JavaScript CPU ms/op | PHP CPU ms/op | Rust CPU ms/op |
|---|---:|---:|---:|---:|
| guide | 4.9 KiB | 2.77 | 4.34 | 0.190 |
| migration | 21.4 KiB | 10.16 | 15.34 | 1.10 |
| contract | 96.2 KiB | 35.27 | 106.00 | 11.36 |

4 rotating rounds used 11 in-process samples per engine and document, on Linux-7.0.0-38-generic-x86_64-with-glibc2.39 with CPU affinity 14. JavaScript warmed for at least 20 calls and 500 ms; PHP warmed for 5 calls and Rust for 20. PHP used a clean CLI configuration with ctype and mbstring, without opcache or JIT; Rust used a release build. Process startup was excluded. The chart uses process CPU time to reduce host scheduling noise. JavaScript CPU time includes all Node process threads. Elapsed wall times and round variation remain in the [raw samples](realistic-engine.json). [Fixture provenance](../corpus/realistic/provenance.json) and the [runner](../scripts/realistic/run.py) show the inputs and exact sources.

| Document | Engine | Round median range, CPU ms/op |
|---|---|---:|
| guide | JavaScript | 2.62–4.46 |
| guide | PHP | 4.01–4.88 |
| guide | Rust | 0.179–0.205 |
| migration | JavaScript | 8.61–10.72 |
| migration | PHP | 15.04–15.71 |
| migration | Rust | 1.06–1.16 |
| contract | JavaScript | 32.00–38.94 |
| contract | PHP | 97.99–111.98 |
| contract | Rust | 11.11–12.35 |

Engine commits: JavaScript `ccbbdcc983b01ffb9a53e4293bd63d0540325643`, PHP `8752b183da661c5fec5296657b56ddb7025a0f4c`, Rust `f95434c91c0faca54fb221281b82e999ecb7cf3c`.
