<template>
  <RaphaelLoading v-if="loading" />
  <div class="serviceWrap">
    <div class="serviceContainer">
      <!-- 通知鈴鐺 -->
      <div class="notificationBell">
        <img src="../assets/imgs/member/bell.svg" alt="通知" />
      </div>

      <!-- 會員頂部資訊 -->
      <MemberTop :userDataObj="userDataObj" @refresh="getMemberData" />

      <!-- 功能卡片區域 -->
      <div class="serviceCenter">
        <div class="serviceCenterRow">
          <!-- <div class="serviceCenterItem" @click="goToExclusiveRecommendation">
            <img src="../assets/imgs/member/starPlus.svg" alt="專屬推薦" />
            <h3>專屬推薦</h3>
            <div class="serviceCenterButton">
              前往 <img src="../assets/imgs/member/next.svg" alt="" />
            </div>
          </div> -->
          <div class="serviceCenterItem" @click="goToHealthAssessment">
            <img src="../assets/imgs/member/heartPulse.svg" alt="健康自評" />
            <h3>健康自評</h3>
            <div class="serviceCenterButton">
              前往 <img src="../assets/imgs/member/next.svg" alt="" />
            </div>
          </div>
        </div>

        <div class="serviceCenterRow">
          <div class="serviceCenterItem" @click="goToLeaveCenter">
            <img src="../assets/imgs/member/calendarClock.svg" alt="請假中心" />
            <h3>請假中心</h3>
            <div class="serviceCenterButton">
              前往 <img src="../assets/imgs/member/next.svg" alt="" />
            </div>
          </div>
          <div class="serviceCenterItem" @click="goToShipmentInquiry">
            <img src="../assets/imgs/member/packageSearch.svg" alt="寄貨查詢" />
            <h3>寄貨查詢</h3>
            <div class="serviceCenterButton">
              前往 <img src="../assets/imgs/member/next.svg" alt="" />
            </div>
          </div>
        </div>
      </div>

      <!-- 列表功能區域 -->
      <div class="serviceListGroup">
        <div class="serviceListItem" @click="goToContract">
          <div class="serviceListLeft">
            <img src="../assets/imgs/member/contract.svg" alt="我的合約" />
            <h3>我的合約</h3>
          </div>
          <img src="../assets/imgs/member/next_green.svg" alt="" />
        </div>
        <!-- <div class="serviceListItem" @click="goToFAQ">
          <div class="serviceListLeft">
            <img src="../assets/imgs/member/QA.svg" alt="我的合約" />
            <h3>常見問題ＦＡＱ</h3>
          </div>
          <img src="../assets/imgs/member/next_green.svg" alt="" />
        </div> -->

        <div class="serviceListItem" @click="goToCSRobot">
          <div class="serviceListLeft">
            <img src="../assets/imgs/member/CSRobot.svg" alt="客服機器人" />
            <h3>客服機器人</h3>
          </div>
          <img src="../assets/imgs/member/next_green.svg" alt="" />
        </div>
      </div>
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

const router = useRouter();

// 檢查用戶登入狀態
if (!userDataObj?.Member) {
  localStorage.removeItem("userData");
  router.push("/");
}

// 導航方法
const goToExclusiveRecommendation = () => {
  // 專屬推薦功能
  console.log("前往專屬推薦");
};

const goToHealthAssessment = () => {
  // 健康自評功能
  console.log("前往健康自評");
};

const goToLeaveCenter = () => {
  router.push("/contract");
};

const goToShipmentInquiry = () => {
  // 寄貨查詢功能
  router.push("/package");
};

const goToContract = () => {
  // 我的合約功能
  router.push("/contract");
};

const goToUpdateParts = () => {
  console.log("前往更新部位");
};

const goToSmartButler = () => {
  console.log("前往智慧管家");
};

const goToCSRobot = () => {
  console.log("前往客服機器人");
  router.push("/CSRobot");
};

const getMemberData = async () => {
  loading.value = true;
  await useUserData();
  loading.value = false;
};
</script>

<style lang="scss" scoped>
.serviceWrap {
  @include gradientBg();
  width: 100%;
  min-height: 100vh;
  padding: 1rem 0rem 7rem;

  .serviceContainer {
    width: 100%;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    position: relative;
  }

  .notificationBell {
    display: flex;
    gap: 1rem;
    height: 44px;
    justify-content: flex-end;
    align-items: center;

    img {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
  }

  .serviceCenter {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;

    .serviceCenterRow {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      width: 100%;

      .serviceCenterItem {
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

        .serviceCenterButton {
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
  }

  .serviceListGroup {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    .serviceListItem {
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

      .serviceListLeft {
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
}
</style>
