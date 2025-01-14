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

    <!-- 重新檢測按鈕：可在「RUNNING」或「AFTER」時顯示 -->

    <div v-if="hasDetectRecord" class="completion-message">感謝您的使用</div>
    <div v-if="hasDetectRecord" class="completion-delayMessage">
      ※ 請於隔天後再使用
    </div>

    <!-- 主按鈕：只在「尚未檢測」(BEFORE) 或「計時中」(RUNNING) 時出現 -->
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

// ------------- [Props] -------------
const props = defineProps({
  totalTime: {
    type: Number,
    default: 3600, // 總倒數時間（秒）
  },
  productName: {
    type: String,
  },
  hasDetectRecord: {
    type: Boolean,
  },
});

const router = useRouter();

// ------------- [Store] -------------
import { useCommon } from "../stores/common";
import Alert from "./Alert.vue";
const store = useCommon();

// ------------- [狀態枚舉] -------------
const DetectionState = {
  BEFORE: "before", // 檢測前
  RUNNING: "running", // 倒數中
  AFTER: "after", // 檢測後
};

// ------------- [核心響應式變數] -------------
const currentState = ref(DetectionState.BEFORE);
const remainingTime = ref(props.totalTime * 1000); // 以毫秒計
const isCounting = ref(false); // 是否正在計時
const UID = ref(""); // 從後端取得的 UID
const BID = ref(""); // 如果後端需要 BID，就保留，否則可刪
let timerInterval = null;
let timerStart = 0; // 記錄計時開始時間

// ------------- [計算屬性] -------------
// 原本：RUNNING => "結束"
// 改成：RUNNING => "進行中..."
const buttonText = computed(() => {
  switch (currentState.value) {
    case DetectionState.BEFORE:
      return "開始 HRV 檢測";
    case DetectionState.RUNNING:
      return "重新檢測";
    case DetectionState.AFTER:
      return "HRV檢測(使用後)";
    default:
      return "開始";
  }
});

// 主按鈕的 Style
const buttonStyle = computed(() => {
  switch (currentState.value) {
    case DetectionState.BEFORE:
      // 綠色(開始)
      return { backgroundColor: "#74BC1F", color: "#fff" };
    case DetectionState.RUNNING:
      // 紅色(結束)
      return { backgroundColor: "#EC4F4F", color: "#fff" };
    case DetectionState.AFTER:
      // 綠色(使用後)
      return { backgroundColor: "#74BC1F", color: "#fff" };
    default:
      return { backgroundColor: "#74BC1F", color: "#fff" };
  }
});

// 漸層進度（依剩餘時間計算 %）
const progressStyle = computed(() => {
  if (props.hasDetectRecord) {
    // 如果已經偵測到有紀錄，直接顯示綠色
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

// 顯示在圓圈中的倒數時間
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

// ------------- [API 封裝] -------------
const localData = JSON.parse(localStorage.getItem("userData") || "{}");
const { MID = "", Token = "", MAID = "", Mobile = "" } = localData;

if (!MID || !Token || !MAID || !Mobile) {
  console.error("用戶數據不完整，無法進行初始化");
  router.push("/");
}

// 通用請求
const apiRequest = async (url, payload) => {
  try {
    const response = await axios.post(url, payload);
    return response.data;
  } catch (error) {
    console.error(`API (${url}) 請求失敗:`, error);
    return null;
  }
};

const initializeUID = async () => {
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_MID_ProductName_UIDInfo.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );

    if (response?.UID) {
      UID.value = response.UID;

      // 後端回傳的 StartTime (格式如 '20231018123000')
      const { StartTime } = response;
      if (StartTime) {
        // 1. 轉成 Date 物件
        const startTime = parseTimeString(StartTime);
        // 2. 檢查是否晚於今日 5 點
        if (startTime < getTodayFiveAM()) {
          // 表示 StartTime 在今天 5 點之前，不符合規則 => 視同無效
          console.log("StartTime 不在今日5點後，視為無效，重置狀態");
          resetToBefore();
          return;
        }

        // ★ 若符合規則，再進行原本流程
        remainingTime.value = calculateRemainingTime(startTime);
        if (remainingTime.value > 0) {
          currentState.value = DetectionState.RUNNING;
          const flagResponse = await API_HRV2_UID_Flag_Info("1", UID.value);
          if (flagResponse === "N") {
            detectHRVBefore(UID.value);
          }
          startCountdown();
        } else {
          // 時間已到 => 可能要執行強制結束
          console.log("倒數時間已過期，檢查是否需要強制結束...");
          const flagResponse = await API_HRV2_UID_Flag_Info("1", UID.value);
          if (flagResponse === "Y") {
            console.log("檢測前流程已完成，強制結束倒數...");
            await forceEndCountdown(UID.value);
          }
        }
      }
    } else {
      console.log("沒有未完成倒數，初始化為 BEFORE 狀態");
      resetToBefore();
    }
  } catch (error) {
    console.error("initializeUID 發生錯誤:", error);
  }
};

// 專門用來把狀態重置回 BEFORE
function resetToBefore() {
  currentState.value = DetectionState.BEFORE;
  remainingTime.value = props.totalTime * 1000;
  UID.value = "";
  // ...若還有其他重置動作，也可一併處理
}

// 取得今日 5 點 (台灣時間)
function getTodayFiveAM() {
  const now = new Date();
  // 假設系統時區即台灣，如在其他時區需自行 +8
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 5, 0, 0);
}

