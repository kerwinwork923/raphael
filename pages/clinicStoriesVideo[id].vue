<template>
  <div class="videoDetailWrap">
    <div class="videoDetailContainer">
      <div class="titleMenuWrap">
        <TitleMenu link="/clinicStories" />
      </div>
      <!-- 影片播放器 -->
      <div
        class="videoPlayer"
        :class="{ 'controls-hidden': !controlsVisible }"
        @mousemove="onVideoPlayerMouseMove"
        @mouseleave="onVideoPlayerMouseLeave"
        @touchstart="onVideoPlayerMouseMove"
      >
        <div class="videoContainer">
          <iframe
            ref="videoIframe"
            :src="youtubeEmbedUrl"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            @load="onVideoLoad"
          ></iframe>
        </div>

        <!-- 影片控制器 -->
        <div
          class="videoControls"
          v-if="showControls"
          @mouseenter="onControlsMouseEnter"
          @mouseleave="onControlsMouseLeave"
        >
          <div class="controlButton" @click="togglePlayPause">
            <img :src="isPlaying ? pauseIcon : playIcon" alt="播放/暫停" />
          </div>
          <div
            class="progressBar"
            ref="progressBarEl"
            @mousedown="onScrubStart"
            @touchstart.prevent="onScrubStart"
          >
            <div
              class="progress"
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>

          <div class="timeDisplay">
            <span>{{ formatTime(currentTime) }}</span>
            <span>/</span>
            <span>{{ formatTime(duration) }}</span>
          </div>

          <!-- 全螢幕按鈕 -->
          <div
            class="controlButton"
            :class="{ disabled: useNativeYTControls }"
            @click="toggleFullscreen"
          >
            <img src="/assets/imgs/clinicStories/maximize.png" alt="全螢幕" />
          </div>
        </div>
      </div>

      <!-- 影片資訊 -->
      <div class="videoInfo">
        <h1 class="videoTitle">{{ videoData.fullTitle }}</h1>

        <!-- 說明區塊 -->
        <div class="descriptionSection">
          <div class="logoImg">
            <img src="/assets/imgs/clinicStories/raphael.svg" alt="Raphael" />
          </div>
          <div class="descriptionHeader">
            <p class="ellipsis-3">
              {{ videoData.description || videoData.subtitle || "" }}
            </p>
            <h6
              v-if="
                !showDescription &&
                (videoData.description || videoData.subtitle)
              "
              @click="toggleDescription"
            >
              顯示完整內容
            </h6>

            <div class="actionButtons">
              <div
                class="statItem"
                :class="{ liked: videoData.isLiked }"
                @click.stop="toggleLike(videoData)"
              >
                <img
                  v-if="videoData.isLiked"
                  src="../assets/imgs/clinicStories/goodClick.svg"
                  alt="讚"
                />
                <img
                  v-else
                  src="../assets/imgs/clinicStories/good.svg"
                  alt="讚"
                />
                <span>{{ videoData.likes }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 留言區 -->
      <div class="commentsHeader">
        <span class="commentsTitle">留言 {{ videoData.comments }}</span>
        <span
          v-if="hasMoreComments"
          class="viewMoreButton"
          @click="openCommentsModal"
        >
          查看更多 >
        </span>
      </div>
      <div class="commentsSection">
        <!-- 留言列表 -->
        <div class="commentsList">
          <div v-if="displayedComments.length === 0" class="noComments">
            尚無留言
          </div>
          <div
            v-for="(comment, index) in displayedComments"
            :key="comment.id || index"
            class="commentItem"
          >
            <div class="commentAvatar">
              <!-- 頭像占位 -->
            </div>
            <div class="commentContent">
              <div class="commentHeader">
                <span class="commentName">{{ comment.name }}</span>
                <span class="commentTime">{{ comment.time }}</span>
              </div>
              <div class="commentText">
                <p
                  v-if="!comment.showFull && comment.text.length > 50"
                  class="commentTextShort"
                >
                  {{ comment.text.substring(0, 50) }}...
                  <span class="showMoreText" @click="showFullComment(index)">
                    顯示完整內容
                  </span>
                </p>
                <p v-else class="commentTextFull">{{ comment.text }}</p>
              </div>
            </div>
            <div
              v-if="comment.isOwnComment"
              class="commentMore"
              @click.stop="openCommentMenu(index)"
            >
              <span>⋮</span>
            </div>
          </div>
        </div>

        <!-- 留言輸入區 -->
        <div class="commentsInputArea">
          <input
            v-model="newComment"
            type="text"
            placeholder="請留下您的感想"
            class="commentInput"
            @keyup.enter="submitComment"
          />
          <button class="sendCommentButton" @click="submitComment">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 2L11 13"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 說明彈出動畫 -->
      <div
        class="descriptionModal"
        v-if="showDescriptionModal"
        @click="closeDescriptionModal"
        :class="{ fullscreen: isFullscreen }"
      >
        <div
          class="modalContent"
          @click.stop
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          :style="{ transform: `translateY(${modalTransform}px)` }"
        >
          <div class="modalHeader">
            <h3>說明</h3>
            <button class="closeButton" @click="closeDescriptionModal">
              ×
            </button>
          </div>
          <div class="modalBody">
            <div class="descriptionText">
              <div
                v-if="videoData.videoTypes && videoData.videoTypes.length > 0"
                class="tagsContainer"
              >
                <span
                  v-for="(videoType, index) in videoData.videoTypes"
                  :key="index"
                  class="tagItem"
                >
                  #{{ videoType.Name }}
                </span>
              </div>
              <p
                v-if="videoData.description || videoData.subtitle"
                class="descriptionParagraph"
              >
                {{ videoData.description || videoData.subtitle }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 留言模態視窗 -->
      <div
        class="commentsModal"
        v-if="showCommentsModal"
        @click="closeCommentsModal"
      >
        <div
          class="commentsModalContent"
          @click.stop
          @touchstart="onCommentsTouchStart"
          @touchmove="onCommentsTouchMove"
          @touchend="onCommentsTouchEnd"
          :style="{ transform: `translateY(${commentsModalTransform}px)` }"
        >
          <!-- 模態視窗頂部拖曳條 -->
          <div class="modalDragBar"></div>

          <!-- 留言標題欄 -->
          <div class="commentsHeader">
            <div class="commentsTitle">
              <span>留言 {{ videoData.comments }}</span>
            </div>
            <button class="closeCommentsButton" @click="closeCommentsModal">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <!-- 留言列表 -->
          <div class="commentsList" ref="commentsListRef">
            <div
              v-for="(comment, index) in fullCommentsList"
              :key="index"
              class="commentItem"
            >
              <div class="commentAvatar">
                <!-- <img src="/assets/imgs/clinicStories/user-avatar.svg" alt="頭像" /> -->
              </div>
              <div class="commentContent">
                <div class="commentHeader">
                  <span class="commentName">{{ comment.name }}</span>
                  <span class="commentTime">{{ comment.time }}</span>
                </div>
                <div class="commentText">
                  <p
                    v-if="!comment.showFull && comment.text.length > 50"
                    class="commentTextShort"
                  >
                    {{ comment.text.substring(0, 50) }}...
                    <span
                      class="showMoreText"
                      @click="showFullCommentInModal(index)"
                    >
                      顯示完整內容
                    </span>
                  </p>
                  <p v-else class="commentTextFull">{{ comment.text }}</p>
                </div>
              </div>
              <div
                v-if="comment.isOwnComment"
                class="commentMore"
                @click.stop="openCommentMenuInModal(index)"
              >
                <span>⋮</span>
              </div>
            </div>

            <!-- 查看更多按鈕 -->
            <!-- <div v-if="hasMoreComments" class="viewMoreComments" @click="loadMoreComments">
              查看更多 >
            </div> -->
          </div>

          <!-- 留言輸入區 -->
          <div class="commentsInputArea">
            <input
              v-model="newComment"
              type="text"
              placeholder="請留下您的感想"
              class="commentInput"
              @keyup.enter="submitComment"
            />
            <button class="sendCommentButton" @click="submitComment">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 2L11 13"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 留言操作選單彈窗 -->
    <div
      class="commentMenuModal"
      v-if="showCommentMenu"
      @click="closeCommentMenu"
    >
      <div class="commentMenuContent" @click.stop>
        <div class="commentMenuHeader">
          <span class="commentMenuTitle">留言</span>
          <button class="commentMenuClose" @click="closeCommentMenu">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
        <div class="commentMenuOptions">
          <div class="commentMenuOption" @click="editComment">
            <img src="/assets/imgs/backend/edit.svg" alt="編輯" />
            <span>編輯</span>
          </div>
          <div class="commentMenuOption" @click="deleteComment">
            <img src="/assets/imgs/backend/delete.svg" alt="刪除" />
            <span>刪除</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 編輯留言輸入框 -->
    <div
      class="editCommentModal"
      v-if="showEditComment"
      @click="closeEditComment"
    >
      <div class="editCommentContent" @click.stop>
        <div class="modalDragBar"></div>
        <div class="editCommentHeader">
          <span class="editCommentTitle">留言</span>
          <button class="editCommentClose" @click="closeEditComment">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
        <div class="editCommentBody">
          <textarea
            v-model="editingCommentText"
            class="editCommentInput"
            placeholder="請留下您的感想"
            rows="6"
          ></textarea>
        </div>
        <div class="editCommentSendArea">
          <button class="editCommentSendButton" @click="saveEditedComment">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 2L11 13"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 刪除確認 Alert -->
    <Teleport to="body">
      <Alert
        v-if="showDeleteAlert"
        :default-content="'確定要刪除嗎？'"
        :show-click-button="true"
        click-button-text="確定"
        close-button-text="取消"
        @click="confirmDeleteComment"
        @close="showDeleteAlert = false"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import playIcon from "@/assets/imgs/clinicStories/playButton.png";
import pauseIcon from "@/assets/imgs/clinicStories/pause.png";
import Alert from "~/components/Alert.vue";
const route = useRoute();
const router = useRouter();

// 影片資料庫（從 API 獲取）
const videoDatabase = ref({});

// 當前影片資料
const videoData = ref({
  id: null,
  thumbnail: "",
  fullTitle: "",
  subtitle: "",
  description: "",
  likes: 0,
  comments: 0,
  youtubeUrl: "",
  videoTypes: [],
  checkTime: "",
  adminId: "",
  isLiked: false,
});

// 從 YouTube URL 提取 video ID
const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
};

// 從 YouTube URL 生成縮圖 URL
const getYouTubeThumbnail = (url) => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return "";
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

// 格式化時間為相對時間
const formatRelativeTime = (checkTime) => {
  if (!checkTime) return "剛剛";

  try {
    // 將 "2025/11/10 12:00" 格式轉換為 Date
    const timeStr = checkTime.replace(/\//g, "-");
    const commentDate = new Date(timeStr);
    const now = new Date();
    const diffMs = now - commentDate;

    // 計算時間差
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return "剛剛";
    } else if (diffMins < 60) {
      return `${diffMins}分鐘前`;
    } else if (diffHours < 24) {
      return `${diffHours}小時前`;
    } else if (diffDays < 7) {
      return `${diffDays}天以前`;
    } else {
      // 超過7天顯示日期
      const month = commentDate.getMonth() + 1;
      const day = commentDate.getDate();
      return `${month}/${day}`;
    }
  } catch (error) {
    console.error("時間格式化失敗:", error);
    return "剛剛";
  }
};

// 轉換留言資料格式
const transformCommentsData = (videoMessageList) => {
  if (!videoMessageList || !Array.isArray(videoMessageList)) {
    return [];
  }

  // 獲取當前用戶資訊
  const userDataLocal =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userData") || "{}")
      : {};
  const currentUserName =
    userDataLocal.Name || userDataLocal.Member?.Name || "";

  return videoMessageList.map((msg) => ({
    id: parseInt(msg.BID || "0"),
    name: msg.Name || "使用者",
    time: formatRelativeTime(msg.CheckTime),
    text: msg.Message || "",
    showFull: false,
    isOwnComment: msg.Name === currentUserName, // 判斷是否為自己的留言
  }));
};

// 轉換 API 資料為前端格式
const transformApiData = (apiData) => {
  const db = {};
  apiData.forEach((item) => {
    const videoId = extractYouTubeVideoId(item.VideoURL);
    db[parseInt(item.AID)] = {
      id: parseInt(item.AID),
      thumbnail: item.ImgURL || getYouTubeThumbnail(item.VideoURL),
      fullTitle: item.Name || "",
      subtitle: item.Desc || "",
      description: item.Desc || "",
      likes: parseInt(item.goodCnt || "0"),
      comments: parseInt(item.VideoMessageSize || "0"),
      youtubeUrl: item.VideoURL || "",
      videoTypes: item.VideoTypeList || [],
      checkTime: item.CheckTime || "",
      adminId: item.AdminID || "",
      // isLiked: item.EverGood === "Y", // 根據 API 的 EverGood 欄位判斷是否已按讚
      isLiked: false,
      promoteVideo: item.PromoteVideo || "",
      onLineVideo: item.OnLineVideo || "",
      messageList: transformCommentsData(item.VideoMessageList || []),
    };
  });
  return db;
};

// 狀態管理
const showDescription = ref(false);
const showDescriptionModal = ref(false);
const showControls = ref(true);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const progressPercent = ref(0);
const isVideoFullscreen = ref(false);

// 控制項顯示/隱藏相關
const controlsTimeout = ref(null);
const isMouseOverControls = ref(false);
const controlsVisible = ref(true);

// 滑動手勢相關
const isFullscreen = ref(false);
const modalTransform = ref(0);
const touchStartY = ref(0);
const touchStartTransform = ref(0);
const isDragging = ref(false);

// 留言相關狀態
const showCommentsModal = ref(false);
const commentsList = ref([]);
const commentsModalTransform = ref(0);
const commentsTouchStartY = ref(0);
const commentsTouchStartTransform = ref(0);
const isCommentsDragging = ref(false);
const newComment = ref("");
const hasMoreComments = computed(() => {
  // 只要有留言就顯示"查看更多"按鈕
  return videoData.value.comments > 0;
});
const commentsListRef = ref(null);

// 留言操作相關狀態
const showCommentMenu = ref(false);
const selectedCommentIndex = ref(-1);
const selectedCommentId = ref(null);

const isModalComment = ref(false); // 是否在模態視窗中的留言
const showEditComment = ref(false);
const editingCommentText = ref("");
const showDeleteAlert = ref(false);

// 影片 iframe 引用
const videoIframe = ref(null);

// 設備檢測和全螢幕支援檢測
const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const supportsElementFS = !!(
  document.fullscreenEnabled ||
  document.webkitFullscreenEnabled ||
  document.mozFullScreenEnabled ||
  document.msFullscreenEnabled
);

// iOS 且不支援任意元素全螢幕 → 用原生控制列
const useNativeYTControls = isIOS && !supportsElementFS;

// 計算 YouTube 嵌入 URL
const youtubeEmbedUrl = computed(() => {
  if (!videoData.value.youtubeUrl) {
    return "";
  }
  const videoId = extractYouTubeVideoId(videoData.value.youtubeUrl);
  if (!videoId) {
    return "";
  }
  const origin = window.location.origin;
  const params = new URLSearchParams({
    enablejsapi: "1",
    origin,
    rel: "0",
    modestbranding: "1",
    playsinline: "1", // iOS 仍可行
    // 關鍵：iOS 舊版不支援任意元素全螢幕 → 顯示 YouTube 的原生控制列（含全螢幕）
    controls: useNativeYTControls ? "1" : "0",
    fs: "1",
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
});

// 顯示的留言（主頁面只顯示前3條）
const displayedComments = computed(() => {
  return commentsList.value.slice(0, 3);
});

// 完整留言列表（模態視窗顯示）
const fullCommentsList = computed(() => {
  return commentsList.value;
});

// 切換說明顯示
const toggleDescription = () => {
  showDescription.value = !showDescription.value;
  if (showDescription.value) {
    showDescriptionModal.value = true;
  }
};

// 關閉說明彈窗
const closeDescriptionModal = () => {
  showDescriptionModal.value = false;
  showDescription.value = false;
  isFullscreen.value = false;
  modalTransform.value = 0;
};

// YouTube API 相關
let player = null;
let progressRAF = null;
const isYouTubeReady = ref(false);

// 影片控制器功能
const onVideoLoad = () => {
  // 等待 YouTube API 載入
  if (window.YT && window.YT.Player) {
    initializePlayer();
  } else {
    // 載入 YouTube API
    loadYouTubeAPI();
  }
};

const loadYouTubeAPI = () => {
  if (window.YT) return;

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  window.onYouTubeIframeAPIReady = () => {
    initializePlayer();
  };
};

const initializePlayer = () => {
  if (!videoIframe.value || !videoData.value.youtubeUrl) return;

  const videoId = extractYouTubeVideoId(videoData.value.youtubeUrl);
  if (!videoId) return;

  player = new window.YT.Player(videoIframe.value, {
    videoId,
    playerVars: {
      controls: 0,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      // autoplay: 1, // 同樣建議不要依賴
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
};

const onPlayerReady = () => {
  isYouTubeReady.value = true;
  duration.value = player.getDuration();
  // 不要在這裡啟動 loop，等真的播放時再啟
};

const startProgressLoop = () => {
  cancelProgressLoop();
  const tick = () => {
    if (!player) return;
    currentTime.value = player.getCurrentTime();
    duration.value = player.getDuration() || 0;
    progressPercent.value = duration.value
      ? (currentTime.value / duration.value) * 100
      : 0;
    progressRAF = requestAnimationFrame(tick);
  };
  progressRAF = requestAnimationFrame(tick);
};

const cancelProgressLoop = () => {
  if (progressRAF) {
    cancelAnimationFrame(progressRAF);
    progressRAF = null;
  }
};

const onPlayerStateChange = (event) => {
  const YTPS = window.YT.PlayerState;
  isPlaying.value = event.data === YTPS.PLAYING;
  if (event.data === YTPS.PLAYING) {
    startProgressLoop();
    // 播放時開始控制項自動隱藏計時
    startControlsHideTimer();
  } else if (event.data === YTPS.PAUSED || event.data === YTPS.ENDED) {
    cancelProgressLoop();
    // 暫停或結束時停止計時並顯示控制項
    clearControlsHideTimer();
    showControlsImmediately();
  }
};

const togglePlayPause = () => {
  if (!player || !isYouTubeReady.value) return;

  if (isPlaying.value) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
};

// 控制項顯示/隱藏相關函數
const startControlsHideTimer = () => {
  clearControlsHideTimer();
  controlsTimeout.value = setTimeout(() => {
    if (isPlaying.value && !isMouseOverControls.value) {
      controlsVisible.value = false;
    }
  }, 3000); // 3秒後隱藏控制項
};

const clearControlsHideTimer = () => {
  if (controlsTimeout.value) {
    clearTimeout(controlsTimeout.value);
    controlsTimeout.value = null;
  }
};

const showControlsImmediately = () => {
  clearControlsHideTimer();
  controlsVisible.value = true;
};

const onVideoPlayerMouseMove = () => {
  if (isPlaying.value) {
    showControlsImmediately();
    startControlsHideTimer();
  }
};

const onVideoPlayerMouseLeave = () => {
  if (isPlaying.value) {
    startControlsHideTimer();
  }
};

const onControlsMouseEnter = () => {
  isMouseOverControls.value = true;
  clearControlsHideTimer();
};

const onControlsMouseLeave = () => {
  isMouseOverControls.value = false;
  if (isPlaying.value) {
    startControlsHideTimer();
  }
};

// 全螢幕功能
const toggleFullscreen = async () => {
  // iOS 舊版不支援任意元素全螢幕：交給原生控制列的全螢幕按鈕
  if (useNativeYTControls) return;

  const target = document.querySelector(".videoPlayer .videoContainer");
  if (!target) return;

  // 已在全螢幕 → 退出
  if (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  ) {
    (
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen ||
      document.msExitFullscreen
    )?.call(document);
  } else {
    // 進入全螢幕
    try {
      await (
        target.requestFullscreen ||
        target.webkitRequestFullscreen ||
        target.mozRequestFullScreen ||
        target.msRequestFullscreen
      )?.call(target, { navigationUI: "hide" });

      // 嘗試鎖定橫向（支援的裝置才會成功，不會報錯）
      try {
        await screen.orientation?.lock?.("landscape");
      } catch (e) {
        // 忽略錯誤，某些設備不支援
        console.log("Orientation lock not supported:", e);
      }
    } catch (e) {
      console.log("Fullscreen not supported:", e);
    }
  }
};

// 監聽全螢幕狀態變化
const handleFullscreenChange = () => {
  isVideoFullscreen.value = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
};

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const seekToSeconds = (seconds) => {
  if (!player || !isYouTubeReady.value) return;
  player.seekTo(seconds, true);
};

// 點擊進度條跳轉
const onProgressBarClick = (event) => {
  if (!player || !isYouTubeReady.value || !duration.value) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const percentage = (event.clientX - rect.left) / rect.width;
  const targetTime = Math.max(
    0,
    Math.min(duration.value * percentage, duration.value)
  );
  seekToSeconds(targetTime);
};

// 滑動手勢處理
const onTouchStart = (e) => {
  touchStartY.value = e.touches[0].clientY;
  touchStartTransform.value = modalTransform.value;
  isDragging.value = true;
};

const onTouchMove = (e) => {
  if (!isDragging.value) return;

  const currentY = e.touches[0].clientY;
  const deltaY = currentY - touchStartY.value;
  const newTransform = touchStartTransform.value + deltaY;

  // 限制滑動範圍
  if (newTransform > 0) {
    modalTransform.value = newTransform;
  }

  // 檢查是否接近滿版
  if (newTransform < -200) {
    isFullscreen.value = true;
    // 暫停影片
    if (player && isYouTubeReady.value) {
      player.pauseVideo();
    }
  } else {
    isFullscreen.value = false;
  }
};

const onTouchEnd = () => {
  if (!isDragging.value) return;

  isDragging.value = false;

  // 根據滑動距離決定最終狀態
  if (modalTransform.value < -100) {
    // 滑動到滿版
    modalTransform.value = -window.innerHeight * 0.8;
    isFullscreen.value = true;
  } else if (modalTransform.value > 50) {
    // 滑動關閉
    closeDescriptionModal();
  } else {
    // 恢復原狀
    modalTransform.value = 0;
    isFullscreen.value = false;
  }
};

const progressBarEl = ref(null);
const isScrubbing = ref(false);
const wasPlayingBeforeScrub = ref(false);

const getPercentFromEvent = (e) => {
  const el = progressBarEl.value;
  if (!el || !duration.value) return 0;
  const rect = el.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  return rect.width ? x / rect.width : 0;
};

const onScrubStart = (e) => {
  if (!isYouTubeReady.value || !duration.value) return;
  isScrubbing.value = true;
  wasPlayingBeforeScrub.value = isPlaying.value;
  // 拖曳時先暫停（避免邊播邊拖）
  if (wasPlayingBeforeScrub.value) player.pauseVideo();

  // 立刻更新一次 UI
  const p = getPercentFromEvent(e);
  currentTime.value = p * duration.value;
  progressPercent.value = p * 100;
  // 拖曳中只更新 UI；想同步預覽可打開下一行（false = 不預取）
  // player.seekTo(currentTime.value, false)

  // 綁全域 move/up
  window.addEventListener("mousemove", onScrubMove);
  window.addEventListener("mouseup", onScrubEnd);
  window.addEventListener("touchmove", onScrubMove, { passive: false });
  window.addEventListener("touchend", onScrubEnd);
};

const onScrubMove = (e) => {
  if (!isScrubbing.value) return;
  e.preventDefault?.();
  const p = getPercentFromEvent(e);
  currentTime.value = p * duration.value;
  progressPercent.value = p * 100;
  // 想邊拖邊預覽：打開
  // player.seekTo(currentTime.value, false)
};

const onScrubEnd = () => {
  if (!isScrubbing.value) return;
  isScrubbing.value = false;

  // 最終定位，允許跳到未緩存區
  player.seekTo(currentTime.value, true);

  // 恢復播放狀態
  if (wasPlayingBeforeScrub.value) player.playVideo();

  // 清理監聽
  window.removeEventListener("mousemove", onScrubMove);
  window.removeEventListener("mouseup", onScrubEnd);
  window.removeEventListener("touchmove", onScrubMove);
  window.removeEventListener("touchend", onScrubEnd);
};

// 點讚/取消點讚
const toggleLike = async (video) => {
  // 如果正在處理中，避免重複點擊
  if (video.isProcessing) return;

  video.isProcessing = true;
  const wasLiked = video.isLiked;

  try {
    // 從 localStorage 獲取 userData
    const userDataLocal =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("userData") || "{}")
        : {};

    const requestBody = {
      MID: userDataLocal.MID || "",
      Token: userDataLocal.Token || "",
      MAID: userDataLocal.MAID || "",
      Mobile: userDataLocal.Mobile || "",
      Lang: "zhtw",
      AID: video.id.toString(),
    };

    let response;
    if (wasLiked) {
      // 取消點讚
      response = await fetch(
        "https://23700999.com:8081/HMA/api/fr/VideoDeleteGood",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
    } else {
      // 點讚
      response = await fetch(
        "https://23700999.com:8081/HMA/api/fr/VideoMakeGood",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.Result === "OK") {
      // 更新點讚狀態和數量
      video.isLiked = !wasLiked;
      if (wasLiked) {
        video.likes = Math.max(0, video.likes - 1);
      } else {
        video.likes = video.likes + 1;
      }
    } else {
      console.error("點讚操作失敗:", result.Result);
    }
  } catch (error) {
    console.error("點讚操作失敗:", error);
  } finally {
    video.isProcessing = false;
  }
};

// 留言相關函數
const openCommentsModal = () => {
  showCommentsModal.value = true;
  commentsModalTransform.value = 0;
  // 這裡可以調用 API 獲取完整留言列表
  // fetchComments();
};

const closeCommentsModal = () => {
  showCommentsModal.value = false;
  commentsModalTransform.value = 0;
};

const showFullComment = (index) => {
  // 主頁面留言列表中使用
  const comment = displayedComments.value[index];
  const actualIndex = commentsList.value.findIndex((c) => c === comment);
  if (actualIndex !== -1) {
    commentsList.value[actualIndex].showFull = true;
  }
};

const showFullCommentInModal = (index) => {
  // 模態視窗留言列表中使用
  const comment = fullCommentsList.value[index];
  const actualIndex = commentsList.value.findIndex((c) => c === comment);
  if (actualIndex !== -1) {
    commentsList.value[actualIndex].showFull = true;
  }
};

const loadMoreComments = () => {
  // 載入更多留言
  // fetchMoreComments();
};

const submitComment = async () => {
  if (!newComment.value.trim()) return;
  if (!videoData.value.id) return;

  try {
    // 從 localStorage 獲取 userData
    const userDataLocal =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("userData") || "{}")
        : {};

    const requestBody = {
      MID: userDataLocal.MID || "",
      Token: userDataLocal.Token || "",
      MAID: userDataLocal.MAID || "",
      Mobile: userDataLocal.Mobile || "",
      Lang: "zhtw",
      AID: videoData.value.id.toString(),
      Message: newComment.value.trim(),
    };

    const response = await fetch(
      "https://23700999.com:8081/HMA/api/fr/VideoMakeMessage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.Result === "OK") {
      // 成功提交留言，添加到列表最前面
      const now = new Date();
      const checkTime = `${now.getFullYear()}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      // 獲取當前用戶資訊
      const currentUserName =
        userDataLocal.Name || userDataLocal.Member?.Name || "使用者";

      commentsList.value.unshift({
        id: result.BID ? parseInt(result.BID) : null,
        name: currentUserName,
        time: formatRelativeTime(checkTime),
        text: newComment.value.trim(),
        showFull: false,
        isOwnComment: true, // 新留言一定是自己的
      });

      // 更新留言數量
      videoData.value.comments += 1;

      // 清空輸入框
      newComment.value = "";
    } else {
      console.error("提交留言失敗:", result.Result);
      // 可以顯示錯誤提示給用戶
      alert("提交留言失敗，請稍後再試");
    }
  } catch (error) {
    console.error("提交留言失敗:", error);
    // 可以顯示錯誤提示給用戶
    alert("提交留言失敗，請稍後再試");
  }
};

// 留言模態視窗滑動手勢
const onCommentsTouchStart = (e) => {
  commentsTouchStartY.value = e.touches[0].clientY;
  commentsTouchStartTransform.value = commentsModalTransform.value;
  isCommentsDragging.value = true;
};

const onCommentsTouchMove = (e) => {
  if (!isCommentsDragging.value) return;

  const currentY = e.touches[0].clientY;
  const deltaY = currentY - commentsTouchStartY.value;
  const newTransform = commentsTouchStartTransform.value + deltaY;

  // 限制滑動範圍，只能向下拖曳關閉
  if (newTransform > 0) {
    commentsModalTransform.value = newTransform;
  }
};

const onCommentsTouchEnd = () => {
  if (!isCommentsDragging.value) return;

  isCommentsDragging.value = false;

  // 根據滑動距離決定是否關閉
  if (commentsModalTransform.value > 100) {
    closeCommentsModal();
  } else {
    // 恢復原狀
    commentsModalTransform.value = 0;
  }
};

// 獲取影片列表
const fetchVideoList = async () => {
  try {
    // 從 localStorage 獲取 userData
    const userDataLocal =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("userData") || "{}")
        : {};

    // 提取所需的參數
    const requestBody = {
      MID: userDataLocal.MID || "",
      Token: userDataLocal.Token || "",
      MAID: userDataLocal.MAID || "",
      Mobile: userDataLocal.Mobile || "",
      Lang: "zhtw", // 預設為繁體中文，可根據需求調整
    };

    const response = await fetch(
      "https://23700999.com:8081/HMA/api/fr/getVideoList",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.Result === "OK" && result.VideoList) {
      // 只處理 OnLineVideo 為 "Y" 的影片（已上架）
      const activeVideos = result.VideoList.filter(
        (item) => item.OnLineVideo === "Y"
      );
      videoDatabase.value = transformApiData(activeVideos);

      // 根據路由參數找到對應影片
      const videoId = parseInt(route.params.id);
      if (videoDatabase.value[videoId]) {
        videoData.value = videoDatabase.value[videoId];
        // 載入該影片的留言列表
        commentsList.value = videoData.value.messageList || [];
      } else {
        // 如果找不到對應的影片，使用第一個影片
        const firstVideoId = Object.keys(videoDatabase.value)[0];
        if (firstVideoId) {
          videoData.value = videoDatabase.value[parseInt(firstVideoId)];
          // 載入該影片的留言列表
          commentsList.value = videoData.value.messageList || [];
        }
      }
    } else {
      console.error("API 返回錯誤:", result.Result || "未知錯誤");
    }
  } catch (error) {
    console.error("獲取影片列表失敗:", error);
  }
};

// 根據 ID 獲取影片資料
onMounted(async () => {
  await fetchVideoList();

  // iOS 舊版不支援任意元素全螢幕：直接用 YouTube 原生控制列
  if (useNativeYTControls) {
    showControls.value = false;
  }

  // 監聽全螢幕狀態變化
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  document.addEventListener("mozfullscreenchange", handleFullscreenChange);
  document.addEventListener("MSFullscreenChange", handleFullscreenChange);
});

onUnmounted(() => {
  cancelProgressLoop();
  clearControlsHideTimer();
  if (player && player.destroy) player.destroy();

  // 移除全螢幕事件監聽
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
  document.removeEventListener(
    "webkitfullscreenchange",
    handleFullscreenChange
  );
  document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
  document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
});

// 開啟留言操作選單（主頁面）
const openCommentMenu = (index) => {
  const comment = displayedComments.value[index];
  selectedCommentIndex.value = index;
  selectedCommentId.value = comment?.id || null;
  isModalComment.value = false;
  showCommentMenu.value = true;
};

// 開啟留言操作選單（模態視窗）
const openCommentMenuInModal = (index) => {
  const comment = fullCommentsList.value[index];
  selectedCommentIndex.value = index;
  selectedCommentId.value = comment?.id || null;
  isModalComment.value = true;
  showCommentMenu.value = true;
};

// 關閉留言操作選單
const closeCommentMenu = () => {
  showCommentMenu.value = false;
  selectedCommentIndex.value = -1;
};

// 編輯留言
const editComment = () => {
  // 從 commentsList 中找到對應的留言
  const comment = commentsList.value.find(
    (c) => c.id === selectedCommentId.value
  );

  if (comment) {
    editingCommentText.value = comment.text;
    showEditComment.value = true;
    closeCommentMenu();
  } else {
    alert("找不到留言資料");
  }
};

// 關閉編輯留言
const closeEditComment = () => {
  showEditComment.value = false;
  editingCommentText.value = "";
};

// 儲存編輯後的留言
const saveEditedComment = async () => {
  if (!editingCommentText.value.trim()) {
    alert("請輸入留言內容");
    return;
  }

  // 從 commentsList 中找到對應的留言
  const comment = commentsList.value.find(
    (c) => c.id === selectedCommentId.value
  );

  if (!comment || !comment.id) {
    alert("找不到留言資料");
    return;
  }

  try {
    const userDataLocal =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("userData") || "{}")
        : {};

    const requestBody = {
      MID: userDataLocal.MID || "",
      Token: userDataLocal.Token || "",
      MAID: userDataLocal.MAID || "",
      Mobile: userDataLocal.Mobile || "",
      Lang: "zhtw",
      AID: videoData.value.id.toString(),
      BID: comment.id.toString(),
      NewMessage: editingCommentText.value.trim(),
    };

    const response = await fetch(
      "https://23700999.com:8081/HMA/api/fr/VideoModifyMessage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.Result === "OK") {
      // 更新留言內容
      comment.text = editingCommentText.value.trim();
      closeEditComment();
      selectedCommentId.value = null; // ✅ 這裡再清
    } else {
      console.error("編輯留言失敗:", result.Result);
      alert("編輯留言失敗，請稍後再試");
    }
  } catch (error) {
    console.error("編輯留言失敗:", error);
    alert("編輯留言失敗，請稍後再試");
  }
};

// 刪除留言
const deleteComment = () => {
  closeCommentMenu();
  showDeleteAlert.value = true;
};

// 確認刪除留言
const confirmDeleteComment = async () => {
  showDeleteAlert.value = false;

  // 從 commentsList 中找到對應的留言
  const comment = commentsList.value.find(
    (c) => c.id === selectedCommentId.value
  );

  if (!comment || !comment.id) {
    alert("找不到留言資料");
    return;
  }

  try {
    const userDataLocal =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("userData") || "{}")
        : {};

    const requestBody = {
      MID: userDataLocal.MID || "",
      Token: userDataLocal.Token || "",
      MAID: userDataLocal.MAID || "",
      Mobile: userDataLocal.Mobile || "",
      Lang: "zhtw",
      AID: videoData.value.id.toString(),
    };

    const response = await fetch(
      "https://23700999.com:8081/HMA/api/fr/VideoDeleteMessage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.Result === "OK") {
      // 從列表中移除留言
      const actualIndex = commentsList.value.findIndex(
        (c) => c.id === comment.id
      );
      if (actualIndex !== -1) {
        commentsList.value.splice(actualIndex, 1);
        // 更新留言數量
        videoData.value.comments = Math.max(0, videoData.value.comments - 1);
      }
      selectedCommentId.value = null;
    } else {
      console.error("刪除留言失敗:", result.Result);
      alert("刪除留言失敗，請稍後再試");
    }
  } catch (error) {
    console.error("刪除留言失敗:", error);
    alert("刪除留言失敗，請稍後再試");
  }
};

useHead({
  title: "拉菲爾人本診所",
  meta: [{ name: "description", content: "是透過相應神經調節療法，以無藥、無副作用、非侵入性的治療方式治療自律神經失調、神經痛、弱視、耳鳴、眩暈、胃食道逆流、顏面神經麻痺、失眠、過敏性鼻炎、焦慮憂鬱、胃食道逆流、三叉神經痛、帶狀皰疹神經痛等疾病。" }],
});

const modules = [FreeMode];
</script>

<style lang="scss" scoped>
.videoDetailWrap {
  @include gradientBg();
  min-height: 100vh;
  padding-bottom: 80px;
  padding-top: 1rem;

  .videoDetailContainer {
    max-width: 768px;
    margin: 0 auto;
  }
  .titleMenuWrap {
    padding: 0 0.5rem;
  }

  .videoPlayer {
    width: 100%;
    height: 250px;
    background: #000;
    margin-top: 1rem;
    position: relative;
    // 修復手機端縮放問題 - 只保留必要的屬性
    -webkit-tap-highlight-color: transparent;

    // 全螢幕樣式 - 使用動態視窗高避免瀏海/工具列壓縮
    &:fullscreen,
    &:-webkit-full-screen,
    &:-moz-full-screen,
    &:-ms-fullscreen {
      height: 100svh; // 使用動態視窗高
      width: 100vw;
      margin: 0;
      background: #000;

      .videoContainer {
        height: 100svh;
        width: 100vw;

        iframe {
          height: 100svh;
          width: 100vw;
        }
      }

      .videoControls {
        bottom: 20px;
        left: 20px;
        right: 20px;
        padding: 20px;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
      }
    }

    .videoContainer {
      position: relative; // 保險
      width: 100%;
      height: 100%;

      iframe {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
      }
    }

    .videoControls {
      position: absolute;
      z-index: 2; // 關鍵：確保覆蓋 iframe
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 20px;
      pointer-events: auto; // 確保可以點擊
      transition: opacity 0.3s ease, transform 0.3s ease;
      opacity: 1;
      transform: translateY(0);
      // 防止破版
      overflow: hidden;
      max-width: 100%;
      box-sizing: border-box;

      .controlButton {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover:not(.disabled) {
          background: rgba(255, 255, 255, 1);
          transform: scale(1.1);
        }

        &.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        img {
          width: 20px;
          height: 20px;
        }
      }

      .progressBar {
        flex: 1;
        height: 6px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
        position: relative;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 0; // 防止 flex 項目溢出
        max-width: 100%;

        &:hover {
          height: 8px;
        }

        .progress {
          height: 100%;
          background: #74bc1f;
          border-radius: 3px;
          transition: width 0.1s ease;
          position: relative;

          &::after {
            content: "";
            position: absolute;
            right: -6px;
            top: 50%;
            transform: translateY(-50%);
            width: 12px;
            height: 12px;
            background: #74bc1f;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
        }
      }

      .timeDisplay {
        color: white;
        font-size: 12px;
        font-weight: 500;
        min-width: 60px;
        max-width: 80px;
        text-align: right;
        flex-shrink: 0; // 防止縮小
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    // 控制項隱藏時的樣式 - 使用 fade 效果
    &.controls-hidden .videoControls {
      opacity: 0;
      transform: translateY(0);
      pointer-events: none;
    }
  }

  // 響應式設計 - 小螢幕設備
  @media (max-width: 480px) {
    .videoPlayer {
      .videoControls {
        padding: 12px;
        gap: 12px;

        .controlButton {
          width: 36px;
          height: 36px;

          img {
            width: 18px;
            height: 18px;
          }
        }

        .timeDisplay {
          font-size: 11px;
          min-width: 50px;
          max-width: 60px;
        }

        .progressBar {
          height: 5px;

          &:hover {
            height: 6px;
          }
        }
      }
    }
  }

  // 超小螢幕設備
  @media (max-width: 360px) {
    .videoPlayer {
      .videoControls {
        padding: 8px;
        gap: 8px;

        .controlButton {
          width: 32px;
          height: 32px;

          img {
            width: 16px;
            height: 16px;
          }
        }

        .timeDisplay {
          font-size: 10px;
          min-width: 45px;
          max-width: 55px;
        }
      }
    }
  }

  .videoInfo {
    margin: 1rem;
    padding: 20px 16px;
    border-radius: var(--Radius-r-20, 20px);
    background: var(--Secondary-100, #f5f7fa);
    box-shadow: 2px 4px 12px 0
      var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));

    .videoTitle {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .descriptionSection {
      display: flex;
      align-items: start;
      gap: 0.5rem;
      width: 100%;

      .logoImg {
        width: 40px;
      }
      .descriptionHeader {
        flex: 2;
        justify-content: space-between;
        align-items: center;

        .actionButtons {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }

        .statItem {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #666;
          @include neumorphismOuter($radius: 50px, $padding: 4px 8px);
          cursor: pointer;
          transition: all 0.3s ease;
          user-select: none;

          img {
            width: 16px;
            height: 16px;
          }

          &:hover {
            transform: scale(1.05);
          }

          &.liked {
            color: #ec4f4f;
          }
        }
        h3 {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .toggleIcon {
          transition: transform 0.3s ease;

          &.active {
            transform: rotate(180deg);
          }

          img {
            width: 20px;
            height: 20px;
          }
        }
      }
      h6 {
        overflow: hidden;
        color: var(--Neutral-black, #1e1e1e);
        text-overflow: ellipsis;

        font-size: 16px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        cursor: pointer;
        margin-top: 0.5rem;
      }
    }
  }

  // 留言區樣式（主頁面）
  .commentsHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 1rem;

    .commentsTitle {
      font-size: 20px;
      font-weight: 700;
      color: #1e1e1e;
    }

    .viewMoreButton {
      color: var(--Primary-default, #74bc1f);
      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;
      letter-spacing: 2.7px;
      cursor: pointer;
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Secondary-100, #f5f7fa);
      box-shadow: 2px 4px 12px 0
        var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
      padding: 8px 12px;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .commentsSection {
    margin: 1rem;

    padding: 6px 16px 20px;
    border-radius: var(--Radius-r-20, 20px);
    background: var(--Secondary-100, #f5f7fa);
    box-shadow: 2px 4px 12px 0
      var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));

    .commentsList {
      margin-bottom: 16px;

      .noComments {
        text-align: center;
        padding: 20px;
        color: #999;
        font-size: 14px;
      }

      .commentItem {
        display: flex;
        gap: 12px;
        padding: 12px;

        border-radius: 12px;
        margin-bottom: 12px;

        .commentAvatar {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          background: #e0e0e0;
          border-radius: 50%;
          display: none;
        }

        .commentContent {
          flex: 1;
          min-width: 0;

          .commentHeader {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;

            .commentName {
              color: var(--Neutral-black, #1e1e1e);
              text-overflow: ellipsis;

              font-size: var(--Text-font-size-18, 18px);
              font-style: normal;
              font-weight: 700;
              line-height: normal;
            }

            .commentTime {
              color: var(--Neutral-400, #b3b3b3);
              text-overflow: ellipsis;
              font-size: var(--Text-font-size-12, 12px);
              font-style: normal;
              font-weight: 400;
              line-height: normal;
            }
          }

          .commentText {
            .commentTextShort {
              font-size: 14px;
              color: #666;
              line-height: 1.5;
              margin: 0;

              .showMoreText {
                color: #74bc1f;
                cursor: pointer;
                margin-left: 4px;
              }
            }

            .commentTextFull {
              overflow: hidden;
              color: var(--Neutral-black, #1e1e1e);
              text-overflow: ellipsis;
              font-size: var(--Text-font-size-16, 16px);
              font-style: normal;
              font-weight: 500;
              line-height: normal;
            }
          }
        }

        .commentMore {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #999;
          font-size: 18px;
          flex-shrink: 0;
          transition: color 0.2s ease;

          &:hover {
            color: #666;
          }

          span {
            font-size: 20px;
            line-height: 1;
          }
        }
      }
    }

    .commentsInputArea {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 16px;

      .commentInput {
        flex: 1;
        padding: 12px 16px;
        border-radius: var(--Radius-r-20, 20px);
        background: var(--Secondary-100, #f5f7fa);
        box-shadow: 2px 4px 12px 0
          var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
        border: none;
        outline: none;
        color: var(--Neutral-black, #1e1e1e);

        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 700;

        letter-spacing: 0.09px;
        &::placeholder {
        }

        &:focus {
          border-color: #74bc1f;
        }
      }

      .sendCommentButton {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #74bc1f;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: background 0.3s ease;

        &:hover {
          background: #5a9a1a;
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }
    }
  }

  // 說明彈窗樣式
  .descriptionModal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: flex-end;
    animation: fadeIn 0.3s ease;
    transition: background 0.3s ease;

    &.fullscreen {
      background: rgba(0, 0, 0, 0.9);
    }

    .modalContent {
      width: 100%;
      height: 90vh; // 調整為快滿版

      animation: slideUp 0.3s ease;
      overflow: hidden;
      transition: transform 0.3s ease, border-radius 0.3s ease;
      touch-action: pan-y;

      border-radius: var(--Radius-r-20, 20px) var(--Radius-r-20, 20px) 0 0;
      background: var(--Secondary-100, #f5f7fa);
      box-shadow: 0 -6px 12px 0 var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));

      &.fullscreen {
        border-radius: 0;
        max-height: 100vh;
      }

      .modalHeader {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #f0f0f0;

        h3 {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .closeButton {
          background: none;
          border: none;
          font-size: 24px;
          color: #666;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .modalBody {
        padding: 20px;
        max-height: 75vh;
        overflow-y: auto;

        .descriptionText {
          margin-bottom: 20px;

          .tagsContainer {
            display: flex;
            flex-wrap: nowrap;
            gap: 8px;
            margin-bottom: 12px;
            overflow-x: auto;
            white-space: nowrap;

            .tagItem {
              display: inline-block;
              color: #74bc1f;
              font-size: 14px;
              font-weight: 500;
              white-space: nowrap;

              &:not(:last-child)::after {
                content: " ";
              }
            }
          }

          .descriptionParagraph {
            margin-top: 12px;
            line-height: 1.6;
            color: #666;
          }
        }
      }
    }
  }
}

.ellipsis-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
}

// 動畫定義
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

// 留言模態視窗樣式
.commentsModal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.3s ease;

  .commentsModalContent {
    width: 100%;
    max-width: 768px;
    background: #f5f7fa;
    border-radius: 20px 20px 0 0;
    height: 85vh;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease;
    transform: translateY(0);

    .modalDragBar {
      width: 40px;
      height: 4px;
      background: #ddd;
      border-radius: 2px;
      margin: 8px auto;
      cursor: grab;
    }

    .commentsHeader {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;

      .commentsTitle {
        font-size: 20px;
        font-weight: 700;
        color: #1e1e1e;
      }

      .closeCommentsButton {
        background: none;
        border: none;
        font-size: 24px;
        color: #666;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .commentsList {
      flex: 1;
      overflow-y: auto;
      padding: 0px 20px;

      .commentItem {
        display: flex;
        gap: 12px;
        padding: 12px;

        border-radius: 12px;

        .commentAvatar {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: none;
          img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            background: #e0e0e0;
          }
        }

        .commentContent {
          flex: 1;
          min-width: 0;

          .commentHeader {
            display: flex;
            align-items: center;
            gap: 8px;

            .commentName {
              color: var(--Neutral-black, #1e1e1e);
              text-overflow: ellipsis;

              font-size: var(--Text-font-size-18, 18px);
              font-style: normal;
              font-weight: 700;
              line-height: normal;
            }

            .commentTime {
              color: var(--Neutral-400, #b3b3b3);
              text-overflow: ellipsis;
              font-size: var(--Text-font-size-12, 12px);
              font-style: normal;
              font-weight: 400;
              line-height: normal;
            }
          }

          .commentText {
            .commentTextShort {
              font-size: 14px;
              color: #666;
              line-height: 1.5;
              margin: 0;

              .showMoreText {
                color: #74bc1f;
                cursor: pointer;
                margin-left: 4px;
              }
            }

            .commentTextFull {
              overflow: hidden;
              color: var(--Neutral-black, #1e1e1e);
              text-overflow: ellipsis;
              font-size: var(--Text-font-size-16, 16px);
              font-style: normal;
              font-weight: 500;
              line-height: normal;
            }
          }
        }

        .commentMore {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #999;
          font-size: 18px;
          flex-shrink: 0;
          transition: color 0.2s ease;

          &:hover {
            color: #666;
          }

          span {
            font-size: 20px;
            line-height: 1;
          }
        }
      }

      .viewMoreComments {
        text-align: center;
        padding: 16px;
        color: #74bc1f;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
      }
    }

    .commentsInputArea {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;

      .commentInput {
        flex: 1;
        padding: 12px 16px;
        border-radius: var(--Radius-r-20, 20px);
        background: var(--Secondary-100, #f5f7fa);
        box-shadow: 2px 4px 12px 0
          var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
        border: none;
        outline: none;
        color: var(--Neutral-black, #1e1e1e);

        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 700;

        letter-spacing: 0.09px;
        &::placeholder {
        }

        &:focus {
          border-color: #74bc1f;
        }
      }

      .sendCommentButton {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #74bc1f;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: background 0.3s ease;

        &:hover {
          background: #5a9a1a;
        }

        img {
          width: 20px;
          height: 20px;
          filter: brightness(0) invert(1);
        }
      }
    }
  }
}

// 留言操作選單彈窗樣式
.commentMenuModal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1002;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.3s ease;

  .commentMenuContent {
    width: 100%;
    max-width: 768px;
    background: white;
    border-radius: 20px 20px 0 0;
    animation: slideUp 0.3s ease;
    padding-bottom: env(safe-area-inset-bottom);

    .commentMenuHeader {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;

      .commentMenuTitle {
        font-size: 20px;
        font-weight: 700;
        color: #1e1e1e;
      }

      .commentMenuClose {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        transition: color 0.3s ease;

        &:hover {
          color: #1e1e1e;
        }

        svg {
          width: 24px;
          height: 24px;
        }
      }
    }

    .commentMenuOptions {
      padding: 8px 0;

      .commentMenuOption {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        cursor: pointer;
        transition: background 0.2s ease;

        &:hover {
          background: #f5f5f5;
        }

        &:active {
          background: #e0e0e0;
        }

        img {
          width: 20px;
          height: 20px;
        }

        span {
          font-size: 16px;
          color: #1e1e1e;
        }
      }
    }
  }
}

// 編輯留言彈窗樣式
.editCommentModal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1003;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.3s ease;

  .editCommentContent {
    width: 100%;
    max-width: 768px;
    background: white;
    border-radius: 20px 20px 0 0;
    animation: slideUp 0.3s ease;
    padding-bottom: env(safe-area-inset-bottom);

    .modalDragBar {
      width: 40px;
      height: 4px;
      background: #ddd;
      border-radius: 2px;
      margin: 8px auto;
      cursor: grab;
    }

    .editCommentHeader {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;

      .editCommentTitle {
        font-size: 20px;
        font-weight: 700;
        color: #1e1e1e;
      }

      .editCommentClose {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        transition: color 0.3s ease;

        &:hover {
          color: #1e1e1e;
        }

        svg {
          width: 24px;
          height: 24px;
        }
      }
    }

    .editCommentBody {
      padding: 20px;
      padding-bottom: 12px;

      .editCommentInput {
        width: 100%;
        padding: 12px 16px;
        border-radius: var(--Radius-r-20, 20px);
        border: none;
        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.09px;
        font-family: inherit;
        resize: vertical;
        min-height: 120px;
        outline: none;
        transition: border-color 0.2s ease;
        background: var(--Secondary-100, #f5f7fa);
        box-shadow: 2px 4px 12px 0
          var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
        color: var(--Neutral-black, #1e1e1e);

        &:focus {
          border-color: #74bc1f;
        }

        &::placeholder {
          color: #999;
        }
      }
    }

    .editCommentSendArea {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 0 20px 20px;
      gap: 12px;

      .editCommentSendButton {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #74bc1f;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: background 0.3s ease;

        &:hover {
          background: #5a9a1a;
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }
    }
  }
}
</style>
