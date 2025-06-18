<template>
  <div class="progress-container">
    <!-- 倒數圈 -->
    <div class="progress-border" :style="progressStyle">
      <div class="content">{{ formattedTime }}</div>
    </div>

    <!-- 按鈕群組 -->
    <div class="flex">
      <button
        :style="buttonStyle"
        @click="toggleTimer"
        :disabled="isButtonDisabled"
      >
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

// ============ [ Props ] ============
const props = defineProps({
  /** 倒數的總秒數 (預設 3600 秒 = 1 小時) */
  totalTime: {
    type: Number,
    default: 3600,
  },
  /** 商品名稱 (作為辨識用) */
  productName: {
    type: String,
    default: "",
  }
});

const router = useRouter();

// ============ [檢測狀態枚舉] ============
const DetectionState = {
  BEFORE: "before", // 檢測前
  RUNNING: "running", // 倒數中
};

// ============ [核心響應式資料] ============
const currentState = ref(DetectionState.BEFORE);
const remainingTime = ref(props.totalTime * 1000);
const isCounting = ref(false);
const UID = ref("");
const isButtonDisabled = ref(false);
let timerInterval = null;
let lastTick = 0;

// ============ [按鈕文字] ============
const buttonText = computed(() => {
  switch (currentState.value) {
    case DetectionState.BEFORE:
      return "開始紀錄";
    case DetectionState.RUNNING:
      return "重新紀錄";
    default:
      return "未知狀態";
  }
});

// ============ [按鈕樣式] ============
const buttonStyle = computed(() => {
  return { backgroundColor: "#74BC1F", color: "#fff" };
});

// ============ [倒數圈的「漸層進度」] ============
const progressStyle = computed(() => {
  const used = props.totalTime * 1000 - remainingTime.value;
  const progress = Math.min((used / (props.totalTime * 1000)) * 100, 100);
  return {
    background: `conic-gradient(#74BC1F 0% ${progress}%, #ffffff ${progress}% 100%)`,
    transition: "background 0.1s linear",
  };
});

// ============ [顯示用: 時間 HH:mm:ss] ============
const formattedTime = computed(() => {
  const totalSec = Math.floor(remainingTime.value / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
});

// ============ [LocalStorage 驗證] ============
const localData = JSON.parse(localStorage.getItem("userData") || "{}");
const { MID = "", Token = "", MAID = "", Mobile = "" } = localData;

if (!MID || !Token || !MAID || !Mobile) {
  console.error("用戶資料不完整，跳回登入");
  router.push("/");
}

// ---------------- API 封裝 ----------------
async function apiRequest(url, payload) {
  try {
    const { data } = await axios.post(url, payload);
    return data;
  } catch (err) {
    console.error(`[API失敗] ${url}`, err);
    return null;
  }
}

async function useStartAPI() {
  const res = await apiRequest(
    "https://23700999.com:8081/HMA/API_UseStart.jsp",
    {
      MID,
      Token,
      MAID,
      Mobile,
      ProductName: props.productName,
    }
  );
  if (!res || !res.UID) {
    console.warn("useStartAPI => 無法建立 UID");
    return null;
  }
  return res;
}

async function useEndAPI() {
  if (!UID.value) return;
  await apiRequest("https://23700999.com:8081/HMA/API_UseEnd.jsp", {
    MID,
    Token,
    MAID,
    Mobile,
    UID: UID.value,
  });
}

async function API_DeleteStart() {
  if (!UID.value) return;
  await apiRequest("https://23700999.com:8081/HMA/API_DeleteStart.jsp", {
    MID,
    Token,
    MAID,
    Mobile,
    UID: UID.value,
    ProductName: props.productName,
  });
}

async function API_MID_ProductName_UIDInfo() {
  return apiRequest(
    "https://23700999.com:8081/HMA/API_MID_ProductName_UIDInfo.jsp",
    {
      MID,
      Token,
      MAID,
      Mobile,
      ProductName: props.productName,
    }
  );
}

// ---------------- [倒數計時] ----------------
function startCountdown() {
  console.log("開始倒數 => 剩餘秒數:", remainingTime.value / 1000);
  isCounting.value = true;
  lastTick = Date.now();

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(async () => {
    const now = Date.now();
    const delta = now - lastTick;
    lastTick = now;
    remainingTime.value = Math.max(remainingTime.value - delta, 0);

    if (remainingTime.value <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      isCounting.value = false;
      await useEndAPI();
      resetDetectionState();
      router.go(0);
    }
  }, 1000);
}

// ---------------- [主要按鈕邏輯] ----------------
async function toggleTimer() {
  if (isButtonDisabled.value) return;
  isButtonDisabled.value = true;
  try {
    console.log("按鈕點擊 => 狀態:", currentState.value);
    switch (currentState.value) {
      case DetectionState.BEFORE: {
        const res = await useStartAPI();
        if (res?.UID) {
          UID.value = res.UID;
          currentState.value = DetectionState.RUNNING;
          startCountdown();
        }
        break;
      }

      case DetectionState.RUNNING: {
        if (confirm("確定要重新檢測嗎？這會清除本次倒數記錄。")) {
          await API_DeleteStart();
          resetDetectionState();
        }
        break;
      }

      default:
        console.warn("未知狀態:", currentState.value);
    }
  } finally {
    isButtonDisabled.value = false;
  }
}

// ---------------- [重置邏輯] ----------------
function resetDetectionState() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  currentState.value = DetectionState.BEFORE;
  remainingTime.value = props.totalTime * 1000;
  isCounting.value = false;
  UID.value = "";
  console.log("已重置 => 回到 BEFORE 狀態");
}

// ---------------- [onMounted 初始化] ----------------
onMounted(async () => {
  try {
    const res = await API_MID_ProductName_UIDInfo();
    if (res?.UID) {
      UID.value = res.UID;

      if (res.StartTime) {
        const startTime = parseTimeString(res.StartTime);
        const usedMs = Date.now() - startTime.getTime();
        const remainMs = props.totalTime * 1000 - usedMs;
        if (remainMs > 0) {
          remainingTime.value = remainMs;
          currentState.value = DetectionState.RUNNING;
          startCountdown();
        } else {
          await useEndAPI();
          resetDetectionState();
        }
      }
    }
  } catch (error) {
    console.error("onMounted 初始化失敗:", error);
  }
});

/** 字串轉 Date (例如 20231018123000 => 2023-10-18T12:30:00) */
function parseTimeString(timeStr) {
  if (!timeStr || timeStr.length < 14) return new Date();
  return new Date(
    `${timeStr.slice(0, 4)}-${timeStr.slice(4, 6)}-${timeStr.slice(6, 8)}T` +
      `${timeStr.slice(8, 10)}:${timeStr.slice(10, 12)}:${timeStr.slice(
        12,
        14
      )}`
  );
}
</script>

<style scoped lang="scss">
.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background-color: rgb(246, 246, 246);
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
}

.flex {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 0.5rem 0;
}

.completion-message {
  color: #74bc1f;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  letter-spacing: 0.09px;
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
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  letter-spacing: 0.09px;
  transition: background-color 0.3s ease;
  box-shadow: 0px -2px 3px 0px rgba(0, 0, 0, 0.25) inset;

  &:disabled {
    background-color: #e0e0e0;
    cursor: not-allowed;
  }
}
</style>
