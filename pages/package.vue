<template>
  <RaphaelLoading v-if="loading" />
  <TitleMenu Text="包裹查詢" link="/user" />
  <div class="packageWrap">
    <!-- 當 hasPackage 為 true 時，顯示包裹清單 -->
    <div class="packageGroup" v-if="hasPackage">
      <h3>您所有的包裹編號</h3>
      <p>點擊該筆編號會直接跳轉到該物流的查詢頁面，自動幫您查詢包裹狀態!</p>
      <div
        class="package"
        v-for="(item, index) in packageList"
        :key="index"
        @click="openLogistics(item)"
      >
        <div class="packageTitle">
          <!-- 產品標題 -->
          <h4>{{ item.ProductName }}</h4>
          <img src="../assets/imgs/search.svg" alt="" />
        </div>
        <!-- 包裹編號 -->
        <div class="packageNumber">{{ item.SendNumber }}</div>
        <!-- 物流名稱 (黑貓 / 全球) -->
        <h5>{{ item.SendChannelName }}</h5>
        <!-- 寄送時間 (若無資料則不顯示) -->
        <h6 v-if="item.CheckTime">寄送時間 {{ item.CheckTime }}</h6>
        <!-- 寄件地址 (若無資料則不顯示) -->
        <h6 v-if="item.SendAddr">寄件地址 {{ item.SendAddr }}</h6>
      </div>
    </div>

    <!-- 若沒有包裹，就顯示替代的圖片區和推薦商品區 -->
    <div class="notPackageWrap" v-else-if="hasLoaded">
      <div class="notPackageGroup">
        <img src="../assets/imgs/notPackageImg.png" alt="" />
        <p>您的包裹還在路上？不妨先看看這些為您精選的健康方案</p>
      </div>

      <!-- 推薦商品區 -->
      <div class="recommend">
        <h3
          class="recommendTitle"
          v-if="purchasedProducts.length < 4 && recommendedProducts.length > 0"
        >
          健康方案推薦
          <span v-if="recommendedProducts.length > 1">
            <!-- 左箭頭 -->
            <svg
              @click.stop="prevRecommend"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="25"
              viewBox="0 0 24 25"
              fill="none"
            >
              <path
                d="M16.011 5.04146L8.70297 12.5385L16.011 20.0355C16.1418 20.1694 16.2151 20.3492 16.2151 20.5365C16.2151 20.7237 16.1418 20.9035 16.011 21.0375C15.9474 21.1023 15.8716 21.1538 15.7879 21.189C15.7042 21.2242 15.6143 21.2423 15.5235 21.2423C15.4327 21.2423 15.3428 21.2242 15.2591 21.189C15.1754 21.1538 15.0995 21.1023 15.036 21.0375L7.25997 13.062C7.12345 12.9219 7.04705 12.734 7.04705 12.5385C7.04705 12.3429 7.12345 12.155 7.25997 12.015L15.0345 4.03946C15.0981 3.97414 15.1741 3.92223 15.2581 3.88678C15.3421 3.85134 15.4323 3.83307 15.5235 3.83307C15.6146 3.83307 15.7049 3.85134 15.7889 3.88678C15.8728 3.92223 15.9489 3.97414 16.0125 4.03946C16.1433 4.17341 16.2166 4.35322 16.2166 4.54046C16.2166 4.7277 16.1433 4.90751 16.0125 5.04146H16.011Z"
                fill="#1E1E1E"
              />
            </svg>
            <!-- 右箭頭 -->
            <svg
              @click.stop="nextRecommend"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="25"
              viewBox="0 0 24 25"
              fill="none"
            >
              <path
                d="M7.98903 5.04146L15.297 12.5385L7.98903 20.0355C7.85819 20.1694 7.78495 20.3492 7.78495 20.5365C7.78495 20.7237 7.85819 20.9035 7.98903 21.0375C8.05257 21.1023 8.12842 21.1538 8.21213 21.189C8.29584 21.2242 8.38573 21.2423 8.47653 21.2423C8.56733 21.2423 8.65721 21.2242 8.74092 21.189C8.82463 21.1538 8.90048 21.1023 8.96403 21.0375L16.74 13.062C16.8765 12.9219 16.953 12.734 16.953 12.5385C16.953 12.3429 16.8765 12.155 16.74 12.015L8.96553 4.03946C8.90193 3.97414 8.8259 3.92223 8.74191 3.88678C8.65792 3.85134 8.56769 3.83307 8.47653 3.83307C8.38537 3.83307 8.29513 3.85134 8.21114 3.88678C8.12715 3.92223 8.05112 3.97414 7.98753 4.03946C7.85669 4.17341 7.78345 4.35322 7.78345 4.54046C7.78345 4.7277 7.85669 4.90751 7.98753 5.04146H7.98903Z"
                fill="#1E1E1E"
              />
            </svg>
          </span>
        </h3>

        <!-- 輪播容器 -->
        <div
          class="recommendWrap"
          v-if="purchasedProducts.length < 4 && recommendedProducts.length > 0"
        >
          <transition name="fade" mode="out-in">
            <div
              class="recommendDiv"
              :key="currentRecommendIndex"
              v-if="recommendedProducts[currentRecommendIndex]"
            >
              <div class="imgGroup">
                <img
                  :src="
                    getImage(recommendedProducts[currentRecommendIndex].name)
                  "
                  alt="product image"
                />
                <img
                  v-if="
                    shouldShowRobot(
                      recommendedProducts[currentRecommendIndex].name
                    )
                  "
                  class="robotImg"
                  src="/assets/imgs/clothRobot.png"
                  alt="robot image"
                />
                <div class="circle"></div>
              </div>
              <h3 class="recommendName">
                {{ recommendedProducts[currentRecommendIndex].name }}
              </h3>
              <p>{{ recommendedProducts[currentRecommendIndex].slogan }}</p>
              <div class="priceGroup">
                <div
                  class="priceItem"
                  v-for="(price, idx) in parsePrices(
                    recommendedProducts[currentRecommendIndex].price
                  )"
                  :key="idx"
                >
                  <span class="priceValue">{{ price.value }}</span>
                  <span class="pricePeriod">/{{ price.period }}</span>
                </div>
              </div>
              <button class="contactBtn" @click="contactSupport">
                聯絡客服
              </button>
              <div class="featureTitle">產品特色</div>
              <ul class="featureListGroup">
                <li
                  v-for="(feature, idx) in recommendedProducts[
                    currentRecommendIndex
                  ].features"
                  :key="idx"
                >
                  {{ feature }}
                </li>
              </ul>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";

