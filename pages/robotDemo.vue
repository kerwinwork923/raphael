<template>
  <div class="chat-wrapper">
    <!-- 聊天頭部 -->
    <div class="chat-header">
      <div class="avatar-container">
        <img
          class="avatar"
          src="/assets/imgs/robotDemo/doctor.png"
          alt="院長"
        />
      </div>
      <div class="character-name-btn">
        <span>院長</span>
      </div>
    </div>

    <!-- 初始對話氣泡 -->
    <!-- <div class="greeting-bubble">
      <div v-if="isLoading" class="loading-indicator">
        <div class="spinner"></div>
        <span>思考中...</span>
      </div>
      <div v-else-if="latestResponse" class="latest-response">
        {{ latestResponse }}
      </div>
      <div v-else class="greeting-text">嗨~~有什麼需要幫您</div>
    </div> -->

    <!-- AI角色形象區域 -->
    <div class="character-section">
      <img
        src="/assets/imgs/robotDemo/doctor.png"
        class="character-image"
        alt="院長"
      />
      <div class="healGroup healGroup5">
        <div class="healthImg" @click="goToHealthLog2">
          <img src="/assets/imgs/robot/health.svg" alt="健康" />
        </div>
        <h5>健康日誌</h5>
      </div>

      <div class="healGroup healGroup4">
        <div class="healthImg" @click="goToVoice">
          <img src="/assets/imgs/robot/mic.svg" alt="語音" />
        </div>
        <h5>專人協助</h5>
      </div>
    </div>

    <!-- 語音控制區域 - 從下方彈出 -->
    <transition name="slide-up">
      <div v-if="showVoiceControls" class="voice-control-bar">
        <button class="control-btn history-btn" @click.stop="showHistory">
          <img :src="textIconSvg" alt="文字對話" />
        </button>

        <button
          class="control-btn mic-btn"
          :class="{ listening: isListening }"
          @click="toggleListening"
          :disabled="isLoading"
        >
          <img :src="soundSvg" alt="語音" />

          <div v-if="isListening" class="pulse-ring"></div>
        </button>
        <button class="control-btn volume-btn" @click="toggleVolume">
          <img :src="isMuted ? mutedSvg : volumeSvg" alt="音量" />
        </button>
      </div>
    </transition>

    <!-- 文字輸入區域 -->
    <transition name="slide-up" >
      <div
        v-if="showTextInput && !isListening && !showVoiceError"
        class="text-input-section"
        v-click-outside="closeTextInput"
      >
        <div class="input-container" @click.stop>
          <input
            v-model="textInput"
            class="text-input"
            placeholder="請輸入文字"
            @keypress.enter="handleManualInput"
            ref="textInputRef"
            inputmode="text"
          />
          <button
            class="send-btn"
            @click="textInput.trim() && handleManualInput()"
            :disabled="!textInput.trim()"
          >
            <img :src="sendSvg" alt="送出" />
          </button>
          <button class="cancel-btn" @click="closeTextInput">
            取消
          </button>
        </div>
      </div>
    </transition>

    <!-- 當前語音輸入顯示 -->
    <transition name="fade">
      <div v-if="currentTranscript || isListening" class="transcript-display">
        <p v-if="currentTranscript" class="transcript-text">
          {{ currentTranscript }}
        </p>
        <p v-else-if="isListening" class="transcript-text">請開始說話</p>
      </div>
    </transition>

    <!-- 錄音提示彈窗 -->
    <transition name="fade">
      <div v-if="voiceModalOpen" class="voice-modal">
        <div class="voice-content" @click.stop>
          <!-- 錯誤狀態 -->
          <template v-if="showVoiceError">
            <div class="voiceModelClose" @click="closeVoiceModal">
              <img src="/assets/imgs/robot/close.svg" alt="關閉" />
            </div>
            <p class="voice-error-text">剛剛沒聽清楚,我們再試一次吧。</p>
            <p class="voice-error-hint">請按一下「重新錄音」。</p>
            <img :src="voiceModalImageSrc" alt="音波圖" class="voice-wave" />
            <button
              class="voice-btn voice-btn-retry voice-btn-retry-not"
              @click="retryRecording"
            >
              重新錄音
            </button>
          </template>

          <!-- 準備開始說話（模態框已打開但還沒開始錄音） -->
          <template
            v-else-if="voiceModalOpen && !isListening && !isRecordingComplete"
          >
            <!-- 關閉按鈕 -->
            <div class="voiceModelClose" @click="closeVoiceModal">
              <img src="/assets/imgs/robot/close.svg" alt="關閉" />
            </div>

            <p class="voice-start-text">開始說話吧</p>
            <img :src="voiceModalImageSrc" alt="音波圖" class="voice-wave" />
            <!-- 開始說話按鈕 -->
            <button
              class="voice-btn voice-btn-start"
              @click="beginSpeechRecognition"
            >
              開始說話
            </button>
          </template>

          <!-- 錄音中顯示 -->
          <template v-else-if="isListening && !isRecordingComplete">
            <!-- 關閉按鈕 - 錄音中顯示（右上角） -->
            <div class="voiceModelClose" @click="stopRecording">
              <img src="/assets/imgs/robot/close.svg" alt="關閉" />
            </div>

            <!-- 如果還沒有收到聲音，顯示開始說話提示和音波圖 -->
            <template v-if="!currentTranscript || !currentTranscript.trim()">
              <p class="voice-start-text">開始說話吧</p>
              <img :src="voiceModalImageSrc" alt="音波圖" class="voice-wave" />
              <p class="voice-listening-text">聆聽中...</p>
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
                <button
                  class="voice-btn voice-btn-retry"
                  @click="retryRecording"
                >
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

    <!-- 語音播放錯誤提示 -->
    <transition name="fade">
      <div v-if="showAudioError" class="alert-dialog">
        <div class="alert-content">
          <p>您的裝置無法撥放聲音請檢查</p>
          <ul>
            <li>是否靜音模式</li>
            <li>是否支援中文語音撥放</li>
          </ul>
          <button @click="closeAudioError" class="alert-button">
            我知道了
          </button>
        </div>
      </div>
    </transition>

    <!-- 歷史紀錄頁面 -->
    <transition name="slide-left">
      <div v-if="showHistoryPage" class="history-page">
        <div class="history-header">
          <img
            src="/assets/imgs/backArrow.svg"
            @click="closeHistory"
            alt="返回"
            class="back-arrow"
          />

          <!-- 絕對置中的標題 -->
          <div class="title-center">
            <transition name="fade">
              <h2 v-if="!showSearch" class="history-title">聊天紀錄</h2>
            </transition>
          </div>

          <!-- 右側圖示群（固定寬度佔位）-->
          <div class="right-icons">
            <transition name="fade">
              <img
                v-if="!showSearch"
                :src="searchSvg"
                alt="搜尋"
                @click="toggleSearch"
                class="search-icon"
              />
            </transition>
            <img
              :src="calendarSvg"
              alt="日曆"
              class="calendar-icon"
              @click="toggleCalendar"
            />
          </div>

          <!-- 搜尋欄位（覆蓋整列）-->
          <transition name="slide-search">
            <div v-if="showSearch" class="search-container">
              <img :src="searchSvg" alt="搜尋" class="search-input-icon" />
              <input
                v-model="searchQuery"
                @input="performSearch"
                @keyup.enter="performSearch"
                type="text"
                placeholder="搜尋對話內容"
                class="search-input"
                ref="searchInputRef"
              />
              <img
                src="/assets/imgs/close.svg"
                alt="關閉"
                @click="toggleSearch"
                class="close-search-icon"
              />
            </div>
          </transition>
        </div>

        <div class="history-content">
          <!-- 載入更舊訊息指示器 -->
          <transition name="fade">
            <div v-if="isLoadingOlderMessages" class="loading-older-messages">
              <div class="spinner"></div>
              <span>載入更舊的訊息...</span>
            </div>
          </transition>

          <!-- 一般歷史記錄 -->
          <transition name="fade">
            <div
              v-if="!showSearch || searchQuery === ''"
              class="history-list"
              ref="historyScrollContainer"
            >
              <!-- 頂部哨兵：用於觸發載入更舊訊息 -->
              <div ref="topSentinel"></div>
              <div
                v-for="(group, date) in groupedHistory"
                :key="date"
                class="history-group"
              >
                <div class="date-separator">{{ formatDate(date) }}</div>
                <div
                  v-for="item in group"
                  :key="item.id"
                  class="history-message"
                  :id="`message-${item.id}`"
                >
                  <div
                    v-if="item.user && item.user.trim()"
                    class="message user"
                  >
                    <div class="bubble">
                      {{ item.user }}
                      <div class="time">{{ formatTime(item.timestamp) }}</div>
                    </div>
                  </div>

                  <div
                    v-if="item.isLoading || (item.bot && item.bot.trim())"
                    class="message bot"
                  >
                    <div class="avatar">
                      <img src="/assets/imgs/robotDemo/doctor.png" alt="院長" />
                    </div>

                    <div class="bubble">
                      <!-- 如果正在載入，顯示 loading.gif -->
                      <div v-if="item.isLoading" class="loading-in-message">
                        <img
                          :src="loadingGif"
                          alt="載入中"
                          class="loading-gif"
                        />
                      </div>
                      <!-- 否則顯示 bot 回覆 -->
                      <div v-else>
                        {{ item.bot }}
                      </div>
                      <div class="time">{{ formatTime(item.timestamp) }}</div>
                      <div class="sender-label">
                        {{ item.botFrom === "Human" ? "健康顧問" : "院長" }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <!-- 搜尋結果 -->
          <transition name="fade">
            <div
              v-if="showSearch && searchQuery && searchResults.length > 0"
              class="search-results"
            >
              <div class="search-results-header">
                <span>總共 {{ searchResults.length }}筆</span>
              </div>
              <div class="searchList">
                <div
                  v-for="result in searchResults"
                  :key="result.id"
                  class="search-result-item"
                  @click="scrollToMessage(result.id)"
                >
                  <div v-if="result.user && result.user.trim()" class="bubble">
                    <div class="content">
                      <span class="user-name">{{
                        result.userName || "用戶"
                      }}</span>
                      <span
                        v-html="highlightKeyword(result.user, searchQuery)"
                      ></span>
                    </div>
                    <span class="result-date">{{
                      formatDate(
                        result.dateKey ||
                          (result.timestamp
                            ? result.timestamp.split(" ")[0]
                            : "")
                      )
                    }}</span>
                  </div>
                  <div v-if="result.bot && result.bot.trim()" class="bubble">
                    <div class="content">
                      <span class="bot-name">院長</span>
                      <span
                        v-html="highlightKeyword(result.bot, searchQuery)"
                      ></span>
                    </div>
                    <span class="result-date">{{
                      formatDate(
                        result.dateKey ||
                          (result.timestamp
                            ? result.timestamp.split(" ")[0]
                            : "")
                      )
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <!-- 無搜尋結果 -->
          <transition name="fade">
            <div
              v-if="showSearch && searchQuery && searchResults.length === 0"
              class="no-results"
            >
              <img src="/assets/imgs/robot/mascotPhone.png" />
              <span>沒有找到相關對話</span>
            </div>
          </transition>

          <!-- 歷史頁輸入列（固定在底部） -->
          <div class="history-input-bar">
            <input
              v-model="textInput"
              class="history-text-input"
              type="text"
              placeholder="請輸入訊息..."
              @keypress.enter="handleManualInput"
              @click="focusHistoryInput"
              @focus="focusHistoryInput"
              ref="historyInputRef"
              inputmode="text"
            />
            <button
              class="history-send-btn"
              :disabled="isLoading || !textInput.trim()"
              @click="textInput.trim() && handleManualInput()"
              aria-label="送出"
            >
              <img :src="sendSvg" alt="送出" />
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 日曆選擇彈窗 -->
    <transition name="calendar-expand">
      <div v-if="showCalendar" class="calendar-overlay" @click="toggleCalendar">
        <div class="calendar-modal" @click.stop>
          <div class="calendar-header">
            <h3 class="calendar-title">選擇日期</h3>
            <img
              src="/assets/imgs/close.svg"
              alt="關閉"
              @click="toggleCalendar"
              class="calendar-close"
            />
          </div>
          <div class="calendar-content">
            <VueDatePicker
              v-model="selectedDate"
              :multi-dates="false"
              teleport="body"
              cancel-text="取消"
              select-text="確定"
              :locale="'zh-TW'"
              :enable-time-picker="false"
              no-today
              :min-date="minHistoryDate"
              :max-date="maxHistoryDate"
              :disabled-dates="isDateDisabledGlobally"
              :highlight="highlightDates"
              @update:month-year="onMonthYearChange"
              @update:modelValue="handleDateChange"
              class="calendar-datepicker"
            />

            <div v-if="monthDateKeySet.size === 0" class="no-dates">
              本月暫無聊天記錄
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import { useHead } from "#app";
import { navigateTo } from "#app";
import BottomNav from "~/components/BottomNav.vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from "swiper/vue";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
// import required modules
import { Pagination } from "swiper/modules";
// 移除import，改用動態路徑
import recycleSvg from "~/assets/imgs/robot/recycle.svg";
import messagesSquare from "~/assets/imgs/robot/messagesSquare.svg";
import soundSvg from "~/assets/imgs/robot/sound.svg";
import textIconSvg from "~/assets/imgs/robot/textIcon.svg";
import assistantSoundGif from "~/assets/imgs/robot/assistantSound.gif";
import assistantDefaultGif from "~/assets/imgs/robot/assistantDefault.gif";
import loadingGif from "~/assets/imgs/robot/loading.gif";
import lockSvg from "~/assets/imgs/robot/lock.svg";
import Alert from "~/components/Alert.vue";
import volumeSvg from "~/assets/imgs/robot/volume.svg";
import mutedSvg from "~/assets/imgs/robot/muted.svg";
import searchSvg from "~/assets/imgs/robot/search.svg";
import calendarSvg from "~/assets/imgs/robot/calendar.svg";
import sendSvg from "~/assets/imgs/robot/send.svg";

// ====== ChatGPT API ======
const TEXT_WEBHOOK_URL =
  "https://23700999.com:8081/push_notification/api/chatgpt/ask";
// 移除 API URL，改用 localStorage
// const TEXT_MESSAGE_URL = "https://23700999.com:8081/HMA/TTEsaveChatMessageHistory.jsp"; // ← 儲存聊天記錄
// const GET_CHAT_HISTORY_URL = "https://23700999.com:8081/HMA/api/fr/frGetLineAIHuman"; // ← 獲取聊天記錄

// ====== 角色相關 API ======
const GET_ALL_ROLES_URL = "https://23700999.com:8081/HMA/api/fr/ALLRole"; // ← 獲取所有角色
const ASSIGN_ROLE_URL = "https://23700999.com:8081/HMA/api/fr/AssignRole"; // ← 選擇角色
const GET_CURRENT_ROLE_URL = "https://23700999.com:8081/HMA/api/fr/getRole"; // ← 獲取當前角色
const CHANGE_ROLE_DISPLAY_NAME_URL =
  "https://23700999.com:8081/HMA/api/fr/RoleChgDisplayName"; // ← 更改角色顯示名稱
const voicegender = "male";
const historyInputRef = ref(null);
const topSentinel = ref(null);
let topObserver = null;

// Swiper modules
const swiperModules = [Pagination];
const characterSwiperRef = ref(null);

// 角色圖片載入狀態
const characterImageLoading = ref(new Set());

// 檢查角色是否被鎖定
const isCharacterLocked = (character) => {
  return character.locked === true;
};

// 響應式狀態
const router = useRouter();
const isListening = ref(false);
const isLoading = ref(false);
const conversations = ref([]);
const currentTranscript = ref("");
const isSpeaking = ref(false);
const isMuted = ref(false); // 靜音狀態
const UUID = getOrCreateVisitorID();
const textInput = ref("");
const showTextInput = ref(false);
const showVoiceControls = ref(false);
const showAudioError = ref(false);
const isManuallyStopped = ref(false);
const showHistoryPage = ref(false);
const showVoiceError = ref(false);

// 摘要模式相關狀態
const showSummaryMode = ref(false);
const currentSummary = ref("");
// 移除客服相關狀態
const pendingInput = ref(""); // 儲存待處理的輸入
const showSummaryProcessing = ref(false); // 摘要處理中彈窗
const isInSummaryFlow = ref(false); // 確保摘要流程不誤觸一般流程

// 定時器相關狀態
const apiPollingInterval = ref(null); // API 輪詢定時器
const isPollingActive = ref(false); // 是否正在輪詢

// 歷史資料相關狀態
const isLoadingOlderMessages = ref(false);
const hasMoreMessages = ref(false);
const currentPage = ref(1);
const messagesPerPage = ref(Infinity);
const callTime = ref(1);
const emptyBatchCount = ref(0);
const knownKeys = new Set(); // 用於去重的穩定鍵集合

// 移除首次登入解說相關狀態
// const showTutorial = ref(false);
// const currentTutorialStep = ref(1);
// const tutorialSteps = [1, 2, 3, 4, 5]; // 解說步驟順序
// 角色圖片現在完全由 API 提供，不再需要本地 import

const characterImageSrc = ref(null);

// UI 目前應該顯示誰的 computed
const uiCharacter = computed(() =>
  showCharacterSelection.value && tempSelectedCharacter.value
    ? tempSelectedCharacter.value
    : currentCharacter.value
);

const voiceModalImageSrc = ref(assistantSoundGif); // 語音模態框圖片路徑
const textInputRef = ref(null); // 添加文字輸入框的 ref
const searchInputRef = ref(null); // 添加搜尋輸入框的 ref
const nameInputRef = ref(null); // 添加名稱輸入框的 ref
const voiceModalTranscriptRef = ref(null); // 語音模態框中的文字顯示 ref
const latestResponse = ref(""); // 最新回覆
const showSearch = ref(false); // 搜尋功能開關
const searchQuery = ref(""); // 搜尋關鍵字
const searchResults = ref([]); // 搜尋結果
// 從 localStorage 獲取用戶資料（可選，用於記錄等功能）
const localData = localStorage.getItem("userData");
const localobj = localData ? JSON.parse(localData) : null;
console.log("localobj=", localobj?.Mobile);

// 移除登入檢查，允許未登入用戶使用
// if (!localData) {
//   router.push("/");
// }

const goToHealthLog2 = () => {
  router.push("/healthLog2");
};

const goToChatHistory = () => {
  router.push("/chatHistory");
};

// 角色選擇相關狀態
const showCharacterSelection = ref(false); // 顯示角色選擇彈窗
const showComingSoon = ref(false); // 顯示近期推出彈窗
const showCharacterExitConfirm = ref(false); // 顯示角色選擇離開確認彈窗
const tempSelectedCharacter = ref(null); // 臨時選擇的角色
const isStyleExpanded = ref(false); // 造型是否展開

// 角色載入狀態
const isCharacterLoading = ref(true); // 角色載入中
const isCharacterDataReady = ref(false); // 角色數據是否準備完成

// 角色命名相關狀態
const showNameInput = ref(false); // 顯示名稱輸入彈窗
const characterNameInput = ref(""); // 角色名稱輸入
const nameInputError = ref(""); // 名稱輸入錯誤訊息

// 新增：聊天歷史改進相關變數
const historyScrollContainer = ref(null);
const isScrolling = ref(false);
const scrollTimeout = ref(null);

// 生成穩定鍵用於去重（改用新 API 欄位）
const makeStableKey = (msg) => {
  // 盡量使用後端回傳的不可變欄位組合
  const check = msg.CheckTime || msg.TTCheckTime || "";
  const content = msg.Content || msg.Inmessage || msg.Outmessage || "";
  const mode = msg.Mode || "";
  const ah = msg.AHType || "";
  return `${check}|${mode}|${ah}|${content}`;
};

// 正確處理時間戳，修復時區問題
const parseCorrectTime = (timeString) => {
  if (!timeString) return new Date();

  // 如果時間格式是 "2025/09/23 09:57" 這種格式
  if (timeString.includes("/") && timeString.includes(" ")) {
    // 將 "2025/09/23 09:57" 轉換為本地時間，不進行時區轉換
    const [datePart, timePart] = timeString.split(" ");
    const [year, month, day] = datePart.split("/");
    const [hour, minute] = timePart.split(":");

    // 創建本地時間，不進行時區轉換
    return new Date(
      parseInt(year),
      parseInt(month) - 1, // 月份從0開始
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      0
    );
  }

  // 如果時間格式是 "2025-10-23 15:36:53" 這種格式（使用連字號）
  if (timeString.includes("-") && timeString.includes(" ")) {
    // 將 "2025-10-23 15:36:53" 轉換為本地時間，不進行時區轉換
    const [datePart, timePart] = timeString.split(" ");
    const [year, month, day] = datePart.split("-");
    const timeParts = timePart.split(":");
    const hour = timeParts[0] || "0";
    const minute = timeParts[1] || "0";
    const second = timeParts[2] || "0";

    // 創建本地時間，不進行時區轉換
    return new Date(
      parseInt(year),
      parseInt(month) - 1, // 月份從0開始
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );
  }

  // 如果是 ISO 格式，直接解析
  return new Date(timeString);
};

// 生成本地時間格式，避免時區問題
// 格式：YYYY-MM-DD HH:mm:ss（與 API 要求一致）
const getLocalTimeString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

// 日曆相關
const showCalendar = ref(false);
const selectedDate = ref(null);
const calendarDatesWithHistory = ref([]);
const today = new Date();
const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

// 日曆顯示的年月（0-11）
const visibleMonth = ref(new Date().getMonth());
const visibleYear = ref(new Date().getFullYear());

// 角色數據 - 完全由 API 提供
const currentCharacter = ref(null);
const availableCharacters = ref([]);

// 計算屬性：當前可見的造型
const visibleStyles = computed(() => {
  if (!currentCharacter.value || !availableCharacters.value.length) return [];

  const character = availableCharacters.value.find(
    (c) => c.id === currentCharacter.value.id
  );
  if (!character) return [];

  // 全部展開
  return character.styles || [];
});

let playbackConfirmed = false;
const voiceModalOpen = ref(false);
let voiceTimeout = null; // 語音識別超時計時器
let hasFinalResult = false; // 確保只處理一次 final
let finalizedByUs = false;
const isRecordingComplete = ref(false); // 錄音是否完成（用戶手動停止）
const pendingTranscript = ref(""); // 待處理的轉錄文字
let finalTranscript = ""; // ✅ 只放 final，不放 interim（避免 Android 重複）
const isReadyToSpeak = ref(false); // 是否準備好開始說話（已打開模態框但還沒開始錄音）

function clearVoiceTimeout() {
  if (voiceTimeout) {
    clearTimeout(voiceTimeout);
    voiceTimeout = null;
  }
}

function reallyCloseVoiceModal() {
  clearVoiceTimeout();
  isListening.value = false;
  isRecordingComplete.value = false;
  isReadyToSpeak.value = false; // 重置準備狀態
  showVoiceError.value = false;
  currentTranscript.value = "";
  pendingTranscript.value = "";
  voiceModalImageSrc.value = assistantSoundGif;
  voiceModalOpen.value = false; // ← 真正關窗
  // 重置 Android 相關狀態
  finalTranscript = ""; // ✅ 清空 final 累積
}

// 語音識別和合成實例
let recognitionRef = null;
let synthRef = null;
// ====== 新增：全域 Audio，集中管理播放與停止 ======
let player = null;
let currentObjectUrl = null;
function ensurePlayer() {
  if (!player) player = new Audio();
  return player;
}
function revokeObjectUrl() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

// 計算屬性：按日期分組的歷史記錄（升冪排列，最舊的在前面）
const groupedHistory = computed(() => {
  const groups = {};

  // 計算要顯示的對話數量（分頁）- 從最新的開始顯示
  const totalMessages = conversations.value.length;
  const startIndex = Math.max(
    0,
    totalMessages - currentPage.value * messagesPerPage.value
  );
  const displayedConversations = conversations.value.slice(startIndex); // ← 直接到最尾端（最新）

  displayedConversations.forEach((item) => {
    const date = item.dateKey || toDateKey(item.timestamp); // ← 確保有 dateKey
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
  });

  // 對每個日期組內的對話按時間排序（最新的在前面）
  Object.keys(groups).forEach((date) => {
    groups[date].sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0)); // 當日內：舊→新
  });

  // 按日期升冪排序（最舊的日期在前面）
  const sortedGroups = {};
  Object.keys(groups)
    .sort((a, b) => new Date(a) - new Date(b))
    .forEach((date) => {
      sortedGroups[date] = groups[date];
    });

  return sortedGroups;
});

// ✅ 全域：只允許「任何有紀錄的日子」
const isDateDisabledGlobally = (date) => {
  const key = toDateKey(date);
  return !calendarDateKeySet.value.has(key);
};

// ✅ 將所有有紀錄的日期高亮（VueDatePicker 支援 string 或 Date）
const highlightDates = computed(() =>
  Array.from(calendarDateKeySet.value).sort()
);

// 格式化日期
const formatDate = (dateStr) => {
  // 支援 YYYY-MM-DD 格式
  if (dateStr.includes("-")) {
    const [y, m, d] = dateStr.split("-");
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    return `${y}/${m}/${d} (${weekdays[dt.getDay()]})`;
  }

  // 原有的 YYYY/MM/DD 格式
  const date = new Date(dateStr);
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = weekdays[date.getDay()];
  return `${year}/${month}/${day} (${weekday})`;
};

// 格式化時間（只顯示時:分）
const formatTime = (timestamp) => {
  const timeStr = timestamp.split(" ")[1];
  const [hours, minutes] = timeStr.split(":");
  return `${hours}:${minutes}`;
};

// 設置活動標籤
const setActiveTab = (tab) => {
  if (process.client) {
    // 如果點擊首頁，顯示語音控制
    if (tab === "home") {
      showVoiceControls.value = true;
    } else {
      showVoiceControls.value = false;
    }
  }
};

// 顯示文字輸入（點擊 history-btn 時只彈出鍵盤，不打開歷史頁面）
const showHistory = () => {
  if (process.client) {
    // 只顯示文字輸入區域，不打開歷史頁面
    showTextInput.value = true;
    

    // 保留 @after-enter="focusTextInput" 作為備援
  }
};

const goToVoice = () => {
  // router.push("/specialAssistance");
};

// 關閉歷史記錄
const closeHistory = () => {
  if (process.client) {
    showHistoryPage.value = false;
    showSearch.value = false;
    searchQuery.value = "";
    searchResults.value = [];
    // 重置分頁和滾動狀態
    currentPage.value = 1;

    // 恢復背景滾動
    document.body.style.overflow = "";
  }
};

const closeTextInput = () => {
  showTextInput.value = false;
};

// 聚焦文字輸入框（觸發鍵盤彈出）
// 在 transition 的 after-enter 事件中調用，此時 DOM 已經完全渲染
const focusTextInput = () => {
  if (process.client && textInputRef.value) {
    textInputRef.value.focus({ preventScroll: true });
  }
};

// 聚焦歷史頁輸入框（觸發鍵盤彈出）
const focusHistoryInput = () => {
  if (process.client && historyInputRef.value) {
    nextTick(() => {
      historyInputRef.value?.focus();
    });
  }
};

// 移除首次登入解說相關函數
// const checkTutorialStatus = () => {
//   if (process.client) {
//     const hasSeenTutorial = localStorage.getItem("robotTutorialSeen");
//     if (!hasSeenTutorial) {
//       showTutorial.value = true;
//       currentTutorialStep.value = 1;
//     }
//   }
// };

// const closeTutorial = () => {
//   if (process.client) {
//     const currentIndex = tutorialSteps.indexOf(currentTutorialStep.value);
//     if (currentIndex < tutorialSteps.length - 1) {
//       // 如果還有下一步，切換到下一步
//       currentTutorialStep.value = tutorialSteps[currentIndex + 1];
//     } else {
//       // 如果是最後一步，關閉解說
//       showTutorial.value = false;
//       localStorage.setItem("robotTutorialSeen", "true");
//     }
//   }
// };

const lastScrollTop = ref(0);

function logScroll(e, tag = "scroll") {
  const el = e?.target || e;
  const { scrollTop, scrollHeight, clientHeight } = el;
  const dir = scrollTop > lastScrollTop.value ? "down" : "up";
  lastScrollTop.value = scrollTop;

  const atTop = scrollTop <= 0;
  const atBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

  console.log(
    `[${tag}] top=${Math.round(
      scrollTop
    )} h=${scrollHeight} c=${clientHeight} dir=${dir} top?${atTop} bottom?${atBottom}`
  );
}

// 處理歷史記錄滾動事件
const handleHistoryScroll = (e) => {
  logScroll(e, "history");
  if (!historyScrollContainer.value) return;

  const container = historyScrollContainer.value;
  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;

  // 檢查是否滾動到頂部 100px 以下（載入更舊訊息）
  if (
    scrollTop < 100 &&
    !isLoadingOlderMessages.value &&
    hasMoreMessages.value
  ) {
    loadOlderMessages();
  }

  // 更新 sticky header
  updateStickyHeader();

  // 設置滾動狀態
  isScrolling.value = true;

  // 清除之前的計時器
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value);
  }

  // 設置新的計時器（1.5秒後隱藏 sticky header）
  scrollTimeout.value = setTimeout(() => {
    isScrolling.value = false;
  }, 1500);
};

