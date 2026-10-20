# Structured document conversion (AST)

Measured 2026-10-20. Three public documentation files from [Carve a91beafced](https://github.com/markup-carve/carve/tree/a91beafced99d738e5eee950b9ac1615983add5b/docs) were converted once with `markdownToCarve` from [carve-js fa7b5b2c5e](https://github.com/markup-carve/carve-js/tree/fa7b5b2c5e00bca882ba48d33ffdff65a11c1319). The committed fixtures preserve the prose, examples, links, and document structure. They are examples of real documentation, not a sample of all Carve files.

The pinned JavaScript and PHP probes call the direct renderers used by their default APIs. Rust's pinned default guard rejects the `:::` marker in each fixture. Thus all three default APIs used full parse (AST). The same fixture bytes went to all three engines. [Output controls](realistic-output-control.json) found byte-identical JavaScript and Rust HTML; PHP added one final newline to each. Timed output hashes matched those controls and stayed stable across rounds; PHP worker hashes use PHP serialization. Compare these times within a document. The [chart](../charts/realistic-full-parse.svg) uses a logarithmic axis.

| Document | Size | JavaScript ms/op | PHP ms/op | Rust ms/op |
|---|---:|---:|---:|---:|
| guide | 4.9 KiB | 2.57 | 4.92 | 0.170 |
| migration | 21.4 KiB | 8.49 | 16.99 | 1.10 |
| contract | 96.2 KiB | 42.12 | 122.11 | 12.07 |

4 rotating rounds used 11 warmed in-process samples per engine and document, on Linux-7.0.0-38-generic-x86_64-with-glibc2.39 with CPU affinity 14. PHP CLI opcache and JIT were off; Rust used a release build. Process startup was excluded. Round median ranges are below because shared-host activity moved some timings. The [raw samples](realistic-engine.json), [fixture provenance](../corpus/realistic/provenance.json), and [runner](../scripts/realistic/run.py) show the inputs and exact sources.

| Document | Engine | Round median range, ms/op |
|---|---|---:|
| guide | JavaScript | 2.30–3.04 |
| guide | PHP | 4.49–5.30 |
| guide | Rust | 0.160–0.196 |
| migration | JavaScript | 7.77–9.11 |
| migration | PHP | 16.50–17.43 |
| migration | Rust | 1.06–1.16 |
| contract | JavaScript | 34.63–46.27 |
| contract | PHP | 104.68–134.60 |
| contract | Rust | 11.25–13.59 |

Engine commits: JavaScript `9c5e7d7bb23407695a5396b23097b075a72100bf`, PHP `ca71bd493fe92b293f8917e338c169d5a5caf8af`, Rust `ff20aaf9a577d8c1f7209f6d32de3e0707c49796`.
