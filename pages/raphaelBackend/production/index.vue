<template>
  <!-- 共用 Alert -->
  <BaseAlert :show="showAlert" :message="alertMsg" @close="showAlert = false" />

  <!-- 開始製作確認彈窗 -->
  <transition name="fade">
    <div v-if="showStartModal" class="modal-overlay" @click="closeStartModal">
      <div class="modal-content" @click.stop>
        <div class="modal-body">
          <div class="modal-text">
            <div class="time-info">{{ startTime }} 開始製作</div>
            <div class="instruction">製作完成後</div>
            <div class="instruction">請點擊"製作完成"按鈕前往出貨</div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="close-btn" @click="closeStartModal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#B1C0D8"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <!-- 製作完成確認彈窗 -->
  <transition name="fade">
    <div v-if="showCompleteModal" class="modal-overlay" @click="closeCompleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-body">
          <div class="modal-text">
            <div class="time-info">{{ completeTime }} 製作完成</div>
            <div class="instruction">點擊下方按鈕前往出貨</div>
            <div class="instruction">或關閉繼續製作</div>
          </div>
          <div class="action-buttons">
            <button class="shipping-btn" @click="goToShipping">
              前往物流管理出貨
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <div class="close-btn" @click="closeCompleteModal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#B1C0D8"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <div class="dashboard">
    <Sidebar />

    <!-- ─────────────── Main Content ─────────────── -->
    <main class="content">
      <!-- page header -->
      <DataUpdateHeader
        title="生產管理"
        :count="store.total"
        count-unit="筆"
        :last-updated="store.lastUpdated"
        :is-loading="store.loading"
        @refresh="refreshData"
      />
      


      <!-- toolbar / filters -->
      <FilterToolbar
        v-model:search-value="store.keyword"
        v-model:status-value="store.statusFilter"
        :status-options="statusOptions"
        status-placeholder="狀態篩選"
        :show-product-filter="true"
        :show-date-picker="false"
        :product-options="store.productOptions"
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
          <div v-if="store.loading" class="loading-state" style="text-align: center; padding: 40px;">
            <div style="color: #666;">
              <div style="margin-bottom: 10px;">載入中...</div>
              <div style="font-size: 12px; color: #999;">正在取得生產資料</div>
            </div>
          </div>
          
          <!-- 無資料狀態 -->
          <div v-else-if="store.paginatedData.length === 0" class="empty-state" style="text-align: center; padding: 40px;">
            <div style="color: #666;">
              <div style="margin-bottom: 10px;">沒有找到符合條件的生產項目</div>
              <div style="font-size: 12px; color: #999;">請嘗試調整搜尋條件或篩選器</div>
            </div>
          </div>
          
          <!-- 資料列表 -->
          <template v-else>
            <div
              v-for="item in store.paginatedData"
              :key="item.SID"
              class="table-row"
            >
              <div class="cell order-number" data-label="訂單編號">
                #{{ item.SID }}
              </div>
              <div class="cell customer-name" data-label="訂購姓名">
                {{ item.Name }}
              </div>
              <div class="cell product-name" data-label="商品名稱">
                {{ item.ProductName }}
              </div>
              <div class="cell product-size" data-label="商品尺寸">
                {{ item.PdtSize }}
              </div>
              <div class="cell body-proportion" data-label="身材比例">
                {{ item.BodySize }}
              </div>
              <div class="cell status" data-label="目前進度">
                <div class="statusGroup">
                  <span 
                    class="status-tag"
                    :class="store.getStatusClass(item.State)"
                  >
                    {{ store.statusCodeMap[item.State] || item.StateName }}
                  </span>
                  <button 
                    v-if="item.State === '1' || item.State === '3'"
                    class="actionBtn startBtn"
                    @click="startProduction(item.SID)"
                    :title="`開始製作訂單 #${item.SID} (${item.StateName})`"
                  >
                    開始製作
                  </button>
                  <button 
                    v-else-if="item.State === '4'"
                    class="actionBtn completeBtn"
                    @click="completeProduction(item.SID)"
                    :title="`製作完成訂單 #${item.SID}`"
                  >
                    製作完成
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- pagination -->
        <nav class="pagination" v-if="store.totalPages > 1">
          <button
            class="btn-page"
            :disabled="store.page === 1"
            @click="store.gotoPage(1)"
          >
            &lt;&lt;
          </button>
          <button
            class="btn-page"
            :disabled="store.page === 1"
            @click="store.prevPage"
          >
            &lt;
          </button>
          
          <!-- 顯示頁碼 -->
          <template v-if="store.totalPages <= maxVisiblePages">
            <button
              v-for="p in store.totalPages"
              :key="p"
              class="btn-page btn-page-number"
              :class="{ active: store.page === p }"
              @click="store.gotoPage(p)"
            >
              {{ p }}
            </button>
          </template>
          
          <!-- 當頁數過多時，顯示省略號 -->
          <template v-else>
            <!-- 第一頁 -->
            <button
              class="btn-page btn-page-number"
              :class="{ active: store.page === 1 }"
              @click="store.gotoPage(1)"
            >
              1
            </button>
            
            <!-- 省略號 -->
            <span v-if="store.page > getEllipsisThreshold()" class="pagination-ellipsis">...</span>
            
            <!-- 中間頁碼 -->
            <button
              v-for="p in getVisiblePages()"
              :key="p"
              class="btn-page btn-page-number"
              :class="{ active: store.page === p }"
              @click="store.gotoPage(p)"
            >
              {{ p }}
            </button>
            
            <!-- 省略號 -->
            <span v-if="store.page < store.totalPages - getEllipsisThreshold()" class="pagination-ellipsis">...</span>
            
            <!-- 最後一頁 -->
            <button
              class="btn-page btn-page-number"
              :class="{ active: store.page === store.totalPages }"
              @click="store.gotoPage(store.totalPages)"
            >
              {{ store.totalPages }}
            </button>
          </template>
          
          <button
            class="btn-page"
            :disabled="store.page === store.totalPages"
            @click="store.nextPage"
          >
            &gt;
          </button>
          <button
            class="btn-page"
            :disabled="store.page === store.totalPages"
            @click="store.gotoPage(store.totalPages)"
          >
            &gt;&gt;
          </button>
        </nav>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseAlert from '@/components/raphaelBackend/BaseAlert.vue'
