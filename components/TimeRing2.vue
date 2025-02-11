<template>
  <div class="progress-container">
    <!-- 1) 正數計時 + 進度圓圈 -->
    <div class="progress-border" :style="progressStyle">
      <div class="content">{{ formattedTime }}</div>
    </div>

    <!-- 2) 有檢測紀錄時，顯示提示 -->
    <div v-if="hasDetectRecord" class="completion-message">感謝您的使用</div>

    <!-- 3) AFTER 狀態 -->
    <div
      class="hrv-after-btn-group"
      v-if="currentState === DetectionState.AFTER"
    >
      <!-- (a) 30 分鐘內：顯示 1 按鈕 + 提示 -->
      <div v-if="isWithinThirtyMinsAfter">
        <button class="hrv-after-btn" @click="detectHRVAfter(UID.value)">
          HRV檢測(使用後)
        </button>
        <div class="completion-delayMessage">
          請在30分鐘內完成HRV檢測(使用後)
        </div>
      </div>

      <!-- (b) 超過 30 分鐘：兩個按鈕並排 + 提示文字在下方 -->
      <div v-else>
        <div class="button-row">
          <button class="hrv-after-btn" @click="detectHRVAfter(UID.value)">
            HRV檢測(使用後)
          </button>
          <button class="give-up-btn" @click="handleGiveUp">放棄</button>
        </div>
        <div class="completion-delayMessage">
          已超過30分鐘未完成HRV檢測(使用後)，您可以選擇現在完成檢測或點擊放棄按鈕
        </div>
      </div>
    </div>

    <!-- 4) BEFORE 或 RUNNING 才顯示主按鈕；AFTER 不顯示 -->
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

/* ------------------ [Props] ------------------ */
const props = defineProps({
  totalTime: { type: Number, default: 3600 },
  productName: { type: String, default: "" },
  hasDetectRecord: { type: Boolean, default: false },
});

const router = useRouter();
const store = useCommon();

/* ------------------ [狀態枚舉] ------------------ */
const DetectionState = {
  BEFORE: "before",
  RUNNING: "running",
  AFTER: "after",
};

const currentState = ref(DetectionState.BEFORE);
const remainingTime = ref(props.totalTime * 1000); // 保留不使用

/* ------------------ [正數計時：elapsedTime + startTimestamp] ------------------ */
const elapsedTime = ref(0);
const startTimestamp = ref(null);
const isCounting = ref(false);

/* ------------------ [AFTER 狀態] 30 分鐘判斷 ------------------ */
const afterStartTime = ref(null);
const isWithinThirtyMinsAfter = computed(() => {
  if (!afterStartTime.value) return false;
  const diff = Date.now() - afterStartTime.value.getTime();
  // 30 分鐘 (1800000 ms)
  return diff < 60;
});

/* ------------------ [按鈕文字 & 樣式] ------------------ */
const buttonText = computed(() => {
  switch (currentState.value) {
    case DetectionState.BEFORE:
      return "開始 HRV 檢測";
    case DetectionState.RUNNING:
      return "結束";
    case DetectionState.AFTER:
      // AFTER 狀態不顯示此主按鈕
      return "HRV檢測(使用後)";
    default:
      return "未知狀態";
  }
});

const buttonStyle = computed(() => {
  switch (currentState.value) {
    case DetectionState.BEFORE:
      return { backgroundColor: "#74BC1F", color: "#fff" }; // 綠色
    case DetectionState.RUNNING:
      return { backgroundColor: "#1FBCB3", color: "#fff" }; // 藍色
    case DetectionState.AFTER:
      return { backgroundColor: "#74BC1F", color: "#fff" }; // 綠色(但不顯示)
    default:
      return { backgroundColor: "#E0E0E0", color: "#000" };
  }
});

/* ------------------ [顯示用時間 (HH:MM:SS)] ------------------ */
const formattedTime = computed(() => {
  const h = Math.floor(elapsedTime.value / 3600);
  const m = Math.floor((elapsedTime.value % 3600) / 60);
  const s = elapsedTime.value % 60;
  return [h, m, s].map((val) => String(val).padStart(2, "0")).join(":");
});

/* ------------------ [conic-gradient] ------------------ */
const progressStyle = computed(() => {
  const ratio = Math.min(elapsedTime.value / props.totalTime, 1);
  const percent = (ratio * 100).toFixed(2);
  return {
    background: `conic-gradient(#74BC1F 0% ${percent}%, #ffffff ${percent}% 100%)`,
    transition: "background 0.1s linear",
  };
});

