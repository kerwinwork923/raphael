<template>
  <div class="progress-container">
    <div class="progress-border" :style="progressStyle">
      <div class="content">{{ formattedTime }}</div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="179"
        height="178"
        class="timeDot"
        viewBox="0 0 179 178"
        fill="none"
      >
        <circle
          cx="89.333"
          cy="89"
          r="88.5"
          stroke="#666"
          stroke-dasharray="1 10"
        />
      </svg>
    </div>
    <div v-if="showMessage" class="completion-message">感謝您的使用</div>
    <div v-if="showMessage" class="completion-delayMessage">
      ※ 請於24小時後再使用
    </div>
    <button :style="buttonStyle" @click="toggleTimer">
      {{ isCounting ? (isPaused ? "繼續" : "暫停") : "開始" }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Props
const props = defineProps({
  totalTime: {
    type: Number,
    default: 60, // 默認 60 秒
  },
});

// State
const remainingTime = ref(props.totalTime); // 剩餘時間
const isCounting = ref(false); // 計時器狀態（是否計時中）
const isPaused = ref(false); // 是否暫停
const showMessage = ref(false); // 控制訊息顯示
let startTime = ref(0); // 計時開始時間
let elapsedTime = ref(0); // 已經過的時間

// 計算進度條樣式
const progressStyle = computed(() => {
  const progress =
    ((props.totalTime - remainingTime.value) / props.totalTime) * 100;
  return {
    background: `conic-gradient(
        #74BC1F 0% ${progress}%, 
        #e0e0e0 ${progress}% 100%
      )`,
    transition:
      isCounting.value && !isPaused.value ? "none" : "background 1s ease-out",
  };
});

// 格式化時間（HH:MM:SS）
const formattedTime = computed(() => {
  const hours = Math.floor(remainingTime.value / 3600);
  const minutes = Math.floor((remainingTime.value % 3600) / 60);
  const seconds = Math.floor(remainingTime.value % 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
});

// 按鈕樣式
const buttonStyle = computed(() => {
  if (!isCounting.value) {
    return {
      backgroundColor: "#74bc1f", // 開始計時時的綠色
    };
  }
  return {
    backgroundColor: isPaused.value ? "#74bc1f" : "#ec4f4f",
  };
});

// 方法
const toggleTimer = () => {
  if (isCounting.value) {
    if (isPaused.value) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  } else {
    startTimer();
  }
};

const startTimer = () => {
  isCounting.value = true;
  isPaused.value = false;
  showMessage.value = false;
  startTime.value = Date.now();
  elapsedTime.value = 0;
  countdown();
};

const pauseTimer = () => {
  isPaused.value = true;
  elapsedTime.value = (Date.now() - startTime.value) / 1000;
};

const resumeTimer = () => {
  isPaused.value = false;
  startTime.value = Date.now() - elapsedTime.value * 1000;
  countdown();
};

const countdown = () => {
  const update = () => {
    if (isPaused.value) return;

    const elapsedTimeSinceStart = (Date.now() - startTime.value) / 1000;
    remainingTime.value = Math.max(
      props.totalTime - elapsedTimeSinceStart - elapsedTime.value,
      0
    );

    if (remainingTime.value <= 0) {
      isCounting.value = false;
      remainingTime.value = 0;
      showMessage.value = true;
      return;
    }

    requestAnimationFrame(update);
  };

  update();
};
</script>

<style scoped>
.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background-color: rgb(246, 246, 246);
}

.progress-border {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.progress-border .timeDot {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: scale(0.9);
}

.content {
  width: 120px;
  height: 120px;
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
</style>
