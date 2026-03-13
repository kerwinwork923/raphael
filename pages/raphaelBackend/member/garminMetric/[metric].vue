<template>
  <div class="memberInfo">
    <Sidebar />
    <div class="memberInfoContent">
      <div class="pageHeader">
        <h3>{{ member?.Name || "會員" }}｜Garmin {{ metricTitle }}詳細頁</h3>
        <div class="headerActions">
          <VueDatePicker
            v-model="dateRange"
            range
            :partial-range="true"
            :enable-time-picker="false"
            format="yyyy/MM/dd"
            placeholder="選擇日期區間"
            teleport="body"
          />
          <button class="goBackBtn" @click="goBack">返回</button>
        </div>
      </div>

      <div class="detailCard">
        <div class="chartWrap">
          <canvas ref="detailCanvas"></canvas>
        </div>

        <div class="tableWrap">
          <div
            class="tableHeader"
            :style="{
              gridTemplateColumns: `repeat(${metricData.headers.length}, minmax(120px, 1fr))`,
            }"
          >
            <div class="th" v-for="head in metricData.headers" :key="head">{{ head }}</div>
          </div>
          <div class="tableBody" v-if="metricData.rows.length">
            <div
              class="tableRow"
              :style="{
                gridTemplateColumns: `repeat(${metricData.headers.length}, minmax(120px, 1fr))`,
              }"
              v-for="(row, idx) in metricData.rows"
              :key="idx"
            >
              <div class="td" v-for="(val, i) in row" :key="i">{{ val || "—" }}</div>
            </div>
          </div>
          <div class="tableEmpty" v-else>尚無資料</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import VueDatePicker from "@vuepic/vue-datepicker";
import Sidebar from "~/components/raphaelBackend/Sidebar.vue";
import { useMemberStore } from "~/stores/useMemberStore";
import { storeToRefs } from "pinia";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

type MetricKey = "heartRate" | "spo2" | "stress" | "sleep" | "temp";
type MetricData = {
  headers: string[];
  rows: string[][];
  labels: string[];
  datasets: any[];
  chartType: "line" | "bar";
  stacked?: boolean;
};

const route = useRoute();
const router = useRouter();
const memberStore = useMemberStore();
const { member } = storeToRefs(memberStore);
const dateRange = ref<Date[] | null>(null);
const detailCanvas = ref<HTMLCanvasElement | null>(null);
let detailChart: Chart | null = null;

const metricTitleMap: Record<MetricKey, string> = {
  heartRate: "心率",
  spo2: "血氧",
  stress: "壓力",
  sleep: "睡眠",
  temp: "溫度",
};

const metricKey = computed<MetricKey>(() => {
  const raw = String(route.params.metric || "heartRate");
  const keys = Object.keys(metricTitleMap) as MetricKey[];
  return keys.includes(raw as MetricKey) ? (raw as MetricKey) : "heartRate";
});

const metricTitle = computed<string>(() => {
  const key: MetricKey = metricKey.value;
  return metricTitleMap[key];
});

function goBack() {
  router.push("/raphaelBackend/member/memberContent");
}

function toLocalDayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function toLocalDayEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
}

function formatDateYYYYMMDD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function toDateKey(raw: string) {
  const value = String(raw || "");
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  }
  return value.slice(0, 10).replace(/\//g, "-");
}

function parseDateOnlyToMs(dateLike: string) {
  const d = toDateKey(dateLike);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return NaN;
  const [y, m, day] = d.split("-").map(Number);
  if (!y || !m || !day) return NaN;
  return new Date(y, m - 1, day).getTime();
}

function parseYYYYMMDDToDate(raw: string) {
  if (!/^\d{8}$/.test(raw)) return null;
  const y = Number(raw.slice(0, 4));
  const m = Number(raw.slice(4, 6));
  const d = Number(raw.slice(6, 8));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function getRecentDateKeys(days = 7) {
  const result: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push(toDateKey(formatDateYYYYMMDD(d)));
  }
  return result;
}

const dateKeys = computed<string[]>(() => {
  if (!dateRange.value || !dateRange.value[0]) return getRecentDateKeys(7);
  const startMs = toLocalDayStart(dateRange.value[0]);
  const endMs = toLocalDayEnd(dateRange.value[1] ?? dateRange.value[0]);
  const all = getRecentDateKeys(30);
  return all.filter((d: string) => {
    const ms = parseDateOnlyToMs(d);
    if (Number.isNaN(ms)) return false;
    return ms >= startMs && ms <= endMs;
  });
});

