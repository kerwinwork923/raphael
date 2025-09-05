<template>
  <div class="pointRecord">
    <div class="pointRecordContainer">
      <TitleMenu Text="積分紀錄" link="/point"></TitleMenu>

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

      <!-- 積分記錄列表 -->
      <div class="recordList">
        <div
          class="recordCard"
          v-for="(record, index) in pointRecords"
          :key="index"
        >
          <div class="recordInfo">
            <div class="recordDate">{{ record.date }}</div>
            <div class="recordDescription">{{ record.description }}</div>
            <div class="recordStatus" :class="getStatusClass(record.status)">
              {{ record.status }}
            </div>
          </div>
          <div class="recordPoints" :class="getPointsClass(record.status)">
            +{{ record.points }}
          </div>
        </div>
     
        <!-- 空狀態 -->
        <div class="emptyState" v-if="pointRecords.length === 0">
          <!-- 底部插圖 -->
          <div class="bottomIllustration">
            <img src="../assets/imgs/robot_sad.png" alt="目前沒有資料" />
            <h5>目前沒有資料</h5>
          </div>
        </div>
      </div>
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

// 積分記錄數據
const pointRecords = ref([]);
const totalRecords = ref(0);

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
  fetchPointRecords();
}

// 選擇月份
function selectMonth(month) {
  selectedMonth.value = month;
  monthBoxVisible.value = false;
  fetchPointRecords();
}

// 獲取積分記錄
async function fetchPointRecords() {
  if (!MID || !Token || !MAID || !Mobile) {
    router.push("/");
    return;
  }

  try {
    const response = await axios.post(
      "https://23700999.com:8081/HMA/API_BonusRec.jsp",
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
      const bonusRec = response.data.BonusRec || {};
      const records = bonusRec.BonusRecList || [];

      // 轉換數據格式
      pointRecords.value = records.map((record) => ({
        date: formatDate(record.CreateTime),
        description: record.Name,
        status: getStatusText(record.Info),
        points: record.Points,
        originalInfo: record.Info,
      }));

      totalRecords.value = pointRecords.value.length;
    }
  } catch (error) {
    console.error("獲取積分記錄失敗:", error);
  }
}

// 格式化日期
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

// 獲取狀態文字
function getStatusText(info) {
  if (!info) return "";

  if (info.includes("到期日")) {
    return info; // 直接顯示到期日信息
  } else if (info.includes("已過期")) {
    return "已過期";
  }

  return info;
}

// 獲取狀態樣式類
function getStatusClass(status) {
  if (status.includes("到期日")) {
    return "statusExpiry";
  } else if (status === "已過期") {
    return "statusExpired";
  }
  return "";
}

// 獲取積分樣式類
function getPointsClass(status) {
  if (status === "已過期") {
    return "pointsExpired";
  }
  return "pointsActive";
}

// 返回上一頁
function goBack() {
  router.back();
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
  fetchPointRecords();
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style lang="scss" scoped>
.pointRecord {
  @include gradientBg();
  width: 100%;
  min-height: 100vh;
  position: relative;

  .pointRecordContainer {
    width: 100%;
    padding: 0 3%;
    padding-bottom: 120px; // 為底部按鈕留出空間

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

            &.statusExpiry {
              color: var(--Primary-orange-400, #feac4a);
            }

            &.statusExpired {
              color: var(--Primary-red-400, #ec7d7d);
            }
          }
        }

        .recordPoints {
          font-size: var(--Text-font-size-18, 18px);
          font-weight: 500;
          font-weight: 700;

          &.pointsActive {
            color: var(--Primary-default, #74bc1f);
          }

          &.pointsExpired {
            color: var(--Neutral-400, #ccc);
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
      box-shadow: 2px 4px 12px 0
        var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
      img {
        width: 100%;

        height: auto;
        opacity: 0.8;

        transform: scaleX(-1);
      }
      color: var(--Neutral-black, #1e1e1e);
      text-align: center;
      font-size: var(--Text-font-size-24, 24px);
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.12px;
    }
  }
}

// 響應式設計
@media (max-width: 768px) {
  .pointRecord {
    .pointRecordContainer {
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
