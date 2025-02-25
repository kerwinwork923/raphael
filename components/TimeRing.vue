<template>
  <div class="progress-container">
    <!-- 倒數圈 -->
    <div class="progress-border" :style="progressStyle">
      <div class="content">{{ formattedTime }}</div>
    </div>

    <!-- 已有檢測紀錄時，顯示感謝訊息 -->
    <!-- <div v-if="hasDetectRecord" class="completion-message">感謝您的使用</div> -->

    <!-- 按鈕群組 -->
    <div class="flex">
      <!-- BEFORE / RUNNING 狀態才顯示主要按鈕 -->
      <!-- :disabled="hasDetectRecord" -->
      <button
        v-if="currentState !== DetectionState.AFTER"
        :style="buttonStyle"
        @click="toggleTimer"
        :disabled="isButtonDisabled"
      >
        {{ buttonText }}
      </button>

      <!-- AFTER 狀態時顯示 "使用後檢測" 按鈕 -->
      <template v-if="currentState === DetectionState.AFTER">
        <button :style="buttonStyle" @click="toggleTimer">
          {{ buttonText }}
        </button>
      </template>
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
  },
  /** 是否已經有完整檢測記錄 (例如已完成前後測) */
  hasDetectRecord: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();

// ============ [Store 範例] ============
import { useCommon } from "../stores/common";
const store = useCommon();
// store.detectFlag / store.detectUID / store.detectForm / store.showHRVForUseAlert / store.HRVAlertTitle

// ============ [檢測狀態枚舉] ============
const DetectionState = {
  BEFORE: "before", // 檢測前
  RUNNING: "running", // 倒數中
  AFTER: "after", // 檢測後
};

// ============ [核心響應式資料] ============
const currentState = ref(DetectionState.BEFORE);
const remainingTime = ref(props.totalTime * 1000);
const isCounting = ref(false);
const UID = ref("");
// 新增一個用於防止連點的布林變數
const isButtonDisabled = ref(false);
let timerInterval = null;
let lastTick = 0;

// ============ [按鈕文字] ============
const buttonText = computed(() => {
  switch (currentState.value) {
    case DetectionState.BEFORE:
      return "開始 HRV 檢測";
    case DetectionState.RUNNING:
      return "重新檢測";
    case DetectionState.AFTER:
      return "HRV檢測(使用後)";
    default:
      return "未知狀態";
  }
});

// ============ [按鈕樣式] ============
const buttonStyle = computed(() => {
  switch (currentState.value) {
    case DetectionState.BEFORE:
    case DetectionState.RUNNING:
    case DetectionState.AFTER:
      return { backgroundColor: "#74BC1F", color: "#fff" };
    default:
      return { backgroundColor: "#E0E0E0", color: "#000" };
  }
});

// ============ [倒數圈的「漸層進度」] ============
const progressStyle = computed(() => {
  // if (props.hasDetectRecord) {
  //   return {
  //     background: `conic-gradient(#74BC1F 0% 100%, #74BC1F 100% 100%)`,
  //     transition: "background 0.1s linear",
  //   };
  // }
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
  return res; // { UID: "...", Result: "OK" }
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

async function API_HRV2_UID_Flag_Info(flag, uidVal) {
  if (!uidVal) return null;
  // 呼叫 API
  const res = await apiRequest(
    "https://23700999.com:8081/HMA/API_HRV2_UID_Flag_Info.jsp",
    {
      MID,
      Token,
      MAID,
      Mobile,
      UID: uidVal,
      Flag: flag,
    }
  );

  if (res) {
    // 原本 "response.IsExit" => 改成 "res.IsExit"
    const isExit = res.IsExit; // "Y" 或 "N"
    // 同理, 原本 "UIDVal" => 改成 "uidVal"
    const data = await API_UIDInfo(uidVal);

    // 前測
    if (flag === "1") {
      if (isExit === "N") {
        if (data.BeforeHRVAbandon !== "Y") {
          detectHRVBefore(uidVal);
        }
      }
    }
    // 後測
    if (flag === "2") {
      if (isExit === "N") {
        if (data.AfterHRVAbandon !== "Y") {
          detectHRVAfter(uidVal);
        }
      }
    }
  }

  return res?.IsExit; // "Y" or "N"
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

// ---------------- [使用前/後檢測觸發] ----------------
function detectHRVBefore(uidVal) {
  store.detectFlag = "1";
  store.detectUID = uidVal;
  store.detectForm = props.productName;
  store.showHRVForUseAlert = true;
  store.HRVAlertTitle = "(使用前)-HRV量測";
  console.log("已呼叫 '使用前檢測' => UID:", uidVal);
}

function detectHRVAfter(uidVal) {
  store.detectFlag = "2";
  store.detectUID = uidVal;
  store.detectForm = `*${props.productName}`;
  store.showHRVForUseAlert = true;
  store.HRVAlertTitle = "(使用後)-HRV量測";
  console.log("已呼叫 '使用後檢測' => UID:", uidVal);
}

const API_UIDInfo = async (UIDVal) => {
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_UIDInfo.jsp",
      { MID, Token, MAID, Mobile, UID: UIDVal }
    );

    if (response?.Result === "OK") {
      return response;
    } else {
    }
  } catch (error) {}
};

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

      // 結束 + 檢查後測
      await useEndAPI();
      detectHRVAfter(UID.value);
      // const afterFlag = await API_HRV2_UID_Flag_Info("2", UID.value);
      // if (afterFlag === "N") {
      //   currentState.value = DetectionState.AFTER;
      //   detectHRVAfter(UID.value);
      // } else {
      //   resetDetectionState();
      // }
    }
  }, 1000);
}
const parseDateTime = (dtStr) => {
  return new Date(
    `${dtStr.slice(0, 4)}-${dtStr.slice(4, 6)}-${dtStr.slice(
      6,
      8
    )}T${dtStr.slice(8, 10)}:${dtStr.slice(10, 12)}:${dtStr.slice(12)}`
  );
};

