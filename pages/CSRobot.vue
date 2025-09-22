<template>
  <div class="CSRobotWrap">
    <TitleMenu Text="線上客服" link="back" />

    <!-- 聊天區域 -->
    <div class="chat-container">
      <div class="chat-messages" ref="chatMessages">
        <!-- 客服歡迎訊息 -->
        <div class="message service-message">
          <div class="message-avatar">
            <img src="/assets/imgs/robot/character/pet4_3.png" alt="客服頭像" />
          </div>
          <div class="message-content">
            <div class="message-bubble service-bubble">
              嗨~有什麼需要幫忙的嗎？
              <div class="message-time">14:32</div>
            </div>
          </div>
        </div>

        <!-- 用戶訊息 -->
        <div
          class="message user-message"
          v-for="(message, index) in messages"
          :key="index"
        >
          <div class="message-content">
            <!-- 一般文字訊息 -->
            <div v-if="!message.type" class="message-bubble user-bubble">
              {{ message.text }}
            </div>
            
            <!-- 滿意度評分卡片 -->
            <div v-else-if="message.type === 'satisfaction'" class="satisfaction-card">
              <div class="satisfaction-header">
                <h3>請問您對於本次服務</h3>
              </div>
              <div class="satisfaction-content">
                <div class="satisfaction-emoji">
                  {{ satisfactionEmojis[message.rating - 1] || '😐' }}
                </div>
                <div class="satisfaction-text">
                  {{ satisfactionTexts[message.rating - 1] || '請選擇評分' }}
                </div>
                <div class="star-rating">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="star"
                    :class="{ active: star <= message.rating }"
                    @click="selectRating(star)"
                  >
                    ★
                  </span>
                </div>
                <div class="satisfaction-buttons" v-if="message.rating > 0">
                  <button class="skip-btn" @click="submitRating(0)">略過</button>
                  <button class="submit-btn" @click="submitRating(message.rating)">送出</button>
                </div>
              </div>
            </div>
            
            <div class="message-time">{{ message.time }}</div>
          </div>
        </div>

        <!-- 媒體預覽 -->
        <div
          class="message user-message"
          v-for="(media, index) in mediaMessages"
          :key="'media-' + index"
        >
          <div class="message-content">
            <div class="message-bubble user-bubble media-bubble">
              <div class="media-preview" v-if="media.type === 'image'">
                <img :src="media.url" alt="圖片" />
                <button class="delete-media" @click="deleteMedia(index)">
                  ×
                </button>
              </div>
              <div class="media-preview" v-else-if="media.type === 'video'">
                <video :src="media.url" controls></video>
                <button class="delete-media" @click="deleteMedia(index)">
                  ×
                </button>
              </div>
            </div>
            <div class="message-time">{{ media.time }}</div>
          </div>
        </div>

        <!-- 轉換進度指示器 -->
        <div class="conversion-overlay" v-if="isConverting">
          <div class="conversion-modal">
            <div class="conversion-content">
              <div class="conversion-spinner"></div>
              <h3>正在處理檔案...</h3>
              <p>正在轉換格式，請稍候</p>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: conversionProgress + '%' }"
                ></div>
              </div>
              <div class="progress-text">{{ conversionProgress }}%</div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div class="optionGroup">
      <!-- 輸入區域 -->
      <div class="input-wrapper">
        <!-- 媒體預覽區域 -->
        <div class="media-preview-area" v-if="previewMedia.length > 0">
          <div class="preview-item" v-for="(media, index) in previewMedia" :key="index">
            <div class="preview-content">
              <img v-if="media.type === 'image'" :src="media.url" alt="預覽圖片" />
              <video v-else-if="media.type === 'video'" :src="media.url" controls></video>
            </div>
            <button class="remove-preview" @click="removePreview(index)">×</button>
          </div>
        </div>
        
        <textarea
          v-model="newMessage"
          class="message-input"
          @focus="isFocused = true"
          @blur="isFocused = false"
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.enter.shift.stop
          placeholder="請輸入..."
        />
      </div>

      <div class="input-container">
        <div class="media-buttons">
          <button class="media-btn" @click="openCamera" title="拍照">
            <img src="/assets/imgs/CSRobot/camera.svg" alt="拍照" />
          </button>
          <button class="media-btn" @click="openVideo" title="錄影">
            <img src="/assets/imgs/CSRobot/video.svg" alt="錄影" />
          </button>
          <button class="media-btn" @click="openGallery" title="相簿">
            <img src="/assets/imgs/CSRobot/gallery.svg" alt="相簿" />
          </button>
        </div>
        <button
          class="send-btn"
          @click="sendMessage"
          :disabled="!newMessage.trim() && previewMedia.length === 0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 17 17"
            fill="none"
          >
            <g clip-path="url(#clip0_23184_1547)">
              <path
                d="M7.73063 9.26885C7.59526 9.13372 7.43392 9.0274 7.25636 8.95631L1.63927 6.70381C1.5722 6.6769 1.51497 6.63011 1.47526 6.56974C1.43555 6.50936 1.41526 6.43829 1.41711 6.36605C1.41896 6.2938 1.44286 6.22386 1.48561 6.1656C1.52836 6.10733 1.58791 6.06354 1.65627 6.0401L15.1146 1.43593C15.1774 1.41326 15.2453 1.40894 15.3104 1.42346C15.3756 1.43798 15.4352 1.47076 15.4824 1.51794C15.5296 1.56513 15.5623 1.62478 15.5769 1.68991C15.5914 1.75504 15.5871 1.82296 15.5644 1.88572L10.9602 15.3441C10.9368 15.4124 10.893 15.472 10.8347 15.5147C10.7765 15.5575 10.7065 15.5814 10.6343 15.5832C10.562 15.5851 10.491 15.5648 10.4306 15.5251C10.3702 15.4854 10.3234 15.4281 10.2965 15.3611L8.04402 9.74256C7.97261 9.56512 7.866 9.40397 7.73063 9.26885ZM7.73063 9.26885L15.4801 1.52093"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_23184_1547">
                <rect width="17" height="17" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </button>
      </div>
    </div>

    <!-- 隱藏的檔案輸入 -->
    <input
      ref="cameraInput"
      type="file"
      accept="image/*"
      capture="camera"
      @change="handleCameraCapture"
      style="display: none"
    />
    <input
      ref="videoInput"
      type="file"
      accept="video/*"
      capture="camcorder"
      @change="handleVideoCapture"
      style="display: none"
    />
    <input
      ref="galleryInput"
      type="file"
      accept="image/*,video/*"
      multiple
      @change="handleGallerySelect"
      style="display: none"
    />
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted } from "vue";
import { useMediaConverter } from "~/composables/useMediaConverter";