const loading = ref(false);
const hasLoaded = ref(false);

// 假設有個 TitleMenu 組件
import TitleMenu from "@/components/TitleMenu.vue";

// 圖檔示例
import redLightClothes from "@/assets/imgs/redLightClothes.png";
import redLightClothes2 from "@/assets/imgs/redLightClothes2.png";
import normalClothes from "@/assets/imgs/normalClothes.png";

// ------------------ 這邊放「取得會員資訊」的邏輯 (示例) ------------------
const localData = localStorage.getItem("userData");
let userData = localData ? JSON.parse(localData) : null;
if (!userData || !userData.MID) {
  // 如果沒有 userData，就導回首頁
  window.location.href = "/";
}
const { MID, Token, MAID, Mobile } = userData;

// ------------------ 用於判斷是否有包裹 ------------------
const hasPackage = ref(false);
const packageList = ref([]);

// ------------------ 推薦相關 data ------------------
const purchasedProducts = ref([]); // 已購買
const recommendedProducts = ref([]); // 推薦

// ------------------ 產品圖片對應 ------------------
const productImages = {
  雙效紅光活力衣: redLightClothes,
  全效調節衣: redLightClothes2,
  三效深眠衣: normalClothes,
  居家治療儀: redLightClothes2,
};
function getImage(productName) {
  return productImages[productName] || normalClothes;
}
function shouldShowRobot(productName) {
  return productName === "居家治療儀";
}

// ------------------ 輪播參數 ------------------
const currentRecommendIndex = ref(0);
let autoPlayTimer = null;

