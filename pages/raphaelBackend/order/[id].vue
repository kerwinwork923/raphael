<template>
  <div class="dashboard">
    <Sidebar />

    <!-- ─────────────── Main Content ─────────────── -->
    <main class="content">
      <!-- page header -->
      <div class="page-header">
        <h1>#{{ orderId }} 訂單詳情</h1>

        <button class="back-btn" @click="goBack">
          <img src="/assets/imgs/backend/back.svg" alt="" />
          <h6>返回</h6>
        </button>
      </div>

      <!-- order items table -->
      <section class="order-items-table">
        <!-- Loading 效果 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>載入中...</p>
        </div>

        <!-- 內容區域 -->
        <template v-else>
          <!-- header row -->
          <div class="table-row table-header">
            <div class="product-name">商品名稱</div>
            <div class="product-price">商品價格</div>
            <div class="quantity">購買數量</div>
            <div class="size">商品尺寸</div>
            <div class="height-weight">身高體重</div>
            <div class="body-size">身材尺寸</div>
            <div class="progress">目前進度</div>
          </div>

          <!-- data rows -->
          <div class="table-list">
            <div v-for="item in orderItems" :key="item.ProductID" class="table-row">
              <div class="cell product-name" data-label="商品名稱">
                {{ item.ProductName }}
              </div>
              <div class="cell product-price" data-label="商品價格">
                ${{ parseInt(item.Amount).toLocaleString() }}
              </div>
              <div class="cell quantity" data-label="購買數量">
                {{ item.Qty }}
              </div>
              <div class="cell size" data-label="商品尺寸">
                {{ item.PdtSize || "---" }}
              </div>
              <div class="cell height-weight" data-label="身高體重">
                {{ item.Height && item.Weight ? `${item.Height}cm, ${item.Weight}kg` : "---" }}
              </div>
              <div class="cell body-size" data-label="身材尺寸">
                {{ item.BodySize || "---" }}
              </div>
              <div class="cell progress" data-label="目前進度">
                <span class="status-tag" :class="getStatusClass(item.State)">
                  {{ item.StateName }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </section>
    </main>

    <!-- orderBar -->
    <div
      v-show="showOrderBar"
      class="orderBar"
      :class="{
        'orderBar--show': showOrderBar,
        'orderBar--expanded': orderBarExpanded,
      }"
    >
      <div class="orderBarImg">
        <img
          v-show="!orderBarExpanded"
          src="/assets/imgs/backend/orderBarButton.svg"
          class="orderBarImgButton"
          @click="expandOrderBar"
        />

        <img
          v-show="orderBarExpanded"
          class="orderBarImgClose"
          src="/assets/imgs/backend/orderClose.svg"
          @click="collapseOrderBar"
        />
      </div>
      <div class="orderBarContent">
        <!-- 未展開時顯示的基本資訊 -->
        <div class="orderBarInfo" v-show="!orderBarExpanded">
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              訂單狀態
            </div>
            <div class="orderBarInfoItemValue orderBarInfoItemValueRed">
              {{ orderInfo?.StateName || "載入中..." }}
            </div>
          </div>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              訂單編號
            </div>
            <div class="orderBarInfoItemValue">#{{ orderInfo?.SID || orderId }}</div>
          </div>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              成立時間
            </div>
            <div class="orderBarInfoItemValue">{{ orderInfo?.CheckTime || "載入中..." }}</div>
          </div>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              發票類型
            </div>
            <div class="orderBarInfoItemValue">{{ orderInfo?.InvoiceIDName || "載入中..." }}</div>
          </div>
          <div class="orderBarInfoHR"></div>
          <div class="orderBarInfoItem2">
            <div class="orderBarInfoItemTitle">總金額</div>
            <div class="orderBarInfoItemValue">
              ${{ totalAmount.toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- 展開時顯示的完整資訊 -->
        <div
          v-show="orderBarExpanded"
          class="orderBarInfo orderBarInfo--fade"
          style="animation-delay: 0.1s"
        >
          <h3>訂單資訊</h3>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              訂單狀態
            </div>
            <div class="orderBarInfoItemValue orderBarInfoItemValueRed">
              {{ orderInfo?.StateName || "載入中..." }}
            </div>
          </div>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              訂單編號
            </div>
            <div class="orderBarInfoItemValue">#{{ orderInfo?.SID || orderId }}</div>
          </div>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              成立時間
            </div>
            <div class="orderBarInfoItemValue">{{ orderInfo?.CheckTime || "載入中..." }}</div>
          </div>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              發票類型
            </div>
            <div class="orderBarInfoItemValue">{{ orderInfo?.InvoiceIDName || "載入中..." }}</div>
          </div>
        </div>

        <div
          v-show="orderBarExpanded"
          class="orderBarInfo orderBarInfo--fade"
          style="animation-delay: 0.2s"
        >
          <h3>基本資料</h3>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              姓名
            </div>
            <div class="orderBarInfoItemValue">{{ orderInfo?.RName || "載入中..." }}</div>
          </div>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              電話
            </div>
            <div class="orderBarInfoItemValue">{{ orderInfo?.RMobile || "載入中..." }}</div>
          </div>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              付款方式
            </div>
            <div class="orderBarInfoItemValue">{{ orderInfo?.PayTypeName || "載入中..." }}</div>
          </div>
        </div>

        <div
          v-show="orderBarExpanded"
          class="orderBarInfo orderBarInfo--fade"
          style="animation-delay: 0.3s"
        >
          <h3>商品資訊</h3>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              商品總數
            </div>
            <div class="orderBarInfoItemValue">{{ orderInfo?.CNT || orderItems.length }}</div>
          </div>
          <div class="orderBarInfoHR"></div>
          <div class="orderBarInfoItem2">
            <div class="orderBarInfoItemTitle">總金額</div>
            <div class="orderBarInfoItemValue">
              ${{ totalAmount.toLocaleString() }}
            </div>
          </div>
        </div>

        <div
          v-show="orderBarExpanded && orderInfo?.BackReason"
          class="orderBarInfo orderBarInfo--fade"
          style="animation-delay: 0.4s"
        >
          <h3>退貨原因</h3>
          <div class="orderBarInfoContent">
            {{ orderInfo?.BackReason || "無退貨原因" }}
          </div>
        </div>

        <div
          v-show="orderBarExpanded"
          class="orderBarInfo orderBarInfo--fade"
          style="animation-delay: 0.5s"
        >
          <h3>配送資訊</h3>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              配送方式
            </div>
            <div class="orderBarInfoItemValue">
              {{ orderInfo?.DeliverTypeName || "載入中..." }}
            </div>
          </div>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              收件地址
            </div>
            <div class="orderBarInfoItemValue">
              {{ orderInfo?.Address || "載入中..." }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Sidebar from "@/components/raphaelBackend/Sidebar.vue";
import axios from "axios";

const route = useRoute();
const router = useRouter();

// 獲取訂單ID
const orderId = route.params.id as string;

// orderBar 控制
const showOrderBar = ref(true);
const orderBarExpanded = ref(false);

// 響應式數據
const loading = ref(false);
const orderInfo = ref<OrderInfo | null>(null);
const orderItems = ref<OrderItem[]>([]);

// 從 localStorage 獲取認證資訊
const token = ref(localStorage.getItem("backendToken") || sessionStorage.getItem("backendToken"));
const adminID = ref(localStorage.getItem("adminID") || sessionStorage.getItem("adminID"));

// 訂單商品介面定義
interface OrderItem {
  ProductID: string;
  ProductName: string;
  Qty: string;
  PdtSize: string;
  Height: string;
  Weight: string;
  BodySize: string;
  State: string;
  StateName: string;
  Amount: string;
  Price: string;
  Name: string;
}

// 訂單資訊介面定義
interface OrderInfo {
  State: string;
  StateName: string;
  SID: string;
  CheckTime: string;
  InvoiceID: string;
  InvoiceIDName: string;
  RName: string;
  RMobile: string;
  CNT: string;
  TotalAmount: string;
  Address: string;
  Mobile: string;
  PayTypeName: string;
  DeliverTypeName: string;
  freight: string;
  BackReason: string;
}

// 模擬訂單商品數據 (備用)
const mockOrderItems = ref<OrderItem[]>([]);

// 計算總金額
const totalAmount = computed(() => {
  if (orderInfo.value) {
    return parseInt(orderInfo.value.TotalAmount);
  }
  return 0;
});

// 狀態顏色配置
const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    "0": "status-red",      // 未付款
    "1": "status-green",    // 個人化資訊
    "3": "status-red",      // 待製作
    "4": "status-green",    // 製作中
    "5": "status-green",    // 待出貨
    "6": "status-blue",     // 已出貨
    "7": "status-blue",     // 已簽收
    "8": "status-red",      // 退貨申請
    "9": "status-red",      // 退貨處理
    "A": "status-red",      // 退貨完成
    "B": "status-red",      // 退款完成
  };
  return statusMap[status] || "status-default";
};

// API 載入訂單詳細資料
const loadOrderDetail = async () => {
  loading.value = true;
  
  try {
    const response = await axios.post("https://23700999.com:8081/HMA/api/bk/SaleItemQry", {
      AdminID: adminID.value,
      Token: token.value,
      SALEID: orderId
    });

    console.log("訂單詳細 API 回應:", response.data);
    
    if (response.status === 200 && response.data.Result === "OK") {
      const apiData = response.data;
      orderInfo.value = apiData.Sale;
      orderItems.value = apiData.SaleItem || [];
    } else {
      console.error("載入訂單詳細失敗");
      // 如果 API 失敗，使用模擬數據
      orderItems.value = mockOrderItems.value;
    }
  } catch (error) {
    console.error("載入訂單詳細時發生錯誤:", error);
    // 如果 API 失敗，使用模擬數據
    orderItems.value = mockOrderItems.value;
  } finally {
    loading.value = false;
  }
};

// 返回上一頁
const goBack = () => {
  router.back();
};

// orderBar 控制方法
const expandOrderBar = () => {
  orderBarExpanded.value = true;
};

const collapseOrderBar = () => {
  orderBarExpanded.value = false;
};

onMounted(() => {
  console.log("訂單詳情頁面載入，訂單ID:", orderId);
  loadOrderDetail();
});
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

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    background: $raphael-gray-100;
    border-radius: 12px;

    h1 {
      color: $primary-600;
      font-size: 36px;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.09px;
      margin: 0;
      @include respond-to("lg") {
        font-size: 24px;
        margin-left: 36px;
      }
    }

    .back-btn {
      border-radius: 6px;
      background: $primary-200;
      padding: 9px 12px;
      border: none;
      color: var(--Primary-100, #f5f7fa);
      cursor: pointer;
      font-size: 1.125rem;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 2.7px;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      transition: all ease 0.2s;

      @include respond-to("lg") {
        margin-right: 36px;
        z-index: 999;
      }

      h6 {
        @include respond-to("lg") {
          display: none;
        }
      }

      &:hover {
        background: $primary-300;
      }

      img {
        width: 16px;
        height: 16px;
      }
    }
  }

  .order-items-table {
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

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      min-height: 300px;

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid $raphael-gray-200;
        border-top: 4px solid $raphael-cyan-500;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      }

      p {
        color: $raphael-gray-500;
        font-size: 1rem;
        margin: 0;
      }
    }

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
      grid-template-columns: 1fr 1fr 0.5fr 0.8fr 1fr 0.8fr 1fr;
      position: relative;
      gap: 2px;
      align-items: center;
      padding: 13px 16px;
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
}

