<template>
  <TitleMenu Text="使用紀錄" link="/user" />
  <div class="usageHistoryWrap">
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
              <div class="bigCircle"></div>
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
        <!-- <div class="haveGroup2" v-if="purchasedProducts.length > 1"> -->
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
              <div class="circle"></div>
              <div class="bigCircle"></div>
              <img
                v-if="shouldShowRobot(product)"
                class="robotImg"
                src="/assets/imgs/clothRobot.png"
                alt="robot image"
              />
            </div>
            <h3 class="productName">{{ product }}</h3>
          </div>
        </div>
      </div>

      <!-- 健康方案推薦 -->
      <h3 class="recommendTitle">健康方案推薦</h3>
      <div class="recommendWrap">
        <div
          class="recommendDiv"
          v-for="(recommendation, index) in recommendedProducts"
          :key="index"
        >
          <div class="imgGroup">
            <img :src="getImage(recommendation.name)" alt="product image" />
            <div class="circle"></div>
            <div class="bigCircle"></div>
            <img
              v-if="shouldShowRobot(recommendation.name)"
              class="robotImg"
              src="/assets/imgs/clothRobot.png"
              alt="robot image"
            />
          </div>
          <h3 class="recommendName">{{ recommendation.name }}</h3>
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
      <button @click="goUse" v-if="purchasedProducts.length > 1">
        開始使用
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";

import checkedIcon from "@/assets/imgs/haveCheck.svg";
import uncheckedIcon from "@/assets/imgs/usageUnCheck.svg";
import redLightClothes from "@/assets/imgs/redLightClothes.png";
import normalClothes from "@/assets/imgs/normalClothes.png";
import redLightClothes2 from "@/assets/imgs/redLightClothes2.png";

export default {
  setup() {
    const purchasedProducts = ref([]);
    const recommendedProducts = ref([]);
    const selectedProductIndex = ref(0); // 選中的產品索引
    const hasCheckedToday = ref(false); // 判斷今日是否有檢測記錄

    const localData = localStorage.getItem("userData");
    let userData = null;

    try {
      userData = localData ? JSON.parse(localData) : null;
    } catch (error) {
      console.error("localStorage userData 解析失敗：", error);
    }

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

    const productImages = {
      紅光版: "redLightClothes.png",
      保健版: "normalClothes.png",
      調節衣: "redLightClothes2.png",
      居家治療儀: "redLightClothes2.png",
    };

    const basePath = "/assets/imgs/";

    const fetchProducts = async () => {
      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_USE1.jsp",
          { MID, Token, MAID, Mobile }
        );

        if (response.status === 200) {
          purchasedProducts.value = response.data.PurchaseProduct;

          recommendedProducts.value = response.data.PromoteProduct.map(
            (item) => ({
              name: item.ProductName,
              price: item.Desc1,
              image: getImage(item.ProductName),
              features: item.Desc2.split("。").filter((desc) => desc),
            })
          );
        } else {
          console.error("獲取產品資料失敗", response.data);
        }
      } catch (error) {
        console.error("API 請求失敗：", error);
      }
    };

    const API_HRV2 = async () => {
      try {
        const response = await fetch(
          "https://23700999.com:8081/HMA/API_HRV2.jsp",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ MID, MAID, Token, Mobile }),
          }
        );

        if (!response.ok) {
          throw new Error("網路響應不是成功狀態");
        }

        const result = await response.json();
        if (result && Array.isArray(result.HRV2)) {
          handleCheckTime(result.HRV2);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    const handleCheckTime = (hrvData) => {
      const today = new Date();
      const today5AM = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        5,
        0,
        0
      );

      const filteredData = hrvData.some((record) => {
        const checkTimeStr = record.CheckTime;
        if (!checkTimeStr) return false;

        const [datePart, timePart] = checkTimeStr.split(" ");
        const [year, month, day] = datePart.split("/").map(Number);
        const [hour, minute] = timePart.split(":").map(Number);
        const checkTime = new Date(year, month - 1, day, hour, minute);

        return checkTime >= today5AM && checkTime <= new Date();
      });

      hasCheckedToday.value = filteredData;
    };

    const getImage = (productName) => {
      const productImages = {
        紅光版: redLightClothes,
        保健版: normalClothes,
        調節衣: redLightClothes2,
        居家治療儀: redLightClothes2,
      };
      return productImages[productName];
    };
    const shouldShowRobot = (productName) => {
      return productName === "居家治療儀";
    };

    const parsePrices = (priceString) => {
      return priceString.split(";").map((price) => {
        const [value, period] = price.trim().split("/");
        return { value: value.trim(), period: period ? period.trim() : "" };
      });
    };

    const selectProduct = (index) => {
      selectedProductIndex.value = index;
    };

    const goUse = () => {
      const productName = purchasedProducts.value[selectedProductIndex.value];
      if (hasCheckedToday.value) {
        window.location.href = `/usage/${productName}`;
      } else {
        window.location.href = `/usageHistoryInfo/${productName}`;
      }
    };

    const contactSupport = () => {
      window.location.href = "0800000760"; 
    };

    onMounted(async () => {
      try {
        await fetchProducts();
        await API_HRV2();
      } catch (error) {
        console.error("初始化過程中出現錯誤：", error);
      }
    });

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
    };
  },
};
</script>

