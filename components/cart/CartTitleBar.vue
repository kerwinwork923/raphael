<template>
  <div class="cartTitleBar">
    <img 
      class="goBack" 
      src="/assets/imgs/goBack.svg" 
      alt="返回" 
      @click="handleGoBack"
    />
    <h2>{{ title }}</h2>
    <img 
      v-if="showCart" 
      class="cart" 
      src="/assets/imgs/cart.svg" 
      alt="購物車" 
      @click="router.push('/cart/cartList')"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  title: {
    type: String,
    default: "智慧商城"
  },
  showCart: {
    type: Boolean,
    default: true
  },
  backPath: {
    type: String,
    default: ''
  }
});

const handleGoBack = () => {
  if (props.backPath) {
    router.push(props.backPath);
  } else {
    router.back();
  }
};
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

