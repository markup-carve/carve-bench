import sys, json, pathlib, subprocess, hashlib, statistics, datetime, os, tomllib
import argparse, fcntl
root = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(root / 'scripts/history'))
import run, report
parser = argparse.ArgumentParser(description='Refresh merged main points while retaining release samples.')
parser.add_argument('config', type=pathlib.Path, help='Pinned engine config used by compare-dev-main.mjs')
parser.add_argument('--cache', type=pathlib.Path, default=root / '.history-cache')
parser.add_argument('--cpu', type=int, default=13)
args = parser.parse_args()
cache = args.cache.resolve()
cache.mkdir(exist_ok=True, parents=True)
lock = (cache / '.run.lock').open('w')
fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
config = json.loads(args.config.read_text())
core = json.loads((root / 'reports/dev-main-core.json').read_text())
for engine in ['js', 'php', 'rs']:
    if config[engine]['commit'] != core['metadata']['carve_main'][engine]['commit']:
        raise ValueError('History and core main commits must match')
record = json.loads((root / 'reports/engine-history.json').read_text())
report.validate_measurements(record)
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
prepared = {}
revisions = {}
for engine in ['js', 'php', 'rs']:
    item = config[engine]
    mirror = cache / f'{engine}.git'
    remote = run.command(['git', '-C', item['path'], 'remote', 'get-url', 'origin'])
    allowed = [f'https://github.com/markup-carve/{run.REPOS[engine]}', f'https://github.com/markup-carve/{run.REPOS[engine]}.git', f'git@github.com:markup-carve/{run.REPOS[engine]}.git']
    if remote not in allowed:
        raise ValueError('Source must use the official engine remote')
    subprocess.run(['git', '-C', item['path'], 'fetch', 'origin', 'main'], check=True)
    subprocess.run(['git', '-C', item['path'], 'merge-base', '--is-ancestor', item['commit'], 'origin/main'], check=True)
    if not mirror.exists():
        subprocess.run(['git', 'clone', '--mirror', f'https://github.com/markup-carve/{run.REPOS[engine]}.git', str(mirror)], check=True)
    subprocess.run(['git', '--git-dir', str(mirror), 'fetch', item['path'], item['commit']], check=True)
    revision = {'label': 'dev-main', 'sha': item['commit'], 'source_fingerprint': run.source_fingerprint(mirror, item['commit'], engine)}
    tree = run.prepare(cache, engine, revision)
    prepared[engine] = tree
    revision['runtime'] = run.runtime(engine, tree if engine == 'rs' else None)
    revision['dependency_lock_sha256'] = {str(p.relative_to(tree)): sha(p) for p in [tree / 'package-lock.json', tree / 'composer.lock', tree / '.history-worker/Cargo.lock'] if p.exists()}
    if engine == 'rs':
        revision['release_profile'] = tomllib.loads((tree / '.history-worker/Cargo.toml').read_text())['profile']['release']
        revision['build_configuration'] = json.loads((tree / '.history-build.json').read_text())
        revision['worker_binary_sha256'] = sha(tree / '.history-worker/bin/history-worker')
    if engine == 'php' and (tree / 'vendor/composer/installed.json').exists():
        revision['composer_installed_sha256'] = sha(tree / 'vendor/composer/installed.json')
    revisions[engine] = revision
