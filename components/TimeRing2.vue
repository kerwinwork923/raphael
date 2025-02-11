<template>
  <div class="progress-container">
    <!-- 1) 正數計時 + 進度圓圈：使用 progressStyle 顯示累計時間比例 -->
    <div class="progress-border" :style="progressStyle">
      <div class="content">{{ formattedTime }}</div>
    </div>

    <!-- 2) 若 hasDetectRecord 為 true，顯示感謝訊息 -->
    <div v-if="hasDetectRecord" class="completion-message">感謝您的使用</div>

    <!-- 3) 使用後狀態時，依是否在2小時內顯示不同文案 -->
    <div v-if="currentState === DetectionState.AFTER">
      <div v-if="isWithinTwoHoursAfter" class="completion-delayMessage">
        請在2小時內完成HRV檢測(使用後)
      </div>
      <div v-else class="completion-delayMessage">※ 請於隔天後再使用</div>
    </div>

    <!-- 4) 主按鈕：只在 BEFORE / RUNNING 狀態出現；AFTER 狀態就不顯示此按鈕 -->
    <button
      v-if="!hasDetectRecord && currentState !== DetectionState.AFTER"
      :disabled="hasDetectRecord"
      :style="buttonStyle"
      @click="toggleTimer"
    >
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useCommon } from "../stores/common";

/* ---------------------- [Props] ---------------------- */
const props = defineProps({
  totalTime: { type: Number, default: 3600 },
  productName: { type: String, default: "" },
  hasDetectRecord: { type: Boolean, default: false },
});

const router = useRouter();
const store = useCommon();

/* ---------------------- [狀態枚舉 & 核心變數] ---------------------- */
const DetectionState = {
  BEFORE: "before",
  RUNNING: "running",
  AFTER: "after",
};

const currentState = ref(DetectionState.BEFORE);

// 保留 remainingTime（原程式有，但此處用不到）
const remainingTime = ref(props.totalTime * 1000);

/* ---------- 正數計時：elapsedTime / startTimestamp ---------- */
const elapsedTime = ref(0); // 已經過「秒」
const startTimestamp = ref(null); // 開始計時的毫秒時間戳
const isCounting = ref(false); // 是否正在計時

/* ---------------------- [使用後] 2 小時判斷 ---------------------- */
const afterStartTime = ref(null);
const isWithinTwoHoursAfter = computed(() => {
  if (!afterStartTime.value) return false;
  const diff = Date.now() - afterStartTime.value.getTime();
  return diff < 2 * 60 * 60 * 1000; // 2 小時
});

