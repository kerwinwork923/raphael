<template>
  <div class="progress-container">
    <!-- ====== 計時圈 ====== -->
    <div class="progress-border" :style="{ background: progressGradient }">
      <div class="content">{{ formattedTime }}</div>
    </div>

    <!-- ====== 按鈕群組 ====== -->
    <div class="timerButtonGroup">
      <!-- isExpired 時才顯示使用後檢測 / 結束 / 放棄按鈕 -->
      <template v-if="isExpired">
        <div class="expired-options">
          <!-- 使用後檢測 -->
          <button
            style="background-color: #74bc1f"
            @click="detectHRVAfter(UID)"
          >
            HRV檢測(使用後)
          </button>

          <!-- 結束 (若還沒設定結束時間才顯示) -->
          <button
            v-if="!hasEndTime"
            style="background-color: #1fbcb3"
            @click="handleComplete"
          >
            結束
          </button>
        </div>
      </template>

      <!-- 否則顯示【重新檢測】或【開始/結束/使用後檢測】 -->
      <template v-else>
        <!-- 重新檢測 (RUNNING 狀態才顯示) -->
        <button
          v-if="currentDetectionState === DetectionState.RUNNING"
          style="background-color: #74bc1f; padding: 8px"
          @click="confirmRestart"
        >
          重新檢測
        </button>

        <!-- 根據 currentDetectionState 切換開始/結束/使用後檢測等按鈕文字 -->
        <button :style="buttonStyle" @click="toggleTimer">
          {{ buttonText }}
        </button>
      </template>
    </div>

    <!-- 自行設定結束時間 (時間選擇器) -->
    <div v-if="showTimePicker" class="TimeRingForgetBox">
      <label>選擇結束時間:</label>
      <input type="datetime-local" v-model="selectedEndTime" />
      <button @click="confirmEndTime">確認</button>
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
  // 如果目前沒有在計時，但上次測試有持續時間，就顯示上次的持續時間
  if (elapsedTime.value <= 0 && lastDuration.value) {
    return lastDuration.value;
  }
  // 否則正常計算 elapsedTime 格式
  const hours = Math.floor(elapsedTime.value / 3600);
  const minutes = Math.floor((elapsedTime.value % 3600) / 60);
  const seconds = elapsedTime.value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
});

// 重新檢測前確認
const confirmRestart = () => {
  if (confirm("確定要重新檢測嗎？這將會清除當前檢測進度！")) {
    API_DeleteStart();
  }
};

// UID / BID / Store ...
const UID = ref(null);
const BID = ref(null);
import { useCommon } from "../stores/common";
const store = useCommon();

const isExpired = ref(null);
const showTimePicker = ref(false);
const selectedEndTime = ref(null);

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

  // **⚠️ 修正 UI 狀態異常**
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
  console.log("⏹ 停止計時器，準備檢查是否可以結束");

  // **🔹 確保計時器停止**
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
  isCounting.value = false;

  // **🔹 先檢查「使用前檢測是否真的完成」**
  const isExitValue = await API_HRV2_UID_Flag_Info("1", UID.value);
  console.log("🔎 使用前檢測完成狀態:", isExitValue);

  if (isExitValue === "N") {
    alert("尚未完成使用前檢測，無法結束！");

    // ✅ **保持 `RUNNING` 狀態**
    currentDetectionState.value = DetectionState.RUNNING;

    // ✅ **確保 `elapsedTime` 不變**
    console.log("⚠️ 保持 `RUNNING` 狀態，計時數值不變:", elapsedTime.value);

    return; // **🚨 直接 return，不繼續執行後續結束邏輯**
  }

  console.log("✅ 使用前檢測已完成，更新狀態為 `AFTER`");

  // **🔹 更新狀態為 AFTER**
  currentDetectionState.value = DetectionState.AFTER;

  try {
    // **🔹 調用結束 API**
    await useEndAPI();
    console.log("✅ 計時已結束，API 調用成功");

    // **🔹 進入使用後檢測邏輯**
    detectHRVAfter(UID.value);
  } catch (error) {
    console.error("❌ 結束 API 調用失敗：", error);
  }
};

