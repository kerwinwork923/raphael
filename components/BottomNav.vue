<template>
  <nav class="bottom-nav">
    <div
      class="nav-item"
      :class="{ active: activeTab === 'services' }"
      @click="navigateTo('/service')"
    >
      <div class="nav-icon">
        <img
          v-if="activeTab === 'services'"
          src="/assets/imgs/robot/heartRate-active.svg"
          alt="健康任務"
        />
        <img v-else src="/assets/imgs/robot/heartRate.svg" alt="健康任務" />
      </div>
      <span>健康任務</span>
    </div>
    <div
      class="nav-item"
      :class="{ active: activeTab === 'record' }"
      @click="navigateTo('/usageIndex')"
    >
      <div class="nav-icon">
        <img
          v-if="activeTab === 'record'"
          src="/assets/imgs/robot/cloth-active.svg"
          alt="穿衣紀錄"
        />
        <img v-else src="/assets/imgs/robot/cloth.svg" alt="穿衣紀錄" />
      </div>
      <span>穿衣紀錄</span>
    </div>
    <div
      class="nav-item"
      :class="{ active: activeTab === 'home' }"
      @click="navigateTo('/robot')"
    >
      <div class="nav-icon">
        <img
          v-if="activeTab === 'home'"
          src="/assets/imgs/robot/home-active.svg"
          alt="首頁"
        />
        <img v-else src="/assets/imgs/robot/home.svg" alt="首頁" />
      </div>
      <span>首頁</span>
    </div>
    <!-- <div
      class="nav-item"
      :class="{ active: activeTab === 'shop' }"
      @click="navigateTo('/cart')"
    >
      <div class="nav-icon">
        <img
          v-if="activeTab === 'shop'"
          src="/assets/imgs/robot/market-active.svg"
          alt="健康好物"
        />
        <img v-else src="/assets/imgs/robot/market.svg" alt="健康好物" />
      </div>
      <span>健康好物</span>
    </div> -->
    <div
      class="nav-item"
      :class="{ active: activeTab === 'clinicStories' }"
      @click="navigateTo('/clinicStories')"
    >
      <div class="nav-icon">
        <img
          v-if="activeTab === 'clinicStories'"
          src="/assets/imgs/clinicStories-active.svg"
          alt="診間故事"
        />
        <img v-else src="/assets/imgs/clinicStories.svg" alt="診間故事" />
      </div>
      <span>診間故事</span>
    </div>
    <div
      class="nav-item"
      :class="{ active: activeTab === 'member' }"
      @click="navigateTo('/member')"
    >
      <div class="nav-icon">
        <img
          v-if="activeTab === 'member'"
          src="/assets/imgs/robot/member-active.svg"
          alt="會員"
        />
        <img v-else src="/assets/imgs/robot/member.svg" alt="會員" />
      </div>
      <span>會員</span>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const activeTab = ref("home");

// 根據當前路由設置活動標籤
const setActiveTabFromRoute = () => {
  const path = route.path;
  switch (path) {
    case "/service":
    case "/package":
    case "/contract":
    case "/CSRobot":
      activeTab.value = "services";
      break;
    case "/UsageHistory":
    case "/HRVHistory":
    case "/usageIndex":
      activeTab.value = "record";
      break;
    case "/robot":
      activeTab.value = "home";
      break;
    case "/cart":
      activeTab.value = "shop";
      break;
    case "/member":
    case "/point":
      activeTab.value = "member";
      break;
    case "/clinicStories":
      activeTab.value = "clinicStories";
      break;
    default:
      activeTab.value = "home";
  }
};

// 導航到指定頁面
const navigateTo = (path) => {
  router.push(path);
};

// 監聽路由變化
watch(
  () => route.path,
  () => {
    setActiveTabFromRoute();
  }
);

onMounted(() => {
  setActiveTabFromRoute();
});
</script>

<style lang="scss" scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 768px;
  background: #f5f7fa;
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: repeat(5, 1fr);
  padding-top: 4px;
  padding-bottom: 34px;
  margin: auto;
  border-top: 1px solid $raphael-white;
  z-index: 100;

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 12px;
    color: #4a5568;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 1.5px 0;
    border-radius: 15px;

    &.active {
      color: #74bc1f;
      font-weight: bold;
    }

    .nav-icon {
      font-size: 22px;
      margin-bottom: 4px;

      img {
        width: 24px;
        height: 24px;
        object-fit: contain;
      }
    }
  }
}
</style>
