<template>
  <header class="page-header">
    <h2 class="title">
      {{ title }}
      <span class="count" v-if="count !== undefined"
        >({{ count }}{{ countUnit }})</span
      >
    </h2>
    <div class="meta">
      <button class="btn refresh" @click="handleRefresh" :disabled="isLoading">
        <i class="i-refresh" :class="{ rotating: isLoading }"></i>
       
        {{ refreshButtonText }}
      </button>
      <span class="updated-time">最後更新: {{ lastUpdated }}</span>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  count?: number | string;
  countUnit?: string;
  lastUpdated: string;
  refreshButtonText?: string;
  isLoading?: boolean;
}

interface Emits {
  (e: "refresh"): void;
}

const props = withDefaults(defineProps<Props>(), {
  countUnit: "",
  refreshButtonText: "資料更新",
  isLoading: false,
});

const emit = defineEmits<Emits>();

const handleRefresh = () => {
  if (!props.isLoading) {
    emit("refresh");
  }
};
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;



  @include respond-to("sm") {
    flex-wrap: wrap;
  }

  .title {
    color: var(--Primary-600, #2d3047);
    text-align: center;

    font-size: 36px;
    font-style: normal;
    font-weight: 700;

    letter-spacing: 0.09px;
    @include respond-to("lg") {
    padding-left: 36px;
  }
    .count {
      color: var(--Primary-200, #b1c0d8);
      text-align: center;
      font-size: 20px;
      font-style: normal;
      font-weight: 700;
      line-height: 100%;

      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
    }
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 16px;

    @include respond-to("lg") {
      gap: 6px;
  
      width: 100%;
    }

    .btn.refresh {
      border-radius: 6px;
      background: var(--Primary-200, #b1c0d8);
      padding: 9px 12px;
      border: none;
      color: var(--Primary-100, #f5f7fa);
      cursor: pointer;
      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;
      letter-spacing: 2.7px;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      white-space: nowrap;
      img {
        width: 16px;
        height: 16px;
      }

      &:hover:not(:disabled) {
        background-color: $primary-300;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      @include respond-to("lg") {
        font-size: 1rem;
        padding: 0.25rem 0.5rem;
      }

      .i-refresh {
        display: inline-block;
        // margin-right: 4px;
        display: none;
        &.rotating {
          animation: rotate 1s linear infinite;
        }
      }
    }

    .updated-time {
      font-size: 12px;
      color: $Neutral-500;
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 140%;
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
