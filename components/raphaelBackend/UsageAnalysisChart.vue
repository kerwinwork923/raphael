<template>
  <div class="usage-chart">
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
const props = defineProps({ usageData: { type: Array, required: true } });

/* ---------- Refs ---------- */
const chartCanvas = ref(null);
const chart = ref(null);
const range = ref(null); // 日期區間，預設 null（全部）
const granularity = ref("day"); // 目前只有 day

/* ---------- Utils ---------- */
const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

/* 同時支援「yyyy/MM/dd HH:mm」與 14 碼字串 ------------------------ */
const extractDate = (s = "") =>
  s.includes(" ")
    ? s.split(" ")[0] // 2025/05/20
    : `${s.slice(0, 4)}/${s.slice(4, 6)}/${s.slice(6, 8)}`;
const extractHM = (s = "") =>
  s.includes(" ")
    ? s.split(" ")[1] // 21:57
    : `${s.slice(8, 10)}:${s.slice(10, 12)}`;

/* ---------- 建圖 ---------- */
function build() {
  if (!chartCanvas.value) return;

  /* 1. 將 API 資料整理成統一格式 -------------------------------- */
  const src = (props.usageData ?? []).map((row) => ({
    date: extractDate(row.StartTime ?? row.date ?? ""),
    start: extractHM(row.StartTime ?? row.start ?? ""),
    end: extractHM(row.EndTime ?? row.end ?? row.StartTime ?? ""),
  }));

  /* 2. 依日期區間篩選 ------------------------------------------- */
  const [startAt, endAt] =
    Array.isArray(range.value) && range.value[0] && range.value[1]
      ? range.value
      : [null, null];

  const filtered = src.filter((d) => {
    if (!startAt || !endAt) return true;
    const ms = Date.parse(d.date.replace(/\//g, "-"));
    return ms >= startAt.getTime() && ms <= endAt.getTime();
  });

  /* 3. 依「日」彙整、計算平均時間 ------------------------------ */
  const map = new Map(); // key => {start:[], end:[]}
  filtered.forEach((d) => {
    const key = d.date; // 固定 day
    const obj = map.get(key) ?? { start: [], end: [] };
    obj.start.push(toMinutes(d.start));
    obj.end.push(toMinutes(d.end));
    map.set(key, obj);
  });

  const labels = [];
  const startData = [];
  const endData = [];
  [...map.entries()]
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .forEach(([k, v]) => {
      labels.push(k.replace(/^\d{4}\//, "")); // 05/20
      const avg = (arr) =>
        Math.round(arr.reduce((s, x) => s + x, 0) / arr.length);
      startData.push(avg(v.start));
      endData.push(avg(v.end));
    });

  /* 4. 畫圖 ------------------------------------------------------ */
  const ctx = chartCanvas.value.getContext("2d");
  chart.value && chart.value.destroy();

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
            label: (c) => `${c.dataset.label}：${toHHMM(c.parsed.y)}`,
          },
        },
      },
      scales: {
        y: {
          min: 0,
          max: 24 * 60,
          ticks: { stepSize: 60, callback: (v) => toHHMM(v) },
        },
      },
    },
  });
}

/* ---------- Lifecycle ---------- */
onMounted(async () => {
  await nextTick();
  build();
});
onUnmounted(() => chart.value && chart.value.destroy());

/* 重新渲染時機：資料或日期區間變動 ------------------------------ */
watch([() => props.usageData, range], build);
</script>

<style lang="scss" scoped>
.usage-chart {
  width: 100%;
  flex:1;
  // height: 340px; /* 固定高度避免撐大 */
  position: relative; /* 讓 Chart.js 100% × 100% 正常貼齊 */
  padding-top: 1.5rem;
  @include respond-to("xl") {
    flex:unset;
    height: 280px;
  }
  @include respond-to("sm") {
    height: 320px;
    padding-top:1rem;
  }
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  top: 0;
  right: 0;
  transform: translateY(-100%);
  @include respond-to("sm") {
    position: relative;
    transform: translateY(0);
    margin-bottom: 1.5rem;
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
.search {
  border: 1px solid #b1c0d8;
  background: #fff;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
}
.chart-canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
