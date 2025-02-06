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
  
    <div class="verificationBox" v-show="verificationBoxVisible">
      <div class="verificationNumberGroup">
        <div class="verificationNumber">
          {{ digitalCode }}
        </div>
      </div>
      <h4>{{ verificationPaperName.replace("#", " ") }}</h4>
      <h5>可用於療程商品折抵</h5>
      <div @click="closeAllModals" class="verificationClose">
        <img src="../assets/imgs/pointClose.svg" alt="" />
      </div>
    </div>
  </div>

  <!-- 遮罩 -->
  <div
    class="pointCover"
    v-show="pointCoverVisible"
    @click="closeAllModals"
  ></div>
</template>

<script setup>
import { ref, computed } from "vue";
import { usePoint } from "@/stores/point";
import axios from "axios";
import { useRouter } from "vue-router";
const router = useRouter();
const pointStore = usePoint();

// 從 store 來的可兌換券列表
const bonusPaperList = computed(() => pointStore.bonusPaperList);

// 「兌換確認」彈窗控制
const showExchangeBox = ref(false);
const selectedCoupon = ref(null);

// 「驗證碼」視窗 + 遮罩控制
const verificationBoxVisible = ref(false); // 新增：控制驗證碼視窗顯示
const pointCoverVisible = ref(false); // 原本就有灰色遮罩
// 顯示用的 8 碼數字碼
const digitalCode = ref("");
// 驗證碼視窗中要顯示的券名稱
const verificationPaperName = ref("");

// 取得 store 的文字，例如： "累積積分6141點"，用 regex 轉成數字
const currentPoints = computed(() => {
  const str = pointStore.nowAvaPoints || "";
  const match = str.match(/\d+/);
  return match ? Number(match[0]) : 0;
});

// 依使用者點擊的券所需點數做計算
const remainingPoints = computed(() => {
  if (!selectedCoupon.value) return currentPoints.value;
  const cost = Number(selectedCoupon.value.Points) || 0;
  return currentPoints.value - cost;
});

// 檢查 localStorage 的登入資訊
const localData = localStorage.getItem("userData");
const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};
if (!MID || !Token || !MAID || !Mobile) {
  router.push("/");
}

// 解析如 "$1,000#現金抵用卷" => { money: "$1,000", text: "現金抵用卷" }
function parseCouponName(fullName) {
  if (!fullName) return { money: "", text: "" };
  const [money, text] = fullName.split("#");
  return { money, text };
}

/**
 * 點擊某個兌換券卡片
 */
function handleCouponClick(coupon) {
  // 若 "已兌換" 或包含 "還差"，不可點擊
  if (coupon.Info === "已兌換" || coupon.Info.includes("還差")) return;

  selectedCoupon.value = coupon;
  showExchangeBox.value = true;
  pointCoverVisible.value = true;
}

/**
 * 關閉「兌換確認」彈窗
 */
function closeExchangeBox() {
  showExchangeBox.value = false;
  pointCoverVisible.value = false;
  selectedCoupon.value = null;
}

/**
 * 通用：關閉所有視窗（包含驗證碼、遮罩）
 */
function closeAllModals() {
  verificationBoxVisible.value = false;
  pointCoverVisible.value = false;
  showExchangeBox.value = false;
  selectedCoupon.value = null;
  // 視情況是否需要清空 digitalCode, verificationPaperName
  digitalCode.value = "";
  verificationPaperName.value = "";
}

/**
 * 送出「兌換」動作 => 呼叫 API_Exchange.jsp
 */
async function doExchange() {
  try {
    const requestData = {
      MID,
      Token,
      MAID,
      Mobile,
      Points: selectedCoupon.value.Points,
      CanUseTime: selectedCoupon.value.CanUseTime,
      Grade: selectedCoupon.value.Grade,
      PaperName: selectedCoupon.value.Name,
    };

    const { data } = await axios.post(
      "https://23700999.com:8081/HMA/API_Exchange.jsp",
      requestData
    );

    // 後端若成功 => data.Result==="OK" && data.BonusPaper.Ret==="OK"
    if (data?.Result === "OK" && data?.BonusPaper?.Ret === "OK") {
      // ① 先把 8 碼數字碼 及券名稱 存起來
      digitalCode.value = data.BonusPaper.DigitalCode; // "65977461"
      verificationPaperName.value = data.BonusPaper.PaperName; // "$1,000現金抵用卷" 或 "$1,000#現金抵用卷"

      // ② 若有需要更新前台「累積積分」(NowPoints = 兌換後剩餘積分)
      //    假設 store 有一個方法可以更新 nowAvaPoints：
      //    e.g. "累積積分5641點"
      const updatedPoints = data.BonusPaper.NowPoints;
      pointStore.nowAvaPoints = `累積積分${updatedPoints}點`;

      // ③ 關閉「兌換確認」彈窗
      closeExchangeBox();

      // ④ 開啟「驗證碼」視窗
      verificationBoxVisible.value = true;
      pointCoverVisible.value = true;
    } else {
      alert("兌換失敗：" + (data?.BonusPaper?.Ret || "不明原因"));
      closeExchangeBox();
    }
  } catch (error) {
    console.error(error);
    alert("兌換時發生錯誤：" + error.message);
    closeExchangeBox();
  }
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
  z-index: 100;
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
.verificationBox {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  background-color: #fff;
  z-index: 999;
  padding: 0 0 0.75rem;
  border-radius: 12px;
  background: var(--shade-white, #fff);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  max-width: 768px;

  .verificationNumberGroup {
    border-radius: 12px;
    width: 90%;
    background: #fef1e2;
    margin: 0 auto;
    padding: 1rem;
    margin-top: 0.75rem;
    text-align: center;
    .verificationNumber {
      color: #bc581f;
      font-family: "Noto Sans";
      font-size: 2rem;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 20px;
      margin-left: 10px;
    }
  }
  h4 {
    color: #1e1e1e;
    font-family: "Noto Sans";
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0.12px;
    text-align: center;
    margin-top: 0.5rem;
  }
  h5 {
    color: #666;
    font-family: "Noto Sans";
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.5px;
    text-align: center;
    margin-top: 0.35rem;
  }
}
.pointCover {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0%;
  background: rgba(217, 217, 217, 0.5);
  backdrop-filter: blur(2.5px);
  z-index: 99;
}
</style>
