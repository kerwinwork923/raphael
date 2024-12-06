<template>
  <RaphaelLoading v-if="loading" />
  <div class="usageWrap">
    <TitleMenu Text="使用紀錄" :link="`back`" />
    <TimeRing
      :totalTime="30"
      :product-name="productName"
      :startBtnActive="startBtnActive"
      :redirectPath="{ default: '/usageHistory', hrv: '/vital/scan.html' }"
      :showMessageProp="showMessage"
      @countdownComplete="handleCountdownComplete"
    />
    <div class="usageInfoGroup" v-if="usageCardState === '紅光版'">
      <div class="usageInfoCard">
        <h3>電量提示燈使用說明</h3>
        <h4><span class="greenLight">•綠燈</span> 電量充足</h4>
        <h4><span class="redLight">•紅燈</span> 低電量，使用完請充電四小時</h4>
        <h4><span class="orangeLight">•橘燈閃爍</span> 使用次數剩餘3次</h4>
        <h4>
          <span class="orangeLight">•橘燈閃爍+1長聲嗶一次</span> 合約已到期
        </h4>
      </div>
      <div class="usageInfoCard">
        <h3>提示音說明</h3>
        <h4><span class="greenLight">•開始</span> 1短聲嗶一次</h4>
        <h4><span class="redLight">•結束</span> 低1長聲嗶一次</h4>
        <h4>
          <span class="orangeLight">•即將斷電 </span> 2短聲嗶三次(請盡速充電)
        </h4>
        <h4><span class="orangeLight">•今日已使用</span> 2短聲嗶一次</h4>
      </div>
    </div>

    <div class="usageInfoGroup" v-if="usageCardState === '保健版'">
      <div class="usageInfoCard">
        <h3 style="font-weight: 700; font-size: 20px">量身訂製</h3>
        <p>依照您的健康狀況製作客製化調節貼片位置。</p>
      </div>
      <div class="usageInfoCard">
        <h3 style="font-weight: 700; font-size: 20px">持續調節</h3>
        <p>將第四代穿戴調節衣取代睡衣，每日穿著，持續調節自律神經生理機能。</p>
      </div>
      <div class="usageInfoCard">
        <h3 style="font-weight: 700; font-size: 20px">洗滌維護</h3>
        <p>可以直接手洗、或放置洗衣袋隨一般衣物清洗(勿加漂白水)。</p>
      </div>
    </div>

    <div class="usageInfoGroup" v-if="usageCardState === '調節衣'">
      <div class="usageInfoCard">
        <h3 style="font-weight: 700; font-size: 20px">安全模式啟動</h3>
        <p>
          如果治療過程中遇到問題，設備會進入安全模式，使用者可以按下「解除」鍵，排除問題後繼續使用。
        </p>
      </div>
      <div class="usageInfoCard">
        <h3 style="font-weight: 700; font-size: 20px">貼片脫落提示</h3>
        <p>
          當設備提示貼片可能脫落時，應根據示意圖檢查貼片位置，並在確認貼好後按下「解除」鍵繼續治療。
        </p>
      </div>
    </div>

    <div class="usageInfoGroup" v-if="usageCardState === '居家治療儀'">
      <div class="usageInfoCard">
        <h3 style="font-weight: 700; font-size: 20px">非侵入性治療</h3>
        <p>
          這款調節衣使用的是物理性治療，不涉及任何藥物，適合那些想要避免藥物副作用的患者。它依賴於專利技術的貼片，通過波頻影響神經系統​
        </p>
      </div>
      <div class="usageInfoCard">
        <h3 style="font-weight: 700; font-size: 20px">針對自律神經問題設計</h3>
        <p>
          穿戴調節衣專為改善自律神經失調而設計，適用於失眠、焦慮、情緒不穩定等問題，也能幫助增強免疫系統
        </p>
      </div>
      <div class="usageInfoCard">
        <h3 style="font-weight: 700; font-size: 20px">適合居家使用</h3>
        <p>
          普通版穿戴調節衣是一款設計簡單、方便的保健產品，適合在家中進行日常使用，無需到診所即可完成自律神經的調節
        </p>
      </div>
    </div>

    <div class="usageRecord">
      <div class="usageRecordTitleGroup">
        <h3 :class="{ active: useActive }" @click="changeUseActive">
          使用紀錄
        </h3>
        <h3 :class="{ active: detectActive }" @click="changeDetectActive">
          檢測紀錄
        </h3>
      </div>

      <!-- 年份和月份選擇框 -->
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

      <div class="useGroup" v-if="useActive">
        <div
          class="useList"
          v-for="item in filteredUsage"
          :key="item.StartTime"
        >
          <div class="dateList" @click="selectDate(item)">
            <div class="timeGroup">
              <div class="timeIcon">
                <img src="../../assets/imgs/detectTime.svg" alt="" />
              </div>
              <div class="time">{{ formatTimestamp3(item?.StartTime) }}</div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              :style="{
                transform:
                  selectedDate === item.StartTime
                    ? 'rotate(90deg)'
                    : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
              }"
            >
              <path
                d="M5.99159 3.37719L11.4726 8.99994L5.99159 14.6227C5.89346 14.7232 5.83853 14.858 5.83853 14.9984C5.83853 15.1389 5.89346 15.2737 5.99159 15.3742C6.03925 15.4228 6.09613 15.4615 6.15891 15.4879C6.2217 15.5142 6.28911 15.5278 6.35721 15.5278C6.42531 15.5278 6.49273 15.5142 6.55551 15.4879C6.61829 15.4615 6.67518 15.4228 6.72284 15.3742L12.5548 9.39257C12.6572 9.28752 12.7145 9.14664 12.7145 8.99994C12.7145 8.85325 12.6572 8.71236 12.5548 8.60732L6.72396 2.62569C6.67627 2.57671 6.61924 2.53777 6.55625 2.51119C6.49326 2.4846 6.42558 2.4709 6.35721 2.4709C6.28884 2.4709 6.22116 2.4846 6.15817 2.51119C6.09518 2.53777 6.03816 2.57671 5.99046 2.62569C5.89234 2.72615 5.8374 2.86101 5.8374 3.00144C5.8374 3.14187 5.89234 3.27673 5.99046 3.37719L5.99159 3.37719Z"
                fill="#666666"
              />
            </svg>
          </div>

          <div class="actionGroup" v-if="selectedDate === item.StartTime">
            <div class="startGroup">
              <img src="/assets/imgs/play.svg" alt="" />
              <div class="actionContent">
                <h4>開始時間</h4>
                <p>{{ formatTimestamp3(item?.StartTime) }}</p>
              </div>
            </div>
            <div class="pauseGroup">
              <img src="/assets/imgs/pause.svg" alt="" />
              <div class="actionContent">
                <h4>暫停時間</h4>
                <p v-for="pause in item.Pause" :key="pause.PauseStart">
                  {{ formatTimestamp3(pause?.PauseStart) }} -
                  {{ formatTimestamp3(pause?.PauseEnd) }}
                  <span> ({{ pause?.minutesDifference }})分鐘 </span>
                </p>
              </div>
            </div>
            <div class="stopGroup">
              <img src="/assets/imgs/stop.svg" alt="" />
              <div class="actionContent">
                <h4>結束時間</h4>
                <p>{{ formatTimestamp3(item?.EndTime) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="notDetectData" v-if="useData?.length === 0">無檢測資料</div>
      </div>

      <div class="detectGroup" v-if="detectActive">
        <div
          class="detectItem"
          v-for="(item, index) in filteredHRVData"
          :key="index"
        >
          <!-- `/vital/detail.html?AID=` -->
          <a :href="`/usageHRVResult/${item.UID}`">
            <div class="timeGroup">
              <div class="timeIcon">
                <img src="../../assets/imgs/detectTime.svg" alt="" />
              </div>
              <div class="timeTextGroup">
                <div class="time">{{ formatTimestamp3(item.CheckTime) }}</div>
                <div class="timeInfoText">
                  {{ item.ProductName }} {{ item.BcAf }}
                </div>
              </div>
            </div>
            <div class="infoGroup">
              <div class="detectAgeGroup">
                <h4>生理年齡</h4>
                <h5>
                  <span>{{ item.bioage }}</span
                  >歲
                </h5>
              </div>
              <div class="detectHRVGroup">
                <h4>HRV</h4>
                <h5>
                  <span>{{ Math.round(item.HRV * 10) / 10 }}</span
                  >ms
                </h5>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M5.99159 3.37719L11.4726 8.99994L5.99159 14.6227C5.89346 14.7232 5.83853 14.858 5.83853 14.9984C5.83853 15.1389 5.89346 15.2737 5.99159 15.3742C6.03925 15.4228 6.09613 15.4615 6.15891 15.4879C6.2217 15.5142 6.28911 15.5278 6.35721 15.5278C6.42531 15.5278 6.49273 15.5142 6.55551 15.4879C6.61829 15.4615 6.67518 15.4228 6.72284 15.3742L12.5548 9.39257C12.6572 9.28752 12.7145 9.14664 12.7145 8.99994C12.7145 8.85325 12.6572 8.71236 12.5548 8.60732L6.72396 2.62569C6.67627 2.57671 6.61924 2.53777 6.55625 2.51119C6.49326 2.4846 6.42558 2.4709 6.35721 2.4709C6.28884 2.4709 6.22116 2.4846 6.15817 2.51119C6.09518 2.53777 6.03816 2.57671 5.99046 2.62569C5.89234 2.72615 5.8374 2.86101 5.8374 3.00144C5.8374 3.14187 5.89234 3.27673 5.99046 3.37719L5.99159 3.37719Z"
                  fill="#666666"
                />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </div>
    <div class="usageBtnGroup">
      <button class="preBtn" @click="goPre">上一步</button>
      <button class="nextBtn" @click="goNext">{{ goNextText }}</button>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import TitleMenu from "@/components/TitleMenu.vue";
import TimeRing from "@/components/TimeRing.vue";
import { formatTimestampMDH, formatTimestamp3 } from "~/fn/utils";
import axios from "axios";
import { ref, computed, onMounted } from "vue";
import RaphaelLoading from "../components/RaphaelLoading";
export default {
  components: { RaphaelLoading, TitleMenu, TimeRing },
  components: {
    TitleMenu,
    TimeRing,
  },
  setup() {
    const route = useRouter().currentRoute.value;
    const productName = decodeURIComponent(route.params.clothType);

    const validName = ["調節衣", "紅光版", "保健版", "居家治療儀"];

    const redirectToHRV = ref(false);

    const handleCountdownComplete = () => {
      redirectToHRV.value = true;
      goNextText.value = "HRV检测";
    };

    const goNextText = ref("");

    if (!validName.includes(productName)) {
      window.location.href = "/usageHistory";
    }

    const selectedYear = ref(new Date().getFullYear());
    const selectedMonth = ref(new Date().getMonth() + 1);
    const yearBoxVisible = ref(false);
    const monthBoxVisible = ref(false);
    const selectedDate = ref(null);
    const useData = ref();
    const detectData = ref([]);
    const loading = ref(false);

    const startBtnActive = ref(false);
    const showMessage = ref(false);

    const usageCardState = ref("");
    if (productName) usageCardState.value = productName;

    const useActive = ref(true);
    const detectActive = ref(false);

    const months = Array.from({ length: 12 }, (_, i) => i + 1).reverse();
    const displayYears = computed(() => {
      const currentYear = new Date().getFullYear();
      const startYear = 2024;
      const years = [];
      for (let year = startYear; year <= currentYear; year++) {
        years.push(year);
      }
      return years;
    });

    const router = useRouter();
    function toggleYearBox() {
      yearBoxVisible.value = !yearBoxVisible.value;
      monthBoxVisible.value = false;
    }
    function toggleMonthBox() {
      monthBoxVisible.value = !monthBoxVisible.value;
      yearBoxVisible.value = false;
    }
    function selectYear(year) {
      selectedYear.value = year;
      yearBoxVisible.value = false;
    }

    function selectMonth(month) {
      selectedMonth.value = month;
      monthBoxVisible.value = false;
    }

    function changeUseActive() {
      useActive.value = true;
      detectActive.value = false;
    }

    function changeDetectActive() {
      useActive.value = false;
      detectActive.value = true;
    }

    function selectDate(item) {
      if (item.StartTime === selectedDate.value) {
        selectedDate.value = null;
      } else {
        selectedDate.value = item.StartTime;
      }
    }

    const goPre = () => {
      // router.push(`/usageHistoryInfo/${productName}`);
      window.history.back();
    };

    if (startBtnActive.value) {
      goNextText.value = "返回產品頁面";
    } else {
      goNextText.value = "HRV檢測";
    }

    watch(
      () => startBtnActive.value,
      (newValue) => {
        if (newValue) {
          goNextText.value = "返回產品頁面";
        } else {
          goNextText.value = "HRV检测";
        }
      },
      { immediate: true }
    );

    const goNext = () => {
      if (!startBtnActive.value || redirectToHRV.value) {
        router.push("/vital/scan.html"); 
      } else {
        router.push("/usageHistory"); 
      }
    };

    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

    if (!MID || !Token || !MAID || !Mobile) {
      router.push("/");
      return;
    }

    const getStart = async () => {
      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_UseStart_Data.jsp",
          { MID, Token, MAID, Mobile }
        );

        if (response.status === 200) {
          const records = response.data?.UseRecord || [];
          const hrvRecords = response.data?.HRV2Record || []; // 提取 HRV2Record

          useData.value = records.filter(
            (record) => record.ProductName === productName
          );
          detectData.value = hrvRecords; // 賦值給 detectData

          console.log("getStart - useData:", useData.value);
          console.log("getStart - detectData:", detectData.value);
        } else {
          console.error(
            "Unexpected response status in getStart:",
            response.status
          );
        }
      } catch (error) {
        console.error("API request failed in getStart:", error);
      }
    };

    const parseEndTime = (endTimeStr) => {
      if (!endTimeStr) return null;
      // 替换 `/` 为 `-`，确保兼容性
      const isoString = endTimeStr.replace(/\//g, "-").replace(" ", "T");
      return new Date(isoString);
    };

    const calculateResetTime = (now) => {
      const resetTime = new Date(now);
      resetTime.setHours(5, 0, 0, 0); // 设置为今天凌晨 5 点
      if (now < resetTime) {
        resetTime.setDate(resetTime.getDate() - 1); // 如果当前时间小于 5 点，取前一天的 5 点
      }
      return resetTime;
    };

    const checkResetTime = () => {
      const now = new Date();
      const resetTime = new Date();
      resetTime.setHours(5, 0, 0, 0);

      // 如果当前时间已经过了当天的重置时间，则设置为下一天凌晨 5 点
      if (now >= resetTime) {
        resetTime.setDate(resetTime.getDate() + 1);
      }

      const lastEndTime = useData.value?.[0]?.EndTime; // 假设取第一个记录
      if (lastEndTime) {
        const lastEndDate = new Date(lastEndTime);
        startBtnActive.value = lastEndDate < resetTime;
        showMessage.value = !(lastEndDate < resetTime);
      } else {
        startBtnActive.value = true;
        showMessage.value = false;
      }
    };

    // 定時每分鐘檢查一次
    const scheduleNextCheck = () => {
      const now = new Date();
      const nextReset = new Date();
      nextReset.setHours(5, 0, 0, 0);
      if (now >= nextReset) {
        nextReset.setDate(nextReset.getDate() + 1);
      }

      const delay = nextReset - now; // 下次检查的延迟时间
      setTimeout(() => {
        checkResetTime();
        scheduleNextCheck();
      }, delay);
    };

    // 在組件加載時初始化檢查
    checkResetTime();

    const getHRV2 = async () => {
      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_HRV2UseAf_Compare.jsp",
          { MID, Token, MAID, Mobile }
        );
        console.log("API Response:", response.data); // 打印完整回應

        if (response.status === 200) {
          detectData.value = response.data?.HRV2Record || [];
          console.log("Updated detectData:", detectData.value);
        } else {
          console.error("Unexpected response status:", response.status);
        }
      } catch (error) {
        console.error("API request failed:", error);
      }
    };

    const init = async () => {
      try {
        loading.value = true; // 開始加載
        await getStart(); // 初始化使用記錄和檢測記錄
      } catch (error) {
        console.error("Initialization failed:", error); // 捕捉錯誤
      } finally {
        loading.value = false; // 結束加載
      }
    };

    onMounted(() => {
      useActive.value = true;
      detectActive.value = false;
      init(); // 直接調用初始化函數
    });

    const filteredHRVData = computed(() => {
      return detectData.value.filter((item) => {
        const itemDate = new Date(item.CheckTime);
        return (
          itemDate.getFullYear() === selectedYear.value &&
          itemDate.getMonth() + 1 === selectedMonth.value
        );
      });
    });

    const filteredUsage = computed(() => {
      if (!Array.isArray(useData.value)) return []; // 保護機制
      return useData.value.filter((item) => {
        const itemDate = new Date(item.StartTime);
        return (
          itemDate.getFullYear() === selectedYear.value &&
          itemDate.getMonth() + 1 === selectedMonth.value
        );
      });
    });

    init();

    return {
      selectedYear,
      selectedMonth,
      yearBoxVisible,
      monthBoxVisible,
      months,
      displayYears,
      toggleYearBox,
      toggleMonthBox,
      selectYear,
      selectMonth,
      useActive,
      detectActive,
      changeUseActive,
      changeDetectActive,
      goPre,
      goNext,
      getStart,
      usageCardState,
      useData,
      formatTimestamp3,
      selectedDate,
      selectDate,
      productName,
      loading,
      startBtnActive,
      showMessage,
      detectData,
      filteredHRVData,
      filteredUsage,
      goNextText,
      handleCountdownComplete
    };
  },
};
</script>