<style lang="scss">
.titleMenu{
  &>div{
    left: 1rem;
  }
}
.usageHistoryWrap {
  background-color: rgba(246, 246, 246, 1);
  min-height: 100vh;
  width: 100%;
  padding: 0 1rem;
  padding-bottom: 100px;
  .productWrap {
    .yourProductTitle {
      color: #1e1e1e;
      font-size: 20px;
      font-weight: 400;
      letter-spacing: 0.15px;
      padding-top: 0.75rem;
    }
    .haveProductWrap {
      margin-top: 0.75rem;
      .haveGroup {
        display: gri;
        place-items: center;
        gap: 0.75rem;

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
              width: 270px;
              height: 270px;
              z-index: 2;
              background-color: #fff;
              border-radius: 50%;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              filter: blur(3px);
              box-shadow: 0 0 10px rgba($color: #fff, $alpha: 0.1);
            }
            .bigCircle {
              width: 270px;
              height: 270px;
              z-index: 1;
              border-radius: 50%;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);

              background: linear-gradient(
                135deg,
                rgba(114, 188, 32, 0.9) 0%,
                rgba(71, 188, 107, 0.9) 20%,
                rgba(0, 210, 255, 0.9) 40%,
                rgba(58, 123, 213, 0.9) 60%,
                rgba(98, 87, 143, 0.9) 80%,
                rgba(167, 82, 111, 0.9) 100%
              );

              background-size: 200% 200%;
              filter: blur(2px);
              animation: rotate 4s infinite linear,
                aurora 10s infinite ease-in-out;
            }
          }

          .productName {
            color: #1e1e1e;
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

          .haveIcon {
            img {
            }
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
              width: 150px;
              height: 150px;
              z-index: 2;
              background-color: #fff;
              border-radius: 50%;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              filter: blur(3px);
              box-shadow: 0 0 10px rgba($color: #fff, $alpha: 0.1);
            }

            .bigCircle {
              width: 150px;
              height: 150px;
              z-index: 1;
              border-radius: 50%;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);

              background: linear-gradient(
                135deg,
                rgba(114, 188, 32, 0.9) 0%,
                rgba(71, 188, 107, 0.9) 20%,
                rgba(0, 210, 255, 0.9) 40%,
                rgba(58, 123, 213, 0.9) 60%,
                rgba(98, 87, 143, 0.9) 80%,
                rgba(167, 82, 111, 0.9) 100%
              );

              background-size: 200% 200%;
              filter: blur(2px);
              animation: rotate 4s infinite linear,
                aurora 10s infinite ease-in-out;
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
            color: #1e1e1e;
            font-size: 1.25rem;
            font-style: normal;
            font-weight: 700;
            letter-spacing: 0.12px;
          }
          .productSubTitle {
            color: #1e1e1e;
            font-size: 1.25rem;
            font-style: normal;
            font-weight: 700;
            letter-spacing: 0.12px;
            margin-top: 0.75rem;
          }
        }
      }
    }

    .recommendTitle {
      color: #1e1e1e;
      font-size: 1.25rem;
      font-style: normal;
      font-weight: 400;
      line-height: 100%;
      letter-spacing: 0.15px;
      padding-top: 1rem;
    }

    .recommendWrap {
      margin-top: 0.75rem;
      .recommendDiv {
        width: 100%;
        background-color: #fff;
        border-radius: 12px;
        padding-top: 0.75rem;
        padding: 0.75rem;
        .imgGroup {
          position: relative;
          display: grid;
          place-items: center;
          gap: 0.5rem;

          img {
            height: 170px;
            z-index: 3;
          }

          .circle {
            width: 150px;
            height: 150px;
            z-index: 2;
            background-color: #fff;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
          .bigCircle {
            width: 150px;
            height: 150px;
            z-index: 1;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(1.03);

            background: linear-gradient(
              180deg,
              rgba(114, 188, 32, 0.9) 0%,
              rgba(71, 188, 107, 0.9) 20%,
              rgba(0, 210, 255, 0.9) 40%,
              rgba(58, 123, 213, 0.9) 60%,
              rgba(98, 87, 143, 0.9) 80%,
              rgba(167, 82, 111, 0.9) 100%
            );

            background-size: 100% 100%;
          }
        }

        .recommendName {
          color: #1e1e1e;
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
          border: $raphael-green-400 1px solid;
          color: $raphael-green-400;
          cursor: pointer;
          width: 100%;
          margin-top: 1rem;
          padding: 12px;
          border-radius: 8px;
          background-color: transparent;
          font-size: 18px;
          letter-spacing: 0.09px;
          transition: all 0.2s ease;
          &:hover {
            background-color: $raphael-green-400;
            color: #fff;
          }
        }

        .featureTitle {
          color: #1e1e1e;
          font-size: 20px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.15px;
          margin-top: 1rem;
        }
        .featureListGroup {
          list-style-type: disc;
          margin-top: 0.5rem;
          padding-left: 1.75rem;
          li {
            color: #1e1e1e;
            font-size: 18px;
            font-weight: 400;
            line-height: 29.124px;
            letter-spacing: 0.09px;
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
  padding: 1rem 1rem 2.25rem 1rem;
  background-color: #f6f6f6;
  z-index: 99;

  button {
    width: 100%;
    background-color: $raphael-green-400;
    color: #fff;
    border: none;
    padding: 12px;
    border-radius: 8px;
    color: #fff;
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.09px;
    cursor: pointer;
  }
}

/* 旋轉效果 */
@keyframes rotate {
  0% {
    transform: translate(-50%, -50%) scale(1.03) rotate(0deg);
    filter: brightness(1);
    filter: brightness(1.2) blur(1px);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05) rotate(180deg);
    filter: brightness(1.2) blur(3px);
  }
  100% {
    transform: translate(-50%, -50%) scale(1.03) rotate(360deg);
    filter: brightness(1);
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
