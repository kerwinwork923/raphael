<template>
  <div class="progress-container">
    <!-- 1) 正數計時 + 圓圈 (顯示 elapsedTime) -->
    <div class="progress-border" :style="progressStyle">
      <div class="content">{{ formattedTime }}</div>
    </div>

    <!-- 2) 有檢測紀錄時，顯示提示 -->
    <div v-if="hasDetectRecord" class="completion-message">感謝您的使用</div>

    <!-- 3) BEFORE / RUNNING 狀態 => 使用前檢測 -->
    <div
      class="timeRing2btnGroup"
      v-if="
        currentState === DetectionState.BEFORE ||
        currentState === DetectionState.RUNNING
      "
    >
      <!-- BEFORE 狀態下: 「開始使用前檢測」按鈕 -->
      <button
        v-if="currentState === DetectionState.BEFORE"
        @click="toggleTimer"
        style="margin-bottom: 1rem; background-color: #74bc1f"
      >
        HRV檢測(使用前)
      </button>

      <!-- (原本 BEFORE 狀態的「重新檢測」按鈕，已移除/註解) -->

      <!-- RUNNING 狀態下: 「結束」按鈕 -->
      <button
        v-if="currentState === DetectionState.RUNNING"
        @click="toggleTimer"
        :style="buttonStyle"
      >
        {{ buttonText }}
      </button>

      <!-- RUNNING 狀態下: 只有使用前 (detectFlag='1') 時才顯示「重新檢測」按鈕 -->
      <button
        v-if="
          currentState === DetectionState.RUNNING && store.detectFlag === '1'
        "
        class="retry-btn"
        style="margin-bottom: 1rem"
        @click="resetAndRetest"
      >
        重新檢測
      </button>
    </div>

    <!-- 4) AFTER 狀態：依是否逾 30 分鐘 (hasOver30Mins) 顯示不同 UI -->
    <div
      v-if="currentState === DetectionState.AFTER"
      class="hrv-after-btn-group"
    >
      <!-- (a) 未超過30分鐘 => 只顯示「使用後檢測」 -->
      <div v-if="!hasOver30Mins">
        <button class="hrv-after-btn" @click="detectHRVAfter(UID.value)">
          HRV檢測(使用後)
        </button>
        <div class="completion-delayMessage">
          請在30分鐘內完成HRV檢測(使用後)
        </div>
      </div>

      <!-- (b) 逾30分鐘 => 多一個「放棄」按鈕 -->
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
  totalTime: { type: Number, default: 3600 }, // 預設總時長 (秒)
  productName: { type: String, default: "" }, // 產品名稱
  hasDetectRecord: { type: Boolean, default: false },
});

const router = useRouter();
const store = useCommon();

// [Enum 狀態]
const DetectionState = {
  BEFORE: "before", // 使用前
  RUNNING: "running", // 計時中(也算使用前還沒結束)
  AFTER: "after", // 使用後
};

// [核心狀態]
const currentState = ref(DetectionState.BEFORE);
const elapsedTime = ref(0);
const startTimestamp = ref(null);
const isCounting = ref(false);

// 判斷是否逾 30 分鐘 (後端會回傳 Status: "Y" or "N")
const hasOver30Mins = ref(false);

// 主按鈕顯示文案
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

// 主按鈕樣式
const buttonStyle = computed(() => {
  switch (currentState.value) {
    case DetectionState.BEFORE:
      return { backgroundColor: "#74BC1F", color: "#fff" };
    case DetectionState.RUNNING:
      return { backgroundColor: "#1FBCB3", color: "#fff" };
    case DetectionState.AFTER:
      return { backgroundColor: "#74BC1F", color: "#fff" };
    default:
      return { backgroundColor: "#E0E0E0", color: "#000" };
  }
});

// 顯示在圓圈上的時間 (格式: HH:MM:SS)
const formattedTime = computed(() => {
  const h = Math.floor(elapsedTime.value / 3600);
  const m = Math.floor((elapsedTime.value % 3600) / 60);
  const s = elapsedTime.value % 60;
  return [h, m, s].map((val) => String(val).padStart(2, "0")).join(":");
});

// 圓圈漸層顯示 (根據當前 elapsedTime 與 totalTime 比例)
const progressStyle = computed(() => {
  const ratio = Math.min(elapsedTime.value / props.totalTime, 1);
  const percent = (ratio * 100).toFixed(2);
  return {
    background: `conic-gradient(#74BC1F 0% ${percent}%, #ffffff ${percent}% 100%)`,
    transition: "background 0.1s linear",
  };
});

// LocalStorage 驗證 (若有 userData 才能初始化)
const localData = localStorage.getItem("userData");
const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};
if (!MID || !Token || !MAID || !Mobile) {
  console.error("用戶數據不完整，無法初始化");
  router.push("/");
}

