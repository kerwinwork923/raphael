<template>
  <div class="sidebar-test">
    <h3>Sidebar 圖片測試</h3>
    
    <!-- 測試所有菜單圖示 -->
    <div class="icon-test">
      <h4>菜單圖示測試</h4>
      <div class="icon-grid">
        <div class="icon-item" v-for="item in menuItems" :key="item.key">
          <img :src="item.icon" :alt="item.label" />
          <span>{{ item.label }}</span>
          <small>{{ item.icon }}</small>
        </div>
      </div>
    </div>

    <!-- 測試其他圖示 -->
    <div class="icon-test">
      <h4>其他圖示測試</h4>
      <div class="icon-grid">
        <div class="icon-item">
          <img src="/assets/imgs/backend/Subtract.svg" alt="Logo" />
          <span>Logo</span>
        </div>
        <div class="icon-item">
          <img src="/assets/imgs/backend/user.svg" alt="使用者" />
          <span>使用者</span>
        </div>
        <div class="icon-item">
          <img src="/assets/imgs/backend/backendLogout.svg" alt="登出" />
          <span>登出</span>
        </div>
        <div class="icon-item">
          <img src="/assets/imgs/backend/slideIcon.svg" alt="收合" />
          <span>收合</span>
        </div>
      </div>
    </div>

    <!-- 實際 Sidebar 測試 -->
    <div class="sidebar-test-container">
      <h4>實際 Sidebar 測試</h4>
      <div class="demo-container">
        <Sidebar 
          v-model="currentPage"
          :current-page="currentPage"
          @page-change="handlePageChange"
          @logout="handleLogout"
        />
        <div class="content-area">
          <p>當前頁面: {{ currentPage }}</p>
          <p>點擊菜單項目測試圖片顯示</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from './Sidebar.vue';

const currentPage = ref('member');

// 菜單項目配置（與 Sidebar 相同）
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
    icon: '/assets/imgs/backend/account.svg',
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

const handlePageChange = (page: string) => {
  console.log('頁面變更:', page);
  currentPage.value = page;
};

const handleLogout = () => {
  console.log('登出被觸發');
};
</script>

<style scoped lang="scss">
.sidebar-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.icon-test {
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

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  text-align: center;

  img {
    width: 32px;
    height: 32px;
    margin-bottom: 8px;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 4px;
  }

  span {
    font-weight: 600;
    margin-bottom: 4px;
  }

  small {
    color: #666;
    font-size: 12px;
    word-break: break-all;
  }
}

.sidebar-test-container {
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
</style> 