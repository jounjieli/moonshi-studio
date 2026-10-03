const fs = require("node:fs/promises");
const path = require("node:path");

async function main() {
  const root = path.resolve(__dirname, "..");
  const base = "https://jounjieli.github.io/moonshi-studio/";
  const manifest = JSON.parse(await fs.readFile(path.join(root, "assets/share/links.json"), "utf8"));
  for (const channel of manifest.channels) {
    const url = `${base}line-${channel.slug}.html`;
    const image = `${base}assets/share/moonshi-line-${channel.slug}-preview.png`;
    const title = "加入官方 LINE | Moonshi 沐煦";
    const description = "給肌膚一個被理解以及好好照顧的地方。加入 Moonshi 沐煦官方 LINE，聊聊膚況、了解服務與預約須知。";
    // Static metadata is available to social crawlers without JavaScript or redirects.
    const html = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="zh_TW" />
  <meta property="og:site_name" content="Moonshi 沐煦" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Moonshi 沐煦正式 Logo 與官方 LINE 品牌 QR Code" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="Moonshi 沐煦正式 Logo 與官方 LINE 品牌 QR Code" />
  <link rel="icon" href="./assets/images/logo-reference.png" type="image/png" />
  <link rel="stylesheet" href="./assets/css/styles.css?v=20261004-2" />
  <link rel="stylesheet" href="./assets/css/share.css?v=20261004-2" />
</head>
<body class="line-landing">
  <a class="skip-link" href="#main-content">跳到主要內容</a>
  <header class="line-landing-header"><a class="brand-wordmark" href="./index.html" aria-label="Moonshi 沐煦首頁"><span>Moonshi</span><small>沐煦</small></a></header>
  <main id="main-content" class="line-landing-main">
    <img class="line-cover" src="./assets/share/moonshi-line-${channel.slug}-preview.png" width="1200" height="630" alt="Moonshi 沐煦正式 Logo 與官方 LINE 品牌 QR Code" />
    <p class="section-label">一對一肌膚管理・台中北區</p>
    <h1>先聊聊你的肌膚。</h1>
    <p>加入官方 LINE，告訴我們目前的膚況與想了解的服務。<br />使用同一支手機瀏覽，直接點下方按鈕，不必再掃 QR Code。</p>
    <a class="button button-primary line-join" href="${channel.url}" rel="noreferrer">加入官方 LINE</a>
    <p class="line-account">Moonshi 沐煦 · @300shhin</p>
    <div class="line-landing-links"><a class="text-link" href="./price.html">服務價格</a><a class="text-link" href="./notice.html">預約須知</a><a class="text-link" href="https://liff.line.me/2011289376-CVO4Qkqq" rel="noreferrer">App 預約</a></div>
    <p class="line-confirmation">收到預約完成的確認訊息，才算完成預約。</p>
  </main>
</body>
</html>
`;
    await fs.writeFile(path.join(root, `line-${channel.slug}.html`), html);
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
