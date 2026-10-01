#!/usr/bin/env python3
"""Measure release history from immutable source snapshots."""
import argparse
import ast
import csv
import hashlib
import inspect
import fcntl
import fnmatch
import json
import os
from pathlib import Path
import platform
import re
import shutil
import statistics
import subprocess
import sys
import time
import tomllib
from datetime import datetime, timezone

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
REPOS = {'js': 'carve-js', 'php': 'carve-php', 'rs': 'carve-rs'}
SOURCE_PATHS = {
    'js': ['src', 'scripts', 'package.json', 'package-lock.json', 'tsconfig*.json'],
    'php': ['src', 'resources', 'composer.json', 'composer.lock'],
    'rs': ['src', 'resources', 'Cargo.toml', 'Cargo.lock', 'build.rs', 'rust-toolchain.toml', '.cargo'],
}
CASES = ['quoted_fences', 'verse_definitions', 'verse_equivalent', 'paragraphs', 'mixed_document']


def command(argv, cwd=None, capture=True):
    return subprocess.check_output(argv, cwd=cwd, text=True).strip() if capture else subprocess.run(argv, cwd=cwd, check=True)


def stable_tags(tags, count):
    versions = []
    for tag in tags:
        match = re.fullmatch(r'v?(\d+)\.(\d+)\.(\d+)', tag)
        if match:
            versions.append((tuple(map(int, match.groups())), tag))
    versions.sort(reverse=True)
    selected = []
    seen = set()
    for version, tag in versions:
        if version not in seen:
            selected.append(tag)
            seen.add(version)
        if len(selected) == count:
            break
    if len(selected) < count:
        raise ValueError(f'Need {count} stable releases, found {len(selected)}')
    return selected[::-1]


def source_fingerprint(repo, revision, engine):
    entries = command(['git', '--git-dir', str(repo), 'ls-tree', '-r', revision]).splitlines()
    selected = [line for line in entries if any(fnmatch.fnmatch(line.split('\t',1)[1], pattern) or line.split('\t',1)[1].startswith(pattern+'/') for pattern in SOURCE_PATHS[engine])]
    return hashlib.sha256('\n'.join(selected).encode()).hexdigest()


def select_revisions(repo, engine, count):
    tags = stable_tags(command(['git', '--git-dir', str(repo), 'tag']).splitlines(), count)
    versions = {}
    for tag in command(['git', '--git-dir', str(repo), 'tag']).splitlines():
        match = re.fullmatch(r'v?(\d+)\.(\d+)\.(\d+)', tag)
        if match:
            version = tuple(map(int, match.groups()))
            sha = command(['git', '--git-dir', str(repo), 'rev-parse', f'{tag}^{{commit}}'])
            if version in versions and versions[version] != sha:
                raise ValueError(f'Conflicting tags for {version}')
            versions[version] = sha
    result = []
    for tag in tags:
        sha = command(['git', '--git-dir', str(repo), 'rev-parse', f'{tag}^{{commit}}'])
        result.append({'label': tag, 'sha': sha, 'source_fingerprint': source_fingerprint(repo, sha, engine)})
    main = command(['git', '--git-dir', str(repo), 'rev-parse', 'refs/heads/main'])
    fingerprint = source_fingerprint(repo, main, engine)
    alias = None
    if fingerprint == result[-1]['source_fingerprint']:
        alias = {'label': 'dev-main', 'sha': main, 'same_source_as': result[-1]['label']}
    else:
        result.append({'label': 'dev-main', 'sha': main, 'source_fingerprint': fingerprint})
    return result, alias


def add_candidate(repo, engine, revisions, label, sha):
    if any(revision['label'] == label for revision in revisions):
        raise ValueError(f'Duplicate candidate label: {label}')
    fingerprint=source_fingerprint(repo,sha,engine)
    matching=next((revision for revision in revisions if revision['source_fingerprint']==fingerprint),None)
    if matching:
        return {'label':label,'sha':sha,'same_source_as':matching['label']}
    revisions.append({'label':label,'sha':sha,'source_fingerprint':fingerprint,'kind':'candidate'})
    return None


