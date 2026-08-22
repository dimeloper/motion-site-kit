#!/usr/bin/env bash
#
# Vendor GSAP and Lenis into template/vendor/ and point the import map at them.
#
# Optional. The template ships with a CDN import map so it runs from any static
# host with no toolchain. Run this when you want the site to have no third-party
# runtime dependency — client work, air-gapped review, or simply not wanting a
# CDN outage to take the hero with it.
#
#   ./scripts/vendor.sh
#
set -euo pipefail

GSAP_VERSION="${GSAP_VERSION:-3.15.0}"
LENIS_VERSION="${LENIS_VERSION:-1.3.26}"

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
vendor="$root/template/vendor"
staging="$(mktemp -d)"
trap 'rm -rf "$staging"' EXIT

command -v npm >/dev/null || { echo "error: npm is required to vendor dependencies" >&2; exit 1; }

echo "installing gsap@$GSAP_VERSION lenis@$LENIS_VERSION ..."
(cd "$staging" && npm install --silent --no-audit --no-fund \
  "gsap@$GSAP_VERSION" "lenis@$LENIS_VERSION" >/dev/null)

rm -rf "$vendor"
mkdir -p "$vendor/gsap" "$vendor/lenis"

# GSAP's ESM entry points live at the package root and use relative imports, so
# the module graph has to come across intact — copying index.js alone breaks it.
for entry in index.js gsap-core.js CSSPlugin.js ScrollTrigger.js Observer.js utils; do
  cp -R "$staging/node_modules/gsap/$entry" "$vendor/gsap/"
done

# lenis.mjs is a single self-contained module.
cp "$staging/node_modules/lenis/dist/lenis.mjs" "$vendor/lenis/lenis.mjs"

# Rewrite the import map in place.
python3 - "$root/template/index.html" <<'PY'
import re, sys, pathlib

path = pathlib.Path(sys.argv[1])
html = path.read_text()
local = '''  {
    "imports": {
      "lenis": "vendor/lenis/lenis.mjs",
      "gsap": "vendor/gsap/index.js",
      "gsap/ScrollTrigger": "vendor/gsap/ScrollTrigger.js"
    }
  }
  '''
updated, n = re.subn(
    r'(<script type="importmap">)(.*?)(</script>)',
    lambda m: m.group(1) + "\n" + local + m.group(3),
    html,
    flags=re.DOTALL,
)
if n != 1:
    sys.exit("error: could not locate exactly one <script type=\"importmap\"> block")
path.write_text(updated)
print("rewrote import map -> local vendor paths")
PY

printf 'gsap %s + lenis %s vendored into template/vendor (%s)\n' \
  "$GSAP_VERSION" "$LENIS_VERSION" "$(du -sh "$vendor" | cut -f1)"
echo "note: template/vendor/ is gitignored by default; remove that line to commit it."
