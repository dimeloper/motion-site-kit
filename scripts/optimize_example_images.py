#!/usr/bin/env python3
"""Create delivery WebPs from retained Harbor JPEG sources.

1280px is sufficient for the current poster/card crops at typical laptop widths
and capped phone DPR. Quality 84 retains bread-crust detail in visual review.
The originals remain available for a larger future layout; no source is replaced.
"""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
report = []
for name in ('loaf', 'board'):
    source = ROOT / 'docs/examples/local/images' / f'{name}.jpg'
    target = source.with_suffix('.webp')
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert('RGB')
        width = min(1280, image.width)
        height = round(image.height * width / image.width)
        image = image.resize((width, height), Image.Resampling.LANCZOS)
        image.save(target, 'WEBP', quality=84, method=6)
    report.append(dict(source=str(source.relative_to(ROOT)), output=str(target.relative_to(ROOT)),
                       sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),
                       sourceBytes=source.stat().st_size, outputBytes=target.stat().st_size,
                       width=width, height=height, quality=84))
print(json.dumps(report, indent=2))
