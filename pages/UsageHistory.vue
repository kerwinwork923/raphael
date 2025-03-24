<template>
  <RaphaelLoading v-if="loading" />
  <div class="usageHistoryWrap">
    <TitleMenu Text="使用紀錄" link="/user" />
    <ChangeUsageTags></ChangeUsageTags>
    <div class="productWrap">
      <h3 class="yourProductTitle" v-if="purchasedProducts.length > 1">
        您的產品
      </h3>
      <div class="haveProductWrap">
        <!-- ============== 單件產品展示 ============== -->
        <div class="haveGroup" v-if="purchasedProducts.length === 1">
          <div class="haveIcon">
            <img
              :src="selectedProductIndex === 0 ? checkedIcon : uncheckedIcon"
              alt="checked icon"
            />
          </div>
          <div class="haveProduct">
            <div class="imgGroup">
              <img :src="getImage(purchasedProducts[0])" alt="product image" />
              <div class="circle"></div>
              <img
                v-if="shouldShowRobot(purchasedProducts[0])"
                class="robotImg"
                src="/assets/imgs/clothRobot.png"
                alt="robot image"
              />
            </div>
            <h3 class="productName">{{ purchasedProducts[0] }}</h3>
            <h6>上次使用 : {{ getLastUsedString(purchasedProducts[0]) }}</h6>
          </div>
        </div>

        <!-- ============== 多件產品展示 ============== -->
        <div class="haveGroup2" v-if="purchasedProducts.length > 1">
          <div
            class="haveProduct"
            v-for="(product, index) in purchasedProducts"
            :key="index"
            @click="selectProduct(index)"
          >
            <div class="haveIcon">
              <img
                :src="
                  selectedProductIndex === index ? checkedIcon : uncheckedIcon
                "
                :alt="
                  selectedProductIndex === index
                    ? 'checked icon'
                    : 'unchecked icon'
                "
              />
            </div>
            <div class="imgGroup">
              <img :src="getImage(product)" alt="product image" />
              <img
                v-if="shouldShowRobot(product)"
                class="robotImg"
                src="/assets/imgs/clothRobot.png"
                alt="robot image"
              />
              <div class="circle"></div>
            </div>
            <h3 class="productName">{{ product }}</h3>
            <h6>上次使用 : {{ getLastUsedString(product) }}</h6>
          </div>
        </div>
      </div>

      <!-- ============== 健康方案推薦（若未買滿 4 件，且有推薦資料） ============== -->
      <h3
        class="recommendTitle"
        v-if="purchasedProducts.length < 4 && recommendedProducts.length > 0"
      >
        健康方案推薦

        <!-- 左右箭頭（只有多筆推薦才顯示） -->
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

      <!-- 輪播容器：只顯示當前索引的推薦產品 -->
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
            <!-- 目前顯示的推薦產品 -->
            <div class="imgGroup">
              <img
                :src="getImage(recommendedProducts[currentRecommendIndex].name)"
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
            <button class="contactBtn" @click="contactSupport">聯絡客服</button>
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

    <!-- 底部按鈕 -->
    <div class="optionWrap">
      <button @click="goUse" v-if="purchasedProducts.length >= 1">
        開始使用
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";

// 假設這些已存在的圖檔
import checkedIcon from "@/assets/imgs/haveCheck.png";
import uncheckedIcon from "@/assets/imgs/usageUnCheck.png";
import redLightClothes from "@/assets/imgs/redLightClothes.png";
import normalClothes from "@/assets/imgs/normalClothes.png";
import redLightClothes2 from "@/assets/imgs/redLightClothes2.png";

// 例如有個 RaphaelLoading
import RaphaelLoading from "@/components/RaphaelLoading.vue";
// 例如有個 TitleMenu
import TitleMenu from "@/components/TitleMenu.vue";

