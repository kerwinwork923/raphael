<template>
  <div class="usageIndexWrap">
    <div class="usageIndexContainer">
      <div data-v-ca9243ba="" class="notificationBell">
        <img
          data-v-ca9243ba=""
          src="/_nuxt/assets/imgs/member/bell.svg"
          alt="通知"
        />
      </div>
      <!-- 頂部通知區域 -->
      <div class="notification-section">
        <MemberTop :userDataObj="userDataObj" />
      </div>

      <!-- 統計卡片 -->
      <UsageStatsCards :userData="userDataObj" />

      <!-- 使用紀錄列表 -->
      <UsageRecordList />
    </div>
    <div class="gettingDressedGroup">
      <button @click="gotoGettingDressed">
        開始穿衣
        <img src="../assets/imgs/usage/gettingDressedNextIcon.svg" alt="" />
      </button>
    </div>
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import MemberTop from "~/components/MemberTop.vue";
import UsageStatsCards from "~/components/UsageStatsCards.vue";
import UsageRecordList from "~/components/UsageRecordList.vue";
import BottomNav from "~/components/BottomNav.vue";
import { useRouter } from "vue-router";
// 響應式數據
const userDataObj = ref(null);

const router = useRouter();
onMounted(() => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  userDataObj.value = userData;
});

const gotoGettingDressed = () => {
  router.push("/UsageHistory");
};
</script>
<style scoped lang="scss">
.usageIndexWrap {
  @include gradientBg();
  width: 100%;
  padding: 16px 0 84px 0;

  .usageIndexContainer {
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
  }
  .gettingDressedGroup {
    width: 100%;
    max-width: 768px;
    margin: 0 auto;
    padding: 1rem 16px;
    display: flex;
    flex-direction: column;
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    //擬態
    backdrop-filter: blur(4px);

    button {
      @include neumorphismOuter($bgColor: $raphael-green-400, $radius: 50px);
      width: 100%;
      color: $raphael-white;
      font-size: 24px;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 3.6px;
      border: none;
      cursor: pointer;
      padding: 0.25rem 0;
    }
  }
}
</style>
