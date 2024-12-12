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
  hasBeforeDetect: {
    type: Boolean,
  },
  hasDetectRecord: {
    type: Boolean,
  },
  todayUseRecord: {
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
      useEndAPI();
      showButton.value = true;
    } else {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const toggleTimer = async () => {
  if (buttonText.value === "HRV檢測") {
    if (!UID.value) {
      // 如果尚未開始，進行 HRV 檢測初始化
      const response = await useStartAPI(); // 呼叫 API 開始檢測
      if (response && UID.value) {
        // 設置 Pinia store 狀態
        store.detectFlag = "1"; // 更新檢測標記
        store.detectUID = UID.value; // 保存檢測 UID
        store.detectForm = props.productName; // 保存產品名稱
        store.showHRVAlert = true; // 顯示 HRV 提示框

        // 保存初始化時間到 localStorage
        const now = Date.now();
        setLocalStorage(getProductStorageKey("startTime"), now);
        setLocalStorage(getProductStorageKey("UID"), UID.value);

        // 更新按鈕文字，等待倒數計時
        buttonText.value = "暫停";
        return;
      }
    }
  } else if (buttonText.value === "繼續") {
    await usePauseEndAPI();
    resumeTimer();
  } else if (buttonText.value === "暫停") {
    await usePauseAPI();
    pauseTimer();
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
  const savedUID = getLocalStorage(getProductStorageKey("UID"));
  const savedStartTime = getLocalStorage(getProductStorageKey("startTime"));
  if (savedUID && savedStartTime) {
    UID.value = savedUID;
    startTime.value = savedStartTime;
    remainingTime.value =
      props.totalTime - Math.floor((Date.now() - savedStartTime) / 1000); // 恢復剩餘時間
    if (remainingTime.value > 0) {
      countdown(); // 繼續倒數
      buttonText.value = "暫停";
    } else {
      buttonText.value = "HRV檢測";
    }
  }
});

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
