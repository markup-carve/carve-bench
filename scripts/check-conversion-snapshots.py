#!/usr/bin/env python3
"""Compare pinned merged revisions on the committed conversion inputs."""
import argparse
import hashlib
import json
import os
import math
from pathlib import Path
import statistics
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[1]


def command(args, **kwargs):
    return subprocess.check_output(args, cwd=ROOT, text=True, **kwargs).strip()


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('config', type=Path)
    parser.add_argument('--rust-binaries', required=True, type=Path,
                        help='Directory containing before-rs-compare and after-rs-compare from the paired build')
    parser.add_argument('--build-manifest', type=Path, default=ROOT / 'reports/paired-full-feature.json')
    parser.add_argument('--output', type=Path, default=ROOT / 'reports/conversion-snapshot-pairs.json')
    args = parser.parse_args()
    if not __debug__:
        parser.error('Run without Python optimization; verification assertions are required')
    args.config = args.config.resolve()
    args.rust_binaries = args.rust_binaries.resolve()
    args.output = args.output.resolve()
    manifest = json.loads(args.build_manifest.resolve().read_text())
    manifest_digest = digest(args.build_manifest.resolve())
    harness_files = ['scripts/check-conversion-snapshots.py', 'scripts/compare-full-feature.mjs',
        'engines/js/compare.mjs', 'engines/js/carve-src.mjs', 'engines/php/compare.php',
        'engines/php/carve-src.php', 'engines/rs/src/compare.rs', 'engines/js/package-lock.json',
        'engines/php/composer.lock']
    harness_hashes = {f: digest(ROOT / f) for f in harness_files}
    checkpoint = args.output.with_suffix('.jsonl')
    if checkpoint.exists():
        parser.error('Choose a new output path; existing partial measurements are preserved')
    benchmark_commit = command(['git', 'rev-parse', 'HEAD'])
    benchmark_dirty = command(['git', 'status', '--porcelain']).splitlines()
    if args.output.exists():
        parser.error('Choose a new output path; existing measurements are preserved')
    config = json.loads(args.config.read_text())
    affinity = sorted(os.sched_getaffinity(0))
    if len(affinity) != 1:
        parser.error('Run with taskset on one CPU, shared by every worker')
    environment = {k: v for k, v in os.environ.items() if not k.startswith('CARVE_')}
    php_flags = manifest['metadata']['php_ini_flags']
    for file in ['engines/rs/src/compare.rs', 'engines/js/carve-src.mjs', 'engines/php/carve-src.php']:
        assert harness_hashes[file] == manifest['metadata']['harness_sha256'][file]
    assert digest(ROOT / 'engines/php/composer.lock') == manifest['metadata']['php_dependency_lock_sha256']
    assert digest(ROOT / 'engines/php/vendor/composer/installed.json') == manifest['metadata']['php_installed_sha256']
    assert command(['node', '--version']) == manifest['metadata']['node']
    assert command(['php', '-n', '-v']).splitlines()[0] == manifest['metadata']['php']
    assert affinity == manifest['metadata']['cpu_affinity']
    sources = {}
    for revision in ['before', 'after']:
        sources[revision] = {}
        for engine in ['js', 'php', 'rs']:
            entry = config[revision][engine]
            tree = entry['path']
            git = lambda *a: command(['git', '-C', tree, *a])
            assert git('rev-parse', 'HEAD') == entry['commit']
            assert git('status', '--porcelain') == '', tree
            command(['git', '-C', tree, 'merge-base', '--is-ancestor', entry['commit'], 'origin/main'])
            repository = f'https://github.com/markup-carve/carve-{engine}'
            assert git('remote', 'get-url', 'origin') in [repository, repository + '.git',
                                                       f'git@github.com:markup-carve/carve-{engine}.git']
            files = git('ls-files', '--', 'src', 'resources').splitlines()
            source_hash = hashlib.sha256(json.dumps(
                [(f, digest(Path(tree) / f)) for f in sorted(files)], separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()
            build = manifest['metadata']['sources'][revision][engine]
            assert build['commit'] == entry['commit'], 'Build manifest must match the pinned revision'
            assert source_hash == build['source_sha256'], 'Source fingerprint must match the paired build'
            sources[revision][engine] = {**entry, 'repository': repository, 'source_sha256': source_hash,
                'merged_main_ref': git('rev-parse', 'origin/main'), 'build_manifest_source': build}
            if engine == 'js':
                sources[revision][engine]['dist_sha256'] = {
                    str(p.relative_to(Path(tree) / 'dist')): digest(p)
                    for p in sorted((Path(tree) / 'dist').rglob('*.js'))}
                assert sources[revision][engine]['dist_sha256'] == build['dist_sha256'], 'Use the JS artifacts freshly built by the paired runner'
            if engine == 'rs':
                binary = args.rust_binaries / f'{revision}-rs-compare'
                sources[revision][engine]['binary_sha256'] = digest(binary)
                assert digest(binary) == build['control_binary_sha256'], 'Use the Rust compare binary from the paired build'
    cases = [('core', 'corpus/dev-main-core/carve.crv'),
             ('small', 'corpus/small.crv'), ('medium', 'corpus/medium.crv'),
             ('large', 'corpus/large.crv')]
    iterations = {'js': [400, 2000, 10, 1], 'php': [400, 1000, 5, 1], 'rs': [2000, 12000, 25, 3]}
    rows, summary = [], []
    started = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    load_start = os.getloadavg()
    checkpoint.write_text(json.dumps({'metadata': {'started_at': started, 'cpu_affinity': affinity,
        'sources': sources, 'harness_sha256': harness_hashes, 'build_manifest_sha256': manifest_digest,
        'benchmark_checkout_commit': benchmark_commit, 'php_ini_flags': php_flags}}) + '\n')
    for engine in ['js', 'php', 'rs']:
        engine_cases = cases + ([('js-without-tables', 'corpus/commonmark-core/carve.crv')] if engine == 'js' else [])
        for index, (case, filename) in enumerate(engine_cases):
            fixture = ROOT / filename
            count = iterations[engine][index] if index < 4 else 400
            trials = 2 if case == 'large' else 5
            pairs = []
            output_hashes = set()
            for round_index in range(2):
                pair = {}
                for revision in (['before', 'after'] if round_index == 0 else ['after', 'before']):
                    env = dict(environment, CARVE_JS=config[revision]['js']['path'] + '/dist/index.js',
                               CARVE_PHP_SRC=config[revision]['php']['path'] + '/src')
                    if engine == 'js':
                        argv = ['node', 'engines/js/compare.mjs']
                    elif engine == 'php':
                        argv = ['php', *php_flags, 'engines/php/compare.php']
                    else:
                        argv = [str(args.rust_binaries / f'{revision}-rs-compare')]
                    result = json.loads(command([*argv, f'carve-{engine}', str(fixture), str(count), str(trials)], env=env))
                    expected = config[revision][engine]
                    assert f"local checkout {expected['path']} @ " in result['carve_source']
                    short_commit = result['carve_source'].rsplit(' @ ', 1)[1].rstrip(')')
                    assert expected['commit'].startswith(short_commit)
                    result['carve_source'] = f"carve-{engine} (merged main {expected['commit']})"
                    assert result['bytes'] == fixture.stat().st_size
                    assert len(result['samples']) == trials and all(math.isfinite(v) and v > 0 for v in result['samples'])
                    if engine == 'php':
                        assert result['jit'] and result['jit_on'], 'Tracing JIT must be active'
                    if engine == 'rs':
                        result['output_sha256'] = hashlib.sha256(bytes.fromhex(result.pop('output_hex'))).hexdigest()
                        result['source_sha256'] = digest(fixture)
                    if engine != 'rs':
                        assert result['source_sha256'] == digest(fixture)
                    output_hashes.add(result['output_sha256'])
                    elapsed = statistics.median(result['samples'])
                    row = {**result, 'engine': engine, 'case': case, 'revision': revision,
                           'round': round_index, 'median_ms': elapsed, 'timed_windows_ms': [v * count for v in result['samples']], 'load': os.getloadavg()}
                    rows.append(row)
                    with checkpoint.open('a') as stream:
                        stream.write(json.dumps(row) + '\n')
                    pair[revision] = elapsed
                    print(f'{engine}/{case}/{round_index + 1}/{revision}: {elapsed:.4f} ms', flush=True)
                pairs.append((pair['after'] / pair['before'] - 1) * 100)
            selected = [r for r in rows if r['engine'] == engine and r['case'] == case]
            median = lambda rev: statistics.median(v for r in selected if r['revision'] == rev for v in r['samples'])
            drift = {revision: 100 * (max(r['median_ms'] for r in selected if r['revision'] == revision)
                / min(r['median_ms'] for r in selected if r['revision'] == revision) - 1) for revision in ['before', 'after']}
            comparable = len(output_hashes) == 1
            observed = statistics.mean(pairs) if comparable else None
            short = min(v for r in selected for v in r['timed_windows_ms']) < 1000
            noisy = comparable and max(drift.values()) > abs(observed)
            status = 'output-mismatch' if not comparable else 'short-window' if short else 'contended' if noisy else 'observed'
            summary.append({'engine': engine, 'case': case, 'before_ms': median('before'),
                            'after_ms': median('after'), 'comparable': comparable, 'timing_status': status,
                            'same_revision_drift_percent': drift,
                            'paired_change_percent': observed if status == 'observed' else None,
                            'observed_mean_paired_change_percent': observed,
                            'paired_range_percent': [min(pairs), max(pairs)] if comparable else None,
                            'paired_changes_percent': pairs if comparable else [], 'output_sha256': sorted(output_hashes)})
    for revision in ['before', 'after']:
        for engine, entry in config[revision].items():
            assert command(['git', '-C', entry['path'], 'rev-parse', 'HEAD']) == entry['commit']
            assert command(['git', '-C', entry['path'], 'status', '--porcelain']) == ''
            if engine == 'js':
                for file, expected in sources[revision][engine]['dist_sha256'].items():
                    assert digest(Path(entry['path']) / 'dist' / file) == expected
            elif engine == 'rs':
                assert digest(args.rust_binaries / f'{revision}-rs-compare') == sources[revision][engine]['binary_sha256']
    assert {f: digest(ROOT / f) for f in harness_files} == harness_hashes
    assert command(['git', 'rev-parse', 'HEAD']) == benchmark_commit
    assert digest(args.build_manifest.resolve()) == manifest_digest
    record = {'schema': 1, 'metadata': {'started_at': started,
              'completed_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
              'cpu_affinity': affinity, 'sources': sources,
              'benchmark_checkout_commit': benchmark_commit, 'benchmark_dirty_paths': benchmark_dirty,
              'build_manifest': str(args.build_manifest.resolve()), 'build_manifest_sha256': manifest_digest,
              'build_settings': manifest['metadata']['build_settings'],
              'node': command(['node', '--version']), 'php': command(['php', '-n', '-v']).splitlines()[0],
              'rustc_at_measurement': command(['rustc', '--version']), 'php_ini_flags': php_flags,
              'load_start': load_start, 'load_end': os.getloadavg(),
              'harness_sha256': harness_hashes,
              'method': 'Two serial rounds reverse before/after order on one CPU. Every process warms up twenty conversions. Core, small and medium inputs use five timed trials; large uses two. JS also includes the core input without tables. Iteration counts match within every pair. Rows with different outputs within an engine and input are marked non-comparable and have no paired change. Rust input hashes identify the requested fixtures; its worker reports bytes, not an independently computed source hash. Changes are the arithmetic mean of the two per-round ratios. Change display is suppressed when same-revision drift exceeds the observed change or a timed window is shorter than one second. The ms columns are medians of all timed samples for each revision. Observed changes average the two per-round median ratios and can differ from the ratio of pooled medians. Positive paired changes mean more elapsed time. Two pairs expose output differences and timing instability, and do not establish statistical significance.'},
              'rows': rows, 'summary': summary}
    args.output.write_text(json.dumps(record, indent=2) + '\n')
    checkpoint.unlink()
    print(f'Wrote {args.output}', flush=True)


if __name__ == '__main__':
    main()
