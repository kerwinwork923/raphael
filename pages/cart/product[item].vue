<template>
  <div class="addCartAlert" v-if="false">
    <div class="addCartAlertTitleGroup">
      <img src="/assets/imgs/cart/test1.png" alt="" />
      <div class="textGroup">
        <h2>方案一</h2>
        <h6>NT$9,999</h6>
      </div>
    </div>
    <div class="addCartAlertHR"></div>
    <div class="addCartAlertOptionGroup">
      <h6>數量</h6>
      <div class="addCartAlertOptionGroupInput">
        <button class="qtyBtn" @click="decreaseQty" :disabled="quantity <= 1">
          -
        </button>
        <span class="qtyNum">{{ quantity }}</span>
        <button class="qtyBtn" @click="increaseQty" :disabled="quantity >= 100">
          +
        </button>
      </div>
    </div>
    <div class="addAlertBtnGroup">
      <button>加入購物車</button>
    </div>

    <div class="closeBtn">
      <img src="/assets/imgs/close.svg" alt="" />
    </div>
  </div>
  <div class="buyCartAlert" v-if="false">
    <div class="addCartAlertTitleGroup">
      <img src="/assets/imgs/cart/test1.png" alt="" />
      <div class="textGroup">
        <h2>方案一</h2>
        <h6>NT$9,999</h6>
      </div>
    </div>
    <div class="addCartAlertHR"></div>
    <div class="addCartAlertOptionGroup">
      <h6>數量</h6>
      <div class="addCartAlertOptionGroupInput">
        <button class="qtyBtn" @click="decreaseQty" :disabled="quantity <= 1">
          -
        </button>
        <span class="qtyNum">{{ quantity }}</span>
        <button class="qtyBtn" @click="increaseQty" :disabled="quantity >= 100">
          +
        </button>
      </div>
    </div>
    <div class="addAlertBtnGroup">
      <button class="buyBtn">立即購買</button>
    </div>

    <div class="closeBtn">
      <img src="/assets/imgs/close.svg" alt="" />
    </div>
  </div>

  <div class="productCartWrap">
    <CartTitleBar />
    <div class="productCartContentGroup">
      <div class="productCartContent">
        <img src="~/assets/imgs/cart/test1.png" alt="" />
        <h2>方案一</h2>
        <h6>NT$9,999</h6>
        <small>剩下 10 件</small>
      </div>
      <div class="productCartContent">
        <h3>配送貨或其他資訊</h3>
        <p>黑貓宅配</p>
      </div>
      <div class="productCartContent">
        <h3>付款方式</h3>
        <p>黑貓宅配</p>
      </div>
      <div class="productCartContent">
        <h3>退換貨政策</h3>
        <ul>
          <li>本商品適用7天鑑賞期</li>
          <li>商品需保持全新狀態（未經使用、無污損、包裝完整含所有配件）</li>
        </ul>
      </div>
      <div class="productCartContent">
        <h3>商品特色</h3>
        <p>
          內容內容內容內容內容內容內容內容內容內容內容內容內容內容內容內容內容內容內容內容
        </p>
      </div>
      <div class="productCartContent">
        <h3>商品詳情</h3>
        <p>詳細內容</p>
        <div class="productCartContentImgGroup">
          <img src="~/assets/imgs/cart/test1.png" alt="" />
          <img src="~/assets/imgs/cart/test1_1.png" alt="" />
        </div>
      </div>
    </div>
    <div class="productOptionGroup">
      <button>加入購物車</button>
      <button>立即購買</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const quantity = ref(1);
const decreaseQty = () => {
  if (quantity.value > 1) quantity.value--;
};
const increaseQty = () => {
  if (quantity.value < 100) quantity.value++;
};
</script>

