<template>
  <div class="memberInfo">
    <div v-if="isMetricLoading" class="loading-mask">
      <div class="loading-spinner"></div>
      <div>資料載入中，請稍候...</div>
    </div>
    <Sidebar />
    <div class="memberInfoContent">
      <div class="pageHeader">
        <h3>{{ member?.Name || "會員" }}｜{{ metricTitle }}詳細頁</h3>
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
import { computed, nextTick, onMounted, onUnmounted, ref, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import VueDatePicker from "@vuepic/vue-datepicker";
import Sidebar from "~/components/raphaelBackend/Sidebar.vue";
import { useMemberStore } from "~/stores/useMemberStore";
import { storeToRefs } from "pinia";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

type MetricKey =
  | "heartRate"
  | "spo2"
  | "bp"
  | "stress"
  | "sleep"
  | "temp"
  | "steps"
  | "hrv"
  | "body";

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
const { member, asusHealthData, hasFetched } = storeToRefs(memberStore);
const dateRange = ref<Date[] | null>(null);
const detailCanvas = ref<HTMLCanvasElement | null>(null);
const isMetricLoading = ref(false);
let detailChart: Chart | null = null;
let skipNextDateRangeWatch = false;

const metricTitleMap: Record<MetricKey, string> = {
  heartRate: "心率",
  spo2: "血氧",
  bp: "血壓",
  stress: "壓力",
  sleep: "睡眠",
  temp: "溫度",
  steps: "運動",
  hrv: "HRV",
  body: "身體組成",
};

const metricKey = computed<MetricKey>(() => {
  const raw = String(route.params.metric || "heartRate");
  const keys = Object.keys(metricTitleMap) as MetricKey[];
  return keys.includes(raw as MetricKey) ? (raw as MetricKey) : "heartRate";
});

const metricTitle = computed<string>(() => metricTitleMap[metricKey.value as MetricKey]);

function getAuth() {
  return {
    token:
      localStorage.getItem("backendToken") ??
      sessionStorage.getItem("backendToken"),
    admin: localStorage.getItem("adminID") ?? sessionStorage.getItem("adminID"),
    sel: JSON.parse(localStorage.getItem("selectedMember") ?? "{}") as {
      MID?: string;
      Mobile?: string;
    },
  };
}

function goBack() {
  router.push("/raphaelBackend/member/memberContent");
}

function toDateKey(dateLike: string) {
  return (dateLike || "").slice(0, 10).replace(/\//g, "-");
}

function toDateLabel(dateLike: string) {
  const d = toDateKey(dateLike);
  return d ? d.slice(5).replace("-", "/") : "";
}

function parseDateOnlyToMs(dateLike: string) {
  const d = toDateKey(dateLike);
  if (!d) return NaN;
  const [y, m, day] = d.split("-").map(Number);
  if (!y || !m || !day) return NaN;
  return new Date(y, m - 1, day).getTime();
}

function toLocalDayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function toLocalDayEnd(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  ).getTime();
}

function getRangeBoundary(range: Date[] | null) {
  if (!range || !range.length || !range[0]) return [null, null] as const;
  const from = range[0];
  const to = range[1] ?? range[0];
  return [toLocalDayStart(from), toLocalDayEnd(to)] as const;
}

function safeTimeFromDateTime(dateTime: string) {
  if (!dateTime) return "";
  return dateTime.slice(11, 16);
}

function formatTimeDisplay(dateTime: string) {
  if (!dateTime) return "";
  const d = new Date(dateTime.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return safeTimeFromDateTime(dateTime);
  return d.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function parseYYYYMMDDToDate(raw: string) {
  if (!/^\d{8}$/.test(raw)) return null;
  const y = Number(raw.slice(0, 4));
  const m = Number(raw.slice(4, 6));
  const d = Number(raw.slice(6, 8));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDateYYYYMMDD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function getRecent7StartDate() {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return formatDateYYYYMMDD(d);
}

function getAsusApiDateRange() {
  if (dateRange.value && dateRange.value.length >= 1 && dateRange.value[0]) {
    const from = dateRange.value[0];
    const to = dateRange.value[1] ?? dateRange.value[0];
    return {
      StartDate: formatDateYYYYMMDD(from),
      EndDate: formatDateYYYYMMDD(to),
    };
  }
  return {
    StartDate: getRecent7StartDate(),
    EndDate: formatDateYYYYMMDD(new Date()),
  };
}

const shouldShowDateWithTime = computed(() => {
  if (dateRange.value && dateRange.value.length >= 1 && dateRange.value[0]) {
    const from = toLocalDayStart(dateRange.value[0]);
    const to = toLocalDayStart(dateRange.value[1] ?? dateRange.value[0]);
    return to > from;
  }
  // 預設是最近 7 天，直接顯示日期+時間避免混淆
  return true;
});

function formatMeasureTime(dateTime: string) {
  const date = toDateKey(dateTime);
  const time = safeTimeFromDateTime(dateTime);
  if (shouldShowDateWithTime.value) {
    if (date && time) return `${date} ${time}`;
    if (date) return date;
  }
  return formatTimeDisplay(dateTime);
}

const metricData = computed<MetricData>(() => {
  const key = metricKey.value;
  const raw = asusHealthData.value || {};
  const [fromMs, toMs] = getRangeBoundary(dateRange.value);
  const inRange = (dateKey: string) => {
    if (fromMs === null || toMs === null) return true;
    const ms = parseDateOnlyToMs(dateKey);
    if (Number.isNaN(ms)) return false;
    return ms >= fromMs && ms <= toMs;
  };

  if (key === "heartRate") {
    let list = (raw.Hb || []).filter((x: any) => x.Date && inRange(x.Date));
    if (fromMs === null && toMs === null) list = list.slice(-7);
    const heartRateDetailList = (raw.HbDetail || [])
      .filter((x: any) => {
        const d = toDateKey(x.time || "");
        return d && inRange(d) && Number(x.heartrate || 0) > 0;
      })
      .sort((a: any, b: any) => (a.time || "").localeCompare(b.time || ""));
    return {
      chartType: "line",
      headers: [shouldShowDateWithTime.value ? "測量日期時間" : "測量時間", "數據"],
      labels: list.map((x: any) => toDateLabel(x.Date)),
      rows: heartRateDetailList.map((x: any) => [
        formatMeasureTime(String(x.time || "")),
        String(x.heartrate || ""),
      ]),
      datasets: [
        { label: "最高", data: list.map((x: any) => Number(x.HeartrateMax || 0)), borderColor: "#9fb6df", backgroundColor: "#9fb6df" },
        { label: "最低", data: list.map((x: any) => Number(x.HeartrateMin || 0)), borderColor: "#1ba39b", backgroundColor: "#1ba39b" },
      ],
    };
  }

  if (key === "spo2") {
    let list = (raw.Spo2 || []).filter((x: any) => x.Date && inRange(x.Date));
    if (fromMs === null && toMs === null) list = list.slice(-7);
    const spo2DetailList = (raw.Spo2Detail || [])
      .filter((x: any) => {
        const d = toDateKey(x.time || "");
        return d && inRange(d) && Number(x.spo2 || 0) > 0;
      })
      .sort((a: any, b: any) => (a.time || "").localeCompare(b.time || ""));
    return {
      chartType: "line",
      headers: [shouldShowDateWithTime.value ? "測量日期時間" : "測量時間", "數據"],
      labels: list.map((x: any) => toDateLabel(x.Date)),
      rows: spo2DetailList.map((x: any) => [
        formatMeasureTime(String(x.time || "")),
        String(x.spo2 || ""),
      ]),
      datasets: [
        { label: "最高", data: list.map((x: any) => Number(x.Spo2Max || 0)), borderColor: "#9fb6df", backgroundColor: "#9fb6df" },
        { label: "最低", data: list.map((x: any) => Number(x.Spo2Min || 0)), borderColor: "#1ba39b", backgroundColor: "#1ba39b" },
      ],
    };
  }

  if (key === "temp") {
    let list = (raw.Tp || []).filter((x: any) => x.Date && inRange(x.Date));
    if (fromMs === null && toMs === null) list = list.slice(-7);
    const tpDetailList = (raw.TpDetail || [])
      .filter((x: any) => {
        const d = toDateKey(x.time || "");
        return d && inRange(d) && Number(x.temerature || 0) > 0;
      })
      .sort((a: any, b: any) => (a.time || "").localeCompare(b.time || ""));
    return {
      chartType: "line",
      headers: [shouldShowDateWithTime.value ? "測量日期時間" : "測量時間", "體溫"],
      labels: list.map((x: any) => toDateLabel(x.Date)),
      rows: tpDetailList.map((x: any) => [
        formatMeasureTime(String(x.time || "")),
        String(x.temerature || ""),
      ]),
      datasets: [
        { label: "最高", data: list.map((x: any) => Number(x.TpMax || 0)), borderColor: "#9fb6df", backgroundColor: "#9fb6df" },
        { label: "最低", data: list.map((x: any) => Number(x.TpMin || 0)), borderColor: "#1ba39b", backgroundColor: "#1ba39b" },
      ],
    };
  }

  if (key === "steps") {
    let list = (raw.Step || []).filter((x: any) => x.Date && inRange(x.Date));
    if (fromMs === null && toMs === null) list = list.slice(-7);
    return {
      chartType: "bar",
      headers: ["測量日期", "步數"],
      labels: list.map((x: any) => toDateLabel(x.Date)),
      rows: list.map((x: any) => [String(x.Date || ""), String(x.stepsSUM || "")]),
      datasets: [{ label: "總步數", data: list.map((x: any) => Number(x.stepsSUM || 0)), backgroundColor: "#7cbc28" }],
    };
  }

  if (key === "bp" || key === "stress" || key === "hrv") {
    const bpGroup: Record<string, any[]> = {};
    (raw.Bp || []).forEach((x: any) => {
      const d = toDateKey(x.time || "");
      if (!d || !inRange(d)) return;
      bpGroup[d] ||= [];
      bpGroup[d].push(x);
    });
    let dates = Object.keys(bpGroup).sort();
    if (fromMs === null && toMs === null && dates.length > 7) dates = dates.slice(-7);

    if (key === "bp") {
      return {
        chartType: "line",
        headers: ["測量日期", "收縮壓", "舒張壓", "測量時間", "結束時間"],
        labels: dates.map((d) => toDateLabel(d)),
        rows: dates.map((d) => {
          const arr = bpGroup[d] || [];
          const avgSys = arr.length
            ? Math.round(arr.reduce((s: number, x: any) => s + Number(x.sys || 0), 0) / arr.length)
            : 0;
          const avgDia = arr.length
            ? Math.round(arr.reduce((s: number, x: any) => s + Number(x.dia || 0), 0) / arr.length)
            : 0;
          const start = safeTimeFromDateTime(arr[0]?.time || "");
          const end = safeTimeFromDateTime(arr[arr.length - 1]?.time || "");
          return [d, String(avgSys), String(avgDia), start, end];
        }),
        datasets: [
          {
            label: "收縮壓",
            data: dates.map((d) => {
              const arr = bpGroup[d] || [];
              if (!arr.length) return 0;
              return Math.round(arr.reduce((s: number, x: any) => s + Number(x.sys || 0), 0) / arr.length);
            }),
            borderColor: "#9fb6df",
            backgroundColor: "#9fb6df",
          },
          {
            label: "舒張壓",
            data: dates.map((d) => {
              const arr = bpGroup[d] || [];
              if (!arr.length) return 0;
              return Math.round(arr.reduce((s: number, x: any) => s + Number(x.dia || 0), 0) / arr.length);
            }),
            borderColor: "#1ba39b",
            backgroundColor: "#1ba39b",
          },
        ],
      };
    }

    if (key === "stress") {
      return {
        chartType: "line",
        headers: ["測量日期", "舒壓指數"],
        labels: dates.map((d) => toDateLabel(d)),
        rows: dates.map((d) => {
          const arr = bpGroup[d] || [];
          const avg = arr.length
            ? Math.round(arr.reduce((s: number, x: any) => s + Number(x.deStressIndex || 0), 0) / arr.length)
            : 0;
          return [d, String(avg)];
        }),
        datasets: [
          {
            label: "舒壓指數",
            data: dates.map((d) => {
              const arr = bpGroup[d] || [];
              if (!arr.length) return 0;
              return Math.round(arr.reduce((s: number, x: any) => s + Number(x.deStressIndex || 0), 0) / arr.length);
            }),
            borderColor: "#1ba39b",
            backgroundColor: "#1ba39b",
          },
        ],
      };
    }

    return {
      chartType: "line",
      headers: ["測量日期", "RMSSD"],
      labels: dates.map((d) => toDateLabel(d)),
      rows: dates.map((d) => {
        const arr = bpGroup[d] || [];
        const avg = arr.length
          ? Math.round(arr.reduce((s: number, x: any) => s + Number(x.rmssd || 0), 0) / arr.length)
          : 0;
        return [d, String(avg)];
      }),
      datasets: [
        {
          label: "RMSSD",
          data: dates.map((d) => {
            const arr = bpGroup[d] || [];
            if (!arr.length) return 0;
            return Math.round(arr.reduce((s: number, x: any) => s + Number(x.rmssd || 0), 0) / arr.length);
          }),
          borderColor: "#7cbc28",
          backgroundColor: "#7cbc28",
        },
      ],
    };
  }

  if (key === "sleep") {
    const sleepScoreMap: Record<string, number> = {};
    const sleepGroup: Record<string, { deep: number; rem: number; light: number; awake: number; start: string; end: string }> = {};
    (raw.Sleep || []).forEach((x: any) => {
      const d = toDateKey(x.StartTime || "");
      if (!d || !inRange(d)) return;
      sleepGroup[d] ||= { deep: 0, rem: 0, light: 0, awake: 0, start: "", end: "" };
      sleepGroup[d].deep += Number(x.ComfortCount || 0);
      sleepGroup[d].rem += Number(x.RemCount || 0);
      sleepGroup[d].light += Number(x.LightCount || 0);
      sleepGroup[d].awake += Number(x.AwakeCount || 0);
      sleepScoreMap[d] = Math.max(
        Number(sleepScoreMap[d] || 0),
        Number(x.SleepScore || 0)
      );
      const start = safeTimeFromDateTime(x.StartTime || "");
      const end = safeTimeFromDateTime(x.EndTime || "");
      if (!sleepGroup[d].start || start < sleepGroup[d].start) sleepGroup[d].start = start;
      if (!sleepGroup[d].end || end > sleepGroup[d].end) sleepGroup[d].end = end;
    });
    let dates = Object.keys(sleepGroup).sort();
    if (fromMs === null && toMs === null && dates.length > 7) dates = dates.slice(-7);
    return {
      chartType: "bar",
      stacked: true,
      headers: ["測量日期", "紓壓指數"],
      labels: dates.map((d) => toDateLabel(d)),
      rows: dates.map((d) => [d, String(sleepScoreMap[d] || 0)]),
      datasets: [
        { label: "深眠", data: dates.map((d) => sleepGroup[d].deep), backgroundColor: "#3f8c25" },
        { label: "REM", data: dates.map((d) => sleepGroup[d].rem), backgroundColor: "#74b84a" },
        { label: "淺眠", data: dates.map((d) => sleepGroup[d].light), backgroundColor: "#a4ce77" },
        { label: "清醒", data: dates.map((d) => sleepGroup[d].awake), backgroundColor: "#d3e8b8" },
      ],
    };
  }

  const biaGroup: Record<string, any[]> = {};
  (raw.Bia || []).forEach((x: any) => {
    const d = toDateKey(x.time || "");
    if (!d || !inRange(d)) return;
    biaGroup[d] ||= [];
    biaGroup[d].push(x);
  });
  let dates = Object.keys(biaGroup).sort();
  if (fromMs === null && toMs === null && dates.length > 7) dates = dates.slice(-7);
  return {
    chartType: "line",
    headers: ["測量日期", "水分", "體脂肪", "肌肉量", "測量時間"],
    labels: dates.map((d) => toDateLabel(d)),
    rows: dates.map((d) => {
      const arr = biaGroup[d] || [];
      const latest = arr[arr.length - 1] || {};
      return [
        d,
        ((Number(latest.water || 0) / 10) || 0).toFixed(1),
        ((Number(latest.fat || 0) / 10) || 0).toFixed(1),
        ((Number(latest.skm || 0) / 10) || 0).toFixed(1),
        safeTimeFromDateTime(latest.time || ""),
      ];
    }),
    datasets: [
      {
        label: "水分",
        data: dates.map((d) => {
          const arr = biaGroup[d] || [];
          const latest = arr[arr.length - 1] || {};
          return Number(latest.water || 0) / 10;
        }),
        borderColor: "#27a3a9",
        backgroundColor: "#27a3a9",
      },
      {
        label: "體脂肪",
        data: dates.map((d) => {
          const arr = biaGroup[d] || [];
          const latest = arr[arr.length - 1] || {};
          return Number(latest.fat || 0) / 10;
        }),
        borderColor: "#7cbc28",
        backgroundColor: "#7cbc28",
      },
      {
        label: "肌肉量",
        data: dates.map((d) => {
          const arr = biaGroup[d] || [];
          const latest = arr[arr.length - 1] || {};
          return Number(latest.skm || 0) / 10;
        }),
        borderColor: "#2f6fa3",
        backgroundColor: "#2f6fa3",
      },
    ],
  };
});

function destroyDetailChart() {
  detailChart?.destroy();
  detailChart = null;
}

function renderDetailChart() {
  const canvas = detailCanvas.value;
  if (!canvas || !metricData.value.labels.length) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  destroyDetailChart();
  detailChart = new Chart(ctx, {
    type: metricData.value.chartType,
    data: {
      labels: metricData.value.labels,
      datasets: metricData.value.datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "bottom", labels: { boxWidth: 8, boxHeight: 8 } },
      },
      scales: {
        x: { stacked: !!metricData.value.stacked, ticks: { font: { size: 10 } } },
        y: { stacked: !!metricData.value.stacked, beginAtZero: true, ticks: { font: { size: 10 } } },
      },
      elements: {
        point: { radius: 2 },
        line: { tension: 0.3, borderWidth: 1.5 },
      },
    },
  });
}

async function fetchMetricData() {
  isMetricLoading.value = true;
  try {
    await memberStore.fetchAsusHealthData(getAuth(), getAsusApiDateRange());
  } finally {
    isMetricLoading.value = false;
  }
}

watchEffect(() => {
  if (!metricData.value.labels.length) {
    destroyDetailChart();
    return;
  }
  nextTick(() => {
    requestAnimationFrame(() => {
      renderDetailChart();
    });
  });
});

onMounted(async () => {
  const auth = getAuth();
  if (!auth.token || !auth.admin || !auth.sel?.MID) {
    router.push("/raphaelBackend/member");
    return;
  }
  if (!hasFetched.value) {
    await memberStore.fetchAll(auth);
  }

  const qStart = String(route.query.start || "");
  const qEnd = String(route.query.end || "");
  const qStartDate = parseYYYYMMDDToDate(qStart);
  const qEndDate = parseYYYYMMDDToDate(qEnd);
  if (qStartDate) {
    skipNextDateRangeWatch = true;
    dateRange.value = [qStartDate, qEndDate ?? qStartDate];
  }
  await fetchMetricData();
});

watch(dateRange, async () => {
  if (skipNextDateRangeWatch) {
    skipNextDateRangeWatch = false;
    return;
  }
  await fetchMetricData();
});

onUnmounted(() => {
  destroyDetailChart();
});
</script>

<style scoped lang="scss">
.memberInfo {
  display: flex;
}

.loading-mask {
  position: fixed;
  z-index: 9999;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  border: 6px solid #eee;
  border-top: 6px solid #1ba39b;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
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
