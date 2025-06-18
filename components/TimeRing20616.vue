<template>
  <div class="progress-container">
    <!-- ====== 計時圈 ====== -->
    <div class="progress-border" :style="{ background: progressGradient }">
      <div class="content">{{ formattedTime }}</div>
    </div>

    <!-- ====== 按鈕群組 ====== -->
    <div class="timerButtonGroup">
      <button :style="buttonStyle" @click="toggleTimer">
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

// ========== 參數與 props ==========
const props = defineProps({
  productName: {
    type: String,
  }
});

const router = useRouter();
const isButtonDisabled = ref(false);

// ---------------------------------------------------
// 1) elapsedTime: 維持顯示「已經過幾秒」
// 2) startTimestamp: 用來記錄「開始計時當下的毫秒數」
// ---------------------------------------------------
const elapsedTime = ref(0); // 用來顯示：已經經過多少「秒」
const startTimestamp = ref(null); // 「開始計時」的時間戳 (ms)

// 控制計時狀態 ( 是否在計時中 )
const isCounting = ref(false);

const DetectionState = {
  BEFORE: "before", // 檢測前
  RUNNING: "running", // 計時中
};
const currentDetectionState = ref(DetectionState.BEFORE);

const buttonText = computed(() => {
  switch (currentDetectionState.value) {
    case DetectionState.BEFORE:
      return "開始紀錄";
    case DetectionState.RUNNING:
      return "結束紀錄";
    default:
      return "未知狀態";
  }
});

// 顯示用時間格式，例如 "01:05:09"
const formattedTime = computed(() => {
  const hours = Math.floor(elapsedTime.value / 3600);
  const minutes = Math.floor((elapsedTime.value % 3600) / 60);
  const seconds = elapsedTime.value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
});

// UID / BID / Store ...
const UID = ref(null);
const BID = ref(null);

// 按鈕樣式
const buttonStyle = computed(() => {
  switch (currentDetectionState.value) {
    case DetectionState.BEFORE: // 綠色(開始)
      return { backgroundColor: "#74BC1F", color: "#fff" };
    case DetectionState.RUNNING: // 藍色(結束)
      return { backgroundColor: "#1FBCB3", color: "#fff" };
    default: // 灰色(預設)
      return { backgroundColor: "#E0E0E0", color: "#000" };
  }
});

// 取出 LocalStorage
const localData = localStorage.getItem("userData");
const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};
if (!MID || !Token || !MAID || !Mobile) {
  router.push("/");
}

// ---------------------------------------------------
// 主要計時器 Interval，
// 用來每秒更新 elapsedTime
// ---------------------------------------------------
const timerInterval = ref(null);

// ---------------------- startTimer ----------------------
const startTimer = () => {
  if (timerInterval.value) {
    console.log("⏳ 計時器已經啟動，不重複啟動");
    return;
  }

  if (!startTimestamp.value) {
    console.warn("⚠️ startTimestamp 為空，無法啟動計時器");
    return;
  }

  console.log(
    "🚀 計時開始，startTimestamp =",
    new Date(startTimestamp.value).toLocaleString()
  );

  if (currentDetectionState.value !== DetectionState.RUNNING) {
    console.log("🔄 修正 currentDetectionState 為 RUNNING");
    currentDetectionState.value = DetectionState.RUNNING;
  }

  timerInterval.value = setInterval(() => {
    const now = Date.now();
    elapsedTime.value = Math.floor((now - startTimestamp.value) / 1000);
    console.log("⏳ 計時中，已過時間：", elapsedTime.value, "秒");
  }, 1000);
};

// ---------------------- stopTimer ----------------------
const stopTimer = async () => {
  console.log("⏹ 停止計時器");

  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
  isCounting.value = false;

  try {
    await useEndAPI();
    console.log("✅ 計時已結束，API 調用成功");
    router.go(0);
  } catch (error) {
    console.error("❌ 結束 API 調用失敗：", error);
  }
};

// ---------- 切換按鈕行為 ----------
const toggleTimer = async () => {
  if (isButtonDisabled.value) return;
  isButtonDisabled.value = true;
  try {
    switch (currentDetectionState.value) {
      case DetectionState.BEFORE:
        if (!UID.value) {
          const response = await useStartAPI();
          if (response?.UID) {
            startTimestamp.value = Date.now();
            startTimer();
          } else {
            console.error("創建 UID 失敗");
          }
        } else {
          console.log("已有 UID，從 API 時間開始");
          const response = await API_MID_ProductName_UIDInfo();
          if (response?.StartTime) {
            startTimestamp.value = new Date(
              `${response.StartTime.slice(0, 4)}-${response.StartTime.slice(
                4,
                6
              )}-${response.StartTime.slice(6, 8)}T${response.StartTime.slice(
                8,
                10
              )}:${response.StartTime.slice(10, 12)}:${response.StartTime.slice(
                12
              )}`
            ).getTime();
            elapsedTime.value = Math.floor(
              (Date.now() - startTimestamp.value) / 1000
            );
          } else {
            startTimestamp.value = Date.now();
            console.warn("舊的 UID 可能已失效，創建新的 UID");
            const newResponse = await useStartAPI();
            if (newResponse?.UID) {
              startTimestamp.value = Date.now();
              startTimer();
            } else {
              console.error("創建 UID 失敗");
              return;
            }
          }
          startTimer();
        }
        break;

      case DetectionState.RUNNING:
        console.log("結束計時");
        await stopTimer();
        break;

      default:
        console.error("未知檢測狀態");
    }
  } finally {
    isButtonDisabled.value = false;
  }
};

