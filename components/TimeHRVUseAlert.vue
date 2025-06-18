<template>
  <RaphaelLoading v-if="loading" />
  <div class="cover"></div>
  <div class="timeHRVUseAlert">
    <h3>請填寫開始穿衣的時間</h3>
    <hr />

    <!-- 日期選擇 -->
    <div class="HRVUseDateGroup">
      <div class="icon-wrapper" :class="{ 'is-loading': !isDateIconLoaded }">
        <img 
          class="icon1" 
          src="../assets/imgs/date.svg" 
          alt="日期選擇" 
          @load="isDateIconLoaded = true"
        />
      </div>
      <VueDatePicker
        v-model="localDate"
        model-type="format"
        format="yyyy/MM/dd"
        locale="zh-TW"
        :enable-time-picker="false"
        cancel-text="取消"
        select-text="確定"
        :max-date="new Date()"
        placeholder="年/月/日"
        teleport="body"
        no-today
        hide-input-icon
        @update:model-value="updateDate"
      />
    </div>

    <!-- 時間選擇（用區塊點擊觸發） -->
    <div class="HRVUseTimeGroup" @click="openTimePicker">
      <div class="icon-wrapper" :class="{ 'is-loading': !isTimeIconLoaded }">
        <img 
          class="icon1" 
          src="../assets/imgs/detectTime.svg" 
          alt="時間選擇" 
          @load="isTimeIconLoaded = true"
        />
      </div>
      <span v-if="!startTime">請選擇開始穿衣的時間</span>
      <span :class="{ selected: startTime }">
        {{ startTime ? startTime : "" }}
      </span>
      <input
        ref="timeInput"
        v-model="startTime"
        type="time"
        @input="calculateEndTime"
      />
    </div>

    <!-- 送出按鈕 -->
    <button @click="submitData">送出</button>

    <!-- 動態結束時間顯示 -->
    <!-- 當 date 與 endTime 都有值才顯示 -->
    <h6 class="timeHRVUseAlertSubHint" v-if="localDate && endTime">
      ※ 您選擇的開始時間：{{ localDate }} {{ endTime }}
    </h6>
  </div>
</template>

<script setup>
import { ref, defineEmits } from "vue";

// 父元件可透過 @update:startTime, @update:localDate 取得時間/日期
// 也可監聽 @submit 時拿到完整資訊
const emit = defineEmits(["update:startTime", "update:localDate", "submit"]);

// 綁定的資料
const localDate = ref("");
const startTime = ref("");
const endTime = ref("");

// 圖片載入狀態
const isDateIconLoaded = ref(false);
const isTimeIconLoaded = ref(false);

// 當 VueDatePicker 的 model-value 更新時，通知父元件
const updateDate = () => {
  emit("update:localDate", localDate.value);
};

// 點擊區塊時打開原生 time picker
const timeInput = ref(null);
const openTimePicker = () => {
  if (timeInput.value) {
    timeInput.value.showPicker();
  }
};

// 根據開始時間計算結束時間 (自動+1小時)
const calculateEndTime = () => {
  if (!startTime.value) {
    endTime.value = "";
    return;
  }

  // 解析成 Date 物件
  const [hour, minute] = startTime.value.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0);

  date.setHours(date.getHours());

  // 格式化回 HH:mm
  const newHour = String(date.getHours()).padStart(2, "0");
  const newMinute = String(date.getMinutes()).padStart(2, "0");
  endTime.value = `${newHour}:${newMinute}`;

  emit("update:startTime", startTime.value);
};

// 將整個資料回傳給父元件
const submitData = () => {
  if (!localDate.value || !startTime.value) {
    alert("請填寫完整日期與時間！");
    return;
  }

  // 取得目前時間
  const now = new Date();

  // 解析使用者選擇的日期與時間
  const [hour, minute] = startTime.value.split(":").map(Number);
  const selectedDate = new Date(localDate.value);
  selectedDate.setHours(hour, minute, 0);

  // **判斷使用者選擇的時間是否在未來**
  if (selectedDate > now) {
    alert("開始時間不能超過當前時間，請重新選擇！");
    return;
  }

  // 確保結束時間不為未來
  endTime.value = startTime.value;

  // 回傳給父元件
  emit("submit", {
    date: localDate.value,
    startTime: startTime.value,
    endTime: endTime.value,
  });
};
</script>

<style scoped>
.timeHRVUseAlert {
  border-radius: 12px;
  background: var(--shade-white, #fff);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  padding: 16px;
  position: fixed;
  z-index: 120;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  min-width:375px;
  max-width:100%;
  text-align: center;
}

.timeHRVUseAlert h3 {
  color: var(--brand-green-400, #74bc1f);
  font-family: "Noto Sans";
  font-size: 24px;
  font-weight: 700;
  line-height: 100%;
}

.HRVUseDateGroup {
  position: relative;
  display: flex;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 12px;
  margin-bottom: 12px;
}

/* 調整 datepicker 內部 placeholder 的間距 */
.HRVUseDateGroup :deep(.dp__input) {
  padding-left: 45px !important; /* 可自行調整數值 */
  border: none;
  border-bottom: 1px solid #b3b3b3;
  border-radius: 0;
}

/* 若想增大整個 wrapper 的左側邊距，也可繼續使用 .dp__input_wrap */
.timeHRVUseAlert .dp__input_wrap {
  padding-left: 0; /* 可以配合上面設定一起調整 */
}

.icon-wrapper {
  position: relative;
  width: 22px;
  height: 22px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper.is-loading::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #74bc1f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.icon-wrapper img {
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.icon-wrapper:not(.is-loading) img {
  opacity: 1;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.HRVUseDateGroup img {
  position: absolute;
  left: 3%;
  top: 50%;
  z-index: 99;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.HRVUseDateGroup:not(.is-loading) img {
  opacity: 1;
}

.HRVUseTimeGroup {
  position: relative;
  padding: 8px 10px;
  border-bottom: 1px solid #b3b3b3;
  width: 100%; /* 確保全區塊可點 */
  min-height: 44px; /* 提高可點擊範圍 */
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 12px;
}

.HRVUseTimeGroup span {
  font-size: 16px;
  margin-left: 0.25rem;
  color: var(--shade-gray-400, #b3b3b3);
  transition: color 0.3s ease-in-out;
  display: block;
}

/* 當有選擇時間後，變色 */
.HRVUseTimeGroup span.selected {
  color: var(--brand-green-400, #010101);
  letter-spacing: 0.5px;
}

.HRVUseTimeGroup img {
  width: 22px;
  height: 22px;
  margin-right: 10px;
}

/* 隱藏 time input 內建的 icon */
input[type="time"]::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}

/* 將原生 input 藏起來，使用 div + span 作為顯示區塊 */
input {
  position: absolute;
  opacity: 0;
  width: 100%;
}

button {
  background-color: #74bc1f;
  color: white;
  padding: 8px;
  border: none;
  font-size: 18px;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  margin-top: 12px;
}

button:hover {
  background-color: #5da51c;
}

h6 {
  margin-top: 12px;
  font-size: 14px;
  color: #555;
}
.timeHRVUseAlertSubHint {
  color: var(--warning-red-300, #ec4f4f);
  text-align: justify;

  font-size: 16px;
  font-style: normal;
  font-weight: 400;

  letter-spacing: 0.5px;
}
</style>
