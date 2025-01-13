<template>
  <div class="progress-container">
    <!-- 動態進度圓圈 -->
    <div class="progress-border" :style="{ background: progressGradient }">
      <div class="content">{{ formattedTime }}</div>
    </div>
    <div
      class="completion-message"
      v-if="currentDetectionState === DetectionState.AFTER"
    >
      總共使用 {{ hasDetectTime }}
    </div>


    <div class="timerButtonGroup">
      <!-- 重新檢測 -->
      <button
        v-if="currentDetectionState === DetectionState.RUNNING"
        style="background-color: #74bc1f; padding: 8px"
        @click="API_DeleteStart"
      >
        重新檢測
      </button>
      <!-- 主按鈕 (開始或結束) -->
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

const elapsedTime = ref(0); // 計時的時間（秒）
const isCounting = ref(false); // 是否正在計時

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

      break;
    default:
      return "未知狀態";
  }
});

const totalUsedTime = computed(() => {
  const hours = Math.floor(elapsedTime.value / 3600);
  const minutes = Math.floor((elapsedTime.value % 3600) / 60);
  const seconds = elapsedTime.value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
});

const isButtonEnabled = ref(true);
const UID = ref(null);
const BID = ref(null);

import { useCommon } from "../stores/common";
const store = useCommon();

const endButtonStyle = computed(() => {
  return isButtonEnabled.value
    ? { backgroundColor: "#1FBCB3", color: "#fff" }
    : { backgroundColor: "#E0E0E0", color: "#000", cursor: "not-allowed" };
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
  if (timerInterval.value) {
    console.log("計時器已啟動");
    return;
  }
  isCounting.value = true;
  timerInterval.value = setInterval(() => {
    elapsedTime.value++;
    console.log("計時中，已過時間：", elapsedTime.value, "秒");
  }, 1000);
  currentDetectionState.value = DetectionState.RUNNING;
  console.log("計時開始");
};

const stopTimer = async () => {
  clearInterval(timerInterval.value);
  timerInterval.value = null;
  isCounting.value = false;

  // ★ 新增：先檢查「使用前檢測是否真的完成」
  const isExitValue = await API_HRV2_UID_Flag_Info("1", UID.value);
  // 如果後端回傳 isExitValue === "N"，表示「使用前檢測」未完成
  if (isExitValue === "N") {
    // 可以跳出提醒，或直接 return 不往下執行
    alert("尚未完成使用前檢測，無法結束！");
    // ★ 若要重新啟動計時，或回到 BEFORE 狀態，都可自行決定
    return;
  }

  // 先更新狀態為 AFTER
  currentDetectionState.value = DetectionState.AFTER;

  try {
    // 調用結束 API
    await useEndAPI();
    console.log("計時已結束，API 調用成功");

    // **結束後，直接啟動「使用後檢測」邏輯**
    detectHRVAfter(UID.value);
  } catch (error) {
    console.error("結束 API 調用失敗：", error);
  }
};

// ---------- 使用後檢測邏輯 ----------
const detectHRVAfter = (UID) => {
  store.detectFlag = "2"; // 使用後檢測
  store.detectUID = UID;
  store.detectForm = `*${props.productName}`;
  store.showHRVAlert = true;
  console.log("使用後檢測已啟動", { UID, productName: props.productName });
};

// ---------- 使用前檢測邏輯 ----------
const detectHRVBefore = (UID) => {
  store.detectFlag = "1";
  store.detectUID = UID;
  store.detectForm = props.productName;
  store.showHRVAlert = true;
  startTimer();
};

const toggleTimer = async () => {
  switch (currentDetectionState.value) {
    case DetectionState.BEFORE:
      if (UID.value) {
        console.log("已有 UID，從 API 時間開始 HRV 檢測");
        const response = await API_MID_ProductName_UIDInfo();
        if (response?.StartTime) {
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
          elapsedTime.value = Math.floor((now - startTime) / 1000);
        }
        startTimer();
      } else {
        console.log("未找到 UID，創建新的 HRV 檢測");
        const response = await useStartAPI();
        if (response?.UID) {
          detectHRVBefore(response.UID);
        } else {
          console.error("創建 UID 失敗");
        }
      }
      break;

    case DetectionState.RUNNING:
      console.log("結束 HRV 檢測");
      await stopTimer();
      break;

    // **移除 AFTER 狀態的分支**
    case DetectionState.AFTER:
      // 也可以手動執行使用後檢測
      detectHRVAfter(UID.value)
      break;

    default:
      console.error("未知檢測狀態");
  }
};

// ---------- API 請求 ----------
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
    if (response?.Result === "OK") {
      console.log("成功獲取 UID 信息：", response);
      const UIDResponse = response.UID;
      if (!UIDResponse) {
        console.warn("UID 為 null，無法繼續後續操作");
        return null;
      }

      // 這裡的 CheckTime 代表後端回傳的某個檢測點時間
      const now = new Date().getTime();
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

      if (checkTime) {
        const timeDifference = Math.abs(now - checkTime);

        // ★ 新增：超過 24 小時就直接刪除舊資料，或自行定義要怎麼做
        if (timeDifference > 24 * 60 * 60 * 1000) {
          console.log("CheckTime 超出 24 小時範圍，直接清除舊檢測紀錄");
          await API_DeleteStart();
          return null; // 或 return {}; 看專案需要
        } else {
          console.log("CheckTime 在有效的 24 小時範圍內：", checkTime);
          // 若在 24 小時內，檢查一下是否完成使用前檢測
          await API_HRV2_UID_Flag_Info("1", UIDResponse);
        }
      } else {
        console.warn("無法檢測到 CheckTime，可能需要進行其他處理");
      }

      return response;
    } else {
      console.error("無法獲取有效的 UID 信息：", response);
      return null;
    }
  } catch (error) {
    console.error("API 調用失敗：", error);
    return null;
  }
};

