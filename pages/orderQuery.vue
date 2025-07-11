<template>
  <div class="orderQueryWrap">
    <TitleMenu :Text="orderList.length === 0 ? '訂單追蹤' : '訂單查詢'" link="/user" />
    <QuesionBox 
      v-if="showQuestionBox" 
      :orderData="selectedOrder" 
      @close="showQuestionBox = false"
    />
    <RaphaelLoading v-if="loading" />
    <template v-else>
      <div v-if="orderList.length === 0" class="noOrderWrap">
        <div class="noOrderContent">
          <img src="~/assets/imgs/cart/angel.png" alt="購物車空空" />
          <h3>購物車空空的</h3>
          <button @click="goToCart">去逛逛</button>
        </div>
        <!-- 健康方案推薦區塊 -->
        <div v-if="recommendedProducts.length > 0" class="recommendWrap">
          <h3 class="recommendTitle">
            健康方案推薦
            <span v-if="recommendedProducts.length > 1">
              <!-- 左箭頭SVG -->
              <svg @click="prevRecommend" xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" style="cursor:pointer;vertical-align:middle;">
                <path d="M16.011 5.04146L8.70297 12.5385L16.011 20.0355C16.1418 20.1694 16.2151 20.3492 16.2151 20.5365C16.2151 20.7237 16.1418 20.9035 16.011 21.0375C15.9474 21.1023 15.8716 21.1538 15.7879 21.189C15.7042 21.2242 15.6143 21.2423 15.5235 21.2423C15.4327 21.2423 15.3428 21.2242 15.2591 21.189C15.1754 21.1538 15.0995 21.1023 15.036 21.0375L7.25997 13.062C7.12345 12.9219 7.04705 12.734 7.04705 12.5385C7.04705 12.3429 7.12345 12.155 7.25997 12.015L15.0345 4.03946C15.0981 3.97414 15.1741 3.92223 15.2581 3.88678C15.3421 3.85134 15.4323 3.83307 15.5235 3.83307C15.6146 3.83307 15.7049 3.85134 15.7889 3.88678C15.8728 3.92223 15.9489 3.97414 16.0125 4.03946C16.1433 4.17341 16.2166 4.35322 16.2166 4.54046C16.2166 4.7277 16.1433 4.90751 16.0125 5.04146H16.011Z" fill="#1E1E1E"/>
              </svg>
              <!-- 右箭頭SVG -->
              <svg @click="nextRecommend" xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" style="cursor:pointer;vertical-align:middle;">
                <path d="M7.98903 5.04146L15.297 12.5385L7.98903 20.0355C7.85819 20.1694 7.78495 20.3492 7.78495 20.5365C7.78495 20.7237 7.85819 20.9035 7.98903 21.0375C8.05257 21.1023 8.12842 21.1538 8.21213 21.189C8.29584 21.2242 8.38573 21.2423 8.47653 21.2423C8.56733 21.2423 8.65721 21.2242 8.74092 21.189C8.82463 21.1538 8.90048 21.1023 8.96403 21.0375L16.74 13.062C16.8765 12.9219 16.953 12.734 16.953 12.5385C16.953 12.3429 16.8765 12.155 16.74 12.015L8.96553 4.03946C8.90193 3.97414 8.8259 3.92223 8.74191 3.88678C8.65792 3.85134 8.56769 3.83307 8.47653 3.83307C8.38537 3.83307 8.29513 3.85134 8.21114 3.88678C8.12715 3.92223 8.05112 3.97414 7.98753 4.03946C7.85669 4.17341 7.78345 4.35322 7.78345 4.54046C7.78345 4.7277 7.85669 4.90751 7.98753 5.04146H7.98903Z" fill="#1E1E1E"/>
              </svg>
            </span>
          </h3>
          <transition name="fade" mode="out-in">
            <div class="recommendDiv" :key="currentRecommendIndex" v-if="recommendedProducts[currentRecommendIndex]">
              <div class="imgGroup">
                <img :src="getImage(currentRecommend.name)" alt="product image" />
                <img v-if="currentRecommend.name === '居家治療儀'" class="robotImg" src="/assets/imgs/clothRobot.png" alt="robot image" />
                <div class="circleAnimate"></div>
              </div>
              <h3 class="recommendName">{{ currentRecommend.name }}</h3>
              <p class="recommendSlogan">{{ currentRecommend.slogan }}</p>
              <div class="priceGroup">
                <div class="priceItem" v-for="(price, idx) in parsePrices(currentRecommend.price)" :key="idx">
                  <span class="priceValue">{{ price.value }}</span>
                  <span class="pricePeriod" v-if="price.period">/{{ price.period }}</span>
                </div>
              </div>
              <button class="contactBtn" @click="contactSupport">聯絡客服</button>
              <div class="featureTitle">產品特色</div>
              <ul class="featureListGroup">
                <li v-for="(feature, idx) in currentRecommend.features" :key="idx">
                  {{ feature }}
                </li>
              </ul>
            </div>
          </transition>
        </div>
      </div>
      <div v-else class="orderQueryContent">
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
    </template>
  </div>