// UID & Timer Interval
const UID = ref(null);
let timerInterval = null;

// --------------------- [核心函式] ---------------------
// 1) startTimer => 開始正數計時
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

// 2) stopTimer => 停止計時，但要同時檢查「使用前」&「使用後」都做完才算真正結束
// 2) stopTimer => 停止計時，但要同時檢查「使用前」是否完成 + 呼叫 API_UIDInfo_Search12() 看「使用後」有沒有做
async function stopTimer() {
  // 清除計時器
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  isCounting.value = false;
  console.log("計時結束 => 檢查使用前是否完成 + 使用後是否有資料");

  // 1) 檢查使用前(Flag=1)是否已完成
  const isExitBefore = await API_HRV2_UID_Flag_Info("1", UID.value);
  if (isExitBefore === "N") {
    alert("尚未完成使用前檢測，無法結束！");
    detectHRVBefore(UID.value); // 彈窗 or iFrame 進行使用前檢測
    return;
  }

  // 2) 再檢查「使用後」是否已做
  //    這裡示範使用 API_UIDInfo_Search12()，看後端 Status 或其他欄位有無做「使用後」。
  try {
    const data = await API_UIDInfo_Search12(); // 傳 productName 取得狀態
    if (!data) {
      // 後端回傳 NOData => 可能啥都沒做 => 直接判定使用後沒做
      alert("尚未做使用後檢測 (後端無資料)！");
      detectHRVAfter(UID.value);
      return;
    }
    // 若 data 有回傳 => 根據你的後端回傳欄位來判斷是否「使用後」真的完成
    // e.g. data.Result === "OK" && data.Status === "N" => 表示未做使用後
    if (data.Result === "OK" && data.Status === "N") {
      alert("尚未做使用後檢測，請先完成！");
      detectHRVAfter(UID.value);
      return;
    }

    // ----
    // ※ 或者你也可以改用 API_HRV2_UID_Flag_Info("2", UID.value) 來判斷
    // const isExitAfter = await API_HRV2_UID_Flag_Info("2", UID.value);
    // if (isExitAfter === "N") {
    //   alert("尚未完成使用後檢測，無法結束！");
    //   detectHRVAfter(UID.value);
    //   return;
    // }
    // ----
  } catch (err) {
    console.error("檢查使用後檢測(API_UIDInfo_Search12)失敗:", err);
    alert("檢查使用後檢測發生錯誤，無法結束！");
    return;
  }

  // 3) 如果「使用前」與「使用後」都 OK => 才真正結束 => 切 AFTER & useEndAPI
  currentState.value = DetectionState.AFTER;
  try {
    await useEndAPI();
    console.log("已完成前後檢測 => 正式結束");
  } catch (err) {
    console.error("useEndAPI 失敗:", err);
  }
}

