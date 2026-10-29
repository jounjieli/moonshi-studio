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
    if (item.variants) {
      assert.ok(Array.isArray(item.variants) && item.variants.length > 0);
      for (const option of item.variants) {
        assert.ok(Number.isFinite(option.price) && option.price >= 0);
        assert.ok(typeof option.volume === "string" && option.volume.trim());
      }
      assert.equal(item.price, Math.min(...item.variants.map((option) => option.price)));
    }
  }
});

class Element {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.attributes = {};
    this.textContent = "";
    this.hidden = false;
    this.listeners = {};
  }
  setAttribute(key, value) { this.attributes[key] = value; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  click() { if (!this.disabled) this.listeners.click?.(); }
}

async function render(products, ok = true) {
  const gallery = new Element("div");
  gallery.hidden = true;
  const empty = new Element("div");
  const status = new Element("p");
  const pagination = new Element("div");
  pagination.hidden = true;
  const pageNumbers = new Element("div");
  const previous = new Element("button");
  const next = new Element("button");
  const pageStatus = new Element("p");
  let requestedUrl;
  await vm.runInNewContext(read("assets/js/products.js"), {
    URL,
    document: {
      baseURI: "https://jounjieli.github.io/moonshi-studio/products.html",
      getElementById(id) { return {
        "products-gallery": gallery, "products-empty": empty, "products-status": status,
        "products-pagination": pagination, "products-pages": pageNumbers,
        "products-prev": previous, "products-next": next, "products-page-status": pageStatus,
      }[id]; },
      createElement(tag) { return new Element(tag); },
    },
    fetch: async (url) => {
      requestedUrl = url;
      return { ok, json: async () => products };
    },
  });
  return { gallery, empty, status, requestedUrl, pagination, pageNumbers, previous, next, pageStatus };
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

test("the original ten products retain their supplied prices and volumes", () => {
  const products = JSON.parse(read("assets/products/products.json"));
  assert.deepEqual(products.slice(0, 10).map(({ name, price, volume }) => [name, price, volume]), [
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
  assert.equal(new Set(products.map(({ image }) => image)).size, 19);
  assert.match(read("products.html"), /依售價由低至高排列，多規格以最低售價排序/);
  assert.match(read("products.html"), /products\.js\?v=20261029-4/);
});

test("nine additional images match the supplied prices, units and variants", () => {
  const products = JSON.parse(read("assets/products/products.json"));
  assert.equal(products.length, 19);
  assert.deepEqual(products.slice(10).map(({ name, price, volume }) => [name, price, volume]), [
    ["酵素去角質乳", 2800, "250 ml"],
    ["皇家蜂萃精華油", 1680, undefined],
    ["逆齡緊實保養組", 890, "1 組"],
    ["保濕修護調理組", 890, "1 組"],
    ["20% 原型左 C 安瓶", 1880, "15 ml"],
    ["龍血積雪草修護面膜", 129, "1 片（優惠價）"],
    ["抗 UV 全效乳 SPF50+（膚色／白色）", 1380, "30 ml"],
    ["C 柚水光乳霜", 2980, "50 ml"],
    ["深淨痘痘霜（痘霜）", 1900, "50 ml"],
  ]);
  assert.deepEqual(products.find((p) => p.name === "皇家蜂萃精華油").variants, [
    { volume: "30 ml", price: 1680 }, { volume: "50 ml", price: 2800 },
  ]);
});

test("multiple sizes share one image, show every price and sort by the minimum", async () => {
  const data = [
    { image: "./assets/images/products/a.jpg", name: "一般產品", price: 1880 },
    { image: "./assets/images/products/b.jpg", name: "多規格產品", price: 1680,
      variants: [{ volume: "50 ml", price: 2800 }, { volume: "30 ml", price: 1680 }] },
  ];
  const result = await render(data);
  assert.equal(result.gallery.children.length, 2);
  const caption = result.gallery.children[0].children[1];
  assert.equal(caption.children[0].textContent, "多規格產品");
  assert.equal(caption.children[1].textContent, "NT$ 1,680 · 30 ml");
  assert.equal(caption.children[2].textContent, "NT$ 2,800 · 50 ml");
  for (const variants of [[], [{ price: -1 }], [{ price: 2000 }]]) {
    const invalid = await render([{ image: "./assets/images/products/b.jpg", price: 1680, variants }]);
    assert.equal(invalid.gallery.hidden, true);
    assert.match(invalid.status.textContent, /官方 LINE/);
  }
});

test("all nineteen displayed cards sort from the 129 mask to the 2980 cream", async () => {
  const data = JSON.parse(read("assets/products/products.json"));
  const result = await render(data);
  assert.equal(result.gallery.children.length, 19);
  const names = result.gallery.children.map((card) => card.children[1].children[0].textContent);
  assert.equal(names[0], "龍血積雪草修護面膜");
  assert.equal(names[1], "胺基酸洗面乳");
  assert.equal(names[2], "逆齡緊實保養組");
  assert.equal(names[3], "保濕修護調理組");
  assert.equal(names.at(-1), "C 柚水光乳霜");
  const prices = names.map((name) => data.find((p) => p.name === name).price);
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
});

test("nineteen products paginate as nine, nine and one without changing order", async () => {
  const result = await render(JSON.parse(read("assets/products/products.json")));
  const visible = () => result.gallery.children.filter((card) => !card.hidden);
  const names = () => visible().map((card) => card.children[1].children[0].textContent);
  assert.equal(result.pagination.hidden, false);
  assert.equal(visible().length, 9);
  assert.equal(result.previous.disabled, true);
  assert.equal(result.next.disabled, false);
  assert.equal(result.pageNumbers.children.length, 3);
  assert.equal(result.pageNumbers.children[0].attributes["aria-current"], "page");
  assert.match(result.pageStatus.textContent, /第 1 \/ 3 頁/);
  const allNames = [...names()];
  result.previous.click();
  assert.equal(visible().length, 9);
  result.next.click();
  assert.equal(visible().length, 9);
  assert.equal(result.previous.disabled, false);
  assert.equal(result.pageNumbers.children[1].attributes["aria-current"], "page");
  allNames.push(...names());
  result.next.click();
  assert.equal(visible().length, 1);
  assert.equal(result.next.disabled, true);
  assert.deepEqual(names(), ["C 柚水光乳霜"]);
  allNames.push(...names());
  result.next.click();
  assert.equal(visible().length, 1);
  assert.equal(new Set(allNames).size, 19);
  assert.deepEqual(allNames, result.gallery.children.map((card) => card.children[1].children[0].textContent));
  result.pageNumbers.children[0].click();
  assert.equal(visible().length, 9);
  assert.equal(names()[0], "龍血積雪草修護面膜");
});

test("small lists hide unnecessary pagination and layout defines three responsive columns", async () => {
  for (const count of [0, 1, 9]) {
    const result = await render(Array.from({ length: count }, (_, i) => ({ image: `./assets/images/products/${i}.jpg`, price: i })));
    assert.equal(result.pagination.hidden, true);
    assert.equal(result.gallery.children.filter((card) => !card.hidden).length, count);
  }
  const css = read("assets/css/products.css");
  assert.match(css, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.product-card\[hidden\]/);
  assert.match(css, /@media \(max-width: 980px\)/);
  assert.match(read("products.html"), /aria-label="產品分頁"/);
  assert.match(read("products.html"), /aria-live="polite"/);
});
