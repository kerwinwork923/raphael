<template>
  <div v-if="loading" class="loading-mask">
    <div class="loading-spinner"></div>
    <div>載入中，請稍候...</div>
  </div>

  <div v-else class="stablePage">
    <Sidebar />

    <div class="stableContent">
      <div class="stableTitle">
        <h3>{{ memberName }}</h3>
        <div class="optionGroup">
          <button class="goBackBtn" @click="goBack">
            <img src="/assets/imgs/backend/back.svg" alt="" />返回
          </button>
          <div class="rwdW100">
            <button class="btn refresh" @click="refresh">資料更新</button>
            <span class="updated-time">最後更新: {{ lastUpdated || "—" }}</span>
          </div>
        </div>
      </div>

      <div class="memberInfoCard">
        <h3>護您穩</h3>
        <div class="memberInfoTable">
          <div class="memberInfoTableTitle stableInfo">
            <div class="memberInfoTableTitleItem">名稱</div>
            <div class="memberInfoTableTitleItem">SN碼</div>
            <div class="memberInfoTableTitleItem">看診時間</div>
            <div class="memberInfoTableTitleItem">使用次數</div>
            <div class="memberInfoTableTitleItem">產品狀態</div>
            <div class="memberInfoTableTitleItem">建立時間</div>
          </div>
          <div class="memberInfoTableHR" />
          <div class="memberInfoTableRow stableInfo">
            <div class="memberInfoTableRowItem">{{ stableDetail.name || "—" }}</div>
            <div class="memberInfoTableRowItem">{{ stableDetail.sn || "—" }}</div>
            <div class="memberInfoTableRowItem">{{ stableDetail.visitTime || "—" }}</div>
            <div class="memberInfoTableRowItem">{{ stableDetail.usesTimes || "0" }}</div>
            <div class="memberInfoTableRowItem">
              <span
                class="status"
                :class="{
                  enabled: stableDetail.productState === '已啟用',
                  disabled: stableDetail.productState === '已停用',
                }"
                >{{ stableDetail.productState || "—" }}</span
              >
            </div>
            <div class="memberInfoTableRowItem">{{ stableDetail.createTime || "—" }}</div>
          </div>
        </div>
      </div>

      <div class="memberInfoCard">
        <div class="memberInfoTitleWrap">
          <h3>穿衣紀錄</h3>
          <VueDatePicker
            v-model="wearDateRange"
            range
            :partial-range="true"
            :enable-time-picker="false"
            format="yyyy/MM/dd"
            placeholder="選擇日期區間"
            teleport="body"
            class="stableDatePicker"
          />
        </div>

        <div class="memberInfoTable">
          <div class="memberInfoTableTitle">
            <div class="memberInfoTableTitleItem">開始時間</div>
            <div class="memberInfoTableTitleItem">結束時間</div>
            <div class="memberInfoTableTitleItem">穿衣總時長</div>
          </div>
          <div class="memberInfoTableHR" />
          <template v-if="paginatedWearRecords.length">
            <div class="memberInfoTableRow" v-for="(row, idx) in paginatedWearRecords" :key="`${row.startTimeRaw}_${idx}`">
              <div class="memberInfoTableRowItem">{{ row.startTime }}</div>
              <div class="memberInfoTableRowItem">{{ row.endTime }}</div>
              <div class="memberInfoTableRowItem">{{ formatDurationLabel(row.durationMinutes) }}</div>
            </div>
          </template>
          <div class="memberInfoTableRow" v-else>
            <div class="memberInfoTableRowItem noData">尚無資料</div>
          </div>
        </div>

        <nav class="pagination" v-if="totalPages > 1">
          <button class="btn-page" :disabled="currentPage === 1" @click="currentPage = 1">&lt;&lt;</button>
          <button class="btn-page" :disabled="currentPage === 1" @click="currentPage--">&lt;</button>
          <button
            class="btn-page btn-page-number"
            v-for="p in pageNumberList"
            :key="p"
            :class="{ active: currentPage === p }"
            @click="currentPage = p"
          >
            {{ p }}
          </button>
          <button class="btn-page" :disabled="currentPage === totalPages" @click="currentPage++">&gt;</button>
          <button class="btn-page" :disabled="currentPage === totalPages" @click="currentPage = totalPages">&gt;&gt;</button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import VueDatePicker from "@vuepic/vue-datepicker";