<style lang="scss">
.usageWrap {
  background-color: rgba(246, 246, 246, 1);
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
  padding: 0 1rem;
  position: relative;
  padding-bottom: 6rem;

  .usageInfoGroup {
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    width: max-content;
    width: 100%;
    margin-top: 0.75rem;

    .usageInfoCard {
      background-color: #fff;
      padding: 12px;
      border-radius: 12px;
      flex-shrink: 0;
      max-width: 324px;
      color: #666;
      font-size: 18px;
      font-weight: 400;
      letter-spacing: 0.09px;
      min-height: 140px;
      &:nth-child(1) {
        border-left: 2px solid #74bc1f;
      }
      &:nth-child(2) {
        border-left: 2px solid #1fbcb3;
      }
      &:nth-child(3) {
        border-left: 2px solid #65558f;
      }
      h3 {
        margin-bottom: 0.75rem;
      }
      h4 {
        margin-top: 0.5rem;
      }
      .greenLight {
        color: $raphael-green-400;
      }
      .redLight {
        color: $raphael-red-300;
      }
      .orangeLight {
        color: $raphael-orange-400;
      }
      p {
        color: #666;
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
    background-color: #fff;
    margin-top: 0.75rem;
    border-radius: 0.75rem;
    padding: 0.75rem;
    .usageRecordTitleGroup {
      display: flex;
      justify-content: space-around;
      h3 {
        color: #ddd;
        font-size: 24px;
        letter-spacing: 0.5px;
        transition: 0.3s ease all;
      }
      .active {
        color: #1e1e1e;
      }
    }

    .useGroup {
      padding: 0 1.25rem;
      position: relative;
      min-height: 30vh;
      .notDetectData {
        position: absolute;
        z-index: 1;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        letter-spacing: 10px;
        font-size: 1.25rem;
        white-space: nowrap;
        color: #999;
      }
      .useList {
        opacity: 0;
        animation: fadeIn2 1s ease forwards;
        animation-delay: 0s;
        margin-bottom: 1.25rem;
        .dateList {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;

          .timeGroup {
            display: flex;
            align-items: center;
            gap: 4px;
            padding-bottom: 1rem;
            .timeIcon {
              border-radius: 7px;
              padding: 6px;
              border: 1px solid var(--brand-green-400, #74bc1f);
            }
            .time {
              font-size: 20px;
              font-style: normal;
              font-weight: 400;
              letter-spacing: 0.15px;
            }
          }
        }
        @for $i from 1 through 10 {
          &:nth-child(#{$i}) {
            animation-delay: $i * 0.07s;
          }
        }
      }
      .actionGroup {
        .startGroup,
        .pauseGroup,
        .stopGroup {
          opacity: 0;
          animation: fadeIn2 0.5s ease forwards;
          display: flex;
          border-radius: 12px;
          background: var(--shade-white, #fff);
          box-shadow: 0px -2px 3px 0px rgba(0, 0, 0, 0.25) inset;
          padding: 6px 12px;
          gap: 8px;
          line-height: 1.3;
          margin-bottom: 0.5rem;
          .actionContent {
            color: #666;
            font-size: 18px;
            font-weight: 400;
            letter-spacing: 0.09px;
            h4 {
              font-size: 20px;
            }
          }
        }
        .pauseGroup {
          span {
            color: #ccc;
            text-align: center;
            font-size: 14px;
            letter-spacing: 0.1px;
          }
        }
      }
    }

    .detectGroup {
      overflow-y: auto;
      height: calc(100% - 54px);
      position: relative;
      padding: 0 1.25rem;
      .detectItem {
        width: 100%;
        margin: 0 auto;
        opacity: 0;
        transition: 0.24s ease all;
        animation: fadeIn2 1s ease forwards;
        animation-delay: 0s;
        .timeTextGroup {
          display: flex;
          flex-direction: column;
          line-height: 1.35;
          .timeInfoText {
            color: #666;
            font-size: 16px;
            letter-spacing: 0.5px;
          }
        }
        @for $i from 1 through 10 {
          &:nth-child(#{$i}) {
            animation-delay: $i * 0.07s;
          }
        }
        a {
          text-decoration: none;
          color: #1e1e1e;
          display: flex;
          justify-content: space-between;
          .timeGroup {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 1.25rem 0;
            .timeIcon {
              border-radius: 7px;
              padding: 6px;
              border: 1px solid var(--brand-green-400, #74bc1f);
            }
            .time {
              font-size: 20px;
              font-style: normal;
              font-weight: 400;
              letter-spacing: 0.15px;
            }
          }
          .infoGroup {
            display: flex;
            align-items: center;
            white-space: nowrap;
            justify-content: end;
            gap: 0.5rem;
            h4 {
              color: #666;
              font-size: 1rem;
              font-style: normal;
              font-weight: 400;
              letter-spacing: 0.5px;
            }

            .detectAgeGroup {
              color: #666;
            }
            .detectHRVGroup {
              color: #666;
            }
            h5 {
              color: #b3b3b3;
              font-size: 1rem;
              font-style: normal;
              font-weight: 400;
              letter-spacing: 0.5px;
              margin-top: 0.25rem;
              span {
                color: #1e1e1e;
                font-size: 1.5rem;
                font-style: normal;
                font-weight: 700;
                letter-spacing: 0.12px;
                margin-right: 0.25rem;
              }
            }
            .redValue {
              color: #ec4f4f;
            }
            svg {
              width: 18px;
            }
          }
          &:hover {
            background-color: #f4f4f4;
          }
        }
      }
    }

    .detectSelectGroup {
      display: flex;
      align-items: center;
      justify-content: end;
      padding: 0.75rem 0;
      color: #666;
      margin-top: 0.25rem;
    }

    .yearSelectGroup {
      display: flex;
      align-items: center;
      gap: 2px;
      margin-right: 0.75rem;
      position: relative;
      .yearBox {
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
        .month {
          margin-bottom: 1rem;
        }
      }
    }
    .monthSelectGroup {
      display: flex;
      align-items: center;
      gap: 2px;
      margin-right: 0.75rem;
      position: relative;

      .monthBox {
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
        opacity: 0;
        animation: 0.3s fadeIn forwards;
        z-index: 10;
        .month {
          margin-bottom: 1rem;
        }
      }
    }
  }
  .usageBtnGroup {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #f6f6f6;
    z-index: 99;
    display: flex;
    justify-content: center;
    padding: 1rem 1rem 2.25rem 1rem;
    gap: 16px;
    button {
      width: 50%;
      background-color: $raphael-green-400;
      color: #fff;
      border: none;
      padding: 8px;
      border-radius: 8px;
      color: #fff;
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.09px;
    }
    .preBtn {
      background-color: #eee;
      color: #666;
    }
    .nextBtn {
      background-color: $raphael-green-400;
    }
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
</style>
