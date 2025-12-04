<template>
  <div class="dashboard">
    <Sidebar />

    <!-- ─────────────── Main Content ─────────────── -->
    <main class="content">
      <!-- page header -->
      <DataUpdateHeader
        title="影音管理"
        :count="store.total"
        count-unit="筆"
        :last-updated="store.lastUpdated"
        @refresh="refreshData"
      />

      <!-- toolbar / filters -->
      <div class="toolbar-section">
        <FilterToolbar
          v-model:search-value="store.keyword"
          :show-date-picker="false"
          :show-product-filter="false"
          :show-status-filter="false"
          search-placeholder="請輸入關鍵字"
          @search="store.setKeyword"
        />
        <button class="btn-add" @click="handleAddNew">
          <span>+ 新增</span>
        </button>
      </div>

      <!-- data table -->
      <section class="video-table">
        <!-- header row -->
        <div class="table-row table-header">
          <!-- 封面照先隱藏 -->
          <div class="cover">封面照</div>
          <div class="title">影片標題</div>
          <div class="recommended">標示為推薦</div>
          <div class="likes">按讚數</div>
          <div class="comments">留言數</div>
          <div class="actions">操作</div>
        </div>

        <!-- data rows -->
        <div class="table-list">
          <div
            v-for="video in paginatedVideos"
            :key="video.id"
            class="table-row"
          >
            <div class="cell cover" data-label="封面照">
              <div class="cover-image">
                <img
                  v-if="video.coverImage"
                  :src="video.coverImage"
                  :alt="video.title"
                />
                <div v-else class="cover-placeholder">
                
                </div>
              </div>
            </div>
            <div class="cell title" data-label="影片標題">
              {{ video.title }}
            </div>
            <div class="cell recommended" data-label="標示為推薦">
              <span
                class="chip"
                :class="{ 'chip--success': video.isRecommended }"
              >
                {{ video.isRecommended ? "是" : "否" }}
              </span>
            </div>
            <div class="cell likes" data-label="按讚數">{{ video.likes }}</div>
            <div class="cell comments" data-label="留言數">
              {{ video.comments }}
            </div>
            <div class="cell actions" data-label="操作">
              <div class="action-buttons">
                <button
                  class="btn-action btn-edit"
                  @click="handleEdit(video)"
                  title="編輯"
                >
                  <img src="/assets/imgs/backend/edit.svg" alt="編輯" />
                </button>
                <label
                  class="toggle"
                  :aria-pressed="video.isPublished ? 'true' : 'false'"
                >
                  <input
                    class="toggle__input"
                    type="checkbox"
                    :checked="video.isPublished"
                    @change="handleTogglePublish(video)"
                    :aria-label="video.isPublished ? '下架' : '上架'"
                  />
                  <span class="toggle__track"></span>
                </label>
           
                <span class="toggle-label">
                  {{ video.isPublished ? "上架" : "下架" }}
                </span>
                <button
                  class="btn-action btn-delete"
                  @click="handleDelete(video)"
                  title="刪除"
                >
                  <img src="/assets/imgs/backend/delete2.svg" alt="刪除" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- pagination -->
        <nav class="pagination">
          <button
            class="btn-page"
            :disabled="store.page === 1"
            @click="store.gotoPage(1)"
          >
            &lt;&lt;
          </button>
          <button
            class="btn-page"
            :disabled="store.page === 1"
            @click="store.prevPage"
          >
            &lt;
          </button>
          <button
            v-for="p in totalPages"
            :key="p"
            class="btn-page btn-page-number"
            :class="{ active: store.page === p }"
            @click="store.gotoPage(p)"
          >
            {{ p }}
          </button>
          <button
            class="btn-page"
            :disabled="store.page === totalPages"
            @click="store.nextPage"
          >
            &gt;
          </button>
          <button
            class="btn-page"
            :disabled="store.page === totalPages"
            @click="store.gotoPage(totalPages)"
          >
            &gt;&gt;
          </button>
        </nav>
      </section>
    </main>

    <!-- ─────────────── Right Detail Panel ─────────────── -->
    <aside v-if="selectedVideo" class="detail-panel">
      <button class="btn-close" @click="closeDetailPanel" title="關閉">
        <img src="/assets/imgs/backend/close.svg" alt="關閉" />
      </button>

      <div class="detail-content">
        <h3 class="detail-title">影片詳情</h3>

        <div class="detail-section">
          <h4 class="section-title">說明</h4>
          <div class="section-content">
            <ul class="description-list">
              <li
                v-for="(item, index) in selectedVideo.description"
                :key="index"
              >
                {{ item }}
              </li>
            </ul>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">影片連結</h4>
          <div class="section-content">
            <a
              :href="selectedVideo.videoLink"
              target="_blank"
              rel="noopener noreferrer"
              class="video-link"
            >
              {{ selectedVideo.videoLink }}
            </a>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">影片標籤</h4>
          <div class="section-content">
            <div class="tags-group">
              <span
                v-for="(tag, index) in selectedVideo.tags"
                :key="index"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>


      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Sidebar from "/components/raphaelBackend/Sidebar.vue";
