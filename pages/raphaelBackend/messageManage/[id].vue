<template>
  <div class="messageDetail">
    <Sidebar />

    <!-- ─────────────── Main Content ─────────────── -->
    <main class="content">
      <!-- page header -->
      <header class="page-header">
        <h2 class="title">
          {{ messageDetail?.videoTitle || "載入中..." }}
        </h2>
        <div class="action-buttons">
          <button class="btn back-btn" @click="goBack">
            <img src="/assets/imgs/backend/back.svg" alt="返回" />
            返回
          </button>
          <button class="btn delete-btn" @click="handleDelete">
            <img src="/assets/imgs/backend/deleteWhite.svg" alt="刪除" />
            刪除
          </button>
        </div>
      </header>

      <!-- 影片資訊區塊 -->
      <section class="video-info-section">
        <h3 class="section-title">影片資訊</h3>
        <div class="video-info-content">
          <!-- 影片縮圖 -->
          <div class="video-thumbnail">
            <img
              src="/assets/imgs/banner-2.png"
              alt="影片縮圖"
            />
          </div>

          <!-- 影片說明 -->
          <div class="video-description">
            <h4>影片說明</h4>
            <ul class="description-list">
              <li
                v-for="(point, index) in messageDetail?.descriptionPoints"
                :key="index"
              >
                {{ point }}
              </li>
            </ul>
            <p class="description-text">
              {{ messageDetail?.description || "" }}
            </p>

            <!-- 影片連結 -->
            <a
              class="video-link"
              :href="messageDetail?.videoLink"
              target="_blank"
            >
              <h4>
                影片連結
                <img src="/assets/imgs/backend/linkGray.svg" alt="連結" />
                
              </h4>
              <div
                v-if="messageDetail?.videoLink"
                :href="messageDetail.videoLink"
                target="_blank"
                class="link-text"
              ></div>
              <span v-else class="link-text">尚無連結</span>
            </a>
          </div>
        </div>
      </section>

      <!-- 留言區塊 -->
      <section class="comment-section">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <div class="comment-user">
              <img
                src="/assets/imgs/backend/user.svg"
                alt="使用者"
                class="user-icon"
              />
              <div class="user-info">
                <span class="user-name">{{ comment.sender }}</span>
                <span class="comment-time"
                  >留言時間 {{ comment.date }} {{ comment.time }}</span
                >
              </div>
            </div>
            <button
              class="status-tag"
              :class="comment.status === 'replied' ? 'replied' : 'unreplied'"
            >
              {{ comment.status === "replied" ? "已回覆" : "未回覆" }}
              <img
                v-if="comment.status === 'unreplied'"
                src="/assets/imgs/backend/close.svg"
                alt="關閉"
                class="close-icon"
              />
            </button>
          </div>
          <div class="comment-content">
            {{ comment.content }}
          </div>
        </div>

        <!-- 無留言提示 -->
        <div v-if="comments.length === 0" class="no-comment">
          <p>尚未有人留言</p>
        </div>
      </section>

      <!-- 管理員回覆區塊 -->
      <section class="admin-reply-section">
        <h3 class="section-title">管理員回覆</h3>
        <div class="reply-editor">
          <textarea
            v-model="replyContent"
            placeholder="請使用文字編輯器"
            class="reply-textarea"
          ></textarea>
          <div class="reply-actions">
            <button class="btn submit-btn" @click="handleSubmitReply">
              回覆
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import Sidebar from "@/components/raphaelBackend/Sidebar.vue";
import { useSeo } from "~/composables/useSeo";

useSeo({
  title: "",
  description:
    "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
  url: "https://neuroplus.com.tw",
});

const router = useRouter();
const route = useRoute();

/* ---------- 型別定義 ---------- */
interface MessageDetail {
  id: number;
  videoTitle: string;
  videoThumbnail?: string;
  descriptionPoints?: string[];
  description?: string;
  videoLink?: string;
}

interface Comment {
  id: number;
  sender: string;
  date: string;
  time: string;
  content: string;
  status: "replied" | "unreplied";
}