// 載入更舊的訊息
const loadOlderMessages = async () => {
  isLoadingOlderMessages.value = true;

  const container = historyScrollContainer.value;
  // 記住老的 scroll 狀態
  const oldScrollTop = container ? container.scrollTop : 0;
  const oldScrollHeight = container ? container.scrollHeight : 0;

  try {
    let addedCount = await fetchOlderChatHistory(callTime.value);
    // 只有真的有新資料才翻頁
    if (addedCount > 0) {
      callTime.value++;
      currentPage.value += 1;
    } else {
      emptyBatchCount.value = (emptyBatchCount.value || 0) + 1;
      if (emptyBatchCount.value >= 2) {
        hasMoreMessages.value = false;
      }
    }

    // 等待 DOM 更新完成
    await nextTick();

    // 正確的復原公式
    if (container) {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = oldScrollTop + (newScrollHeight - oldScrollHeight);
    }

    // 更新搜尋功能：重新計算搜尋結果（如果當前有搜尋）
    if (showSearch.value && searchQuery.value.trim()) {
      performSearch();
    }

    // 更新日曆可選時間
    loadCalendarDates();

    // 確保資料顯示完成後才允許下次觸發
    console.log("載入完成，搜尋和日曆已更新");
  } catch (error) {
    console.error("載入更舊訊息失敗:", error);
    // 如果載入失敗，回退 CallTime
    callTime.value--;
  } finally {
    // 確保載入狀態被重置，允許下次觸發
    isLoadingOlderMessages.value = false;
  }
};

// 更新 sticky header 日期
const updateStickyHeader = () => {
  if (!historyScrollContainer.value) return;

  const container = historyScrollContainer.value;
  const scrollTop = container.scrollTop;

  // 找到當前可見的第一個日期分隔器
  const dateSeparators = container.querySelectorAll(".date-separator");
  let currentDate = "";

  for (let i = 0; i < dateSeparators.length; i++) {
    const separator = dateSeparators[i];
    const rect = separator.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    if (rect.top >= containerRect.top) {
      currentDate = separator.textContent;
      break;
    }
  }
};

// 自動滾動到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (historyScrollContainer.value) {
      const container = historyScrollContainer.value;
      container.scrollTop = container.scrollHeight;
    }
  });
};

// 切換日曆顯示
const toggleCalendar = async () => {
  if (process.client) {
    showCalendar.value = !showCalendar.value;
    if (showCalendar.value) {
      // 重新獲取聊天記錄以確保日期是最新的
      await fetchChatHistory();
      loadCalendarDates(); // 更新所有有紀錄的日期

      // 設定日曆顯示的月份為最新有記錄的月份
      if (maxHistoryDate.value) {
        visibleMonth.value = maxHistoryDate.value.getMonth();
        visibleYear.value = maxHistoryDate.value.getFullYear();
      } else {
        const now = new Date();
        visibleMonth.value = now.getMonth();
        visibleYear.value = now.getFullYear();
      }

      console.log(
        `日曆開啟，顯示月份: ${visibleYear.value}/${visibleMonth.value + 1}`
      );
    }
  }
};

// 載入日曆中有聊天記錄的日期
const loadCalendarDates = () => {
  if (process.client) {
    // 清空現有數據
    calendarDateKeySet.value.clear();

    console.log("開始載入日曆日期，對話記錄數量:", conversations.value.length);

    // 從對話記錄中提取日期
    conversations.value.forEach((conversation, index) => {
      let dateKey;

      // 優先使用 dateKey
      if (conversation.dateKey) {
        dateKey = conversation.dateKey;
      }
      // 如果有 timestamp，從 timestamp 提取
      else if (conversation.timestamp) {
        try {
          // 處理字串格式的 timestamp
          if (typeof conversation.timestamp === "string") {
            const date = parseCorrectTime(conversation.timestamp);
            dateKey = toDateKey(date);
          } else {
            dateKey = toDateKey(conversation.timestamp);
          }
        } catch (e) {
          console.error(`處理對話 ${index} 的日期時發生錯誤:`, e);
          // 如果解析失敗，使用當前日期
          dateKey = toDateKey(new Date());
        }
      }
      // 如果有 ts (timestamp 數字)，從 ts 提取
      else if (conversation.ts) {
        try {
          const date = new Date(conversation.ts);
          dateKey = toDateKey(date);
        } catch (e) {
          console.error(`處理對話 ${index} 的 ts 時發生錯誤:`, e);
          dateKey = toDateKey(new Date());
        }
      }
      // 如果都沒有，使用當前日期
      else {
        console.warn(`對話 ${index} 沒有日期資訊，使用當前日期`);
        dateKey = toDateKey(new Date());
      }

      if (dateKey) {
        calendarDateKeySet.value.add(dateKey);
      }
    });

    // 更新 calendarDatesWithHistory 以保持向後兼容
    calendarDatesWithHistory.value = Array.from(
      calendarDateKeySet.value
    ).sort();

    console.log("最終載入的日期:", Array.from(calendarDateKeySet.value));
    console.log("排序後的日期:", calendarDatesWithHistory.value);
  }
};