import FilterToolbar from "/components/raphaelBackend/FilterToolbar.vue";
import DataUpdateHeader from "/components/raphaelBackend/DataUpdateHeader.vue";
import { useSeo } from "~/composables/useSeo";

useSeo({
  title: "",
  description:
    "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
  url: "https://neuroplus.com.tw",
});

const router = useRouter();

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

// 介面定義
interface VideoType {
  VideoType: string;
  Name: string;
}

interface VideoBigType {
  VideoBigType: string;
  Name: string;
}

interface VideoMessage {
  CheckTime: string;
  Message: string;
  BID: string;
  Name: string;
}

interface ApiVideo {
  Status: string;
  VideoTypeList: VideoType[];
  CheckTime: string;
  AdminID: string;
  Desc: string;
  VideoBigTypeList: VideoBigType[];
  VideoMessageSize: string;
  goodCnt: string;
  AID: string;
  VideoURL: string;
  Name: string;
  VideoMessageList: VideoMessage[];
}

interface Video {
  id: string;
  title: string;
  coverImage: string;
  isRecommended: boolean;
  likes: number;
  comments: number;
  isPublished: boolean;
  description: string[];
  videoLink: string;
  tags: string[];
  status: string;
  checkTime: string;
  adminID: string;
  aid: string;
}

// store
const store = reactive({
  total: 0,
  lastUpdated: new Date().toLocaleString("zh-TW"),
  keyword: "",
  page: 1,
  pageSize: 10,
  videos: [] as Video[],
  loading: false,
  setKeyword(value: string) {
    this.keyword = value;
    // 這裡可以加入搜尋邏輯
  },
  gotoPage(page: number) {
    this.page = page;
  },
  prevPage() {
    if (this.page > 1) this.page--;
  },
  nextPage() {
    const total = Math.ceil(this.videos.length / this.pageSize);
    if (this.page < total) this.page++;
  },
});

// 將 API 資料轉換為前端格式
function transformApiData(apiVideos: ApiVideo[]): Video[] {
  return apiVideos.map((video) => ({
    id: video.AID,
    title: video.Name,
    coverImage: (video as any).ImgURL || "",
    isRecommended: (video as any).PromoteVideo === "Y", // 推薦狀態
    likes: parseInt(video.goodCnt) || 0,
    comments: parseInt(video.VideoMessageSize) || 0,
    isPublished: (video as any).OnLineVideo === "Y" || video.Status === "Y", // 上架狀態
    description: video.Desc ? [video.Desc] : [],
    videoLink: video.VideoURL || "",
    tags: [
      ...(video.VideoTypeList?.map((t) => t.Name) || []),
      ...(video.VideoBigTypeList?.map((t) => t.Name) || []),
    ],
    status: video.Status,
    checkTime: video.CheckTime,
    adminID: video.AdminID,
    aid: video.AID,
    promoteVideo: (video as any).PromoteVideo || "N",
    onLineVideo: (video as any).OnLineVideo || "N",
    // 保留原始資料以便更新時使用
    videoTypes: video.VideoTypeList?.map((t) => t.VideoType) || [],
    bigTypes: video.VideoBigTypeList?.map((t) => t.VideoBigType) || [],
    imgURL: (video as any).ImgURL || "",
  }));
}

// 取得影片列表
async function fetchVideoList() {
  store.loading = true;
  try {
    const response = await axios.post(
      "https://23700999.com:8081/HMA/api/bk/getVideoList",
      {
        Token: token.value,
        AdminID: adminID.value,
      }
    );

    if (
      response.data &&
      response.data.Result === "OK" &&
      response.data.VideoList
    ) {
      store.videos = transformApiData(response.data.VideoList);
      store.total = store.videos.length;
      store.lastUpdated = new Date().toLocaleString("zh-TW");
    } else {
      console.error("API 返回錯誤:", response.data);
    }
  } catch (error) {
    console.error("取得影片列表失敗:", error);
  } finally {
    store.loading = false;
  }
}

// 使用 computed 處理分頁邏輯
const paginatedVideos = computed(() => {
  const start = (store.page - 1) * store.pageSize;
  const end = start + store.pageSize;
  return store.videos.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(store.videos.length / store.pageSize);
});

const selectedVideo = ref<any>(null);

onMounted(() => {
  fetchVideoList();
});

function handleAddNew() {
  router.push("/raphaelBackend/videoManage/addVideo");
}

