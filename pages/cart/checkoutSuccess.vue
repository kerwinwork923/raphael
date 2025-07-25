<template>
  <div class="checkoutSuccessWrap">
    <CartTitleBar title="付款詳情" backPath="/cart" />

    <div class="contentWrap">
      <!-- 載入狀態 -->
      <div v-if="isLoading" class="loadingBox">
        <div class="loadingSpinner"></div>
        <p>載入訂單詳情中...</p>
      </div>

      <!-- 錯誤狀態 -->
      <div v-else-if="error" class="errorBox">
        <p>{{ error }}</p>
        <p class="redirectMsg">即將跳轉到訂單查詢頁面...</p>
        <button @click="fetchOrderDetails" class="retryBtn">重新載入</button>
      </div>

      <!-- 正常內容 -->
      <template v-else>
        <!-- 個人化資訊提示 -->
        <div v-if="hasUnfilledItems" class="infoBox personalizationBox" @click="showPersonalizationModal">
          <div class="personalizationContent">
            <!-- <div class="personalizationIcon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15h-2v-2h2v2zm0-4h-2V5h2v6z" fill="#EC4F4F"/>
              </svg>
            </div> -->
            <div class="personalizationText">
              <h4>請先填寫個人化資訊才會開始製作</h4>
              <p>點擊此處開始填寫個人化資料</p>
            </div>
            <div class="personalizationArrow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12l4-4-4-4" stroke="#EC4F4F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="infoBox thankYouBox">
          感謝您的購買！
        </div>

        <div class="infoBox">
          <h4>寄送方式</h4>
          <p>{{ orderDetails.DeliverType }}</p>
        </div>

        <div class="infoBox">
          <h4>收件資訊</h4>
          <p>{{ orderDetails.RName }}．{{ orderDetails.RMobile }}</p>
          <p>{{ orderDetails.Address }}</p>
        </div>

        <div class="infoBox productBox">
          <div
            v-for="item in orderDetails.ProductList"
            :key="item.ProductID"
            class="productItem"
          >
            <img :src="item.DPicture" :alt="item.ProductName" />
            <div class="productInfo">
              <h4>{{ item.ProductName }}</h4>
              <h5>NT${{ item.Price }}</h5>
            </div>
            <span class="quantity">x{{ item.Qty }}</span>
          </div>
          <div class="summary">
            <div class="summaryRow">
              <span>運費</span>
              <span>NT${{ orderDetails.freight }}</span>
            </div>
            <div class="summaryRow total">
              <span>訂單總金額</span>
              <span>NT${{ orderDetails.TotalAmount }}</span>
            </div>
          </div>
        </div>

        <div class="infoBox orderDetailsBox">
          <div class="detailRow">
            <span>訂單編號</span>
            <span class="copyable">
              {{ orderDetails.OrderNo }}
               <!-- <img src="~/assets/imgs/cart/copy.svg" alt="copy" @click="copy(orderDetails.OrderNo)" />    -->
            </span>
          </div>
          <div class="detailRow">
            <span>付款方式</span>
            <span>{{ orderDetails.PayType }}</span>
          </div>
          <div class="detailRow">
            <span>訂單成立時間</span>
            <span>{{ orderDetails.OrderTime }}</span>
          </div>
          <div class="detailRow">
            <span>發票類型</span>
            <span>{{ orderDetails.InvoiceType }}</span>
          </div>
        </div>

        <!-- 退換貨政策 -->
        <div class="infoBox policyBox">
          <h4>退換貨政策</h4>
          <ul>
            <li>本商品適用7天鑑賞期</li>
            <li>商品需保持全新狀態 (未使用、無污損、包裝完整含所有配件)</li>
          </ul>
        </div>

        <!-- 底部按鈕 -->
        <div class="bottomButton">
          <button @click="goToOrderQuery" class="returnBtn">
            訂單查詢
          </button>
        </div>

        <!-- 個人化資料填寫模態框 -->
        <QuesionBox 
          v-if="showModal" 
          :orderData="orderData" 
          @close="closeModal"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import CartTitleBar from "~/components/cart/CartTitleBar.vue";
import QuesionBox from "~/components/QuesionBox.vue";

const route = useRoute();
const router = useRouter();
const orderDetails = ref({});
const orderData = ref({});
const isLoading = ref(true);
const error = ref(null);
const showModal = ref(false);
const userData = JSON.parse(localStorage.getItem("userData"));

// 計算是否有未填寫個人化資料的商品
const hasUnfilledItems = computed(() => {
  if (!orderData.value?.ItemList) return false;
  
  return orderData.value.ItemList.some(item => {
    return !item.PdtSize || !item.Weight || !item.BodySize || !item.Height;
  });
});

