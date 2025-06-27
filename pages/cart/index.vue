<template>
  <div class="cartWrap">
    <RaphaelLoading v-if="loading" />
    <CartTitleBar title="商品列表" :showCart="true" backPath="/user" />
    <div class="cartContentGroup">
    
      <a :href="`/cart/product${item.ProductID}?`" class="cartContentItem" v-for="item in cartItems" :key="item.ProductID">
        <img :src="item.FPicture" :alt="item.ProductName" />
        <h3>{{ item.ProductName }}</h3>
        <h6>NT${{ item.Price }}</h6>
        <small>{{ item.DeliverName }}</small>
        <div class="cartContentItemTag">{{ item.Label }}</div>
      </a>
      
 
    </div>
  </div>
</template>

<script setup>
import { useSeo } from "~/composables/useSeo";
import { ref } from "vue";

import CartTitleBar from "~/components/cart/CartTitleBar.vue";
import RaphaelLoading from "~/components/RaphaelLoading.vue";

useSeo({
  title: "智慧商城 - NeuroPlus神經調節家",
  description:
    "NeuroPlus神經調節家提供專業的健康管理方案，包含自律神經檢測、健康追蹤等服務，為您的健康把關。",
  url: "https://neuroplus.com.tw/cart",
});

const userData = JSON.parse(localStorage.getItem("userData"));
const cartItems = ref([]);
const loading = ref(true);

const fetchProductList = async () => {
  try {
    loading.value = true;
    const { data } = await useFetch("https://23700999.com:8081/HMA/api/fr/maProduct", {
      method: "POST",
      body: {
        MID: userData.MID,
        Token: userData.Token,
        MAID: userData.MAID,
        Mobile: userData.Mobile,
        Lang: "zhtw",
      },
    });
    
    if (data.value?.Result === "OK" && data.value?.RetMaProduct) {
      cartItems.value = data.value.RetMaProduct;
    }
  } catch (error) {
    console.error("獲取商品列表失敗：", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProductList();
});
</script>

<style scoped lang="scss">
.cartWrap {
  background-color: #f6f6f6;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  place-items: center;
  padding: 0 2.5%;
}

.cartContentGroup {
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 1rem;
  @include respond-to("tablet-up") {
    max-width: 1440px;
  }
  .cartContentItem {
    width: 48%;
    background-color: #fff;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    @include respond-to("tablet-up") {
      width: 32.3%;
    }
    img {
      height: 220px;
      width: 100%;
      @include respond-to("tablet-up") {
        height: 300px;
      }
    }
    h3 {
      color: var(--Neutral-black, #1e1e1e);
      font-family: "Noto Sans";
      font-size: var(--Text-font-size-20, 20px);
      font-style: normal;
      font-weight: 700;
      line-height: 100%;
      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      margin-top: 0.5rem;
    }
    h6 {
      color: var(--Primary-default, #74bc1f);
      margin-top: 0.4rem;
      font-size: var(--Text-font-size-16, 16px);
      font-style: normal;
      font-weight: 700;
      line-height: 100%;
      letter-spacing: 0.08px;
      margin-bottom: 0.5rem;
    }
    small {
      color: var(--Neutral-400, #b3b3b3);
      text-align: center;

      font-size: var(--Text-font-size-16, 16px);

      font-weight: 400;

      letter-spacing: 0.08px;
      margin-bottom: 1rem;
    }
    .cartContentItemTag {
      color: var(--Secondary-default, #1fbcb3);
      display: block;
      width: fit-content;
      padding: 4px 8px;
      font-family: "Noto Sans";
      font-size: var(--Text-font-size-12, 12px);
      font-style: normal;
      font-weight: 400;
      line-height: 100%; /* 12px */
      letter-spacing: 0.06px;
      border-radius: var(--Radius-r-8, 8px);
      border: 1px solid var(--Secondary-default, #1fbcb3);
      background: var(--secondary-400-opacity-10, rgba(31, 188, 179, 0.1));
      margin-top: 0.5rem;
    }
  }
}
</style>
