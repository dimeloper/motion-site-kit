#!/usr/bin/env bash
#
# Copy the committed Pages ladder into template/frames so a clone can reskin
# without ffmpeg, Pillow, or a source clip.
#
#   ./scripts/use-demo-frames.sh
#   cd template && python3 -m http.server 8080
#
# template/frames/ stays gitignored — this is a local checkout step, not a
# second copy of the 120-frame ladder in git. To see the site with no copy
# at all, serve docs/ instead (that tree is what GitHub Pages publishes).
#
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
src="$root/docs/frames"
dst="$root/template/frames"

if [[ ! -f "$src/manifest.json" ]]; then
  echo "error: $src/manifest.json is missing — this clone is incomplete" >&2
  exit 1
fi

rm -rf "$dst"
cp -R "$src" "$dst"
echo "copied docs/frames → template/frames ($(python3 -c "import json; print(json.load(open('$src/manifest.json'))['count'])") frames)"
