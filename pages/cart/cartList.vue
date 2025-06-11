<template>
  <div class="cartListWrap">
    <CartTitleBar title="購物車" :showCart="true"
    backPath="/cart"/>

    <div class="cartListContentWrap">
      <div class="cartListContent">
        <input type="checkbox" />
        <div class="cartContentGroup">
          <img src="~/assets/imgs/cart/test1.png" alt="" />
          <div class="cartContentGroupText">
            <h3>方案一</h3>
            <h6>NT$9,999</h6>
            <small>剩下 10 件</small>
          </div>
          <div class="addCartAlertOptionGroup">
            <div class="addCartAlertOptionGroupInput">
              <button
                class="qtyBtn"
                @click="decreaseQty"
                :disabled="quantity <= 1"
              >
                -
              </button>
              <span class="qtyNum">{{ quantity }}</span>
              <button
                class="qtyBtn"
                @click="increaseQty"
                :disabled="quantity >= 100"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div class="deleteBtn">
          <img src="~/assets/imgs/cart/delete.svg" alt="刪除" />
        </div>
      </div>
      <div class="cartListContent">
        <input type="checkbox" />
        <div class="cartContentGroup">
          <img src="~/assets/imgs/cart/test1.png" alt="" />
          <div class="cartContentGroupText">
            <h3>方案一</h3>
            <h6>NT$9,999</h6>
            <small>剩下 10 件</small>
          </div>
          <div class="addCartAlertOptionGroup">
            <div class="addCartAlertOptionGroupInput">
              <button
                class="qtyBtn"
                @click="decreaseQty"
                :disabled="quantity <= 1"
              >
                -
              </button>
              <span class="qtyNum">{{ quantity }}</span>
              <button
                class="qtyBtn"
                @click="increaseQty"
                :disabled="quantity >= 100"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div class="deleteBtn">
          <img src="~/assets/imgs/cart/delete.svg" alt="刪除" />
        </div>
      </div>
      <div class="cartListContent">
        <input type="checkbox" />
        <div class="cartContentGroup">
          <img src="~/assets/imgs/cart/test1.png" alt="" />
          <div class="cartContentGroupText">
            <h3>方案一</h3>
            <h6>NT$9,999</h6>
            <small>剩下 10 件</small>
          </div>
          <div class="addCartAlertOptionGroup">
            <div class="addCartAlertOptionGroupInput">
              <button
                class="qtyBtn"
                @click="decreaseQty"
                :disabled="quantity <= 1"
              >
                -
              </button>
              <span class="qtyNum">{{ quantity }}</span>
              <button
                class="qtyBtn"
                @click="increaseQty"
                :disabled="quantity >= 100"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div class="deleteBtn">
          <img src="~/assets/imgs/cart/delete.svg" alt="刪除" />
        </div>
      </div>
      <div class="cartListContent">
        <input type="checkbox" />
        <div class="cartContentGroup">
          <img src="~/assets/imgs/cart/test1.png" alt="" />
          <div class="cartContentGroupText">
            <h3>方案一</h3>
            <h6>NT$9,999</h6>
            <small>剩下 10 件</small>
          </div>
          <div class="addCartAlertOptionGroup">
            <div class="addCartAlertOptionGroupInput">
              <button
                class="qtyBtn"
                @click="decreaseQty"
                :disabled="quantity <= 1"
              >
                -
              </button>
              <span class="qtyNum">{{ quantity }}</span>
              <button
                class="qtyBtn"
                @click="increaseQty"
                :disabled="quantity >= 100"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div class="deleteBtn">
          <img src="~/assets/imgs/cart/delete.svg" alt="刪除" />
        </div>
      </div>
    </div>

    <div class="cartListFooter">
      <div class="cartListFooterContent1">
        <input type="checkbox" />
        <label for="">全選</label>
      </div>
      <div class="cartListFooterContent2">
        <h5>總計 NT$39,996</h5>
        <button>去買單</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import CartTitleBar from "~/components/cart/CartTitleBar.vue";

const cartList = ref([]);
const quantity = ref(1);
const decreaseQty = () => {
  quantity.value--;
};
const increaseQty = () => {
  quantity.value++;
};
</script>

<style scoped lang="scss">
.cartListWrap {
  background-color: #f6f6f6;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  place-items: center;
  padding: 0 2.5% 72px;
  .cartListContentWrap {
    width: 100%;
    margin-top: 1rem;
  }
  .cartListContent {
    display: flex;
    align-items: center;
    padding: 1rem;
    background-color: #fff;
    position: relative;
    width: 100%;
    border-radius: 8px;
    margin-bottom: 1rem;
 
    input[type="checkbox"] {
      width: 24px;
      height: 24px;
      margin-right: 1rem;
    }
    img {
      width: 80px;
      height: 80px;
      border-radius: 8px;
    }
    .cartContentGroupText {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-right: .5rem;
      h3 {
        color: var(--Neutral-black, #1e1e1e);

        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 700;
        font-size: 20px;
      }
      h6 {
        color: var(--Primary-default, #74bc1f);

        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 700;
      }
      small {
        color: var(--Neutral-400, #b3b3b3);

        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.08px;
      }
    }
    .cartContentGroup {
      display: flex;
      align-items: end;
      gap: 0.5rem;
    }
    .deleteBtn {
      position: absolute;
      right: 2.5%;
      top: 30%;
      img {
        width: 24px;
        height: 24px;

        cursor: pointer;
      }
    }
  }
  .cartListFooter {
    position: fixed;
    bottom: 2.5%;
    background-color: #fff;
    width: 95%;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .cartListFooterContent1 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      input[type="checkbox"] {
        width: 24px;
        height: 24px;
      }
      label {
        color: var(--Neutral-500, #666);

        font-size: 18px;
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 18px */
        letter-spacing: 0.09px;
      }
    }
    .cartListFooterContent2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      h5 {
        color: var(--Warning-default, #ec4f4f);
        text-align: center;
        font-size: var(16px);
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.07px;
      }
      button {
        background: var(--Primary-default, #74bc1f);
        border: none;
        color: var(--Neutral-white, #fff);
        font-size: 18px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.09px;
        border-radius: 8px;
        cursor: pointer;
        padding: 8px 12px;
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
  width: 100px;
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