/* ---------- 響應式資料 ---------- */
const messageDetail = ref<MessageDetail | null>(null);
const comments = ref<Comment[]>([]);
const replyContent = ref("");

/* ---------- 方法 ---------- */
// 返回列表頁
const goBack = () => {
  router.push("/raphaelBackend/messageManage");
};

// 刪除留言
const handleDelete = () => {
  if (confirm("確定要刪除此留言嗎？")) {
    // TODO: 呼叫 API 刪除
    goBack();
  }
};

// 回覆留言
const handleReply = () => {
  // 滾動到回覆區塊
  const replySection = document.querySelector(".admin-reply-section");
  if (replySection) {
    replySection.scrollIntoView({ behavior: "smooth", block: "start" });
    const textarea = document.querySelector(
      ".reply-textarea"
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
    }
  }
};

// 送出回覆
const handleSubmitReply = () => {
  if (!replyContent.value.trim()) {
    alert("請輸入回覆內容");
    return;
  }

  // TODO: 呼叫 API 送出回覆
  alert("回覆已送出");
  replyContent.value = "";

  // 重新載入留言資料
  fetchMessageDetail();
};

// 取得留言詳細資料
const fetchMessageDetail = async () => {
  const messageId = Number(route.params.id);

  // TODO: 呼叫 API 取得資料
  // 目前從 localStorage 取得假資料
  const mockMessagesStr = localStorage.getItem("mockMessages");
  if (mockMessagesStr) {
    const mockMessages: any[] = JSON.parse(mockMessagesStr);
    const message = mockMessages.find((msg: any) => msg.id === messageId);

    if (message) {
      // 設定影片資訊
      messageDetail.value = {
        id: message.id,
        videoTitle: message.videoFullTitle || message.videoTitle,
        videoThumbnail: message.videoThumbnail,
        descriptionPoints: message.descriptionPoints,
        description: message.description,
        videoLink: message.videoLink,
      };

      // 設定留言資料
      comments.value = [
        {
          id: message.id,
          sender: message.sender,
          date: message.commentDate || message.date,
          time: message.commentTime || "",
          content: message.fullContent || message.content,
          status: message.status,
        },
      ];
    } else {
      // 如果找不到對應的留言，顯示預設資料
      messageDetail.value = {
        id: messageId,
        videoTitle: "載入中...",
        videoThumbnail: "/assets/imgs/backend/video-placeholder.jpg",
        descriptionPoints: [],
        description: "",
        videoLink: "",
      };
      comments.value = [];
    }
  } else {
    // 如果 localStorage 沒有資料，顯示預設資料
    messageDetail.value = {
      id: messageId,
      videoTitle: "載入中...",
      videoThumbnail: "/assets/imgs/backend/video-placeholder.jpg",
      descriptionPoints: [],
      description: "",
      videoLink: "",
    };
    comments.value = [];
  }
};

/* ---------- 生命週期 ---------- */
onMounted(() => {
  fetchMessageDetail();
});
</script>

