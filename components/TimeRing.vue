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
      v-if="showButton"
      :disabled="!isButtonEnabled"
      :style="buttonStyle"
      @click="toggleTimer"
    >
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
    if (newVal) {
      console.log("检测记录存在，隐藏按钮");
      showButton.value = false; // 隐藏按钮
    }
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
const isButtonEnabled = ref(true);

const UID = ref(""); // 保存 UID
const BID = ref(""); // 保存 BID
let startTime = ref(0); // 開始時間（毫秒）
let elapsedTime = ref(0); // 已經過時間（秒）

import { useCommon } from "../stores/common";
const store = useCommon();

const buttonText = ref("HRV檢測"); // 按鈕文字
const showButton = computed(() => {
  if (props.hasDetectRecord) {
    return false; // 如果已经检测完成，始终隐藏按钮
  }
  return true; // 其他情况根据逻辑显示
});

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
  setLocalStorage(getProductStorageKey("startTime"), now);
  setLocalStorage(getProductStorageKey("UID"), UID.value);
};
const clearHRVState = () => {
  deleteLocalStorage(getProductStorageKey("startTime"));
  deleteLocalStorage(getProductStorageKey("UID"));
};

const useStartAPI = async () => {
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_UseStart.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );
    console.log("useStartAPI 回應:", response);
    UID.value = response.UID;
    return response;
  } catch (error) {
    console.error("useStartAPI 請求失敗:", error);
    return null;
  }
};

const usePauseAPI = async () => {
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_UsePauseStart.jsp",
      { MID, Token, MAID, Mobile, UID: UID.value }
    );
    if (response && response.BID) {
      BID.value = response.BID;
      console.log("暫停API調用成功", response);
    }
  } catch (error) {
    console.error("暫停API調用失敗", error);
  }
};

const usePauseEndAPI = async () => {
  if (!BID.value) {
    console.error("無法恢復，因為 BID 不存在");
    return;
  }
  try {
    await apiRequest("https://23700999.com:8081/HMA/API_UsePauseEnd.jsp", {
      MID,
      Token,
      MAID,
      Mobile,
      UID: UID.value,
      BID: BID.value,
    });
    console.log("恢復API調用成功");
  } catch (error) {
    console.error("恢復API調用失敗", error);
  }
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

  clearHRVState(); // 清除檢測紀錄
  showButton.value = true; // 確保按鈕在檢測完成後顯示
};

// 計時器邏輯
let timerInterval;

