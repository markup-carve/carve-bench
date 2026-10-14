# Rust core ranking check

This check compares Carve and pulldown in both retained Rust builds. Inputs match the core chart fixtures and their recorded output controls. They contain equivalent structured content using each syntax, with different byte counts. Throughput uses each input's own size, as the chart does.

Measured 2026-10-14T11:49:20Z to 2026-10-14T11:56:35Z; CPU affinity `[13]`. This rerun repeats the 2026-10-06 builds against the benchmark's current dependency locks. Host load changed from `[29.58, 34.76, 25.92]` to `[28.93, 40.47, 32.97]`, far above the host's 16 CPUs, so per-round gaps swing widely and the ranking below is not a stable reading.

Eight serial rounds reverse all four lane positions on alternating rounds. Each process warms up twenty conversions, then measures three trials of 3,000 conversions. Both builds use the same peer dependency lock. Binary, worker, fixture and build-manifest hashes are checked. The build manifest retains compiler settings.

| Build | carve-rs MB/s | pulldown MB/s | Median per-round Carve gap | Per-round gap range |
|---|---:|---:|---:|---|
| before | 69.42 | 60.94 | +13.1% | -23.2% to +36.0% |
| after | 62.68 | 58.81 | -2.9% | -52.9% to +1417.5% |

The throughput columns use pooled sample medians. The gap column uses the median of eight per-round throughput ratios; it can differ from the ratio of the pooled columns. Positive gaps mean Carve leads. The full range shows variation, not a confidence interval. Shared-host timings do not establish statistical significance or attribute a difference to code.

Before Carve commit: `ae44de38b6ecf468212cac117f83158f7c3988c2`. After Carve commit: `5b7bea1ada2a507867d62278145fd7f9fd3f000d`.

The [pre-audit snapshot](dev-main-core-pre-audit-20261006.md) had a 0.21% Carve lead (129.12 versus 128.85 MB/s). The [interim audit snapshot](dev-main-core-audit-20261006.md) had Carve 3.8% behind (115.65 versus 120.17 MB/s). Those sessions used CPU 13 and CPU 6 respectively. This check keeps CPU settings within a session and includes pulldown in each build, but does not make the historical chart sessions interchangeable.

[Raw samples and provenance](rust-core-ranking.json). [Build method](paired-full-feature.md).

To reproduce after retaining the paired build artifacts:

```sh
taskset -c CPU python3 scripts/check-rust-core-ranking.py --rust-binaries ARTIFACT_DIRECTORY --core-controls reports/dev-main-core-audit-20261006.json
python3 scripts/public_report.py reports/rust-core-ranking.json
```

Keep the original raw file locally before export. Both output and checkpoint paths must be fresh. The recorded benchmark commit predates these diagnostic files; their measured bytes are identified separately by producer and control-report hashes.
