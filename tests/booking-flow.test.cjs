const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const bookingUrl = "https://liff.line.me/2011289376-CVO4Qkqq";

test("all pages have the same App booking action and fresh shared assets", () => {
  for (const file of ["index.html", "price.html", "notice.html", "offers.html", "location.html"]) {
    const html = read(file);
    assert.match(html, /class="nav-action" data-booking-link/);
    assert.ok(html.includes(`href="${bookingUrl}"`), file);
    assert.match(html, /site-config\.js\?v=20261004-3/);
    assert.match(html, /site\.js\?v=20261004-2/);
    assert.match(html, /styles\.css\?v=20261004-2/);
    const controls = (html.match(/<(?:a|button)\b[^>]*>[\s\S]*?<\/(?:a|button)>/g) || []).join("\n");
    assert.doesNotMatch(controls, /複製預約格式|查看[^<]*預約格式|前往預約表單/);
  }
});

test("legacy booking anchor explains App flow without a duplicate form", () => {
  const html = read("notice.html");
  assert.match(html, /id="booking-form"/);
  assert.match(html, /class="booking-steps"/);
  assert.match(html, /素顏無濾鏡近照 3 張（正臉、左臉、右臉）/);
  assert.match(html, /收到預約完成的確認訊息，才算完成預約/);
  assert.match(html, /首次預約需支付 \$500 定金/);
  assert.doesNotMatch(html, /data-copy-target|first-booking-template|return-booking-template/);
});

test("shared configuration applies the existing App URL safely", () => {
  const anchor = { classList: { add() {} }, setAttribute() {} };
  const context = {
    window: {},
    document: {
      querySelectorAll(selector) { return selector === "[data-booking-link]" ? [anchor] : []; },
      querySelector() { return null; },
    },
  };
  vm.createContext(context);
  vm.runInContext(read("assets/js/site-config.js"), context);
  vm.runInContext(read("assets/js/site.js"), context);
  assert.equal(context.window.MOONSHI_CONFIG.bookingUrl, bookingUrl);
  assert.equal(anchor.href, bookingUrl);
  assert.equal(anchor.target, "_blank");
  assert.equal(anchor.rel, "noreferrer");
});
