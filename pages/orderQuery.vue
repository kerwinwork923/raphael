<template>
  <div class="orderQueryWrap">
    <TitleMenu Text="訂單查詢" link="/user" />
    <!-- <div class="orderStateList">
      <ul>
        <li class="orderStateActive">訂單查詢</li>
        <li>待收貨</li>
        <li>訂單完成</li>
        <li>已退貨</li>
      </ul>
    </div> -->
    <div class="orderQueryContent">
      <div class="orderQueryItem">
        <div class="orderQueryItemTitle">
          <h3>訂單編號 : 1234567890</h3>
          <small>未製作</small>
        </div>
        <div class="orderQueryItemMainGroup">
          <div class="orderQueryItemMain1">
            <img src="" alt="產品圖" />
            <h3>產品名稱</h3>
            <h5>NT$100</h5>
          </div>
          <div class="orderQueryItemMain2">
            <h5>x1</h5>
          </div>
        </div>
        <div class="orderQueryHR"></div>
        <div class="orderQueryItemPrice">訂單金額 : NT$100</div>
        <div class="orderQueryHR"></div>
        <div class="orderStateTag">
          <h3>請先填寫個人化資訊才會開始製作</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TitleMenu from "~/components/TitleMenu.vue";
import { ref } from "vue";
</script>

<style lang="scss" scoped>
.orderQueryWrap {
  background-color: #f6f6f6;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  place-items: center;
  padding: 0 2.5% 72px;
  .orderStateList {
    width: 90%;
    margin-top: 8px;

    ul {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      width: 100%;

      li {
        color: var(--Neutral-500, #666);
        font-size: 18px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.09px;

        &.orderStateActive {
          color: var(--Primary-default, #74bc1f);
          border-bottom: 2px solid var(--Primary-default, #74bc1f);
          padding-bottom: 8px;
        }
      }
    }
  }
  .orderQueryContent {
    width: 90%;
    background-color: #fff;
    border-radius: 8px;
    padding: 16px;
    background-color: #fff;
    .orderQueryItem {
      .orderQueryItemTitle {
        display: flex;
        justify-content: space-between;
        h3 {
          color: var(--Primary-hover, #65a31b);

          font-size: var(--Text-font-size-18, 18px);
          font-style: normal;
          font-weight: 700;

          letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
        }
        small {
          color: var(--Warning-default, #ec4f4f);

          font-size: var(--Margin-m-16, 16px);
          font-style: normal;
          font-weight: 400;
          line-height: 150%; /* 24px */
          letter-spacing: 0.15px;
        }
      }
    }
  }
}
</style>

<script></script>
