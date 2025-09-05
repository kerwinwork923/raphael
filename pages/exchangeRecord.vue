<template>
  <div class="exchangeRecord">
    <div class="exchangeRecordContainer">
      <TitleMenu Text="兌換紀錄" link="/pointExange"></TitleMenu>

      <!-- 篩選區域 -->
      <div class="filterSection">
        <div class="filterGroup">
          <div class="filterButton" @click="toggleYearBox">
            <img src="../assets/imgs/point/filter.svg" alt="篩選" />
            <span>{{ selectedYear }}年</span>
            <img src="../assets/imgs/arrowDown.svg" alt="展開" class="arrow" />

            <!-- 年份下拉選單 -->
            <div class="yearDropdown" v-show="yearBoxVisible">
              <div
                class="yearItem"
                v-for="year in availableYears"
                :key="year"
                @click.stop="selectYear(year)"
              >
                {{ year }}年
              </div>
            </div>
          </div>
          <div class="filterButton" @click="toggleMonthBox">
            <img src="../assets/imgs/point/filter.svg" alt="篩選" />
            <span>{{ selectedMonth }}月</span>
            <img src="../assets/imgs/arrowDown.svg" alt="展開" class="arrow" />

            <!-- 月份下拉選單 -->
            <div class="monthDropdown" v-show="monthBoxVisible">
              <div
                class="monthItem"
                v-for="month in 12"
                :key="month"
                @click.stop="selectMonth(month)"
              >
                {{ month }}月
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="totalCount">總共 {{ totalRecords }}筆</div>

      <!-- 兌換記錄列表 -->
      <div class="recordList">
        <div
          class="recordCard"
          v-for="(record, index) in exchangeRecords"
          :key="index"
          @click="handleViewRecord(record)"
        >
          <div class="recordInfo">
            <div class="recordDate">{{ record.date }}</div>
            <div class="recordDescription">{{ record.description }}</div>
            <div class="recordStatus" :class="getStatusClass(record.status)">
              {{ record.status }}
            </div>
          </div>
          <div class="recordAction">
            <button>查看 ></button>
          </div>
        </div>

        <!-- 空狀態 -->
        <div class="emptyState" v-if="exchangeRecords.length === 0">
          <!-- 底部插圖 -->
          <div class="bottomIllustration">
            <img src="../assets/imgs/robot_sad.png" alt="目前沒有資料" />
            <h5>目前沒有兌換紀錄</h5>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 遮罩 -->
  <div
    class="pointCover"
    v-show="pointCoverVisible"
    @click="closeAllModals"
  ></div>

  <!-- 可立即使用 => verificationBox -->
  <div class="verificationBox" v-show="verificationBoxVisible">
    <div class="verificationNumber">
      {{ currentCoupon.DigitalCode || "12345678" }}
    </div>
    <h4>{{ currentCoupon.Name.replace("#", " ") }}</h4>
    <h5>可用於療程商品折抵</h5>
    <small>可使用日：{{ currentCoupon.Info }}</small>
    <div @click="closeAllModals" class="verificationClose">
      <img src="../assets/imgs/pointClose.svg" alt="" />
    </div>
    <h6>結帳時向諮詢師出示此畫面 即可折抵消費。</h6>
  </div>

  <!-- 有可使用日 => couponBox -->
  <div class="couponBox" v-show="couponBoxVisible">
    <div class="couponBoxImgGroup">
      <img src="../assets/imgs/gift.png" alt="" />
    </div>
    <h4>{{ currentCoupon.Name.replace("#", " ") }}</h4>
    <h5>可用於療程商品折抵</h5>
    <ul>
      <li>
        兌換日期 <span>{{ currentCoupon.CreateTime }}</span>
      </li>
      <li>
        兌換積分 <span>{{ currentCoupon.AvaPoints }}</span>
      </li>
      <li>
        可使用日 <span>{{ currentCoupon.Info }}</span>
      </li>
    </ul>
    <div class="couponBoxClose" @click="closeAllModals">
      <img src="../assets/imgs/pointClose.svg" alt="" />
    </div>
  </div>

  <!-- 已兌換完成 => couponBoxCompleted -->
  <div class="couponBoxCompleted" v-show="couponBoxCompletedVisible">
    <div class="couponBoxImgGroup">
      <img src="../assets/imgs/gift.png" alt="" />
    </div>
    <h4>{{ currentCoupon.Name.replace("#", " ") }}</h4>
    <h5>可用於療程商品折抵</h5>
    <ul>
      <li>
        兌換日期 <span>{{ currentCoupon.CreateTime }}</span>
      </li>
      <li>
        兌換積分 <span>{{ currentCoupon.AvaPoints }}</span>
      </li>
      <li>
        已使用日 <span>{{ formatUseTime(currentCoupon.UseTime) }}</span>
      </li>
    </ul>
    <div class="couponBoxClose" @click="closeAllModals">
      <img src="../assets/imgs/pointClose.svg" alt="" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import TitleMenu from "@/components/TitleMenu.vue";

