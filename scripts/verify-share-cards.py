"""Decode the actual exported cards, including a reduced social sharing size."""

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "output/qr-tools"))
from PIL import Image
import zxingcpp

manifest = json.loads((ROOT / "assets/share/links.json").read_text(encoding="utf-8"))
assert len({item["url"] for item in manifest["channels"]}) == len(manifest["channels"])
for channel in manifest["channels"]:
    image = Image.open(ROOT / "assets/share" / f"moonshi-line-{channel['slug']}.png").convert("RGB")
    assert image.size == (1080, 1350)
    for width in (1080, 540, 360):
        resized = image.resize((width, width * 1350 // 1080), Image.Resampling.LANCZOS)
        results = zxingcpp.read_barcodes(resized)
        assert len(results) == 1 and results[0].text == channel["url"], (channel["slug"], width, results)
    print(f"PASS {channel['slug']}: 1080, 540, 360 px decode to {channel['url']}")
    preview = Image.open(ROOT / "assets/share" / f"moonshi-line-{channel['slug']}-preview.png").convert("RGB")
    assert preview.size == (1200, 630)
    for width in (1200, 600, 400):
        resized = preview.resize((width, width * 630 // 1200), Image.Resampling.LANCZOS)
        results = zxingcpp.read_barcodes(resized)
        assert len(results) == 1 and results[0].text == channel["url"], (channel["slug"], width, results)
    print(f"PASS {channel['slug']} preview: 1200, 600, 400 px decode correctly")