function handleEdit(video: any) {
  router.push(`/raphaelBackend/videoManage/editVideo/${video.aid}`);
}

async function handleTogglePublish(video: any) {
  const newStatus = !video.isPublished;
  
  try {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("backendToken") || sessionStorage.getItem("backendToken")
      : "";
    const adminID = typeof window !== "undefined"
      ? localStorage.getItem("adminID") || sessionStorage.getItem("adminID")
      : "";

    if (!token || !adminID) {
      alert("請先登入");
      return;
    }

    // 需要從 store 中找到完整的影片資料
    const fullVideo = store.videos.find((v: any) => v.aid === video.aid);
    if (!fullVideo) {
      alert("找不到影片資料");
      return;
    }

    // 準備更新資料（只更新上架狀態）
    const requestData: any = {
      AdminID: adminID,
      Token: token,
      AID: video.aid,
      Type: fullVideo.videoTypes || [],
      BigType: fullVideo.bigTypes || [],
      VideoURL: fullVideo.videoLink || "",
      Name: fullVideo.title || "",
      Desc: fullVideo.description?.[0] || "",
      PromoteVideo: fullVideo.promoteVideo || "N",
      OnLineVideo: newStatus ? "Y" : "N",
    };

    const response = await axios.post(
      "https://23700999.com:8081/HMA/api/bk/ModifyVideo",
      requestData
    );

    if (response.data && response.data.Result === "OK") {
      video.isPublished = newStatus;
      video.onLineVideo = newStatus ? "Y" : "N";
    } else {
      alert("更新失敗：" + (response.data?.Message || "未知錯誤"));
    }
  } catch (error: any) {
    console.error("切換上架狀態失敗:", error);
    alert("更新失敗：" + (error.response?.data?.Message || error.message || "未知錯誤"));
  }
}

async function handleDelete(video: any) {
  if (!confirm(`確定要刪除「${video.title}」嗎？`)) {
    return;
  }

  try {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("backendToken") || sessionStorage.getItem("backendToken")
      : "";
    const adminID = typeof window !== "undefined"
      ? localStorage.getItem("adminID") || sessionStorage.getItem("adminID")
      : "";

    if (!token || !adminID) {
      alert("請先登入");
      return;
    }

    const response = await axios.post(
      "https://23700999.com:8081/HMA/api/bk/DeleteVideo",
      {
        AdminID: adminID,
        Token: token,
        AID: video.aid,
      }
    );

    if (response.data && response.data.Result === "OK") {
      alert("刪除成功！");
      // 重新載入列表
      await fetchVideoList();
    } else {
      alert("刪除失敗：" + (response.data?.Message || "未知錯誤"));
    }
  } catch (error: any) {
    console.error("刪除影片失敗:", error);
    alert("刪除失敗：" + (error.response?.data?.Message || error.message || "未知錯誤"));
  }
}

function closeDetailPanel() {
  selectedVideo.value = null;
}

function refreshData() {
  fetchVideoList();
}
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  height: 100vh;
  background: $primary-100;
}

/* ─────────────── Main Content ─────────────── */
.content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  padding: 1rem;
  overflow-y: auto;

  @include respond-to("xl") {
    padding: 16px 16px;
  }
}

.toolbar-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @include respond-to("md") {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-add {
    border-radius: 6px;
    background: $primary-200;
    color: $raphael-white;
    border: none;
    padding: 8px 16px;
    font-size: 1rem;
    font-weight: 400;
    letter-spacing: 2.7px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;

    &:hover {
      background-color: $primary-300;
    }

    @include respond-to("md") {
      width: 100%;
    }
  }
}