function prevRecommend() {
  if (recommendedProducts.value.length <= 1) return;
  currentRecommendIndex.value =
    (currentRecommendIndex.value - 1 + recommendedProducts.value.length) %
    recommendedProducts.value.length;
  resetAutoPlay();
}
function nextRecommend() {
  if (recommendedProducts.value.length <= 1) return;
  currentRecommendIndex.value =
    (currentRecommendIndex.value + 1) % recommendedProducts.value.length;
  resetAutoPlay();
}
function startAutoPlay() {
  stopAutoPlay();
  if (recommendedProducts.value.length > 1) {
    autoPlayTimer = setInterval(() => {
      nextRecommend();
    }, 7000); // 每 7 秒自動切換一次
  }
}
function stopAutoPlay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
}
function resetAutoPlay() {
  stopAutoPlay();
  startAutoPlay();
}

// ------------------ 解析價格字串的方法 ------------------
function parsePrices(priceString) {
  if (!priceString) return [];
  return priceString.split(";").map((part) => {
    const [val, per] = part.trim().split("/");
    return { value: val.trim(), period: per ? per.trim() : "" };
  });
}

// ------------------ 聯絡客服 ------------------
function contactSupport() {
  window.location.href = "tel:0800000760";
}

// ------------------ 點擊包裹，導向物流查詢頁面 ------------------
function openLogistics(item) {
  // 後端已提供查詢連結 sURL
  if (item.sURL) {
    window.open(item.sURL, "_blank");
  }
}

