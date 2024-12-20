<template>
  <div class="progress-container">
    <div class="progress-border" :style="progressStyle">
      <div class="content">{{ formattedTime }}</div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="179"
        height="178"
        class="timeDot"
        viewBox="0 0 179 178"
        fill="none"
      >
        <circle
          cx="89.333"
          cy="89"
          r="88.5"
          stroke="#666"
          stroke-dasharray="1 10"
        />
      </svg>
    </div>
    <div v-if="hasDetectRecord" class="completion-message">感謝您的使用</div>
    <div v-if="hasDetectRecord" class="completion-delayMessage">
      ※ 請於隔天後再使用
    </div>

    <button
      @click="toggleTimer"
      v-if="!hasDetectRecord"
      :disabled="hasDetectRecord"
      :style="buttonStyle"
    >
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

// Props
const props = defineProps({
  totalTime: {
    type: Number,
    default: 3600, // 總時間（秒）
  },
  productName: {
    type: String,
  },
  hasDetectRecord: {
    type: Boolean,
  },
});

const router = useRouter();

import { useCommon } from "../stores/common";
const store = useCommon();

const DetectionState = {
  BEFORE: "before", // 檢測前
  RUNNING: "running", // 倒數中
  PAUSED: "paused", // 暫停中
  AFTER: "after", // 檢測後
};

const currentState = ref(DetectionState.BEFORE); // 初始化為檢測前
const remainingTime = ref(props.totalTime * 1000); // 倒數剩餘時間（毫秒）
const isCounting = ref(false); // 是否正在計時
const isPaused = ref(false); // 是否暫停
const UID = ref(""); // UID 默認為空
const BID = ref(""); // BID 默認為空

const isCheckingPending = ref(false);

let timerStart = 0; // 記錄計時開始時間
let elapsedTime = 0; // 暫停前已經過的時間
let timerInterval = null; // 計時器

const isPastResetTime = (testTime) => {
  const resetTime = getResetTime();
  return testTime < resetTime; // 測試時間早於重置時間，允許重新測試
};

const getResetTime = () => {
  const now = new Date();
  const resetTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    5, // 設置重置時間為凌晨5點
    0,
    0
  );
  // 如果現在時間早於當天5點，重置時間應該是昨天的5點
  if (now < resetTime) {
    resetTime.setDate(resetTime.getDate() - 1);
  }
  return resetTime;
};

// 計算屬性
const buttonText = computed(() => {
  switch (currentState.value) {
    case DetectionState.BEFORE:
      return "開始 HRV 檢測";
    case DetectionState.RUNNING:
      return isPaused.value ? "繼續" : "暫停";
    case DetectionState.PAUSED:
      return "繼續";
    default:
      return "開始";
  }
});

const buttonStyle = computed(() => {
  switch (currentState.value) {
    case DetectionState.BEFORE:
      return { backgroundColor: "#74BC1F", color: "#fff" }; // 綠色
    case DetectionState.RUNNING:
      return isPaused.value
        ? { backgroundColor: "#74BC1F", color: "#fff" } // 綠色
        : { backgroundColor: "#EC4F4F", color: "#fff" }; // 紅色
    case DetectionState.PAUSED:
      return { backgroundColor: "#74BC1F", color: "#fff" };
    default:
      return { backgroundColor: "#74BC1F", color: "#fff" }; // 默認綠色
  }
});

const progressStyle = computed(() => {
  if (props.hasDetectRecord) {
    return {
      background: `conic-gradient(#74BC1F 0% 100%, #74BC1F 100% 100%)`,
      transition: "background 0.1s linear",
    };
  }
  const progress = Math.min(
    ((props.totalTime * 1000 - remainingTime.value) /
      (props.totalTime * 1000)) *
      100,
    100
  );
  return {
    background: `conic-gradient(#74BC1F 0% ${progress}%, #ffffff ${progress}% 100%)`,
    transition: "background 0.1s linear",
  };
});

