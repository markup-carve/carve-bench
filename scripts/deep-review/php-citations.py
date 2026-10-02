"""Compare positioned PHP citations in two prepared, clean source trees."""
import argparse
import json
import os
from pathlib import Path
import tempfile

from run import HERE, digest, execute, source_identity, summarize, timestamp, tree_digest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--main', type=Path, required=True)
    parser.add_argument('--candidate', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--rounds', type=int, default=4)
    parser.add_argument('--samples', type=int, default=11)
    parser.add_argument('--cpu', type=int, default=6)
    args = parser.parse_args()
    if args.output.exists() or args.rounds < 2 or args.rounds % 2 or args.samples < 1:
        parser.error('Choose a new output path, an even round count >= 2, and positive samples')
    roots = {'main': args.main.resolve(), 'candidate': args.candidate.resolve()}
    identities = {v: source_identity(root) for v, root in roots.items()}
    if identities['main']['revision'] == identities['candidate']['revision']:
        parser.error('Main and candidate revisions must differ')
    bench = source_identity(HERE.parent.parent)
    hashes = {name: digest(HERE / name) for name in ('run.py', 'php-citations.py', 'php-citations.php', 'verify-source.php')}
    artifacts = {v: tree_digest(root / 'vendor/composer') for v, root in roots.items()}
    session = {'started_at': timestamp(), 'sources': identities, 'driver': bench,
               'worker_hashes': hashes, 'composer_artifact_hashes': artifacts,
               'rounds': args.rounds, 'samples_per_round': args.samples, 'cpu': args.cpu,
               'runtime': execute(['php', '-v']), 'php_modules': execute(['php', '-m']), 'rows': []}
    expected = {}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='carve-php-citations-') as temporary:
        fixture = Path(temporary) / 'fixture.txt'
        for round_index in range(args.rounds):
            variants = ('main', 'candidate') if round_index % 2 == 0 else ('candidate', 'main')
            for stage in ('setter', 'parse+positions', 'parse'):
                for n in ((1024, 4096, 8192) if stage == 'setter' else (128, 1024, 4096)):
                    fixture.write_text('[' + '; '.join(['@a'] * n) + ']\n')
                    for variant in variants:
                        observed = timestamp()
                        load = os.getloadavg()
                        result = execute(['taskset', '-c', str(args.cpu), 'php', '-d', 'opcache.enable_cli=0',
                                          '-d', 'pcov.enabled=0', '-d', 'xdebug.mode=off', str(HERE / 'php-citations.php'),
                                          str(roots[variant]), str(fixture), stage, str(args.samples)])
                        row = json.loads(result)
                        key = stage, n
                        if row['hash'] != expected.setdefault(key, row['hash']):
                            raise RuntimeError(f'Output mismatch: {key}, {variant}')
                        row.update(engine='php', kind='citation_group', n=n, stage=stage, variant=variant,
                                   round=round_index, observed_at=observed, load_average=load,
                                   fixture_hash=digest(fixture))
                        session['rows'].append(row)
                        args.output.write_text(json.dumps(session, indent=2) + '\n')
            print(f'Completed PHP citation round {round_index + 1}/{args.rounds}', flush=True)
    for variant, root in roots.items():
        if source_identity(root) != identities[variant] or tree_digest(root / 'vendor/composer') != artifacts[variant]:
            raise RuntimeError('PHP source or Composer artifacts changed')
    if source_identity(HERE.parent.parent) != bench or any(digest(HERE / name) != value for name, value in hashes.items()):
        raise RuntimeError('Benchmark driver changed')
    session['finished_at'] = timestamp()
    session['summary'] = summarize(session['rows'])
    args.output.write_text(json.dumps(session, indent=2) + '\n')


if __name__ == '__main__':
    main()
