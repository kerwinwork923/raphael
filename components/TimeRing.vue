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

    <button v-if="showButton" :style="buttonStyle" @click="toggleTimer">
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

// Props
const props = defineProps({
  totalTime: {
    type: Number,
    default: 60,
  },
  productName: {
    type: String,
  },
  hasUseRecord: {
    type: Boolean,
  },

  hasDetectRecord: {
    type: Boolean,
  },
  todayUseRecord: {
    type: Array,
    default: () => [],
  },
  hasBeforeData: {
    type: Array,
    default: () => [],
  },
});

// Router
const router = useRouter();

// 動態生成 localStorage 鍵名
const getProductStorageKey = (key) => `${props.productName}_${key}`;

// localStorage 操作方法
const getLocalStorage = (key) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

const setLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const deleteLocalStorage = (key) => {
  localStorage.removeItem(key);
};

// 驗證 LocalStorage 資料
const localData = localStorage.getItem("userData");
const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

if (!MID || !Token || !MAID || !Mobile) {
  router.push("/");
}

watch(
  () => props.hasDetectRecord,
  (newVal) => {
    clearInterval(timerInterval);
    isCounting.value = false;
  }
);

watch(
  () => props.todayUseRecord,
  (newVal) => {
    if (Array.isArray(newVal) && newVal.length > 0) {
      const record = newVal[0];
      UID.value = record.UID;
      store.detectFlag = "2";
      store.detectUID = record.UID;
      store.detectForm = record.ProductName;

      const startTimeStamp = parseTime(record.oriStartTime);
      const elapsed = Math.floor((Date.now() - startTimeStamp) / 1000);
      remainingTime.value = Math.max(props.totalTime - elapsed, 0);

      if (remainingTime.value > 0) {
        buttonText.value = "暫停";
        countdown();
      } else {
        buttonText.value = "HRV檢測";
        remainingTime.value = 0;
        useEndAPI();
      }
    }
  }
);

const remainingTime = ref(props.totalTime); // 倒數時間
const isCounting = ref(false); // 正在倒數
const isPaused = ref(false); // 暫停狀態

const UID = ref(""); // 保存 UID
const BID = ref(""); // 保存 BID
let startTime = ref(0); // 開始時間（毫秒）
let elapsedTime = ref(0); // 已經過時間（秒）

import { useCommon } from "../stores/common";
const store = useCommon();

const buttonText = ref("HRV檢測"); // 按鈕文字
const showButton = ref(true); // 顯示按鈕的狀態

// 計算進度條樣式
const progressStyle = computed(() => {
  let progress;
  if (remainingTime.value <= 0) {
    progress = 100; // 如果剩餘時間為0，進度條顯示100%
  } else {
    progress =
      ((props.totalTime - remainingTime.value) / props.totalTime) * 100;
  }
  return {
    background: `conic-gradient(
        #74BC1F 0% ${progress}%,
        #ffffff ${progress}% 100%
      )`,
    transition: "background 0.5s ease-out", // 確保平滑過渡
  };
});

