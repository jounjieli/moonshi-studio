const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("price page displays and enlarges the October 29 price list", () => {
  const html = read("price.html");
  const poster = "./assets/images/price-list-20261029.jpg";
  assert.ok(fs.statSync(path.join(root, poster)).size > 0);
  assert.ok(html.includes(`src="${poster}"`));
  assert.equal(html.split(`href="${poster}"`).length - 1, 2);
  assert.doesNotMatch(html, /price-list-20261003|試營運|1100/);
});

test("accessible prices match all services and add-ons in the supplied poster", () => {
  const html = read("price.html");
  for (const row of [
    "初見・淨膚管理：原價 1500 元，體驗價 1200 元，舊客 8 折 1200 元。",
    "超淨能・透亮肌管理：原價 2200 元，體驗價 1800 元，舊客 8 折 1760 元。",
    "舒敏・穩膚修護管理：原價 2500 元，體驗價 2000 元，舊客 8 折 2000 元。",
    "胞泌體・光感拋光肌管理：原價 3000 元，體驗價 2500 元，舊客 8 折 2400 元。",
    "藻晶・淨透煥新：原價 2800 元，體驗價 2300 元，舊客 8 折 2240 元。",
    "客製化肌膚管理：2500 元至 6000 元。",
    "拾光森林・臉部舒壓，20 分鐘，300 元。",
    "頭部舒壓，20 分鐘，400 元。",
    "舊客 8 折適用於 2 個月內回店。",
  ]) {
    assert.ok(html.includes(row), row);
  }
});

test("offers and share descriptions no longer advertise superseded trial prices", () => {
  const html = read("offers.html");
  assert.doesNotMatch(html, /1,100|1100|試營運/);
  assert.match(html, /初見・淨膚管理體驗價 \$1,200/);
  assert.match(html, /2 個月內回店享 8 折/);
  assert.ok(html.includes('href="./price.html"'));
});
