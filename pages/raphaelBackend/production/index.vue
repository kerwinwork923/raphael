<template>
  <!-- 共用 Alert -->
  <BaseAlert :show="showAlert" :message="alertMsg" @close="showAlert = false" />

  <div class="dashboard">
    <Sidebar />

    <!-- ─────────────── Main Content ─────────────── -->
    <main class="content">
      <!-- page header -->
      <DataUpdateHeader
        title="生產管理"
        :count="totalRecords"
        count-unit="筆"
        :last-updated="lastUpdated"
        @refresh="refreshData"
      />

      <!-- toolbar / filters -->
      <FilterToolbar
        v-model:search-value="searchKeyword"
        v-model:status-value="statusFilter"
        :status-options="statusOptions"
        status-placeholder="狀態篩選"
        :show-product-filter="true"
        :show-date-picker="false"
        :product-options="productOptions"
        product-placeholder="商品篩選"
        @search="handleSearch"
        @status-change="handleStatusFilter"
        @product-change="handleProductFilter"
      />

      <!-- data table -->
      <section class="production-table">
        <!-- header row -->
        <div class="table-row table-header">
          <div class="order-number">訂單編號</div>
          <div class="customer-name">訂購姓名</div>
          <div class="product-name">商品名稱</div>
          <div class="product-size">商品尺寸</div>
          <div class="body-proportion">身材比例</div>
          <div class="status">目前進度</div>
        </div>

        <!-- data rows -->
        <div class="table-list">
          <!-- 載入中狀態 -->
          <div v-if="loading" class="loading-state" style="text-align: center; padding: 40px;">
            <div style="color: #666;">載入中...</div>
          </div>
          
          <!-- 無資料狀態 -->
          <div v-else-if="paginatedData.length === 0" class="empty-state" style="text-align: center; padding: 40px;">
            <div style="color: #666;">沒有找到符合條件的生產項目</div>
          </div>
          
          <!-- 資料列表 -->
          <!-- <template v-else>
            <div
              v-for="item in paginatedData"
              :key="item.id"
              class="table-row"
            >
              <div class="cell order-number" data-label="訂單編號">
                {{ item.orderNumber }}
              </div>
              <div class="cell customer-name" data-label="訂購姓名">
                {{ item.customerName }}
              </div>
              <div class="cell product-name" data-label="商品名稱">
                {{ item.productName }}
              </div>
              <div class="cell product-size" data-label="商品尺寸">
                {{ item.productSize }}
              </div>
              <div class="cell body-proportion" data-label="身材比例">
                {{ item.bodyProportion }}
              </div>
              <div class="cell status" data-label="目前進度">
                <div class="statusGroup">
                  <span 
                    class="status-tag"
                    :class="getStatusClass(item.status)"
                  >
                    {{ item.status }}
                  </span>
                  <button 
                    v-if="item.status === '待製作'"
                    class="actionBtn startBtn"
                    @click="startProduction(item.id)"
                  >
                    開始製作
                  </button>
                  <button 
                    v-else-if="item.status === '製作中'"
                    class="actionBtn completeBtn"
                    @click="completeProduction(item.id)"
                  >
                    製作完成
                  </button>
                </div>
              </div>
            </div>
          </template> -->
        </div>

        <!-- pagination -->
        <nav class="pagination" v-if="totalPages > 1">
          <button
            class="btn-page"
            :disabled="currentPage === 1"
            @click="changePage(1)"
          >
            &lt;&lt;
          </button>
          <button
            class="btn-page"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            &lt;
          </button>
          
          <!-- 顯示頁碼 -->
          <template v-if="totalPages <= maxVisiblePages">
            <button
              v-for="p in totalPages"
              :key="p"
              class="btn-page btn-page-number"
              :class="{ active: currentPage === p }"
              @click="changePage(p)"
            >
              {{ p }}
            </button>
          </template>
          
          <!-- 當頁數過多時，顯示省略號 -->
          <template v-else>
            <!-- 第一頁 -->
            <button
              class="btn-page btn-page-number"
              :class="{ active: currentPage === 1 }"
              @click="changePage(1)"
            >
              1
            </button>
            
            <!-- 省略號 -->
            <span v-if="currentPage > getEllipsisThreshold()" class="pagination-ellipsis">...</span>
            
            <!-- 中間頁碼 -->
            <button
              v-for="p in getVisiblePages()"
              :key="p"
              class="btn-page btn-page-number"
              :class="{ active: currentPage === p }"
              @click="changePage(p)"
            >
              {{ p }}
            </button>
            
            <!-- 省略號 -->
            <span v-if="currentPage < totalPages - getEllipsisThreshold()" class="pagination-ellipsis">...</span>
            
            <!-- 最後一頁 -->
            <button
              class="btn-page btn-page-number"
              :class="{ active: currentPage === totalPages }"
              @click="changePage(totalPages)"
            >
              {{ totalPages }}
            </button>
          </template>
          
          <button
            class="btn-page"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            &gt;
          </button>
          <button
            class="btn-page"
            :disabled="currentPage === totalPages"
            @click="changePage(totalPages)"
          >
            &gt;&gt;
          </button>
        </nav>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseAlert from '@/components/raphaelBackend/BaseAlert.vue'