export default {
  components: { RaphaelLoading, TitleMenu },
  setup() {
    const loading = ref(false);

    const purchasedProducts = ref([]); // 已購買的產品
    const recommendedProducts = ref([]); // 推薦的產品
    const useRecord = ref([]); // 使用紀錄

    const selectedProductIndex = ref(0); // 點擊哪個產品

    // 輪播索引 & 計時器
    const currentRecommendIndex = ref(0);
    let autoPlayTimer = null;

    // 取出 userData
    const localData = localStorage.getItem("userData");
    let userData = localData ? JSON.parse(localData) : null;

    if (!userData || !userData.MID) {
      // 如果沒有 userData 就導回首頁
      window.location.href = "/";
      return;
    }
    const { MID, Token, MAID, Mobile } = userData;

    // 產品圖片對應
    const productImages = {
      雙效紅光活力衣: redLightClothes,
      全效調節衣: redLightClothes2,
      三效深眠衣: normalClothes,
      居家治療儀: redLightClothes2,
    };

    // ------------------ API 抓取資料 ------------------
    const fetchProducts = async () => {
      loading.value = true;
      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_USE1.jsp",
          { MID, Token, MAID, Mobile }
        );
        if (response.status === 200 && response.data) {
          purchasedProducts.value = response.data.PurchaseProduct || [];
          useRecord.value = response.data.UseRecord || [];

          // 將 PromoteProduct 轉成 recommendedProducts
          const promoteArr = response.data.PromoteProduct || [];
          recommendedProducts.value = promoteArr.map((item) => ({
            name: item.ProductName,
            price: item.Desc1,
            features: item.Desc2.split("。").filter((desc) => desc),
            slogan: item.Desc3,
          }));
        } else {
          console.error("獲取產品資料失敗", response.data);
        }
      } catch (err) {
        console.error("API 請求失敗：", err);
      } finally {
        loading.value = false;
      }
    };

    // -------------- getImage & shouldShowRobot --------------
    const getImage = (productName) => {
      return productImages[productName] || normalClothes;
    };
    const shouldShowRobot = (productName) => {
      return productName === "居家治療儀";
    };

    // -------------- 解析產品價格 --------------
    const parsePrices = (priceString) => {
      if (!priceString) return [];
      return priceString.split(";").map((part) => {
        const [val, per] = part.trim().split("/");
        return { value: val.trim(), period: per ? per.trim() : "" };
      });
    };

    // -------------- 產品切換 --------------
    const selectProduct = (index) => {
      selectedProductIndex.value = index;
    };

    // -------------- 開始使用產品 --------------
    const goUse = () => {
      const productName = purchasedProducts.value[selectedProductIndex.value];
      // 此處你可根據需求檢查 hasUsedToday(productName) ...
      window.location.href = `/usageHistoryInfo/${productName}`;
    };

    // -------------- 聯繫客服 --------------
    const contactSupport = () => {
      window.location.href = "tel:0800000760";
    };

    // -------------- 上次使用：僅示範回傳字樣 --------------
    function getLastUsedString(productName) {
      // 1) 過濾出屬於該 `productName` 的所有使用紀錄
      const records = useRecord.value.filter(
        (r) => r.ProductName === productName
      );
      if (records.length === 0) {
        // 若無紀錄，顯示「尚未使用」
        return "尚未使用";
      }

      // 2) 找出最晚 (最新) 的 EndTime，並轉換成時間戳 (ms)
      let lastUsedTimestamp = 0;
      records.forEach((record) => {
        // "2025/03/20 17:46" 之類的格式 → 轉成可用的時間戳
        const endTimeMs = new Date(record.EndTime.replace(/-/g, "/")).getTime();
        if (endTimeMs > lastUsedTimestamp) {
          lastUsedTimestamp = endTimeMs;
        }
      });

      // 3) 與目前時間做比較
      const now = Date.now();
      const diffMs = now - lastUsedTimestamp;

      // 如果仍比現在時間晚，視為「尚未使用」或其它判斷
      if (diffMs < 0) {
        return "尚未使用";
      }

      // 4) 轉換成「天數」差
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // 5) 根據天數差決定回傳字串
      if (diffDays === 0) {
        return "今日";
      } else if (diffDays === 1) {
        return "昨日";
      } else {
        return `${diffDays} 日前`;
      }
    }

    // -------------- 輪播功能：手動 & 自動 --------------
    const prevRecommend = () => {
      if (recommendedProducts.value.length <= 1) return;
      currentRecommendIndex.value =
        (currentRecommendIndex.value - 1 + recommendedProducts.value.length) %
        recommendedProducts.value.length;
      resetAutoPlay();
    };

    const nextRecommend = () => {
      if (recommendedProducts.value.length <= 1) return;
      currentRecommendIndex.value =
        (currentRecommendIndex.value + 1) % recommendedProducts.value.length;
      resetAutoPlay();
    };

    const startAutoPlay = () => {
      stopAutoPlay();
      if (recommendedProducts.value.length > 1) {
        autoPlayTimer = setInterval(() => {
          nextRecommend();
        }, 7000); // 7 秒切換一次
      }
    };

    const stopAutoPlay = () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    };

    const resetAutoPlay = () => {
      stopAutoPlay();
      startAutoPlay();
    };

    // ------------------ onMounted ------------------
    onMounted(async () => {
      await fetchProducts();

      // 若產品未滿4 & 有多筆推薦 => 啟動自動輪播
      if (
        purchasedProducts.value.length < 4 &&
        recommendedProducts.value.length > 1
      ) {
        startAutoPlay();
      }
    });

    // ------------------ onBeforeUnmount ------------------
    onBeforeUnmount(() => {
      stopAutoPlay();
    });

    return {
      loading,
      purchasedProducts,
      recommendedProducts,
      useRecord,

      selectedProductIndex,
      getLastUsedString,

      // 輪播
      currentRecommendIndex,
      prevRecommend,
      nextRecommend,

      // 其他
      getImage,
      shouldShowRobot,
      parsePrices,
      selectProduct,
      goUse,
      contactSupport,

      // ICON
      checkedIcon,
      uncheckedIcon,
    };
  },
};
</script>

