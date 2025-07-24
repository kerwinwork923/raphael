<template>
  <div class="sidebar-example">
    <h3>Sidebar 使用範例</h3>
    
    <!-- 基本使用 -->
    <div class="example-section">
      <h4>基本使用（自動路由導航）</h4>
      <div class="demo-container">
        <Sidebar 
          v-model="currentPage"
          :current-page="currentPage"
          @page-change="handlePageChange"
          @logout="handleLogout"
        />
        <div class="content-area">
          <p>當前頁面: {{ currentPage }}</p>
          <p>路由路徑: {{ $route.path }}</p>
        </div>
      </div>
    </div>

    <!-- 手動控制頁面 -->
    <div class="example-section">
      <h4>手動控制頁面</h4>
      <div class="controls">
        <button 
          v-for="page in availablePages" 
          :key="page"
          @click="setPage(page)"
          :class="{ active: currentPage === page }"
        >
          {{ getPageLabel(page) }}
        </button>
      </div>
    </div>

    <!-- 狀態顯示 -->
    <div class="example-section">
      <h4>當前狀態</h4>
      <pre>{{ JSON.stringify({
        currentPage,
        routePath: $route.path,
        sidebarCollapsed: localStorage.getItem('sidebarCollapsed')
      }, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './Sidebar.vue';

const route = useRoute();

// 當前頁面狀態
const currentPage = ref('member');

// 可用頁面
const availablePages = ['member', 'order', 'push', 'points', 'account'];

// 頁面標籤對應
const pageLabels = {
  member: '會員清單',
  order: '訂單管理',
  push: '推播設定',
  points: '積分管理',
  account: '帳號管理'
};

// 獲取頁面標籤
const getPageLabel = (page: string) => {
  return pageLabels[page as keyof typeof pageLabels] || page;
};

// 設置頁面
const setPage = (page: string) => {
  currentPage.value = page;
};

// 處理頁面變更
const handlePageChange = (page: string) => {
  console.log('頁面變更:', page);
  currentPage.value = page;
};

// 處理登出
const handleLogout = () => {
  console.log('登出被觸發');
  // 這裡可以加入登出邏輯
};

// 初始化
onMounted(() => {
  // 根據當前路由設置頁面
  const path = route.path;
  if (path.includes('/member')) {
    currentPage.value = 'member';
  } else if (path.includes('/order')) {
    currentPage.value = 'order';
  } else if (path.includes('/push')) {
    currentPage.value = 'push';
  } else if (path.includes('/points')) {
    currentPage.value = 'points';
  } else if (path.includes('/account')) {
    currentPage.value = 'account';
  }
});
</script>

<style scoped lang="scss">
.sidebar-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.example-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;

  h4 {
    margin-top: 0;
    margin-bottom: 16px;
    color: #333;
  }
}

.demo-container {
  display: flex;
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.content-area {
  flex: 1;
  padding: 20px;
  background: white;
  
  p {
    margin: 8px 0;
    font-size: 14px;
  }
}

.controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  
  button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: #f0f0f0;
    }
    
    &.active {
      background: #1ba39b;
      color: white;
      border-color: #1ba39b;
    }
  }
}

pre {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 14px;
  border: 1px solid #ddd;
}
</style> 