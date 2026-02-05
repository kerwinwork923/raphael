<template>
  <div class="messageManage">
    <Sidebar />

    <!-- ─────────────── Main Content ─────────────── -->
    <main class="content">
      
      <!-- page header -->
      <header class="page-header">
        <h2 class="title">
          留言管理
          <span class="count">({{ totalMessages }})</span>
        </h2>
      </header>

      <!-- toolbar / filters -->
      <section class="toolbar">

        <!-- 搜尋欄位 -->
        <div class="search-wrapper">
          <input
            v-model="searchKeyword"
            class="search"
            type="text"
            placeholder="請輸入關鍵字"
            @input="handleSearch"
          />
          <img src="/assets/imgs/backend/search.svg" alt="" />
        </div>

        <!-- 影片篩選 -->
        <div class="selectWrapper">
          <img
            class="selectWrapperIcon1"
            src="/assets/imgs/backend/filter.svg"
            alt=""
          />
          <select v-model="selectedVideo" @change="handleVideoFilter">
            <option value="">全部影片</option>
            <option
              v-for="video in videoOptions"
              :key="video.value"
              :value="video.value"
            >
              {{ video.label }}
            </option>
          </select>
          <img
            class="selectWrapperIcon2"
            src="/assets/imgs/backend/dropdown.svg"
            alt=""
          />
        </div>

        <!-- 日期選擇器 -->
        <div class="toolbarTime-wrapper">
          <VueDatePicker
            v-model="dateRange"
            range
            :enable-time-picker="false"
            format="yyyy/MM/dd"
            placeholder="日期查詢"
            prepend-icon="i-calendar"
            teleport="body"
          />
          <img src="/assets/imgs/backend/search.svg" alt="" />
        </div>
      </section>

      <!-- data table -->
      <section class="message-table">
        <!-- header row -->
        <div class="table-row table-header">
          <div class="message-content">留言內容</div>
          <div class="video">所屬影片</div>
          <div class="sender">留言者</div>
          <div class="status">狀態</div>
          <div class="action">操作</div>
        </div>

        <!-- data rows -->
        <div v-if="loading" class="loading-row">載入中...</div>
        <div class="table-list" v-else>
          <div
            v-for="message in paginatedMessages"
            :key="message.id"
            class="table-row"
          >
            <div
              class="cell message-content"
              data-label="留言內容"
              @click="handleView(message.id)"
              style="cursor: pointer"
            >
              {{ message.content }}
            </div>
            <div class="cell video" data-label="所屬影片">
              {{ message.videoTitle }}
            </div>
            <div class="cell sender" data-label="留言者">
              {{ message.sender }}
            </div>
            <div class="cell status" data-label="狀態">
              <button
                class="status-btn"
                :class="message.status === 'replied' ? 'replied' : 'unreplied'"
              >
                {{ message.status === 'replied' ? '已回覆' : '未回覆' }}
              </button>
            </div>
            <div class="cell action" data-label="操作">
              <div class="action-buttons">
                <img
                  src="/assets/imgs/backend/deleteGray.svg"
                  alt="刪除"
                  class="action-icon"
                  @click="handleDelete(message.id)"
                />
                <img
                  src="/assets/imgs/backend/goNext.svg"
                  alt="查看"
                  class="action-icon"
                  @click="handleView(message.id)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 無資料提示 -->
        <div v-if="filteredMessages.length === 0" class="no-data">
          <p>尚無資料</p>
        </div>

        <!-- pagination -->
        <nav class="pagination" v-if="totalPages > 1">
          <button
            class="btn-page"
            :disabled="currentPage === 1"
            @click="gotoPage(1)"
          >
            &lt;&lt;
          </button>
          <button
            class="btn-page"
            :disabled="currentPage === 1"
            @click="prevPage"
          >
            &lt;
          </button>
          <button
            v-for="p in pageNumberList"
            :key="p"
            class="btn-page btn-page-number"
            :class="{ active: currentPage === p }"
            :disabled="p === '...'"
            @click="typeof p === 'number' && gotoPage(p)"
          >
            {{ p }}
          </button>
          <button
            class="btn-page"
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            &gt;
          </button>
          <button
            class="btn-page"
            :disabled="currentPage === totalPages"
            @click="gotoPage(totalPages)"
          >
            &gt;&gt;
          </button>
        </nav>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Sidebar from "@/components/raphaelBackend/Sidebar.vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { useSeo } from "~/composables/useSeo";

useSeo({
  title: "",
  description:
    "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
  url: "https://neuroplus.com.tw",
});

const router = useRouter();

const VIDEO_SINGLE_MESSAGE_API =
  "https://23700999.com:8081/HMA/api/bk/VideoMessageList";

// 從 localStorage/sessionStorage 獲取認證資訊
const token = ref(
  typeof window !== "undefined"
    ? localStorage.getItem("backendToken") ||
        sessionStorage.getItem("backendToken")
    : ""
);
const adminID = ref(
  typeof window !== "undefined"
    ? localStorage.getItem("adminID") || sessionStorage.getItem("adminID")
    : ""
);

