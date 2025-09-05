<template>
  <div class="memberWrap">
    <div class="memberContainer">
        <div class="memberTop">
      <div class="memberTopLeft">
        <img src="../assets/imgs/robot/character/pet4_3.png" alt="" />
      </div>
      <div class="memberTopRight">
        <h3>{{ userDataObj?.Member.Name }} 您好</h3>
        <div class="memberTopPoint">
          目前積分 : {{ userDataObj?.NowAvaPoints }}
        </div>
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

    <div class="memberListGroup">
      <div class="memberListItem" @click="goToChangeMember">
        <div class="memberListLeft">
          <img src="../assets/imgs/member/setting.svg" alt="" />
          <h3>基本資料</h3>
        </div>
        <img src="../assets/imgs/member/next_green.svg" alt="" />
      </div>
      <div class="memberListItem" @click="goToPrivacy">
        <div class="memberListLeft" >
          <img src="../assets/imgs/member/privacy.svg" alt="" />
          <h3>隱私權政策</h3>
        </div>
        <img src="../assets/imgs/member/next_green.svg" alt="" />
      </div>
      <div class="memberListItem" @click="goToDisclaimer">
        <div class="memberListLeft">
          <img src="../assets/imgs/member/warning.svg" alt="" />
          <h3>免責聲明</h3>
        </div>
        <img src="../assets/imgs/member/next_green.svg" alt="" />
      </div>
      <!-- <div class="memberListItem">
        <div class="memberListLeft">
          <img src="../assets/imgs/member/about.svg" alt="" />
          <h3>關於</h3>
        </div>
        <img src="../assets/imgs/member/next_green.svg" alt="" />
      </div> -->
    </div>

    <button class="logoutBtn" @click="logout">登出</button>
    <div class="deleteBtn" @click="deleteBtn">刪除帳號</div>
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
if (!userDataObj?.Member) {
  localStorage.removeItem("userData");
  router.push("/");
}
const goToPoint = () => {
  router.push("/point");
};
const goToPackage = () => {
  router.push("/package");
};

const logout = () => {
  localStorage.removeItem("userData");
  router.push("/");
};

const deleteBtn = () => {
  router.push("/deleteConfirm");
};

const goToChangeMember = () => {
  router.push("/changeMember");
};

const goToPrivacy = () => {
  router.push("/PrivacyPage");
};

const goToDisclaimer = () => {
  router.push("/disclaimer");
};
</script>

<style lang="scss">
.memberWrap {
  @include gradientBg();

  width: 100%;
  min-height: 100vh;
  padding: 1.5rem 0rem 7rem;
  .memberContainer{
    width: 100%;
    padding: 0 3%;
  }
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
        margin-top: 0.25rem;
        letter-spacing: 0.12px;
      }
      .memberCenterButton {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.15rem;
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
        padding: 0.5rem 1rem;
        margin-top: 0.75rem;

        color: var(--Neutral-white, #fff);

        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 400;

        letter-spacing: 2.7px;
        width: 100%;
        img {
          transform: translateY(2px);
        }
      }
    }
  }
  .memberListGroup {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
    .memberListItem {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Secondary-100, #f5f7fa);
      box-shadow: 2px 4px 12px 0
        var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
        cursor: pointer;
      .memberListLeft {
        display: flex;
        align-items: center;
        gap: 4px;
        h3 {
          color: var(--Neutral-black, #1e1e1e);
          text-overflow: ellipsis;

          font-size: var(--Text-font-size-18, 18px);
          font-style: normal;
          font-weight: 400;

          letter-spacing: 2.7px;
        }
        img {
          width: 24px;
          height: 24px;
        }
      }
    }
  }
  .logoutBtn {
    width: 100%;
    border-radius: var(--Radius-r-50, 50px);
    background: var(--Secondary-100, #f5f7fa);
    box-shadow: 2px 4px 12px 0
      var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
    border: none;
    padding: 4px;
    margin-top: 3rem;
    border: 1px solid var(--Warning-default, #ec4f4f);
    color: var(--Warning-default, #ec4f4f);
    font-size: var(--Text-font-size-18, 18px);
    font-style: normal;
    font-weight: 400;
    letter-spacing: 2.7px;
  }
  .deleteBtn {
    width: 100%;
    border-radius: var(--Radius-r-50, 50px);
    background: var(--Warning-default, #ec4f4f);
    box-shadow: 2px 4px 12px 0
      var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
    color: var(--Neutral-white, #fff);
    font-size: var(--Text-font-size-18, 18px);
    font-style: normal;
    font-weight: 400;
    letter-spacing: 2.7px;
    text-align: center;
    padding: 8px;
    margin-top: 2rem;
  }
}
</style>
