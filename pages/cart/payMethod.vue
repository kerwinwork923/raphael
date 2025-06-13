<template>
  <div class="payMethodWrap">
    <CartTitleBar title="寄送方式" />
    <div class="payMethodTitleGroup">
      <h5>支援物流</h5>
      <h6>新增地址 <img src="~/assets/imgs/cart/goNextRed.svg" alt="" /></h6>
    </div>
    <div class="payMethodGroup">
      <div class="payMethodTitle">
        <h4>黑貓宅配</h4>
        <h5>免運費</h5>
      </div>
      <p>預計送達時間 5月20日~5月25日</p>
      <div class="payMethodHR"></div>
      <div class="payMethodContent">
        <input type="radio" name="payMethod" id="payMethod1" />
        <label for="payMethod1">
          <h4>王先生</h4>
          <h5>0912 345 678</h5>
          <h5>100 台北市中正區忠孝西路一段66號30樓</h5>
        </label>
        <div class="delete">
          <img src="~/assets/imgs/cart/delete.svg" alt="" />
        </div>
      </div>
      <div class="payMethodHR"></div>
      <div class="payMethodContent">
        <input type="radio" name="payMethod" id="payMethod2" />
        <label for="payMethod2">
          <h4>王先生</h4>
          <h5>0912 345 678</h5>
          <h5>100 台北市中正區忠孝西路一段66號30樓</h5>
        </label>
        <div class="delete">
          <img src="~/assets/imgs/cart/delete.svg" alt="" />
        </div>
      </div>
      <div class="payMethodHR"></div>
    </div>
    
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.payMethodWrap {
  background-color: #f6f6f6;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  place-items: center;
  padding: 0 2.5% 72px;
  .payMethodTitleGroup {
    display: none;
  }
  .payMethodGroup {
    width: 100%;
    background-color: #fff;
    border-radius: 8px;
    padding: 0.75rem;
    p {
      color: var(--Neutral-500, #666);

      font-size: var(--Text-font-size-14, 14px);
      font-style: normal;
      font-weight: 400;
      margin-top: 0.5rem; /* 21px */
      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
    }
  }

  .payMethodTitleGroup {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    h5 {
      color: var(--Neutral-500, #666);
      text-align: center;
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.5px;
    }
    h6 {
      color: var(--Warning-default, #ec4f4f);
      text-align: center;

      font-size: var(--Text-font-size-14, 14px);
      font-style: normal;
      font-weight: 400;
      line-height: 1.5;
      display: flex;
      align-items: center;
      gap: 0.05rem;
    }
  }
  .payMethodHR {
    width: 100%;
    height: 1px;
    background-color: #e5e5e5;
    margin: 0.65rem 0;
  }
  .payMethodTitle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    h4 {
      color: var(--Neutral-black, #1e1e1e);

      font-size: var(--Text-font-size-16, 16px);
      font-style: normal;
      font-weight: 700;
      line-height: 100%; /* 16px */
      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
    }
    h5 {
      color: var(--Neutral-500, #666);

      font-size: var(--Text-font-size-14, 14px);
      font-style: normal;
      font-weight: 400;
      line-height: 100%; /* 14px */
      letter-spacing: 0.07px;
    }
  }
  .payMethodContent {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    input {
      width: 24px;
      height: 24px;
      appearance: none;
      border-radius: 50%;
      border: 1px solid var(--Neutral-300, #ccc);
      background: var(--Neutral-white, #fff);
    }
    input:checked {
      border: 1px solid var(--Primary-default, #74bc1f);
      background: var(--Primary-default, #74bc1f);
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      h4 {
        color: var(--Neutral-black, #1e1e1e);

        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 700;
        line-height: 100%;
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
      h5 {
        color: var(--Neutral-500, #666);

        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 24px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
    }
  }
}
</style>
