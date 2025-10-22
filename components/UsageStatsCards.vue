<template>
  <div class="usage-stats-cards">
    <!-- 今日穿衣時間卡片 -->
    <div class="stats-card">
      <div class="card-icon">
        <img src="/assets/imgs/usage/sun-icon.png" alt="太陽圖示" />
      </div>
      <div class="card-content">
        <div class="card-time">
          <template v-if="!loading && !error">{{ todayWearTime }}</template>
          <template v-else-if="loading">讀取中...</template>
          <template v-else>0分鐘</template>
        </div>
        <div class="card-label">今日穿衣時間</div>
      </div>
    </div>

    <!-- 連續穿衣紀錄卡片 -->
    <div class="stats-card">
      <div class="card-icon">
        <img src="/assets/imgs/usage/plant-icon.png" alt="植物圖示" />
      </div>
      <div class="card-content">
        <div class="card-number">
          <template v-if="!loading && !error">{{ continuousDays }}天</template>
          <template v-else-if="loading">—</template>
          <template v-else>0天</template>
        </div>
        <div class="card-label">連續穿衣紀錄</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useUsageRecords } from "~/composables/useUsageRecords";

const props = defineProps({
  userData: {
    type: Object,
    default: () => null,
  },
});

const { loading, error, todayWearTime, continuousDays, fetchUsageRecords } =
  useUsageRecords();

onMounted(() => {
  // 在 client 端觸發 API，支援用 props 覆蓋 localStorage
  fetchUsageRecords(props.userData);
});
</script>

<style lang="scss" scoped>
.usage-stats-cards {
  display: flex;
  gap: 16px;
  margin: 1.5rem 0;

  .stats-card {
    width: 100%;

    @include neumorphismOuter();
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
    display: none;

    .card-icon {
      width: 73px;
      height: 73px;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: 100%;

      .card-time {
        @include neumorphismInset($padding: 0.5rem);
        color: $raphael-black;
        text-align: center;

        font-size: 24px;
        font-style: normal;
        font-weight: 700;

        letter-spacing: 3.5px;
        width: 100%;
        white-space: nowrap;
      }

      .card-number {
        color: $raphael-black;
        text-align: center;

        font-size: 24px;
        font-style: normal;
        font-weight: 700;
        line-height: 100%; /* 24px */
        letter-spacing: 0.12px;
      }

      .card-label {
        color: $raphael-cyan-300;
        text-align: center;
        font-size: 18px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.072px;
        white-space: nowrap;
      }
    }
  }
}
</style>