// 響應式數據
const newMessage = ref("");
const messages = ref([]);
const mediaMessages = ref([]);
const previewMedia = ref([]);
const chatMessages = ref(null);
const isFocused = ref(false);

// 滿意度評分相關
const satisfactionEmojis = ["😠", "😰", "😐", "😊", "😁"];
const satisfactionTexts = [
  "非常不滿意",
  "不太滿意",
  "普通",
  "滿意",
  "非常滿意",
];

// 檔案輸入引用
const cameraInput = ref(null);
const videoInput = ref(null);
const galleryInput = ref(null);

// 媒體轉換功能
const {
  isConverting,
  conversionProgress,
  processFileFormat,
  validateFileSize,
  validateVideoDuration,
  createPreviewURL,
  revokePreviewURL,
} = useMediaConverter();

// 方法
const sendMessage = () => {
  if (!newMessage.value.trim() && previewMedia.value.length === 0) return;

  // 發送文字訊息
  if (newMessage.value.trim()) {
    const message = {
      text: newMessage.value,
      time: getCurrentTime(),
    };
    messages.value.push(message);
  }

  // 發送媒體訊息
  if (previewMedia.value.length > 0) {
    previewMedia.value.forEach(media => {
      const mediaMessage = {
        url: media.url,
        type: media.type,
        time: getCurrentTime(),
        file: media.file
      };
      mediaMessages.value.push(mediaMessage);
    });
  }

  // 清空輸入
  newMessage.value = "";
  previewMedia.value = [];

  // 滾動到底部
  nextTick(() => {
    scrollToBottom();
  });

  // 等待客服回應（不自動回覆）
  // 這裡可以發送到後端等待真實客服回應
};

