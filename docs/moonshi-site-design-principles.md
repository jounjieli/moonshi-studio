# Moonshi Studio Website Design System

更新日期：2026-06-22

這份文件是 Moonshi 沐煦網站的正式設計規範。目標不是把網站做得更複雜，而是建立一套能長期維護、可部署、可讀、可轉換的靜態網站系統：使用者能快速理解工作室定位、確認官方資訊、複製預約模板，最後回到官方 LINE 完成預約。

## 參考來源

- Google Material 3：使用 color roles、surface layers、shape scale、type hierarchy、motion、adaptive layout 建立一致的產品體驗。Moonshi 採用其系統化方法，不套用 Google 原生藍紫視覺。
- Google Web Vitals：以 LCP、INP、CLS 管理載入、互動與視覺穩定性；正式站需避免圖片造成版面跳動。
- W3C WCAG 2.2：無障礙檢查要以完整頁面為單位，圖片型資訊需有可取得的替代內容。
- Google SRE SLO：即使是靜態站，也要定義使用者真正感受到的品質，例如頁面是否能載入、CTA 是否能操作、核心連結是否有效。
- Twelve-Factor App Config：設定要集中管理；Moonshi 的 LINE、Instagram、Google Maps、地址等公開設定集中於 `assets/js/site-config.js`。
- OWASP Content Security Policy Cheat Sheet：靜態頁仍需維持安全邊界；外部連結、第三方資源、未來表單與安全標頭都要有明確規則。

## 1. Product Principle

Moonshi 網站的產品任務是「降低第一次預約前的不確定感」。所有頁面都要協助使用者回答三個問題：

- 我是否適合這個工作室？
- 我現在要先看哪一份正式資訊？
- 我下一步要怎麼預約？

執行規則：

- 每頁只允許一個主訊息與一個主要 CTA。
- 首頁負責建立信任與導覽，不說後台語、不說工程語、不說「按鈕已接好」。
- 首頁不使用「流程教學」或「溝通訊息」式區塊；預約步驟與可複製文字只放在 `notice.html#booking-form`。
- 價目表、工作室須知、位置圖等官方圖片是前台可見 source of truth。
- 同一份正式資訊不得同時出現圖片版、HTML 卡片版、文案版，避免不一致與測試站感。
- LINE 圖文選單連結是外部契約：A `/price.html`、B Instagram、C `/notice.html`、D `/offers.html`、E `/notice.html#booking-form`、F Google Maps。

## 2. Material 3 Adaptation

Moonshi 不做 Google 風格，而是採用 Material 3 的設計系統方法：

- Color roles：用 `primary`、`secondary`、`surface`、`outline`、`muted` 管理色彩用途，而不是任意新增顏色。
- Surface layers：背景、卡片、重點區塊、浮層要有清楚層級；不是所有區塊都套同一種白卡片。
- Shape scale：主要容器使用大圓角，按鈕使用膠囊形，圖片使用中等圓角，避免整站平均化。
- Type hierarchy：每頁一個 `h1`，標題尺寸要服務閱讀節奏，不得大到被導覽壓迫。
- Motion：互動只做小幅 hover、focus、載入節奏，不做干擾閱讀的裝飾動畫。
- Adaptive layout：桌機使用雙欄與大留白，手機優先單欄、可點擊、圖片不溢出。

## 3. Moonshi Brand Tokens

品牌方向：奶白、米 beige、霧感、柔和、乾淨、輕療癒；同時保持膚況管理、清潔調理與保養建議的清楚與可信。

CSS token 應集中在 `assets/css/styles.css` 的 `:root`：

- Color：暖米色背景、深可可文字、淺陶土輔助色、低對比邊線。
- Surface：紙感霧面卡片、少量半透明層、柔和陰影。
- Type：標題可偏正式與品牌感，內文需清楚易讀。
- Radius：大容器 36px、中容器 28px、按鈕 999px。
- Spacing：區塊間距要明確，避免所有資訊擠成後台清單。
- Motion：180ms 至 240ms，低幅度、可預期。
- Logo：網站正式 Logo 來源為 `assets/images/logo-reference.png`，由 `content/references/logo-reference.png` 複製而來；此檔為透明背景，禁止再加圓框、陰影、外層圖章或卡片中卡片。

禁止：

