<template>
  <RaphaelLoading v-if="loading" />
  <div class="cartListWrap" v-else>
    <CartTitleBar title="購物車" :showCart="true" backPath="/cart" />

    <div class="cartListContentWrap">
      <div class="noCartList" v-if="cartList.length === 0">
        <img src="~/assets/imgs/cart/angel.png" alt="購物車" />
        <h3>購物車空空的</h3>
        <button @click="goToHome">再逛逛</button>
      </div>
      <div
        class="cartListContent"
        v-else
        v-for="item in cartList"
        :key="item.ProductID"
      >
        <input
          type="checkbox"
          v-model="item.selected"
          @change="updateSelection"
        />
        <div class="cartContentGroup">
          <img :src="item.Picture" :alt="item.ProductName" />
          <div class="cartArticle">
            <div class="cartContentGroupText">
              <h3>{{ item.ProductName }}</h3>
              <div class="deleteBtn" @click="deleteItem(item.ProductID)">
                <img src="~/assets/imgs/cart/delete.svg" alt="刪除" />
              </div>
            </div>
            <div class="addCartAlertOptionGroup">
              <div class="addCartAlertText">
                <h6>NT${{ item.Price }}</h6>
                <small>數量: {{ item.Qty }}</small>
              </div>
              <div class="addCartAlertOptionGroupInput">
                <button
                  class="qtyBtn"
                  @click="decreaseQty(item)"
                  :disabled="item.Qty <= 1"
                >
                  -
                </button>
                <span class="qtyNum">{{ item.Qty }}</span>
                <button
                  class="qtyBtn"
                  @click="increaseQty(item)"
                  :disabled="item.Qty >= 100"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="cartListFooter" v-if="cartList.length > 0">
      <div class="cartListFooterContent1">
        <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
        <label for="">全選</label>
      </div>
      <div class="cartListFooterContent2">
        <h5>總計 NT${{ totalAmount }}</h5>
        <button @click="checkout">去買單</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import CartTitleBar from "~/components/cart/CartTitleBar.vue";
import RaphaelLoading from "~/components/RaphaelLoading.vue";
import { useCheckoutStore } from "~/stores/checkout";

const router = useRouter();
const checkoutStore = useCheckoutStore();

const userData = JSON.parse(localStorage.getItem("userData"));
const cartList = ref([]);
const selectAll = ref(false);
const loading = ref(true);

const fetchCartList = async () => {
  try {
    loading.value = true;
    const { data } = await useFetch(
      "https://23700999.com:8081/HMA/api/fr/maGetCart",
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

    if (data.value?.Result === "OK" && data.value?.RetMaCart) {
      cartList.value = data.value.RetMaCart.map((item) => ({
        ...item,
        selected: false,
      }));
    }
  } catch (error) {
    console.error("獲取購物車列表失敗：", error);
  } finally {
    loading.value = false;
  }
};

const updateCartItem = async (productId, newQty) => {
  try {
    loading.value = true;
    const { data } = await useFetch(
      "https://23700999.com:8081/HMA/api/fr/maCart",
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
              Qty: newQty.toString(),
            },
          ],
        },
      }
    );

    if (data.value?.Result === "OK") {
      // 直接更新本地資料，不重新獲取整個列表
      const item = cartList.value.find((item) => item.ProductID === productId);
      if (item) {
        item.Qty = newQty.toString(); // 保持為字串格式
        item.Amount = (parseInt(item.Price) * newQty).toString();
      }
    }
  } catch (error) {
    console.error("更新購物車失敗：", error);
  } finally {
    loading.value = false;
  }
};

const deleteCartItem = async (productId) => {
  try {
    loading.value = true;
    const { data } = await useFetch(
      "https://23700999.com:8081/HMA/api/fr/maCartDelete",
      {
        method: "POST",
        body: {
          MID: userData.MID,
          Token: userData.Token,
          MAID: userData.MAID,
          Mobile: userData.Mobile,
          Lang: "zhtw",
          ProductID: [productId],
        },
      }
    );

    if (data.value?.Result === "OK") {
      // 直接從本地列表中移除，不重新獲取整個列表
      cartList.value = cartList.value.filter(
        (item) => item.ProductID !== productId
      );
    }
  } catch (error) {
    console.error("刪除商品失敗：", error);
  } finally {
    loading.value = false;
  }
};

