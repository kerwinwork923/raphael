<template>
  <RaphaelLoading v-if="loading" />
  <HRVAlertForUse :showCloseButton="true" />
  <DSPRSelect :showCloseButton="false" />

  <div class="usageWrap">
    <!-- 頁面標題 -->
    <TitleMenu Text="穿衣紀錄" :link="`/UsageHistory`" />

    <!-- 根據產品類型顯示對應 TimeRing 或卡片 (保留原程式邏輯) -->
    <TimeRing2
      v-if="productName === '三效深眠衣' || productName === '全效調節衣'"
      :productName="productName"
      :hasDetectRecord="false"
      :todayUseRecord="todayUseRecord"
      :hasDetectTime="hasDetectTime"
    />
    <TimeRing
      v-if="productName === '居家治療儀'"
      :totalTime="3000"
      :product-name="productName"
      :hasTodayRecord="false"
      @countdownComplete="handleCountdownComplete"
      @requireHRVCheck="handleHRVCheck"
    />
    <TimeRing
      v-if="productName === '雙效紅光活力衣'"
      :totalTime="5400"
      :product-name="productName"
      :hasTodayRecord="false"
      @countdownComplete="handleCountdownComplete"
      @requireHRVCheck="handleHRVCheck"
    />

    <!-- 四種產品的說明卡片 (原邏輯) -->
    <div class="usageInfoGroup" v-if="usageCardState === '雙效紅光活力衣'">
      <div class="usageInfoCard">
        <h3>電量提示燈使用說明</h3>
        <div class="item">
          <span class="greenLight">•綠燈恆亮</span>
          <div class="text">正常電量</div>
        </div>
        <div class="item">
          <span class="greenLight">•綠燈閃爍</span>
          <div class="text">充電中，需充滿4小時</div>
        </div>
        <div class="item">
          <span class="redLight">•紅燈恆亮</span>
          <div class="text">電量剩餘25% (治療完需充電)</div>
        </div>
        <div class="item">
          <span class="redLight">•紅燈閃爍</span>
          <div class="text">電量剩餘5% (不計治療次數)</div>
        </div>
      </div>
      <div class="usageInfoCard">
        <h3>提示音說明</h3>
        <div class="item">
          <span class="greenLight">•開始</span>
          <div class="text">1短聲</div>
        </div>
        <div class="item">
          <span class="redLight">•結束</span>
          <div class="text">長音間隔1分鐘</div>
        </div>
        <div class="item">
          <span class="orangeLight">•合約到期/次數用完</span>
          <div class="text">長音間隔1分鐘，紅綠燈交替閃爍</div>
        </div>
      </div>
    </div>

    <div class="usageInfoGroup" v-if="usageCardState === '三效深眠衣'">
      <div class="usageInfoCard">
        <h3>量身訂製</h3>
        <p>依照您的健康狀況製作客製化調節貼片位置。</p>
      </div>
      <div class="usageInfoCard">
        <h3>持續調節</h3>
        <p>將三效深眠衣取代睡衣，每日穿著，持續調節自律神經生理機能。</p>
      </div>
      <div class="usageInfoCard">
        <h3>洗滌維護</h3>
        <p>可以直接手洗、或放置洗衣袋隨一般衣物清洗(勿加漂白水)。</p>
      </div>
    </div>

    <div class="usageInfoGroup" v-if="usageCardState === '居家治療儀'">
      <div class="usageInfoCard">
        <h3>安全模式啟動</h3>
        <p>
          如果治療過程中遇到問題，設備會進入安全模式，使用者可以按下「解除」鍵，排除問題後繼續使用。
        </p>
      </div>
      <div class="usageInfoCard">
        <h3>貼片脫落提示</h3>
        <p>
          當設備提示貼片可能脫落時，應根據示意圖檢查貼片位置，並在確認貼好後按下「解除」鍵繼續治療。
        </p>
      </div>
    </div>

    <div class="usageInfoGroup" v-if="usageCardState === '全效調節衣'">
      <div class="usageInfoCard">
        <h3>非侵入性治療</h3>
        <p>
          這款全效調節衣使用的是物理性治療，不涉及任何藥物，適合那些想要避免藥物副作用的患者。它依賴於專利技術的貼片，通過波頻影響神經系統
        </p>
      </div>
      <div class="usageInfoCard">
        <h3>針對自律神經問題設計</h3>
        <p>
          全效調節衣專為改善自律神經失調而設計，適用於失眠、焦慮、情緒不穩定等問題，也能幫助增強免疫系統
        </p>
      </div>
      <div class="usageInfoCard">
        <h3>適合居家使用</h3>
        <p>
          全效調節衣是一款設計簡單、方便的保健產品，適合在家中進行日常使用，無需到診所即可完成自律神經的調節
        </p>
      </div>
    </div>

    <!-- 篩選：年份&月份 -->
    <div class="usageRecord">
      <div class="detectSelectGroup">
        <div class="yearSelectGroup">
          <img src="/assets/imgs/filter.svg" alt="年份篩選" />
          <div class="monthText" @click="toggleYearBox">
            {{ selectedYear }}年
          </div>
          <div class="yearBox" v-show="yearBoxVisible">
            <div
              class="year"
              v-for="year in displayYears"
              :key="year"
              @click="selectYear(year)"
            >
              {{ year }}
            </div>
          </div>
        </div>
        <div class="monthSelectGroup">
          <img src="/assets/imgs/filter.svg" alt="月份篩選" />
          <div class="monthText" @click="toggleMonthBox">
            {{ selectedMonth }}月份
          </div>
          <div class="monthBox" v-show="monthBoxVisible">
            <div
              class="month"
              v-for="month in months"
              :key="month"
              @click="selectMonth(month)"
            >
              {{ month }}月
            </div>
          </div>
        </div>
      </div>

      <!-- 顯示「UseRecord」的使用紀錄  (不再依賴 HRV2Record) -->
      <div class="integrationGroup">
        <div
          class="detectItem"
          v-for="(item, idx) in filteredUseList"
          :key="idx"
        >
          <div class="detect">
            <div class="timeGroup">
              <!-- 🔸 watchClick：點擊「左側圖示」 -> `handleWatchClick` -->
              <div
                class="timeIcon"
           
                style="cursor: pointer"
              >
                <img
                  src="../../assets/imgs/detectTime.svg"
                  alt="查看健康數據"
                />
              </div>
              <div class="timeTextGroup">
                <!-- 開始&結束時間 -->
                <div class="time">
                  {{ formatTimestamp3(item.oriStartTime) }}
                </div>

                <!-- 總共使用多久 (分鐘) -->
                <div class="timeInfoText">
                  總共使用 {{ calcUsedMinutes(item) }} 分鐘
                </div>
              </div>
            </div>
            <div class="infoGroup">
              <!-- 🔸 detectClick：點擊「分析結果」 -> 路由 / usageHRVResult/... -->
              <div
                class="resultText"
                :style="{ cursor: 'pointer' }"
                @click="handleDetectClick(item)"
              >
                分析結果
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                :style="{ cursor: 'pointer' }"
                @click="handleDetectClick(item)"
              >
                <path
                  d="M5.99159 3.37719L11.4726 8.99994L5.99159 14.6227C5.89346 14.7232 5.83853 14.858 5.83853 14.9984C5.83853 15.1389 5.89346 15.2737 5.99159 15.3742C6.03925 15.4228 6.09613 15.4615 6.15891 15.4879C6.2217 15.5142 6.28911 15.5278 6.35721 15.5278C6.42531 15.5278 6.49273 15.5142 6.55551 15.4879C6.61829 15.4615 6.67518 15.4228 6.72284 15.3742L12.5548 9.39257C12.6572 9.28752 12.7145 9.14664 12.7145 8.99994C12.7145 8.85325 12.6572 8.71236 12.5548 8.60732L6.72396 2.62569C6.67627 2.57671 6.61924 2.53777 6.55625 2.51119C6.49326 2.4846 6.42558 2.4709 6.35721 2.4709C6.28884 2.4709 6.22116 2.4846 6.15817 2.51119C6.09518 2.53777 6.03816 2.57671 5.99046 2.62569C5.89234 2.72615 5.8374 2.86101 5.8374 3.00144C5.8374 3.14187 5.89234 3.27673 5.99046 3.37719Z"
                  fill="#666666"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        <!-- 若沒有任何使用紀錄則顯示「無檢測資料」 -->
        <div class="notDetectData" v-if="filteredUseList.length === 0">
          無檢測資料
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

