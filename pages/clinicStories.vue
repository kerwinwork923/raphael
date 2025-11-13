<template>
  <div class="clinicStoriesWrap">
    <div class="clinicStoriesContainer">
      <div class="funcTool">
        <div class="notificationBell">
          <!-- <img src="../assets/imgs/member/bell.svg" alt="通知" /> -->
          <img src="../assets/imgs/robot/search.svg" alt="搜尋" />
        </div>

        <!-- 可滑動標籤 -->
        <div class="clinicStoriesTagsGroup">
          <swiper
            :slides-per-view="'auto'"
            :space-between="12"
            :free-mode="true"
            class="tagsSwiper"
          >
            <swiper-slide
              v-for="tag in visibleTags"
              :key="tag.id"
              class="tagSlide"
            >
              <div
                class="clinicStoriesTagsItem"
                :class="{ active: activeTag === tag.id }"
                @click="setActiveTag(tag.id)"
              >
                {{ tag.name }}
              </div>
            </swiper-slide>
          </swiper>
        </div>
      </div>
      <!-- 推薦影片區塊 -->
      <div class="recommendedSection">
        <h2 class="sectionTitle">推薦</h2>
        <swiper
          :slides-per-view="1.2"
          :space-between="16"
          :free-mode="true"
          class="recommendedSwiper"
        >
          <swiper-slide
            v-for="video in recommendedVideos"
            :key="video.id"
            class="videoSlide"
          >
            <div class="videoCard" @click="goToVideoDetail(video.id)">
              <div class="videoThumbnail">
                <!-- Loading 效果 -->
                <div v-if="videoLoading" class="videoLoading">
                  <div class="loadingSpinner"></div>
                </div>
                <img
                  :src="video.thumbnail"
                  :alt="video.title"
                  @load="onVideoLoad"
                  @loadstart="onVideoLoadStart"
                  :style="{ opacity: videoLoading ? 0 : 1 }"
                />
              </div>
              <div class="videoInfo">
                <h3 class="videoCardTitle">{{ video.fullTitle }}</h3>
                <div class="videoStats">
                  <div 
                    class="statItem" 
                    :class="{ liked: video.isLiked }"
                    @click.stop="toggleLike(video)"
                  >
                    <img v-if="video.isLiked" src="../assets/imgs/clinicStories/goodClick.svg" alt="讚" />
                    <img v-else src="../assets/imgs/clinicStories/good.svg" alt="讚" />
                    <span>{{ video.likes }}</span>
                  </div>
                  <!-- <div class="statItem">
                    <img
                      src="../assets/imgs/clinicStories/bubble.svg"
                      alt="留言"
                    />
                    <span>{{ video.comments }}</span>
                  </div> -->
                </div>
              </div>
            </div>
          </swiper-slide>
        </swiper>
      </div>

      <!-- 下方影片區塊 -->
      <div class="bottomVideoSection">
        <div
          class="videoCard large"
          v-for="video in filteredVideos"
          :key="video.id"
          @click="goToVideoDetail(video.id)"
        >
          <div class="videoThumbnail">
            <!-- Loading 效果 -->
            <div v-if="videoLoading" class="videoLoading">
              <div class="loadingSpinner"></div>
            </div>
            <img
              :src="video.thumbnail"
              :alt="video.title"
              @load="onVideoLoad"
              @loadstart="onVideoLoadStart"
              :style="{ opacity: videoLoading ? 0 : 1 }"
            />
          </div>
          <div class="videoInfo">
            <h3 class="videoCardTitle">{{ video.fullTitle }}</h3>
            <p class="videoCardSubtitle">{{ video.subtitle }}</p>
            <div class="videoStats">
              <div 
                class="statItem" 
                :class="{ liked: video.isLiked }"
                @click.stop="toggleLike(video)"
              >
                <img v-if="video.isLiked" src="../assets/imgs/clinicStories/goodClick.svg" alt="讚" />
                <img v-else src="../assets/imgs/clinicStories/good.svg" alt="讚" />
                <span>{{ video.likes }}</span>
              </div>
              <!-- <div class="statItem">
                <img
                  src="../assets/imgs/clinicStories/bubble.svg"
                  alt="留言"
                />
                <span>{{ video.comments }}</span>
              </div> -->
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import BottomNav from "~/components/BottomNav.vue";
import TitleMenu from "~/components/TitleMenu.vue";

// 會員狀態
const isVipMember = ref(false); // 可以從 store 或 API 獲取

// 載入狀態
const loading = ref(false);
const videoLoading = ref(true);

