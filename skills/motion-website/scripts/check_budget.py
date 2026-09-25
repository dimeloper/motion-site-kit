#!/usr/bin/env python3
"""Fail the build when the frame sequence exceeds its performance budget.

This is the load-bearing script in the kit. Sequences do not become heavy by
decision; they grow half a megabyte at a time while everyone is looking at the
visuals. A number in a README does not survive that. A red build does.

    python3 check_budget.py --config motion.config.json
    python3 check_budget.py --config motion.config.json --verbose

Exit codes: 0 pass, 1 budget breach, 2 configuration or input error; incomplete assets are a budget failure.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

DEFAULTS = {
    "sequenceBytes": 8 * 1024 * 1024,
    "singleFrameBytes": 120_000,
    # Every rung at or below this width gets the tighter phone ceiling. A
    # 390px phone at 2x selects 960 and a 1x or 1.5x small screen selects 640,
    # so both rungs are phone downloads. See references/performance-budget.md.
    "phoneRungBytes": 1_500_000,
    "phoneRungWidth": 960,
    "frameCountMax": 150,
    "frameCountMin": 60,
}

# Names used before the phone ceiling moved from the 640 rung to every rung
# phones select. Accepted so older configs keep working.
LEGACY_KEYS = {"narrowRungBytes": "phoneRungBytes", "narrowRungWidth": "phoneRungWidth"}

CUT_ORDER = """
When this fails, work down this list — ordered by weight removed per unit of
visible quality lost:

  1. Frame count 120 -> 90            (~25% off, no perceptible change)
  2. AVIF quality 60 -> 50            (~15-25% off; inspect one frame first)
  3. Crop tighter                     (background pixels cost the same as product pixels)
  4. Simplify the source motion       (inter-frame difference is what you are paying for)
  5. Max width 1600 -> 1280           (last resort; visible on large displays)