<style scoped lang="scss">
.productCartWrap {
  background-color: #f6f6f6;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  place-items: center;
  padding: 0 2.5% 72px;
  .productCartContent {
    width: 100%;
    margin-top: 1rem;
    padding: 12px;
    border-radius: 8px;
    background: var(--Neutral-white, #fff);
    h2 {
      color: var(--Neutral-black, #1e1e1e);

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

    h3 {
      color: var(--Neutral-black, #1e1e1e);

      font-size: var(--Text-font-size-16, 16px);
      font-style: normal;
      font-weight: 700;
      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
    }
    p {
      color: var(--Neutral-500, #666);

      font-size: var(--Text-font-size-16, 16px);
      font-style: normal;
      font-weight: 400;
      line-height: 150%;
      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      margin-top: 0.25rem;
    }
    ul {
      margin-top: 0.25rem;
      li {
        color: var(--Neutral-500, #666);

        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 400;
        line-height: 150%;
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
        list-style: disc;
        margin-left: 1.5rem;
      }
    }
    img {
      height: 225px;
      width: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
    .productCartContentImgGroup {
      img {
        margin-top: .5rem;
      }
    }
  }
  .productOptionGroup {
    display: flex;
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 1rem;
    background-color: #f6f6f6;
    gap: 1rem;
    margin-top: 1rem;
    button {
      width: 100%;
      border-radius: 8px;
      background: var(--Primary-default, #74bc1f);
      padding: 8px 12px;
      color: #fff;
      font-size: 1rem;
      border: none;
      letter-spacing: var(--Static-Body-Large-Tracking, 0.5px);
      cursor: pointer;
      &:nth-child(2) {
        background-color: #ec4f4f;
      }
    }
  }
}
.addCartAlert,
.buyCartAlert {
  position: fixed;
  bottom: 0;
  background-color: #fff;
  z-index: 100;
  min-height: 220px;
  width: 100%;
  border-radius: var(--Radius-r-20, 20px) var(--Radius-r-20, 20px) 0 0;
  background: var(--Neutral-white, #fff);
  box-shadow: 0px -4px 12px 0px rgba(0, 0, 0, 0.25);
  padding: 1rem;
  .closeBtn {
    position: absolute;
    top: 2.5%;
    right: 2%;
    cursor: pointer;
  }
  .addCartAlertTitleGroup {
    display: flex;
    align-items: end;
    gap: 1rem;

    img {
      width: 80px;
      height: 80px;
      border-radius: 8px;
    }
    .textGroup {
      h2 {
        font-size: 1.25rem;
        font-weight: 700;
        line-height: 100%;
        letter-spacing: 0.15px;
        line-height: 1.5;
      }
      h6 {
        font-size: 1rem;
        font-weight: 700;
        line-height: 100%;
        letter-spacing: 0.15px;
        color: var(--Primary-default, #74bc1f);
      }
    }
  }
  .addCartAlertHR {
    width: 100%;
    height: 1px;
    background: var(--Neutral-300, #ccc);
    margin: 0.75rem 0;
  }
  .addCartAlertOptionGroup {
    display: flex;
    justify-content: space-between;
    align-items: center;
    h6 {
      color: var(--Neutral-500, #666);
      text-align: center;
      font-family: "Noto Sans";
      font-size: 16px;
      font-style: normal;
      font-weight: 400;

      letter-spacing: 0.08px;
    }
  }
  .addAlertBtnGroup {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;

    button {
      width: 100%;
      border-radius: 8px;
      background: var(--Primary-default, #74bc1f);
      padding: 8px 12px;
      border: none;
      color: #fff;
      font-size: 1rem;
      letter-spacing: var(--Static-Body-Large-Tracking, 2px);
      cursor: pointer;
      &.buyBtn {
        background-color: #ec4f4f;
      }
    }
  }
}
.addCartAlertOptionGroupInput {
  display: flex;
  align-items: center;
  background: #ddeacf;
  border-radius: 8px;
  padding: 2px 8px;
  width: fit-content;
  .qtyBtn {
    background: #ddeacf;
    color: #65a31b;
    border: none;
    border-radius: 12px;
    width: 32px;
    height: 32px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
    &:hover:enabled {
      background: #ddeacf;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  .qtyNum {
    display: inline-block;
    width: 32px;
    text-align: center;
    font-size: 1rem;
    font-weight: 700;
    color: #65a31b;
    background: transparent;
    margin: 0 4px;
    line-height: 32px;
  }
}
</style>
