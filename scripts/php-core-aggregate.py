#!/usr/bin/env python3
"""Combine the two pinned PHP direct-route timing sessions."""

import hashlib
import json
from pathlib import Path
import statistics


ROOT = Path(__file__).resolve().parent.parent
SESSION_PATHS = [
    ROOT / 'reports/php-core-recheck-runs/20261021-a.json',
    ROOT / 'reports/php-core-recheck-runs/20261021-b.json',
]
OUTPUT = ROOT / 'reports/php-core-recheck-20261021.json'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def median(values):
    assert values and all(value > 0 for value in values)
    return statistics.median(values)


def main():
    if not __debug__ or OUTPUT.exists():
        raise SystemExit('Assertions must be enabled and output must be new')
    sessions = [json.loads(path.read_text()) for path in SESSION_PATHS]
    first = sessions[0]
    snapshot = json.loads((ROOT / 'reports/dev-main-core.json').read_text())
    controls = {row['engine']: row for row in snapshot['controls']}
    keys = ['carve_engine_commit', 'djot_reference', 'benchmark_checkout_commit', 'benchmark_snapshot_sha256', 'worker_sha256', 'runner_sha256', 'cpu_affinity', 'php']
    for session in sessions:
        assert session['schema'] == 1 and len(session['rounds']) == 16
        assert all(session['metadata'][key] == first['metadata'][key] for key in keys)
        assert session['metadata']['worker_sha256'] == digest(ROOT / 'engines/php/compare-cpu.php')
        assert session['metadata']['runner_sha256'] == digest(ROOT / 'scripts/php-core-recheck.py')
        assert session['metadata']['benchmark_snapshot_sha256'] == digest(ROOT / 'reports/dev-main-core.json')
        for entry in session['rounds']:
            for engine in ['carve-php', 'djot-php']:
                row = entry['rows'][engine]
                assert row['source_sha256'] == controls[engine]['source_sha256']
                assert row['output_sha256'] == controls[engine]['output_sha256']
                assert row['jit'] is True and len(row['cpu_samples_ms']) == 5
    rounds = []
    for path, session in zip(SESSION_PATHS, sessions):
        for entry in session['rounds']:
            rounds.append({**entry, 'index': len(rounds), 'session': path.name})
    engines = {}
    for engine in ['carve-php', 'djot-php']:
        values = [sample for entry in rounds for sample in entry['rows'][engine]['cpu_samples_ms']]
        engines[engine] = {
            'pooled_median_cpu_ms': median(values),
            'bytes': first['summary']['engines'][engine]['bytes'],
        }
    ratios = [median(entry['rows']['carve-php']['cpu_samples_ms'])
              / median(entry['rows']['djot-php']['cpu_samples_ms']) for entry in rounds]
    metadata = dict(first['metadata'])
    metadata.update({
        'completed_at': sessions[-1]['metadata']['completed_at'],
        'load_start_1m_range': [min(session['metadata']['load_start_1m_range'][0] for session in sessions),
                                max(session['metadata']['load_start_1m_range'][1] for session in sessions)],
        'method': 'Two sessions, 32 alternating rounds; each worker warms for 30 conversions and measures five batches of 60. Process user plus system CPU excludes startup.',
    })
    report = {
        'schema': 1,
        'metadata': metadata,
        'sessions': [{'path': str(path.relative_to(ROOT)), 'sha256': digest(path), 'rounds': len(session['rounds'])}
                     for path, session in zip(SESSION_PATHS, sessions)],
        'rounds': rounds,
        'summary': {
            'engines': engines,
            'median_paired_carve_over_djot_cpu': median(ratios),
            'carve_faster_rounds': sum(ratio < 1 for ratio in ratios),
            'paired_ratio_range': [min(ratios), max(ratios)],
        },
    }
    OUTPUT.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report['summary']))


if __name__ == '__main__':
    main()