- 不使用冷感精品黑白灰作為主風格。
- 不使用 Google 原生藍紫色系。
- 不使用一般美容模板的誇張宣稱，例如「頂級、奢華、立即變美、最強」。
- 不使用內部測試語氣，例如「這個頁面之後可替換」、「按鈕已接到正式頁面」。

## 4. Page Contracts

每個頁面都有固定職責，後續維護不得混用。

- `index.html`：品牌主張、適合對象、預約前導覽、主要入口。
- `price.html`：官方價目表圖片、短導言、預約 CTA、無障礙輔助文字。
- `notice.html`：官方預約須知圖片、可複製預約模板、LINE CTA。
- `offers.html`：目前活動、新客建議、以 LINE 公告為準的提醒。
- `location.html`：到店資訊、Google Maps CTA、位置指引圖片；LINE 圖文選單 F 可直接連到 Google Maps。

## 5. Content Source Of Truth

官方圖片內容的規則是硬約束：

- 價目表圖片、預約須知圖、地圖圖是可見主內容。
- 可見文字只做導引、CTA、預約模板與必要補充。
- 圖片內的資訊若需要被搜尋或螢幕閱讀器取得，放在 `alt` 或 `sr-only`，不要做第二份可見排版。
- 若未來更新價目表或須知圖，先替換 `assets/images/` 中的正式圖片，再檢查 `sr-only` 是否同步。

## 6. Frontend Engineering

目前維持靜態 HTML/CSS/JS，這是對小型 GitHub Pages 品牌站最穩定、最少部署風險的架構。

執行規則：

- 不導入 React、Vite、Next，除非網站需求變成多頁動態後台或資料管理。
- CSS 保持單一主檔與清楚 tokens，避免樣式散落。
- 外部連結由 `assets/js/site-config.js` 統一設定。
- 所有圖片需使用 WebP 或合理壓縮格式，並加上 `width`、`height`、`loading`、`decoding`。
- JavaScript 只處理設定注入、外部連結、複製預約模板，不做不必要的互動效果。

## 7. Architecture And Operations

高階架構判斷以「可維護、可部署、可驗證」優先。

- Deploy：GitHub Pages 從 `main` branch root 部署，頁面 URL 不變。
- Config：公開設定集中在 `assets/js/site-config.js`；不得放 token、後台資訊、客戶資料。
- Assets：公開圖片在 `assets/images/`；原始素材與內部資料不進前台入口。
- SLO：首頁、價目表、須知、優惠、位置五個入口必須可載入，主要 CTA 必須有效。
- Rollback：任何大改前保持 git commit 清楚，發現失誤能回到上一版。

## 8. Accessibility And UX Quality Gate

正式版驗收不是「看起來有做」，而是使用者能完成任務。

每次上線前檢查：

- `h1` 唯一且清楚。
- 主導覽順序一致。
- Skip link 可用。
- Tab focus 清楚可見。
- 圖片有 `alt`，圖片型資訊有 `sr-only` 輔助文字。
- 手機版按鈕可點、圖片不溢出、預約模板可閱讀。
- 沒有內部測試語、施工語、開發者口吻。

## 9. Performance And Security Gate

正式站需守住基礎品質：

- LCP：首屏不要載入過大的非必要圖片。
- INP：避免大量 JS 與不必要動畫。
- CLS：圖片宣告尺寸，避免載入後推動版面。
- Links：外部連結使用 `target="_blank"` 時必須有 `rel="noreferrer"`。
- Secrets：repo 中不得出現 GitHub token、LINE 後台資料、預約個資。
- Future CSP：若未來使用自訂網域或 CDN，評估 CSP header、`frame-ancestors`、`default-src`、`script-src`。

## 10. Writing Rules

Moonshi 語氣：溫柔、清楚、低壓、不誇大。

文案優先順序：

- 先說使用者能理解的事：適合誰、要準備什麼、下一步去哪裡。
- 再說品牌差異：一對一評估、膚況管理、溫和調理與保養節奏。
- 最後才說營運資訊：活動以 LINE 公告為準、完成預約後再前往。

禁止文案：

- 「你的 6 個按鈕已接到正式頁面」
- 「這一格之後可替換」
- 「已新增連結」
- 「更新方式」
- 「目前可用文案建議」
- 「預約流程維持簡單」
- 「回到 LINE 傳送」

這些都是後台語，不能出現在正式網站前台。
