# Fold design review

Reviewed 9 September 2026 against the public [GetLayers library](https://www.getlayers.ai/)
and [Vesper preview](https://www.getlayers.ai/layer/vesper). The reference was
used to assess composition, type scale and the relationship between artwork
and navigation. Its artwork, code and premium content were not copied.

## What fell short in v1

The first screen led with explanatory text while the material sat farther down
in a rectangular demo panel. The page explained the rendering technique before
establishing a visual identity. Similar text sections gave the lower page little
change of pace. This made it read as a technical sample, even though the shader
and fallback behavior worked.

## What changed in v2

- The opening screen is one composition: a large FOLD wordmark behind a finite
  sculptural sheet, with navigation, introduction and finish controls around it.
- An original ray-marched thin sheet replaces the flat procedural field. Broad
  bends establish the silhouette; fine pleats and studio reflections describe
  the surface. Scroll changes its bend and viewing angle.
- Self-hosted Manrope, a warm paper background, restrained rules and an ink
  closing section give the page a consistent visual identity.
- The sequence moves from the full object to an introduction, a champagne
  close-up, three short material principles and a closing link to the kit.
- Silver, champagne and graphite are functioning controls, with pressed states
  and matching posters when live rendering is unavailable.
- Mobile uses its own scale and section arrangement. Narrow width never turns
  animation off. The surface uses at most 1.5 DPR and draws only when needed.

## Review evidence and remaining limits

Desktop (1440px) and phone-sized (390px) screenshots were reviewed for the
opening composition and material section. The narrow layout has no horizontal
overflow; type, controls and artwork remain legible. Chromium checks pass for
forward/reverse rendering, device-loss recovery, no-WebGPU finish selection and
axe in the tested fallback state. A reproduced early finish-selection failure
was fixed; a new test also checks reduced-motion changes during initialization
and disposal of a late-created engine. The live reverse check waits for the entrance
fade to finish and captures a fixed viewport region so screenshots do not
change scroll progress themselves.

This is a substantial improvement in hierarchy and art direction. It is still
an original procedural study, not a claim of photoreal material accuracy or
parity with every GetLayers template. Native macOS Safari 26.6.2 passes live
rendering and finish selection. Real-phone GPU load, battery use and cellular
behavior still need direct verification before production claims. The
large material close-up deliberately shows a crop; the hero shows the silhouette.

See [README](README.md) for current build sizes and fallback contracts, and
[the comparison](FRAME-COMPARISON.md) for current and archived shader exports.

## V3, 10 September 2026

The sheet now has fewer, broader pleats. Broad studio reflections replace the
strong horizontal dark stripe; champagne uses a warmer, less orange tint. A
working silver/champagne comparison replaces three repetitive text columns,
so the lower page lets visitors inspect a material difference. Copy describes
the object and interaction before linking to technical details.

The three fallback posters were rendered from the current shader. Their hashes,
dimensions and source hash are in [poster provenance](poster-provenance.json).
The archived v2 sequence remains available for reproducible byte comparisons;
its measurements do not describe the current shader.
