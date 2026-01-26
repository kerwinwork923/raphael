<template>
  <div v-if="loading" class="loading-mask">
    <div class="loading-spinner"></div>
    <div>載入中，請稍候...</div>
  </div>

  <div v-else class="myFavoriteInfo">
    <Sidebar />

    <!-- ───── 操作紀錄彈窗 ───── -->
    <div
      v-if="showOperationModal"
      class="operationModalOverlay"
      @click="closeOperationModal"
    >
      <div class="operationModal" @click.stop>
        <!-- 標題列 -->
        <div class="operationModalHeader">
          <div class="operationModalHeaderLeft">
            <img
              src="/assets/imgs/backend/Subtract.svg"
              alt="NP"
              class="npLogo"
            />
          </div>
          <div class="operationModalHeaderCenter">
            <h3>操作紀錄</h3>
          </div>
          <hr />
          <div class="operationModalHeaderRight">
            <span class="operationCount">已操作 {{ operationRecords }} 筆</span>
            <div class="operationFilters">
              <VueDatePicker
                v-model="operationDateRange"
                range
                :enable-time-picker="false"
                format="yyyy/MM/dd"
                placeholder="操作日期查詢"
                prepend-icon="i-calendar"
                teleport="body"
                class="dateFilter"
              />
              <div class="eventFilterWrapper">
                <div class="eventFilterTrigger" @click="toggleEventFilter">
                  <img
                    src="/assets/imgs/backend/search.svg"
                    alt="filter"
                    style="width: 16px; height: 16px"
                  />
                  <span>事件篩選</span>
                  <img
                    src="/assets/imgs/backend/arrow-down.svg"
                    alt="arrow"
                    :class="{ rotated: showEventFilter }"
                  />
                </div>
                <div
                  class="eventFilterDropdown"
                  v-if="showEventFilter"
                  @click.stop
                >
                  <div
                    class="eventFilterOption"
                    v-for="event in eventOptions"
                    :key="event"
                    @click="toggleEventOption(event)"
                  >
                    <input
                      type="checkbox"
                      :checked="selectedEvents.includes(event)"
                      @click.stop
                    />
                    <span>{{ event }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 表格內容 -->
        <div class="operationModalTable">
          <div class="operationTableHeader">
            <div class="operationTableHeaderItem">操作日期</div>
            <div class="operationTableHeaderItem">操作時間</div>
            <div class="operationTableHeaderItem">操作事件</div>
          </div>
          <div class="operationTableHR" />

          <div class="operationTableBody">
            <div
              class="operationTableRow"
              v-for="record in filteredOperationRecords"
              :key="record.id"
            >
              <div class="operationTableCell">{{ record.date }}</div>
              <div class="operationTableCell">{{ record.time }}</div>
              <div class="operationTableCell">{{ record.event }}</div>
            </div>
          </div>
        </div>

        <!-- 關閉按鈕 -->
        <div class="operationModalFooter">
          <div class="operationModalClose" @click="closeOperationModal">
            <img src="/assets/imgs/backend/close.svg" alt="close" />
          </div>
        </div>
      </div>
    </div>

    <!-- ───── 主要內容 ───── -->
    <div class="myFavoriteContent">
      <!-- 標題列 -->
      <div class="myFavoriteTitle">
        <h3>{{ memberName }}</h3>
        <div class="optionGroup">
          <h3 class="memberNameRWD">{{ memberName }}</h3>
          <button class="goBackBtn" @click="goBack">
            <img src="/assets/imgs/backend/back.svg" alt />返回
          </button>

          <div class="rwdW100">
            <button class="btn refresh" @click="refresh">資料更新</button>
            <span class="updated-time">最後更新: {{ lastUpdated || "—" }}</span>
          </div>
        </div>
      </div>

      <!-- 摘要卡片區域 -->
      <div class="summaryCards">
        <div class="summaryCard">
          <div class="summaryCardLabel">我的最愛名稱</div>
          <div class="summaryCardValue">{{ favoriteName || "—" }}</div>
        </div>
        <div class="summaryCard">
          <div class="summaryCardLabel">總使用次數</div>
          <div class="summaryCardValue">{{ totalUsage || "—" }}次</div>
        </div>
        <div class="summaryCard">
          <div class="summaryCardLabel">治療部位</div>
          <div class="summaryCardValue">{{ treatmentArea || "—" }}</div>
        </div>
        <div class="summaryCard">
          <div class="summaryCardLabel">貼片模式</div>
          <div class="summaryCardValue">{{ patchMode || "—" }}</div>
        </div>
        <div class="summaryCard">
          <div class="summaryCardLabel">操作紀錄</div>
          <div class="summaryCardValue">
            {{ operationRecords || "—" }}筆
            <img
              src="/assets/imgs/backend/dot.svg"
              alt="dot"
              class="dotIcon"
              @click="openOperationModal"
            />
          </div>
        </div>
      </div>

      <!-- 資料表格 -->
      <div class="myFavoriteTable">
        <div class="tableHeader">
          <div class="tableHeaderItem">開始日期</div>
          <div class="tableHeaderItem">開始時間</div>
          <div class="tableHeaderItem">結束時間</div>
          <div class="tableHeaderItem">治療時間</div>
          <div class="tableHeaderItem">暫停時間</div>
          <div class="tableHeaderItem">總使用時間</div>
        </div>
        <div class="tableHR" />

        <template v-if="tableData.length">
          <div class="tableRow" v-for="row in paginatedData" :key="row.id">
            <div class="tableCell">{{ row.startDate }}</div>
            <div class="tableCell">{{ row.startTime }}</div>
            <div class="tableCell">{{ row.endTime }}</div>
            <div class="tableCell">{{ row.treatmentDuration }}</div>
            <div class="tableCell">{{ row.pauseDuration }}</div>
            <div class="tableCell">{{ row.totalDuration }}</div>
          </div>
        </template>
        <div class="tableRow" v-else>
          <div class="tableCell" style="width: 100%">尚無資料</div>
        </div>
      </div>

      <!-- 分頁 -->
      <nav class="pagination" v-if="totalPages > 1">
        <button
          class="btn-page"
          :disabled="currentPage === 1"
          @click="currentPage = 1"
        >
          &lt;&lt;
        </button>
        <button
          class="btn-page"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          &lt;
        </button>
        <button
          class="btn-page btn-page-number"
          v-for="p in pageNumberList"
          :key="p"
          :class="{ active: currentPage === p }"
          @click="currentPage = p"
        >
          {{ p }}
        </button>
        <button
          class="btn-page"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          &gt;
        </button>
        <button
          class="btn-page"
          :disabled="currentPage === totalPages"
          @click="currentPage = totalPages"
        >
          &gt;&gt;
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import VueDatePicker from "@vuepic/vue-datepicker";
import Sidebar from "~/components/raphaelBackend/Sidebar.vue";

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const memberName = ref("測試用");
const lastUpdated = ref("2024/11/7 上午10:43");

// 摘要資料
const favoriteName = ref("肩膀疼痛");
const totalUsage = ref(5);
const treatmentArea = ref("543168432168431");
const patchMode = ref("呼吸模式");
const operationRecords = ref(100);

// 表格資料
const tableData = ref<any[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);

// 操作紀錄彈窗
const showOperationModal = ref(false);
const operationDateRange = ref<Date[] | null>(null);
const showEventFilter = ref(false);
const selectedEvents = ref<string[]>([]);
const operationRecordsData = ref<any[]>([]);

const eventOptions = [
  "結束治療",
  "開始治療",
  "治療滿30分鐘",
  "蜂鳴器長嗶一分鐘",
  "低電2警示",
  "低電1警示",
  "暫停治療",
  "恢復治療",
];

// 假資料
onMounted(() => {
  // 生成假資料
  tableData.value = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    startDate: "2025/12/12",
    startTime: "14:00",
    endTime: "15:00",
    treatmentDuration: "60分鐘",
    pauseDuration: "3分鐘",
    totalDuration: "63分鐘",
  }));

  // 操作紀錄假資料
  operationRecordsData.value = [
    { id: 1, date: "2025/12/25", time: "14:30:00", event: "結束治療" },
    { id: 2, date: "2025/12/24", time: "13:20:10", event: "開始治療" },
    { id: 3, date: "2025/12/23", time: "12:15:45", event: "治療滿30分鐘" },
    { id: 4, date: "2025/12/22", time: "11:05:30", event: "蜂鳴器長嗶一分鐘" },
    { id: 5, date: "2025/12/21", time: "10:00:00", event: "低電2警示" },
    { id: 6, date: "2025/12/20", time: "09:45:15", event: "開始治療" },
    { id: 7, date: "2025/12/19", time: "08:30:20", event: "結束治療" },
    { id: 8, date: "2025/12/18", time: "07:15:30", event: "低電1警示" },
    { id: 9, date: "2025/12/17", time: "06:00:45", event: "暫停治療" },
    { id: 10, date: "2025/12/16", time: "05:45:10", event: "恢復治療" },
  ];

  // 點擊外部關閉事件篩選
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".eventFilterWrapper")) {
      showEventFilter.value = false;
    }
  });
});

