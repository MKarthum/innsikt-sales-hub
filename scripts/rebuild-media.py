#!/usr/bin/env python3
"""Rebuild public WebP derivatives from separately archived source images.

Requires Pillow for rebuild only: python3 -m pip install -r media/requirements.txt
The site and Claude artifact never include media/masters/ or this script.
"""
import argparse
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "media/images.json"
CATALOG = ROOT / "docs/data/visual-assets.json"

def sha(data):
    return hashlib.sha256(data).hexdigest()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--rebuild", action="store_true", help="Regenerate only public derived images")
    parser.add_argument("--reencode", action="store_true", help="Recompress even an already compliant WebP master")
    args = parser.parse_args()
    if not args.rebuild:
        parser.error("Use --rebuild (ordinary checks do not require Pillow)")
    try:
        from PIL import Image, ImageOps
    except ImportError as exc:
        raise SystemExit("Install media/requirements.txt for image rebuilds") from exc

    manifest = json.loads(MANIFEST.read_text())
    assets = json.loads(CATALOG.read_text())
    for entry in manifest["images"]:
        master = (ROOT / entry["master"]).resolve()
        public = (ROOT / entry["public"]).resolve()
        if not master.is_relative_to(ROOT / "media/masters"):
            raise SystemExit("Source must be inside the archive")
        if not public.is_relative_to(ROOT / "docs/assets/library"):
            raise SystemExit("Public image must be in the website asset library")
        with Image.open(master) as original:
            image = ImageOps.exif_transpose(original).convert("RGB")
            original_dimensions = [image.width, image.height]
            if image.width > entry["maxWidth"]:
                target_height = max(1, round(image.height * entry["maxWidth"] / image.width))
                image = image.resize((entry["maxWidth"], target_height), Image.Resampling.LANCZOS)
            public.parent.mkdir(parents=True, exist_ok=True)
            # Avoid recompressing an already tiny legacy WebP: no quality can be
            # recovered from a second lossy encoding. A new hi-res source follows
            # the normal optimizing path; use --reencode to adjust old WebP quality.
            if (master.suffix.lower() == ".webp" and not args.reencode
                    and image.width <= entry["maxWidth"] and
                    master.stat().st_size <= entry["maxBytes"]):
                shutil.copyfile(master, public)
            else:
                for quality in [entry["quality"], 82, 76, 70]:
                    image.save(public, format="WEBP", quality=quality, method=6, exact=True)
                    if public.stat().st_size <= entry["maxBytes"]:
                        break
                else:
                    raise SystemExit(f"Image exceeds cap ({entry['maxBytes']} bytes): {entry['id']}")
        entry["masterSha256"] = sha(master.read_bytes())
        entry["publicSha256"] = sha(public.read_bytes())
        entry["masterDimensions"] = original_dimensions
        entry["publicDimensions"] = [image.width, image.height]
        entry["publicBytes"] = public.stat().st_size
        match = next((a for a in assets["items"] if a["id"] == entry["id"]), None)
        if match is None:
            raise SystemExit(f"No catalog entry for {entry['id']}")
        if ROOT / "docs" / match["path"] != public:
            raise SystemExit("Public path differs from the canonical catalog")
        match["sha256"] = entry["publicSha256"]
        print(f"{entry['id']}: {original_dimensions} -> {entry['publicDimensions']}, {entry['publicBytes']} bytes")
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    CATALOG.write_text(json.dumps(assets, ensure_ascii=False, indent=2) + "\n")

if __name__ == "__main__":
    main()
