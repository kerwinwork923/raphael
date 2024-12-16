<template>
  <div class="progress-container">
    <div class="progress-border">
      <div class="content">{{ formattedTime }}</div>
    </div>

    <div v-if="hasDetectRecord" class="completion-message">感謝您的使用</div>
    <div v-if="hasDetectRecord" class="completion-delayMessage">
      ※ 請於隔天後再使用
    </div>
    <div class="timerButtonGroup">
      <!-- 主按鈕 (HRV檢測、暫停、繼續) -->
      <button
        v-if="showButton"
        :disabled="!isButtonEnabled"
        :style="buttonStyle"
        @click="toggleTimer"
      >
        {{ buttonText }}
      </button>

      <!-- 結束按鈕 -->
      <button
        v-if="isCounting || isPaused"
        :style="endButtonStyle"
        :disabled="!isButtonEnabled"
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
const buttonText = ref("HRV檢測(使用前)"); // 按鈕文字
const isButtonEnabled = ref(true);
const UID = ref(null);
const BID = ref(null);

const showButton = computed(() => {
  return !props.hasDetectRecord; // 如果未檢測記錄則顯示按鈕
});

const endButtonStyle = computed(() => {
  return isButtonEnabled.value
    ? { backgroundColor: "#1FBCB3", color: "#fff" } // 藍綠色 (結束)
    : { backgroundColor: "#E0E0E0", color: "#000", cursor: "not-allowed" }; // 灰色 (已結束)
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
  isCounting.value = true;
  isPaused.value = false;
  buttonText.value = "暫停";

  timerInterval.value = setInterval(() => {
    elapsedTime.value++;
  }, 1000);
};

const pauseTimer = () => {
  isPaused.value = true;
  isCounting.value = false;
  clearInterval(timerInterval.value);
  buttonText.value = "繼續";
};

const resumeTimer = () => {
  isPaused.value = false;
  isCounting.value = true;
  buttonText.value = "暫停";

  timerInterval.value = setInterval(() => {
    elapsedTime.value++;
  }, 1000);
};

const stopTimer = async () => {
  clearInterval(timerInterval.value); // 停止計時
  isCounting.value = false;
  isPaused.value = false;
  isButtonEnabled.value = false; // 禁用按鈕

  try {
    await useEndAPI(); // 調用結束 API
    console.log("計時已結束，API 調用成功");
  } catch (error) {
    console.error("結束 API 調用失敗:", error);
  }

  elapsedTime.value = 0; // 重置時間
  buttonText.value = "HRV檢測(後)"; // 更新按鈕文字
};

const apiRequest = async (url, payload) => {
  try {
    const response = await axios.post(url, payload);
    console.log(`API ${url} 回應:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`API ${url} 請求失敗:`, error);
    throw error;
  }
};

const toggleTimer = async () => {
  if (buttonText.value === "HRV檢測") {
    console.log("開始 HRV 檢測");
    await useStartAPI(); // 調用開始 API
    startTimer();
  } else if (buttonText.value === "暫停") {
    console.log("暫停計時");
    await usePauseAPI(); // 調用暫停 API
    pauseTimer();
  } else if (buttonText.value === "繼續") {
    console.log("恢復計時");
    await usePauseEndAPI(); // 調用恢復 API
    resumeTimer();
  } else if (buttonText.value === "HRV檢測(後)") {
    console.log("結束 HRV 檢測");
    stopTimer();
  }
};

const useStartAPI = async () => {
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_UseStart.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );
    if (response?.UID) {
      UID.value = response.UID; // 保存 UID
      console.log("開始 API 調用成功，UID:", UID.value);
    } else {
      console.error("開始 API 未返回有效的 UID");
    }
    return response;
  } catch (error) {
    console.error("開始 API 調用失敗:", error);
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
  if (buttonText.value === "HRV檢測(使用前)") {
    return { backgroundColor: "#74BC1F", color: "#fff" }; // 綠色 (HRV檢測、繼續)
  } else if (buttonText.value === "暫停") {
    return { backgroundColor: "#EC4F4F", color: "#fff" }; // 紅色 (暫停)
  } else if (buttonText.value === "繼續") {
    return { backgroundColor: "#74BC1F", color: "#fff" }; // 紅色 (暫停)
  } else if (buttonText.value === "HRV檢測(使用後)") {
    return { backgroundColor: "#E0E0E0", color: "#000" }; // 灰色 (已結束)
  }
  return {};
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
