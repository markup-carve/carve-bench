#!/usr/bin/env python3
"""Write the local Carve report from the measured peer record."""
import hashlib
import json
from pathlib import Path
from statistics import median

ROOT = Path(__file__).resolve().parents[2]
DATA = json.loads((ROOT / 'reports/realistic-peer.json').read_text())
PROVENANCE = json.loads((ROOT / 'corpus/realistic/peer/provenance.json').read_text())
PINS = json.loads((ROOT / 'scripts/realistic/peer-pins.json').read_text())
ROUTES = json.loads((ROOT / 'reports/realistic-peer-routes.json').read_text())
OUTPUT = ROOT / 'reports/realistic-peer.crv'
assert DATA['schema'] == 1
assert DATA['source_commits'] == PINS == ROUTES['source_commits']
assert len(ROUTES['rows']) == 9 and all(row['route'] == 'ast' for row in ROUTES['rows'])
assert DATA['order'] and all(len(entry['load']) == 3 for entry in DATA['order'])
checkpoint_loads = [entry['load'][0] for entry in DATA['order']]
assert len(DATA['rows']) == 33 and len(DATA['controls']) == 33
assert DATA['dependency_lock_sha256']['scripts/realistic/peer-composer.lock'] == hashlib.sha256(
    (ROOT / 'scripts/realistic/peer-composer.lock').read_bytes()).hexdigest()
for document in PROVENANCE['documents']:
    controls = [row for row in DATA['controls'] if row['document'] == document['name']]
    assert len(controls) == 11 and len({row['projection_sha256'] for row in controls}) == 1
    assert all(not row['code_span_space_exceptions'] for row in controls)

panels = [('JavaScript', 'js', ['carve-js', 'djot.js', 'markdown-it', 'commonmark.js']),
          ('PHP', 'php', ['carve-php', 'djot-php', 'league/commonmark-gfm']),
          ('Rust', 'rs', ['carve-rs', 'jotdown', 'comrak', 'pulldown-cmark'])]
docs = [('terms', 'terms'), ('case-study-parsing-ast', 'parsing-ast'),
        ('spec-history', 'spec-history')]
lines = [
    '# Structured document conversion using AST: Carve and peer libraries',
    '',
    f'{DATA["generated_at"][:10]}. This run used three public Carve documentation files from source commit `{PROVENANCE["source_commit"]}`: [Terms](https://github.com/markup-carve/carve/blob/{PROVENANCE["source_commit"]}/docs/terms.md), [Parsing & AST](https://github.com/markup-carve/carve/blob/{PROVENANCE["source_commit"]}/docs/case-study/parsing-ast.md), and [Spec history](https://github.com/markup-carve/carve/blob/{PROVENANCE["source_commit"]}/docs/spec-history.md). Each was rendered from native Carve, Djot, or Markdown source derived once from that file. The [fixture record](../corpus/realistic/peer/provenance.json) gives source and derived hashes. Markdown copies omit YAML front matter; Carve copies use the pinned `markdownToCarve` converter, and Djot copies use Pandoc 3.11 from GFM.',
    '',
    '![Peer speed relative to Carve on three authored documents](../charts/realistic-peer-cpu.svg)',
    '',
    f'The chart shows each peer’s speed relative to Carve within {DATA["rounds"]} rotating rounds. Carve is 1×; a point above 1× means the peer used less process CPU time. Whiskers show the range of the round ratios. All three pinned Carve default APIs took the AST route on all three files. The peer libraries used their native HTML conversion APIs; this does not imply that each peer builds the same public AST.',
    '',
    f'This run used a load ceiling of {DATA["load_gate"]}, versus 20 in the preceding published snapshot. One-minute load at document checkpoints was {min(checkpoint_loads):.2f}–{max(checkpoint_loads):.2f}. Read the peer ratios within this run; the engine pins and host load differ from the preceding chart.',
    '',
    '## Results',
    '',
    'The inputs are 3.1 to 19.3 KiB, depending on syntax. The table gives pooled median process CPU milliseconds per conversion, then the median of within-round peer/Carve speed ratios and its round range. Compare rows within a runtime and document. JavaScript process CPU includes Node threads. PHP used tracing JIT. Rust used a release binary. Startup time was excluded.',
]
for title, language, engines in panels:
    lines += ['', f'### {title}', '', '|= Document |= Library |= CPU ms/op |= Speed vs Carve |= Round range |']
    for document, label in docs:
        carve = next(row for row in DATA['rows'] if row['document'] == document and row['engine'] == engines[0])
        for engine in engines:
            row = next(row for row in DATA['rows'] if row['document'] == document and row['engine'] == engine)
            assert row['language'] == language and len(row['rounds']) == DATA['rounds']
            ratios = [base / peer for base, peer in zip(carve['round_median_cpu_ms'],
                                                        row['round_median_cpu_ms'])]
            lines.append(f'| {label} | {engine} | {row["median_cpu_ms"]:.3f} | '
                         f'{median(ratios):.2f}× | {min(ratios):.2f}–{max(ratios):.2f}× |')