os.sched_setaffinity(0, {args.cpu})
session = {'generated_at': now(), 'started_at': now(), 'benchmark_commit': run.command(['git', '-C', str(root), 'rev-parse', 'HEAD']), 'benchmark_dirty': bool(run.command(['git', '-C', str(root), 'status', '--porcelain'])), 'benchmark_checkout_commit': run.command(['git', '-C', str(root), 'rev-parse', 'HEAD']), 'benchmark_dirty_paths': sorted(set(run.command(['git', '-C', str(root), 'diff', '--name-only', 'HEAD', '--']).splitlines() + run.command(['git', '-C', str(root), 'ls-files', '--others', '--exclude-standard']).splitlines())), 'cpu_affinity': [args.cpu], 'harness_sha256': {name: sha(root / 'scripts/history' / name) for name in ['run.py', 'refresh-main.py', 'worker.mjs', 'worker.php', 'worker.rs']}, 'measurement_signature': run.measurement_signature((root / 'scripts/history/run.py').read_text()), 'sizes': record['sizes'], 'rounds': record['rounds'], 'samples_per_round': record['samples_per_round'], 'initial_load': run.load(), 'file': 'engine-history.json', 'note': f'Only merged main points were remeasured. Release tags retain their original sessions. Processes ran serially on CPU {args.cpu}.'}
assert session['measurement_signature'] == record['measurement_signature']
for engine in ['js', 'php', 'rs']:
    session['started_at'] = now()
    session['initial_load'] = run.load()
    snapshot = record['engines'][engine]
    samples = {}
    tree = prepared[engine]
    for round_index in range(record['rounds']):
        print(f'Measuring {engine} merged main, round {round_index + 1}/{record['rounds']}', flush=True)
        for n in record['sizes']:
            for name in snapshot['cases']:
                text = run.fixture(name, n)
                path = cache / 'fixture.txt'
                path.write_text(text)
                row = run.measure(engine, tree, path, name, n, record['samples_per_round'])
                samples.setdefault((name, n), []).append(dict(row, round=round_index + 1, load=run.load()))
    rows = []
    for (name, n), runs in samples.items():
        hashes = {r['hash'] for r in runs}
        assert len(hashes) == 1
        times = [v for r in runs for v in r['samples_ms']]
        rows.append({'revision': 'dev-main', 'case': name, 'n': n, 'bytes': len(run.fixture(name, n).encode()), 'fixture_sha256': hashlib.sha256(run.fixture(name, n).encode()).hexdigest(), 'output_sha256': hashes.pop(), 'median_ms': statistics.median(times), 'min_ms': min(times), 'max_ms': max(times), 'samples': runs})
    snapshot['revisions'] = [r for r in snapshot['revisions'] if r['label'] != 'dev-main'] + [revisions[engine]]
    snapshot['rows'] = [r for r in snapshot['rows'] if r['revision'] != 'dev-main'] + rows
    snapshot['main_alias'] = None
    snapshot['runtime'] = ' / '.join(sorted({r['runtime'] for r in snapshot['revisions']}))
    snapshot.setdefault('point_sessions', {})['dev-main'] = dict(session, finished_at=now(), final_load=run.load(), source_commit=revisions[engine]['sha'])
    snapshot['measurement_notes'] = [note for note in snapshot.get('measurement_notes', []) if not note.startswith(('Merged main refreshed ', 'The merged main point was refreshed on '))]
    if engine == 'rs':
        note = 'Rust main and retained tags record different Cargo configuration hashes and build recipes. Their timings do not isolate engine speed changes; compare build_configuration for each revision.'
        if note not in snapshot['measurement_notes']: snapshot['measurement_notes'].append(note)
    snapshot['measurement_notes'].append(f'Merged main refreshed {now()}; release samples retained. Cross-session differences do not establish code speedups.')
    for k in ['js', 'php', 'rs']:
        assert run.command(['git', '-C', str(prepared[k]), 'status', '--porcelain', '--untracked-files=no']) == ''
record['session_note'] = f'Release-tag measurements retain their original sessions. All three merged main points were refreshed {now()} with the same fixtures, workers and sampling counts on CPU {args.cpu}. Separate shared-host sessions and build configurations do not isolate code speedups.'
record['publication_note'] = 'Release tags are retained; merged main points were refreshed from exact main commits. Intermediate PR measurements remain local.'
record['publication_report_sha256'] = sha(root / 'scripts/history/report.py')
report.validate_measurements(record)
temporary = root / 'reports/engine-history.json.tmp'
temporary.write_text(json.dumps(record, indent=2) + '\n')
temporary.replace(root / 'reports/engine-history.json')
report.build(root / 'reports/engine-history.json')
print('History main refresh complete', flush=True)
