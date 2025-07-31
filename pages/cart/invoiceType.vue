<template>
  <div class="invoiceTypeWrap">
    <CartTitleBar title="發票類型" backPath="/cart/pay" />
    <h5>發票類型</h5>
    <div class="invoiceTypeGroup">
      <div class="invoiceType">
        <div class="invoiceTypeRadioGroup">
          <input
            type="radio"
            name="invoiceType"
            id="invoiceType1"
            value="1"
            v-model="selectedInvoiceId"
          />
          <label for="invoiceType1">
            <h4>電子發票</h4>
            <p>{{ getInvoiceContent("電子發票") || "未填寫" }}</p>
          </label>
        </div>
        <img
          @click="router.push('/cart/invoiceSelect1')"
          src="~/assets/imgs/cart/goNext.svg"
          alt=""
        />
      </div>

      <div class="invoiceType">
        <div class="invoiceTypeRadioGroup">
          <input
            type="radio"
            name="invoiceType"
            id="invoiceType2"
            value="2"
            v-model="selectedInvoiceId"
          />
          <label for="invoiceType2">
            <h4>載具</h4>
            <p>{{ getInvoiceContent("載具") || "未填寫" }}</p>
          </label>
        </div>
        <img
          @click="router.push('/cart/invoiceSelect2')"
          src="~/assets/imgs/cart/goNext.svg"
          alt=""
        />
      </div>

      <div class="invoiceType">
        <div class="invoiceTypeRadioGroup">
          <input
            type="radio"
            name="invoiceType"
            id="invoiceType3"
            value="3"
            v-model="selectedInvoiceId"
          />
          <label for="invoiceType3">
            <h4>三聯式發票</h4>
            <p>{{ getInvoiceContent("三聯式發票") || "未填寫" }}</p>
          </label>
        </div>
        <img
          @click="router.push('/cart/invoiceSelect3')"
          src="~/assets/imgs/cart/goNext.svg"
          alt=""
        />
      </div>
    </div>
    <div class="btnGroup">
      <button @click="confirmInvoice">確認</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CartTitleBar from "~/components/cart/CartTitleBar.vue";
import { useCheckoutStore } from "~/stores/checkout";

const router = useRouter();
const userData = JSON.parse(localStorage.getItem("userData"));
const invoiceList = ref([]);
const selectedInvoiceId = ref("1"); // 預設選擇電子發票
const checkoutStore = useCheckoutStore();

const getRelated = async function () {
  try {
    const { data } = await useFetch(
      "https://23700999.com:8081/HMA/api/fr/maGetRelated",
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

    console.log("API 回應資料：", data.value);

    if (data.value?.Result === "OK" && data.value?.MInvoiceList) {
      invoiceList.value = data.value.MInvoiceList;
      console.log("設定發票列表：", invoiceList.value);

      // 如果有發票，優先選擇 Pinia 中的發票
      if (checkoutStore.selectedInvoiceId && invoiceList.value.length > 0) {
        const selectedInvoice = invoiceList.value.find(
          (inv) => String(inv.AID) === String(checkoutStore.selectedInvoiceId)
        );
        if (selectedInvoice) {
          const typeMap = {
            電子發票: "1",
            載具: "2",
            三聯式發票: "3",
          };
          selectedInvoiceId.value = typeMap[selectedInvoice.Desc22] || "1";
          console.log("根據 Pinia 選擇發票類型：", selectedInvoiceId.value);
        }
      }
    } else {
      console.log("API 回應不正確或沒有發票資料");
    }
  } catch (error) {
    console.error("獲取發票資料失敗：", error);
  }
};

const getInvoiceContent = (desc) => {
  const invoice = invoiceList.value.find((invoice) => invoice.Desc22 === desc);
  return invoice ? invoice.Content : null;
};

const confirmInvoice = async () => {
  if (!selectedInvoiceId.value) {
    alert("請選擇發票類型");
    return;
  }

  const typeMap = {
    1: "電子發票",
    2: "載具",
    3: "三聯式發票",
  };

  const selectedTypeName = typeMap[selectedInvoiceId.value];

  console.log("選擇的發票類型：", selectedTypeName);
  console.log("當前發票列表：", invoiceList.value);

  // 先檢查現有的發票資料
  let invoiceDataFromApi = invoiceList.value.find(
    (invoice) => invoice.Desc22 === selectedTypeName
  );

  // 如果沒有找到，重新獲取資料
  if (!invoiceDataFromApi) {
    console.log("未找到發票資料，重新獲取...");
    await getRelated();
    invoiceDataFromApi = invoiceList.value.find(
      (invoice) => invoice.Desc22 === selectedTypeName
    );
  }

  console.log("找到的發票資料：", invoiceDataFromApi);

  if (invoiceDataFromApi && invoiceDataFromApi.AID) {
    checkoutStore.setSelectedInvoice(invoiceDataFromApi.AID);
    console.log("已儲存的發票AID至Pinia：", invoiceDataFromApi.AID);
    router.push("/cart/pay");
  } else {
    console.log("發票資料不完整，顯示錯誤訊息");
    alert(`請先點擊右方箭頭，設定您的「${selectedTypeName}」資訊。`);
  }
};

onMounted(() => {
  getRelated();
});
</script>

<style lang="scss" scoped>
.invoiceTypeWrap {
  background-color: #f6f6f6;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;

  padding: 0 2.5% 72px;
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
  h5 {
    color: $raphael-gray-500;

    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 100%; /* 16px */
    letter-spacing: 0.5px;
    margin-top: 0.75rem;
  }
  .invoiceTypeTitleGroup {
    display: none;
  }
  .invoiceTypeGroup {
    width: 100%;
    background-color: #fff;
    border-radius: 8px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.75rem;

    input {
      width: 24px;
      height: 24px;
      appearance: none;
      border-radius: 50%;
      border: 1px solid var(--Neutral-300, #ccc);
      background: $raphael-white;
      cursor: pointer;
    }
    input:checked {
      border: 1px solid var(--Primary-default, #74bc1f);
      background: var(--Primary-default, #74bc1f);
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      cursor: pointer;
      h4 {
        color: var(--Neutral-black, #1e1e1e);

        font-size: 1rem;
        font-style: normal;
        font-weight: 700;
        line-height: 100%;
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
      p {
        color: $raphael-gray-500;
        font-family: "Noto Sans";
        font-size: 1rem;
        font-style: normal;
        font-weight: 400;
        line-height: 150%; /* 24px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
    }
    img {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
    .invoiceType {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .invoiceTypeRadioGroup {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }
}
</style>
