<template>
  <div class="example-container">
    <h3>DataUpdateHeader 使用範例</h3>
    
    <!-- 基本使用 -->
    <div class="example-section">
      <h4>基本使用</h4>
      <DataUpdateHeader
        title="會員清單"
        :count="1234"
        count-unit="人"
        :last-updated="lastUpdated"
        @refresh="handleRefresh"
      />
    </div>

    <!-- 不顯示數量 -->
    <div class="example-section">
      <h4>不顯示數量</h4>
      <DataUpdateHeader
        title="系統設定"
        :last-updated="lastUpdated"
        @refresh="handleRefresh"
      />
    </div>

    <!-- 自訂按鈕文字 -->
    <div class="example-section">
      <h4>自訂按鈕文字</h4>
      <DataUpdateHeader
        title="訂單管理"
        :count="567"
        count-unit="筆"
        :last-updated="lastUpdated"
        refresh-button-text="重新載入"
        @refresh="handleRefresh"
      />
    </div>

    <!-- 載入中狀態 -->
    <div class="example-section">
      <h4>載入中狀態</h4>
      <DataUpdateHeader
        title="資料分析"
        :count="890"
        count-unit="項"
        :last-updated="lastUpdated"
        :is-loading="isLoading"
        @refresh="handleRefreshWithLoading"
      />
    </div>

    <!-- 顯示當前狀態 -->
    <div class="current-state">
      <h4>當前狀態：</h4>
      <pre>{{ JSON.stringify({
        lastUpdated,
        isLoading,
        refreshCount
      }, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DataUpdateHeader from './DataUpdateHeader.vue';

// 響應式數據
const lastUpdated = ref('2025/01/27 14:30:25');
const isLoading = ref(false);
const refreshCount = ref(0);

// 處理刷新
const handleRefresh = () => {
  console.log('資料更新被觸發');
  refreshCount.value++;
  lastUpdated.value = new Date().toLocaleString('zh-TW');
};

// 處理帶載入狀態的刷新
const handleRefreshWithLoading = () => {
  console.log('帶載入狀態的資料更新被觸發');
  isLoading.value = true;
  refreshCount.value++;
  
  // 模擬 API 呼叫
  setTimeout(() => {
    lastUpdated.value = new Date().toLocaleString('zh-TW');
    isLoading.value = false;
  }, 2000);
};
</script>

<style scoped lang="scss">
.example-container {
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

.current-state {
  margin-top: 40px;
  padding: 20px;
  background: #f0f0f0;
  border-radius: 8px;

  h4 {
    margin-top: 0;
    margin-bottom: 16px;
    color: #333;
  }

  pre {
    background: #fff;
    padding: 16px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 14px;
  }
}
</style> 