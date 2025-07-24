<template>
  <div class="example-container">
    <h3>FilterToolbar 使用範例</h3>
    
    <!-- 基本使用 - 顯示所有篩選器 -->
    <div class="example-section">
      <h4>基本使用（顯示所有篩選器）</h4>
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
    </div>

    <!-- 自訂顯示 - 只顯示搜尋和日期 -->
    <div class="example-section">
      <h4>自訂顯示（只顯示搜尋和日期）</h4>
      <FilterToolbar
        v-model:search-value="filters.keyword"
        v-model:date-value="filters.dateRange"
        :show-product-filter="false"
        :show-status-filter="false"
        date-placeholder="選擇日期範圍"
        @search="handleSearch"
        @date-change="handleDateChange"
      />
    </div>

    <!-- 自訂選項 - 不同的產品和狀態選項 -->
    <div class="example-section">
      <h4>自訂選項（不同的產品和狀態選項）</h4>
      <FilterToolbar
        v-model:search-value="filters.keyword"
        v-model:product-value="filters.product"
        v-model:status-value="filters.status"
        :show-date-picker="false"
        :product-options="customProductOptions"
        :status-options="customStatusOptions"
        product-placeholder="選擇設備"
        status-placeholder="選擇狀態"
        @search="handleSearch"
        @product-change="handleProductChange"
        @status-change="handleStatusChange"
      />
    </div>

    <!-- 顯示當前篩選值 -->
    <div class="current-filters">
      <h4>當前篩選值：</h4>
      <pre>{{ JSON.stringify(filters, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FilterToolbar from './FilterToolbar.vue';

// 篩選狀態
const filters = ref({
  keyword: '',
  dateRange: null,
  product: '',
  status: ''
});

// 基本選項
const productOptions = [
  { label: "雙效紅光活力衣", value: "雙效紅光活力衣" },
  { label: "三效深眠衣", value: "三效深眠衣" },
  { label: "全效調節衣", value: "全效調節衣" },
  { label: "居家治療儀", value: "居家治療儀" },
];

const statusOptions = [
  "忠誠用戶",
  "當前活躍",
  "經常使用",
  "正常使用",
  "偶爾使用",
  "待關注",
  "解約",
  "高風險",
  "未歸還",
  "退費",
  "奧客",
].map((v) => ({ label: v, value: v }));

// 自訂選項
const customProductOptions = [
  { label: "心率監測器", value: "心率監測器" },
  { label: "血壓計", value: "血壓計" },
  { label: "體溫計", value: "體溫計" },
  { label: "血糖儀", value: "血糖儀" },
];

const customStatusOptions = [
  { label: "正常", value: "正常" },
  { label: "異常", value: "異常" },
  { label: "待檢查", value: "待檢查" },
  { label: "已處理", value: "已處理" },
];

// 事件處理函數
const handleSearch = (value: string) => {
  console.log('搜尋:', value);
  // 這裡可以觸發 API 呼叫或其他邏輯
};

const handleDateChange = (value: any) => {
  console.log('日期變更:', value);
  // 這裡可以觸發 API 呼叫或其他邏輯
};

const handleProductChange = (value: string) => {
  console.log('產品變更:', value);
  // 這裡可以觸發 API 呼叫或其他邏輯
};

const handleStatusChange = (value: string) => {
  console.log('狀態變更:', value);
  // 這裡可以觸發 API 呼叫或其他邏輯
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

.current-filters {
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