// 處理日期選擇變更
const handleDateChange = async (date) => {
  if (!date) return;
  const key = toDateKey(date);
  console.log(`選擇日期: ${date}, 轉換為 key: ${key}`);

  // 關閉日曆
  showCalendar.value = false;

  // 找到該日期的第一則訊息
  const targetMessage = conversations.value.find((msg) => {
    const msgDateKey = msg.dateKey || toDateKey(msg.timestamp);
    return msgDateKey === key;
  });

  if (targetMessage) {
    console.log(`找到目標訊息 ID: ${targetMessage.id}`);

    // 確保該訊息在當前顯示範圍內
    const totalMessages = conversations.value.length;
    const messageIndex = conversations.value.findIndex(
      (msg) => msg.id === targetMessage.id
    );

    if (messageIndex !== -1) {
      // 計算需要顯示多少頁才能包含該訊息
      const messagesFromEnd = totalMessages - messageIndex;
      const requiredPages = Math.ceil(messagesFromEnd / messagesPerPage.value);
      currentPage.value = requiredPages;

      console.log(
        `調整分頁到第 ${currentPage.value} 頁以顯示日期 ${key} 的訊息`
      );

      // 等待 DOM 更新後滾動到目標訊息
      await nextTick();
      setTimeout(() => {
        const el = document.getElementById(`message-${targetMessage.id}`);
        if (el) {
          console.log(`滾動到訊息 ID: ${targetMessage.id}`);
          el.scrollIntoView({ behavior: "smooth", block: "start" });

          // 添加高亮效果
          el.style.backgroundColor = "rgba(116, 188, 31, 0.1)";
          el.style.borderRadius = "12px";
          el.style.transition = "background-color 0.3s ease";

          // 3秒後移除高亮
          setTimeout(() => {
            el.style.backgroundColor = "";
            el.style.borderRadius = "";
          }, 3000);
        } else {
          console.log(`找不到 DOM 元素: message-${targetMessage.id}`);
        }
      }, 100);
    }
  } else {
    console.log(`找不到日期 ${key} 的訊息`);
  }
};

// 檢查日期是否有聊天記錄
const isDateDisabled = (date) => {
  const dateStr = date.toISOString().split("T")[0];
  return !calendarDateKeySet.value.has(dateStr);
};

const onMonthYearChange = ({ month, year }) => {
  visibleMonth.value = month; // 0-11
  visibleYear.value = year;
};

// 切換搜尋功能
const toggleSearch = () => {
  if (process.client) {
    if (!showSearch.value) {
      // 開啟搜尋
      showSearch.value = true;
      // 延遲聚焦，等待動畫完成
      setTimeout(() => {
        if (searchInputRef.value) {
          searchInputRef.value.focus();
        }
      }, 700);
    } else {
      // 關閉搜尋
      searchQuery.value = "";
      searchResults.value = [];
      showSearch.value = false;
    }
  }
};

// 執行搜尋
const performSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  const query = searchQuery.value.toLowerCase().trim();
  const results = [];

  conversations.value.forEach((conversation) => {
    // 確保 user 和 bot 都是字串，避免 undefined 或 null
    const userText = (conversation.user || "").toString().toLowerCase();
    const botText = (conversation.bot || "").toString().toLowerCase();

    const userMatch = userText.includes(query) && userText.length > 0;
    const botMatch = botText.includes(query) && botText.length > 0;

    if (userMatch || botMatch) {
      results.push({
        ...conversation,
        matchType: userMatch ? "user" : "bot",
        matchText: userMatch ? conversation.user : conversation.bot,
        userName: "用戶", // 可以根據需要設置用戶名稱
      });
    }
  });

  // 按日期降冪排列（最新的在上面）
  searchResults.value = results.sort((a, b) => {
    try {
      const dateA = new Date(a.timestamp || a.ts || Date.now());
      const dateB = new Date(b.timestamp || b.ts || Date.now());
      return dateB - dateA;
    } catch (e) {
      console.error("排序搜尋結果時發生錯誤:", e);
      return 0;
    }
  });

  console.log(`搜尋 "${searchQuery.value}" 找到 ${results.length} 筆結果`);
};

// 清除搜尋（保留函數以備將來使用）
const clearSearch = () => {
  if (process.client) {
    searchQuery.value = "";
    searchResults.value = [];
  }
};

// 處理角色圖片點擊
const handleCharacterClick = () => {
  // 可以添加其他點擊處理邏輯
};

// 關閉語音模態框
const closeVoiceModal = () => {
  reallyCloseVoiceModal();
};

// 處理語音模態框圖片點擊
const handleVoiceModalClick = () => {
  if (showVoiceError.value && process.client) {
    showVoiceError.value = false;
    // 重新開始語音識別
    if (recognitionRef) {
      currentTranscript.value = "";
      // 切換回音波圖片
      voiceModalImageSrc.value = assistantSoundGif;
      recognitionRef.start();
      isListening.value = true;
      // 重新設置超時（初始時沒有文字）
      startVoiceTimeout(false);
    }
  }
};

// 開始語音識別超時計時器
// 當有文字時，延長超時時間；無文字時，較短超時
const startVoiceTimeout = (hasText = false) => {
  if (voiceTimeout) {
    clearTimeout(voiceTimeout);
  }

  // 如果有文字，給更長的靜音時間（5秒）；如果沒有文字，給10秒
  const timeoutDuration = hasText ? 5000 : 10000;

  voiceTimeout = setTimeout(() => {
    if (isListening.value) {
      const transcript = currentTranscript.value.trim();

      if (!transcript) {
        // ✅ 沒有文字，10秒後顯示錯誤狀態（不自動關閉）
        showVoiceError.value = true;
        voiceModalImageSrc.value = assistantDefaultGif;
        isListening.value = false;
        if (process.client) {
          recognitionRef?.stop();
        }
      } else {
        // 有文字但靜音超過5秒，自動結束並處理
        hasFinalResult = true;
        clearVoiceTimeout();
        finalizedByUs = true;
        reallyCloseVoiceModal();
        handleSpeechEnd(transcript);
        if (process.client) {
          try {
            recognitionRef?.stop();
          } catch {}
        }
      }
    }
  }, timeoutDuration);
};

// ✅ 重疊合併工具（字元層級，能抗空白/微修正）
function mergeWithOverlap(base = "", addition = "") {
  base = (base || "").trim();
  addition = (addition || "").trim();
  if (!base) return addition;
  if (!addition) return base;

  // 如果 addition 已包含 base（Android 常見：回傳整句）
  if (addition.includes(base)) return addition;

  // 找最大重疊後綴/前綴
  const max = Math.min(base.length, addition.length);
  for (let k = max; k > 0; k--) {
    if (base.slice(-k) === addition.slice(0, k)) {
      return (base + addition.slice(k)).trim();
    }
  }
  return (base + " " + addition).trim();
}

