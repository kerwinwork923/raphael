<template>
  <div class="cartTitleBar">
    <img class="goBack" src="/assets/imgs/goBack.svg" alt="返回" />
    <h2>{{ title }}</h2>
    <img class="cart" src="/assets/imgs/cart.svg" alt="購物車" />
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "智慧商城"
  }
});
</script>

<style scoped lang="scss">
.cartTitleBar {
  text-align: center;
  position: relative;
  width: 100%;
  margin-top: 1.25rem;
  img {
    position: absolute;
    top: 0;
    cursor: pointer;
  }
  .goBack {
    left: 0;
  }
  .cart {
    right: 0;
  }
  h2 {
    color: #000;
    text-align: center;
    font-family: "Noto Sans";
    font-size: 24px;
    font-style: normal;
    font-weight: 400;
    line-height: 100%;
    letter-spacing: var(--Static-Body-Large-Tracking, 0.5px);
  }
}</style>

