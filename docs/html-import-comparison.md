# HTML import comparison

This benchmark adds the Carve JS and Rust development engines to Botmonster's
[HTML to Markdown comparison](https://botmonster.com/coding/best-10-html-to-markdown-converters-in-2026/).
It uses the upstream ten-page corpus and 273 probes without changing their scorer.
These probes are a regression sample, not a general fidelity guarantee.

Both Carve adapters import HTML into an AST in safe mode and render Markdown from
that AST. Persistent workers include JSON IPC in each measured conversion. The
upstream adapters retain their own invocation models, including process startup
for CLI tools. Results describe these adapters, not isolated library throughput. Extractors retain
their upstream extraction settings. Carve preserves relative URLs; its import API
has no base-URL option. Upstream adapters that accept a base URL still receive it.

Build the Rust worker with its committed lockfile:

```sh
cargo build --release --locked --manifest-path engines/html-import-rs/Cargo.toml
```

Check out the upstream benchmark repository separately and install its Python,
Node, Go, htmd, and Pandoc dependencies. Put the intended CLI binaries first in
`PATH`; `html2markdown` also names an unrelated Python executable. Build carve-js
at the revision being measured with `npm ci && npm run build`.

```sh
python scripts/html-import-comparison.py \
  --upstream /path/to/upstream/html-to-markdown-converters \
  --js /path/to/carve-js/dist/index.js \
  --rs /path/to/carve-html-import-worker \
  --js-revision FULL_JS_COMMIT \
  --rs-revision FULL_RUST_COMMIT \
  --out /path/to/new-results-directory
```

The runner checks the JS label against a clean checkout and the Rust label against
the worker's embedded revision and lockfile. It refuses a changed upstream corpus
or scorer. The committed Rust manifest pins its engine revision. Provenance records executable and JS module hashes, the Rust
lockfile, runner, upstream source, fixtures, platform, and command. Compiler and tool versions
are recorded alongside raw timing samples, minimum, maximum, IQR, and coefficient
of variation. An empty-process baseline is recorded separately; it is not subtracted. Use `--fidelity-only` to run the
probes without making a timing claim.

The default timed run warms each adapter once per page, then records seven
repetitions in randomized adapter order. It checks output determinism and rejects
conversion errors, incomplete samples, unknown tool versions, and samples taken
above the load limit. The limit defaults to half the logical CPU count; it is a
screen for obvious contention, not proof of an idle host. Stop other local work
before timing. Failed runs retain diagnostics but produce no ranking.

Charts use total probes passed divided by 273. Timing charts use the sum of ten
per-page medians. Do not compare these times with numbers collected on another
machine or with the source-to-HTML benchmark in the main README.

```sh
python -m pip install matplotlib
python scripts/plot-import-comparison.py \
  --results /path/to/new-results-directory \
  --out-prefix /path/to/carve-comparison
```

