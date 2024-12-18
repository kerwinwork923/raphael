<template>
  <div class="progress-container">
    <!-- 動態進度圓圈 -->
    <div class="progress-border" :style="{ background: progressGradient }">
      <div class="content">{{ formattedTime }}</div>
    </div>

    <div class="timerButtonGroup">
      <!-- 主按鈕 (HRV檢測、暫停、繼續) -->
      <button :style="buttonStyle" @click="toggleTimer">
        {{ buttonText }}
      </button>
      <!-- 結束按鈕 -->
      <button
        v-if="isCounting || isPaused"
        :style="endButtonStyle"
        @click="stopTimer"
      >
        結束
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const props = defineProps({
  productName: {
    type: String,
  },
  hasDetectRecord: {
    type: Boolean,
  },
  todayUseRecord: {
    type: Array,
    default: () => [],
  },
});

const router = useRouter();

const elapsedTime = ref(0); // 計時的時間（秒）
const isCounting = ref(false); // 是否正在計時
const isPaused = ref(false); // 是否暫停
const startTimestamp = ref(null);

// 計算按鈕文字
const buttonText = computed(() => {
  if (isCounting.value) return "暫停";
  if (isPaused.value) return "繼續";
  if (store.detectFlag === "1") return "HRV檢測(使用前)";
  if (store.detectFlag === "2") return "HRV檢測(使用後)";
  return "HRV檢測(使用前)";
});

const isButtonEnabled = ref(true);
const UID = ref(null);
const BID = ref(null);

const hasBeforeData = ref(false);

import { useCommon } from "../stores/common";
const store = useCommon();

const showButton = computed(() => {
  return !props.hasDetectRecord; // 如果未檢測記錄則顯示按鈕
});

const endButtonStyle = computed(() => {
  return isButtonEnabled.value
    ? { backgroundColor: "#1FBCB3", color: "#fff" } // 藍綠色 (結束)
    : { backgroundColor: "#E0E0E0", color: "#000", cursor: "not-allowed" }; // 灰色 (已結束)
});

const formattedTime = computed(() => {
  const hours = Math.floor(elapsedTime.value / 3600);
  const minutes = Math.floor((elapsedTime.value % 3600) / 60);
  const seconds = elapsedTime.value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
});

// 驗證 LocalStorage 資料
const localData = localStorage.getItem("userData");
const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

if (!MID || !Token || !MAID || !Mobile) {
  router.push("/");
}

const timerInterval = ref(null);

const startTimer = () => {
  if (timerInterval.value) clearInterval(timerInterval.value);
  isCounting.value = true;
  isPaused.value = false;
  timerInterval.value = setInterval(() => {
    elapsedTime.value++;
  }, 1000);
};

const pauseTimer = () => {
  isPaused.value = true;
  isCounting.value = false;
  clearInterval(timerInterval.value);
  buttonText.value = "繼續";
};

const resumeTimer = () => {
  isPaused.value = false;
  isCounting.value = true;
  buttonText.value = "暫停";

  timerInterval.value = setInterval(() => {
    elapsedTime.value++;
  }, 1000);
};

const stopTimer = async () => {
  clearInterval(timerInterval.value);
  isCounting.value = false;
  isPaused.value = false;
  isButtonEnabled.value = false; // 禁用按鈕

  try {
    console.log("停止計時器...");
    await useEndAPI(); // 調用結束 API
  } catch (error) {
    console.error("停止計時器失敗：", error);
  }

  elapsedTime.value = 0; // 重置計時器
  console.log("計時已結束，狀態設置為完成");

  // 更新狀態，防止重新計時
  store.detectFlag = null; // 清空檢測標記，防止按鈕重新啟動
};