Do not drop the phone rungs. Phones select 640 or 960; removing them sends
phones a wider, heavier sequence rather than a static image.
"""


def die(msg: str, code: int = 2) -> None:
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(code)


def human(size: int) -> str:
    return f"{size / 1_048_576:.2f} MiB" if size >= 1_048_576 else f"{size / 1024:.0f} KiB"


def require(condition: bool) -> None:
    if not condition:
        raise ValueError("manifest schema validation failed")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--config", type=Path, default=Path("motion.config.json"))
    parser.add_argument("--frames", type=Path, default=None,
                        help="frame ladder root (default: read from config, else template/frames)")
    parser.add_argument("--verbose", action="store_true")
    parser.add_argument("--strict", action="store_true",
                        help="fail when no frame ladder is present (default: skip, since a fresh "
                             "clone of the template repo has no frames committed and should not be red)")
    args = parser.parse_args()

    if not args.config.exists():
        die(f"config not found: {args.config}")
    try:
        config = json.loads(args.config.read_text())
    except (OSError, ValueError) as error:
        die(f"cannot read config: {error}")
    configured = dict(config.get("budget", {}))
    for old, new in LEGACY_KEYS.items():
        if old in configured:
            configured.setdefault(new, configured.pop(old))
    budget = {**DEFAULTS, **configured}

    frames_root = args.frames or Path(config.get("output", "template/frames"))
    manifest_path = frames_root / "manifest.json"
    if not manifest_path.exists():
        if args.strict:
            die(f"manifest not found at {manifest_path}. Run optimize_frames.py first.", code=1)
        print(f"no frame ladder at {frames_root} — nothing to check. "
              "Run optimize_frames.py, or pass --strict to treat this as a failure.")
        sys.exit(0)
    try:
        manifest = json.loads(manifest_path.read_text())
        require(isinstance(manifest, dict))
        require(type(manifest["count"]) is int and 0 < manifest["count"] <= 10000)
        require(type(manifest["padding"]) is int and 0 < manifest["padding"] <= 12)
        require(isinstance(manifest["widths"], list) and manifest["widths"])
        require(all(type(w) is int and w > 0 for w in manifest["widths"]))
        require(len(set(manifest["widths"])) == len(manifest["widths"]))
        require(manifest["widths"] == sorted(manifest["widths"]))
        require(isinstance(manifest["formats"], list) and manifest["formats"])
        require(all(f in ("avif", "webp") for f in manifest["formats"]))
        require(len(set(manifest["formats"])) == len(manifest["formats"]))
        for width in manifest["widths"]:
            for fmt in manifest["formats"]:
                value = manifest["bytes"][str(width)][fmt]
                require(type(value) is int and value >= 0)
        # A legacy string poster names a frame inside the ladder and needs no
        # extra checks. The current form lists one poster file per rung.
        poster = manifest.get("poster")
        posters: set[Path] = set()
        if isinstance(poster, dict):
            files = poster["files"]
            require(isinstance(files, dict) and set(files) == {str(w) for w in manifest["widths"]})
            require(all(isinstance(f, str) and f.startswith("poster/") and ".." not in f for f in files.values()))
            posters = {Path(f) for f in files.values()}
        else:
            require(poster is None or isinstance(poster, str))
    except (OSError, ValueError, KeyError, TypeError) as error:
        die(f"invalid manifest at {manifest_path}: {error}")

    failures: list[str] = []
    rows: list[tuple[str, str, str, str]] = []

    # Every advertised format is a real download path, including WebP fallback.
    # Measure the files, then compare with the manifest so stale totals cannot
    # turn missing frames or a growing sequence into a green build.
    primary = manifest["formats"][0]
    worst = (0, "")
    measured = {}
    if not any(w <= budget["phoneRungWidth"] for w in manifest["widths"]):
        failures.append(f"no rung at or below {budget['phoneRungWidth']}px; phones would download a desktop sequence")
    expected_all = set()
    for width in manifest["widths"]:
        measured[width] = {}
        for fmt in manifest["formats"]:
            expected = {
                Path(str(width)) / fmt / f"{i:0{manifest['padding']}d}.{fmt}"
                for i in range(manifest["count"])
            }
            expected_all.update(expected)
            missing = sorted(str(p) for p in expected if not (frames_root / p).is_file())
            if missing:
                failures.append(f"{width}px {fmt}: {len(missing)} missing frames (first: {missing[0]})")
            size = 0
            for relative in expected:
                path = frames_root / relative
                if not path.is_file():
                    continue
                frame_size = path.stat().st_size
                size += frame_size
                if frame_size == 0:
                    failures.append(f"empty frame: {relative}")
                if frame_size > worst[0]:
                    worst = (frame_size, str(relative))
            measured[width][fmt] = size
            recorded = manifest["bytes"][str(width)][fmt]
            if size != recorded:
                failures.append(f"{width}px {fmt}: manifest records {recorded} bytes, files contain {size}; regenerate manifest")
            limit = budget["phoneRungBytes"] if width <= budget["phoneRungWidth"] else budget["sequenceBytes"]
            rows.append((f"{width}px", fmt, human(size), human(limit)))
            if size > limit:
                failures.append(f"{width}px {fmt} sequence is {human(size)}, budget {human(limit)} ({size / limit:.1f}x over)")
    for relative in sorted(posters):
        path = frames_root / relative
        if not path.is_file():
            failures.append(f"poster {relative} is listed in the manifest but missing")
        elif path.stat().st_size > budget["singleFrameBytes"]:
            failures.append(f"poster {relative} is {human(path.stat().st_size)}, budget {human(budget['singleFrameBytes'])}")
    extras = sorted(str(p.relative_to(frames_root)) for p in frames_root.rglob("*")
                    if p.is_file() and p.suffix.lstrip(".") in ("avif", "webp")
                    and p.relative_to(frames_root) not in expected_all | posters)
    if extras:
        failures.append(f"{len(extras)} unadvertised frame files (first: {extras[0]}); remove stale outputs")
    if worst[0] > budget["singleFrameBytes"]:
        failures.append(
            f"largest single frame {worst[1]} is {human(worst[0])}, budget {human(budget['singleFrameBytes'])} "
            "— usually an encoder-quality mistake rather than real detail"
        )

    count = manifest["count"]
    if count > budget["frameCountMax"]:
        failures.append(
            f"{count} frames exceeds the {budget['frameCountMax']} maximum — above this "
            "you are paying weight for smoothness nobody can perceive at scroll speed"
        )
    elif count < budget["frameCountMin"]:
        failures.append(f"{count} frames is below the {budget['frameCountMin']} minimum; the sequence will look steppy")

    print(f"frame budget · {count} frames · primary format {primary}\n")
    width_col = max(len(r[0]) for r in rows)
    for rung, fmt, size, limit in rows:
        print(f"  {rung:<{width_col}}  {fmt:<5}  {size:>9}   / {limit}")
    if args.verbose:
        print(f"\n  largest single frame: {worst[1]} at {human(worst[0])}")
        for fmt in manifest["formats"][1:]:
            total = sum(measured[w][fmt] for w in manifest["widths"])
            print(f"  {fmt} fallback ladder total: {human(total)}")

    if failures:
        print("\nBUDGET FAILED\n")
        for failure in failures:
            print(f"  ✗ {failure}")
        print(CUT_ORDER)
        sys.exit(1)

    print("\n✓ within budget")


if __name__ == "__main__":
    main()
