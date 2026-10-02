# JavaScript core comparison including commonmark.js

The comparison runs Carve JS, Djot, markdown-it and commonmark.js 0.31.2 on
150 equivalent sections in each library's native syntax. Commonmark.js has no
pipe-table extension, so this workload excludes tables. It exercises 14 of the
[table-capable comparison's](../COMPARISON.md) 18 points: the three grid points
and one alignment point are absent. Keep throughput from these workloads separate.

Before timing, the runner checks projected HTML across all four libraries.
It ignores section wrappers, generated IDs and list paragraph wrappers, and
normalizes whitespace outside code. Inline word boundaries, element hierarchy,
strong versus emphasis, link destinations, code language and code bytes remain
part of the check. This verifies the shared workload; it is not general
language conformance.

Commonmark.js reuses its parser and HTML renderer in the primary comparison.
A separate control constructs both per conversion, investigating the concern in
[djot.js #13](https://github.com/jgm/djot.js/issues/13). markdown-it reuses its
instance; Carve and Djot use their public conversion functions.

## Run

```sh
cd engines/js
npm ci
cd ../..
node scripts/compare-commonmark.mjs
node scripts/gen-charts.mjs
```

The runner fetches the benchmark repository's main before recording its base.
It verifies locked and installed packages, rejects a Carve checkout override,
warms 200 conversions and records seven trials of 200 calls per worker. Two
serial fresh-worker rounds reverse engine order. Startup and output checks are
outside timing; each round reports its best trial and retains all samples.

A run replaces this guide with its generated report and writes
`reports/commonmark-js.json`. Chart generation then writes
`charts/commonmark-js.svg`. The raw record includes source/output hashes,
projection controls, package versions, harness hashes, hardware, runtime,
measurement time and host load.

## Published measurements

No qualified timing snapshot is published yet. Samples collected while adding
this comparison remain local because host activity varied. Run on an idle host
and review both rounds before committing generated measurements, following the
repository's publication policy. CI verifies workload equivalence and fixture
drift and smoke-runs commonmark.js; it does not publish CI timings.