const apiRequest = async (url, payload) => {
  try {
    const response = await axios.post(url, payload);
    console.log(`API ${url} 回應:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`API ${url} 請求失敗:`, error);
    throw error;
  }
};

const toggleTimer = async () => {
  if (!isCounting.value && !isPaused.value) {
    // 開始檢測（使用前或使用後）
    if (Array.isArray(props.todayUseRecord) && props.todayUseRecord.length > 0) {
      // 使用後檢測
      console.log("開始 HRV 檢測 (使用後)");
      store.detectFlag = "2";
      store.detectUID = props.todayUseRecord[0].UID;
      store.detectForm = `*${props.productName}`;
      store.showHRVAlert = true; // 顯示提醒框
    } else {
      // 使用前檢測
      console.log("開始 HRV 檢測 (使用前)");
      const response = await useStartAPI();
      if (response?.UID) {
        UID.value = response.UID;
        store.detectFlag = "1";
        store.detectUID = UID.value;
        store.detectForm = props.productName;
        store.showHRVAlert = true; // 顯示提醒框
      }
    }
    startTimer(); // 開始計時
  } else if (isCounting.value) {
    // 暫停計時
    console.log("暫停 HRV 檢測");
    await usePauseAPI();
    pauseTimer();
  } else if (isPaused.value) {
    // 恢復計時
    console.log("恢復 HRV 檢測");
    await usePauseEndAPI();
    resumeTimer();
  }
};


const progressPercentage = computed(() => {
  const baseTime = 8 * 60 * 60; // 8 小時 = 28800 秒
  return Math.min((elapsedTime.value / baseTime) * 100, 100);
});

const progressGradient = computed(() => {
  const percentage = progressPercentage.value;
  return `conic-gradient(#1FBCB3 ${percentage}%, #E0E0E0 ${percentage}%)`;
});

const API_MID_ProductName_UIDInfo = async () => {
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_MID_ProductName_UIDInfo.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );

    if (response?.Result === "OK") {
      console.log("成功獲取 UID 信息：", response);
      return response;
    } else {
      console.error("無法獲取有效的 UID 信息：", response);
      return null;
    }
  } catch (error) {
    console.error("API 調用失敗：", error);
    return null;
  }
};

const API_HRV2_UID_Flag_Info = async (Flag) => {
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_HRV2_UID_Flag_Info.jsp",
      { MID, Token, MAID, Mobile, UID: UID.value, Flag }
    );
    if (response?.Result === "OK") {
      console.log(`成功獲取 Flag=${Flag} 的 HRV 檢測資料狀態:`, response);
      return response.IsExit; // 返回 "Y" 或 "N"
    } else {
      console.error(`無法獲取 Flag=${Flag} 的 HRV 檢測資料狀態:`, response);
      return null;
    }
  } catch (error) {
    console.error(`API HRV2_UID_Flag_Info 調用失敗，Flag=${Flag}：`, error);
    return null;
  }
};

const checkForAfterDetection = async () => {
  if (props.hasDetectRecord === false && store.detectFlag === "1") {
    const hasAfterData = await API_HRV2_UID_Flag_Info("2");
    if (hasAfterData === "N") {
      const now = Date.now();
      const elapsedSinceStart = now - startTimestamp.value; // 開始時間戳
      if (elapsedSinceStart > 24 * 60 * 60 * 1000) {
        alert("請完成HRV檢測(使用後)！");
      }
    }
  }
};

onMounted(async () => {
  console.log("初始化組件，檢查使用前和使用後的檢測狀態並啟動必要的檢測");

  try {
    const response = await API_MID_ProductName_UIDInfo();

    // 如果有 UID 表示有未完成的檢測
    if (response?.Result === "OK" && response?.UID) {
      UID.value = response.UID; // 保存 UID

      // 檢查治療前資料狀態
      const hasBefore = await API_HRV2_UID_Flag_Info("1"); // 檢查使用前檢測
      if (hasBefore === "Y") {
        console.log("使用前檢測已完成，準備進行使用後檢測");
        store.detectFlag = "2"; // 設為使用後檢測狀態

        // 檢查使用後檢測
        const hasAfter = await API_HRV2_UID_Flag_Info("2");
        if (hasAfter === "N") {
          console.log("使用後檢測未完成，立即啟動計時");

          const startTime = new Date(
            `${response.StartTime.slice(0, 4)}-${response.StartTime.slice(
              4,
              6
            )}-${response.StartTime.slice(6, 8)}T${response.StartTime.slice(
              8,
              10
            )}:${response.StartTime.slice(10, 12)}:${response.StartTime.slice(
              12
            )}`).getTime();

          const now = Date.now();
          const elapsedTimeInMs = now - startTime;

          if (elapsedTimeInMs > 24 * 60 * 60 * 1000) {
            alert("請完成HRV檢測(使用後)！");
          } else {
            elapsedTime.value = Math.floor(elapsedTimeInMs / 1000); // 恢復計時
            console.log("恢復未完成的計時");
            startTimer(); // 啟動計時器
          }
        } else {
          console.log("使用後檢測已完成，無需操作");
        }
      } else {
        console.log("使用前檢測未完成，立即開始使用前檢測");
        store.detectFlag = "1"; // 設為使用前檢測狀態
        await startBeforeDetection(); // 直接啟動使用前檢測
      }
    } else {
      // 如果沒有檢測記錄但 `hasDetectRecord` 為 false，初始化使用前檢測
      if (!props.hasDetectRecord) {
        console.log("無檢測記錄，直接啟動使用前檢測");
        store.detectFlag = "1"; // 設置為使用前檢測狀態
        await startBeforeDetection(); // 直接啟動使用前檢測
      } else {
        console.log("未檢測到有效的 UID，初始化為未開始狀態");
      }
    }
  } catch (error) {
    console.error("初始化時發生錯誤：", error);
  }
});