</template>

<script setup>
import TitleMenu from "~/components/TitleMenu.vue";
import { ref, computed, onMounted } from "vue";
import axios from "axios";

const userData = JSON.parse(localStorage.getItem("userData"));
const orderList = ref([]);
const recheckoutLoading = ref(false);
const showQuestionBox = ref(false);
const selectedOrder = ref(null);
const loading = ref(true);

// 假資料，實際可用 API
const recommendedProducts = ref([]);
const currentRecommendIndex = ref(0);

const currentRecommend = computed(() => recommendedProducts.value[currentRecommendIndex.value] || {});

const prevRecommend = () => {
  if (recommendedProducts.value.length <= 1) return;
  currentRecommendIndex.value =
    (currentRecommendIndex.value - 1 + recommendedProducts.value.length) %
    recommendedProducts.value.length;
};
const nextRecommend = () => {
  if (recommendedProducts.value.length <= 1) return;
  currentRecommendIndex.value =
    (currentRecommendIndex.value + 1) % recommendedProducts.value.length;
};
// 圖片對應表，與 UsageHistory.vue 一致
const imageMap = {
  "三效深眠衣": new URL('~/assets/imgs/normalClothes.png', import.meta.url).href,
  "全效調節衣": new URL('~/assets/imgs/redLightClothes2.png', import.meta.url).href,
  "居家治療儀": new URL('~/assets/imgs/redLightClothes2.png', import.meta.url).href,
  "雙效紅光活力衣": new URL('~/assets/imgs/redLightClothes.png', import.meta.url).href,
};
const getImage = (name) => {
  return imageMap[name] || imageMap["三效深眠衣"];
};
// 價格解析（支援多組價格）
const parsePrices = (priceString) => {
  if (!priceString) return [];
  return priceString.split(';').map((part) => {
    const [val, per] = part.trim().split('/');
    return { value: val.trim(), period: per ? per.trim() : '' };
  });
};
const contactSupport = () => {
  window.location.href = "tel:0800000760";
};
const goToCart = () => {
  // 跳轉到購物車或首頁
  window.location.href = "/cart";
};

const fetchRecommend = async () => {
  try {
    const { MID, Token, MAID, Mobile } = userData;
    const { data } = await axios.post(
      "https://23700999.com:8081/HMA/API_USE1.jsp",
      { MID, Token, MAID, Mobile }
    );
    if (data && data.PromoteProduct) {
      recommendedProducts.value = data.PromoteProduct.map(item => ({
        name: item.ProductName,
        price: item.Desc1,
        features: item.Desc2.split("。").filter(Boolean),
        slogan: item.Desc3,
      }));
    }
  } catch (e) {
    recommendedProducts.value = [];
  }
};

const getOrderQuery = async function () {
  loading.value = true;
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
    // 若沒有訂單才打推薦API
    if (!orderList.value.length) {
      await fetchRecommend();
    }
  } catch (error) {
    console.error("獲取相關資料失敗：", error);
  } finally {
    loading.value = false;
  }
};

