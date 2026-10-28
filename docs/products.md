# 產品介紹頁維護

正式網址：https://jounjieli.github.io/moonshi-studio/products.html

目前為產品展示頁，不提供公開上傳、會員或購物功能。產品依整件售價由低至高自動排列；價格相同時保留清單的先後順序，不以每 ml 單價排序。多規格產品依最低售價排序，圖下列出每個規格的價格，不重複展示同一張圖。

## 新增產品圖片

1. 將圖片放到 `assets/images/products/`，建議使用容易辨識的英文檔名。可用 JPG、PNG、WebP；保留圖片原始比例，不會裁切。
2. 在 `assets/products/products.json` 新增圖片、替代文字與數字格式的 `price`。名稱、容量與說明可另外填寫；同價格的產品依清單順序顯示。
3. 執行 `node --test tests/*.test.cjs`，發布後確認圖片與放大連結可開啟。

以下僅為資料格式範例，不代表已上架商品：

```json
[
  {
    "image": "./assets/images/products/product-01.jpg",
    "alt": "產品介紹圖片中的重點文字",
    "name": "產品名稱",
    "price": 880,
    "volume": "120 ml",
    "description": "產品說明，可使用換行。",
    "width": 1080,
    "height": 1350
  }
]
```

`width` 與 `height` 如有填寫，必須對應實際圖片像素。產品資料僅作展示，不應填入個人資料、帳密或未核實的產品功效。

## 同一產品多規格

填入 `variants` 陣列，每筆包含數字格式的 `price` 與字串格式的 `volume`；頂層 `price` 必須等於所有規格的最低價。例如皇家蜂萃精華油：

```json
{
  "price": 1680,
  "variants": [
    { "volume": "30 ml", "price": 1680 },
    { "volume": "50 ml", "price": 2800 }
  ]
}
```