// 初始化語音識別
const initSpeechRecognition = () => {
  if (process.client && typeof window !== "undefined") {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef = new SpeechRecognition();

      // ✅ Android 優化：某些機型 continuous = true 會導致頻繁 onend → restart
      const isAndroid = /Android/i.test(navigator.userAgent);
      recognitionRef.continuous = !isAndroid; // Android 用 false 比較穩

      recognitionRef.interimResults = true;
      recognitionRef.lang = "zh-TW";

      recognitionRef.onresult = (event) => {
        let interimText = "";

        // ✅ 只處理「新增」的 results，避免 Android 重掃造成重複
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const r = event.results[i];
          const text = (r[0]?.transcript || "").trim();
          if (!text) continue;

          if (r.isFinal) {
            // ✅ final：Android 可能回整句，也可能只回新增片段
            finalTranscript = mergeWithOverlap(finalTranscript, text);
            interimText = ""; // final 出現就清 interim
          } else {
            // interim：只保留最新一段（不累積）
            interimText = text;
          }
        }

        // ✅ 顯示用：final + interim（用重疊合併，避免重複）
        const textToShow = mergeWithOverlap(finalTranscript, interimText);

        // 調試日誌：檢查結果
        if (process.client && textToShow) {
          console.log("語音識別結果處理:", {
            resultIndex: event.resultIndex,
            resultsCount: event.results.length,
            textToShow,
            finalTranscript,
            interimText,
            results: Array.from(event.results)
              .slice(event.resultIndex)
              .map((r, i) => ({
                index: event.resultIndex + i,
                text: r[0].transcript,
                isFinal: r.isFinal,
              })),
          });
        }

        // 直接更新 DOM（你原本那套保留）
        if (process.client) {
          const transcriptEl =
            voiceModalTranscriptRef.value ||
            document.querySelector(".voice-modal .transcript-display") ||
            document.querySelector(".voice-modal .transcript-text");

          if (transcriptEl) {
            transcriptEl.textContent = textToShow;
            transcriptEl.style.display = textToShow ? "block" : "none";
            if (textToShow) {
              transcriptEl.style.opacity = "1";
              transcriptEl.style.visibility = "visible";
            }
            void transcriptEl.offsetHeight;
            requestAnimationFrame(() => {
              if (transcriptEl) transcriptEl.textContent = textToShow;
            });
          }

          // 同步 Vue
          currentTranscript.value = textToShow;

          // ✅ 收到聲音時，清除超時計時器並重新啟動（如果有文字用5秒，沒文字用10秒）
          if (textToShow && textToShow.trim()) {
            startVoiceTimeout(true); // 有文字，給5秒
          } else {
            startVoiceTimeout(false); // 沒文字，給10秒
          }
        }
      };

      recognitionRef.onerror = (event) => {
        // 靜默處理 no-speech 和 aborted 錯誤，不輸出錯誤日誌
        // aborted 是我們主動停止錄音時的正常行為，不是錯誤
        if (
          process.client &&
          event.error !== "no-speech" &&
          event.error !== "aborted"
        ) {
          console.error("語音識別錯誤:", event.error);
        }

        // 不自動停止錄音和清空狀態，讓錯誤處理邏輯決定
        // 只有在特定錯誤（如 not-allowed）時才停止

        // 清除超時計時器
        if (voiceTimeout) {
          clearTimeout(voiceTimeout);
          voiceTimeout = null;
        }

        // 處理不同的錯誤類型
        if (process.client) {
          switch (event.error) {
            case "not-allowed":
              alert("請允許麥克風權限以使用語音功能");
              closeVoiceModal();
              break;
            case "no-speech":
              // 不顯示錯誤提示，讓用戶可以繼續錄音，不限制秒數
              // 自動重新啟動錄音，保持連續不中斷
              if (isListening.value && !isRecordingComplete.value) {
                try {
                  setTimeout(() => {
                    if (
                      isListening.value &&
                      !isRecordingComplete.value &&
                      recognitionRef
                    ) {
                      recognitionRef.start();
                      console.log("no-speech 自動重新啟動錄音");
                    }
                  }, 100);
                } catch (error) {
                  console.error("自動重新啟動失敗:", error);
                }
              }
              break;
            case "audio-capture":
              // 音訊捕獲錯誤，不顯示錯誤提示，自動重新啟動
              // 讓用戶可以繼續錄音，不限制秒數
              if (isListening.value && !isRecordingComplete.value) {
                try {
                  setTimeout(() => {
                    if (
                      isListening.value &&
                      !isRecordingComplete.value &&
                      recognitionRef
                    ) {
                      recognitionRef.start();
                      console.log("audio-capture 自動重新啟動錄音");
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
            default:
              // aborted 是我們主動停止錄音時的正常行為，不需要處理
              // 其他錯誤也不自動顯示錯誤提示，讓用戶可以繼續
              if (event.error !== "aborted") {
                // 其他錯誤已經在開頭過濾了，這裡不需要再輸出
              }
          }
        }
      };

      recognitionRef.onend = () => {
        // 如果是我們主動停止的，直接返回
        if (finalizedByUs) {
          finalizedByUs = false;
          hasFinalResult = false;
          return;
        }

        // 如果語音識別自然結束（瀏覽器自動停止，例如長時間靜音）
        // 但用戶還在錄音狀態，我們需要自動重新啟動以保持連續錄音
        if (isListening.value && !isRecordingComplete.value && process.client) {
          // 自動重新啟動錄音，保持連續不中斷
          try {
            // 使用 setTimeout 避免立即重啟可能造成的問題
            setTimeout(() => {
              if (
                isListening.value &&
                !isRecordingComplete.value &&
                recognitionRef
              ) {
                recognitionRef.start();
                console.log("語音識別自動重新啟動，保持連續錄音");
              }
            }, 100);
          } catch (error) {
            console.error("自動重新啟動語音識別失敗:", error);
            // 如果重新啟動失敗，不顯示錯誤提示，讓用戶可以繼續嘗試
          }
        }

        hasFinalResult = false;
      };
    }

    // 初始化語音合成
    if ("speechSynthesis" in window) {
      synthRef = window.speechSynthesis;
    }
  }
};

// 寫入聊天紀錄的 helper 函數（使用 localStorage）
async function saveChatRecord({
  inMsg = "",
  outMsg = "",
  inputAt,
  outputAt,
} = {}) {
  // 確保訊息內容不為空
  if (!inMsg && !outMsg) {
    console.warn("保存聊天記錄失敗: 輸入和輸出訊息都為空");
    return { success: false, error: "訊息內容為空" };
  }

  // 預設使用本地時間（避免時區問題）
  const inputTime = inputAt || getLocalTimeString(new Date());
  const outputTime = outputAt || getLocalTimeString(new Date());

  try {
    // 從 localStorage 讀取現有聊天記錄
    const storageKey = "robotDemo_chatHistory";
    const existingData = localStorage.getItem(storageKey);
    const chatHistory = existingData ? JSON.parse(existingData) : [];

    // 創建新的聊天記錄項目
    const newRecord = {
      id: Date.now(),
      ts: Date.now(),
      user: inMsg || "",
      bot: outMsg || "",
      timestamp: inputTime,
      dateKey: toDateKey(new Date(inputTime)),
      inputTime,
      outputTime,
    };

    // 添加到記錄中
    chatHistory.push(newRecord);

    // 保存回 localStorage
    localStorage.setItem(storageKey, JSON.stringify(chatHistory));

    console.log("聊天記錄已保存到 localStorage:", newRecord);

    // ✅ 觸發自定義事件，讓 healthLog2.vue 可以即時更新（同頁面內）
    if (process.client) {
      window.dispatchEvent(
        new CustomEvent("chatHistoryUpdated", {
          detail: { chatHistory },
        })
      );
    }

    return { success: true, data: newRecord };
  } catch (e) {
    console.error("保存聊天記錄失敗:", e);
    return { success: false, error: e.message || String(e) };
  }
}

async function runSummaryFlow(inputText) {
  try {
    isInSummaryFlow.value = true;

    // 呼叫 ChatGPT 產生精簡內容
    const aiResponse = await callChatGPT(
      inputText,
      `你是一個「健康管理的陪伴機器人」，你的工作只有一項：
1.忠實紀錄與潤飾使用者的症狀/身體困擾內容，並整理成可交給醫師的結構化紀錄。
【輸出格式要求】
只輸出以下一個區塊（不要加星號、不要加多餘符號、不要加說明文字）：
（逐句潤飾我說的內容，使語句更清楚流暢，但意思完全相同。
如果有多個症狀或事件，可分多筆，但每筆資料必須是我說過的內容。）
【限制規則】
1. 忠實記錄我說的每一句話或資訊（不可遺漏）。
2. 不改變原意，只能優化語序、加標點、使語句更自然。
3. 不可推理或猜測病因。
4. 不可補充我沒說的內容。
5. 不可加入任何建議、分析、評論或衛教。
6. 不可使用 *、#、-、>、Markdown 格式符號。
7. 不可使用條列符號，全部以自然語句呈現。
請嚴格遵守以上格式與規則，開始後不需要再次重述任務或格式。

`
    );

    // 設置原始輸入到 pendingInput，供後續使用
    pendingInput.value = inputText;
    const summaryText = aiResponse || inputText;
    currentSummary.value = summaryText;

    // ✅ 直接儲存摘要到 localStorage（不顯示彈窗）
    try {
      const storageKey = "robotDemo_healthLogs";
      const existingData = localStorage.getItem(storageKey);
      const healthLogs = existingData ? JSON.parse(existingData) : [];

      // 使用本地時間，避免時區問題
      const now = new Date();
      const localDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      );

      const newLog = {
        id: Date.now(),
        date: localDate.toISOString(), // 使用本地時間的 ISO 格式
        timestamp: localDate.toISOString(),
        type: "summary",
        content: summaryText, // AI摘要內容
        preSoundNote: inputText, // 口述內容（原始內容）
      };

      healthLogs.push(newLog);
      localStorage.setItem(storageKey, JSON.stringify(healthLogs));
      console.log("摘要已自動儲存到 localStorage:", newLog);

      // ✅ 觸發自定義事件，讓 healthLog2.vue 可以即時更新（同頁面內）
      if (process.client) {
        window.dispatchEvent(
          new CustomEvent("healthLogsUpdated", {
            detail: { logs: healthLogs },
          })
        );
      }
    } catch (error) {
      console.error("儲存摘要失敗:", error);
      // 不顯示錯誤提示，靜默失敗
    }

    // ✅ 只調用一次摘要 API，不再調用後續的對話 API
    // 移除 handleSummaryModeContinue 調用
  } catch (error) {
    console.error("摘要流程失敗:", error);

    // 設置原始輸入到 pendingInput，供後續使用
    pendingInput.value = inputText;
    currentSummary.value = inputText;

    // 即使失敗也嘗試儲存原始輸入
    try {
      const storageKey = "robotDemo_healthLogs";
      const existingData = localStorage.getItem(storageKey);
      const healthLogs = existingData ? JSON.parse(existingData) : [];

      const now = new Date();
      const localDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      );

      const newLog = {
        id: Date.now(),
        date: localDate.toISOString(),
        timestamp: localDate.toISOString(),
        type: "summary",
        content: inputText,
        preSoundNote: inputText,
      };

      healthLogs.push(newLog);
      localStorage.setItem(storageKey, JSON.stringify(healthLogs));

      if (process.client) {
        window.dispatchEvent(
          new CustomEvent("healthLogsUpdated", {
            detail: { logs: healthLogs },
          })
        );
      }
    } catch (saveError) {
      console.error("儲存摘要失敗:", saveError);
    }

    // ✅ 只調用一次摘要 API，不再調用後續的對話 API
    // 移除 handleSummaryModeContinue 調用
  } finally {
    isInSummaryFlow.value = false;
    isLoading.value = false; // ✅ 確保載入狀態被重置
  }
}

/** 統一使用 TTEgetChatMessageHistoryList.jsp API 處理語音和文字輸入 */
async function sendViaUnifiedAPI(
  userText,
  { playAudio = false, extra = {} } = {}
) {
  // 移除登入檢查，允許未登入用戶使用
  // if (!localobj) {
  //   console.error("用戶資料不存在");
  //   return "（親愛的:您的問題我目前沒辦法回答）";
  // }

  // 使用本地時間，避免時區問題
  const now = new Date();
  const localTime = getLocalTimeString(now);

  // 📌 24 小時聊天記憶功能：提取最近 24 小時內的對話
  const twentyFourHoursAgo = now.getTime() - 24 * 60 * 60 * 1000;
  const recentConversations = conversations.value
    .filter((conv) => {
      const convTime = conv.ts || new Date(conv.timestamp).getTime();
      return convTime >= twentyFourHoursAgo;
    })
    .map((conv) => ({
      user: conv.user || "",
      assistant: conv.bot || "",
    }))
    .filter((conv) => conv.user || conv.assistant); // 只保留有內容的對話

  console.log(
    `24 小時內對話數量: ${recentConversations.length}`,
    recentConversations
  );

  // 📌 將 conversationHistory 格式化為字串，合併到 message 中
  const messageWithHistory = JSON.stringify({
    text: userText,
    conversationHistory: recentConversations,
  });

  // ✅ 已移除 API 調用，直接返回默認值
  const finalAnswer = "（親愛的:您的問題我目前沒辦法回答）";

  // 保存聊天記錄到 localStorage
  try {
    const saveResult = await saveChatRecord({
      inMsg: userText,
      outMsg: finalAnswer,
      inputAt: localTime,
      outputAt: getLocalTimeString(new Date()),
    });
    console.log("對話已保存到 localStorage:", {
      userText,
      finalAnswer,
      saveResult,
    });
  } catch (e) {
    console.error("寫入聊天紀錄失敗:", e);
    // 即使保存失敗，也繼續返回結果，不影響用戶體驗
  }

  return finalAnswer;
}

// 開始/停止語音識別
const toggleListening = () => {
  if (!recognitionRef) {
    unlockAudioIfNeeded(); // 🔓 在使用者手勢內解鎖音訊
    if (process.client && typeof window !== "undefined") {
      // 檢查是否為 HTTPS 或 localhost
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
    // 如果正在錄音，停止錄音並顯示確認按鈕
    stopRecording();
  } else {
    // 開始錄音
    startRecording();
  }
};

// 開始錄音（打開模態框，但不立即開始錄音）
const startRecording = () => {
  if (process.client) {
    showVoiceError.value = false;
    voiceModalImageSrc.value = assistantSoundGif;
    currentTranscript.value = "";
    pendingTranscript.value = "";
    hasFinalResult = false;
    finalizedByUs = false;
    isRecordingComplete.value = false;
    isReadyToSpeak.value = false; // 重置為未準備狀態
    voiceModalOpen.value = true; // ← 開窗
    isListening.value = false; // 先不開始錄音，等待用戶點擊按鈕
    // 重置 Android 相關狀態
    finalTranscript = ""; // ✅ 一定要清，不然會沿用上次錄音
    currentTranscript.value = "";
  }
};

// 真正開始語音識別（用戶點擊「開始說話」按鈕後）
const beginSpeechRecognition = () => {
  if (process.client && recognitionRef) {
    isReadyToSpeak.value = true; // 標記為已準備好
    isListening.value = true; // 開始錄音

    // Android 兼容性：立即準備文字元素，不等待 nextTick
    // 使用雙重機制：立即操作 + nextTick 備用
    const prepareTranscriptEl = () => {
      const transcriptEl =
        voiceModalTranscriptRef.value ||
        document.querySelector(".voice-modal .transcript-text");
      if (transcriptEl) {
        transcriptEl.style.display = "block";
        transcriptEl.style.opacity = "1";
        transcriptEl.style.visibility = "visible";
        transcriptEl.textContent = ""; // 清空之前的內容
        // 強制重繪
        transcriptEl.offsetHeight;
      }
    };

    // 立即執行
    prepareTranscriptEl();

    // nextTick 作為備用
    nextTick(() => {
      prepareTranscriptEl();
    });

    recognitionRef.start();
    // ✅ 啟動10秒超時計時器（如果沒有聲音，顯示錯誤狀態）
    startVoiceTimeout(false);
  }
};

// 停止錄音（用戶點擊關閉按鈕）
const stopRecording = () => {
  if (process.client && recognitionRef) {
    finalizedByUs = true;
    recognitionRef.stop();
  }

  // 直接關閉模態框，不顯示確認畫面
  reallyCloseVoiceModal();
  isRecordingComplete.value = false;
  pendingTranscript.value = "";
};

// 重新錄音（回到開始錄音狀態）
const retryRecording = () => {
  // 停止當前錄音
  if (process.client && recognitionRef) {
    finalizedByUs = true;
    recognitionRef.stop();
  }

  // 清除當前錄音會話的對話紀錄（只清除當前錄音產生的，不影響歷史紀錄）
  // 這裡我們需要清除當前錄音過程中累積的轉錄內容
  // 但由於 currentTranscript 會在 startRecording 中被清空，這裡主要確保狀態重置

  // 重置狀態
  isRecordingComplete.value = false;
  isReadyToSpeak.value = false; // 重置準備狀態
  pendingTranscript.value = "";
  currentTranscript.value = "";
  showVoiceError.value = false;
  // 重置 Android 相關狀態
  finalTranscript = ""; // ✅ 清空 final 累積

  // 重新開始錄音（打開模態框，但不立即開始）
  startRecording();
};

// 從錄音中直接送出語音（錄音中點擊「送出語音」按鈕）
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

  // 關閉模態框
  reallyCloseVoiceModal();
  isRecordingComplete.value = false;
  pendingTranscript.value = "";

  // 直接處理語音輸入（延續之前的後續動作）
  await handleSpeechEnd(transcript);
};

// 送出語音訊息（錄音完成後點擊「送出語音」按鈕）
const sendVoiceMessage = async () => {
  const transcript = pendingTranscript.value.trim();

  if (!transcript) {
    alert("請先錄音");
    return;
  }

  // 關閉模態框
  reallyCloseVoiceModal();
  isRecordingComplete.value = false;
  pendingTranscript.value = "";

  // 處理語音輸入（延續之前的後續動作）
  await handleSpeechEnd(transcript);
};

// 處理語音輸入結束
const handleSpeechEnd = async (transcript) => {
  if (!transcript.trim()) return;

  // 檢查是否正在等待 AI 回應，如果是則不允許發送新訊息
  const hasLoadingMessage = conversations.value.some(
    (msg) => msg.isLoading === true
  );
  if (hasLoadingMessage || isLoading.value) {
    console.log("正在等待 AI 回應，請稍候...");
    return;
  }

  // 語音輸入：顯示 "思考中..." 而不是用戶輸入
  isLoading.value = true;
  currentTranscript.value = "";

  try {
    // 所有輸入都會進入摘要模式（移除50字限制）
    await runSummaryFlow(transcript); // 不新增聊天泡泡，但 DB 會寫兩筆
    // 注意：runSummaryFlow 內部可能會設置 isLoading，所以這裡不直接設置 false
    // 讓 runSummaryFlow 自己管理 isLoading 狀態
    return;

    // 移除客服功能，直接處理輸入

    // 正常處理語音輸入
    const botResponse = await sendViaUnifiedAPI(transcript, {
      playAudio: !isMuted.value, // 根據靜音狀態決定是否播放語音
    });
    console.log("語音處理完成，botResponse:", botResponse);

    // 保存對話記錄
    const nowTs = Date.now();
    const newConversation = {
      id: nowTs,
      ts: nowTs,
      user: transcript,
      bot: botResponse || "（親愛的:您的問題我目前沒辦法回答）",
      timestamp: new Date().toLocaleString("zh-TW"),
      dateKey: toDateKey(new Date(nowTs)),
    };

    conversations.value.push(newConversation);
    latestResponse.value = botResponse || "（親愛的:您的問題我目前沒辦法回答）";
    saveConversations();

    // 如果當前在歷史記錄頁面，確保新訊息可見
    if (showHistoryPage.value) {
      currentPage.value = 1;
      nextTick(() => {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      });
    }

    console.log("語音輸入處理完成");
  } catch (error) {
    console.error("API 調用錯誤:", error);
    const errorResponse = "抱歉，服務暫時無法使用，請稍後再試。";
    const nowTs = Date.now();
    const localTime = getLocalTimeString(new Date(nowTs));

    // 保存錯誤對話到 localStorage
    try {
      await saveChatRecord({
        inMsg: transcript,
        outMsg: errorResponse,
        inputAt: localTime,
        outputAt: getLocalTimeString(new Date()),
      });
      console.log("錯誤對話已保存到 localStorage");
    } catch (saveError) {
      console.error("保存錯誤對話失敗:", saveError);
    }

    const errorConversation = {
      id: nowTs,
      ts: nowTs,
      user: transcript,
      bot: errorResponse,
      timestamp: new Date().toLocaleString("zh-TW"),
      dateKey: toDateKey(new Date(nowTs)),
    };
    conversations.value.push(errorConversation);
    latestResponse.value = errorResponse;
    saveConversations();

    // 如果當前在歷史記錄頁面，確保新訊息可見
    if (showHistoryPage.value) {
      currentPage.value = 1;
      nextTick(() => {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      });
    }
  } finally {
    isLoading.value = false;
  }
};

// 語音播放文字
const speakText = (text) => {
  if (!synthRef || !text?.trim() || !process.client || isMuted.value) {
    console.log("語音播放條件不滿足:", {
      synthRef: !!synthRef,
      text: !!text,
      client: process.client,
      muted: isMuted.value,
    });
    return;
  }

  console.log("開始播放語音:", text);

  const speak = () => {
    if (!process.client) return;

    isManuallyStopped.value = false;
    playbackConfirmed = false;

    // 停掉另外一路的 <audio>
    try {
      const a = ensurePlayer();
      a.pause();
      a.currentTime = 0;
    } catch {}
    // 停掉既有 TTS
    try {
      synthRef.cancel();
    } catch {}

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-TW";

    // 使用固定的聲音設置（院長角色）
    const voiceSettings = {
      rate: 0.9,
      pitch: 0.85,
      volume: 1,
    };

    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    utterance.onstart = () => {
      if (!process.client) return;
      console.log("語音開始播放");
      playbackConfirmed = true;
      isSpeaking.value = true;
    };

    utterance.onend = () => {
      if (process.client) {
        console.log("語音播放結束");
        isSpeaking.value = false;
        isLoading.value = false;
      }
    };

    utterance.onerror = (e) => {
      if (process.client) {
        console.error("語音播放錯誤:", e);
        isSpeaking.value = false;
        isLoading.value = false;
        if (!isManuallyStopped.value) {
          showAudioError.value = true;
        }
      }
    };

    try {
      if (process.client) {
        synthRef.speak(utterance);
        console.log("已調用 synthRef.speak");
      }
    } catch (err) {
      console.error("語音播放錯誤:", err);
    }
  };

  // 確保語音合成器已準備好
  if (process.client && synthRef) {
    if (synthRef.getVoices().length === 0) {
      console.log("等待語音列表載入...");
      synthRef.onvoiceschanged = () => {
        console.log("語音列表已載入，開始播放");
        speak();
      };
    } else {
      console.log("語音列表已存在，直接播放");
      speak();
    }
  }
};

// 停止語音播放
const stopSpeaking = () => {
  /* if (synthRef && process.client) {
    isManuallyStopped.value = true
    showAudioError.value = false  // ✅ 手動停止不顯示錯誤視窗
    synthRef.cancel()
    isSpeaking.value = false
  }*/
  const a = ensurePlayer();
  try {
    a.pause();
    a.currentTime = 0;
  } catch {}
  isSpeaking.value = false;
  revokeObjectUrl();
};

// 切換音量控制
const toggleVolume = () => {
  if (process.client) {
    // 切換靜音狀態
    isMuted.value = !isMuted.value;

    // 停掉 TTS
    try {
      synthRef?.cancel();
    } catch {}

    // 停掉 <audio> 播放
    try {
      const a = ensurePlayer();
      a.pause();
      a.currentTime = 0;
    } catch {}

    // 保存靜音狀態到本地存儲
    localStorage.setItem("isMuted", JSON.stringify(isMuted.value));

    console.log("音量控制切換:", isMuted.value ? "靜音" : "開啟");

    // 如果從靜音切換到開啟，播放測試音
    if (!isMuted.value) {
      setTimeout(() => {
        speakText("語音功能已開啟");
      }, 500);
    }
  }
};

// 音訊解鎖機制（避免iOS自動播放限制）
function unlockAudioIfNeeded() {
  const a = ensurePlayer();
  try {
    a.muted = true;
    a.play()
      .then(() => {
        a.pause();
        a.currentTime = 0;
        a.muted = false;
      })
      .catch(() => {});
  } catch {}
}

// 關閉音頻錯誤提示
const closeAudioError = () => {
  if (process.client) {
    showAudioError.value = false;
  }
};

async function handleManualInput() {
  const input = textInput.value.trim();
  if (!input) return;

  // 檢查是否正在等待 AI 回應，如果是則不允許發送新訊息
  const hasLoadingMessage = conversations.value.some(
    (msg) => msg.isLoading === true
  );
  if (hasLoadingMessage || isLoading.value) {
    console.log("正在等待 AI 回應，請稍候...");
    return;
  }

  unlockAudioIfNeeded(); // 🔓 文字送出也解鎖一次

  // 設置載入狀態，防止連續發送
  isLoading.value = true;

  // 所有輸入都會進入摘要模式（移除50字限制）
  const raw = input;
  textInput.value = "";
  
  // ✅ 輸入完成後立即關閉文字輸入框
  closeTextInput();
  
  try {
    await runSummaryFlow(raw); // 不新增聊天泡泡，但 DB 會寫兩筆
  } finally {
    // 摘要模式完成後才解除載入狀態
    // 注意：runSummaryFlow 內部可能會設置 isLoading，所以這裡不直接設置 false
    // 讓 runSummaryFlow 自己管理 isLoading 狀態
  }
  return;

  // 移除客服功能，直接處理輸入

  // 文字輸入：立即將用戶輸入添加到聊天記錄中
  const nowTs = Date.now();
  const userMessage = {
    id: nowTs,
    ts: nowTs,
    user: input,
    bot: "", // 暫時為空，等待 API 回傳
    timestamp: new Date().toLocaleString("zh-TW"),
    dateKey: toDateKey(new Date(nowTs)),
    isLoading: true, // 標記為載入中
  };

  // 立即添加到聊天記錄
  conversations.value.push(userMessage);
  currentTranscript.value = "";
  textInput.value = "";

  // 如果當前在歷史記錄頁面，滾動到底部
  if (showHistoryPage.value) {
    currentPage.value = 1;
    nextTick(() => {
      setTimeout(() => {
        scrollToBottom();
        historyInputRef.value?.focus();
      }, 100);
    });
  }

  try {
    const botResponse = await sendViaUnifiedAPI(input, {
      playAudio: !isMuted.value,
    });
    console.log("文字處理完成，botResponse:", botResponse);

    // 更新聊天記錄中的 bot 回覆
    const messageIndex = conversations.value.findIndex(
      (msg) => msg.id === nowTs
    );
    if (messageIndex !== -1) {
      conversations.value[messageIndex].bot =
        botResponse || "（親愛的:您的問題我目前沒辦法回答）";
      conversations.value[messageIndex].isLoading = false;
    }

    latestResponse.value = botResponse || "（親愛的:您的問題我目前沒辦法回答）";
    saveConversations();

    console.log("文字輸入處理完成:", userMessage);
  } catch (error) {
    console.error("API 調用錯誤:", error);
    const errorResponse = "抱歉，服務暫時無法使用，請稍後再試。";

    // 更新聊天記錄中的錯誤回覆
    const messageIndex = conversations.value.findIndex(
      (msg) => msg.id === nowTs
    );
    if (messageIndex !== -1) {
      conversations.value[messageIndex].bot = errorResponse;
      conversations.value[messageIndex].isLoading = false;
    }

    latestResponse.value = errorResponse;
    saveConversations();
  } finally {
    // 無論成功或失敗，都要解除載入狀態
    isLoading.value = false;
  }
}

// 本地儲存對話記錄到 localStorage
const saveConversations = () => {
  if (process.client) {
    try {
      const storageKey = "robotDemo_chatHistory";
      // 將 conversations 保存到 localStorage
      localStorage.setItem(storageKey, JSON.stringify(conversations.value));
      console.log("對話記錄已保存到 localStorage");

      // ✅ 觸發自定義事件，讓 healthLog2.vue 可以即時更新（同頁面內）
      window.dispatchEvent(
        new CustomEvent("chatHistoryUpdated", {
          detail: { conversations: conversations.value },
        })
      );
    } catch (error) {
      console.error("保存對話記錄失敗:", error);
    }
    // 更新日曆數據
    loadCalendarDates();
  }
};

// 摘要模式後續處理函數（打n8n模型並儲存對話記錄）
const handleSummaryModeContinue = async (originalInput) => {
  if (originalInput) {
    try {
      isLoading.value = true;
      // 先立即在 UI 放入使用者訊息 + 一個 loading 中的機器人訊息
      const ts = new Date();
      const dateKey = toDateKey(ts);
      const loadingMessage = {
        id: `${ts.getTime()}|pending`,
        ts: ts.getTime(),
        user: originalInput,
        bot: "",
        botFrom: "AI",
        isLoading: true,
        timestamp: ts.toLocaleString("zh-TW"),
        dateKey,
      };
      conversations.value.push(loadingMessage);
      await nextTick();

      const botResponse = await sendViaUnifiedAPI(originalInput, {
        playAudio: !isMuted.value,
      });

      // 將剛才的 loading 訊息更新為實際回覆
      const idx = conversations.value.findIndex(
        (m) => m.id === loadingMessage.id
      );
      if (idx !== -1) {
        conversations.value[idx] = {
          ...conversations.value[idx],
          bot: botResponse,
          isLoading: false,
        };
      }

      // 清空待處理輸入
      pendingInput.value = "";

      // 如果當前在歷史記錄頁面，確保新訊息可見
      if (showHistoryPage.value) {
        currentPage.value = 1;
        nextTick(() => {
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        });
      }

      console.log("摘要模式後的n8n分析完成");
    } catch (error) {
      console.error("摘要模式後的API調用錯誤:", error);
      const errorResponse = "抱歉，服務暫時無法使用，請稍後再試。";
      // 回填錯誤到 pending 訊息
      const idx = conversations.value.findIndex((m) => m.isLoading);
      if (idx !== -1) {
        conversations.value[idx] = {
          ...conversations.value[idx],
          bot: errorResponse,
          isLoading: false,
        };
      } else {
        conversations.value.push({
          id: Date.now(),
          user: originalInput,
          bot: errorResponse,
          timestamp: new Date().toLocaleString("zh-TW"),
          dateKey: toDateKey(new Date()),
        });
      }
      latestResponse.value = errorResponse;
      saveConversations();
    } finally {
      isLoading.value = false;
    }
  }
};

// 移除客服模式處理函數

// 啟動 API 輪詢（改為 localStorage 檢查）
const startApiPolling = () => {
  if (apiPollingInterval.value) {
    clearInterval(apiPollingInterval.value);
  }

  isPollingActive.value = true;
  console.log("啟動 localStorage 檢查，每15秒檢查一次新訊息");

  apiPollingInterval.value = setInterval(async () => {
    if (isPollingActive.value) {
      console.log("執行定期 localStorage 檢查...");
      await fetchChatHistory(true); // 傳遞 isPolling = true
    }
  }, 15000);
};

// 停止 API 輪詢
const stopApiPolling = () => {
  if (apiPollingInterval.value) {
    clearInterval(apiPollingInterval.value);
    apiPollingInterval.value = null;
  }
  isPollingActive.value = false;
  console.log("停止 API 輪詢");
};

// 獲取聊天記錄（從 localStorage）
const fetchChatHistory = async (isPolling = false) => {
  try {
    const storageKey = "robotDemo_chatHistory";
    const existingData = localStorage.getItem(storageKey);
    const chatHistory = existingData ? JSON.parse(existingData) : [];

    if (isPolling) {
      console.log("輪詢檢查新訊息...");
    } else {
      console.log("從 localStorage 獲取到的聊天記錄:", chatHistory);
    }

    // 轉換為本地格式
    const convertedMessages = chatHistory.map((msg) => {
      const checkTime = parseCorrectTime(msg.timestamp || msg.inputTime);
      return {
        id: msg.id || Date.now(),
        ts: msg.ts || checkTime.getTime(),
        user: msg.user || "",
        bot: msg.bot || "",
        botFrom: msg.botFrom || "AI",
        timestamp: msg.timestamp || checkTime.toLocaleString("zh-TW"),
        dateKey: msg.dateKey || toDateKey(checkTime),
      };
    });

    // 按時間排序（舊到新）
    convertedMessages.sort((a, b) => a.ts - b.ts);

    // 檢查是否有新訊息
    const hasNewMessages =
      isPolling && conversations.value.length !== convertedMessages.length;

    if (hasNewMessages) {
      console.log(
        `發現新訊息！從 ${conversations.value.length} 條增加到 ${convertedMessages.length} 條`
      );

      // 滾動到底部顯示新訊息
      nextTick(() => {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      });
    }

    conversations.value = convertedMessages;
    hasMoreMessages.value = false;

    // 更新最新回覆
    if (convertedMessages.length > 0) {
      latestResponse.value =
        convertedMessages[convertedMessages.length - 1].bot;
    }

    // 更新日曆數據
    loadCalendarDates();

    if (!isPolling) {
      console.log("聊天記錄載入完成:", convertedMessages);
    }
  } catch (error) {
    console.error("獲取聊天記錄失敗:", error);
  }
};

// 獲取更舊的聊天記錄（從 localStorage，實際上所有記錄都在，這裡只是為了兼容）
const fetchOlderChatHistory = async (page) => {
  // localStorage 已經包含所有記錄，不需要分頁載入
  // 但為了保持兼容性，返回 0 表示沒有更多記錄
  return 0;
};

// 載入對話記錄（從 localStorage 獲取）
const loadConversations = async () => {
  if (process.client) {
    // 從 localStorage 獲取聊天記錄
    await fetchChatHistory();

    // 初始化日曆顯示月份為最新有記錄的月份
    if (conversations.value.length > 0) {
      // 使用 nextTick 確保 calendarDateKeySet 已更新
      nextTick(() => {
        const latestDate = maxHistoryDate.value;
        if (latestDate) {
          visibleMonth.value = latestDate.getMonth();
          visibleYear.value = latestDate.getFullYear();
          console.log(
            `初始化日曆顯示月份: ${visibleYear.value}/${visibleMonth.value + 1}`
          );
        }
      });
    }
  }
};

// 組件掛載時初始化
onMounted(async () => {
  /*if (
    process.client &&
    typeof window !== "undefined" &&
    "speechSynthesis" in window
  ) {
    synthRef = window.speechSynthesis;

    // 檢查語音合成支援
    if (synthRef.getVoices().length === 0) {
      synthRef.onvoiceschanged = () => {
        const voices = synthRef.getVoices();
        const chineseVoice = voices.find(
          (voice) => voice.lang.includes("zh") || voice.lang.includes("cmn")
        );
        console.log(
          "可用語音:",
          voices.map((v) => `${v.name} (${v.lang})`)
        );
        console.log("中文語音:", chineseVoice);
      };
    }
  }*/
  initSpeechRecognition();
  loadConversations();
  // 移除角色載入，固定使用院長角色
  // await loadSavedCharacter();

  // 載入靜音狀態
  if (process.client) {
    const savedMuted = localStorage.getItem("isMuted");
    if (savedMuted !== null) {
      isMuted.value = JSON.parse(savedMuted);
    }
  }

  // 如果當前是首頁，顯示語音控制
  if (process.client) {
    showVoiceControls.value = true;
  }

  // 移除首次登入解說狀態檢查
  // checkTutorialStatus();

  // 啟動 API 輪詢
  startApiPolling();

  // 啟動頂部哨兵觀察器，避免捲動事件漏觸發
  nextTick(() => {
    try {
      if (historyScrollContainer.value && topSentinel.value) {
        topObserver = new IntersectionObserver(
          async (entries) => {
            const [e] = entries;
            if (
              e &&
              e.isIntersecting &&
              !isLoadingOlderMessages.value &&
              hasMoreMessages.value
            ) {
              await loadOlderMessages();
            }
          },
          {
            root: historyScrollContainer.value,
            threshold: 0.0,
          }
        );
      }
    } catch (err) {
      console.warn("IntersectionObserver 初始化失敗:", err);
    }
  });

  // 添加調試函數到全局
  if (process.client) {
    window.debugCalendar = () => {
      console.log("=== 日曆調試信息 ===");
      console.log("對話記錄:", conversations.value);
      console.log("日曆日期集合:", Array.from(calendarDateKeySet.value));

      console.log("當前顯示月份:", visibleYear.value, visibleMonth.value + 1);
      console.log("最早日期:", minHistoryDate.value);
      console.log("最晚日期:", maxHistoryDate.value);
      console.log("分組歷史:", groupedHistory.value);
    };
  }
});

// 組件卸載時清理
onUnmounted(() => {
  stopApiPolling();
  try {
    topObserver?.disconnect();
  } catch {}
});

// ====== 角色 API 相關函數 ======

// 獲取所有角色列表
const fetchAllRoles = async () => {
  if (!localobj) {
    console.error("用戶資料不存在，無法獲取角色列表");
    return [];
  }

  try {
    const response = await fetch(GET_ALL_ROLES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        MID: localobj.MID,
        Token: localobj.Token || "kRwzQVDP8T4XQVcBBF8llJVMOirIxvf7",
        MAID: localobj.MAID || "mFjpTsOmYmjhzvfDKwdjkzyBGEZwFd4J",
        Mobile: localobj.Mobile,
        Lang: "zhtw",
      }),
    });

    if (!response.ok) {
      throw new Error(`API 調用失敗: ${response.status}`);
    }

    const data = await response.json();
    console.log("獲取角色列表成功:", data);

    if (data.Result === "OK" && data.RoleList) {
      // 轉換 API 資料格式為本地格式
      return data.RoleList.map((role) => ({
        id: parseInt(role.RID),
        name: role.Name,
        displayName: role.Name,
        customName: role.Name,
        category: role.Category,
        aid: role.AID,
        rid: role.RID,
        styleId: 1, // 預設使用第一個造型 (StyleID: "1")
        avatar: role.StyleList[0]?.ImgURL, // 使用第一個造型的圖片
        fullImage: role.StyleList[0]?.ImgURL, // 使用第一個造型的圖片
        styles: role.StyleList.map((style) => ({
          id: parseInt(style.StyleID),
          thumbnail: style.ImgURL,
          fullImage: style.ImgURL,
          locked: false, // API 沒有提供鎖定狀態，預設為未鎖定
        })),
        voiceSettings: {
          rate: 0.9,
          pitch: 0.85,
          volume: 1,
        },
      }));
    } else {
      console.error("API 回應格式錯誤:", data);
      return [];
    }
  } catch (error) {
    console.error("獲取角色列表失敗:", error);
    return [];
  }
};