// 重新結帳功能
const handleRecheckout = async (order) => {
  if (recheckoutLoading.value) return;
  
  recheckoutLoading.value = true;
  
  try {
    const { data } = await useFetch(
      "https://23700999.com:8081/HMA/api/fr/maReCheckoutCart",
      {
        method: "POST",
        body: {
          MID: userData.MID,
          Token: userData.Token,
          MAID: userData.MAID,
          Mobile: userData.Mobile,
          SALEID: order.SID,
        },
      }
    );

    if (data.value?.Result === "OK") {
      // 儲存新的 SALEID 到 localStorage，這樣 checkoutSuccess.vue 就能獲取到
      if (data.value.SALEID) {
        localStorage.setItem('checkoutSALEID', data.value.SALEID);
        console.log("已儲存新的 SALEID:", data.value.SALEID);
      }
      
      // 解析 HTML 表單並直接提交
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.value.htmlForm, 'text/html');
      const form = doc.querySelector('form');
      
      if (form) {
        // 創建一個臨時表單並提交
        const tempForm = document.createElement('form');
        tempForm.method = form.method;
        tempForm.action = form.action;
        tempForm.style.display = 'none';
        
        // 複製所有 input 元素
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
          const newInput = document.createElement('input');
          newInput.type = input.type;
          newInput.name = input.name;
          newInput.value = input.value;
          tempForm.appendChild(newInput);
        });
        
        document.body.appendChild(tempForm);
        tempForm.submit();
        
        // 清理臨時表單
        setTimeout(() => {
          document.body.removeChild(tempForm);
        }, 100);
      } else {
        alert('重新結帳失敗，請稍後再試');
      }
    } else {
      alert('重新結帳失敗，請稍後再試');
    }
  } catch (error) {
    console.error("重新結帳失敗：", error);
    alert('重新結帳失敗，請稍後再試');
  } finally {
    recheckoutLoading.value = false;
  }
};

// 檢查是否已付款的輔助函數
const isOrderPaid = (order) => {
  return order.RtnCode === "1" && (
    order.RtnMsg === "paid" || 
    order.RtnMsg === "交易成功" ||
    order.RtnMsg === "SUCCESS"
  );
};

