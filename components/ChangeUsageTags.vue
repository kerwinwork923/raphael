<template>
  <div class="changeUsageTags">
    <div
      class="changeUsageTag"
      :class="{ changeUsageTagActive: currentPath === '/UsageHistory' }"
      @click="gotoUsageHistory"
    >
      穿衣紀錄
    </div>
    <div
      class="changeUsageTag"
      :class="{ changeUsageTagActive: currentPath === '/HRVHistory' }"
      @click="gotoHRVHistory"
    >
      HRV檢測
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";

const router = useRouter();
const route = useRoute();

// 取得當前路徑
const currentPath = computed(() => route.path);

const gotoHRVHistory = () => {
  if (currentPath.value !== "/HRVHistory") {
    router.push("/HRVHistory");
  }
};

const gotoUsageHistory = () => {
  if (currentPath.value !== "/UsageHistory") {
    router.push("/UsageHistory");
  }
};
</script>

<style scoped>
.changeUsageTags {
  display: flex;
  justify-content: center;
  width: 100%;
}
.changeUsageTag {
  width: 50%;
  color: var(--shade-gray-500, #666);
  font-size: 1.125rem;
  font-style: normal;
  font-weight: 400;
  line-height: 100%;
  letter-spacing: 0.5px;
  display: block;
  text-align: center;
  padding-bottom: 0.5rem;
  cursor: pointer;
}

/* 動態高亮顯示當前頁面 */
.changeUsageTagActive {
  border-bottom: 1px solid #74bc1f;
  color: var(--brand-green-400, #74bc1f);
}
</style>