// 標籤資料
const tags = ref([
  { id: 0, name: "全部影片", category: "all", videoBigType: null },
]);

const activeTag = ref(0);

const setActiveTag = (tagId) => {
  activeTag.value = tagId;
};

// 根據會員狀態過濾標籤
const visibleTags = computed(() => {
  return tags.value.filter((tag) => {
    if (tag.isVip && !isVipMember.value) {
      return false;
    }
    return true;
  });
});

// 所有影片資料
const allVideos = ref([]);

// 從 YouTube URL 提取 video ID
const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

// 從 YouTube URL 生成縮圖 URL
const getYouTubeThumbnail = (url) => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return "";
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

// 轉換 API 資料為前端格式
const transformApiData = (apiData) => {
  return apiData.map((item) => {
    const videoId = extractYouTubeVideoId(item.VideoURL);
    return {
      id: parseInt(item.AID),
      thumbnail: getYouTubeThumbnail(item.VideoURL),
      fullTitle: item.Name || "",
      subtitle: item.Desc || "",
      description: item.Desc || "",
      likes: parseInt(item.goodCnt || "0"),
      comments: parseInt(item.VideoMessageSize || "0"),
      youtubeUrl: item.VideoURL || "",
      videoTypes: item.VideoTypeList || [],
      videoBigTypes: item.VideoBigTypeList || [],
      checkTime: item.CheckTime || "",
      adminId: item.AdminID || "",
      isLiked: false, // 預設為未點讚，可根據實際需求從 API 獲取
    };
  });
};

// 獲取標籤種類清單
const fetchVideoBigTypeList = async () => {
  try {
    // 從 localStorage 獲取 userData
    const userDataLocal = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userData") || "{}")
      : {};

    const requestBody = {
      MID: userDataLocal.MID || "",
      Token: userDataLocal.Token || "",
      MAID: userDataLocal.MAID || "",
      Mobile: userDataLocal.Mobile || "",
      Lang: "zhtw",
    };

    const response = await fetch(
      "https://23700999.com:8081/HMA/api/fr/getVideoBigTypeList",
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

    if (result.Result === "OK" && result.VideoBigTypeList) {
      // 轉換標籤格式
      const typeTags = result.VideoBigTypeList.map((type, index) => ({
        id: index + 1,
        name: type.Name || "",
        category: type.Type || "",
        videoBigType: type.Type || "",
      }));

      tags.value = [
        { id: 0, name: "全部影片", category: "all", videoBigType: null },
        ...typeTags,
      ];
    } else {
      console.error("API 返回錯誤:", result.Result || "未知錯誤");
    }
  } catch (error) {
    console.error("獲取標籤種類清單失敗:", error);
  }
};

// 根據選中標籤過濾影片
const filteredVideos = computed(() => {
  const activeTagData = tags.value.find((tag) => tag.id === activeTag.value);
  if (!activeTagData || activeTagData.category === "all") {
    return allVideos.value;
  }
  
  return allVideos.value.filter((video) => {
    if (!video.videoBigTypes || !Array.isArray(video.videoBigTypes)) {
      return false;
    }
    return video.videoBigTypes.some(
      (vbt) => vbt.VideoBigType === activeTagData.videoBigType
    );
  });
});

// 推薦影片（固定顯示前3個）
const recommendedVideos = computed(() => {
  return allVideos.value.slice(0, 3);
});

// 跳轉到影片詳細頁面
const goToVideoDetail = (videoId) => {
  navigateTo(`/clinicStoriesVideo${videoId}`);
};

// 影片載入完成處理
const onVideoLoad = () => {
  videoLoading.value = false;
};

// 影片載入開始處理
const onVideoLoadStart = () => {
  videoLoading.value = true;
};

// 點讚/取消點讚
const toggleLike = async (video) => {
  // 如果正在處理中，避免重複點擊
  if (video.isProcessing) return;
  
  video.isProcessing = true;
  const wasLiked = video.isLiked;
  
  try {
    // 從 localStorage 獲取 userData
    const userDataLocal = typeof window !== "undefined"
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
      // 可以顯示錯誤提示
    }
  } catch (error) {
    console.error("點讚操作失敗:", error);
    // 可以顯示錯誤提示
  } finally {
    video.isProcessing = false;
  }
};

// 獲取影片列表
const fetchVideoList = async () => {
  loading.value = true;
  try {
    // 從 localStorage 獲取 userData
    const userDataLocal = typeof window !== "undefined"
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
      // 只處理 Status 為 "Y" 的影片
      const activeVideos = result.VideoList.filter(
        (item) => item.Status === "Y"
      );
      allVideos.value = transformApiData(activeVideos);
    } else {
      console.error("API 返回錯誤:", result.Result || "未知錯誤");
    }
  } catch (error) {
    console.error("獲取影片列表失敗:", error);
  } finally {
    loading.value = false;
    videoLoading.value = false;
  }
};

