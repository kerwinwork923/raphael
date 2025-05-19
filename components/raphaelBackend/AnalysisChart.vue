<template>
  <div class="analysis-chart">
    <!-- ────────── 工具列 ────────── -->
    <div class="toolbar">
      <select v-model="granularity" class="granularity">
        <option value="day">日</option>
        <option value="week">週</option>
        <option value="month">月</option>
      </select>

      <VueDatePicker
        v-model="range"
        range
        :enable-time-picker="false"
        :format="'yyyy/MM/dd'"
        placeholder="選擇日期區間"
        prepend-icon="i-calendar"
      />

      <button class="search" @click="build">搜尋</button>
    </div>

    <!-- 圖表 -->
    <canvas ref="canvas" class="chart-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

/* ---------- Props ---------- */
const props = defineProps({
  /** 資料來源，必須要有 `date` 欄位 (yyyy/MM/dd) 以及你指定的兩個數值欄位 */
  records: { type: Array, required: true },
  /** 第一條線要取哪個欄位值  (字串) */
  primaryKey: { type: String, required: true },
  /** 第二條線要取哪個欄位值  (字串) */
  secondaryKey: { type: String, required: true },
  /** 第一條線顯示名稱 */
  primaryLabel: { type: String, default: "Series A" },
  /** 第二條線顯示名稱 */
  secondaryLabel: { type: String, default: "Series B" },
});

/* ---------- Reactive ---------- */
const canvas = ref(null);
let chart = null;
const range = ref(null);
const granularity = ref("day"); 

/* ---------- Helper ---------- */
const keyByGranularity = (d) => {
  if (granularity.value === "week") {
    const dt = new Date(d.date);
    const monday = new Date(dt.setDate(dt.getDate() - dt.getDay() + 1))
      .toISOString()
      .slice(0, 10); // yyyy‑MM‑dd
    return monday;
  }
  if (granularity.value === "month") return d.date.slice(0, 7); // yyyy/MM
  return d.date; // day
};

/* ---------- Build Chart ---------- */
function build() {
  if (!canvas.value) return;

  /* 1. 篩選 + 聚合 */
  const [startAt, endAt] =
    Array.isArray(range.value) && range.value[0] && range.value[1]
      ? range.value
      : [null, null];

  const filtered = props.records.filter((d) => {
    if (!startAt || !endAt) return true;
    const ms = Date.parse(d.date.replace(/\//g, "-"));
    return ms >= startAt && ms <= endAt;
  });

  const map = new Map(); // key -> { p:[], s:[] }
  filtered.forEach((d) => {
    const k = keyByGranularity(d);
    const bucket = map.get(k) ?? { p: [], s: [] };
    bucket.p.push(Number(d[props.primaryKey]));
    bucket.s.push(Number(d[props.secondaryKey]));
    map.set(k, bucket);
  });

  const labels = [];
  const pData = [];
  const sData = [];
  [...map.entries()]
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .forEach(([k, v]) => {
      const avg = (arr) =>
        Math.round(arr.reduce((s, x) => s + x, 0) / arr.length);
      labels.push(k.replace(/^\d{4}\//, "")); // 去掉年份
      pData.push(avg(v.p));
      sData.push(avg(v.s));
    });

  /* 2. 畫圖 (如已存在先毀掉) */
  if (chart) chart.destroy();
  const ctx = canvas.value.getContext("2d");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: props.primaryLabel,
          data: pData,
          borderColor: "#009688",
          backgroundColor: "#009688",
          tension: 0.3,
          pointRadius: 4,
          fill: false,
        },
        {
          label: props.secondaryLabel,
          data: sData,
          borderColor: "#90CAF9",
          backgroundColor: "#90CAF9",
          tension: 0.3,
          pointRadius: 4,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "bottom" },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

/* ---------- Lifecycle & Watch ---------- */
onMounted(async () => {
  await nextTick();
  build();
});
onUnmounted(() => chart && chart.destroy());
watch([() => props.records, granularity], build);
</script>

<style scoped>
.analysis-chart {
  width: 100%;
  height: 70%;
  position: relative;
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
}
.granularity,
.search {
  border: 1px solid #b1c0d8;
  background: #fff;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
}
</style>
