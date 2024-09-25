<template>
  <div class="raphaelUser">
    <Navbar></Navbar>
    <div class="userGroup">
      <div class="userInfo">
        <div class="imgGroup">
          <img src="../assets/imgs/sticker.svg" alt="" />
        </div>
        <div class="infoTextGroup">
          <div class="topText">王先生，您好</div>
          <div class="score">
            <div class="circle"></div>
            <div class="scoreText">目前積分 <span>150</span> 分</div>
          </div>
        </div>
        <div class="qrCode">
          <img src="../assets//imgs/qrcode.svg" alt="" />
        </div>
      </div>
      <div class="bannerGroup">
        <img src="../assets/imgs/banner-1.png" alt="" />
      </div>

      <div class="itemsGroup">
        <div class="item item1">
          <div class="topTitle">領取</div>
          <div class="bottomTitle">積分</div>
          <!-- <img src="../assets/imgs/faceIcon.svg" alt="" /> -->
        </div>

        <div class="item item2">
          <div class="topTitle">檢測</div>
          <div class="bottomTitle">HRV</div>
          <img src="../assets/imgs/faceIcon.svg" alt="" />
        </div>

        <router-link to="/userRecord">
          <div class="item item3">
            <div class="topTitle">每周</div>
            <div class="bottomTitle">評估</div>
            <img src="../assets/imgs/noteIcon.svg" alt="" />
          </div>
        </router-link>

        <div class="item item4">
          <div class="topTitle">使用</div>
          <div class="bottomTitle">紀錄</div>
          <img src="../assets/imgs/clothIcon.svg" alt="" />
        </div>

        <div class="item item5">
          <div class="topTitle">積分</div>
          <div class="bottomTitle">兌換</div>
          <img src="../assets/imgs/exchange.svg" alt="" />
        </div>

        <div class="item item6">
          <div class="topTitle">推薦</div>
          <div class="bottomTitle">親友</div>
          <img src="../assets/imgs/relationshopIcon.svg" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.raphaelUser {
  background: url("../assets/imgs/gradient-bg.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  min-height: 100vh;
  width: 100%;

  .userGroup {
    padding-top: 90px;
    max-width: 90%;
    margin: 0 auto;
    width: 90%;
    max-width: 768px;
    .userInfo {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .imgGroup {
        width: 20%;
      }
      .infoTextGroup {
        width: 60%;

        .topText {
          font-size: 1.5rem;

          color: #1e1e1e;
          font-weight: bold;
        }
        .score {
          display: flex;
          align-items: center;
          margin-top: 12px;
          gap: 0.25rem;
          .circle {
            width: 12px;
            height: 12px;
            background-color: $raphael-purple-200;
            border-radius: 50%;
          }
          .scoreText {
            font-size: 20px;
            color: $raphael-gray-500;
            span {
              color: $raphael-green-400;
              font-size: 1.5rem;
              font-weight: bold;
            }
          }
        }
      }
      .qrCode {
      }
    }
    .bannerGroup {
      margin-top: 30px;
      img {
        width: 100%;
      }
    }
    .itemsGroup {
      display: grid;
      margin-top: 1.25rem;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      .item {
        height: 100px;
        border-radius: 0.5rem;
        background-color: #999;
        position: relative;

        opacity: 0.15;
        color: #fff;
        a {
          color: #fff;
        }
        transition: 0.15s all ease;
        .topTitle {
          position: absolute;
          top: 1rem;
          left: 0.75rem;
          font-weight: 400;
          font-family: Roboto;
          color: #fefefe;
          letter-spacing: 0.09px;
        }
        .bottomTitle {
          position: absolute;
          bottom: 1rem;
          left: 0.75rem;
          font-size: 2rem;
          font-weight: bold;
          letter-spacing: 0.09px;
        }
        img {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
        }
      }
      .item1 {
        background-color: $raphael-green-400;
        filter: blur(2px);
      }
      .item2 {
        background-color: $raphael-purple-200;
        filter: blur(2px);
      }
      .item3 {
        background-color: $raphael-cyan-400;
        opacity: 1;
        cursor: pointer;
        &:hover {
          filter: brightness(0.95);
        }
      }
      .item4 {
        background-color: $raphael-orange-400;
        filter: blur(2px);
      }
      .item5 {
        background-color: $raphael-brown-400;
        filter: blur(2px);
      }
      .item6 {
        background-color: $raphael-gray-300;
        filter: blur(2px);
      }
    }
  }
}
</style>

<script>
import Navbar from "../components/Navbar";

export default {
  components: { Navbar },
  setup() {},
};
</script>