const isSingleDaySelected = computed(() => {
  if (!dateRange.value || dateRange.value.length < 1 || !dateRange.value[0]) return false;
  const from = toLocalDayStart(dateRange.value[0]);
  const to = toLocalDayStart(dateRange.value[1] ?? dateRange.value[0]);
  return from === to;
});

const metricData = computed<MetricData>(() => {
  const labels = dateKeys.value.map((d: string) => d.slice(5).replace("-", "/"));
  const idxValues = dateKeys.value.map((_: string, idx: number) => idx);
  const hrMax = idxValues.map((i: number) => 76 + ((i * 3) % 12));
  const hrMin = idxValues.map((i: number) => 54 + ((i * 2) % 8));
  const spo2Max = idxValues.map((i: number) => 98 + (i % 2));
  const spo2Min = idxValues.map((i: number) => 93 + (i % 4));
  const stressMax = idxValues.map((i: number) => 78 + ((i * 5) % 18));
  const stressMin = idxValues.map((i: number) => 45 + ((i * 3) % 12));
  const tempMax = idxValues.map((i: number) => Number((36.6 + ((i % 3) * 0.2)).toFixed(1)));
  const tempMin = idxValues.map((i: number) => Number((35.8 + ((i % 2) * 0.2)).toFixed(1)));
  const sleepDeep = idxValues.map((i: number) => 90 + ((i * 11) % 40));
  const sleepRem = idxValues.map((i: number) => 45 + ((i * 7) % 30));
  const sleepLight = idxValues.map((i: number) => 180 + ((i * 13) % 60));

  if (metricKey.value === "heartRate") {
    if (isSingleDaySelected.value) {
      const hourlyLabels = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);
      const hourlyValues = hourlyLabels.map((_, h) => 56 + ((h * 3 + 7) % 24));
      return {
        headers: ["測量時間", "心率"],
        rows: hourlyLabels.map((t: string, i: number) => [t, String(hourlyValues[i])]),
        labels: hourlyLabels,
        datasets: [
          { label: "心率", data: hourlyValues, borderColor: "#1ba39b", backgroundColor: "#1ba39b" },
        ],
        chartType: "line",
      };
    }

    return {
      headers: ["日期", "最高心率", "最低心率"],
      rows: labels.map((d: string, i: number) => [d, String(hrMax[i]), String(hrMin[i])]),
      labels,
      datasets: [
        { label: "最高", data: hrMax, borderColor: "#7cbc28", backgroundColor: "#7cbc28" },
        { label: "最低", data: hrMin, borderColor: "#27a3a9", backgroundColor: "#27a3a9" },
      ],
      chartType: "line",
    };
  }

  if (metricKey.value === "spo2") {
    return {
      headers: ["日期", "最高血氧", "最低血氧"],
      rows: labels.map((d: string, i: number) => [d, String(spo2Max[i]), String(spo2Min[i])]),
      labels,
      datasets: [
        { label: "最高", data: spo2Max, borderColor: "#7cbc28", backgroundColor: "#7cbc28" },
        { label: "最低", data: spo2Min, borderColor: "#27a3a9", backgroundColor: "#27a3a9" },
      ],
      chartType: "line",
    };
  }

  if (metricKey.value === "stress") {
    return {
      headers: ["日期", "最高壓力", "最低壓力"],
      rows: labels.map((d: string, i: number) => [d, String(stressMax[i]), String(stressMin[i])]),
      labels,
      datasets: [
        { label: "最高", data: stressMax, borderColor: "#7cbc28", backgroundColor: "#7cbc28" },
        { label: "最低", data: stressMin, borderColor: "#27a3a9", backgroundColor: "#27a3a9" },
      ],
      chartType: "line",
    };
  }

  if (metricKey.value === "sleep") {
    return {
      headers: ["日期", "REM(分)", "淺眠(分)", "深眠(分)"],
      rows: labels.map((d: string, i: number) => [d, String(sleepRem[i]), String(sleepLight[i]), String(sleepDeep[i])]),
      labels,
      datasets: [
        { label: "REM", data: sleepRem, backgroundColor: "#74b84a" },
        { label: "淺眠", data: sleepLight, backgroundColor: "#a4ce77" },
        { label: "深眠", data: sleepDeep, backgroundColor: "#27a3a9" },
      ],
      chartType: "bar",
      stacked: true,
    };
  }

  return {
    headers: ["日期", "最高溫度", "最低溫度"],
    rows: labels.map((d: string, i: number) => [d, String(tempMax[i]), String(tempMin[i])]),
    labels,
    datasets: [
      { label: "最高", data: tempMax, borderColor: "#7cbc28", backgroundColor: "#7cbc28" },
      { label: "最低", data: tempMin, borderColor: "#27a3a9", backgroundColor: "#27a3a9" },
    ],
    chartType: "line",
  };
});

