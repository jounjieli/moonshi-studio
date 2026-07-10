# Moonshi 沐煦網站設計規範

更新日期：2026-07-10
版本：2.0

## 產品任務

網站的核心任務是降低第一次預約前的不確定感，讓訪客在固定頁面完成三件事：

1. 理解 Moonshi 沐煦的一對一照護方式。
2. 找到官方價格、須知、活動與位置資訊。
3. 複製預約格式並前往官方 LINE 完成確認。

網站不是 LINE 圖文選單的說明頁，也不是內部測試介面。前台不得出現「按鈕已接好」「之後可替換」「更新方式」等開發或溝通語氣。

## 品牌定位

- 正式名稱：`Moonshi 沐煦`；視覺名稱可使用 `Moonshi Studio`。
- 主理人：Eason。
- 服務定位：一對一肌膚管理、膚況評估、清潔調理、穩膚修護與客製化保養建議。
- 品牌範圍不侷限於問題肌，不使用 `Problem Skin Studio` 或 `Problem Skin Management` 作為全站定位。
- 語氣：溫和、清楚、正式、低壓，不誇大效果，不用療程堆疊取代專業判斷。

## 設計方向

採用 Material 3 的系統化方法，但不複製 Google 產品外觀：

- Color roles：墨色負責文字，暖白負責基底，灰綠負責主要行動，低飽和玫瑰負責人味與狀態提示。
- Surface hierarchy：以全寬色帶、留白與分隔線建立層級，卡片只用於預約格式等真正的功能工具。
- Shape scale：功能卡與按鈕使用 6px 圓角；不以大量膠囊、圓形與高圓角製造設計感。
- Type hierarchy：品牌與主標題使用 `Noto Serif TC`；導覽、內文與控制使用 `Noto Sans TC`。
- Motion：只保留導覽、連結與按鈕的短暫狀態回饋，並尊重 `prefers-reduced-motion`。
- Adaptive layout：桌機維持編輯式留白；820px 以下收合導覽；官方圖片在任何視窗維持自然比例。

## Logo 規則

- 正式 Logo 唯一來源：`assets/images/logo-reference.png`。
- 首頁 Logo 是第一視窗主視覺，不可移除，也不可放入多層卡片、圓框或額外底板。
- Logo 以無框、低飽和、與首屏背景直接融合的方式呈現。
- 導覽使用文字 wordmark，避免同一視窗重複兩個完整 Logo。
- Footer 可使用小尺寸 Logo 作品牌收尾，不得成為第二個主視覺。

## 官方圖片來源規則

以下素材是對應資訊的唯一可見來源：

- `assets/images/price-list.webp`：價目表。
- `assets/images/booking-notice.webp`：預約須知。
- `assets/images/location-map.webp`：位置指引。

不得在圖片旁重新製作另一份可見價格表、須知清單或地圖內容。SEO 與無障礙需要的文字等價內容使用 `alt`、`figcaption` 與 `sr-only`，避免同時維護兩份可見資料。

## 頁面契約

- `index.html`：品牌第一印象、照護理念、固定資訊入口與預約前導。
- `price.html`：官方價目表、選擇建議與預約入口。
- `notice.html`：官方預約須知、初次／回訪預約格式與複製功能。
- `offers.html`：目前活動狀態、新客／回訪路徑與 LINE 詢問入口。
- `location.html`：地址、官方位置圖與 Google Maps 導航。

既有網址是 LINE 圖文選單的外部契約，未經明確授權不得變更：

- A：`/price.html`
- B：Instagram
- C：`/notice.html`
- D：`/offers.html`
- E：`/notice.html#booking-form`
- F：Google Maps

## 行動與導覽

- 每頁主導覽固定為服務價格、預約須知、目前活動、到店資訊、立即預約。
- 每頁只保留一個最主要的下一步；其他入口使用文字連結降低競爭。
- 820px 以下使用按鈕開啟導覽，必須同步 `aria-expanded`、可用 Escape 關閉，且不得鎖住頁面造成黑畫面或不可捲動。
- 外部連結由 `assets/js/site-config.js` 注入，並使用 `target="_blank"` 與 `rel="noreferrer"`。

## 內容規則

- 先說訪客需要理解的事，再說品牌做法，最後才給行動。
- 不把 Moonshi 縮限為只處理痘痘、粉刺或問題肌。
- 不使用「頂級、最強、立即改善」等無法驗證的效果宣稱。
- 正式資料若可能隨時間變動，以官方圖片或 LINE 最新公告為準。

## 工程與驗收

- 維持靜態 HTML、CSS、JavaScript 與 GitHub Pages 部署，不引入不必要框架。
- 共用色彩、字體、間距、圓角與動態集中在 `assets/css/styles.css`。
- IG、LINE、地址與地圖集中在 `assets/js/site-config.js`。
- CSS/JS 使用版本查詢避免 GitHub Pages 發布後出現新舊快取混用。
- 每頁只能有一個 `h1`，所有圖片需有尺寸與替代文字。
- 上線前以桌機與手機逐頁驗證：水平溢出、圖片比例、導覽、主要 CTA、複製功能、外部連結、Console error 與舊版禁用文案。

## 參考標準

- Google Material 3：color roles、type hierarchy、adaptive layout、interaction states。
- Google Web Vitals：LCP、INP、CLS。
- W3C WCAG 2.2：鍵盤操作、focus、語意結構與圖片型資訊替代內容。
- OWASP：外部連結與公開設定的安全邊界。
