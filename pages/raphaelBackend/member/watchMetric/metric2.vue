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
          <div class="dateRangeWrap">
            <DateRange
              v-model="dateRange"
              theme="teal"
              mode="light"
              locale="zh-tw"
              date-format="YYYY-MM-DD"
              :min-date="minPickerDateObj"
              :max-date="maxPickerDateObj"
            />
            <span v-if="latestDataDateLabel" class="latestDataHint">最近一筆：{{ latestDataDateLabel }}</span>
          </div>
          <button class="goBackBtn" @click="goBack">返回</button>
        </div>
      </div>

      <div class="detailCard">
        <div class="chartWrap">
          <div ref="detailChartRef" class="detailChart"></div>
        </div>

        <div class="tableWrap" ref="tableWrapRef">
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
              :class="{ isHighlighted: highlightedRowIndex === idx }"
              :data-row-index="idx"
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
import * as echarts from "echarts";
import { DateRange } from "@tiaohsun/vue-datepicker";
import "@tiaohsun/vue-datepicker/style";
import Sidebar from "~/components/raphaelBackend/Sidebar.vue";
import { useMemberStore } from "~/stores/useMemberStore";
import { storeToRefs } from "pinia";

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

type DateRangeValue = {
  start: string;
  end: string;
};

const route = useRoute();
const router = useRouter();
const memberStore = useMemberStore();
const { member, asusHealthData, hasFetched } = storeToRefs(memberStore);
const detailChartRef = ref<HTMLElement | null>(null);
const tableWrapRef = ref<HTMLElement | null>(null);
const dateRange = ref<DateRangeValue>(getDefaultDateRange());
const highlightedRowIndex = ref<number | null>(null);
const isMetricLoading = ref(false);
let detailChart: echarts.ECharts | null = null;
let skipNextDateRangeWatch = false;

const minPickerDate = "2025-01-01";
const minPickerDateObj = computed(() => parseISODateToDate(minPickerDate) || METRIC_MIN_DATE);
const maxPickerDateObj = computed(() => new Date());

