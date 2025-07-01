<template>
  <div class="payWrap">
    <Privacy :visible="showPrivacy" @update:visible="showPrivacy = $event" />
    <CartTitleBar title="結帳" backPath="/cart/cartList" :showCart="false"/>
    <div class="payContentWrap">
      <div class="payContent">
        <div class="seleteItem" v-for="item in cartList" :key="item.ProductID">
          <div class="seleteItemGroup1">
            <img :src="item.Picture" :alt="item.ProductName" />
            <div class="seleteItemGroup1Text">
              <h3>{{ item.ProductName }}</h3>
              <h6>NT${{ item.Price }}</h6>
            </div>
          </div>
          <div class="seleteItemGroup2">x{{ item.Qty }}</div>
        </div>
        <div class="payContentHR"></div>
        <div class="sendMethod">
          <h5>寄送方式</h5>
          <h6 @click="router.push('/cart/payMethod')">查看更多 <img src="~/assets/imgs/cart/goNext.svg" alt="" /></h6>
        </div>
        <div class="sendContnet" v-if="selectedAddress && deliverList.length > 0">
          <div class="sendContnetTitle">
            <h5>{{ deliverList[0].Name }}</h5>
          </div>
          <p>預計 3~5 個工作天</p>
          <p>{{ selectedAddress.Address }}</p>
          <p>{{ selectedAddress.RName }}．{{ selectedAddress.RMobile }}</p>
        </div>
        <div class="sendContnet" v-else @click="router.push('/cart/payMethod')">
          <div class="sendContnetTitle">
            <h5>黑貓宅配</h5>
          </div>
          <p>請新增寄送地址</p>
        </div>

        <div class="payContentHR"></div>
        <div class="totalPriceGroup">
          <h4>{{ productCount }}個商品</h4>
          <h5>NT${{ formattedTotalAmount }}</h5>
        </div>
      </div>
      <div class="payContent">
        <h3>付款方式</h3>
        <!-- 前端固定線上付款 -->
        <h5 >
          <img src="/assets/imgs/cart/cash.svg" alt="" />
          線上付款
        </h5>

      </div>
      <div class="payContent">
        <h3>付款詳情</h3>
        <!-- <div class="sendPayGroup">
          <h5>運費</h5>
          <h6>NT$100</h6>
        </div> -->
        <div class="totalPayGroup">
          <h5>訂單總金額</h5>
          <h6>NT${{ formattedTotalAmount }}</h6>
        </div>
      </div>
      <div class="payContent">
        <h3>退換貨政策</h3>
        <ul>
          <li>本商品適用7天鑑賞期</li>
          <li>商品需保持全新狀態（未經使用、無污損、包裝完整含所有配件）</li>
        </ul>
      </div>
      <div class="payContent">
        <div class="payContentTitleGroup">
          <h3>發票類型</h3>
          <h6 @click="router.push('/cart/invoiceType')">查看更多 <img src="~/assets/imgs/cart/goNext.svg" alt="" /></h6>
        </div>
        <h5 v-if="selectedInvoice">{{ selectedInvoice.Desc22 }} {{ selectedInvoice.Content }}</h5>
        <h5 v-else @click="router.push('/cart/invoiceType')" style="cursor: pointer">請選擇發票類型</h5>
      </div>
      <div class="payContent payContentCheckout">
        <div class="allPrice">總付款金額 NT${{ finalTotal }}</div>
        <button @click="checkout">結帳</button>
      </div>
      <div class="privacyGroup">
        結帳完成視為已同意
        <span @click="showPrivacy = true" style="cursor:pointer; color:#1fbcb3; text-decoration:underline;">條款與規則</span>。
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import CartTitleBar from "~/components/cart/CartTitleBar.vue";
import Privacy from "~/components/Privacy.vue";
import { useCheckoutStore } from "~/stores/checkout";

const router = useRouter();
const route = useRoute();
const checkoutStore = useCheckoutStore();
const userData = JSON.parse(localStorage.getItem("userData"));

if (!userData) {
  router.push("/user");
}
const cartList = ref([]);
const totalAmount = ref(0);