/* ---------- 型別定義 ---------- */
interface Message {
  id: string; // BID，用於詳情頁路由
  content: string;
  videoTitle: string;
  sender: string;
  status: "replied" | "unreplied";
  date: string;
  AID: string;
}

interface VideoOption {
  label: string;
  value: string;
}

interface ApiVideoMessage {
  Status: string;
  Response: string;
  CheckTime: string;
  Message: string;
  MID: string;
  BID: string;
  AID: string;
  Mobile: string;
  Name: string;
}

/* ---------- 響應式資料 ---------- */
const messages = ref<Message[]>([]);
const searchKeyword = ref("");
const selectedVideo = ref("");
const dateRange = ref<Date[] | null>(null);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

/* ---------- 影片選項（從 API 列表的 AID 去重產生） ---------- */
const videoOptions = computed<VideoOption[]>(() => {
  const aids = new Set(messages.value.map((m: Message) => m.AID));
  return Array.from(aids).map((aid) => ({
    label: `影片 AID: ${aid}`,
    value: aid,
  }));
});

/* ---------- 計算屬性 ---------- */
// 篩選後的訊息
const filteredMessages = computed(() => {
  let result = messages.value;

  // 關鍵字搜尋
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(
      (msg: Message) =>
        msg.content.toLowerCase().includes(keyword) ||
        msg.videoTitle.toLowerCase().includes(keyword) ||
        msg.sender.toLowerCase().includes(keyword)
    );
  }

  // 影片篩選（依 AID）
  if (selectedVideo.value) {
    result = result.filter((msg: Message) => msg.AID === selectedVideo.value);
  }

  return result;
});

// 總訊息數
const totalMessages = computed(() => filteredMessages.value.length);

// 總頁數
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalMessages.value / pageSize.value))
);

// 分頁後的訊息
const paginatedMessages = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredMessages.value.slice(start, start + pageSize.value);
});

