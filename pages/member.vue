<template>
  <RaphaelLoading v-if="loading" />
  <div class="memberWrap">
    <div class="memberContainer">
      <div class="notificationBell">
        <!-- <img src="../assets/imgs/member/bell.svg" alt="通知" /> -->
      </div>
      <MemberTop :userDataObj="userDataObj" @refresh="getMemberData" />
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
        <div class="memberListItem" @click="goToHealthDataSetting">
          <div class="memberListLeft">
            <img src="../assets/imgs/member/heartPulse2.svg" alt="" />
            <h3>健康數據設定</h3>
          </div>
          <img src="../assets/imgs/member/next_green.svg" alt="" />
        </div>
        <div class="memberListItem" @click="goToAccountManage">
          <div class="memberListLeft">
            <img src="../assets/imgs/member/user.svg" alt="" />
            <h3>帳號管理</h3>
          </div>
          <img src="../assets/imgs/member/next_green.svg" alt="" />
        </div>
        <div class="memberListItem" @click="goToPrivacy">
          <div class="memberListLeft">
            <img src="../assets/imgs/member/privacy.svg" alt="" />
            <h3>隱私權設定</h3>
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
      </div>

      <button class="logoutBtn" @click="logout">登出</button>
    </div>

    <BottomNav />
  </div>
</template>

<script setup>
import BottomNav from "~/components/BottomNav.vue";
import MemberTop from "~/components/MemberTop.vue";
import { useRouter } from "vue-router";
import { useUserData } from "~/fn/api";
import { ref } from "vue";
const userData = localStorage.getItem("userData");
const userDataObj = JSON.parse(userData);
const loading = ref(false);

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

const goToChangeMember = () => {
  router.push("/changeMember");
};

const goToPrivacy = () => {
  router.push("/privacyPage");
};

const goToAccountManage = () => {
  router.push("/accountManage");
};

const goToDisclaimer = () => {
  router.push("/disclaimer");
};

const goToHealthDataSetting = () => {
  router.push("/healthDataSetting");
};

const getMemberData = async () => {
  //loading
  loading.value = true;
  await useUserData();
  loading.value = false;
};
</script>

<style lang="scss">
.memberWrap {
  @include gradientBg();
  width: 100%;
  min-height: 100vh;
  padding: 16px 0 84px 0;

  .memberContainer {
    width: 100%;
    max-width: 768px;
    margin: auto;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
  }
  .notificationBell {
    display: flex;
    gap: 1rem;
    height: 44px;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 1rem;
    display: none;

    img {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
  }
  .memberCenter {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    display: none; //暫時隱藏

    .memberCenterItem {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 50%;
      @include neumorphismOuter();

      h3 {
        color: $raphael-black;
        text-align: center;

        font-size: 24px;
        font-style: normal;
        font-weight: 700;
        line-height: 100%;
        letter-spacing: 0.12px;
      }

      .memberCenterButton {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.15rem;
        cursor: pointer;

        @include neumorphismOuter(
          $bgColor:
            linear-gradient(
              90deg,
              var(--primary-400-opacity-40, rgba(116, 188, 31, 0.4)) 0%,
              var(--primary-400-opacity-70, rgba(116, 188, 31, 0.7)) 100%
            ),
          $radius: 50px,
          $padding: 0.5rem 1rem
        );

        color: $raphael-white;
        margin-top: 8px;
        font-size: 18px;
        font-weight: 400;
        letter-spacing: 2.7px;
        width: 100%;
        transition: all ease 0.2s;

        img {
          transform: translateY(2px);
        }

        &:hover,
        &:active {
          @include neumorphismOuter(
            $bgColor:
              linear-gradient(
                90deg,
                var(--primary-400-opacity-40, rgba(116, 188, 31, 0.4)) 0%,
                var(--primary-400-opacity-70, rgba(116, 188, 31, 0.7)) 100%
              ),
            $radius: 50px,
            $padding: 0.5rem 1rem,
            $x: 0,
            $y: 0,
            $blur: 6px
          );
        }
      }
    }
  }
  .memberListGroup {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 1.5rem;

    .memberListItem {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      @include neumorphismOuter($radius: 50px, $padding: 10px 12px);
      transition: all ease 0.2s;

      &:hover,
      &:active {
        @include neumorphismOuter(
          $radius: 50px,
          $padding: 10px 12px,
          $x: 0,
          $y: 0,
          $blur: 6px
        );
      }

      .memberListLeft {
        display: flex;
        align-items: center;
        gap: 4px;
        h3 {
          color: $raphael-black;
          text-overflow: ellipsis;
          font-size: 18px;
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
    position: relative;
    width: 100%;
    @include neumorphismOuter($radius: 50px, $padding: 9px 12px);
    @include insetBorderLine($raphael-red-300);
    color: $raphael-red-300;
    cursor: pointer;
    font-size: 18px;
    letter-spacing: 2.7px;
    margin-top: 44px;
    transition: all ease 0.2s;

    &:hover,
    &:active {
      @include neumorphismOuter(
        $radius: 50px,
        $padding: 9px 12px,
        $x: 0,
        $y: 0,
        $blur: 6px
      );
    }
  }
}
</style>