import Sidebar from '@/components/raphaelBackend/Sidebar.vue'
import DataUpdateHeader from '@/components/raphaelBackend/DataUpdateHeader.vue'
import FilterToolbar from '@/components/raphaelBackend/FilterToolbar.vue'
import { useProductionStore } from '~/stores/useProductionStore'

const router = useRouter()
const store = useProductionStore()

// 分頁設定
const maxVisiblePages = ref(7)

// Alert 控制
const showAlert = ref(false)
const alertMsg = ref('')
const fireAlert = (msg) => {
  alertMsg.value = msg
  showAlert.value = true
}

// 彈窗控制
const showStartModal = ref(false)
const showCompleteModal = ref(false)
const startTime = ref('')
const completeTime = ref('')
const currentItemSID = ref(null)

// 篩選選項
const statusOptions = [

  { label: "個人化資訊", value: "1" },
  { label: "待製作", value: "3" },
  { label: "製作中", value: "4" }
]

// 事件處理
const handleSearch = (value) => {
  store.setKeyword(value)
  store.fetchProductionData()
}

const handleProductFilter = (value) => {
  store.setProductFilter(value)
  store.fetchProductionData()
}

const handleStatusFilter = (value) => {
  store.setStatusFilter(value)
  store.fetchProductionData()
}

// 開始製作
const startProduction = async (sid) => {
  try {
    // 找到對應的項目以獲取 ProductID
    const item = store.productionData.find(item => item.SID === sid)
    if (!item) {
      fireAlert("找不到對應的訂單資料")
      return
    }

    // 調用開始製作 API
    const success = await store.startProductionAPI(sid, item.ProductID)
    
    if (success) {
      // API 成功後更新前端狀態
      store.updateProductionStatus(sid, "4")
      
      // 顯示開始製作彈窗
      currentItemSID.value = sid
      startTime.value = new Date().toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '/')
      
      showStartModal.value = true
    } else {
      fireAlert("開始製作失敗，請稍後再試")
    }
  } catch (error) {
    console.error("開始製作時發生錯誤:", error)
    fireAlert("開始製作失敗，請稍後再試")
  }
}



// 製作完成
const completeProduction = async (sid) => {
  try {
    // 找到對應的項目以獲取 ProductID
    const item = store.productionData.find(item => item.SID === sid)
    if (!item) {
      fireAlert("找不到對應的訂單資料")
      return
    }

    // 調用製作完成 API
    const success = await store.completeProductionAPI(sid, item.ProductID)
    
    if (success) {
      // API 成功後從列表中移除該筆資料
      store.removeProductionItem(sid)
      
      // 顯示製作完成彈窗
      currentItemSID.value = sid
      completeTime.value = new Date().toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '/')
      
      showCompleteModal.value = true
    } else {
      fireAlert("製作完成失敗，請稍後再試")
    }
  } catch (error) {
    console.error("製作完成時發生錯誤:", error)
    fireAlert("製作完成失敗，請稍後再試")
  }
}

