#!/usr/bin/env python3
"""Measure pinned engine heads on public authored documents adapted to Carve."""

import argparse
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import platform
import shutil
import statistics
import subprocess
import tomllib

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
HISTORY_PATH = ROOT / 'scripts/history/run.py'
SPEC = importlib.util.spec_from_file_location('history_run', HISTORY_PATH)
HISTORY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(HISTORY)
TARGET_DIR = Path(os.environ.get('CARGO_TARGET_DIR', '/var/tmp/cargo-shared/carve-bench'))


def digest(data):
    return hashlib.sha256(data).hexdigest()


def rust_route_binary(cache, tree):
    project = cache / 'rs-route'
    (project / 'src').mkdir(parents=True, exist_ok=True)
    (project / 'src/main.rs').write_bytes((HERE / 'route.rs').read_bytes())
    manifest = ('[package]\nname="carve-realistic-route"\nversion="0.0.0"\n'
                'edition="2021"\n[workspace]\n[dependencies]\n'
                f'carve={{package="carve-lang",path={json.dumps(str(tree))}}}\n')
    (project / 'Cargo.toml').write_text(manifest)
    shipped_lock = tree / '.history-worker/Cargo.lock'
    shutil.copyfile(shipped_lock, project / 'Cargo.lock')
    environment = dict(os.environ, CARGO_TARGET_DIR=str(TARGET_DIR))
    subprocess.run(['cargo', 'metadata', '--format-version', '1', '--manifest-path', str(project / 'Cargo.toml')],
                   env=environment, stdout=subprocess.DEVNULL, check=True)
    package_key = lambda package: (package['name'], package['version'], package.get('source'), package.get('checksum'))
    shipped = {package_key(package) for package in tomllib.loads(shipped_lock.read_text())['package'] if package['name'] != 'history-worker'}
    resolved = {package_key(package) for package in tomllib.loads((project / 'Cargo.lock').read_text())['package'] if package['name'] != 'carve-realistic-route'}
    if shipped != resolved:
        raise ValueError('Route probe changed the pinned Rust dependency graph')
    subprocess.run(['cargo', 'build', '--locked', '--release', '--manifest-path', str(project / 'Cargo.toml')],
                   env=environment, stdout=subprocess.DEVNULL, check=True)
    return TARGET_DIR / 'release/carve-realistic-route', project / 'Cargo.lock'


def route(engine, tree, fixture, rust_binary):
    if engine == 'js':
        command = ['node', str(HERE / 'route.mjs'), str(tree), str(fixture)]
    elif engine == 'php':
        command = ['php', '-d', 'pcov.enabled=0', str(HERE / 'route.php'), str(tree), str(fixture)]
    else:
        command = [str(rust_binary), str(fixture)]
    result = subprocess.check_output(command, text=True).strip()
    if result not in ('ast', 'direct'):
        raise ValueError(f'Invalid route probe: {engine} {fixture}: {result}')
    return result