// 分頁計算
const totalPages = computed(() =>
  Math.max(1, Math.ceil(tableData.value.length / pageSize.value)),
);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return tableData.value.slice(start, start + pageSize.value);
});

const pageNumberList = computed(() => {
  const pages: number[] = [];
  const maxButtons = 5;
  const total = totalPages.value;

  if (total <= maxButtons) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    let start = Math.max(1, currentPage.value - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > total) {
      end = total;
      start = total - maxButtons + 1;
    }
    for (let i = start; i <= end; i++) pages.push(i);
  }
  return pages;
});

function goBack() {
  router.push("/raphaelBackend/member/memberContent");
}

function refresh() {
  loading.value = true;
  // 模擬 API 呼叫
  setTimeout(() => {
    lastUpdated.value = new Date().toLocaleString("zh-TW");
    loading.value = false;
  }, 1000);
}

// 操作紀錄彈窗功能
function openOperationModal() {
  showOperationModal.value = true;
}

function closeOperationModal() {
  showOperationModal.value = false;
  showEventFilter.value = false;
}

function toggleEventFilter() {
  showEventFilter.value = !showEventFilter.value;
}

function toggleEventOption(event: string) {
  const index = selectedEvents.value.indexOf(event);
  if (index > -1) {
    selectedEvents.value.splice(index, 1);
  } else {
    selectedEvents.value.push(event);
  }
}

