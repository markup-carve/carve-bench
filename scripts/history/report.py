#!/usr/bin/env python3
"""Create portable history graphs from recorded samples."""
import csv
import hashlib
import html
import json
import math
import statistics
from pathlib import Path
import sys
import run

COLORS = ['#2563eb', '#c026d3', '#059669', '#d97706', '#dc2626', '#0891b2', '#7c3aed', '#475569']


def graph(engine, data):
    revisions = [r['label'] for r in data['revisions']]
    n = max(row['n'] for row in data['rows'])
    cases = list(dict.fromkeys(row['case'] for row in data['rows']))
    index = {(r['revision'],r['case'],r['n']):r for r in data['rows']}
    ratios = [index[label,case,n][field]/index[revisions[0],case,n]['median_ms'] for label in revisions for case in cases for field in ('min_ms', 'median_ms', 'max_ms')]
    low,high = math.log10(min(ratios))-.08,math.log10(max(ratios))+.08
    x = lambda i: 85+i*680/max(1,len(revisions)-1)
    y = lambda value: 310-(math.log10(value)-low)/(high-low)*240
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 560" role="img" aria-labelledby="title desc"><title id="title">'+html.escape(engine)+' engine version history</title><desc id="desc">Median elapsed time relative to the oldest tag, log scale. Lower is faster. Lines connect identical output only.</desc><style>text{font:13px system-ui;fill:#172033}.bg{fill:#fff}.grid{stroke:#cbd5e1}@media(prefers-color-scheme:dark){text{fill:#edf2f7}.bg{fill:#152033}.grid{stroke:#475569}}</style><rect class="bg" width="850" height="560"/><text x="35" y="28" font-weight="bold">'+html.escape(engine)+f' · n={n} · time / oldest tag (lower is faster)</text>']
    ticks=[10**(low+(high-low)*i/4) for i in range(5)]
    parts.append('<text x="35" y="49">Each case starts at its own 1× baseline. Equal ratios do not mean equal milliseconds.</text>')
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
            parts.append(f'<line x1="{xx}" x2="{xx}" y1="{y(row["min_ms"]/baseline["median_ms"])}" y2="{y(row["max_ms"]/baseline["median_ms"])}" stroke="{color}" stroke-width="3" opacity=".3"/>')
            fill=color if row['output_sha256']==baseline['output_sha256'] else 'none'
            parts.append(f'<circle cx="{xx}" cy="{yy}" r="5" fill="{fill}" stroke="{color}" stroke-width="2"><title>{html.escape(case)} {html.escape(label)}: {row["median_ms"]:.3f} ms</title></circle>')
            previous=xx,yy,row['output_sha256']
        lx=35+(ci%2)*410;ly=380+(ci//2)*26
        case_label=html.escape(case+' (import)' if case.startswith('html_') else case)
        parts.append(f'<line x1="{lx}" x2="{lx+20}" y1="{ly}" y2="{ly}" stroke="{color}" stroke-width="3"/><text x="{lx+28}" y="{ly+4}">{case_label} ({baseline["median_ms"]:.3f} ms)</text>')
    parts.append('<text x="35" y="530">Whiskers show sample ranges. Hollow points and gaps mark output changes.</text></svg>')
    return ''.join(parts)


def validate_measurements(data):
    if data.get('measurement_signature') != run.measurement_signature((Path(__file__).parent/'run.py').read_text()):
        raise ValueError('History fixture or measurement function changed; refresh measurements')
    for engine,snapshot in data['engines'].items():
        session=snapshot.get('measurement_session') or data
        if session.get('measurement_signature') != data['measurement_signature']:
            raise ValueError('History session timing signature differs')
        for field in ('sizes','rounds','samples_per_round'):
            if session.get(field,data.get(field))!=data.get(field):
                raise ValueError('History session sampling settings differ')
        rows=snapshot['rows']
        cases=snapshot.get('cases') or sorted({row['case'] for row in rows})
        sizes=data.get('sizes') or sorted({row['n'] for row in rows})
        expected_rows={(revision['label'],case,n) for revision in snapshot['revisions'] for case in cases for n in sizes}
        actual_rows={(row['revision'],row['case'],row['n']) for row in rows}
        if len(actual_rows)!=len(rows) or actual_rows!=expected_rows:
            raise ValueError('History rows do not cover each revision, case and size exactly once')
        worker={'js':'worker.mjs','php':'worker.php','rs':'worker.rs'}[engine]
        expected_worker=(snapshot.get('measurement_session') or data)['harness_sha256'][worker]
        for label, point in snapshot.get('point_sessions', {}).items():
            if label not in {revision['label'] for revision in snapshot['revisions']}:
                raise ValueError('History point names an unknown revision')
            if point.get('measurement_signature') != data['measurement_signature']:
                raise ValueError('History point timing signature differs')
            if point.get('harness_sha256', {}).get(worker) != expected_worker:
                raise ValueError('History point worker differs')
        if hashlib.sha256((Path(__file__).parent/worker).read_bytes()).hexdigest()!=expected_worker:
            raise ValueError('History worker changed; refresh measurements')
        for row in snapshot['rows']:
            expected=hashlib.sha256(run.fixture(row['case'],row['n']).encode()).hexdigest()
            if expected!=row['fixture_sha256']:raise ValueError('History fixture does not match recorded input')
            runs=row.get('samples',[])
            if len(runs)!=data['rounds'] or any(len(sample['samples_ms'])!=data['samples_per_round'] for sample in runs):
                raise ValueError('History sample count differs from the recorded rounds')
            times=[value for sample in runs for value in sample['samples_ms']]
            if any(not (0<value<float('inf')) for value in times) or any(sample['hash']!=row['output_sha256'] for sample in runs):
                raise ValueError('History samples contain invalid timings or changed output')
            if (statistics.median(times),min(times),max(times))!=(row['median_ms'],row['min_ms'],row['max_ms']):
                raise ValueError('History summary differs from recorded samples')


def build(path):
    data=json.loads(path.read_text());prefix=path.with_suffix('');directory=path.parent
    if data['schema']!=1: raise ValueError('Unknown history schema')
    validate_measurements(data)
    fields=['engine','revision','sha','case','n','median_ms','min_ms','max_ms','change_vs_oldest_pct','same_output_as_oldest','same_output_as_latest_tag']
    report=['# Engine release history','',f"Retained sessions began {data['generated_at']}. {data.get('tags_per_engine',4)} stable tags per engine plus a pinned dev-main when measured source differs from the newest tag.",'','Median elapsed milliseconds; lower is faster. Each revision uses the same fixtures; runtime versions are recorded for each engine and revision. Samples exclude process startup. Node warms each workload for at least 500 ms and a minimum iteration count. Rust uses an optimized release build; PHP has CLI opcache/JIT and coverage disabled. These settings differ from the headline benchmark, so compare revisions within this history rather than mixing report numbers.','','The host is shared. CPU affinity does not reserve a core. Raw samples, minimum/maximum times, load averages, source fingerprints, runtime versions and worker hashes are in the JSON. A changed output hash means the timing is for different work. Each case has its own oldest-tag baseline of 1×; equal starting ratios do not mean equal milliseconds. The legend lists those baseline times. Graphs use a logarithmic time ratio and connect points only when their output hashes agree.','','[Interactive history](engine-history.html) · [Raw JSON](engine-history.json) · [CSV](engine-history.csv)','']
    if data.get('session_note'):
        report += ['## Measurement sessions', '', data['session_note'], '']
        for engine, snapshot in data['engines'].items():
            session = snapshot.get('measurement_session', {})
            report += [f"{engine} retained measurements: driver `{session.get('benchmark_commit', data['benchmark_commit'])}`, session started {session.get('generated_at', data['generated_at'])}, CPU affinity {session.get('cpu_affinity', data.get('cpu_affinity'))}; dirty benchmark tree: {session.get('benchmark_dirty',data.get('benchmark_dirty'))}.", '']
    for engine, snapshot in data['engines'].items():
        for label, point in snapshot.get('point_sessions', {}).items():
            if point.get("window_note"): report += [point["window_note"], ""]
            report += [f"{engine} {label} refresh: {point.get('started_at', point.get('generated_at', 'not recorded'))} to {point.get('finished_at', 'not recorded')}; driver `{point.get('benchmark_commit', 'unknown')}`, CPU affinity {point.get('cpu_affinity', 'not recorded')}; dirty benchmark tree: {point.get('benchmark_dirty', 'not recorded')}. [Point provenance]({point.get('file', 'engine-history.json')}).", '']
    if not data.get('session_note'):
        report += [f"Timing driver: `{data.get('benchmark_commit','unknown')}`; CPU affinity: {data.get('cpu_affinity')}; dirty benchmark tree: {data.get('benchmark_dirty')}. Report generation may use later metadata-only corrections.", '']
    report += ['## Shared-host spread', '', f"Retained session initial load average: {data.get('initial_load', 'not recorded')}. Final load average: {data.get('final_load', 'not recorded')}. Whiskers show sample ranges; medians from noisy sessions are descriptive readings, not confirmed speed changes.", '']
    for engine, snapshot in data['engines'].items():
        for label, point in snapshot.get('point_sessions', {}).items():
            report += [f"{engine} {label} refresh load average: initial {point.get('initial_load', 'not recorded')}; final {point.get('final_load', 'not recorded')}.", '']
    for engine, snapshot in data['engines'].items():
        ranges = [(row['max_ms'] / row['min_ms'], row) for row in snapshot['rows']]
        ratio, row = max(ranges, key=lambda item: item[0])
        report += [f"{engine}: widest sample range is {ratio:.1f}x for {row['revision']} {row['case']} n={row['n']} ({row['min_ms']:.3f} to {row['max_ms']:.3f} ms). Inspect round medians in the JSON before attributing a difference to code.", '']
    watchpoints=[]
    uncertain=[]
    for engine, snapshot in data['engines'].items():
        tags=[r['label'] for r in snapshot['revisions'] if r['label']!='dev-main' and r.get('kind')!='candidate']
        points={r['label'] for r in snapshot['revisions'] if r['label']=='dev-main' or r.get('kind')=='candidate'} or {tags[-1]}
        if snapshot.get('main_alias'):points.add(snapshot['main_alias']['same_source_as'])
        index={(r['revision'],r['case'],r['n']):r for r in snapshot['rows']}
        for row in snapshot['rows']:
            if row['revision'] not in points: continue
            for label in tags:
                previous=index[label,row['case'],row['n']]
                change=100*(row['median_ms']/previous['median_ms']-1)
                if change>=100 and row['output_sha256']==previous['output_sha256']:
                    reading = f"- {engine} {row['revision']} {row['case']} n={row['n']}: {row['median_ms']:.3f} ms versus {previous['median_ms']:.3f} ms on {label} ({change:+.1f}%)."
                    if row['min_ms'] <= previous['max_ms'] and previous['min_ms'] <= row['max_ms']:
                        uncertain.append(reading + ' Sample ranges overlap; this session does not establish a +100% regression.')
                    else:
                        watchpoints.append(reading + ' Output hashes match and sample ranges are separate; a paired run is needed to attribute the difference.')
    checks = '[Longer paired cost checks](history-watchpoint-controls.md)' if (directory / 'history-watchpoint-controls.md').exists() else ''
    if watchpoints:
        report += ['## Watchpoints', '', checks, '', *watchpoints, '']
    if uncertain:
        report += ['## Uncertain +100% readings', '', checks, '', *uncertain, '']
    csvrows=[]
    for engine,d in data['engines'].items():
        if not d['rows']: raise ValueError('Missing measured rows')
        revisions=[r['label'] for r in d['revisions']];index={(r['revision'],r['case'],r['n']):r for r in d['rows']};latest=next(r['label'] for r in reversed(d['revisions']) if r['label']!='dev-main' and r.get('kind')!='candidate');sha={r['label']:r['sha'] for r in d['revisions']}
        report += [f'## {engine}', '', f"Runtime: {d['runtime']}. Latest tag: {latest}.",'',f'![{engine} history](engine-history-{engine}.svg)','', '| Revision | Commit |','|---|---|']+[f'| {r["label"]} | `{r["sha"]}` |' for r in d['revisions']]+['']
        if d['main_alias']:report += [f"dev-main `{d['main_alias']['sha']}` has the same measured source as {d['main_alias']['same_source_as']}; it reuses that point.",'']
        for candidate in d.get('candidate_aliases',[]):
            report += [f"{candidate['label']} `{candidate['sha']}` has the same measured source as {candidate['same_source_as']}; it reuses that point.",'']
        for note in d.get('measurement_notes',[]):report += [note,'']
        report += ['| Point | Case | n | Latest tag ms | Point ms | vs tag | Main ms | vs main | Same output as tag | Tag range ms | Point range ms |','|---|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|']
        points={r['label'] for r in d['revisions'] if r['label']=='dev-main' or r.get('kind')=='candidate'} or {latest}
        if d.get('main_alias'):points.add(d['main_alias']['same_source_as'])
        for r in d['rows']:
            oldest=index[revisions[0],r['case'],r['n']];tag=index[latest,r['case'],r['n']]
            csvrows.append(dict(engine=engine,revision=r['revision'],sha=sha[r['revision']],case=r['case'],n=r['n'],median_ms=r['median_ms'],min_ms=r['min_ms'],max_ms=r['max_ms'],change_vs_oldest_pct=100*(r['median_ms']/oldest['median_ms']-1) if r['output_sha256']==oldest['output_sha256'] else '',same_output_as_oldest=r['output_sha256']==oldest['output_sha256'],same_output_as_latest_tag=r['output_sha256']==tag['output_sha256']))
            if r['revision'] in points:
                change=100*(r['median_ms']/tag['median_ms']-1);same=r['output_sha256']==tag['output_sha256']
                change_text=f'{change:+.1f}%' if same else 'n/a: different output'
                main_label=d['main_alias']['same_source_as'] if d.get('main_alias') else 'dev-main'
                main=index.get((main_label,r['case'],r['n']))
                main_ms=f'{main["median_ms"]:.3f}' if main else 'n/a'
                main_change=(f'{100*(r["median_ms"]/main["median_ms"]-1):+.1f}%' if r['output_sha256']==main['output_sha256'] else 'different output') if main else 'n/a'
                report.append(f'| {r["revision"]} | {r["case"]} | {r["n"]} | {tag["median_ms"]:.3f} | {r["median_ms"]:.3f} | {change_text} | {main_ms} | {main_change} | {"yes" if same else "no"} | {tag["min_ms"]:.3f} to {tag["max_ms"]:.3f} | {r["min_ms"]:.3f} to {r["max_ms"]:.3f} |')
        report.append('');(directory/f'{prefix.name}-{engine}.svg').write_text(graph(engine,d))
    with prefix.with_suffix('.csv').open('w',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=fields,lineterminator='\n');writer.writeheader();writer.writerows(csvrows)
    prefix.with_suffix('.md').write_text(('\n'.join(report)+'\n').replace('engine-history.', prefix.name + '.').replace('engine-history-', prefix.name + '-'))
    template=(Path(__file__).parent/'viewer.html').read_text()
    template=template.replace('Four release tags',f"{data.get('tags_per_engine',4)} release tags").replace('engine-history.', prefix.name + '.').replace('HISTORY_DATA',json.dumps(data).replace('<','\\u003c'))
    template=template.replace('HISTORY_STATIC',''.join(f'<figure><img src="{prefix.name}-{e}.svg" alt="{html.escape(e)} history"><figcaption><a href="{prefix.name}-{e}.svg" download>Download {html.escape(e)} SVG</a></figcaption></figure>' for e in data['engines']))
    prefix.with_suffix('.html').write_text(template)
    if prefix.name == "engine-history":
        latest_comparison(data, directory)


def latest_comparison(d, directory):
    rows=[]
    body=['# Latest merged main versus the last two retained tags','','Release tags retain their original history measurements; each main point records its refresh session in the raw JSON. Check the recorded sessions and build configurations before attributing a difference to code. Lower milliseconds are faster. Percentage differences appear only when output hashes match; they do not isolate code speedups. Sample ranges and source/build provenance are in the [history report](engine-history.md) and [raw JSON](engine-history.json).','','| Engine | Main commit | Recent tags |','|---|---|---|']
    for engine,s in d['engines'].items():
     if not any(x['label']=='dev-main' for x in s['revisions']):continue
     tags=[x['label'] for x in s['revisions'] if x['label']!='dev-main' and x.get('kind')!='candidate'][-2:];main=next(x for x in s['revisions'] if x['label']=='dev-main');body.append(f'| {engine} | `{main["sha"]}` | {", ".join(tags)} |')
     index={(x['revision'],x['case'],x['n']):x for x in s['rows']}
     for x in s['rows']:
      if x['revision']!='dev-main':continue
      for tag in tags:
       old=index[tag,x['case'],x['n']];same=old['output_sha256']==x['output_sha256'];rows.append({'engine':engine,'case':x['case'],'n':x['n'],'tag':tag,'tag_ms':old['median_ms'],'main_ms':x['median_ms'],'change_percent':100*(x['median_ms']/old['median_ms']-1) if same else '', 'same_output':same})
    body += ['', '[CSV](latest-main-comparison.csv)', '', '| Engine | Case | n | Tag | Tag ms | Main ms | Change |', '|---|---|---:|---|---:|---:|---:|']
    for x in rows:
     change=f'{x["change_percent"]:+.1f}%' if x['same_output'] else 'n/a: different output';body.append(f'| {x["engine"]} | {x["case"]} | {x["n"]} | {x["tag"]} | {x["tag_ms"]:.3f} | {x["main_ms"]:.3f} | {change} |')
    (directory/'latest-main-comparison.md').write_text('\n'.join(body)+'\n')
    with (directory/'latest-main-comparison.csv').open('w') as f:
     w=csv.DictWriter(f,fieldnames=["engine", "case", "n", "tag", "tag_ms", "main_ms", "change_percent", "same_output"],lineterminator='\n');w.writeheader();w.writerows(rows)


if __name__=='__main__':build(Path(sys.argv[1]))