const deleteSelectedItems = async () => {
  const selectedItems = cartList.value.filter((item) => item.selected);
  if (selectedItems.length === 0) {
    alert("請選擇要刪除的商品");
    return;
  }

  if (confirm(`確定要刪除選中的 ${selectedItems.length} 項商品嗎？`)) {
    try {
      loading.value = true;
      const productIds = selectedItems.map((item) => item.ProductID);
      const { data } = await useFetch(
        "https://23700999.com:8081/HMA/api/fr/maCartDelete",
        {
          method: "POST",
          body: {
            MID: userData.MID,
            Token: userData.Token,
            MAID: userData.MAID,
            Mobile: userData.Mobile,
            Lang: "zhtw",
            ProductID: productIds,
          },
        }
      );

      if (data.value?.Result === "OK") {
        // 直接從本地列表中移除選中的商品，不重新獲取整個列表
        cartList.value = cartList.value.filter((item) => !item.selected);
        selectAll.value = false; // 重置全選狀態
      }
    } catch (error) {
      console.error("批量刪除商品失敗：", error);
    } finally {
      loading.value = false;
    }
  }
};

const decreaseQty = (item) => {
  if (item.Qty > 1) {
    updateCartItem(item.ProductID, parseInt(item.Qty) - 1);
  }
};

const increaseQty = (item) => {
  if (item.Qty < 100) {
    updateCartItem(item.ProductID, parseInt(item.Qty) + 1);
  }
};

const deleteItem = (productId) => {
  if (confirm("確定要刪除此商品嗎？")) {
    deleteCartItem(productId);
  }
};

const goToHome = () => {
  router.push("/cart");
};

const updateSelection = () => {
  const selectedCount = cartList.value.filter((item) => item.selected).length;
  selectAll.value =
    selectedCount === cartList.value.length && cartList.value.length > 0;
};

const toggleSelectAll = () => {
  cartList.value.forEach((item) => {
    item.selected = selectAll.value;
  });
};

const checkout = () => {
  const selectedItems = cartList.value.filter((item) => item.selected);
  if (selectedItems.length === 0) {
    alert("請選擇要購買的商品");
    return;
  }

  // 將選中的商品存到 Pinia store
  checkoutStore.setSelectedCartItems(selectedItems);

  // 計算正確的總金額（移除千分位符號）
  const calculatedTotal = cartList.value
    .filter((item) => item.selected)
    .reduce((total, item) => total + parseInt(item.Amount), 0);

  checkoutStore.setSelectedTotalAmount(calculatedTotal);

  router.push("/cart/pay");
  console.log("跳轉到結帳頁面", selectedItems);
  console.log("總金額:", calculatedTotal);
};

const totalAmount = computed(() => {
  return cartList.value
    .filter((item) => item.selected)
    .reduce((total, item) => total + parseInt(item.Amount), 0)
    .toLocaleString();
});

onMounted(() => {
  fetchCartList();
});
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
  .noCartList {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    background-color: #fff;
    border-radius: 8px;
    padding: 1rem;
    width: 100%;
    height: 80vh;
    img {
      width: 160px;
      height: 160px;
    }
    h3 {
      color: #000;
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 100%;
      letter-spacing: 2.4px;
    }
    button {
      background: #74bc1f;
      border: none;
      color: #fff;
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.09px;
      border-radius: 8px;
      cursor: pointer;
      padding: 8px 12px;
    }
  }
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

    .cartContentGroup {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
      height: 100%;

      img {
        width: 80px;
        height: 80px;
        border-radius: 8px;
      }

      .cartArticle {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;

        .cartContentGroupText {
          display: flex;
          gap: 0.25rem;
          align-items: center;
          justify-content: space-between;

          h3 {
            color: var(--Neutral-black, #1e1e1e);
            font-size: var(--Text-font-size-16, 16px);
            font-style: normal;
            font-weight: 700;
            font-size: 20px;
          }
        }

        .addCartAlertOptionGroup {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .addCartAlertText {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
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
          .addCartAlertOptionGroupInput {
            display: flex;
            align-items: end;
            background: #ddeacf;
            border-radius: 8px;

            .qtyBtn {
              background: #ddeacf;
              color: #65a31b;
              border: none;
              border-radius: 12px;
              width: 36px;
              height: 28px;
              font-size: 1rem;
              font-weight: bold;
              cursor: pointer;
              transition: all 0.2s;
              &:hover:enabled {
                background: #ddeacf;
              }
              &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
              }
            }
            .qtyNum {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 36px;
              height: 28px;
              text-align: center;
              font-size: 1rem;
              font-weight: 700;
              color: #65a31b;
              background: transparent;
            }
          }
        }
      }
    }
    .deleteBtn {
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
      .deleteSelectedBtn {
        background: #ec4f4f;
        border: none;
        color: #fff;
        font-size: 14px;
        font-weight: 400;
        border-radius: 4px;
        cursor: pointer;
        padding: 4px 8px;
        margin-left: 0.5rem;
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
</style>
