# Structured document conversion (AST)

Measured 2026-10-20. Three public documentation files from [Carve a91beafced](https://github.com/markup-carve/carve/tree/a91beafced99d738e5eee950b9ac1615983add5b/docs) were converted once with `markdownToCarve` from [carve-js fa7b5b2c5e](https://github.com/markup-carve/carve-js/tree/fa7b5b2c5e00bca882ba48d33ffdff65a11c1319). The committed fixtures preserve the prose, examples, links, and document structure. They are examples of real documentation, not a sample of all Carve files.

The pinned JavaScript and PHP probes call the direct renderers used by their default APIs. Rust's pinned default guard rejects the `:::` marker in each fixture. Thus all three default APIs used full parse (AST). The same fixture bytes went to all three engines. [Output controls](realistic-output-control.json) found byte-identical JavaScript and Rust HTML; PHP added one final newline to each. Timed output hashes matched those controls and stayed stable across rounds; PHP worker hashes use PHP serialization. Compare these times within a document. The [chart](../charts/realistic-full-parse.svg) uses a logarithmic axis.

| Document | Size | JavaScript ms/op | PHP ms/op | Rust ms/op |
|---|---:|---:|---:|---:|
| guide | 4.9 KiB | 1.42 | 3.73 | 0.148 |
| migration | 21.4 KiB | 7.67 | 13.89 | 0.923 |
| contract | 96.2 KiB | 28.70 | 87.11 | 8.94 |

4 rotating rounds used 11 warmed in-process samples per engine and document, on Linux-7.0.0-38-generic-x86_64-with-glibc2.39 with CPU affinity 14. PHP CLI opcache and JIT were off; Rust used a release build. Process startup was excluded. Round median ranges are below because shared-host activity moved some timings. The [raw samples](realistic-engine.json), [fixture provenance](../corpus/realistic/provenance.json), and [runner](../scripts/realistic/run.py) show the inputs and exact sources.

| Document | Engine | Round median range, ms/op |
|---|---|---:|
| guide | JavaScript | 1.35–2.12 |
| guide | PHP | 3.51–3.82 |
| guide | Rust | 0.139–0.180 |
| migration | JavaScript | 7.38–9.33 |
| migration | PHP | 12.26–15.80 |
| migration | Rust | 0.881–0.975 |
| contract | JavaScript | 25.69–53.06 |
| contract | PHP | 81.90–94.22 |
| contract | Rust | 8.37–11.44 |

Engine commits: JavaScript `11d44740af97baf1acf4967e2415ec6377643d8e`, PHP `ee152759198a90683b9ab717e20e2b83c6033966`, Rust `df74271a43afd4e51b8545592bdf6fb0232b6fe2`.