const METRIC_MIN_DATE = new Date(2025, 0, 1);
const METRIC_MIN_MS = METRIC_MIN_DATE.getTime();

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
  const raw = String(dateLike || "").trim();
  if (!raw) return "";
  if (/^\d{8}$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  if (/^\d{4}[/-]\d{2}[/-]\d{2}/.test(raw)) {
    return raw.slice(0, 10).replace(/\//g, "-");
  }
  return raw.slice(0, 10).replace(/\//g, "-");
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

function formatDateYYYYMMDD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function parseYYYYMMDDToDate(raw: string) {
  if (!/^\d{8}$/.test(raw)) return null;
  const y = Number(raw.slice(0, 4));
  const m = Number(raw.slice(4, 6));
  const d = Number(raw.slice(6, 8));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDateForPicker(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function parseISODateToDate(raw: string | Date | null | undefined) {
  if (!raw) return null;
  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? null : raw;
  }

  const normalized = String(raw).trim().replace(/\//g, "-");
  const dateOnly = normalized.includes("T") ? normalized.split("T")[0] : normalized.slice(0, 10);
  const [y, m, d] = dateOnly.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function measureTimeHeader() {
  return shouldShowDateWithTime.value ? "測量日期時間" : "測量時間";
}

function getDefaultDateRange(): DateRangeValue {
  const end = new Date();
  const start = addDays(end, -6);
  return {
    start: formatDateForPicker(start),
    end: formatDateForPicker(end),
  };
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

function getSelectedRangeMs() {
  if (!dateRange.value.start) return [null, null] as const;
  const startDate = parseISODateToDate(dateRange.value.start);
  const endDate = parseISODateToDate(dateRange.value.end || dateRange.value.start);
  if (!startDate || !endDate) return [null, null] as const;
  return [toLocalDayStart(startDate), toLocalDayEnd(endDate)] as const;
}

const maxPickerDate = computed(() => formatDateForPicker(new Date()));

function normalizeDateRangeValue(value: DateRangeValue | null | undefined): DateRangeValue {
  if (!value?.start) {
    return getDefaultDateRange();
  }

  const startDate = parseISODateToDate(value.start);
  const endDate = parseISODateToDate(value.end || value.start);
  if (!startDate || !endDate) {
    return getDefaultDateRange();
  }

  return {
    start: formatDateForPicker(startDate),
    end: formatDateForPicker(endDate),
  };
}

const currentDateRangeLabel = computed(() => {
  const { start, end } = dateRange.value;
  if (!start) return "最近 7 天";
  const fmt = (s: string) => s.replace(/-/g, "/");
  return end && end !== start ? `${fmt(start)} ~ ${fmt(end)}` : fmt(start);
});

function isFrom2025(dateKey: string) {
  const ms = parseDateOnlyToMs(dateKey);
  return !Number.isNaN(ms) && ms >= METRIC_MIN_MS;
}

function isInSelectedDateRange(dateKey: string) {
  const ms = parseDateOnlyToMs(dateKey);
  if (Number.isNaN(ms)) return false;
  const [startMs, endMs] = getSelectedRangeMs();
  if (startMs === null || endMs === null) return true;
  return ms >= startMs && ms <= endMs;
}

function collectDateKeysForMetric(key: MetricKey, raw: Record<string, any>) {
  const keys = new Set<string>();

  const add = (dateLike: string) => {
    const d = toDateKey(dateLike);
    if (d && isFrom2025(d)) keys.add(d);
  };

  if (key === "heartRate") {
    (raw.Hb || []).forEach((x: any) => add(x.Date || ""));
    (raw.HbDetail || []).forEach((x: any) => add(x.time || ""));
  } else if (key === "spo2") {
    (raw.Spo2 || []).forEach((x: any) => add(x.Date || ""));
    (raw.Spo2Detail || []).forEach((x: any) => add(x.spo2 > 0 ? x.time || "" : ""));
  } else if (key === "temp") {
    (raw.Tp || []).forEach((x: any) => add(x.Date || ""));
    (raw.TpDetail || []).forEach((x: any) => add(x.temerature > 0 ? x.time || "" : ""));
  } else if (key === "steps") {
    (raw.Step || []).forEach((x: any) => add(x.Date || ""));
    (raw.StepDetail || []).forEach((x: any) => add(x.time || ""));
  } else if (key === "sleep") {
    (raw.Sleep || []).forEach((x: any) => add(x.StartTime || ""));
  } else if (key === "body") {
    (raw.Bia || []).forEach((x: any) => add(x.time || ""));
  } else {
    (raw.Bp || []).forEach((x: any) => add(x.time || ""));
  }

  return Array.from(keys).sort();
}

const latestDataDateLabel = computed(() => {
  const dateKeys = collectDateKeysForMetric(metricKey.value, asusHealthData.value || {});
  const latest = dateKeys[dateKeys.length - 1];
  return latest || "";
});

function getRecent7StartDate() {
  return formatDateYYYYMMDD(addDays(new Date(), -6));
}

function getAsusApiDateRange() {
  if (dateRange.value.start) {
    const from = parseISODateToDate(dateRange.value.start);
    const to = parseISODateToDate(dateRange.value.end || dateRange.value.start);
    if (from && to) {
      const safeFrom = addDays(from, -1);
      return {
        StartDate: formatDateYYYYMMDD(safeFrom < METRIC_MIN_DATE ? METRIC_MIN_DATE : safeFrom),
        EndDate: formatDateYYYYMMDD(to),
      };
    }
  }

  return {
    StartDate: getRecent7StartDate(),
    EndDate: formatDateYYYYMMDD(new Date()),
  };
}

function formatChartCategoryLabel(dateTime: string) {
  const d = toDateKey(dateTime);
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const time = safeTimeFromDateTime(dateTime);
  return time
    ? `${y}/${Number(m)}/${Number(day)} ${time}`
    : `${y}/${Number(m)}/${Number(day)}`;
}

function buildChartPoints(
  list: any[],
  timeField: string,
  valueField: string,
  options?: { minValue?: number; transform?: (value: number) => number }
) {
  const minValue = options?.minValue ?? 0;
  const transform = options?.transform ?? ((value: number) => value);

  return list
    .filter((item) => {
      const raw = Number(item[valueField] ?? 0);
      return !Number.isNaN(raw) && raw > minValue;
    })
    .sort((a, b) => String(a[timeField] || "").localeCompare(String(b[timeField] || "")))
    .map((item) => ({
      label: formatChartCategoryLabel(String(item[timeField] || "")),
      value: transform(Number(item[valueField] || 0)),
    }));
}

const shouldShowDateWithTime = computed(() => {
  if (dateRange.value.start) {
    const startDate = parseISODateToDate(dateRange.value.start);
    const endDate = parseISODateToDate(dateRange.value.end || dateRange.value.start);
    if (!startDate || !endDate) return true;
    return toLocalDayStart(endDate) > toLocalDayStart(startDate);
  }
  return true;
});

const isSingleDaySelected = computed(() => {
  if (!dateRange.value.start) return false;
  const startDate = parseISODateToDate(dateRange.value.start);
  const endDate = parseISODateToDate(dateRange.value.end || dateRange.value.start);
  if (!startDate || !endDate) return false;
  return toLocalDayStart(startDate) === toLocalDayStart(endDate);
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

function get4HourBucketLabel(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function build4HourBuckets() {
  return [0, 4, 8, 12, 16, 20];
}

function getBucketHourFromDateTime(dateTime: string) {
  if (!dateTime || dateTime.length < 13) return null;
  const hour = Number(dateTime.slice(11, 13));
  if (Number.isNaN(hour)) return null;
  return Math.floor(hour / 4) * 4;
}

function aggregateSingleValueBy4Hour(list: any[], dateField: string, valueField: string) {
  const bucketHours = build4HourBuckets();
  const bucketMap = new Map<number, number[]>();

  bucketHours.forEach((h) => bucketMap.set(h, []));

  list.forEach((item) => {
    const hour = getBucketHourFromDateTime(String(item[dateField] || ""));
    const value = Number(item[valueField] || 0);
    if (hour === null || value <= 0) return;
    bucketMap.get(hour)?.push(value);
  });

  return {
    labels: bucketHours.map((h) => get4HourBucketLabel(h)),
    avgData: bucketHours.map((h) => {
      const arr = bucketMap.get(h) || [];
      if (!arr.length) return null;
      return Math.round(arr.reduce((sum, n) => sum + n, 0) / arr.length);
    }),
    maxData: bucketHours.map((h) => {
      const arr = bucketMap.get(h) || [];
      return arr.length ? Math.max(...arr) : null;
    }),
    minData: bucketHours.map((h) => {
      const arr = bucketMap.get(h) || [];
      return arr.length ? Math.min(...arr) : null;
    }),
  };
}

function aggregateStepsBy4Hour(list: any[], dateField: string, valueField: string) {
  const bucketHours = build4HourBuckets();
  const bucketMap = new Map<number, number>();

  bucketHours.forEach((h) => bucketMap.set(h, 0));

  list.forEach((item) => {
    const hour = getBucketHourFromDateTime(String(item[dateField] || ""));
    if (hour === null) return;
    bucketMap.set(hour, Number(bucketMap.get(hour) || 0) + Number(item[valueField] || 0));
  });

  return {
    labels: bucketHours.map((h) => get4HourBucketLabel(h)),
    data: bucketHours.map((h) => Number(bucketMap.get(h) || 0)),
  };
}

const metricData = computed<MetricData>(() => {
  const key = metricKey.value;
  const raw = asusHealthData.value || {};

  const inRange = (dateKey: string) => isFrom2025(dateKey) && isInSelectedDateRange(dateKey);

  if (key === "heartRate") {
    let list = (raw.Hb || []).filter((x: any) => x.Date && inRange(x.Date));
    const heartRateDetailList = (raw.HbDetail || [])
      .filter((x: any) => {
        const d = toDateKey(x.time || "");
        return d && inRange(d) && Number(x.heartrate || 0) > 0;
      })
      .sort((a: any, b: any) => String(a.time || "").localeCompare(String(b.time || "")));

    if (isSingleDaySelected.value) {
      const bucketed = aggregateSingleValueBy4Hour(heartRateDetailList, "time", "heartrate");
      return {
        chartType: "line",
        headers: ["測量時間", "心率"],
        labels: bucketed.labels,
        rows: heartRateDetailList.map((x: any) => [
          safeTimeFromDateTime(String(x.time || "")),
          String(x.heartrate || ""),
        ]),
        datasets: [
          {
            label: "心率",
            data: bucketed.avgData,
            borderColor: "#1ba39b",
            backgroundColor: "#1ba39b",
          },
        ],
      };
    }

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
    const spo2DetailList = (raw.Spo2Detail || [])
      .filter((x: any) => {
        const d = toDateKey(x.time || "");
        return d && inRange(d) && Number(x.spo2 || 0) > 0;
      })
      .sort((a: any, b: any) => String(a.time || "").localeCompare(String(b.time || "")));

    if (isSingleDaySelected.value) {
      const bucketed = aggregateSingleValueBy4Hour(spo2DetailList, "time", "spo2");
      return {
        chartType: "line",
        headers: ["測量時間", "血氧"],
        labels: bucketed.labels,
        rows: spo2DetailList.map((x: any) => [
          safeTimeFromDateTime(String(x.time || "")),
          String(x.spo2 || ""),
        ]),
        datasets: [
          {
            label: "血氧",
            data: bucketed.avgData,
            borderColor: "#1ba39b",
            backgroundColor: "#1ba39b",
          },
        ],
      };
    }

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
    const tpDetailList = (raw.TpDetail || [])
      .filter((x: any) => {
        const d = toDateKey(x.time || "");
        return d && inRange(d) && Number(x.temerature || 0) > 0;
      })
      .sort((a: any, b: any) => String(a.time || "").localeCompare(String(b.time || "")));

    if (isSingleDaySelected.value) {
      const bucketed = aggregateSingleValueBy4Hour(tpDetailList, "time", "temerature");
      return {
        chartType: "line",
        headers: ["測量時間", "體溫"],
        labels: bucketed.labels,
        rows: tpDetailList.map((x: any) => [
          safeTimeFromDateTime(String(x.time || "")),
          String(x.temerature || ""),
        ]),
        datasets: [
          {
            label: "體溫",
            data: bucketed.avgData,
            borderColor: "#1ba39b",
            backgroundColor: "#1ba39b",
          },
        ],
      };
    }

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
    const stepDetailList = (raw.StepDetail || [])
      .filter((x: any) => {
        const d = toDateKey(x.time || "");
        return d && inRange(d);
      })
      .sort((a: any, b: any) => String(a.time || "").localeCompare(String(b.time || "")));

    if (isSingleDaySelected.value && stepDetailList.length) {
      const bucketed = aggregateStepsBy4Hour(stepDetailList, "time", "steps");
      return {
        chartType: "bar",
        headers: ["測量時間", "步數"],
        labels: bucketed.labels,
        rows: stepDetailList.map((x: any) => [
          safeTimeFromDateTime(String(x.time || "")),
          String(x.steps || ""),
        ]),
        datasets: [
          {
            label: "步數",
            data: bucketed.data,
            backgroundColor: "#7cbc28",
          },
        ],
      };
    }

    if (stepDetailList.length) {
      return {
        chartType: "bar",
        headers: [measureTimeHeader(), "步數"],
        labels: list.map((x: any) => toDateLabel(x.Date)),
        rows: stepDetailList.map((x: any) => [
          formatMeasureTime(String(x.time || "")),
          String(x.steps || ""),
        ]),
        datasets: [{ label: "總步數", data: list.map((x: any) => Number(x.stepsSUM || 0)), backgroundColor: "#7cbc28" }],
      };
    }

    return {
      chartType: "bar",
      headers: ["測量日期", "步數"],
      labels: list.map((x: any) => toDateLabel(x.Date)),
      rows: list.map((x: any) => [String(x.Date || ""), String(x.stepsSUM || "")]),
      datasets: [{ label: "總步數", data: list.map((x: any) => Number(x.stepsSUM || 0)), backgroundColor: "#7cbc28" }],
    };
  }

  if (key === "bp") {
    const bpDetailList = (raw.Bp || [])
      .filter((x: any) => {
        const d = toDateKey(x.time || "");
        return d && inRange(d);
      })
      .sort((a: any, b: any) => String(a.time || "").localeCompare(String(b.time || "")));

    if (isSingleDaySelected.value && bpDetailList.length) {
      const sysBucket = aggregateSingleValueBy4Hour(bpDetailList, "time", "sys");
      const diaBucket = aggregateSingleValueBy4Hour(bpDetailList, "time", "dia");

      return {
        chartType: "line",
        headers: ["測量時間", "收縮壓", "舒張壓"],
        labels: sysBucket.labels,
        rows: bpDetailList.map((x: any) => [
          safeTimeFromDateTime(String(x.time || "")),
          String(x.sys || ""),
          String(x.dia || ""),
        ]),
        datasets: [
          {
            label: "收縮壓",
            data: sysBucket.avgData,
            borderColor: "#9fb6df",
            backgroundColor: "#9fb6df",
          },
          {
            label: "舒張壓",
            data: diaBucket.avgData,
            borderColor: "#1ba39b",
            backgroundColor: "#1ba39b",
          },
        ],
      };
    }

    return {
      chartType: "line",
      headers: [measureTimeHeader(), "收縮壓", "舒張壓"],
      labels: bpDetailList.map((x: any) => formatChartCategoryLabel(String(x.time || ""))),
      rows: bpDetailList.map((x: any) => [
        formatMeasureTime(String(x.time || "")),
        String(x.sys || ""),
        String(x.dia || ""),
      ]),
      datasets: [
        {
          label: "收縮壓",
          data: bpDetailList.map((x: any) => Number(x.sys || 0)),
          borderColor: "#9fb6df",
          backgroundColor: "#9fb6df",
        },
        {
          label: "舒張壓",
          data: bpDetailList.map((x: any) => Number(x.dia || 0)),
          borderColor: "#1ba39b",
          backgroundColor: "#1ba39b",
        },
      ],
    };
  }

  if (key === "stress") {
    const stressDetailList = (raw.Bp || [])
      .filter((x: any) => {
        const d = toDateKey(x.time || "");
        return d && inRange(d) && Number(x.deStressIndex || 0) > 0;
      })
      .sort((a: any, b: any) => String(a.time || "").localeCompare(String(b.time || "")));

    if (isSingleDaySelected.value && stressDetailList.length) {
      const bucketed = aggregateSingleValueBy4Hour(stressDetailList, "time", "deStressIndex");
      return {
        chartType: "line",
        headers: ["測量時間", "舒壓指數"],
        labels: bucketed.labels,
        rows: stressDetailList.map((x: any) => [
          safeTimeFromDateTime(String(x.time || "")),
          String(x.deStressIndex || ""),
        ]),
        datasets: [
          {
            label: "舒壓指數",
            data: bucketed.avgData,
            borderColor: "#1ba39b",
            backgroundColor: "#1ba39b",
          },
        ],
      };
    }

    return {
      chartType: "line",
      headers: [measureTimeHeader(), "舒壓指數"],
      labels: stressDetailList.map((x: any) => formatChartCategoryLabel(String(x.time || ""))),
      rows: stressDetailList.map((x: any) => [
        formatMeasureTime(String(x.time || "")),
        String(x.deStressIndex || ""),
      ]),
      datasets: [
        {
          label: "舒壓指數",
          data: stressDetailList.map((x: any) => Number(x.deStressIndex || 0)),
          borderColor: "#1ba39b",
          backgroundColor: "#1ba39b",
        },
      ],
    };
  }

  if (key === "hrv") {
    const hrvDetailList = (raw.Bp || [])
      .filter((x: any) => {
        const d = toDateKey(x.time || "");
        return d && inRange(d) && Number(x.rmssd || 0) > 0;
      })
      .sort((a: any, b: any) => String(a.time || "").localeCompare(String(b.time || "")));

    if (isSingleDaySelected.value && hrvDetailList.length) {
      const bucketed = aggregateSingleValueBy4Hour(hrvDetailList, "time", "rmssd");
      return {
        chartType: "line",
        headers: ["測量時間", "RMSSD"],
        labels: bucketed.labels,
        rows: hrvDetailList.map((x: any) => [
          safeTimeFromDateTime(String(x.time || "")),
          String(x.rmssd || ""),
        ]),
        datasets: [
          {
            label: "RMSSD",
            data: bucketed.avgData,
            borderColor: "#7cbc28",
            backgroundColor: "#7cbc28",
          },
        ],
      };
    }

    return {
      chartType: "line",
      headers: [measureTimeHeader(), "RMSSD"],
      labels: hrvDetailList.map((x: any) => formatChartCategoryLabel(String(x.time || ""))),
      rows: hrvDetailList.map((x: any) => [
        formatMeasureTime(String(x.time || "")),
        String(x.rmssd || ""),
      ]),
      datasets: [
        {
          label: "RMSSD",
          data: hrvDetailList.map((x: any) => Number(x.rmssd || 0)),
          borderColor: "#7cbc28",
          backgroundColor: "#7cbc28",
        },
      ],
    };
  }

  if (key === "sleep") {
    const sleepList = (raw.Sleep || [])
      .filter((x: any) => {
        const d = toDateKey(x.StartTime || "");
        return d && inRange(d);
      })
      .sort((a: any, b: any) => String(a.StartTime || "").localeCompare(String(b.StartTime || "")));

    const sleepScoreMap: Record<string, number> = {};
    const sleepGroup: Record<string, { deep: number; rem: number; light: number; awake: number; start: string; end: string }> = {};

    sleepList.forEach((x: any) => {
      const d = toDateKey(x.StartTime || "");
      if (!d) return;

      sleepGroup[d] ||= { deep: 0, rem: 0, light: 0, awake: 0, start: "", end: "" };
      sleepGroup[d].deep += Number(x.ComfortCount || 0);
      sleepGroup[d].rem += Number(x.RemCount || 0);
      sleepGroup[d].light += Number(x.LightCount || 0);
      sleepGroup[d].awake += Number(x.AwakeCount || 0);
      sleepScoreMap[d] = Math.max(Number(sleepScoreMap[d] || 0), Number(x.SleepScore || 0));

      const start = safeTimeFromDateTime(x.StartTime || "");
      const end = safeTimeFromDateTime(x.EndTime || "");
      if (!sleepGroup[d].start || start < sleepGroup[d].start) sleepGroup[d].start = start;
      if (!sleepGroup[d].end || end > sleepGroup[d].end) sleepGroup[d].end = end;
    });

    let dates = Object.keys(sleepGroup).sort();
    return {
      chartType: "bar",
      stacked: true,
      headers: [measureTimeHeader(), "睡眠分數", "開始時間", "結束時間"],
      labels: dates.map((d) => toDateLabel(d)),
      rows: sleepList.map((x: any) => [
        formatMeasureTime(String(x.StartTime || "")),
        String(x.SleepScore || ""),
        safeTimeFromDateTime(String(x.StartTime || "")),
        safeTimeFromDateTime(String(x.EndTime || "")),
      ]),
      datasets: [
        { label: "深眠", data: dates.map((d) => sleepGroup[d].deep), backgroundColor: "#3f8c25" },
        { label: "REM", data: dates.map((d) => sleepGroup[d].rem), backgroundColor: "#74b84a" },
        { label: "淺眠", data: dates.map((d) => sleepGroup[d].light), backgroundColor: "#a4ce77" },
        { label: "清醒", data: dates.map((d) => sleepGroup[d].awake), backgroundColor: "#d3e8b8" },
      ],
    };
  }

  const biaDetailList = (raw.Bia || [])
    .filter((x: any) => {
      const d = toDateKey(x.time || "");
      return d && inRange(d);
    })
    .sort((a: any, b: any) => String(a.time || "").localeCompare(String(b.time || "")));

  if (isSingleDaySelected.value && biaDetailList.length) {
    const waterBucket = aggregateSingleValueBy4Hour(
      biaDetailList.map((x: any) => ({ ...x, waterValue: Number(x.water || 0) / 10 })),
      "time",
      "waterValue"
    );
    const fatBucket = aggregateSingleValueBy4Hour(
      biaDetailList.map((x: any) => ({ ...x, fatValue: Number(x.fat || 0) / 10 })),
      "time",
      "fatValue"
    );
    const skmBucket = aggregateSingleValueBy4Hour(
      biaDetailList.map((x: any) => ({ ...x, skmValue: Number(x.skm || 0) / 10 })),
      "time",
      "skmValue"
    );

    return {
      chartType: "line",
      headers: ["測量時間", "水分", "體脂肪", "肌肉量"],
      labels: waterBucket.labels,
      rows: biaDetailList.map((x: any) => [
        safeTimeFromDateTime(String(x.time || "")),
        ((Number(x.water || 0) / 10) || 0).toFixed(1),
        ((Number(x.fat || 0) / 10) || 0).toFixed(1),
        ((Number(x.skm || 0) / 10) || 0).toFixed(1),
      ]),
      datasets: [
        {
          label: "水分",
          data: waterBucket.avgData,
          borderColor: "#27a3a9",
          backgroundColor: "#27a3a9",
        },
        {
          label: "體脂肪",
          data: fatBucket.avgData,
          borderColor: "#7cbc28",
          backgroundColor: "#7cbc28",
        },
        {
          label: "肌肉量",
          data: skmBucket.avgData,
          borderColor: "#2f6fa3",
          backgroundColor: "#2f6fa3",
        },
      ],
    };
  }

  return {
    chartType: "line",
    headers: [measureTimeHeader(), "水分", "體脂肪", "肌肉量"],
    labels: biaDetailList.map((x: any) => formatChartCategoryLabel(String(x.time || ""))),
    rows: biaDetailList.map((x: any) => [
      formatMeasureTime(String(x.time || "")),
      ((Number(x.water || 0) / 10) || 0).toFixed(1),
      ((Number(x.fat || 0) / 10) || 0).toFixed(1),
      ((Number(x.skm || 0) / 10) || 0).toFixed(1),
    ]),
    datasets: [
      {
        label: "水分",
        data: biaDetailList.map((x: any) => Number(x.water || 0) / 10),
        borderColor: "#27a3a9",
        backgroundColor: "#27a3a9",
      },
      {
        label: "體脂肪",
        data: biaDetailList.map((x: any) => Number(x.fat || 0) / 10),
        borderColor: "#7cbc28",
        backgroundColor: "#7cbc28",
      },
      {
        label: "肌肉量",
        data: biaDetailList.map((x: any) => Number(x.skm || 0) / 10),
        borderColor: "#2f6fa3",
        backgroundColor: "#2f6fa3",
      },
    ],
  };
});

type ChartViewData = {
  labels: string[];
  data: number[];
  seriesName: string;
};

const chartViewData = computed<ChartViewData>(() => {
  const key = metricKey.value;
  const raw = asusHealthData.value || {};
  const inRange = (dateKey: string) => isFrom2025(dateKey) && isInSelectedDateRange(dateKey);

  if (key === "heartRate") {
    const points = buildChartPoints(
      (raw.HbDetail || []).filter((x: any) => inRange(toDateKey(x.time || ""))),
      "time",
      "heartrate"
    );
    return {
      labels: points.map((p) => p.label),
      data: points.map((p) => p.value),
      seriesName: "心率",
    };
  }

  if (key === "spo2") {
    const points = buildChartPoints(
      (raw.Spo2Detail || []).filter((x: any) => inRange(toDateKey(x.time || ""))),
      "time",
      "spo2"
    );
    return {
      labels: points.map((p) => p.label),
      data: points.map((p) => p.value),
      seriesName: "血氧",
    };
  }

  if (key === "temp") {
    const points = buildChartPoints(
      (raw.TpDetail || []).filter((x: any) => inRange(toDateKey(x.time || ""))),
      "time",
      "temerature"
    );
    return {
      labels: points.map((p) => p.label),
      data: points.map((p) => p.value),
      seriesName: "體溫",
    };
  }

  if (key === "steps") {
    const points = buildChartPoints(
      (raw.StepDetail || []).filter((x: any) => inRange(toDateKey(x.time || ""))),
      "time",
      "steps"
    );
    if (points.length) {
      return {
        labels: points.map((p) => p.label),
        data: points.map((p) => p.value),
        seriesName: "步數",
      };
    }

    const daily = (raw.Step || [])
      .filter((x: any) => x.Date && inRange(x.Date))
      .sort((a: any, b: any) => String(a.Date).localeCompare(String(b.Date)))
      .map((x: any) => ({
        label: formatChartCategoryLabel(String(x.Date || "")),
        value: Number(x.stepsSUM || 0),
      }));

    return {
      labels: daily.map((p) => p.label),
      data: daily.map((p) => p.value),
      seriesName: "總步數",
    };
  }

  if (key === "bp") {
    const points = buildChartPoints(
      (raw.Bp || []).filter((x: any) => inRange(toDateKey(x.time || ""))),
      "time",
      "sys"
    );
    return {
      labels: points.map((p) => p.label),
      data: points.map((p) => p.value),
      seriesName: "收縮壓",
    };
  }

  if (key === "stress") {
    const points = buildChartPoints(
      (raw.Bp || []).filter((x: any) => inRange(toDateKey(x.time || ""))),
      "time",
      "deStressIndex"
    );
    return {
      labels: points.map((p) => p.label),
      data: points.map((p) => p.value),
      seriesName: "舒壓指數",
    };
  }

  if (key === "hrv") {
    const points = buildChartPoints(
      (raw.Bp || []).filter((x: any) => inRange(toDateKey(x.time || ""))),
      "time",
      "rmssd"
    );
    return {
      labels: points.map((p) => p.label),
      data: points.map((p) => p.value),
      seriesName: "RMSSD",
    };
  }

  if (key === "sleep") {
    const sleepScoreMap: Record<string, number> = {};
    (raw.Sleep || []).forEach((x: any) => {
      const d = toDateKey(x.StartTime || "");
      if (!d || !inRange(d)) return;
      sleepScoreMap[d] = Math.max(Number(sleepScoreMap[d] || 0), Number(x.SleepScore || 0));
    });

    const dates = Object.keys(sleepScoreMap).sort();
    return {
      labels: dates.map((d) => formatChartCategoryLabel(d)),
      data: dates.map((d) => sleepScoreMap[d]),
      seriesName: "睡眠分數",
    };
  }

  const points = buildChartPoints(
    (raw.Bia || []).filter((x: any) => inRange(toDateKey(x.time || ""))),
    "time",
    "water",
    { transform: (value) => value / 10 }
  );

  return {
    labels: points.map((p) => p.label),
    data: points.map((p) => p.value),
    seriesName: "水分",
  };
});

function destroyDetailChart() {
  detailChart?.dispose();
  detailChart = null;
}

function buildChartOption() {
  const { labels, data, seriesName } = chartViewData.value;
  const pointCount = labels.length;
  const dataZoomStart = pointCount > 100 ? 90 : 0;
  const dataZoomEnd = 100;

  return {
    tooltip: {
      trigger: "axis",
      position(pt: number[]) {
        return [pt[0], "10%"];
      },
    },
    title: {
      left: "center",
      text: metricTitle.value,
      subtext: currentDateRangeLabel.value,
      subtextStyle: {
        fontSize: 12,
        color: "#6d7c96",
      },
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
        restore: {},
        saveAsImage: {},
      },
    },
    grid: {
      left: 48,
      right: 24,
      top: 56,
      bottom: pointCount > 20 ? 72 : 48,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: labels,
    },
    yAxis: {
      type: "value",
      boundaryGap: [0, "100%"],
    },
    dataZoom: [
      {
        type: "inside",
        start: dataZoomStart,
        end: dataZoomEnd,
      },
      {
        start: dataZoomStart,
        end: dataZoomEnd,
      },
    ],
    series: [
      {
        name: seriesName,
        type: "line",
        symbol: "circle",
        symbolSize: 6,
        sampling: pointCount > 100 ? "lttb" : undefined,
        connectNulls: true,
        itemStyle: {
          color: "rgb(255, 70, 131)",
        },
        emphasis: {
          focus: "series",
          itemStyle: {
            borderWidth: 2,
            borderColor: "#1ba39b",
          },
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "rgb(255, 158, 68)",
            },
            {
              offset: 1,
              color: "rgb(255, 70, 131)",
            },
          ]),
        },
        data,
      },
    ],
  };
}

function normalizeDateKey(dateLike: string) {
  const raw = String(dateLike || "").trim();
  if (!raw) return "";

  if (/^\d{8}$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }

  const fullDateMatch = raw.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (fullDateMatch) {
    const [, y, m, d] = fullDateMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const monthDayMatch = raw.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (monthDayMatch) {
    const year = dateRange.value.start
      ? (parseISODateToDate(dateRange.value.start)?.getFullYear() ?? new Date().getFullYear())
      : new Date().getFullYear();
    return `${year}-${monthDayMatch[1].padStart(2, "0")}-${monthDayMatch[2].padStart(2, "0")}`;
  }

  return toDateKey(raw);
}

function getRowDateKey(row: string[]) {
  const first = String(row[0] || "").trim();
  if (!first) return "";

  if (/^\d{8}$/.test(first) || /^\d{4}-\d{2}-\d{2}/.test(first) || /^\d{4}\/\d{1,2}\/\d{1,2}/.test(first)) {
    return normalizeDateKey(first);
  }

  const embeddedDate = first.match(/(\d{4}-\d{2}-\d{2})/);
  if (embeddedDate) return embeddedDate[1];

  if (isSingleDaySelected.value && dateRange.value.start) {
    return normalizeDateKey(dateRange.value.start);
  }

  return normalizeDateKey(first);
}

function parseChartLabel(chartLabel: string) {
  const normLabel = chartLabel.trim();
  const parts = normLabel.split(/\s+/);
  const datePart = parts[0] || "";
  const timePart = parts.slice(1).join(" ");

  return {
    normLabel,
    dateKey: normalizeDateKey(datePart),
    timePart,
  };
}

function findRowIndexByChartLabel(chartLabel: string) {
  const rows = metricData.value.rows;
  if (!rows.length) return -1;

  const { normLabel, dateKey, timePart } = parseChartLabel(chartLabel);

  for (let i = 0; i < rows.length; i++) {
    const first = String(rows[i][0] || "").trim();
    if (first === normLabel) return i;
  }

  if (dateKey && timePart) {
    for (let i = 0; i < rows.length; i++) {
      const first = String(rows[i][0] || "");
      const rowDateKey = getRowDateKey(rows[i]);
      if (rowDateKey === dateKey && (first.includes(timePart) || first.endsWith(timePart))) {
        return i;
      }
    }
  }

  if (dateKey) {
    for (let i = 0; i < rows.length; i++) {
      if (getRowDateKey(rows[i]) === dateKey) return i;
    }
  }

  return -1;
}

function scrollToTableRow(index: number) {
  if (index < 0) return;

  nextTick(() => {
    const wrap = tableWrapRef.value;
    if (!wrap) return;

    const rowEl = wrap.querySelector(`[data-row-index="${index}"]`) as HTMLElement | null;
    if (!rowEl) return;

    highlightedRowIndex.value = index;

    const wrapRect = wrap.getBoundingClientRect();
    const rowRect = rowEl.getBoundingClientRect();
    const targetTop =
      wrap.scrollTop + (rowRect.top - wrapRect.top) - wrap.clientHeight / 2 + rowEl.offsetHeight / 2;

    wrap.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });

    window.setTimeout(() => {
      highlightedRowIndex.value = null;
    }, 2500);
  });
}

function handleChartPointClick(dataIndex: number) {
  const label = chartViewData.value.labels[dataIndex];
  if (!label) return;

  let rowIndex = findRowIndexByChartLabel(label);
  if (rowIndex < 0 && dataIndex < metricData.value.rows.length) {
    rowIndex = dataIndex;
  }

  scrollToTableRow(rowIndex);
}

function bindChartEvents() {
  if (!detailChart) return;

  detailChart.off("click");
  detailChart.on("click", (params: { componentType?: string; dataIndex?: number }) => {
    if (params.componentType === "series" && typeof params.dataIndex === "number") {
      handleChartPointClick(params.dataIndex);
    }
  });
}

function renderDetailChart() {
  const el = detailChartRef.value;
  if (!el) return;

  if (!chartViewData.value.labels.length) {
    destroyDetailChart();
    return;
  }

  nextTick(() => {
    requestAnimationFrame(() => {
      if (!detailChartRef.value) return;

      if (!detailChart) {
        detailChart = echarts.init(detailChartRef.value);
      }

      detailChart.setOption(buildChartOption(), true);
      bindChartEvents();
      detailChart.resize();
    });
  });
}

function handleChartResize() {
  detailChart?.resize();
}

async function fetchMetricData() {
  isMetricLoading.value = true;
  try {
    await memberStore.fetchAsusHealthData(getAuth(), getAsusApiDateRange());
  } finally {
    isMetricLoading.value = false;
    await nextTick();
    renderDetailChart();
  }
}

async function initializeMetricView() {
  dateRange.value = getDefaultDateRange();
  await fetchMetricData();
}

watch(metricKey, async () => {
  await initializeMetricView();
});

watch(
  dateRange,
  async (value) => {
    const normalized = normalizeDateRangeValue(value);
    if (normalized.start !== value.start || normalized.end !== (value.end || value.start)) {
      skipNextDateRangeWatch = true;
      dateRange.value = normalized;
      return;
    }

    if (skipNextDateRangeWatch) {
      skipNextDateRangeWatch = false;
      return;
    }
    await fetchMetricData();
  },
  { deep: true }
);

watchEffect(() => {
  if (!chartViewData.value.labels.length) {
    destroyDetailChart();
    return;
  }
  renderDetailChart();
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
    dateRange.value = {
      start: formatDateForPicker(qStartDate),
      end: formatDateForPicker(qEndDate ?? qStartDate),
    };
  }

  await fetchMetricData();
  window.addEventListener("resize", handleChartResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleChartResize);
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
  overflow: visible;

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
  flex-wrap: wrap;
}

.dateRangeWrap {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 320px;
  position: relative;
  z-index: 30;
  overflow: visible;

  :deep(.date-range-wrapper) {
    width: 100%;
    overflow: visible;
  }

  :deep(.date-picker-container) {
    min-height: 40px;
    border-radius: 8px;
    background: #fff;
  }

  :deep(.vdp-range-popup) {
    z-index: 1000;
  }
}

.latestDataHint {
  color: #6d7c96;
  font-size: 0.8rem;
  padding-left: 0.15rem;
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

.detailChart {
  width: 100%;
  height: 100%;
}

.tableWrap {
  margin-top: 0.85rem;
  border-radius: 10px;
  border: 1px solid #e9eef5;
  max-height: 340px;
  overflow: auto;
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

.tableRow.isHighlighted .td {
  background: #eefaf8;
  color: #0f766e;
  font-weight: 600;
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

  .dateRangeWrap {
    width: 100%;
    min-width: 0;
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
