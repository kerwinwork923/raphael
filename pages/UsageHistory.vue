<template>
  <TitleMenu Text="使用紀錄" link="/user" />
  <div class="usageHistoryWrap">
    <div class="productWrap">
      <h3 class="yourProductTitle">您的產品</h3>
      <div class="haveProductWrap">
        <div class="haveIcon">
          <img src="/assets/imgs/haveCheck.svg" alt="" />
        </div>
        <div class="haveProduct">
          <div class="imgGroup">
            <img src="/assets/imgs/redLightClothes.png" alt="" />
            <div class="circle"></div>
            <div class="bigCircle"></div>
          </div>
          <h3 class="productName">第四代穿戴式調節衣</h3>
          <h3 class="productSubTitle">(紅光加強版)</h3>
        </div>
        <h3 class="recommendTitle">健康方案推薦</h3>
        <div class="recommendWrap" v-for="(item, key) in 3" :key="key">
          <div class="recommendDiv">
            <div class="imgGroup">
              <img src="/assets/imgs/normalClothes.png" alt="" />
              <div class="circle"></div>
              <div class="bigCircle"></div>
            </div>
            <h3 class="recommendName">第四代穿戴式調節衣</h3>
            <h3 class="recommendSubTitle">(保健版)</h3>
            <div class="priceGroup">
              <div class="priceList">
                <span class="price">NT$9,999</span> / 30天
              </div>
              <div class="priceList">
                <span class="price">NT$26,888</span> / 90天
              </div>
              <div class="priceList">
                <span class="price">NT$34,800</span> / 180天
              </div>
            </div>
            <div class="recommendBtnGroup">
              <button class="contactBtn">聯絡客服</button>
            </div>
            <div class="featureTitle">產品特色</div>
            <ul class="featureListGroup">
              <li>睡眠時調節自律神經，促進自癒</li>
              <li>專利貼片技術，輕便舒適</li>
              <li>提升免疫力，改善疲勞與不適</li>
              <li>每晚穿著，提升睡眠與活力</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="optionWrap">
      <button @click="goUse">開始使用</button>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();

    const goUse = () => {
      router.push("/usageHistoryInfo");
    };

    return {
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
          animation: rotate 4s infinite linear, aurora 10s infinite ease-in-out;
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
          margin-top: 0.75rem;
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
