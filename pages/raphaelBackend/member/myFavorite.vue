<template>
  <div v-if="loading" class="loading-mask">
    <div class="loading-spinner"></div>
    <div>載入中，請稍候...</div>
  </div>

  <div v-else class="myFavoriteInfo">
    <Sidebar />

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
            <!-- <img src="/assets/imgs/backend/more.svg" alt="more" class="moreIcon" /> -->
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
          <div
            class="tableRow"
            v-for="row in paginatedData"
            :key="row.id"
          >
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
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
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
});

// 分頁計算
const totalPages = computed(() =>
  Math.max(1, Math.ceil(tableData.value.length / pageSize.value))
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
</script>

<style scoped lang="scss">
.myFavoriteInfo {
  display: flex;
  min-height: 100vh;
  background: $primary-100;
  gap: 1%;

  .myFavoriteContent {
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
      margin-bottom: 1.5rem;

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
      margin-bottom: 2rem;
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
      }
    }

    // 表格區域
    .myFavoriteTable {
      background: #fff;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
      margin-bottom: 1.5rem;

      .tableHeader {
        display: flex;
        white-space: nowrap;
        font-size: 1rem;
        font-weight: 500;
        color: $primary-600;
        padding-bottom: 0.75rem;

        .tableHeaderItem {
          flex: 1;
          text-align: center;
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
        padding: 1rem 0;
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
          text-align: center;
          padding: 0.5rem;
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
</style>
