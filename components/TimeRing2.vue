<template>
  <div class="progress-container">
    <!-- 動態進度圓圈 -->
    <div class="progress-border" :style="{ background: progressGradient }">
      <div class="content">{{ formattedTime }}</div>
    </div>

    <div class="timerButtonGroup">
      <!-- 當超時時，只顯示「放棄」和「結束」 -->
      <template v-if="isExpired">
        <div class="expired-options">
          <button
            style="background-color: #74bc1f"
            @click="detectHRVAfter(UID)"
          >
            HRV檢測(使用後)
          </button>
          <button style="background-color: #ec4f4f" @click="handleAbandon">
            放棄
          </button>
        </div>
      </template>

      <!-- 當 **沒有** 超時時 -->
      <template v-else>
        <button
          v-if="currentDetectionState === DetectionState.RUNNING"
          style="background-color: #74bc1f; padding: 8px"
          @click="API_DeleteStart"
        >
          重新檢測
        </button>

        <button :style="buttonStyle" @click="toggleTimer">
          {{ buttonText }}
        </button>
      </template>
    </div>

    <!-- 選擇結束時間的 Modal -->
    <div v-if="showTimePickerModal" class="modal-overlay">
      <div class="modal-content">
        <h3>選擇結束時間</h3>
        <input type="datetime-local" v-model="selectedEndTime" />
        <div class="modal-buttons">
          <button class="confirm-btn" @click="confirmEndTime">確認</button>
          <button class="cancel-btn" @click="closeModal">取消</button>
        </div>
      </div>
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
  },
  hasDetectRecord: {
    type: Boolean,
  },
  hasDetectTime: {
    type: String,
    default: "00:00:00",
  },
});

const router = useRouter();

// ---------------------------------------------------
// 1) elapsedTime: 維持顯示「已經過幾秒」
// 2) startTimestamp: 用來記錄「開始計時當下的毫秒數」
// ---------------------------------------------------
const elapsedTime = ref(0); // 用來顯示：已經經過多少「秒」
const startTimestamp = ref(null); // 「開始計時」的時間戳 (ms)
const showTimePickerModal = ref(false); // 控制彈窗顯示
// 控制計時狀態 ( 是否在計時中 )
const isCounting = ref(false);

const DetectionState = {
  BEFORE: "before", // 檢測前
  RUNNING: "running", // 計時中
  AFTER: "after", // 檢測後
};
const currentDetectionState = ref(DetectionState.BEFORE);

