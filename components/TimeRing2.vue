<template>
  <div class="progress-container">
    <!-- 動態進度圓圈 -->
    <div class="progress-border" :style="{ background: progressGradient }">
      <div class="content">{{ formattedTime }}</div>
    </div>

    <div class="timerButtonGroup">
      <!-- 主按鈕 (HRV檢測、暫停、繼續) -->
      <button
        v-if="isCounting || !isCounting"
        :style="buttonStyle"
        @click="toggleTimer"
      >
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
});

const router = useRouter();

const elapsedTime = ref(0); // 計時的時間（秒）
const isCounting = ref(false); // 是否正在計時
const isPaused = ref(false); // 是否暫停
const buttonText = computed(() => {
  if (store.detectFlag === "1") {
    return isPaused.value ? "繼續" : "暫停";
  } else if (store.detectFlag === "2") {
    return "HRV檢測(使用後)";
  }
  return "HRV檢測(使用前)";
});

const isButtonEnabled = ref(true);
const UID = ref(null);
const BID = ref(null);

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
  if (timerInterval.value) clearInterval(timerInterval.value); // 清除已有計時器

  isCounting.value = true;
  isPaused.value = false;
  buttonText.value = "暫停";

  timerInterval.value = setInterval(() => {
    elapsedTime.value++;
  }, 1000);

  console.log("計時開始，已過時間：", elapsedTime.value, "秒");
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
  clearInterval(timerInterval.value); // 停止計時
  isCounting.value = false;
  isPaused.value = false;
  isButtonEnabled.value = false; // 禁用按鈕

  try {
    await useEndAPI(); // 調用結束 API
    console.log("計時已結束，API 調用成功");
  } catch (error) {
    console.error("結束 API 調用失敗：", error);
  }

  elapsedTime.value = 0; // 重置時間
  buttonText.value = "HRV檢測(使用後)"; // 更新按鈕文字
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
  if (buttonText.value === "HRV檢測(使用前)") {
    console.log("開始 HRV 檢測");
    await useStartAPI(); // 調用開始 API
    store.detectFlag = "1";
    store.detectUID = UID.value;
    store.detectForm = props.productName;
    store.showHRVAlert = true;
    startTimer();
  } else if (buttonText.value === "暫停") {
    console.log("暫停計時");
    await usePauseAPI(); // 調用暫停 API
    pauseTimer();
  } else if (buttonText.value === "繼續") {
    console.log("恢復計時");
    await usePauseEndAPI(); // 調用恢復 API
    resumeTimer();
  } else if (buttonText.value === "HRV檢測(使用後)") {
    console.log("結束 HRV 檢測");
    stopTimer();
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

const API_HRV2_UID_Flag_Info = async () => {
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_HRV2_UID_Flag_Info.jsp",
      { MID, Token, MAID, Mobile, UID: UID.value, Flag: store.detectFlag }
    );
    if (response?.Result === "OK") {
      console.log("成功獲取 HRV2 檢測資料狀態：", response);
      return response.IsExit; // 返回 "Y" 或 "N"
    } else {
      console.error("無法獲取 HRV2 資料狀態：", response);
      return null;
    }
  } catch (error) {
    console.error("API 調用失敗：", error);
    return null;
  }
};

onMounted(async () => {
  console.log("初始化組件，檢查使用前和使用後的檢測狀態");

  try {
    // 獲取 UID 狀態
    const response = await API_MID_ProductName_UIDInfo();

    if (response?.Result === "OK" && response?.UID) {
      UID.value = response.UID; // 保存 UID
      console.log("檢測到未完成的計時，準備接續計時");

      // 計算已過時間
      const startTime = new Date(
        `${response.StartTime.slice(0, 4)}-${response.StartTime.slice(
          4,
          6
        )}-${response.StartTime.slice(6, 8)}T${response.StartTime.slice(
          8,
          10
        )}:${response.StartTime.slice(10, 12)}:${response.StartTime.slice(12)}`
      ).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);

      elapsedTime.value = elapsedSeconds; // 更新已過時間
      startTimer(); // 繼續計時

      console.log("檢查 HRV2 資料狀態");

      // 同時檢查 HRV2 使用前和使用後資料
      const isExitBefore = await API_HRV2_UID_Flag_Info("1");
      const isExitAfter = await API_HRV2_UID_Flag_Info("2");

      if (isExitBefore === "N") {
        console.log("沒有檢測前資料，執行檢測前邏輯");
        store.detectFlag = "1"; // 設為使用前檢測狀態
        store.detectUID = UID.value;
        store.detectForm = props.productName;
        store.showHRVAlert = true;
      } else if (isExitAfter === "N") {
        console.log("沒有檢測後資料，執行檢測後邏輯");
        store.detectFlag = "2"; // 設為使用後檢測狀態
        store.detectUID = UID.value;
        store.detectForm = props.productName;
        store.showHRVAlert = true;
      } else {
        console.log("檢測前後資料均已存在，無需操作");
      }
    } else {
      console.log("未檢測到有效的 UID，初始化為未開始狀態");
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
