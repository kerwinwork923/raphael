<template>
  <div class="returnGoodsConfirmWrap">
    <TitleMenu Text="確認退貨資訊" link="back" />

    <!-- 退貨訂單資訊 -->
    <div class="orderInfoSection">
      <div class="orderNumber">
        退貨訂單編號：<span class="orderNo">2025040730967</span>
      </div>
      <div class="productInfo">
        <img
          class="productImg"
          src="@/assets/imgs/cart/angel.png"
          alt="商品圖片"
        />
        <div class="productDetail">
          <div class="productName">方案一</div>
          <div class="productPrice">NT$9,999</div>
        </div>
        <div class="productQty">x2</div>
      </div>
    </div>

    <!-- 個人化資訊 -->
    <div class="section">
      <div class="sectionTitle">個人化資訊</div>
      <div class="personalInfoCard">
        <div class="infoTitle">護您穩1型(XXXX)</div>
        <div class="infoContent">男，M，170cm，50kg</div>
        <div class="infoContent">身材比例 36cm</div>
      </div>
      <div class="personalInfoCard">
        <div class="infoTitle">護您穩5+型(XXXX)</div>
        <div class="infoContent">男，M，170cm，50kg</div>
        <div class="infoContent">身材比例 36cm</div>
      </div>
    </div>

    <!-- 退貨原因 -->
    <div class="section">
      <div class="sectionTitle">退貨原因</div>
      <div class="returnReason">
        <div class="reasonText">衣服尺寸不合</div>
        <div class="reasonDetail">
          原因原因原因原因原因原因原因原因原因原因原因原因原因原因原因原因原因原因
        </div>
      </div>
    </div>

    <!-- 照片 -->
    <div class="section">
      <div class="sectionTitle">照片</div>
      <div class="photoSection">
        <img src="@/assets/imgs/cart/angel.png" alt="退貨照片" />
      </div>
    </div>

    <!-- 退款與物流方式 -->
    <div class="section">
      <div class="sectionTitle">退款與物流方式</div>
      <div class="refundMethod">
        <div class="methodLabel">退款方式</div>
        <div class="methodValue">原付款方式退回</div>
      </div>
    </div>

    <!-- 退款金額明細 -->
    <div class="section section2">
      <div class="sectionTitle">退款金額明細</div>
      <div class="refundDetails">
        <div class="refundRow">
          <div class="refundLabel">商品金額</div>
          <div class="refundValue">NT$9,999</div>
        </div>
        <div class="refundRow">
          <div class="refundLabel refundLabelRed">預計退款</div>
          <div class="refundValue refundAmount">NT$9,999</div>
        </div>
      </div>
    </div>

    <!-- 提交申請按鈕 -->
    <div class="submitButton">
      <button @click="submitApplication">提交申請</button>
    </div>
  </div>
</template>

<script setup>
import TitleMenu from "@/components/TitleMenu.vue";

function submitApplication() {
  // 這裡可加上送出邏輯
  alert("已送出退貨申請");
}
</script>

<style lang="scss" scoped>
.returnGoodsConfirmWrap {
  background: #f6f6f6;
  min-height: 100vh;
  padding: 0 2.5% 120px;

  .orderInfoSection {
    background: #fff;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 0.75rem;

    .orderNumber {
      color: var(--Primary-hover, #65a31b);

      font-size: 1.125rem
      font-style: normal;
      font-weight: 700;

      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      margin-bottom: 0.5rem;
      .orderNo {
        font-weight: 700;
      }
    }
    .productInfo {
      display: flex;
      align-items: center;
      .productImg {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        margin-right: 1rem;
      }
      .productDetail {
        flex: 1;
        .productName {
          color: var(--Neutral-black, #1e1e1e);

          font-size: var(--Text-font-size-20, 20px);
          font-style: normal;
          font-weight: 700;

          letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
        }
        .productPrice {
          color: var(--Primary-default, #74bc1f);

          margin-top: 0.15rem;
          font-size: 1rem;
          font-style: normal;
          font-weight: 700;
          line-height: 100%; /* 16px */
          letter-spacing: 0.08px;
        }
      }
      .productQty {
        color: #666;
        font-size: 16px;
        font-weight: 500;
        margin-left: 1rem;
      }
    }
  }

  .section {
    background: #fff;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 0.75rem;
    .sectionTitle {
      color: var(--Neutral-black, #1e1e1e);

      font-size: 1rem;
      font-style: normal;
      font-weight: 700;
      margin-bottom: 0.5rem;
      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
    }
    .personalInfoCard {
      background: #f8f8f8;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      .infoTitle {
        color: var(--Neutral-black, #1e1e1e);

        font-size: 1rem;
        font-style: normal;
        font-weight: 700;
        line-height: 100%; /* 16px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
        margin-bottom: 0.25rem;
      }
      .infoContent {
        color: $raphael-gray-500;

        font-size: 1rem;
        font-style: normal;
        font-weight: 400;
        line-height: 125%; /* 24px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    .returnReason {
      .reasonText {
        color: $raphael-gray-500;

        font-size: 1rem;
        font-style: normal;
        font-weight: 400;

        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
      .reasonDetail {
        color: $raphael-gray-500;

        font-size: 1rem;
        font-style: normal;
        font-weight: 400;
        margin-top: 0.3rem;
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
    }
    .photoSection {
      img {
        width: 100px;
        max-width: 200px;
        height: auto;
        border-radius: 8px;
      }
    }
    .refundMethod {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .methodLabel {
        color: $raphael-gray-500;

        font-size: 1rem;
        font-style: normal;
        font-weight: 400;

        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
      .methodValue {
        color: $raphael-gray-500;

        font-size: 1rem;
        font-style: normal;
        font-weight: 400;

        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
    }
    .refundDetails {
      .refundRow {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid #f0f0f0;
        &:last-child {
          border-bottom: none;
        }
        .refundLabel {
          color: $raphael-gray-500;

          font-size: 1rem;
          font-style: normal;
          font-weight: 400;

          letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
        }
        .refundLabelRed {
          color: $raphael-red-500;
        }
        .refundValue {
          font-size: 16px;
          color: #666;
          &.refundAmount {
            color: #ec4f4f;
            font-weight: 700;
          }
        }
      }
    }
  }
  .section2 {
    border-radius: var(--Radius-r-8, 8px);
    border: 1px solid var(--Primary-hover, #65a31b);
    background: var(--Primary-100, #fcfff7);
  }
  .submitButton {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    width: 100%;

    padding: 1rem 1rem 3.125rem 1rem;
    background-color: #f6f6f6;
    z-index: 99;
    button {
      width: 100%;
      padding: 0.5rem;
      background: #74bc1f;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s;
      &:hover {
        background: #5a9a18;
      }
      &:active {
        transform: translateY(1px);
      }
    }
  }
}
</style>
