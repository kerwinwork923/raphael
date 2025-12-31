<template>
  <div class="specialAssistanceWrap">
    <div class="specialAssistanceContent">
      <TitleMenu Text="專人協助" positionType="sticky" link="/robotDemo" />

      <!-- 標籤切換器 -->
      <div class="tab-container">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-btn"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 諮詢記錄列表 -->
      <div class="consultation-list" v-if="filteredConsultations.length > 0">
        <div class="timeline-container">
          <div
            class="consultation-card"
            v-for="consultation in filteredConsultations"
            :key="consultation.id"
          >
            <div class="card-header">
              <div class="card-date">
                {{ formatDateTime(consultation.date) }}
              </div>
              <div class="card-status" :class="consultation.status">
                {{ getStatusText(consultation.status) }}
              </div>
            </div>
            <div class="card-body">
              <div class="summary-title">
                您口述的摘要內容
                <span>
                  <img src="/assets/imgs/robot/edit.svg" alt="編輯" />
                </span>
              </div>
              <div class="summary-text">{{ consultation.summary }}</div>
            </div>
            <button
              class="view-progress-btn"
              @click="viewProgress(consultation.id)"
            >
              <span>查看進度</span>
              <div class="arrow-circle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M7.5 15L12.5 10L7.5 5"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div class="empty-state" v-else>
        <div class="empty-card">
          <div class="empty-character">
            <img
              src="/assets/imgs/robotSad.png"
              alt="空狀態角色"
              class="character-img"
            />
          </div>
          <div class="empty-message">目前沒有資料</div>
        </div>
      </div>

      <!-- 新增諮詢按鈕 -->
      <button class="add-consultation-btn" @click="addConsultation">
        新增諮詢
      </button>
    </div>

    <!-- 新增諮詢頁面 -->
    <transition name="slide-left">
      <div v-if="showAddConsultation" class="add-consultation-page">
        <!-- 頂部標題欄 -->
        <div class="add-consultation-header">
          <img
            src="/assets/imgs/backArrow.svg"
            @click="closeAddConsultation"
            alt="返回"
            class="back-arrow"
          />
          <h2 class="page-title">新增諮詢</h2>
          <div class="header-spacer"></div>
        </div>

        <!-- 文字輸入區域 -->
        <div class="consultation-input-area">
          <textarea
            v-model="consultationText"
            class="consultation-textarea"
            placeholder="請盡量描述自己的身體目前狀況"
            ref="consultationTextareaRef"
          ></textarea>
        </div>

        <!-- 底部輸入方式切換按鈕 -->
        <div class="input-method-bar">
          <button
            class="input-method-btn"
            :class="{ active: inputMethod === 'text' }"
            @click="switchInputMethod('text')"
          >
            <div class="method-icon">
              <span class="text-icon">T</span>
            </div>
          </button>
          <button
            class="input-method-btn voice-btn"
            :class="{ active: inputMethod === 'voice', listening: isListening }"
            @click="switchInputMethod('voice')"
          >
            <div class="method-icon">
              <img :src="soundSvg" alt="語音" />
            </div>
            <div v-if="isListening" class="pulse-ring"></div>
          </button>
        </div>

        <!-- 語音錄音模態框 -->
        <transition name="fade">
          <div v-if="voiceModalOpen" class="voice-modal">
            <div class="voice-content" @click.stop>
              <!-- 錯誤文字 -->
              <p v-if="showVoiceError" class="voice-error-text">
                聽不太清楚，請點擊再試一次
              </p>

              <!-- 錄音中顯示 -->
              <template v-else-if="isListening && !isRecordingComplete">
                <!-- 關閉按鈕 - 錄音中顯示（右上角） -->
                <div class="voiceModelClose" @click="stopRecording">
                  <img src="/assets/imgs/robot/close.svg" alt="關閉" />
                </div>

                <!-- 如果還沒有收到聲音，顯示開始說話提示和音波圖 -->
                <template v-if="!currentTranscript || !currentTranscript.trim()">
                  <p class="voice-start-text">開始說話吧</p>
                  <img
                    :src="voiceModalImageSrc"
                    alt="音波圖"
                    class="voice-wave"
                  />
                </template>

                <!-- 如果已經收到聲音，顯示確認畫面樣式 -->
                <template v-else>
                  <p class="voice-confirm-text">
                    確認好文字後 請按一下「送出語音」。
                  </p>
                  <p class="voice-label-text">你說:</p>
                  <div class="transcript-display" ref="voiceModalTranscriptRef">
                    {{ currentTranscript }}
                  </div>
                  <div class="voice-action-buttons">
                    <button class="voice-btn voice-btn-retry" @click="retryRecording">
                      重新錄音
                    </button>
                    <button
                      class="voice-btn voice-btn-send"
                      @click="sendVoiceFromRecording"
                    >
                      送出語音
                    </button>
                  </div>
                </template>
              </template>

              <!-- 其他情況（錯誤等） -->
              <template v-else>
                <p class="transcript-text" ref="voiceModalTranscriptRef">
                  {{ currentTranscript || "" }}
                </p>
                <div
                  class="voiceModelClose"
                  v-if="!isListening"
                  @click="closeVoiceModal"
                >
                  <div class="voiceModelImg">
                    <img src="/assets/imgs/robot/close_red.svg" alt="關閉" />
                  </div>
                </div>
              </template>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import TitleMenu from "~/components/TitleMenu.vue";
