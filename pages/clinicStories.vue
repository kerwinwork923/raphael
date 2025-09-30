<template>
  <div class="clinicStoriesWrap">
    <div class="clinicStoriesContainer">
    <div class="notificationBell">
      <img src="../assets/imgs/member/bell.svg" alt="通知" />
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
        <swiper-slide v-for="tag in visibleTags" :key="tag.id" class="tagSlide">
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
              <img :src="video.thumbnail" :alt="video.title" />

            </div>
            <div class="videoInfo">
              <h3 class="videoCardTitle">{{ video.fullTitle }}</h3>
              <div class="videoStats">
                <div class="statItem">
                  <img src="../assets/imgs/clinicStories/good.svg" alt="讚" />
                  <span>{{ video.likes }}</span>
                </div>
                <div class="statItem">
                  <img
                    src="../assets/imgs/clinicStories/bubble.svg"
                    alt="留言"
                  />
                  <span>{{ video.comments }}</span>
                </div>
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
          <img :src="video.thumbnail" :alt="video.title" />

        </div>
        <div class="videoInfo">
          <h3 class="videoCardTitle">{{ video.fullTitle }}</h3>
          <div class="videoTags">
            <swiper
              :slides-per-view="'auto'"
              :space-between="8"
              :free-mode="true"
              class="tagsSwiper"
            >
              <swiper-slide
                v-for="tag in video.tags"
                :key="tag"
                class="tagSlide"
              >
                <span class="videoTag">{{ tag }}</span>
              </swiper-slide>
              </swiper>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import BottomNav from "~/components/BottomNav.vue";
import TitleMenu from "~/components/TitleMenu.vue";

// 會員狀態
const isVipMember = ref(false); // 可以從 store 或 API 獲取

// 標籤資料
const tags = ref([
  { id: 0, name: "全部影片", category: "all" },
  { id: 1, name: "醫師解密", category: "doctor", isVip: true },
  { id: 2, name: "案例分享", category: "case" },
  { id: 3, name: "健康知識", category: "health" },
  { id: 4, name: "治療心得", category: "treatment" },
]);

const activeTag = ref(0);

const setActiveTag = (tagId) => {
  activeTag.value = tagId;
};

// 根據會員狀態過濾標籤
const visibleTags = computed(() => {
  return tags.value.filter(tag => {
    if (tag.isVip && !isVipMember.value) {
      return false;
    }
    return true;
  });
});

// 所有影片資料
const allVideos = ref([
  {
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
    tags: ["自律神經", "失眠", "焦慮", "耳鳴", "康復", "案例分享"]
  },
  {
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
    tags: ["醫師", "醫學", "治療", "專業", "解密"]
  },
  {
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
    tags: ["養生", "保健", "健康", "日常", "管理"]
  },
  {
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
    tags: ["康復", "心得", "分享", "治療", "體驗"]
  }
]);

// 根據選中標籤過濾影片
const filteredVideos = computed(() => {
  const activeTagData = tags.value.find(tag => tag.id === activeTag.value);
  if (!activeTagData || activeTagData.category === 'all') {
    return allVideos.value;
  }
  return allVideos.value.filter(video => video.category === activeTagData.category);
});

// 推薦影片（固定顯示前3個）
const recommendedVideos = computed(() => {
  return allVideos.value.slice(0, 3);
});

// 跳轉到影片詳細頁面
const goToVideoDetail = (videoId) => {
  navigateTo(`/clinicStoriesVideo/${videoId}`);
};

const modules = [FreeMode];
</script>

<style lang="scss" scoped>
.clinicStoriesWrap {
  @include gradientBg();
  width: 100%;
  min-height: 100vh;
  min-height: 100vh;
  padding: 0.5rem 0rem 0rem;
  padding-bottom: 80px; // 為底部導航留空間
  
  .clinicStoriesContainer {
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
  }

  .notificationBell {
    position: absolute;
    top: 1.25rem;
    right: 16px;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    img {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
  }

  .clinicStoriesTagsGroup {
    position: sticky;
    top: 3.25rem;
    left: 0;
    width: 100%;
    z-index: 5;
    padding: 0 16px;

    .tagsSwiper {
      width: 100%;
    }

    .tagSlide {
      width: auto;
    }

    .clinicStoriesTagsItem {
      font-size: 1.25rem;
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Secondary-100, #f5f7fa);
  
      color: var(--Primary-default, #74bc1f);
      font-family: "Noto Sans";
      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;
      line-height: 100%;
      letter-spacing: 2.7px;
      padding: 0.5rem 1rem;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.3s ease;

      &.active {
        background: var(--Primary-default, #74bc1f);
        color: white;
        transform: scale(1.05);
      }
    }
  }

  .recommendedSection {
    margin-top: 100px; // 為固定標籤留空間
    padding: 0 16px;
    margin-bottom: 24px;

    .sectionTitle {
      font-size: 24px;
      font-weight: 600;
      color: var(--Primary-default, #74bc1f);
      margin-bottom: 16px;
      font-family: "Noto Sans";
    }

    .recommendedSwiper {
      width: 100%;
      
    }

    .videoSlide {
      width: 280px;
    }

    .videoCard {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      height: 250px;
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

            img {
              width: 16px;
              height: 16px;
            }
          }
        }
      }
    }
  }

  .bottomVideoSection {
    padding: 0 16px;
    margin-bottom: 24px;

    .videoCard.large {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 1rem;
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

        .videoTags {
          .tagsSwiper {
            width: 100%;
          }

          .tagSlide {
            width: auto;
          }

          .videoTag {
            display: inline-block;
            background: #f0f0f0;
            color: #666;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            white-space: nowrap;
          }
        }
      }
    }
  }
}
</style>