// ---------- 使用前/使用後檢測邏輯 ----------
const detectHRVBefore = (UIDVal) => {
  store.detectFlag = "1";
  store.detectUID = UIDVal;
  store.detectForm = props.productName;
  store.showHRVForUseAlert = true;
  store.HRVAlertTitle = "(使用前)-HRV量測";
};

const detectHRVAfter = (UIDVal) => {
  store.detectFlag = "2";
  store.detectUID = UIDVal;
  store.detectForm = `*${props.productName}`;
  store.showHRVForUseAlert = true;
  store.HRVAlertTitle = "(使用後)-HRV量測";
  console.log("使用後檢測已啟動", { UIDVal, productName: props.productName });
};

// ---------- 切換按鈕行為 ----------
const toggleTimer = async () => {
  switch (currentDetectionState.value) {
    case DetectionState.BEFORE:
      if (!UID.value) {
        const response = await useStartAPI();
        if (response?.UID) {
          detectHRVBefore(response.UID);
          startTimestamp.value = Date.now(); // ⬅️ 確保 `startTimestamp` 被設置
          startTimer();
        } else {
          console.error("創建 UID 失敗");
        }
      } else {
        console.log("已有 UID，從 API 時間開始 HRV 檢測");
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
          startTimestamp.value = Date.now(); // ⬅️ 這裡也手動設置
          console.warn("舊的 UID 可能已失效，創建新的 UID");
          const newResponse = await useStartAPI();
          if (newResponse?.UID) {
            detectHRVBefore(newResponse.UID);
          } else {
            console.error("創建 UID 失敗");
            return;
          }
        }
        startTimer();
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

  // 轉換 `selectedEndTime` 成 API 需要的格式 `yyyyMMddHHmmss`
  const formattedEndTime = formatDateTime(selectedEndTime.value);
  console.log("選擇的結束時間:", formattedEndTime);

  try {
    await useEndAPI(formattedEndTime);

    showTimePicker.value = false; // 隱藏時間選擇
    isExpired.value = false; // 不再顯示超時狀態
    currentDetectionState.value = DetectionState.AFTER; // 更新狀態

    console.log("檢測已手動結束");
  } catch (error) {
    console.error("結束檢測時發生錯誤:", error);
  }
};

// 轉換 `datetime-local` 值為 `yyyyMMddHHmmss` 格式
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

//1.MID, 2.ProductName, 3.沒有結束時間 的 4.最新UID資料(開始時間是最晚的)
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

    // 如果 API 回傳的狀態為 1，代表已放棄，則先重置
    if (response.BeforeHRVAbandon === "Y") {
      console.warn("已放棄前測 (BeforeHRVAbandon=Y)。");
      // ...
    }

    // 後續處理 StartTime 與 UID
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

const API_HRV2_UID_Flag_Info = async (Flag, UIDVal) => {
  if (!UIDVal) {
    console.error("❌ UID 為 null，無法調用 API_HRV2_UID_Flag_Info");
    return null;
  }

  try {
    const response = await apiRequest(
      "https://23700999.com:8081/HMA/API_HRV2_UID_Flag_Info.jsp",
      { MID, Token, MAID, Mobile, UID: UIDVal, Flag }
    );

    if (response?.Result === "OK") {
      console.log("✅ 成功獲取 HRV2 檢測資料狀態：", response);

      // **記錄 API 回應的狀態**
      const isExit = response.IsExit; // "Y" 或 "N"
      const isAbandon = response.IsAbandon; // "Y" 或 "N"
      const data = await API_UIDInfo(UIDVal);
      // **檢查 `Flag === "1"` (檢測前測)**
      if (Flag === "1") {
        if (isExit === "N") {
          if (data.BeforeHRVAbandon !== "Y") {
            detectHRVBefore(UIDVal);
          }
        }
      }

      // **檢查 `Flag === "2"` (檢測後測)**
      if (Flag === "2") {
        if (isExit === "N") {
          if (data.AfterHRVAbandon !== "Y") {
            detectHRVAfter(UIDVal);
          }
        }
      }

      return { isExit, isAbandon }; // 回傳結果，讓其他函式可使用
    } else {
      console.error("❌ 無法獲取 HRV2 資料狀態：", response);
      return null;
    }
  } catch (error) {
    console.error("❌ API 調用失敗：", error);
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

  const payload = {
    MID,
    Token,
    MAID,
    Mobile,
    UID: UID.value,
    EndTime: endTime || "", // 若沒有選擇時間則傳空字串
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

const hasEndTime = ref(false); // 新增狀態來判斷是否有結束時間

const lastDuration = ref(null);

const parseDateTime = (dtStr) => {
  return new Date(
    `${dtStr.slice(0, 4)}-${dtStr.slice(4, 6)}-${dtStr.slice(
      6,
      8
    )}T${dtStr.slice(8, 10)}:${dtStr.slice(10, 12)}:${dtStr.slice(12)}`
  );
};

const formatSeconds = (sec) => {
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
};
//有 開始 結束時間 有ProductName條件   有檢測前資料  無檢測後資料  最新UID資料
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
        BeforeHRVDetect: "Y",
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

      // 如果有 StartTime 與 EndTime，計算上次測試持續時間
      if (response.StartTime && response.EndTime) {
        const startDate = parseDateTime(response.StartTime);
        const endDate = parseDateTime(response.EndTime);
        const diffSec = Math.floor((endDate - startDate) / 1000);
        lastDuration.value = formatSeconds(diffSec);
        detectHRVAfter(UID.value)
        console.log("上次測試持續時間:", lastDuration.value);
      }

      // 設定 hasEndTime
      hasEndTime.value = true;
      console.log("✅ 已完成 HRV 使用後檢測，不再顯示『結束』按鈕");
    } else {
      console.log("❌ 沒有找到對應的數據，可能未進行測試");
    }
  } catch (err) {
    console.log("❌ API_UIDInfo_Search12 調用失敗:", err);
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
  console.log("🔍 onMounted 啟動，開始初始化 HRV 狀態...");

  try {
    // **取得最新的 UID 和狀態**
    const response = await API_MID_ProductName_UIDInfo();

    if (response) {
      UID.value = response.UID;

      if (response.BeforeHRVAbandon === "Y") {
        console.warn("已放棄前測 (BeforeHRVAbandon=Y)。");

        // 依需求決定是否還要繼續計時 / 重置等
      } else if (response.AfterHRVAbandon === "Y") {
        console.warn("已放棄後測 (AfterHRVAbandon=Y)。");
        // ...
      }

      console.log("✅ 成功獲取有效的 UID：", UID.value);

      // 2️⃣ 確認 HRV 前測是否完成
      const isBeforeTestCompleted = await API_HRV2_UID_Flag_Info(
        "1",
        UID.value
      );
      console.log("🔎 HRV 前測紀錄:", isBeforeTestCompleted);

      if (isBeforeTestCompleted === "Y") {
        console.log("✅ HRV 前測已完成，進入 RUNNING 狀態");
        currentDetectionState.value = DetectionState.RUNNING;
        startTimer();
      } else {
        console.log("⚠️ HRV 前測未完成，回到 BEFORE 狀態");
        currentDetectionState.value = DetectionState.BEFORE;
      }

      // 4️⃣ 設定計時器
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
      console.warn("❌ 無法獲取使用者資料，檢查 API_UIDInfo_Search12()");

      // 🔍 **當 `NoData` 時，執行額外檢查**
      const search12Response = await API_UIDInfo_Search12();

      if (search12Response && search12Response.StartTime) {
        console.log("⏳ API_UIDInfo_Search12() 取得 StartTime，恢復計時...");
        startTimestamp.value = new Date(
          `${search12Response.StartTime.slice(
            0,
            4
          )}-${search12Response.StartTime.slice(
            4,
            6
          )}-${search12Response.StartTime.slice(
            6,
            8
          )}T${search12Response.StartTime.slice(
            8,
            10
          )}:${search12Response.StartTime.slice(
            10,
            12
          )}:${search12Response.StartTime.slice(12)}`
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
        console.warn("❌ 無法取得有效的時間資訊，將不使用預設時間");
        // 你可以選擇不執行任何操作，或者將 elapsedTime 保持為 0
        elapsedTime.value = 0;
      }
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

.progress-container .delay-message {
  color: #ec4f4f;
  text-align: justify;

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
</style>
