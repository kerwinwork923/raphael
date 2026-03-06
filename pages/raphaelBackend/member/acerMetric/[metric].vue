<template>
  <div class="memberInfo">
    <Sidebar />
    <div class="memberInfoContent">
      <div class="pageHeader">
        <h3>{{ member?.Name || "會員" }}｜宏碁指環 {{ metricTitle }}詳細頁</h3>
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

type MetricKey = "heartRate" | "spo2" | "sleep" | "temp" | "activity" | "hrv" | "stress";

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
const { member, acerHealthData, hasFetched } = storeToRefs(memberStore);
const dateRange = ref<Date[] | null>(null);
const detailCanvas = ref<HTMLCanvasElement | null>(null);
let detailChart: Chart | null = null;

const metricTitleMap: Record<MetricKey, string> = {
  heartRate: "心率",
  spo2: "血氧",
  sleep: "睡眠",
  temp: "溫度",
  activity: "活動",
  hrv: "HRV",
  stress: "壓力",
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

function parseYYYYMMDDToDateKey(raw: string) {
  const value = String(raw || "");
  if (!/^\d{8}$/.test(value)) return "";
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function parseRawDateTimeToDateKey(raw: string) {
  const value = String(raw || "");
  if (!/^\d{14}$/.test(value)) return "";
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function parseRawDateTimeToTime(raw: string) {
  const value = String(raw || "");
  if (!/^\d{14}$/.test(value)) return "";
  return `${value.slice(8, 10)}:${value.slice(10, 12)}`;
}

function toDateLabel(dateLike: string) {
  return dateLike ? dateLike.slice(5).replace("-", "/") : "";
}

function parseDateOnlyToMs(dateLike: string) {
  const d = String(dateLike || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return NaN;
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
    999,
  ).getTime();
}

function getRangeBoundary(range: Date[] | null) {
  if (!range || !range.length || !range[0]) return [null, null] as const;
  const from = range[0];
  const to = range[1] ?? range[0];
  return [toLocalDayStart(from), toLocalDayEnd(to)] as const;
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

function getAcerApiDateRange() {
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
  return true;
});

function formatMeasureTime(rawDateTime: string) {
  const date = parseRawDateTimeToDateKey(rawDateTime);
  const time = parseRawDateTimeToTime(rawDateTime);
  if (shouldShowDateWithTime.value) {
    if (date && time) return `${date} ${time}`;
    return date || "";
  }
  return time || date || "";
}

const metricData = computed<MetricData>(() => {
  const key = metricKey.value;
  const raw = acerHealthData.value || {};
  const [fromMs, toMs] = getRangeBoundary(dateRange.value);
  const inRange = (dateKey: string) => {
    if (fromMs === null || toMs === null) return true;
    const ms = parseDateOnlyToMs(dateKey);
    if (Number.isNaN(ms)) return false;
    return ms >= fromMs && ms <= toMs;
  };

  if (key === "heartRate") {
    let list = (raw.Hb || [])
      .map((x: any) => ({ ...x, _dateKey: parseYYYYMMDDToDateKey(x.Date || "") }))
      .filter((x: any) => x._dateKey && inRange(x._dateKey));
    if (fromMs === null && toMs === null) list = list.slice(-7);

    const detail = (raw.HbDetail || [])
      .filter((x: any) => {
        const d = parseRawDateTimeToDateKey(x.RawDateTime || "");
        return d && inRange(d) && Number(x.hearts || 0) > 0;
      })
      .sort((a: any, b: any) => String(a.RawDateTime || "").localeCompare(String(b.RawDateTime || "")));

    return {
      chartType: "line",
      headers: [shouldShowDateWithTime.value ? "測量日期時間" : "測量時間", "心率"],
      labels: list.map((x: any) => toDateLabel(x._dateKey)),
      rows: detail.map((x: any) => [formatMeasureTime(String(x.RawDateTime || "")), String(x.hearts || "")]),
      datasets: [
        { label: "最高", data: list.map((x: any) => Number(x.HeartrateMax || 0)), borderColor: "#9fb6df", backgroundColor: "#9fb6df" },
        { label: "最低", data: list.map((x: any) => Number(x.HeartrateMin || 0)), borderColor: "#1ba39b", backgroundColor: "#1ba39b" },
      ],
    };
  }

  if (key === "spo2") {
    let list = (raw.Spo2 || [])
      .map((x: any) => ({ ...x, _dateKey: parseYYYYMMDDToDateKey(x.Date || "") }))
      .filter((x: any) => x._dateKey && inRange(x._dateKey));
    if (fromMs === null && toMs === null) list = list.slice(-7);

    const detail = (raw.Spo2Detail || [])
      .filter((x: any) => {
        const d = parseRawDateTimeToDateKey(x.RawDateTime || "");
        return d && inRange(d) && Number(x.bloodOxygen || 0) > 0;
      })
      .sort((a: any, b: any) => String(a.RawDateTime || "").localeCompare(String(b.RawDateTime || "")));

    return {
      chartType: "line",
      headers: [shouldShowDateWithTime.value ? "測量日期時間" : "測量時間", "血氧"],
      labels: list.map((x: any) => toDateLabel(x._dateKey)),
      rows: detail.map((x: any) => [formatMeasureTime(String(x.RawDateTime || "")), String(x.bloodOxygen || "")]),
      datasets: [
        { label: "最高", data: list.map((x: any) => Number(x.Spo2Max || 0)), borderColor: "#9fb6df", backgroundColor: "#9fb6df" },
        { label: "最低", data: list.map((x: any) => Number(x.Spo2Min || 0)), borderColor: "#1ba39b", backgroundColor: "#1ba39b" },
      ],
    };
  }

  if (key === "temp") {
    let list = (raw.Tp || [])
      .map((x: any) => ({ ...x, _dateKey: parseYYYYMMDDToDateKey(x.Date || "") }))
      .filter((x: any) => x._dateKey && inRange(x._dateKey));
    if (fromMs === null && toMs === null) list = list.slice(-7);

    const detail = (raw.TpDetail || [])
      .filter((x: any) => {
        const d = parseRawDateTimeToDateKey(x.RawDateTime || "");
        return d && inRange(d) && Number(x.tempeartures || 0) > 0;
      })
      .sort((a: any, b: any) => String(a.RawDateTime || "").localeCompare(String(b.RawDateTime || "")));

    return {
      chartType: "line",
      headers: [shouldShowDateWithTime.value ? "測量日期時間" : "測量時間", "體溫"],
      labels: list.map((x: any) => toDateLabel(x._dateKey)),
      rows: detail.map((x: any) => [formatMeasureTime(String(x.RawDateTime || "")), String(x.tempeartures || "")]),
      datasets: [
        { label: "最高", data: list.map((x: any) => Number(x.TpMax || 0)), borderColor: "#9fb6df", backgroundColor: "#9fb6df" },
        { label: "最低", data: list.map((x: any) => Number(x.TpMin || 0)), borderColor: "#1ba39b", backgroundColor: "#1ba39b" },
      ],
    };
  }

  if (key === "sleep") {
    const group: Record<string, { deep: number; rem: number; light: number }> = {};
    (raw.Sleep || []).forEach((x: any) => {
      const d = parseRawDateTimeToDateKey(x.RawDateTime || "");
      if (!d || !inRange(d)) return;
      group[d] ||= { deep: 0, rem: 0, light: 0 };
      group[d].deep += Number(x.ComfortCount || 0);
      group[d].rem += Number(x.RemCount || 0);
      group[d].light += Number(x.LightCount || 0);
    });
    let dates = Object.keys(group).sort();
    if (fromMs === null && toMs === null && dates.length > 7) dates = dates.slice(-7);

    return {
      chartType: "bar",
      stacked: true,
      headers: ["測量日期", "深眠(分)", "淺眠(分)", "REM(分)"],
      labels: dates.map((d) => toDateLabel(d)),
      rows: dates.map((d) => [d, String(group[d].deep), String(group[d].light), String(group[d].rem)]),
      datasets: [
        { label: "深眠", data: dates.map((d) => group[d].deep), backgroundColor: "#3f8c25" },
        { label: "REM", data: dates.map((d) => group[d].rem), backgroundColor: "#74b84a" },
        { label: "淺眠", data: dates.map((d) => group[d].light), backgroundColor: "#a4ce77" },
      ],
    };
  }

  if (key === "activity") {
    const group: Record<string, number> = {};
    const detail = (raw.Activity || [])
      .filter((x: any) => {
        const d = parseRawDateTimeToDateKey(x.RawDateTime || "");
        return d && inRange(d);
      })
      .sort((a: any, b: any) => String(a.RawDateTime || "").localeCompare(String(b.RawDateTime || "")));

    detail.forEach((x: any) => {
      const d = parseRawDateTimeToDateKey(x.RawDateTime || "");
      if (!d) return;
      group[d] ||= 0;
      group[d] += Number(x.step || 0);
    });

    let dates = Object.keys(group).sort();
    if (fromMs === null && toMs === null && dates.length > 7) dates = dates.slice(-7);

    return {
      chartType: "bar",
      headers: [shouldShowDateWithTime.value ? "測量日期時間" : "測量時間", "步數", "卡路里", "距離", "時長(秒)"],
      labels: dates.map((d) => toDateLabel(d)),
      rows: detail.map((x: any) => [
        formatMeasureTime(String(x.RawDateTime || "")),
        String(x.step || ""),
        String(x.calorie || ""),
        String(x.distance || ""),
        String(x.duration || ""),
      ]),
      datasets: [{ label: "總步數", data: dates.map((d) => Number(group[d] || 0)), backgroundColor: "#7cbc28" }],
    };
  }

  if (key === "hrv") {
    let list = (raw.Hrv || [])
      .map((x: any) => ({ ...x, _dateKey: parseYYYYMMDDToDateKey(x.Date || "") }))
      .filter((x: any) => x._dateKey && inRange(x._dateKey));
    if (fromMs === null && toMs === null) list = list.slice(-7);

    const detail = (raw.HrvDetail || [])
      .filter((x: any) => {
        const d = parseRawDateTimeToDateKey(x.RawDateTime || "");
        return d && inRange(d) && Number(x.hrvs || 0) > 0;
      })
      .sort((a: any, b: any) => String(a.RawDateTime || "").localeCompare(String(b.RawDateTime || "")));

    return {
      chartType: "line",
      headers: [shouldShowDateWithTime.value ? "測量日期時間" : "測量時間", "HRV"],
      labels: list.map((x: any) => toDateLabel(x._dateKey)),
      rows: detail.map((x: any) => [formatMeasureTime(String(x.RawDateTime || "")), String(x.hrvs || "")]),
      datasets: [
        { label: "最高", data: list.map((x: any) => Number(x.HrvMax || 0)), borderColor: "#9fb6df", backgroundColor: "#9fb6df" },
        { label: "最低", data: list.map((x: any) => Number(x.HrvMin || 0)), borderColor: "#1ba39b", backgroundColor: "#1ba39b" },
      ],
    };
  }

  let list = (raw.Stress || [])
    .map((x: any) => ({ ...x, _dateKey: parseYYYYMMDDToDateKey(x.Date || "") }))
    .filter((x: any) => x._dateKey && inRange(x._dateKey));
  if (fromMs === null && toMs === null) list = list.slice(-7);

  const detail = (raw.StressDetail || [])
    .filter((x: any) => {
      const d = parseRawDateTimeToDateKey(x.RawDateTime || "");
      return d && inRange(d) && Number(x.stress || 0) > 0;
    })
    .sort((a: any, b: any) => String(a.RawDateTime || "").localeCompare(String(b.RawDateTime || "")));

  return {
    chartType: "line",
    headers: [shouldShowDateWithTime.value ? "測量日期時間" : "測量時間", "壓力"],
    labels: list.map((x: any) => toDateLabel(x._dateKey)),
    rows: detail.map((x: any) => [formatMeasureTime(String(x.RawDateTime || "")), String(x.stress || "")]),
    datasets: [
      { label: "最高", data: list.map((x: any) => Number(x.StressMax || 0)), borderColor: "#9fb6df", backgroundColor: "#9fb6df" },
      { label: "最低", data: list.map((x: any) => Number(x.StressMin || 0)), borderColor: "#1ba39b", backgroundColor: "#1ba39b" },
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
    dateRange.value = [qStartDate, qEndDate ?? qStartDate];
  }

  if (!acerHealthData.value) {
    await memberStore.fetchAcerHealthData(auth, getAcerApiDateRange());
  }
});

watch(dateRange, async () => {
  await memberStore.fetchAcerHealthData(getAuth(), getAcerApiDateRange());
});

onUnmounted(() => {
  destroyDetailChart();
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
