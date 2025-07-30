<template>
  <div class="dashboard">
    <Sidebar />

    <!-- ─────────────── Main Content ─────────────── -->
    <main class="content">
      <!-- page header -->
      <DataUpdateHeader
        title="訂單管理"
        :count="totalOrders"
        count-unit="筆"
        :last-updated="lastUpdated"
        @refresh="refreshData"
      />

      <!-- toolbar / filters -->
      <FilterToolbar
        v-model:search-value="searchKeyword"
        v-model:date-value="dateRange"
        v-model:status-value="statusFilter"
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
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="table-row"
          >
            <div class="cell order-number" data-label="訂單編號">
              {{ order.orderNumber }}
            </div>
            <div class="cell customer-name" data-label="訂購姓名">
              {{ order.customerName }}
            </div>
            <div class="cell product-count" data-label="商品總數">
              {{ order.quantity }}
            </div>
            <div class="cell total-price" data-label="總價格">
              ${{ order.price.toLocaleString() }}
            </div>
            <div class="cell created-time" data-label="成立時間">
              {{ order.createdAt }}
            </div>
            <div class="cell status" data-label="訂單狀態">
              <span class="status-tag" :class="getStatusClass(order.status)">
                {{ order.status }}
              </span>
            </div>

            <div
              class="goInfo"
              @click="handleGoInfo(order)"
              role="button"
              tabindex="0"
            >
              <img src="/assets/imgs/backend/goNext.svg" alt="詳細" />
            </div>
          </div>
        </div>

        <!-- pagination -->
        <nav class="pagination">
          <button
            class="btn-page"
            :disabled="currentPage === 1"
            @click="gotoPage(1)"
          >
            &lt;&lt;
          </button>
          <button
            class="btn-page"
            :disabled="currentPage === 1"
            @click="prevPage"
          >
            &lt;
          </button>
          <button
            v-for="p in totalPages"
            :key="p"
            class="btn-page btn-page-number"
            :class="{ active: currentPage === p }"
            @click="gotoPage(p)"
          >
            {{ p }}
          </button>
          <button
            class="btn-page"
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            &gt;
          </button>
          <button
            class="btn-page"
            :disabled="currentPage === totalPages"
            @click="gotoPage(totalPages)"
          >
            &gt;&gt;
          </button>
        </nav>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Sidebar from "@/components/raphaelBackend/Sidebar.vue";
import DataUpdateHeader from "@/components/raphaelBackend/DataUpdateHeader.vue";
import FilterToolbar from "@/components/raphaelBackend/FilterToolbar.vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 響應式數據
const searchKeyword = ref("");
const dateRange = ref(null);
const statusFilter = ref("");
const totalOrders = ref(100);
const lastUpdated = ref("2025/01/27 14:30");

// 分頁相關
const currentPage = ref(1);
const pageSize = ref(10);

// 訂單介面定義
interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  productName: string;
  price: number;
  quantity: number;
  createdAt: string;
  status: string;
}

// 模擬訂單數據
const orders = ref<Order[]>([
  {
    id: 1,
    orderNumber: "#123456789",
    customerName: "王先生",
    productName: "腸胃衣",
    price: 38000,
    quantity: 1,
    createdAt: "2025/12/12 12:12",
    status: "未付款",
  },
  {
    id: 2,
    orderNumber: "#123456789",
    customerName: "王先生",
    productName: "腸胃衣",
    price: 38000,
    quantity: 1,
    createdAt: "2025/12/12 12:12",
    status: "個人化資訊",
  },
  {
    id: 3,
    orderNumber: "#123456789",
    customerName: "王先生",
    productName: "腸胃衣",
    price: 38000,
    quantity: 1,
    createdAt: "2025/12/12 12:12",
    status: "待製作",
  },
  {
    id: 4,
    orderNumber: "#123456789",
    customerName: "王先生",
    productName: "腸胃衣",
    price: 38000,
    quantity: 1,
    createdAt: "2025/12/12 12:12",
    status: "製作中",
  },
  {
    id: 5,
    orderNumber: "#123456789",
    customerName: "王先生",
    productName: "腸胃衣",
    price: 38000,
    quantity: 1,
    createdAt: "2025/12/12 12:12",
    status: "待出貨",
  },
  {
    id: 6,
    orderNumber: "#123456789",
    customerName: "王先生",
    productName: "腸胃衣",
    price: 38000,
    quantity: 1,
    createdAt: "2025/12/12 12:12",
    status: "已出貨",
  },
]);

// 狀態篩選選項
const statusOptions = [
  { label: "全部狀態", value: "" },
  { label: "未付款", value: "未付款" },
  { label: "個人化資訊", value: "個人化資訊" },
  { label: "待製作", value: "待製作" },
  { label: "製作中", value: "製作中" },
  { label: "待出貨", value: "待出貨" },
  { label: "已出貨", value: "已出貨" },
  { label: "退貨申請", value: "退貨申請" },
  { label: "退貨處理", value: "退貨處理" },
  { label: "退貨完成", value: "退貨完成" },
  { label: "退款完成", value: "退款完成" },
];

// 計算屬性：篩選後的訂單
const filteredOrders = computed(() => {
  let filtered = orders.value;

  // 關鍵字搜尋
  if (searchKeyword.value) {
    filtered = filtered.filter(
      (order: Order) =>
        order.orderNumber.includes(searchKeyword.value) ||
        order.customerName.includes(searchKeyword.value) ||
        order.productName.includes(searchKeyword.value)
    );
  }

  // 狀態篩選
  if (statusFilter.value) {
    filtered = filtered.filter(
      (order: Order) => order.status === statusFilter.value
    );
  }

  return filtered;
});

// 分頁計算
const totalPages = computed(() =>
  Math.ceil(filteredOrders.value.length / pageSize.value)
);

// 方法
const handleSearch = (value: string) => {
  searchKeyword.value = value;
};

const handleDateChange = (dates: any) => {
  console.log("日期範圍變更:", dates);
  // 這裡可以根據日期範圍篩選訂單
};

const handleStatusFilter = (value: string) => {
  statusFilter.value = value;
};

const refreshData = () => {
  // 重新載入數據
  lastUpdated.value = new Date().toLocaleString("zh-TW");
};

const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    未付款: "status-red",
    個人化資訊: "status-green",
    待製作: "status-red",
    製作中: "status-green",
    待出貨: "status-green",
    已出貨: "status-blue",
    已退貨: "status-red",
    退貨處理: "status-red",
    退貨完成: "status-red",
    退款完成: "status-red",
  };
  return statusMap[status] || "status-default";
};

const handleGoInfo = (order: Order) => {
  console.log("點擊了 goNext 圖標", order);
  // 導航到訂單詳情頁面
  router.push(`/raphaelBackend/order/${order.id}`);
};

// 分頁方法
const gotoPage = (page: number) => {
  currentPage.value = page;
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

onMounted(() => {
  // 頁面載入時的初始化
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
  }
}
</style>
