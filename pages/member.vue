<template>
  <div class="memberWrap">
    <div class="memberTop">
      <div class="memberTopLeft">
        <img src="../assets/imgs/robot/character/pet4_3.png" alt="" />
      </div>
      <div class="memberTopRight">
        <h3>{{ userDataObj.Member.Name }} 您好</h3>
        <div class="memberTopPoint">目前積分 : {{ userDataObj.NowAvaPoints }}</div>
      </div>
    </div>
    <div class="memberCenter">
      <div class="memberCenterItem" @click="goToPoint">
        <img src="../assets/imgs/member/point.svg" alt="" />
        <h3>我的積分</h3>
        <div class="memberCenterButton">
          前往 <img src="../assets/imgs/member/next.svg" alt="" />
        </div>
      </div>
      <div class="memberCenterItem" @click="goToPackage">
        <img src="../assets/imgs/member/order.svg" alt="" />
        <h3>我的訂單</h3>
        <div class="memberCenterButton">
          前往 <img src="../assets/imgs/member/next.svg" alt="" />
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup>
import BottomNav from "~/components/BottomNav.vue";
import { useRouter } from "vue-router";

const userData = localStorage.getItem("userData");
const userDataObj = JSON.parse(userData);
console.log(userDataObj);

const router = useRouter();

const goToPoint = () => {
  router.push("/point");
};
const goToPackage = () => {
  router.push("/package");
};
</script>

<style lang="scss">
.memberWrap {
  background: url("../assets/imgs/background.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;

  width: 100%;
  min-height: 100vh;
  padding: 1.5rem 1rem;
  .memberTop {
    display: flex;
    align-items: center;

    .memberTopLeft {
      width: 100px;
      height: 100px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .memberTopRight {
      width: 100%;
      h3 {
        color: var(--Neutral-black, #1e1e1e);
        font-family: Inter;
        font-size: var(--Text-h2, 24px);
        font-style: normal;
        font-weight: 400;
      }
      .memberTopPoint {
        border-radius: var(--Radius-r-20, 20px);
        background: var(--Secondary-100, #f5f7fa);
        box-shadow: 2px 4px 12px 0
          var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
        color: var(--Warning-default, #ec4f4f);

        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 700;

        letter-spacing: 2.7px;
        padding: 1rem;
        margin-top: 0.5rem;
      }
    }
  }
  .memberCenter {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
    margin-top: 1rem;

    .memberCenterItem {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;

      width: 50%;
      border-radius: var(--Radius-r-20, 20px);
      background: var(--Secondary-100, #f5f7fa);
      box-shadow: 2px 4px 12px 0
        var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));

      h3 {
        color: var(--Neutral-black, #1e1e1e);
        text-align: center;

        font-size: var(--Text-font-size-24, 24px);
        font-style: normal;
        font-weight: 700;
        line-height: 100%; /* 24px */
        letter-spacing: 0.12px;
      }
      .memberCenterButton {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        border-radius: var(--Radius-r-50, 50px);
        background: linear-gradient(
          90deg,
          var(--primary-400-opacity-40, rgba(116, 188, 31, 0.4)) 0%,
          var(--primary-400-opacity-70, rgba(116, 188, 31, 0.7)) 100%
        );
        box-shadow: -2px -2px 6px 0 var(--Neutral-white, #fff),
          2px 2px 6px 0
            var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
        color: #fff;
        padding: 0.25rem 1rem;
        margin-top: .5rem;
      }
    }
  }
}
</style>
