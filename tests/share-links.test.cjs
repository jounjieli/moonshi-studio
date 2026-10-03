const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const manifest = JSON.parse(read("assets/share/links.json"));

test("each source has its own static preview and original tracked join button", () => {
  assert.equal(manifest.channels.length, 4);
  assert.equal(new Set(manifest.channels.map((item) => item.url)).size, 4);
  for (const channel of manifest.channels) {
    const page = read(`line-${channel.slug}.html`);
    const url = `https://jounjieli.github.io/moonshi-studio/line-${channel.slug}.html`;
    assert.ok(page.includes(`<meta property="og:url" content="${url}"`));
    assert.ok(page.includes(`moonshi-line-${channel.slug}-preview.png`));
    assert.ok(page.includes(`class="button button-primary line-join" href="${channel.url}"`));
    assert.doesNotMatch(page, /http-equiv="refresh"|window\.location|data-line-link|<script/);
    assert.ok(fs.existsSync(path.join(root, `assets/share/moonshi-line-${channel.slug}-preview.png`)));
    assert.ok(read("share.html").includes(`href="./line-${channel.slug}.html"`));
    assert.ok(read("share.html").includes(`download="moonshi-line-${channel.slug}.png"`));
  }
});

test("website inquiries keep the website source and do not change App bookings", () => {
  assert.ok(read("assets/js/site-config.js").includes('lineUrl: "https://lin.ee/Y8PtVTg"'));
  assert.ok(read("assets/js/site-config.js").includes('bookingUrl: "https://liff.line.me/2011289376-CVO4Qkqq"'));
});
