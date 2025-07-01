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
      <div class="orderQueryItem" v-for="i in 10" :key="i">
        <div class="orderQueryItemTitle">
          <h3>訂單編號 : 1234567890</h3>
          <small>未製作</small>
        </div>
        <div class="orderQueryItemMainGroup">
          <div class="orderQueryItemMain1">
            <img src="/assets/imgs/3DMap.png" alt="產品圖" />
            <div class="orderQueryItemMain1Text">
              <h3>產品名稱</h3>
              <h5>NT$100</h5>
            </div>
          </div>
          <div class="orderQueryItemMain2">
            <h5>x1</h5>
          </div>
        </div>
        <div class="orderQueryHR"></div>
        <div class="orderQueryItemPrice">訂單金額 : NT$100</div>
        <div class="orderQueryHR"></div>
        <div class="orderStateTag">
          <h3>
            請先填寫個人化資訊才會開始製作
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M6.33752 3.00146C6.33752 2.99161 6.34139 2.98215 6.34827 2.9751L6.34924 2.97412C6.35026 2.97317 6.35187 2.97271 6.35315 2.97217C6.35445 2.97166 6.35566 2.97122 6.35706 2.97119C6.35864 2.97119 6.36048 2.97155 6.36194 2.97217C6.36327 2.97275 6.3648 2.9731 6.36584 2.97412V2.9751L12.1969 8.95654C12.2081 8.9681 12.2144 8.98342 12.2145 8.99951C12.2145 9.01579 12.2082 9.03179 12.1969 9.04346L6.36487 15.0249C6.36396 15.0257 6.36304 15.0264 6.36194 15.0269C6.36048 15.0275 6.35864 15.0278 6.35706 15.0278C6.35569 15.0278 6.35442 15.0273 6.35315 15.0269C6.35171 15.0262 6.34937 15.026 6.34827 15.0249C6.34171 15.0179 6.33852 15.0081 6.3385 14.9985C6.3385 14.9887 6.34243 14.9792 6.34924 14.9722H6.35022L11.8307 9.34912L12.1705 8.99951L11.8307 8.65088L6.35022 3.02783L6.34631 3.0249C6.34089 3.01821 6.33753 3.01014 6.33752 3.00146Z"
                fill="#EC4F4F"
                stroke="#EC4F4F"
              />
            </svg>
          </h3>
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

    .orderQueryItemMainGroup {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .orderQueryItemMain1 {
      display: flex;
      align-items: center;
      gap: 16px;
      img {
        width: 100px;
        height: 100px;
        object-fit: cover;
      }
      .orderQueryItemMain1Text {
        display: flex;
        flex-direction: column;
        line-height: 1.25;
        h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--Neutral-500, #1e1e1e);
        }
        h5 {
          font-size: 16px;
          font-weight: 400;
          color: var(--Primary-hover, #65a31b);
        }
      }
    }
    .orderQueryItemMain2 {
      color: var(--Neutral-500, #666);
      text-align: center;
      font-family: "Noto Sans";
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 100%; /* 12px */
      letter-spacing: 0.06px;
    }

    .orderQueryItem {
      margin-bottom: 16px;
      background-color: #fff;
      border-radius: 8px;
      padding: 16px;

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
    .orderQueryHR {
      width: 100%;
      height: 1px;
      background-color: var(--Neutral-200, #eee);
      margin: 12px 0;
    }

    .orderQueryItemPrice {
      text-align: right;
      color: var(--Warning-default, #ec4f4f);

      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;

      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
    }
    .orderStateTag {
      border-radius: var(--Radius-r-8, 8px);
      background: var(--warning-300-opacity-10, rgba(236, 79, 79, 0.1));
      color: var(--Warning-default, #ec4f4f);
      font-family: "Noto Sans";
      font-size: var(--Text-font-size-16, 16px);
      font-style: normal;
      font-weight: 700;
      line-height: 150%; /* 24px */
      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      padding: 8px;
      h3{
        display: flex;
        justify-content: space-between;
        align-items: center;
      
      }
    }
  }
}
</style>

<script></script>
