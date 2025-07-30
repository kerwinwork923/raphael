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
          <div v-for="item in orderItems" :key="item.id" class="table-row">
            <div class="cell product-name" data-label="商品名稱">
              {{ item.productName }}
            </div>
            <div class="cell product-price" data-label="商品價格">
              ${{ item.price.toLocaleString() }}
            </div>
            <div class="cell quantity" data-label="購買數量">
              {{ item.quantity }}
            </div>
            <div class="cell size" data-label="商品尺寸">
              {{ item.size || "---" }}
            </div>
            <div class="cell height-weight" data-label="身高體重">
              {{ item.heightWeight || "---" }}
            </div>
            <div class="cell body-size" data-label="身材尺寸">
              {{ item.bodySize || "---" }}
            </div>
            <div class="cell progress" data-label="目前進度">
              <span class="status-tag" :class="getStatusClass(item.status)">
                {{ item.status }}
              </span>
            </div>
          </div>
        </div>
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
              待製作
            </div>
          </div>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              訂單編號
            </div>
            <div class="orderBarInfoItemValue">#{{ orderId }}</div>
          </div>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              成立時間
            </div>
            <div class="orderBarInfoItemValue">2025/12/12 12:12</div>
          </div>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              發票類型
            </div>
            <div class="orderBarInfoItemValue">電子發票</div>
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
            <div class="orderBarInfoItemValue">王先生</div>
          </div>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              電話
            </div>
            <div class="orderBarInfoItemValue">0912345678</div>
          </div>
          <div class="orderBarInfoItem">
            <div class="orderBarInfoItemTitle">
              <img src="/assets/imgs/backend/orderBarInfoIcon.svg" />
              信箱
            </div>
            <div class="orderBarInfoItemValue">raphael@gmail.com</div>
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
            <div class="orderBarInfoItemValue">{{ orderItems.length }}</div>
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
          v-show="orderBarExpanded"
          class="orderBarInfo orderBarInfo--fade"
          style="animation-delay: 0.4s"
        >
          <h3>退貨原因</h3>
          <div class="orderBarInfoContent">
            原因原因原因原因原因原因原因原因原因原因原因原因原因原因原因原因原因原因原因原因原因原因原因原因
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
              收件地址
            </div>
            <div class="orderBarInfoItemValue">
              100 台北市中正區忠孝西路一段66號30樓
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

const route = useRoute();
const router = useRouter();

// 獲取訂單ID
const orderId = route.params.id as string;

// orderBar 控制
const showOrderBar = ref(true);
const orderBarExpanded = ref(false);

// 訂單商品介面定義
interface OrderItem {
  id: number;
  productName: string;
  price: number;
  quantity: number;
  size?: string;
  heightWeight?: string;
  bodySize?: string;
  status: string;
}

// 模擬訂單商品數據
const orderItems = ref<OrderItem[]>([
  {
    id: 1,
    productName: "護您穩1型(XXXXX)",
    price: 38000,
    quantity: 1,
    size: "L",
    heightWeight: "170cm, 50kg",
    bodySize: "35cm",
    status: "未付款",
  },
  {
    id: 2,
    productName: "護您穩1型(XXXXX)",
    price: 38000,
    quantity: 1,
    size: "L",
    heightWeight: "170cm, 50kg",
    bodySize: "35cm",
    status: "個人化資訊",
  },
  {
    id: 3,
    productName: "護您穩1型(XXXXX)",
    price: 38000,
    quantity: 1,
    size: "L",
    heightWeight: "170cm, 50kg",
    bodySize: "35cm",
    status: "醫師處理中",
  },
  {
    id: 4,
    productName: "保健食品",
    price: 38000,
    quantity: 1,
    status: "待製作",
  },
  {
    id: 5,
    productName: "保健食品",
    price: 38000,
    quantity: 1,
    status: "製作中",
  },
  {
    id: 6,
    productName: "保健食品",
    price: 38000,
    quantity: 1,
    status: "待出貨",
  },
  {
    id: 7,
    productName: "保健食品",
    price: 38000,
    quantity: 1,
    status: "已出貨",
  },
  {
    id: 8,
    productName: "保健食品",
    price: 38000,
    quantity: 1,
    status: "退貨申請",
  },
]);

// 計算總金額
const totalAmount = computed(() => {
  return orderItems.value.reduce(
    (total: number, item: OrderItem) => total + item.price * item.quantity,
    0
  );
});

// 狀態顏色配置
const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    未付款: "status-red",
    個人化資訊: "status-red",
    醫師處理中: "status-red",
    待製作: "status-red",
    製作中: "status-green",
    待出貨: "status-green",
    已出貨: "status-blue",
    退貨申請: "status-red",
    退貨處理: "status-red",
    退貨完成: "status-red",
    退款完成: "status-red",
  };
  return statusMap[status] || "status-default";
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
      width: 300px;
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
      opacity: 0;
      transform: translateY(20px);

      &.orderBarInfo--fade {
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
</style>