// 3) toggleTimer => 根據目前 state，決定下一步 (start/stop/after)
async function toggleTimer() {
  switch (currentState.value) {
    case DetectionState.BEFORE:
      // 若已有 UID => 先去後端查是否已有 StartTime，若有則同步
      if (UID.value) {
        const resp = await API_MID_ProductName_UIDInfo();
        if (resp?.StartTime) {
          const ms = parseTimeString(resp.StartTime).getTime();
          startTimestamp.value = ms;
          elapsedTime.value = Math.floor((Date.now() - ms) / 1000);
        }
        startTimer();
      } else {
        // 若無 UID => 先呼叫 API_UseStart，並自動開啟使用前檢測
        const newRes = await useStartAPI();
        if (newRes?.UID) {
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
      // AFTER 狀態下 => 直接進入使用後檢測 (如按主按鈕)
      detectHRVAfter(UID.value);
      break;

    default:
      console.warn("未知狀態 => 不做任何事");
  }
}

// 4) detectHRVBefore => 進入使用前檢測 (彈窗 or iframe)，並開始計時
function detectHRVBefore(uidVal) {
  store.detectFlag = "1"; // Flag=1 => 使用前
  store.detectUID = uidVal;
  store.detectForm = props.productName;
  store.showHRVAlert = true;
  startTimer(); // 同時啟動計時
}

// 5) detectHRVAfter => 進入使用後檢測 (彈窗 or iframe)
async function detectHRVAfter(uidVal) {
  store.detectFlag = "2"; // Flag=2 => 使用後
  store.detectUID = uidVal;
  store.detectForm = `*${props.productName}`;
  store.showHRVAlert = true;

  try {
    const data = await API_UIDInfo_Search12();
    // 後端回傳 Status="Y" 代表已逾30分鐘
    if (data?.Status === "Y") {
      hasOver30Mins.value = true;
    } else {
      hasOver30Mins.value = false;
    }
  } catch (err) {
    console.error("detectHRVAfter => 失敗:", err);
  }
}

// 6) handleGiveUp => 放棄使用後檢測 => 刪除檢測紀錄 + 重置
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

// 7) doReset => 完整重置 (清除計時器 & 狀態 & UID)
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

/**
 * 8) resetAndRetest => 重新檢測 (刪除舊紀錄 + 重置 + 再次開始使用前檢測)
 * - 只在 RUNNING 狀態、且使用前 (store.detectFlag='1') 時可見
 */
async function resetAndRetest() {
  if (UID.value) {
    try {
      // 刪除後端舊紀錄 (API_DeleteStart)
      await API_DeleteStart();
    } catch (err) {
      console.error("重新檢測 - 刪除舊紀錄失敗:", err);
    }
  }
  // 前端重置
  doReset();
  // 再次進入流程 (會建立新UID並開始計時)
  toggleTimer();
}

// --------------------- [onMounted] ---------------------
onMounted(async () => {
  try {
    const resp = await API_MID_ProductName_UIDInfo();

    if (resp) {
      // 若後端回傳 OK => 代表有某些紀錄 (或 UID)
      UID.value = resp.UID;

      if (UID.value) {
        // 有 UID => 判斷 StartTime
        if (resp.StartTime) {
          // 有 StartTime => 計算是否還在 24 小時內
          const startMS = parseTimeString(resp.StartTime).getTime();
          const diff = Date.now() - startMS;
          if (diff <= 24 * 60 * 60 * 1000) {
            // 24 小時內 => 同步時間、直接進入 RUNNING
            startTimestamp.value = startMS;
            elapsedTime.value = Math.floor(diff / 1000);
            startTimer();
            currentState.value = DetectionState.RUNNING;
          } else {
            console.log("StartTime 超過24hr => 清除舊紀錄");
            await API_DeleteStart();
          }
        } else {
          // 沒有 StartTime => 還沒開始 => BEFORE
          console.log("沒有 StartTime => 保持 BEFORE 狀態");
          currentState.value = DetectionState.BEFORE;
        }
      } else {
        // 有 resp 但無 UID => 可能已經結束 => AFTER
        console.warn(
          "API_MID_ProductName_UIDInfo => 無 UID => 嘗試 AFTER 狀態"
        );
        const data = await API_UIDInfo_Search12();
        if (data?.Status === "Y") {
          hasOver30Mins.value = true;
        } else {
          hasOver30Mins.value = false;
        }
        currentState.value = DetectionState.AFTER;
      }
    } else {
      // 後端回傳 NOData => BEFORE
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

// B) 檢查使用前/後 Flag => "1" or "2"
async function API_HRV2_UID_Flag_Info(Flag, uidVal) {
  if (!uidVal) return null;
  try {
    const r = await apiRequest(
      "https://23700999.com:8081/HMA/API_HRV2_UID_Flag_Info.jsp",
      { MID, Token, MAID, Mobile, UID: uidVal, Flag }
    );
    // r.Result === "OK" => r.IsExit => "Y" or "N"
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

// C) 建立使用前 => UseStart (回傳新 UID)
async function useStartAPI() {
  try {
    const r = await apiRequest(
      "https://23700999.com:8081/HMA/API_UseStart.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );
    if (r?.UID) {
      console.log("成功創建 UID:", r.UID);
      return r;
    } else {
      console.log("useStartAPI => fail:", r);
      return null;
    }
  } catch (err) {
    console.error("useStartAPI => err:", err);
    return null;
  }
}

// D) 結束 => AFTER
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

// E) 判斷是否逾30分鐘 => e.g. r.Status="Y" or "N"
async function API_UIDInfo_Search12() {
  try {
    const r = await apiRequest(
      "https://23700999.com:8081/HMA/API_UIDInfo_Search12.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );
    if (r?.Result === "OK") {
      return r; // e.g. { Status: "Y" }
    } else {
      console.log("API_UIDInfo_Search12 => NOData or fail:", r);
      return null;
    }
  } catch (err) {
    console.error("API_UIDInfo_Search12 => err:", err);
    return null;
  }
}

// F) 刪除檢測紀錄 => 保留使用紀錄 (API_DeleteStart)
async function API_DeleteStart() {
  if (!UID.value) {
    console.log("尚無 UID，不需呼叫 API_DeleteStart");
    return;
  }
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
    console.log("API_DeleteStart 呼叫成功:", response);
  } catch (error) {
    console.error("API_DeleteStart 呼叫失敗:", error);
    throw error;
  }
}

// 解析後端時間字串 => "20250211145046" => new Date("2025-02-11T14:50:46")
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
  background-color: #f6f6f6;
  width: 100%;
  max-width: 768px;
  padding: 1rem;
}

/* 圓圈區塊 */
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

/* 按鈕 */
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

/* 提示文字 */
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

/* 按鈕並排 */
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

/* 重新檢測按鈕 */
.retry-btn {
  background-color: #74bc1f;
  margin-left: 8px;
}
</style>
