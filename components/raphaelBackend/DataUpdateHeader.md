# DataUpdateHeader 資料更新標題元件

這是一個可重用的頁面標題元件，包含標題、數量統計、資料更新按鈕和最後更新時間。

## 功能特色

- ✅ 支援頁面標題顯示
- ✅ 支援數量統計顯示（可選）
- ✅ 支援資料更新按鈕
- ✅ 支援最後更新時間顯示
- ✅ 支援載入中狀態
- ✅ 響應式設計，支援手機版
- ✅ TypeScript 支援
- ✅ 統一的視覺樣式

## 基本使用

```vue
<template>
  <DataUpdateHeader
    title="會員清單"
    :count="1234"
    count-unit="人"
    :last-updated="lastUpdated"
    @refresh="handleRefresh"
  />
</template>

<script setup lang="ts">
import DataUpdateHeader from '@/components/raphaelBackend/DataUpdateHeader.vue';

const lastUpdated = ref('2025/01/27 14:30:25');

const handleRefresh = () => {
  console.log('資料更新被觸發');
  // 這裡可以觸發 API 呼叫或其他邏輯
};
</script>
```

## Props

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `title` | `string` | - | 頁面標題（必填） |
| `count` | `number \| string` | `undefined` | 數量統計值 |
| `countUnit` | `string` | `''` | 數量單位 |
| `lastUpdated` | `string` | - | 最後更新時間（必填） |
| `refreshButtonText` | `string` | `'資料更新'` | 更新按鈕文字 |
| `isLoading` | `boolean` | `false` | 是否處於載入中狀態 |

## Events

| 事件名稱 | 參數 | 說明 |
|----------|------|------|
| `refresh` | - | 點擊更新按鈕時觸發 |

## 使用範例

### 1. 基本使用（顯示數量）

```vue
<DataUpdateHeader
  title="會員清單"
  :count="1234"
  count-unit="人"
  :last-updated="lastUpdated"
  @refresh="handleRefresh"
/>
```

### 2. 不顯示數量

```vue
<DataUpdateHeader
  title="系統設定"
  :last-updated="lastUpdated"
  @refresh="handleRefresh"
/>
```

### 3. 自訂按鈕文字

```vue
<DataUpdateHeader
  title="訂單管理"
  :count="567"
  count-unit="筆"
  :last-updated="lastUpdated"
  refresh-button-text="重新載入"
  @refresh="handleRefresh"
/>
```

### 4. 載入中狀態

```vue
<DataUpdateHeader
  title="資料分析"
  :count="890"
  count-unit="項"
  :last-updated="lastUpdated"
  :is-loading="isLoading"
  @refresh="handleRefreshWithLoading"
/>
```

### 5. 實際應用範例

```vue
<template>
  <div class="dashboard">
    <Sidebar />
    <main class="content">
      <DataUpdateHeader
        title="會員清單"
        :count="store.total"
        count-unit="人"
        :last-updated="store.lastUpdated"
        :is-loading="store.isLoading"
        @refresh="refreshData"
      />
      
      <!-- 其他內容 -->
    </main>
  </div>
</template>

<script setup lang="ts">
import DataUpdateHeader from '@/components/raphaelBackend/DataUpdateHeader.vue';
import { useMemberStore } from '@/stores/useMemberStore';

const store = useMemberStore();

const refreshData = async () => {
  await store.fetchMembers();
};
</script>
```

## 樣式自訂

元件使用 SCSS 變數，可以透過以下變數自訂樣式：

```scss
// 主要顏色
$primary-100: #f5f7fa;
$primary-200: #1ba39b;
$primary-300: #169a92;

// 中性顏色
$Neutral-500: #666;
```

## 響應式設計

元件支援響應式設計，在不同螢幕尺寸下會自動調整佈局：

- **桌面版**：標題和操作按鈕並排顯示
- **平板版**：保持並排但調整間距
- **手機版**：標題和操作按鈕垂直排列

## 載入中狀態

當 `isLoading` 為 `true` 時：

1. 更新按鈕會被禁用
2. 重新整理圖示會旋轉動畫
3. 按鈕透明度會降低

```vue
<DataUpdateHeader
  title="資料載入中"
  :is-loading="true"
  :last-updated="lastUpdated"
  @refresh="handleRefresh"
/>
```

## 注意事項

1. `title` 和 `lastUpdated` 是必填屬性
2. `count` 是可選的，如果不提供就不會顯示數量統計
3. 載入中狀態會自動處理按鈕的禁用和視覺回饋
4. 元件依賴於專案的 SCSS 變數和 mixins
5. 響應式設計使用 `@include respond-to()` mixin

## 最佳實踐

1. **更新時間格式**：建議使用 `new Date().toLocaleString('zh-TW')` 來格式化時間
2. **載入狀態管理**：在 API 呼叫期間設置 `isLoading` 為 `true`
3. **錯誤處理**：在 refresh 事件處理函數中加入適當的錯誤處理
4. **效能優化**：避免頻繁更新 `lastUpdated`，建議在資料實際更新後才更新

```vue
<script setup lang="ts">
const lastUpdated = ref(new Date().toLocaleString('zh-TW'));
const isLoading = ref(false);

const handleRefresh = async () => {
  try {
    isLoading.value = true;
    await fetchData(); // 實際的資料獲取
    lastUpdated.value = new Date().toLocaleString('zh-TW');
  } catch (error) {
    console.error('資料更新失敗:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>
``` 