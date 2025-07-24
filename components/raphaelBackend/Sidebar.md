# Sidebar 側邊欄元件

這是一個功能完整的側邊欄導航元件，支援分頁切換、焦點狀態管理、路由導航和響應式設計。

## 功能特色

- ✅ 自動路由導航
- ✅ 焦點狀態管理（鍵盤導航）
- ✅ 懸停效果和視覺回饋
- ✅ 響應式設計（手機版自動收合）
- ✅ 狀態持久化（localStorage）
- ✅ 無障礙支援（ARIA 標籤）
- ✅ TypeScript 支援
- ✅ 統一的視覺樣式

## 基本使用

```vue
<template>
  <div class="dashboard">
    <Sidebar 
      v-model="currentPage"
      :current-page="currentPage"
      @page-change="handlePageChange"
      @logout="handleLogout"
    />
    <main class="content">
      <!-- 頁面內容 -->
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/raphaelBackend/Sidebar.vue';

const currentPage = ref('member');

const handlePageChange = (page: string) => {
  console.log('頁面變更:', page);
  currentPage.value = page;
};

const handleLogout = () => {
  console.log('登出被觸發');
  // 處理登出邏輯
};
</script>
```

## Props

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `modelValue` | `string` | `'member'` | 當前選中的頁面（v-model） |
| `currentPage` | `string` | `'member'` | 當前頁面（同步用） |

## Events

| 事件名稱 | 參數 | 說明 |
|----------|------|------|
| `update:modelValue` | `(value: string)` | 頁面變更時觸發 |
| `page-change` | `(page: string)` | 頁面切換時觸發 |
| `logout` | - | 登出時觸發 |

## 菜單項目配置

元件內建以下菜單項目：

```typescript
const menuItems = [
  {
    key: 'member',
    label: '會員清單',
    icon: '/assets/imgs/backend/member.svg',
    path: '/raphaelBackend/member'
  },
  {
    key: 'order',
    label: '訂單管理',
    icon: '/assets/imgs/backend/order.svg',
    path: '/raphaelBackend/order'
  },
  {
    key: 'push',
    label: '推播設定',
    icon: '/assets/imgs/backend/push.svg',
    path: '/raphaelBackend/push'
  },
  {
    key: 'points',
    label: '積分管理',
    icon: '/assets/imgs/backend/point.svg',
    path: '/raphaelBackend/points'
  },
  {
    key: 'account',
    label: '帳號管理',
    icon: '/assets/imgs/backend/account.svg',
    path: '/raphaelBackend/account'
  }
];
```

## 使用範例

### 1. 基本使用（自動路由導航）

```vue
<template>
  <div class="dashboard">
    <Sidebar 
      v-model="currentPage"
      @page-change="handlePageChange"
      @logout="handleLogout"
    />
    <main class="content">
      <h1>{{ getPageTitle(currentPage) }}</h1>
      <!-- 頁面內容 -->
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/raphaelBackend/Sidebar.vue';

const currentPage = ref('member');

const pageTitles = {
  member: '會員清單',
  order: '訂單管理',
  push: '推播設定',
  points: '積分管理',
  account: '帳號管理'
};

const getPageTitle = (page: string) => {
  return pageTitles[page as keyof typeof pageTitles] || page;
};

const handlePageChange = (page: string) => {
  console.log('切換到頁面:', page);
};

const handleLogout = () => {
  // 處理登出邏輯
  router.push('/login');
};
</script>
```

### 2. 手動控制頁面

```vue
<template>
  <div class="dashboard">
    <Sidebar 
      :current-page="currentPage"
      @page-change="handlePageChange"
    />
    
    <!-- 手動控制按鈕 -->
    <div class="page-controls">
      <button @click="setPage('member')">會員清單</button>
      <button @click="setPage('order')">訂單管理</button>
      <button @click="setPage('push')">推播設定</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const currentPage = ref('member');

const setPage = (page: string) => {
  currentPage.value = page;
};

const handlePageChange = (page: string) => {
  currentPage.value = page;
  // 可以加入額外的邏輯
};
</script>
```

### 3. 與路由整合

```vue
<template>
  <div class="dashboard">
    <Sidebar 
      v-model="currentPage"
      @page-change="handlePageChange"
    />
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const currentPage = ref('member');

// 監聽路由變化
watch(() => route.path, (newPath) => {
  if (newPath.includes('/member')) {
    currentPage.value = 'member';
  } else if (newPath.includes('/order')) {
    currentPage.value = 'order';
  }
  // ... 其他頁面
});

const handlePageChange = (page: string) => {
  // Sidebar 會自動導航到對應路由
  console.log('頁面變更:', page);
};
</script>
```

## 焦點狀態管理

元件支援完整的焦點狀態管理：

### 鍵盤導航
- 使用 `Tab` 鍵在菜單項目間切換
- 使用 `Enter` 或 `Space` 鍵選擇項目
- 支援 `focus-visible` 樣式

### 視覺回饋
- **懸停狀態**：滑鼠懸停時顯示淺色背景
- **焦點狀態**：鍵盤導航時顯示邊框
- **活動狀態**：當前頁面顯示深色背景和左側指示器

## 響應式設計

### 桌面版
- 完整寬度顯示（240px）
- 支援收合功能（72px）
- 懸停效果和動畫

### 平板版
- 適中寬度（180px）
- 保持完整功能

### 手機版
- 固定定位，覆蓋內容
- 自動收合
- 點擊遮罩關閉
- 點擊菜單項目後自動收合

## 狀態持久化

元件會自動保存以下狀態到 `localStorage`：

- `sidebarCollapsed`：側邊欄收合狀態

```javascript
// 自動保存
localStorage.setItem('sidebarCollapsed', 'true');

// 自動恢復
const saved = localStorage.getItem('sidebarCollapsed');
if (saved === 'true') {
  collapsed.value = true;
}
```

## 無障礙支援

元件包含完整的無障礙支援：

- `role="menuitem"`：菜單項目角色
- `aria-label`：描述性標籤
- `tabindex="0"`：鍵盤導航支援
- `focus-visible`：焦點樣式

## 樣式自訂

元件使用 SCSS 變數，可以透過以下變數自訂樣式：

```scss
// 主要顏色
$chip-success: #1ba39b;
$primary-200: #1ba39b;
$red-500: #ec4f4f;

// 邊框
$border: #e5e9f2;
```

## 注意事項

1. **路由配置**：確保菜單項目的 `path` 與實際路由路徑匹配
2. **圖示路徑**：確保圖示檔案存在於指定路徑
3. **響應式斷點**：使用 `@include respond-to()` mixin
4. **狀態同步**：建議同時使用 `v-model` 和 `current-page` 確保狀態同步

## 最佳實踐

1. **路由整合**：讓 Sidebar 自動處理路由導航
2. **狀態管理**：使用 Pinia 或 Vuex 管理全域狀態
3. **錯誤處理**：在 `page-change` 事件中加入錯誤處理
4. **效能優化**：避免在菜單項目中放置複雜的計算屬性

```vue
<script setup lang="ts">
// 推薦：使用 Pinia store 管理狀態
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();

const handlePageChange = async (page: string) => {
  try {
    await appStore.setCurrentPage(page);
    // 可以加入載入狀態
  } catch (error) {
    console.error('頁面切換失敗:', error);
  }
};
</script>
``` 