# Structured document conversion (AST)

Measured 2026-10-21. Three public documentation files from [Carve a91beafced](https://github.com/markup-carve/carve/tree/a91beafced99d738e5eee950b9ac1615983add5b/docs) were converted once with `markdownToCarve` from [carve-js fa7b5b2c5e](https://github.com/markup-carve/carve-js/tree/fa7b5b2c5e00bca882ba48d33ffdff65a11c1319). The committed fixtures preserve the prose, examples, links, and document structure. They are examples of real documentation, not a sample of all Carve files.

The pinned JavaScript and PHP probes call the direct renderers used by their default APIs. Rust's pinned default guard rejects the `:::` marker in each fixture. Thus all three default APIs used full parse (AST). The same fixture bytes went to all three engines. [Output controls](realistic-output-control.json) found byte-identical JavaScript and Rust HTML; PHP added one final newline to each. Timed output hashes matched those controls and stayed stable across rounds; PHP worker hashes use PHP serialization. Compare these times within a document. The [chart](../charts/realistic-full-parse.svg) uses a logarithmic axis.

| Document | Size | JavaScript CPU ms/op | PHP CPU ms/op | Rust CPU ms/op |
|---|---:|---:|---:|---:|
| guide | 4.9 KiB | 3.01 | 4.01 | 0.191 |
| migration | 21.4 KiB | 10.97 | 16.83 | 1.41 |
| contract | 96.2 KiB | 62.61 | 108.90 | 13.18 |

This is a fresh measurement on a shared host. Compare libraries within this run; changes from earlier reports are not controlled before/after results.

4 rotating rounds used 11 in-process samples per engine and document, on Linux-7.0.0-38-generic-x86_64-with-glibc2.39 with CPU affinity 12. JavaScript warmed for at least 20 calls and 500 ms; PHP and Rust warmed for 20 calls. PHP used a clean CLI configuration with ctype, mbstring, and tracing JIT; Rust used a release build. Process startup was excluded. The chart uses process CPU time to reduce host scheduling noise. JavaScript CPU time includes all Node process threads. Elapsed wall times and round variation remain in the [raw samples](realistic-engine.json). [Fixture provenance](../corpus/realistic/provenance.json) and the [runner](../scripts/realistic/run.py) show the inputs and exact sources.

| Document | Engine | Round median range, CPU ms/op |
|---|---|---:|
| guide | JavaScript | 1.94–3.11 |
| guide | PHP | 3.66–5.40 |
| guide | Rust | 0.184–0.355 |
| migration | JavaScript | 7.48–12.53 |
| migration | PHP | 11.85–18.45 |
| migration | Rust | 1.18–1.76 |
| contract | JavaScript | 51.76–84.63 |
| contract | PHP | 90.99–142.51 |
| contract | Rust | 12.71–18.98 |

Engine commits: JavaScript `2ce388c2897f2a93e13de8832b3d1c3a5788735c`, PHP `2a7a38145ae88e8dce294b924e937537b4a69399`, Rust `47fdd7e487fc793133cf6af8396f653975454dd9`.
