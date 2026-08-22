#!/usr/bin/env python3
"""Build the responsive AVIF/WebP frame ladder and its manifest.

Reads PNG frames produced by extract_frames.py (or Remotion's --sequence output)
and writes frames/{width}/{format}/{index}.{format} plus a manifest.json the
runtime reads instead of guessing at filenames.

    python3 optimize_frames.py frames/raw --out template/frames --config motion.config.json
"""

from __future__ import annotations

import argparse
import json
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

try:
    from PIL import Image, features
except ImportError:
    print("error: Pillow is required. pip install 'Pillow>=11.3'", file=sys.stderr)
    sys.exit(1)

PAD = 4
DEFAULT_WIDTHS = [640, 960, 1600]
DEFAULT_FORMATS = ["avif", "webp"]
QUALITY = {"avif": 60, "webp": 78}


def die(msg: str) -> None:
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def load_config(path: Path | None) -> dict:
    if path is None or not path.exists():
        return {}
    return json.loads(path.read_text())


def available_formats(requested: list[str]) -> list[str]:
    ok = []
    for fmt in requested:
        if fmt == "avif" and not features.check("avif"):
            print(
                "warning: this Pillow build has no AVIF support; skipping the AVIF rung. "
                "Install 'pillow-avif-plugin' or a Pillow build with libavif to cut ~30-50% off page weight.",
                file=sys.stderr,
            )
            continue
        if fmt == "webp" and not features.check("webp"):
            die("Pillow has no WebP support; cannot produce a usable ladder")
        ok.append(fmt)
    if not ok:
        die("no usable output formats")
    return ok


def encode_one(src: Path, index: int, out_root: Path, widths: list[int], formats: list[str], quality: dict) -> None:
    with Image.open(src) as im:
        im = im.convert("RGB")
        source_width = im.width
        for width in widths:
            resized = im if width >= source_width else im.resize(
                (width, round(im.height * width / im.width)), Image.LANCZOS
            )
            for fmt in formats:
                target = out_root / str(width) / fmt / f"{index:0{PAD}d}.{fmt}"
                target.parent.mkdir(parents=True, exist_ok=True)
                save_kwargs = {"quality": quality.get(fmt, 60)}
                if fmt == "avif":
                    save_kwargs["speed"] = 6
                elif fmt == "webp":
                    save_kwargs["method"] = 5
                resized.save(target, format=fmt.upper(), **save_kwargs)


def directory_bytes(path: Path) -> int:
    return sum(f.stat().st_size for f in path.rglob("*") if f.is_file())


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("input", type=Path, help="directory of source PNG frames")
    parser.add_argument("--out", type=Path, required=True, help="output root for the frame ladder")
    parser.add_argument("--config", type=Path, default=Path("motion.config.json"))
    parser.add_argument("--poster-at", type=float, default=0.33,
                        help="fractional position of the poster frame (default: 0.33, "
                             "since frame 0 is usually the weakest composition)")
    parser.add_argument("--jobs", type=int, default=8)
    args = parser.parse_args()

    config = load_config(args.config)
    widths = sorted(config.get("frames", {}).get("widths", DEFAULT_WIDTHS))
    formats = available_formats(config.get("formats", DEFAULT_FORMATS))
    quality = {**QUALITY, **config.get("quality", {})}

    sources = sorted(args.input.glob("*.png")) or sorted(args.input.glob("*.jpg"))
    if not sources:
        die(f"no PNG or JPG frames found in {args.input}")

    with Image.open(sources[0]) as probe:
        aspect = round(probe.width / probe.height, 6)

    args.out.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        list(pool.map(
            lambda pair: encode_one(pair[1], pair[0], args.out, widths, formats, quality),
            enumerate(sources),
        ))

    poster_index = min(len(sources) - 1, round((len(sources) - 1) * args.poster_at))
    poster_format = "webp" if "webp" in formats else formats[0]

    manifest = {
        "count": len(sources),
        "formats": formats,
        "widths": widths,
        "aspect": aspect,
        "pattern": "{width}/{format}/{index}.{format}",
        "padding": PAD,
        "poster": f"{widths[len(widths) // 2]}/{poster_format}/{poster_index:0{PAD}d}.{poster_format}",
        "bytes": {
            str(width): {fmt: directory_bytes(args.out / str(width) / fmt) for fmt in formats}
            for width in widths
        },
    }
    (args.out / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")

    print(f"encoded {len(sources)} frames -> {args.out}")
    for width in widths:
        parts = "  ".join(
            f"{fmt}: {manifest['bytes'][str(width)][fmt] / 1_048_576:6.2f} MB" for fmt in formats
        )
        print(f"  {width:>4}px   {parts}")
    print(f"poster: {manifest['poster']}")


if __name__ == "__main__":
    main()
