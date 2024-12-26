<template>
  <RaphaelLoading v-if="loading" />
  <HRVAlert :showCloseButton="false" />
  <DSPRSelect :showCloseButton="false" />
  <div class="usageWrap">
    <TitleMenu Text="使用紀錄" :link="`/UsageHistory`" />
    <TimeRing2
      v-if="productName === '神經調節衣'"
      :productName="productName"
      :hasDetectRecord="hasDetectRecord"
      :todayUseRecord="todayUseRecord"
    />

    <!-- <TimeRing
      v-if="productName === '神經調節衣'"
      :totalTime="21600"
      :product-name="productName"
      :hasDetectRecord="hasDetectRecord"
      :todayUseRecord="todayUseRecord"
      :hasBeforeData="hasBeforeData"
      @countdownComplete="handleCountdownComplete"
      @requireHRVCheck="handleHRVCheck"
    /> -->
    <TimeRing
      v-if="productName === '雙效紅光調節衣' || productName === '居家治療儀'"
      :totalTime="5400"
      :product-name="productName"
      :hasDetectRecord="hasDetectRecord"
      @countdownComplete="handleCountdownComplete"
      @requireHRVCheck="handleHRVCheck"
    />

    <TimeRing
      v-if="productName === '三效深眠衣'"
      :totalTime="7200"
      :product-name="productName"
      :hasDetectRecord="hasDetectRecord"
      @countdownComplete="handleCountdownComplete"
      @requireHRVCheck="handleHRVCheck"
    />

    <!-- <TimeRing
      v-if="productName !== '神經調節衣'"
      :totalTime="120"
      :product-name="productName"
      :hasDetectRecord="hasDetectRecord"
      @countdownComplete="handleCountdownComplete"
      @requireHRVCheck="handleHRVCheck"
    /> -->

    <div class="usageInfoGroup" v-if="usageCardState === '雙效紅光調節衣'">
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

    <div class="usageInfoGroup" v-if="usageCardState === '神經調節衣'">
      <div class="usageInfoCard">
        <h3>量身訂製</h3>
        <p>依照您的健康狀況製作客製化調節貼片位置。</p>
      </div>
      <div class="usageInfoCard">
        <h3>持續調節</h3>
        <p>將第四代穿戴調節衣取代睡衣，每日穿著，持續調節自律神經生理機能。</p>
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

    <div class="usageInfoGroup" v-if="usageCardState === '三效深眠衣'">
      <div class="usageInfoCard">
        <h3>非侵入性治療</h3>
        <p>
          這款三效深眠衣使用的是物理性治療，不涉及任何藥物，適合那些想要避免藥物副作用的患者。它依賴於專利技術的貼片，通過波頻影響神經系統​
        </p>
      </div>
      <div class="usageInfoCard">
        <h3>針對自律神經問題設計</h3>
        <p>
          三效深眠衣專為改善自律神經失調而設計，適用於失眠、焦慮、情緒不穩定等問題，也能幫助增強免疫系統
        </p>
      </div>
      <div class="usageInfoCard">
        <h3>適合居家使用</h3>
        <p>
          三效深眠衣是一款設計簡單、方便的保健產品，適合在家中進行日常使用，無需到診所即可完成自律神經的調節
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
                data-v-8f83a543=""
                d="M5.99159 3.37719L11.4726 8.99994L5.99159 14.6227C5.89346 14.7232 5.83853 14.858 5.83853 14.9984C5.83853 15.1389 5.89346 15.2737 5.99159 15.3742C6.03925 15.4228 6.09613 15.4615 6.15891 15.4879C6.2217 15.5142 6.28911 15.5278 6.35721 15.5278C6.42531 15.5278 6.49273 15.5142 6.55551 15.4879C6.61829 15.4615 6.67518 15.4228 6.72284 15.3742L12.5548 9.39257C12.6572 9.28752 12.7145 9.14664 12.7145 8.99994C12.7145 8.85325 12.6572 8.71236 12.5548 8.60732L6.72396 2.62569C6.67627 2.57671 6.61924 2.53777 6.55625 2.51119C6.49326 2.4846 6.42558 2.4709 6.35721 2.4709C6.28884 2.4709 6.22116 2.4846 6.15817 2.51119C6.09518 2.53777 6.03816 2.57671 5.99046 2.62569C5.89234 2.72615 5.8374 2.86101 5.8374 3.00144C5.8374 3.14187 5.89234 3.27673 5.99046 3.37719L5.99159 3.37719Z"
                fill="#666666"
              ></path>
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
            <div class="pauseGroup" v-if="item.Pause && item.Pause.length > 0">
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
          <a
            :href="
              item.BcAf === '治療前'
                ? 'javascript:void(0)'
                : `/usageHRVResult/${item.UID}`
            "
          >
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
                :style="{ opacity: item.BcAf !== '治療前' ? 1 : 0 }"
              >
                <path
                  d="M5.99159 3.37719L11.4726 8.99994L5.99159 14.6227C5.89346 14.7232 5.83853 14.858 5.83853 14.9984C5.83853 15.1389 5.89346 15.2737 5.99159 15.3742C6.03925 15.4228 6.09613 15.4615 6.15891 15.4879C6.2217 15.5142 6.28911 15.5278 6.35721 15.5278C6.42531 15.5278 6.49273 15.5142 6.55551 15.4879C6.61829 15.4615 6.67518 15.4228 6.72284 15.3742L12.5548 9.39257C12.6572 9.28752 12.7145 9.14664 12.7145 8.99994C12.7145 8.85325 12.6572 8.71236 12.5548 8.60732L6.72396 2.62569C6.67627 2.57671 6.61924 2.53777 6.55625 2.51119C6.49326 2.4846 6.42558 2.4709 6.35721 2.4709C6.28884 2.4709 6.22116 2.4846 6.15817 2.51119C6.09518 2.53777 6.03816 2.57671 5.99046 2.62569C5.89234 2.72615 5.8374 2.86101 5.8374 3.00144C5.8374 3.14187 5.89234 3.27673 5.99046 3.37719L5.99159 3.37719Z"
                  fill="$raphael-gray-500666"
                />
                :style="{ opacity: item.BcAf !== '治療前' ? 1 : 0}">
                <path
                  data-v-8f83a543=""
                  d="M5.99159 3.37719L11.4726 8.99994L5.99159 14.6227C5.89346 14.7232 5.83853 14.858 5.83853 14.9984C5.83853 15.1389 5.89346 15.2737 5.99159 15.3742C6.03925 15.4228 6.09613 15.4615 6.15891 15.4879C6.2217 15.5142 6.28911 15.5278 6.35721 15.5278C6.42531 15.5278 6.49273 15.5142 6.55551 15.4879C6.61829 15.4615 6.67518 15.4228 6.72284 15.3742L12.5548 9.39257C12.6572 9.28752 12.7145 9.14664 12.7145 8.99994C12.7145 8.85325 12.6572 8.71236 12.5548 8.60732L6.72396 2.62569C6.67627 2.57671 6.61924 2.53777 6.55625 2.51119C6.49326 2.4846 6.42558 2.4709 6.35721 2.4709C6.28884 2.4709 6.22116 2.4846 6.15817 2.51119C6.09518 2.53777 6.03816 2.57671 5.99046 2.62569C5.89234 2.72615 5.8374 2.86101 5.8374 3.00144C5.8374 3.14187 5.89234 3.27673 5.99046 3.37719L5.99159 3.37719Z"
                  fill="#666666"
                ></path>
              </svg>
            </div>
          </a>
        </div>
      </div>
    </div>
    <!-- <div class="usageBtnGroup">
      <button class="preBtn" @click="goPre">返回產品頁面</button> 
      <button class="nextBtn" @click="goNext">{{ goNextText }}</button>
    </div> -->
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
import { useCommon } from "../stores/common";
export default {
  components: { RaphaelLoading, TitleMenu, TimeRing },
  components: {
    TitleMenu,
    TimeRing,
  },
  setup() {
    const route = useRouter().currentRoute.value;
    const productName = decodeURIComponent(route.params.clothType);

    const validName = ["三效深眠衣", "雙效紅光調節衣", "神經調節衣", "居家治療儀"];

    const redirectToHRV = ref(false);

    const store = useCommon();

    const handleCountdownComplete = () => {
      startBtnActive.value = true;
      goNextText.value = "返回產品頁面";
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
    const useData = ref([]);
    const detectData = ref([]);
    const loading = ref(false);

    const hasDetectRecord = ref(false);
    const hasBeforeData = ref(false);

    const startBtnActive = ref(false);
    const showMessage = ref(false);

    const usageCardState = ref("");
    if (productName) usageCardState.value = productName;

    const useActive = ref(true);
    const detectActive = ref(false);

    const todayUseRecord = ref(null);

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

    // if (startBtnActive.value) {
    goNextText.value = "返回產品頁面";
    // } else {
    //   goNextText.value = "HRV檢測";
    // }

    watch(useData, () => {
      // 當 useData 改變時，重新計算 filteredUsage
      console.log("Data updated:", useData.value);
    });

    watch(
      () => startBtnActive.value,
      (newValue) => {
        goNextText.value = "返回產品頁面";

        //  else {
        //   goNextText.value = "HRV檢測";
        // }
      },
      { immediate: true }
    );
    console.log(useData[0]);

    // const goNext = () => {
    //   if (  redirectToHRV.value) {
    //     // 设置 detectFlag
    //     const uid = detectData.value.find(
    //       (record) => record.BcAf === "治療前"
    //     )?.UID;

    //     store.detectFlag = "2";
    //     if (uid) {
    //       // 更新 Pinia store 並顯示提示框
    //       store.detectFlag = "2";
    //       store.detectUID = uid;
    //       store.detectForm = productName;
    //       store.showHRVAlert = true; // 顯示提示框
    //       console.log("HRV 提示框已啟動，UID:", uid);
    //     } else {
    //       console.warn("未找到有效的 UID，請檢查檢測記錄");
    //     }
    //   } else {
    //     router.push("/usageHistory");
    //   }
    // };

    const goNext = () => {
      router.push("/usageHistory");
    };

    const handleHRVCheck = () => {
      store.showHRVAlert = true; // 顯示 HRVAlert
    };

    const handleHRVCompleted = () => {
      store.showHRVAlert = false; // 隱藏 HRVAlert
    };

    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

    if (!MID || !Token || !MAID || !Mobile) {
      router.push("/");
      return;
    }

    const getStart = async () => {
      try {
        loading.value = true;
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_UseStart_Data.jsp",
          {
            MID: MID,
            Token: Token,
            MAID: MAID,
            Mobile: Mobile,
          }
        );

        if (response.status === 200) {
          const records = response.data?.UseRecord || [];
          const hrvRecords = response.data?.HRV2Record || [];

          // 過濾出與產品名稱匹配的使用與檢測紀錄
          useData.value = Array.isArray(records)
            ? records.filter((record) => record.ProductName === productName)
            : [];

          detectData.value = Array.isArray(hrvRecords)
            ? hrvRecords.filter((record) => record.ProductName === productName)
            : [];

          // 計算當日重置時間（凌晨5點）
          const resetTime = calculateResetTime(new Date());

          // 過濾當日（5點為基準）的檢測紀錄
          const todayDetectRecords = Array.isArray(detectData.value)
            ? detectData.value.filter((record) => {
                const checkTime = record?.CheckTime
                  ? new Date(record.CheckTime.replace(/\//g, "-"))
                  : null;
                return checkTime && checkTime >= resetTime; // 檢查是否為當天紀錄
              })
            : [];

          // 判斷是否同時存在「治療前」和「治療後」的紀錄
          const hasBeforeRecord = todayDetectRecords.some(
            (record) => record?.BcAf === "治療前"
          );
          hasBeforeData.value = todayDetectRecords.filter(
            (record) => record?.BcAf === "治療前"
          );

          const hasAfterRecord = todayDetectRecords.some(
            (record) => record?.BcAf === "治療後"
          );

          // 更新 hasDetectRecord 值
          hasDetectRecord.value = hasBeforeRecord && hasAfterRecord;

          // 過濾當日的使用記錄（以凌晨5點為基準）
          todayUseRecord.value = useData.value.filter((record) => {
            const endTime = record?.EndTime
              ? new Date(record.EndTime.replace(/\//g, "-"))
              : null;
            return endTime && endTime >= resetTime; // 確保有值並且在重置時間後
          });

          console.log("當日檢測紀錄（治療前）:", hasBeforeRecord);
          console.log("當日檢測紀錄（治療後）:", hasAfterRecord);
          console.log("當日使用紀錄:", todayUseRecord.value);
        }
      } catch (error) {
        console.error("Error in getStart:", error);
      } finally {
        loading.value = false;
      }
    };

    // 計算當日重置時間（凌晨5點）
    const calculateResetTime = (now) => {
      const resetTime = new Date(now);
      resetTime.setHours(5, 0, 0, 0);
      if (now < resetTime) {
        resetTime.setDate(resetTime.getDate() - 1); // 如果當前時間在5點之前，重置時間設為前一天
      }
      return resetTime;
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
        // checkResetTime();
        scheduleNextCheck();
      }, delay);
    };

    // 在組件加載時初始化檢查
    // checkResetTime();

    const updateBeforeDetect = () => {
      // const resetTime = calculateResetTime(new Date());
      // const todayDetectRecords = detectData.value.filter((record) => {
      //   const checkTime = new Date(record.CheckTime.replace(/\//g, "-"));
      //   return checkTime >= resetTime;
      // });
      // hasBeforeDetect.value = todayDetectRecords.some(
      //   (record) => record.BcAf === "治療前"
      // );
    };

    const init = async () => {
      await getStart();
      // checkResetTime();
      updateBeforeDetect();
    };

    onMounted(() => {
      init(); // 執行初始化
    });

    const filteredHRVData = computed(() => {
      if (!Array.isArray(detectData.value)) return [];
      return detectData.value.filter((item) => {
        const itemDate = new Date(item.CheckTime);
        return (
          itemDate.getFullYear() === selectedYear.value &&
          itemDate.getMonth() + 1 === selectedMonth.value
        );
      });
    });

    const filteredUsage = computed(() => {
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
      handleCountdownComplete,
      handleHRVCheck,
      handleHRVCompleted,
      hasDetectRecord,

      todayUseRecord,
      hasBeforeData,
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
    width: max-content;
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

    .usageRecordTitleGroup {
      display: grid;
      grid-auto-flow: column;
      h3 {
        @include tabStyle();
      }
      .active {
        border-bottom: 1px solid $raphael-green-400;
        color: $raphael-green-400;
        &:hover {
          filter: brightness(0.95);
        }
      }
    }

    .useGroup {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      height: calc(100vh - 293px);
      overflow-y: auto;
      @include scrollbarStyle();
      @include respond-to("phone-landscape") {
        height: calc(100vh - 100px);
      }

      .notDetectData {
        position: absolute;
        z-index: 1;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        letter-spacing: 10px;
        font-size: 1.25rem;
        white-space: nowrap;
        color: $raphael-gray-500;
      }
      .useList {
        opacity: 0;
        animation: fadeIn2 1s ease forwards;
        animation-delay: 0s;
        .dateList {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;

          .timeGroup {
            display: flex;
            align-items: center;
            gap: 4px;
            .timeIcon {
              border-radius: 7px;
              padding: 6px;
              border: 1px solid var(--brand-green-400, $raphael-green-400);
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
        position: relative;
        display: grid;
        gap: 0.75rem;
        margin-top: 0.75rem;

        &::before {
          position: absolute;
          content: "";
          box-shadow: 0px -1px 2px 0px rgba(0, 0, 0, 0.25) inset;
          width: 8px;
          height: 100%;
          border-radius: 0.75rem;
          left: 0.5rem;
        }

        .startGroup,
        .pauseGroup,
        .stopGroup {
          position: relative;
          opacity: 0;
          animation: fadeIn2 0.5s ease forwards;
          display: flex;
          align-items: center;
          border-radius: 12px;
          background: $raphael-white;
          box-shadow: 0px -2px 3px 0px rgba(0, 0, 0, 0.25) inset;
          padding: 6px 12px;
          margin-left: 1.5rem;
          gap: 8px;
          line-height: 1.3;

          .actionContent {
            color: $raphael-gray-500;
            font-size: 18px;
            font-weight: 400;
            letter-spacing: 0.09px;
            h4 {
              font-size: 20px;
            }
          }

          &::before {
            position: absolute;
            content: "";
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 50%;
            left: -1rem;
          }
        }
        .startGroup {
          &::before {
            background: $raphael-green-400;
          }
        }
        .pauseGroup {
          &::before {
            background: $raphael-orange-400;
          }
          span {
            color: $raphael-gray-300;
            text-align: center;
            font-size: 14px;
            letter-spacing: 0.1px;
          }
        }
        .stopGroup {
          &::before {
            background: $raphael-red-300;
          }
        }
      }
    }

    .detectGroup {
      overflow-y: auto;
      height: calc(100vh - 293px);
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      @include scrollbarStyle();

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
        @for $i from 1 through 10 {
          &:nth-child(#{$i}) {
            animation-delay: $i * 0.07s;
          }
        }
        a {
          text-decoration: none;
          color: $raphael-black;
          display: flex;
          justify-content: space-between;
          .timeGroup {
            display: flex;
            align-items: center;
            gap: 4px;
            .timeIcon {
              border-radius: 7px;
              padding: 6px;
              border: 1px solid var(--brand-green-400, $raphael-green-400);
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
              color: $raphael-gray-500;
              font-size: 1rem;
              font-style: normal;
              font-weight: 400;
              letter-spacing: 0.5px;
            }

            .detectAgeGroup {
              display: none;
              color: $raphael-gray-500;
            }
            .detectHRVGroup {
              display: none;
              color: $raphael-gray-500;
              h5 {
                span {
                  display: inline-flex;
                  min-width: 50px;
                }
              }
            }
            h5 {
              color: $raphael-gray-400;
              font-size: 1rem;
              font-style: normal;
              font-weight: 400;
              letter-spacing: 0.5px;
              margin-top: 0.25rem;
              span {
                color: $raphael-black;
                font-size: 1.5rem;
                font-style: normal;
                font-weight: 700;
                letter-spacing: 0.12px;
                margin-right: 0.25rem;
              }
            }
            .redValue {
              color: $raphael-red-500;
            }
            svg {
              width: 18px;
            }
          }
        }
      }
    }

    .detectSelectGroup {
      display: flex;
      align-items: center;
      justify-content: end;
      gap: 0.75rem;
      padding: 0.75rem 0;
      color: $raphael-gray-500;
      margin-top: 0.25rem;
    }

    .yearSelectGroup {
      display: flex;
      align-items: center;
      gap: 2px;
      position: relative;
      cursor: pointer;
      .yearBox {
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
        .year {
          transform: 0.25s all ease;
          &:hover {
            color: $raphael-green-400;
          }
        }
      }
    }
    .monthSelectGroup {
      display: flex;
      align-items: center;
      gap: 2px;
      position: relative;
      cursor: pointer;

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
        opacity: 0;
        animation: 0.3s fadeIn forwards;
        z-index: 10;
        .month {
          transform: 0.25s all ease;
          &:hover {
            color: $raphael-green-400;
          }
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
    display: grid;
    padding: 1rem 1rem 3.125rem 1rem;
    gap: 16px;
    button {
      background-color: $raphael-green-400;
      color: $raphael-white;
      border: none;
      padding: 8px;
      border-radius: 8px;
      color: $raphael-white;
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.09px;
    }
    .preBtn {
      background-color: $raphael-gray-200;
      color: $raphael-gray-500;
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