/* ---------------------- [按鈕文字 & 樣式] ---------------------- */
const buttonText = computed(() => {
  switch (currentState.value) {
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

const buttonStyle = computed(() => {
  switch (currentState.value) {
    case DetectionState.BEFORE: // 綠色
      return { backgroundColor: "#74BC1F", color: "#fff" };
    case DetectionState.RUNNING: // 藍色
      return { backgroundColor: "#1FBCB3", color: "#fff" };
    case DetectionState.AFTER: // 綠色
      return { backgroundColor: "#74BC1F", color: "#fff" };
    default:
      return { backgroundColor: "#E0E0E0", color: "#000" };
  }
});

/* ---------------------- [顯示用時間: HH:MM:SS] ---------------------- */
const formattedTime = computed(() => {
  const hours = Math.floor(elapsedTime.value / 3600);
  const minutes = Math.floor((elapsedTime.value % 3600) / 60);
  const seconds = elapsedTime.value % 60;
  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
});

/* ---------------------- [進度圈樣式: conic-gradient] ---------------------- */
const progressStyle = computed(() => {
  const ratio = Math.min(elapsedTime.value / props.totalTime, 1);
  const percent = (ratio * 100).toFixed(2);
  return {
    background: `conic-gradient(#74BC1F 0% ${percent}%, #ffffff ${percent}% 100%)`,
    transition: "background 0.1s linear",
  };
});

/* ---------------------- [LocalStorage 檢查] ---------------------- */
const localData = localStorage.getItem("userData");
const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};
if (!MID || !Token || !MAID || !Mobile) {
  console.error("用戶數據不完整，無法初始化");
  router.push("/");
}

/* ---------------------- [UID, BID & Timer] ---------------------- */
const UID = ref(null);
const BID = ref(null);
let timerInterval = null;

/* ---------------------------------------------------
   1) startTimer: 正數計時
--------------------------------------------------- */
function startTimer() {
  if (timerInterval) {
    console.log("計時器已啟動中，無需重複開始");
    return;
  }
  if (!startTimestamp.value) {
    startTimestamp.value = Date.now();
  }
  isCounting.value = true;
  currentState.value = DetectionState.RUNNING;

  timerInterval = setInterval(() => {
    const now = Date.now();
    elapsedTime.value = Math.floor((now - startTimestamp.value) / 1000);
  }, 1000);
}

/* ---------------------------------------------------
   2) stopTimer: 結束計時 => 進入 AFTER
--------------------------------------------------- */
async function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  isCounting.value = false;
  console.log("計時結束");

  // ★ 檢查使用前是否完成
  const isExitValue = await API_HRV2_UID_Flag_Info("1", UID.value);
  if (isExitValue === "N") {
    // ※ 尚未完成「使用前」 => 彈出使用前檢測
    alert("尚未完成使用前檢測，無法結束！");
    detectHRVBefore(UID.value); // ★ 新增：再次呼叫使用前檢測
    return;
  }

  // 已完成 => 進入 AFTER + 呼叫使用前結束 API + 觸發使用後
  currentState.value = DetectionState.AFTER;
  try {
    await useEndAPI();
    detectHRVAfter(UID.value);
  } catch (error) {
    console.error("結束 API 呼叫失敗:", error);
  }
}

/* ---------------------------------------------------
   3) 切換按鈕 toggleTimer
   BEFORE => RUNNING => AFTER
--------------------------------------------------- */
async function toggleTimer() {
  switch (currentState.value) {
    case DetectionState.BEFORE:
      if (UID.value) {
        console.log("已有 UID => 從後端時間開始 HRV 檢測");
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

          startTimestamp.value = startTime;
          elapsedTime.value = Math.floor((Date.now() - startTime) / 1000);
        }
        startTimer();
      } else {
        console.log("未找到 UID => 建立新的 HRV 檢測");
        const newResponse = await useStartAPI();
        if (newResponse?.UID) {
          detectHRVBefore(newResponse.UID);
        } else {
          console.error("創建 UID 失敗");
        }
      }
      break;

    case DetectionState.RUNNING:
      console.log("結束 HRV 檢測 => AFTER");
      await stopTimer();
      break;

    case DetectionState.AFTER:
      detectHRVAfter(UID.value);
      break;

    default:
      console.warn("未知狀態，不做任何事");
  }
}

/* ---------------------------------------------------
   4) detectHRVBefore / detectHRVAfter
--------------------------------------------------- */
function detectHRVBefore(uidVal) {
  store.detectFlag = "1";
  store.detectUID = uidVal;
  store.detectForm = props.productName;
  store.showHRVAlert = true;
  startTimer();
}

function detectHRVAfter(uidVal) {
  store.detectFlag = "2";
  store.detectUID = uidVal;
  store.detectForm = `*${props.productName}`;
  store.showHRVAlert = true;
  afterStartTime.value = new Date();
  console.log("使用後檢測已啟動 => UID:", uidVal);
}

/* ---------------------------------------------------
   5) 重置流程 doReset
--------------------------------------------------- */
function doReset() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  isCounting.value = false;
  elapsedTime.value = 0;
  startTimestamp.value = null;
  currentState.value = DetectionState.BEFORE;
  UID.value = null;
  console.log("已重置計時與狀態 => BEFORE");
}

