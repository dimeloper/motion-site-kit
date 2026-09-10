#!/usr/bin/env python3
"""Check the self-contained GLBs and first-party JS that live examples ship.

2 MiB per model allows modest headroom above the current ~1.1 MiB largest
compressed model; 128 KiB of first-party JS allows >3x the current largest
example. These are separate ceilings, not increases to the frame budget.
External CDN modules and actual page transfer still need browser measurement.
"""
import json
from pathlib import Path
import struct
import sys

ROOT = Path(__file__).resolve().parents[1]
MODEL_LIMIT = 2 * 1024 * 1024
JS_LIMIT = 128 * 1024


def check(root=ROOT):
    failures = []
    for name in ('local', 'saas', 'commerce'):
        folder = root / 'docs/examples' / name
        models = list((folder / 'models').glob('*.glb'))
        if not models:
            failures.append(f'{name}: no model assets found')
        for path in models:
            data = path.read_bytes()
            if len(data) > MODEL_LIMIT:
                failures.append(f'{name}/{path.name}: model exceeds {MODEL_LIMIT} bytes; compress textures/geometry')
            try:
                magic, version, length, chunk_size, chunk_type = struct.unpack_from('<4sIIII', data)
                if magic != b'glTF' or version != 2 or length != len(data) or chunk_type != 0x4e4f534a:
                    raise ValueError('invalid GLB header')
                doc = json.loads(data[20:20 + chunk_size])
                if any('uri' in item for kind in ('buffers', 'images') for item in doc.get(kind, [])):
                    raise ValueError('external/data URI assets bypass the self-contained model budget')
            except (ValueError, struct.error, UnicodeDecodeError) as error:
                failures.append(f'{name}/{path.name}: {error}')
            print(f'{name}/{path.name}: {len(data):,} / {MODEL_LIMIT:,} bytes')
        scripts = list((folder / 'src').glob('*.js')) + list(folder.glob('*.js'))
        scripts += list((root / 'docs/examples/shared').glob('*.js'))
        size = sum(path.stat().st_size for path in scripts)
        if not scripts or size > JS_LIMIT:
            failures.append(f'{name}: first-party JS missing or above {JS_LIMIT} bytes')
        print(f'{name} first-party JS: {size:,} / {JS_LIMIT:,} bytes')
    return failures


if __name__ == '__main__':
    errors = check()
    for error in errors:
        print(f'FAIL: {error}', file=sys.stderr)
    sys.exit(bool(errors))
