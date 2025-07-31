<template>
  <div class="dashboard">
    <Sidebar />

    <!-- ─────────────── Main Content ─────────────── -->
    <main class="content">
      <!-- page header -->
      <DataUpdateHeader
        title="訂單管理"
        :count="store.total"
        count-unit="筆"
        :last-updated="store.lastUpdated"
        :is-loading="store.loading"
        @refresh="refreshData"
      />

      <!-- toolbar / filters -->
      <FilterToolbar
        v-model:search-value="store.keyword"
        v-model:date-value="dateValue"
        v-model:status-value="store.statusFilter"
        :status-options="statusOptions"
        date-placeholder="日期查詢"
        status-placeholder="狀態篩選"
        :show-product-filter="false"
        @search="handleSearch"
        @date-change="handleDateChange"
        @status-change="handleStatusFilter"
      />



      <!-- data table -->
      <section class="order-table">
        <!-- header row -->
        <div class="table-row table-header">
          <div class="order-number">訂單編號</div>
          <div class="customer-name">訂購姓名</div>
          <div class="product-count">商品總數</div>
          <div class="total-price">總價格</div>
          <div class="created-time">成立時間</div>
          <div class="status">訂單狀態</div>
        </div>

        <!-- data rows -->
        <div class="table-list">
          <!-- 載入中狀態 -->
          <div v-if="store.loading" class="loading-state" style="text-align: center; padding: 40px;">
            <div style="color: #666;">載入中...</div>
          </div>
          
          <!-- 無資料狀態 -->
          <div v-else-if="store.paginatedOrders.length === 0" class="empty-state" style="text-align: center; padding: 40px;">
            <div style="color: #666;">沒有找到符合條件的訂單</div>
          </div>
          
          <!-- 資料列表 -->
                      <template v-else>
              <div
                v-for="order in store.paginatedOrders"
                :key="order.SID"
                class="table-row"
              >
                <div class="cell order-number" data-label="訂單編號">
                  #{{ order.SID }}
                </div>
                <div class="cell customer-name" data-label="訂購姓名">
                  {{ order.Name }}
                </div>
                <div class="cell product-count" data-label="商品總數">
                  {{ order.CNT }}
                </div>
                <div class="cell total-price" data-label="總價格">
                  ${{ parseInt(order.TotalAmount).toLocaleString() }}
                </div>
                <div class="cell created-time" data-label="成立時間">
                  {{ order.CheckTime }}
                </div>
                <div class="cell status" data-label="訂單狀態">
                  <span class="status-tag" :class="store.getStatusClass(order.State)">
                    {{ store.statusCodeMap[order.State] || order.StateName }}
                  </span>
                </div>

                <div
                  class="goInfo"
                  @click="handleGoInfo(order)"
                  @keydown.enter="handleGoInfo(order)"
                  @keydown.space="handleGoInfo(order)"
                  role="button"
                  tabindex="0"
                  :title="`查看訂單 #${order.SID} 詳細資訊`"
                >
                  <img src="/assets/imgs/backend/goNext.svg" alt="詳細" />
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

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from "vue";
import Sidebar from "@/components/raphaelBackend/Sidebar.vue";
import DataUpdateHeader from "@/components/raphaelBackend/DataUpdateHeader.vue";
import FilterToolbar from "@/components/raphaelBackend/FilterToolbar.vue";
import { useRouter } from "vue-router";
import { useOrderListStore } from "~/stores/useOrderListStore";

const router = useRouter();
const store = useOrderListStore();

// 常量定義
const DATE_FORMAT = 'yyyyMMdd';
const DATE_DISPLAY_FORMAT = 'yyyy/MM/dd';

// 工具函數
const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const parseStringToDate = (dateStr: string): Date => {
  if (!dateStr || dateStr.length !== 8) {
    throw new Error(`無效的日期格式: ${dateStr}`);
  }
  
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) {
    throw new Error(`無效的日期: ${dateStr}`);
  }
  
  return date;
};

// 響應式螢幕尺寸檢測
const isMobile = ref(false);

// 根據螢幕尺寸決定最大可見頁數
const maxVisiblePages = computed(() => isMobile.value ? 5 : 7);

// 檢測螢幕尺寸
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768;
};

// 防抖函數
const debounce = (func: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// 防抖的螢幕尺寸檢測
const debouncedCheckScreenSize = debounce(checkScreenSize, 250);

// 狀態篩選選項 (對應 API 狀態代碼)
const statusOptions = [
  { label: "全部狀態", value: "" },
  { label: "未付款", value: "0" },
  { label: "個人化資訊", value: "1" },
  { label: "待製作", value: "3" },
  { label: "製作中", value: "4" },
  { label: "待出貨", value: "5" },
  { label: "已出貨", value: "6" },
  { label: "已簽收", value: "7" },
  { label: "退貨申請", value: "8" },
  { label: "退貨處理", value: "9" },
  { label: "退貨完成", value: "A" },
  { label: "退款完成", value: "B" },
];

// 方法
const handleSearch = (value: string) => {
  store.setKeyword(value);
  store.fetchOrders();
};

const handleDateChange = (dates: Date[] | null) => {
  console.log("日期範圍變更:", dates);
  
  try {
    if (dates && Array.isArray(dates) && dates.length === 2 && dates[0] && dates[1]) {
      // 驗證日期物件
      if (!(dates[0] instanceof Date) || isNaN(dates[0].getTime()) ||
          !(dates[1] instanceof Date) || isNaN(dates[1].getTime())) {
        throw new Error("無效的日期物件");
      }
      
      const startDate = formatDateToString(dates[0]);
      const endDate = formatDateToString(dates[1]);
      
      console.log("轉換後的日期:", { startDate, endDate });
      
      store.setDateRange({
        start: startDate,
        end: endDate
      });
      
      // 更新 URL 參數
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('startDate', startDate);
        url.searchParams.set('endDate', endDate);
        window.history.replaceState({}, '', url.toString());
      } catch (urlError) {
        console.warn("更新 URL 參數失敗:", urlError);
      }
    } else {
      console.log("清除日期篩選");
      store.setDateRange(null);
      
      // 清除 URL 參數
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('startDate');
        url.searchParams.delete('endDate');
        window.history.replaceState({}, '', url.toString());
      } catch (urlError) {
        console.warn("清除 URL 參數失敗:", urlError);
      }
    }
    
    store.fetchOrders();
  } catch (error) {
    console.error("處理日期變更時發生錯誤:", error);
    // 可以考慮顯示用戶友好的錯誤訊息
  }
};

