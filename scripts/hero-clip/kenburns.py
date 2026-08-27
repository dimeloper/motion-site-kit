#!/usr/bin/env python3
"""Ken Burns + crossfade two stills into a 1600x900 PNG sequence."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def ease(t: float) -> float:
    return t * t * (3 - 2 * t)


def cover_crop(im: Image.Image, width: int, height: int, zoom: float, cx: float, cy: float) -> Image.Image:
    src_w, src_h = im.size
    scale = max(width / src_w, height / src_h) * zoom
    new_w = src_w * scale
    new_h = src_h * scale
    resized = im.resize((max(1, round(new_w)), max(1, round(new_h))), Image.Resampling.LANCZOS)
    left = (resized.width - width) * cx
    top = (resized.height - height) * cy
    left = max(0, min(left, resized.width - width))
    top = max(0, min(top, resized.height - height))
    return resized.crop((round(left), round(top), round(left) + width, round(top) + height))


def grade(im: Image.Image, brightness: float, color: float, contrast: float) -> Image.Image:
    im = ImageEnhance.Brightness(im).enhance(brightness)
    im = ImageEnhance.Color(im).enhance(color)
    im = ImageEnhance.Contrast(im).enhance(contrast)
    return im


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--a", type=Path, required=True)
    parser.add_argument("--b", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--count", type=int, default=120)
    parser.add_argument("--width", type=int, default=1600)
    parser.add_argument("--height", type=int, default=900)
    args = parser.parse_args()

    args.out.mkdir(parents=True, exist_ok=True)
    wide = grade(Image.open(args.a).convert("RGB"), 0.86, 0.92, 1.08)
    close = grade(Image.open(args.b).convert("RGB"), 0.94, 0.9, 1.12)

    blend_start = 0.46
    blend_end = 0.62

    for i in range(args.count):
        t = i / (args.count - 1)
        wide_frame = cover_crop(wide, args.width, args.height, lerp(1.06, 1.24, ease(t)), lerp(0.42, 0.62, t), 0.48)
        close_frame = cover_crop(close, args.width, args.height, lerp(1.12, 1.32, ease(t)), 0.58, lerp(0.42, 0.38, t))

        if t <= blend_start:
            frame = wide_frame
        elif t >= blend_end:
            frame = close_frame
        else:
            u = ease((t - blend_start) / (blend_end - blend_start))
            frame = Image.blend(wide_frame, close_frame, u)

        frame = frame.filter(ImageFilter.UnsharpMask(radius=1.2, percent=80, threshold=2))
        frame.save(args.out / f"{i:04d}.png", optimize=False)
        if i % 20 == 0 or i == args.count - 1:
            print(f"wrote {i + 1}/{args.count}", flush=True)

    print(f"sequence -> {args.out}")


if __name__ == "__main__":
    main()