import TitleMenu from "@/components/TitleMenu.vue";
import TimeRing from "@/components/TimeRing.vue";
import TimeRing2 from "@/components/TimeRing2.vue";
import DSPRSelect from "@/components/DSPRSelect.vue";
import HRVAlertForUse from "@/components/HRVAlertForUse.vue";
import RaphaelLoading from "@/components/RaphaelLoading";
import { useCommon } from "../stores/common";

/** 解析 YYYYMMDDHHmmss => Date */
function parseYMDHMS(str) {
  if (!str || str.length < 14) return null;
  const yyyy = Number(str.slice(0, 4));
  const MM = Number(str.slice(4, 6)) - 1;
  const dd = Number(str.slice(6, 8));
  const HH = Number(str.slice(8, 10));
  const mm = Number(str.slice(10, 12));
  const ss = Number(str.slice(12, 14));
  return new Date(yyyy, MM, dd, HH, mm, ss);
}

/** 轉成 M/D HH:mm */
function formatTimestamp3(inputStr) {
  if (!inputStr) return "";
  // 若包含 "/" 表示已是「YYYY/MM/DD HH:mm」或類似格式 => 原樣顯示
  if (inputStr.includes("/")) return inputStr;

  // 否則視為 YYYYMMDDHHmmss => 轉成「M/D HH:mm」
  if (inputStr.length < 12) return inputStr; // 可能格式不符
  const yyyy = Number(inputStr.slice(0, 4));
  const MM = Number(inputStr.slice(4, 6)) - 1;
  const dd = Number(inputStr.slice(6, 8));
  const HH = Number(inputStr.slice(8, 10));
  const mm = Number(inputStr.slice(10, 12));
  const dateObj = new Date(yyyy, MM, dd, HH, mm);
  if (isNaN(dateObj.getTime())) return inputStr;
  const M = dateObj.getMonth() + 1;
  const D = dateObj.getDate();
  const hStr = String(dateObj.getHours()).padStart(2, "0");
  const mStr = String(dateObj.getMinutes()).padStart(2, "0");
  return `${M}/${D} ${hStr}:${mStr}`;
}