// 分頁按鈕列表
const pageNumberList = computed(() => {
  const pages: (number | string)[] = [];
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

/* ---------- 方法 ---------- */
// 搜尋處理
const handleSearch = () => {
  currentPage.value = 1;
};

// 影片篩選處理
const handleVideoFilter = () => {
  currentPage.value = 1;
};

// 分頁操作
const gotoPage = (page: number) => {
  currentPage.value = page;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

// 刪除訊息（目前僅前端移除，若有刪除 API 可再串接）
const handleDelete = (id: string) => {
  if (confirm("確定要刪除此留言嗎？")) {
    messages.value = messages.value.filter((msg: Message) => msg.id !== id);
  }
};

// 查看訊息（id 為 BID）
const handleView = (id: string) => {
  router.push(`/raphaelBackend/messageManage/${id}`);
};

// 將日期格式為 YYYYMMDD
function formatDateToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

// 取得留言列表
async function fetchMessageList() {
  if (!adminID.value || !token.value) return;
  loading.value = true;
  try {
    let StartDate = "";
    let EndDate = "";
    if (dateRange.value && dateRange.value.length >= 2) {
      StartDate = formatDateToYYYYMMDD(dateRange.value[0]);
      EndDate = formatDateToYYYYMMDD(dateRange.value[1]);
    }
    const response = await axios.post(VIDEO_SINGLE_MESSAGE_API, {
      AdminID: adminID.value,
      Token: token.value,
      StartDate,
      EndDate,
    });
    if (
      response.data?.Result === "OK" &&
      Array.isArray(response.data.VideoMessageList)
    ) {
      const list = response.data.VideoMessageList as ApiVideoMessage[];
      messages.value = list.map((item) => ({
        id: item.BID,
        content: item.Message,
        videoTitle: `影片 AID: ${item.AID}`,
        sender: item.Name,
        status:
          item.Response === "已回覆" ? ("replied" as const) : ("unreplied" as const),
        date: item.CheckTime,
        AID: item.AID,
      }));
    } else {
      messages.value = [];
    }
  } catch (err) {
    console.error("取得留言列表失敗:", err);
    messages.value = [];
  } finally {
    loading.value = false;
  }
}

/* ---------- 生命週期 ---------- */
onMounted(() => {
  fetchMessageList();
});

// 監聽日期範圍變化，重新取得列表
watch(dateRange, () => {
  fetchMessageList();
});

// 監聽篩選條件變化，重置分頁
watch([searchKeyword, selectedVideo], () => {
  currentPage.value = 1;
});
</script>

<style scoped lang="scss">
.messageManage {
  display: flex;
  min-height: 100vh;
  background: $primary-100;
  gap: 1%;

  .content {
    flex: 1;
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

    /* ─────────── 頁面標題 ─────────── */
    .page-header {
      margin-bottom: 1.5rem;

      .title {
        display: flex;
        align-items: center;
        white-space: nowrap;
        gap: 8px;
        color: $primary-600;
        font-size: 36px;
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.09px;

        @include respond-to("lg") {
          padding-left: 36px;
        }

        @include respond-to("md") {
          font-size: 24px;
        }

        .count {
          color: $primary-200;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.15px;
        }
      }
    }

    /* ─────────── 工具列 ─────────── */
    .toolbar {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      width: 100%;
      margin-bottom: 1.5rem;

      @include respond-to("md") {
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .search-wrapper {
        position: relative;
        min-width: 10dvw;

        @include respond-to("md") {
          width: 100%;
          min-width: auto;
        }

        img {
          width: 19px;
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
        }
      }

      .search {
        padding: 8px 12px;
        padding-left: 36px;
        border: none;
        width: 100%;
        border-radius: 50px;
        background: #fff;
        box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
        transition: all ease 0.2s;

        &:hover {
          box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
        }
      }

      .selectWrapper {
        position: relative;
        min-width: 10dvw;

        @include respond-to("md") {
          width: 100%;
          min-width: auto;
        }

        img {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
        }

        .selectWrapperIcon1 {
          left: 8px;
        }

        .selectWrapperIcon2 {
          right: 8px;
        }
      }

      select {
        padding: 0.5rem 2rem;
        border: none;
        border-radius: 50px;
        background: #fff;
        box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
        transition: all ease 0.2s;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        color: $raphael-gray-500;
        cursor: pointer;
        width: 100%;

        &:hover {
          box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
        }
      }

      .toolbarTime-wrapper {
        position: relative;
        min-width: 10dvw;

        @include respond-to("md") {
          width: 100%;
          min-width: auto;
        }

        :deep(.dp__pointer) {
          padding: 0;
        }

        :deep(.dp__input_icon) {
          color: $chip-success;
          right: auto;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
        }

        :deep(.dp__input) {
          padding: 3.5px 12px;
          padding-left: 36px;
          border-radius: 50px;
          background: #fff;
          box-shadow: 0px 2px 20px rgba(177, 192, 216, 0.25);
          border: none;
          font-size: 14px;
          transition: all ease 0.2s;

          &:hover {
            box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
          }
        }

        img {
          position: absolute;
          right: 10%;
          top: 50%;
          transform: translateY(-50%);
          width: 19px;
        }
      }
    }

    /* ─────────── 表格 ─────────── */
    .message-table {
      background: #fff;
      border-radius: 20px;
      padding: 1rem;
      box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);

      .table-row {
        display: grid;
        grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr;
        gap: 1rem;
        padding: 1rem 0;
        align-items: center;

        @include respond-to("md") {
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }

        &.table-header {
          font-weight: 600;
          color: $primary-600;
          border-bottom: 1px solid #b1c0d8;
          padding-bottom: 0.75rem;

          @include respond-to("md") {
            display: none;
          }
        }

        .cell {
          color: #666;
          word-break: break-word;

          @include respond-to("md") {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;

            &::before {
              content: attr(data-label);
              font-weight: 600;
              color: $primary-600;
              margin-right: 1rem;
            }
          }
        }

        .message-content {
          @include respond-to("md") {
            grid-column: 1;
          }
        }

        .video {
          @include respond-to("md") {
            grid-column: 1;
          }
        }

        .sender {
          @include respond-to("md") {
            grid-column: 1;
          }
        }

        .status {
          @include respond-to("md") {
            grid-column: 1;
          }
        }

        .action {
          @include respond-to("md") {
            grid-column: 1;
          }
        }

        .status-btn {
          padding: 4px 12px;
          border: none;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;

          
          &.replied {
            border-radius: 4px;
            border: 1px solid var(--Primary-default, #1BA39B);
            background: var(--primary-400-opacity-10, rgba(27, 163, 155, 0.10));
            color: var(--Primary-default, #1BA39B);
          }

          &.unreplied {
            border-radius: 4px;
            border: 1px solid var(--Primary-default, #EC4F4F);
            background: var(--warning-300-opacity-10, rgba(236, 79, 79, 0.10));
            color: var(--Warning-default, #EC4F4F);
          }
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          justify-content: center;

          .action-icon {
            width: 20px;
            height: 20px;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
        }
      }

      .loading-row {
        text-align: center;
        padding: 3rem 0;
        color: $raphael-gray-500;
      }

      .no-data {
        text-align: center;
        padding: 3rem 0;
        color: $raphael-gray-500;
      }
    }

    /* ─────────── 分頁 ─────────── */
    .pagination {
      display: flex;
      justify-content: center;
      gap: 4px;
      margin-top: 1.5rem;
      padding-top: 1rem;

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

        &:hover:not(:disabled) {
          background: rgba($chip-success, 0.1);
        }
      }

      .btn-page-number {
        background: white;
      }
    }
  }
}
</style>
