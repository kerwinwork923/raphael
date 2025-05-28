<template>
  <div class="baby-score-chart">
    <div class="toolbar">
      <VueDatePicker
        v-model="dateRange"
        range
        :enable-time-picker="false"
        format="yyyy/MM/dd"
        placeholder="選擇日期區間"
        prepend-icon="i-calendar"
      />
    </div>
    <canvas ref="canvas" class="chart-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import { Chart } from "chart.js";

const props = defineProps<{
  records: Array<{
    CheckTime: string;
    ALL_Score: string;
    ALL_Ratio: string;
    ALL_Serious: string;
  }>;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const dateRange = ref<Date[] | null>(null);

const filteredRecords = computed(() => {
  if (!dateRange.value || dateRange.value.length < 2) return props.records;
  const [from, to] = dateRange.value;
  const start = from.getTime();
  const end = to.getTime();
  return props.records.filter((item) => {
    const ms = Date.parse(item.CheckTime.replace(/\//g, "-"));
    return ms >= start && ms <= end;
  });
});

// 日期格式轉換
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
watch([() => props.records, dateRange], build, { deep: true });
</script>

<style scoped lang="scss">
.baby-score-chart {
  width: 100%;
  height: 320px;
  position: relative;
  @include respond-to("sm") {
    height: 200px;
  }
  .toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
    position: absolute;
    top: 0;
    right: 0;
    transform: translateY(-100%);
    @include respond-to("sm") {
      position: relative;
      transform: translateY(0);
    }
  }
  .chart-canvas {
    width: 100% !important;
    height: 100% !important;
  }
}
</style> 