/* ---------------------------------------------------
   6) onMounted: 進入組件 => 初始化
--------------------------------------------------- */
onMounted(async () => {
  BID.value = null;
  try {
    const response = await API_MID_ProductName_UIDInfo();
    if (response) {
      UID.value = response.UID;
      if (UID.value) {
        console.log("成功獲取 UID:", UID.value);
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
          const diff = now - startTime;

          if (diff <= 24 * 60 * 60 * 1000) {
            startTimestamp.value = startTime;
            elapsedTime.value = Math.floor(diff / 1000);
            startTimer();
            currentState.value = DetectionState.RUNNING;
          } else {
            console.log("StartTime 超過24小時 => 清除舊紀錄");
            await API_DeleteStart();
          }
        } else {
          console.log("StartTime 不存在 => 可能尚未開始計時");
        }
      } else {
        console.warn("無舊 UID => 建立新的");
        const newRes = await useStartAPI();
        if (newRes?.UID) {
          UID.value = newRes.UID;
          detectHRVBefore(UID.value);
        } else {
          console.error("無法建立新 UID");
        }
      }
    } else {
      // 若後端回傳沒有資料 => 檢查是否尚未完成使用後
      API_UIDInfo_Search12();
    }
  } catch (error) {
    console.error("初始化失敗：", error);
  }
  console.log("組件初始化完成 => BID = null");
});

/* ---------------------------------------------------
   7) API 方法: 全部保留
--------------------------------------------------- */
async function apiRequest(url, payload) {
  try {
    const resp = await axios.post(url, payload);
    return resp.data;
  } catch (error) {
    throw error;
  }
}

async function API_MID_ProductName_UIDInfo() {
  try {
    const resp = await apiRequest(
      "https://23700999.com:8081/HMA/API_MID_ProductName_UIDInfo.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );
    if (resp?.Result === "OK") {
      console.log("成功獲取 UID 資訊:", resp);
      return resp;
    } else {
      console.error("無法獲取有效 UID:", resp);
      return null;
    }
  } catch (error) {
    console.error("API_MID_ProductName_UIDInfo 失敗:", error);
    return null;
  }
}

async function API_HRV2_UID_Flag_Info(Flag, uidVal) {
  if (!uidVal) return null;
  try {
    const resp = await apiRequest(
      "https://23700999.com:8081/HMA/API_HRV2_UID_Flag_Info.jsp",
      { MID, Token, MAID, Mobile, UID: uidVal, Flag }
    );
    if (resp?.Result === "OK") {
      console.log("成功獲取 HRV2 狀態:", resp);
      return resp.IsExit; // "Y" or "N"
    } else {
      console.error("HRV2 狀態取得失敗:", resp);
      return null;
    }
  } catch (error) {
    console.error("API_HRV2_UID_Flag_Info 失敗:", error);
    return null;
  }
}

async function useStartAPI() {
  try {
    const resp = await apiRequest(
      "https://23700999.com:8081/HMA/API_UseStart.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );
    if (resp?.UID) {
      console.log("成功創建新的 UID:", resp.UID);
    } else {
      console.error("創建新 UID 失敗:", resp);
    }
    return resp;
  } catch (error) {
    console.error("useStartAPI 呼叫失敗:", error);
    return null;
  }
}

async function useEndAPI() {
  if (!UID.value) {
    console.error("無法結束 => UID 不存在");
    return;
  }
  try {
    const resp = await apiRequest(
      "https://23700999.com:8081/HMA/API_UseEnd.jsp",
      { MID, Token, MAID, Mobile, UID: UID.value }
    );
    console.log("結束 API 呼叫成功:", resp);
  } catch (error) {
    console.error("useEndAPI 失敗:", error);
  }
}

async function API_UIDInfo_Search12() {
  try {
    const resp = await apiRequest(
      "https://23700999.com:8081/HMA/API_UIDInfo_Search12.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );
    if (resp && resp.Result !== "NOData") {
      currentState.value = DetectionState.AFTER;
      UID.value = resp.UID;
      detectHRVAfter(resp.UID);
    }
  } catch (err) {
    console.error("API_UIDInfo_Search12 呼叫失敗:", err);
  }
}

async function API_DeleteStart() {
  try {
    const resp = await apiRequest(
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
    console.log("API_DeleteStart 成功:", resp);
    doReset();
  } catch (error) {
    console.error("API_DeleteStart 失敗:", error);
  }
}

/* ---------------------------------------------------
   8) 時間字串解析函式 (若需要)
--------------------------------------------------- */
function parseTimeString(timeStr) {
  return new Date(
    `${timeStr.slice(0, 4)}-${timeStr.slice(4, 6)}-${timeStr.slice(
      6,
      8
    )}T${timeStr.slice(8, 10)}:${timeStr.slice(10, 12)}:${timeStr.slice(
      12,
      14
    )}`
  );
}
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
