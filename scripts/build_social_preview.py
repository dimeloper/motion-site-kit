#!/usr/bin/env python3
"""Build the repository's GitHub social preview from its own example art."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs/assets/social-preview.jpg"
WIDTH, HEIGHT = 1280, 640

SOURCES = [
    ROOT / "docs/assets/harbor-preview.webp",
    ROOT / "docs/assets/vortex-preview.webp",
    ROOT / "docs/assets/halo-preview.webp",
    ROOT / "docs/examples/vgpu/demo/poster.png",
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    suffix = "Semibold" if bold else "Regular"
    candidate = Path(f"/System/Library/Fonts/SFNS{suffix}.ttf")
    if not candidate.exists():
        candidate = Path("/System/Library/Fonts/SFNS.ttf")
    return ImageFont.truetype(str(candidate), size=size)


canvas = Image.new("RGB", (WIDTH, HEIGHT), "#080a0d")
tile_width = WIDTH // len(SOURCES)

for index, source in enumerate(SOURCES):
    image = Image.open(source).convert("RGB")
    tile = ImageOps.fit(image, (tile_width, HEIGHT), method=Image.Resampling.LANCZOS)
    tile = Image.blend(tile, Image.new("RGB", tile.size, "#101218"), 0.28)
    canvas.paste(tile, (index * tile_width, 0))

overlay = Image.new("RGBA", canvas.size)
pixels = overlay.load()
for x in range(WIDTH):
    opacity = int(220 * max(0, 1 - x / 940))
    for y in range(HEIGHT):
        pixels[x, y] = (4, 6, 9, opacity)
canvas = Image.alpha_composite(canvas.convert("RGBA"), overlay)

draw = ImageDraw.Draw(canvas)
draw.rounded_rectangle((56, 50, 252, 91), radius=20, fill=(245, 245, 238, 238))
draw.text((75, 59), "OPEN SOURCE", font=font(17, bold=True), fill="#101216")
draw.text((56, 132), "motion-site-kit", font=font(28, bold=True), fill="#f5f5ef")

headline = "Cinematic scroll sites.\nMeasured budgets."
draw.multiline_text((52, 198), headline, font=font(62, bold=True), fill="#f7f7f2", spacing=2)
draw.text(
    (56, 506),
    "Frame scrub  ·  GSAP  ·  WebGL  ·  WebGPU",
    font=font(23),
    fill="#deded7",
)
draw.text((56, 558), "github.com/dimeloper/motion-site-kit", font=font(20), fill="#bcbdb8")

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
canvas.convert("RGB").save(OUTPUT, quality=90, optimize=True, progressive=True)
print(f"Wrote {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size:,} bytes)")
