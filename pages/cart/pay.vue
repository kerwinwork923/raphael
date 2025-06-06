<template>
  <div class="payWrap">
    <Privacy :visible="showPrivacy" @update:visible="showPrivacy = $event" />
    <CartTitleBar title="結帳" />
    <div class="payContentWrap">
      <div class="payContent">
        <div class="seleteItem">
          <div class="seleteItemGroup1">
            <img src="~/assets/imgs/cart/test1.png" alt="" />
            <div class="seleteItemGroup1Text">
              <h3>方案一</h3>
              <h6>NT$9,999</h6>
            </div>
          </div>
          <div class="seleteItemGroup2">x1</div>
        </div>
        <div class="seleteItem">
          <div class="seleteItemGroup1">
            <img src="~/assets/imgs/cart/test1.png" alt="" />
            <div class="seleteItemGroup1Text">
              <h3>方案一</h3>
              <h6>NT$9,999</h6>
            </div>
          </div>
          <div class="seleteItemGroup2">x1</div>
        </div>
        <div class="payContentHR"></div>
        <div class="sendMethod">
          <h5>寄送方式</h5>
          <h6>查看更多 <img src="~/assets/imgs/cart/goNext.svg" alt="" /></h6>
        </div>
        <div class="sendContnet">
          <div class="sendContnetTitle">
            <h5>黑貓宅配</h5>
            <small>運費 NT$100</small>
          </div>
          <p>預計 3~5 個工作天</p>
          <p>100 台北市中正區忠孝西路一段66號30樓</p>
          <p>王先生．0912 345 678</p>
        </div>
        <div class="payContentHR"></div>
        <div class="totalPriceGroup">
          <h4>2個商品</h4>
          <h5>NT$9,999</h5>
        </div>
      </div>
      <div class="payContent">
        <h3>付款方式</h3>
        <h5>
          <img src="/assets/imgs/cart/cash.svg" alt="" />
          線上付款
        </h5>
      </div>
      <div class="payContent">
        <h3>付款詳情</h3>
        <div class="sendPayGroup">
          <h5>運費</h5>
          <h6>NT$100</h6>
        </div>
        <div class="totalPayGroup">
          <h5>訂單總金額</h5>
          <h6>NT$19,998</h6>
        </div>
      </div>
      <div class="payContent">
        <h3>退換貨政策</h3>
        <ul>
          <li>本商品適用7天鑑賞期</li>
          <li>商品需保持全新狀態（未經使用、無污損、包裝完整含所有配件）</li>
        </ul>
      </div>
      <div class="payContent">
        <div class="payContentTitleGroup">
          <h3>發票類型</h3>
          <h6>查看更多 <img src="~/assets/imgs/cart/goNext.svg" alt="" /></h6>
        </div>
        <h5>電子發票 xxxxxx@gmail.com</h5>
      </div>
      <div class="payContent payContentCheckout">
        <div class="allPrice">總付款金額 NT$19,998</div>
        <button>結帳</button>
      </div>
      <div class="privacyGroup">
        結帳完成視為已同意
        <span @click="showPrivacy = true" style="cursor:pointer; color:#1fbcb3; text-decoration:underline;">條款與規則</span>。
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import CartTitleBar from "~/components/cart/CartTitleBar.vue";
import Privacy from "~/components/Privacy.vue";

const showPrivacy = ref(false);
</script>

<style scoped lang="scss"></style>

