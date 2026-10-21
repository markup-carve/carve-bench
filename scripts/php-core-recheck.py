#!/usr/bin/env python3
"""Measure merged carve-php and locked djot-php on the pinned direct HTML input."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import statistics
import subprocess
import time


ROOT = Path(__file__).resolve().parent.parent
PHP_ARGS = [
    'php', '-n', '-d', 'extension=ctype', '-d', 'extension=mbstring',
    '-d', 'opcache.enable_cli=1', '-d', 'opcache.jit_buffer_size=128M',
    '-d', 'opcache.jit=tracing',
]


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def git(tree, *args):
    return subprocess.check_output(['git', '-C', str(tree), *args], text=True).strip()


def median(values):
    assert values and all(value > 0 for value in values)
    return statistics.median(values)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--carve-php', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=ROOT / 'reports/php-core-recheck-20261021.json')
    parser.add_argument('--rounds', type=int, default=16)
    parser.add_argument('--max-load', type=float, default=20)
    args = parser.parse_args()
    if not __debug__ or args.rounds < 2 or args.output.exists():
        parser.error('Assertions must be enabled, rounds must be at least two, and output must be new')
    affinity = sorted(os.sched_getaffinity(0))
    if len(affinity) != 1:
        parser.error('Pin the process to one CPU with taskset')
    php_tree = args.carve_php.resolve()
    php_commit = git(php_tree, 'rev-parse', 'HEAD')
    if git(php_tree, 'status', '--porcelain'):
        parser.error('Carve PHP checkout must be clean')
    if git(ROOT, 'status', '--porcelain'):
        parser.error('Benchmark checkout must be clean; write the output outside the checkout')
    source = ROOT / 'reports/dev-main-core.json'
    snapshot_hash = sha256(source)
    snapshot = json.loads(source.read_text())
    lock = json.loads((ROOT / 'engines/php/composer.lock').read_text())
    djot_ref = next(pkg['source']['reference'] for pkg in lock['packages'] if pkg['name'] == 'php-collective/djot')
    assert djot_ref == snapshot['metadata']['php_dependencies']['php-collective/djot']['reference']
    controls = {row['engine']: row for row in snapshot['controls']}
    paths = {
        'carve-php': ROOT / 'corpus/dev-main-core/carve.crv',
        'djot-php': ROOT / 'corpus/dev-main-core/djot.dj',
    }
    for engine, path in paths.items():
        assert sha256(path) == controls[engine]['source_sha256']
    worker = ROOT / 'engines/php/compare-cpu.php'
    worker_hash = sha256(worker)
    runner_hash = sha256(Path(__file__))
    started = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    rounds = []
    loads = []
    for index in range(args.rounds):
        while os.getloadavg()[0] > args.max_load:
            time.sleep(10)
        loads.append(os.getloadavg()[0])
        order = ['carve-php', 'djot-php'] if index % 2 == 0 else ['djot-php', 'carve-php']
        rows = {}
        for engine in order:
            env = os.environ.copy()
            env['CARVE_PHP_SRC'] = str(php_tree / 'src')
            cmd = PHP_ARGS + [str(worker), engine, str(paths[engine]), '60', '5']
            row = json.loads(subprocess.check_output(cmd, cwd=ROOT, env=env, text=True))
            assert row['engine'] == engine and row['jit'] is True
            assert row['source_sha256'] == controls[engine]['source_sha256']
            assert row['output_sha256'] == controls[engine]['output_sha256']
            assert len(row['cpu_samples_ms']) == 5 and row['iterations'] == 60
            if engine == 'carve-php':
                assert str(php_tree) in row['carve_source']
                assert php_commit[:8] in row['carve_source']
            rows[engine] = row
        rounds.append({'index': index, 'order': order, 'rows': rows})
        print('round', index + 1, 'of', args.rounds, flush=True)
    assert sha256(worker) == worker_hash and sha256(Path(__file__)) == runner_hash and sha256(source) == snapshot_hash
    summary = {}
    for engine in paths:
        values = [sample for entry in rounds for sample in entry['rows'][engine]['cpu_samples_ms']]
        summary[engine] = {
            'pooled_median_cpu_ms': median(values),
            'bytes': paths[engine].stat().st_size,
        }
    ratios = [median(entry['rows']['carve-php']['cpu_samples_ms'])
              / median(entry['rows']['djot-php']['cpu_samples_ms']) for entry in rounds]
    report = {
        'schema': 1,
        'metadata': {
            'started_at': started,
            'completed_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'carve_engine_commit': php_commit,
            'djot_reference': djot_ref,
            'benchmark_checkout_commit': git(ROOT, 'rev-parse', 'HEAD'),
            'benchmark_snapshot_sha256': snapshot_hash,
            'worker_sha256': worker_hash,
            'runner_sha256': runner_hash,
            'cpu_affinity': affinity,
            'php': subprocess.check_output(['php', '-n', '-v'], text=True).splitlines()[0],
            'load_start_1m_range': [min(loads), max(loads)],
            'method': 'Alternating order; 30 warmups, five batches of 60 conversions per worker and round; process user plus system CPU time excludes startup.',
        },
        'rounds': rounds,
        'summary': {
            'engines': summary,
            'median_paired_carve_over_djot_cpu': median(ratios),
            'carve_faster_rounds': sum(ratio < 1 for ratio in ratios),
            'paired_ratio_range': [min(ratios), max(ratios)],
        },
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report['summary']), flush=True)


if __name__ == '__main__':
    main()
