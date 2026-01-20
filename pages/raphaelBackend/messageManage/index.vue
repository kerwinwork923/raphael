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
        <div class="table-list">
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

/* ---------- 型別定義 ---------- */
interface Message {
  id: number;
  content: string;
  videoTitle: string;
  sender: string;
  status: "replied" | "unreplied";
  date: string;
}

interface VideoOption {
  label: string;
  value: string;
}

/* ---------- 響應式資料 ---------- */
const messages = ref<Message[]>([]);
const searchKeyword = ref("");
const selectedVideo = ref("");
const dateRange = ref<Date[] | null>(null);
const currentPage = ref(1);
const pageSize = ref(10);

/* ---------- 影片選項（假資料，之後可從 API 取得） ---------- */
const videoOptions = ref<VideoOption[]>([
  { label: "拉菲爾人本診所案例分享", value: "video1" },
  { label: "健康講座系列", value: "video2" },
  { label: "治療案例", value: "video3" },
]);

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

  // 影片篩選
  if (selectedVideo.value) {
    result = result.filter((msg: Message) => msg.videoTitle === selectedVideo.value);
  }

  // 日期篩選
  if (dateRange.value && dateRange.value.length >= 2) {
    const [from, to] = dateRange.value;
    const start = from.getTime();
    const end = to.getTime();
    result = result.filter((msg: Message) => {
      const msgDate = new Date(msg.date).getTime();
      return msgDate >= start && msgDate <= end;
    });
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

// 刪除訊息
const handleDelete = (id: number) => {
  if (confirm("確定要刪除此留言嗎？")) {
    messages.value = messages.value.filter((msg) => msg.id !== id);
  }
};

// 查看訊息
const handleView = (id: number) => {
  router.push(`/raphaelBackend/messageManage/${id}`);
};

/* ---------- 假資料 ---------- */
const mockMessages = [
  {
    id: 1,
    content: "留言文案留言文案留言文案留言...",
    videoTitle: "拉菲爾人本診所案例分...",
    sender: "成女士",
    status: "replied",
    date: "2024/12/01",
    // 詳細資料
    fullContent: "留言文案留言文案留言文案留言文案留言文案留言文案留言文案留言文案留言文案留言文案留言文案留言文案留言文案留言文案留言文案",
    videoId: 1,
    videoFullTitle: "拉菲爾人本診所案例分享:【全身都是病?超過20年的失調人生,短短一個月 症狀大幅...",
    videoThumbnail: "/assets/imgs/backend/video-placeholder.jpg",
    descriptionPoints: [
      "耳鳴、失眠、頭暈、胃不適...身體狀況越來越差?",
      "長達20年的身心折磨,還有救嗎?",
    ],
    description: "長年飽受自律神經失調影響,嘗試過各種治療仍無改善,直到選擇自律神經調節療法,短短一個月內症狀明顯減輕,重新找回健康與希望!",
    videoLink: "https://example.com/video/123",
    commentDate: "2025/10/10",
    commentTime: "10:00",
  },
  {
    id: 2,
    content: "留言文案留言文案留言文案留言...",
    videoTitle: "拉菲爾人本診所案例分...",
    sender: "成女士",
    status: "unreplied",
    date: "2024/12/02",
    fullContent: "這是第二則留言的完整內容，包含更多詳細資訊...",
    videoId: 1,
    videoFullTitle: "拉菲爾人本診所案例分享:【全身都是病?超過20年的失調人生,短短一個月 症狀大幅...",
    videoThumbnail: "/assets/imgs/backend/video-placeholder.jpg",
    descriptionPoints: [
      "耳鳴、失眠、頭暈、胃不適...身體狀況越來越差?",
      "長達20年的身心折磨,還有救嗎?",
    ],
    description: "長年飽受自律神經失調影響,嘗試過各種治療仍無改善,直到選擇自律神經調節療法,短短一個月內症狀明顯減輕,重新找回健康與希望!",
    videoLink: "https://example.com/video/123",
    commentDate: "2025/10/11",
    commentTime: "14:30",
  },
  {
    id: 3,
    content: "留言文案留言文案留言文案留言...",
    videoTitle: "拉菲爾人本診所案例分...",
    sender: "成女士",
    status: "unreplied",
    date: "2024/12/03",
    fullContent: "這是第三則留言的完整內容...",
    videoId: 1,
    videoFullTitle: "拉菲爾人本診所案例分享:【全身都是病?超過20年的失調人生,短短一個月 症狀大幅...",
    videoThumbnail: "/assets/imgs/backend/video-placeholder.jpg",
    descriptionPoints: [
      "耳鳴、失眠、頭暈、胃不適...身體狀況越來越差?",
      "長達20年的身心折磨,還有救嗎?",
    ],
    description: "長年飽受自律神經失調影響,嘗試過各種治療仍無改善,直到選擇自律神經調節療法,短短一個月內症狀明顯減輕,重新找回健康與希望!",
    videoLink: "https://example.com/video/123",
    commentDate: "2025/10/12",
    commentTime: "09:15",
  },
];

/* ---------- 生命週期 ---------- */
onMounted(() => {
  // 假資料（之後可改為 API 呼叫）
  messages.value = mockMessages.map((msg) => ({
    id: msg.id,
    content: msg.content,
    videoTitle: msg.videoTitle,
    sender: msg.sender,
    status: msg.status as "replied" | "unreplied",
    date: msg.date,
  }));
  
  // 將完整假資料存到 localStorage，供詳細頁使用
  localStorage.setItem("mockMessages", JSON.stringify(mockMessages));
});

// 監聽篩選條件變化，重置分頁
watch([searchKeyword, selectedVideo, dateRange], () => {
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
            background: $chip-success;
            color: #fff;
          }

          &.unreplied {
            background: #ec4f4f;
            color: #fff;
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
