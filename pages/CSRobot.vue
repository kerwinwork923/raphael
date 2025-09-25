<template>
  <div class="CSRobotWrap">
    <div class="titleMenuWrap">
        <TitleMenu Text="線上客服" link="back" />
    </div>

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

        <!-- 所有訊息（文字、圖片、客服回應）按時間排序 -->
        <div
          class="message"
          :class="message.type === 'user' ? 'user-message' : 'service-message'"
          v-for="(message, index) in allMessages"
          :key="index"
        >
          <!-- 客服回應需要頭像 -->
          <div v-if="message.type === 'service'" class="message-avatar">
            <img src="/assets/imgs/robot/character/pet4_3.png" alt="客服頭像" />
          </div>

          <div class="message-content">
            <!-- 文字訊息 -->
            <div
              v-if="message.messageType === 'text'"
              class="message-bubble"
              :class="
                message.type === 'user' ? 'user-bubble' : 'service-bubble'
              "
            >
              {{ message.content }}
            </div>

            <!-- 圖片訊息 -->
            <div
              v-else-if="message.messageType === 'image'"
              class="message-bubble media-bubble"
            >
              <div class="media-preview">
                <img
                  :src="message.url"
                  alt="圖片"
                  @click="openImagePreview(message.url)"
                  class="preview-image"
                />
              </div>
            </div>

            <!-- 滿意度評分卡片 -->
            <div
              v-else-if="message.type === 'satisfaction'"
              class="satisfaction-card"
            >
              <div class="satisfaction-header">
                <h3>請問您對於本次服務</h3>
              </div>
              <div class="satisfaction-content">
                <div class="satisfaction-emoji">
                  {{ satisfactionEmojis[message.rating - 1] || "😐" }}
                </div>
                <div class="satisfaction-text">
                  {{ satisfactionTexts[message.rating - 1] || "請選擇評分" }}
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
                  <button class="skip-btn" @click="submitRating(0)">
                    略過
                  </button>
                  <button
                    class="submit-btn"
                    @click="submitRating(message.rating)"
                  >
                    送出
                  </button>
                </div>
              </div>
            </div>

            <div class="message-time">{{ message.time }}</div>
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
          <div
            class="preview-item"
            v-for="(media, index) in previewMedia"
            :key="index"
          >
            <div class="preview-content">
              <img
                v-if="media.type === 'image'"
                :src="media.url"
                alt="預覽圖片"
                @click="openImagePreview(media.url)"
                class="preview-image"
              />
              <video
                v-else-if="media.type === 'video'"
                :src="media.url"
                controls
              ></video>
            </div>
            <button class="remove-preview" @click="removePreview(index)">
              ×
            </button>
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
          <!-- 暫時隱藏影片上傳功能 -->
          <!-- <button class="media-btn" @click="openVideo" title="錄影">
            <img src="/assets/imgs/CSRobot/video.svg" alt="錄影" />
          </button> -->
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
      accept="image/jpeg,image/jpg,image/png"
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
      accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"
      multiple
      @change="handleGallerySelect"
      style="display: none"
    />

    <!-- 圖片預覽放大彈窗 -->
    <div
      class="image-preview-overlay"
      v-if="showImagePreview"
      @click="closeImagePreview"
    >
      <div class="image-preview-modal" @click.stop>
        <button class="close-preview" @click="closeImagePreview">×</button>
        <img
          :src="previewImageUrl"
          alt="放大預覽"
          class="preview-large-image"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted, computed } from "vue";
import { useMediaConverter } from "~/composables/useMediaConverter";

// 響應式數據
const newMessage = ref("");
const messages = ref([]);
const mediaMessages = ref([]);
const previewMedia = ref([]);
const chatMessages = ref(null);
const isFocused = ref(false);
const showImagePreview = ref(false);
const previewImageUrl = ref("");

// 合併所有訊息並按時間排序
const allMessages = computed(() => {
  const all = [...messages.value, ...mediaMessages.value];
  return all.sort((a, b) => {
    const timeA = new Date(a.timestamp || a.time);
    const timeB = new Date(b.timestamp || b.time);
    return timeA - timeB;
  });
});

const userData = JSON.parse(localStorage.getItem("userData"));

// API 配置
const API_CONFIG = {
  MID: userData.MID,
  Token: userData.Token,
  MAID: userData.MAID,
  Mobile: userData.Mobile,
  Lang: "zhtw",
};

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
  isAllowedImage,
  getExt,
  isHEICFormat,
} = useMediaConverter();

