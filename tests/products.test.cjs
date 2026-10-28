const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("main navigation links to the product page throughout the site", () => {
  for (const file of ["index.html", "price.html", "notice.html", "offers.html", "location.html", "share.html", "products.html"]) {
    const navigation = read(file).match(/<nav\b[\s\S]*?<\/nav>/)[0];
    assert.match(navigation, /href="\.\/products\.html">產品介紹<\/a>/, file);
  }
  assert.match(read("products.html"), /aria-current="page" href="\.\/products\.html"/);
});

test("product page is shareable, has an honest empty state, and includes its dependencies", () => {
  const html = read("products.html");
  assert.match(html, /<html lang="zh-Hant">/);
  assert.match(html, /<h1>產品介紹<\/h1>/);
  assert.match(html, /內容整理中/);
  assert.match(html, /id="products-gallery" hidden/);
  assert.match(html, /<noscript>/);
  assert.match(html, /og:image" content="https:\/\/jounjieli.github.io\/moonshi-studio\/assets\/images\/logo-reference.png/);
  assert.match(html, /rel="canonical" href="https:\/\/jounjieli.github.io\/moonshi-studio\/products.html"/);
  for (const file of ["assets/js/products.js", "assets/css/products.css"]) {
    assert.ok(html.includes(file));
    assert.ok(fs.statSync(path.join(root, file)).size > 0);
  }
  assert.match(read("assets/css/products.css"), /\.product-card img\s*\{\s*width: 100%;\s*height: auto;/);
  assert.match(read("assets/css/products.css"), /@media \(max-width: 620px\)/);
});

test("published product images exist and stay inside the product folder", () => {
  const products = JSON.parse(read("assets/products/products.json"));
  assert.ok(Array.isArray(products));
  for (const item of products) {
    assert.match(item.image, /^\.\/assets\/images\/products\/[^?#]+\.(jpg|jpeg|png|webp|avif)$/i);
    const imagePath = path.resolve(root, item.image);
    assert.ok(imagePath.startsWith(path.join(root, "assets", "images", "products") + path.sep));
    assert.ok(fs.statSync(imagePath).size > 0);
    assert.ok(typeof item.alt === "string" && item.alt.trim());
    assert.ok(Number.isFinite(item.price) && item.price >= 0);
  }
});

class Element {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.attributes = {};
    this.textContent = "";
    this.hidden = false;
  }
  setAttribute(key, value) { this.attributes[key] = value; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
}

async function render(products, ok = true) {
  const gallery = new Element("div");
  gallery.hidden = true;
  const empty = new Element("div");
  const status = new Element("p");
  let requestedUrl;
  await vm.runInNewContext(read("assets/js/products.js"), {
    URL,
    document: {
      baseURI: "https://jounjieli.github.io/moonshi-studio/products.html",
      getElementById(id) { return { "products-gallery": gallery, "products-empty": empty, "products-status": status }[id]; },
      createElement(tag) { return new Element(tag); },
    },
    fetch: async (url) => {
      requestedUrl = url;
      return { ok, json: async () => products };
    },
  });
  return { gallery, empty, status, requestedUrl };
}

test("empty product data preserves the public placeholder", async () => {
  const result = await render([]);
  assert.equal(result.requestedUrl, "./assets/products/products.json");
  assert.equal(result.empty.hidden, false);
  assert.equal(result.gallery.hidden, true);
  assert.equal(result.status.textContent, "");
});

test("future images render in order with original-size links and plain text captions", async () => {
  const result = await render([
    { image: "./assets/images/products/one.jpg", name: "第一張", price: 880, volume: "120 ml", alt: "使用說明", description: "<script>不是 HTML</script>", width: 1080, height: 1350 },
    { image: "./assets/images/products/two.png", price: 1200, alt: "第二張" },
  ]);
  assert.equal(result.empty.hidden, true);
  assert.equal(result.gallery.hidden, false);
  assert.equal(result.gallery.children.length, 2);
  const first = result.gallery.children[0];
  const link = first.children[0];
  assert.equal(link.href, "https://jounjieli.github.io/moonshi-studio/assets/images/products/one.jpg");
  assert.equal(link.target, "_blank");
  assert.equal(link.rel, "noopener noreferrer");
  assert.equal(link.children[0].width, 1080);
  assert.equal(link.children[0].height, 1350);
  assert.equal(link.children[0].alt, "使用說明");
  assert.equal(first.children[1].children[1].textContent, "NT$ 880 · 120 ml");
  assert.equal(first.children[1].children[2].textContent, "<script>不是 HTML</script>");
  assert.equal(result.gallery.children[1].children[0].children[0].alt, "第二張");
});

test("failed loading, invalid prices or invalid image sources keep an actionable LINE fallback", async () => {
  for (const [data, ok] of [[[], false], [{}, true], [[{ image: "https://example.com/photo.jpg", price: 880 }], true], [[{ image: "./assets/images/products/../logo.png", price: 880 }], true], [[{ image: "./assets/images/products/one.jpg", price: "880" }], true], [[{ image: "./assets/images/products/one.jpg", price: -1 }], true]]) {
    const result = await render(data, ok);
    assert.equal(result.empty.hidden, false);
    assert.equal(result.gallery.hidden, true);
    assert.match(result.status.textContent, /官方 LINE/);
  }
});

test("products automatically sort by numeric price and preserve ties without mutating data", async () => {
  const data = [
    { image: "./assets/images/products/a.jpg", name: "A", price: 2600 },
    { image: "./assets/images/products/b.jpg", name: "B", price: 1200 },
    { image: "./assets/images/products/c.jpg", name: "C", price: 880 },
    { image: "./assets/images/products/d.jpg", name: "D", price: 1200 },
    { image: "./assets/images/products/e.jpg", name: "E", price: 2600 },
  ];
  const result = await render(data);
  assert.deepEqual(result.gallery.children.map((card) => card.children[1].children[0].textContent), ["C", "B", "D", "A", "E"]);
  assert.deepEqual(data.map((item) => item.name), ["A", "B", "C", "D", "E"]);
});

test("all ten uploaded products have the exact supplied prices and volumes", () => {
  const products = JSON.parse(read("assets/products/products.json"));
  assert.deepEqual(products.map(({ name, price, volume }) => [name, price, volume]), [
    ["胺基酸洗面乳", 880, "120 ml"],
    ["高效卸潔蜜", 1200, "150 ml"],
    ["龍血舒緩凍膜", 1200, "100 ml"],
    ["深海膠原活化機能水", 1280, "150 ml"],
    ["B5 長效保濕面膜", 1380, "100 ml"],
    ["膠原修護精華液", 1500, "30 ml"],
    ["大馬士革玫瑰精露", 1680, "150 ml"],
    ["超水感精華安瓶", 2000, "120 ml"],
    ["激光煥白新生活化乳", 2600, "120 ml"],
    ["24 小時超保濕乳液", 2600, "30 ml"],
  ]);
  assert.equal(new Set(products.map(({ image }) => image)).size, 10);
  assert.match(read("products.html"), /依單品售價由低至高排列/);
  assert.match(read("products.html"), /products\.js\?v=20261029-2/);
});