const formattedTime = computed(() => {
  const totalSeconds = Math.floor(remainingTime.value / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
});

// API 請求
const apiRequest = async (url, payload) => {
  try {
    console.log(`發送請求至: ${url}，參數:`, payload);
    const response = await axios.post(url, payload);
    console.log(`API 響應 (${url}):`, response.data);
    return response.data;
  } catch (error) {
    console.error(`API (${url}) 請求失敗:`, error);
    return null;
  }
};
const localData = JSON.parse(localStorage.getItem("userData") || "{}");
const { MID = "", Token = "", MAID = "", Mobile = "" } = localData;

if (!MID || !Token || !MAID || !Mobile) {
  console.error("用戶數據不完整，無法進行初始化");
  router.push("/"); // 或處理錯誤邏輯
}

// 沒有倒數完會抓到的API
const initializeUID = async () => {
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_MID_ProductName_UIDInfo.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );

    if (response?.UID) {
      UID.value = response.UID;
      const { StartTime } = response;

      // 計算倒數起始時間
      const startTime = new Date(
        `${StartTime.slice(0, 4)}-${StartTime.slice(4, 6)}-${StartTime.slice(
          6,
          8
        )}T${StartTime.slice(8, 10)}:${StartTime.slice(
          10,
          12
        )}:${StartTime.slice(12, 14)}`
      );

      const resetTime = getResetTime();

      // 如果檢測時間早於重置時間
      if (isPastResetTime(startTime)) {
        console.log("檢測時間早於重置時間，重置為新的倒數時間");

        // 清除現有的計時器
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }

        // 重置狀態和時間
        currentState.value = DetectionState.BEFORE;
        remainingTime.value = props.totalTime * 1000; // 使用 props 的 `totalTime` 作為倒數時間
        isCounting.value = false;

        console.log(
          `重置倒數時間為 ${formattedTime.value}，總時間: ${props.totalTime} 秒`
        );

        return;
      }

      // 計算倒數剩餘時間
      remainingTime.value = calculateRemainingTime(startTime);
      console.log("初始化倒數剩餘時間:", remainingTime.value);

      if (remainingTime.value <= 0) {
        console.log("倒數時間已過期，檢查是否需要強制結束...");
        const flagResponse = await API_HRV2_UID_Flag_Info("1", response.UID);
        if (flagResponse === "Y") {
          console.log("檢測前流程已完成，強制結束倒數...");
          await forceEndCountdown(response.UID);
        }
        return;
      }

      const flagResponse = await API_HRV2_UID_Flag_Info("1", response.UID);
      if (flagResponse === "N") {
        console.log("尚未完成使用前檢測，啟動檢測...");
        detectHRVBefore(response.UID);
      }

      currentState.value = DetectionState.RUNNING;
      startCountdown();
    } else {
      console.log("沒有未完成的倒數計時，重新初始化...");
      currentState.value = DetectionState.BEFORE;
      remainingTime.value = props.totalTime * 1000; // 使用 props 的 `totalTime`
    }
  } catch (error) {
    console.error("initializeUID 發生錯誤：", error);
  }
};

// 強制結束倒數邏輯
const forceEndCountdown = async (UID) => {
  try {
    await useEndAPI(); // 調用結束 API 通知伺服器倒數完成
    const isAfterExit = await API_HRV2_UID_Flag_Info("2", UID);
    if (isAfterExit === "N") {
      detectHRVAfter(UID); // 如果需要，啟動後測
      currentState.value = DetectionState.AFTER;
    } else {
      currentState.value = DetectionState.BEFORE; // 重置狀態
    }
  } catch (error) {
    console.error("forceEndCountdown 發生錯誤：", error);
  }
};

const calculateRemainingTime = (startTime) => {
  const now = new Date();
  const elapsed = now - startTime; // 已经过的时间（毫秒）
  return Math.max(props.totalTime * 1000 - elapsed, 0);
};

// 倒數計時邏輯
const startCountdown = () => {
  console.log("倒數計時開始，剩餘時間:", remainingTime.value);
  timerStart = Date.now();
  isCounting.value = true;
  isPaused.value = false;

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(async () => {
    const now = Date.now();
    remainingTime.value = Math.max(remainingTime.value - (now - timerStart), 0);
    timerStart = now;

    if (remainingTime.value <= 0) {
      clearInterval(timerInterval);
      remainingTime.value = 0;

      console.log("倒數結束，檢查是否需要後續處理...");
      const flagBefore = await API_HRV2_UID_Flag_Info("1", UID.value); // 檢查使用前檢測

      if (flagBefore === "N") {
        console.log("尚未完成使用前檢測，啟動使用前檢測流程...");
        detectHRVBefore(UID.value);
        currentState.value = DetectionState.BEFORE;
      } else {
        console.log("檢測流程已完成，進行結束操作...");
        await useEndAPI(); // 呼叫結束 API 通知伺服器
        currentState.value = DetectionState.BEFORE; // 重置狀態
      }
    }
  }, 1000);
};

const pauseTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval); // 停止计时器
    elapsedTime = Date.now() - timerStart; // 记录已用时间
    remainingTime.value -= elapsedTime; // 更新剩余时间
    isPaused.value = true;
    isCounting.value = false;
  }
};

const resumeTimer = () => {
  if (remainingTime.value > 0) {
    timerStart = Date.now(); // 记录当前时间
    isPaused.value = false;
    isCounting.value = true;

    timerInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - timerStart; // 计算已用时间
      remainingTime.value = Math.max(remainingTime.value - elapsed, 0); // 减去已用时间
      timerStart = now; // 更新开始时间

      if (remainingTime.value <= 0) {
        // clearInterval(timerInterval);
        remainingTime.value = 0;
        endCountdown(); // 处理倒计时结束逻辑
      }
    }, 1000);
  }
};

const endCountdown = async () => {
  console.log("倒計時結束，執行結束邏輯");
  await useEndAPI(); // 調用結束 API 通知伺服器
  const isAfterExit = await API_HRV2_UID_Flag_Info("2", UID.value);
  if (isAfterExit === "N") {
    detectHRVAfter(UID.value); // 啟動後測
    currentState.value = DetectionState.AFTER;
  } else {
    currentState.value = DetectionState.BEFORE; // 重置狀態
  }
};