def prepare(cache, engine, revision):
    sha = revision['sha']
    tree = cache / engine / sha
    mirror = cache / f'{engine}.git'
    if not tree.exists():
        command(['git', '--git-dir', str(mirror), 'worktree', 'add', '--detach', str(tree), sha], capture=False)
    if command(['git', '-C', str(tree), 'rev-parse', 'HEAD']) != sha or command(['git', '-C', str(tree), 'status', '--porcelain', '--untracked-files=no']):
        raise ValueError(f'Modified cached source: {tree}')
    inputs = [HERE / f'worker.{ {"js":"mjs", "php":"php", "rs":"rs"}[engine]}']
    stamp = hashlib.sha256(inspect.getsource(prepare).encode() + b''.join(p.read_bytes() for p in inputs)).hexdigest()
    marker = tree / '.history-build.json'
    tool = command({'js':['npm','--version'], 'php':['composer','--version','--no-ansi'], 'rs':['cargo','--version']}[engine],cwd=tree if engine=='rs' else None)
    cargo_configs = [Path(os.environ.get('CARGO_HOME', str(Path.home()/'.cargo')))/name for name in ('config','config.toml')]
    if engine == 'rs':
        cargo_configs += [parent/'.cargo'/name for parent in (tree,*tree.parents) for name in ('config','config.toml')]
    cargo_configuration = {str(path):hashlib.sha256(path.read_bytes()).hexdigest() for path in cargo_configs if path.is_file()} if engine == 'rs' else {}
    cargo_environment = {key:value for key,value in os.environ.items() if key.startswith(('CARGO_BUILD_','CARGO_PROFILE_','CARGO_TARGET_','RUST')) or key == 'CARGO_ENCODED_RUSTFLAGS'}
    cargo_environment_hash = hashlib.sha256(json.dumps(cargo_environment,sort_keys=True).encode()).hexdigest() if engine == 'rs' else None
    expected = {'cargo_environment_sha256':cargo_environment_hash, 'cargo_configuration_sha256':cargo_configuration, 'sha': sha, 'recipe': stamp, 'runtime': runtime(engine,tree if engine=='rs' else None), 'tool':tool, 'rustflags':os.environ.get('RUSTFLAGS'), 'encoded_rustflags':os.environ.get('CARGO_ENCODED_RUSTFLAGS'), 'cargo_build_target':os.environ.get('CARGO_BUILD_TARGET')}
    if marker.exists() and json.loads(marker.read_text()) == expected:
        artifact = tree / {'js':'dist/index.js', 'php':'vendor/autoload.php', 'rs':'.history-worker/bin/history-worker'}[engine]
        if artifact.exists() and (engine != 'rs' or command([str(artifact),'--identity']) == sha):
            return tree
    print(f'Building {engine} {revision["label"]} ({sha[:12]})', flush=True)
    if engine == 'js':
        command(['npm', 'ci', '--ignore-scripts'], cwd=tree, capture=False)
        command(['npm', 'run', 'build'], cwd=tree, capture=False)
    elif engine == 'php':
        command(['composer', 'install', '--no-dev', '--no-interaction', '--prefer-dist', '--no-scripts'], cwd=tree, capture=False)
    else:
        worker = tree / '.history-worker'
        worker.mkdir(exist_ok=True)
        worker_source=(HERE / 'worker.rs').read_text().replace('SOURCE_REVISION',sha)
        if not (worker/'main.rs').exists() or (worker/'main.rs').read_text()!=worker_source:
            (worker/'main.rs').write_text(worker_source)
        manifest = '[package]\nname="history-worker"\nversion="0.0.0"\nedition="2021"\n[workspace]\n[dependencies]\ncarve={package="carve-lang",path=' + json.dumps(str(tree)) + '}\n[[bin]]\nname="history-worker"\npath="main.rs"\n[profile.release]\n'
        profile = tomllib.loads((tree / 'Cargo.toml').read_text()).get('profile',{}).get('release',{})
        if any(isinstance(v,dict) for v in profile.values()):
            raise ValueError('Nested release profiles need an explicit history build recipe')
        manifest += ''.join(f'{json.dumps(k)}={json.dumps(v)}\n' for k,v in profile.items())
        if not (worker/'Cargo.toml').exists() or (worker/'Cargo.toml').read_text()!=manifest:
            (worker/'Cargo.toml').write_text(manifest)
        lock = worker / 'Cargo.lock'
        if (tree / 'Cargo.lock').exists():
            shutil.copyfile(tree / 'Cargo.lock', lock)
        # Add the wrapper package once, then freeze its resolved dependency graph.
        build_directory=Path('/tmp/cargo-shared/carve-bench-history')
        build_directory.mkdir(parents=True,exist_ok=True)
        build_lock=(build_directory/'.build.lock').open('w')
        fcntl.flock(build_lock,fcntl.LOCK_EX)
        command(['cargo','metadata','--format-version','1','--manifest-path',str(worker/'Cargo.toml')],cwd=tree)
        if (tree/'Cargo.lock').exists():
            key=lambda p:(p['name'],p['version'],p.get('source'),p.get('checksum'))
            shipped=set(map(key,tomllib.loads((tree/'Cargo.lock').read_text())['package']))
            resolved=set(map(key,tomllib.loads(lock.read_text())['package']))
            if shipped-resolved or resolved-shipped != {('history-worker','0.0.0',None,None)}:
                raise ValueError('Rust wrapper changed the shipped dependency lock')
        build = command(['cargo','build','--locked','--release','--message-format=json','--manifest-path',str(worker/'Cargo.toml'),'--target-dir',str(build_directory)],cwd=tree)
        artifacts=[json.loads(line) for line in build.splitlines() if line.startswith('{')]
        executable=next(item['executable'] for item in artifacts if item.get('reason')=='compiler-artifact' and item.get('target',{}).get('name')=='history-worker' and item.get('executable'))
        (worker/'bin').mkdir(exist_ok=True)
        shutil.copy2(executable,worker/'bin/history-worker')
        if command([str(worker/'bin/history-worker'),'--identity']) != sha:
            raise ValueError('Rust worker identity mismatch')
        build_lock.close()
    marker.write_text(json.dumps(expected) + '\n')
    return tree