// 關閉開始製作彈窗
const closeStartModal = () => {
  showStartModal.value = false
  currentItemSID.value = null
}

// 關閉製作完成彈窗
const closeCompleteModal = () => {
  showCompleteModal.value = false
  currentItemSID.value = null
}

// 前往物流管理出貨
const goToShipping = () => {
  // 這裡可以導航到物流管理頁面
  // router.push('/raphaelBackend/shipping')
  fireAlert('即將前往物流管理頁面')
  closeCompleteModal()
}

const refreshData = () => {
  try {
    store.fetchProductionData()
  } catch (error) {
    console.error("重新載入資料時發生錯誤:", error)
    fireAlert("重新載入資料失敗，請稍後再試")
  }
}

// 統計函數
const getStartableCount = () => {
  return store.filteredData.filter(item => item.State === '1' || item.State === '3').length
}

const getInProgressCount = () => {
  return store.filteredData.filter(item => item.State === '4').length
}

// 快速篩選狀態
const quickFilterType = ref('')

// 快速篩選函數
const quickFilterStartable = () => {
  if (quickFilterType.value === 'startable') {
    quickFilterType.value = ''
    store.setStatusFilter('')
  } else {
    quickFilterType.value = 'startable'
    store.setStatusFilter('1,3') // 個人化資訊和待製作
  }
}

const quickFilterInProgress = () => {
  if (quickFilterType.value === 'inProgress') {
    quickFilterType.value = ''
    store.setStatusFilter('')
  } else {
    quickFilterType.value = 'inProgress'
    store.setStatusFilter('4') // 製作中
  }
}

const isQuickFilterActive = (type) => {
  return quickFilterType.value === type
}

const clearAllFilters = () => {
  quickFilterType.value = ''
  store.setStatusFilter('')
  store.setKeyword('')
  store.setProductFilter('')
}

// 分頁工具函數
const getEllipsisThreshold = () => {
  return 3
}

const getVisiblePages = () => {
  const pages = []
  const threshold = getEllipsisThreshold()
  const maxVisible = maxVisiblePages.value
  
  if (store.page <= threshold + 1) {
    for (let i = 2; i <= Math.min(maxVisible - 1, store.totalPages - 1); i++) {
      pages.push(i)
    }
  } else if (store.page >= store.totalPages - threshold) {
    const start = Math.max(2, store.totalPages - maxVisible + 2)
    for (let i = start; i <= store.totalPages - 1; i++) {
      pages.push(i)
    }
  } else {
    const start = Math.max(2, store.page - 1)
    const end = Math.min(store.totalPages - 1, store.page + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }
  
  return pages
}

// 生命週期
onMounted(() => {
  store.fetchProductionData()
  store.fetchProductOptions()
})
</script>

<style scoped lang="scss">
@import "~/assets/styles/variables.scss";
@import "~/assets/styles/mixins.scss";

// 淡入淡出動畫
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

// 彈窗樣式
.modal-overlay {
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  background: rgba(177, 192, 216, 0.25);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  position: relative;
  min-width: 300px;
  max-width: 400px;
  width: 90%;
  border-radius: 20px;
  border: 3px solid #1ba39b;
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0px 2px 20px rgba(27, 163, 155, 0.25);
  backdrop-filter: blur(25px);
  padding: 1.25rem;
}

.modal-body {
  padding: 2rem;
  background-color: #fff;
  color: #6d8ab6;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.5px;
  border-radius: 20px;
  text-align: center;
  margin-bottom: 1rem;
}

.modal-text {
  .time-info {
    font-size: 18px;
    font-weight: 600;
    color: #2d3047;
    margin-bottom: 12px;
  }
  
  .instruction {
    font-size: 16px;
    color: #6d8ab6;
    margin-bottom: 8px;
    line-height: 1.4;
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  
  .shipping-btn {
    background: #1ba39b;
    border: none;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: 0.5px;
    
    &:hover {
      background: #00877f;
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: center;
  
  .close-btn {
    width: fit-content;
    margin: auto;
    border-radius: 20px;
    background: #fff;
    box-shadow: 0px 2px 20px rgba(27, 163, 155, 0.25);
    backdrop-filter: blur(25px);
    cursor: pointer;
    padding: 0.5rem;
    transition: all 0.2s ease;
    
    &:hover {
      box-shadow: inset 0px 2px 6px rgba(27, 163, 155, 0.25);
    }
    
    svg {
      width: 24px;
      height: 24px;
    }
  }
}

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
