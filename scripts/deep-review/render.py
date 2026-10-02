"""Render the completed focused session without modifying its measurements."""
import argparse
import csv
import json
from pathlib import Path


def render(session_path, output):
    session = json.loads(session_path.read_text())
    if 'finished_at' not in session or 'summary' not in session:
        raise ValueError('Session is incomplete')
    output.mkdir(parents=True, exist_ok=True)
    rows = session['summary']
    columns = ['engine', 'kind', 'n', 'stage', 'main_ms', 'candidate_ms', 'change_percent', 'hash']
    with (output / 'deep-review.csv').open('w') as stream:
        writer = csv.DictWriter(stream, fieldnames=columns, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(rows)
    lines = ['# Focused engine review, ' + session['started_at'][:10], '',
             'Four alternating rounds of eleven samples compare pinned main with the proposed changes. Lower milliseconds are faster. Every case has the same complete output hash across both revisions and all rounds.', '',
             '[Raw session](deep-review.json) · [CSV](deep-review.csv) · [Graph](../charts/deep-review.svg)', '',
             '## Sources', '', '| Engine | Main | Candidate |', '|---|---|---|']
    for engine in ['js', 'php', 'rs']:
        a = session['sources'][engine + '-main']['revision']
        b = session['sources'][engine + '-candidate']['revision']
        lines.append(f'| {engine} | `{a}` | `{b}` |')
    lines += ['', '## Scope and timing', '',
              'JS and Rust measure parsing with the citations extension enabled. PHP measures AST encoding, importer AST decoding, full HTML import with its report, and a parse plus encode control. These are comparisons within each engine; their timing boundaries differ.', '',
              'Node warms each case for at least 500 ms and three calls. PHP and Rust warm three calls. Rust uses a release build seeded from the main engine dependency lock; the final worker lock and binary hashes are recorded. PHP CLI opcache, coverage and Xdebug are disabled. Serialization used to check output parity is outside the timed citation parsing.', '',
              'All workers, including Node helper threads, run on CPU 6. The shared host can still interrupt them. Raw samples, round medians, ranges, load, frequency, runtime versions, dependency metadata and artifact hashes are recorded. Small changes need more evidence. The earlier release history remains a separate measurement session.', '',
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
    import matplotlib.pyplot as plt
    figure, axes = plt.subplots(1, 3, figsize=(17, 5), constrained_layout=True)
    colors = ['#2463a8', '#ca6733', '#238463']
    for ax, engine, kinds, title in [(axes[0], 'js', ['nested', 'emphasis', 'link'], 'JavaScript citation parsing'),
                                    (axes[1], 'rs', ['group', 'unclosed'], 'Rust citation parsing')]:
        for color, kind in zip(colors, kinds):
            selected = sorted([r for r in rows if r['engine'] == engine and r['kind'] == kind and r['stage'] == 'true'], key=lambda r: r['n'])
            for variant, style in [('main', '-'), ('candidate', '--')]:
                ax.plot([r['n'] for r in selected], [r[variant + '_ms'] for r in selected], style, marker='o', color=color, label=kind + ' ' + variant)
        ax.set_xscale('log', base=2)
        ax.set_yscale('log')
        ax.set_title(title)
        ax.set_xlabel('Repeated items')
        ax.set_ylabel('Median milliseconds, log scale')
        ax.grid(alpha=.2)
        ax.legend(fontsize=8)
    selected = [r for r in rows if r['engine'] == 'php' and r['kind'] != 'plain']
    x = list(range(len(selected)))
    axes[2].bar([i - .18 for i in x], [r['main_ms'] for r in selected], width=.36, label='main', color=colors[0])
    axes[2].bar([i + .18 for i in x], [r['candidate_ms'] for r in selected], width=.36, label='candidate', color=colors[2])
    axes[2].set_xticks(x, [r['kind'] + '\n' + r['stage'] for r in selected], fontsize=8, rotation=25)
    axes[2].set_ylabel('Median milliseconds')
    axes[2].set_title('PHP import and AST stages, n=1024')
    axes[2].legend(fontsize=8)
    axes[2].grid(axis='y', alpha=.2)
    figure.suptitle('Pinned main vs proposed changes; lower is faster; compare within each engine')
    chart = output.parent / 'charts'
    chart.mkdir(exist_ok=True)
    figure.savefig(chart / 'deep-review.svg', metadata={'Date': None})
    plt.close(figure)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('session', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    render(args.session, args.output)
