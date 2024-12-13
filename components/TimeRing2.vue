<template>
  <div class="progress-container">
    <div class="progress-border">
      <div class="content">{{ formattedTime }}</div>
    </div>

    <div v-if="hasDetectRecord" class="completion-message">感謝您的使用</div>
    <div v-if="hasDetectRecord" class="completion-delayMessage">
      ※ 請於隔天後再使用
    </div>

    <button
      v-if="showButton"
      :disabled="!isButtonEnabled"
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

const props = defineProps({
  productName: {
    type: String,
  },
  hasDetectRecord: {
    type: Boolean,
  },
});

const router = useRouter();

const elapsedTime = ref(0); // 計時的時間（秒）
const isCounting = ref(false); // 是否正在計時
const isPaused = ref(false); // 是否暫停
const buttonText = ref("HRV檢測"); // 按鈕文字
const isButtonEnabled = ref(true);

const formattedTime = computed(() => {
  const hours = Math.floor(elapsedTime.value / 3600);
  const minutes = Math.floor((elapsedTime.value % 3600) / 60);
  const seconds = elapsedTime.value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
});

const timerInterval = ref(null);

const startTimer = () => {
  isCounting.value = true;
  isPaused.value = false;
  buttonText.value = "暫停";

  timerInterval.value = setInterval(() => {
    elapsedTime.value++;
  }, 1000);
};

const pauseTimer = () => {
  isPaused.value = true;
  isCounting.value = false;
  clearInterval(timerInterval.value);
  buttonText.value = "繼續";
};

const resumeTimer = () => {
  isPaused.value = false;
  isCounting.value = true;
  buttonText.value = "暫停";

  timerInterval.value = setInterval(() => {
    elapsedTime.value++;
  }, 1000);
};

const stopTimer = async () => {
  clearInterval(timerInterval.value);
  isCounting.value = false;
  isPaused.value = false;
  buttonText.value = "HRV檢測(後)";

  await useEndAPI();
  console.log("計時結束");
};

const toggleTimer = async () => {
  if (buttonText.value === "HRV檢測") {
    console.log("開始 HRV 檢測(前)");
    await useStartAPI();
    startTimer();
  } else if (buttonText.value === "暫停") {
    console.log("暫停計時");
    pauseTimer();
  } else if (buttonText.value === "繼續") {
    console.log("恢復計時");
    resumeTimer();
  } else if (buttonText.value === "HRV檢測(後)") {
    console.log("結束 HRV 檢測");
    stopTimer();
  }
};

const useStartAPI = async () => {
  try {
    const response = await axios.post(
      "https://23700999.com:8081/HMA/API_UseStart.jsp",
      { MID, Token, MAID, Mobile, ProductName: props.productName }
    );
    console.log("useStartAPI 回應:", response.data);
  } catch (error) {
    console.error("useStartAPI 請求失敗:", error);
  }
};

const useEndAPI = async () => {
  try {
    await axios.post("https://23700999.com:8081/HMA/API_UseEnd.jsp", {
      MID,
      Token,
      MAID,
      Mobile,
      ProductName: props.productName,
    });
    console.log("useEndAPI 成功");
  } catch (error) {
    console.error("useEndAPI 失敗:", error);
  }
};

onMounted(() => {
  console.log("組件掛載完成");
});

const buttonStyle = computed(() => {
  if (buttonText.value === "HRV檢測") {
    return { backgroundColor: "#74BC1F", color: "#fff" }; // 綠色
  } else if (buttonText.value === "暫停") {
    return { backgroundColor: "#EC4F4F", color: "#fff" }; // 紅色
  } else if (buttonText.value === "繼續") {
    return { backgroundColor: "#74BC1F", color: "#fff" }; // 綠色
  } else if (buttonText.value === "HRV檢測(後)") {
    return { backgroundColor: "#E0E0E0", color: "#000" }; // 灰色
  }
  return {};
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
