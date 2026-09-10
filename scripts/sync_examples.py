#!/usr/bin/env python3
"""Generate mirrors from canonical sources; --check is read-only for CI.

The frame engine lives in template/src. WebGL craft examples and model assets
live in docs/examples (the published, visually tuned versions). examples/ is a
copy for discovery; model symlinks and ignored local frame ladders stay intact.
Root docs/config.js remains an independent demo reskin.
"""
import argparse
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]


def sync(write=False):
    pairs = [(ROOT / 'template/src' / name, ROOT / 'docs/src' / name)
             for name in ('motion.js', 'frame-cache.js', 'validate-config.js')]
    for name in ('local', 'saas', 'commerce', 'shared'):
        source = ROOT / 'docs/examples' / name
        for path in source.rglob('*'):
            if path.is_file() and (path.suffix in ('.js', '.css', '.html')
                                  or (path.suffix == '.webp' and path.parent.name == 'images')):
                pairs.append((path, ROOT / 'examples' / name / path.relative_to(source)))
    differences = []
    for source, target in pairs:
        if not target.exists() or source.read_bytes() != target.read_bytes():
            differences.append(str(target.relative_to(ROOT)))
            if write:
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(source.read_bytes())
    return differences


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--write', action='store_true')
    mode.add_argument('--check', action='store_true')
    args = parser.parse_args()
    differences = sync(args.write)
    for path in differences:
        print(f'{"updated" if args.write else "out of sync"}: {path}')
    if not differences:
        print('Example mirrors and frame engines are aligned.')
    sys.exit(bool(differences) and args.check)