const fetchOrderDetails = async () => {
  const saleId = localStorage.getItem('checkoutSALEID');
  
  if (!saleId) {
    console.error('未找到 SALEID');
    error.value = '未找到訂單資訊';
    isLoading.value = false;
    // 跳轉到訂單查詢頁面
    setTimeout(() => {
      router.push('/orderQuery');
    }, 2000);
    return;
  }
  
  try {
    isLoading.value = true;
    error.value = null;
    
    const { data } = await useFetch('https://23700999.com:8081/HMA/api/fr/maSaleSingle', {
      method: 'POST',
      body: {
        MID: userData.MID,
        Token: userData.Token,
        MAID: userData.MAID,
        Mobile: userData.Mobile,
        Lang: 'zhtw',
        SALEID: saleId,
      },
    });

    if (data.value && data.value.Result === 'OK') {
      const saleData = data.value.Sale;
      
      // 儲存完整的訂單資料供 QuesionBox 使用
      orderData.value = saleData;
      
      orderDetails.value = {
        DeliverType: saleData.DeliverTypeName,
        RName: saleData.RName,
        RMobile: saleData.RMobile,
        Address: saleData.Address,
        ProductList: saleData.ItemList.map(item => ({
          ProductID: item.ProductID,
          ProductName: item.ProductName,
          Price: parseInt(item.Price).toLocaleString(),
          Qty: item.Qty,
          DPicture: item.DPicture, // 使用 API 回傳的圖片路徑
        })),
        freight: saleData.freight,
        TotalAmount: parseInt(saleData.TotalAmount).toLocaleString(),
        OrderNo: saleData.SID,
        PayType: saleData.PayTypeName,
        OrderTime: saleData.CheckTime,
        InvoiceType: saleData.InvoiceIDName,
      };
      
      console.log('訂單詳情獲取成功:', orderDetails.value);
      // 成功獲取資料後清除 SALEID
      localStorage.removeItem('checkoutSALEID');
    } else {
      console.error('獲取訂單詳情失敗:', data.value?.Message);
      error.value = data.value?.Message || '獲取訂單詳情失敗';
      // 跳轉到訂單查詢頁面
      setTimeout(() => {
        router.push('/orderQuery');
      }, 3000);
    }
  } catch (err) {
    console.error('獲取訂單詳情時發生錯誤:', err);
    error.value = '獲取訂單詳情時發生錯誤';
    // 跳轉到訂單查詢頁面
    setTimeout(() => {
      router.push('/orderQuery');
    }, 3000);
  } finally {
    isLoading.value = false;
  }
};

const showPersonalizationModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const goToOrderQuery = () => {
  router.push('/orderQuery');
};

const copy = (text) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert("已複製到剪貼簿");
    })
    .catch((err) => {
      console.error("Could not copy text: ", err);
    });
};

onMounted(() => {
  fetchOrderDetails();
});
</script>

<style lang="scss" scoped>
.checkoutSuccessWrap {
  background-color: #f6f6f6;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  place-items: center;
  padding: 0 2.5% 72px;
}

.contentWrap {
  padding: 0 2.5%;
  margin-top: 1rem;
  width: 100%;
}

.infoBox {
  background-color: #fff;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;

  h4 {
    font-size: 1rem;
    font-weight: 700;
    color: #1e1e1e;
    margin-bottom: 0.5rem;
  }
  p {
    font-size: 0.9rem;
    color: #666;
  }
}

// 個人化資訊提示樣式
.personalizationBox {
  background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%);
  border: 1px solid #fecaca;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(236, 79, 79, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  .personalizationContent {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    .personalizationIcon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      background: rgba(236, 79, 79, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .personalizationText {
      flex-grow: 1;
      
      h4 {
        color: #dc2626;
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      
      p {
        color: #991b1b;
        font-size: 0.85rem;
        margin: 0;
      }
    }
    
    .personalizationArrow {
      flex-shrink: 0;
      animation: bounce 2s infinite;
    }
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(0);
  }
  40% {
    transform: translateX(5px);
  }
  60% {
    transform: translateX(3px);
  }
}

.thankYouBox {
  background-color: #f0f9e8;
  border: 1px solid #74bc1f;
  color: #65a31b;
  font-weight: 500;
}

.productBox {
  padding: 1rem 0.5rem;
  .productItem {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 0 0.5rem;

    img {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      object-fit: cover;
    }
    .productInfo {
      flex-grow: 1;
      h4 {
        margin-bottom: 0.25rem;
      }
      h5 {
        color: #74bc1f;
        font-size: 1rem;
        font-weight: 700;
      }
    }
    .quantity {
      color: #666;
    }
  }

  .summary {
    border-top: 1px solid #e5e5e5;
    padding: 1rem 0.5rem 0;
    .summaryRow {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 1rem;
      color: #666;
      font-size: 0.9rem;
      &.total {
        color: #1e1e1e;
        font-weight: 700;
        margin-top: 0.5rem;
        span:last-child {
          color: #ec4f4f;
          font-size: 1.1rem;
        }
      }
    }
  }
}

.orderDetailsBox {
  .detailRow {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    color: #666;
    font-size: 0.9rem;

    &:last-child {
      margin-bottom: 0;
    }

    span:first-child {
      color: #1e1e1e;
    }

    .copyable {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      img {
        cursor: pointer;
        width: 16px;
        height: 16px;
      }
    }
  }
}

.policyBox {
  h4 {
    margin-bottom: 0.75rem;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 0.5rem;
      padding-left: 1rem;
      position: relative;
      
      &:before {
        content: "•";
        position: absolute;
        left: 0;
        color: #74bc1f;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.bottomButton {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 1rem 2.5%;
  border-top: 1px solid #e5e5e5;
  z-index: 100;
  display: flex;
  justify-content: center;
  
  .returnBtn {
    width: 100%;
    max-width: 300px;
    background-color: #74bc1f;
    color: #fff;
    border: none;
    padding: 1rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #65a31b;
    }
  }
}

.loadingBox {
  background-color: #fff;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 0.75rem;

  .loadingSpinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #74bc1f;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  p {
    color: #666;
    font-size: 0.9rem;
  }
}

.errorBox {
  background-color: #fff;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  margin-bottom: 0.75rem;
  border: 1px solid #ec4f4f;

  p {
    color: #ec4f4f;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .redirectMsg {
    color: #666 !important;
    font-size: 0.8rem !important;
    margin-bottom: 0.5rem !important;
  }

  .retryBtn {
    background-color: #74bc1f;
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;

    &:hover {
      background-color: #65a31b;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