const countdown = () => {
  if (timerInterval) clearInterval(timerInterval);

  let lastCheckTime = Date.now(); // 記錄最後一次檢查時間

  const tick = async () => {
    if (isPaused.value) return;

    const now = Date.now();

    // 每分鐘檢查一次 `isFirstHRVDetect`
    if (now - lastCheckTime >= 60 * 1000) {
      lastCheckTime = now;

      const isFirstHRVDetect = getLocalStorage(`${props.productName}_isFirstHRVDetect`);
      
      // 檢查 `isFirstHRVDetect`
      if (!isFirstHRVDetect) {
        console.log(`未檢測到 ${props.productName}_isFirstHRVDetect，清除 localStorage，禁用按鈕並彈出警告框。`);

        // 清除對應的 `localStorage` 數據
        deleteLocalStorage(getProductStorageKey("UID"));
        deleteLocalStorage(getProductStorageKey("startTime"));

        // 禁用按鈕
        isButtonEnabled.value = false;

        // 彈出提示框
        alert("尚未完成 HRV 檢測，請完成檢測後再繼續！");

        // 暫停計時器
        pauseTimer();

        // 刷新頁面
        router.go(0);

        return; // 中斷倒數
      }
    }

    // 更新倒計時邏輯
    const elapsedSinceStart = (now - startTime.value) / 1000;
    remainingTime.value = Math.max(
      props.totalTime - elapsedTime.value - elapsedSinceStart,
      0
    );

    // 倒計時結束邏輯
    if (remainingTime.value <= 0) {
      clearInterval(timerInterval);
      isCounting.value = false;
      buttonText.value = "HRV檢測";
      remainingTime.value = 0;

      // 清理計時狀態
      clearHRVState();

      // 調用結束 API
      try {
        await useEndAPI();
        console.log("倒計時結束，API 調用成功。");

        // 刷新頁面
        router.go(0);
      } catch (error) {
        console.error("結束 API 調用失敗：", error);
      }

      return;
    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};




const toggleTimer = async () => {
  if (buttonText.value === "請完成 HRV 檢測") {
    console.log("檢測未完成，請先完成 HRV 檢測。");
    return;
  }

  // 如果有 todayUseRecord，直接進入檢測後邏輯
  if (props.todayUseRecord.length > 0) {
    console.log("今日已完成檢測，顯示提示框");
    store.detectFlag = "2";
    store.detectUID = props.todayUseRecord[0].UID;
    store.detectForm = `*${props.productName}`;
    store.showHRVAlert = true;
    return;
  }

  // 如果存在 UID，處理恢復或暫停邏輯
  if (UID.value) {
    console.log("已有計時 UID，恢復倒數或暫停");
    if (buttonText.value === "暫停") {
      console.log("暫停倒數");
      await usePauseAPI();
      pauseTimer();
    } else if (buttonText.value === "繼續") {
      console.log("繼續倒數");
      await usePauseEndAPI();
      resumeTimer();
    }
    return;
  }

  // 如果沒有 todayUseRecord 並且沒有計時 UID，進入檢測前邏輯
  if (Array.isArray(props.hasBeforeData) && props.hasBeforeData.length === 0) {
    console.log("檢測前開始倒數");
    const response = await useStartAPI();
    if (response && UID.value) {
      store.detectFlag = "1";
      store.detectUID = UID.value;
      store.detectForm = props.productName;
      store.showHRVAlert = true;
      const now = Date.now();
      setLocalStorage(getProductStorageKey("startTime"), now);
      setLocalStorage(getProductStorageKey("UID"), UID.value);
      startTime.value = now;
      buttonText.value = "暫停";
      startTimer();
    } else {
      console.error("開始檢測失敗");
    }
  } else {
    console.error("未知邏輯分支，無法操作");
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
  saveTimerState(); // 保存暫停狀態
};

const resumeTimer = () => {
  isPaused.value = false;
  startTime.value = Date.now();
  buttonText.value = "暫停";
  countdown();
  saveTimerState(); // 保存恢復狀態
};

onMounted(() => {
  try {
    const savedUID = getLocalStorage(getProductStorageKey("UID"));
    const savedStartTime = getLocalStorage(getProductStorageKey("startTime"));

    // 如果今日有檢測紀錄，初始化為檢測後狀態
    if (
      Array.isArray(props.todayUseRecord) &&
      props.todayUseRecord.length > 0
    ) {
      console.log("今日已檢測，初始化為檢測後狀態");
      store.detectFlag = "2";
      store.detectUID = props.todayUseRecord[0]?.UID;
      buttonText.value = "HRV檢測";
      remainingTime.value = props.totalTime;
      return;
    }

    if (savedUID) {
      console.log("檢測到已存在的計時 UID，嘗試恢復計時");
      UID.value = savedUID;

      if (savedStartTime) {
        startTime.value = savedStartTime;
        const elapsed = Math.floor((Date.now() - savedStartTime) / 1000);
        remainingTime.value = Math.max(props.totalTime - elapsed, 0);

        if (remainingTime.value > 0) {
          console.log("恢復計時，剩餘時間:", remainingTime.value);
          buttonText.value = "暫停";
          countdown();
        } else {
          console.log("計時已完成，清除狀態並重置為初始狀態");
          clearHRVState();
          buttonText.value = "HRV檢測";
          remainingTime.value = props.totalTime;
        }
      }
      return;
    }

    // 如果無歷史檢測紀錄，初始化為檢測前狀態
    if (
      Array.isArray(props.hasBeforeData) &&
      props.hasBeforeData.length === 0
    ) {
      console.log("初始化為檢測前狀態");
      store.detectFlag = "1";
      buttonText.value = "HRV檢測";
      remainingTime.value = props.totalTime;
      return;
    }
  } catch (error) {
    console.error("onMounted 初始化出錯:", error);
  }
});

const parseTime = (timeString) => {
  if (
    !timeString ||
    typeof timeString !== "string" ||
    timeString.length !== 14
  ) {
    console.error("無效的時間字符串:", timeString);
    return Date.now(); // 或其他默認值
  }

  return new Date(
    `${timeString.substring(0, 4)}/${timeString.substring(
      4,
      6
    )}/${timeString.substring(6, 8)} ` +
      `${timeString.substring(8, 10)}:${timeString.substring(
        10,
        12
      )}:${timeString.substring(12)}`
  ).getTime();
};

const buttonStyle = computed(() => {
  if (buttonText.value === "HRV檢測") {
    return { backgroundColor: "#74BC1F", color: "#fff" }; // 綠色
  } else if (buttonText.value === "暫停") {
    return { backgroundColor: "#EC4F4F", color: "#fff" }; // 紅色
  } else if (buttonText.value === "繼續") {
    return { backgroundColor: "#74BC1F", color: "#fff" }; // 綠色
  }
  return { backgroundColor: "#E0E0E0", color: "#fff" }; // 默認樣式
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
