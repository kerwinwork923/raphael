# FilterToolbar 篩選工具列元件

這是一個可重用的篩選工具列元件，支援搜尋、日期選擇、產品篩選和狀態篩選功能。

## 功能特色

- ✅ 支援搜尋關鍵字輸入
- ✅ 支援日期範圍選擇（使用 VueDatePicker）
- ✅ 支援產品下拉篩選
- ✅ 支援狀態下拉篩選
- ✅ 可自訂顯示/隱藏各篩選器
- ✅ 響應式設計，支援手機版
- ✅ TypeScript 支援
- ✅ 統一的視覺樣式

## 基本使用

```vue
<template>
  <FilterToolbar
    v-model:search-value="filters.keyword"
    v-model:date-value="filters.dateRange"
    v-model:product-value="filters.product"
    v-model:status-value="filters.status"
    :product-options="productOptions"
    :status-options="statusOptions"
    @search="handleSearch"
    @date-change="handleDateChange"
    @product-change="handleProductChange"
    @status-change="handleStatusChange"
  />
</template>

<script setup lang="ts">
import FilterToolbar from '@/components/raphaelBackend/FilterToolbar.vue';

const filters = ref({
  keyword: '',
  dateRange: null,
  product: '',
  status: ''
});

const productOptions = [
  { label: "雙效紅光活力衣", value: "雙效紅光活力衣" },
  { label: "三效深眠衣", value: "三效深眠衣" },
];

const statusOptions = [
  { label: "正常使用", value: "正常使用" },
  { label: "待關注", value: "待關注" },
];

const handleSearch = (value: string) => {
  console.log('搜尋:', value);
};

const handleDateChange = (value: any) => {
  console.log('日期變更:', value);
};

const handleProductChange = (value: string) => {
  console.log('產品變更:', value);
};

const handleStatusChange = (value: string) => {
  console.log('狀態變更:', value);
};
</script>
```

## Props

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `showSearch` | `boolean` | `true` | 是否顯示搜尋欄位 |
| `showDatePicker` | `boolean` | `true` | 是否顯示日期選擇器 |
| `showProductFilter` | `boolean` | `true` | 是否顯示產品篩選 |
| `showStatusFilter` | `boolean` | `true` | 是否顯示狀態篩選 |
| `searchValue` | `string` | `''` | 搜尋關鍵字值 |
| `searchPlaceholder` | `string` | `'請輸入關鍵字'` | 搜尋欄位提示文字 |
| `dateValue` | `any` | `null` | 日期值 |
| `datePlaceholder` | `string` | `'日期查詢'` | 日期選擇器提示文字 |
| `minDate` | `Date` | `new Date(2024, 0, 1)` | 日期選擇器最小日期 |
| `productValue` | `string` | `''` | 產品篩選值 |
| `productPlaceholder` | `string` | `'商品篩選'` | 產品篩選提示文字 |
| `productOptions` | `FilterOption[]` | `[]` | 產品選項列表 |
| `statusValue` | `string` | `''` | 狀態篩選值 |
| `statusPlaceholder` | `string` | `'狀態篩選'` | 狀態篩選提示文字 |
| `statusOptions` | `FilterOption[]` | `[]` | 狀態選項列表 |

## Events

| 事件名稱 | 參數 | 說明 |
|----------|------|------|
| `update:searchValue` | `(value: string)` | 搜尋值變更時觸發 |
| `update:dateValue` | `(value: any)` | 日期值變更時觸發 |
| `update:productValue` | `(value: string)` | 產品值變更時觸發 |
| `update:statusValue` | `(value: string)` | 狀態值變更時觸發 |
| `search` | `(value: string)` | 搜尋時觸發 |
| `dateChange` | `(value: any)` | 日期變更時觸發 |
| `productChange` | `(value: string)` | 產品變更時觸發 |
| `statusChange` | `(value: string)` | 狀態變更時觸發 |

## 類型定義

```typescript
interface FilterOption {
  label: string;
  value: string;
}
```

## 使用範例

### 1. 基本使用（顯示所有篩選器）

```vue
<FilterToolbar
  v-model:search-value="filters.keyword"
  v-model:date-value="filters.dateRange"
  v-model:product-value="filters.product"
  v-model:status-value="filters.status"
  :product-options="productOptions"
  :status-options="statusOptions"
/>
```

### 2. 自訂顯示（只顯示搜尋和日期）

```vue
<FilterToolbar
  v-model:search-value="filters.keyword"
  v-model:date-value="filters.dateRange"
  :show-product-filter="false"
  :show-status-filter="false"
  date-placeholder="選擇日期範圍"
/>
```

### 3. 自訂選項

```vue
<FilterToolbar
  v-model:search-value="filters.keyword"
  v-model:product-value="filters.product"
  v-model:status-value="filters.status"
  :show-date-picker="false"
  :product-options="customProductOptions"
  :status-options="customStatusOptions"
  product-placeholder="選擇設備"
  status-placeholder="選擇狀態"
/>
```

## 樣式自訂

元件使用 SCSS 變數，可以透過以下變數自訂樣式：

```scss
// 主要顏色
$primary-100: #f5f7fa;
$primary-200: #1ba39b;
$primary-300: #169a92;
$chip-success: #1ba39b;

// 中性顏色
$Neutral-500: #666;
$Neutral-white: #fff;

// 邊框
$border: #e0e0e0;
```

## 注意事項

1. 需要安裝 `@vuepic/vue-datepicker` 套件
2. 元件依賴於專案的 SCSS 變數和 mixins
3. 響應式設計使用 `@include respond-to()` mixin
4. 日期選擇器使用 `:deep()` 來樣式化內部元素

## 依賴套件

```json
{
  "@vuepic/vue-datepicker": "^7.0.0"
}
``` 