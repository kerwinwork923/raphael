<template>
  <div class="checkoutSuccessWrap">
    <CartTitleBar title="付款詳情" backPath="/cart" />

    <div class="contentWrap">
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
          <img :src="item.Picture" :alt="item.ProductName" />
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
            <!-- <img src="~/assets/imgs/cart/copy.svg" alt="copy" @click="copy(orderDetails.OrderNo)" /> -->
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import CartTitleBar from "~/components/cart/CartTitleBar.vue";

const route = useRoute();
const orderDetails = ref({});
const userData = JSON.parse(localStorage.getItem("userData"));

// const fetchOrderDetails = async () => {
//   const orderId = route.query.id; // 假設訂單 ID 在 query params
//   try {
//     const { data } = await useFetch('YOUR_ORDER_DETAILS_API_ENDPOINT', {
//       method: 'POST',
//       body: {
//         OrderID: orderId,
//         MID: userData.MID,
//         Token: userData.Token,
//         MAID: userData.MAID,
//         Mobile: userData.Mobile,
//         Lang: 'zhtw',
//       },
//     });

//     if (data.value && data.value.Result === 'OK') {
//       orderDetails.value = data.value.OrderData;
//     } else {
//       console.error('Failed to fetch order details:', data.value?.Message);
//     }
//   } catch (error) {
//     console.error('Error fetching order details:', error);
//   }
// };

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
  // fetchOrderDetails();

  // 以下為假資料，請替換為 API 獲取的真實資料
  orderDetails.value = {
    DeliverType: "黑貓宅配",
    RName: "王先生",
    RMobile: "0912 345 678",
    Address: "100 台北市中正區忠孝西路一段66號30樓",
    ProductList: [
      {
        ProductID: "1",
        ProductName: "方案一",
        Price: "9,999",
        Qty: "1",
        Picture:
          "https://fastly.picsum.photos/id/292/200/200.jpg?hmac=r-jS_cv0sY62AnW7d_yAn5I5lIqH2I3r-QoZw4Tto2s",
      },
      {
        ProductID: "2",
        ProductName: "方案二",
        Price: "9,999",
        Qty: "1",
        Picture:
          "https://fastly.picsum.photos/id/450/200/200.jpg?hmac=3-3jTz1p4m_60z5v2vJ2tD3jX9y2yJu63Vj0FjF22lE",
      },
    ],
    freight: "0",
    TotalAmount: "19,998",
    OrderNo: "123456789ABCDE",
    PayType: "線上付款",
    OrderTime: "2025/05/20 12:00",
    InvoiceType: "電子發票",
  };
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
      width: 60px;
      height: 60px;
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
</style>