const payList = ref([]);
const deliverList = ref([]);
const returnPolicyList = ref([]);
const crNameList = ref([]);
const mInvoiceList = ref([]);

const selectedAddress = ref(null);
const selectedInvoice = ref(null);
const selectedPayment = ref(null);

// 從 Pinia 獲取選中的商品資料
const loadSelectedCartItems = () => {
  if (checkoutStore.selectedCartItems.length === 0) {
    console.log("沒有選中的商品，跳轉回購物車");
    router.push("/cart/cartList");
    return;
  }
  
  cartList.value = checkoutStore.selectedCartItems;
  totalAmount.value = checkoutStore.selectedTotalAmount;
  
  console.log("從 Pinia 載入選中商品:", cartList.value);
  console.log("總金額:", totalAmount.value);
  console.log("商品詳細資訊:");
  cartList.value.forEach(item => {
    console.log(`商品: ${item.ProductName}, 單價: ${item.Price}, 數量: ${item.Qty}, 小計: ${item.Amount}`);
  });
};

const updateSelectedItems = () => {
  console.log("更新選擇項目，Pinia 地址ID:", checkoutStore.selectedAddressId);
  console.log("更新選擇項目，Pinia 發票ID:", checkoutStore.selectedInvoiceId);
  
  // 寄送方式：如果 Pinia 有值就用 Pinia 的，否則用最新的地址
  if (checkoutStore.selectedAddressId && crNameList.value.length > 0) {
    selectedAddress.value = crNameList.value.find((addr) => 
      String(addr.AID) === String(checkoutStore.selectedAddressId)
    );
    console.log("找到選擇的地址:", selectedAddress.value);
  } else if (crNameList.value.length > 0) {
    const sortedAddresses = crNameList.value.sort((a, b) => 
      new Date(b.CheckTime) - new Date(a.CheckTime)
    );
    selectedAddress.value = sortedAddresses[0];
    console.log("使用預設地址:", selectedAddress.value);
  }

  // 付款方式：使用 PayList 的第一個
  if (payList.value.length > 0) {
    selectedPayment.value = payList.value[0];
  }

  // 發票：如果 Pinia 有值就用 Pinia 的，否則用 MInvoiceList 的第一個
  if (checkoutStore.selectedInvoiceId && mInvoiceList.value.length > 0) {
    selectedInvoice.value = mInvoiceList.value.find((inv) => 
      String(inv.AID) === String(checkoutStore.selectedInvoiceId)
    );
    console.log("找到選擇的發票:", selectedInvoice.value);
  } else if (mInvoiceList.value.length > 0) {
    selectedInvoice.value = mInvoiceList.value[0];
    console.log("使用預設發票:", selectedInvoice.value);
  }
};

const fetchRelatedData = async () => {
  try {
    const { data } = await useFetch("https://23700999.com:8081/HMA/api/fr/maGetRelated", {
      method: "POST",
      body: {
        MID: userData.MID,
        Token: userData.Token,
        MAID: userData.MAID,
        Mobile: userData.Mobile,
        Lang: "zhtw",
      },
    });

    if (data.value?.Result === "OK") {
      const result = data.value;
      payList.value = result.PayList || [];
      deliverList.value = result.DeliverList || [];
      returnPolicyList.value = result.ReturnPolicyList || [];
      crNameList.value = result.CRNameList || [];
      mInvoiceList.value = result.MInvoiceList || [];

      console.log("相關資料獲取完成，地址列表:", crNameList.value);
      console.log("相關資料獲取完成，發票列表:", mInvoiceList.value);
      
      updateSelectedItems();
    }
  } catch (error) {
    console.error("獲取相關資料失敗：", error);
  }
};

const loadAllData = async () => {
  // 先載入選中的商品資料
  loadSelectedCartItems();
  
  // 然後獲取相關資料（地址、發票等）
  await fetchRelatedData();
};

// 監聽 Pinia store 的變化
watch(() => [checkoutStore.selectedAddressId, checkoutStore.selectedInvoiceId], () => {
  console.log("Pinia store 變化 detected");
  if (crNameList.value.length > 0 || mInvoiceList.value.length > 0) {
    updateSelectedItems();
  }
}, { immediate: true });

