# Moonshi Studio Website

這是一個可直接部署到 GitHub Pages 的靜態網站，對應 Moonshi 沐煦的 LINE 圖文選單與品牌資訊頁。

## 站點結構

- `index.html`：首頁
- `price.html`：價目表
- `notice.html`：工作室須知
- `offers.html`：優惠活動
- `location.html`：工作室位置
- `assets/css/styles.css`：全站樣式
- `assets/js/site-config.js`：可集中修改的品牌連結設定

## LINE 圖文選單對應

- A：`/price.html`
- B：Instagram
- C：`/notice.html`
- D：`/offers.html`
- E：LINE 預約
- F：`/location.html`

## 上線前要確認

請先打開 `assets/js/site-config.js`，確認以下欄位：

- `instagramUrl`
- `lineUrl`
- `addressArea`
- `mapUrl`

目前已先填入：

- Instagram：`https://www.instagram.com/moonshi_studio/?hl=zh-tw`
- LINE：`https://line.me/R/ti/p/@300shhin`

如果你的 LINE 官方帳號實際外部連結不是這個，請改成正確網址。

## GitHub Pages 部署

1. 進入 GitHub repo 的 `Settings > Pages`
2. `Build and deployment` 選 `Deploy from a branch`
3. Branch 選 `main`，資料夾選 `/ (root)`
4. 儲存後等待部署完成

部署完成後網址通常會是：

`https://jounjieli.github.io/moonshi-studio/`

## 後續維護

- 改價目：更新 `price.html`
- 改優惠：更新 `offers.html`
- 改須知：更新 `notice.html`
- 改位置或 Google Maps：更新 `assets/js/site-config.js`
- 改 LINE 圖文選單按鈕連結：把頁面網址貼進 LINE 官方帳號後台