<style scoped lang="scss">
.payWrap {
  background-color: #f6f6f6;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  place-items: center;
  padding: 0 2.5% 72px;

  .payContentWrap {
    width: 100%;
    margin-top: 1rem;
  }
  .payContent {
    width: 100%;
    background-color: #fff;
    border-radius: 8px;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    .seleteItem {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      .seleteItemGroup1 {
        display: flex;
        align-items: center;
        gap: 1rem;
        img {
          width: 80px;
          height: 80px;
          border-radius: 8px;
        }
        .seleteItemGroup1Text {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          h3 {
            font-size: 1rem;
            font-weight: 700;
            color: #1e1e1e;
          }
          h6 {
            font-size: 1rem;
            font-weight: 700;
            color: #74bc1f;
          }
        }
      }
      .seleteItemGroup2 {
        color: var(--Neutral-500, #666);
        text-align: center;

        font-size: 14px;
        font-style: normal;
        font-weight: 400;

        letter-spacing: 1px;
      }
    }
    .sendMethod {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.25rem;
      h5 {
        font-size: 1rem;
        font-weight: 700;
      }
      h6 {
        color: var(--Neutral-500, #666);
        text-align: center;
        font-size: var(--Text-font-size-14, 14px);
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.07px;
        display: flex;
      }
    }
    .payContentHR {
      width: 100%;
      height: 1px;
      background-color: #e5e5e5;
      margin: 0.65rem 0;
    }
    .sendContnet {
      border-radius: var(--Radius-r-8, 8px);
      border: 1px solid var(--Primary-hover, #65a31b);
      background: var(--Primary-100, #fcfff7);
      padding: 0.5rem;
      margin-top: 0.5rem;
      .sendContnetTitle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        h5 {
          font-size: 1rem;
          font-weight: 700;
        }
        small {
          color: var(--Neutral-500, #666);

          font-size: var(--Text-font-size-14, 14px);
          font-style: normal;
          font-weight: 400;
          line-height: 150%; /* 21px */
          letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
        }
      }
      p {
        color: var(--Neutral-500, #666);
        font-family: "Noto Sans";
        font-size: var(--Text-font-size-14, 14px);
        font-style: normal;
        font-weight: 400;
        line-height: 130%; /* 21px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
    }
    .totalPriceGroup {
      display: flex;
      align-items: center;
      justify-content: space-between;
      h4 {
        color: var(--Neutral-500, #666);
        font-family: "Noto Sans";
        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 16px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
      h5 {
        color: var(--Primary-default, #74bc1f);
        font-family: "Noto Sans";
        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 700;
        line-height: 150%; /* 24px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
    }

    h3 {
      color: var(--Neutral-black, #1e1e1e);
      font-family: "Noto Sans";
      font-size: var(--Text-font-size-16, 16px);
      font-style: normal;
      font-weight: 700;
      line-height: 100%; /* 16px */
      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      margin-bottom: 0.25rem;
    }
    h5 {
      color: var(--Neutral-500, #666);
      font-family: "Noto Sans";
      font-size: var(--Text-font-size-16, 16px);
      font-style: normal;
      font-weight: 400;
      line-height: 150%; /* 24px */
      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
    }
    .sendPayGroup {
      display: flex;
      align-items: center;
      justify-content: space-between;
      h5 {
        color: var(--Neutral-500, #666);
      }
      h6 {
        color: var(--Neutral-black, #1e1e1e);

        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 400;
      }
    }
    .totalPayGroup {
      display: flex;
      align-items: center;
      justify-content: space-between;
      h5 {
        color: var(--Warning-default, #ec4f4f);

        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 400;
        line-height: 150%; /* 24px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
      h6 {
        color: var(--Warning-default, #ec4f4f);

        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 700;
        line-height: 150%; /* 24px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
    }
    ul {
      li {
        list-style: disc;
        margin-left: 1.5rem;
        color: var(--Neutral-500, #666);

        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 400;
        line-height: 150%; /* 24px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
    }
    .payContentTitleGroup {
      display: flex;
      align-items: center;
      justify-content: space-between;
      h6 {
        color: var(--Neutral-500, #666);
        text-align: center;

        font-size: var(--Text-font-size-14, 14px);
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 14px */
        letter-spacing: 0.07px;
        display: flex;
        align-items: center;
      }
    }
  }
  .payContentCheckout {
    text-align: right;
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 0.35rem;
    .allPrice {
      color: var(--Warning-default, #ec4f4f);
      font-size: var(--Text-font-size-14, 14px);
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.07px;
    }
    button {
      color: #fff;
      padding: 0.5rem 1rem;

      background: var(--Primary-default, #74bc1f);
      border: none;
      cursor: pointer;
      border-radius: 8px;
    }
  }
  .privacyGroup {
    text-align: center;
    color: var(--Neutral-500, #666);

    font-size: var(--Text-font-size-14, 14px);
    font-style: normal;
    font-weight: 400;
    line-height: 100%;
    letter-spacing: 0.07px;
    span {
      color: var(--Secondary-default, #1fbcb3);
    }
  }
}
</style>