const parseTimeString = (timeStr) => {
  // timeStr = '20231018123000' => '2023-10-18T12:30:00'
  return new Date(
    `${timeStr.slice(0, 4)}-${timeStr.slice(4, 6)}-${timeStr.slice(
      6,
      8
    )}T${timeStr.slice(8, 10)}:${timeStr.slice(10, 12)}:${timeStr.slice(
      12,
      14
    )}`
  );
};

const calculateRemainingTime = (startTime) => {
  const now = new Date();
  const elapsed = now - startTime; // (毫秒)
  return Math.max(props.totalTime * 1000 - elapsed, 0);
};

const forceEndCountdown = async (UID) => {
  try {
    await useEndAPI();
    const isAfterExit = await API_HRV2_UID_Flag_Info("2", UID);
    if (isAfterExit === "N") {
      detectHRVAfter(UID);
      currentState.value = DetectionState.AFTER;
    } else {
      currentState.value = DetectionState.BEFORE;
    }
  } catch (error) {
    console.error("forceEndCountdown 發生錯誤:", error);
  }
};

// 「使用前」檢測：由後端決定 Flag=1
const detectHRVBefore = (UID) => {
  store.detectFlag = "1";
  store.detectUID = UID;
  store.detectForm = props.productName;
  store.showHRVAlert = true;
  console.log("使用前檢測啟動:", { UID });
};

// 「使用後」檢測：由後端決定 Flag=2
const detectHRVAfter = (UID) => {
  store.detectFlag = "2";
  store.detectUID = UID;
  store.detectForm = `*${props.productName}`;
  store.showHRVAlert = true;
  console.log("使用後檢測已啟動", { UID, productName: props.productName });
};

// ------------- [核心倒數函式] -------------
const startCountdown = () => {
  console.log("開始倒數，剩餘時間:", remainingTime.value);
  timerStart = Date.now();
  isCounting.value = true;

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(async () => {
    const now = Date.now();
    remainingTime.value = Math.max(remainingTime.value - (now - timerStart), 0);
    timerStart = now;

    // 若已經歸零 => 結束
    if (remainingTime.value <= 0) {
      clearInterval(timerInterval);
      remainingTime.value = 0;
      console.log("倒數結束，檢查是否需要後續處理...");

      // 檢查使用前檢測
      const flagBefore = await API_HRV2_UID_Flag_Info("1", UID.value);
      if (flagBefore === "N") {
        console.log("尚未完成使用前檢測，啟動使用前檢測流程...");
        detectHRVBefore(UID.value);
        currentState.value = DetectionState.BEFORE;
      } else {
        console.log("檢測流程已完成，進行結束操作...");
        await useEndAPI();
        currentState.value = DetectionState.BEFORE;
      }
    }
  }, 1000);
};