import soundSvg from "~/assets/imgs/robot/sound.svg";
import assistantSoundGif from "~/assets/imgs/robot/assistantSound.gif";
import assistantDefaultGif from "~/assets/imgs/robot/assistantDefault.gif";

const localData = localStorage.getItem("userData");
const localobj = localData ? JSON.parse(localData) : null;

// 標籤選項
const tabs = [
  { label: "待處理", value: "pending" },
  { label: "處理中", value: "in_progress" },
  { label: "已完成", value: "completed" },
];

// 當前選中的標籤
const activeTab = ref("pending");

// 模擬諮詢資料（之後可以從 API 獲取）
const consultations = ref([
  {
    id: 1,
    date: "2025-12-25T11:00:00",
    status: "pending",
    summary:
      "肩頸老是卡卡的、有時候會偏頭痛, 晚上也睡不好。我還提到飲食跟運...",
  },
  {
    id: 2,
    date: "2025-12-20T11:00:00",
    status: "pending",
    summary:
      "肩頸老是卡卡的、有時候會偏頭痛, 晚上也睡不好。我還提到飲食跟運...",
  },
  {
    id: 3,
    date: "2025-12-15T14:30:00",
    status: "in_progress",
    summary: "最近工作壓力大，睡眠品質不佳，希望能夠改善...",
  },
  {
    id: 4,
    date: "2025-12-10T09:00:00",
    status: "completed",
    summary: "經過諮詢後，已經開始執行改善計畫，效果良好...",
  },
]);

// 根據選中標籤過濾諮詢記錄
const filteredConsultations = computed(() => {
  return consultations.value.filter(
    (consultation) => consultation.status === activeTab.value
  );
});

// 格式化日期時間
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

// 獲取狀態文字
const getStatusText = (status) => {
  const statusMap = {
    pending: "待處理",
    in_progress: "處理中",
    completed: "已完成",
  };
  return statusMap[status] || status;
};

// 查看進度
const viewProgress = (id) => {
  console.log("查看進度:", id);
  // TODO: 導航到進度詳情頁面
};

// 新增諮詢相關狀態
const showAddConsultation = ref(false);
const consultationText = ref("");
const inputMethod = ref("text"); // 'text' 或 'voice'
const consultationTextareaRef = ref(null);

// 語音識別相關狀態
const isListening = ref(false);
const voiceModalOpen = ref(false);
const currentTranscript = ref("");
const showVoiceError = ref(false);
const voiceModalImageSrc = ref(assistantSoundGif);
const voiceModalTranscriptRef = ref(null);
const isRecordingComplete = ref(false);
let recognitionRef = null;
let voiceTimeout = null;
let hasFinalResult = false;
let finalizedByUs = false;

// 新增諮詢
const addConsultation = () => {
  showAddConsultation.value = true;
  consultationText.value = "";
  inputMethod.value = "text";
  
  // 禁用背景滾動
  if (process.client) {
    document.body.style.overflow = "hidden";
  }
  
  // 自動聚焦到文字輸入框
  nextTick(() => {
    setTimeout(() => {
      consultationTextareaRef.value?.focus();
    }, 100);
  });
};

