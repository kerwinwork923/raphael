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
  () => props.hasDetectRecord,
  (newVal) => {
    clearInterval(timerInterval);
    isCounting.value = false;
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
    store.detectFlag = "1"; // 設置 HRV 檢測進行中標記
    store.detectUID = response.UID; // 設置檢測 UID
    store.detectForm = props.productName; // 設置產品名稱
    store.showHRVAlert = true; // 顯示 HRV 檢測提示框

    buttonText.value = "開始"; // 更新按鈕文字
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
      showButton.value = true; // 再次顯示 HRV 檢測按鈕
      buttonText.value = "HRV檢測";
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
    // 執行 HRV 檢測邏輯
    const uid = props.todayUseRecord[0]?.UID; // 假設 `useStartAPI` 返回 UID
    if (uid != "" && uid != undefined) {
      // 更新 Pinia store 並顯示提示框
      store.detectFlag = "2";
      store.detectUID = uid;
      store.detectForm = props.productName;
      store.showHRVAlert = true; // 顯示提示框
      console.log("HRV 提示框已啟動，UID:", uid);
    } else {
      startTimer();
    }
  } else if (buttonText.value === "繼續") {
    startTimer(); // 開始倒數計時
  } else if (buttonText.value === "暫停") {
    pauseTimer(); // 暫停計時
  }
};

const startTimer = async () => {
  if (UID.value) {
    isCounting.value = true;
    isPaused.value = false;
    startTime.value = Date.now();
    buttonText.value = "暫停"; // 更新按鈕為「暫停」
    countdown(); // 開始倒計時
    return;
  }

  // 如果沒有 UID，先進行 HRV 檢測
  await useStartAPI();
};

const checkHRVCompletion = async () => {
  const response = await apiRequest(
    "https://23700999.com:8081/HMA/API_HRV2.jsp",
    { MID, Token, MAID, Mobile }
  );

  if (response && response.Result === "OK") {
    const now = new Date();
    const resetTime = calculateResetTime(now);

    // 查找當日 Flag: 1 的紀錄
    const flag1Records = response.HRV2.filter((record) => {
      const recordTime = new Date(record.CheckTime);
      return record.Flag === "1" && recordTime >= resetTime;
    });

    for (const record of flag1Records) {
      const productInfo = await getProductInfo(record.UID);

      if (
        productInfo &&
        productInfo.Result === "OK" &&
        productInfo.ProductName === props.productName
      ) {
        UID.value = record.UID;

        // 查找當日 Flag: 2 並且 UID 相同的紀錄
        const hasMatchingFlag2 = response.HRV2.some((record) => {
          const recordTime = new Date(record.CheckTime);
          return (
            record.Flag === "2" &&
            record.UID === UID.value &&
            recordTime >= resetTime
          );
        });

        if (hasMatchingFlag2) {
          // 如果找到匹配的 Flag: 2，顯示感謝訊息並隱藏按鈕
          showMessage.value = true;
          showButton.value = false;
          return;
        }

        // 如果只有 Flag: 1，顯示繼續按鈕
        if (props.todayUseRecord.length > 0) {
          // 檢查是否已完成 HRV 檢測
          buttonText.value = "HRV檢測"; // 顯示 HRV 檢測按鈕
          showButton.value = true;

          return;
        }
        buttonText.value = "繼續";
        showButton.value = true;
        return;
      }
    }
  }

  // 如果無法完成條件，保持按鈕顯示 HRV 檢測
  buttonText.value = "HRV檢測";
  showButton.value = true;
};

const getProductInfo = async (UID) => {
  const response = await apiRequest(
    "https://23700999.com:8081/HMA/API_UIDInfo.jsp",
    { MID, Token, MAID, Mobile, UID }
  );

  if (response && response.Result === "OK") {
    return {
      Result: response.Result,
      ProductName: response.ProductName, // 確保返回產品名稱
    };
  } else {
    console.error("無法取得產品資訊，請檢查 UID 或 API 回應。");
    return null;
  }
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
  resetTime.setHours(5, 0, 0, 0); // 設定時間為今日凌晨 5 點
  if (currentTime < resetTime) {
    // 如果當前時間小於今日凌晨 5 點，則取前一天的凌晨 5 點
    resetTime.setDate(resetTime.getDate() - 1);
  }
  return resetTime;
};

// 檢查 HRV 狀態並更新按鈕
const checkHRVAndUpdateButton = async () => {
  const response = await apiRequest(
    "https://23700999.com:8081/HMA/API_HRV2.jsp",
    {
      MID: store.MID,
      Token: store.Token,
      MAID: store.MAID,
      Mobile: store.Mobile,
    }
  );

  if (response && response.Result === "OK") {
    const now = new Date();
    const resetTime = calculateResetTime(now);

    // 查找 Flag 為 1 的紀錄
    const flag1Records = response.HRV2.filter((record) => {
      const recordTime = new Date(record.CheckTime);
      return (
        record.Flag === "1" &&
        recordTime >= resetTime &&
        record.ProductName === props.productName
      );
    });

    // 查找 Flag 為 2 的紀錄
    const flag2Records = response.HRV2.filter((record) => {
      const recordTime = new Date(record.CheckTime);
      return (
        record.Flag === "2" &&
        recordTime >= resetTime &&
        record.ProductName === props.productName
      );
    });

    if (flag1Records.length > 0) {
      // 只要有 Flag: 1 紀錄
      UID.value = flag1Records[0].UID; // 設定 UID
      buttonText.value = "繼續"; // 更新按鈕狀態
      showButton.value = true;

      // 如果有 Flag: 2 的紀錄
      if (flag2Records.length > 0) {
        showMessage.value = true; // 顯示感謝訊息
        showButton.value = false; // 隱藏按鈕
        return;
      }

      return; // 結束檢查，按鈕設為「繼續」
    }
  }

  // 如果沒有符合條件的紀錄，顯示 HRV 檢測
  buttonText.value = "HRV檢測";
  showButton.value = true;
};

// 初始化
onMounted(async () => {
  loadTimerState();

  // 如果有使用記錄
  // if (props.todayUseRecord.length > 0) {
  //   // 檢查是否已完成 HRV 檢測

  //   buttonText.value = "HRV檢測"; // 顯示 HRV 檢測按鈕
  //   showButton.value = true;
  // }

  await checkHRVCompletion(); // 檢查是否需要顯示繼續按鈕或其他狀態

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