const API_HRV2_UID_Flag_Info = async (Flag, UID) => {
  if (!UID) {
    console.error("UID 為 null，無法調用 API_HRV2_UID_Flag_Info");
    return null;
  }
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_HRV2_UID_Flag_Info.jsp",
      { MID, Token, MAID, Mobile, UID, Flag }
    );
    if (response?.Result === "OK") {
      console.log("成功獲取 HRV2 檢測資料狀態：", response);
      if (Flag === "1" && response.IsExit === "N") {
        detectHRVBefore(UID);
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

onMounted(async () => {
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
            // 沒超過 24 小時，繼續原本流程
            elapsedTime.value = Math.floor(timeDifference / 1000);
            console.log("計算的已過時間：", elapsedTime.value, "秒");
            startTimer();
            currentDetectionState.value = DetectionState.RUNNING;
          } else {
            // ★ 新增：超過 24 小時就直接清除/重置
            console.log("StartTime 超出 24 小時範圍，直接清除舊檢測紀錄");
            await API_DeleteStart();
            // 或只呼叫 doReset() 也行
            // doReset();
          }
        } else {
          console.log("無效的 StartTime");
        }
      } else {
        // 沒有舊的 UID，直接創建新的
        console.warn("UID 為 null，需要創建新的檢測記錄");
        const startResponse = await useStartAPI();
        if (startResponse?.UID) {
          UID.value = startResponse.UID;
          console.log("成功創建新的 UID：", UID.value);
          detectHRVBefore(UID.value);
        } else {
          console.error("無法創建新的 UID，請檢查相關參數或 API");
        }
      }
    } else {
      API_UIDInfo_Search12();
    }
  } catch (error) {
    console.error("初始化失敗：", error);
  }
});

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

const API_UIDInfo_Search12 = async () => {
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
        if (hoursDifference <= 24) {
          alert("尚未完成使用後HRV檢測");
        }
      }
      currentDetectionState.value = DetectionState.AFTER;
      detectHRVAfter(response.UID);
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

function doReset() {
  // 若計時器還在跑，先清掉
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
  isCounting.value = false;
  elapsedTime.value = 0;
  currentDetectionState.value = DetectionState.BEFORE;
  // UID.value = null;
  console.log("已重置計時與狀態");
}

onMounted(() => {
  BID.value = null;
  console.log("組件初始化完成，BID 初始化為 null");
});

const buttonStyle = computed(() => {
  switch (currentDetectionState.value) {
    case DetectionState.BEFORE:
      // 綠色(開始)
      return { backgroundColor: "#74BC1F", color: "#fff" };
    case DetectionState.RUNNING:
      // 藍色(結束)
      return { backgroundColor: "#1FBCB3", color: "#fff" };
    case DetectionState.AFTER:
      // 綠色(使用後檢測)
      return { backgroundColor: "#74BC1F", color: "#fff" };
    default:
      // 灰色(預設)
      return { backgroundColor: "#E0E0E0", color: "#000" };
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
</style>
