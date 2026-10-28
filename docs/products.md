# 產品介紹頁維護

正式網址：https://jounjieli.github.io/moonshi-studio/products.html

目前僅建立展示頁，產品清單為空，不提供公開上傳、會員或購物功能。

## 新增產品圖片

1. 將圖片放到 `assets/images/products/`，建議使用容易辨識的英文檔名。可用 JPG、PNG、WebP；保留圖片原始比例，不會裁切。
2. 在 `assets/products/products.json` 依顯示順序新增資料。可只提供圖片與替代文字，名稱與說明皆可省略。
3. 執行 `node --test tests/*.test.cjs`，發布後確認圖片與放大連結可開啟。

以下僅為資料格式範例，不代表已上架商品：

```json
[
  {
    "image": "./assets/images/products/product-01.jpg",
    "alt": "產品介紹圖片中的重點文字",
    "name": "產品名稱",
    "description": "產品說明，可使用換行。",
    "width": 1080,
    "height": 1350
  }
]
```

`width` 與 `height` 如有填寫，必須對應實際圖片像素。產品資料僅作展示，不應填入個人資料、帳密或未核實的產品功效。
