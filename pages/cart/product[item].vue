<template>
  
  
  <div class="addCartAlert" v-if="showAddCartAlert">
    <div class="addCartAlertTitleGroup">
      <img :src="productData?.FPicture" :alt="productData?.ProductName" />
      <div class="textGroup">
        <h2>{{ productData?.ProductName }}</h2>
        <h6>NT${{ productData?.Price }}</h6>
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
      <button @click="addToCart">加入購物車</button>
    </div>

    <div class="closeBtn" @click="closeAddCartAlert">
      <img src="/assets/imgs/close.svg" alt="" />
    </div>
  </div>
  <div class="buyCartAlert" v-if="showBuyCartAlert">
    <div class="addCartAlertTitleGroup">
      <img :src="productData?.FPicture" :alt="productData?.ProductName" />
      <div class="textGroup">
        <h2>{{ productData?.ProductName }}</h2>
        <h6>NT${{ productData?.Price }}</h6>
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
      <button class="buyBtn" @click="buyNow">立即購買</button>
    </div>

    <div class="closeBtn" @click="closeBuyCartAlert">
      <img src="/assets/imgs/close.svg" alt="" />
    </div>
  </div>
  <RaphaelLoading v-if="loading" />
  <div class="productCartWrap" v-else>
    <CartTitleBar />
    <div class="productCartContentGroup">
      <div class="productCartContent">
        <img :src="productData?.FPicture" :alt="productData?.ProductName" />
        <h2>{{ productData?.ProductName }}</h2>
        <h6>NT${{ productData?.Price }}</h6>
        <small>剩下 {{ productData?.Remaining }} 件</small>
      </div>
      <div class="productCartContent">
        <h3>配送方式</h3>
        <p>{{ productData?.DeliverName }}</p>
      </div>
      <div class="productCartContent">
        <h3>付款方式</h3>
        <p>{{ productData?.PayName }}</p>
      </div>
      <div class="productCartContent">
        <h3>退換貨政策</h3>
        <ul>
          <li>{{ productData?.ReturnPolicyName }}</li>
        </ul>
      </div>
      <div class="productCartContent">
        <h3>商品特色</h3>
        <p>{{ productData?.Feature }}</p>
      </div>
      <div class="productCartContent">
        <h3>商品詳情</h3>
        <p>{{ productData?.DDesc }}</p>
        <div class="productCartContentImgGroup">
          <img :src="productData?.DPicture" :alt="productData?.ProductName" />
        </div>
      </div>
    </div>
    <div class="productOptionGroup">
      <button @click="showAddCart">加入購物車</button>
      <button @click="showBuyNow">立即購買</button>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import CartTitleBar from "~/components/cart/CartTitleBar.vue";
import RaphaelLoading from "~/components/RaphaelLoading.vue";

const route = useRoute();
const router = useRouter();
const userData = JSON.parse(localStorage.getItem("userData"));
const productId = route.params.item;
const productData = ref(null);
const quantity = ref(1);
const showAddCartAlert = ref(false);
const showBuyCartAlert = ref(false);
const loading = ref(true);

const fetchProductDetail = async () => {
  try {
    loading.value = true;
    const { data } = await useFetch(
      "https://23700999.com:8081/HMA/api/fr/maSingleProduct",
      {
        method: "POST",
        body: {
          MID: userData.MID,
          Token: userData.Token,
          MAID: userData.MAID,
          Mobile: userData.Mobile,
          Lang: "zhtw",
          ProductID: productId,
        },
      }
    );

    if (data.value?.Result === "OK" && data.value?.RetMaSingleProduct) {
      productData.value = data.value.RetMaSingleProduct;
    }
  } catch (error) {
    console.error("獲取商品詳情失敗：", error);
  } finally {
    loading.value = false;
  }
};

const addToCart = async () => {
  try {
    loading.value = true;
    const { data } = await useFetch(
      "https://23700999.com:8081/HMA/api/fr/maCartAdd",
      {
        method: "POST",
        body: {
          MID: userData.MID,
          Token: userData.Token,
          MAID: userData.MAID,
          Mobile: userData.Mobile,
          Lang: "zhtw",
          Cart: [
            {
              ProductID: productId,
              Qty: quantity.value.toString(),
            },
          ],
        },
      }
    );

    if (data.value?.Result === "OK") {
      console.log("成功加入購物車");
      closeAddCartAlert();
    }
  } catch (error) {
    console.error("加入購物車失敗：", error);
  } finally {
    loading.value = false;
  }
};

const buyNow = async () => {
  try {
    loading.value = true;
    const { data } = await useFetch(
      "https://23700999.com:8081/HMA/api/fr/maCartAdd",
      {
        method: "POST",
        body: {
          MID: userData.MID,
          Token: userData.Token,
          MAID: userData.MAID,
          Mobile: userData.Mobile,
          Lang: "zhtw",
          Cart: [
            {
              ProductID: productId,
              Qty: quantity.value.toString(),
            },
          ],
        },
      }
    );

    if (data.value?.Result === "OK") {
      console.log("成功加入購物車");
      router.push("/cart/cartList");
    }
  } catch (error) {
    console.error("立即購買失敗：", error);
  } finally {
    loading.value = false;
  }
};

const showAddCart = () => {
  showAddCartAlert.value = true;
};

const showBuyNow = () => {
  showBuyCartAlert.value = true;
};

const closeAddCartAlert = () => {
  showAddCartAlert.value = false;
  quantity.value = 1;
};

const closeBuyCartAlert = () => {
  showBuyCartAlert.value = false;
  quantity.value = 1;
};

const decreaseQty = () => {
  if (quantity.value > 1) quantity.value--;
};

const increaseQty = () => {
  if (quantity.value < 100) quantity.value++;
};

onMounted(() => {
  fetchProductDetail();
});
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

  .productCartContentGroup {
    width: 100%;
    @include respond-to("tablet-up") {
      max-width: 1440px;
      margin-bottom: 10px;
    }
  }
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
        margin-top: 0.5rem;
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
