#!/usr/bin/env python3
"""Build a review image. Never marks a generated illustration as approved."""
import json
import pathlib
import sys
from PIL import Image, ImageOps

source, target = map(pathlib.Path, sys.argv[1:3])
limit = int(sys.argv[3]) if len(sys.argv) > 3 else 250000
target.parent.mkdir(parents=True, exist_ok=True)
with Image.open(source) as opened:
    original = ImageOps.exif_transpose(opened).convert("RGB")
    if abs(original.width / original.height - 16 / 9) > 0.04:
        raise ValueError("Illustrasjonen må være i 16:9-format")
    for width in (min(1600, original.width), min(1440, original.width),
                  min(1280, original.width), min(1120, original.width)):
        if width < 960 or width > original.width:
            continue
        image = original.resize((width, round(original.height * width / original.width)),
                                Image.Resampling.LANCZOS)
        for quality in (86, 82, 78, 74, 70):
            image.save(target, "WEBP", quality=quality, method=6)
            if target.stat().st_size <= limit:
                print(json.dumps({"width": image.width, "height": image.height,
                    "bytes": target.stat().st_size, "quality": quality}))
                sys.exit(0)
    target.unlink(missing_ok=True)
    raise ValueError("Bilde kan ikke optimaliseres uten mulig tap av lesbarhet")
