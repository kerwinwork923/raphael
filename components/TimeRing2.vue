<template>
  <div class="progress-container">
    <div class="progress-border" :style="{ background: progressGradient }">
      <div class="content">{{ formattedTime }}</div>
    </div>

    <div class="timerButtonGroup">
      <template v-if="isExpired">
        <div class="expired-options">
          <button
            style="background-color: #74bc1f"
            @click="detectHRVAfter(UID)"
          >
            HRV檢測(使用後)
          </button>
          <button
            v-if="!hasEndTime"
            style="background-color: #1fbcb3"
            @click="handleComplete"
          >
            結束
          </button>
          <button style="background-color: #ec4f4f" @click="handleAbandon">
            放棄
          </button>
        </div>
      </template>

      <template v-else>
        <!-- ✅ 重新檢測：新增確認框 -->
        <button
          v-if="currentDetectionState === DetectionState.RUNNING"
          style="background-color: #74bc1f; padding: 8px"
          @click="confirmRestart"
        >
          重新檢測
        </button>

        <button :style="buttonStyle" @click="toggleTimer">
          {{ buttonText }}
        </button>
      </template>
    </div>

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
  if (elapsedTime.value < 0) {
    return "00:00:00"; // 直接歸零，避免 -1:-1:-1
  }

  const hours = Math.floor(elapsedTime.value / 3600);
  const minutes = Math.floor((elapsedTime.value % 3600) / 60);
  const seconds = elapsedTime.value % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});


// 是否可點擊按鈕
const isButtonEnabled = ref(true);

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
  store.detectFlag = "1";
  store.detectUID = UIDVal;
  store.detectForm = props.productName;
  store.showHRVAlert = true;

  // 🔥 **重設 startTimestamp，確保計時器正確啟動**
  startTimestamp.value = Date.now();
  elapsedTime.value = 0; // 確保計時不會出錯
  startTimer();
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
        console.log("已有 UID，從 API 時間開始 HRV 檢測");
        const response = await API_MID_ProductName_UIDInfo();
        if (response?.StartTime) {
          // 先把後端的 StartTime 轉成毫秒
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

          // 這裡同時更新 startTimestamp + elapsedTime
          startTimestamp.value = startTime;
          elapsedTime.value = Math.floor((Date.now() - startTime) / 1000);
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

    case DetectionState.AFTER:
      // 也可以手動執行使用後檢測
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
    hasAbandoned.value = true; // 確保重新檢測不再顯示

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

    console.log("✅ 取得 UID：", response.UID);
    console.log("✅ 取得 StartTime：", response.StartTime);

    const UIDResponse = response.UID;
    if (!UIDResponse) {
      console.warn("⚠️ UID 為 null，無法繼續後續操作");
      return null;
    }

    if (response.StartTime) {
      // ✅ 解析 StartTime
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
      UID.value = response.UID;
      console.log("🔍 取得 UID:", UID.value);

      // 🔍 檢查 HRV 後測是否完成 (IsExit: "N" 代表未完成)
      if (response.IsExit === "N") {
        console.log("⚠️ 未完成 HRV 使用後檢測，請立即進行");
        alert("尚未完成使用後 HRV 檢測，請立即進行！");
        detectHRVAfter(response.UID);
        return;
      }

      console.log("✅ HRV 使用後檢測已完成");

      // 🔍 確認時間是否超過 12 小時
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

        if (hoursDifference > 12) {
          console.log("⚠️ 超過 12 小時，設定 isExpired 為 true");
          isExpired.value = true;
        } else {
          console.log("✅ 未超過 12 小時，不顯示超時狀態");
          isExpired.value = false;
        }
      }

      // ✅ **隱藏結束按鈕**
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
    const response = await API_MID_ProductName_UIDInfo();
    if (response) {
      UID.value = response.UID;

      if (UID.value) {
        console.log("✅ 成功獲取有效的 UID：", UID.value);

        // 🔍 確認 HRV 前測是否完成
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

        // 🔍 確認 HRV 後測是否完成
        const isAfterTestCompleted = await API_HRV2_UID_Flag_Info(
          "2",
          UID.value
        );
        console.log("🔎 HRV 後測紀錄:", isAfterTestCompleted);

        if (isAfterTestCompleted === "Y") {
          console.log("✅ HRV 後測已完成，進入 AFTER 狀態");
          currentDetectionState.value = DetectionState.AFTER;
        }

        // 🛠 **修正 UI 顯示異常：檢查 StartTime**
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

          // **⚠️ 修正 UI 異常**
          if (elapsedTime.value > 0) {
            console.log("🔄 自動切換至 RUNNING 狀態");
            currentDetectionState.value = DetectionState.RUNNING;
            startTimer();
          }
        } else {
          console.warn("⚠️ StartTime 不存在，計時器將從 0 開始");
        }
      } else {
        console.warn("⚠️ 無舊 UID，創建新的檢測記錄");
        const startResponse = await useStartAPI();
        if (startResponse?.UID) {
          UID.value = startResponse.UID;
          detectHRVBefore(UID.value);
        }
      }
    } else {
      console.warn("❌ 無法獲取使用者資料");
    }
  } catch (error) {
    console.error("❌ 初始化失敗：", error);
  }
});