// 篩選操作紀錄
const filteredOperationRecords = computed(() => {
  let data = operationRecordsData.value;

  // 日期篩選
  if (operationDateRange.value && operationDateRange.value.length >= 2) {
    const [from, to] = operationDateRange.value;
    const start = from.getTime();
    const end = to.getTime();
    data = data.filter((r: any) => {
      const ms = Date.parse(r.date?.replace(/\//g, "-") || "");
      return ms >= start && ms <= end;
    });
  }

  // 事件篩選
  if (selectedEvents.value.length > 0) {
    data = data.filter((r: any) => selectedEvents.value.includes(r.event));
  }

  return data;
});

watch(operationDateRange, () => {
  // 當日期範圍改變時可以觸發其他邏輯
});
</script>

<style scoped lang="scss">
.myFavoriteInfo {
  display: flex;
  min-height: 100vh;
  background: $primary-100;
  gap: 1%;

  .myFavoriteContent {
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
    @include respond-to("md") {
      width: 100%;
    }

    .myFavoriteTitle {
      width: 100%;
      display: flex;
      justify-content: space-between;

      .memberNameRWD {
        display: none;
      }

      @include respond-to("lg") {
        padding-left: 36px;
      }
      @include respond-to("sm") {
        flex-wrap: wrap;
        h3 {
          display: none;
        }
        .memberNameRWD {
          display: block;
        }
      }

      .optionGroup {
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;

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
          font-size: 1.125rem;
          font-style: normal;
          font-weight: 400;
          padding: 0.25rem 0.5rem;
          letter-spacing: 0.25px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background-color: $primary-300;
          }

          @include respond-to("lg") {
            font-size: 1rem;
            padding: 0.25rem 0.5rem;
          }
        }
      }

      h3 {
        color: $primary-600;
        text-align: center;
        font-size: 32px;
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.09px;
      }
    }

    // 摘要卡片區域
    .summaryCards {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;

      @include respond-to("md") {
        flex-direction: column;
      }

      .summaryCard {
        flex: 1;
        min-width: 180px;
        padding: 1.5rem 1rem;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .summaryCardLabel {
          color: $primary-200;
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        .summaryCardValue {
          color: $primary-600;
          font-size: 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;

          .moreIcon {
            width: 16px;
            height: 16px;
            cursor: pointer;
            opacity: 0.6;
            transition: opacity 0.2s;

            &:hover {
              opacity: 1;
            }
          }
        }
        .dotIcon {
          margin-left: auto;
          cursor: pointer;
        }
      }
    }

    // 表格區域
    .myFavoriteTable {
      background: #fff;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
      flex: 1;

      .tableHeader {
        display: flex;
        white-space: nowrap;
        font-size: 1rem;
        font-weight: 500;
        color: $primary-600;
        padding-bottom: 0.75rem;

        .tableHeaderItem {
          flex: 1;
          padding: 0.5rem;
        }
      }

      .tableHR {
        height: 1px;
        width: 100%;
        background-color: #b1c0d8;
        margin-bottom: 0.5rem;
      }

      .tableRow {
        display: flex;
        align-items: center;
        color: #666;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background-color: #f9f9f9;
          color: $chip-success;
        }

        .tableCell {
          flex: 1;
          padding: 1rem 0.5rem;
          font-size: 14px;
        }
      }
    }

    // 分頁
    .pagination {
      display: flex;
      justify-content: center;
      gap: 4px;
      width: 100%;

      .btn-page {
        padding: 6px 10px;
        min-width: 32px;
        border-radius: 4px;
        background-color: transparent;
        cursor: pointer;
        border: none;
        color: #2d3047;
        transition: all 0.2s;

        &.active {
          background: $chip-success;
          color: white;
          border-color: $chip-success;
        }

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
      }
    }
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

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}

// 操作紀錄彈窗樣式
.operationModalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 10000;

  .operationModal {
    position: fixed;
    width: 80%;
    max-width: 1200px;
    left: 50%;
    top: 50%;
    height: 90%;
    transform: translate(-50%, -50%);
    border-radius: 20px;
    border: 3px solid var(--Primary-default, #1ba39b);
    background: var(--neutral-white-opacity-30, rgba(255, 255, 255, 0.3));
    box-shadow: 0px 2px 20px 0px
      var(--primary-400-opacity-25, rgba(27, 163, 155, 0.25));
    backdrop-filter: blur(25px);
    z-index: 100;
    padding: 1rem 2.5%;
    overflow-y: auto;
    scrollbar-gutter: stable;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    // 自訂 scrollbar 樣式（Webkit）
    &::-webkit-scrollbar {
      width: 12px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #878787;
      border-radius: 10px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    &::-webkit-scrollbar-thumb:hover {
      background-color: #848484;
    }

    .operationModalHeader {
      text-align: center;
      margin-bottom: 0.75rem;

      padding: 0;
      gap: 1rem;

      @include respond-to("md") {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .operationModalHeaderLeft {
        .npLogo {
          width: 2rem;
          height: 2rem;
          border-radius: 9.8px;
          border: 1px solid var(--Primary-default, #1ba39b);
          padding: 2px 4px;
        }
      }

      .operationModalHeaderCenter {
        flex: 1;
        margin-top: 0.25rem;
        margin-bottom: 0.15rem;
        h3 {
          color: $primary-600;
          font-size: var(--Text-font-size-24, 20px);
          font-style: normal;
          font-weight: 700;
          letter-spacing: 0.12px;
          margin: 0;
        }
      }

      .operationModalHeaderRight {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: end;

        @include respond-to("md") {
          width: 100%;
          flex-direction: column;
          align-items: flex-start;
        }

        .operationCount {
          color: var(--Primary-200, #b1c0d8);
          font-size: 16px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        .operationFilters {
          display: flex;
          gap: 0.75rem;
          align-items: center;

          @include respond-to("md") {
            width: 100%;
            flex-direction: column;
          }

          .dateFilter {
            :deep(.dp__input) {
              padding: 0.5rem 1rem;
              border-radius: 50px;
              background: #fff;
              box-shadow: 0px 2px 12px -2px rgba(177, 192, 216, 0.5);
              border: none;
              font-size: 14px;
            }
          }

          .eventFilterWrapper {
            position: relative;

            .eventFilterTrigger {
              display: flex;
              align-items: center;
              gap: 4px;
              padding: 0.5rem 1rem;
              background: #fff;
              border-radius: 50px;
              cursor: pointer;
              box-shadow: 0px 2px 12px -2px rgba(177, 192, 216, 0.5);
              font-size: 14px;
              transition: all 0.2s;
              width: 200px;
              height: 42px;
              img {
                width: 12px;
                height: 12px;

                &.rotated {
                  transform: rotate(180deg);
                }
              }

              &:hover {
                box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
              }
            }

            .eventFilterDropdown {
              position: absolute;
              top: calc(100% + 8px);
              right: 0;
              background: #fff;
              border-radius: 12px;
              box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
              z-index: 100;
              min-width: 200px;
              max-height: 300px;
              overflow-y: auto;
              padding: 0.5rem;

              .eventFilterOption {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.5rem;
                cursor: pointer;
                border-radius: 4px;
                transition: background 0.2s;
                font-size: 14px;
                color: #1ba39b;

                &:hover {
                  background: #f5f7fa;
                }

                input[type="checkbox"] {
                  width: 18px;
                  height: 18px;
                  cursor: pointer;
                  accent-color: #1ba39b;
                }
              }
            }
          }
        }
      }
    }

    .operationModalTable {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border-radius: var(--Radius-r-20, 20px);
      background: var(--Neutral-white, #fff);
      box-shadow: 0 2px 20px 0
        var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
      .operationTableHeader {
        display: flex;
        padding: 1rem 2rem;

        border-bottom: 1px solid #e0e0e0;

        .operationTableHeaderItem {
          flex: 1;
          text-align: center;
          font-weight: 600;
          color: $primary-600;
          font-size: 16px;
        }
      }

      .operationTableHR {
        background: $primary-200;
        width: 100%;
        height: 1px;
      }

      .operationTableBody {
        flex: 1;
        overflow-y: auto;
        padding: 0 2rem;

        .operationTableRow {
          display: flex;
          padding: 1rem 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background-color: #f9f9f9;
          }

          .operationTableCell {
            flex: 1;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
        }
      }
    }

    .operationModalFooter {
      text-align: center;
      margin-top: 0.5rem;
      position: absolute;
      bottom: 3.5%;
      left: 50%;
      transform: translateX(-50%);

      .operationModalClose {
        border-radius: var(--Radius-r-50, 50px);
        background: $raphael-white;
        box-shadow: 0px 2px 20px 0px
          var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
        padding: 0.25rem;
        cursor: pointer;
        display: inline-block;
        transition: all 0.2s;

        &:hover {
          box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
        }

        img {
          width: 20px;
          height: 20px;
          display: block;
        }
      }
    }
  }
}
</style>
