<template>
  <div class="orderQueryWrap">
    <TitleMenu Text="訂單查詢" link="/user" />
    <!-- <div class="orderStateList">
      <ul>
        <li class="orderStateActive">訂單查詢</li>
        <li>待收貨</li>
        <li>訂單完成</li>
        <li>已退貨</li>
      </ul>
    </div> -->
    <div class="orderQueryContent">
      <div
        class="orderQueryItem"
        v-for="order in orderList"
        :key="order.SID"
        @click="handleOrderClick(order)"
      >
        <div class="orderQueryItemTitle">
          <h3>
            訂單編號：<span class="order-id">{{ order.SID }}</span>
          </h3>
          <small :class="getOrderStage(order).type">{{
            getOrderStage(order).status
          }}</small>
        </div>
        <div
          class="orderQueryItemMainGroup"
          v-for="item in order.ItemList"
          :key="item.AID"
        >
          <div class="orderQueryItemMain1">
            <img :src="item.DPicture" :alt="item.ProductName" />
            <div class="orderQueryItemMain1Text">
              <h3>{{ item.ProductName }}</h3>
              <h5>NT${{ item.Price }}</h5>
            </div>
          </div>
          <div class="orderQueryItemMain2">
            <h5>x{{ item.Qty }}</h5>
          </div>
        </div>
        <div class="orderQueryHR"></div>
        <div class="orderQueryItemPrice">
          訂單金額 NT${{ order.TotalAmount }}
        </div>
        <div class="orderQueryHR"></div>

        <div class="order-tip" v-if="getOrderStage(order).tip">
          {{ getOrderStage(order).tip }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TitleMenu from "~/components/TitleMenu.vue";
import { ref } from "vue";

const userData = JSON.parse(localStorage.getItem("userData"));
const orderList = ref([]);

const getOrderQuery = async function () {
  try {
    const { data } = await useFetch(
      "https://23700999.com:8081/HMA/api/fr/maSale",
      {
        method: "POST",
        body: {
          MID: userData.MID,
          Token: userData.Token,
          MAID: userData.MAID,
          Mobile: userData.Mobile,
          Lang: "zhtw",
        },
      }
    );

    if (data.value?.Result === "OK") {
      orderList.value = data.value.SaleList || [];
      console.log("訂單資料:", orderList.value);
    }
  } catch (error) {
    console.error("獲取相關資料失敗：", error);
  }
};

// 取得訂單狀態文字
const getOrderStatus = (order) => {
  // 檢查付款狀態
  if (order.RtnCode === "1" && order.RtnMsg === "paid") {
    return "已付款";
  } else if (order.RtnCode === "" || order.RtnMsg === "") {
    return "待付款";
  } else {
    return "付款失敗";
  }
};

// 取得訂單狀態詳細說明
const getOrderStatusText = (order) => {
  // 檢查付款狀態
  if (order.RtnCode === "1" && order.RtnMsg === "paid") {
    return "訂單已付款，正在處理中";
  } else if (order.RtnCode === "" || order.RtnMsg === "") {
    return "請先完成付款才會開始製作";
  } else {
    return "付款失敗，請重新付款";
  }
};

// 取得訂單狀態 CSS 類別
const getOrderStatusClass = (order) => {
  // 檢查付款狀態
  if (order.RtnCode === "1" && order.RtnMsg === "paid") {
    return "paid";
  } else if (order.RtnCode === "" || order.RtnMsg === "") {
    return "pending";
  } else {
    return "failed";
  }
};

// 假設 order 物件有 PersonalInfoFilled, ShipStatus, ReturnStatus 等欄位
const getOrderStage = (order) => {
  // 未付款
  if (order.RtnCode !== "1" || order.RtnMsg !== "paid") {
    return {
      status: "未付款",
      tip: "尚未收到您的付款，請確認付款狀態",
      type: "unpaid",
    };
  }
  // 已付款但未填個資
  if (
    order.RtnCode === "1" &&
    order.RtnMsg === "paid" &&
    !order.PersonalInfoFilled
  ) {
    return {
      status: "未製作",
      tip: "請先填寫個人化資訊才會開始製作",
      type: "unfilled",
    };
  }
  // 已申請退貨
  if (order.ReturnStatus === "申請退貨" || order.ReturnStatus === "已退貨") {
    return { status: "已退貨", tip: "已申請退貨", type: "returned" };
  }
  // 已出貨
  if (order.ShipStatus === "已出貨" || order.ReceiveStatus === "已收貨") {
    return { status: "已完成", tip: "訂單已完成", type: "done" };
  }
  // 已付款且已填個資，尚未出貨
  if (
    order.RtnCode === "1" &&
    order.RtnMsg === "paid" &&
    order.PersonalInfoFilled
  ) {
    // 計算預計送達日
    const dayjs = require("dayjs");
    const estimate = dayjs(order.CheckTime).add(5, "day").format("M月D日");
    return {
      status: "待收貨",
      tip: `預計送達時間 ${estimate}`,
      type: "shipping",
    };
  }
  // 預設
  return { status: "處理中", tip: "", type: "processing" };
};

const handleOrderClick = (order) => {
  const stage = getOrderStage(order);
  if (stage.type === "unfilled") {
    alert("請先填寫個人化資訊才會開始製作！");
    // 可導向個資填寫頁
    // router.push(`/personalize/${order.SID}`);
  } else {
    // 跳轉訂單詳細頁
    router.push(`/orderDetail/${order.SID}`);
  }
};

onMounted(() => {
  getOrderQuery();
});
</script>

<style lang="scss" scoped>
.orderQueryWrap {
  background-color: #f6f6f6;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  place-items: center;
  padding: 0 2.5% 72px;
  .orderStateList {
    width: 90%;
    margin-top: 8px;

    ul {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      width: 100%;

      li {
        color: var(--Neutral-500, #666);
        font-size: 18px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.09px;

        &.orderStateActive {
          color: var(--Primary-default, #74bc1f);
          border-bottom: 2px solid var(--Primary-default, #74bc1f);
          padding-bottom: 8px;
        }
      }
    }
  }
  .orderQueryContent {
    width: 90%;

    .orderQueryItemMainGroup {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .orderQueryItemMain1 {
      display: flex;
      align-items: center;
      gap: 16px;
      img {
        width: 100px;
        height: 100px;
        object-fit: cover;
      }
      .orderQueryItemMain1Text {
        display: flex;
        flex-direction: column;
        line-height: 1.25;
        h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--Neutral-500, #1e1e1e);
        }
        h5 {
          font-size: 16px;
          font-weight: 400;
          color: var(--Primary-hover, #65a31b);
        }
      }
    }
    .orderQueryItemMain2 {
      color: var(--Neutral-500, #666);
      text-align: center;
      font-family: "Noto Sans";
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 100%; /* 12px */
      letter-spacing: 0.06px;
    }

    .orderQueryItem {
      margin-bottom: 16px;
      background-color: #fff;
      border-radius: 8px;
      padding: 16px;

      .orderQueryItemTitle {
        display: flex;
        justify-content: space-between;
        h3 {
          color: var(--Primary-hover, #65a31b);

          font-size: var(--Text-font-size-18, 18px);
          font-style: normal;
          font-weight: 700;

          letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
        }
        small {
          color: var(--Warning-default, #ec4f4f);

          font-size: var(--Margin-m-16, 16px);
          font-style: normal;
          font-weight: 400;
          line-height: 150%; /* 24px */
          letter-spacing: 0.15px;

          &.paid {
            color: var(--Primary-default, #74bc1f);
          }

          &.pending {
            color: var(--Warning-default, #ec4f4f);
          }

          &.failed {
            color: #ff6b6b;
          }
        }
      }
    }
    .orderQueryHR {
      width: 100%;
      height: 1px;
      background-color: var(--Neutral-200, #eee);
      margin: 12px 0;
    }

    .orderQueryItemPrice {
      text-align: right;
      color: var(--Warning-default, #ec4f4f);

      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;

      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
    }
    .orderStateTag {
      border-radius: var(--Radius-r-8, 8px);
      background: var(--warning-300-opacity-10, rgba(236, 79, 79, 0.1));
      color: var(--Warning-default, #ec4f4f);
      font-family: "Noto Sans";
      font-size: var(--Text-font-size-16, 16px);
      font-style: normal;
      font-weight: 700;
      line-height: 150%; /* 24px */
      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      padding: 8px;

      &.paid {
        background: rgba(116, 188, 31, 0.1);
        color: var(--Primary-default, #74bc1f);
      }

      &.pending {
        background: var(--warning-300-opacity-10, rgba(236, 79, 79, 0.1));
        color: var(--Warning-default, #ec4f4f);
      }

      &.failed {
        background: rgba(255, 107, 107, 0.1);
        color: #ff6b6b;
      }

      h3 {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }
}

small.unpaid {
  color: #ec4f4f;
}
small.unfilled {
  color: #ec4f4f;
}
small.shipping {
  color: #74bc1f;
}
small.done {
  color: #74bc1f;
}
small.returned {
  color: #ec4f4f;
}
.order-tip {
  margin-top: 8px;
  color: var(--Warning-default, #ec4f4f);
  background-color: #fff0f0;
  border-radius: 8px;
  padding: 12px;
  font-size: var(--Text-font-size-16, 16px);
  font-style: normal;
  font-weight: 700;

  letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
}
</style>

<script></script>
