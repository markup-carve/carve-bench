"""Render the completed focused session without modifying its measurements."""
import argparse
import csv
import json
from pathlib import Path


def save_chart(figure, path):
    figure.savefig(path, metadata={'Date': None})
    path.write_text('\n'.join(line.rstrip() for line in path.read_text().splitlines()) + '\n')


def render(session_path, output):
    session = json.loads(session_path.read_text())
    if 'finished_at' not in session or 'summary' not in session:
        raise ValueError('Session is incomplete')
    output.mkdir(parents=True, exist_ok=True)
    rows = session['summary']
    columns = ['engine', 'kind', 'n', 'stage', 'main_ms', 'candidate_ms', 'change_percent', 'hash']
    with (output / 'deep-review.csv').open('w') as stream:
        writer = csv.DictWriter(stream, fieldnames=columns, extrasaction='ignore', lineterminator='\n')
        writer.writeheader()
        writer.writerows(rows)
    lines = ['# Focused engine review, ' + session['started_at'][:10], '',
             f"{session['rounds']} alternating rounds of {session['samples_per_round']} samples compare pinned main with the earlier drafts. Lower milliseconds are faster. Every case has the same complete output hash across both revisions and all rounds. Final Rust and current-main follow-ups appear below; the original session remains intact.", '',
             '[Raw session](deep-review.json) · [CSV](deep-review.csv) · [Graph](../charts/deep-review.svg)', '',
             '## Sources', '', '| Engine | Main | Candidate |', '|---|---|---|']
    for engine in ['js', 'php', 'rs']:
        a = session['sources'][engine + '-main']['revision']
        b = session['sources'][engine + '-candidate']['revision']
        lines.append(f'| {engine} | `{a}` | `{b}` |')
    lines += ['', '## Scope and timing', '',
              'JS and Rust measure parsing with the citations extension enabled. PHP measures AST encoding, importer AST decoding, full HTML import with its report, and a parse plus encode control. These are comparisons within each engine; their timing boundaries differ.', '',
              'Node warms each case for at least 500 ms and three calls. PHP and Rust warm three calls. Rust uses a release build seeded from the main engine dependency lock; the final worker lock and binary hashes are recorded. PHP CLI opcache, coverage and Xdebug are disabled. Serialization used to check output parity is outside the timed citation parsing.', '',
              f"All workers, including Node helper threads, run on CPU {session['cpu']}. The shared host can still interrupt them. Raw samples, round medians, ranges, load, frequency, runtime versions, dependency metadata and artifact hashes are recorded. Small changes need more evidence. The earlier release history remains a separate measurement session.", '',
              '## Findings', '',
              'JS now keeps citation bracket maps with the parse context. Nested citation prefixes, emphasis and link labels reuse the outer map, and completed parses release the maps. The guards fail on the previous implementation.', '',
              'Rust caches raw citation bracket matches for each inline run and stores only matched openers. It also removes a redundant position pass that repeatedly counted source prefixes. The existing position map remains responsible for item spans, including Unicode and multiline sources.', '',
              'PHP caches fixed encoding metadata by class and wire type. Node values and conditional empty titles are still evaluated for each node. Validation and report generation remain in the import path.', '',
              '## Measurements', '', '| Engine | Case | n | Stage / positions | Main ms | Candidate ms | Change |', '|---|---|---:|---|---:|---:|---:|']
    for row in rows:
        lines.append(f"| {row['engine']} | {row['kind']} | {row['n']} | {row['stage']} | {row['main_ms']:.3f} | {row['candidate_ms']:.3f} | {row['change_percent']:+.1f}% |")
    lines += ['', '## Maintenance and remaining work', '',
              'The changes remove repeated work at its owner: citation matching owns bracket lookup, one source map owns Rust citation positions, and one PHP helper owns static encoding metadata. The public grammar and extension API remain unchanged.', '',
              'PHP full HTML import still includes tree building, schema checks, canonicalization, writing and report analysis. Earlier stage profiles show that removing the definition-list scan did not remove this broader cost. Further work should measure these stages separately and preserve validation and loss reporting.', '']
    (output / 'deep-review.md').write_text('\n'.join(lines))
    import matplotlib
    matplotlib.use('Agg')
    matplotlib.rcParams['svg.hashsalt'] = 'carve-bench-focused-v1'
    import matplotlib.pyplot as plt
    panels = list(dict.fromkeys((row['engine'], row['kind']) for row in rows))
    columns = min(3, len(panels))
    height = (len(panels) + columns - 1) // columns
    figure, axes = plt.subplots(height, columns, figsize=(5 * columns, 4 * height), squeeze=False, constrained_layout=True)
    for ax, (engine, kind) in zip(axes.flat, panels):
        selected = [row for row in rows if row['engine'] == engine and row['kind'] == kind]
        stages = list(dict.fromkeys(row['stage'] for row in selected))
        if len({row['n'] for row in selected}) == 1:
            x = list(range(len(stages)))
            for variant, offset in [('main', -.18), ('candidate', .18)]:
                ax.scatter([value + offset for value in x],
                       [next(row[variant + '_ms'] for row in selected if row['stage'] == stage) for stage in stages],
                       s=42, label=variant)
            ax.set_xticks(x, stages)
            ax.set_xlabel('Stage')
        else:
            for stage in stages:
                values = sorted([row for row in selected if row['stage'] == stage], key=lambda row: row['n'])
                for variant, style in [('main', '-'), ('candidate', '--')]:
                    ax.plot([row['n'] for row in values], [row[variant + '_ms'] for row in values], style,
                            marker='o', label=stage + ' ' + variant)
            ax.set_xscale('log', base=2)
            ax.set_xlabel('Repeated items')
        ax.set_yscale('log')
        ax.set_title(engine + ': ' + kind)
        ax.set_ylabel('Median milliseconds, log scale')
        ax.grid(alpha=.2)
        ax.legend(fontsize=8)
    for ax in list(axes.flat)[len(panels):]:
        ax.set_visible(False)
    figure.suptitle('Earlier drafts versus pinned main, including controls and regressions')
    chart = output.parent / 'charts'
    chart.mkdir(exist_ok=True)
    save_chart(figure, chart / 'deep-review.svg')
    plt.close(figure)