.orderBar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border-radius: 20px;
  background: $raphael-white;
  box-shadow: -1px 0px 20px 0px
    var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
  margin: 1rem;
  margin-left: 0;
  padding: 1rem 0.5rem;
  width: 54px;
  opacity: 1;
  transform: translateY(0);
  transition: width 0.3s ease-out;

  &.orderBar--show {
    animation: fadeInDown 0.3s ease-out forwards;
  }

  @include respond-to("lg") {
    background: none;
    box-shadow: none;
    position: fixed;
    top: 0;
    right: 0;
    z-index: 1000;
    height: 100vh;
  }

  &.orderBar--expanded {
    width: 380px;
    @include respond-to("xl") {
      width: 320px;
    }
    @include respond-to("lg") {
      background: $raphael-white;
      box-shadow: -1px 0px 20px 0px
        var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));

      width: 100%;
      height: 100%;
      top: 0;
      right: 0;
      z-index: 999;
      margin: 0;

      border-radius: 0;
      overflow-y: scroll;
    }
  }

  // 未展開時隱藏內容
  &:not(.orderBar--expanded) .orderBarContent {
    display: none;
  }

  .orderBarImg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    position: relative;
    height: 24px;
    img {
      cursor: pointer;
      position: absolute;
      top: 0;
      opacity: 0;
      animation: fadeIn 0.3s ease-out 0.3s forwards;

      &.orderBarImgClose {
        top: 0;
        right: 0;
      }
      &.orderBarImgButton {
        @include respond-to("lg") {
          top: -11px;
          right: -4px;
        }
      }
    }
  }

  .orderBarContent {
    display: grid;
    gap: 1.5rem;
    flex: 1;
    height: 0;
    padding: 0.5rem;
    overflow: hidden;
    overflow-y: scroll;
    @include scrollbarStyle();

    .orderBarInfo {
      border-radius: 20px;
      background: $raphael-white;
      box-shadow: 0px 2px 20px 0px
        var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
      padding: 1rem;
      opacity: 1;
      transform: translateY(0);

      &.orderBarInfo--fade {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.4s ease-out forwards;
      }

      .orderBarInfoHR {
        height: 1px;
        background: #b1c0d8;
        margin-bottom: 0.25rem;
      }
    }

    h3 {
      color: $primary-600;
      font-size: 1.5rem;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.12px;
      margin-bottom: 1rem;
    }

    .orderBarInfoItem {
      display: grid;
      grid-auto-flow: column;
      margin-bottom: 0.5rem;
      gap: 0.5rem;
      grid-template-columns: repeat(2, 1fr);

      .orderBarInfoItemTitle {
        color: $primary-200;
        font-size: 1.125rem;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.09px;
        display: flex;
        align-items: center;
        gap: 0.1rem;

        img {
          transform: scale(0.8) translateY(2px);
        }
      }

      .orderBarInfoItemValue {
        color: $primary-600;
        font-size: 1.125rem;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.09px;
        word-break: break-all;

        &.orderBarInfoItemValueRed {
          color: $raphael-red-300;
        }
      }
    }

    .orderBarInfoItem2 {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;

      .orderBarInfoItemTitle {
        color: $raphael-red-300;
        font-size: 1.25rem;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.1px;
      }

      .orderBarInfoItemValue {
        color: $raphael-red-300;
        text-align: right;
        font-size: 1.25rem;
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.1px;
      }
    }

    .orderBarInfoContent {
      color: $primary-600;
      font-size: 1rem;
      line-height: 1.5;
    }
  }
}

// 動畫定義
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