// 獲取當前角色
const fetchCurrentRole = async () => {
  if (!localobj) {
    console.error("用戶資料不存在，無法獲取當前角色");
    return null;
  }

  try {
    const response = await fetch(GET_CURRENT_ROLE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        MID: localobj.MID,
        Token: localobj.Token || "kRwzQVDP8T4XQVcBBF8llJVMOirIxvf7",
        MAID: localobj.MAID || "mFjpTsOmYmjhzvfDKwdjkzyBGEZwFd4J",
        Mobile: localobj.Mobile,
        Lang: "zhtw",
      }),
    });

    if (!response.ok) {
      throw new Error(`API 調用失敗: ${response.status}`);
    }

    const data = await response.json();
    console.log("獲取當前角色成功:", data);

    if (data.Result === "OK" && data.Role) {
      return {
        id: parseInt(data.Role.RID),
        name: data.Role.DefaultName,
        displayName: data.Role.DisplayName,
        customName: data.Role.DisplayName,
        category: data.Role.Category,
        styleId: 1, // 預設使用第一個造型 (StyleID: "1")
        avatar: data.Role.ImgURL, // 使用 API 返回的圖片
        fullImage: data.Role.ImgURL, // 使用 API 返回的圖片
        voiceSettings: {
          rate: 0.9,
          pitch: 0.85,
          volume: 1,
        },
      };
    } else {
      console.error("API 回應格式錯誤:", data);
      return null;
    }
  } catch (error) {
    console.error("獲取當前角色失敗:", error);
    return null;
  }
};

// 選擇角色
const assignRole = async (rid, styleId, displayName) => {
  if (!localobj) {
    console.error("用戶資料不存在，無法選擇角色");
    return false;
  }

  try {
    const response = await fetch(ASSIGN_ROLE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        MID: localobj.MID,
        Token: localobj.Token || "kRwzQVDP8T4XQVcBBF8llJVMOirIxvf7",
        MAID: localobj.MAID || "mFjpTsOmYmjhzvfDKwdjkzyBGEZwFd4J",
        Mobile: localobj.Mobile,
        Lang: "zhtw",
        RID: rid.toString(),
        StyleID: styleId.toString(),
        DisplayName: displayName,
      }),
    });

    if (!response.ok) {
      throw new Error(`API 調用失敗: ${response.status}`);
    }

    const data = await response.json();
    console.log("選擇角色成功:", data);

    return data.Result === "OK";
  } catch (error) {
    console.error("選擇角色失敗:", error);
    return false;
  }
};

// 更改角色顯示名稱
const changeRoleDisplayName = async (displayName) => {
  if (!localobj) {
    console.error("用戶資料不存在，無法更改角色名稱");
    return false;
  }

  try {
    const response = await fetch(CHANGE_ROLE_DISPLAY_NAME_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        MID: localobj.MID,
        Token: localobj.Token || "kRwzQVDP8T4XQVcBBF8llJVMOirIxvf7",
        MAID: localobj.MAID || "mFjpTsOmYmjhzvfDKwdjkzyBGEZwFd4J",
        Mobile: localobj.Mobile,
        Lang: "zhtw",
        DisplayName: displayName,
      }),
    });

    if (!response.ok) {
      throw new Error(`API 調用失敗: ${response.status}`);
    }

    const data = await response.json();
    console.log("更改角色名稱成功:", data);

    return data.Result === "OK";
  } catch (error) {
    console.error("更改角色名稱失敗:", error);
    return false;
  }
};

// ChatGPT API 調用函數（用於摘要生成）
const callChatGPT = async (message, systemMessage = "") => {
  try {
    // 將 message 格式化為 JSON 字串
    const messageWithHistory = JSON.stringify({
      text: message,
      conversationHistory: [],
    });

    const response = await fetch(TEXT_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemMessage: systemMessage,
        message: messageWithHistory,
        model: "gpt-5-mini",
      }),
    });

    if (!response.ok) {
      throw new Error(`伺服器返回錯誤：${response.status}`);
    }

    // 先嘗試從 Header 取回文字（X-Answer）
    let answerText = "";
    const rawHeader = response.headers.get("x-answer");
    if (rawHeader) {
      try {
        answerText = decodeURIComponent(rawHeader);
      } catch {
        answerText = rawHeader;
      }
    }

    // 如果沒有從 header 獲取到，嘗試從 body 獲取
    if (!answerText) {
      const ct = (response.headers.get("content-type") || "").toLowerCase();

      // 若是音訊回應，不處理
      if (ct.includes("audio/")) {
        throw new Error("收到音訊回應，無法處理");
      }

      // 嘗試解析 JSON
      const data = await response.json();

      // 兼容多種欄位：response / bot / answer / text / message / content / output...
      const pick = (obj) => {
        if (!obj) return "";
        if (typeof obj === "string") return obj;
        const keys = [
          "response",
          "bot",
          "answer",
          "text",
          "message",
          "content",
          "output",
        ];
        for (const k of keys) {
          const v = obj[k];
          if (typeof v === "string" && v.trim()) return v;
          if (v && typeof v === "object") {
            const inner = pick(v);
            if (inner) return inner;
          }
        }
        return "";
      };
      answerText = pick(data);
    }

    if (answerText) {
      return answerText;
    } else {
      throw new Error("未收到有效的 ChatGPT 回應");
    }
  } catch (error) {
    console.error("ChatGPT API 調用失敗:", error);
    // 如果 API 調用失敗，返回原始輸入
    return message;
  }
};