def append_followups(output, citation_path, controls_path):
    citation = json.loads(citation_path.read_text())
    controls = json.loads(controls_path.read_text())
    if 'finished_at' not in citation or controls['rounds_complete'] != 8:
        raise ValueError('Follow-up measurement is incomplete')
    for row in controls['summary']:
        for variant in ['main', 'candidate']:
            measured = [r for r in controls['rows'] if (r['kind'], r['n'], r['positions'], r['variant']) == (row['kind'], row['n'], row['positions'], variant)]
            if len(measured) != 8 or {r['round'] for r in measured} != set(range(8)) or any(len(r['samples']) != controls['samples_per_round'] for r in measured):
                raise ValueError('Historical Rust diagnostic is incomplete')
    lines = ['', '## PHP citation follow-up', '',
             'This separate session measures the citation position fix against the same PHP main. The encoding measurements above use a different draft. Both changes are independent.', '',
             'Main: `' + citation['sources']['main']['revision'] + '`. Citation draft: `' + citation['sources']['candidate']['revision'] + '`.', '',
             '[Citation raw session](php-citation-review.json) · [Citation CSV](php-citation-review.csv) · [Citation graph](../charts/php-citation-review.svg)', '',
             f"{citation['rounds']} alternating rounds of {citation['samples_per_round']} samples use three warmups. Parsing with positions enabled includes the whole parser. The setter case measures the public setPos() method on a prepared group. Output serialization remains outside timing. Unpositioned controls show mixed changes; the changed loop is not entered on this path.", '',
             '| Stage | n | Main ms | Draft ms | Change |', '|---|---:|---:|---:|---:|']
    columns = ['engine', 'kind', 'n', 'stage', 'main_ms', 'candidate_ms', 'change_percent', 'hash']
    with (output / 'php-citation-review.csv').open('w') as stream:
        writer = csv.DictWriter(stream, fieldnames=columns, extrasaction='ignore', lineterminator='\n')
        writer.writeheader()
        writer.writerows(citation['summary'])
    for row in citation['summary']:
        lines.append(f"| {row['stage']} | {row['n']} | {row['main_ms']:.3f} | {row['candidate_ms']:.3f} | {row['change_percent']:+.1f}% |")
    lines += ['', '## Longer Rust controls', '',
              'A local diagnostic repeated the original Rust worker binaries with longer sampling for the five cases listed below. These repeats cover plain parsing and unpositioned citation groups. They do not cover nested citation prefixes: the initial map allocation caused a repeatable slowdown there, addressed by the final Rust short-scan follow-up below.', '',
              '[Diagnostic raw samples](deep-review-rust-controls.json) · [Archived binary verification](rust-control-binary-verification.json)',
              '', 'The diagnostic producer inherited binary hashes from the original session. Hashes of the archived binaries were checked after the run, not by the diagnostic producer at run time. Formal follow-ups below have stronger provenance.', '',
              '| Case | n | Positions | Main ms | Draft ms | Change |', '|---|---:|---|---:|---:|---:|']
    for row in controls['summary']:
        lines.append(f"| {row['kind']} | {row['n']} | {row['positions']} | {row['main_ms']:.3f} | {row['candidate_ms']:.3f} | {row['change_percent']:+.1f}% |")
    with (output / 'deep-review.md').open('a') as stream:
        stream.write('\n'.join(lines) + '\n')
    import matplotlib.pyplot as plt
    figure, axes = plt.subplots(1, 2, figsize=(10, 4), constrained_layout=True)
    for ax, stage, title in zip(axes, ['setter', 'parse+positions'], ['PHP public citation position setter', 'PHP parsing with citation positions']):
        rows = [r for r in citation['summary'] if r['stage'] == stage]
        for variant, style in [('main', '-'), ('candidate', '--')]:
            ax.plot([r['n'] for r in rows], [r[variant + '_ms'] for r in rows], style, marker='o', label=variant)
        ax.set_xscale('log', base=2)
        ax.set_yscale('log')
        ax.set_title(title)
        ax.set_xlabel('Citation items')
        ax.set_ylabel('Median milliseconds, log scale')
        ax.grid(alpha=.2)
        ax.legend()
    save_chart(figure, output.parent / 'charts/php-citation-review.svg')
    plt.close(figure)