import Sidebar from "~/components/raphaelBackend/Sidebar.vue";
import { useMemberStore } from "~/stores/useMemberStore";

const router = useRouter();
const route = useRoute();
const memberStore = useMemberStore();
const { member } = storeToRefs(memberStore);

const loading = ref(false);
const lastUpdated = ref("");
const wearDateRange = ref<Date[] | null>(null);
const currentPage = ref(1);
const pageSize = 10;
const stableDetail = ref({
  name: "",
  sn: "",
  visitTime: "",
  usesTimes: "0",
  productState: "",
  createTime: "",
});
const wearRecords = ref<
  Array<{
    startTimeRaw: string;
    endTimeRaw: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
  }>
>([]);

const memberName = computed(() => member.value?.Name || "—");

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

function formatYMDHMS(value: string) {
  if (!value || value.length < 14) return "—";
  return `${value.substring(0, 4)}/${value.substring(4, 6)}/${value.substring(6, 8)} ${value.substring(8, 10)}:${value.substring(10, 12)}`;
}

function formatDurationLabel(totalMinutes: number) {
  const mins = Number.isFinite(totalMinutes) ? Math.max(0, totalMinutes) : 0;
  const hours = Math.floor(mins / 60);
  const remain = mins % 60;
  if (hours > 0 && remain > 0) return `${hours}小時${remain}分鐘`;
  if (hours > 0) return `${hours}小時`;
  return `${remain}分鐘`;
}

function parseDateMs(value: string) {
  if (!value || value.length < 8) return NaN;
  const y = value.substring(0, 4);
  const m = value.substring(4, 6);
  const d = value.substring(6, 8);
  return Date.parse(`${y}-${m}-${d}T00:00:00`);
}

const filteredWearRecords = computed(() => {
  let list = [...wearRecords.value];
  if (wearDateRange.value && wearDateRange.value[0]) {
    const from = wearDateRange.value[0];
    const to = wearDateRange.value[1] ?? wearDateRange.value[0];
    const start = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
    const end = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999).getTime();
    list = list.filter((row) => {
      const ms = parseDateMs(row.startTimeRaw);
      if (Number.isNaN(ms)) return false;
      return ms >= start && ms <= end;
    });
  }

  return list.sort((a, b) => b.startTimeRaw.localeCompare(a.startTimeRaw));
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredWearRecords.value.length / pageSize)));
const paginatedWearRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredWearRecords.value.slice(start, start + pageSize);
});

