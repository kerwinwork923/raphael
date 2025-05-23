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
      />
    </div>

    <!-- 圖表 -->
    <canvas ref="canvas" class="chart-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
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
  const [_, m, d] = raw.split("/");
  return `${m.padStart(2, "0")}/${d.padStart(2, "0")}`;
};

/* ---------- Build Chart ---------- */
function build() {
  if (!canvas.value) return;

  const [from, to] = Array.isArray(range.value) && range.value[0] && range.value[1]
    ? range.value
    : [null, null];

  const fromMs = from?.getTime() ?? null;
  const toMs = to?.getTime() ?? null;

  const filtered = props.records.filter((r: any) => {
    if (fromMs === null || toMs === null) return true;
    const ms = Date.parse(r[props.dateKey ?? "date"].split(" ")[0].replace(/\//g, "-"));
    return ms >= fromMs && ms <= toMs;
  });

  const buckets: Record<string, { p: number[]; s: number[] }> = {};
  filtered.forEach((r: any) => {
    const key = r[props.dateKey ?? "date"].split(" ")[0];
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
        arr.length ? Math.round(arr.reduce((s, x) => s + x, 0) / arr.length) : 0;
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
      plugins: { legend: { position: "bottom" } },
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

<style scoped>
.analysis-chart { width: 100%; height: 70%; position: relative; }
.chart-canvas   { width: 100% !important; height: 100% !important; }

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
</style>
