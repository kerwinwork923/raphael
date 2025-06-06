<template>
  <div class="invoiceTypeWrap">
    <CartTitleBar title="發票類型" />
    <h5>發票類型</h5>
    <div class="invoiceTypeGroup">
      <div class="invoiceType">
        <div class="invoiceTypeRadioGroup">
          <input type="radio" name="invoiceType" id="invoiceType1" />
          <label for="invoiceType1">
            <h4>電子發票</h4>
            <p>電子發票</p>
          </label>
        </div>
        <img src="~/assets/imgs/cart/goNext.svg" alt="" />
      </div>

      <div class="invoiceType">
        <div class="invoiceTypeRadioGroup">
          <input type="radio" name="invoiceType" id="invoiceType2" />
          <label for="invoiceType2">
            <h4>載具</h4>
            <p>未填寫</p>
          </label>
        </div>
        <img src="~/assets/imgs/cart/goNext.svg" alt="" />
      </div>

      <div class="invoiceType">
        <div class="invoiceTypeRadioGroup">
          <input type="radio" name="invoiceType" id="invoiceType3" />
          <label for="invoiceType3">
            <h4>三聯式發票</h4>
            <p>未填寫</p>
          </label>
        </div>

        <img src="~/assets/imgs/cart/goNext.svg" alt="" />
      </div>
  
    </div>
    <div class="btnGroup">
      <button>確認</button>
    </div>
  </div>
</template>
<script setup></script>
<style lang="scss" scoped>
.invoiceTypeWrap {
  background-color: #f6f6f6;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;

  padding: 0 2.5% 72px;
  .btnGroup {
    width: 100%;
    display: flex;
    justify-content: center;
    position: fixed;
    bottom: 5%;
    left: 0;
    button {
      width: 95%;

      border: none;
      color: #fff;
      padding: 8px 12px;
      border-radius: 8px;

      background: var(--Primary-default, #74bc1f);
      cursor: pointer;
    }
  }
  h5 {
    color: var(--Neutral-500, #666);

    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 100%; /* 16px */
    letter-spacing: 0.5px;
    margin-top: 0.75rem;
  }
  .invoiceTypeTitleGroup {
    display: none;
  }
  .invoiceTypeGroup {
    width: 100%;
    background-color: #fff;
    border-radius: 8px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.75rem;

    input {
      width: 24px;
      height: 24px;
      appearance: none;
      border-radius: 50%;
      border: 1px solid var(--Neutral-300, #ccc);
      background: var(--Neutral-white, #fff);
      cursor: pointer;
    }
    input:checked {
      border: 1px solid var(--Primary-default, #74bc1f);
      background: var(--Primary-default, #74bc1f);
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      cursor: pointer;
      h4 {
        color: var(--Neutral-black, #1e1e1e);

        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 700;
        line-height: 100%;
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
      p {
        color: var(--Neutral-500, #666);
        font-family: "Noto Sans";
        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 400;
        line-height: 150%; /* 24px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
    }
    img {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
    .invoiceType {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .invoiceTypeRadioGroup {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }

}
</style>
