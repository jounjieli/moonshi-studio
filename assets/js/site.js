(function () {
  const config = window.MOONSHI_CONFIG || {};

  function applyLinks(selector, url) {
    const nodes = document.querySelectorAll(selector);
    nodes.forEach((node) => {
      if (!url) {
        node.classList.add("is-disabled");
        return;
      }
      node.href = url;
      if (/^https?:\/\//.test(url)) {
        node.target = "_blank";
        node.rel = "noreferrer";
      }
    });
  }

  applyLinks("[data-instagram-link]", config.instagramUrl);
  applyLinks("[data-line-link]", config.lineUrl);
  applyLinks("[data-map-link]", config.mapUrl);

  const addressArea = document.querySelector("[data-address-area]");
  if (addressArea && config.addressArea) {
    addressArea.textContent = config.addressArea;
  }

  const mapHelper = document.querySelector("[data-map-helper]");
  if (mapHelper && config.mapUrl) {
    mapHelper.textContent = "已設定地圖連結，按下按鈕可直接開啟導航。";
  }
})();