// ------------------ 串接 /api/fr/QueryPack 取得包裹資訊 ------------------
async function fetchPackageList() {
  loading.value = true;
  try {
    // 這邊的參數結構可依後端實際需求調整
    const resp = await axios.post(
      "https://23700999.com:8081/HMA/api/fr/QueryPack",
      {
        MID,
        Token,
        MAID,
        Mobile ,
      }
    );

    // 假設後端回傳結構:
    // {
    //   "RetPack": [...],
    //   "Result": "OK"
    // }
    if (resp.data && resp.data.Result === "OK" && resp.data.RetPack) {
      // 1) 取出陣列
      const packs = resp.data.RetPack;

      // 2) 依照 CheckTime 從新到舊排序 (CheckTime 格式: 2025/03/28 12:35 ...)
      packs.sort((a, b) => {
        // 若要確保能正確比較，可將日期轉成標準格式再比較
        const dateA = new Date(a.CheckTime.replace(/\//g, "-"));
        const dateB = new Date(b.CheckTime.replace(/\//g, "-"));
        return dateB - dateA; // 新到舊
      });

      // 3) 存到前端 state
      packageList.value = packs;
      hasPackage.value = packageList.value.length > 0;
    } else {
      hasPackage.value = false;
    }
  } catch (err) {
    console.error("API 抓取失敗", err);
    hasPackage.value = false;
  } finally {
    loading.value = false;
    hasLoaded.value = true;
  }
}

// ------------------ 抓取推薦商品 API (如有需要) ------------------
async function fetchRecommend() {
  loading.value = true;
  try {
    const resp = await axios.post(
      "https://23700999.com:8081/HMA/API_USE1.jsp",
      {
        MID,
        Token,
        MAID,
        Mobile,
      }
    );
    if (resp.status === 200 && resp.data) {
      purchasedProducts.value = resp.data.PurchaseProduct || [];

      const promo = resp.data.PromoteProduct || [];
      recommendedProducts.value = promo.map((item) => ({
        name: item.ProductName,
        price: item.Desc1,
        features: item.Desc2 ? item.Desc2.split("。").filter(Boolean) : [],
        slogan: item.Desc3,
      }));
    }
  } catch (err) {
    console.error("API 抓取失敗", err);
  } finally {
    loading.value = false;
    hasLoaded.value = true;
  }
}

// ------------------ onMounted / onBeforeUnmount ------------------
onMounted(async () => {
  // 1) 先抓取包裹資料
  await fetchPackageList();

  // 2) 再抓取推薦商品
  await fetchRecommend();

  // 3) 若符合條件，就開啟自動輪播
  if (
    purchasedProducts.value.length < 4 &&
    recommendedProducts.value.length > 1
  ) {
    startAutoPlay();
  }
});

onBeforeUnmount(() => {
  stopAutoPlay();
});
</script>

<style lang="scss">
.packageWrap {
  background-color: #f6f6f6;
  padding: 0 5% 60px;
  min-height: 100vh;
  .packageGroup {
    border-radius: 12px;
    background: var(--primary-orange-100, #fef1e2);
    padding: 12px;
    h3 {
      color: var(--shade-black, #1e1e1e);
      font-family: "Noto Sans";
      font-size: 20px;
      font-style: normal;
      font-weight: 700;
      line-height: 100%; /* 20px */
      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
    }
    p {
      color: var(--primary-brown-400, #bc581f);

      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      line-height: 29.124px; /* 161.8% */
      letter-spacing: 0.09px;
    }
    .package {
      border-radius: 8px;
      background: var(--shade-white, #fff);
      padding: 12px;
      margin: 0.85rem 0;
      cursor: pointer;
      .packageTitle {
        display: flex;
        justify-content: space-between;
        h4 {
          color: var(--shade-black, #1e1e1e);
          font-size: 20px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: var(--Title-Medium-Tracking, 0.15px);
        }
      }
      .packageNumber {
        color: var(--brand-green-400, #74bc1f);

        font-size: 24px;
        font-style: normal;
        font-weight: 700;

        letter-spacing: 0.12px;
        margin-top: 0.35rem;
      }
      h5 {
        color: var(--shade-gray-300, #ccc);
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.5px;
        margin-bottom: 0.25rem;
        margin-top: 0.5rem;
      }
      h6 {
        color: var(--shade-gray-300, #ccc);
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.06px;
        line-height: 1.35;
      }
    }
  }
  .notPackageWrap {
    .notPackageGroup {
      padding: 12px;
      border-radius: 12px;
      background: var(--primary-orange-100, #fef1e2);
    }

    img {
      border-radius: 8px;
    }
    p {
      color: #1e1e1e;
      font-family: "Noto Sans";
      font-size: 20px;
      font-style: normal;
      font-weight: 700;
      line-height: 32.36px;
      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
    }
  }
  .recommendWrap {
    display: grid;
    gap: 0.75rem;
    margin-top: 0.75rem;
    min-height: 400px;
    .robotImg {
      position: absolute;
      width: 105px;
      height: auto !important;
      bottom: 0;
      left: 48.5%;
      z-index: 3;
    }
    p {
      color: #1e1e1e;
      text-align: center;
      font-size: 18px;
      font-style: normal;
      margin-top: 0.65rem;
      letter-spacing: 0.09px;
    }

    .recommendDiv {
      width: 100%;
      background-color: $raphael-white;
      border-radius: 12px;
      padding-top: 0.75rem;
      padding: 0.75rem;
      .imgGroup {
        position: relative;
        display: grid;
        place-items: center;
        gap: 0.5rem;

        & > img {
          height: 170px;
          z-index: 3;
        }

        .circle {
          @include circleAnimate(160px, $raphael-white, 1, 0px, unset);
        }
      }

      .recommendName {
        color: $raphael-black;
        text-align: center;
        font-size: 18px;
        font-weight: 400;
        letter-spacing: 0.09px;
        margin-top: 0.5rem;
      }

      .priceGroup {
        display: grid;
        justify-content: center;
        gap: 0.75rem;
        margin-top: 1rem;

        .priceItem {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.2;
          .pricePeriod {
            font-size: 1.125rem;
            font-weight: normal;
          }
        }
      }

      .contactBtn {
        @include btnWithBorderStyle($raphael-green-400, $raphael-green-400);
        margin-top: 1rem;
      }

      .featureTitle {
        color: $raphael-black;
        font-size: 20px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.15px;
        margin-top: 1rem;
      }
      .featureListGroup {
        margin-top: 0.5rem;
        counter-reset: list-counter;
        li {
          display: flex;
          color: $raphael-black;
          font-size: 18px;
          font-weight: 400;
          line-height: 29.124px;
          letter-spacing: 0.09px;
          counter-increment: list-counter;
          &::before {
            content: "•";
          }
        }
      }
    }
  }
  .recommendTitle {
    color: $raphael-black;
    font-size: 1.25rem;
    font-style: normal;
    font-weight: 400;
    line-height: 100%;
    letter-spacing: 0.15px;
    padding-top: 1rem;
    display: flex;
    justify-content: space-between;
    span {
      cursor: pointer;
      display: flex;
      gap: 1rem;
    }
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
}
</style>