import Sidebar from '@/components/raphaelBackend/Sidebar.vue'
import DataUpdateHeader from '@/components/raphaelBackend/DataUpdateHeader.vue'
import FilterToolbar from '@/components/raphaelBackend/FilterToolbar.vue'

// 響應式資料
const searchKeyword = ref('')
const productFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const loading = ref(false)

// 分頁設定
const maxVisiblePages = ref(7)

// Alert 控制
const showAlert = ref(false)
const alertMsg = ref('')
const fireAlert = (msg) => {
  alertMsg.value = msg
  showAlert.value = true
}

// 最後更新時間
const lastUpdated = ref(new Date().toLocaleString('zh-TW'))

// 篩選選項
const productOptions = [
  { label: "護您穩1型", value: "護您穩1型" },
  { label: "護您穩2型", value: "護您穩2型" },
  { label: "護您穩3型", value: "護您穩3型" }
]

const statusOptions = [
  { label: "待製作", value: "待製作" },
  { label: "製作中", value: "製作中" },
  { label: "製作完成", value: "製作完成" }
]

// 模擬資料 - 將訂購姓名拆分為訂單編號和客戶姓名
const productionData = ref([
  {
    id: 1,
    orderNumber: '#00000001',
    customerName: '王先生',
    productName: '護您穩1型(XXXXX) L',
    productSize: '35cm',
    bodyProportion: '35cm',
    status: '待製作'
  },
  {
    id: 2,
    orderNumber: '#00000002',
    customerName: '李小姐',
    productName: '護您穩1型(XXXXX) M',
    productSize: '32cm',
    bodyProportion: '32cm',
    status: '製作中'
  },
  {
    id: 3,
    orderNumber: '#00000003',
    customerName: '張先生',
    productName: '護您穩1型(XXXXX) L',
    productSize: '35cm',
    bodyProportion: '35cm',
    status: '製作中'
  },
  {
    id: 4,
    orderNumber: '#00000004',
    customerName: '陳小姐',
    productName: '護您穩1型(XXXXX) S',
    productSize: '30cm',
    bodyProportion: '30cm',
    status: '製作中'
  },
  {
    id: 5,
    orderNumber: '#00000005',
    customerName: '林先生',
    productName: '護您穩1型(XXXXX) L',
    productSize: '35cm',
    bodyProportion: '35cm',
    status: '製作中'
  }
])

// 篩選後的資料
const filteredData = computed(() => {
  let filtered = productionData.value

  // 關鍵字搜尋
  if (searchKeyword.value) {
    filtered = filtered.filter(item => 
      item.orderNumber.includes(searchKeyword.value) ||
      item.customerName.includes(searchKeyword.value) ||
      item.productName.includes(searchKeyword.value)
    )
  }

  // 商品篩選
  if (productFilter.value) {
    filtered = filtered.filter(item => 
      item.productName.includes(productFilter.value)
    )
  }

  // 狀態篩選
  if (statusFilter.value) {
    filtered = filtered.filter(item => 
      item.status === statusFilter.value
    )
  }

  return filtered
})

// 分頁計算
const totalRecords = computed(() => filteredData.value.length)
const totalPages = computed(() => Math.ceil(totalRecords.value / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalRecords.value))

// 當前頁面資料
const paginatedData = computed(() => {
  return filteredData.value.slice(startIndex.value, endIndex.value)
})

// 狀態樣式
const getStatusClass = (status) => {
  switch (status) {
    case '待製作':
      return 'status-red'
    case '製作中':
      return 'status-green'
    case '製作完成':
      return 'status-blue'
    default:
      return 'status-default'
  }
}

// 事件處理
const handleSearch = (value) => {
  searchKeyword.value = value
  currentPage.value = 1
}

const handleProductFilter = (value) => {
  productFilter.value = value
  currentPage.value = 1
}

