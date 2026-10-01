#!/usr/bin/env python3
"""Create portable history graphs from recorded samples."""
import csv
import html
import json
import math
from pathlib import Path
import sys

COLORS = ['#2563eb', '#c026d3', '#059669', '#d97706', '#dc2626', '#0891b2', '#7c3aed', '#475569']


def graph(engine, data):
    revisions = [r['label'] for r in data['revisions']]
    n = max(row['n'] for row in data['rows'])
    cases = list(dict.fromkeys(row['case'] for row in data['rows']))
    index = {(r['revision'],r['case'],r['n']):r for r in data['rows']}
    ratios = [index[label,case,n]['median_ms']/index[revisions[0],case,n]['median_ms'] for label in revisions for case in cases]
    low,high = math.log10(min(ratios))-.08,math.log10(max(ratios))+.08
    x = lambda i: 85+i*680/max(1,len(revisions)-1)
    y = lambda value: 310-(math.log10(value)-low)/(high-low)*240
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 510" role="img" aria-labelledby="title desc"><title id="title">'+html.escape(engine)+' engine version history</title><desc id="desc">Median elapsed time relative to the oldest tag, log scale. Lower is faster. Lines connect identical output only.</desc><style>text{font:13px system-ui;fill:#172033}.bg{fill:#fff}.grid{stroke:#cbd5e1}@media(prefers-color-scheme:dark){text{fill:#edf2f7}.bg{fill:#152033}.grid{stroke:#475569}}</style><rect class="bg" width="850" height="510"/><text x="35" y="28" font-weight="bold">'+html.escape(engine)+f' · n={n} · time / oldest tag (lower is faster)</text>']
    ticks=[10**(low+(high-low)*i/4) for i in range(5)]
    for tick in ticks:
        yy=y(tick);parts.append(f'<line class="grid" x1="85" x2="765" y1="{yy}" y2="{yy}"/><text x="25" y="{yy+5}">{tick:.2g}×</text>')
    for i,label in enumerate(revisions):
        parts.append(f'<text x="{x(i)}" y="337" text-anchor="middle">{html.escape(label)}</text>')
    for ci,case in enumerate(cases):
        color=COLORS[ci%len(COLORS)];baseline=index[revisions[0],case,n]
        previous=None
        for i,label in enumerate(revisions):
            row=index[label,case,n];xx,yy=x(i),y(row['median_ms']/baseline['median_ms'])
            if previous and previous[2]==row['output_sha256']:
                parts.append(f'<line x1="{previous[0]}" y1="{previous[1]}" x2="{xx}" y2="{yy}" stroke="{color}" stroke-width="2"/>')
            fill=color if row['output_sha256']==baseline['output_sha256'] else 'none'
            parts.append(f'<circle cx="{xx}" cy="{yy}" r="5" fill="{fill}" stroke="{color}" stroke-width="2"><title>{html.escape(case)} {html.escape(label)}: {row["median_ms"]:.3f} ms</title></circle>')
            previous=xx,yy,row['output_sha256']
        lx=35+(ci%3)*270;ly=380+(ci//3)*26
        parts.append(f'<line x1="{lx}" x2="{lx+20}" y1="{ly}" y2="{ly}" stroke="{color}" stroke-width="3"/><text x="{lx+28}" y="{ly+4}">{html.escape(case.replace('html_table','html_table (import)'))}</text>')
    parts.append('<text x="35" y="484">Hollow points differ from oldest-tag output. Gaps mark output changes.</text></svg>')
    return ''.join(parts)


def build(path):
    data=json.loads(path.read_text());prefix=path.with_suffix('');directory=path.parent
    if data['schema']!=1: raise ValueError('Unknown history schema')
    fields=['engine','revision','sha','case','n','median_ms','min_ms','max_ms','change_vs_oldest_pct','same_output_as_oldest','same_output_as_latest_tag']
    report=['# Engine release history','',f"Recorded {data['generated_at']}. {data.get('tags_per_engine',4)} stable tags per engine plus a pinned dev-main when measured source differs from the newest tag.",'','Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures and runtime within its engine. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.','','The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.','','[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)','']
    csvrows=[]
    for engine,d in data['engines'].items():
        if not d['rows']: raise ValueError('Missing measured rows')
        revisions=[r['label'] for r in d['revisions']];index={(r['revision'],r['case'],r['n']):r for r in d['rows']};latest=next(r['label'] for r in reversed(d['revisions']) if r['label']!='dev-main');sha={r['label']:r['sha'] for r in d['revisions']}
        report += [f'## {engine}', '', f"Runtime: {d['runtime']}. Latest tag: {latest}.",'',f'![{engine} history](engine-history-{engine}.svg)','', '| Revision | Commit |','|---|---|']+[f'| {r["label"]} | `{r["sha"]}` |' for r in d['revisions']]+['']
        if d['main_alias']:report += [f"dev-main `{d['main_alias']['sha']}` has the same measured source as {d['main_alias']['same_source_as']}; it reuses that point.",'']
        report += ['| Case | n | Latest tag ms | Last point ms | Change | Same output |','|---|---:|---:|---:|---:|:---:|']
        last=revisions[-1]
        for r in d['rows']:
            oldest=index[revisions[0],r['case'],r['n']];tag=index[latest,r['case'],r['n']]
            csvrows.append(dict(engine=engine,revision=r['revision'],sha=sha[r['revision']],case=r['case'],n=r['n'],median_ms=r['median_ms'],min_ms=r['min_ms'],max_ms=r['max_ms'],change_vs_oldest_pct=100*(r['median_ms']/oldest['median_ms']-1) if r['output_sha256']==oldest['output_sha256'] else '',same_output_as_oldest=r['output_sha256']==oldest['output_sha256'],same_output_as_latest_tag=r['output_sha256']==tag['output_sha256']))
            if r['revision']==last:
                change=100*(r['median_ms']/tag['median_ms']-1);same=r['output_sha256']==tag['output_sha256']
                change_text=f'{change:+.1f}%' if same else 'n/a: different output'
                report.append(f'| {r["case"]} | {r["n"]} | {tag["median_ms"]:.3f} | {r["median_ms"]:.3f} | {change_text} | {"yes" if same else "no"} |')
        report.append('');(directory/f'{prefix.name}-{engine}.svg').write_text(graph(engine,d))
    with prefix.with_suffix('.csv').open('w',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader();writer.writerows(csvrows)
    prefix.with_suffix('.md').write_text(('\n'.join(report)+'\n').replace('engine-history.', prefix.name + '.').replace('engine-history-', prefix.name + '-'))
    template=(Path(__file__).parent/'viewer.html').read_text()
    template=template.replace('Four release tags',f"{data.get('tags_per_engine',4)} release tags").replace('engine-history.', prefix.name + '.').replace('HISTORY_DATA',json.dumps(data).replace('<','\\u003c'))
    template=template.replace('HISTORY_STATIC',''.join(f'<figure><img src="{prefix.name}-{e}.svg" alt="{html.escape(e)} history"><figcaption><a href="{prefix.name}-{e}.svg" download>Download {html.escape(e)} SVG</a></figcaption></figure>' for e in data['engines']))
    prefix.with_suffix('.html').write_text(template)


if __name__=='__main__':build(Path(sys.argv[1]))