// ---------------------------------------------------
// 封裝呼叫後端 API
// ---------------------------------------------------
const apiRequest = async (url, payload) => {
  try {
    const response = await axios.post(url, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const API_MID_ProductName_UIDInfo = async () => {
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_MID_ProductName_UIDInfo.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );
    console.log("📡 API_MID_ProductName_UIDInfo 回應:", response);

    if (response?.Result !== "OK") {
      console.error("❌ 無法獲取有效的 UID 資訊：", response);
      return null;
    }

    const UIDResponse = response.UID;
    if (!UIDResponse) {
      console.warn("⚠️ UID 為 null，無法繼續後續操作");
      return null;
    }

    if (response.StartTime) {
      const startTime = new Date(
        `${response.StartTime.slice(0, 4)}-${response.StartTime.slice(
          4,
          6
        )}-${response.StartTime.slice(6, 8)}T${response.StartTime.slice(
          8,
          10
        )}:${response.StartTime.slice(10, 12)}:${response.StartTime.slice(12)}`
      ).getTime();
      startTimestamp.value = startTime;
      const now = Date.now();
      elapsedTime.value = Math.floor((now - startTime) / 1000);
      console.log(
        `⏳ StartTime 設定為: ${new Date(
          startTimestamp.value
        ).toLocaleString()}`
      );
      console.log(`⏳ 經過時間計算結果: ${elapsedTime.value} 秒`);
      return response;
    } else {
      console.warn("⚠️ 無法解析 StartTime，可能後端沒有返回");
    }
  } catch (error) {
    console.error("❌ API 調用失敗：", error);
  }
  return null;
};

const useStartAPI = async () => {
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_UseStart.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );
    if (response?.UID) {
      UID.value = response.UID;
      console.log("成功創建新的 UID：", UID.value);
    } else {
      console.error("創建新的 UID 失敗，請檢查 API 響應");
    }
    return response;
  } catch (error) {
    console.error("創建新的 UID API 調用失敗：", error);
    return null;
  }
};

const useEndAPI = async (endTime = "") => {
  if (!UID.value) {
    console.error("無法結束，因為 UID 不存在");
    return;
  }

  const payload = {
    MID,
    Token,
    MAID,
    Mobile,
    UID: UID.value,
    EndTime: endTime || "",
  };

  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_UseEnd.jsp",
      payload
    );
    console.log("結束 API 調用成功", response);
  } catch (error) {
    console.error("結束 API 調用失敗:", error);
  }
};

// ---------------------- onMounted ----------------------
onMounted(async () => {
  BID.value = null;
  console.log("🔍 onMounted 啟動，開始初始化...");

  try {
    const response = await API_MID_ProductName_UIDInfo();

    if (response) {
      UID.value = response.UID;
      console.log("✅ 成功獲取有效的 UID：", UID.value);
      currentDetectionState.value = DetectionState.RUNNING;

      if (response.StartTime) {
        console.log("⏳ 獲取 StartTime，恢復計時...");
        startTimestamp.value = new Date(
          `${response.StartTime.slice(0, 4)}-${response.StartTime.slice(
            4,
            6
          )}-${response.StartTime.slice(6, 8)}T${response.StartTime.slice(
            8,
            10
          )}:${response.StartTime.slice(10, 12)}:${response.StartTime.slice(
            12
          )}`
        ).getTime();

        const now = Date.now();
        elapsedTime.value = Math.floor((now - startTimestamp.value) / 1000);

        console.log(
          `⏳ StartTime 設定為: ${new Date(
            startTimestamp.value
          ).toLocaleString()}`
        );
        console.log(`⏳ 計時器恢復，已過時間: ${elapsedTime.value} 秒`);

        if (elapsedTime.value > 0) {
          console.log("🔄 自動切換至 RUNNING 狀態");
          currentDetectionState.value = DetectionState.RUNNING;
          startTimer();
        }
      } else {
        console.warn("⚠️ StartTime 不存在，計時器將從 0 開始");
      }
    } else {
      console.warn("❌ 無法獲取使用者資料");
      elapsedTime.value = 0;
    }
  } catch (error) {
    console.error("❌ 初始化失敗：", error);
  }
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
  transition: all 0.3s ease;
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

.timerButtonGroup {
  display: flex;
  gap: 16px;
}

.timerButtonGroup button:disabled {
  background-color: #d0d0d0 !important;
}
</style>
