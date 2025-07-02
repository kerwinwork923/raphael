<template>
  <div class="cartWrap">
    <RaphaelLoading v-if="loading" />
    <CartTitleBar title="商品列表" :showCart="true" backPath="/user" />
    <div class="cartContentGroup">
      <a
        :href="`/cart/product${item.ProductID}?`"
        class="cartContentItem"
        v-for="item in cartItems"
        :key="item.ProductID"
      >
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
    const { data } = await useFetch(
      "https://23700999.com:8081/HMA/api/fr/maProduct",
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
  gap: 1rem;
  padding: 0 2.5%;
  .cartTitleBar {
    max-width: 1440px;
  }

  .cartContentGroup {
    width: 100%;
    max-width: 1440px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(341px, 1fr));
    gap: 1.5rem;
    padding-bottom: 1.5rem;

    .cartContentItem {
      background-color: #fff;
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: all ease 0.2s;

      &:hover {
        box-shadow: 0px 0px 12px #ddd;
      }

      img {
        border-radius: 0.5rem;
        height: 49dvh;
        width: 100%;
        object-fit: cover;
        margin-bottom: 0.5rem;
      }
      h3 {
        color: $raphael-black;
        font-size: 1.25rem;
        font-weight: 700;
        line-height: 100%;
        letter-spacing: 0.15px;
      }
      h6 {
        color: $raphael-green-400;
        font-size: 1rem;
        font-style: normal;
        font-weight: 700;
        line-height: 100%;
        letter-spacing: 0.08px;
      }
      small {
        color: $raphael-gray-400;
        font-size: 1rem;
        font-weight: 400;
        letter-spacing: 0.08px;
      }
      .cartContentItemTag {
        color: $raphael-cyan-400;
        width: fit-content;
        padding: 4px 8px;
        font-size: 0.75rem;
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 12px */
        letter-spacing: 0.06px;
        border-radius: 0.5rem;
        border: 1px solid $raphael-cyan-400;
        background: rgba(31, 188, 179, 0.1);
        margin-top: 0.5rem;
      }
    }
  }
}
</style>