function renderChart() {
  const data = metricData.value;
  if (!detailCanvas.value || !data.labels.length) return;
  const ctx = detailCanvas.value.getContext("2d");
  if (!ctx) return;
  detailChart?.destroy();
  detailChart = new Chart(ctx, {
    type: data.chartType,
    data: {
      labels: data.labels,
      datasets: data.datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "bottom", labels: { boxWidth: 8, boxHeight: 8 } },
      },
      scales: {
        x: { stacked: !!data.stacked },
        y: { beginAtZero: true, stacked: !!data.stacked },
      },
      elements: {
        point: { radius: 2 },
        line: { tension: 0.3, borderWidth: 1.5 },
      },
    },
  });
}

watchEffect(() => {
  metricData.value;
  nextTick(() => {
    requestAnimationFrame(() => {
      renderChart();
    });
  });
});

onMounted(async () => {
  const { token, admin, sel } = {
    token: localStorage.getItem("backendToken") ?? sessionStorage.getItem("backendToken"),
    admin: localStorage.getItem("adminID") ?? sessionStorage.getItem("adminID"),
    sel: JSON.parse(localStorage.getItem("selectedMember") ?? "{}") as { MID?: string; Mobile?: string },
  };
  if (!member.value && token && admin && sel?.MID) {
    await memberStore.fetchAll({
      token,
      admin,
      sel,
    });
  }
  const qStart = String(route.query.start || "");
  const qEnd = String(route.query.end || "");
  const qStartDate = parseYYYYMMDDToDate(qStart);
  const qEndDate = parseYYYYMMDDToDate(qEnd);
  if (qStartDate) {
    dateRange.value = [qStartDate, qEndDate ?? qStartDate];
  }
});

onUnmounted(() => {
  detailChart?.destroy();
  detailChart = null;
});
</script>

<style scoped lang="scss">
.memberInfo {
  display: flex;
}

.memberInfoContent {
  flex: 1;
  padding: 1rem 1.25rem 1.5rem;
  background: #f5f8fa;
  min-height: 100vh;
}

.pageHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;

  h3 {
    margin: 0;
    color: #2d3047;
    font-size: 1.75rem;
    font-weight: 700;
  }
}

.headerActions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.goBackBtn {
  font-size: var(--Text-font-size-18, 18px);
  font-weight: 400;
  letter-spacing: 2.7px;
  border: none;
  background: #8f9db8;
  color: #fff;
  border-radius: 8px;
  padding: 0.5rem 0.9rem;
  cursor: pointer;
  width: 100px;
}

.detailCard {
  border-radius: 12px;
  background: #fff;
  padding: 0.9rem;
}

.chartWrap {
  width: 100%;
  height: 340px;
  border-radius: 10px;
  border: 1px solid #e9eef5;
  padding: 0.6rem;
}

.tableWrap {
  margin-top: 0.85rem;
  border-radius: 10px;
  border: 1px solid #e9eef5;
  overflow: hidden;
}

.tableHeader,
.tableRow {
  display: grid;
}

.th,
.td {
  padding: 0.8rem 0.7rem;
  font-size: 0.95rem;
  color: #2d3047;
  border-bottom: 1px solid #eef2f7;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.th {
  font-weight: 700;
  background: #f8fbff;
}

.tableEmpty {
  padding: 1rem;
  text-align: center;
  color: #6d7c96;
}

@media (max-width: 900px) {
  .pageHeader {
    flex-direction: column;
    align-items: flex-start;
  }

  .tableWrap {
    overflow-x: auto;
  }

  .tableHeader,
  .tableRow {
    min-width: 700px;
  }
}
</style>