const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const scrollToBottom = () => {
  if (chatMessages.value) {
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
  }
};

// 媒體上傳功能
const openCamera = () => {
  cameraInput.value.click();
};

const openVideo = () => {
  videoInput.value.click();
};

const openGallery = () => {
  galleryInput.value.click();
};

const handleCameraCapture = (event) => {
  const file = event.target.files[0];
  if (file) {
    processMediaFile(file, "image");
  }
};

const handleVideoCapture = (event) => {
  const file = event.target.files[0];
  if (file) {
    processMediaFile(file, "video");
  }
};

const handleGallerySelect = (event) => {
  const files = Array.from(event.target.files);
  files.forEach((file) => {
    const type = file.type.startsWith("video/") ? "video" : "image";
    processMediaFile(file, type);
  });
};

const processMediaFile = async (file, type) => {
  try {
    // 檢查檔案大小
    if (!validateFileSize(file, 30)) {
      alert("檔案大小不能超過 30MB");
      return;
    }

    // 檢查影片長度
    if (type === "video") {
      const isValidDuration = await validateVideoDuration(file, 10);
      if (!isValidDuration) {
        alert("影片長度不能超過 10 秒");
        return;
      }
    }

    // 處理格式轉換（HEIC 轉 JPG）
    const processedFile = await processFileFormat(file);

    // 添加到預覽區域
    addPreviewMedia(processedFile, type);
  } catch (error) {
    console.error("處理媒體檔案時發生錯誤:", error);
    alert(error.message || "處理檔案時發生錯誤");
  }
};

const addPreviewMedia = (file, type) => {
  const url = createPreviewURL(file);
  const previewItem = {
    url,
    type,
    file,
  };

  previewMedia.value.push(previewItem);
};

const removePreview = (index) => {
  revokePreviewURL(previewMedia.value[index].url);
  previewMedia.value.splice(index, 1);
};

const deleteMedia = (index) => {
  revokePreviewURL(mediaMessages.value[index].url);
  mediaMessages.value.splice(index, 1);
};

// 滿意度評分功能
const showSatisfactionRating = () => {
  // 在聊天記錄中顯示滿意度評分卡片
  const satisfactionCard = {
    type: 'satisfaction',
    time: getCurrentTime(),
    rating: 0
  };
  
  messages.value.push(satisfactionCard);
  
  nextTick(() => {
    scrollToBottom();
  });
};

const selectRating = (rating) => {
  // 找到最後一個滿意度評分卡片並更新評分
  const lastSatisfactionIndex = messages.value.findLastIndex(msg => msg.type === 'satisfaction');
  if (lastSatisfactionIndex !== -1) {
    messages.value[lastSatisfactionIndex].rating = rating;
  }
};

const submitRating = (rating) => {
  const ratingData = {
    score: rating,
    timestamp: Date.now(),
  };

  console.log("滿意度評分:", ratingData);

  // 發送事件到後台管理
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("satisfaction-rated", {
        detail: ratingData,
      })
    );
  }

  // 這裡可以發送到後端
  // 例如：sendSatisfactionRating(ratingData)
};