const buttonText = computed(() => {
  switch (currentDetectionState.value) {
    case DetectionState.BEFORE:
      return "開始 HRV 檢測";
    case DetectionState.RUNNING:
      return "結束";
    case DetectionState.AFTER:
      return "HRV檢測(使用後)";
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

// 是否可點擊按鈕
const isButtonEnabled = ref(true);

// UID / BID / Store ...
const UID = ref(null);
const BID = ref(null);
import { useCommon } from "../stores/common";
const store = useCommon();

const isExpired = ref(null);
const showTimePicker = ref(false);
const selectedEndTime = ref(null);

const hasAbandoned = ref(false); // 標記是否已放棄檢測

// 按鈕樣式
const buttonStyle = computed(() => {
  switch (currentDetectionState.value) {
    case DetectionState.BEFORE: // 綠色(開始)
      return { backgroundColor: "#74BC1F", color: "#fff" };
    case DetectionState.RUNNING: // 藍色(結束)
      return { backgroundColor: "#1FBCB3", color: "#fff" };
    case DetectionState.AFTER: // 綠色(使用後檢測)
      return { backgroundColor: "#74BC1F", color: "#fff" };
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
  // 如果計時器已存在，不要重複啟動
  if (timerInterval.value) {
    console.log("計時器已經啟動");
    return;
  }

  // 若從未設定過開始時間，則記錄「此刻」為 startTimestamp
  // 否則維持原本 (避免覆蓋從後端拿到的 StartTime)
  if (!startTimestamp.value) {
    startTimestamp.value = Date.now();
  }

  isCounting.value = true;
  currentDetectionState.value = DetectionState.RUNNING;
  console.log("計時開始，startTimestamp =", startTimestamp.value);

  // 每秒重新計算「(現在時間 - 開始時間) / 1000」
  timerInterval.value = setInterval(() => {
    const now = Date.now();
    elapsedTime.value = Math.floor((now - startTimestamp.value) / 1000);
    // console.log("計時中，已過時間：", elapsedTime.value, "秒");
  }, 1000);
};

// ---------------------- stopTimer ----------------------
const stopTimer = async () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
  isCounting.value = false;
  console.log("計時結束");

  // ★ 新增：先檢查「使用前檢測是否真的完成」
  const isExitValue = await API_HRV2_UID_Flag_Info("1", UID.value);
  if (isExitValue === "N") {
    // 尚未完成使用前檢測，給使用者提示
    alert("尚未完成使用前檢測，無法結束！");
    return;
  }

  // 先更新狀態為 AFTER
  currentDetectionState.value = DetectionState.AFTER;

  try {
    // 調用結束 API
    await useEndAPI();
    console.log("計時已結束，API 調用成功");

    // 結束後，直接進入使用後檢測邏輯
    detectHRVAfter(UID.value);
  } catch (error) {
    console.error("結束 API 調用失敗：", error);
  }
};

// ---------- 使用前/使用後檢測邏輯 ----------
const detectHRVBefore = (UIDVal) => {
  store.detectFlag = "1"; // 設定為前測
  store.detectUID = UIDVal;
  store.detectForm = props.productName;
  store.showHRVAlert = true;
  startTimer(); // 🟢 開啟計時
};

const detectHRVAfter = (UIDVal) => {
  store.detectFlag = "2";
  store.detectUID = UIDVal;
  store.detectForm = `*${props.productName}`;
  store.showHRVAlert = true;
  console.log("使用後檢測已啟動", { UIDVal, productName: props.productName });
};

// ---------- 切換按鈕行為 ----------
const toggleTimer = async () => {
  switch (currentDetectionState.value) {
    case DetectionState.BEFORE:
      if (UID.value) {
        console.log("已有 UID，開始 HRV 檢測");
        detectHRVBefore(UID.value); // ✅ 直接觸發 HRV 前測
      } else {
        console.log("未找到 UID，創建新的 HRV 檢測");
        const response = await useStartAPI();
        if (response?.UID) {
          UID.value = response.UID;
          detectHRVBefore(response.UID); // ✅ 確保創建後觸發 HRV 前測
        } else {
          console.error("創建 UID 失敗");
        }
      }
      break;

    case DetectionState.RUNNING:
      console.log("結束 HRV 檢測");
      await stopTimer();
      break;

    case DetectionState.AFTER:
      detectHRVAfter(UID.value);
      break;

    default:
      console.error("未知檢測狀態");
  }
};

// 確認結束時間
const confirmEndTime = async () => {
  if (!selectedEndTime.value) {
    alert("請選擇結束時間");
    return;
  }

  const formattedEndTime = formatDateTime(selectedEndTime.value);
  console.log("選擇的結束時間:", formattedEndTime);

  try {
    await useEndAPI(formattedEndTime);

    // ✅ 正確關閉時間選擇彈窗
    showTimePickerModal.value = false;

    // ✅ 確保 `isExpired` 不會影響 UI
    isExpired.value = false;

    // ✅ **不設 `currentDetectionState` 為 `AFTER`，改為 `BEFORE`**
    currentDetectionState.value = DetectionState.BEFORE;

    // ✅ **確保 `hasAbandoned` 為 `true`，讓邏輯知道用戶已放棄**
    hasAbandoned.value = true;

    // ✅ **清空 `UID`，避免影響 `detectHRVAfter` 的邏輯**
    UID.value = null;

    console.log("用戶選擇了結束時間，狀態回到檢測前 (BEFORE)");
  } catch (error) {
    console.error("結束檢測時發生錯誤:", error);
  }
};

const closeModal = () => {
  showTimePickerModal.value = false;
  hasAbandoned.value = false;
};

// 轉換 `datetime-local` 值為 `yyyyMMddHHmmss` 格式
// 轉換日期格式
const formatDateTime = (dateTime) => {
  const date = new Date(dateTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};
const handleComplete = async () => {
  console.log("正在處理結束邏輯...");

  // 1️⃣ 停止計時器
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
  isCounting.value = false;

  // 2️⃣ 取得當前時間作為結束時間 (yyyyMMddHHmmss 格式)
  const now = new Date();
  const formattedEndTime = formatDateTime(now);

  try {
    // 3️⃣ 調用 API，更新結束時間
    await useEndAPI(formattedEndTime);
    console.log("結束 API 調用成功");

    // 4️⃣ 更新 UI 狀態
    currentDetectionState.value = DetectionState.AFTER;
    isExpired.value = false;

    // 5️⃣ 進入使用後檢測流程
    detectHRVAfter(UID.value);
  } catch (error) {
    console.error("結束 API 調用失敗:", error);
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

    if (response?.Result !== "OK") {
      console.error("無法獲取有效的 UID 信息：", response);
      return null;
    }

    console.log("成功獲取 UID 信息：", response);

    const UIDResponse = response.UID;
    if (!UIDResponse) {
      console.warn("UID 為 null，無法繼續後續操作");
      return null;
    }

    // 取得後端提供的 CheckTime (格式: YYYYMMDDHHMMSS)
    const checkTime = response.CheckTime
      ? new Date(
          `${response.CheckTime.slice(0, 4)}-${response.CheckTime.slice(
            4,
            6
          )}-${response.CheckTime.slice(6, 8)}T${response.CheckTime.slice(
            8,
            10
          )}:${response.CheckTime.slice(10, 12)}:${response.CheckTime.slice(
            12
          )}`
        ).getTime()
      : null;

    if (!checkTime) {
      console.warn("無法檢測到 CheckTime，可能需要進行其他處理");
      return null;
    }

    const now = Date.now();
    const timeDifference = now - checkTime;
    const expiredLimit = 12; // 12 小時

    // 判斷是否超過 12 小時
    if (timeDifference > expiredLimit) {
      console.log("CheckTime 超過 12 小時，進入超時狀態");
      isExpired.value = true;
      currentDetectionState.value = DetectionState.AFTER; // 設定為檢測後狀態
    } else {
      console.log("CheckTime 在 12 小時內，正常進行 HRV 檢測");
      startTimestamp.value = checkTime;
      elapsedTime.value = Math.floor(timeDifference / 1000);
      startTimer();
      currentDetectionState.value = DetectionState.RUNNING;
      isExpired.value = false;
    }

    return response;
  } catch (error) {
    console.error("API 調用失敗：", error);
    return null;
  }
};

const API_HRV2_UID_Flag_Info = async (Flag, UIDVal) => {
  if (!UIDVal) {
    console.error("UID 為 null，無法調用 API_HRV2_UID_Flag_Info");
    return null;
  }
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_HRV2_UID_Flag_Info.jsp",
      { MID, Token, MAID, Mobile, UID: UIDVal, Flag }
    );
    if (response?.Result === "OK") {
      console.log("成功獲取 HRV2 檢測資料狀態：", response);
      if (Flag === "1" && response.IsExit === "N") {
        detectHRVBefore(UIDVal);
      }
      return response.IsExit;
    } else {
      console.error("無法獲取 HRV2 資料狀態：", response);
      return null;
    }
  } catch (error) {
    console.error("API 調用失敗：", error);
    return null;
  }
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

  try {
    const response = await axios.post(
      "https://23700999.com:8081/HMA/API_UseEnd.jsp",
      {
        UID: UID.value,
        EndTime: endTime || "",
      }
    );
    console.log("結束 API 調用成功", response);
  } catch (error) {
    console.error("結束 API 調用失敗:", error);
  }
};

const hasEndTime = ref(false); // 新增狀態來判斷是否有結束時間

const API_UIDInfo_Search12 = async () => {
  if (hasAbandoned.value) {
    console.log("用戶已放棄，不執行 API_UIDInfo_Search12");
    return;
  }

  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_UIDInfo_Search12.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );

    if (response && response.Result !== "NOData") {
      const checkTime = response.CheckTime
        ? new Date(
            `${response.CheckTime.slice(0, 4)}-${response.CheckTime.slice(
              4,
              6
            )}-${response.CheckTime.slice(6, 8)}T${response.CheckTime.slice(
              8,
              10
            )}:${response.CheckTime.slice(10, 12)}:${response.CheckTime.slice(
              12
            )}`
          )
        : null;

      if (checkTime) {
        const now = new Date();
        const timeDifference = now - checkTime;
        const hoursDifference = timeDifference / (1000 * 60 * 60);
        const hasCompletedAfter = response.IsExit; // "N" 表示未完成

        if (hoursDifference <= 12) {
          if (hasCompletedAfter === "N") {
            console.log("未完成 HRV 使用後檢測，請立即進行");
            alert("尚未完成使用後 HRV 檢測，請立即進行！");
            detectHRVAfter(response.UID);
            return;
          }
        } else {
          console.log("超過 12 小時，UI 標記為超時，但不強制 HRV 檢測");
          isExpired.value = true;
          currentDetectionState.value = DetectionState.AFTER;
          UID.value = response.UID;
        }
      }

      console.log("使用後 HRV 檢測已完成，正常顯示『HRV檢測(使用後)』按鈕");
      UID.value = response.UID;
    }
  } catch (err) {
    console.log("API 調用失敗：", err);
  }
};

const API_DeleteStart = async () => {
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
    console.log("API_DeleteStart 呼叫成功", response);
    // 呼叫後把前端狀態也重置
    doReset();
  } catch (error) {
    console.error("API_DeleteStart 呼叫失敗:", error);
  }
};

