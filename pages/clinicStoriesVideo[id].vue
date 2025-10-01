<template>
  <div class="videoDetailWrap">
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
          <div class="progress" :style="{ width: progressPercent + '%' }"></div>
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
        <div class="descriptionHeader">
          <p class="ellipsis-3">
            {{ videoData.description }}{{ videoData.description
            }}{{ videoData.description }}{{ videoData.description
            }}{{ videoData.description }}{{ videoData.description
            }}{{ videoData.description }}{{ videoData.description
            }}{{ videoData.description }}{{ videoData.description
            }}{{ videoData.description }}
          </p>
        </div>
        <h6 v-if="!showDescription" @click="toggleDescription">顯示完整內容</h6>
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
          <button class="closeButton" @click="closeDescriptionModal">×</button>
        </div>
        <div class="modalBody">
          <div class="descriptionText">
            <div class="bulletPoint">
              <span class="bullet">•</span>
              <span>耳鳴、失眠、頭暈、胃不適...身體狀況越來越差?</span>
            </div>
            <div class="bulletPoint">
              <span class="bullet">•</span>
              <span>長達20年的身心折磨,還有救嗎?</span>
            </div>
            <p class="descriptionParagraph">
              長年飽受自律神經失調影響,嘗試過各種治療仍無改善,直到選擇自律神經調節療法。短短一個月內症狀明顯減輕,重新找回健康與希望!
            </p>
          </div>

          <!-- 時間軸章節 -->
          <div class="timelineSection">
            <h4>影片章節</h4>
            <div class="timelineList">
              <div
                class="timelineItem"
                v-for="chapter in videoChapters"
                :key="chapter.time"
                @click="seekToTime(chapter.time)"
              >
                <span class="timelineTime">{{ chapter.time }}</span>
                <span class="timelineTitle">{{ chapter.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
const route = useRoute();
const router = useRouter();

// 影片資料庫
const videoDatabase = {
  1: {
    id: 1,
    thumbnail: "https://img.youtube.com/vi/cuWAOp_T7R4/maxresdefault.jpg",
    badge: "案例分享",
    title: "自律神經失調案例",
    subtitle: "長期失眠 焦慮 耳鳴",
    description: "透過專業治療重獲健康",
    fullTitle: "拉菲爾人本診所案例分享：自律神經失調患者的康復之路",
    likes: 1200,
    comments: 35,
    youtubeUrl: "https://www.youtube.com/watch?v=cuWAOp_T7R4",
    category: "case",
    tags: ["自律神經", "失眠", "焦慮", "耳鳴", "康復", "案例分享"],
  },
  2: {
    id: 2,
    thumbnail: "https://img.youtube.com/vi/G9RoWlrIHyc/maxresdefault.jpg",
    badge: "醫師解密",
    title: "醫學新知",
    subtitle: "專業醫師解析",
    description: "深入探討現代醫學治療方法",
    fullTitle: "醫師解密：現代醫學治療方法深度解析",
    likes: 950,
    comments: 28,
    youtubeUrl: "https://www.youtube.com/watch?v=G9RoWlrIHyc",
    category: "doctor",
    tags: ["醫師", "醫學", "治療", "專業", "解密"],
  },
  3: {
    id: 3,
    thumbnail: "https://img.youtube.com/vi/8GCJQ4Jh_W0/maxresdefault.jpg",
    badge: "健康知識",
    title: "養生保健",
    subtitle: "日常健康管理",
    description: "簡單有效的健康維護方法",
    fullTitle: "健康知識：日常養生保健的實用方法",
    likes: 1100,
    comments: 42,
    youtubeUrl: "https://www.youtube.com/watch?v=8GCJQ4Jh_W0",
    category: "health",
    tags: ["養生", "保健", "健康", "日常", "管理"],
  },
  4: {
    id: 4,
    thumbnail: "https://img.youtube.com/vi/PimMlMVVh3s/hqdefault.jpg",
    badge: "治療心得",
    title: "康復分享",
    subtitle: "患者真實體驗",
    description: "從病痛到康復的完整歷程",
    fullTitle: "治療心得：患者康復過程的寶貴分享",
    likes: 880,
    comments: 31,
    youtubeUrl: "https://www.youtube.com/watch?v=PimMlMVVh3s",
    category: "treatment",
    tags: ["康復", "心得", "分享", "治療", "體驗"],
  },
};

// 當前影片資料
const videoData = ref(videoDatabase[1]);

// 影片章節資料 - 根據不同影片動態載入
const videoChapters = ref([
  { time: "00:00", title: "失眠一族的苦與痛" },
  { time: "00:13", title: "耳鳴、失眠等全身上下都不舒服?" },
  { time: "01:23", title: "為什麼選擇拉菲爾?" },
  { time: "02:08", title: "第一次看診,成效出乎意料?" },
  { time: "02:58", title: "最困擾的耳鳴、失眠及其他症狀的改善?" },
  { time: "04:00", title: "無副作用療法的優勢?" },
  { time: "05:02", title: "醫病更醫心,真心推薦!" },
]);

// 根據影片 ID 更新章節資料
const updateChaptersForVideo = (videoId) => {
  const chaptersData = {
    1: [
      { time: "00:00", title: "斷點1" },
      { time: "00:05", title: "斷點2" },
      { time: "00:10", title: "斷點3" },
      { time: "00:15", title: "斷點4" },
      { time: "00:20", title: "斷點5" },
      { time: "00:25", title: "斷點6" },
      { time: "00:30", title: "斷點7" },
      { time: "00:35", title: "斷點8" },
      { time: "00:40", title: "斷點9" },
      { time: "00:45", title: "斷點10" },
      { time: "00:50", title: "斷點11" },
      { time: "00:55", title: "斷點12" },
      { time: "01:00", title: "斷點13" },
      { time: "01:05", title: "斷點14" },
      { time: "01:10", title: "斷點15" },
      { time: "01:15", title: "斷點16" },
      { time: "01:20", title: "斷點17" },
      { time: "01:25", title: "斷點18" },
      { time: "01:30", title: "斷點19" },
      { time: "01:35", title: "斷點20" },
    ],
    2: [
      { time: "00:00", title: "斷點1" },
      { time: "00:05", title: "斷點2" },
      { time: "00:10", title: "斷點3" },
      { time: "00:15", title: "斷點4" },
      { time: "00:20", title: "斷點5" },
      { time: "00:25", title: "斷點6" },
      { time: "00:30", title: "斷點7" },
      { time: "00:35", title: "斷點8" },
      { time: "00:40", title: "斷點9" },
      { time: "00:45", title: "斷點10" },
      { time: "00:50", title: "斷點11" },
      { time: "00:55", title: "斷點12" },
      { time: "01:00", title: "斷點13" },
      { time: "01:05", title: "斷點14" },
      { time: "01:10", title: "斷點15" },
      { time: "01:15", title: "斷點16" },
      { time: "01:20", title: "斷點17" },
      { time: "01:25", title: "斷點18" },
      { time: "01:30", title: "斷點19" },
      { time: "01:35", title: "斷點20" },
    ],
    3: [
      { time: "00:00", title: "斷點1" },
      { time: "00:05", title: "斷點2" },
      { time: "00:10", title: "斷點3" },
      { time: "00:15", title: "斷點4" },
      { time: "00:20", title: "斷點5" },
      { time: "00:25", title: "斷點6" },
      { time: "00:30", title: "斷點7" },
      { time: "00:35", title: "斷點8" },
      { time: "00:40", title: "斷點9" },
      { time: "00:45", title: "斷點10" },
      { time: "00:50", title: "斷點11" },
      { time: "00:55", title: "斷點12" },
      { time: "01:00", title: "斷點13" },
      { time: "01:05", title: "斷點14" },
      { time: "01:10", title: "斷點15" },
      { time: "01:15", title: "斷點16" },
      { time: "01:20", title: "斷點17" },
      { time: "01:25", title: "斷點18" },
      { time: "01:30", title: "斷點19" },
      { time: "01:35", title: "斷點20" },
    ],
    3: [
      { time: "00:00", title: "斷點1" },
      { time: "00:05", title: "斷點2" },
      { time: "00:10", title: "斷點3" },
      { time: "00:15", title: "斷點4" },
      { time: "00:20", title: "斷點5" },
      { time: "00:25", title: "斷點6" },
      { time: "00:30", title: "斷點7" },
      { time: "00:35", title: "斷點8" },
      { time: "00:40", title: "斷點9" },
      { time: "00:45", title: "斷點10" },
      { time: "00:50", title: "斷點11" },
      { time: "00:55", title: "斷點12" },
      { time: "01:00", title: "斷點13" },
      { time: "01:05", title: "斷點14" },
      { time: "01:10", title: "斷點15" },
      { time: "01:15", title: "斷點16" },
      { time: "01:20", title: "斷點17" },
      { time: "01:25", title: "斷點18" },
      { time: "01:30", title: "斷點19" },
      { time: "01:35", title: "斷點20" },
    ],
    4: [
      { time: "00:00", title: "斷點1" },
      { time: "00:05", title: "斷點2" },
      { time: "00:10", title: "斷點3" },
      { time: "00:15", title: "斷點4" },
      { time: "00:20", title: "斷點5" },
      { time: "00:25", title: "斷點6" },
      { time: "00:30", title: "斷點7" },
      { time: "00:35", title: "斷點8" },
      { time: "00:40", title: "斷點9" },
      { time: "00:45", title: "斷點10" },
      { time: "00:50", title: "斷點11" },
      { time: "00:55", title: "斷點12" },
      { time: "01:00", title: "斷點13" },
      { time: "01:05", title: "斷點14" },
      { time: "01:10", title: "斷點15" },
      { time: "01:15", title: "斷點16" },
      { time: "01:20", title: "斷點17" },
      { time: "01:25", title: "斷點18" },
      { time: "01:30", title: "斷點19" },
      { time: "01:35", title: "斷點20" },
    ],
    4: [
      { time: "00:00", title: "斷點1" },
      { time: "00:05", title: "斷點2" },
      { time: "00:10", title: "斷點3" },
      { time: "00:15", title: "斷點4" },
      { time: "00:20", title: "斷點5" },
      { time: "00:25", title: "斷點6" },
      { time: "00:30", title: "斷點7" },
      { time: "00:35", title: "斷點8" },
      { time: "00:40", title: "斷點9" },
      { time: "00:45", title: "斷點10" },
      { time: "00:50", title: "斷點11" },
      { time: "00:55", title: "斷點12" },
      { time: "01:00", title: "斷點13" },
      { time: "01:05", title: "斷點14" },
      { time: "01:10", title: "斷點15" },
      { time: "01:15", title: "斷點16" },
      { time: "01:20", title: "斷點17" },
      { time: "01:25", title: "斷點18" },
      { time: "01:30", title: "斷點19" },
      { time: "01:35", title: "斷點20" },
    ],
  };

  videoChapters.value = chaptersData[videoId] || chaptersData[1];
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

// 影片 iframe 引用
const videoIframe = ref(null);

// 設備檢測和全螢幕支援檢測
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
              (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const supportsElementFS = !!(document.fullscreenEnabled ||
                             document.webkitFullscreenEnabled ||
                             document.mozFullScreenEnabled ||
                             document.msFullscreenEnabled);

// iOS 且不支援任意元素全螢幕 → 用原生控制列
const useNativeYTControls = isIOS && !supportsElementFS;

// 計算 YouTube 嵌入 URL
const youtubeEmbedUrl = computed(() => {
  const videoId = videoData.value.youtubeUrl.split("v=")[1]?.split("&")[0];
  const origin = window.location.origin;
  const params = new URLSearchParams({
    enablejsapi: "1",
    origin,
    rel: "0",
    modestbranding: "1",
    playsinline: "1", // iOS 仍可行
    // 關鍵：iOS 舊版不支援任意元素全螢幕 → 顯示 YouTube 的原生控制列（含全螢幕）
    controls: useNativeYTControls ? "1" : "0",
    fs: "1"
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
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
  if (!videoIframe.value) return;

  const videoId = videoData.value.youtubeUrl.split("v=")[1]?.split("&")[0];

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

  const target = document.querySelector('.videoPlayer .videoContainer');
  if (!target) return;

  // 已在全螢幕 → 退出
  if (document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement) {
    (document.exitFullscreen ||
     document.webkitExitFullscreen ||
     document.mozCancelFullScreen ||
     document.msExitFullscreen)?.call(document);
  } else {
    // 進入全螢幕
    try {
      await (target.requestFullscreen ||
             target.webkitRequestFullscreen ||
             target.mozRequestFullScreen ||
             target.msRequestFullscreen)?.call(target, { navigationUI: "hide" });
      
      // 嘗試鎖定橫向（支援的裝置才會成功，不會報錯）
      try {
        await screen.orientation?.lock?.('landscape');
      } catch (e) {
        // 忽略錯誤，某些設備不支援
        console.log('Orientation lock not supported:', e);
      }
    } catch (e) {
      console.log('Fullscreen not supported:', e);
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

const seekToTime = (
  timeString,
  { autoplay = true, closeModal = true } = {}
) => {
  if (!player || !isYouTubeReady.value) return;
  const [m, s] = timeString.split(":").map(Number);
  const total = (m || 0) * 60 + (s || 0);
  
  // 檢查時間是否超過影片長度
  if (total >= duration.value) {
    // 如果超過影片長度，直接跳到影片結尾
    player.seekTo(duration.value - 1, true);
    // 播放到結尾後自動結束
    if (autoplay) {
      player.playVideo();
      // 設置一個短暫的延遲來確保影片播放到結尾
      setTimeout(() => {
        if (player && player.pauseVideo) {
          player.pauseVideo();
        }
      }, 1000);
    }
  } else {
    // 正常跳轉
    player.seekTo(total, true);
    if (autoplay) player.playVideo();
  }
  
  if (closeModal) closeDescriptionModal();
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


const progressBarEl = ref(null)
const isScrubbing = ref(false)
const wasPlayingBeforeScrub = ref(false)

const getPercentFromEvent = (e) => {
  const el = progressBarEl.value
  if (!el || !duration.value) return 0
  const rect = el.getBoundingClientRect()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const x = Math.min(Math.max(clientX - rect.left, 0), rect.width)
  return rect.width ? (x / rect.width) : 0
}

const onScrubStart = (e) => {
  if (!isYouTubeReady.value || !duration.value) return
  isScrubbing.value = true
  wasPlayingBeforeScrub.value = isPlaying.value
  // 拖曳時先暫停（避免邊播邊拖）
  if (wasPlayingBeforeScrub.value) player.pauseVideo()

  // 立刻更新一次 UI
  const p = getPercentFromEvent(e)
  currentTime.value = p * duration.value
  progressPercent.value = p * 100
  // 拖曳中只更新 UI；想同步預覽可打開下一行（false = 不預取）
  // player.seekTo(currentTime.value, false)

  // 綁全域 move/up
  window.addEventListener('mousemove', onScrubMove)
  window.addEventListener('mouseup', onScrubEnd)
  window.addEventListener('touchmove', onScrubMove, { passive: false })
  window.addEventListener('touchend', onScrubEnd)
}

const onScrubMove = (e) => {
  if (!isScrubbing.value) return
  e.preventDefault?.()
  const p = getPercentFromEvent(e)
  currentTime.value = p * duration.value
  progressPercent.value = p * 100
  // 想邊拖邊預覽：打開
  // player.seekTo(currentTime.value, false)
}

const onScrubEnd = () => {
  if (!isScrubbing.value) return
  isScrubbing.value = false

  // 最終定位，允許跳到未緩存區
  player.seekTo(currentTime.value, true)

  // 恢復播放狀態
  if (wasPlayingBeforeScrub.value) player.playVideo()

  // 清理監聽
  window.removeEventListener('mousemove', onScrubMove)
  window.removeEventListener('mouseup', onScrubEnd)
  window.removeEventListener('touchmove', onScrubMove)
  window.removeEventListener('touchend', onScrubEnd)
}


// 根據 ID 獲取影片資料
onMounted(() => {
  const videoId = parseInt(route.params.id);
  if (videoDatabase[videoId]) {
    videoData.value = videoDatabase[videoId];
    updateChaptersForVideo(videoId);
  } else {
    // 如果找不到對應的影片，使用預設的第一個影片
    videoData.value = videoDatabase[1];
    updateChaptersForVideo(1);
  }
  
  // iOS 舊版不支援任意元素全螢幕：直接用 YouTube 原生控制列
  if (useNativeYTControls) {
    showControls.value = false;
  }
  
  // 監聽全螢幕狀態變化
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);
});

onUnmounted(() => {
  cancelProgressLoop();
  clearControlsHideTimer();
  if (player && player.destroy) player.destroy();
  
  // 移除全螢幕事件監聽
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
});

const modules = [FreeMode];
</script>

<style lang="scss" scoped>
.videoDetailWrap {
  @include gradientBg();
  min-height: 100vh;
  padding-bottom: 80px;
  padding-top: 1rem;

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

    // 控制項隱藏時的樣式
    &.controls-hidden .videoControls {
      opacity: 0;
      transform: translateY(100%);
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
      .descriptionHeader {
        display: flex;
        justify-content: space-between;
        align-items: center;

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
      background: white;
      width: 100%;
      height: 90vh; // 調整為快滿版
      border-radius: 20px 20px 0 0;
      animation: slideUp 0.3s ease;
      overflow: hidden;
      transition: transform 0.3s ease, border-radius 0.3s ease;
      touch-action: pan-y;

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

          .bulletPoint {
            display: flex;
            align-items: flex-start;
            margin-bottom: 8px;

            .bullet {
              color: #74bc1f;
              font-weight: bold;
              margin-right: 8px;
              margin-top: 2px;
            }

            span:last-child {
              flex: 1;
              line-height: 1.5;
            }
          }

          .descriptionParagraph {
            margin-top: 12px;
            line-height: 1.6;
            color: #666;
          }
        }

        .timelineSection {
          h4 {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin-bottom: 16px;
          }

          .timelineList {
            .timelineItem {
              display: flex;
              align-items: center;
              padding: 12px 0;
              border-bottom: 1px solid #f5f5f5;

              &:last-child {
                border-bottom: none;
              }

              .timelineTime {
                font-size: 14px;
                color: #74bc1f;
                font-weight: 600;
                min-width: 50px;
                text-decoration: underline;
                cursor: pointer;
                transition: color 0.2s ease;

                &:hover {
                  color: #5a9a1a;
                }
              }

              .timelineTitle {
                font-size: 16px;
                color: #333;
                margin-left: 16px;
                flex: 1;
              }
            }
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
</style>
