# PHP snapshot timing check

The September 29 and September 30 development snapshots use identical PHP
source trees: `dc03a9129eabc25dc1b01a7a314ff7a20870af06`. Commits
`04563673da7968b50b34fbe266156b66f6812983` and
`6d94607eaa9d51c9ed782342161beca77b05aaf9` differ only in `CHANGELOG.md`.

Six fresh-process pairs alternate execution order. Each process warms 20
conversions, then runs five trials of 50 conversions on the comparison document.
The table uses minimum trial times; PHP tracing JIT was active throughout.

| Pair | Previous MB/s | Current MB/s | Current / previous time |
|---|---:|---:|---:|
| 0 | 7.72 | 8.75 | 0.882 |
| 1 | 8.65 | 9.29 | 0.931 |
| 2 | 8.63 | 9.13 | 0.945 |
| 3 | 8.84 | 8.77 | 1.009 |
| 4 | 8.41 | 9.00 | 0.935 |
| 5 | 9.34 | 9.24 | 1.010 |

The median paired time ratio is 0.940.
These source-identical runs do not show the 24% lower throughput suggested by the
separate snapshots. Recorded host load was around 11-12 of 16 logical CPUs. Shared-host timings vary and do not establish an engine
regression. This check does not compare development main with the older
published release.

[Raw samples and command](../reports/php-snapshot-check.json) retain execution
order, reported source identities, JIT status, and host load.