const API_UIDInfo_Search12 = async () => {
  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_UIDInfo_Search12.jsp",
      {
        MID,
        Token,
        MAID,
        Mobile,
        ProductName: props.productName,
        BeforeHRVDetect: "N",
      }
    );

    if (response && response.Result !== "NOData") {
      if (response.AfterHRVAbandon === "Y") {
        return;
      }

      // 先取出並檢查 CheckTime 是否存在
      const checkTime = response.CheckTime
        ? parseDateTime(response.CheckTime)
        : null;

      if (checkTime) {
        const now = new Date();
        const hoursDifference = (now - checkTime) / (1000 * 60 * 60);
        if (hoursDifference > 24) {
          console.log("超過 24 小時，不進行後續判斷");
          return;
        }
      }

      // 設定 UID
      UID.value = response.UID;
      console.log("🔍 取得 UID:", UID.value);
      remainingTime.value = 0;
      detectHRVAfter(UID.value);
    } else {
      console.log("❌ 沒有找到對應的數據，可能未進行測試");
    }
  } catch (err) {
    console.log("❌ API_UIDInfo_Search12 調用失敗:", err);
  }
};

// ---------------- [主要按鈕邏輯] ----------------
async function toggleTimer() {
  if (isButtonDisabled.value) return;
  isButtonDisabled.value = true;
  try {
    console.log("按鈕點擊 => 狀態:", currentState.value);
    switch (currentState.value) {
      case DetectionState.BEFORE: {
        // Step 1: 若尚未有 UID => 先產生 UID
        if (!UID.value) {
          const res = await useStartAPI();
          if (res?.UID) {
            UID.value = res.UID;
          } else {
            console.error("無法建立 UID，無法繼續");
            return;
          }
        }
        // Step 2: 直接呼叫「使用前檢測」彈窗
        detectHRVBefore(UID.value);
        // （選擇性）這邊「不」立即 startCountdown，等使用者做完前測後再開始
        // 若想直接開始，您可以在這裡呼叫 startCountdown()
        break;
      }

      case DetectionState.RUNNING: {
        // => 重新檢測
        if (confirm("確定要重新檢測嗎？這會清除本次倒數記錄。")) {
          await API_DeleteStart();
          resetDetectionState();
        }
        break;
      }

      case DetectionState.AFTER: {
        // => 使用後檢測
        detectHRVAfter(UID.value);
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
  // 假如您還想判斷「是否有未完成的倒數」或「是否有已結束但沒做後測」的狀況，可保留原本的流程
  // 以下僅保留最簡化的寫法

  try {
    const res = await API_MID_ProductName_UIDInfo();
    if (res?.UID) {
      UID.value = res.UID;

      // 確認 HRV 前測是否完成
      const isBeforeTestCompleted = await API_HRV2_UID_Flag_Info(
        "1",
        UID.value
      );
      console.log("🔎 HRV 前測紀錄:", isBeforeTestCompleted);
      // 若後端表示這筆 UID 已開始倒數 => 重新計算剩餘時間
      if (res.StartTime) {
        const startTime = parseTimeString(res.StartTime);
        const usedMs = Date.now() - startTime.getTime();
        const remainMs = props.totalTime * 1000 - usedMs;
        if (remainMs > 0) {
          remainingTime.value = remainMs;
          currentState.value = DetectionState.RUNNING;
          startCountdown();
        } else {
          // 已超時 => 自動結束
          await useEndAPI();
          resetDetectionState();
        }
      }

      // 若後端UID有值但無StartTime => 視同還沒正式開始 => 保持 BEFORE
    } else {
      await API_UIDInfo_Search12();
    }
    // else => 沒有 UID => 什麼都不做，保持 BEFORE
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
