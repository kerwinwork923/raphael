<template>
  <div class="payMethodWrap">
    <CartTitleBar title="寄送方式" backPath="/cart/pay" />
    <div class="payMethodTitleGroup">
      <h5>支援物流</h5>
      <h6 @click="router.push('/cart/addAddress')">新增地址 <img src="~/assets/imgs/cart/goNextRed.svg" alt="" /></h6>
    </div>
    <div class="payMethodGroup">
      <div class="payMethodTitle">
        <h4>{{ deliverInfo?.Name || '黑貓宅配' }}</h4>
        <h5>免運費</h5>
      </div>
      <p>預計送達時間 5月20日~5月25日</p>
      <template v-for="address in addressList" :key="address.AID">
        <div class="payMethodHR"></div>
        <div class="payMethodContent">
          <input
            type="radio"
            name="payMethod"
            :id="`payMethod${address.AID}`"
            :value="address.AID"
            v-model="selectedAddressId"
          />
          <label :for="`payMethod${address.AID}`">
            <h4>{{ address.RName }}</h4>
            <h5>{{ address.RMobile }}</h5>
            <h5>{{ address.Address }}</h5>
          </label>
          <div class="delete" @click="deleteAddress(address.AID)">
            <img src="~/assets/imgs/cart/delete.svg" alt="" />
          </div>
        </div>

      </template>
      <div class="payMethodHR" v-if="addressList.length > 0"></div>
    </div>
    
    <div class="btnGroup" v-if="addressList.length > 0">
      <button @click="confirmAddress">確認</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CartTitleBar from "~/components/cart/CartTitleBar.vue";
import { useCheckoutStore } from '~/stores/checkout';

const router = useRouter();
const userData = JSON.parse(localStorage.getItem("userData"));
const addressList = ref([]);
const deliverInfo = ref(null);
const selectedAddressId = ref("");
const checkoutStore = useCheckoutStore();

const getmaGetRelated = async function() {
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
      // 獲取收件人地址列表
      if (data.value?.CRNameList) {
        addressList.value = data.value.CRNameList;
        // 如果有地址，優先選擇 Pinia 中的地址，否則選擇第一個
        if (addressList.value.length > 0) {
          if (checkoutStore.selectedAddressId) {
            selectedAddressId.value = checkoutStore.selectedAddressId;
          } else {
            selectedAddressId.value = addressList.value[0].AID;
          }
        }
      }
      
      // 獲取配送方式資訊
      if (data.value?.DeliverList && data.value.DeliverList.length > 0) {
        deliverInfo.value = data.value.DeliverList[0];
      }
    }
  } catch (error) {
    console.error("獲取相關資料失敗：", error);
  }
};

const deleteAddress = async (addressId) => {
  if (confirm("確定要刪除此地址嗎？")) {
    try {
      const { data } = await useFetch(
        "https://23700999.com:8081/HMA/api/fr/maDeleteCName",
        {
          method: "POST",
          body: {
            MID: userData.MID,
            Token: userData.Token,
            MAID: userData.MAID,
            Mobile: userData.Mobile,
            Lang: "zhtw",
            AID: addressId,
          },
        }
      );

      if (data.value?.Result === "OK") {
        console.log("地址刪除成功");
        await getmaGetRelated();
      } else {
        alert(`刪除地址失敗: ${data.value?.Message || "未知錯誤"}`);
      }
    } catch (error) {
      console.error("刪除地址失敗：", error);
      alert("刪除地址時發生錯誤");
    }
  }
};

const confirmAddress = () => {
  if (!selectedAddressId.value) {
    alert("請選擇收件地址");
    return;
  }
  
  checkoutStore.setSelectedAddress(selectedAddressId.value);
  console.log("已儲存的地址AID至Pinia：", selectedAddressId.value);
  router.push("/cart/pay");
};

onMounted(() => {
  getmaGetRelated();
});
</script>

<style lang="scss" scoped>
.payMethodWrap {
  background-color: #f6f6f6;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  place-items: center;
  padding: 0 2.5% 72px;
  .payMethodTitleGroup {
    display: none;
  }
  .payMethodGroup {
    width: 100%;
    background-color: #fff;
    border-radius: 8px;
    padding: 0.75rem;
    p {
      color: var(--Neutral-500, #666);

      font-size: var(--Text-font-size-14, 14px);
      font-style: normal;
      font-weight: 400;
      margin-top: 0.5rem; /* 21px */
      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
    }
  }

  .payMethodTitleGroup {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    h5 {
      color: var(--Neutral-500, #666);
      text-align: center;
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.5px;
    }
    h6 {
      color: var(--Warning-default, #ec4f4f);
      text-align: center;

      font-size: var(--Text-font-size-14, 14px);
      font-style: normal;
      font-weight: 400;
      line-height: 1.5;
      display: flex;
      align-items: center;
      gap: 0.05rem;
    }
  }
  .payMethodHR {
    width: 100%;

    height: 1px;
    background-color: #e5e5e5;
    margin: 1rem 0;
  }
  .payMethodTitle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    h4 {
      color: var(--Neutral-black, #1e1e1e);

      font-size: var(--Text-font-size-16, 16px);
      font-style: normal;
      font-weight: 700;
      line-height: 100%; /* 16px */
      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
    }
    h5 {
      color: var(--Neutral-500, #666);

      font-size: var(--Text-font-size-14, 14px);
      font-style: normal;
      font-weight: 400;
      line-height: 100%; /* 14px */
      letter-spacing: 0.07px;
    }
  }
  .payMethodContent {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    label{
      width: 100%;
    }
    input {
      width: 24px;
      height: 20px;
      appearance: none;
      border-radius: 50%;
      border: 1px solid var(--Neutral-300, #ccc);
      background: var(--Neutral-white, #fff);
    }
    input:checked {
      border: 1px solid var(--Primary-default, #74bc1f);
      background: var(--Primary-default, #74bc1f);
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      h4 {
        color: var(--Neutral-black, #1e1e1e);

        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 700;
        line-height: 100%;
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
      h5 {
        color: var(--Neutral-500, #666);

        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 24px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
    }
    .delete{
      cursor: pointer;
      width: 26px;
    }
  }
  .btnGroup {
    width: 100%;
    display: flex;
    justify-content: center;
    position: fixed;
    bottom: 5%;
    left: 0;
    button {
      width: 95%;
      border: none;
      color: #fff;
      padding: 8px 12px;
      border-radius: 8px;
      background: var(--Primary-default, #74bc1f);
      cursor: pointer;
    }
  }
}
</style>
