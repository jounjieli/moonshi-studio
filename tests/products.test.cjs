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
    { image: "./assets/images/products/one.jpg", name: "第一張", alt: "使用說明", description: "<script>不是 HTML</script>", width: 1080, height: 1350 },
    { image: "./assets/images/products/two.png", alt: "第二張" },
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
  assert.equal(first.children[1].children[1].textContent, "<script>不是 HTML</script>");
  assert.equal(result.gallery.children[1].children[0].children[0].alt, "第二張");
});

test("failed loading or invalid image sources keep an actionable LINE fallback", async () => {
  for (const [data, ok] of [[[], false], [{}, true], [[{ image: "https://example.com/photo.jpg" }], true], [[{ image: "./assets/images/products/../logo.png" }], true]]) {
    const result = await render(data, ok);
    assert.equal(result.empty.hidden, false);
    assert.equal(result.gallery.hidden, true);
    assert.match(result.status.textContent, /官方 LINE/);
  }
});