/* ------------------ [LocalStorage] ------------------ */
const localData = localStorage.getItem("userData");
const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};
if (!MID || !Token || !MAID || !Mobile) {
  console.error("用戶數據不完整，無法初始化");
  router.push("/");
}

/* ------------------ [UID, BID & Timer] ------------------ */
const UID = ref(null);
const BID = ref(null);
let timerInterval = null;

/* ---------------------------------------------------
   startTimer: 正數計時
--------------------------------------------------- */
function startTimer() {
  if (timerInterval) {
    console.log("計時器已經在運行中，不重複開始");
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
   stopTimer: 結束 => AFTER
--------------------------------------------------- */
async function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  isCounting.value = false;
  console.log("計時結束");

  // 檢查使用前是否完成
  const isExitValue = await API_HRV2_UID_Flag_Info("1", UID.value);
  if (isExitValue === "N") {
    alert("尚未完成使用前檢測，無法結束！");
    detectHRVBefore(UID.value);
    return;
  }

  // 使用前完成 => 進入 AFTER
  currentState.value = DetectionState.AFTER;
  try {
    await useEndAPI();
    detectHRVAfter(UID.value);
  } catch (error) {
    console.error("結束 API 失敗:", error);
  }
}

/* ---------------------------------------------------
   toggleTimer: BEFORE => RUNNING => AFTER
--------------------------------------------------- */
async function toggleTimer() {
  switch (currentState.value) {
    case DetectionState.BEFORE:
      if (UID.value) {
        console.log("已有 UID => 從後端時間開始 HRV 檢測");
        const resp = await API_MID_ProductName_UIDInfo();
        if (resp?.StartTime) {
          const startTime = parseTimeString(resp.StartTime).getTime();
          startTimestamp.value = startTime;
          elapsedTime.value = Math.floor((Date.now() - startTime) / 1000);
        }
        startTimer();
      } else {
        console.log("無 UID => 建立新的");
        const newRes = await useStartAPI();
        if (newRes?.UID) {
          detectHRVBefore(newRes.UID);
        } else {
          console.error("創建 UID 失敗");
        }
      }
      break;

    case DetectionState.RUNNING:
      console.log("結束 => AFTER");
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
   detectHRVBefore / detectHRVAfter
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
  console.log("使用後檢測(30分鐘) => UID:", uidVal);
}

/* ---------------------------------------------------
   handleGiveUp: 放棄按鈕
--------------------------------------------------- */
async function handleGiveUp() {
  if (!window.confirm("確定要放棄本次使用後檢測嗎？")) return;
  try {
    await API_DeleteStart(); // 刪除檢測紀錄
    doReset(); // 回到 BEFORE
    alert("已放棄使用後檢測，流程重置。");
  } catch (error) {
    console.error("放棄檢測失敗:", error);
  }
}

/* ---------------------------------------------------
   doReset: 重置
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
  console.log("已重置 => BEFORE");
}

/* ---------------------------------------------------
   onMounted: 初始化
--------------------------------------------------- */
onMounted(async () => {
  BID.value = null;
  try {
    const resp = await API_MID_ProductName_UIDInfo();
    if (resp) {
      UID.value = resp.UID;
      if (UID.value) {
        if (resp.StartTime) {
          const startTime = parseTimeString(resp.StartTime).getTime();
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
          console.log("StartTime 不存在 => 尚未開始計時");
        }
      } else {
        console.warn("無舊 UID => 建立新的");
        const newUIDRes = await useStartAPI();
        if (newUIDRes?.UID) {
          UID.value = newUIDRes.UID;
          detectHRVBefore(UID.value);
        } else {
          console.error("無法建立新 UID");
        }
      }
    } else {
      // 後端回傳無資料 => 檢查是否 AFTER 狀態
      API_UIDInfo_Search12();
    }
  } catch (error) {
    console.error("初始化失敗:", error);
  }
});

/* ---------------------------------------------------
   7) API: 不省略
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
  if (!UID.value) return;
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
    console.log("API_DeleteStart 呼叫成功:", resp);
    // 刪除「檢測紀錄」，保留「使用紀錄」
  } catch (error) {
    console.error("API_DeleteStart 失敗:", error);
    throw error;
  }
}

/* ---------- parseTimeString ---------- */
function parseTimeString(timeStr) {
  // e.g. '20231018123000' => '2023-10-18T12:30:00'
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
  justify-content: center; /* 按需要可改 space-between */
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.hrv-after-btn-group {
  display: flex;
  text-align: center;
  justify-content: center;
}
</style>
