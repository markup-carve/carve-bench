# Engine release-history check, 20 October 2026

The published release-history graph is a snapshot from 2 October. Its `dev-main` points are the engine commits measured then, not the current heads. The shared host was busy during that run; some rounds have wide sample spread. The graph records those measurements faithfully, but its broad uptick should not be read as a current regression across every engine.

A fresh run of the same harness compared pinned sources in alternating order:

| Engine and case | Older source | Older ms/op | Later source | Later ms/op | Output |
|---|---|---:|---|---:|---|
| JavaScript, 128 plain paragraphs | 0.1.9 | 0.088 | 2 October head | 0.082 | Same hash |
| JavaScript, 128 mixed sections | 0.1.9 | 1.499 | 2 October head | 1.273 | Same hash |
| JavaScript, 128 quoted fences | 0.1.9 | 0.307 | 2 October head | 0.568 | Same hash |
| JavaScript, 128 quoted fences | 0.1.9 | 0.326 | current merged head | 0.297 | Same hash |
| JavaScript, 128 verse equivalents | 0.1.9 | 0.817 | current merged head | 0.866 | Same hash |
| PHP, 128 quoted fences | 0.1.9 | 0.92 | pre-fix main | 2.94 | Same hash |
| PHP, 1,024 quoted fences | 0.1.9 | 7.12 | current merged head | 14.74 | Same hash |
| PHP, 1,024 quoted fences | 0.1.13 | 20.78 | current merged head | 14.74 | Same hash |
| Rust, 1,024 quoted fences | 0.1.6 | 1.834 | current merged head | 0.473 | Same hash |
| Rust, 1,024 mixed sections | 0.1.6 | 2.441 | current merged head | 2.176 | Same hash |
| Rust, 1,024 quoted fences | 0.1.10 | 0.454 | current merged head | 0.473 | Same hash |
| Rust, 1,024 mixed sections | 0.1.10 | 2.129 | current merged head | 2.176 | Same hash |

JavaScript's broad rise did not reproduce, although its October 2 quoted-fence revision was slower. The earlier unpinned `fa7b5b2c` run also showed verse equivalents at 1.531 versus 0.920 ms/op on 0.1.9. A fresh pinned four-round run on the later `9c5e7d7b` head put them at 0.866 versus 0.817 ms/op. Those round median ranges overlap, so a small difference remains unresolved. PHP's quote regression did reproduce. The merged head after [PHP PR #3595](https://github.com/markup-carve/carve-php/pull/3595) improves on the latest 0.1.13 tag in a fresh four-round run, while remaining about twice as slow as 0.1.9 on this case. Rust's current head is faster than 0.1.6 on the quoted-fence and mixed-document cases shown here. Against 0.1.10 it is close and slightly slower in this run. Some other Rust cases have changed output, so their times should not be treated as equal-work comparisons.

These figures are fixture-specific wall times with process startup excluded. CPU load still affects absolute values. Each linked raw record includes source commits, input and output hashes, runtime details, round medians, and samples: [JavaScript October 2](engine-history-audit-js-20261020.json), [JavaScript merged 128](engine-history-audit-js-merged-128-20261020.json), [PHP 128](engine-history-audit-php-20261020.json), [PHP merged 1,024](engine-history-audit-php-merged-1024-20261020.json), [Rust 128](engine-history-audit-rs-128-20261020.json), [Rust 1,024](engine-history-audit-rs-1024-20261020.json).

The merged JavaScript and PHP rechecks used CPU affinity 12. The earlier JavaScript, PHP 128, and Rust records used no affinity. Their absolute times therefore belong to separate measurement runs.

The merged JavaScript and PHP runs record a dirty benchmark worktree because the site report and fixture additions were still being prepared. The engine checkouts were pinned to merged commits, and the timing workers' recorded hashes match the committed history harness.
