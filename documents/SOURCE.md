# Documents

Copied from `markup-carve/carve-js` at commit `c27a9dd40c1c0a359ebb2f3c3c44edbd0d429ae8` (branch `next2`):

| Here | There |
|---|---|
| `commonmark-core.{crv,md,dj}` | `test/fixtures/bench-commonmark-core.{crv,md,dj}` |
| `prose.{crv,md,dj}` | `v2/test/fixtures/bench-engines/prose.{crv,md,dj}` |
| `lists-tables.{crv,md,dj}` | `v2/test/fixtures/bench-engines/lists-tables.{crv,md,dj}` |
| `reference-heavy.{crv,md,dj}` | `v2/test/fixtures/bench-engines/reference-heavy.{crv,md,dj}` |

Each triple holds the same content in Carve, Markdown (GFM) and Djot. The `1mb` document is
not stored: `scripts/documents.mjs` joins the four documents of each language with a blank
line and repeats that concatenation the smallest whole number of times that reaches
1,000,000 bytes (9 times: 1,095,785 bytes of Carve, 1,105,586 of Markdown, 1,096,577 of Djot).
