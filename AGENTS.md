# Published benchmark results

- Published docs, reports and graphs compare released engine tags and pinned merged main. Record the main commit and measurement time; do not describe a historical baseline as today's main.
- Keep intermediate PR branches, candidate-versus-baseline graphs and exploratory measurements in local evidence artifacts. Do not commit or publish them unless the user explicitly requests those specific results.
- Preserve historical release comparisons and their raw samples, output hashes and source/build provenance. A refresh must identify the merged main it measured.
- Before publishing, check report links and run `node --test scripts/test-host-paths.mjs`. Its history check rejects intermediate candidate points in the published report.
