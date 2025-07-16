<template>
  <div class="orderQueryWrap">
    <TitleMenu
      :Text="orderList.length === 0 ? '訂單追蹤' : '訂單查詢'"
      link="/user"
    />
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
              <svg
                @click="prevRecommend"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                style="cursor: pointer; vertical-align: middle"
              >
                <path
                  d="M16.011 5.04146L8.70297 12.5385L16.011 20.0355C16.1418 20.1694 16.2151 20.3492 16.2151 20.5365C16.2151 20.7237 16.1418 20.9035 16.011 21.0375C15.9474 21.1023 15.8716 21.1538 15.7879 21.189C15.7042 21.2242 15.6143 21.2423 15.5235 21.2423C15.4327 21.2423 15.3428 21.2242 15.2591 21.189C15.1754 21.1538 15.0995 21.1023 15.036 21.0375L7.25997 13.062C7.12345 12.9219 7.04705 12.734 7.04705 12.5385C7.04705 12.3429 7.12345 12.155 7.25997 12.015L15.0345 4.03946C15.0981 3.97414 15.1741 3.92223 15.2581 3.88678C15.3421 3.85134 15.4323 3.83307 15.5235 3.83307C15.6146 3.83307 15.7049 3.85134 15.7889 3.88678C15.8728 3.92223 15.9489 3.97414 16.0125 4.03946C16.1433 4.17341 16.2166 4.35322 16.2166 4.54046C16.2166 4.7277 16.1433 4.90751 16.0125 5.04146H16.011Z"
                  fill="#1E1E1E"
                />
              </svg>
              <!-- 右箭頭SVG -->
              <svg
                @click="nextRecommend"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                style="cursor: pointer; vertical-align: middle"
              >
                <path
                  d="M7.98903 5.04146L15.297 12.5385L7.98903 20.0355C7.85819 20.1694 7.78495 20.3492 7.78495 20.5365C7.78495 20.7237 7.85819 20.9035 7.98903 21.0375C8.05257 21.1023 8.12842 21.1538 8.21213 21.189C8.29584 21.2242 8.38573 21.2423 8.47653 21.2423C8.56733 21.2423 8.65721 21.2242 8.74092 21.189C8.82463 21.1538 8.90048 21.1023 8.96403 21.0375L16.74 13.062C16.8765 12.9219 16.953 12.734 16.953 12.5385C16.953 12.3429 16.8765 12.155 16.74 12.015L8.96553 4.03946C8.90193 3.97414 8.8259 3.92223 8.74191 3.88678C8.65792 3.85134 8.56769 3.83307 8.47653 3.83307C8.38537 3.83307 8.29513 3.85134 8.21114 3.88678C8.12715 3.92223 8.05112 3.97414 7.98753 4.03946C7.85669 4.17341 7.78345 4.35322 7.78345 4.54046C7.78345 4.7277 7.85669 4.90751 7.98753 5.04146H7.98903Z"
                  fill="#1E1E1E"
                />
              </svg>
            </span>
          </h3>
          <transition name="fade" mode="out-in">
            <div
              class="recommendDiv"
              :key="currentRecommendIndex"
              v-if="recommendedProducts[currentRecommendIndex]"
            >
              <div class="imgGroup">
                <img
                  :src="getImage(currentRecommend.name)"
                  alt="product image"
                />
                <img
                  v-if="currentRecommend.name === '居家治療儀'"
                  class="robotImg"
                  src="/assets/imgs/clothRobot.png"
                  alt="robot image"
                />
                <div class="circleAnimate"></div>
              </div>
              <h3 class="recommendName">{{ currentRecommend.name }}</h3>
              <p class="recommendSlogan">{{ currentRecommend.slogan }}</p>
              <div class="priceGroup">
                <div
                  class="priceItem"
                  v-for="(price, idx) in parsePrices(currentRecommend.price)"
                  :key="idx"
                >
                  <span class="priceValue">{{ price.value }}</span>
                  <span class="pricePeriod" v-if="price.period"
                    >/{{ price.period }}</span
                  >
                </div>
              </div>
              <button class="contactBtn" @click="contactSupport">
                聯絡客服
              </button>
              <div class="featureTitle">產品特色</div>
              <ul class="featureListGroup">
                <li
                  v-for="(feature, idx) in currentRecommend.features"
                  :key="idx"
                >
                  {{ feature }}
                </li>
              </ul>
            </div>
          </transition>
        </div>
      </div>
      <div v-else class="orderQueryContent">
        <div class="orderStateBlock">
          <div 
            class="orderStateBlockBlockTag"
            :class="{ orderStateBlockBlockTagActive: currentStatus === 'processing' }"
            @click="switchStatus('processing')"
          >
            訂單處理中
          </div>
          <div 
            class="orderStateBlockBlockTag"
            :class="{ orderStateBlockBlockTagActive: currentStatus === 'shipped' }"
            @click="switchStatus('shipped')"
          >
            已出貨
          </div>
          <div 
            class="orderStateBlockBlockTag"
            :class="{ orderStateBlockBlockTagActive: currentStatus === 'returned' }"
            @click="switchStatus('returned')"
          >
            已退貨
          </div>
        </div>

        <div
          class="orderQueryItem"
          v-for="order in filteredOrderList"
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

          <!-- 已出貨狀態的特殊顯示 -->
          <div 
            v-if="getOrderStage(order).type === 'done' && currentStatus === 'shipped'"
            class="shipped-info"
          >
            <div class="shipped-tip">
              預計送達時間 5月20日~5月25日，實際依物流為主
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M6.33392 1.35777C6.07883 1.40825 5.88486 1.5544 5.77592 1.7776C5.70417 1.92374 5.70151 1.945 5.69354 2.39938L5.68291 2.87235L3.71395 2.87767L1.74233 2.88564L1.63073 2.94676C1.47661 3.02647 1.33578 3.17527 1.26669 3.32142C1.21355 3.43568 1.21089 3.49148 1.20292 4.28331C1.19495 5.10172 1.19495 5.12298 1.25075 5.19207C1.32781 5.29038 1.46332 5.29038 1.54038 5.19472C1.59353 5.12564 1.59618 5.09375 1.59618 4.33646C1.59618 3.59776 1.59884 3.54462 1.64933 3.46225C1.67856 3.41442 1.73967 3.3533 1.7875 3.32407C1.87253 3.27093 1.92833 3.27093 4.71305 3.27093L7.54825 3.27093V4.14248C7.54825 5.11235 7.55622 5.17081 7.71831 5.36212C7.76879 5.41792 7.87242 5.5003 7.94948 5.54281L8.09297 5.62253L9.91313 5.63847L9.91313 9.78632C9.91313 13.8677 9.91313 13.9368 9.85999 14.0458C9.83076 14.1042 9.76964 14.176 9.72182 14.2052C9.63679 14.2583 9.57301 14.2583 5.75466 14.2583C1.92301 14.2583 1.87519 14.2583 1.78484 14.2052C1.73701 14.176 1.67324 14.1095 1.64667 14.059C1.59884 13.9714 1.59618 13.8172 1.59618 9.96169C1.59618 7.76155 1.58821 5.93873 1.58024 5.91482C1.56961 5.89356 1.5271 5.8537 1.48458 5.83244C1.41815 5.7979 1.39158 5.7979 1.32781 5.82447C1.28264 5.84042 1.23746 5.87762 1.22418 5.90419C1.18698 5.97062 1.18964 13.9607 1.22418 14.0909C1.30389 14.3699 1.55633 14.5931 1.85393 14.641C1.98413 14.6649 3.10546 14.6702 5.86094 14.6649C10.1868 14.6569 9.82013 14.6755 10.0619 14.4417C10.2692 14.2397 10.2958 14.1467 10.3064 13.5994L10.317 13.129H10.7262C11.1009 13.129 11.1407 13.1237 11.1886 13.0759C11.2683 12.9962 11.2603 12.8553 11.1726 12.7863C11.1089 12.7358 11.0663 12.7305 10.7076 12.7305H10.3117V10.0999H11.7971C13.2585 10.0999 13.2824 10.0999 13.3515 10.0441C13.4472 9.96966 13.4472 9.83149 13.3515 9.75709C13.2824 9.70129 13.2585 9.70129 11.7971 9.70129H10.3117L10.3117 8.5587H11.813C13.2798 8.5587 13.3143 8.5587 13.3675 8.50556C13.4259 8.4471 13.4365 8.34613 13.394 8.26641C13.3409 8.16544 13.2452 8.16013 11.7572 8.16013H10.3117V7.04411H11.7971C13.2585 7.04411 13.2824 7.04411 13.3515 6.98831C13.4419 6.91657 13.4472 6.78371 13.3595 6.704L13.2984 6.64554L10.3117 6.64554V5.50295H11.813C13.2798 5.50295 13.3143 5.50295 13.3675 5.44981C13.4339 5.38338 13.4365 5.26115 13.3701 5.18144L13.3196 5.11766L10.0593 5.10172L7.82459 2.87235H6.0868V2.46846C6.0868 2.01143 6.12135 1.89186 6.27812 1.7962C6.36315 1.74306 6.42426 1.74306 9.1957 1.74306L12.0256 1.74306L12.0389 2.65978C12.0522 3.53665 12.0548 3.58182 12.1106 3.68279C12.1824 3.81831 12.3365 3.96445 12.4906 4.04417C12.6075 4.10794 12.6234 4.10794 13.5083 4.11591L14.4038 4.12388V8.28236C14.4038 12.7995 14.4144 12.5046 14.2576 12.6507L14.1859 12.7172L13.0486 12.7305C11.999 12.7437 11.9087 12.7464 11.8582 12.7916C11.829 12.8181 11.7997 12.8607 11.7918 12.8872C11.7732 12.9643 11.8422 13.0998 11.9113 13.1158C11.9459 13.1237 12.4879 13.129 13.115 13.1237C14.2417 13.1158 14.2603 13.1158 14.3692 13.0546C14.5233 12.9749 14.6642 12.8261 14.7332 12.68L14.789 12.5577L14.8023 3.84488L13.5535 2.59335L12.3046 1.34448L9.37638 1.34182C7.76348 1.33917 6.39504 1.34714 6.33392 1.35777ZM13.4312 3.71734C12.666 3.72531 12.6155 3.71468 12.4986 3.5393C12.4401 3.45162 12.4374 3.43302 12.4374 2.74215V2.03535L14.1115 3.70936L13.4312 3.71734ZM8.92732 5.23192C7.89368 5.24255 7.94682 5.29304 7.94682 4.26737V3.54993L9.62084 5.22395L8.92732 5.23192Z"
                  fill="#65a31b"
                />
              </svg>
            </div>
          </div>

          <!-- 已退貨狀態的特殊顯示 -->
          <div 
            v-if="getOrderStage(order).type === 'returned' && currentStatus === 'returned'"
            class="returned-info"
          >
            <div class="returned-tip">
              已申請退貨
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M5.32602 3.00217L10.198 8.00017L5.32602 12.9982C5.2388 13.0875 5.18996 13.2073 5.18996 13.3322C5.18996 13.457 5.2388 13.5769 5.32602 13.6662C5.36838 13.7094 5.41895 13.7438 5.47475 13.7672C5.53056 13.7907 5.59048 13.8027 5.65102 13.8027C5.71155 13.8027 5.77147 13.7907 5.82728 13.7672C5.88309 13.7438 5.93365 13.7094 5.97602 13.6662L11.16 8.34917C11.251 8.25579 11.302 8.13056 11.302 8.00017C11.302 7.86977 11.251 7.74454 11.16 7.65117L5.97702 2.33417C5.93462 2.29062 5.88393 2.25601 5.82794 2.23238C5.77195 2.20875 5.71179 2.19658 5.65102 2.19658C5.59024 2.19658 5.53009 2.20875 5.47409 2.23238C5.4181 2.25601 5.36741 2.29062 5.32502 2.33417C5.2378 2.42346 5.18896 2.54334 5.18896 2.66817C5.18896 2.79299 5.2378 2.91287 5.32502 3.00217H5.32602Z"
                  fill="#ec4f4f"
                />
              </svg>
            </div>
          </div>

          <div
            class="order-tip"
            :class="getOrderStage(order).type"
            v-if="getOrderStage(order).tip && currentStatus === 'processing'"
          >
            {{ getOrderStage(order).tip }}
          </div>
        </div>
        
        <!-- 空狀態顯示 -->
        <div v-if="filteredOrderList.length === 0" class="empty-state">
          <div class="empty-state-content">
            <img src="~/assets/imgs/cart/angel.png" alt="沒有資料" />
            <h3>還沒有資料喔</h3>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import TitleMenu from "~/components/TitleMenu.vue";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const userData = JSON.parse(localStorage.getItem("userData"));