const router = useRouter();

// 篩選狀態
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);
const yearBoxVisible = ref(false);
const monthBoxVisible = ref(false);

// 兌換記錄數據
const exchangeRecords = ref([]);
const totalRecords = ref(0);

// 彈窗控制
const verificationBoxVisible = ref(false);
const couponBoxVisible = ref(false);
const couponBoxCompletedVisible = ref(false);
const pointCoverVisible = ref(false);

// 當前券資訊
const currentCoupon = ref({
  DigitalCode: "",
  AvaPoints: "",
  Name: "",
  CreateTime: "",
  UseTime: "",
  Info: "",
});

// 用戶認證信息
const localData = localStorage.getItem("userData");
const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

// 可用年份
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i);
});

// 切換年份下拉
function toggleYearBox() {
  yearBoxVisible.value = !yearBoxVisible.value;
  monthBoxVisible.value = false;
}

// 切換月份下拉
function toggleMonthBox() {
  monthBoxVisible.value = !monthBoxVisible.value;
  yearBoxVisible.value = false;
}

// 選擇年份
function selectYear(year) {
  selectedYear.value = year;
  yearBoxVisible.value = false;
  fetchExchangeRecords();
}

// 選擇月份
function selectMonth(month) {
  selectedMonth.value = month;
  monthBoxVisible.value = false;
  fetchExchangeRecords();
}

// 獲取兌換記錄
async function fetchExchangeRecords() {
  if (!MID || !Token || !MAID || !Mobile) {
    router.push("/");
    return;
  }

  try {
    const response = await axios.post(
      "https://23700999.com:8081/HMA/API_ExchangeRec.jsp",
      {
        MID,
        Token,
        MAID,
        Mobile,
        Yr: String(selectedYear.value),
        Mn: String(selectedMonth.value).padStart(2, "0"),
      }
    );

    if (response.status === 200 && response.data.Result === "OK") {
      const exchRec = response.data.ExchangeRec || {};
      const records = exchRec.BonusExchangeList || [];

      // 轉換數據格式
      exchangeRecords.value = records.map((record) => ({
        date: formatDate(record.CreateTime),
        description: `${record.Name.replace("#", " ")} 兌換完成`,
        status: record.Info,
        originalData: record,
      }));

      totalRecords.value = exchangeRecords.value.length;
    }
  } catch (error) {
    console.error("獲取兌換記錄失敗:", error);
  }
}

