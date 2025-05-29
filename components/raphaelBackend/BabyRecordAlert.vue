<template>
  <div class="babyRecordAlert">
    <div class="babyRecordAlertTitleGroup">
      <img src="/assets/imgs/backend/Subtract.svg" alt="" />
      <h3>{{ mainDetail?.CheckTime || '—' }}</h3>
      <h4>檢測時間</h4>
    </div>
    <div class="babyRecordAlertTitleHR"></div>
    <div class="babyRecordAlertContent1Group" v-if="mainDetail">
      <div class="babyRecordAlertContent1TitleGroup">
        <h5>全部總分</h5>
        <h6>
          <img src="/assets/imgs/backend/down.svg" alt="" />
          {{ mainDetail.ALL_Ratio }}%
        </h6>
      </div>
      <h3>{{ mainDetail.ALL_Score }}</h3>
      <h4>{{ mainDetail.ALL_Ratio }}% ({{ mainDetail.ALL_Serious }})</h4>
    </div>
    <div class="babyRecordAlertContent3Group">
      <div
        class="babyRecordAlertContent3"
        v-for="item in detailList"
        :key="item.Type"
      >
        <div class="babyRecordAlertContentTitle">
          <h3>{{ item.TypeName }}</h3>
          <div class="scoreGroup" :class="{ up: Number(item.Diff) > 0, down: Number(item.Diff) <= 0 }">
            <h6>{{ item.Diff }}%</h6>
            <img :src="Number(item.Diff) > 0 ? '/assets/imgs/backend/up.svg' : '/assets/imgs/backend/down.svg'" alt="" />
          </div>
        </div>
        <div class="value">{{ item.Ratio }}%</div>
        <small>{{ item.Serious }}</small>
      </div>
    </div>
    <div class="babyRecordAlertClose" @click="emit('close')">
      <img src="/assets/imgs/backend/close.svg" alt="" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import { Chart } from "chart.js";

const props = defineProps<{ record: any }>();
const emit = defineEmits(['close']);

// 取出主資料（用第一筆即可，因為 ALL_Score/ALL_Ratio/ALL_Serious 都一樣）
const detailList = props.record?.ChildANSDetailList || [];
const mainDetail = detailList.length > 0 ? detailList[0] : null;

const canvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const dateRange = ref<Date[] | null>(null);

const filteredRecords = computed(() => {
  if (!dateRange.value || dateRange.value.length < 2) return detailList;
  const [from, to] = dateRange.value;
  const start = from.getTime();
  const end = to.getTime();
  return detailList.filter((item) => {
    const ms = Date.parse(item.CheckTime.replace(/\//g, "-"));
    return ms >= start && ms <= end;
  });
});

const mmdd = (raw: string) => {
  if (!raw || typeof raw !== "string") return "";
  if (!raw.includes("/")) return raw;
  const datePart = raw.split(" ")[0];
  const parts = datePart.split("/");
  if (parts.length === 3) {
    const [_, m, d] = parts;
    return `${(m ?? "").padStart(2, "0")}/${(d ?? "").padStart(2, "0")}`;
  }
  return raw;
};

function build() {
  if (!canvas.value) return;
  const sorted = [...filteredRecords.value].sort(
    (a, b) => new Date(a.CheckTime).getTime() - new Date(b.CheckTime).getTime()
  );
  const labels = sorted.map((r) => mmdd(r.CheckTime));
  const scores = sorted.map((r) => Number(r.ALL_Score));
  const ratios = sorted.map((r) => Number(r.ALL_Ratio));
  const serious = sorted.map((r) => r.ALL_Serious);

  const maxScore = Math.max(...scores, 200);
  const yMax = maxScore < 200 ? 200 : Math.ceil(maxScore * 1.1 / 10) * 10;

  chart?.destroy();
  const ctx = canvas.value.getContext("2d")!;
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "總分",
          data: scores,
          borderColor: "#1ba39b",
          backgroundColor: "#1ba39b",
          tension: 0.3,
          pointRadius: 5,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const idx = context.dataIndex;
              let label = `總分: ${scores[idx]}`;
              if (ratios[idx] !== undefined) label += `，百分比: ${ratios[idx]}%`;
              if (serious[idx]) label += `，表現: ${serious[idx]}`;
              return label;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: yMax,
        },
      },
    },
  });
}