/**
 * 將 store 中的日期範圍轉換為 VueDatePicker 可用的格式
 * 將 yyyyMMdd 格式的字符串轉換為 Date 物件陣列
 */
const dateValue = computed(() => {
  if (!store.dateRange || !store.dateRange.start || !store.dateRange.end) {
    return null;
  }
  
  try {
    const startDate = parseStringToDate(store.dateRange.start);
    const endDate = parseStringToDate(store.dateRange.end);
    
    // 確保開始日期不晚於結束日期
    if (startDate > endDate) {
      console.warn("開始日期晚於結束日期，交換日期順序");
      return [endDate, startDate];
    }
    
    return [startDate, endDate];
  } catch (error) {
    console.error("日期解析錯誤:", error);
    return null;
  }
});

const handleStatusFilter = (value: string) => {
  store.setStatusFilter(value);
  store.fetchOrders();
};



const refreshData = () => {
  // 保存當前的篩選條件
  const currentKeyword = store.keyword;
  const currentDateRange = store.dateRange;
  const currentStatusFilter = store.statusFilter;
  
  // 清除資料
  store.clear();
  
  // 恢復篩選條件
  store.setKeyword(currentKeyword);
  if (currentDateRange) {
    store.setDateRange(currentDateRange);
  }
  store.setStatusFilter(currentStatusFilter);
  
  // 重新載入資料
  store.fetchOrders();
};

const handleGoInfo = (order: any) => {
  console.log("點擊了 goNext 圖標", order);
  // 導航到訂單詳情頁面
  router.push(`/raphaelBackend/order/${order.SID}`);
};

// 取得省略號閾值
const getEllipsisThreshold = () => {
  return isMobile.value ? 2 : 3;
};

// 取得可見的頁碼範圍
const getVisiblePages = () => {
  const pages = [];
  const threshold = getEllipsisThreshold();
  const maxVisible = maxVisiblePages.value;
  
  if (store.page <= threshold + 1) {
    // 如果當前頁在前幾頁，顯示2到最大可見頁數-1
    for (let i = 2; i <= Math.min(maxVisible - 1, store.totalPages - 1); i++) {
      pages.push(i);
    }
  } else if (store.page >= store.totalPages - threshold) {
    // 如果當前頁在後幾頁，顯示 totalPages-最大可見頁數+2 到 totalPages-1
    const start = Math.max(2, store.totalPages - maxVisible + 2);
    for (let i = start; i <= store.totalPages - 1; i++) {
      pages.push(i);
    }
  } else {
    // 中間頁面，顯示當前頁前後各1頁
    const start = Math.max(2, store.page - 1);
    const end = Math.min(store.totalPages - 1, store.page + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }
  
  return pages;
};

onMounted(() => {
  try {
    // 初始化螢幕尺寸檢測
    checkScreenSize();
    
    // 監聽視窗大小變化（使用防抖）
    window.addEventListener('resize', debouncedCheckScreenSize);
    
    // 檢查 URL 參數中是否有日期範圍
    const urlParams = new URLSearchParams(window.location.search);
    const startDate = urlParams.get('startDate');
    const endDate = urlParams.get('endDate');
    
    if (startDate && endDate) {
      console.log("從 URL 參數中發現日期範圍:", { startDate, endDate });
      store.setDateRange({ start: startDate, end: endDate });
    }
    
    // 載入訂單資料
    store.fetchOrders();
    
    // 如果有日期範圍，確保日期查詢欄位能正確顯示
    if (store.dateRange && store.dateRange.start && store.dateRange.end) {
      console.log("初始化時發現日期範圍:", store.dateRange);
    }
  } catch (error) {
    console.error("組件初始化時發生錯誤:", error);
  }
});

onUnmounted(() => {
  // 移除事件監聽器
  window.removeEventListener('resize', debouncedCheckScreenSize);
});
</script>

<style scoped lang="scss">
@import "~/assets/styles/variables.scss";
@import "~/assets/styles/mixins.scss";

// you can replace colors with variables / mixins defined in your project

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

  .order-table {
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
      grid-template-columns: 1fr 1fr 0.5fr 1fr 1fr 1fr auto;
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
        line-height: 100%; /* 20px */
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

        &.action {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          width: auto;
          margin-left: auto;
        }
      }
      .goInfo {
        position: absolute;
        top: 50%;
        right: 12px;
        transform: translateY(-50%);
        cursor: pointer;
        transition: all 0.25s ease;
        &:hover {
          border-radius: 50%;
          box-shadow: inset 0px 2px 6px -1px $primary-200;
        }
        @include respond-to("lg") {
          top: 29px;
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

  .action-menu {
    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;

      &:hover {
        background: $raphael-gray-200;
      }

      i {
        font-size: 16px;
        color: $raphael-gray-500;
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
