# 品牌 LINE 分享入口

更新：2026-10-04。網站分享封面使用正式 Logo；LINE 分享入口另有暖白、深綠 QR 封面。

| 使用管道 | 對外品牌分享網址 | LINE 加入好友目的地 | trackingId |
| --- | --- | --- | --- |
| IG | https://jounjieli.github.io/moonshi-studio/line-ig.html | https://lin.ee/xkDOV4J | 6840194 |
| Threads | https://jounjieli.github.io/moonshi-studio/line-threads.html | https://lin.ee/XZSHopp | 7228368 |
| 官網 | https://jounjieli.github.io/moonshi-studio/line-website.html | https://lin.ee/Y8PtVTg | 7228369 |
| 實體名片 | https://jounjieli.github.io/moonshi-studio/line-print.html | https://lin.ee/UfczO5a | 7228370 |

## 使用方式

社群貼文請貼品牌分享網址，不貼 lin.ee 目的地。品牌網址的靜態 Open Graph 標籤指定 1200 x 630 封面，點進後用「加入官方 LINE」接到該管道。沒有自動轉址，避免爬蟲抓回 LINE 原本的綠色預覽。最終是否顯示及裁切仍由社群平台決定；舊貼文預覽不保證更新。

QR 圖直接編碼 LINE 目的地，減少掃碼後的步驟。不要遮住 QR 方格或四周白邊；印製前必須實際試掃。不同來源的圖與網址不能混用。轉傳仍歸於原素材來源。

所有圖下載頁：https://jounjieli.github.io/moonshi-studio/share.html

## 統計範圍

LINE OA 的分析 > 好友 > 加入好友管道可比較加入好友成效。這不是掃碼數、連結點擊數，也不是完成預約數；不宣稱能識別每位好友的來源。本次未安裝網站分析器或額外追蹤腳本。

## 重新產生及驗證

Python 需 qrcode 8.2、Pillow；解碼驗證需 zxing-cpp 3.1.1。Node 需 sharp。

```text
python scripts/build-share-cards.py --deps output/qr-tools
node scripts/render-share-cards.cjs
node scripts/build-share-pages.cjs
python scripts/verify-share-cards.py
node --test tests/booking-flow.test.cjs tests/share-links.test.cjs
```

正式 Logo 維持原檔，QR 使用 H 級容錯與 4 模組留白。SVG 位於本地 output/brand-share-cards，發布 PNG 位於 assets/share；生成靜態頁也須一起發布。