// 取得訂單狀態文字
const getOrderStatus = (order) => {
  // 檢查付款狀態
  if (isOrderPaid(order)) {
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
  if (isOrderPaid(order)) {
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
  if (isOrderPaid(order)) {
    return "paid";
  } else if (order.RtnCode === "" || order.RtnMsg === "") {
    return "pending";
  } else {
    return "failed";
  }
};

// 假設 order 物件有 PersonalInfoFilled, ShipStatus, ReturnStatus 等欄位
const getOrderStage = (order) => {
  // 檢查是否已付款 - 支援多種已付款狀態
  const isPaid = order.RtnCode === "1" && (
    order.RtnMsg === "paid" || 
    order.RtnMsg === "交易成功" ||
    order.RtnMsg === "SUCCESS"
  );
  
  // 未付款
  if (!isPaid) {
    return {
      status: "未付款",
      tip: "尚未收到您的付款，請重新付款",
      type: "unpaid",
    };
  }
  
  // 已付款但未填個資
  if (isPaid) {
    // 檢查是否有商品需要填寫個人化資料
    const hasUnfilledItems = order.ItemList && order.ItemList.some(item => {
      return !item.PdtSize || !item.Weight || !item.BodySize || !item.Height
    })
    
    if (hasUnfilledItems) {
      return {
        status: "未製作",
        tip: "請先填寫個人化資訊才會開始製作",
        type: "unfilled",
      };
    }
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
  if (isPaid) {
    // 檢查是否所有商品都已填寫個人化資料
    const allItemsFilled = order.ItemList && order.ItemList.every(item => {
      return item.PdtSize && item.Weight && item.BodySize && item.Height
    })
    
    if (allItemsFilled) {
      // 計算預計送達日（不使用 dayjs，改用原生 JS）
      let estimateDate = new Date(order.CheckTime);
      estimateDate.setDate(estimateDate.getDate() + 5);
      const estimate = `${estimateDate.getMonth() + 1}月${estimateDate.getDate()}日`;
      return {
        status: "待收貨",
        tip: `預計送達時間 ${estimate}`,
        type: "shipping",
      };
    }
  }
  
  // 預設
  return { status: "處理中", tip: "", type: "processing" };
};

const handleOrderClick = (order) => {
  const stage = getOrderStage(order);
  
  // 未付款訂單直接觸發重新結帳
  if (stage.type === "unpaid") {
    handleRecheckout(order);
    return;
  }
  
  // 未製作訂單顯示個人化資料填寫視窗
  if (stage.type === "unfilled") {
    selectedOrder.value = order;
    showQuestionBox.value = true;
    return;
  }
  
  // 其他訂單跳轉到訂單詳細頁
  router.push(`/orderDetail/${order.SID}`);
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

.orderQueryItem {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.noOrderWrap {
  width: 100%;
  .noOrderContent {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
    border-radius: 8px;
    padding: 1.5rem 0;
    img {
      width: 160px;
      height: 160px;
    }
    h3 {
      color: #000;
      font-size: 18px;
      margin: 1rem 0;
    }
    button {
      background: #74bc1f;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 8px 24px;
      font-size: 16px;
      cursor: pointer;
    }
  }
  .recommendWrap {
    display: grid;
    gap: 0.75rem;
    margin-top: 0.75rem;
    min-height: 400px;
    .recommendTitle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.25rem;

      letter-spacing: 0.09px;
      span {
        cursor: pointer;
        display: flex;
        gap: .75rem;
      }
      
      svg {
        cursor: pointer;
        width: 28px;
        height: 28px;
      }
    }
    .robotImg {
      position: absolute;
      width: 105px;
      height: auto !important;
      bottom: 0;
      left: 48.5%;
      z-index: 3;
    }
    p {
      color: #1e1e1e;
      text-align: center;
      font-size: 18px;
      font-style: normal;
      margin-top: 0.65rem;
      letter-spacing: 0.09px;
    }
    .recommendDiv {
      width: 100%;
      background-color: #fff;
      border-radius: 12px;
      padding-top: 0.75rem;
      padding: 0.75rem;
      .imgGroup {
        position: relative;
        display: grid;
        place-items: center;
        gap: 0.5rem;
        > img {
          height: 170px;
          z-index: 3;
        }
        .circleAnimate {
          @include circleAnimate(160px, #fff, 1, 0px, rotate 4s linear infinite);
        }
        .robotImg {
          position: absolute;
          width: 105px;
          height: auto !important;
          bottom: 0;
          left: 48.5%;
          z-index: 3;
        }
      }
      .recommendName {
        color: #1e1e1e;
        text-align: center;
        font-size: 18px;
        font-weight: 400;
        letter-spacing: 0.09px;
        margin-top: 0.5rem;
      }
      .recommendSlogan {
        color: #1e1e1e;
        text-align: center;
        font-size: 16px;
        margin: 0.5rem 0 0.5rem 0;
        letter-spacing: 0.09px;
      }
      .priceGroup {
        display: grid;
        justify-content: center;
        gap: 0.75rem;
        margin-top: 1rem;
        .priceItem {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.2;
          .priceValue {
            color: #1e1e1e;
            font-size: 24px;
            font-weight: 700;
          }
          .pricePeriod {
            font-size: 1.125rem;
            font-weight: normal;
            color: #1e1e1e;
          }
        }
      }
      .contactBtn {
        background: #fff;
        border: 1.5px solid #74bc1f;
        color: #74bc1f;
        border-radius: 8px;
        padding: 8px 24px;
        font-size: 16px;
        cursor: pointer;
        margin: 0.5rem 0 0.5rem 0;
        font-size: 1.125rem;
        width: 100%;
        font-weight: 400;
        letter-spacing: 0.09px;
      }
      .featureTitle {
        color: #1e1e1e;
        font-size: 1.25rem;
        
        margin-top: 1rem;
        margin-bottom: 0.5rem;
      }
      .featureListGroup {
        margin: 0;
        padding: 0 0 0 1.2em;
        li {
          color: #1e1e1e;
          font-size: 18px;
          font-weight: 400;
          line-height: 1.7;
          list-style: disc;
        }
      }
    }
    h6 {
      color: var(--shade-gray-500, #666);
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 100%;
      letter-spacing: 0.5px;
    }
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@keyframes rotate {
  0% {
    transform: scale(1.03) rotate(0deg);
    filter: brightness(1.2) blur(1px);
  }
  50% {
    transform: scale(1.05) rotate(180deg);
    filter: brightness(1.2) blur(3px);
  }
  100% {
    transform: scale(1.03) rotate(360deg);
    filter: brightness(1.2) blur(1px);
  }
}
</style>