// 關閉新增諮詢頁面
const closeAddConsultation = () => {
  showAddConsultation.value = false;
  consultationText.value = "";
  currentTranscript.value = "";
  isListening.value = false;
  voiceModalOpen.value = false;
  
  // 恢復背景滾動
  if (process.client) {
    document.body.style.overflow = "";
  }
  
  // 停止語音識別
  if (recognitionRef && isListening.value) {
    finalizedByUs = true;
    recognitionRef.stop();
  }
};

// 切換輸入方式
const switchInputMethod = (method) => {
  inputMethod.value = method;
  
  if (method === "voice") {
    toggleListening();
  } else {
    // 切換到文字輸入時，關閉語音模態框
    if (isListening.value) {
      stopRecording();
    }
    // 聚焦到文字輸入框
    nextTick(() => {
      consultationTextareaRef.value?.focus();
    });
  }
};

// 初始化語音識別
const initSpeechRecognition = () => {
  if (process.client && typeof window !== "undefined") {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef = new SpeechRecognition();
      recognitionRef.continuous = true;
      recognitionRef.interimResults = true;
      recognitionRef.lang = "zh-TW";

      recognitionRef.onresult = (event) => {
        let finalTextParts = [];
        let interimText = "";
        let hasFinal = false;

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            const transcript = result[0].transcript.trim();
            if (transcript) {
              finalTextParts.push(transcript);
            }
            hasFinal = true;
          } else {
            interimText = result[0].transcript;
          }
        }

        const finalText = finalTextParts.join(" ");
        const transcript = finalText + (interimText ? (finalText ? " " : "") + interimText : "");

        if (process.client) {
          const transcriptEl =
            voiceModalTranscriptRef.value ||
            document.querySelector(".voice-modal .transcript-text");

          const textToShow = transcript || "";

          if (transcriptEl) {
            transcriptEl.textContent = textToShow;
            if (textToShow) {
              transcriptEl.style.display = "block";
              transcriptEl.style.opacity = "1";
              transcriptEl.style.visibility = "visible";
              void transcriptEl.offsetHeight;
            } else {
              transcriptEl.style.display = "none";
            }

            requestAnimationFrame(() => {
              if (transcriptEl && textToShow) {
                transcriptEl.textContent = textToShow;
                transcriptEl.style.display = "block";
              }
            });
          }

          currentTranscript.value = textToShow;
        }
      };

      recognitionRef.onerror = (event) => {
        if (process.client && event.error !== "no-speech" && event.error !== "aborted") {
          console.error("語音識別錯誤:", event.error);
        }

        if (voiceTimeout) {
          clearTimeout(voiceTimeout);
          voiceTimeout = null;
        }

        if (process.client) {
          switch (event.error) {
            case "not-allowed":
              alert("請允許麥克風權限以使用語音功能");
              closeVoiceModal();
              break;
            case "no-speech":
              if (isListening.value && !isRecordingComplete.value) {
                try {
                  setTimeout(() => {
                    if (isListening.value && !isRecordingComplete.value && recognitionRef) {
                      recognitionRef.start();
                    }
                  }, 100);
                } catch (error) {
                  console.error("自動重新啟動失敗:", error);
                }
              }
              break;
            case "audio-capture":
              if (isListening.value && !isRecordingComplete.value) {
                try {
                  setTimeout(() => {
                    if (isListening.value && !isRecordingComplete.value && recognitionRef) {
                      recognitionRef.start();
                    }
                  }, 100);
                } catch (error) {
                  console.error("自動重新啟動失敗:", error);
                }
              }
              break;
            case "network":
              alert("網路連接問題，請檢查網路後重試");
              closeVoiceModal();
              break;
          }
        }
      };

      recognitionRef.onend = () => {
        if (finalizedByUs) {
          finalizedByUs = false;
          hasFinalResult = false;
          return;
        }

        if (isListening.value && !isRecordingComplete.value && process.client) {
          try {
            setTimeout(() => {
              if (isListening.value && !isRecordingComplete.value && recognitionRef) {
                recognitionRef.start();
              }
            }, 100);
          } catch (error) {
            console.error("自動重新啟動語音識別失敗:", error);
          }
        }

        hasFinalResult = false;
      };
    }
  }
};