// 載入保存的角色選擇
const loadSavedCharacter = async () => {
  if (process.client) {
    isCharacterLoading.value = true;
    isCharacterDataReady.value = false;

    try {
      // 從 API 獲取所有角色列表
      const apiRoles = await fetchAllRoles();
      if (apiRoles.length > 0) {
        availableCharacters.value = apiRoles;
        console.log("從 API 載入角色列表成功:", apiRoles.length, "個角色");
      } else {
        console.error("API 未返回角色列表");
        availableCharacters.value = [];
      }

      // 從 API 獲取當前角色
      const currentRole = await fetchCurrentRole();
      if (currentRole) {
        // 找到對應的角色並更新
        const foundCharacter = availableCharacters.value.find(
          (c) => c.id === currentRole.id
        );
        if (foundCharacter) {
          currentCharacter.value = {
            ...foundCharacter,
            ...currentRole,
            customName: currentRole.customName || currentRole.displayName,
          };
          characterImageSrc.value = currentRole.fullImage;
          console.log("從 API 載入當前角色成功:", currentRole.displayName);
        } else {
          console.warn("找不到對應的角色，使用第一個可用角色作為預設");
          // 如果找不到對應角色，使用第一個可用角色作為預設
          if (availableCharacters.value.length > 0) {
            const defaultCharacter = availableCharacters.value[0];
            currentCharacter.value = {
              ...defaultCharacter,
              styleId: 1, // 確保使用第一個造型
              avatar:
                defaultCharacter.styles[0]?.thumbnail ||
                defaultCharacter.avatar,
              fullImage:
                defaultCharacter.styles[0]?.fullImage ||
                defaultCharacter.fullImage,
              customName:
                currentRole.customName ||
                currentRole.displayName ||
                defaultCharacter.displayName,
            };
            characterImageSrc.value =
              defaultCharacter.styles[0]?.fullImage ||
              defaultCharacter.fullImage;
            console.log("使用預設角色:", defaultCharacter.displayName);
          } else {
            console.error("沒有可用的角色");
            currentCharacter.value = null;
          }
        }
      } else {
        console.warn("API 未返回當前角色，使用第一個可用角色作為預設");
        // 如果沒有當前角色，使用第一個可用角色作為預設
        if (availableCharacters.value.length > 0) {
          const defaultCharacter = availableCharacters.value[0];
          currentCharacter.value = {
            ...defaultCharacter,
            styleId: 1, // 確保使用第一個造型
            avatar:
              defaultCharacter.styles[0]?.thumbnail || defaultCharacter.avatar,
            fullImage:
              defaultCharacter.styles[0]?.fullImage ||
              defaultCharacter.fullImage,
            customName: defaultCharacter.displayName,
          };
          characterImageSrc.value =
            defaultCharacter.styles[0]?.fullImage || defaultCharacter.fullImage;
          console.log("使用預設角色:", defaultCharacter.displayName);
        } else {
          console.error("沒有可用的角色");
          currentCharacter.value = null;
        }
      }
    } catch (error) {
      console.error("載入角色失敗:", error);
      availableCharacters.value = [];
      currentCharacter.value = null;
    } finally {
      // 載入完成，設置狀態
      isCharacterLoading.value = false;
      isCharacterDataReady.value = true;
    }
  }
};

// 組件卸載時清理
onUnmounted(() => {
  if (recognitionRef) {
    recognitionRef.stop();
  }
  if (player) {
    try {
      player.pause();
    } catch {}
  }
  revokeObjectUrl();
  //if (process.client && synthRef) {synthRef.cancel();}
  // 清除超時計時器
  if (voiceTimeout) {
    clearTimeout(voiceTimeout);
  }
});

// SEO
useHead({
  title: "語音對話App",
  meta: [{ name: "description", content: "智能語音對話助手應用" }],
});

// 工具函數
function getOrCreateVisitorID() {
  if (typeof document === "undefined") return "default-session-id";

  const name = "WBSID";
  const existing = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];

  if (existing) return existing;

  const newID = crypto.randomUUID();
  document.cookie = `${name}=${newID}; path=/; max-age=31536000`;
  return newID;
}

// 搜尋結果跳轉
const scrollToMessage = (id) => {
  showSearch.value = false;
  searchQuery.value = "";
  searchResults.value = [];

  setTimeout(() => {
    const el = document.getElementById(`message-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" }); // ← 重點
      // 高亮 3 秒
      el.style.backgroundColor = "rgba(116, 188, 31, 0.1)";
      el.style.borderRadius = "12px";
      setTimeout(() => {
        el.style.backgroundColor = "";
        el.style.borderRadius = "";
      }, 3000);
    }
  }, 300);
};

// 關鍵字高亮
const highlightKeyword = (text, keyword) => {
  if (!text || !text.trim()) return "";
  if (!keyword || !keyword.trim()) return text;

  try {
    // 轉義特殊字符，避免正則表達式錯誤
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedKeyword})`, "gi");
    return text.replace(
      regex,
      '<span class="highlight" style="color:#74bc1f">$1</span>'
    );
  } catch (e) {
    console.error("關鍵字高亮錯誤:", e);
    return text;
  }
};

// 角色選擇相關函數
const showCharacterModal = () => {
  if (process.client && currentCharacter.value) {
    showCharacterSelection.value = true;
    // 初始化臨時選擇狀態為當前角色
    tempSelectedCharacter.value = { ...currentCharacter.value };
    // 初始化角色圖片載入狀態
    initCharacterImageLoading();
    // 初始化 Swiper 到當前選中的角色
    nextTick(() => {
      initSwiperToCurrentCharacter();
    });
  }
};

const closeCharacterModal = () => {
  if (process.client) {
    // 檢查臨時選擇的角色是否與當前角色不同
    const hasUnsavedChanges =
      tempSelectedCharacter.value &&
      currentCharacter.value &&
      (tempSelectedCharacter.value.id !== currentCharacter.value.id ||
        tempSelectedCharacter.value.styleId !== currentCharacter.value.styleId);

    if (hasUnsavedChanges) {
      showCharacterExitConfirm.value = true;
    } else {
      showCharacterSelection.value = false;
      isStyleExpanded.value = false;
      tempSelectedCharacter.value = null;
    }
  }
};

// 近期推出彈窗相關函數
const showComingSoonModal = () => {
  if (process.client) {
    showComingSoon.value = true;
  }
};

const closeComingSoonModal = () => {
  if (process.client) {
    showComingSoon.value = false;
  }
};

// 角色選擇離開確認彈窗相關函數
const confirmCharacterExit = () => {
  if (process.client) {
    showCharacterExitConfirm.value = false;
    showCharacterSelection.value = false;
    isStyleExpanded.value = false;
    tempSelectedCharacter.value = null;
  }
};

const cancelCharacterExit = () => {
  if (process.client) {
    showCharacterExitConfirm.value = false;
  }
};

const toggleStyleExpansion = () => {
  if (process.client) {
    isStyleExpanded.value = !isStyleExpanded.value;
  }
};

// Swiper 滑動事件處理
const onSlideChange = (swiper) => {
  const activeIndex = swiper.activeIndex;
  const character = availableCharacters.value[activeIndex];
  if (character) {
    // 更新臨時選擇狀態
    tempSelectedCharacter.value = { ...character };
  }
};

// 角色點擊事件處理
const onCharacterClick = (character) => {
  // 如果是鎖定的角色，顯示"近期推出"彈窗
  if (isCharacterLocked(character)) {
    showComingSoonModal();
    return;
  }

  const characterIndex = availableCharacters.value.findIndex(
    (c) => c.id === character.id
  );
  if (characterIndex !== -1 && characterSwiperRef.value) {
    // 滑動到選中的角色並置中
    characterSwiperRef.value.$el.swiper.slideTo(characterIndex);
    // 更新臨時選擇狀態
    tempSelectedCharacter.value = { ...character };
  }
};

const selectCharacter = (character) => {
  if (process.client) {
    currentCharacter.value = {
      ...character,
      styleId: 1, // 默認選擇第一個造型
      avatar: character.styles[0]?.thumbnail || character.avatar, // 更新頭貼為第一個樣式的縮圖
      fullImage: character.styles[0]?.fullImage || character.fullImage,
      customName: character.customName || character.displayName,
      voiceSettings: character.voiceSettings || {
        rate: 0.9,
        pitch: 0.85,
        volume: 1,
      },
    };
    isStyleExpanded.value = false; // 切換角色時收起造型選擇

    // 更新角色圖片路徑
    characterImageSrc.value =
      character.styles[0]?.fullImage || character.fullImage;

    console.log("已選擇角色:", character.customName || character.displayName);
  }
};

const selectStyle = (style) => {
  if (process.client) {
    console.log("選擇樣式:", style.id, "鎖定狀態:", style.locked);
    // 如果是鎖定的樣式，顯示"近期推出"彈窗
    if (style.locked) {
      showComingSoonModal();
      return;
    }

    // 更新臨時選擇狀態
    if (tempSelectedCharacter.value) {
      tempSelectedCharacter.value.styleId = style.id;
      tempSelectedCharacter.value.avatar = style.thumbnail;
      tempSelectedCharacter.value.fullImage = style.fullImage;
    }
  }
};

const confirmCharacterSelection = async () => {
  if (process.client && tempSelectedCharacter.value) {
    try {
      // 調用 API 選擇角色
      const success = await assignRole(
        tempSelectedCharacter.value.rid || tempSelectedCharacter.value.id,
        tempSelectedCharacter.value.styleId,
        tempSelectedCharacter.value.customName ||
          tempSelectedCharacter.value.displayName
      );

      if (success) {
        // API 成功，更新本地狀態
        currentCharacter.value = { ...tempSelectedCharacter.value };
        characterImageSrc.value = currentCharacter.value.fullImage;

        // 關閉彈窗
        showCharacterSelection.value = false;
        isStyleExpanded.value = false;
        tempSelectedCharacter.value = null;

        console.log(
          "角色選擇已確認:",
          currentCharacter.value.customName ||
            currentCharacter.value.displayName
        );
        console.log("當前頭貼:", currentCharacter.value.avatar);
      } else {
        console.error("角色選擇失敗，請重試");
        // 可以在這裡顯示錯誤提示給用戶
      }
    } catch (error) {
      console.error("角色選擇 API 調用失敗:", error);
      // 可以在這裡顯示錯誤提示給用戶
    }
  }
};

// 角色圖片載入事件處理
const onCharacterImageLoad = (characterId) => {
  characterImageLoading.value.delete(characterId);
};

const onCharacterImageError = (characterId) => {
  characterImageLoading.value.delete(characterId);
  console.error(`角色圖片載入失敗: ${characterId}`);
};

// 初始化角色圖片載入狀態
const initCharacterImageLoading = () => {
  availableCharacters.value.forEach((character) => {
    characterImageLoading.value.add(character.id);
  });
};

// 初始化 Swiper 到當前選中的角色
const initSwiperToCurrentCharacter = () => {
  if (process.client && characterSwiperRef.value && currentCharacter.value) {
    const characterIndex = availableCharacters.value.findIndex(
      (c) => c.id === currentCharacter.value.id
    );
    if (characterIndex !== -1) {
      // 等待 Swiper 初始化完成後滑動到指定位置
      nextTick(() => {
        setTimeout(() => {
          if (characterSwiperRef.value && characterSwiperRef.value.$el) {
            characterSwiperRef.value.$el.swiper.slideTo(characterIndex, 0);
          }
        }, 100);
      });
    }
  }
};

// 依當前日曆顯示的年/月，產生「當月」有紀錄的日期集合
const monthDateKeySet = computed(() => {
  const y = String(visibleYear.value);
  const m = String(visibleMonth.value + 1).padStart(2, "0");
  const prefix = `${y}-${m}-`; // 例如 "2025-11-"
  return new Set(
    Array.from(calendarDateKeySet.value).filter((key) => key.startsWith(prefix))
  );
});

// 角色名稱編輯相關函數
const showNameInputModal = () => {
  if (process.client && uiCharacter.value) {
    characterNameInput.value =
      uiCharacter.value.customName || uiCharacter.value.displayName;
    nameInputError.value = "";
    showNameInput.value = true;
    nextTick(() => {
      if (nameInputRef.value) {
        nameInputRef.value.focus();
      }
    });
  }
};

const closeNameInput = () => {
  if (process.client) {
    showNameInput.value = false;
    // 重置為原始名稱，不儲存修改
    if (uiCharacter.value) {
      characterNameInput.value =
        uiCharacter.value.customName || uiCharacter.value.displayName;
    }
    nameInputError.value = "";
  }
};

const confirmNameInput = async () => {
  if (process.client) {
    const name = characterNameInput.value.trim();

    if (!name) {
      nameInputError.value = "角色不能沒有名字喔";
      return;
    }

    if (name.length > 10) {
      nameInputError.value = "名字不能超過10個字";
      return;
    }

    try {
      // 調用 API 更改角色顯示名稱
      const success = await changeRoleDisplayName(name);

      if (success) {
        // API 成功，更新本地狀態
        const targetId = uiCharacter.value.id;

        // 更新可用角色列表中的對應角色
        const characterIndex = availableCharacters.value.findIndex(
          (c) => c.id === targetId
        );
        if (characterIndex !== -1) {
          availableCharacters.value[characterIndex] = {
            ...availableCharacters.value[characterIndex],
            customName: name,
          };
        }

        // 若彈窗中正在編輯的就是 tempSelectedCharacter，也同步更新它
        if (
          tempSelectedCharacter.value &&
          tempSelectedCharacter.value.id === targetId
        ) {
          tempSelectedCharacter.value.customName = name;
        }

        // 若此角色同時也是當前使用中的角色，順便同步到 currentCharacter
        if (currentCharacter.value && currentCharacter.value.id === targetId) {
          currentCharacter.value.customName = name;
        }

        closeNameInput();
        console.log("角色名稱已更新:", name);
      } else {
        nameInputError.value = "更新失敗，請重試";
        console.error("角色名稱更新失敗");
      }
    } catch (error) {
      nameInputError.value = "更新失敗，請重試";
      console.error("角色名稱更新 API 調用失敗:", error);
    }
  }
};

// --- 日期工具：統一成 YYYY-MM-DD ---
const toDateKey = (input) => {
  if (input instanceof Date) {
    // 使用本地時間避免時區問題
    const year = input.getFullYear();
    const month = String(input.getMonth() + 1).padStart(2, "0");
    const day = String(input.getDate()).padStart(2, "0");
    const result = `${year}-${month}-${day}`;
    console.log(`toDateKey (Date): ${input} → ${result}`);
    return result;
  }
  // input 可能是 "2025/8/20 下午 2:20:33" → 取前半段日期、轉成 YYYY-MM-DD
  const first = String(input).split(" ")[0]; // 2025/8/20
  const [y, m, d] = first.split("/");
  const pad = (n) => String(n).padStart(2, "0");
  const result = `${String(y).padStart(4, "0")}-${pad(m)}-${pad(d)}`;
  console.log(`toDateKey (String): ${input} → ${result}`);
  return result;
};

// 有紀錄的日期集合（Set，比 array 包含查詢快）
const calendarDateKeySet = ref(new Set());

// 動態區間（可選）
const minHistoryDate = computed(() => {
  const arr = Array.from(calendarDateKeySet.value);
  if (!arr.length) return undefined;
  // 排序後取最早日期，格式為 "YYYY-MM-DD"
  const earliestKey = arr.sort()[0];
  // 將 "YYYY-MM-DD" 轉換為 Date 對象
  const [year, month, day] = earliestKey.split("-");
  const result = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  console.log("最早日期:", result, "來自 key:", earliestKey);
  return result;
});
const maxHistoryDate = computed(() => {
  const arr = Array.from(calendarDateKeySet.value);
  if (!arr.length) return undefined;
  // 排序後取最晚日期，格式為 "YYYY-MM-DD"
  const latestKey = arr.sort().slice(-1)[0];
  // 將 "YYYY-MM-DD" 轉換為 Date 對象
  const [year, month, day] = latestKey.split("-");
  const result = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  console.log("最晚日期:", result, "來自 key:", latestKey);
  return result;
});

// 本地指令：v-click-outside
const vClickOutside = {
  mounted(el, binding) {
    el.__clickOutside__ = (e) => {
      if (!(el === e.target || el.contains(e.target))) {
        typeof binding.value === "function" && binding.value(e);
      }
    };
    document.addEventListener("click", el.__clickOutside__);
  },
  unmounted(el) {
    document.removeEventListener("click", el.__clickOutside__);
    delete el.__clickOutside__;
  },
};
</script>

<!-- scss分段 -->

<style lang="scss" scoped>
.chat-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  padding-top: 1rem;
  @include gradientBg();
}

