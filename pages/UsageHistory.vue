<template>
  <TitleMenu Text="使用紀錄" link="/user" />
  <div class="usageHistoryWrap">
    <div class="productWrap">
      <h3 class="yourProductTitle">您的產品</h3>
      <div class="haveProductWrap">
        <!-- 單件產品展示 -->
        <div class="haveGroup" v-if="purchasedProducts.length === 1">
          <div class="haveIcon">
            <img src="/assets/imgs/haveCheck.svg" alt="checked icon" />
          </div>
          <div class="haveProduct">
            <div class="imgGroup">
              <img src="/assets/imgs/redLightClothes.png" alt="product image" />
              <div class="circle"></div>
              <div class="bigCircle"></div>
            </div>
            <h3 class="productName">{{ purchasedProducts[0] }}</h3>
          </div>
        </div>
        <!-- 多件產品展示 -->
        <div class="haveGroup2" v-if="purchasedProducts.length > 1">
          <div
            v-for="(product, index) in purchasedProducts"
            :key="index"
            class="haveProduct"
          >
            <div class="haveIcon">
              <img src="/assets/imgs/haveCheck.svg" alt="checked icon" />
            </div>
            <div class="imgGroup">
              <img src="/assets/imgs/redLightClothes.png" alt="product image" />
              <div class="circle"></div>
              <div class="bigCircle"></div>
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
            <img
              :src="'/assets/imgs/' + recommendation.image"
              alt="product image"
            />
            <div class="circle"></div>
            <div class="bigCircle"></div>
          </div>
          <h3 class="recommendName">{{ recommendation.name }}</h3>
          <div class="priceGroup">
            <div class="priceList">
              <span class="price">{{ recommendation.price }}</span>
            </div>
          </div>
          <div class="recommendBtnGroup">
            <a :href="recommendation.link">
              <button class="contactBtn">了解更多</button>
            </a>
          </div>
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
      <button @click="goUse">開始使用</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";

export default {
  setup() {
    const purchasedProducts = ref([]); 
    const recommendedProducts = ref([]); 

    const fetchProducts = async () => {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile } = localData
        ? JSON.parse(localData)
        : {};

      if (!MID || !Token || !MAID || !Mobile) {
        window.location.href = "/";
        return;
      }

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
              image: "placeholder.png", 
              link: `/usageHistoryInfo/${item.ProductName}`,
              features: item.Desc2.split("。").filter((desc) => desc), // 分割特色描述
            })
          );
        } else {
          console.error("獲取產品資料失敗");
        }
      } catch (error) {
        console.error("API 請求失敗：", error);
      }
    };

    const goUse = () => {
      if (purchasedProducts.value.length > 0) {
        window.location.href = `/usageHistoryInfo/${purchasedProducts.value[0]}`;
      }
    };

    onMounted(fetchProducts);

    return {
      purchasedProducts,
      recommendedProducts,
      goUse,
    };
  },
};
</script>

<style lang="scss">
.usageHistoryWrap {
  background-color: rgba(246, 246, 246, 1);
  min-height: 100vh;
  width: 100%;
  padding-bottom: 7rem;
  .productWrap {
    max-width: 90%;
    margin: 0 auto;
    .yourProductTitle {
      color: #1e1e1e;
      font-size: 20px;
      font-weight: 400;
      letter-spacing: 0.15px;
      padding-top: 0.85rem;
    }
    .haveIcon {
      text-align: center;
      margin-bottom: 0.6rem;
    }
    .haveGroup {
      .haveProduct {
        width: 100%;
        text-align: center;
        position: relative;

        img {
          width: 260px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 3;
        }
        .imgGroup {
          position: relative;
          height: 285px;
          .circle {
            width: 285px;
            height: 100%;
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
            width: 285px;
            height: 100%;
            z-index: 1;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(1.03);

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
          margin-top: 0.75rem;
        }
        .productSubTitle {
          color: #1e1e1e;
          font-size: 1.5rem;
          font-style: normal;
          font-weight: 700;
          letter-spacing: 0.12px;
          margin-top: 0.75rem;
        }
      }
    }

    .haveGroup2 {
      display: flex;
      width: 100%;
      justify-content: space-between;
      flex-wrap: wrap;

      .haveProduct {
        position: relative;
        .haveIcon {
          background-color: #fff;

          width: 2px;
          height: 24px;
          top: 0%;

          img {
            width: 24px;
            z-index: 9;

            position: absolute;
            top: 0;
          }
        }
        width: 47%;
        margin-bottom: 2rem;
        text-align: center;
        position: relative;

        img {
          width: 100%;
          width: 170px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 3;
        }
        .imgGroup {
          position: relative;
          height: 170px;
          .circle {
            width: 170px;
            height: 100%;
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
            width: 170px;
            height: 100%;
            z-index: 1;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(1.03);

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
          font-size: 1.25rem;
          font-style: normal;
          font-weight: 700;
          letter-spacing: 0.12px;
          margin-top: 0.75rem;
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

    .recommendTitle {
      color: #1e1e1e;
      font-size: 1.25rem;
      font-style: normal;
      font-weight: 400;
      line-height: 100%;
      letter-spacing: 0.15px;
      margin-top: 1.25rem;
    }

    .recommendWrap {
      .recommendDiv {
        width: 100%;
        background-color: #fff;
        border-radius: 12px;
        margin-top: 1rem;
        padding-top: 0.75rem;
        padding: 1rem 5% 0.5rem;
        .imgGroup {
          position: relative;
          height: 180px;

          img {
            width: 180px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 3;
          }
          .robotImg {
            left: 70%;
            top: 87%;
            width: 120px;
            z-index: 3;
          }
          .circle {
            width: 180px;
            height: 100%;
            z-index: 2;
            background-color: #fff;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
          .bigCircle {
            width: 180px;
            height: 100%;
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
          margin-top: 1.5rem;
        }
        .recommendSubTitle {
          color: #1e1e1e;
          text-align: center;
          font-size: 18px;
          font-weight: 400;
          letter-spacing: 0.09px;
          margin-top: 0.5rem;
        }

        .priceGroup {
          margin-top: 1rem;
          color: #1e1e1e;

          font-size: 18px;
          font-weight: 400;
          letter-spacing: 0.09px;

          .priceList {
            width: 100%;
            text-align: center;
            display: flex;
            justify-content: center;
            align-items: baseline;
          }

          .price {
            font-weight: 700;
            font-size: 1.5rem;
          }
        }

        .recommendBtnGroup {
          text-align: center;
          .contactBtn {
            border: $raphael-green-400 1px solid;
            color: $raphael-green-400;
            width: 100%;
            padding: 12px;
            border-radius: 8px;
            background-color: transparent;
            font-size: 18px;
            letter-spacing: 0.09px;
            margin-top: 1.5rem;
          }
        }

        .featureTitle {
          color: #1e1e1e;
          font-size: 20px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.15px;
          margin-top: 1.5rem;
        }
        .featureListGroup {
          margin-top: 0.5rem;
          list-style-type: disc;
          margin-left: 0.75rem;
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
  width: 100%;
  padding: 24px 5%;
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