// 格式化日期
// 取代原本的 formatDate
function formatDate(input) {
  if (!input) return "";

  // 先把所有非數字去掉，統一處理
  const digits = String(input).replace(/\D/g, "");

  // 至少要有 YYYYMMDD 的 8 碼
  if (digits.length >= 8) {
    const y = digits.slice(0, 4);
    const m = digits.slice(4, 6);
    const d = digits.slice(6, 8);

    // 如果有時間就一起顯示（支援到 HHmm；有秒數也會被包進來但這裡只取到分）
    if (digits.length >= 12) {
      const hh = digits.slice(8, 10);
      const mm = digits.slice(10, 12);
      return `${y}/${m}/${d}`;
    }
    return `${y}/${m}/${d}`;
  }

  // 防呆：不符合就原樣回傳
  return String(input);
}


// 格式化使用時間
function formatUseTime(str) {
  if (!str) return "";
  const digits = str.replace(/\D/g, "");

  if (digits.length === 14) {
    const year = digits.slice(0, 4);
    const month = digits.slice(4, 6);
    const day = digits.slice(6, 8);
    const hour = digits.slice(8, 10);
    const minute = digits.slice(10, 12);
    return `${year}/${month}/${day} ${hour}:${minute}`;
  } else {
    return str;
  }
}

// 獲取狀態樣式類
function getStatusClass(status) {
  if (status.includes("可立即使用")) {
    return "statusCanUse";
  } else if (status.includes("可使用日")) {
    return "statusCanUseLimit";
  } else if (status.includes("使用完畢")) {
    return "statusUsed";
  }
  return "";
}

// 查看記錄
function handleViewRecord(record) {
  closeAllModals();

  currentCoupon.value = {
    DigitalCode: record.originalData.DigitalCode,
    AvaPoints: record.originalData.AvaPoints,
    Name: record.originalData.Name,
    CreateTime: record.originalData.CreateTime,
    Info: record.originalData.Info,
    UseTime: record.originalData.UseTime,
  };

  // 根據狀態顯示對應視窗
  if (record.status.includes("可立即使用")) {
    verificationBoxVisible.value = true;
  } else if (record.status.includes("可使用日")) {
    couponBoxVisible.value = true;
    const matched = record.status.split(":")[1] || "";
    currentCoupon.value.Info = matched.trim();
  } else {
    couponBoxCompletedVisible.value = true;
  }

  pointCoverVisible.value = true;
}

// 統一關閉所有視窗
function closeAllModals() {
  verificationBoxVisible.value = false;
  couponBoxVisible.value = false;
  couponBoxCompletedVisible.value = false;
  pointCoverVisible.value = false;
}

