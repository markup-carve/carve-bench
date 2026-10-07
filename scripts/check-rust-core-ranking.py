#!/usr/bin/env python3
"""Compare merged Rust revisions and pulldown on the retained core fixtures."""
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import statistics
import subprocess
import time

ROOT = Path(__file__).resolve().parent.parent


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rust-binaries', type=Path, required=True)
    parser.add_argument('--build-manifest', type=Path, default=ROOT / 'reports/paired-full-feature.json')
    parser.add_argument('--core-controls', type=Path, default=ROOT / 'reports/dev-main-core-audit-20261006.json')
    parser.add_argument('--output', type=Path, default=ROOT / 'reports/rust-core-ranking.json')
    args = parser.parse_args()
    if not __debug__:
        parser.error('Assertions must remain enabled')
    affinity = sorted(os.sched_getaffinity(0))
    if len(affinity) != 1:
        parser.error('Run on one CPU with taskset')
    checkpoint = args.output.with_suffix('.jsonl')
    if args.output.exists() or checkpoint.exists():
        parser.error('Output already exists')
    producer_hash = digest(Path(__file__))
    manifest_hash = digest(args.build_manifest)
    checkout_commit = subprocess.check_output(['git', '-C', str(ROOT), 'rev-parse', 'HEAD'], text=True).strip()
    manifest = json.loads(args.build_manifest.read_text())
    core = json.loads(args.core_controls.read_text())
    assert affinity == manifest['metadata']['cpu_affinity']
    sources = {}
    for revision in ['before', 'after']:
        source = manifest['metadata']['sources'][revision]['rs']
        binary = args.rust_binaries / f'{revision}-rs-compare'
        assert digest(binary) == source['control_binary_sha256']
        assert source['repository'] == 'https://github.com/markup-carve/carve-rs'
        sources[revision] = source
    assert sources['before']['lock_sha256'] == sources['after']['lock_sha256'], 'Peer dependency versions must match'
    assert digest(ROOT / 'engines/rs/src/compare.rs') == manifest['metadata']['harness_sha256']['engines/rs/src/compare.rs']
    core_hash = digest(args.core_controls)
    files = {'carve-rs': ROOT / 'corpus/dev-main-core/carve.crv',
             'pulldown-cmark': ROOT / 'corpus/dev-main-core/markdown.md'}
    controls = {row['engine']: row for row in core['controls']}
    for engine, file in files.items():
        assert digest(file) == controls[engine]['source_sha256']
    started = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    load_start = os.getloadavg()
    environment = {k: v for k, v in os.environ.items() if not k.startswith('CARVE_')}
    checkpoint.write_text(json.dumps({'metadata': {'sources': sources, 'started_at': started, 'producer_sha256': producer_hash, 'build_manifest_sha256': manifest_hash, 'core_controls_sha256': core_hash, 'cpu_affinity': affinity}}) + '\n')
    records = []
    for round_index in range(8):
        lanes = [('before', 'carve-rs'), ('after', 'carve-rs'),
                 ('before', 'pulldown-cmark'), ('after', 'pulldown-cmark')]
        if round_index % 2:
            lanes.reverse()
        for revision, engine in lanes:
            binary = args.rust_binaries / f'{revision}-rs-compare'
            result = json.loads(subprocess.check_output(
                [str(binary), engine, str(files[engine]), '3000', '3'], text=True, env=environment))
            output = bytes.fromhex(result.pop('output_hex'))
            assert hashlib.sha256(output).hexdigest() == controls[engine]['output_sha256']
            assert result['bytes'] == files[engine].stat().st_size
            assert len(result['samples']) == 3 and all(math.isfinite(v) and v > 0 for v in result['samples'])
            if engine == 'carve-rs':
                assert sources[revision]['commit'].startswith(result['carve_source'].rsplit(' @ ', 1)[1].rstrip(')'))
                result['carve_source'] = f"carve-rs (merged main {sources[revision]['commit']})"
            result.update(round=round_index + 1, revision=revision,
                          output_sha256=hashlib.sha256(output).hexdigest(), source_sha256=digest(files[engine]),
                          timed_windows_ms=[sample * 3000 for sample in result['samples']], load=os.getloadavg())
            records.append(result)
            with checkpoint.open('a') as stream:
                stream.write(json.dumps(result) + '\n')
            print(round_index + 1, revision, engine, statistics.median(result['samples']), flush=True)
    summary = []
    for revision in ['before', 'after']:
        rows = []
        for engine, file in files.items():
            median = statistics.median([sample for row in records
                if row['revision'] == revision and row['engine'] == engine for sample in row['samples']])
            rows.append({'engine': engine, 'median_ms': median,
                         'mb_per_s': file.stat().st_size / 1048576 / (median / 1000)})
        paired_gaps = []
        for round_number in range(1, 9):
            pair = {row['engine']: statistics.median(row['samples']) for row in records
                    if row['revision'] == revision and row['round'] == round_number}
            paired_gaps.append(100 * (files['carve-rs'].stat().st_size / files['pulldown-cmark'].stat().st_size
                                    * pair['pulldown-cmark'] / pair['carve-rs'] - 1))
        summary.append({'revision': revision, 'engines': rows,
                        'carve_throughput_gap_percent': 100 * (rows[0]['mb_per_s'] / rows[1]['mb_per_s'] - 1),
                        'per_round_throughput_gaps_percent': paired_gaps,
                        'median_per_round_gap_percent': statistics.median(paired_gaps),
                        'ranking_status': 'varies-across-rounds' if min(paired_gaps) <= 0 <= max(paired_gaps) else 'observed-carve-lead' if min(paired_gaps) > 0 else 'observed-pulldown-lead',
                        'per_round_gap_range_percent': [min(paired_gaps), max(paired_gaps)]})
    for revision in ['before', 'after']:
        assert digest(args.rust_binaries / f'{revision}-rs-compare') == sources[revision]['control_binary_sha256']
    for engine, file in files.items():
        assert digest(file) == controls[engine]['source_sha256']
    assert digest(Path(__file__)) == producer_hash
    assert digest(args.build_manifest) == manifest_hash
    assert digest(args.core_controls) == core_hash
    assert subprocess.check_output(['git', '-C', str(ROOT), 'rev-parse', 'HEAD'], text=True).strip() == checkout_commit
    report = {'metadata': {'started_at': started, 'completed_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'cpu_affinity': affinity, 'load_average_start': load_start, 'load_average_end': os.getloadavg(),
        'producer_sha256': producer_hash, 'build_manifest_sha256': manifest_hash, 'core_controls_sha256': core_hash, 'core_controls_report': str(args.core_controls),
        'benchmark_checkout_commit': checkout_commit, 'cpu': manifest['metadata']['cpu'],
        'platform': manifest['metadata']['platform'], 'build_settings': manifest['metadata']['build_settings'],
        'sources': sources, 'iterations': 3000, 'trials': 3, 'warmup': 20, 'rounds': 8,
        'method': 'Reversed order on alternating rounds. Median of all 24 samples per lane. Shared-host observations, not significance estimates.'},
        'records': records, 'summary': summary}
    args.output.write_text(json.dumps(report, indent=2) + '\n')
    checkpoint.unlink()
    print(json.dumps(summary), flush=True)


if __name__ == '__main__':
    main()