def runtime(engine,cwd=None):
    return command({'js':['node','--version'], 'php':['php','-r','echo PHP_VERSION;'], 'rs':[os.environ.get('RUSTC','rustc'),'--version']}[engine],cwd=cwd)


def fixture(name, n):
    if name.startswith('quoted_'):
        closer = {'quoted_false_mixed_closer': '> ```~\n', 'quoted_indented_closer': '>  ```\n'}.get(name, '')
        return '> ::: |\n> verse\n' + '> ```x\n' * n + closer + '> :::\n'
    if name in ('verse_definitions', 'verse_equivalent'):
        definition = '[r]: /hidden extra' if name == 'verse_equivalent' else '[r]: /hidden'
        reference = '[t][missing]' if name == 'verse_equivalent' else '[t][r]'
        return '> ::: |\n' + f'> {definition}\n' * n + '> :::\n\n' + reference + '\n'
    if name == 'paragraphs':
        return 'plain paragraph\n\n' * n
    if name == 'html_table':
        return '<table>' + '<tr><td><blockquote cite="u"><p>q</p></blockquote></td></tr>' * n + '</table>'
    return ''.join(f'# Section {i}\n\nA paragraph with *strong*, /emphasis/, [reference][ref] and `code`.\n\n- first\n- second\n\n| key | value |\n| --- | --- |\n| item | count |\n\n' for i in range(n)) + '[ref]: /target\n'


def measure(engine, tree, path, name, n, count):
    warm = (100 if n <= 128 else 20 if n <= 1024 else 10) if engine == 'js' else 5 if engine == 'php' else 20
    if engine == 'js':
        argv = ['node', str(HERE / 'worker.mjs'), str(tree), str(path), str(count), str(warm)]
    elif engine == 'php':
        argv = ['php', '-d', 'pcov.enabled=0', '-d', 'xdebug.mode=off', '-d', 'opcache.enable_cli=0', str(HERE / 'worker.php'), str(tree), str(path), str(count), str(warm), name]
    else:
        argv = [str(tree / '.history-worker/bin/history-worker'), str(path), str(count), str(warm)]
    output = subprocess.check_output(argv)
    if engine == 'rs':
        times, html = output.split(b'\n', 1)
        result = {'samples_ms': [float(x) for x in times.split(b',')], 'hash': hashlib.sha256(html).hexdigest()}
    else:
        result = json.loads(output)
    if len(result['samples_ms']) != count or any(not (0 < value < float('inf')) for value in result['samples_ms']):
        raise ValueError('Invalid timing samples')
    return dict(result, warmups=warm)


