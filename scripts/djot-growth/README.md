# Djot import growth

These runners compare a released tag with a fixed merged-main commit. They time
raw Djot conversion and rendering of the converted text separately. Loss-report
traversal is excluded. The fixtures cover repeated labels, shared attributes,
nested containers, definition lists and quoted Unicode image labels.

Create a JSON configuration for each engine with `release`, `main` and `native`
entries. Both engine entries need `path`, `commit` and `revision`; use the release
tag as the release revision. Set `module` to `dist/index.js` for JavaScript,
`root` to the checkout path for PHP, or `binary` and `buildManifest` to retained
artifact paths for Rust. The Native entry needs its checkout `path`, exact
`commit` and `module` pointing to `lib/index.js` in the Djot.js checkout.

Install each checkout's locked dependencies first. The runners rebuild JavaScript
and Native Djot artifacts, verify PHP's loaded source and JIT state, and check
Rust's captured build manifest. Build Rust workers before measuring:

```sh
CARGO_TARGET_DIR=/var/tmp/cargo-shared/carve-bench \
  node scripts/djot-growth/build-rust.mjs rust-config.json
mkdir -p raw
taskset -c 13 node scripts/djot-growth/js.mjs js-config.json raw/carve-2962-final-growth-js.json
taskset -c 13 node scripts/djot-growth/php.mjs php-config.json raw/carve-2962-final-growth-php.json
taskset -c 13 node scripts/djot-growth/rs.mjs rust-config.json raw/carve-2962-final-growth-rs.json
```

Run these commands serially. Each point uses a 500 ms warmup per revision and
seven alternating sample pairs. Adaptive batches target 50 ms. JSON retains raw
samples, source and artifact hashes, output sizes, Native HTML checks and host
load. CPU affinity does not reserve a core.

`comparisonEligible` requires Native agreement, equivalent HTML and identical
converted text. Other rows retain timing observations but do not support a
like-for-like speedup claim. Deep container budget cases may fail Native
equivalence in both revisions. Optional `onlyFamilies` selects named fixtures.
Keep intermediate branch measurements local; publish only released tags and
verified merged-main snapshots.

Generate the report after all three runners finish, then remove local paths from the published records:

```sh
node scripts/djot-growth/report.mjs raw reports
python3 scripts/public_report.py reports/djot-growth-js.json reports/djot-growth-php.json reports/djot-growth-rs.json
```
