#!/usr/bin/env python3
"""Report embedded image sizes separately from estimated RGBA texture storage.

Requires Pillow. This is an asset inspection, not observed GPU residency. The
mip estimate sums each level down to 1x1 at four bytes/pixel, without assuming
that a driver actually chooses that format or retains every mip level.
"""
import io
import json
from pathlib import Path
import struct
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]

def inspect(path):
    data = path.read_bytes()
    size, kind = struct.unpack_from('<II', data, 12)
    if kind != 0x4E4F534A:
        raise ValueError(f'{path}: expected JSON chunk')
    document = json.loads(data[20:20 + size])
    binary = 20 + size + 8
    images = []
    for item in document.get('images', []):
        view = document['bufferViews'][item['bufferView']]
        offset = binary + view.get('byteOffset', 0)
        with Image.open(io.BytesIO(data[offset:offset + view['byteLength']])) as image:
            width, height = image.size
        w, h, mip_bytes = width, height, 0
        while True:
            mip_bytes += w * h * 4
            if w == h == 1:
                break
            w, h = max(1, w // 2), max(1, h // 2)
        images.append(dict(name=item.get('name', 'unnamed'), width=width, height=height,
                           encodedBytes=view['byteLength'], rgbaBaseBytes=width * height * 4,
                           rgbaWithMipsBytes=mip_bytes))
    return dict(path=str(path.relative_to(ROOT)), modelBytes=len(data), images=images,
                usage='unused legacy asset; Vortex uses a procedural CAD band' if path.parent.parent.name == 'saas' else 'loaded by current scene',
                rgbaBaseBytes=sum(i['rgbaBaseBytes'] for i in images),
                rgbaWithMipsBytes=sum(i['rgbaWithMipsBytes'] for i in images))

if __name__ == '__main__':
    print(json.dumps(dict(
        method='Embedded GLB image dimensions; calculated RGBA8 bytes, not measured GPU residency. Excludes environment maps, render targets and textures created in code.',
        models=[inspect(p) for p in sorted((ROOT / 'docs/examples').glob('*/models/*.glb'))],
    ), indent=2))