// ---------------------- 重置 ----------------------
function doReset() {
  // 清除計時器
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
  isCounting.value = false;

  // 將 elapsedTime / startTimestamp / UID 等全部重置
  elapsedTime.value = 0;
  startTimestamp.value = null;
  currentDetectionState.value = DetectionState.BEFORE;
  UID.value = null;
  console.log("已重置計時與狀態");
}

// ---------------------- onMounted ----------------------
onMounted(async () => {
  BID.value = null;

  try {
    const response = await API_MID_ProductName_UIDInfo();
    if (response) {
      UID.value = response.UID;
      if (UID.value) {
        console.log("成功獲取有效的 UID：", UID.value);
        if (response.StartTime) {
          const startTime = new Date(
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
          const timeDifference = Math.abs(now - startTime);

          if (timeDifference <= 24 * 60 * 60 * 1000) {
            startTimestamp.value = startTime;
            elapsedTime.value = Math.floor(timeDifference / 1000);
            startTimer();
            currentDetectionState.value = DetectionState.RUNNING;
          } else {
            console.log("StartTime 超過 24 小時，清除舊紀錄");
            await API_DeleteStart();
          }
        }
      } else {
        console.warn("無舊 UID，可能需要創建新的檢測記錄");
        const startResponse = await useStartAPI();
        if (startResponse?.UID) {
          UID.value = startResponse.UID;
          detectHRVBefore(UID.value);
        }
      }
    } else {
      if (!hasAbandoned.value) {
        API_UIDInfo_Search12();
      } else {
        console.log("用戶已放棄，不自動檢查 API_UIDInfo_Search12");
      }
    }
  } catch (error) {
    console.error("初始化失敗：", error);
  }
});

const handleAbandon = () => {
  console.log("用戶選擇放棄，顯示時間選擇彈窗");

  // ✅ 停止計時器
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }

  // ✅ 清除所有計時相關變數
  elapsedTime.value = 0;
  startTimestamp.value = null;
  isCounting.value = false;
  hasAbandoned.value = true; // ✅ 標記為已放棄

  // ✅ 直接跳回「檢查前」狀態
  currentDetectionState.value = DetectionState.BEFORE;

  // ✅ **避免 UI 顯示 HRV 檢測(使用後)**
  isExpired.value = false;

  // ✅ 清除 `UID`，避免觸發 HRV 使用後檢測
  UID.value = null;

  // ✅ 顯示「時間選擇」彈窗
  showTimePickerModal.value = true;

  console.log("已重置為檢查前狀態，並顯示時間選擇彈窗");
};
</script>

<style scoped>
.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background-color: rgb(246, 246, 246);
}

.progress-container .delay-message {
  color: #ec4f4f;
  text-align: justify;
  font-family: "Noto Sans";
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%;
  letter-spacing: 0.5px;
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
  transition: all 0.3s ease; /* 平滑過渡效果 */
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

.timerButtonGroup button:disabled {
  background-color: #d0d0d0 !important;
}

.completion-delayMessage {
  color: #ec4f4f;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.5px;
  text-align: center;
}

.timerButtonGroup {
  display: flex;
  gap: 8px;
}

.TimeRingForgetBox {
  margin-top: 10px;
  text-align: center;
}

.TimeRingForgetBox input {
  margin: 5px;
}

.TimeRingForgetBox button {
  background-color: #74bc1f;
  color: white;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
}
.expired-options {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.modal-content h3 {
  margin-bottom: 10px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.confirm-btn {
  background-color: #74bc1f;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #ec4f4f;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
