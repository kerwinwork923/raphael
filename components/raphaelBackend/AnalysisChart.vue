<template>
  <div class="analysis-chart">
    <!-- ─── 工具列 ─── -->
    <div class="toolbar">
      <VueDatePicker
        v-model="range"
        range
        :enable-time-picker="false"
        format="yyyy/MM/dd"
        placeholder="選擇日期區間"
        prepend-icon="i-calendar"
        teleport="body"
      />
    </div>

    <!-- 圖表 -->
    <canvas ref="canvas" class="chart-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

/* ---------- Props ---------- */
const props = defineProps<{
  records: any[];
  primaryKey: string;
  secondaryKey?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  dateKey?: string;
}>();

/* ---------- Reactive ---------- */
const canvas = ref<HTMLCanvasElement | null>(null);
const range = ref<Date[] | null>(null);
let chart: Chart | null = null;

/* ---------- Utils ---------- */
const mmdd = (raw: string) => {
  if (!raw || typeof raw !== "string") return "";
  if (raw.includes("\n")) return raw;
  if (!raw.includes("/")) return raw;
  const datePart = raw.split(" ")[0];
  const parts = datePart.split("/");
  if (parts.length === 3) {
    const [_, m, d] = parts;
    return `${(m ?? "").padStart(2, "0")}/${(d ?? "").padStart(2, "0")}`;
  }
  return raw;
};

/* ---------- Build Chart ---------- */
function build() {
  if (!canvas.value) return;

  const [from, to] =
    Array.isArray(range.value) && range.value[0] && range.value[1]
      ? range.value
      : [null, null];

  const fromMs = from?.getTime() ?? null;
  const toMs = to?.getTime() ?? null;

  const filtered = props.records.filter((r: any) => {
    if (fromMs === null || toMs === null) return true;
    const ms = Date.parse(
      r[props.dateKey ?? "date"].split(" ")[0].replace(/\//g, "-")
    );
    return ms >= fromMs && ms <= toMs;
  });

  const buckets: Record<string, { p: number[]; s: number[] }> = {};
  filtered.forEach((r: any) => {
    const key = r[props.dateKey ?? "date"];
    buckets[key] ??= { p: [], s: [] };
    buckets[key].p.push(+r[props.primaryKey]);
    if (props.secondaryKey && r[props.secondaryKey] != null) {
      buckets[key].s.push(+r[props.secondaryKey]);
    }
  });

  const labels: string[] = [];
  const pData: number[] = [];
  const sData: number[] = [];

  Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([k, v]) => {
      const avg = (arr: number[]) =>
        arr.length
          ? Math.round(arr.reduce((s, x) => s + x, 0) / arr.length)
          : 0;
      labels.push(mmdd(k));
      pData.push(avg(v.p));
      if (props.secondaryKey) sData.push(avg(v.s));
    });

  chart?.destroy();
  const ctx = canvas.value.getContext("2d")!;
  const datasets: any[] = [
    {
      label: props.primaryLabel ?? props.primaryKey,
      data: pData,
      borderColor: "#009688",
      backgroundColor: "#009688",
      tension: 0.3,
      pointRadius: 4,
      fill: false,
    },
  ];

  if (props.secondaryKey && sData.length > 0) {
    datasets.push({
      label: props.secondaryLabel ?? props.secondaryKey,
      data: sData,
      borderColor: "#90CAF9",
      backgroundColor: "#90CAF9",
      tension: 0.3,
      pointRadius: 4,
      fill: false,
    });
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: function (context) {
              const r = props.records[context.dataIndex];
              let label = `${context.dataset.label}: ${context.parsed.y}`;
              if (r.ALL_Serious) label += `，嚴重程度：${r.ALL_Serious}`;
              if (r.CheckTime) label += `，檢測時間：${r.CheckTime}`;
              return label;
            },
          },
        },
      },
      scales: { y: { beginAtZero: true } },
    },
  });
}

/* ---------- Lifecycle ---------- */
onMounted(async () => {
  await nextTick();
  build();
});
onUnmounted(() => chart?.destroy());

watch(range, build);
watch(() => props.records, build, { deep: true });
</script>

<style lang="scss" scoped>
.analysis-chart {
  width: 100%;
  height: 280px;
  position: relative;
  padding-top: 1.5rem;
  @include respond-to("sm") {
    height: 320px;
    padding-top: 1rem;
  }
  :deep(.dp__input) {
    padding-top: 0; // 改 input padding
    padding-bottom: 0; // 改 input padding
    border-radius: 50px;
    background: #fff;
    box-shadow: 0px 2px 12px -2px rgba(177, 192, 216, 0.5);
    border: none;
    font-size: 14px;
    transition: all ease 0.2s;

    &:hover {
      box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
    }
  }
}
.chart-canvas {
  width: 100% !important;
  height: 100% !important;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  position: absolute;
  top: 0;
  right: 0;
  transform: translateY(-100%);
  @include respond-to("sm") {
    position: relative;
    transform: translateY(0);
    margin-bottom: 1.5rem;
  }
}
</style>
