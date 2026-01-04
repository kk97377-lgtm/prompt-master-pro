# Prompt Master Pro 系統規格說明書

> **用途說明**: 本規格說明書作為系統開發與維護的基準文件，描述了 Prompt Master Pro (V2.0) 的完整功能與技術架構。

## 📋 系統概述

### 系統名稱
【Code Gym】Prompt Master Pro (AI 逆向工程助手)

### 核心功能描述
建立一個基於 Next.js 的響應式網頁應用程式 (PWA)，能夠：
1.  **圖片逆向分析**: 上傳圖片並使用 AI 分析其視覺元素、風格與技術參數。
2.  **多維度結果輸出**: 提供標籤 (Tags)、詳細描述 (Prompt)、技術參數 (EXIF) 三種視角。
3.  **客戶端優化**: 自動壓縮高解析度圖片以符合伺服器傳輸限制。
4.  **跨平台支援**: 支援 PWA (Progressive Web App)，可於手機安裝為獨立 App。

### 技術架構
-   **界面框架**: Next.js 14 (App Router), React, Tailwind CSS
-   **依賴套件**: lucide-react (圖標), clsx
-   **AI 模型**: Google Gemini 2.0 Flash Experimental
-   **HTTP請求**: Native Fetch API
-   **數據處理**: Canvas API (圖片壓縮), Base64 encoding
-   **部署方式**: Vercel Cloud Hosting (Serverless Functions)

---

## 🎯 功能需求規格

### F-001: 用戶界面設計
**基本要求**:
-   **標題**: 漸層色標題文字 "AI Reverse Engineering 逆向工程 (Image to Prompt)" (Purple-400 to Pink-400)。
-   **佈局結構**:
    -   **桌面版**: 左右兩欄佈局 (左側上傳/預覽，右側結果/狀態)。
    -   **手機版**: 上下堆疊佈局，響應式調整寬度。
-   **主要互動**:
    -   拖放/點擊上傳區域 (帶有 Upload Icon)。
    -   狀態指示器 (Loading Spinner)。
    -   結果頁籤切換 (Tabs)。

### F-002: 數據獲取功能
**功能目標**: 獲取用戶圖片並傳送至後端。
**用戶操作**: 上傳圖片檔 (支援 Drag & Drop 或 檔案選擇器)。
**數據來源**: 用戶本地檔案 (Local File System / Mobile Camera)。
**數據範圍**:
-   支援格式: JPEG, PNG, WebP。
-   大小限制: 經過前端壓縮後 < 4MB (原始檔案可大於此限制)。

### F-003: 數據處理與計算
**前端處理**:
-   **圖片壓縮**: 使用 HTML5 Canvas 對大於 1536px 的圖片進行縮放與品質壓縮 (JPEG q=0.8)。
-   **格式轉換**: 將 Blob 轉換為 Base64 字串。

**後端處理 (API Route)**:
-   **身份驗證**: 檢查 `GOOGLE_API_KEY` 環境變數。
-   **AI 請求**: 建構 Multipart 請求發送至 Gemini API。
-   **JSON 解析**: 清理並解析 AI 返回的 Markdown JSON 字串。

### F-004: 主要顯示區域設計
**頁籤結構**:
1.  **標籤 (Label Mode)**: 顯示 10-15 個中英對照的關鍵字標籤 (Tag Cloud)。
2.  **描述 (Description)**: 顯示完整的英文 Prompt 段落，以及繁體中文翻譯。
3.  **參數 (Technical)**: 顯示此風格的模擬相機參數 (光圈、快門、ISO、曝光)。

**詳細內容**:
-   **互動功能**:
    -   "Copy 複製": 根據當前頁籤複製對應內容。
    -   "Start Over 重新開始": 清除狀態回到上傳介面。
    -   "Change 更換": 僅更換圖片但保留介面狀態 (如適用)。

### F-005: 系統狀態反饋
-   **上傳前**: 顯示 "Click or Drag to Upload Image"。
-   **分析中**: 顯示 "正在使用 Gemini 分析圖片... (Analyzing image...)" 及加載動畫。
-   **錯誤時**: 使用 `alert` 或文字提示顯示錯誤訊息 (如 "Analysis failed")。

### F-006: AI 分析功能
**AI角色設定**: 專業攝影師與時尚造型師。
**分析目標**: 為高階 8K 重繪生成詳細 Prompt。
**模組提示語結構**:
1.  **Subject Analysis**: 年齡、種族、膚質、特徵。
2.  **Apparel**: 詳細服裝材質、設計。
3.  **Pose**: 視線、肢體語言。
4.  **Environment**: 材質、前景、景深。
5.  **Lighting**: 光線類型、氛圍。
6.  **Technical**: 鏡頭焦段、景深效果。
7.  **Style**: 風格分析 (真實、二次元、映像派、葛飾北齋...等藝術風格描述)。

**輸出格式**: JSON

### F-008: 錯誤處理
-   **API 金鑰缺失**: 回傳 500 Error，提示 Server Config Error。
-   **圖片解析失敗**: 對於非圖片或損壞檔案進行攔截。
-   **Payload 過大**: 前端自動壓縮防止此錯誤。
-   **AI 拒絕生成**: 捕捉 Google AI 安全性阻擋 (Safety Filters) 並回傳錯誤。

### F-009: PWA 與 部署
-   **Manifest**: 定義 `standalone` 模式，設定 Icons 與 Theme Color。
-   **Meta Tags**: 禁止縮放 (user-scalable=no) 以提供原生 App 體驗。
-   **部署平台**: Vercel (Production Mode)。

---

## 📊 品質標準
-   **效能**: 圖片壓縮需在 1 秒內完成，API 回應需在 15 秒內完成 (視 Gemini 狀態)。
-   **相容性**: 支援 iOS Safari (加入主畫面) 與 Android Chrome。
-   **安全性**: API Key 僅在伺服器端 (Serverless Function) 使用，不暴露於前端。