const orderList = ref([]);
const recheckoutLoading = ref(false);
const showQuestionBox = ref(false);
const selectedOrder = ref(null);
const loading = ref(true);
const currentStatus = ref('processing'); // 當前選中的狀態

// 假資料，實際可用 API
const recommendedProducts = ref([]);
const currentRecommendIndex = ref(0);

const currentRecommend = computed(
  () => recommendedProducts.value[currentRecommendIndex.value] || {}
);

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
  三效深眠衣: new URL("~/assets/imgs/normalClothes.png", import.meta.url).href,
  全效調節衣: new URL("~/assets/imgs/redLightClothes2.png", import.meta.url)
    .href,
  居家治療儀: new URL("~/assets/imgs/redLightClothes2.png", import.meta.url)
    .href,
  雙效紅光活力衣: new URL("~/assets/imgs/redLightClothes.png", import.meta.url)
    .href,
};
const getImage = (name) => {
  return imageMap[name] || imageMap["三效深眠衣"];
};
// 價格解析（支援多組價格）
const parsePrices = (priceString) => {
  if (!priceString) return [];
  return priceString.split(";").map((part) => {
    const [val, per] = part.trim().split("/");
    return { value: val.trim(), period: per ? per.trim() : "" };
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
      recommendedProducts.value = data.PromoteProduct.map((item) => ({
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
        localStorage.setItem("checkoutSALEID", data.value.SALEID);
        console.log("已儲存新的 SALEID:", data.value.SALEID);
      }

      // 解析 HTML 表單並直接提交
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.value.htmlForm, "text/html");
      const form = doc.querySelector("form");

      if (form) {
        // 創建一個臨時表單並提交
        const tempForm = document.createElement("form");
        tempForm.method = form.method;
        tempForm.action = form.action;
        tempForm.style.display = "none";

        // 複製所有 input 元素
        const inputs = form.querySelectorAll("input");
        inputs.forEach((input) => {
          const newInput = document.createElement("input");
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
        alert("重新結帳失敗，請稍後再試");
      }
    } else {
      alert("重新結帳失敗，請稍後再試");
    }
  } catch (error) {
    console.error("重新結帳失敗：", error);
    alert("重新結帳失敗，請稍後再試");
  } finally {
    recheckoutLoading.value = false;
  }
};

// 檢查是否已付款的輔助函數
const isOrderPaid = (order) => {
  return (
    order.RtnCode === "1" &&
    (order.RtnMsg === "paid" ||
      order.RtnMsg === "交易成功" ||
      order.RtnMsg === "SUCCESS")
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

// 計算工作日的函數
const addWorkDays = (date, workDays) => {
  const result = new Date(date);
  let addedDays = 0;

  while (addedDays < workDays) {
    result.setDate(result.getDate() + 1);
    // 跳過週末（週六=6, 週日=0）
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++;
    }
  }

  return result;
};

// 格式化日期為 "月日" 格式
const formatDate = (date) => {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// 根據 API 資料判斷訂單狀態
const getOrderStage = (order) => {
  // 檢查是否已付款 - 支援多種已付款狀態
  const isPaid =
    order.RtnCode === "1" &&
    (order.RtnMsg === "paid" ||
      order.RtnMsg === "交易成功" ||
      order.RtnMsg === "SUCCESS");

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
    const hasUnfilledItems =
      order.ItemList &&
      order.ItemList.some((item) => {
        return !item.PdtSize || !item.Weight || !item.BodySize || !item.Height;
      });

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

  // 已出貨 - 檢查多種可能的出貨狀態
  if (order.ShipStatus === "已出貨" || 
      order.ReceiveStatus === "已收貨" || 
      order.StateName === "已出貨" ||
      order.State === "2") {
    return { status: "已出貨", tip: "訂單已出貨", type: "done" };
  }

  // 已付款且已填個資，尚未出貨
  if (isPaid) {
    // 檢查是否所有商品都已填寫個人化資料
    const allItemsFilled =
      order.ItemList &&
      order.ItemList.every((item) => {
        return item.PdtSize && item.Weight && item.BodySize && item.Height;
      });

    if (allItemsFilled) {
      // 找到最晚填寫個人化資料的時間
      const latestCheckTime = order.ItemList.reduce((latest, item) => {
        if (item.PdtSize && item.Weight && item.BodySize && item.Height) {
          // 解析 CheckTime 格式：20250714155739 -> 2025/07/14 15:57:39
          const year = item.CheckTime.substring(0, 4);
          const month = item.CheckTime.substring(4, 6);
          const day = item.CheckTime.substring(6, 8);
          const hour = item.CheckTime.substring(8, 10);
          const minute = item.CheckTime.substring(10, 12);
          const second = item.CheckTime.substring(12, 14);

          const itemCheckTime = new Date(
            `${year}/${month}/${day} ${hour}:${minute}:${second}`
          );
          return itemCheckTime > latest ? itemCheckTime : latest;
        }
        return latest;
      }, new Date(0));

      // 計算預計送達日（最晚填完日期+7個工作天）
      const estimateEndDate = addWorkDays(latestCheckTime, 7);

      // 計算開始日期（通常為填完後的下一個工作日）
      const estimateStartDate = addWorkDays(latestCheckTime, 1);

      const startDateStr = formatDate(estimateStartDate);
      const endDateStr = formatDate(estimateEndDate);

      return {
        status: "製作中",
        tip: `預計送達時間 ${startDateStr}~${endDateStr} , 實際依物流為主`,
        type: "shipping",
      };
    }
  }

  // 預設
  return { status: "處理中", tip: "", type: "processing" };
};

// 切換狀態標籤
const switchStatus = (status) => {
  currentStatus.value = status;
};

// 根據當前狀態過濾訂單
const filteredOrderList = computed(() => {
  if (!orderList.value.length) return [];
  
  return orderList.value.filter(order => {
    const stage = getOrderStage(order);
    
    switch (currentStatus.value) {
      case 'processing':
        // 訂單處理中：未付款、未製作、製作中
        return ['unpaid', 'unfilled', 'shipping'].includes(stage.type);
      case 'shipped':
        // 已出貨：已完成
        return stage.type === 'done';
      case 'returned':
        // 已退貨：已退貨
        return stage.type === 'returned';
      default:
        return true;
    }
  });
});

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

  // 已填寫完個人化資料的訂單跳轉到詳細頁面
  if (stage.type === "shipping") {
    router.push(`/orderDetail?SID=${order.SID}`);
    return;
  }

  // 其他訂單跳轉到訂單詳細頁
  router.push(`/orderDetail?SID=${order.SID}`);
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
      margin-top: 0.6rem;
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
      font-weight: 700;

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
small.processing {
  color: #74bc1f;
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

  // 製作中狀態的提示樣式
  &.shipping {
    color: #65a31b;
    background-color: #ddeacf;
  }
}

.orderQueryItem {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.orderStateBlock {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  .orderStateBlockBlockTag {
    
    padding: 8px 0;
    color: var(--Neutral-500, #666);
    font-size: 18px;
    font-weight: 400;
    letter-spacing: 0.09px;
    cursor: pointer;
    transition: color 0.3s ease;
    
    &:hover {
      color: #74bc1f;
    }
  }
  .orderStateBlockBlockTagActive {
    color: #74bc1f;
    border-bottom: 1px solid #74bc1f;
  }
}

// 已出貨狀態樣式
.shipped-info {
  margin-top: 8px;
  
  .shipped-tip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #ddeacf;
    color: #65a31b;
    border-radius: 8px;
    padding: 12px;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.15px;
    
    svg {
      cursor: pointer;
    }
  }
}

// 已退貨狀態樣式
.returned-info {
  margin-top: 8px;
  
  .returned-tip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #ffeaea;
    color: #ec4f4f;
    border-radius: 8px;
    padding: 12px;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.15px;
    
    svg {
      cursor: pointer;
    }
  }
}

// 空狀態樣式
.empty-state {
  width: 100%;
  margin-top: 2rem;
  
  .empty-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
    border-radius: 8px;
    padding: 2rem 0;
    
    img {
      width: 160px;
      height: 160px;
      margin-bottom: 1rem;
    }
    
    h3 {
      color: #000;
      font-size: 18px;
      font-weight: 400;
      margin: 0;
    }
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
        gap: 0.75rem;
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
          @include circleAnimate(
            160px,
            #fff,
            1,
            0px,
            rotate 4s linear infinite
          );
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