// 點擊外部關閉下拉選單
function handleClickOutside(event) {
  const yearDropdown = document.querySelector(".yearDropdown");
  const monthDropdown = document.querySelector(".monthDropdown");

  if (
    yearDropdown &&
    !yearDropdown.contains(event.target) &&
    !event.target.closest(".filterButton")
  ) {
    yearBoxVisible.value = false;
  }

  if (
    monthDropdown &&
    !monthDropdown.contains(event.target) &&
    !event.target.closest(".filterButton")
  ) {
    monthBoxVisible.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  fetchExchangeRecords();
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style lang="scss" scoped>
.exchangeRecord {
  @include gradientBg();
  width: 100%;
  min-height: 100vh;
  position: relative;

  .exchangeRecordContainer {
    width: 100%;
    padding: 0 3%;
    padding-bottom: 120px;

    .filterSection {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin: 1rem 0;
      position: relative;

      .filterGroup {
        display: flex;
        gap: 0.75rem;
        position: relative;

        .filterButton {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--Secondary-100, #f5f7fa);
          border-radius: var(--Radius-r-20, 20px);
          box-shadow: 2px 4px 12px 0 rgba(177, 192, 216, 0.7);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;

          &:hover {
            background: var(--Secondary-200, #e8ecf2);
          }

          img {
            width: 16px;
            height: 16px;

            &.arrow {
              width: 12px;
              height: 12px;
            }
          }

          span {
            color: var(--neutral-500-opacity-70, rgba(102, 102, 102, 0.7));
            text-overflow: ellipsis;
            font-size: var(--Text-font-size-18, 18px);
            font-style: normal;
            font-weight: 400;
            letter-spacing: 2.7px;
          }
        }
      }

      .yearDropdown,
      .monthDropdown {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        background: rgba(255, 255, 255, 0.95);
        border-radius: var(--Radius-r-12, 12px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
        min-width: 120px;

        .yearItem,
        .monthItem {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid var(--Secondary-200, #e8ecf2);

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background: var(--Secondary-100, #f5f7fa);
            color: var(--Primary-default, #74bc1f);
          }
        }
      }
    }

    .totalCount {
      color: var(--Secondary-300, #b1c0d8);
      text-align: center;
      font-family: "Noto Sans";
      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.072px;
      text-align: right;
    }

    .recordList {
      margin-top: 1rem;

      .recordCard {
        display: flex;
        justify-content: space-between;

        padding: 1rem;
        margin-bottom: 0.75rem;
        background: var(--Secondary-100, #f5f7fa);
        border-radius: var(--Radius-r-20, 20px);
        box-shadow: 2px 4px 12px 0 rgba(177, 192, 216, 0.7);
        cursor: pointer;
        .recordInfo {
          flex: 1;

          .recordDate {
            color: var(--Neutral-black, #1e1e1e);
            font-size: var(--Text-font-size-18, 18px);
            font-weight: 700;
            margin-bottom: 0.5rem;
          }

          .recordDescription {
            color: var(--Secondary-300, #b1c0d8);
            font-size: var(--Text-font-size-18, 18px);
            font-style: normal;
            font-weight: 400;
            letter-spacing: 0.072px;
            margin-top: 0.75rem;
          }

          .recordStatus {
            font-size: var(--Text-font-size-14, 14px);
            font-weight: 400;
            margin-top: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;

            &.statusCanUse {
              color: var(--Primary-cyan-400, #1fbcb3);
            }

            &.statusCanUseLimit {
              color: var(--Primary-orange-400, #feac4a);
            }

            &.statusUsed {
              color: var(--Primary-red-400, #ec7d7d);
            }
          }
        }

        .recordAction {
          button {
            border: none;
            background-color: transparent;
            color: var(--Primary-default, #74bc1f);
            font-size: var(--Text-font-size-16, 16px);
            font-style: normal;
            font-weight: 400;
            line-height: 100%;
            letter-spacing: 0.5px;
            cursor: pointer;
            border-radius: var(--Radius-r-50, 50px);
            background: var(--Secondary-100, #f5f7fa);
            box-shadow: 2px 4px 12px 0
              var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
            padding: 0.5rem 0.75rem;
          }
        }
      }

      .emptyState {
        text-align: center;
        color: var(--Neutral-500, #666);
        font-size: var(--Text-font-size-16, 16px);
      }
    }

    .bottomIllustration {
      padding: 1.25rem;
      border-radius: var(--Radius-r-20, 20px);
      background: var(--Secondary-100, #f5f7fa);
      box-shadow: 2px 4px 12px 0 rgba(177, 192, 216, 0.7);

      img {
        width: 100%;
        height: auto;
        opacity: 0.8;
        transform: scaleX(-1);
      }

      h5 {
        color: var(--Neutral-black, #1e1e1e);
        text-align: center;
        font-size: var(--Text-font-size-24, 24px);
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.12px;
        margin-top: 1rem;
      }
    }
  }
}

// 彈出視窗樣式
.verificationBox {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  background-color: #fff;
  z-index: 999;
  padding: 0.75rem;
  padding-bottom: 2rem;
  border-radius: var(--Radius-r-20, 20px);
background: var(--neutral-white-opacity-65, rgba(255, 255, 255, 0.65));
box-shadow: 2px 4px 12px 0 var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.70));
backdrop-filter: blur(50px);
  max-width: 768px;
  .verificationClose {
    position: absolute;
    bottom: -18%;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    left: 50%;
    transform: translateX(-50%);
    color: #EC4F4F;
    border-radius: var(--Radius-r-50, 50px);
background: var(--Secondary-100, #F5F7FA);
box-shadow: 2px 4px 12px 0 var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.70));
padding: 0.25rem;
img{
  border: #EC4F4F 1px solid;
  border-radius: 50%;
  width: 100%;
  height: 100%;
  padding: 0.2rem;
}


  }
  .verificationNumber {
    border-radius: var(--Radius-r-20, 20px);
background: var(--Secondary-100, #F5F7FA);
box-shadow: -6px -6px 12px 0 var(--Neutral-white, #FFF) inset, 6px 6px 12px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.40)) inset;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    color: var(--Neutral-black, #1E1E1E);

font-size: var(--Text-font-size-36, 36px);
font-style: normal;
font-weight: 700;


    letter-spacing: 18px;
  }
  h4 {
    color: #1e1e1e;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0.12px;
    text-align: center;
    margin-top: 0.75rem;
  }
  h5 {
    color: #666;

    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.5px;
    text-align: center;
    margin-top: 0.35rem;
  }
  h6 {
    font-weight: 700;
    color: #74bc1f;
    text-align: center;
    font-size: 24px;
    border-top: 2px solid;
    border-bottom: 2px solid;
    padding: 10px 0;
    margin-top: 1rem;
 
    line-height: 38.832px;
  }
  small{
    color: rgba(0, 0, 0, 0.30);
font-size: 14px;
font-style: normal;
font-weight: 400;

width: 100%;
display: flex;

justify-content: center;
letter-spacing: 0.048px;
margin-top: 0.5rem;

  }
}

.couponBox,
.couponBoxCompleted {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;

  border-radius: var(--Radius-r-20, 20px);
  background: var(--neutral-white-opacity-65, rgba(255, 255, 255, 0.65));
  box-shadow: 2px 4px 12px 0
    var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
  backdrop-filter: blur(50px);
  padding: 1rem;
  width: 90%;
  min-height: 510px;
  max-height: 600px;

  .couponBoxImgGroup {
    text-align: center;
    margin: 0 auto;

    img {
      width: 275px;
      transform: translateX(3%);
    }
  }

  h4 {
    color: #1e1e1e;
    text-align: center;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0.12px;
    margin-top: 0.25rem;
  }

  h5 {
    color: #666;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.5px;
    text-align: center;
    margin-top: 0.35rem;
  }

  ul {
    margin-top: 1rem;
    display: grid;
    justify-content: center;

    li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      line-height: 1.4;
      color: #666;
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.09px;

      &:nth-child(1) span {
        color: #74bc1f;
      }
      &:nth-child(2) span {
        color: #ec7d7d;
      }
      &:nth-child(3) span {
        color: #1fbcb3;
      }
    }
  }
}

.couponBoxCompleted {
  img {
    filter: grayscale(0.98);
  }
}

.verificationClose,
.couponBoxClose {
  position: absolute;
  bottom: -10%;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  left: 50%;
  transform: translateX(-50%);
  color: #ec4f4f;
  border-radius: var(--Radius-r-50, 50px);
  background: var(--Secondary-100, #f5f7fa);
  box-shadow: 2px 4px 12px 0
    var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
  padding: 0.25rem;
  img {
    border: #ec4f4f 1px solid;
    border-radius: 50%;
    width: 100%;
    height: 100%;
    padding: 0.2rem;
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

// 響應式設計
@media (max-width: 768px) {
  .exchangeRecord {
    .exchangeRecordContainer {
      padding: 0 5%;

      .filterSection {
        .filterGroup {
          .filterButton {
            padding: 0.4rem 0.8rem;

            span {
              font-size: var(--Text-font-size-14, 14px);
            }
          }
        }
      }
    }
  }
}
</style>