export default {
  name: "UsageHistoryView",
  components: {
    TitleMenu,
    TimeRing,
    TimeRing2,
    DSPRSelect,
    HRVAlertForUse,
    RaphaelLoading,
  },
  setup() {
    const router = useRouter();
    const store = useCommon();

    // 產品名稱 (路由)
    const productName = decodeURIComponent(
      router.currentRoute.value.params.clothType || ""
    );
    const validName = [
      "三效深眠衣",
      "雙效紅光活力衣",
      "全效調節衣",
      "居家治療儀",
    ];
    if (!validName.includes(productName)) {
      router.push("/usageHistory");
    }

    const loading = ref(false);
    const usageCardState = ref(productName);

    // UseRecord
    const useData = ref([]);

    // UI 顯示的狀態
    const hasDetectTime = ref("00:00:00");
    const todayUseRecord = ref([]);

    // 篩選: 年/月
    const selectedYear = ref(new Date().getFullYear());
    const selectedMonth = ref(new Date().getMonth() + 1);
    const yearBoxVisible = ref(false);
    const monthBoxVisible = ref(false);

    // 從 2024 到今年
    const displayYears = computed(() => {
      const nowY = new Date().getFullYear();
      const arr = [];
      for (let y = 2024; y <= nowY; y++) arr.push(y);
      return arr;
    });
    // 12~1
    const months = Array.from({ length: 12 }, (_, i) => i + 1).reverse();

    function toggleYearBox() {
      yearBoxVisible.value = !yearBoxVisible.value;
      monthBoxVisible.value = false;
    }
    function toggleMonthBox() {
      monthBoxVisible.value = !monthBoxVisible.value;
      yearBoxVisible.value = false;
    }
    function selectYear(y) {
      selectedYear.value = y;
      yearBoxVisible.value = false;
    }
    function selectMonth(m) {
      selectedMonth.value = m;
      monthBoxVisible.value = false;
    }

    // 請求 API_UseStart_Data.jsp => 過濾 productName
    async function getUseRecord() {
      try {
        loading.value = true;
        const localData = localStorage.getItem("userData");
        if (!localData) {
          router.push("/");
          return;
        }
        const { MID, Token, MAID, Mobile } = JSON.parse(localData);
        const resp = await axios.post(
          "https://23700999.com:8081/HMA/API_UseStart_Data.jsp",
          { MID, Token, MAID, Mobile }
        );
        if (resp.status === 200 && resp.data?.UseRecord) {
          const rawList = resp.data.UseRecord;
          // 過濾同產品
          const filtered = rawList.filter((r) => r.ProductName === productName);
          useData.value = filtered;

          // 計算最後一筆使用時長 => hasDetectTime (僅供 UI 顯示)
          if (filtered.length > 0) {
            const lastOne = filtered[filtered.length - 1];
            const s = parseYMDHMS(lastOne.oriStartTime);
            const e = parseYMDHMS(lastOne.oriEndTime);
            if (s && e && e > s) {
              const diffSec = Math.floor((e - s) / 1000);
              const hh = String(Math.floor(diffSec / 3600)).padStart(2, "0");
              const mm = String(Math.floor((diffSec % 3600) / 60)).padStart(
                2,
                "0"
              );
              const ss = String(diffSec % 60).padStart(2, "0");
              hasDetectTime.value = `${hh}:${mm}:${ss}`;
            }
          }

          // 當日 (5am 為界) 使用紀錄
          const now = new Date();
          const resetTime = new Date();
          resetTime.setHours(5, 0, 0, 0);
          if (now < resetTime) {
            resetTime.setDate(resetTime.getDate() - 1);
          }
          todayUseRecord.value = filtered.filter((r) => {
            const endDt = new Date(r.EndTime.replace(/\//g, "-"));
            return endDt >= resetTime;
          });
        }
      } catch (error) {
        console.error("getUseRecord error:", error);
      } finally {
        loading.value = false;
      }
    }

    // 計算單筆使用時長(分鐘)
    function calcUsedMinutes(item) {
      const start = parseYMDHMS(item.oriStartTime);
      const end = parseYMDHMS(item.oriEndTime);
      if (!start || !end || end <= start) return 0;
      return Math.round((end - start) / 60000);
    }

    // 篩選當前年/月 => 顯示
    const filteredUseList = computed(() => {
      return useData.value.filter((item) => {
        const dt = parseYMDHMS(item.oriStartTime);
        if (!dt || isNaN(dt.getTime())) return false;
        return (
          dt.getFullYear() === selectedYear.value &&
          dt.getMonth() + 1 === selectedMonth.value
        );
      });
    });

    // 「分析結果」按鈕
    function handleDetectClick(item) {
      // 進入檢測結果頁
      router.push(`/usageHRVResult/${item.UID}`);
    }

    // 「左側小錶」圖示 => 查看健康數據
    function handleWatchClick(item) {
      // 進入健康數據頁
      router.push(`/healthData/${item}`);
    }

    // dummy
    function handleCountdownComplete() {}
    function handleHRVCheck() {}

    onMounted(() => {
      getUseRecord();
    });

    return {
      loading,
      productName,
      usageCardState,

      // TimeRing2 需要
      hasDetectTime,
      todayUseRecord,

      // 篩選
      selectedYear,
      selectedMonth,
      yearBoxVisible,
      monthBoxVisible,
      displayYears,
      months,
      toggleYearBox,
      toggleMonthBox,
      selectYear,
      selectMonth,

      // 主要資料
      useData,
      filteredUseList,
      calcUsedMinutes,
      formatTimestamp3,

      // 按鈕/圖示事件
      handleDetectClick,
      handleWatchClick,

      // 可保留以防有其它地方用
      handleCountdownComplete,
      handleHRVCheck,
    };
  },
};
</script>

<style lang="scss" scoped>
.usageWrap {
  background-color: $raphael-gray-100;
  width: 100%;
  padding: 0 1rem;
  position: relative;
  padding-bottom: 3.125rem;
  place-items: center;

  .usageInfoGroup {
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    width: 100%;
    max-width: 768px;
    margin-top: 0.75rem;
    @include scrollbarStyle();

    .usageInfoCard {
      background-color: $raphael-white;
      padding: 12px;
      border-radius: 12px;
      flex-shrink: 0;
      max-width: 320px;
      color: $raphael-gray-500;
      font-size: 18px;
      font-weight: 400;
      letter-spacing: 0.09px;

      $colors: $raphael-green-400, $raphael-cyan-400, $raphael-purple-200;
      @for $i from 1 through length($colors) {
        &:nth-child(#{$i}) {
          border-left: 2px solid nth($colors, $i);
        }
      }

      h3 {
        font-size: 20px;
        color: $raphael-black;
        margin-bottom: 0.75rem;
      }
      .item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        margin-top: 0.75rem;
        .text {
          margin-left: 18px;
        }

        .greenLight {
          color: $raphael-green-400;
          white-space: nowrap;
        }
        .redLight {
          color: $raphael-red-300;
          white-space: nowrap;
        }
        .orangeLight {
          color: $raphael-orange-400;
          white-space: nowrap;
        }
      }
      p {
        color: $raphael-gray-500;
        font-size: 18px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.09px;
        margin-top: 0.5rem;
        line-height: 29.1px;
      }
    }
  }

  .usageRecord {
    background-color: $raphael-white;
    margin-top: 0.75rem;
    border-radius: 0.75rem;
    padding: 0.75rem;
    width: 100%;
    max-width: 768px;
    position: relative;

    .detectSelectGroup {
      display: flex;
      align-items: center;
      justify-content: end;
      gap: 0.75rem;
      padding: 0.75rem 0;
      color: $raphael-gray-500;
      margin-top: 0.25rem;
    }
    .yearSelectGroup,
    .monthSelectGroup {
      display: flex;
      align-items: center;
      gap: 2px;
      position: relative;
      cursor: pointer;
    }
    .yearBox,
    .monthBox {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      position: absolute;
      top: 100%;
      right: 0;
      background: rgba(255, 255, 255, 0.85);
      width: 200%;
      border-radius: 8px;
      text-align: center;
      padding: 0.75rem;
      font-size: 18px;
      max-height: 200px;
      backdrop-filter: blur(6px);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
      overflow-y: auto;
      transform: 0.25s all ease;
      animation: 0.3s fadeIn forwards;
      z-index: 10;

      .year,
      .month {
        transform: 0.25s all ease;
        &:hover {
          color: $raphael-green-400;
        }
      }
    }

    .integrationGroup {
      overflow-y: auto;
      height: calc(100vh - 549px);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      @include scrollbarStyle();
      position: relative;

      @include respond-to("phone-landscape") {
        height: calc(100vh - 100px);
      }

      .detectItem {
        width: 100%;
        margin: 0 auto;
        opacity: 0;
        transition: 0.2s ease all;
        animation: fadeIn2 1s ease forwards;
        animation-delay: 0s;

        &:hover {
          box-shadow: 0px 5px 10px -2px #ccc inset;
          padding: 0 4px;
        }

        .detect {
          text-decoration: none;
          color: $raphael-black;
          display: flex;
          justify-content: space-between;

          .timeGroup {
            display: flex;
            align-items: center;
            gap: 8px;

            .timeIcon {
              border-radius: 7px;
              padding: 6px;
              border: 1px solid $raphael-green-400;
            }
            .time {
              font-size: 20px;
              font-style: normal;
              font-weight: 400;
              letter-spacing: 0.15px;
            }
          }
          .timeTextGroup {
            display: flex;
            flex-direction: column;
            line-height: 1.35;
            .timeInfoText {
              color: $raphael-gray-500;
              font-size: 16px;
              letter-spacing: 0.5px;
            }
          }
          .infoGroup {
            display: flex;
            align-items: center;
            white-space: nowrap;
            justify-content: end;
            gap: 0.5rem;

            .resultText {
              color: var(--shade-gray-500, #666);

              font-size: 16px;
              font-style: normal;
              font-weight: 400;

              letter-spacing: 0.5px;
            }
            svg {
              width: 18px;
            }
          }
        }
      }
    }

    .notDetectData {
      display: flex;
      align-items: center;
      justify-content: center;
      height: inherit;
      letter-spacing: 10px;
      font-size: 1.25rem;
      white-space: nowrap;
      color: $raphael-gray-300;
    }
  }
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