// 格式化時間
const formattedTime = computed(() => {
  const hours = Math.floor(remainingTime.value / 3600);
  const minutes = Math.floor((remainingTime.value % 3600) / 60);
  const seconds = Math.floor(remainingTime.value % 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
});

// 保存計時器狀態到 localStorage
const saveTimerState = () => {
  const now = Date.now();
  const timerState = {
    remainingTime: remainingTime.value,
    elapsedTime: elapsedTime.value,
    startTime: isPaused.value ? null : now,
    isPaused: isPaused.value,
    isCounting: isCounting.value,
    UID: UID.value,
    BID: BID.value,
  };
  setLocalStorage(getProductStorageKey("timerState"), timerState);
};

// 從 localStorage 載入計時器狀態
const loadTimerState = () => {
  const timerState = getLocalStorage(getProductStorageKey("timerState"));
  if (timerState) {
    remainingTime.value = timerState.remainingTime || props.totalTime;
    elapsedTime.value = timerState.elapsedTime || 0;
    startTime.value = timerState.startTime || 0;
    isPaused.value = timerState.isPaused || false;
    isCounting.value = timerState.isCounting || false;
    UID.value = timerState.UID || "";
    BID.value = timerState.BID || "";

    showButton.value = true; // 確保按鈕顯示

    if (isPaused.value) {
      buttonText.value = "繼續"; // 按鈕文字設為繼續
    } else if (startTime.value) {
      const now = Date.now();
      const elapsedSinceStart = (now - startTime.value) / 1000;
      remainingTime.value = Math.max(
        props.totalTime - elapsedTime.value - elapsedSinceStart,
        0
      );
      if (remainingTime.value > 0) countdown();
    }
  }
};

// API 方法
const apiRequest = async (url, payload) => {
  try {
    const response = await axios.post(url, payload);
    console.log(`${url} 回應:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`${url} 請求失敗:`, error);
    return null;
  }
};

const saveInitialHRVState = () => {
  const now = Date.now();
  setLocalStorage(getProductStorageKey("startTime"), now); // 設置開始時間
  setLocalStorage(getProductStorageKey("UID"), UID.value); // 設置 UID
};

const useStartAPI = async () => {
  const response = await apiRequest(
    "https://23700999.com:8081/HMA/API_UseStart.jsp",
    { MID, Token, MAID, Mobile, ProductName: props.productName }
  );
  if (response && response.UID) {
    UID.value = response.UID; // 保存 UID
    return response;
  }
  return null;
};

const usePauseAPI = async () => {
  const response = await apiRequest(
    "https://23700999.com:8081/HMA/API_UsePauseStart.jsp",
    { MID, Token, MAID, Mobile, UID: UID.value }
  );
  if (response && response.BID) {
    BID.value = response.BID;
  }
};

const usePauseEndAPI = async () => {
  if (!BID.value) return;
  await apiRequest("https://23700999.com:8081/HMA/API_UsePauseEnd.jsp", {
    MID,
    Token,
    MAID,
    Mobile,
    UID: UID.value,
    BID: BID.value,
  });
};

const useEndAPI = async () => {
  if (!UID.value) return;
  await apiRequest("https://23700999.com:8081/HMA/API_UseEnd.jsp", {
    MID,
    Token,
    MAID,
    Mobile,
    UID: UID.value,
  });
};

// 計時器邏輯
let timerInterval;

const countdown = () => {
  if (timerInterval) clearInterval(timerInterval);

  const tick = () => {
    if (isPaused.value) return;

    const now = Date.now();
    const elapsedSinceStart = (now - startTime.value) / 1000;
    remainingTime.value = Math.max(
      props.totalTime - elapsedTime.value - elapsedSinceStart,
      0
    );

    if (remainingTime.value <= 0) {
      clearInterval(timerInterval);
      isCounting.value = false;
      buttonText.value = "HRV檢測";
      remainingTime.value = 0;

      // 確保倒數結束時觸發 API
      useEndAPI();
      showButton.value = true;
    } else {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const toggleTimer = async () => {
  if (Array.isArray(props.hasBeforeData) && props.hasBeforeData.length === 0) {
    // 檢測前邏輯
    console.log("檢測前流程");
    const response = await useStartAPI();
    if (response && UID.value) {
      // 更新狀態
      store.detectFlag = "1"; // 檢測前
      store.detectUID = UID.value; // 保存檢測 UID
      store.detectForm = props.productName; // 保存產品名稱
      store.showHRVAlert = true; // 顯示 HRV 提示框

      // 保存到 localStorage
      const now = Date.now();
      setLocalStorage(getProductStorageKey("startTime"), now);
      setLocalStorage(getProductStorageKey("UID"), UID.value);

      // 更新按鈕狀態
      buttonText.value = "暫停";
      startTimer(); // 開始倒數
    } else {
      console.error("檢測前 API 調用失敗");
    }
  } else if (props.hasUseRecord) {
    // 檢測後邏輯
    console.log("檢測後流程");
    store.detectFlag = "2"; // 更新為檢測後
    store.detectUID = UID.value; // 保存檢測 UID
    store.detectForm = props.productName; // 保存產品名稱
    store.showHRVAlert = true; // 顯示 HRV 提示框
  } else {
    console.error("未知流程，無法進行操作");
  }
};

const startTimer = () => {
  isCounting.value = true;
  isPaused.value = false;
  startTime.value = Date.now();
  buttonText.value = "暫停";
  countdown();
};

const pauseTimer = () => {
  isPaused.value = true;
  elapsedTime.value += (Date.now() - startTime.value) / 1000;
  startTime.value = null;
  buttonText.value = "繼續";
  saveTimerState();
};

const resumeTimer = () => {
  isPaused.value = false;
  startTime.value = Date.now();
  buttonText.value = "暫停";
  countdown();
  saveTimerState();
};

onMounted(() => {
  if (Array.isArray(props.hasBeforeData) && props.hasBeforeData.length === 0) {
    console.log("初始化為檢測前狀態");
    buttonText.value = "HRV檢測";
    store.detectFlag = "1"; // 初始化為檢測前
  } else if (props.hasUseRecord) {
    console.log("初始化為檢測後狀態");
    const record = props.todayUseRecord[0];
    UID.value = record.UID;
    store.detectFlag = "2"; // 初始化為檢測後
    store.detectUID = record.UID;
    store.detectForm = record.ProductName;
    store.showHRVAlert = true; // 顯示 HRV 提示框
  } else {
    console.log("初始化為未知狀態");
    buttonText.value = "HRV檢測";
  }

  showButton.value = true; // 確保按鈕顯示
});

const parseTime = (timeString) => {
  // 解析 oriStartTime 和 oriEndTime 为时间戳
  return new Date(
    timeString.substring(0, 4) +
      "/" +
      timeString.substring(4, 6) +
      "/" +
      timeString.substring(6, 8) +
      " " +
      timeString.substring(8, 10) +
      ":" +
      timeString.substring(10, 12) +
      ":" +
      timeString.substring(12)
  ).getTime();
};

const buttonStyle = computed(() => {
  if (!isCounting.value) return { backgroundColor: "#74BC1F", color: "#fff" };
  if (isPaused.value) return { backgroundColor: "#74BC1F", color: "#fff" };
  return { backgroundColor: "#EC4F4F", color: "#fff" };
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
</style>