def load():
    return list(os.getloadavg()) if hasattr(os, 'getloadavg') else None


def measurement_signature(source):
    tree = ast.parse(source)
    definitions = {node.name: ast.get_source_segment(source,node) for node in tree.body if isinstance(node,ast.FunctionDef)}
    return hashlib.sha256('\0'.join(definitions[name] for name in ('fixture','measure')).encode()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--tags', type=int, default=4)
    parser.add_argument('--engines', nargs='+', choices=REPOS, default=list(REPOS))
    parser.add_argument('--sizes', nargs='+', type=int, default=[128, 1024])
    parser.add_argument('--rounds', type=int, default=3)
    parser.add_argument('--samples', type=int, default=7)
    parser.add_argument('--cpu', type=int)
    parser.add_argument('--cache', type=Path, default=ROOT / '.history-cache')
    parser.add_argument('--output', type=Path, default=ROOT / 'reports/engine-history.json')
    parser.add_argument('--prepare-only', action='store_true')
    parser.add_argument('--candidate',action='append',default=[],metavar='ENGINE=LABEL=REF',help='Also measure a pinned branch or commit, such as js=PR-2445=branch-name')
    args = parser.parse_args()
    if min(args.tags, args.rounds, args.samples, *args.sizes) <= 0:
        parser.error('Counts and sizes must be positive')
    candidates=[]
    for candidate in args.candidate:
        parts=candidate.split('=',2)
        if len(parts)!=3 or parts[0] not in args.engines or not re.fullmatch(r'[A-Za-z0-9_-]+',parts[1]) or not parts[2] or parts[2].startswith('-'):
            parser.error('Candidate must be ENGINE=LABEL=REF for a selected engine')
        if re.fullmatch(r'v?\d+\.\d+\.\d+',parts[1]) or parts[1]=='dev-main':
            parser.error('Candidate labels must differ from release tags and dev-main')
        if any(previous[:2]==parts[:2] for previous in candidates):
            parser.error('Candidate labels must be unique within an engine')
        candidates.append(parts)
    cache = args.cache.resolve()
    cache.mkdir(parents=True, exist_ok=True)
    cache_lock = (cache / '.run.lock').open('w')
    try:
        fcntl.flock(cache_lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        parser.error('Another history run uses this cache; wait or choose a separate --cache')
    result = {'schema': 1, 'generated_at': datetime.now(timezone.utc).isoformat(), 'benchmark_commit': command(['git','-C',str(ROOT),'rev-parse','HEAD']), 'harness_sha256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(HERE.glob('*')) if p.is_file()}, 'host': platform.platform(), 'cpu_affinity': sorted(os.sched_getaffinity(0)) if hasattr(os,'sched_getaffinity') else None, 'tags_per_engine':args.tags,'benchmark_dirty':bool(command(['git','-C',str(ROOT),'status','--porcelain'])), 'rounds':args.rounds,'samples_per_round':args.samples, 'timing':'in-process core conversion, except php html_table is HTML import; Rust mirrors engine release profile; PHP CLI opcache/JIT off, coverage off; affinity also pins Node compiler/GC threads', 'engines': {}}
    prepared = {}
    for engine in args.engines:
        mirror = cache / f'{engine}.git'
        if not mirror.exists():
            command(['git','clone','--bare',f'https://github.com/markup-carve/{REPOS[engine]}.git',str(mirror)], capture=False)
        command(['git','--git-dir',str(mirror),'fetch','--prune','--prune-tags','origin','+refs/heads/main:refs/heads/main','+refs/tags/*:refs/tags/*'], capture=False)
        revisions, alias = select_revisions(mirror, engine, args.tags)
        candidate_aliases=[]
        for candidate_engine,label,ref in candidates:
            if candidate_engine!=engine:continue
            command(['git','--git-dir',str(mirror),'fetch','origin',ref],capture=False)
            sha=command(['git','--git-dir',str(mirror),'rev-parse','FETCH_HEAD^{commit}'])
            candidate_alias=add_candidate(mirror,engine,revisions,label,sha)
            if candidate_alias:candidate_aliases.append(candidate_alias)
        result['engines'][engine] = {'runtime':runtime(engine),'revisions':revisions,'main_alias':alias,'candidate_aliases':candidate_aliases,'rows':[]}
        for revision in revisions:
            prepared[engine, revision['sha']] = prepare(cache, engine, revision)
    if args.prepare_only:
        print('All revisions prepared; no timings recorded.')
        return
    if args.cpu is not None:
        os.sched_setaffinity(0, {args.cpu})
    result['cpu_affinity'] = sorted(os.sched_getaffinity(0)) if hasattr(os,'sched_getaffinity') else None
    result['measurement_signature'] = measurement_signature(Path(__file__).read_text())
    for (engine,sha),tree in prepared.items():
        revision=next(r for r in result['engines'][engine]['revisions'] if r['sha']==sha)
        locks=[tree / f for f in ('package-lock.json','composer.lock','.history-worker/Cargo.lock') if (tree/f).exists()]
        revision['runtime']=runtime(engine,tree if engine=='rs' else None)
        revision['dependency_lock_sha256']={str(f.relative_to(tree)):hashlib.sha256(f.read_bytes()).hexdigest() for f in locks}
        if engine=='rs':
            revision['release_profile']=tomllib.loads((tree/'.history-worker/Cargo.toml').read_text())['profile']['release']
            revision['worker_binary_sha256']=hashlib.sha256((tree/'.history-worker/bin/history-worker').read_bytes()).hexdigest()
        if command(['git','-C',str(tree),'rev-parse','HEAD'])!=sha or command(['git','-C',str(tree),'status','--porcelain','--untracked-files=no']):
            raise ValueError('Cached source changed after preparation')
    for snapshot in result['engines'].values():
        snapshot['runtime']=' / '.join(sorted({revision['runtime'] for revision in snapshot['revisions']}))
    result['initial_load'] = load()
    for engine, data in result['engines'].items():
        cases = CASES + (['quoted_false_mixed_closer', 'quoted_indented_closer', 'html_table'] if engine == 'php' else [])
        samples = {}
        for round_index in range(args.rounds):
            revisions = data['revisions']; offset = round_index % len(revisions)
            for revision in revisions[offset:] + revisions[:offset]:
                print(f'Measuring {engine} {revision["label"]}, round {round_index+1}/{args.rounds}', flush=True)
                tree = prepared[engine, revision['sha']]
                for n in args.sizes:
                    for name in cases:
                        text = fixture(name,n); path = cache / 'fixture.txt';path.write_text(text)
                        row = measure(engine,tree,path,name,n,args.samples)
                        samples.setdefault((revision['label'],name,n), []).append(dict(row,round=round_index+1,load=load()))
        for (label,name,n), runs in samples.items():
            hashes = {r['hash'] for r in runs}
            if len(hashes) != 1:
                raise ValueError(f'Unstable output: {engine} {label} {name} {n}')
            times = [x for r in runs for x in r['samples_ms']]
            data['rows'].append({'revision':label,'case':name,'n':n,'bytes':len(fixture(name,n).encode()),'fixture_sha256':hashlib.sha256(fixture(name,n).encode()).hexdigest(),'output_sha256':hashes.pop(),'median_ms':statistics.median(times),'min_ms':min(times),'max_ms':max(times),'samples':runs})
        partial = args.output.with_suffix('.partial.json')
        partial.parent.mkdir(parents=True,exist_ok=True)
        partial.write_text(json.dumps(result,indent=2)+'\n')
    result['final_load'] = load()
    result['finished_at'] = datetime.now(timezone.utc).isoformat()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    temporary = args.output.with_suffix('.tmp')
    temporary.write_text(json.dumps(result,indent=2)+'\n');temporary.replace(args.output)
    args.output.with_suffix('.partial.json').unlink(missing_ok=True)
    command([sys.executable,str(HERE / 'report.py'),str(args.output)],capture=False)


if __name__ == '__main__':
    main()
