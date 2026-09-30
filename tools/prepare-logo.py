#!/usr/bin/env python3
"""Turn a logo image into a transparent PNG cropped to the mark.

    python3 tools/prepare-logo.py input.jpg assets/logo.png
    python3 tools/prepare-logo.py input.jpg assets/logo.png --crop 770,500,1240,1215
    python3 tools/prepare-logo.py input.png assets/logo.png --background light

Needs: pip install pillow numpy

--background  dark (default) or light: what the mark is drawn on. Dark backgrounds become
              transparent by brightness, light ones by darkness.
--crop        x0,y0,x1,y1 region to keep before trimming (use it to drop tagline text or
              margins). Coordinates are in the input image's pixels.
--threshold   0-255 cut-off below which a pixel is fully transparent (default 40).
--padding     transparent margin around the result in px (default 12).

Also writes <output>-preview-light.png and <output>-preview-dark.png so you can check the
result on both slide backgrounds.
"""
import argparse
import sys
from pathlib import Path

try:
    import numpy as np
    from PIL import Image
except ImportError:
    sys.exit("missing dependency: pip install pillow numpy")

ap = argparse.ArgumentParser()
ap.add_argument("input")
ap.add_argument("output")
ap.add_argument("--crop")
ap.add_argument("--background", choices=["dark", "light"], default="dark")
ap.add_argument("--threshold", type=int, default=40)
ap.add_argument("--padding", type=int, default=12)
a = ap.parse_args()

im = Image.open(a.input)
if im.mode in ("RGBA", "LA") and np.asarray(im.convert("RGBA"))[..., 3].min() < 250:
    rgba = np.asarray(im.convert("RGBA")).astype(float)       # already transparent: just trim
    rgb, alpha = rgba[..., :3], rgba[..., 3] / 255
else:
    rgb = np.asarray(im.convert("RGB")).astype(float)
    strength = rgb.max(axis=2) if a.background == "dark" else 255 - rgb.min(axis=2)
    alpha = np.clip((strength - a.threshold) / 110, 0, 1)
    if a.background == "dark":
        rgb = np.where(alpha[..., None] > 0, np.clip(rgb / np.maximum(alpha[..., None], 0.3), 0, 255), 0)
    else:
        rgb = np.where(alpha[..., None] > 0, np.clip(255 - (255 - rgb) / np.maximum(alpha[..., None], 0.3), 0, 255), 0)

if a.crop:
    x0, y0, x1, y1 = (int(v) for v in a.crop.split(","))
    rgb, alpha = rgb[y0:y1, x0:x1], alpha[y0:y1, x0:x1]

img = Image.fromarray(np.dstack([rgb, alpha * 255]).astype("uint8"), "RGBA")
box = img.getbbox()
if not box:
    sys.exit("nothing left after removing the background; try --background light or a lower --threshold")
img = img.crop(box)
pad = a.padding
out = Image.new("RGBA", (img.width + 2 * pad, img.height + 2 * pad), (0, 0, 0, 0))
out.paste(img, (pad, pad))
out.save(a.output)

stem = Path(a.output)
for name, bg in (("light", (250, 247, 242)), ("dark", (26, 21, 18))):
    prev = Image.new("RGBA", out.size, bg + (255,))
    prev.alpha_composite(out)
    prev.convert("RGB").save(stem.with_name(f"{stem.stem}-preview-{name}.png"))
print(f"wrote {a.output} ({out.width}x{out.height}) and two preview images")
