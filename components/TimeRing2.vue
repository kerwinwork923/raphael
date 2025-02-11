<template>
  <div class="progress-container">
    <!-- 1) 正數計時 + 圓圈 (顯示 elapsedTime) -->
    <div class="progress-border" :style="progressStyle">
      <div class="content">{{ formattedTime }}</div>
    </div>

    <!-- 2) 有檢測紀錄時，顯示提示 (可自行啟用) -->
    <!-- <div v-if="hasDetectRecord" class="completion-message">感謝您的使用</div> -->

    <!-- 3) BEFORE / RUNNING 狀態 => 使用前檢測 -->
    <div class="timeRing2btnGroup" v-if="currentState === DetectionState.BEFORE || currentState === DetectionState.RUNNING">
      <!-- BEFORE 狀態下：按鈕為「HRV檢測(使用前)」 -->
      <button v-if="currentState === DetectionState.BEFORE" @click="toggleTimer" style="margin-bottom: 1rem; background-color: #74bc1f">
        HRV檢測(使用前)
      </button>

      <!-- RUNNING 狀態下：按鈕顯示「結束」 -->
      <button v-if="currentState === DetectionState.RUNNING" @click="toggleTimer" :style="buttonStyle">
        {{ buttonText }}
      </button>

      <!-- RUNNING 狀態下：若使用前檢測狀態（detectFlag==='1'），則提供「重新檢測」按鈕 -->
      <button
        v-if="currentState === DetectionState.RUNNING && store.detectFlag === '1'"
        class="retry-btn"
        style="margin-bottom: 1rem"
        @click="resetAndRetest"
      >
        重新檢測
      </button>
    </div>

    <!-- 4) AFTER 狀態：這裡僅供參考，可根據需求刪除 -->
    <div v-if="currentState === DetectionState.AFTER" class="hrv-after-btn-group">
      <div v-if="!hasOver30Mins" style="text-align: center">
        <button class="hrv-after-btn" @click="detectHRVAfter(UID.value)">
          HRV檢測(使用後)
        </button>
        <div class="completion-delayMessage">
          請在30分鐘內完成HRV檢測(使用後)
        </div>
      </div>
      <div v-else>
        <div class="button-row">
          <button class="hrv-after-btn" @click="detectHRVAfter(UID.value)">
            HRV檢測(使用後)
          </button>
          <button class="give-up-btn" @click="handleGiveUp">放棄</button>
        </div>
        <div class="completion-delayMessage">
          已超過30分鐘未完成HRV檢測(使用後)，可選擇現在完成或放棄
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useCommon } from "../stores/common";

// ------------------ [Props] ------------------
const props = defineProps({
  totalTime: { type: Number, default: 3600 }, // 預設總時長（秒）
  productName: { type: String, default: "" },   // 產品名稱
  hasDetectRecord: { type: Boolean, default: false },
});

const router = useRouter();
const store = useCommon();

// [Enum 狀態]
const DetectionState = {
  BEFORE: "before",   // 使用前
  RUNNING: "running", // 計時中（尚未結束）
  AFTER: "after",     // 使用後（已結束）
};

// [核心狀態]
const currentState = ref(DetectionState.BEFORE);
const elapsedTime = ref(0);
const startTimestamp = ref(null);
const isCounting = ref(false);
const hasOver30Mins = ref(false);

// 主按鈕文案與樣式
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
    case DetectionState.BEFORE:
      return { backgroundColor: "#74bc1f", color: "#fff" };
    case DetectionState.RUNNING:
      return { backgroundColor: "#1FBCB3", color: "#fff" };
    case DetectionState.AFTER:
      return { backgroundColor: "#74bc1f", color: "#fff" };
    default:
      return { backgroundColor: "#E0E0E0", color: "#000" };
  }
});

// 時間格式化與漸層
const formattedTime = computed(() => {
  const h = Math.floor(elapsedTime.value / 3600);
  const m = Math.floor((elapsedTime.value % 3600) / 60);
  const s = elapsedTime.value % 60;
  return [h, m, s].map(val => String(val).padStart(2, "0")).join(":");
});
const progressStyle = computed(() => {
  const ratio = Math.min(elapsedTime.value / props.totalTime, 1);
  const percent = (ratio * 100).toFixed(2);
  return {
    background: `conic-gradient(#74bc1f 0% ${percent}%, #ffffff ${percent}% 100%)`,
    transition: "background 0.1s linear",
  };
});

// LocalStorage 驗證（userData 必須存在）
const localData = localStorage.getItem("userData");
const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};
if (!MID || !Token || !MAID || !Mobile) {
  console.error("用戶數據不完整，無法初始化");
  router.push("/");
}

// UID 與計時器
const UID = ref(null);
let timerInterval = null;