sessions = DATA.get('sessions', [])
assert sessions and sum(session['rounds'] for session in sessions) == DATA['rounds']
assert checkpoint_loads
gate_note = (f'Every document checkpoint was below the pre-round load gate of {DATA["load_gate"]}.'
             if max(checkpoint_loads) < DATA['load_gate']
             else 'The load gate applies before each round; later document checkpoints can exceed it.')
session_links = ', '.join(
    f'[session {index}]({session["path"].removeprefix("reports/")}) '
    f'({session["rounds"]} rounds; load {session["load_start"][0]:.2f} to {session["load_end"][0]:.2f})'
    for index, session in enumerate(sessions, 1)
)
lines += [
    '',
    '## Output and method',
    '',
    'All eleven libraries produced identical projected HTML on each file. The projection ignores section wrappers, generated IDs, and presentational attributes while retaining tags, link targets, and text. The [raw record](realistic-peer.json) keeps original output hashes and the projection hashes. The fixed Composer lock includes [merged djot-php PR #325](https://github.com/php-collective/djot-php/pull/325), which corrected code-span padding in this corpus.',
    '',
    f'{DATA["rounds"]} rounds rotated document and library order across {len(sessions)} sessions: {session_links}. JavaScript workers warmed for {DATA["warmup"]["js"]} conversions so V8 finished optimizing the list parser before timing; PHP and Rust warmed for {DATA["warmup"]["php"]} and {DATA["warmup"]["rs"]}. Each round measured {DATA["trials_per_round"]} batches, with {DATA["iterations"]["js"]} JavaScript, {DATA["iterations"]["php"]} PHP, or {DATA["iterations"]["rs"]} Rust conversions per batch. Workers ran serially on CPU {DATA["cpu_affinity"][0]}. The load gate waited for one-minute host load below {DATA["load_gate"]} before each round on {DATA["logical_cpus"]} logical CPUs. The chart uses within-round ratios because absolute round times varied on this shared host. The [combined record](realistic-peer.json) retains wall and process CPU samples, run order, hashes, source commits, dependency locks, and worker versions. [Separate pinned route checks](realistic-peer-routes.json) recorded AST for all nine Carve engine and document combinations. Carve commits were JavaScript `{DATA["source_commits"]["js"]}`, PHP `{DATA["source_commits"]["php"]}`, and Rust `{DATA["source_commits"]["rs"]}`.',
    '',
    f'{gate_note} The raw record keeps one-minute load at every document checkpoint.',
    '',
    'This structured document conversion comparison uses three selected public files. Their prose, lists, links, and code exercise common authoring patterns; this set has no pipe tables. Carve builds its public AST and supports a broader grammar. The peers use their native HTML APIs and may construct different internal representations. The chart measures conversion cost for matching projected output on these files.',
    '',
    f'The second session completed at `{DATA["generated_at"]}`. The combined record came from benchmark commit `{DATA["benchmark_commit"]}`. The JavaScript pin is merged main commit `{DATA["source_commits"]["js"]}` and includes [PR #3508](https://github.com/markup-carve/carve-js/pull/3508), [PR #3528](https://github.com/markup-carve/carve-js/pull/3528), and [PR #3529](https://github.com/markup-carve/carve-js/pull/3529). PHP and Rust use the pinned main snapshots named above. Engine pins and host load differ from the preceding chart, so changes across snapshots do not isolate one code change. The [paired CPU screen in PR #3529](https://github.com/markup-carve/carve-js/pull/3529) measures the exact Spec history peer fixture against the previous JavaScript main commit.',
]
OUTPUT.write_text('\n'.join(lines) + '\n')
print(OUTPUT)
