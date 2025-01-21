<template>
  <TitleMenu Text="積分兌換" link="/point"></TitleMenu>
  <div class="memberPointExange">
    <memberGroup></memberGroup>
    <div class="hasCoupon">
      <h3>目前積分可兌換</h3>
      <div class="couponsGroup">
        <div class="coupon">
          <img src="../assets/imgs/pointGiftCoupon.svg" alt="" />
          <div class="couponContent">
            <div class="couponGift">
              <img src="/assets/imgs/pointGift.png" alt="" />
            </div>

            <div class="couponLine">
              <img src="/assets/imgs/couponLine.svg" alt="" />
            </div>
            <div class="couponText">
              <h4>$1000</h4>
              <h5>現金抵用券</h5>
            </div>
            <div class="couponOption">
              <h4>500點</h4>
              <h5>兌換</h5>
            </div>
          </div>
        </div>
        <div class="coupon couponExchanged">
          <img src="../assets/imgs/pointGiftCoupon.svg" alt="" />
          <div class="couponContent">
            <div class="couponGift">
              <img src="/assets/imgs/pointGift.png" alt="" />
            </div>

            <div class="couponLine">
              <img src="/assets/imgs/couponLine.svg" alt="" />
            </div>
            <div class="couponText">
              <h4>$1600</h4>
              <h5>現金抵用券</h5>
            </div>
            <div class="couponOption">
              <h4>800點</h4>
              <h5>已兌換</h5>
            </div>
          </div>
        </div>
        <div class="coupon couponNot">
          <img src="../assets/imgs/pointGiftCoupon.svg" alt="" />
          <div class="couponContent">
            <div class="couponGift">
              <img src="/assets/imgs/pointGift.png" alt="" />
            </div>

            <div class="couponLine">
              <img src="/assets/imgs/couponLine.svg" alt="" />
            </div>
            <div class="couponText">
              <h4>$2300</h4>
              <h5>現金抵用券</h5>
            </div>
            <div class="couponOption">
              <h4>1100點</h4>
            </div>
            <small>還差 20點</small>
          </div>
        </div>
      </div>
    </div>
    <div class="exangeBox">
      <h3>兌換確認</h3>
      <img src="/assets/imgs/pointGift.png" alt="" />
      <h4>$1,000 現金抵用卷</h4>
      <small>可用於療程商品折抵</small>
    </div>
  </div>
</template>

<script></script>

<style lang="scss">
.memberPointExange {
  background-color: #f6f6f6;
  padding: 0 5% 60px;
  min-height: 100vh;

  .hasCoupon {
    margin-top: 1rem;
    background-color: #fff;
    max-width: 960px;
    padding: 12px;
    border-radius: 8px;
    h3 {
      color: #1e1e1e;
      font-family: "Noto Sans";
      font-size: 20px;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.15px;
      margin-bottom: 0.15rem;
    }
    .coupon {
      position: relative;
      cursor: pointer;
      img {
        width: 100%;
      }
      .couponContent {
        .couponGift {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 16%;
          left: 10%;
          img {
            width: 28%;
            height: 65%;
          }
        }
        .couponLine {
          //   width: 100%;
          position: absolute;
          top: 15%;
          left: 38.5%;
          height: 100%;
          img {
            height: 70%;
          }
        }
        .couponText {
          position: absolute;
          transform: translateY(-50%);
          top: 50%;
          left: 42.5%;
          h4 {
            color: #000;
            font-family: "Noto Sans";
            font-size: 24px;
            font-style: normal;
            font-weight: 700;
            letter-spacing: 0.12px;
            margin-bottom: 0.25rem;
          }
          h5 {
            color: #000;
            font-family: "Noto Sans";
            font-size: 18px;
            font-style: normal;
            font-weight: 400;
            line-height: 100%;
            letter-spacing: 0.09px;
          }
        }
        .couponOption {
          position: absolute;
          top: 50%;
          left: 72%;
          transform: translateY(-50%);
          color: #1fbcb3;
          border-radius: 8px;
          border: 1px solid #1fbcb3;
          padding: 4px 8px;
          text-align: center;
          line-height: 1.2;
        }
      }
    }
    .couponExchanged {
      filter: grayscale(0.97);
      cursor: not-allowed;
    }
    .couponNot {
      cursor: not-allowed;
      .couponContent {
        .couponOption {
          color: $raphael-green-400;
          border: none;
        }
        small {
          position: absolute;
          top: 75%;
          left: 72%;
          color: rgba(0, 0, 0, 0.3);
          font-family: "Noto Sans";
          font-size: 12px;
          font-style: normal;
          font-weight: 400;
          line-height: 100%;
          letter-spacing: 0.048px;
        }
      }
    }
  }
}
</style>
