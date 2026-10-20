#!/usr/bin/env python3
"""Check HTML parity for the pinned authored-document benchmark sources."""

import argparse
import hashlib
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]


def digest(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cache', type=Path, default=ROOT / '.realistic-cache')
    parser.add_argument('--output', type=Path, default=ROOT / 'reports/realistic-output-control.json')
    args = parser.parse_args()
    cache = args.cache.resolve()
    pins = json.loads((HERE / 'pins.json').read_text())
    fixtures = json.loads((ROOT / 'corpus/realistic/provenance.json').read_text())['fixtures']
    trees = {engine: cache / engine / sha for engine, sha in pins.items()}
    for engine, tree in trees.items():
        head = subprocess.check_output(['git', '-C', str(tree), 'rev-parse', 'HEAD'], text=True).strip()
        if head != pins[engine]:
            raise ValueError(f'{engine} checkout differs from pin')
    rows = []
    for fixture in fixtures:
        path = ROOT / fixture['fixture']
        if digest(path.read_bytes()) != fixture['fixture_sha256']:
            raise ValueError(f'Fixture changed: {path}')
        js = subprocess.check_output([
            'node', '--input-type=module', '-e',
            "import {readFileSync} from 'node:fs'; import {pathToFileURL} from 'node:url'; "
            "const {carveToHtml}=await import(pathToFileURL(process.argv[1])); "
            "process.stdout.write(carveToHtml(readFileSync(process.argv[2],'utf8')))",
            str(trees['js'] / 'dist/index.js'), str(path),
        ])
        php = subprocess.check_output([
            'php', '-d', 'pcov.enabled=0', '-r',
            'require $argv[1]; echo (new MarkupCarve\\Carve\\CarveConverter())->convert(file_get_contents($argv[2]));',
            str(trees['php'] / 'vendor/autoload.php'), str(path),
        ])
        rust = subprocess.check_output([
            str(trees['rs'] / '.history-worker/bin/history-worker'), str(path), '1', '0',
        ]).split(b'\n', 1)[1]
        if rust != js or php != js + b'\n':
            raise ValueError(f'HTML differs beyond PHP final newline: {fixture["name"]}')
        rows.append({
            'document': fixture['name'], 'fixture_sha256': fixture['fixture_sha256'],
            'js_sha256': digest(js), 'php_sha256': digest(php), 'rs_sha256': digest(rust),
            'php_serialized_sha256': digest(b's:' + str(len(php)).encode() + b':"' + php + b'";'),
            'js_bytes': len(js), 'php_bytes': len(php), 'rs_bytes': len(rust),
            'relationship': 'JS and Rust byte-identical; PHP adds one final newline',
        })
    args.output.write_text(json.dumps({'schema': 1, 'source_commits': pins, 'rows': rows}, indent=2) + '\n')


if __name__ == '__main__':
    main()