// --------------------- [核心函式] ---------------------
// 1) 開始計時
function startTimer() {
  if (timerInterval) {
    console.log("計時器已在運行中");
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

// 2) 停止計時（只檢查使用前完成即可結束）
async function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  isCounting.value = false;
  console.log("計時結束 => 檢查使用前是否完成");
  const isExitBefore = await API_HRV2_UID_Flag_Info("1", UID.value);
  if (isExitBefore === "N") {
    alert("尚未完成使用前檢測，無法結束！");
    detectHRVBefore(UID.value);
    return;
  }
  currentState.value = DetectionState.AFTER;
  try {
    await useEndAPI();
    console.log("使用前檢測已完成 => 正式結束");
  } catch (err) {
    console.error("useEndAPI 失敗:", err);
  }
}

// 3) 根據狀態決定流程
async function toggleTimer() {
  switch (currentState.value) {
    case DetectionState.BEFORE:
      if (UID.value) {
        const resp = await API_MID_ProductName_UIDInfo();
        if (resp?.StartTime) {
          const ms = parseTimeString(resp.StartTime).getTime();
          startTimestamp.value = ms;
          elapsedTime.value = Math.floor((Date.now() - ms) / 1000);
        }
        startTimer();
      } else {
        // 呼叫 useStartAPI 並儲存新 UID 至 localStorage
        const newRes = await useStartAPI();
        if (newRes?.UID) {
          UID.value = newRes.UID;
          localStorage.setItem("currentUID", newRes.UID);
          detectHRVBefore(newRes.UID);
        } else {
          console.error("無法建立新 UID");
        }
      }
      break;
    case DetectionState.RUNNING:
      await stopTimer();
      break;
    case DetectionState.AFTER:
      // AFTER 狀態下不做任何事
      break;
    default:
      console.warn("未知狀態 => 不做任何事");
  }
}

// 4) 進入使用前檢測
function detectHRVBefore(uidVal) {
  store.detectFlag = "1"; // 使用前檢測
  store.detectUID = uidVal;
  store.detectForm = props.productName;
  store.showHRVAlert = true;
  startTimer();
}

// 5) 進入使用後檢測（若需要使用後檢測，可保留此函式）
async function detectHRVAfter(uidVal) {
  store.detectFlag = "2"; // 使用後檢測
  store.detectUID = uidVal;
  store.detectForm = `*${props.productName}`;
  store.showHRVAlert = true;
  try {
    const data = await API_UIDInfo_Search12();
    if (data?.Status === "Y") {
      hasOver30Mins.value = true;
    } else {
      hasOver30Mins.value = false;
    }
  } catch (err) {
    console.error("detectHRVAfter => 失敗:", err);
  }
}

// 6) 放棄使用後檢測（如有需要）
async function handleGiveUp() {
  if (!window.confirm("確定要放棄本次使用後檢測嗎？")) return;
  try {
    await API_DeleteStart();
    doReset();
    alert("已放棄使用後檢測，流程重置。");
  } catch (err) {
    console.error("放棄失敗:", err);
  }
}

// 7) 完整重置（清除計時器、狀態、UID）
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
  localStorage.removeItem("currentUID");
  console.log("已重置 => BEFORE");
}

/**
 * 8) 重新檢測（刪除舊紀錄 + 重置 + 再次開始使用前檢測）
 */
async function resetAndRetest() {
  if (UID.value) {
    try {
      await API_DeleteStart();
    } catch (err) {
      console.error("重新檢測 - 刪除舊紀錄失敗:", err);
    }
  }
  doReset();
  toggleTimer();
}

// --------------------- [onMounted] ---------------------
// 先嘗試從 localStorage 還原 UID，再進行初始化查詢
onMounted(async () => {
  const storedUID = localStorage.getItem("currentUID");
  if (storedUID) {
    UID.value = storedUID;
    console.log("從 localStorage 取得 UID:", storedUID);
  }
  try {
    const resp = await API_MID_ProductName_UIDInfo();
    if (resp) {
      if (resp.UID) {
        UID.value = resp.UID;
        localStorage.setItem("currentUID", resp.UID);
      }
      if (resp.StartTime) {
        const startMS = parseTimeString(resp.StartTime).getTime();
        const diff = Date.now() - startMS;
        if (diff <= 24 * 60 * 60 * 1000) {
          startTimestamp.value = startMS;
          elapsedTime.value = Math.floor(diff / 1000);
          startTimer();
          currentState.value = DetectionState.RUNNING;
        } else {
          console.log("StartTime 超過24hr => 清除舊紀錄");
          await API_DeleteStart();
        }
      } else {
        currentState.value = DetectionState.BEFORE;
      }
    } else {
      console.log("後端回傳 NOData => BEFORE");
      currentState.value = DetectionState.BEFORE;
    }
  } catch (err) {
    console.error("初始化失敗:", err);
  }
});

