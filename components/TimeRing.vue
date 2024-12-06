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

    <button :style="buttonStyle" @click="toggleTimer" v-if="ThisStartBtnActive">
      {{ isCounting ? (isPaused ? "繼續" : "暫停") : "開始" }}
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
  startBtnActive: {
    type: Boolean,
    default: false,
  },
  showMessageProp: {
    type: Boolean,
    default: false,
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
const showMessage = ref(props.showMessageProp);

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

const UID = ref(""); // 保存 UID
const BID = ref(""); // 保存 BID
let startTime = ref(0); // 開始時間（毫秒）
let elapsedTime = ref(0); // 已經過時間（秒）

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
    startTime: isPaused.value ? null : now, // 如果暫停，保存 null
    isPaused: isPaused.value,
    isCounting: isCounting.value,
    UID: UID.value,
    BID: BID.value,
  };
  setCookie(getProductCookieKey("timerState"), JSON.stringify(timerState), 1); // 保存為 JSON
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

      // 計算頁面載入後的剩餘時間
      if (!isPaused.value && startTime.value) {
        const now = Date.now();
        const elapsedSinceStart = (now - startTime.value) / 1000;
        remainingTime.value = Math.max(
          props.totalTime - elapsedTime.value - elapsedSinceStart,
          0
        );
      }
    } catch (error) {
      console.error("無法解析計時器狀態:", error);
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
    UID.value = response.UID; // 儲存 UID
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
      showMessage.value = true;
      useEndAPI();
      ThisStartBtnActive.value = false;
    } else {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const toggleTimer = () => {
  if (isCounting.value) {
    if (isPaused.value) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  } else {
    startTimer();
  }
};

const startTimer = async () => {
  isCounting.value = true;
  isPaused.value = false;
  startTime.value = Date.now();
  elapsedTime.value = 0;
  await useStartAPI();
  if (!UID.value) return;
  countdown();
  saveTimerState();
};

const pauseTimer = async () => {
  if (!UID.value) {
    console.error("UID 不存在，無法暫停！");
    return;
  }
  isPaused.value = true;
  elapsedTime.value += (Date.now() - startTime.value) / 1000;
  await usePauseAPI();
  saveTimerState();
};

const resumeTimer = async () => {
  if (!UID.value || !BID.value) {
    console.error("UID 或 BID 不存在，無法繼續！");
    return;
  }
  isPaused.value = false;
  startTime.value = Date.now();
  await usePauseEndAPI();
  countdown();
  saveTimerState();
};

// 初始化
onMounted(() => {
  loadTimerState();
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
    ThisStartBtnActive.value = false;
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
