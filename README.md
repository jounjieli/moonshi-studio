# Moonshi Studio Website

Moonshi 沐煦的靜態網站與本地自媒體素材資料夾。

網站部署在 GitHub Pages，根目錄保留可直接部署的 HTML 檔案；自媒體素材與參考圖統一放在 `content/`，不會跟網站部署檔混在一起。

## Website Files

- `index.html`：首頁
- `price.html`：價目表
- `notice.html`：工作室須知與預約表單
- `offers.html`：優惠活動
- `location.html`：工作室位置
- `assets/css/styles.css`：網站樣式
- `assets/js/site.js`：網站互動功能
- `assets/js/site-config.js`：IG、LINE、地址與地圖連結設定
- `assets/images/`：網站正式使用的圖片資產

## Content Library

`content/` 是本地內容素材庫，不參與 GitHub Pages 部署。

- `content/brand/`：品牌資料與定位文件
- `content/instagram/`：IG 貼文素材，依日期整理
- `content/line/`：LINE 官方帳號、圖文選單、預約須知素材
- `content/references/`：Logo、IG 頁面截圖與其他參考圖
- `content/services/`：服務項目與價目表相關素材

## LINE Rich Menu Links

- A 價目表：`/price.html`
- B Instagram：`https://www.instagram.com/moonshi_studio/?hl=zh-tw`
- C 工作室須知：`/notice.html`
- D 優惠活動：`/offers.html`
- E 立即預約：`/notice.html#booking-form`
- F 工作室位置：`/location.html`

## Update Config

常用連結集中在 `assets/js/site-config.js`：

- `instagramUrl`
- `lineUrl`
- `addressArea`
- `mapUrl`

## GitHub Pages

GitHub Pages 設定：

- Source：`Deploy from a branch`
- Branch：`main`
- Folder：`/ (root)`

正式網址：

`https://jounjieli.github.io/moonshi-studio/`