// --------------------- [API 區域] ---------------------
async function apiRequest(url, payload) {
  try {
    const r = await axios.post(url, payload);
    return r.data;
  } catch (err) {
    throw err;
  }
}

// A) 取得 UID / StartTime
async function API_MID_ProductName_UIDInfo() {
  try {
    const r = await apiRequest(
      "https://23700999.com:8081/HMA/API_MID_ProductName_UIDInfo.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );
    if (r?.Result === "OK") {
      return r;
    } else {
      console.log("API_MID_ProductName_UIDInfo => NOData or fail:", r);
      return null;
    }
  } catch (err) {
    console.error("API_MID_ProductName_UIDInfo 失敗:", err);
    return null;
  }
}

// B) 檢查使用前/後 Flag ("1" 或 "2")
async function API_HRV2_UID_Flag_Info(Flag, uidVal) {
  if (!uidVal) return null;
  try {
    const r = await apiRequest(
      "https://23700999.com:8081/HMA/API_HRV2_UID_Flag_Info.jsp",
      { MID, Token, MAID, Mobile, UID: uidVal, Flag }
    );
    if (r?.Result === "OK") {
      return r.IsExit;
    } else {
      console.error("API_HRV2_UID_Flag_Info => fail:", r);
      return null;
    }
  } catch (err) {
    console.error("API_HRV2_UID_Flag_Info => err:", err);
    return null;
  }
}

// C) 建立使用前 (UseStart) – 回傳新 UID
async function useStartAPI() {
  try {
    const r = await apiRequest(
      "https://23700999.com:8081/HMA/API_UseStart.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );
    console.log("useStartAPI 回傳:", r);
    if (r?.UID) {
      console.log("成功創建 UID:", r.UID);
      return r;
    } else {
      console.error("useStartAPI => 回傳內容不包含 UID:", r);
      return null;
    }
  } catch (err) {
    console.error("useStartAPI => err:", err);
    return null;
  }
}

// D) 結束 (UseEnd)
async function useEndAPI() {
  if (!UID.value) return;
  try {
    const r = await apiRequest("https://23700999.com:8081/HMA/API_UseEnd.jsp", {
      MID,
      Token,
      MAID,
      Mobile,
      UID: UID.value,
    });
    console.log("useEndAPI =>", r);
    return r;
  } catch (err) {
    console.error("useEndAPI => err:", err);
  }
}

// E) 判斷是否逾30分鐘 (API_UIDInfo_Search12)
async function API_UIDInfo_Search12() {
  try {
    const r = await apiRequest(
      "https://23700999.com:8081/HMA/API_UIDInfo_Search12.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );
    if (r?.Result === "OK") {
      return r;
    } else {
      console.log("API_UIDInfo_Search12 => NOData or fail:", r);
      return null;
    }
  } catch (err) {
    console.error("API_UIDInfo_Search12 => err:", err);
    return null;
  }
}

// F) 刪除檢測紀錄 (API_DeleteStart)
async function API_DeleteStart() {
  if (!UID.value) {
    console.log("尚無 UID，不需呼叫 API_DeleteStart");
    return;
  }
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_DeleteStart.jsp",
      { MID, Token, MAID, Mobile, UID: UID.value, ProductName: props.productName }
    );
    console.log("API_DeleteStart 呼叫成功:", response);
  } catch (error) {
    console.error("API_DeleteStart 呼叫失敗:", error);
    throw error;
  }
}

// 解析後端時間字串，例如："20250211145046" => new Date("2025-02-11T14:50:46")
function parseTimeString(timeStr) {
  return new Date(
    `${timeStr.slice(0, 4)}-${timeStr.slice(4, 6)}-${timeStr.slice(6, 8)}T${timeStr.slice(8, 10)}:${timeStr.slice(10, 12)}:${timeStr.slice(12, 14)}`
  );
}
</script>

<style scoped>
.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background-color: #f6f6f6;
  width: 100%;
  max-width: 768px;
  padding: 1rem;
}
.progress-border {
  width: 210px;
  height: 210px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: inset 0px 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}
.content {
  width: 190px;
  height: 190px;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}
button {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  letter-spacing: 0.09px;
  transition: background-color 0.3s ease;
  box-shadow: inset 0px -2px 3px rgba(0, 0, 0, 0.25);
}
button:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}
.hrv-after-btn {
  background-color: #74bc1f;
  margin-bottom: 0.5rem;
}
.give-up-btn {
  background-color: #ec4f4f;
  margin-bottom: 0.5rem;
  margin-left: 0.5rem;
}
.completion-message {
  color: #74bc1f;
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 0.09px;
  margin-bottom: 0.5rem;
}
.completion-delayMessage {
  color: #ec4f4f;
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0.5px;
  line-height: 1.5;
  text-align: center;
  margin-top: 0.5rem;
}
.button-row {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.hrv-after-btn-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.retry-btn {
  background-color: #74bc1f;
  margin-left: 8px;
}
</style>