// API 函數
const frSendLineText = async (content) => {
  try {
    const response = await $fetch(
      "https://23700999.com:8081/HMA/api/fr/frSendLineText",
      {
        method: "POST",
        body: {
          ...API_CONFIG,
          Content: content,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("發送文字訊息失敗:", error);
    throw error;
  }
};

const frSendLineImage = async (base64String, subName) => {
  try {
    const response = await $fetch(
      "https://23700999.com:8081/HMA/api/fr/frSendLineImage",
      {
        method: "POST",
        body: {
          ...API_CONFIG,
          base64String,
          subName,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("發送圖片訊息失敗:", error);
    throw error;
  }
};

const frGetLine = async () => {
  try {
    const response = await $fetch(
      "https://23700999.com:8081/HMA/api/fr/frGetLine",
      {
        method: "POST",
        body: API_CONFIG,
      }
    );
    return response;
  } catch (error) {
    console.error("取得訊息失敗:", error);
    throw error;
  }
};

// 將檔案轉換為 base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
};

// 方法
const sendMessage = async () => {
  if (!newMessage.value.trim() && previewMedia.value.length === 0) return;

  try {
    // 發送文字訊息
    if (newMessage.value.trim()) {
      const message = {
        content: newMessage.value,
        messageType: "text",
        time: getCurrentTime(),
        timestamp: Date.now(),
        type: "user",
      };
      messages.value.push(message);

      // 發送到後台
      await frSendLineText(newMessage.value);
    }

    // 發送媒體訊息
    if (previewMedia.value.length > 0) {
      for (const media of previewMedia.value) {
        const mediaMessage = {
          url: media.url,
          messageType: media.type,
          time: getCurrentTime(),
          timestamp: Date.now(),
          file: media.file,
          type: "user",
        };
        mediaMessages.value.push(mediaMessage);

        // 如果是圖片，確保使用處理過的檔案並轉換為 base64 發送
        if (media.type === "image") {
          console.log('發送圖片前檢查:', { name: media.file.name, type: media.file.type });
          // 確保「送出前」用最新的 File（可能已被轉成 JPG）
          const processed = await processFileFormat(media.file);
          console.log('處理後的檔案:', { name: processed.name, type: processed.type });
          
          // 檢查轉換是否成功（如果還是 HEIC 格式，轉換可能失敗）
          if (isHEICFormat(processed)) {
            console.warn('HEIC 轉換失敗，跳過此圖片');
            alert('HEIC 格式轉換失敗，請改用 JPG 或 PNG 格式的圖片');
            continue; // 跳過這個檔案
          }
          
          const base64String = await fileToBase64(processed);
          const subName = getExt(processed);
          console.log('發送圖片:', { subName, base64Length: base64String.length });
          await frSendLineImage(base64String, subName);
        }
      }
    }

    // 清空輸入
    newMessage.value = "";
    previewMedia.value = [];

    // 滾動到底部
    nextTick(() => {
      scrollToBottom();
    });

    // 獲取客服回應
    await getMessages();
  } catch (error) {
    console.error("發送訊息失敗:", error);
    alert("發送失敗，請稍後再試");
  }
};

// 獲取客服回應
const getMessages = async () => {
  try {
    const response = await frGetLine();
    console.log("API 回應:", response);

    if (response && response.LineList) {
      console.log("LineList 長度:", response.LineList.length);

      // 清空現有訊息，避免重複
      messages.value = [];
      mediaMessages.value = [];

      response.LineList.forEach((msg, index) => {
        console.log(`訊息 ${index}:`, msg);

        if (msg.Mode === "Input") {
          // 用戶訊息
          if (msg.messageType === "text") {
            const userMessage = {
              content: msg.Content,
              messageType: "text",
              time: formatTime(msg.CheckTime),
              timestamp: new Date(msg.CheckTime).getTime(),
              type: "user",
            };
            console.log("添加用戶文字訊息:", userMessage);
            messages.value.push(userMessage);
          } else if (msg.messageType === "image") {
            const mediaMessage = {
              url: msg.ImgURL,
              messageType: "image",
              time: formatTime(msg.CheckTime),
              timestamp: new Date(msg.CheckTime).getTime(),
              fileName: msg.FileName,
              type: "user",
            };
            console.log("添加用戶圖片訊息:", mediaMessage);
            mediaMessages.value.push(mediaMessage);
          }
        } else if (msg.Mode === "Output") {
          // 客服回應
          const serviceMessage = {
            content: msg.Content,
            messageType: "text",
            time: formatTime(msg.CheckTime),
            timestamp: new Date(msg.CheckTime).getTime(),
            type: "service",
          };
          console.log("添加客服回應:", serviceMessage);
          messages.value.push(serviceMessage);
        }
      });

      console.log("最終訊息列表:", messages.value);
      console.log("最終媒體列表:", mediaMessages.value);

      nextTick(() => {
        scrollToBottom();
      });
    } else {
      console.log("沒有 LineList 或回應格式錯誤");
    }
  } catch (error) {
    console.error("獲取訊息失敗:", error);
  }
};

// 格式化時間
const formatTime = (timeString) => {
  const date = new Date(timeString);
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
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
  // 清空 input 的 value，允許重複選擇同一檔案
  event.target.value = "";
};

const handleVideoCapture = (event) => {
  const file = event.target.files[0];
  if (file) {
    processMediaFile(file, "video");
  }
  // 清空 input 的 value，允許重複選擇同一檔案
  event.target.value = "";
};

const handleGallerySelect = (event) => {
  const files = Array.from(event.target.files);
  files.forEach((file) => {
    // 檢查檔案格式
    if (!isAllowedImage(file)) {
      alert('請選擇支援的圖片格式：JPG、PNG、HEIC');
      return;
    }
    
    // 只處理圖片，不處理影片
    if (file.type.startsWith("image/") || file.name.match(/\.(jpg|jpeg|png|heic|heif)$/i)) {
      processMediaFile(file, "image");
    }
  });
  // 清空 input 的 value，允許重複選擇同一檔案
  event.target.value = "";
};

const processMediaFile = async (file, type) => {
  try {
    console.log('開始處理媒體檔案:', { name: file.name, type: file.type, size: file.size });
    
    // 檢查檔案大小
    if (!validateFileSize(file, 30)) {
      alert("檔案大小不能超過 30MB");
      return;
    }

    // 檢查圖片格式
    if (type === "image") {
      if (!isAllowedImage(file)) {
        alert('請選擇支援的圖片格式：JPG、PNG、HEIC');
        return;
      }
    }

    // 檢查影片長度
    if (type === "video") {
      const isValidDuration = await validateVideoDuration(file, 10);
      if (!isValidDuration) {
        alert("影片長度不能超過 10 秒");
        return;
      }
    }

    console.log('開始格式轉換...');
    // 處理格式轉換（HEIC 轉 JPG）
    const processedFile = await processFileFormat(file);
    console.log('格式轉換完成:', { name: processedFile.name, type: processedFile.type, size: processedFile.size });

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
    file, // 這裡保存的是處理過的檔案（HEIC 已轉為 JPG）
  };

  previewMedia.value.push(previewItem);
  console.log('添加預覽媒體:', previewItem); // 調試日誌
};

const removePreview = (index) => {
  revokePreviewURL(previewMedia.value[index].url);
  previewMedia.value.splice(index, 1);
};

// 圖片預覽放大功能
const openImagePreview = (url) => {
  previewImageUrl.value = url;
  showImagePreview.value = true;
};

const closeImagePreview = () => {
  showImagePreview.value = false;
  previewImageUrl.value = "";
};

const deleteMedia = (index) => {
  revokePreviewURL(mediaMessages.value[index].url);
  mediaMessages.value.splice(index, 1);
};

// 滿意度評分功能
const showSatisfactionRating = () => {
  // 在聊天記錄中顯示滿意度評分卡片
  const satisfactionCard = {
    type: "satisfaction",
    time: getCurrentTime(),
    rating: 0,
  };

  messages.value.push(satisfactionCard);

  nextTick(() => {
    scrollToBottom();
  });
};

const selectRating = (rating) => {
  // 找到最後一個滿意度評分卡片並更新評分
  const lastSatisfactionIndex = messages.value.findLastIndex(
    (msg) => msg.type === "satisfaction"
  );
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
onMounted(async () => {
  // 初始載入訊息
  await getMessages();

  nextTick(() => {
    scrollToBottom();
  });

  // 監聽來自後台管理的事件
  if (typeof window !== "undefined") {
    window.addEventListener("service-completed", showSatisfactionRating);
  }

  // 暫時隱藏滿意度評分功能
  // setTimeout(() => {
  //   showSatisfactionRating();
  // }, 5000);
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
  height: 100vh;
  min-height: 100vh;
  overflow-y: auto;
  padding: 1rem 0rem 7rem;
  display: flex;
  flex-direction: column;
}
.titleMenuWrap{
  padding: 0 3%;
}
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
  overflow-y: auto;
  padding-bottom: 200px;
}

.chat-messages {
  flex: 1;

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

  &.service-message {
    justify-content: flex-start;
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
  margin-top: 0.35rem;

  .user-message & {
    text-align: right;
  }

  .service-message & {
    text-align: right;
  }
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
  border-top: 0.5px solid #eee;
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
  position: fixed;
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
  min-height: 110px;
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
}

.preview-content {
  width: 100%;
  height: 100%;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.preview-image {
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
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
  border-radius: 8px;
  background: var(--Neutral-white, #fff);
  box-shadow: 0 6px 6px 0
    var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  text-align: center;
}

.satisfaction-header h3 {
  color: #000;
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
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
  color: var(--Neutral-black, #1e1e1e);

  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  padding: 4px 8px;
  border-radius: var(--Radius-r-50, 50px);
  background: var(--Neutral-white, #fff);
  box-shadow: 0 2px 6px 0
    var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4)) inset;
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
  gap: 0.25rem;
  justify-content: center;
}

.skip-btn,
.submit-btn {
  border: none;

  cursor: pointer;

  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  transition: all 0.2s ease;
  background: none;
}

.skip-btn {
  color: var(--Neutral-400, #b3b3b3);
}

.submit-btn {
  color: var(--Primary-default, #74bc1f);
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

// 圖片預覽放大彈窗樣式
.image-preview-overlay {
  @include coverbg();
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.image-preview-modal {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.close-preview {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  z-index: 1;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
}

.preview-large-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-width: 80vw;
  max-height: 80vh;
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
