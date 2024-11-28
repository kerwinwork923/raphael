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
      ※ 請於24小時後再使用
    </div>
    <button :style="buttonStyle" @click="toggleTimer">
      {{ isCounting ? (isPaused ? "繼續" : "暫停") : "開始" }}
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
    default: 60,
  },
  productName: {
    type: String,
  },
});

// Router
const router = useRouter();

// 驗證 LocalStorage 資料
const localData = localStorage.getItem("userData");
const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

if (!MID || !Token || !MAID || !Mobile) {
  router.push("/");
}

const remainingTime = ref(props.totalTime);
const isCounting = ref(false);
const isPaused = ref(false);
const showMessage = ref(false);
const UID = ref(""); // 保存 UID
const BID = ref(""); // 保存 BID
let startTime = ref(0);
let elapsedTime = ref(0);

// 計算進度條樣式
const progressStyle = computed(() => {
  const progress =
    ((props.totalTime - remainingTime.value) / props.totalTime) * 100;
  return {
    background: `conic-gradient(
        #74BC1F 0% ${progress}%, 
        #e0e0e0 ${progress}% 100%
      )`,
    transition:
      isCounting.value && !isPaused.value ? "none" : "background 1s ease-out",
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

// 按鈕樣式
const buttonStyle = computed(() => {
  if (!isCounting.value) {
    return {
      backgroundColor: "#74bc1f",
    };
  }
  return {
    backgroundColor: isPaused.value ? "#74bc1f" : "#ec4f4f",
  };
});

// API Methods
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
      ProductName: productName,
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

// 方法
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
  showMessage.value = false;
  startTime.value = Date.now();
  elapsedTime.value = 0;
  await useStartAPI();
  if (!UID.value) return; 
  countdown();
  saveTimerState();
};

const pauseTimer = async () => {
  if (!UID.value) {

    return;
  }
  isPaused.value = true;
  elapsedTime.value = (Date.now() - startTime.value) / 1000;
  await usePauseAPI();
  saveTimerState();
};

const resumeTimer = async () => {
  if (!UID.value || !BID.value) {
    console.error("UID 或 BID 不存在，無法繼續！");
    return;
  }
  isPaused.value = false;
  startTime.value = Date.now() - elapsedTime.value * 1000;
  await usePauseEndAPI();
  countdown();
  saveTimerState();
};

const countdown = () => {
  const update = () => {
    if (isPaused.value) return;

    const elapsedTimeSinceStart = (Date.now() - startTime.value) / 1000;
    remainingTime.value = Math.max(
      props.totalTime - elapsedTimeSinceStart - elapsedTime.value,
      0
    );

    if (remainingTime.value <= 0) {
      isCounting.value = false;
      remainingTime.value = 0;
      showMessage.value = true;
      useEndAPI(); // 倒數結束時呼叫 API
      return;
    }

    requestAnimationFrame(update);
  };

  update();
};

const saveTimerState = () => {
  const state = {
    isCounting: isCounting.value,
    isPaused: isPaused.value,
    remainingTime: remainingTime.value,
    startTime: startTime.value,
    elapsedTime: elapsedTime.value,
    UID: UID.value,
    BID: BID.value,
  };
  localStorage.setItem("timerState", JSON.stringify(state));
};

const loadTimerState = () => {
  const savedState = localStorage.getItem("timerState");
  if (savedState) {
    const state = JSON.parse(savedState);
    isCounting.value = state.isCounting;
    isPaused.value = state.isPaused;
    remainingTime.value = state.remainingTime;
    startTime.value = state.startTime;
    elapsedTime.value = state.elapsedTime;
    UID.value = state.UID;
    BID.value = state.BID;
  }
};

onMounted(() => {
  loadTimerState();
  if (isCounting.value && !isPaused.value) {
    countdown();
  }
});
</script>

<style scoped>
.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background-color: rgb(246, 246, 246);
}

.progress-border {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.progress-border .timeDot {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: scale(0.9);
}

.content {
  width: 120px;
  height: 120px;
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