const handleStatusFilter = (value) => {
  statusFilter.value = value
  currentPage.value = 1
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const startProduction = (id) => {
  const item = productionData.value.find(item => item.id === id)
  if (item) {
    item.status = '製作中'
    fireAlert('已開始製作')
  }
}

const completeProduction = (id) => {
  const item = productionData.value.find(item => item.id === id)
  if (item) {
    item.status = '製作完成'
    fireAlert('製作已完成')
  }
}

const refreshData = () => {
  loading.value = true
  // 模擬載入
  setTimeout(() => {
    lastUpdated.value = new Date().toLocaleString('zh-TW')
    loading.value = false
  }, 1000)
}

// 分頁工具函數
const getEllipsisThreshold = () => {
  return 3
}

const getVisiblePages = () => {
  const pages = []
  const threshold = getEllipsisThreshold()
  const maxVisible = maxVisiblePages.value
  
  if (currentPage.value <= threshold + 1) {
    for (let i = 2; i <= Math.min(maxVisible - 1, totalPages.value - 1); i++) {
      pages.push(i)
    }
  } else if (currentPage.value >= totalPages.value - threshold) {
    const start = Math.max(2, totalPages.value - maxVisible + 2)
    for (let i = start; i <= totalPages.value - 1; i++) {
      pages.push(i)
    }
  } else {
    const start = Math.max(2, currentPage.value - 1)
    const end = Math.min(totalPages.value - 1, currentPage.value + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }
  
  return pages
}

// 生命週期
onMounted(() => {
  // 可以在這裡載入實際資料
})
</script>

<style scoped lang="scss">
@import "~/assets/styles/variables.scss";
@import "~/assets/styles/mixins.scss";

.dashboard {
  display: flex;
  height: 100vh;
  background: $primary-100;
}

/* ─────────────── Main Content ─────────────── */
.content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  padding: 1rem;
  overflow-y: auto;

  @include respond-to("xl") {
    padding: 16px 16px;
  }

  .production-table {
    display: flex;
    flex-direction: column;
    flex: 1;
    border: 1px solid $border;
    border-radius: 8px;
    overflow: hidden;
    border-radius: 20px;
    background: $raphael-white;
    box-shadow: 0px 2px 20px 0px
      var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    
    .table-list {
      display: grid;
      grid-template-rows: repeat(auto-fill, minmax(min-content, 91px));
      flex: 1;
      height: 0;
      overflow: hidden;
      overflow-y: scroll;
      @include scrollbarStyle();
    }
    
    .table-row {
      display: grid;
      grid-template-columns: 0.8fr 0.8fr 1.5fr 0.6fr 0.6fr 1.2fr;
      position: relative;
      gap: 2px;
      align-items: center;
      padding: 13px 24px;
      color: $raphael-gray-500;
      transition: all ease 0.2s;

      &:hover {
        color: $raphael-cyan-500;
      }

      @include respond-to("lg") {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 16px;
        gap: 0.75rem;
        border-bottom: 1px solid $raphael-gray-300;
        position: relative;
      }

      & + .table-row {
        border-top: 1px solid $raphael-gray-300;
      }
      
      &.table-header {
        font-weight: 600;
        white-space: nowrap;
        color: $primary-600;
        @include respond-to("lg") {
          display: none;
        }
      }
      
      .cell {
        width: auto;
        font-size: 1rem;
        font-style: normal;
        font-weight: 400;
        line-height: 100%;
        letter-spacing: var(--Title-Medium-Tracking, 0.15px);

        @include respond-to("lg") {
          display: flex;
          justify-content: space-between;
          flex-direction: column;
          gap: 0.25rem;
          width: 100%;
          text-align: left;
          font-weight: 600;
          font-size: 1.5rem;
          color: #2d3047;

          &::before {
            content: attr(data-label);
            font-size: 1rem;
            font-weight: normal;
            color: $raphael-gray-500;
          }
        }

        &.status {
          .statusGroup {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            width: 100%;
          }
        }
      }
    }
  }

  .status-tag {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    min-width: 80px;

    &.status-red {
      background: rgba($raphael-red-300, 0.1);
      color: $raphael-red-300;
      border: 1px solid $raphael-red-300;
    }

    &.status-green {
      background: rgba($raphael-green-400, 0.1);
      color: $raphael-green-400;
      border: 1px solid $raphael-green-400;
    }

    &.status-blue {
      background: rgba($raphael-cyan-500, 0.1);
      color: $raphael-cyan-500;
      border: 1px solid $raphael-cyan-500;
    }

    &.status-default {
      background: rgba($raphael-gray-400, 0.1);
      color: $raphael-gray-400;
      border: 1px solid $raphael-gray-400;
    }
  }

  .actionBtn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    
    &.startBtn {
      background-color: $raphael-red-300;
      color: white;
      
      &:hover {
        background-color: darken($raphael-red-300, 10%);
      }
    }
    
    &.completeBtn {
      background-color: $raphael-green-400;
      color: white;
      
      &:hover {
        background-color: darken($raphael-green-400, 10%);
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-top: 12px;
    margin-bottom: 24px;
    @include respond-to("lg") {
      gap: 2px;
    }
    
    .btn-page {
      padding: 6px 10px;
      min-width: 32px;
      border-radius: 4px;
      background-color: transparent;
      cursor: pointer;
      border: none;
      
      &.active {
        background: $raphael-cyan-500;
        color: white;
        border-color: $raphael-cyan-500;
      }
      
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .btn-page-number {
      background: white;
    }
    
    .pagination-ellipsis {
      padding: 6px 10px;
      color: $raphael-gray-500;
      font-weight: 500;
    }
  }

  // 載入和空狀態樣式
  .loading-state,
  .empty-state {
    font-size: 14px;
    
    div {
      color: #666;
    }
  }
}
</style>
