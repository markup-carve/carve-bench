# Benchmark site

The site shows the committed Carve 0.2 results (`results/`, `charts/`) with a language, measure and
document filter, the Carve 0.2 against Carve 0.1 ratios, and downloads of every result file. The
Carve 0.1 site stays reachable as an archive under `0.1/`. Nothing is measured during the build.

Build it with a checkout of the `0.1` branch for the archive:

```sh
git worktree add .archive-0.1 origin/0.1
node scripts/site/build.mjs
python3 -m http.server 4174 --directory _site
```

`CARVE_BENCH_ARCHIVE=<path>` points the build at another 0.1 checkout. Without one, `0.1/` holds a
page that links to the branch.

Checks: `node --test scripts/site/build.test.mjs`, then
`cd site && npm ci && npx playwright install chromium && npm test`. The browser tests expect a
build with the archive.

The Benchmark site workflow still builds and deploys the `0.1` branch; it moves to this builder once
Carve 0.2.0 is released. Generated `_site` files stay local.