def measure(engine, tree, fixture, rust_binary, count):
    warm = 20
    if engine == 'js':
        command = ['node', str(HERE / 'measure.mjs'), str(tree), str(fixture), str(count), str(warm)]
    elif engine == 'php':
        command = ['php', '-n', '-d', 'extension=ctype', '-d', 'extension=mbstring',
                   '-d', 'opcache.enable_cli=1', '-d', 'opcache.jit_buffer_size=128M',
                   '-d', 'opcache.jit=tracing', str(HERE / 'measure.php'), str(tree),
                   str(fixture), str(count), str(warm)]
    else:
        command = [str(rust_binary), 'measure', str(fixture), str(count), str(warm)]
    output = subprocess.check_output(command)
    if engine == 'rs':
        wall, cpu, html = output.split(b'\n', 2)
        result = {'samples_ms': [float(x) for x in wall.split(b',')],
                  'cpu_samples_ms': [float(x) for x in cpu.split(b',')],
                  'hash': digest(html)}
    else:
        result = json.loads(output)
    if engine == 'php' and result.get('jit') is not True:
        raise ValueError(f'PHP tracing JIT is inactive: {fixture}')
    for key in ('samples_ms', 'cpu_samples_ms'):
        if len(result[key]) != count or any(not (0 < value < float('inf')) for value in result[key]):
            raise ValueError(f'Invalid {key}: {engine} {fixture}')
    return dict(result, warmups=warm)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cache', type=Path, default=ROOT / '.realistic-cache')
    parser.add_argument('--output', type=Path, default=ROOT / 'reports/realistic-engine.json')
    parser.add_argument('--rounds', type=int, default=4)
    parser.add_argument('--samples', type=int, default=11)
    parser.add_argument('--cpu', type=int)
    args = parser.parse_args()
    if args.rounds <= 0 or args.samples <= 0:
        parser.error('Rounds and samples must be positive')
    cache = args.cache.resolve()
    cache.mkdir(parents=True, exist_ok=True)
    pins = json.loads((HERE / 'pins.json').read_text())
    provenance = json.loads((ROOT / 'corpus/realistic/provenance.json').read_text())
    prepared = {}
    for engine, sha in pins.items():
        mirror = cache / f'{engine}.git'
        if not mirror.exists():
            HISTORY.command(['git', 'clone', '--bare', f'https://github.com/markup-carve/{HISTORY.REPOS[engine]}.git', str(mirror)], capture=False)
        HISTORY.command(['git', '--git-dir', str(mirror), 'fetch', 'origin', '+refs/heads/main:refs/heads/main'], capture=False)
        if subprocess.run(['git', '--git-dir', str(mirror), 'merge-base', '--is-ancestor', sha, 'refs/heads/main'],
                          stdout=subprocess.DEVNULL).returncode != 0:
            raise ValueError(f'{engine} pin is not an ancestor of main')
        prepared[engine] = HISTORY.prepare(cache, engine, {'label': 'dev-main', 'sha': sha})
    rust_binary, rust_route_lock = rust_route_binary(cache, prepared['rs'])
    fixtures = []
    for item in provenance['fixtures']:
        path = ROOT / item['fixture']
        if digest(path.read_bytes()) != item['fixture_sha256']:
            raise ValueError(f'Fixture changed: {path}')
        fixtures.append((item['name'], path, item))
    if args.cpu is not None:
        os.sched_setaffinity(0, {args.cpu})
    records = {(name, engine): [] for name, _, _ in fixtures for engine in pins}
    routes = {}
    for name, path, _ in fixtures:
        for engine, tree in prepared.items():
            observed = route(engine, tree, path, rust_binary)
            if observed != 'ast':
                raise ValueError(f'Expected full parse for {name}/{engine}; got {observed}')
            routes[(name, engine)] = observed
    for round_index in range(args.rounds):
        fixture_order = fixtures[round_index % len(fixtures):] + fixtures[:round_index % len(fixtures)]
        for name, path, _ in fixture_order:
            engines = list(pins)
            engines = engines[round_index % len(engines):] + engines[:round_index % len(engines)]
            for engine in engines:
                measured = measure(engine, prepared[engine], path, rust_binary, args.samples)
                records[(name, engine)].append({
                    'round': round_index + 1,
                    'samples_ms': measured['samples_ms'],
                    'median_ms': statistics.median(measured['samples_ms']),
                    'cpu_samples_ms': measured['cpu_samples_ms'],
                    'median_cpu_ms': statistics.median(measured['cpu_samples_ms']),
                    'output_sha256': measured['hash'],
                    'warmup_iterations': measured.get('warmup_iterations'),
                    'warmup_ms': measured.get('warmup_ms'),
                    'warmups': measured['warmups'],
                    'load': HISTORY.load(),
                })
                print(f'{name} {engine} round {round_index + 1}/{args.rounds}', flush=True)
    rows = []
    for name, path, item in fixtures:
        for engine in pins:
            trials = records[(name, engine)]
            hashes = {trial['output_sha256'] for trial in trials}
            if len(hashes) != 1:
                raise ValueError(f'Output changed between rounds: {name}/{engine}')
            rows.append({
                'document': name, 'fixture': item['fixture'], 'bytes': path.stat().st_size,
                'engine': engine, 'route': routes[(name, engine)],
                'median_ms': statistics.median(value for trial in trials for value in trial['samples_ms']),
                'median_cpu_ms': statistics.median(value for trial in trials for value in trial['cpu_samples_ms']),
                'output_sha256': hashes.pop(), 'rounds': trials,
            })
    result = {
        'schema': 2, 'generated_at': datetime.now(timezone.utc).isoformat(),
        'benchmark_commit': subprocess.check_output(['git', '-C', str(ROOT), 'rev-parse', 'HEAD'], text=True).strip(),
        'benchmark_dirty_paths': subprocess.check_output(['git', '-C', str(ROOT), 'status', '--porcelain'], text=True).splitlines(),
        'host': platform.platform(), 'cpu_affinity': sorted(os.sched_getaffinity(0)),
        'rounds': args.rounds, 'samples_per_round': args.samples,
        'order': 'fixtures and engines rotate one position per round',
        'timing': 'in-process source-to-HTML; process CPU time is primary, elapsed wall time retained; process startup excluded; PHP CLI clean ini with ctype/mbstring and tracing JIT on; Rust release build',
        'source_commits': pins,
        'source_fingerprints': {engine: HISTORY.source_fingerprint(cache / f'{engine}.git', sha, engine) for engine, sha in pins.items()},
        'runtimes': {engine: HISTORY.runtime(engine, prepared[engine] if engine == 'rs' else None) for engine in pins},
        'harness_sha256': {str(file.relative_to(ROOT)): digest(file.read_bytes()) for file in [
            HISTORY_PATH, ROOT / 'scripts/history/worker.mjs', ROOT / 'scripts/history/worker.php',
            ROOT / 'scripts/history/worker.rs', HERE / 'run.py', HERE / 'route.mjs', HERE / 'route.php',
            HERE / 'route.rs', HERE / 'measure.mjs', HERE / 'measure.php',
            HERE / 'output-control.py', HERE / 'fixtures.mjs',
        ]},
        'rust_route_lock_sha256': digest(rust_route_lock.read_bytes()),
        'fixture_provenance_sha256': digest((ROOT / 'corpus/realistic/provenance.json').read_bytes()),
        'rows': rows,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2) + '\n')


if __name__ == '__main__':
    main()