onMounted(async () => {
  await nextTick();
  build();
});
onUnmounted(() => chart?.destroy());
watch([() => detailList, dateRange], build, { deep: true });
</script>

<style scoped lang="scss">
.babyRecordAlert {
  position: fixed;

  width: 80%;
  max-width: 1000px;
  left: 50%;
  top: 48.5%;
  max-height: 85%;
  transform: translate(-50%, -50%);

  border-radius: var(--Radius-r-20, 20px);
  border: 3px solid var(--Primary-default, #1ba39b);
  background: var(--neutral-white-opacity-30, rgba(255, 255, 255, 0.3));
  box-shadow: 0px 2px 20px 0px
    var(--primary-400-opacity-25, rgba(27, 163, 155, 0.25));
  backdrop-filter: blur(25px);
  z-index: 100;
  padding: 1rem 2.5%;
  overflow-y: auto;
  scrollbar-gutter: stable;
  box-sizing: border-box;
  // 自訂 scrollbar 樣式（Webkit）
  &::-webkit-scrollbar {
    width: 12px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #878787;
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: #848484;
  }
  .babyRecordAlertTitleGroup {
    text-align: center;
    margin-bottom: 0.75rem;
    .HRVUserAlertHR {
      background: var(--Primary-200, #b1c0d8);
      width: 100%;
      height: 1px;
    }
    img {
      width: 2rem;
      height: 2rem;
      border-radius: 9.8px;
      border: 1px solid var(--Primary-default, #1ba39b);
      padding: 2px 4px;
    }
    h3 {
      color: var(--Primary-600, #2d3047);
      font-size: var(--Text-font-size-24, 20px);
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.12px;
    }
    h4 {
      margin-top: 0.15rem;
      color: var(--Primary-default, #1ba39b);
      font-family: "Noto Sans";
      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.09px;
    }
  }
  .babyRecordAlertTitleHR {
    background: var(--Primary-200, #b1c0d8);
    width: 100%;
    height: 1px;
  }
  .babyRecordAlertContent1Group {
    margin-top: 0.5rem;
    border-radius: 20px;
    background: var(--Neutral-white, #fff);
    box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
    padding: 1rem;
    .babyRecordAlertContent1TitleGroup {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h5 {
      color: var(--Primary-600, #2d3047);

      font-size: 20px;
      font-style: normal;
      font-weight: 400;

      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
    }
    h6 {
      color: var(--Secondary-default, #74bc1f);
      text-align: center;

      font-size: 16px;
      font-style: normal;
      font-weight: 400;

      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .AutonomicNerveAlertContent1TitleGroup {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    h3 {
      color: var(--Primary-600, #2d3047);
      font-family: "Noto Sans";
      font-size: 24px;
      font-style: normal;
      font-weight: 700;
      line-height: 100%; /* 24px */
      letter-spacing: 0.12px;
      margin-top: 0.25rem;
    }
    h4 {
      color: var(--Primary-200, #b1c0d8);

      font-size: 14px;
      font-style: normal;
      font-weight: 400;

      letter-spacing: 0.1px;
    }
  }

  .babyRecordAlertContent3Group {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    @include respond-to("md") {
      flex-direction: column;
    }
    .babyRecordAlertContent3 {
      background-color: #fff;
      margin-top: 0.5rem;
      border-radius: 20px;
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
      padding: 1rem;
      width: 49%;
      @include respond-to("md") {
        width: 100%;
      }
    }
    .babyRecordAlertContentTitle {
      display: flex;
      justify-content: space-between;
      color: var(--Warning-default, #ec4f4f);
      text-align: center;
      font-family: "Noto Sans";
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.5px;
    }
    h3 {
      color: var(--Primary-600, #2d3047);
      font-family: "Noto Sans";
      font-size: 20px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
    }
    .scoreGroup {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .down {
      color: #74bc1f;
    }
    .value {
      color: var(--Primary-600, #2d3047);
      font-size: 24px;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.12px;
      margin-top: 0.5rem;
    }
    small {
      color: var(--Primary-200, #b1c0d8);
      font-family: "Noto Sans";
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.1px;
    }
  }
  .babyRecordAlertContent3:nth-last-child(1):nth-child(odd) {
  width: 100%;
}

  .babyRecordAlertClose {
    text-align: center;
    margin-top: 0.5rem;
    cursor: pointer;
    img {
      padding: 4px;
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px
        var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    }
  }
}
</style>
