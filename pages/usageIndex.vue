<template>
  <div class="usageIndexWrap">
    <div class="usageIndexContainer">
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
  min-height: 100vh;
  padding: 1rem 0rem 12rem;

  .usageIndexContainer {
    width: 100%;
    max-width: 768px;
    margin: auto;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
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
      width: 100%;
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Primary-default, #74bc1f);
      box-shadow: 2px 4px 12px 0
        var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
      color: var(--Neutral-white, #fff);
      font-size: var(--Text-font-size-24, 24px);
      font-style: normal;
      font-weight: 700;
      letter-spacing: 3.6px;
      border: none;
      cursor: pointer;
      padding: 0.5rem 0;
    }
  }
}
</style>
