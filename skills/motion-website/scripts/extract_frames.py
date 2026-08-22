#!/usr/bin/env python3
"""Extract an evenly-sampled PNG frame sequence from a video clip.

Samples across the clip's full duration rather than taking the first N frames,
so source clips of different lengths yield the same coverage at the same count.

    python3 extract_frames.py hero.mp4 --out frames/raw --count 120 --width 1600
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

PAD = 4


def die(msg: str) -> None:
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def require_ffmpeg() -> None:
    for binary in ("ffmpeg", "ffprobe"):
        if shutil.which(binary) is None:
            die(f"{binary} not found on PATH. Install ffmpeg and retry.")


def probe_duration(src: Path) -> float:
    """Return clip duration in seconds, preferring the video stream's own value."""
    out = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=duration,nb_frames",
            "-show_entries", "format=duration",
            "-of", "json", str(src),
        ],
        capture_output=True, text=True, check=True,
    ).stdout
    data = json.loads(out)
    stream = (data.get("streams") or [{}])[0]
    for value in (stream.get("duration"), data.get("format", {}).get("duration")):
        try:
            seconds = float(value)
            if seconds > 0:
                return seconds
        except (TypeError, ValueError):
            continue
    die("could not determine clip duration from ffprobe output")


def extract(src: Path, out_dir: Path, count: int, width: int, duration: float) -> list[Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    for stale in out_dir.glob(f"*.png"):
        stale.unlink()

    # Ask for slightly more than needed; reconciliation below trims to exact count.
    rate = f"{count + 2}/{duration:.6f}"
    subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(src),
            "-vf", f"fps={rate},scale={width}:-2:flags=lanczos",
            "-vsync", "0",
            "-pix_fmt", "rgb24",
            str(out_dir / f"tmp_%0{PAD}d.png"),
        ],
        check=True,
    )
    return sorted(out_dir.glob("tmp_*.png"))


def reconcile(frames: list[Path], out_dir: Path, count: int) -> int:
    """Rename the ffmpeg output to an exact, zero-padded sequence of `count` frames."""
    if not frames:
        die("ffmpeg produced no frames; is the input a valid video?")

    if len(frames) >= count:
        # Pick `count` evenly spaced frames from what we got.
        picked = [frames[round(i * (len(frames) - 1) / (count - 1))] for i in range(count)]
    else:
        # Short source: hold the last frame rather than failing the build.
        picked = frames + [frames[-1]] * (count - len(frames))
        print(
            f"warning: source yielded {len(frames)} frames for a target of {count}; "
            f"padding with the final frame. Consider a longer clip or a lower --count.",
            file=sys.stderr,
        )

    staged = []
    for index, source in enumerate(picked):
        target = out_dir / f"stage_{index:0{PAD}d}.png"
        shutil.copyfile(source, target)
        staged.append(target)

    for stale in frames:
        stale.unlink(missing_ok=True)
    for target in staged:
        target.rename(out_dir / target.name.replace("stage_", ""))

    return count


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("input", type=Path, help="source video clip")
    parser.add_argument("--out", type=Path, required=True, help="output directory for PNG frames")
    parser.add_argument("--count", type=int, default=120, help="exact number of frames to produce (default: 120)")
    parser.add_argument("--width", type=int, default=1600, help="output width in pixels, height auto (default: 1600)")
    args = parser.parse_args()

    if not args.input.exists():
        die(f"input not found: {args.input}")
    if args.count < 2:
        die("--count must be at least 2")
    if not 60 <= args.count <= 300:
        print(
            f"warning: --count {args.count} is outside the recommended 90-150 range. "
            "Above ~150 adds weight without perceptible smoothness at scroll speed.",
            file=sys.stderr,
        )

    require_ffmpeg()
    duration = probe_duration(args.input)
    raw = extract(args.input, args.out, args.count, args.width, duration)
    written = reconcile(raw, args.out, args.count)

    total = sum(f.stat().st_size for f in args.out.glob("*.png"))
    print(f"extracted {written} frames at {args.width}px from {duration:.2f}s -> {args.out}")
    print(f"intermediate PNG weight: {total / 1_048_576:.1f} MB (not shipped; run optimize_frames.py next)")


if __name__ == "__main__":
    main()
