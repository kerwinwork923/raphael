<template>
  <RaphaelLoading v-if="loading" />
  <div class="usageHistoryWrap">
    <TitleMenu Text="使用紀錄" link="/user" />
    <div class="productWrap">
      <h3 class="yourProductTitle" v-if="purchasedProducts.length > 1">
        您的產品
      </h3>
      <div class="haveProductWrap">
        <!-- 單件產品展示 -->
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
          </div>
        </div>

        <!-- 多件產品展示 -->
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
          </div>
        </div>
      </div>

      <!-- 健康方案推薦 -->
      <h3 class="recommendTitle" v-if="recommendedProducts.length > 0">
        健康方案推薦
      </h3>
      <div class="recommendWrap" v-if="recommendedProducts.length > 0">
        <div
          class="recommendDiv"
          v-for="(recommendation, index) in recommendedProducts"
          :key="index"
        >
          <div class="imgGroup">
            <img :src="getImage(recommendation.name)" alt="product image" />
            <img
              v-if="shouldShowRobot(recommendation.name)"
              class="robotImg"
              src="/assets/imgs/clothRobot.png"
              alt="robot image"
            />
            <div class="circle"></div>
          </div>
          <h3 class="recommendName">{{ recommendation.name }}</h3>
          <p>{{ recommendation.slogan }}</p>
          <div class="priceGroup">
            <div
              class="priceItem"
              v-for="(price, index) in parsePrices(recommendation.price)"
              :key="index"
            >
              <span class="priceValue">{{ price.value }}</span>
              <span class="pricePeriod">/{{ price.period }}</span>
            </div>
          </div>
          <button class="contactBtn" @click="contactSupport">聯絡客服</button>
          <div class="featureTitle">產品特色</div>
          <ul class="featureListGroup">
            <li
              v-for="(feature, index) in recommendation.features"
              :key="index"
            >
              {{ feature }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="optionWrap">
      <button @click="goUse" v-if="purchasedProducts.length >= 1">
        開始使用
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";

import checkedIcon from "@/assets/imgs/haveCheck.png";
import uncheckedIcon from "@/assets/imgs/usageUnCheck.png";
import redLightClothes from "@/assets/imgs/redLightClothes.png";
import normalClothes from "@/assets/imgs/normalClothes.png";
import redLightClothes2 from "@/assets/imgs/redLightClothes2.png";

export default {
  setup() {
    // 狀態管理
    const loading = ref(false);
    const purchasedProducts = ref([]); // 已購買的產品
    const recommendedProducts = ref([]); // 推薦的產品
    const selectedProductIndex = ref(0); // 選中的產品索引
    const useRecord = ref([]); // 使用記錄
    const hasCheckedToday = ref(false); // 判斷今日是否有檢測記錄

    // 從 localStorage 中獲取用戶資料
    const localData = localStorage.getItem("userData");
    let userData = null;

    try {
      userData = localData ? JSON.parse(localData) : null;
    } catch (error) {
      console.error("localStorage userData 解析失敗：", error);
    }

    // 驗證用戶資料完整性
    if (
      !userData ||
      !userData.MID ||
      !userData.Token ||
      !userData.MAID ||
      !userData.Mobile
    ) {
      console.warn("必要的用戶資料缺失，重定向至首頁");
      window.location.href = "/";
      return;
    }

    const { MID, Token, MAID, Mobile } = userData;

    // 產品圖片映射
    const productImages = {
      雙效紅光活力衣: redLightClothes,
      全效調節衣: redLightClothes2,
      三效深眠衣: normalClothes,
      居家治療儀: redLightClothes2,
    };

    // API 請求：獲取產品與使用記錄
    const fetchProducts = async () => {
      loading.value = true;
      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_USE1.jsp",
          { MID, Token, MAID, Mobile }
        );

        if (response.status === 200) {
          purchasedProducts.value = response.data.PurchaseProduct;
          useRecord.value = response.data.UseRecord; // 保存使用記錄
          recommendedProducts.value = response.data.PromoteProduct.map(
            (item) => ({
              name: item.ProductName,
              price: item.Desc1,
              features: item.Desc2.split("。").filter((desc) => desc),
              slogan: item.Desc3,
            })
          );
        } else {
          console.error("獲取產品資料失敗", response.data);
        }
      } catch (error) {
        console.error("API 請求失敗：", error);
      } finally {
        loading.value = false;
      }
    };

    // 判斷指定產品是否在今日使用過（以凌晨 5 點為新的一天）
    const hasUsedToday = (productName) => {
      const now = new Date();

      // 計算今天 5:00 的時間點
      const today5AM = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        5,
        0,
        0
      );

      // 如果現在時間早於今天的 5:00，則視為昨天
      if (now < today5AM) {
        today5AM.setDate(today5AM.getDate() - 1);
      }

      // 計算明天 4:59:59 的時間點
      const tomorrow5AM = new Date(today5AM);
      tomorrow5AM.setDate(tomorrow5AM.getDate() + 1);

      // 檢查使用記錄是否符合條件
      return useRecord.value.some((record) => {
        const recordTime = new Date(record.StartTime.replace(/-/g, "/")); // 確保日期格式正確
        return (
          record.ProductName === productName &&
          recordTime >= today5AM &&
          recordTime < tomorrow5AM
        );
      });
    };

    // 獲取產品圖片
    const getImage = (productName) => productImages[productName];

    // 判斷是否顯示機器人圖標
    const shouldShowRobot = (productName) => productName === "居家治療儀";

    // 解析產品價格格式
    const parsePrices = (priceString) => {
      return priceString.split(";").map((price) => {
        const [value, period] = price.trim().split("/");
        return { value: value.trim(), period: period ? period.trim() : "" };
      });
    };

    // 選擇產品
    const selectProduct = (index) => {
      selectedProductIndex.value = index;
    };

    // 開始使用產品
    const goUse = () => {
      const productName = purchasedProducts.value[selectedProductIndex.value];
      if (hasUsedToday(productName)) {
        window.location.href = `/usage/${productName}`;
      } else {
        window.location.href = `/usageHistoryInfo/${productName}`;
      }
    };

    // 聯繫客服
    const contactSupport = () => {
      window.location.href = "tel:0800000760";
    };

    // 初始化邏輯
    onMounted(async () => {
      try {
        await fetchProducts();
      } catch (error) {
        console.error("初始化過程中出現錯誤：", error);
      }
    });

    // 返回值
    return {
      purchasedProducts,
      recommendedProducts,
      selectedProductIndex,
      getImage,
      shouldShowRobot,
      parsePrices,
      selectProduct,
      goUse,
      contactSupport,
      checkedIcon,
      uncheckedIcon,
      loading,
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
    }

    .recommendWrap {
      display: grid;
      gap: 0.75rem;
      margin-top: 0.75rem;
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
</style>
