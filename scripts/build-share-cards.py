"""Build vector QR cards without changing the official logo or hiding QR modules."""

import argparse
import base64
import html
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--deps", type=Path, default=ROOT / "output/qr-tools")
args = parser.parse_args()
sys.path.insert(0, str(args.deps.resolve()))
import qrcode

DATA = json.loads((ROOT / "assets/share/links.json").read_text(encoding="utf-8"))
LOGO = base64.b64encode((ROOT / "assets/images/logo-reference.png").read_bytes()).decode("ascii")
OUTPUT = ROOT / "output/brand-share-cards"
OUTPUT.mkdir(parents=True, exist_ok=True)

for channel in DATA["channels"]:
    code = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=4)
    code.add_data(channel["url"])
    code.make(fit=True)
    matrix = code.get_matrix()
    size = len(matrix)
    module = 14
    width = size * module
    x = (1080 - width) // 2
    y = 568
    modules = " ".join(
        f"M{col},{row}h1v1h-1z"
        for row, cells in enumerate(matrix)
        for col, dark in enumerate(cells)
        if dark
    )
    label = html.escape(channel["label"])
    url = html.escape(channel["url"])
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
  <title>Moonshi 沐煦官方 LINE 品牌分享卡：{label}</title>
  <desc>掃描 QR Code 加入官方 LINE。目的地：{url}</desc>
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#faf9f6"/><stop offset="1" stop-color="#eeeae2"/></linearGradient>
  </defs>
  <rect width="1080" height="1350" fill="url(#paper)"/>
  <path d="M80 98V1250M1000 98V1250" stroke="#d5cec1" stroke-width="1"/>
  <path d="M130 76H370M710 76H950" stroke="#b9b3a4" stroke-width="1"/>
  <image href="data:image/png;base64,{LOGO}" x="400" y="96" width="280" height="280"/>
  <g fill="#354039" text-anchor="middle" font-family="Noto Serif TC, Microsoft JhengHei, serif">
    <text x="540" y="438" font-size="45" letter-spacing="3">讓照護，從理解開始。</text>
  </g>
  <g fill="#51534e" text-anchor="middle" font-family="Noto Sans TC, Microsoft JhengHei, sans-serif">
    <text x="540" y="494" font-size="25">給肌膚一個被理解以及好好照顧的地方。</text>
  </g>
  <rect x="{x}" y="{y}" width="{width}" height="{width}" fill="#ffffff"/>
  <path d="{modules}" fill="#354039" transform="translate({x} {y}) scale({module})" shape-rendering="crispEdges"/>
  <g text-anchor="middle" font-family="Noto Sans TC, Microsoft JhengHei, sans-serif">
    <text x="540" y="1158" fill="#354039" font-size="35" letter-spacing="2">掃描加入官方 LINE</text>
    <text x="540" y="1206" fill="#51534e" font-size="24">@300shhin</text>
    <text x="540" y="1246" fill="#51534e" font-size="22">{url}</text>
    <text x="540" y="1300" fill="#66705f" font-size="20" letter-spacing="2">MOONSHI 沐煦 · {label} 分享</text>
  </g>
</svg>'''
    name = f"moonshi-line-{channel['slug']}"
    (OUTPUT / f"{name}.svg").write_text(svg, encoding="utf-8")
    preview = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <title>Moonshi 沐煦官方 LINE：{label}</title>
  <defs><linearGradient id="paper" x2="1" y2="1"><stop stop-color="#faf9f6"/><stop offset="1" stop-color="#eeeae2"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#paper)"/>
  <path d="M52 52H1148V578H52Z" fill="none" stroke="#d5cec1"/>
  <image href="data:image/png;base64,{LOGO}" x="84" y="65" width="220" height="220"/>
  <g fill="#354039" font-family="Noto Serif TC, Microsoft JhengHei, serif">
    <text x="96" y="354" font-size="46" letter-spacing="2">讓照護，從理解開始。</text>
    <text x="96" y="417" font-size="27">給肌膚一個被理解</text>
    <text x="96" y="461" font-size="27">以及好好照顧的地方。</text>
  </g>
  <text x="96" y="537" fill="#66705f" font-size="22" font-family="Microsoft JhengHei, sans-serif">MOONSHI 沐煦 · 官方 LINE</text>
  <rect x="722" y="96" width="{size * 11}" height="{size * 11}" fill="white"/>
  <path d="{modules}" fill="#354039" transform="translate(722 96) scale(11)" shape-rendering="crispEdges"/>
  <text x="925" y="546" text-anchor="middle" fill="#354039" font-size="25" font-family="Microsoft JhengHei, sans-serif">掃描加入 · @300shhin</text>
</svg>'''
    (OUTPUT / f"{name}-preview.svg").write_text(preview, encoding="utf-8")
    metadata = {**channel, "modules": size, "quietZone": 4, "errorCorrection": "H", "qrBox": [x, y, width, width]}
    (OUTPUT / f"{name}.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Built {name}.svg ({size} modules including quiet zone)")
