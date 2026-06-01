(function () {
  const config = window.MOONSHI_CONFIG || {};
  let copyFeedbackTimer = null;

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

  function applyBrandLogos() {
    const marks = document.querySelectorAll(".brand-mark");
    marks.forEach((mark) => {
      const img = document.createElement("img");
      img.className = "brand-logo";
      img.src = "./assets/images/logo.jpg";
      img.alt = `${config.brandName || "Moonshi 沐煦"} Logo`;
      mark.replaceWith(img);
    });

    const heroMark = document.querySelector(".moon-emblem");
    if (heroMark) {
      const img = document.createElement("img");
      img.src = "./assets/images/logo.jpg";
      img.alt = `${config.brandName || "Moonshi 沐煦"} Studio Logo`;
      heroMark.replaceWith(img);
    }
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy");
      return true;
    } finally {
      textarea.remove();
    }
  }

  function setCopyFeedback(targetId, message) {
    const feedback = document.querySelector(`[data-copy-feedback="${targetId}"]`);
    if (!feedback) {
      return;
    }
    feedback.textContent = message;
    window.clearTimeout(copyFeedbackTimer);
    copyFeedbackTimer = window.setTimeout(() => {
      feedback.textContent = "";
    }, 2500);
  }

  applyBrandLogos();
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

  const copyButtons = document.querySelectorAll("[data-copy-target]");
  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const targetId = button.getAttribute("data-copy-target");
      const target = targetId ? document.getElementById(targetId) : null;
      if (!target) {
        return;
      }

      try {
        const text = target.innerText.trim();
        await copyText(text);
        setCopyFeedback(targetId, "已複製，可直接貼到 LINE 填寫。");
      } catch (error) {
        setCopyFeedback(targetId, "複製失敗，請手動複製表單內容。");
      }
    });
  });
})();