/* 聊天頭部 */
.chat-header {
  width: 100%;
  max-width: 768px;
  display: flex;
  align-items: center;
  position: relative;
  gap: 10px;
  padding: 0 1rem;
  position: relative;
  .firstText4 {
    left: 170px;
    top: 200%;
    //製作往上的正三角色
    &::after {
      content: "";
      position: absolute;
      top: -7px; // 箭頭接在泡泡的「上緣」外側
      left: 25%; // 視需要微調水平位置
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-bottom: 8px solid #fff;
    }
  }
  .avatar-container {
    width: 44px;
    height: 44px;
    border: 1px solid $raphael-green-400;
    cursor: pointer;

    @include neumorphismOuter($radius: 50%, $padding: 0);
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover,
    &:active {
      @include neumorphismOuter(
        $radius: 50%,
        $padding: 0,
        $x: 0,
        $y: 0,
        $blur: 6px
      );
    }

    .character-loading {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(116, 188, 31, 0.1);

      .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(116, 188, 31, 0.3);
        border-top: 2px solid $raphael-green-400;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }

    .character-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(116, 188, 31, 0.05);

      .placeholder-avatar {
        width: 24px;
        height: 24px;
        background: rgba(116, 188, 31, 0.2);
        border-radius: 50%;
      }
    }

    .avatar {
      object-fit: cover;
      transition: opacity 0.3s ease;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .character-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(116, 188, 31, 0.05);
    border-radius: 50%;

    .placeholder-character {
      width: 30px;
      height: 30px;
      background: rgba(116, 188, 31, 0.2);
      border-radius: 50%;
    }
  }

  .character-placeholder-large {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(116, 188, 31, 0.05);
    border-radius: 12px;

    .placeholder-character-large {
      width: 80px;
      height: 80px;
      background: rgba(116, 188, 31, 0.2);
      border-radius: 50%;
    }
  }

  .character-name-btn {
    color: $raphael-green-400;
    font-size: 18px;
    letter-spacing: 2.7px;
    cursor: pointer;
    @include neumorphismOuter($radius: 50px, $padding: 13px 12px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 120px;
    gap: 8px;
    transition: all 0.3s ease;

    &:hover,
    &:active {
      @include neumorphismOuter(
        $radius: 50px,
        $padding: 11px 16px,
        $x: 0,
        $y: 0,
        $blur: 6px
      );
    }
  }
}

/* 問候氣泡 */
.greeting-bubble {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  max-width: 768px;
  width: 100%;
  align-items: baseline;
  margin-top: 1rem;
  padding: 0 1rem;

  .firstText5 {
    left: 50%;
    bottom: -77.5%;
    //製作往上的正三角色
    &::after {
      content: "";
      position: absolute;
      top: -7px; // 箭頭接在泡泡的「上緣」外側
      left: 50%; // 視需要微調水平位置
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-bottom: 8px solid #fff;
      transform: translateX(-50%);
    }
  }
}

.greeting-bubble .loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
  line-height: 1.5;
  color: #2d3748;
  width: 100%;
  height: 120px;
  text-align: justify;
  @include neumorphismOuter();

  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(34, 197, 94, 0.3);
    border-top-color: #22c55e;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 8px;
  }
}

.greeting-bubble .latest-response {
  font-size: 16px;
  line-height: 1.5;
  color: #2d3748;
  width: 100%;
  height: 120px;
  @include neumorphismOuter();
  overflow-y: auto;
  word-wrap: break-word;
  word-break: break-word;
  @include scrollbarStyle();
}

.greeting-bubble .greeting-text {
  @extend .latest-response;
}

