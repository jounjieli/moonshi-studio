import hashlib
import json
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets/products/products.json"


def webp(source, destination, width=None, quality=88):
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        image = image.convert("RGBA" if "A" in image.getbands() or "transparency" in image.info else "RGB")
        if width:
            image.thumbnail((width, 10000), Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", quality=quality, method=6)
        return image.size


def main():
    products = json.loads(MANIFEST.read_text(encoding="utf-8"))
    metrics = []
    image_root = (ROOT / "assets/images/products").resolve()
    for product in products:
        source = (ROOT / product.get("original", product["image"])).resolve()
        if source.parent != image_root or source.suffix.lower() not in (".jpg", ".jpeg", ".png"):
            raise ValueError(f"Expected an original product image: {source}")
        detail = source.with_suffix(".webp")
        thumbnail = source.with_name(source.stem + "-thumb.webp")
        width, height = webp(source, detail)
        thumb_width, thumb_height = webp(source, thumbnail, width=192, quality=78)
        relative = lambda path: "./" + path.relative_to(ROOT).as_posix()
        product.update({
            "original": relative(source),
            "image": relative(detail),
            "thumbnail": relative(thumbnail),
            "width": width,
            "height": height,
            "thumbnailWidth": thumb_width,
            "thumbnailHeight": thumb_height,
        })
        metrics.append({
            "name": product["name"], "price": product["price"],
            "original": source.stat().st_size, "detail": detail.stat().st_size,
            "thumbnail": thumbnail.stat().st_size,
            "originalSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        })
    MANIFEST.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    logo = ROOT / "assets/images/logo-reference.png"
    webp(logo, ROOT / "assets/images/logo-reference.webp", quality=88)
    webp(logo, ROOT / "assets/images/logo-96.webp", width=96, quality=85)
    with Image.open(logo) as image:
        image.thumbnail((64, 64), Image.Resampling.LANCZOS)
        image.save(ROOT / "assets/images/favicon-64.png", optimize=True)
    first_page = sorted(metrics, key=lambda product: product["price"])[:9]
    totals = {key: sum(item[key] for item in metrics) for key in ("original", "detail", "thumbnail")}
    totals["firstPageOriginal"] = sum(item["original"] for item in first_page)
    totals["firstPageThumbnails"] = sum(item["thumbnail"] for item in first_page)
    report = ROOT / "output/image-optimization-20261105"
    report.mkdir(parents=True, exist_ok=True)
    (report / "metrics.json").write_text(json.dumps({"totals": totals, "images": metrics}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(totals))


if __name__ == "__main__":
    main()
