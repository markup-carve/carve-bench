# Performance after the PHP parser and renderer changes

The core fast route remains much faster than mixed-feature AST conversion in
all three engines. PHP's recent changes preserve the [472-input ownership
matrix](https://github.com/markup-carve/carve-proofs/blob/56b6a68bbd50c7c221901b5a9777f2f3da76ba5a/reports/ownership-results.json), but the mixed corpus still spends substantially more time than its
core comparison. This run records the resulting costs; it does not isolate
the speed gain from those changes. JS also advanced from `45bbec34` to
`6d02fa70`, and Node changed from 22.22.2 to 24.19.0. Peer JS throughput moved
with the runtime, so separate snapshots cannot attribute that gain to Carve.

## Measured routes

| Engine | Core comparison MB/s | Medium mixed MB/s | Large mixed MB/s |
|---|---:|---:|---:|
| JavaScript | 12.92 | 1.09 | 1.13 |
| PHP | 10.31 | 0.44 | 0.39 |
| Rust | 89.26 | 4.10 | 3.49 |

The inputs and API routes differ between these columns. Their ratio is not a
speedup for equivalent work. The [core comparison](../COMPARISON.md) retains
all peer rows; [full-corpus results](../RESULTS.md) retain every size and PHP
extension tier. PHP Tier 1, Tier 2 and Tier 3 measured 3.97, 4.21 and 5.11 ms
per operation on the comparison document. These are separate experiments.

The large mixed input has about eight times the bytes of the medium input.
PHP time increased 9.05 times, JS 7.71 times and Rust 9.40 times. These two
points do not establish a complexity bound.

## Remaining work

- PHP: prioritize the owned AST path and nested rendering. The merged changes
  index failed bracket openers, defer unnecessary paragraph parsing and pad
  clean HTML regions in bulk. Nested rendering still constructs subtree
  strings at each level. Measure a shared output buffer against code blocks,
  multiline attributes and nested containers before changing that behavior.
- JavaScript: use the refreshed CPU and allocation profiles to separate
  container parsing, source-position mapping and semantic tree walks. The
  current parser allocates offset and width arrays for nested lexers. Removing
  fields after parsing does not measure the benefit of avoiding their creation.
- Rust: separate nested-list parsing from renderer allocation. Mapped container
  sources build line cursors, while quote rendering collects child strings
  before appending them. Allocation counts and requested bytes can identify
  which boundary is worth changing; throughput alone cannot.

These are implementation leads from the current source, not measured gains.
The [fresh phase measurements](https://github.com/markup-carve/carve-proofs/blob/56b6a68bbd50c7c221901b5a9777f2f3da76ba5a/reports/runtime-scaling.md) put PHP's depth-192 list parsing at 44.7 ms and
rendering at 34.1 ms without JIT. Rust's depth-192 quote rendering requests
28.3 MiB of allocations for 76.3 KiB of HTML. Pretty-printed indentation makes
the output grow with depth; reducing repeated intermediate strings is a
separate candidate from the unavoidable output bytes.
The [proofs repository](https://github.com/markup-carve/carve-proofs/tree/56b6a68bbd50c7c221901b5a9777f2f3da76ba5a) records
phase scaling and the JS profiles. Its PHP runtime runner disables JIT; the
throughput runs here enable tracing JIT. Keep those evidence sets separate.

## Provenance and checks

The [machine-readable snapshot](performance-refresh.json) records full engine
commits, input hashes, runtime versions, tables and host load at report time.
JS uses `6d02fa7062dd03024e7c092016459602e9a7aeec`, PHP
`7033d04b1d942263508eadf9b699a77ee656bfda`, and Rust
`9f3f334c7d5c91c57e4e6269b32599af1062fdde`.
The fixed mixed inputs reproduce byte for byte from the 2,134-document spec
corpus at `9db91206d1a4a8a8cf795c48210bca49d66f14d6`.

Both benchmark commands completed, and the full-corpus run was repeated after
the small-input diagnostic. Every PHP corpus and tier row reported
tracing JIT active, with a clean INI and no coverage extensions. Harness
provenance checks verified the requested checkouts. These local shared-host
measurements are not a paired comparison with the preceding snapshot.

Reproduce with the checkout overrides in the README, then run `node run.mjs`,
`node compare.mjs` and `node scripts/gen-charts.mjs`. Use the recorded commits
and input hashes before comparing another run.

## Small-input diagnostic

The [initial run](full-corpus-initial.json) reported 6.3951 ms/op for JS and
10.2573 ms/op for PHP on the small input. The full rerun measured 2.3572 and
4.3822 ms/op. These rows remain unstable and should not be used to claim an
engine regression or rank small-document speed.

The [alternating checks](small-corpus-check.json) rebuild both JS checkouts,
verify their module digests and record Node, PHP and opcache versions. Fresh
processes use 20 and 2,000 timed calls at both engine revisions. At 2,000 calls,
JS was 0.5655-0.5821 ms/op at baseline and 0.5610-0.5811 at current.
PHP was 1.3674-1.3813 at baseline and 1.2990-1.3209 at current.
These pairs reproduce neither the initial nor the repeated full-run small rows,
even though all use 2,000 calls. Short runs also differ per operation. The
diagnostic does not isolate the cause of the shared-host variation.

Reproduce with `CARVE_JS_BASELINE`, `CARVE_JS`, `CARVE_PHP_BASELINE_SRC` and
`CARVE_PHP_SRC` pointing at the recorded checkouts, then run
`node scripts/check-small-corpus.mjs`. Every process verifies its requested
source; PHP also verifies tracing JIT.
