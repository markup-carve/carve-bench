# Preserved benchmark producers

The issue 2962 refresh changes engine pins and benchmark tooling. Earlier public
measurements retain the source files and locks that produced them under
`pre-2962-20261015/`. The archive index records their hashes and the hashes of
the preserved core/full snapshots.

Historical raw measurements are unchanged. Their checks use these archived
producers and snapshots when current files have moved on. New reports use the
current producers and record their own hashes. This keeps old samples verifiable
without claiming that they were measured with newer code or engine pins.

`pre-104-20261105/` keeps the `scripts/full-results.mjs` that wrote the current
`reports/dev-main-full.json`; issue 104 changed the commit check in that file
after the run. A file with several archived versions lists each in the index.
