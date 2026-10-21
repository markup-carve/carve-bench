# Structured document conversion (AST)

Measured 2026-10-21. Three public documentation files from [Carve a91beafced](https://github.com/markup-carve/carve/tree/a91beafced99d738e5eee950b9ac1615983add5b/docs) were converted once with `markdownToCarve` from [carve-js fa7b5b2c5e](https://github.com/markup-carve/carve-js/tree/fa7b5b2c5e00bca882ba48d33ffdff65a11c1319). The committed fixtures preserve the prose, examples, links, and document structure. They are examples of real documentation, not a sample of all Carve files.

The pinned JavaScript and PHP probes call the direct renderers used by their default APIs. Rust's pinned default guard rejects the `:::` marker in each fixture. Thus all three default APIs used full parse (AST). The same fixture bytes went to all three engines. [Output controls](realistic-output-control.json) found byte-identical JavaScript and Rust HTML; PHP added one final newline to each. Timed output hashes matched those controls and stayed stable across rounds; PHP worker hashes use PHP serialization. Compare these times within a document. The [chart](../charts/realistic-full-parse.svg) uses a logarithmic axis.

| Document | Size | JavaScript CPU ms/op | PHP CPU ms/op | Rust CPU ms/op |
|---|---:|---:|---:|---:|
| guide | 4.9 KiB | 5.57 | 7.75 | 0.365 |
| migration | 21.4 KiB | 15.98 | 28.34 | 1.87 |
| contract | 96.2 KiB | 84.66 | 222.70 | 21.23 |

This is a fresh measurement on a shared host. Compare libraries within this run; changes from earlier reports are not controlled before/after results.

4 rotating rounds used 11 in-process samples per engine and document, on Linux-7.0.0-38-generic-x86_64-with-glibc2.39 with CPU affinity 14. JavaScript warmed for at least 20 calls and 500 ms; PHP warmed for 5 calls and Rust for 20. PHP used a clean CLI configuration with ctype and mbstring, without opcache or JIT; Rust used a release build. Process startup was excluded. The chart uses process CPU time to reduce host scheduling noise. JavaScript CPU time includes all Node process threads. Elapsed wall times and round variation remain in the [raw samples](realistic-engine.json). [Fixture provenance](../corpus/realistic/provenance.json) and the [runner](../scripts/realistic/run.py) show the inputs and exact sources.

| Document | Engine | Round median range, CPU ms/op |
|---|---|---:|
| guide | JavaScript | 3.59–7.44 |
| guide | PHP | 6.41–8.15 |
| guide | Rust | 0.261–0.422 |
| migration | JavaScript | 12.30–18.04 |
| migration | PHP | 22.69–35.82 |
| migration | Rust | 1.55–1.91 |
| contract | JavaScript | 69.93–101.84 |
| contract | PHP | 213.38–225.84 |
| contract | Rust | 20.21–21.52 |

Engine commits: JavaScript `34ba9eeb0b41aaeefef2a012821462dde3f27395`, PHP `718ec77130875b12fd1ba11a79a473d656e5e992`, Rust `d162d5452805cec2b222d0480b206d7b18c7a421`.
