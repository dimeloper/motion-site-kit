#!/usr/bin/env bash
# Compress a Meshy/studio GLB for the WebGL demos.
# Geometry: meshopt (EXT_meshopt_compression). Textures: WebP, max 1024px.
# Harbor loaf: 15.7 MB → 1.0 MB (Aug 2026). Keep vertex count — do not simplify crust.
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "usage: $0 <input.glb> <output.glb>" >&2
  exit 1
fi

npx --yes @gltf-transform/cli@4.2.1 optimize "$1" "$2" \
  --compress meshopt \
  --texture-compress webp \
  --texture-size 1024 \
  --simplify false

npx --yes @gltf-transform/cli@4.2.1 inspect "$2"
echo "Wire MeshoptDecoder on GLTFLoader before shipping (see docs/examples/local/src/scene.js)."
