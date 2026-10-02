#!/usr/bin/env python3
"""Remove machine-specific paths from published measurement metadata."""
import json
from pathlib import Path
import sys


def portable(path, root):
    value = Path(path)
    if value.is_relative_to(root):
        return str(value.relative_to(root))
    if '/src/' in path:
        return 'src/' + path.rsplit('/src/', 1)[1]
    return value.name


def metadata(value, root):
    if isinstance(value, str):
        return portable(value, root) if value.startswith('/') else value
    if isinstance(value, list):
        return [metadata(item, root) for item in value]
    if isinstance(value, dict):
        result = {}
        for key, item in value.items():
            name = portable(key, root) if key.startswith('/') else key
            if name in result:
                raise ValueError('Path labels collide: ' + name)
            if key == 'cargo_config_hashes':
                item = {f'layer-{i}/{Path(path).name}': digest for i, (path, digest) in enumerate(item.items())}
            result[name] = metadata(item, root)
        return result
    return value


def publish(path, root):
    original = json.loads(path.read_text())
    published = metadata(original, root)
    published['publication_note'] = 'Absolute paths removed from metadata for publication; original raw measurements remain local.'
    path.write_text(json.dumps(published, indent=2) + '\n')


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    for name in sys.argv[1:]:
        publish(Path(name), root)
