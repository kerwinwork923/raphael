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
    <div v-if="showMessage" class="completion-message">感謝您的使用</div>
    <div v-if="showMessage" class="completion-delayMessage">
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
});

// Router
const router = useRouter();

// 動態生成 Cookie 鍵名
const getProductCookieKey = (key) => `${props.productName}_${key}`;

// Cookie 操作方法
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

const setCookie = (name, value, days = 1) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; expires=${expires}`;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

// 驗證 LocalStorage 資料
const localData = localStorage.getItem("userData");
const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

if (!MID || !Token || !MAID || !Mobile) {
  router.push("/");
}

const ThisStartBtnActive = ref(props.startBtnActive);

watch(
  () => props.startBtnActive,
  (newValue) => {
    ThisStartBtnActive.value = newValue;
  }
);

watch(
  () => props.showMessageProp,
  (newVal) => {
    showMessage.value = newVal;
  }
);

const remainingTime = ref(props.totalTime);
const isCounting = ref(false);
const isPaused = ref(false);
const showMessage = ref(false);

const UID = ref(""); // 保存 UID
const BID = ref(""); // 保存 BID
let startTime = ref(0); // 開始時間（毫秒）
let elapsedTime = ref(0); // 已經過時間（秒）
import { useCommon } from "../stores/common";

const store = useCommon();
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

// 保存計時器狀態到動態 Cookie
const saveTimerState = () => {
  const now = Date.now();
  const timerState = {
    remainingTime: remainingTime.value,
    elapsedTime: elapsedTime.value,
    startTime: isPaused.value ? null : now, // 暫停時，開始時間應為 null
    isPaused: isPaused.value,
    isCounting: isCounting.value,
    UID: UID.value,
    BID: BID.value,
  };

  // 保存到 Cookie
  try {
    setCookie(getProductCookieKey("timerState"), JSON.stringify(timerState), 1);
  } catch (error) {
    console.error("保存計時器狀態到 Cookie 時失敗：", error);
  }
};

// 從動態 Cookie 加載計時器狀態
const loadTimerState = () => {
  const savedState = getCookie(getProductCookieKey("timerState"));
  if (savedState) {
    try {
      const timerState = JSON.parse(savedState);
      remainingTime.value = timerState.remainingTime || props.totalTime;
      elapsedTime.value = timerState.elapsedTime || 0;
      startTime.value = timerState.startTime || 0;
      isPaused.value = timerState.isPaused || false;
      isCounting.value = timerState.isCounting || false;
      UID.value = timerState.UID || "";
      BID.value = timerState.BID || "";

      // 如果是暫停狀態，計算當前剩餘時間
      if (isPaused.value) {
        console.log("暫停狀態載入成功");
      } else if (startTime.value) {
        const now = Date.now();
        const elapsedSinceStart = (now - startTime.value) / 1000;
        remainingTime.value = Math.max(
          props.totalTime - elapsedTime.value - elapsedSinceStart,
          0
        );
      }
    } catch (error) {
      console.error("無法解析計時器狀態：", error);
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

const useStartAPI = async () => {
  const response = await apiRequest(
    "https://23700999.com:8081/HMA/API_UseStart.jsp",
    {
      MID,
      Token,
      MAID,
      Mobile,
      ProductName: props.productName,
    }
  );
  if (response && response.UID) {
    UID.value = response.UID;
    store.detectFlag = "1";
    store.detectUID = response.UID;
    store.detectForm = props.productName;
    store.showHRVAlert = true;
  } else {
    console.error("無法取得 UID，請檢查 API 回應");
  }
};

const usePauseAPI = async () => {
  const response = await apiRequest(
    "https://23700999.com:8081/HMA/API_UsePauseStart.jsp",
    {
      MID,
      Token,
      MAID,
      Mobile,
      UID: UID.value,
    }
  );
  if (response && response.BID) {
    BID.value = response.BID; // 儲存 BID
  } else {
    console.error("無法取得 BID，請檢查 API 回應");
  }
};

const usePauseEndAPI = async () => {
  if (!BID.value) {
    console.error("BID 不存在，無法繼續計時！");
    return;
  }
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
  if (!UID.value) {
    console.error("UID 不存在，無法結束計時！");
    return;
  }
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

const emit = defineEmits(["countdownComplete"]);

const countdown = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

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
      remainingTime.value = 0;
      showMessage.value = true; // 顯示「感謝您的使用」
      showButton.value = false; // 隱藏按鈕
      emit("countdownComplete");
      useEndAPI();
    } else {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const buttonText = ref("HRV檢測"); // 按鈕文字
const isHRVCheckComplete = ref(false); // HRV 檢測是否完成

const showButton = ref(false);

const toggleTimer = async () => {
  if (buttonText.value === "HRV檢測") {
    await useStartAPI(); // 執行 HRV 檢測
    buttonText.value = "開始"; // 更新按鈕為開始
    return;
  }

  if (buttonText.value === "開始") {
    startTimer();
  } else if (buttonText.value === "暫停") {
    pauseTimer();
  } else if (buttonText.value === "繼續") {
    resumeTimer();
  }
};

const startTimer = async () => {
  if (!UID.value) {
    isCounting.value = true;
    isPaused.value = true; // 暫停計時器
    await useStartAPI();
    emit("requireHRVCheck"); // 通知父組件顯示 HRV 檢測
    saveTimerState(); // 儲存當前狀態
    return;
  }

  // 正常計時邏輯
  isCounting.value = true;
  isPaused.value = false;
  startTime.value = Date.now();
  elapsedTime.value = 0;
  buttonText.value = "暫停"; // 更新按鈕為暫停
  countdown();
  saveTimerState();
};

const checkHRVAndUpdateButton = async () => {
  const response = await apiRequest(
    "https://23700999.com:8081/HMA/API_HRV2.jsp",
    { MID, Token, MAID, Mobile }
  );

  if (response && response.Result === "OK") {
    const now = new Date();
    const resetTime = calculateResetTime(now);

    // 檢查是否已使用過
    const alreadyUsed = response.HRV2.some((record) => {
      const recordTime = new Date(record.CheckTime);
      return (
        record.Flag === "2" &&
        record.UID === UID.value &&
        record.ProductName === props.productName &&
        recordTime >= resetTime
      );
    });

    if (alreadyUsed) {
      showMessage.value = true; // 顯示「感謝您的使用」
      showButton.value = false; // 隱藏按鈕
      return;
    }

    // 如果沒有使用過，顯示按鈕
    showButton.value = true;
  }
};

const getProductInfo = async (UID) => {
  const response = await apiRequest(
    "https://23700999.com:8081/HMA/API_UIDInfo.jsp",
    { MID, Token, MAID, Mobile, UID }
  );
  return response && response.Result === "OK" ? response : null;
};

const pauseTimer = async () => {
  if (!UID.value) {
    console.error("UID 不存在，無法暫停！");
    return;
  }

  // 更新暫停狀態
  isPaused.value = true;
  elapsedTime.value += (Date.now() - startTime.value) / 1000; // 累計已經過的時間
  startTime.value = null; // 清空開始時間
  buttonText.value = "繼續"; // 更新按鈕文字

  // 調用 API 保存暫停狀態
  try {
    await usePauseAPI();
  } catch (error) {
    console.error("暫停時保存失敗：", error);
  }

  // 更新暫停狀態到 Cookie
  saveTimerState();
};

const resumeTimer = async () => {
  if (!UID.value || !BID.value) {
    console.error("UID 或 BID 不存在，無法繼續！");
    return;
  }
  isPaused.value = false;
  startTime.value = Date.now();
  buttonText.value = "暫停"; // 更新按鈕為暫停
  countdown();
  saveTimerState();
};
const calculateResetTime = (currentTime) => {
  const resetTime = new Date(currentTime);
  resetTime.setHours(5, 0, 0, 0); // 設定時間為今日凌晨5點
  if (currentTime < resetTime) {
    // 如果當前時間小於今日凌晨5點，則取前一天的凌晨5點
    resetTime.setDate(resetTime.getDate() - 1);
  }
  return resetTime;
};

// 初始化
onMounted(async () => {
  loadTimerState();

  // 檢查 HRV 狀態，更新按鈕文字及是否已使用
  await checkHRVAndUpdateButton();

  if (!isPaused.value && startTime.value) {
    const now = Date.now();
    const elapsedSinceStart = (now - startTime.value) / 1000;
    remainingTime.value = Math.max(
      props.totalTime - elapsedTime.value - elapsedSinceStart,
      0
    );
  }

  if (remainingTime.value <= 0) {
    showMessage.value = true;
    remainingTime.value = 0;
  } else if (isCounting.value && !isPaused.value) {
    countdown(); // 繼續倒數
  }
});

const buttonStyle = computed(() => {
  if (!isCounting.value) {
    // 開始狀態
    return {
      backgroundColor: "#74BC1F", // 綠色
      color: "#fff",
    };
  }

  if (isPaused.value) {
    // 暫停狀態
    return {
      backgroundColor: "#74BC1F", // 橙色
      color: "#fff",
    };
  }

  // 繼續狀態
  return {
    backgroundColor: "#EC4F4F", // 紅色
    color: "#fff",
  };
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