const useStartAPI = async () => {
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_UseStart.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );
    if (response?.UID) {
      UID.value = response.UID; // 保存 UID
      console.log("開始 API 調用成功，UID:", UID.value);
    } else {
      console.error("開始 API 未返回有效的 UID");
    }
    return response;
  } catch (error) {
    console.error("開始 API 調用失敗:", error);
    return null;
  }
};

const usePauseAPI = async () => {
  if (!UID.value) {
    console.error("無法暫停，因為 UID 不存在");
    return;
  }
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_UsePauseStart.jsp",
      { MID, Token, MAID, Mobile, UID: UID.value }
    );
    if (response?.BID) {
      BID.value = response.BID; // 保存 BID
      console.log("暫停 API 調用成功，BID:", BID.value);
    } else {
      console.error("暫停 API 未返回有效的 BID");
    }
  } catch (error) {
    console.error("暫停 API 調用失敗:", error);
  }
};

const usePauseEndAPI = async () => {
  if (!UID.value || !BID.value) {
    console.error("無法恢復，因為 UID 或 BID 不存在");
    return;
  }
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_UsePauseEnd.jsp",
      { MID, Token, MAID, Mobile, UID: UID.value, BID: BID.value }
    );
    console.log("恢復 API 調用成功", response);
  } catch (error) {
    console.error("恢復 API 調用失敗:", error);
  }
};

const useEndAPI = async () => {
  if (!UID.value) {
    console.error("無法結束，因為 UID 不存在");
    return;
  }
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_UseEnd.jsp",
      { MID, Token, MAID, Mobile, UID: UID.value }
    );
    console.log("結束 API 調用成功", response);
  } catch (error) {
    console.error("結束 API 調用失敗:", error);
  }
};

onMounted(() => {
  BID.value = null; // 初始化為 null
  console.log("組件初始化完成，BID 初始化為 null");
});

const buttonStyle = computed(() => {
  if (buttonText.value === "HRV檢測(使用前)") {
    return { backgroundColor: "#74BC1F", color: "#fff" }; // 綠色
  } else if (buttonText.value === "暫停") {
    return { backgroundColor: "#EC4F4F", color: "#fff" }; // 紅色
  } else if (buttonText.value === "繼續") {
    return { backgroundColor: "#74BC1F", color: "#fff" }; // 綠色
  } else if (buttonText.value === "HRV檢測(使用後)") {
    return { backgroundColor: "#E0E0E0", color: "#000" }; // 灰色
  }
  return {}; // 默認空樣式
});
</script>

<style scoped>
.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background-color: rgb(246, 246, 246);
}

.progress-border {
  width: 210px;
  height: 210px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.2) inset;
  background: conic-gradient(#1fbcb3 0%, #e0e0e0 0%); /* 預設背景 */
  transition: background 0.3s ease; /* 平滑過渡效果 */
}

.content {
  width: 190px;
  height: 190px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  letter-spacing: 0.09px;
  transition: background-color 0.3s ease;
  box-shadow: 0px -2px 3px 0px rgba(0, 0, 0, 0.25) inset;
}

button:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}

.completion-message {
  color: #74bc1f;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  letter-spacing: 0.09px;
}

.completion-delayMessage {
  color: var(--warning-red-300, #ec4f4f);
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  letter-spacing: 0.5px;
}

.timerButtonGroup {
  display: flex;
  gap: 8px;
}
</style>