<style scoped lang="scss">
.messageDetail {
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;

      .title {
        color: $primary-600;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 0.09px;
        flex: 1;
        min-width: 0;
        word-break: break-word;

        @include respond-to("md") {
          font-size: 20px;
          width: 100%;
        }
      }

      .action-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;

        @include respond-to("md") {
          width: 100%;
          justify-content: flex-start;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;

          img {
            width: 16px;
            height: 16px;
          }

          &.back-btn {
            background: $primary-200;
            color: #fff;

            &:hover {
              background: $primary-300;
            }
          }

          &.delete-btn {
            background: #ec4f4f;
            color: #fff;

            &:hover {
              background: #d43d3d;
            }
          }

          &.reply-btn {
            background: $chip-success;
            color: #fff;

            &:hover {
              background: #0d8a82;
            }
          }
        }
      }
    }

    /* ─────────── 影片資訊區塊 ─────────── */
    .video-info-section {
      background: #fff;
      border-radius: 20px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);

      .section-title {
        color: $primary-600;
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 1rem;
      }

      .video-info-content {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 1.5rem;

        @include respond-to("md") {
          grid-template-columns: 1fr;
        }

        .video-thumbnail {
          img {
            width: 100%;
            border-radius: 12px;
            object-fit: cover;
          }
        }

        .video-description {
          h4 {
            color: $primary-600;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 0.75rem;
          }

          .description-list {
            list-style: none;
            padding: 0;
            margin: 0 0 1rem 0;

            li {
              color: #666;
              font-size: 14px;
              line-height: 1.6;
              margin-bottom: 0.5rem;
              padding-left: 1rem;
              position: relative;

              &::before {
                content: "•";
                position: absolute;
                left: 0;
                color: $chip-success;
              }
            }
          }

          .description-text {
            color: #666;
            font-size: 14px;
            line-height: 1.8;
            margin: 0;
          }
        }

        .video-link {
        
          margin-top: 1rem;
          padding-top: 1rem;
       

          h4 {
            display: flex;
            align-items: center;

            color: $primary-600;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 0.5rem;
            border-radius: 6px;
            background: var(--Neutral-200, #eee);
            display: inline-block;
            padding: 8px;

            color: var(--Neutral-500, #666);
            font-size: var(--Text-font-size-18, 18px);
            font-style: normal;
            font-weight: 400;
            letter-spacing: 2.7px;

            margin-top: 1rem;
            img {
              width: 18px;
              height: 18px;
              transform: translateY(2px);
            }
          }

          .link-text {
            color: $chip-success;
            font-size: 14px;
            text-decoration: none;
            word-break: break-all;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }

    /* ─────────── 留言區塊 ─────────── */
    .comment-section {
      background: #fff;
      border-radius: 20px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);

      .comment-item {
        padding: 1rem 0;
        border-bottom: 1px solid #e5e9f2;

        &:last-child {
          border-bottom: none;
        }

        .comment-header {
          display: flex;
 
          align-items: center;
          margin-bottom: 1rem;
          gap: 1rem;

          .comment-user {
            display: flex;
            align-items: center;
            gap: 0.75rem;

            .user-icon {
              width: 40px;
              height: 40px;
              border-radius: 50%;
            }

            .user-info {
              display: flex;
              flex-direction: column;
              gap: 4px;

              .user-name {
                color: $primary-600;
                font-size: 16px;
                font-weight: 600;
              }

              .comment-time {
                color: #999;
                font-size: 12px;
              }
            }
          }

          .status-tag {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 12px;
            border: none;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 500;
            cursor: default;

            &.replied {
              background: $chip-success;
              color: #fff;
            }

            &.unreplied {
              background: #ec4f4f;
              color: #fff;

              .close-icon {
                width: 12px;
                height: 12px;
              }
            }
          }
        }

        .comment-content {
          color: #666;
          font-size: 14px;
          line-height: 1.8;
          white-space: pre-wrap;
          word-break: break-word;
        }
      }

      .no-comment {
        text-align: center;
        padding: 3rem 0;
        color: $raphael-gray-500;
      }
    }

    /* ─────────── 管理員回覆區塊 ─────────── */
    .admin-reply-section {
      background: #fff;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);

      .section-title {
        color: $primary-600;
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 1rem;
      }

      .reply-editor {
        .reply-textarea {
          width: 100%;
          min-height: 200px;
          padding: 1rem;
          border: 1px solid #e5e9f2;
          border-radius: 12px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          transition: all 0.2s;

          &:focus {
            outline: none;
            border-color: $chip-success;
            box-shadow: 0 0 0 3px rgba(27, 163, 155, 0.1);
          }

          &::placeholder {
            color: #999;
          }
        }

        .reply-actions {
          margin-top: 1rem;
          display: flex;
          justify-content: flex-end;

          .submit-btn {
            padding: 9px 12px;
            background: var(--Secondary-default, #74BC1F);
            color: #fff;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            letter-spacing: 2.7px;
            &:hover {
              background: var(--Secondary-hover, #65A31B);
            }
          }
        }
      }
    }
  }
}
</style>
