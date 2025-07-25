<template>
  <div class="invoiceSelect1Wrap" >
    <CartTitleBar title="編輯載具" href="/cart/invoiceType" />
    <h5>請輸入您常用的載具號碼</h5>
    <div class="invoiceSelect2InputGroup">
      <div class="invoiceGroup">
        <img class="icon1" src="/assets/imgs/cart/cloudy.svg" alt="" />
        <input type="text" v-model="invoiceContent" placeholder="請輸入載具號碼" />
      </div>
    </div>
    <div class="btnGroup">
      <button @click="submit" :disabled="isLoading">
        {{ isLoading ? '提交中...' : '提交' }}
      </button>
    </div>
  </div>
</template>

<script setup>
const router = useRouter();
const invoiceContent = ref("");
const isLoading = ref(false);
const userData = JSON.parse(localStorage.getItem("userData"));
const setInvoice = async function(){
  try {
    const { data } = await useFetch("https://23700999.com:8081/HMA/api/fr/maSetInvoice", {
      method: "POST",
      body: {
        MID: userData.MID,
        Token: userData.Token,
        MAID: userData.MAID,
        Mobile: userData.Mobile,
        Lang: "zhtw",
        InvoiceID : "2", // 1:電子發票2.載具3.三聯式發票
        Content : invoiceContent.value,
      },
    });
    
    if (data.value?.Result === "OK") {
      return true;
    } else {
      alert("設定載具失敗，請稍後再試");
      return false;
    }
  } catch (error) {
    console.error("設定載具錯誤：", error);
    alert("設定載具失敗，請稍後再試");
    return false;
  }
}

const submit = async function(){
  // 載具格式以「/」開頭，共8碼（包含符號）
  if(!invoiceContent.value.startsWith("/")){
    alert("載具格式錯誤");
    return;
  }
  if(invoiceContent.value.length !== 8){
    alert("載具號碼長度錯誤");
    return;
  }

  isLoading.value = true;
  try {
    const success = await setInvoice();
    if (success) {
      router.push("/cart/invoiceType");
    }
  } finally {
    isLoading.value = false;
  }
}
</script>
<style lang="scss" scoped>
.invoiceSelect1Wrap {
  background-color: #f6f6f6;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;

  padding: 0 2.5% 72px;
  
  .invoiceSelect2InputGroup {
    width: 100%;
    margin-top: 0.75rem;
    padding: 8px 12px;
    background-color: #fff;
    border-radius: 10px;
  }
  h5 {
    color: var(--Neutral-500, #666);

    margin-top: 1rem;
    font-size: 16px;
    font-style: normal;
  }
  .nameGroup,
  .heightGroup,
  .weightGroup,
  .dateGroup,
  .phoneGroup,
  .invoiceGroup {
    position: relative;
    margin-bottom: 1rem;
    z-index: 1000;
    .icon1 {
      position: absolute;
      top: 50%;
      left: 2px;
      transform: translateY(-50%);
      z-index: 2;
    }

    .icon2 {
      position: absolute;
      top: 50%;
      right: 2px;
      transform: translateY(-50%);
      width: 18px;
      z-index: 1;
    }
  }
  input[type="text"],
  input[type="password"],
  input[type="number"],
  input[type="email"] {
    outline: none;
    border: none;
    border-bottom: 1px solid $raphael-gray-300;
    font-size: 1.2rem;
    width: 100%;
    padding-left: 36px;
    padding-bottom: 16px;
    padding-top: 16px;
    color: $raphael-black;
    &::placeholder {
      color: $raphael-gray-300;
      font-family: Inter;
      font-size: 1.2rem;
      font-weight: 400;
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
      
      &:disabled {
        background: var(--Neutral-300, #ccc);
        cursor: not-allowed;
      }
    }
  }
}
</style>