def append_session(output, path):
    session = json.loads(path.read_text())
    if 'finished_at' not in session:
        raise ValueError('Follow-up session is incomplete')
    stem = path.stem
    rows = session['summary']
    columns = ['engine', 'kind', 'n', 'stage', 'main_ms', 'candidate_ms', 'change_percent', 'hash']
    with (output / (stem + '.csv')).open('w') as stream:
        writer = csv.DictWriter(stream, fieldnames=columns, extrasaction='ignore', lineterminator='\n')
        writer.writeheader()
        writer.writerows(rows)
    titles = {
        'rust-hybrid-session': 'Final Rust fix versus pre-review main',
        'rust-current-main-session': 'Rust short scan versus newly merged main',
        'php-import-current-main-session': 'PHP table and definition-list building versus newly merged main',
        'citation-items-current-main-session': 'Citation item fixes in JavaScript and Rust',
        'citation-short-controls-session': 'Rust short-input controls with longer sampling',
        'js-import-current-main-session': 'JavaScript blank table imports versus merged main',
        'merged-engines-final-session': 'Merged engine fixes and the first JavaScript importer draft',
        'rejected-citations-and-paths-session': 'Rust citation rejection and PHP sibling paths',
        'js-session-refusals-session': 'Final JavaScript batching through captions and composites',
        'js-citation-final-session': 'Final JavaScript citation fix with bounded short scans',
        'php-merged-import-session': 'PHP importer with all review fixes merged',
        'php-large-sibling-paths-session': 'PHP sibling paths at 16,384 tables',
        'php-decode-passes-session': 'PHP bounded payload walk and unchanged arrays',
        'php-table-comments-session': 'PHP multiline comments without repeated table scans',
    }
    control_note = f" Rust control cases use {session['control_samples_per_round']} samples per round." if session.get('control_samples_per_round') and 'rs' in session['selected_engines'] else ''
    lines = ['', '## ' + titles.get(stem, stem), '',
             f"{session['rounds']} alternating rounds on CPU {session['cpu']} use {session['samples_per_round']} samples per case.{control_note} Every output hash matches.", '',
             f'[Raw session]({stem}.json) · [CSV]({stem}.csv) · [Graph](../charts/{stem}.svg)', '',
             '| Engine | Main | Candidate |', '|---|---|---|']
    for engine in session['selected_engines']:
        lines.append(f"| {engine} | `{session['sources'][engine + '-main']['revision']}` | `{session['sources'][engine + '-candidate']['revision']}` |")
    if stem in ('rust-hybrid-session', 'rust-current-main-session'):
        lines += ['', 'A bounded 64-byte scan avoids allocating a whole-run map for short citations. Longer or unmatched spans still build the shared map once. The first Rust draft slowed ordinary nested citations; this follow-up removes that allocation cost. Positions and all output hashes are preserved.']
    if stem.startswith('php-import'):
        lines += ['', 'This session measures HTML-to-AST building only, including DOM loading. Row and section indexes replace full-row searches, section paths reuse the table path, and adjacent definition lists append items. It does not measure full import and report generation. The later invariant check validates each merge target once; that small review correction is not included in this pinned measurement.']
    if stem == 'citation-short-controls-session':
        lines += ['', 'The earlier short Rust cases varied by a few microseconds. Longer sampling measures positioned groups at -2.0% and unmatched openers at +0.2%; it does not support the earlier +33%/+20% readings as repeatable regressions.']
    if stem == 'js-session-refusals-session':
        lines += ['', 'The final renderer collects refused rows once per render pass, replacing the first draft’s per-block exception bookkeeping. Lists, blockquotes and captioned tables now batch too. No partial source is returned; earlier rows are reported before a later refusal. Complete source and loss-report hashes match.']
    if stem == 'rejected-citations-and-paths-session':
        lines += ['', 'The JavaScript candidate in this session is an intermediate draft. Its ordinary citation controls led to the bounded short scan measured in the final JavaScript session below. PHP caches sibling positions once per parent and resets them for each HTML import. Rust omits lexically invalid citation groups while indexing brackets.']
    if stem == 'php-decode-passes-session':
        lines += ['', 'Depth checking and byte accounting share one bounded walk. NUL normalization and importer-hint pruning retain unchanged arrays and propagate child-change flags. Independent schema validation remains guarded. These measurements use the pre-path-merge main; the PR later merged the latest main into its branch.']
    if stem == 'php-table-comments-session':
        lines += ['', 'The builder and report inspection cache stable table-block decisions within their sessions. Both scaling guards fail on the measured main and pass on the candidate. The build-list-table stage enables list-table import explicitly; import includes complete source and its loss report. These measurements use the pre-path-merge main; the PR later merged the latest main into its branch.']
    if stem == 'php-large-sibling-paths-session':
        lines += ['', 'This opt-in case measures HTML-to-AST building at 16,384 sibling tables. Two alternating rounds use three samples per round, six per revision. Source origins for this older worker were checked after the run in the [saved PHP verification](php-source-origin-verification.json). It complements the smaller four-round sibling-path session; full import is not measured here.']
    if stem == 'js-citation-final-session':
        lines += ['', 'Short citations use a bounded 64-code-unit raw scan before allocating the shared index. Long candidates validate first, last and complete intervening items in one scan; the existing item parser still owns inline content. Rejected item probes use smaller sizes because the baseline builds and parses each growing item list. Ordinary flat citation groups rise from 0.068 to 0.095 ms at n=128 (+38.7%), from 0.547 to 0.682 ms at n=1024 (+24.8%) and from 1.102 to 1.285 ms at n=2048 (+16.7%); the added indexing cost remains a control to monitor.']
    lines += ['', '| Engine | Case | n | Stage / positions | Main ms | Candidate ms | Change |', '|---|---|---:|---|---:|---:|---:|']
    for row in rows:
        lines.append(f"| {row['engine']} | {row['kind']} | {row['n']} | {row['stage']} | {row['main_ms']:.3f} | {row['candidate_ms']:.3f} | {row['change_percent']:+.1f}% |")
    with (output / 'deep-review.md').open('a') as stream:
        stream.write('\n'.join(lines) + '\n')
    import matplotlib.pyplot as plt
    panels = list(dict.fromkeys((row['engine'], row['kind']) for row in rows))
    columns = min(3, len(panels))
    height = (len(panels) + columns - 1) // columns
    figure, axes = plt.subplots(height, columns, figsize=(5 * columns, 4 * height), squeeze=False, constrained_layout=True)
    for ax, (engine, kind) in zip(axes.flat, panels):
        selected = [row for row in rows if row['engine'] == engine and row['kind'] == kind]
        for stage in dict.fromkeys(row['stage'] for row in selected):
            values = sorted([row for row in selected if row['stage'] == stage], key=lambda row: row['n'])
            for variant, style in [('main', '-'), ('candidate', '--')]:
                ax.plot([row['n'] for row in values], [row[variant + '_ms'] for row in values], style, marker='o', label=stage + ' ' + variant)
        ax.set_xscale('log', base=2)
        ax.set_yscale('log')
        ax.set_title(engine + ': ' + kind)
        ax.set_xlabel('Repeated items')
        ax.set_ylabel('Median milliseconds, log scale')
        ax.grid(alpha=.2)
        ax.legend(fontsize=8)
    for ax in list(axes.flat)[len(panels):]:
        ax.set_visible(False)
    figure.suptitle(titles.get(stem, stem))
    save_chart(figure, output.parent / 'charts' / (stem + '.svg'))
    plt.close(figure)


