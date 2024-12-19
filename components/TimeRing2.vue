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

const DetectionState = {
  BEFORE: "before", // 檢測前
  RUNNING: "running", // 計時中
  PAUSED: "paused", // 暫停中
  AFTER: "after", // 檢測後
};
const currentDetectionState = ref(DetectionState.BEFORE);

const buttonText = computed(() => {
  switch (currentDetectionState.value) {
    case DetectionState.BEFORE:
      return "開始 HRV 檢測";
    case DetectionState.RUNNING:
      return "暫停";
    case DetectionState.PAUSED:
      return "繼續";
    case DetectionState.AFTER:
      return "HRV檢測(使用後)";
    default:
      return "未知狀態";
  }
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
    ? { backgroundColor: "#1FBCB3", color: "#fff" } // 藍色 (結束)
    : { backgroundColor: "#E0E0E0", color: "#000", cursor: "not-allowed" }; // 灰色 (已結束，禁用狀態)
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
  if (timerInterval.value) {
    console.log("計時器已啟動");
    return;
  }

  isCounting.value = true; // 更新計時狀態
  isPaused.value = false;

  timerInterval.value = setInterval(() => {
    elapsedTime.value++; // 累加时间
    console.log("計時中，已過時間：", elapsedTime.value, "秒");
  }, 1000);

  currentDetectionState.value = DetectionState.RUNNING; // 確保狀態更新為 RUNNING
  console.log("計時開始");
};

const pauseTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null; // 清空計時器
  }

  isPaused.value = true;
  isCounting.value = false;

  console.log("計時暫停，已過時間：", elapsedTime.value, "秒");
};

const resumeTimer = () => {
  if (!isPaused.value) {
    console.log("計時器未暫停，無需恢復");
    return;
  }

  isPaused.value = false;
  isCounting.value = true;

  startTimer(); // 確保計時器恢復運行
  console.log("計時恢復，已過時間：", elapsedTime.value, "秒");
};

const stopTimer = async () => {
  clearInterval(timerInterval.value); // 停止計時器
  timerInterval.value = null; // 清空計時器引用

  isCounting.value = false; // 停止計時
  isPaused.value = false; // 重置暫停狀態
  elapsedTime.value = 0; // 重置計時器時間
  isButtonEnabled.value = false; // 禁用按鈕

  currentDetectionState.value = DetectionState.AFTER; // 更新狀態為 AFTER

  try {
    await useEndAPI(); // 調用結束 API
    console.log("計時已結束，API 調用成功");
  } catch (error) {
    console.error("結束 API 調用失敗：", error);
  }
};

const apiRequest = async (url, payload) => {
  try {
    const response = await axios.post(url, payload);

    return response.data;
  } catch (error) {
    throw error;
  }
};

const detectHRVBefore = (UID) => {
  store.detectFlag = "1";
  store.detectUID = UID;
  store.detectForm = props.productName;
  store.showHRVAlert = true;
  startTimer();
};

const detectHRVAfter = (UID) => {
  store.detectFlag = "2"; // 更新為使用後檢測狀態
  store.detectUID = UID; // 設置當前 UID
  store.detectForm = `*${props.productName}`; // 添加產品名稱前綴
  store.showHRVAlert = true; // 顯示檢測提示
  console.log("使用後檢測已啟動", { UID, productName: props.productName });
};