// 清除語音超時計時器
function clearVoiceTimeout() {
  if (voiceTimeout) {
    clearTimeout(voiceTimeout);
    voiceTimeout = null;
  }
}

// 真正關閉語音模態框
function reallyCloseVoiceModal() {
  clearVoiceTimeout();
  isListening.value = false;
  isRecordingComplete.value = false;
  showVoiceError.value = false;
  currentTranscript.value = "";
  voiceModalImageSrc.value = assistantSoundGif;
  voiceModalOpen.value = false;
}

// 關閉語音模態框
const closeVoiceModal = () => {
  reallyCloseVoiceModal();
};

// 開始/停止語音識別
const toggleListening = () => {
  if (!recognitionRef) {
    if (process.client && typeof window !== "undefined") {
      if (
        window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost"
      ) {
        alert("語音功能需要 HTTPS 連接，請使用安全連接");
        return;
      }
      alert("您的瀏覽器不支援語音識別功能");
    }
    return;
  }

  if (isListening.value) {
    stopRecording();
  } else {
    startRecording();
  }
};

// 開始錄音
const startRecording = () => {
  if (process.client) {
    showVoiceError.value = false;
    voiceModalImageSrc.value = assistantSoundGif;
    currentTranscript.value = "";
    hasFinalResult = false;
    finalizedByUs = false;
    isRecordingComplete.value = false;
    voiceModalOpen.value = true;
    isListening.value = true;

    const prepareTranscriptEl = () => {
      const transcriptEl =
        voiceModalTranscriptRef.value ||
        document.querySelector(".voice-modal .transcript-text");
      if (transcriptEl) {
        transcriptEl.style.display = "block";
        transcriptEl.style.opacity = "1";
        transcriptEl.style.visibility = "visible";
        transcriptEl.textContent = "";
        transcriptEl.offsetHeight;
      }
    };

    prepareTranscriptEl();

    nextTick(() => {
      prepareTranscriptEl();
    });

    recognitionRef.start();
  }
};

// 停止錄音
const stopRecording = () => {
  if (process.client && recognitionRef) {
    finalizedByUs = true;
    recognitionRef.stop();
  }

  reallyCloseVoiceModal();
  isRecordingComplete.value = false;
};

// 重新錄音
const retryRecording = () => {
  if (process.client && recognitionRef) {
    finalizedByUs = true;
    recognitionRef.stop();
  }

  isRecordingComplete.value = false;
  currentTranscript.value = "";
  showVoiceError.value = false;

  startRecording();
};

// 從錄音中直接送出語音
const sendVoiceFromRecording = async () => {
  const transcript = currentTranscript.value.trim();

  if (!transcript) {
    alert("請先錄音");
    return;
  }

  // 停止錄音
  if (process.client && recognitionRef) {
    finalizedByUs = true;
    recognitionRef.stop();
  }

  // 將語音轉錄的文字填入文字輸入框
  consultationText.value = transcript;

  // 關閉模態框
  reallyCloseVoiceModal();
  isRecordingComplete.value = false;

  // 切換到文字輸入模式
  inputMethod.value = "text";
  
  // 聚焦到文字輸入框
  nextTick(() => {
    consultationTextareaRef.value?.focus();
  });
};

// 組件掛載時初始化語音識別
onMounted(() => {
  initSpeechRecognition();
});

// 組件卸載時清理
onUnmounted(() => {
  if (recognitionRef) {
    recognitionRef.stop();
  }
  clearVoiceTimeout();
  
  // 恢復背景滾動
  if (process.client) {
    document.body.style.overflow = "";
  }
});
</script>

<style lang="scss" scoped>
.specialAssistanceWrap {
  min-height: 100vh;

  padding-bottom: 100px; // 為底部按鈕留出空間
  @include gradientBg();
}

.specialAssistanceContent {
  width: 100%;
  max-width: 100%;
  padding: 0 1rem;
}

