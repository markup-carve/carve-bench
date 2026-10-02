"""Measure retained PHP marker-cache memory with source and output checks."""
import argparse
import json
from pathlib import Path

from run import HERE, digest, execute, source_identity, timestamp, tree_digest

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--main', type=Path, required=True)
parser.add_argument('--candidate', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
if args.output.exists():
    parser.error('Choose a new output path')
roots = {name: getattr(args, name).resolve() for name in ['main', 'candidate']}
sources = {name: source_identity(root) for name, root in roots.items()}
if sources['main']['revision'] == sources['candidate']['revision']:
    parser.error('Main and candidate revisions must differ')
repo = HERE.parent.parent
session = {
    'started_at': timestamp(), 'driver': source_identity(repo), 'sources': sources,
    'worker_hashes': {name: digest(HERE / name) for name in ['run.py', 'cache-retention.py', 'cache-memory.php', 'verify-source.php']},
    'runtime': execute(['php', '-v']), 'php_modules': execute(['php', '-m']),
    'composer_artifact_hashes': {name: tree_digest(root / 'vendor/composer') for name, root in roots.items()},
    'installed_metadata_hashes': {name: digest(root / 'vendor/composer/installed.json') for name, root in roots.items()},
    'stage': 'live retained bytes after unique >4KB payloads and result release',
    'rows': [],
}
for count in [128, 512, 1024]:
    for variant, root in roots.items():
        row = json.loads(execute(['php', '-d', 'opcache.enable_cli=0', '-d', 'pcov.enabled=0', '-d', 'xdebug.mode=off',
                                 str(HERE / 'cache-memory.php'), str(root), str(count)]))
        row.update(variant=variant, observed_at=timestamp())
        session['rows'].append(row)
    if session['rows'][-1]['output_hash'] != session['rows'][-2]['output_hash']:
        raise RuntimeError('Marker output hashes differ')
for variant, root in roots.items():
    if source_identity(root) != sources[variant] or tree_digest(root / 'vendor/composer') != session['composer_artifact_hashes'][variant]:
        raise RuntimeError('Source or Composer artifacts changed')
if source_identity(repo) != session['driver'] or any(digest(HERE / name) != value for name, value in session['worker_hashes'].items()):
    raise RuntimeError('Measurement driver changed')
session['finished_at'] = timestamp()
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps(session, indent=2) + '\n')
