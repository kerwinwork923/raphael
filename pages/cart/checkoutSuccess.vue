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
        <div class="infoBox thankYouBox">
          感謝您的購買，請繼續填寫個人化資訊，以便我們開始製作衣服!
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
              <button class="personalizeBtn">請完成個人化資訊填寫 ></button>
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
               <img src="~/assets/imgs/cart/copy.svg" alt="copy" @click="copy(orderDetails.OrderNo)" />   
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

        <div class="infoBox">
          
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import CartTitleBar from "~/components/cart/CartTitleBar.vue";

const route = useRoute();
const router = useRouter();
const orderDetails = ref({});
const isLoading = ref(true);
const error = ref(null);
const userData = JSON.parse(localStorage.getItem("userData"));

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
      .personalizeBtn {
        font-size: 0.8rem;
        border: 1px solid #1fbcb3;
        color: #1fbcb3;
        background: none;
        border-radius: 20px;
        padding: 0.25rem 0.75rem;
        cursor: pointer;
        margin-top: 0.5rem;
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