const handleAbandon = async () => {
  console.log("🚨 用戶選擇放棄，提交 HRV 數據，並結束測試...");

  if (!UID.value) {
    console.warn("⚠️ 無法執行放棄，因為 UID 為空");
    return;
  }

  try {
    // 🟢 調用 API_HRV2Save.jsp 來儲存 HRV 相關數據 (Flag: "2" -> 使用後檢測)
    const saveResponse = await apiRequest(
      "https://23700999.com:8081/HMA/API_HRV2Save.jsp",
      {
        MID,
        MAID,
        Token,
        Mobile,
        PNS: "",
        SNS: "",
        DBP: "",
        HR: "",
        HRV: "",
        rr: "",
        SBP: "",
        SPO2: "",
        Activity: "",
        Equilibrium: "",
        Health: "",
        Metabolism: "",
        Relaxation: "",
        Sleep: "",
        HF: "",
        LF: "",
        LF_HF_Ratio: "",
        Mean_RR: "",
        PHF: "",
        PLF: "",
        RMSSD: "",
        RRIV: "",
        SD1: "",
        SD2: "",
        SDNN: "",
        si: "",
        ba2: "",
        ba4: "",
        bioage: "",
        HRVCalTime: "",
        ayHF: "",
        ayLF: "",
        aySDNN: "",
        aySDNNI: "",
        UID: UID.value, // ✅ 傳入 UID
        Flag: "2", // ✅ "2" 代表使用後測試
        ltage: "",
        ltLF: "",
        ltHF: "",
        ltHR: "",
        ltSDNN: "",
        ltRMSSD: "",
      }
    );

    console.log("✅ HRV 數據成功儲存 (API_HRV2Save.jsp)", saveResponse);

    // 🟢 調用 API_UseEnd.jsp 來結束測試
    const now = new Date();
    const formattedEndTime = formatDateTime(now);
    const endResponse = await useEndAPI(formattedEndTime);

    console.log("✅ 測試成功結束 (API_UseEnd.jsp)", endResponse);

    // 🟢 清除計時器
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
    isCounting.value = false;

    // 🟢 更新 UI 狀態
    hasAbandoned.value = true;
    currentDetectionState.value = DetectionState.BEFORE; // 回到 BEFORE 狀態
    isExpired.value = false; // 不再顯示超時狀態
    UID.value = null; // 清空 UID，確保新的測試可以重新開始

    console.log("✅ 用戶選擇放棄，已成功儲存 HRV 並結束測試");
  } catch (error) {
    console.error("❌ 放棄失敗，HRV 數據未儲存或測試未能結束:", error);
  }
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
