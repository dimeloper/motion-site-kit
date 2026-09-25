#!/usr/bin/env python3
"""Check the self-contained GLBs and first-party JS that live examples ship.

2 MiB per model allows modest headroom above the current ~1.1 MiB largest
compressed model; 128 KiB of first-party JS allows >3x the current largest
example. These are separate ceilings, not increases to the frame budget.
External CDN modules and actual page transfer still need browser measurement.
"""
import json
import re
from pathlib import Path
import struct
import sys

ROOT = Path(__file__).resolve().parents[1]
MODEL_LIMIT = 2 * 1024 * 1024
JS_LIMIT = 128 * 1024


def referenced_text(root):
    """Everything that can point at an example asset: pages, styles, scripts, the kit."""
    docs = root / 'docs'
    files = [p for pattern in ('**/*.js', '**/*.html', '**/*.css') for p in docs.glob(pattern)
             if 'node_modules' not in p.parts and '/vgpu/' not in str(p)]
    text = '\n'.join(p.read_text(errors='ignore') for p in files)
    optimisation = docs / 'image-optimization.json'
    if optimisation.exists():
        # Retained masters the delivery WebPs are encoded from.
        text += '\n'.join(Path(item['source']).name for item in json.loads(optimisation.read_text()))
    return text


def check(root=ROOT):
    failures = []
    everything = referenced_text(root)
    for name in ('local', 'saas', 'commerce'):
        folder = root / 'docs/examples' / name
        models = list((folder / 'models').glob('*.glb'))
        scripts = list((folder / 'src').glob('*.js')) + list(folder.glob('*.js'))
        # A GLB nothing loads is dead weight in every clone. Vortex builds its
        # band in code and ships no model at all, which is fine.
        source = '\n'.join(path.read_text() for path in scripts)
        for path in models:
            if path.name not in source:
                failures.append(f'{name}/{path.name}: not referenced by the example; delete it')
        for image in sorted((folder / 'images').glob('*')):
            if image.is_file() and image.name not in everything:
                failures.append(f'{name}/images/{image.name}: not referenced by any page, style or script; delete it')
        for referenced in sorted(set(re.findall(r'models/([\w.-]+\.glb)', source))):
            if not (folder / 'models' / referenced).is_file():
                failures.append(f'{name}: references models/{referenced}, which does not exist')
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
