#!/usr/bin/env python3
"""Plot complete HTML import comparison results as SVG and PNG."""
import argparse
import json
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import PercentFormatter

parser = argparse.ArgumentParser()
parser.add_argument('--results', type=Path, required=True)
parser.add_argument('--out-prefix', type=Path, required=True)
args = parser.parse_args()
data = json.loads((args.results / 'summary.json').read_text())
timings = json.loads((args.results / 'timings.json').read_text())
rows = [(name, row) for name, row in data.items() if row['ranked']]
if len(timings['pages']) != 10:
    raise ValueError('chart requires all ten corpus pages')
if len(rows) != 12 or not {'carve-js (dev main)', 'carve-rs (dev main)'}.issubset(data):
    raise ValueError('comparison chart requires both Carve engines and all ten original ranked tools')
if any(row['total'] != 273 for _, row in rows):
    raise ValueError('chart requires all 273 probes for every ranked tool')
for page in timings['pages'].values():
    for name, _ in rows:
        if name not in page['tools'] or page['tools'][name]['error']:
            raise ValueError(f'incomplete conversion for {name}')

labels = {'carve-js (dev main)': 'Carve JS · dev main', 'carve-rs (dev main)': 'Carve Rust · dev main',
    'html-to-markdown (py)': 'html-to-markdown · Python/Rust',
    'html-to-markdown (go)': 'html-to-markdown · Go'}
def color(name):
    return '#087f8c' if name.startswith('carve-rs') else '#bf5b20' if name.startswith('carve-js') else '#7396b5'

plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 11, 'svg.fonttype': 'none'})
def plot(kind):
    speed = kind == 'time'
    ordered = sorted(rows, key=lambda item: item[1]['total_ms'] if speed else (-item[1]['passed'], -(item[1]['retention'] or 0)))
    fig, ax = plt.subplots(figsize=(12.5, 7.8))
    fig.patch.set_facecolor('white')
    values = [row['total_ms'] if speed else row['passed'] / row['total'] for _, row in ordered]
    ax.barh(range(len(ordered)), values, color=[color(name) for name, _ in ordered], height=.64)
    ax.set_yticks(range(len(ordered)), [labels.get(name, name) + (' · CLI' if speed and timings['tools'][name].get('invocation', '').startswith('CLI') else '') for name, _ in ordered])
    ax.invert_yaxis()
    for i, ((name, row), value) in enumerate(zip(ordered, values)):
        label = f"{value:,.1f} ms" if speed else f"{row['passed']}/{row['total']} · {value:.1%}"
        ax.text(value + (max(values) * .012 if speed else .012), i, label, va='center', fontsize=10,
            weight='bold' if name.startswith('carve-') else 'normal', color='#243444')
    ax.set_axisbelow(True)
    ax.xaxis.grid(True, color='#e5eaf0', linewidth=.7)
    ax.tick_params(axis='both', length=0, labelcolor='#344454')
    for spine in ax.spines.values(): spine.set_visible(False)
    if speed:
        ax.set_xlim(0, max(values) * 1.23)
        ax.set_xlabel('Sum of per-page median conversion times · lower is faster', labelpad=14)
    else:
        ax.set_xlim(0, 1.23)
        ax.set_xticks([0, .2, .4, .6, .8, 1])
        ax.xaxis.set_major_formatter(PercentFormatter(1))
        ax.set_xlabel('Share of the 273 original probes passed · higher is better', labelpad=14)
    fig.text(.04, .955, 'HTML → Markdown: conversion time' if speed else 'HTML → Markdown: probes passed',
        fontsize=21, weight='bold', color='#182b3a')
    fig.text(.04, .913, 'Carve development builds added to Botmonster’s ten-page comparison', fontsize=12, color='#526474')
    revisions = ' · '.join(f"{'Rust' if 'rs ' in name else 'JS'} {timings['tools'][name]['version'][:8]}"
        for name, _ in rows if name.startswith('carve-'))
    method = f"{timings['reps']} repetitions · same host · CLI startup and worker IPC included · extractors retain their own behavior" if speed else 'Original probes and scorer unchanged · counts are not a universal fidelity score'
    fig.text(.04, .045, method, fontsize=9, color='#526474')
    fig.text(.04, .021, f'{revisions} · Inputs, versions and run metadata retained with the results', fontsize=9, color='#526474')
    fig.subplots_adjust(left=.295, right=.98, top=.865, bottom=.15)
    for extension in ['svg', 'png']:
        fig.savefig(f'{args.out_prefix}-{kind}.{extension}', dpi=200, facecolor='white')
    plt.close(fig)

args.out_prefix.parent.mkdir(parents=True, exist_ok=True)
plot('probes')
if all(row['total_ms'] is not None for _, row in rows):
    if len(timings['pages']) != 10 or any(len(page['tools'][name]['samples_ms']) != timings['reps']
        for page in timings['pages'].values() for name, _ in rows):
        raise ValueError('timing chart requires complete repetitions for all ten pages')
    plot('time')
