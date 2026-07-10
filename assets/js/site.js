(function () {
  const config = window.MOONSHI_CONFIG || {};
  let copyFeedbackTimer = null;

  function applyLinks(selector, url) {
    document.querySelectorAll(selector).forEach((node) => {
      if (!url) {
        node.classList.add("is-disabled");
        node.setAttribute("aria-disabled", "true");
        return;
      }

      node.href = url;
      if (/^https?:\/\//.test(url)) {
        node.target = "_blank";
        node.rel = "noreferrer";
      }
    });
  }

  function setupNavigation() {
    const toggle = document.querySelector(".nav-toggle");
    const navigation = document.querySelector(".nav-links");
    if (!toggle || !navigation) {
      return;
    }

    function setOpen(open) {
      const iconPath = toggle.querySelector("path");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "關閉導覽選單" : "開啟導覽選單");
      navigation.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      if (iconPath) {
        iconPath.setAttribute("d", open ? "M18 6 6 18M6 6l12 12" : "M4 7h16M4 12h16M4 17h16");
      }
    }

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) {
        setOpen(false);
      }
    });
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
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
    }, 5000);
  }

  function setupCopyButtons() {
    document.querySelectorAll("[data-copy-target]").forEach((button) => {
      button.addEventListener("click", async () => {
        const targetId = button.getAttribute("data-copy-target");
        const target = targetId ? document.getElementById(targetId) : null;
        if (!target) {
          return;
        }

        try {
          await copyText(target.innerText.trim());
          setCopyFeedback(targetId, "預約格式已複製，可前往 LINE 填寫。");
        } catch (error) {
          setCopyFeedback(targetId, "無法自動複製，請手動選取文字。");
        }
      });
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
    mapHelper.textContent = "建議出發前再次確認路線與交通時間。";
  }

  setupNavigation();
  setupCopyButtons();
})();