/* 角色形象區域 */
.character-section {
  position: relative;
  display: flex;
  justify-content: center;
  max-width: 768px;
  flex: 1;
  width: 100%;
  height: 0;
  // padding-bottom: 84px;

  .character-image {
    margin-top: 15%;
    height: 90%;
    object-fit: cover;
  }
  .healGroup {
    position: absolute;
    right: 2.25rem;
    top: 2.5rem;
    transform: translate(50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 0.15rem;
    .healthImg {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 40px;
      height: 40px;
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Secondary-100, #f5f7fa);
      box-shadow: 2px 4px 12px 0
        var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
      padding: 0.5rem;
      cursor: pointer;
    }
    h5 {
      color: var(--Neutral-500, #666);
      text-align: center;
      font-size: 10px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
    }
  }

  .healGroup4 {
    right: 2.25rem;
    top: 16rem;
    display: none;
  }
  .healGroup5 {
    right: 2.25rem;
    top: 8.5rem;
  }
}

/* 語音控制欄 - 絕對定位擬態設計 */
.voice-control-bar {
  position: fixed;
  bottom: 91px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  @include liquidGlass();
  z-index: 10;
  padding: 0.35rem 2.25rem;
  .firstText1 {
    top: -50%;
    left: 50%;
    //三角形
    &::after {
      content: "";
      position: absolute;
      bottom: -7px;
      left: 50%;
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-top: 8px solid #fff;
      transform: translateX(-50%);
    }
  }
  .firstText2 {
    top: -50%;
    left: 83%;
    &::after {
      content: "";
      position: absolute;
      bottom: -7px;
      left: 50%;
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-top: 8px solid #fff;
      transform: translateX(-50%);
    }
  }
  .firstText3 {
    top: -50%;
    left: 13%;
    &::after {
      content: "";
      position: absolute;
      bottom: -7px;
      left: 50%;
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-top: 8px solid #fff;
      transform: translateX(-50%);
    }
  }

  .control-btn {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    width: 60px;
    height: 60px;
    cursor: pointer;
    transition: all 0.3s ease;
    @include neumorphismOuter($radius: 50%, $padding: 0);
    img {
      width: 36px;
      height: 36px;
    }
    &:hover,
    &:active {
      @include neumorphismOuter(
        $radius: 50%,
        $padding: 0,
        $x: 0,
        $y: 0,
        $blur: 6px
      );
    }

    &.mic-btn {
      @include neumorphismOuter(
        $bgColor: $raphael-green-400,
        $radius: 50%,
        $padding: 0
      );

      width: 60px;
      height: 60px;
      transition: all 0.3s ease;

      &:hover,
      &:active {
        @include neumorphismOuter(
          $bgColor: $raphael-green-500,
          $radius: 50%,
          $padding: 0,
          $x: 0,
          $y: 0,
          $blur: 6px
        );
      }

      &.listening {
        @include neumorphismOuter(
          $bgColor: $raphael-green-400,
          $radius: 50%,
          $padding: 0
        );

        width: 60px;
        height: 60px;
        transition: all 0.3s ease;
      }
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

/* 文字輸入區域 */
.text-input-section {
  width: 100%;
  padding: 0 16px;
  position: fixed;
  bottom: 185px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;

  .input-container {
    display: flex;
    align-items: center;
    gap: 4px;
    @include liquidGlass($radius: 20px, $padding: 12px 16px);
    margin: 0 auto;
    width: 90%;
    max-width: 500px;
    
    .text-input {
      flex: 1;
      border: none;
      font-size: 16px;
      outline: none;
      background: transparent;
      color: #2d3748;
      min-width: 0;
 
      &::placeholder {
        color: #718096;
      }
    }

    .send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid #74bc1f;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
      transition: all 0.3s ease;

      img {
        width: 20px;
        height: 20px;
        filter: brightness(0) saturate(100%) invert(58%) sepia(95%) saturate(2000%)
          hue-rotate(60deg) brightness(100%) contrast(85%);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &:not(:disabled):hover,
      &:not(:disabled):active {
        background: rgba(116, 188, 31, 0.1);
        transform: scale(1.05);
      }
    }

    .cancel-btn {
      color: var(--Neutral-500, #666);

font-size: var(--Text-font-size-18, 18px);
font-style: normal;
font-weight: 400;

letter-spacing: 2.7px;
border: none;
      flex-shrink: 0;
      transition: all 0.3s ease;

      &:hover,
      &:active {
        opacity: 0.7;
      }
    }
  }
}

/* 轉錄顯示 */
.transcript-display {
  display: none; //暫時不顯示
  width: 100%;
  padding: 0 20px;
  margin-bottom: 20px;

  .transcript-text {
    text-align: center;
    font-size: 16px;
    color: #2d3748;
    margin: 0 auto;
    max-width: 300px;
  }
}
.voiceModelClose {
  position: absolute;
  top: 20px;
  right: 30px;

  transition: all 0.3s ease;
  z-index: 10;

  &:hover,
  &:active {
    @include neumorphismOuter(
      $radius: 50%,
      $padding: 4px,
      $x: 0,
      $y: 0,
      $blur: 6px
    );
  }

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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 語音模態框 */
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
  z-index: 100;
  @include neumorphismOuter(
    $bgColor: rgba(245, 247, 250, 0.1),
    $radius: 50px 50px 0 0,
    $x: 0,
    $y: -2px,
    $blur: 12px,
    $color: $raphael-white
  );

  .voice-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .voice-wave {
      width: 115px;
      height: 115px;
      object-fit: contain;
      animation: pulse-wave 1.6s infinite ease-in-out;
      flex-shrink: 0;
      min-width: 115px;
      min-height: 115px;
    }

    .voice-start-text {
      color: var(--Neutral-black, #1e1e1e);
      text-align: center;
      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      text-transform: lowercase;
      position: absolute;
      top: 40px;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .voice-text {
      margin-top: 16px;
      font-size: 16px;
      color: #2d3748;
      font-weight: 600;
    }

    .voice-listening-text {
      color: var(--Neutral-black, #1e1e1e);
      text-align: center;
      font-size: var(--Text-font-size-20, 20px);
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      text-transform: lowercase;
      margin-top: 12px;
    }

    .voice-error-text {
      color: $raphael-black;
      text-align: center;
      font-size: 18px;
      font-weight: 400;
      line-height: 1.5;
      margin-bottom: 8px;
    }

    .voice-error-hint {
      color: $raphael-black;
      text-align: center;
      font-size: 16px;
      font-weight: 400;
      line-height: 1.5;
      margin-bottom: 20px;
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
      outline: none;

      &:active:not(:disabled) {
        transform: scale(0.95);
      }
    }

    // 錄音中單獨顯示的送出按鈕
    .voice-content > .voice-btn-send {
      flex: none;
      max-width: none;
      width: calc(100% - 32px);
      margin: 20px 16px 0;

      border-radius: var(--Radius-r-50, 50px);
      background: var(--Primary-default, #74bc1f);
      box-shadow: 2px 4px 12px 0
        var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
      color: white;
    }

    .voice-btn-retry {
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Secondary-100, #f5f7fa);
      box-shadow: 2px 4px 12px 0
        var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
      color: var(--Primary-default, #74bc1f);

      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;

      letter-spacing: 2.7px;
      &:hover {
        background: #f0fdf4;
      }

      // 錯誤狀態下的按鈕樣式（全寬）
      .voice-content > & {
        width: calc(100% - 32px);
        margin: 20px 16px 0;
        flex: none;
        max-width: none;
      }
    }

    .voice-btn-retry-not {
      margin-top: 1.5rem;
    }

    .voice-btn-send {
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Primary-default, #74bc1f);
      box-shadow: 2px 4px 12px 0
        var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
      color: white;

      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;

      letter-spacing: 2.7px;
      &:hover {
        background: #5a9a17;
      }
    }

    .voice-btn-start {
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Primary-default, #74bc1f);
      box-shadow: 2px 4px 12px 0
        var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
      color: white;
      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;
      letter-spacing: 2.7px;
      width: calc(100% - 32px);
      margin: 20px 16px 0;
      padding: 12px 24px;
      flex: none;
      max-width: none;

      &:hover {
        background: #5a9a17;
      }

      &:active:not(:disabled) {
        transform: scale(0.95);
      }
    }

    .transcript-text {
      margin-top: 16px;
      font-size: 18px;
      color: #2d3748;
      -webkit-text-fill-color: #2d3748; /* Android 兼容性 */
      font-weight: 600;
      text-align: center;
      padding: 8px 16px;
      min-height: 24px;
      line-height: 1.5;
      word-break: break-word;
      max-width: 90%;
      /* Android 字體渲染優化 */
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      /* 強制硬體加速 - Android 需要 */
      transform: translateZ(0);
      will-change: transform, contents;
      /* 確保文字可見 - 預設值 */
      opacity: 1 !important;
      display: block !important;
      visibility: visible !important;
      /* Android 立即渲染優化 */
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      /* 強制 GPU 加速 */
      -webkit-transform: translateZ(0);
      -moz-transform: translateZ(0);
      -ms-transform: translateZ(0);
      -o-transform: translateZ(0);
    }
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

/* 錯誤提示 */
.alert-dialog {
  position: fixed;
  top: 30%;
  left: 50%;
  width: 251px;
  transform: translateX(-50%);
  @include neumorphismOuter($bgColor: rgba(255, 255, 255, 0.65));
  -webkit-backdrop-filter: blur(50px);
  backdrop-filter: blur(50px);
  z-index: 999;

  .alert-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;

    p {
      font-size: 20px;
      font-weight: 700;
      line-height: 24px;
      color: #2d3748;
    }

    ul {
      display: flex;
      flex-direction: column;
      align-self: start;
      gap: 8px;
      font-size: 18px;
      color: #4a5568;
      padding-left: 24px;
      list-style: disc;
    }

    .alert-button {
      color: $raphael-white;
      border: none;
      cursor: pointer;
      font-size: 18px;
      width: 110px;
      margin-top: 16px;

      @include neumorphismOuter(
        $bgColor:
          linear-gradient(
            90deg,
            var(--primary-400-opacity-40, rgba(116, 188, 31, 0.4)) 0%,
            var(--primary-400-opacity-70, rgba(116, 188, 31, 0.7)) 100%
          ),
        $radius: 50px,
        $padding: 11px 16px
      );

      transition: all 0.3s ease;

      &:hover,
      &:active {
        @include neumorphismOuter(
          $bgColor:
            linear-gradient(
              90deg,
              var(--primary-400-opacity-70, rgba(116, 188, 31, 0.7)) 0%,
              var(--Primary-default, #74bc1f) 100%
            ),
          $radius: 50px,
          $padding: 11px 16px,
          $x: 0,
          $y: 0,
          $blur: 6px
        );
      }
    }
  }
}

/* 共用機器人彈窗樣式 */
.robotCommonModel {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 768px;
  min-height: 375px;
  background: rgba(245, 247, 250, 0.1);
  backdrop-filter: blur(22px);
  z-index: 2000; /* 確保超過文字聊天室 */

  @include neumorphismOuter(
    $bgColor: rgba(245, 247, 250, 0.1),
    $radius: 50px 50px 0 0,
    $x: 0,
    $y: -2px,
    $blur: 12px,
    $color: $raphael-white
  );
  padding-bottom: 84px;

  .robot-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 16px;
    text-align: center;

    .robot-sphere {
      width: 80px;
      height: 80px;
      margin: 0 auto;
      background-image: url("/assets/imgs/robot/assistantSound.gif");
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      animation: pulse-wave 2s infinite ease-in-out;
    }

    .robot-title {
      font-size: 24px;
      font-weight: 700;
      color: #2d3748;
    }

    .robot-text {
      font-size: 18px;
      color: $raphael-gray-500;
      line-height: 1.6;
      max-height: 200px;
      overflow-y: auto;
    }

    .robot-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      width: 100%;
      margin-top: 32px;

      .robot-btn-cancel {
        @include neumorphismOuter($radius: 50px, $padding: 5px 4px);
        color: $raphael-green-400;
        border: none;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;

        &:hover {
          @include neumorphismOuter(
            $radius: 50px,
            $padding: 5px 4px,
            $x: 0,
            $y: 0,
            $blur: 6px
          );
        }
      }

      .robot-btn-confirm {
        @include neumorphismOuter(
          $bgColor: $raphael-green-400,
          $radius: 50px,
          $padding: 5px 4px
        );
        color: $raphael-white;
        border: none;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;

        &:hover {
          @include neumorphismOuter(
            $bgColor: $raphael-green-400,
            $radius: 50px,
            $padding: 5px 4px,
            $x: 0,
            $y: 0,
            $blur: 6px
          );
        }
      }
    }
  }
}

/* 摘要模式樣式 - 使用共用樣式 */
.summary-modal {
  @extend .robotCommonModel;
}

/* 移除客服詢問樣式 */

/* 動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* 歷史紀錄頁面 */
.history-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e0e5ec 0%, #f0f4f8 100%);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  align-items: center;
  inset: 0; /* 取代 top/left/width/height */
  height: 100dvh; /* 行動版更準確 */
  min-height: 0; /* ★ 沒這行 iOS 常常不滾動 */
  overflow: hidden; /* 避免背景頁跟著捲 */
  -webkit-overflow-scrolling: touch; /* ★ iOS 慣性滾動 */
  overscroll-behavior: contain; /* 防止把滾動帶到外層 */
  touch-action: pan-y; /* 明確允許垂直捲動 */

  .history-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    max-width: 768px;
    width: 100%;
    gap: 10px;

    .back-arrow {
      width: 24px;
      height: 24px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    .title-center {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
    }

    .history-title {
      font-size: 20px;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
      pointer-events: auto;
    }

    .right-icons {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 16px;
      min-width: 56px;
    }

    .search-icon {
      width: 24px;
      height: 24px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    .calendar-icon {
      width: 24px;
      height: 24px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  /* 搜尋容器 */
  .search-container {
    position: absolute;
    display: flex;
    align-items: center;
    @include neumorphismOuter($radius: 50px, $padding: 8px);
    width: -webkit-fill-available;
    left: 0;
    right: 0;
    margin: 0 16px;
    z-index: 2;
    transform-origin: right center;

    .search-input-icon {
      width: 20px;
      height: 20px;
      margin-right: 12px;
      opacity: 1;
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 16px;
      color: #2d3748;
      outline: none;

      &::placeholder {
        color: #718096;
      }
    }

    .clear-search-icon {
      width: 18px;
      height: 18px;
      cursor: pointer;
      opacity: 1;
      transition: opacity 0.3s ease;

      &:hover {
        opacity: 1;
      }
    }

    .close-search-icon {
      width: 24px;
      height: 24px;
      cursor: pointer;
      transition: all 0.3s ease;
      opacity: 1;
      margin-left: 12px;

      &:hover {
        opacity: 1;
        transform: scale(1.1);
      }
    }
  }

  /* 無搜尋結果 */
  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 24px;
    font-weight: bold;
    height: 100%;
    @include neumorphismOuter();
  }

  .history-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 768px;
    width: 100%;
    flex: 1;

    padding-bottom: 56px;
    background: transparent;
    min-height: 0; /* 讓 flex 子項可以縮、才捲得動 */
    .history-list {
      padding: 16px;
      flex: 1;
      min-height: 0;
      padding-bottom: 16px;
      overflow-y: auto;
      touch-action: pan-y;
      -webkit-overflow-scrolling: touch;
    }
    .history-group {
      .date-separator {
        text-align: center;
        font-size: 14px;
        color: #718096;
        margin-bottom: 20px;
        @include neumorphismOuter(
          $radius: 20px,
          $padding: 8px 16px,
          $x: 0,
          $y: 0,
          $blur: 6px
        );
        display: inline-block;
        margin-left: 50%;
        transform: translateX(-50%);
      }

      .history-message {
        margin-bottom: 32px;

        .message {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;

          &.bot {
            justify-content: flex-start;
            margin-bottom: 20px;

            .avatar {
              width: 36px;
              height: 36px;
              //跟人物頭像一樣
              margin-right: 12px;
              flex-shrink: 0;
              margin-top: auto;
              transform: translateY(20px);
              @include neumorphismOuter($radius: 50%, $padding: 0);
              overflow: hidden;
            }

            .bubble {
              display: flex;
              flex-direction: column;
              gap: 8px;
              @include neumorphismOuter($radius: 20px 20px 20px 0);
              color: #2d3748;
              width: 260px;
            }
          }

          &.user {
            justify-content: flex-end;

            .bubble {
              display: flex;
              flex-direction: column;
              gap: 8px;

              @include neumorphismOuter(
                $bgColor: $raphael-green-400,
                $radius: 20px 0 20px 20px
              );
              color: $raphael-white;
              width: 250px;
            }

            .time {
              color: $raphael-white;
            }
          }

          .bubble {
            padding: 14px 18px 28px 18px;
            border-radius: 20px;
            font-size: 15px;
            line-height: 1.4;
            word-break: break-word;
            position: relative;
          }

          .sender-label {
            color: var(--Neutral-400, #b3b3b3);
            font-size: var(--Text-font-size-14, 14px);
            font-weight: 400;
            line-height: normal;
            position: absolute;
            bottom: -25px;
            left: 0;
          }

          .time {
            font-size: 11px;
            color: #718096;
            align-self: flex-end;
            opacity: 0.8;
          }

          .loading-in-message {
            display: flex;
            align-items: center;
            gap: 8px;

            .loading-gif {
              width: 20px;
              height: 20px;
            }

            span {
              font-size: 14px;
              color: #718096;
            }
          }
        }
      }
    }
  }

  // 載入更舊訊息指示器
  .loading-older-messages {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: #718096;
    font-size: 14px;
    gap: 8px;

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #e2e8f0;
      border-top: 2px solid #74bc1f;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
}

/* 歷史頁底部輸入列---wing 20250829 */
.history-input-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  @include neumorphismOuter($radius: 20px, $padding: 8px 12px);
  margin: auto 1rem;
}

.history-text-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 18px;
  outline: none;
  color: #2d3748;

  &::placeholder {
    color: #718096;
  }
}

.history-send-btn {
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  @include neumorphismOuter(
    $bgColor: $raphael-green-400,
    $radius: 50px,
    $padding: 0
  );
  transition: all 0.2s ease;

  &:hover,
  &:active {
    @include neumorphismOuter(
      $bgColor: $raphael-green-500,
      $radius: 50px,
      $padding: 0,
      $x: 0,
      $y: 0,
      $blur: 6px
    );
  }

  &:disabled {
    @include neumorphismOuter(
      $bgColor: $raphael-gray-300,
      $radius: 50px,
      $padding: 0
    );
    cursor: not-allowed;
  }

  img {
    width: 22px;
    height: 22px;
  }
}
/* 歷史頁底部輸入列---wing 20250829 */

/* 搜尋圖標淡入淡出動畫 */
.slide-search-icon-enter-active,
.slide-search-icon-leave-active {
  transition: opacity 0.2s ease;
}

.slide-search-icon-enter-from,
.slide-search-icon-leave-to {
  opacity: 0;
}

/* 搜尋框滑出動畫 */
.slide-search-enter-active {
  transition: all 0.5s ease;
  transition-delay: 0.2s;
}

.slide-search-leave-active {
  transition: all 0.3s ease;
}

.slide-search-enter-from {
  transform: scaleX(0);
  opacity: 0;
}

.slide-search-leave-to {
  transform: scaleX(0);
  opacity: 0;
}

/* 左滑動畫 */
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

/* 搜尋結果樣式 */
.search-results {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;

  .search-results-header {
    align-self: flex-end;
    font-size: 18px;
    color: #718096;
  }

  .searchList {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    padding: 8px;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    .search-result-item {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      cursor: pointer;

      .bubble {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        @include neumorphismOuter();
        .content {
          display: flex;
          flex-direction: column;
          gap: 16px;
          .user-name,
          .bot-name {
            color: #b1c0d8;
            font-size: 18px;
          }
          & > span {
            font-size: 16px;
            line-height: 15px;
            letter-spacing: 1px;
          }
        }
        .result-date {
          color: #b1c0d8;
          font-size: 14px;
          word-break: keep-all;
          white-space: nowrap;
        }
      }
    }
  }
}

/* 角色選擇彈窗樣式 */
.character-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.character-modal {
  width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  @include gradientBg();

  .character-modal-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    position: relative;
    margin: auto;
    width: 100%;
    max-width: 768px;

    .back-arrow {
      position: absolute;
      left: 20px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    .modal-title {
      font-size: 24px;
      color: #2d3748;
      margin: 0;
    }
  }

  .current-character-tag {
    padding: 16px 16px 24px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
    width: 100%;
    max-width: 768px;
    margin: auto;

    span {
      display: inline-block;
      cursor: pointer;
      color: $raphael-green-400;
      width: 160px;
      font-size: 18px;
      letter-spacing: 2.7px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2px;
      transition: all 0.3s ease;
      @include neumorphismOuter($radius: 50px, $padding: 13px 12px);

      &:hover,
      &:active {
        @include neumorphismOuter(
          $radius: 50px,
          $padding: 12px 16px,
          $x: 0,
          $y: 0,
          $blur: 6px
        );
      }
    }
  }

  .main-character-area {
    flex: 1;
    min-height: 0; /* ★ 關鍵：沒有這行 iOS 常常不捲 */
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    position: relative;
    margin: auto;
    width: 100%;
    max-width: 768px;

    .character-display {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .character-full-image {
        object-fit: cover;
        height: 100%;
      }
    }

    .style-selector {
      position: absolute;
      right: 16px;
      top: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: 90px;
      height: 220px;
      @include neumorphismOuter($radius: 8px, $padding: 8px);

      .style-header {
        display: flex;
        flex-direction: column;
        align-items: center;

        span {
          color: #4a5568;
          text-align: center;
          font-weight: 500;
          color: $raphael-black;
          font-size: var(--Text-font-size-14, 14px);
          font-style: normal;
          font-weight: 400;

          letter-spacing: 2.1px;
        }

        .expand-icon {
          width: 20px;
          height: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          filter: opacity(0.7);

          &:hover {
            filter: opacity(1);
            transform: scale(1.1);
          }

          &.rotated {
            transform: rotate(180deg);
          }
        }
      }

      .style-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 8px;
        overflow: hidden;
        overflow-y: auto; /* 改這個 */
        -webkit-overflow-scrolling: touch;
        transition: max-height 0.3s ease;
        @include scrollbarStyle();

        .style-item {
          background: rgba(31, 188, 179, 0.2);
          border-radius: 50%;
          width: 60px;
          height: 60px;
          cursor: pointer;
          border: none;
          margin: 0.5rem 0.5rem 0;
          overflow: hidden;
          transition: all 0.3s ease;
          position: relative;
          display: flex;

          &.locked {
            cursor: not-allowed;
            border: 2px solid rgba(255, 255, 255, 0.3);
          }

          &:hover,
          &:active {
            background: rgba(31, 188, 179, 0.7);
          }

          img {
            width: 100%;
            object-fit: contain;
          }

          .style-locked {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(3.5px);
            border-radius: 50%;
            z-index: 2;

            .lock-icon {
              width: 16px;
              height: 16px;
              filter: brightness(0) saturate(100%) invert(20%) sepia(0%)
                saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%);
            }
          }

          .locked-image {
            filter: blur(3.5px);
          }
        }

        .active {
          border: 2px solid $raphael-green-400;
          @include neumorphismOuter($radius: 50%, $padding: 0, $x: 0, $y: 1px);
          &:hover,
          &:active {
            @include neumorphismOuter(
              $radius: 50%,
              $padding: 0,
              $x: 0,
              $y: 1px
            );
          }
        }
      }
    }
  }

  .confirm-btn {
    position: absolute;
    bottom: 224px;
    left: 50%;
    width: 110px;
    color: $raphael-white;
    font-size: 18px;
    letter-spacing: 2.7px;
    border: none;
    cursor: pointer;

    @include neumorphismOuter(
      $bgColor: $raphael-green-400,
      $radius: 50px,
      $padding: 9px 16px
    );

    transform: translateX(-50%);
    transition: all 0.3s ease;
    &:hover,
    &:active {
      @include neumorphismOuter(
        $bgColor: $raphael-green-500,
        $radius: 50px,
        $padding: 8px 16px,
        $x: 0,
        $y: 1px
      );
    }
  }

  .character-switch-area {
    position: relative;
    width: 100%;
    max-width: 768px;
    margin: auto;
    margin-bottom: 66px;
    padding: 0 1rem;

    .character-swiper {
      @include neumorphismOuter();
      padding: 8px;

      /* 自定義 Swiper 樣式 */
      :deep(.swiper-wrapper) {
        align-items: center;
      }

      :deep(.swiper-slide) {
        width: 100px;
        height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-shrink: 0; /* 防止被壓縮 */
      }

      :deep(.swiper-pagination) {
        bottom: -20px;

        .swiper-pagination-bullet {
          background: rgba(116, 188, 31, 0.3);
          opacity: 1;

          &.swiper-pagination-bullet-active {
            background: $raphael-green-400;
          }
        }
      }

      .character-option {
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
        height: 100%;

        .character-circle {
          background: rgba(31, 188, 179, 0.2);
          border-radius: 50%;
          width: 100px;
          height: 100px;
          cursor: pointer;
          border: none;
          overflow: hidden;
          transition: all 0.3s ease;
          position: relative;

          &:hover,
          &:active {
            background: rgba(31, 188, 179, 0.7);
          }

          img {
            object-fit: cover;
            border-radius: 50%;
          }

          .character-loading {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(31, 188, 179, 0.2);
            border-radius: 50%;

            .loading-spinner {
              width: 24px;
              height: 24px;
              border: 3px solid rgba(116, 188, 31, 0.3);
              border-top: 3px solid $raphael-green-400;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
          }

          .character-locked {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(3.5px);
            border-radius: 50%;
            z-index: 2;

            .lock-icon {
              width: 20px;
              height: 20px;
              filter: brightness(0) saturate(100%) invert(20%) sepia(0%)
                saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%);
            }
          }

          .locked-image {
            filter: blur(3.5px);
          }
        }

        &.selected .character-circle {
          border: 2px solid $raphael-green-400;
          @include neumorphismOuter($radius: 50%, $padding: 0, $x: 0, $y: 6px);

          &:hover,
          &:active {
            @include neumorphismOuter(
              $radius: 50%,
              $padding: 0,
              $x: 0,
              $y: 6px
            );
          }
        }
      }
    }
  }
}

/* 淡入淡出動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 角色名稱輸入彈窗樣式 */
.name-input-overlay {
  @include blurOverlay();
}

.name-input-modal {
  @include neumorphismOuter($bgColor: rgba(245, 247, 250, 0.65));
  backdrop-filter: blur(44px);
  width: 90%;
  max-width: 361px;
  text-align: center;

  .name-input-title {
    color: $raphael-black;
    text-align: center;

    font-size: var(--Text-font-size-24, 20px);
    font-style: normal;
    font-weight: 700;
    line-height: 100%; /* 24px */
    letter-spacing: 0.12px;
    margin: 0 0 20px 0;
  }

  .name-input-field {
    width: 100%;
    @include neumorphismOuter($radius: 50px, $padding: 10px 12px);
    border: none;
    overflow: hidden;
    color: $raphael-black;
    text-overflow: ellipsis;

    font-size: 18px;
    font-style: normal;
    font-weight: 700;

    letter-spacing: 2.7px;
    outline: none;
    margin-bottom: 16px;

    &::placeholder {
      color: #718096;
    }
  }

  .name-input-error {
    color: #e53e3e;
    font-size: 14px;
    margin-bottom: 16px;
    min-height: 20px;
  }

  .name-input-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;

    button {
      width: 110px;
      padding: 10px 20px;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;

      &.name-input-cancel {
        color: #718096;
        border-radius: var(--Radius-r-50, 50px);
        color: $raphael-green-400;

        font-size: 18px;
        font-style: normal;
        font-weight: 400;

        letter-spacing: 2.7px;
        background: none;
        &:hover {
          color: $raphael-green-500;
        }
      }

      &.name-input-confirm {
        @include neumorphismOuter(
          $bgColor: $raphael-green-400,
          $radius: 50px,
          $padding: 10px 20px
        );
        color: $raphael-white;
        font-size: 18px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 2.7px;

        &:hover {
          @include neumorphismOuter(
            $bgColor: $raphael-green-500,
            $radius: 50px,
            $padding: 10px 20px,
            $x: 0,
            $y: 0,
            $blur: 6px
          );
        }
      }
    }
  }
}

// 日曆選擇彈窗樣式
.calendar-overlay {
  @include blurOverlay();
}

// 日曆展開動畫
.calendar-expand-enter-active,
.calendar-expand-leave-active {
  transition: all 0.3s ease;
}

.calendar-expand-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.calendar-expand-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.calendar-expand-enter-to,
.calendar-expand-leave-from {
  opacity: 1;
  transform: scale(1);
}

.calendar-modal {
  @include neumorphismOuter($bgColor: rgba(245, 247, 250, 0.65));
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;

  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .calendar-title {
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }

    .calendar-close {
      width: 24px;
      height: 24px;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.3s ease;

      &:hover {
        opacity: 1;
      }
    }
  }

  .calendar-content {
    .calendar-datepicker {
      width: 100%;

      :deep(.dp__main) {
        background: var(--Secondary-100, #f5f7fa);
        border-radius: 12px;
        box-shadow: inset 4px 4px 8px rgba(163, 177, 198, 0.6),
          inset -4px -4px 8px rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      :deep(.dp__calendar_header) {
        background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
        border-radius: 8px 8px 0 0;
      }

      :deep(.dp__calendar) {
        background: transparent;
      }

      :deep(.dp__cell_inner) {
        background: var(--Secondary-100, #f5f7fa);
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover:not(.dp__disabled) {
          background: linear-gradient(145deg, $raphael-green-400, #5a9a17);
          color: $raphael-white;
          transform: translateY(-1px);
        }
      }

      :deep(.dp__active) {
        background: linear-gradient(
          145deg,
          $raphael-green-400,
          #5a9a17
        ) !important;
        color: white !important;
      }

      :deep(.dp__disabled) {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    .no-dates {
      text-align: center;
      color: #718096;
      font-size: 14px;
      padding: 20px;
    }
  }
}

.firstText {
  position: absolute;

  border-radius: var(--Radius-r-20, 20px);
  background: var(--Neutral-white, #fff);
  padding: 1rem;
  transform: translate(-50%, -50%);

  white-space: nowrap;
}
.overZIndex {
  z-index: 10000;
}

/* 移除首次登入解說覆蓋層樣式 */
</style>