<style lang="scss" scoped>
.usageHistoryWrap {
  display: flex;
  flex-direction: column;
  place-items: center;
  background-color: $raphael-gray-100;
  min-height: 100vh;
  width: 100%;
  padding: 0 1rem;
  padding-bottom: 116px;
  .productWrap {
    width: 100%;
    max-width: 768px;
    .yourProductTitle {
      color: $raphael-black;
      font-size: 20px;
      font-weight: 400;
      letter-spacing: 0.15px;
      padding-top: 0.75rem;
    }
    .haveProductWrap {
      margin-top: 0.75rem;
      .hasDetectBlock {
        border-radius: 8px;
        border: 1px solid #fff;
        background: rgba(255, 255, 255, 0.85);
        box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
        backdrop-filter: blur(4.5px);
        color: #ec4f4f;

        font-size: 16px;
        font-style: normal;
        font-weight: 700;

        letter-spacing: 0.12px;
        padding: 12px;
        position: absolute;
        z-index: 10;
        text-align: center;
        .hasDetectTime {
          padding: 0.35rem;
          font-size: 1.5rem;
        }
      }
      .haveGroup {
        display: grid;
        place-items: center;
        gap: 0.75rem;

        .haveIcon {
          width: 24px;
        }
        .haveProduct {
          display: grid;
          place-items: center;
          gap: 0.5rem;

          .imgGroup {
            position: relative;
            display: grid;
            place-items: center;

            > img {
              height: 285px;
              z-index: 3;
            }

            .robotImg {
              position: absolute;
              width: 176px;
              height: auto;
              bottom: 0;
              right: 0;
              z-index: 3;
            }

            .circle {
              @include circleAnimate(
                270px,
                rgba(255, 255, 255, 0.85),
                0.6,
                1px,
                rotate 4s infinite linear
              );
            }
          }

          .productName {
            color: $raphael-black;
            font-size: 1.5rem;
            font-style: normal;
            font-weight: 700;
            letter-spacing: 0.12px;
          }
        }
        h6 {
          color: var(--shade-gray-500, #666);
          font-size: 16px;
          font-style: normal;
          font-weight: 400;
          line-height: 100%;
          letter-spacing: 0.5px;
        }
      }

      .haveGroup2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        place-items: center;
        gap: 0.75rem;

        .haveProduct {
          display: grid;
          place-items: center;
          gap: 0.5rem;
          transition: 0.2s ease all;
          animation: fadeIn2 1s ease forwards;
          animation-delay: 0s;
          opacity: 0;

          @for $i from 1 through 4 {
            &:nth-child(#{$i}) {
              animation-delay: $i * 0.07s;
            }
          }

          .haveIcon {
            width: 24px;
          }

          .imgGroup {
            position: relative;
            display: grid;
            place-items: center;
            gap: 0.5rem;

            > img {
              height: 170px;
              z-index: 3;
            }

            .circle {
              @include circleAnimate(
                160px,
                rgba(255, 255, 255, 0.85),
                0.6,
                1px,
                rotate 4s infinite linear
              );
            }
            .robotImg {
              position: absolute;
              width: 105px;
              height: auto;
              bottom: 0;
              right: 0;
              z-index: 3;
            }
          }
          .productName {
            color: $raphael-black;
            font-size: 1.25rem;
            font-style: normal;
            font-weight: 700;
            letter-spacing: 0.12px;
          }
          .productSubTitle {
            color: $raphael-black;
            font-size: 1.25rem;
            font-style: normal;
            font-weight: 700;
            letter-spacing: 0.12px;
            margin-top: 0.75rem;
          }

          @keyframes fadeIn2 {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }

        h6 {
          color: var(--shade-gray-500, #666);
          font-size: 16px;
          font-style: normal;
          font-weight: 400;
          line-height: 100%;
          letter-spacing: 0.5px;
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
  }
}

.optionWrap {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 100%;
  max-width: 768px;
  padding: 1rem 1rem 3.125rem 1rem;
  background-color: $raphael-gray-100;
  z-index: 99;

  button {
    @include btnStyle($raphael-green-400, $raphael-white);
  }
}

/* 旋轉效果 */
@keyframes rotate {
  0% {
    transform: scale(1.03) rotate(0deg);
    filter: brightness(1.2) blur(1px);
  }
  50% {
    transform: scale(1.05) rotate(180deg);
    filter: brightness(1.2) blur(3px);
  }
  100% {
    transform: scale(1.03) rotate(360deg);
    filter: brightness(1.2) blur(1px);
  }
}

/* 流動效果 */
@keyframes aurora {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
// 外光暈
@keyframes outerLight {
  20% {
    box-shadow: 0 0 12px rgba(114, 188, 32, 0.9),
      0 0 10px rgba(71, 188, 107, 0.9), 0 0 8px rgba(0, 210, 255, 0.9),
      0 0 6px rgba(58, 123, 213, 0.9), 0 0 4px rgba(98, 87, 143, 0.9),
      0 0 2px rgba(167, 82, 111, 0.9);
  }
  40% {
    box-shadow: 0 0 12px rgba(114, 188, 32, 0.8),
      0 0 10px rgba(71, 188, 107, 0.8), 0 0 8px rgba(0, 210, 255, 0.8),
      0 0 6px rgba(58, 123, 213, 0.8), 0 0 4px rgba(98, 87, 143, 0.8),
      0 0 2px rgba(167, 82, 111, 0.8);
  }
  60% {
    box-shadow: 0 0 12px rgba(114, 188, 32, 0.7),
      0 0 10px rgba(71, 188, 107, 0.7), 0 0 8px rgba(0, 210, 255, 0.7),
      0 0 6px rgba(58, 123, 213, 0.7), 0 0 4px rgba(98, 87, 143, 0.7),
      0 0 2px rgba(167, 82, 111, 0.7);
  }
  80% {
    box-shadow: 0 0 12px rgba(114, 188, 32, 0.6),
      0 0 10px rgba(71, 188, 107, 0.6), 0 0 8px rgba(0, 210, 255, 0.6),
      0 0 6px rgba(58, 123, 213, 0.6), 0 0 4px rgba(98, 87, 143, 0.6),
      0 0 2px rgba(167, 82, 111, 0.6);
  }
  100% {
    box-shadow: 0 0 12px rgba(114, 188, 32, 0.5),
      0 0 10px rgba(71, 188, 107, 0.5), 0 0 8px rgba(0, 210, 255, 0.5),
      0 0 6px rgba(58, 123, 213, 0.5), 0 0 4px rgba(98, 87, 143, 0.5),
      0 0 2px rgba(167, 82, 111, 0.5);
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
</style>
