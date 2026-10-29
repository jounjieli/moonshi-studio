(async function () {
  const gallery = document.getElementById("products-gallery");
  const empty = document.getElementById("products-empty");
  if (!gallery || !empty) return;

  try {
    const response = await fetch("./assets/products/products.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("Product list unavailable");
    const products = await response.json();
    if (!Array.isArray(products)) throw new Error("Invalid product list");
    if (!products.every((product) => product && Number.isFinite(product.price) && product.price >= 0)) {
      throw new Error("Every product needs a valid price");
    }

    const imageRoot = new URL("./assets/images/products/", document.baseURI);
    const cards = [...products].sort((a, b) => a.price - b.price).map((product) => {
      if (!product || typeof product.image !== "string") throw new Error("Missing product image");
      const imageUrl = new URL(product.image, document.baseURI);
      if (imageUrl.origin !== imageRoot.origin || !imageUrl.pathname.startsWith(imageRoot.pathname)) {
        throw new Error("Product image must be in the product images folder");
      }
      const name = typeof product.name === "string" ? product.name : "";
      const alt = typeof product.alt === "string" && product.alt.trim() ? product.alt : name || "產品介紹圖片";
      const card = document.createElement("figure");
      card.className = "product-card";
      const link = document.createElement("a");
      link.href = imageUrl.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `放大檢視：${alt}（另開視窗）`);
      const image = document.createElement("img");
      image.src = imageUrl.href;
      image.alt = alt;
      image.loading = "lazy";
      image.decoding = "async";
      if (Number.isSafeInteger(product.width) && product.width > 0 && Number.isSafeInteger(product.height) && product.height > 0) {
        image.width = product.width;
        image.height = product.height;
      }
      link.append(image);
      card.append(link);
      {
        const caption = document.createElement("figcaption");
        if (name) {
          const heading = document.createElement("h3");
          heading.textContent = name;
          caption.append(heading);
        }
        const options = product.variants === undefined ? [product] : product.variants;
        if (!Array.isArray(options) || !options.length || options.some((option) => !option || !Number.isFinite(option.price) || option.price < 0)) {
          throw new Error("Invalid product variants");
        }
        if (product.price !== Math.min(...options.map((option) => option.price))) {
          throw new Error("Product sort price must match its lowest variant price");
        }
        for (const option of [...options].sort((a, b) => a.price - b.price)) {
          const price = document.createElement("p");
          price.className = "product-price";
          price.textContent = `NT$ ${new Intl.NumberFormat("zh-TW").format(option.price)}`;
          if (typeof option.volume === "string" && option.volume) price.textContent += ` · ${option.volume}`;
          caption.append(price);
        }
        if (typeof product.description === "string" && product.description) {
          const description = document.createElement("p");
          description.textContent = product.description;
          caption.append(description);
        }
        card.append(caption);
      }
      return card;
    });

    if (cards.length) {
      gallery.replaceChildren(...cards);
      empty.hidden = true;
      gallery.hidden = false;
      const pagination = document.getElementById("products-pagination");
      const pageNumbers = document.getElementById("products-pages");
      const previous = document.getElementById("products-prev");
      const next = document.getElementById("products-next");
      const pageStatus = document.getElementById("products-page-status");
      if (pagination && pageNumbers && previous && next && pageStatus) {
        const pageSize = 9;
        const pageCount = Math.ceil(cards.length / pageSize);
        const buttons = [];
        let currentPage = 1;

        function showPage(page, scroll = false) {
          currentPage = Math.max(1, Math.min(page, pageCount));
          const start = (currentPage - 1) * pageSize;
          cards.forEach((card, index) => {
            card.hidden = index < start || index >= start + pageSize;
          });
          buttons.forEach((button, index) => button.setAttribute("aria-current", index + 1 === currentPage ? "page" : "false"));
          previous.disabled = currentPage === 1;
          next.disabled = currentPage === pageCount;
          const end = Math.min(start + pageSize, cards.length);
          const range = start + 1 === end ? String(end) : `${start + 1}–${end}`;
          pageStatus.textContent = `第 ${currentPage} / ${pageCount} 頁 · 顯示第 ${range} 個，共 ${cards.length} 個商品`;
          if (scroll) gallery.scrollIntoView?.({ behavior: "auto", block: "start" });
        }

        for (let page = 1; page <= pageCount; page += 1) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "products-page";
          button.textContent = String(page);
          button.setAttribute("aria-label", `第 ${page} 頁`);
          button.addEventListener("click", () => showPage(page, true));
          buttons.push(button);
        }
        pageNumbers.replaceChildren(...buttons);
        previous.addEventListener("click", () => showPage(currentPage - 1, true));
        next.addEventListener("click", () => showPage(currentPage + 1, true));
        pagination.hidden = pageCount <= 1;
        showPage(1);
      }
    }
  } catch (error) {
    const status = document.getElementById("products-status");
    if (status) status.textContent = "目前暫時無法載入產品圖片，請稍後重新整理，或透過官方 LINE 詢問產品資訊。";
  }
})();
