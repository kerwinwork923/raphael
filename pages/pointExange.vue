<template>
  <div class="memberPointExange">
    <!-- 會員資訊（等級、點數等） -->
    <TitleMenu Text="積分兌換" link="/point" />
    <div class="memberPointExangeMB"></div>
    <memberGroup />

    <div class="hasCoupon">
      <h3>目前積分可兌換</h3>
      <div class="couponsGroup">
        <!-- 用 bonusPaperList 動態列出券卡 -->
        <div
          class="coupon"
          v-for="(coupon, index) in bonusPaperList"
          :key="index"
          :class="{
            // '已兌換' 就灰階處理
            couponExchanged: coupon.Info === '已兌換',
            // '還差' 表示不可點擊或無法兌換
            couponNot: coupon.Info.includes('還差'),
          }"
          @click="handleCouponClick(coupon)"
        >
          <img src="../assets/imgs/pointGiftCoupon.svg" alt="券底圖" />
          <div class="couponContent">
            <div class="couponGift">
              <img src="/assets/imgs/pointGift.png" alt="禮物圖" />
            </div>

            <div class="couponLine">
              <img src="/assets/imgs/couponLine.svg" alt="分割線" />
            </div>

            <div class="couponText">
              <!-- 
                  將 coupon.Name 分為 money、text 
                  e.g. "$1,000#現金抵用卷" => 
                       parseCouponName(coupon.Name).money = "$1,000" 
                       parseCouponName(coupon.Name).text  = "現金抵用卷"
                -->
              <h4>{{ parseCouponName(coupon.Name).money }}</h4>
              <h5>{{ parseCouponName(coupon.Name).text }}</h5>
            </div>

            <div class="couponOption">
              <!-- coupon.Points 表示需要多少點才能換 -->
              <h4>{{ coupon.Points }}點</h4>
              <!-- coupon.Info =>  "兌換" / "已兌換" / "還差 XXX 點" -->
            </div>

            <!-- 若 coupon.Info 包含 "還差" 就顯示提示(可自由調整是否顯示 small) -->
            <small v-if="coupon.Info.includes('還差')">
              {{ coupon.Info }}
            </small>
          </div>
        </div>
      </div>
    </div>

    <!-- 彈出視窗：exangeBox，依 showExchangeBox 顯示/隱藏 -->
    <div class="exangeBox" v-if="showExchangeBox">
      <h3>兌換確認</h3>
      <div class="exangeBoxHR"></div>
      <div class="exangeBoxImgGroup">
        <img src="/assets/imgs/pointGift.png" alt="" />
      </div>
      <!-- 
          同樣用 parseCouponName 顯示彈窗券名稱 
          e.g. "$1,000 現金抵用卷"
        -->
      <h4>
        {{ parseCouponName(selectedCoupon.Name).money }}
        {{ parseCouponName(selectedCoupon.Name).text }}
      </h4>

      <div class="exchangeBoxText">
        <small>可用於療程商品折抵</small>
        <ul>
          <!-- 目前積分 -->
          <li>
            目前積分
            <span class="exchangeBoxList1"> {{ currentPoints }}點 </span>
          </li>

          <!-- 兌換積分(這張券所需點數) -->
          <li>
            兌換積分
            <span class="exchangeBoxList2">
              {{ selectedCoupon.Points }}點
            </span>
          </li>

          <!-- 剩餘積分 = 目前 - 兌換 -->
          <li>
            剩餘積分
            <span class="exchangeBoxList3"> {{ remainingPoints }}點 </span>
          </li>
        </ul>
      </div>
      <div class="exangeUseInfo">
        <h5>使用須知</h5>
        <ul>
          <li>黃金會員可立即使用 QR Code 進行使用或下次使用</li>
          <li>其他會員僅可下次使用</li>
          <li>兌換後無法更改使用方式，請謹慎選擇</li>
        </ul>
      </div>
      <div class="exchangeBtnGroup">
        <button @click="closeExchangeBox">返回</button>
        <button class="exchangeBtn" @click="doExchange">兌換</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { usePoint } from "@/stores/point";

// 1) 拿到 store
const pointStore = usePoint();

// 2) 取得可兌換清單
const bonusPaperList = computed(() => pointStore.bonusPaperList);

// 3) 控制彈窗顯示/隱藏 & 目前選擇的 coupon
const showExchangeBox = ref(false);
const selectedCoupon = ref(null);

/**
 * 解析字串，如 "$1,000#現金抵用卷" 或 "深眠衣#買1送1券"：
 * => { money: "$1,000", text: "現金抵用卷" }
 */
function parseCouponName(fullName) {
  if (!fullName) return { money: "", text: "" };
  // 以 '#' 做切割
  const [money, text] = fullName.split("#");
  return { money, text };
}

/**
 * 點擊卡片行為：
 * 若 Info = "已兌換" 或包含 "還差"，則不允許開啟彈窗(或自行決定行為)
 * 否則開啟彈窗，並記錄選擇的 coupon
 */
function handleCouponClick(coupon) {
  if (coupon.Info === "已兌換" || coupon.Info.includes("還差")) {
    // 不可點擊或可彈提示
    return;
  }
  selectedCoupon.value = coupon;
  showExchangeBox.value = true;
}

/**
 * 關閉彈窗
 */
function closeExchangeBox() {
  showExchangeBox.value = false;
  selectedCoupon.value = null;
}

/**
 * 從 store nowAvaPoints (e.g. "累積積分6141點") 解析數字
 */