// 標籤切換器
.tab-container {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
  padding: 0.5rem;
  border-radius: var(--Radius-r-50, 50px);
  background: var(--Secondary-100, #f5f7fa);
  box-shadow: 2px 4px 12px 0
    var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
  border-radius: 12px;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: var(--Primary-default, #74bc1f);
  font-size: var(--Text-font-size-18, 18px);
  font-style: normal;
  font-weight: 400;
  line-height: 100%; /* 18px */
  letter-spacing: 2.7px;
  cursor: pointer;
  transition: all 0.3s ease;

  &.active {
    border-radius: var(--Radius-r-50, 50px);
    background: var(--Secondary-100, #f5f7fa);
    box-shadow: 2px 4px 12px 0
      var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7)) inset;
  }

  &:hover:not(.active) {
    background: rgba(223, 236, 197, 0.3);
  }
}

// 諮詢記錄列表
.consultation-list {
  margin-top: 1.5rem;
}

.timeline-container {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

// 諮詢卡片
.consultation-card {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-date {
  color: var(--Neutral-black, #1e1e1e);

  font-size: var(--Text-font-size-20, 20px);
  font-style: normal;
  font-weight: 700;
  letter-spacing: 0.1px;
}

.card-status {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0;
  border-radius: 12px;

  &.pending {
    color: #ec4f4f;
  }

  &.in_progress {
    color: #feac4a;
  }

  &.completed {
    color: #74bc1f;
  }
}

.card-body {
  margin-bottom: 1rem;
}

.summary-title {
  color: var(--Neutral-black, #1e1e1e);
  font-size: var(--Text-font-size-18, 18px);
  font-style: normal;
  font-weight: 700;
  letter-spacing: 0.09px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.summary-text {
  color: var(--Neutral-500, #666);
  text-overflow: ellipsis;

  font-size: var(--Text-font-size-18, 18px);
  font-style: normal;
  font-weight: 400;
  line-height: 120%;
  letter-spacing: 2.7px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 0.75rem;
}

// 查看進度按鈕
.view-progress-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--Primary-200, #ddeacf);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--Primary-hover, #65a31b);
  span {
    color: var(--Primary-hover, #65a31b);
    font-size: var(--Text-font-size-16, 16px);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 2.4px;
  }

  .arrow-circle {
    width: 32px;
    height: 32px;
    background: #74bc1f;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    background: #cfe5b0;
    transform: translateY(-1px);

    .arrow-circle {
      background: #65a31b;
    }
  }
}

// 空狀態
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  padding: 2rem 1rem;
  width: 100%;
}

.empty-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-character {
  margin-bottom: 1.5rem;

  .character-img {
    width: 100%;
    max-width: 200px;
    height: auto;
    object-fit: contain;
  }
}

.empty-message {
  font-size: 1.125rem;
  font-weight: 500;
  color: #666;
}

// 新增諮詢按鈕
.add-consultation-btn {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 2rem);
  max-width: 500px;
  padding: 0.5rem 2rem;
  background: #74bc1f;
  color: #ffffff;
  border: none;
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(116, 188, 31, 0.3);
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: #65a31b;
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 0 6px 16px rgba(116, 188, 31, 0.4);
  }

  &:active {
    transform: translateX(-50%) translateY(0);
  }
}

// 新增諮詢頁面
.add-consultation-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e0e5ec 0%, #f0f4f8 100%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .add-consultation-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    background: transparent;
    position: relative;

    .back-arrow {
      width: 24px;
      height: 24px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    .page-title {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      font-size: var(--Text-font-size-20, 20px);
      font-weight: 600;
      color: var(--Neutral-black, #1e1e1e);
      margin: 0;
      pointer-events: none;
    }

    .header-spacer {
      width: 24px; // 與返回按鈕同寬，保持標題置中
    }
  }

  .consultation-input-area {
    flex: 1;
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;

    .consultation-textarea {
      flex: 1;
      width: 100%;
      border: none;
      outline: none;
      background: #ffffff;
      border-radius: 16px;
      padding: 1.25rem;
      font-size: var(--Text-font-size-18, 18px);
      font-weight: 400;
      line-height: 1.6;
      color: var(--Neutral-black, #1e1e1e);
      resize: none;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      transition: box-shadow 0.3s ease;

      &::placeholder {
        color: var(--Neutral-400, #b3b3b3);
      }

      &:focus {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
    }
  }

  .input-method-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1rem 1.5rem 2rem;
    background: transparent;

    .input-method-btn {
      position: relative;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      box-shadow: 2px 4px 12px 0
        var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
      transition: all 0.3s ease;

      .method-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;

        .text-icon {
          font-size: 24px;
          font-weight: 700;
          color: var(--Neutral-500, #666);
        }

        img {
          width: 28px;
          height: 28px;
        }
      }

      &.active {
        background: var(--Primary-default, #74bc1f);
        box-shadow: 2px 4px 12px 0
          var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7)) inset;

        .method-icon {
          .text-icon {
            color: #ffffff;
          }
        }
      }

      &.voice-btn {
        background: var(--Primary-default, #74bc1f);

        .method-icon img {
          filter: brightness(0) invert(1);
        }

        &.active {
          background: var(--Primary-hover, #65a31b);
        }

        &.listening {
          background: var(--Primary-default, #74bc1f);
        }
      }

      &:hover:not(.active) {
        transform: translateY(-2px);
        box-shadow: 2px 6px 16px 0
          var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.8));
      }
    }

    .pulse-ring {
      position: absolute;
      width: 70px;
      height: 70px;
      border: 2px solid rgba(239, 68, 68, 0.4);
      border-radius: 50%;
      animation: pulse 1.5s infinite;
      top: -5px;
      left: -5px;
    }
  }
}

// 語音模態框樣式（參考 robotDemo.vue）
.voice-modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  min-height: 375px;
  background: rgba(245, 247, 250, 0.1);
  backdrop-filter: blur(22px);
  z-index: 2000;
  border-radius: 50px 50px 0 0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);

  .voice-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 2rem 1rem;

    .voice-wave {
      width: 115px;
      height: 115px;
      object-fit: contain;
      animation: pulse-wave 1.6s infinite ease-in-out;
    }

    .voice-start-text {
      color: var(--Neutral-black, #1e1e1e);
      text-align: center;
      font-size: var(--Text-font-size-18, 18px);
      font-weight: 400;
      position: absolute;
      top: 40px;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .voice-confirm-text {
      font-size: 16px;
      color: #2d3748;
      font-weight: 500;
      text-align: center;
      padding: 0 16px;
    }

    .voice-label-text {
      font-size: 16px;
      color: #2d3748;
      font-weight: 600;
      text-align: left;
      width: 90%;
      padding: 0 16px;
    }

    .transcript-display {
      margin-top: 8px;
      font-size: 16px;
      color: #2d3748;
      font-weight: 400;
      text-align: left;
      padding: 12px 16px;
      min-height: 60px;
      max-height: 200px;
      overflow-y: auto;
      line-height: 1.6;
      word-break: break-word;
      max-width: 90%;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .voice-action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      padding: 0 16px;
      width: 100%;
      justify-content: center;
    }

    .voice-btn {
      flex: 1;
      max-width: 150px;
      padding: 12px 24px;
      border-radius: 24px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;

      &.voice-btn-retry {
        background: var(--Secondary-100, #f5f7fa);
        box-shadow: 2px 4px 12px 0
          var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
        color: var(--Primary-default, #74bc1f);
        font-size: var(--Text-font-size-18, 18px);
        font-weight: 400;
        letter-spacing: 2.7px;
      }

      &.voice-btn-send {
        background: var(--Primary-default, #74bc1f);
        box-shadow: 2px 4px 12px 0
          var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
        color: white;
        font-size: var(--Text-font-size-18, 18px);
        font-weight: 400;
        letter-spacing: 2.7px;
      }
    }

    .voice-error-text {
      color: var(--Neutral-black, #1e1e1e);
      text-align: center;
      font-size: 20px;
      font-weight: 600;
    }

    .transcript-text {
      margin-top: 16px;
      font-size: 18px;
      color: #2d3748;
      font-weight: 600;
      text-align: center;
      padding: 8px 16px;
      min-height: 24px;
      line-height: 1.5;
      word-break: break-word;
      max-width: 90%;
    }
  }

  .voiceModelClose {
    position: absolute;
    top: 20px;
    right: 30px;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;

    img {
      width: 24px;
      height: 24px;
    }

    .voiceModelImg {
      border: 1px solid var(--Warning-default, #ec4f4f);
      border-radius: 50%;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.2;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
}

@keyframes pulse-wave {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

// 動畫
.slide-left-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0.055, 0.675, 0.19);
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