const pageNumberList = computed(() => {
  const pages: number[] = [];
  const maxButtons = 5;
  const total = totalPages.value;
  if (total <= maxButtons) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }
  let start = Math.max(1, currentPage.value - Math.floor(maxButtons / 2));
  let end = start + maxButtons - 1;
  if (end > total) {
    end = total;
    start = total - maxButtons + 1;
  }
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

watch(totalPages, (total: number) => {
  if (currentPage.value > total) currentPage.value = total;
  if (currentPage.value < 1) currentPage.value = 1;
});

watch(wearDateRange, () => {
  currentPage.value = 1;
});

async function loadData() {
  const aid = String(route.query.AID || "");
  if (!aid) {
    router.push("/raphaelBackend/member/memberContent");
    return;
  }

  loading.value = true;
  try {
    await memberStore.fetchAll(getAuth());
    const detail = await memberStore.fetchStabilityDetail(getAuth(), aid);
    if (!detail) {
      stableDetail.value = {
        name: "—",
        sn: "—",
        visitTime: "—",
        usesTimes: "0",
        productState: "—",
        createTime: "—",
      };
      wearRecords.value = [];
      return;
    }

    stableDetail.value = {
      name: detail.Name || "—",
      sn: detail.SN || "—",
      visitTime: formatYMDHMS(detail.SVTime || (detail as any).CheckTime || ""),
      usesTimes: detail.UsesTimes || "0",
      productState: detail.ProductState || "—",
      createTime: formatYMDHMS(detail.CreateTime || ""),
    };
    wearRecords.value = (detail.WearRec || []).map((row: any) => ({
      startTimeRaw: String(row?.StartTime || row?.CheckTime || ""),
      endTimeRaw: String(row?.EndTime || ""),
      startTime: formatYMDHMS(String(row?.StartTime || row?.CheckTime || "")),
      endTime: formatYMDHMS(String(row?.EndTime || "")),
      durationMinutes: parseInt(String(row?.Duration || "0"), 10) || 0,
    }));
    lastUpdated.value = new Date().toLocaleString("zh-TW");
    currentPage.value = 1;
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push("/raphaelBackend/member/memberContent");
}

function refresh() {
  loadData();
}

watch(
  () => route.query.AID,
  () => {
    loadData();
  },
);

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.stablePage {
  display: flex;
  min-height: 100vh;
  background: $primary-100;
  gap: 1%;

  .stableContent {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    padding-left: 0;
    width: 100%;
    margin: 0 auto;

    @include respond-to("lg") {
      padding-left: 1rem;
    }

    .stableTitle {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;

      @include respond-to("lg") {
        padding-left: 36px;
      }

      @include respond-to("sm") {
        flex-wrap: wrap;
      }

      h3 {
        color: $primary-600;
        text-align: center;
        font-size: 32px;
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.09px;
        line-height: 1;
      }

      .optionGroup {
        display: flex;
        align-items: center;
        gap: 8px;

        @include respond-to("sm") {
          flex-wrap: wrap;
          justify-content: space-between;
          width: 100%;
        }

        .rwdW100 {
          display: flex;
          align-items: center;
          gap: 8px;

          @include respond-to("sm") {
            width: 100%;
            justify-content: space-between;
          }
        }

        button {
          display: flex;
          gap: 4px;
          align-items: center;

          img {
            width: 18px;
          }

          background-color: $primary-200;
          border: none;
          color: var(--Primary-100, #f5f7fa);
          font-size: 0.95rem;
          font-style: normal;
          font-weight: 400;
          padding: 0.18rem 0.5rem;
          letter-spacing: 0.25px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background-color: $primary-300;
          }
        }
      }
    }

    .memberInfoCard {
      border-radius: 20px;
      background: #fff;
      box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
      padding: 1rem 1.25rem;
      overflow-x: auto;

      h3 {
        color: #2d3047;
        font-size: 1.25rem;
        margin: 0;
        font-weight: bold;
      }

      .memberInfoTitleWrap {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;

        @include respond-to("sm") {
          flex-wrap: wrap;
        }
      }

      .memberInfoTable {
        flex: 1;
        margin-top: 0.25rem;

        .memberInfoTableTitle {
          display: flex;
          white-space: nowrap;
          font-size: 0.87rem;

          .memberInfoTableTitleItem {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            padding: 0.5rem;
            color: $primary-600;
            font-weight: 500;
          }

          &.stableInfo {
            min-width: 1040px;
          }
        }

        .memberInfoTableHR {
          height: 1px;
          width: 100%;
          background-color: #d6deeb;
          margin-top: 0;
        }

        .memberInfoTableRow {
          display: flex;
          align-items: center;
          color: #666;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background-color: #fafbfd;
            color: #4d5566;
          }

          .memberInfoTableRowItem {
            flex: 1;
            padding: 0.85rem 0.5rem;
            min-width: 0;
            word-break: break-word;
            font-size: 14px;
            color: #666;
          }

          &.stableInfo {
            min-width: 1040px;
          }
        }
      }
    }

    .pagination {
      display: flex;
      justify-content: center;
      gap: 4px;
      width: 100%;
      margin-top: 0.5rem;

      .btn-page {
        padding: 5px 9px;
        min-width: 30px;
        border-radius: 4px;
        background-color: transparent;
        cursor: pointer;
        border: none;
        color: #2d3047;
        transition: all 0.2s;

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        &:not(:disabled):hover {
          background: rgba(27, 163, 155, 0.1);
        }
      }

      .btn-page-number {
        background: white;

        &.active {
          background: $chip-success;
          color: white;
        }
      }
    }
  }
}

.noData {
  width: 100%;
  justify-content: center;
}

.status {
  &.enabled {
    color: #1ba39b !important;
    font-weight: 600;
  }

  &.disabled {
    color: #ea6169 !important;
    font-weight: 600;
  }
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

  .loading-spinner {
    border: 6px solid #eee;
    border-top: 6px solid #1ba39b;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
}

:deep(.stableDatePicker.dp__main) {
  width: 220px;
}

:deep(.stableDatePicker .dp__input_wrap .dp__input) {
  height: 30px;
  border-radius: 16px;
  border: 1px solid #dfe6ef;
  font-size: 13px;
  padding-left: 34px;
  color: #7e8796;
  background: #fff;
}

:deep(.stableDatePicker .dp__input_icon) {
  color: #1ba39b;
  left: 2px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
