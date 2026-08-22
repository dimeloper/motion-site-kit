#!/usr/bin/env python3
"""Fail the build when the frame sequence exceeds its performance budget.

This is the load-bearing script in the kit. Sequences do not become heavy by
decision; they grow half a megabyte at a time while everyone is looking at the
visuals. A number in a README does not survive that. A red build does.

    python3 check_budget.py --config motion.config.json
    python3 check_budget.py --config motion.config.json --verbose

Exit codes: 0 pass, 1 budget breach, 2 configuration or input error.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

DEFAULTS = {
    "sequenceBytes": 8 * 1024 * 1024,
    "singleFrameBytes": 120_000,
    "narrowRungBytes": 1_500_000,
    "narrowRungWidth": 640,
    "frameCountMax": 150,
    "frameCountMin": 60,
}

CUT_ORDER = """
When this fails, work down this list — ordered by weight removed per unit of
visible quality lost:

  1. Frame count 120 -> 90            (~25% off, no perceptible change)
  2. AVIF quality 65 -> 55            (~20-30% off; inspect one frame first)
  3. Crop tighter                     (background pixels cost the same as product pixels)
  4. Simplify the source motion       (inter-frame difference is what you are paying for)
  5. Max width 1600 -> 1280           (last resort; visible on large displays)

Do not drop the 640 rung. It is the cheapest one and it serves the most visitors.
"""


def die(msg: str, code: int = 2) -> None:
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(code)


def human(size: int) -> str:
    return f"{size / 1_048_576:.2f} MB" if size >= 1_048_576 else f"{size / 1024:.0f} KB"


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
    config = json.loads(args.config.read_text())
    budget = {**DEFAULTS, **config.get("budget", {})}

    frames_root = args.frames or Path(config.get("output", "template/frames"))
    manifest_path = frames_root / "manifest.json"
    if not manifest_path.exists():
        if args.strict:
            die(f"manifest not found at {manifest_path}. Run optimize_frames.py first.", code=1)
        print(f"no frame ladder at {frames_root} — nothing to check. "
              "Run optimize_frames.py, or pass --strict to treat this as a failure.")
        sys.exit(0)
    manifest = json.loads(manifest_path.read_text())

    failures: list[str] = []
    rows: list[tuple[str, str, str, str]] = []

    # Preferred format is the first the manifest lists — that is what most visitors download.
    primary = manifest["formats"][0]

    for width in manifest["widths"]:
        size = manifest["bytes"][str(width)][primary]
        limit = budget["narrowRungBytes"] if width <= budget["narrowRungWidth"] else budget["sequenceBytes"]
        ok = size <= limit
        rows.append((f"{width}px", primary, human(size), human(limit) if ok else f"{human(limit)}  ← OVER"))
        if not ok:
            failures.append(
                f"{width}px {primary} sequence is {human(size)}, budget {human(limit)} "
                f"({size / limit:.1f}x over)"
            )

    # Largest single frame across every rung and format.
    worst = (0, "")
    for path in frames_root.rglob("*"):
        if path.is_file() and path.suffix.lstrip(".") in manifest["formats"]:
            size = path.stat().st_size
            if size > worst[0]:
                worst = (size, str(path.relative_to(frames_root)))
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
            total = sum(manifest["bytes"][str(w)][fmt] for w in manifest["widths"])
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
