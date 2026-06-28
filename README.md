# carve-bench

Performance benchmarks for the [Carve](https://github.com/markup-carve/carve)
markup engines. Each engine renders the same documents to HTML in-process, many
times, and reports throughput. This is a **speed** comparison - every engine
passes the same [conformance corpus](https://github.com/markup-carve/carve/tree/main/tests/corpus),
so correctness is not what is being measured here.

Engines covered: [carve-js](https://github.com/markup-carve/carve-js) (TypeScript),
[carve-php](https://github.com/markup-carve/carve-php) (PHP),
[carve-rs](https://github.com/markup-carve/carve-rs) (Rust). The carve-go /
carve-py / carve-rb bindings wrap the carve-rs engine, so their core render speed
tracks carve-rs plus a thin FFI/IPC layer.

## Results

See [RESULTS.md](./RESULTS.md). Numbers are machine- and version-specific - run
it yourself; treat them as relative, not absolute.

## Documents

`corpus/` holds three sizes built from the spec corpus: `small` (~1 KB),
`medium` (~13 KB, the whole corpus concatenated) and `large` (~100 KB, the
corpus repeated). Regenerate from a local carve checkout:

```bash
CARVE_REPO=../carve node scripts/gen-corpus.mjs
```

## Running

Each engine has a small harness under `engines/` that takes `<doc> <iters>` and
prints one JSON line (`ms_per_op`, `mb_per_s`). `run.mjs` runs every engine over
every document and writes `RESULTS.md`.

```bash
# 1. Build the Rust harness (release):
(cd engines/rs && cargo build --release)

# 2. Make the JS and PHP engines resolvable (see "Engine resolution").

# 3. Run:
node run.mjs              # full run
node run.mjs --quick      # few iterations, to smoke-test the harness
```

### Engine resolution

The harnesses resolve each engine via environment variables, so you can point at
a published package or a local checkout:

| Engine    | Env var              | Default                                     |
|-----------|----------------------|---------------------------------------------|
| carve-js  | `CARVE_JS`           | `carve-js` (the npm package)                |
| carve-php | `CARVE_PHP_AUTOLOAD` | `engines/php/vendor/autoload.php`           |
| carve-rs  | `CARVE_RS_BIN`       | `engines/rs/target/release/carve-bench-rs`  |

Example, all three from local checkouts beside this repo:

```bash
export CARVE_JS=../carve-js/dist/index.js
export CARVE_PHP_AUTOLOAD=../carve-php/vendor/autoload.php
# engines/rs deps on carve-rs by git; to build against a local checkout instead:
(cd engines/rs && cargo build --release \
  --config 'patch."https://github.com/markup-carve/carve-rs".carve-lang.path="../../../carve-rs"')
node run.mjs
```

## Method notes

- Timing is **in-process** (no per-render process startup), so it measures
  render throughput, not CLI launch cost.
- Each harness warms up before timing (JIT for JS, opcode cache for PHP).
- `rel` in the results is relative to the fastest engine per document.
- The PHP engine is benchmarked with `opcache.enable_cli=1` and `opcache.jit=tracing`
  so it reflects production PHP performance. **Coverage/debug extensions (xdebug, pcov)
  must be disabled** before benchmarking PHP - they override `zend_execute_ex`, which
  disables JIT and inflates timings by roughly 2x. The harness warns on stderr if
  either is detected or JIT is not active.