const resetDetectionState = () => {
  clearInterval(timerInterval);
  timerInterval = null;
  isCounting.value = false;
  isPaused.value = false;
  currentState.value = DetectionState.BEFORE;
  remainingTime.value = props.totalTime * 1000;
};

const toggleTimer = async () => {
  console.log("按鈕被點擊，當前狀態:", currentState.value);
  try {
    switch (currentState.value) {
      case DetectionState.BEFORE:
        console.log("狀態：BEFORE，初始化檢測並開始倒數");
        const response = await useStartAPI();
        if (response?.UID) {
          detectHRVBefore(response.UID);
          startCountdown();
          currentState.value = DetectionState.RUNNING;
        }
        break;

      case DetectionState.RUNNING:
        console.log("狀態：RUNNING，暫停倒數");
        await usePauseAPI();
        pauseTimer();
        currentState.value = DetectionState.PAUSED;
        break;

      case DetectionState.PAUSED:
        console.log("狀態：PAUSED，恢復倒數");
        await usePauseEndAPI();
        resumeTimer();
        currentState.value = DetectionState.RUNNING;
        break;

      default:
        console.error("未知狀態，無法處理按鈕點擊");
    }
  } catch (error) {
    console.error("操作失敗:", error);
  }
};

const detectHRVBefore = (UID) => {
  store.detectFlag = "1";
  store.detectUID = UID;
  store.detectForm = props.productName;
  store.showHRVAlert = true;
  console.log("使用前檢測啟動:", { UID });
};

const detectHRVAfter = (UID) => {
  store.detectFlag = "2"; // 更新為使用後檢測狀態
  store.detectUID = UID; // 設置當前 UID
  store.detectForm = `*${props.productName}`; // 添加產品名稱前綴
  store.showHRVAlert = true; // 顯示檢測提示
  console.log("使用後檢測已啟動", { UID, productName: props.productName });
};

const useStartAPI = async () => {
  console.log("正在調用 API_UseStart...");
  const response = await apiRequest(
    "https://23700999.com:8081/HMA/API_UseStart.jsp",
    { MID, Token, MAID, Mobile, ProductName: props.productName }
  );
  if (response?.UID) {
    UID.value = response.UID;
    localStorage.setItem("UID", UID.value);
    console.log("成功創建新的 UID：", UID.value);
  } else {
    console.error("創建新的 UID 失敗:", response);
  }
  return response;
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
      console.error("暫停 API 未返回有效的 BID:", response);
    }
    return response;
  } catch (error) {
    console.error("暫停 API 調用失敗:", error);
    return null;
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
    console.log("恢復 API 調用成功:", response);
    return response;
  } catch (error) {
    console.error("恢復 API 調用失敗:", error);
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
    console.log("結束 API 調用成功:", response);
    localStorage.removeItem("UID"); // 移除本地存儲的 UID
    window.location.reload();
    return response;
  } catch (error) {
    console.error("結束 API 調用失敗:", error);
    return null;
  }
};

//有倒數紀錄 檢測前紀錄 但沒有檢測後紀錄
const checkForPendingAfterDetection = async () => {
  if (isCheckingPending.value) return; // 防止重複執行
  isCheckingPending.value = true;

  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_UIDInfo_Search12.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );

    if (response?.Result && response.Result !== "NOData") {
      const { UID, CheckTime } = response;

      const checkTime = new Date(
        `${CheckTime.slice(0, 4)}-${CheckTime.slice(4, 6)}-${CheckTime.slice(
          6,
          8
        )}T${CheckTime.slice(8, 10)}:${CheckTime.slice(
          10,
          12
        )}:${CheckTime.slice(12, 14)}`
      );

      if (isPastResetTime(checkTime)) {
        console.log("檢測時間早於重置時間，允許重新測試");
        currentState.value = DetectionState.BEFORE;
        return;
      }

      console.log("檢測到未完成的使用後檢測：", { UID, CheckTime });
      if (UID) {
        // 清除計時器
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }

        // 重置計時狀態
        isCounting.value = false;
        remainingTime.value = 0;

        detectHRVAfter(UID);
        currentState.value = DetectionState.AFTER;
      }
    } else {
      console.log("未檢測到未完成的使用後檢測記錄。");
    }
  } catch (error) {
    console.error("檢查未完成使用後檢測時發生錯誤：", error);
  } finally {
    isCheckingPending.value = false;
  }
};

// 初始化
onMounted(() => {
  console.log("初始化狀態:", currentState.value);
  initializeUID().then(() => {
    if (currentState.value === DetectionState.RUNNING) {
      startCountdown();
    } else if (currentState.value === DetectionState.BEFORE) {
      console.log("檢查未完成的使用後檢測...");
      checkForPendingAfterDetection();
    }
  });
});
</script>

<style lang="scss" scoped>
.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background-color: rgb(246, 246, 246);
  width: 100%;
  max-width: 768px;
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
}

.progress-border .timeDot {
  position: absolute;
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
  padding: 0.5rem 0.75rem;
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
</style>