// 組件掛載時獲取資料
onMounted(async () => {
  // 先獲取標籤清單，再獲取影片列表
  await fetchVideoBigTypeList();
  await fetchVideoList();
});

const modules = [FreeMode];
</script>

<style lang="scss" scoped>
.clinicStoriesWrap {
  @include gradientBg();
  width: 100%;
  min-height: 100vh;
  min-height: 100vh;
  padding: 0rem 0rem 84px;

  .clinicStoriesContainer {
    width: 100%;
    max-width: 768px;
    margin: 0 auto;
  }
  .funcTool {
    position: sticky;
    display: flex;
    flex-direction: column;
    padding: 0 1rem;
    background: transparent;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    top: 0;
    z-index: 10;
  }
  .notificationBell {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
    height: 44px;
    display: none;

    img {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
  }

  .clinicStoriesTagsGroup {
    width: 100%;
    z-index: 5;
    .tagsSwiper {
      width: 100%;
      padding:16px 0;
    }

    .tagSlide {
      width: auto;
    }

    .clinicStoriesTagsItem {
      @include neumorphismOuter($radius: 50px, $padding: 0.5rem 1rem);
      color: #74bc1f;
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      line-height: 100%;
      letter-spacing: 2.7px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.3s ease;

      &.active,
      &:hover {
        @include neumorphismOuter(
          $bgColor: #74bc1f,
          $radius: 50px,
          $padding: 0.5rem 1rem
        );
        color: white;
      }
    }
  }

  .recommendedSection {
    padding: 0 16px;
    margin: 8px 0;

    .sectionTitle {
      color: #1e1e1e;

      font-size: 20px;
      font-style: normal;
      font-weight: 700;
      line-height: 100%; /* 20px */
      letter-spacing: 3px;
    }

    .recommendedSwiper {
      width: 100%;
      padding: 1rem 0;
    }

    .videoSlide {
      width: 280px;
    }

    .videoCard {
      @include neumorphismOuter($padding: 0);
      overflow: hidden;
      height: 260px;
      cursor: pointer;

      .videoThumbnail {
        position: relative;
        width: 100%;
        height: 165px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.3s ease;
        }

        .videoLoading {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;

          .loadingSpinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e0e0e0;
            border-top: 3px solid #74bc1f;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
        }
      }

      .videoInfo {
        padding: 12px;

        .videoCardTitle {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 8px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .videoStats {
          display: flex;
          gap: 16px;
      

          .statItem {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #666;
            @include neumorphismOuter($radius: 50px, $padding: 4px 8px);

            img {
              width: 16px;
              height: 16px;
            }

            // 點讚按鈕可點擊
            &:first-child {
              cursor: pointer;
              transition: all 0.3s ease;
              user-select: none;

              &:hover {
                transform: scale(1.05);
              }

              &.liked {
                color: #EC4F4F;
                
               
              }
            }
          }
        }
      }
    }
  }

  .bottomVideoSection {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 24px;

    .videoCard.large {
      background: #f5f7fa;
      overflow: hidden;
      cursor: pointer;

      .videoThumbnail {
        position: relative;
        width: 100%;
        height: 240px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.3s ease;
        }

        .videoLoading {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;

          .loadingSpinner {
            width: 50px;
            height: 50px;
            border: 3px solid #e0e0e0;
            border-top: 3px solid #74bc1f;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
        }
      }

      .videoInfo {
        padding: 16px;

        .videoCardTitle {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          margin-bottom: 12px;
          line-height: 1.4;
        }
        p {
          overflow: hidden;
          color: var(--Neutral-500, #666);
          text-overflow: ellipsis;

          font-size: 14px;
          font-style: normal;
          font-weight: 500;
          line-height: normal;
        }

        .videoStats {
          display: flex;
          gap: 16px;
          margin-top: 12px;

          .statItem {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #666;
            @include neumorphismOuter($radius: 50px, $padding: 4px 8px);

            img {
              width: 16px;
              height: 16px;
            }

            // 點讚按鈕可點擊
            &:first-child {
              cursor: pointer;
              transition: all 0.3s ease;
              user-select: none;

              &:hover {
                transform: scale(1.05);
              }

              &.liked {
                color: #EC4F4F;
              }
            }
          }
        }
      }
    }
  }
}

// Loading 動畫
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