.video-table {
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 1px solid $border;
  border-radius: 20px;
  overflow: hidden;
  background: $raphael-white;
  box-shadow: 0px 2px 20px 0px
    var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));

  .table-list {
    display: grid;
    grid-template-rows: repeat(auto-fill, minmax(min-content, 91px));
    flex: 1;
    height: 0;
    overflow: hidden;
    overflow-y: scroll;
    @include scrollbarStyle();
  }

  .table-row {
    display: grid;
    grid-template-columns:1fr 4.5fr 1fr 1fr 1fr 1.5fr ;
    position: relative;
    gap: 2px;
    align-items: center;
    padding: 13px 16px;
    color: $raphael-gray-500;
    transition: all ease 0.2s;

    &:hover {
      color: $chip-success;
    }

    @include respond-to("lg") {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 16px;
      gap: 0.75rem;
      border-bottom: 1px solid $border;
      position: relative;
    }

    & + .table-row {
      border-top: 1px solid $border;
    }

    &.table-header {
      color: var(--Primary-600, #2d3047);
      font-size: 20px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
      @include respond-to("lg") {
        display: none;
      }
    }

    .cell {
      width: auto;
      font-size: 1rem;
      font-style: normal;
      font-weight: 400;
      line-height: 100%;
      letter-spacing: var(--Title-Medium-Tracking, 0.15px);

      @include respond-to("lg") {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        gap: 0.25rem;
        width: 100%;
        text-align: left;
        font-weight: 600;
        font-size: 1.5rem;
        color: #2d3047;

        &::before {
          content: attr(data-label);
          font-size: 1rem;
          font-weight: normal;
          color: $raphael-gray-500;
        }
      }

      &.cover {
        .cover-image {
          width: 120px;
          height: 80px;
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f7fa;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .cover-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;

            img {
              width: 32px;
              height: 32px;
              opacity: 0.5;
            }
          }
        }
      }

      &.title {
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-word;
      }

      &.recommended {
        .chip {
          color: var(--Neutral-500, #666);
          font-size: 20px;
          font-style: normal;
          font-weight: 400;
          line-height: 100%; /* 20px */
          letter-spacing: var(--Title-Medium-Tracking, 0.15px);
        }
      }

      &.actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          // 允許換行，避免水平太擠時整列撐爆
          flex-wrap: wrap;

          @include respond-to("lg") {
            width: 100%;
            justify-content: flex-start;
          }

          .btn-action {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;

            img {
              width: 20px;
              height: 20px;
            }

            &:hover {
              opacity: 0.7;
            }
          }

          .toggle {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 26px;
            padding: 2px;
            border-radius: 9999px;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            // ❗ 重要：不要被 flex 擠壓，避免 toggle__track 變形
            flex-shrink: 0;

            .toggle__input {
              position: absolute;
              inset: 0;
              width: 100%;
              height: 100%;
              margin: 0;
              opacity: 0;
              cursor: pointer;
            }

            .toggle__track {
              position: absolute;
              inset: 0;
              border-radius: 9999px;
              background: #ccc;
              box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.12),
                0 1px 0 rgba(255, 255, 255, 0.6);
              transition: background-color 0.25s ease;
              // 確保尺寸穩定
              box-sizing: border-box;

              &::after {
                content: "";
                position: absolute;
                top: 50%;
                left: 4px;
                width: 22px;
                height: 22px;
                transform: translate(0, -50%);
                border-radius: 50%;
                background: #fff;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2),
                  0 0 0 1px rgba(0, 0, 0, 0.04);
                transition: transform 0.25s ease;
              }
            }

            .toggle__input:checked + .toggle__track {
              background: #2d3047;

              &::after {
                transform: translate(22px, -50%);
              }
            }
          }

          .toggle-label {
            font-size: 0.875rem;
            color: $raphael-gray-500;
            white-space: nowrap;

            @include respond-to("lg") {
              display: none;
            }
          }
        }
      }

    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-top: 12px;
    margin-bottom: 24px;
    padding: 0 16px;

    .btn-page {
      padding: 6px 10px;
      min-width: 32px;
      border-radius: 4px;
      background-color: transparent;
      cursor: pointer;
      border: none;
      color: $raphael-gray-500;

      &.active {
        background: $chip-success;
        color: white;
        border-color: $chip-success;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .btn-page-number {
      background: white;
    }
  }
}

/* ─────────────── Right Detail Panel ─────────────── */
.detail-panel {
  width: 400px;
  background: $raphael-white;
  border-left: 1px solid $border;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);

  @include respond-to("lg") {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    z-index: 100;
    transform: translateX(100%);
    transition: transform 0.3s ease;

    &.open {
      transform: translateX(0);
    }
  }

  .btn-close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    z-index: 10;

    img {
      width: 24px;
      height: 24px;
    }

    &:hover {
      opacity: 0.7;
    }
  }

  .detail-content {
    padding: 24px;
    overflow-y: auto;
    flex: 1;

    .detail-title {
      font-size: 24px;
      font-weight: 700;
      color: $primary-600;
      margin-bottom: 24px;
    }

    .detail-section {
      margin-bottom: 24px;

      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: $primary-600;
        margin-bottom: 12px;
      }

      .section-content {
        .description-list {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            padding: 8px 0;
            color: $raphael-gray-500;
            font-size: 1rem;
            line-height: 1.6;

            &::before {
              content: "★";
              margin-right: 8px;
              color: $primary-200;
            }
          }
        }

        .video-link {
          color: $primary-200;
          text-decoration: none;
          word-break: break-all;
          font-size: 1rem;

          &:hover {
            text-decoration: underline;
          }
        }

        .tags-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .tag {
            padding: 6px 12px;
            border-radius: 4px;
            border: 1px solid $primary-200;
            background: rgba($primary-200, 0.1);
            color: $primary-200;
            font-size: 0.875rem;
            white-space: nowrap;
          }
        }
      }
    }
  }
}
</style>
