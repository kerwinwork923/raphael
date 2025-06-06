<template>
  <div class="cartWrap">
    <CartTitleBar />
    <div class="cartContentGroup">
      <div class="cartContentItem" v-for="item in cartItems" :key="item.id">
        <img :src="item.img" :alt="item.name" />
        <h3>{{ item.name }}</h3>
        <h6>NT$1000</h6>
        <small>剩下100件</small>
        <div class="cartContentItemTag">7天保障</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSeo } from "~/composables/useSeo";
import { ref } from "vue";
import test1 from "~/assets/imgs/cart/test1.png";
import test2 from "~/assets/imgs/cart/test2.png";
import test3 from "~/assets/imgs/cart/test3.png";
import test4 from "~/assets/imgs/cart/test4.png";
import CartTitleBar from "~/components/cart/CartTitleBar.vue";

useSeo({
  title: "智慧商城 - NeuroPlus神經調節家",
  description:
    "NeuroPlus神經調節家提供專業的健康管理方案，包含自律神經檢測、健康追蹤等服務，為您的健康把關。",
  url: "https://neuroplus.com.tw/cart",
});

const cartItems = ref([
  {
    id: 1,
    name: "方案一",
    img: test1,
  },
  {
    id: 2,
    name: "方案二",
    img: test2,
  },
  {
    id: 3,
    name: "方案三",
    img: test3,
  },
  {
    id: 4,
    name: "方案四",
    img: test4,
  },
]);
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
  .cartContentItem {
    width: 48%;
    background-color: #fff;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    img {
      height: 220px;
      width: 100%;
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
      margin-top: .5rem;
    }
  }
}
</style>