// 監聽路由變化，當返回此頁面時重新獲取資料
watch(() => route.path, (newPath) => {
  if (newPath === '/cart/pay') {
    console.log("返回結帳頁面，重新載入資料");
    loadAllData();
  }
});

const productCount = computed(() => {
  return cartList.value.reduce((total, item) => total + parseInt(item.Qty, 10), 0);
});

const formattedTotalAmount = computed(() => {
  return parseInt(totalAmount.value, 10).toLocaleString();
});

const finalTotal = computed(() => {
  const subtotal = parseInt(totalAmount.value, 10) || 0;
  const total = subtotal ;
  console.log(`計算最終總額: 商品總額 ${subtotal}  = ${total}`);
  return total.toLocaleString();
});

const checkout = async () => {
  try {
    // 檢查必要資料
    if (!selectedAddress.value) {
      alert("請選擇寄送地址");
      return;
    }

    if (!selectedInvoice.value) {
      alert("請選擇發票類型");
      return;
    }

    // 準備購物車資料
    const cartData = cartList.value.map(item => ({
      ProductID: item.ProductID,
      Qty: item.Qty
    }));

    // 準備結帳資料
    const checkoutData = {
      MID: userData.MID,
      Token: userData.Token,
      MAID: userData.MAID,
      Mobile: userData.Mobile,
      Lang: "zhtw",
      Cart: cartData,
      freight: "0",
      DeliverType: deliverList.value[0]?.Type || "1",
      PayType: payList.value[0]?.Type || "1",
      ReturnPolicyType: returnPolicyList.value[0]?.Type || "1",
      InvoiceID: selectedInvoice.value.InvoiceID,
      RName: selectedAddress.value.RName,
      RMobile: selectedAddress.value.RMobile,
      Address: selectedAddress.value.Address
    };

    console.log("結帳資料:", checkoutData);

    const { data } = await useFetch("https://23700999.com:8081/HMA/api/fr/maCheckoutCart", {
      method: "POST",
      body: checkoutData,
    });

    if (data.value?.Result === "OK") {
      console.log("結帳成功:", data.value);
      
      // 清除 Pinia 中的選中商品資料
      checkoutStore.clearCheckoutData();
      
      // 處理綠界金流表單
      if (data.value.htmlForm) {
        // 解碼 HTML 表單
        const decodedHtml = decodeURIComponent(data.value.htmlForm);
        console.log("解碼後的 HTML 表單:", decodedHtml);
        
        // 創建一個臨時的 div 來放置表單
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = decodedHtml;
        tempDiv.style.display = 'none';
        
        // 將表單添加到頁面
        document.body.appendChild(tempDiv);
        
        // 找到表單並自動提交
        const form = tempDiv.querySelector('form');
        if (form) {
          console.log("找到付款表單，準備提交");
          form.submit();
        } else {
          console.error("未找到付款表單");
          alert("付款表單載入失敗");
        }
      } 
      else {
        alert("結帳成功！");
        router.push("/cart/Finish");
      }
    } else {
      console.error("結帳失敗:", data.value);
      alert(`結帳失敗: ${data.value?.Message || "未知錯誤"}`);
    }
  } catch (error) {
    console.error("結帳時發生錯誤：", error);
    alert("結帳時發生錯誤，請稍後再試");
  }
};

onMounted(() => {
  console.log("結帳頁面 mounted");
  loadAllData();
});

const showPrivacy = ref(false);
</script>

<style scoped lang="scss"></style>

