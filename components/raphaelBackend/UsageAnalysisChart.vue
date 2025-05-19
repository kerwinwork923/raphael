<!-- components/raphaelBackend/UsageAnalysisChart.vue -->
<template>
  <div class="usage-chart">
    <div class="toolbar">
      <!-- 粒度下拉（天 / 週 / 月）-->
      <select v-model="granularity" class="granularity">
        <option value="day">日</option>
        <option value="week">週</option>
        <option value="month">月</option>
      </select>

      <!-- 日期區間 -->
      <VueDatePicker
        v-model="range"
        range
        :enable-time-picker="false"
        :format="'yyyy/MM/dd'"
        placeholder="選擇日期區間"
        prepend-icon="i-calendar"
      />

      <!-- 查詢按鈕 -->
      <button class="search" @click="rebuild">搜尋</button>
    </div>

    <!-- 圖表 -->
    <canvas ref="chartCanvas" class="chart-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

/* ---------- Props ---------- */
const props = defineProps({
  usageData: { type: Array, required: true },
});

/* ---------- Reactive ---------- */
const chartCanvas = ref(null);
const chart = ref(null);
const range = ref(null); // 日期區間
const granularity = ref("day"); // day / week / month

/* ---------- Utils ---------- */
// 時間字串 → 分鐘數（例 14:30 → 870）
const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
// 分鐘數 → HH:mm（例 870 → 14:30）
const toHHMM = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

/* ---------- 建圖 ---------- */
function build() {
  if (!chartCanvas.value) return;

  /* 1. 篩選 + 分組 -------------------------------------------- */
  const src = [...(props.usageData ?? [])];

  // 按日期區間篩掉
  const [startAt, endAt] =
    Array.isArray(range.value) && range.value[0] && range.value[1]
      ? range.value
      : [null, null];
  const filtered = src.filter((d) => {
    if (!startAt || !endAt) return true;
    const ms = Date.parse(d.date.replace(/\//g, "-"));
    return ms >= startAt && ms <= endAt;
  });

  // 依粒度彙整 (day/ week / month)
  const groupKey = (d) => {
    if (granularity.value === "week") {
      const date = new Date(d.date);
      const week = new Date(date.setDate(date.getDate() - date.getDay() + 1)) // 該週週一
        .toISOString()
        .slice(0, 10); // yyyy‑MM‑dd
      return week;
    }
    if (granularity.value === "month") return d.date.slice(0, 7); // yyyy/MM
    return d.date; // day
  };

  const map = new Map(); // key -> { startAvg, endAvg }
  filtered.forEach((d) => {
    const key = groupKey(d);
    const obj = map.get(key) ?? { start: [], end: [] };
    obj.start.push(toMinutes(d.start));
    obj.end.push(toMinutes(d.end));
    map.set(key, obj);
  });

  // 轉陣列並計算平均
  const labels = [];
  const startData = [];
  const endData = [];
  [...map.entries()]
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .forEach(([k, v]) => {
      labels.push(k.replace(/^\d{4}\//, "")); // label 去掉年份
      const avg = (arr) =>
        Math.round(arr.reduce((s, x) => s + x, 0) / arr.length);
      startData.push(avg(v.start));
      endData.push(avg(v.end));
    });

  /* 2. 建立 / 更新圖 -------------------------------------------- */
  const ctx = chartCanvas.value.getContext("2d");
  if (chart.value) chart.value.destroy();

  chart.value = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "使用時間",
          data: startData,
          borderColor: "#009688",
          backgroundColor: "#009688",
          tension: 0.3,
          pointRadius: 4,
          fill: false,
        },
        {
          label: "結束時間",
          data: endData,
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
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}：${toHHMM(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        y: {
          min: 0,
          max: 24 * 60,
          ticks: {
            stepSize: 60,
            callback: (v) => toHHMM(v),
          },
        },
      },
    },
  });
}

function rebuild() {
  // 手動點搜尋重建
  build();
}

/* ---------- Lifecycle ---------- */
onMounted(async () => {
  await nextTick();
  build();
});
onUnmounted(() => chart.value && chart.value.destroy());

/* ---------- Watch ---------- */
watch([() => props.usageData, granularity], build);
</script>

<style scoped>
.usage-chart {
  width: 100%;
  height: 280px;       /* ← 只要給定高度就不會一直撐大 */
  position: relative;  /* 讓 Chart.js 100% × 100% 正常搆到 */
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
canvas {
  max-width: 100%;
}
.usage-chart {
  width: 100%;
}
.chart-canvas {
  width: 100% !important;
  height: 100% !important;   /* 填滿父層 */
}
</style>
