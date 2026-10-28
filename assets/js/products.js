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
        const price = document.createElement("p");
        price.className = "product-price";
        price.textContent = `NT$ ${new Intl.NumberFormat("zh-TW").format(product.price)}`;
        if (typeof product.volume === "string" && product.volume) price.textContent += ` · ${product.volume}`;
        caption.append(price);
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
    }
  } catch (error) {
    const status = document.getElementById("products-status");
    if (status) status.textContent = "目前暫時無法載入產品圖片，請稍後重新整理，或透過官方 LINE 詢問產品資訊。";
  }
})();