const toggleTimer = async () => {
  switch (currentDetectionState.value) {
    case DetectionState.BEFORE:
      if (UID.value) {
        console.log("已有 UID，從 API 時間開始 HRV 檢測");
        const response = await API_MID_ProductName_UIDInfo();
        if (response?.StartTime) {
          const startTime = new Date(
            `${response.StartTime.slice(0, 4)}-${response.StartTime.slice(
              4,
              6
            )}-${response.StartTime.slice(6, 8)}T${response.StartTime.slice(
              8,
              10
            )}:${response.StartTime.slice(10, 12)}:${response.StartTime.slice(
              12
            )}`
          ).getTime();
          const now = Date.now();
          elapsedTime.value = Math.floor((now - startTime) / 1000); // 更新已過秒數
        }
        startTimer(); // 啟動計時器
      } else {
        console.log("未找到 UID，創建新的 HRV 檢測");
        const response = await useStartAPI();
        if (response?.UID) {
          detectHRVBefore(response.UID);
        } else {
          console.error("創建 UID 失敗");
        }
      }
      currentDetectionState.value = DetectionState.RUNNING; // 確保狀態更新
      break;

    case DetectionState.RUNNING:
      console.log("暫停 HRV 檢測");
      await usePauseAPI();
      currentDetectionState.value = DetectionState.PAUSED;
      pauseTimer();
      break;

    case DetectionState.PAUSED:
      console.log("恢復 HRV 檢測");
      await usePauseEndAPI();
      currentDetectionState.value = DetectionState.RUNNING;
      resumeTimer();
      break;

    case DetectionState.AFTER:
      console.log("執行使用後檢測邏輯");
      detectHRVAfter(UID.value); // 執行使用後檢測
      break;

    default:
      console.error("未知檢測狀態");
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

      const UID = response.UID; // 直接提取 UID
      if (!UID) {
        console.warn("UID 為 null，無法繼續後續操作");
        return null; // 如果 UID 為 null，直接返回
      }

      const now = new Date().getTime();
      const checkTime = response.CheckTime
        ? new Date(
            `${response.CheckTime.slice(0, 4)}-${response.CheckTime.slice(
              4,
              6
            )}-${response.CheckTime.slice(6, 8)}T${response.CheckTime.slice(
              8,
              10
            )}:${response.CheckTime.slice(10, 12)}:${response.CheckTime.slice(
              12
            )}`
          ).getTime()
        : null;

      if (checkTime) {
        const timeDifference = Math.abs(now - checkTime);

        if (timeDifference <= 24 * 60 * 60 * 1000) {
          console.log("CheckTime 在有效的24小時範圍內：", checkTime);
          await API_HRV2_UID_Flag_Info("1", UID); // 確保 UID 存在再調用
        } else {
          console.log("CheckTime 超出24小時範圍");
        }
      } else {
        console.warn("無法檢測到 CheckTime，可能需要進行其他處理");
      }

      return response; // 返回整個響應
    } else {
      console.error("無法獲取有效的 UID 信息：", response);
      return null;
    }
  } catch (error) {
    console.error("API 調用失敗：", error);
    return null;
  }
};

const API_HRV2_UID_Flag_Info = async (Flag, UID) => {
  if (!UID) {
    console.error("UID 為 null，無法調用 API_HRV2_UID_Flag_Info");
    return null;
  }
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_HRV2_UID_Flag_Info.jsp",
      { MID, Token, MAID, Mobile, UID, Flag }
    );
    if (response?.Result === "OK") {
      console.log("成功獲取 HRV2 檢測資料狀態：", response);
      if (Flag == "1") {
        if (response.IsExit === "N") {
          detectHRVBefore(UID);
        }
      }
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
  try {
    const response = await API_MID_ProductName_UIDInfo();

    if (response) {
      UID.value = response.UID;
      if (UID.value) {
        console.log("成功獲取有效的 UID 信息：", UID.value);

        if (response.StartTime) {
          const startTime = new Date(
            `${response.StartTime.slice(0, 4)}-${response.StartTime.slice(
              4,
              6
            )}-${response.StartTime.slice(6, 8)}T${response.StartTime.slice(
              8,
              10
            )}:${response.StartTime.slice(10, 12)}:${response.StartTime.slice(
              12
            )}`
          ).getTime();

          const now = Date.now();
          const timeDifference = Math.abs(now - startTime);

          if (timeDifference <= 24 * 60 * 60 * 1000) {
            elapsedTime.value = Math.floor(timeDifference / 1000); // 更新已過秒數
            console.log("計算的已過時間：", elapsedTime.value, "秒");

            // 啟動計時器並更新狀態
            startTimer();
            currentDetectionState.value = DetectionState.RUNNING;
          } else {
            console.log("StartTime 超出24小時範圍");
          }
        } else {
          console.log("無效的 StartTime");
        }
      } else {
        console.warn("UID 為 null，需要創建新的檢測記錄");
        const startResponse = await useStartAPI(); // 調用創建檢測 API
        if (startResponse?.UID) {
          UID.value = startResponse.UID;
          console.log("成功創建新的 UID：", UID.value);
          detectHRVBefore(UID.value); // 開始檢測前處理
        } else {
          console.error("無法創建新的 UID，請檢查相關參數或 API");
        }
      }
    } else {
      console.error("未檢測到有效的 CheckTime");
    }
  } catch (error) {
    console.error("初始化失敗：", error);
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
      console.log("成功創建新的 UID：", UID.value);
    } else {
      console.error("創建新的 UID 失敗，請檢查 API 響應");
    }
    return response;
  } catch (error) {
    console.error("創建新的 UID API 調用失敗：", error);
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
  switch (currentDetectionState.value) {
    case DetectionState.BEFORE:
      return { backgroundColor: "#74BC1F", color: "#fff" }; // 綠色
    case DetectionState.RUNNING:
      return { backgroundColor: "#EC4F4F", color: "#fff" }; // 紅色 (暫停)
    case DetectionState.PAUSED:
      return { backgroundColor: "#74BC1F", color: "#fff" }; // 綠色 (繼續)
    case DetectionState.AFTER:
      return { backgroundColor: "#74BC1F", color: "#fff" }; // 綠色 (檢測後)
    default:
      return { backgroundColor: "#E0E0E0", color: "#000" }; // 灰色 (默認)
  }
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
