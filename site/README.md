# Benchmark site

The site presents committed comparison and full-corpus reports with measured
engine identities, host notes, interactive language filters, and downloadable
SVG, CSV, JSON, and Markdown files. It builds without running benchmarks.

Run `node scripts/site/build.mjs`, then serve `_site` with
`python3 -m http.server 4174 --directory _site`.
For checks, run `node --test scripts/site/build.test.mjs`, then
`cd site && npm ci && npx playwright install chromium && npm test`.

The Benchmark site workflow builds and checks pull requests. Main-branch builds
deploy through GitHub Pages after the browser checks pass. Configure the
repository's Pages source as GitHub Actions. Generated `_site` files stay local
and CI uploads them as an artifact.