const currentPoints = computed(() => {
  const str = pointStore.nowAvaPoints || ""; // "累積積分0點"
  const match = str.match(/\d+/);
  return match ? Number(match[0]) : 0;
});

/**
 * 剩餘積分 = 目前點數 - 選到券所需點數
 */
const remainingPoints = computed(() => {
  if (!selectedCoupon.value) return currentPoints.value;
  const cost = Number(selectedCoupon.value.Points) || 0;
  return currentPoints.value - cost;
});

/**
 * 執行兌換
 * (此處範例: 只是 alert, 實際可呼叫 API、更新 store、並重新抓最新點數等)
 */
function doExchange() {
  alert(
    `已兌換: ${parseCouponName(selectedCoupon.value.Name).money} ${
      parseCouponName(selectedCoupon.value.Name).text
    }`
  );
  // 成功後可以再次呼叫 API_Bonus() 或其它 action，刷新點數與清單

  // 關閉視窗
  closeExchangeBox();
}
</script>

<style lang="scss">
.memberPointExange {
  background-color: #f6f6f6;
  padding: 0 5% 60px;
  min-height: 100vh;
  .memberPointExangeMB {
    margin-top: 1rem;
  }
  .hasCoupon {
    margin-top: 1rem;
    background-color: #fff;
    max-width: 960px;
    padding: 12px;
    border-radius: 8px;

    h3 {
      color: #1e1e1e;
      font-family: "Noto Sans";
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.15px;
      margin-bottom: 0.15rem;
    }

    .coupon {
      position: relative;
      cursor: pointer;
      margin-bottom: 1rem; /* 若需要留間距可加 */

      img {
        width: 100%;
      }
      .couponContent {
        width: 100%;
        .couponGift {
          width: 25%;

          position: absolute;
          top: 10%;
          left: 11.5%;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .couponLine {
          position: absolute;
          top: 15%;
          left: 38.5%;
          height: 100%;
          img {
            height: 70%;
          }
        }
        .couponText {
          position: absolute;
          top: 50%;
          left: 42.5%;
          transform: translateY(-50%);
          h4 {
            color: #000;
            font-family: "Noto Sans";
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 0.25rem;
          }
          h5 {
            color: #000;
            font-family: "Noto Sans";
            font-size: 18px;
            font-weight: 400;
            line-height: 100%;
          }
        }
        .couponOption {
          position: absolute;
          top: 50%;
          left: 72%;
          transform: translateY(-50%);
          color: #1fbcb3;
          border-radius: 8px;
          border: 1px solid #1fbcb3;
          padding: 4px 8px;
          text-align: center;
          line-height: 1.2;
          h4 {
            color: #74bc1f;
          }
        }
      }
    }
    /* 已兌換 => 灰階 */
    .couponExchanged {
      filter: grayscale(0.97);
      cursor: not-allowed;
    }
    /* 還差 => 不可點擊 */
    .couponNot {
      cursor: not-allowed;
      .couponContent {
        .couponOption {
          color: #666; /*或其他顏色*/
          border: none;
        }
        small {
          position: absolute;
          top: 75%;
          left: 72%;
          color: rgba(0, 0, 0, 0.3);
          font-family: "Noto Sans";
          font-size: 12px;
          font-weight: 400;
        }
      }
    }
  }
}

/* 彈出視窗 */
.exangeBox {
  position: fixed;
  background-color: #fff;
  width: 80%;
  max-width: 420px; /* 可自行調整 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0 5% 1.25rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  h3 {
    color: #74bc1f;
    font-family: "Noto Sans";
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    margin-top: 1rem;
  }
  .exangeBoxHR {
    width: 100%;
    background-color: #666;
    height: 1px;
    margin-top: 0.25rem;
  }
  .exangeBoxImgGroup {
    text-align: center;
    margin-top: 0.75rem;
  }
  h4 {
    color: #1e1e1e;
    font-family: "Noto Sans";
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    margin-top: 0.5rem;
    white-space: nowrap;
  }
  .exchangeBoxText {
    text-align: center;
    margin-top: 0.35rem;
    small {
      color: #666;
      font-family: "Noto Sans";
      font-size: 16px;
      font-weight: 400;
    }
    ul {
      margin-top: 1.25rem;
      li {
        color: #666;
        font-family: "Noto Sans";
        font-size: 18px;
        font-weight: 400;
        line-height: 150%;
      }
      .exchangeBoxList1 {
        color: #74bc1f;
      }
      .exchangeBoxList2 {
        color: #ec7d7d;
      }
      .exchangeBoxList3 {
        color: #1fbcb3;
      }
    }
  }
  .exangeUseInfo {
    background-color: #fef1e2;
    border-radius: 12px;
    padding: 12px;
    margin-top: 1.25rem;
    ul {
      list-style: outside;
      margin-top: 0.5rem;
      li {
        margin-left: 1.5rem;
        line-height: 1.5;
      }
    }
    h5 {
      color: #bc581f;
      font-family: "Noto Sans";
      font-size: 18px;
      font-weight: 400;
    }
  }
  .exchangeBtnGroup {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 1.25rem;
    button {
      width: 48%;
      padding: 8px 12px;
      border: none;
      border-radius: 8px;
      color: #666;
      font-family: "Noto Sans";
      font-size: 18px;
      font-weight: 400;
      cursor: pointer;
    }
    .exchangeBtn {
      background: #74bc1f;
      color: #fff;
    }
  }
}
</style>