def append_retention(output, path):
    session = json.loads(path.read_text())
    if 'finished_at' not in session or len(session['rows']) != 6:
        raise ValueError('Cache retention measurement is incomplete')
    rows = session['rows']
    counts = sorted({row['count'] for row in rows})
    for count in counts:
        selected = [row for row in rows if row['count'] == count]
        if len(selected) != 2 or len({row['output_hash'] for row in selected}) != 1:
            raise ValueError('Cache retention outputs differ or a pair is missing')
    lines = ['', '## PHP marker cache retention', '',
             'Fresh PHP processes parse unique attribute payloads longer than 4 KB. A short marker warms the parser before the live-memory baseline. The final result is released and cycles collected. These are retained bytes, not peak memory or throughput. Complete marker output hashes match.', '',
             f"Main: `{session['sources']['main']['revision']}`. Candidate: `{session['sources']['candidate']['revision']}`.", '',
             '[Raw retention measurement](php-cache-retention.json) · [Graph](../charts/php-cache-retention.svg)', '',
             '| Unique payloads | Main bytes | Candidate bytes |', '|---:|---:|---:|']
    import matplotlib.pyplot as plt
    figure, ax = plt.subplots(figsize=(6, 4), constrained_layout=True)
    for count in counts:
        pair = {row['variant']: row['retained_bytes'] for row in rows if row['count'] == count}
        lines.append(f"| {count} | {pair['main']} | {pair['candidate']} |")
    for variant in ['main', 'candidate']:
        selected = sorted([row for row in rows if row['variant'] == variant], key=lambda row: row['count'])
        ax.plot([row['count'] for row in selected], [row['retained_bytes'] for row in selected], marker='o', label=variant)
    ax.set_yscale('log')
    ax.set_xlabel('Unique oversized payloads')
    ax.set_ylabel('Live retained bytes, log scale')
    ax.set_title('PHP marker attribute cache')
    ax.legend()
    ax.grid(alpha=.2)
    save_chart(figure, output.parent / 'charts' / 'php-cache-retention.svg')
    plt.close(figure)
    with (output / 'deep-review.md').open('a') as stream:
        stream.write('\n'.join(lines) + '\n')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('session', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--php-citations', type=Path)
    parser.add_argument('--rust-controls', type=Path)
    parser.add_argument('--followup', action='append', type=Path, default=[])
    parser.add_argument('--cache-retention', type=Path)
    args = parser.parse_args()
    render(args.session, args.output)
    if args.php_citations and args.rust_controls:
        append_followups(args.output, args.php_citations, args.rust_controls)
    for followup in args.followup:
        append_session(args.output, followup)
    if args.cache_retention:
        append_retention(args.output, args.cache_retention)
