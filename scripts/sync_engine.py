#!/usr/bin/env python3
"""Mirror the frame engine from the template into the docs site; --check is read-only for CI.

The frame engine lives in skills/motion-website/assets/template/src (reachable
through the root template/ symlink). GitHub Pages serves docs/, which cannot
follow a symlink out of its own tree, so the landing page runs a byte-for-byte
copy in docs/src. docs/config.js stays independent: it is the demo's reskin.
"""
import argparse
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
ENGINE = ('motion.js', 'frame-cache.js', 'validate-config.js', 'ladder.js')


def sync(write=False):
    differences = []
    for name in ENGINE:
        source = ROOT / 'template/src' / name
        target = ROOT / 'docs/src' / name
        if not target.exists() or source.read_bytes() != target.read_bytes():
            differences.append(str(target.relative_to(ROOT)))
            if write:
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
        print('docs/src frame engine matches the template.')
    sys.exit(bool(differences) and args.check)
