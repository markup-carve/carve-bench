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