// 組件掛載後滾動到底部
onMounted(() => {
  nextTick(() => {
    scrollToBottom();
  });

  // 監聽來自後台管理的事件
  if (typeof window !== "undefined") {
    window.addEventListener("service-completed", showSatisfactionRating);
  }
  
  // 測試用：5秒後自動顯示滿意度評分
  setTimeout(() => {
    showSatisfactionRating();
  }, 5000);
});

// 清理事件監聽器
onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("service-completed", showSatisfactionRating);
  }
});
</script>

<style lang="scss" scoped>
.CSRobotWrap {
  @include gradientBg();
  width: 100%;
  min-height: 100vh;
  padding: 1rem 0rem 7rem;
  display: flex;
  flex-direction: column;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
  @include scrollbarStyle();
}

.message {
  display: flex;
  align-items: flex-end;
  margin-bottom: 1rem;
  &.user-message {
    justify-content: flex-end;
  }
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;

  background: #fff;
  box-shadow: 0 1.962px 1.962px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  flex-shrink: 0;
  transform: translateY(15px);
  padding: 0.1rem;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  word-wrap: break-word;

  &.service-bubble {
    background: white;
    color: #1e1e1e;
    border-bottom-left-radius: 0.25rem;
  }

  &.user-bubble {
    background: #74bc1f;
    color: white;
    border-bottom-right-radius: 0.25rem;
  }

  &.media-bubble {
    padding: 0;
    background: transparent;
  }
}

.message-time {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.25rem;
  text-align: right;
}

.media-preview {
  position: relative;
  max-width: 200px;

  img,
  video {
    width: 100%;
    border-radius: 0.5rem;
    max-height: 200px;
    object-fit: cover;
  }

  .delete-media {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #ff4444;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
  }
}

.input-container {
  background: white;
  padding: 1rem;
  border-top: .5px solid #eee;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 34px;
}

.media-buttons {
  display: flex;
  gap: 0.5rem;
}

.media-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f0f0;
    color: #74bc1f;
  }
}

.optionGroup {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
}

.input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: var(--Radius-r-20, 20px) var(--Radius-r-20, 20px) 0 0;
  box-shadow: 0 -7px 12px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
  padding: 1rem;
  gap: 0.5rem;
  width: 100%;
  min-height: 150px;
}

.media-preview-area {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.preview-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.preview-content {
  width: 100%;
  height: 100%;
  
  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.remove-preview {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ff4444;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.message-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 1rem;

  &::placeholder {
    color: #999;
  }
}

.send-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #74bc1f;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  margin-left: auto;
  &:hover:not(:disabled) {
    background: #65a31b;
  }
  svg {
    transform: translateX(-1px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
}

// 滿意度評分卡片樣式
.satisfaction-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  text-align: center;
}

.satisfaction-header h3 {
  color: #1e1e1e;
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

.satisfaction-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.satisfaction-emoji {
  font-size: 2rem;
  margin: 0.5rem 0;
}

.satisfaction-text {
  font-size: 0.875rem;
  color: #1e1e1e;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.star {
  font-size: 1.25rem;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s ease;

  &.active {
    color: #ffd700;
  }

  &:hover {
    color: #ffd700;
  }
}

.satisfaction-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.skip-btn,
.submit-btn {
  padding: 0.375rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.skip-btn {
  background: #f5f5f5;
  color: #666;

  &:hover {
    background: #e0e0e0;
  }
}

.submit-btn {
  background: #74bc1f;
  color: white;

  &:hover {
    background: #65a31b;
  }
}

// 轉換進度指示器樣式
.conversion-overlay {
  @include coverbg();
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.conversion-modal {
  @include alertStyle();
  max-width: 300px;
  text-align: center;
}

.conversion-content {
  padding: 1rem 0;
}

.conversion-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #74bc1f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin: 1rem 0 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #74bc1f, #65a31b);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

@include respond-to(md) {
  .message-content {
    max-width: 85%;
  }

  .media-preview {
    max-width: 150px;
  }
}
</style>
