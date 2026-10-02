# Focused measurements

These runners compare two clean source trees per engine. Prepare node_modules and PHP vendor directories first. The JS runner builds dist; Rust builds a temporary worker using the main engine's dependency lock and an external Cargo target directory. PHP vendor directories must load the source tree they accompany.

```bash
python3 scripts/deep-review/run.py \
  --js-main /tmp/js-main --js-candidate /tmp/js-draft \
  --php-main /tmp/php-main --php-candidate /tmp/php-draft \
  --rs-main /tmp/rs-main --rs-candidate /tmp/rs-draft \
  --cargo-target /tmp/cargo-shared/carve-bench-focused \
  --output /tmp/focused-session.json --rounds 4 --samples 11 --cpu 6

python3 scripts/deep-review/php-citations.py \
  --main /tmp/php-main --candidate /tmp/php-citation-draft \
  --output /tmp/php-citation-session.json --rounds 4 --samples 11 --cpu 6
```

The output path must be new. CPU affinity needs a CPU allowed on the host. Both runners stop on different output hashes or changed source/artifacts. Node helper threads share the pinned core, so absolute times depend on this configuration and host load.

Rendering requires Matplotlib and a completed session:

```bash
python3 scripts/deep-review/render.py /tmp/focused-session.json /tmp/focused-report
```

Use `--engines rs --control-samples 401` for longer Rust controls, or `--engines php --kinds table-sections adjacent-definitions` for importer building. All six prepared source paths remain required. `--control-samples` applies to Rust plain text, nested citations and unpositioned groups.

The committed October 2 report also includes separate PHP citation, Rust short-scan and PHP importer sessions, plus longer Rust diagnostics. The diagnostics reuse the original worker binaries; their producer was saved after the run. They do not replace the primary session.

`cache-memory.php ROOT COUNT` measures live PHP memory retained after unique attribute payloads longer than 4 KB. It warms a short marker first, releases the final result, collects cycles, and checks every parsed ID. Fresh processes keep static cache state independent. This measures retained memory, not peak allocation or throughput.

Filter cases with `--kinds` and sizes with `--sizes`. Empty case selections fail before building. Output inside this repository must be ignored; use an external path for measurements. Add `--large-sibling-tables` to include the optional 16,384-table PHP case.

Use `cache-retention.py --help` for the paired retention runner. It records source revisions, runtime and dependency metadata, loaded PHP class origins and worker hashes. The PHP timing workers reject autoloaders that load engine classes outside the selected source tree. Earlier saved sessions predate that check; their class origins were checked afterward where the source trees remained available.

Final follow-ups retain the intermediate drafts and their controls. JavaScript's bounded short citation scan fixes the intermediate nested-citation cost; flat citation groups retain a small absolute indexing cost at every measured size. The final importer session compares session batching against the first importer draft.
