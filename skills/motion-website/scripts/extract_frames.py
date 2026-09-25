#!/usr/bin/env python3
"""Extract an evenly-sampled PNG frame sequence from a video clip.

Samples across the clip's full duration rather than taking the first N frames,
so source clips of different lengths yield the same coverage at the same count.

    python3 extract_frames.py hero.mp4 --out frames/raw --count 120 --width 1600
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

PAD = 4
# Names this script writes. Anything else in --out is not ours to delete.
OWNED = re.compile(rf"^(tmp_|stage_)?\d{{{PAD}}}\.png$")


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


def clear_previous(out_dir: Path, force: bool) -> None:
    """Delete frames from an earlier run, refusing to touch PNGs we did not write."""
    foreign = sorted(p.name for p in out_dir.glob("*.png") if not OWNED.match(p.name))
    if foreign and not force:
        die(
            f"{out_dir} contains PNGs this script did not create (first: {foreign[0]}). "
            "Choose an empty --out directory, or pass --force to delete every PNG in it."
        )
    for stale in out_dir.glob("*.png"):
        stale.unlink()


def extract(src: Path, out_dir: Path, count: int, width: int, duration: float, force: bool) -> list[Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    clear_previous(out_dir, force)

    # Ask for slightly more than needed; reconciliation below trims to exact count.
    rate = f"{count + 2}/{duration:.6f}"
    out_pattern = str(out_dir / f"tmp_%0{PAD}d.png")
    base = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(src),
        "-vf", f"fps={rate},scale={width}:-2:flags=lanczos",
    ]
    # FFmpeg 9 removed -vsync; 4.4–6.x accept both. Prefer -fps_mode, fall back.
    result = subprocess.run(
        [*base, "-fps_mode", "passthrough", "-pix_fmt", "rgb24", out_pattern],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        result = subprocess.run(
            [*base, "-vsync", "0", "-pix_fmt", "rgb24", out_pattern],
            capture_output=True, text=True,
        )
    if result.returncode != 0:
        sys.stderr.write(result.stderr)
        die("ffmpeg failed to extract frames")
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
    parser.add_argument("--force", action="store_true",
                        help="delete every PNG in --out, including files this script did not write")
    args = parser.parse_args()

    if not args.input.exists():
        die(f"input not found: {args.input}")
    if args.count < 2:
        die("--count must be at least 2")
    # Matches frameCountMin and frameCountMax in motion.config.json, so the
    # warning appears before the budget gate would fail on the same count.
    if not 60 <= args.count <= 150:
        print(
            f"warning: --count {args.count} is outside the 60-150 range the budget gate accepts. "
            "Below 60 looks steppy; above 150 adds weight without perceptible smoothness at scroll speed.",
            file=sys.stderr,
        )

    require_ffmpeg()
    duration = probe_duration(args.input)
    raw = extract(args.input, args.out, args.count, args.width, duration, args.force)
    written = reconcile(raw, args.out, args.count)

    total = sum(f.stat().st_size for f in args.out.glob("*.png"))
    print(f"extracted {written} frames at {args.width}px from {duration:.2f}s -> {args.out}")
    print(f"intermediate PNG weight: {total / 1_048_576:.1f} MB (not shipped; run optimize_frames.py next)")


if __name__ == "__main__":
    main()