<style scoped lang="scss">
.payWrap {
  background-color: #f6f6f6;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  place-items: center;
  padding: 0 2.5% 72px;

  .payContentWrap {
    width: 100%;
    margin-top: 1rem;
  }
  .payContent {
    width: 100%;
    background-color: #fff;
    border-radius: 8px;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    .seleteItem {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      .seleteItemGroup1 {
        display: flex;
        align-items: center;
        gap: 1rem;
        img {
          width: 80px;
          height: 80px;
          border-radius: 8px;
        }
        .seleteItemGroup1Text {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          h3 {
            font-size: 1rem;
            font-weight: 700;
            color: #1e1e1e;
          }
          h6 {
            font-size: 1rem;
            font-weight: 700;
            color: #74bc1f;
          }
        }
      }
      .seleteItemGroup2 {
        color: var(--Neutral-500, #666);
        text-align: center;

        font-size: 14px;
        font-style: normal;
        font-weight: 400;

        letter-spacing: 1px;
      }
    }
    .sendMethod {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.25rem;
      h5 {
        font-size: 1rem;
        font-weight: 700;
      }
      h6 {
        color: var(--Neutral-500, #666);
        text-align: center;
        font-size: var(--Text-font-size-14, 14px);
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.07px;
        display: flex;
      }
    }
    .payContentHR {
      width: 100%;
      height: 1px;
      background-color: #e5e5e5;
      margin: 0.65rem 0;
    }
    .sendContnet {
      border-radius: var(--Radius-r-8, 8px);
      border: 1px solid var(--Primary-hover, #65a31b);
      background: var(--Primary-100, #fcfff7);
      padding: 0.5rem;
      margin-top: 0.5rem;
      .sendContnetTitle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        h5 {
          font-size: 1rem;
          font-weight: 700;
        }
      }
      p {
        color: var(--Neutral-500, #666);
        font-family: "Noto Sans";
        font-size: var(--Text-font-size-14, 14px);
        font-style: normal;
        font-weight: 400;
        line-height: 130%; /* 21px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
    }
    .totalPriceGroup {
      display: flex;
      align-items: center;
      justify-content: space-between;
      h4 {
        color: var(--Neutral-500, #666);
        font-family: "Noto Sans";
        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 16px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
      h5 {
        color: var(--Primary-default, #74bc1f);
        font-family: "Noto Sans";
        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 700;
        line-height: 150%; /* 24px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
    }

    h3 {
      color: var(--Neutral-black, #1e1e1e);
      font-family: "Noto Sans";
      font-size: var(--Text-font-size-16, 16px);
      font-style: normal;
      font-weight: 700;
      line-height: 100%; /* 16px */
      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      margin-bottom: 0.25rem;
    }
    h5 {
      color: var(--Neutral-500, #666);
      font-family: "Noto Sans";
      font-size: var(--Text-font-size-16, 16px);
      font-style: normal;
      font-weight: 400;
      line-height: 150%; /* 24px */
      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
    }
    .sendPayGroup {
      display: flex;
      align-items: center;
      justify-content: space-between;
      h5 {
        color: var(--Neutral-500, #666);
      }
      h6 {
        color: var(--Neutral-black, #1e1e1e);

        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 400;
      }
    }
    .totalPayGroup {
      display: flex;
      align-items: center;
      justify-content: space-between;
      h5 {
        color: var(--Warning-default, #ec4f4f);

        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 400;
        line-height: 150%; /* 24px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
      h6 {
        color: var(--Warning-default, #ec4f4f);

        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 700;
        line-height: 150%; /* 24px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
    }
    ul {
      li {
        list-style: disc;
        margin-left: 1.5rem;
        color: var(--Neutral-500, #666);

        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 400;
        line-height: 150%; /* 24px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
    }
    .payContentTitleGroup {
      display: flex;
      align-items: center;
      justify-content: space-between;
      h6 {
        color: var(--Neutral-500, #666);
        text-align: center;

        font-size: var(--Text-font-size-14, 14px);
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 14px */
        letter-spacing: 0.07px;
        display: flex;
        align-items: center;
      }
    }
  }
  .payContentCheckout {
    text-align: right;
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 0.35rem;
    .allPrice {
      color: var(--Warning-default, #ec4f4f);
      font-size: var(--Text-font-size-14, 14px);
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.07px;
    }
    button {
      color: #fff;
      padding: 0.5rem 1rem;

      background: var(--Primary-default, #74bc1f);
      border: none;
      cursor: pointer;
      border-radius: 8px;
    }
  }
  .privacyGroup {
    text-align: center;
    color: var(--Neutral-500, #666);

    font-size: var(--Text-font-size-14, 14px);
    font-style: normal;
    font-weight: 400;
    line-height: 100%;
    letter-spacing: 0.07px;
    span {
      color: var(--Secondary-default, #1fbcb3);
    }
  }
}
</style>