// ------------- [主按鈕邏輯：不再有暫停/恢復] -------------
// 只秀出 toggleTimer 關鍵部分
const toggleTimer = async () => {
  console.log("按鈕被點擊，當前狀態:", currentState.value);
  try {
    switch (currentState.value) {
      case DetectionState.BEFORE:
        // 按下按鈕 => 建立 UID => 進入 RUNNING 倒數
        console.log("狀態：BEFORE => 開始倒數");
        const response = await useStartAPI();
        if (response?.UID) {
          detectHRVBefore(response.UID);
          startCountdown();
          currentState.value = DetectionState.RUNNING;
        }
        break;

      case DetectionState.RUNNING:
        // ★ 新增確認視窗
        if (window.confirm("確定要重新檢測嗎？")) {
          console.log("使用者確認重新檢測，呼叫 handleRestart()");
          await handleRestart();
        } else {
          console.log("使用者取消重新檢測，不做任何事");
        }
        break;

      default:
        console.warn("未知狀態，不做任何事:", currentState.value);
    }
  } catch (error) {
    console.error("toggleTimer 操作失敗:", error);
  }
};

// ------------- [API - Start & End] -------------
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

const useEndAPI = async () => {
  if (!UID.value) {
    console.error("無法結束，UID 不存在");
    return;
  }
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_UseEnd.jsp",
      { MID, Token, MAID, Mobile, UID: UID.value }
    );
    console.log("結束 API 呼叫成功:", response);
    localStorage.removeItem("UID");
    // 可視需求決定是否 reload 或做其他處理
    window.location.reload();
    return response;
  } catch (error) {
    console.error("結束 API 呼叫失敗:", error);
    return null;
  }
};

// ------------- [API - 查詢 FLAG 狀態] -------------
const API_HRV2_UID_Flag_Info = async (Flag, UID) => {
  if (!UID) return null;
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_HRV2_UID_Flag_Info.jsp",
      { MID, Token, MAID, Mobile, UID, Flag }
    );
    if (response?.Result === "OK") {
      return response.IsExit; // "Y" or "N"
    } else {
      console.error("無法獲取 HRV2 資料狀態:", response);
      return null;
    }
  } catch (error) {
    console.error("API_HRV2_UID_Flag_Info 調用失敗:", error);
    return null;
  }
};

// ------------- [重新檢測邏輯] -------------
const handleRestart = async () => {
  try {
    // 1. 刪除後端檢測紀錄
    await API_DeleteStart();

    // 2. 前端重置狀態
    resetDetectionState();
  } catch (error) {
    console.error("重新檢測失敗:", error);
  }
};

const API_DeleteStart = async () => {
  if (!UID.value) {
    console.log("尚無 UID，不需呼叫 API_DeleteStart");
    return;
  }
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_DeleteStart.jsp",
      {
        MID,
        Token,
        MAID,
        Mobile,
        UID: UID.value,
        ProductName: props.productName,
      }
    );
    console.log("API_DeleteStart 呼叫成功:", response);
  } catch (error) {
    console.error("API_DeleteStart 呼叫失敗:", error);
    throw error;
  }
};
const resetDetectionState = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  currentState.value = DetectionState.BEFORE;
  remainingTime.value = props.totalTime * 1000;
  UID.value = "";
  BID.value = "";
  isCounting.value = false;
  console.log("已重置倒數狀態");
};

// ------------- [檢查未完成後檢測邏輯] -------------
const checkForPendingAfterDetection = async () => {
  if (isCheckingPending.value) return;
  isCheckingPending.value = true;

  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_UIDInfo_Search12.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );
    if (response && response.Result !== "NOData") {
      const { UID: rUID, CheckTime } = response;
      // 若有未完成的使用後檢測 => 直接進 AFTER 狀態
      if (rUID) {
        if (timerInterval) clearInterval(timerInterval);
        isCounting.value = false;
        remainingTime.value = 0;
        detectHRVAfter(rUID);
        currentState.value = DetectionState.AFTER;
      }
    }
  } catch (error) {
    console.error("檢查未完成使用後檢測失敗:", error);
  } finally {
    isCheckingPending.value = false;
  }
};

// ------------- [onMounted 初始化] -------------
onMounted(() => {
  initializeUID().then(() => {
    if (currentState.value === DetectionState.BEFORE) {
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
