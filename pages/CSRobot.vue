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
          v-for="message in allMessages"
          :key="message.id || message.timestamp + '-' + message.type"
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
              <div class="message-time">{{ message.time }}</div>
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
                  @load="onImgLoad"
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
          </div>
        </div>

        <!-- 放在所有訊息的最下面 -->
        <div ref="bottomSentinel" style="height: 1px"></div>

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
import {
  ref,
  reactive,
  nextTick,
  onMounted,
  onUnmounted,
  onBeforeUnmount,
  computed,
} from "vue";
import { useMediaConverter } from "~/composables/useMediaConverter";

// 響應式數據
const newMessage = ref("");
const messages = ref([]);
const mediaMessages = ref([]);
const previewMedia = ref([]);
const chatMessages = ref(null);
const bottomSentinel = ref(null);
const isFocused = ref(false);
const showImagePreview = ref(false);
const previewImageUrl = ref("");

// 輪詢相關
const pollingInterval = ref(null);
const isPolling = ref(false);
const POLLING_INTERVAL = 15000; // 15秒

// 滾動相關 refs
const autoStickThreshold = 80; // 距離底部 80px 內才自動貼底
let ro = null; // ResizeObserver 實例

// 修復 iOS 100vh 問題
const setAppVH = () => {
  document.documentElement.style.setProperty(
    "--app-vh",
    `${window.innerHeight}px`
  );
};

if (typeof window !== "undefined") {
  setAppVH();
  window.addEventListener("resize", setAppVH);
  window.addEventListener("orientationchange", setAppVH);
}

// 合併所有訊息並按時間排序
const allMessages = computed(() => {
  const all = [...messages.value, ...mediaMessages.value];
  return all.sort((a, b) => {
    const timeA = new Date(a.timestamp || a.time);
    const timeB = new Date(b.timestamp || b.time);
    return timeA - timeB;
  });
});

// ✅ 改善：添加用戶數據驗證
const userData = JSON.parse(localStorage.getItem("userData") || "{}");

// API 配置
const API_CONFIG = {
  MID: userData.MID,
  Token: userData.Token,
  MAID: userData.MAID,
  Mobile: userData.Mobile,
  Lang: "zhtw",
};

// 檢查用戶數據是否完整
const validateUserData = () => {
  if (!userData.MID || !userData.Token || !userData.MAID) {
    console.error("用戶數據不完整:", userData);
    alert("請重新登入");
    // 可以導向登入頁面
    // navigateTo('/login');
    return false;
  }
  return true;
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
  compressImage,
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

// ✅ 優化：添加重試機制的 API 函數
const frSendLineImage = async (base64String, subName, retryCount = 0) => {
  const maxRetries = 3;
  const retryDelay = Math.pow(2, retryCount) * 1000; // 指數退避：1s, 2s, 4s

  try {
    console.log(`發送圖片 (嘗試 ${retryCount + 1}/${maxRetries + 1}):`, {
      base64Length: base64String.length,
      subName,
      retryCount,
    });

    const response = await $fetch(
      "https://23700999.com:8081/HMA/api/fr/frSendLineImage",
      {
        method: "POST",
        body: {
          ...API_CONFIG,
          base64String,
          subName,
        },
        timeout: 30000, // 30秒超時
      }
    );

    console.log("圖片發送成功:", response);
    return response;
  } catch (error) {
    console.error(`發送圖片失敗 (嘗試 ${retryCount + 1}):`, error);

    // ✅ 重試邏輯：網路錯誤或超時時重試
    if (
      retryCount < maxRetries &&
      (error.message?.includes("timeout") ||
        error.message?.includes("network") ||
        error.message?.includes("fetch") ||
        error.status >= 500)
    ) {
      console.log(`等待 ${retryDelay}ms 後重試...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return frSendLineImage(base64String, subName, retryCount + 1);
    }

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

// 將檔案轉換為 base64（原始方法）
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
};

// ✅ 優化：改用 ArrayBuffer 方式轉 base64（節省 ~33% 記憶體）
const fileToBase64Optimized = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const binaryString = String.fromCharCode.apply(null, uint8Array);
  return btoa(binaryString);
};

// ✅ 分段上傳功能：支援大檔案分塊傳輸（含重試機制）
const uploadImageInChunks = async (file) => {
  const uploadId = crypto.randomUUID();
  const chunkSize = 512 * 1024; // 512KB 每塊
  let index = 0;

  try {
    console.log("開始分段上傳:", { uploadId, fileSize: file.size, chunkSize });

    // 1) 初始化上傳（讓後端建立暫存）
    await fetchWithRetry(
      "https://23700999.com:8081/HMA/api/fr/frInitImageUpload",
      {
        method: "POST",
        body: {
          ...API_CONFIG,
          uploadId,
          fileName: file.name,
          subName: getExt(file),
        },
      }
    );

    // 2) 分段上傳
    const arrayBuffer = await file.arrayBuffer();
    const totalChunks = Math.ceil(arrayBuffer.byteLength / chunkSize);

    for (let offset = 0; offset < arrayBuffer.byteLength; offset += chunkSize) {
      const chunk = arrayBuffer.slice(offset, offset + chunkSize);
      const chunkBase64 = btoa(String.fromCharCode(...new Uint8Array(chunk)));

      console.log(`上傳分塊 ${index + 1}/${totalChunks}:`, {
        offset,
        chunkSize: chunk.byteLength,
        isLast: index === totalChunks - 1,
      });

      // ✅ 重試機制：每個分塊都有重試
      await fetchWithRetry(
        "https://23700999.com:8081/HMA/api/fr/frSendLineImageChunk",
        {
          method: "POST",
          body: {
            ...API_CONFIG,
            uploadId,
            index,
            chunkBase64,
            isLast: index === totalChunks - 1,
          },
        }
      );

      index++;
    }

    // 3) 完成上傳（讓後端合併檔案）
    console.log("完成分段上傳，通知後端合併檔案...");
    await fetchWithRetry(
      "https://23700999.com:8081/HMA/api/fr/frFinalizeImageUpload",
      {
        method: "POST",
        body: {
          ...API_CONFIG,
          uploadId,
          fileName: file.name,
          subName: getExt(file),
        },
      }
    );

    console.log("分段上傳完成！");
  } catch (error) {
    console.error("分段上傳失敗:", error);
    throw error;
  }
};

// ✅ 通用重試機制
const fetchWithRetry = async (url, options, retryCount = 0) => {
  const maxRetries = 3;
  const retryDelay = Math.pow(2, retryCount) * 1000;

  try {
    const response = await $fetch(url, {
      ...options,
      timeout: 30000,
    });
    return response;
  } catch (error) {
    console.error(`API 請求失敗 (嘗試 ${retryCount + 1}):`, error);

    if (
      retryCount < maxRetries &&
      (error.message?.includes("timeout") ||
        error.message?.includes("network") ||
        error.message?.includes("fetch") ||
        error.status >= 500)
    ) {
      console.log(`等待 ${retryDelay}ms 後重試...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return fetchWithRetry(url, options, retryCount + 1);
    }

    throw error;
  }
};

// 方法
const sendMessage = async () => {
  if (!newMessage.value.trim() && previewMedia.value.length === 0) return;

  // ✅ 改善：驗證用戶數據
  if (!validateUserData()) {
    return;
  }

  const shouldStick = isNearBottom(); // 先記錄是否靠近底部

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
          console.log("發送圖片前檢查:", {
            name: media.file.name,
            type: media.file.type,
          });

          try {
            // ✅ 行動端保命線：強制壓縮策略
            let processed = await processFileFormat(media.file);
            console.log("處理後的檔案:", {
              name: processed.name,
              type: processed.type,
            });

            let willSendFile = processed;

            // 如果轉檔失敗（仍是 HEIC），使用備援策略
            if (isHEICFormat(processed)) {
              console.warn("HEIC 轉檔失敗，使用備援策略");
              willSendFile = media.file;
              console.log("使用原檔作為備援:", {
                name: willSendFile.name,
                type: willSendFile.type,
              });
            }

            // ✅ 行動端強制壓縮：統一轉成 JPEG，限制尺寸和品質
            console.log("行動端強制壓縮策略啟動...");
            willSendFile = await compressImage(willSendFile, 1600, 0.7);

            // ✅ 行動端檔案大小限制：5MB 閥值
            const MOBILE_MAX_BASE64_BYTES = 5 * 1024 * 1024;
            if (willSendFile.size > MOBILE_MAX_BASE64_BYTES) {
              console.warn("檔案仍過大，嘗試更激進的壓縮...");
              willSendFile = await compressImage(willSendFile, 1200, 0.6);

              // 如果還是太大，走分段上傳
              if (willSendFile.size > MOBILE_MAX_BASE64_BYTES) {
                console.log("檔案過大，改用分段上傳...");
                await uploadImageInChunks(willSendFile);
                return; // 分段上傳完成，跳過 base64 發送
              }
            }

            // ✅ 優化：改用 ArrayBuffer 方式轉 base64（節省記憶體）
            const base64String = await fileToBase64Optimized(willSendFile);
            const subName = getExt(willSendFile);

            console.log("發送圖片:", {
              subName,
              base64Length: base64String.length,
              fileSize: willSendFile.size,
              isCompressed: willSendFile.size < media.file.size,
              compressionRatio: `${Math.round(
                (1 - willSendFile.size / media.file.size) * 100
              )}%`,
            });

            await frSendLineImage(base64String, subName);
          } catch (error) {
            console.error("圖片處理失敗:", error);
            // 最後的備援：如果所有處理都失敗，至少嘗試發送原檔
            try {
              const base64String = await fileToBase64Optimized(media.file);
              const subName = getExt(media.file);
              console.log("使用原檔發送:", {
                subName,
                base64Length: base64String.length,
              });
              await frSendLineImage(base64String, subName);
            } catch (fallbackError) {
              console.error("備援發送也失敗:", fallbackError);
              alert("圖片上傳失敗，請檢查網路連線或嘗試其他格式");
            }
          }
        }
      }
    }

    // 清空輸入
    newMessage.value = "";
    previewMedia.value = [];

    // 智能滾動：只有在接近底部時才滾動
    await nextTick();
    if (shouldStick) {
      await waitImagesDecoded();
      scrollToBottomInstant();
    }

    // 獲取客服回應
    await getMessages();
  } catch (error) {
    console.error("發送訊息失敗:", error);
    alert("發送失敗，請稍後再試");
  }
};

// 獲取客服回應
const getMessages = async (isPollingCall = false) => {
  try {
    // 如果正在輪詢且已經有輪詢請求在進行中，則跳過
    if (isPollingCall && isPolling.value) {
      console.log("輪詢請求已進行中，跳過此次請求");
      return;
    }

    if (isPollingCall) {
      isPolling.value = true;
    }

    const response = await frGetLine();
    console.log("API 回應:", response);

    if (response && response.LineList) {
      console.log("LineList 長度:", response.LineList.length);

      // ✅ 修復：不要清空本地訊息，改為合併去重
      const makeKey = (m) =>
        `${m.timestamp}-${m.type}-${m.fileName || m.content || m.url || ""}`;
      const existing = new Set(
        [...messages.value, ...mediaMessages.value].map(makeKey)
      );
      let hasNewMessages = false;

      response.LineList.forEach((msg, index) => {
        console.log(`訊息 ${index}:`, msg);

        let item = null;
        if (msg.Mode === "Input") {
          // 用戶訊息
          if (msg.messageType === "text") {
            item = {
              content: msg.Content,
              messageType: "text",
              time: formatTime(msg.CheckTime),
              timestamp: new Date(msg.CheckTime).getTime(),
              type: "user",
            };
          } else if (msg.messageType === "image") {
            item = {
              url: msg.ImgURL,
              messageType: "image",
              time: formatTime(msg.CheckTime),
              timestamp: new Date(msg.CheckTime).getTime(),
              fileName: msg.FileName,
              type: "user",
            };
          }
        } else if (msg.Mode === "Output") {
          // 客服回應
          item = {
            content: msg.Content,
            messageType: "text",
            time: formatTime(msg.CheckTime),
            timestamp: new Date(msg.CheckTime).getTime(),
            type: "service",
          };
        }

        if (item) {
          const key = makeKey(item);
          if (!existing.has(key)) {
            console.log("添加新訊息:", item);
            (item.messageType === "image"
              ? mediaMessages.value
              : messages.value
            ).push(item);
            existing.add(key);
            hasNewMessages = true;
          } else {
            console.log("跳過重複訊息:", item);
          }
        }
      });

      console.log("最終訊息列表:", messages.value);
      console.log("最終媒體列表:", mediaMessages.value);

      // 只有在有新訊息時才滾動到底部
      if (hasNewMessages) {
        await nextTick();
        await waitImagesDecoded();
        scrollToBottomInstant();
      }
    } else {
      console.log("沒有 LineList 或回應格式錯誤");
    }
  } catch (error) {
    console.error("獲取訊息失敗:", error);
  } finally {
    if (isPollingCall) {
      isPolling.value = false;
    }
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

// 檢查是否接近底部
const isNearBottom = () => {
  const el = chatMessages.value;
  if (!el) return true;
  return el.scrollHeight - el.scrollTop - el.clientHeight <= autoStickThreshold;
};

// 絕對瞬間貼底（無動畫）
const scrollToBottomInstant = () => {
  const el = chatMessages.value;
  if (!el) return;
  // 方式一：錨點（處理圖片高度變動最穩）
  if (bottomSentinel.value?.scrollIntoView) {
    bottomSentinel.value.scrollIntoView({ block: "end", behavior: "auto" });
  } else {
    // 方式二：直接設定 scrollTop
    el.scrollTop = el.scrollHeight;
  }
};

// 等容器裡所有 <img> 都完成 decode
const waitImagesDecoded = async () => {
  const el = chatMessages.value;
  if (!el) return;

  const imgs = Array.from(el.querySelectorAll("img"));
  if (imgs.length === 0) return;

  // decode() 會在圖片尺寸可用、可排版時 resolve
  await Promise.all(
    imgs.map((img) =>
      img.decode
        ? img.decode().catch(() => {}) // 某些瀏覽器可能丟錯
        : img.complete
        ? Promise.resolve()
        : new Promise((res) =>
            img.addEventListener("load", res, { once: true })
          )
    )
  );
};

// 圖片載入事件（保險加一手）
const onImgLoad = async () => {
  if (!isNearBottom()) return;
  await nextTick();
  scrollToBottomInstant();
};

const scrollToBottom = () => {
  scrollToBottomInstant();
};

// DOM 更新 + 瀏覽器排程 + 圖片高度回流後再補一次
const scrollAfterRender = async () => {
  await nextTick();
  await waitImagesDecoded();
  scrollToBottomInstant();
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
      alert("請選擇支援的圖片格式：JPG、PNG、HEIC");
      return;
    }

    // 只處理圖片，不處理影片
    if (
      file.type.startsWith("image/") ||
      file.name.match(/\.(jpg|jpeg|png|heic|heif)$/i)
    ) {
      processMediaFile(file, "image");
    }
  });
  // 清空 input 的 value，允許重複選擇同一檔案
  event.target.value = "";
};

const processMediaFile = async (file, type) => {
  try {
    console.log("開始處理媒體檔案:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // ✅ 改善：更詳細的檔案大小檢查
    if (!validateFileSize(file, 30)) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      alert(`檔案大小 ${sizeMB}MB 超過限制，請選擇小於 30MB 的檔案`);
      return;
    }

    // 檢查圖片格式
    if (type === "image") {
      if (!isAllowedImage(file)) {
        alert("請選擇支援的圖片格式：JPG、PNG、HEIC");
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

    console.log("開始格式轉換...");
    // 處理格式轉換（HEIC 轉 JPG）
    const processedFile = await processFileFormat(file);
    console.log("格式轉換完成:", {
      name: processedFile.name,
      type: processedFile.type,
      size: processedFile.size,
    });

    // 添加到預覽區域
    addPreviewMedia(processedFile, type);

    // ✅ 改善：成功提示
    console.log("媒體檔案處理成功，已添加到預覽區域");
  } catch (error) {
    console.error("處理媒體檔案時發生錯誤:", error);

    // ✅ 改善：更具體的錯誤提示
    let errorMessage = "處理檔案時發生錯誤";
    if (error.message.includes("HEIC")) {
      errorMessage = "HEIC 格式轉換失敗，請嘗試使用 JPG 或 PNG 格式";
    } else if (error.message.includes("size")) {
      errorMessage = "檔案過大，請選擇較小的檔案";
    } else if (error.message.includes("format")) {
      errorMessage = "不支援的檔案格式，請選擇 JPG、PNG 或 HEIC";
    }

    alert(errorMessage);
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
  console.log("添加預覽媒體:", previewItem); // 調試日誌
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
const showSatisfactionRating = async () => {
  // 在聊天記錄中顯示滿意度評分卡片
  const satisfactionCard = {
    type: "satisfaction",
    time: getCurrentTime(),
    rating: 0,
  };

  messages.value.push(satisfactionCard);

  // 確保滾動到最下方
  await scrollAfterRender();
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

// 啟動輪詢機制
const startPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }

  console.log("啟動 15 秒輪詢機制");
  pollingInterval.value = setInterval(() => {
    console.log("執行輪詢檢查新訊息");
    getMessages(true);
  }, POLLING_INTERVAL);
};

// 停止輪詢機制
const stopPolling = () => {
  if (pollingInterval.value) {
    console.log("停止輪詢機制");
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
};

// 組件掛載後滾動到底部
onMounted(async () => {
  // 初始載入訊息
  await getMessages();

  // 確保滾動到最下方
  await nextTick();
  await waitImagesDecoded();
  scrollToBottomInstant();

  // 啟動輪詢機制
  startPolling();

  // 建立 ResizeObserver：只要內容高度增加，且使用者接近底部，就瞬間貼底
  ro = new ResizeObserver(() => {
    if (isNearBottom()) scrollToBottomInstant();
  });
  if (chatMessages.value) ro.observe(chatMessages.value);

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
  // 停止輪詢機制
  stopPolling();

  if (typeof window !== "undefined") {
    window.removeEventListener("service-completed", showSatisfactionRating);
    window.removeEventListener("resize", setAppVH);
    window.removeEventListener("orientationchange", setAppVH);
  }

  // 清理 ResizeObserver
  if (ro && chatMessages.value) ro.unobserve(chatMessages.value);
  ro = null;
});
</script>

<style lang="scss" scoped>
.CSRobotWrap {
  @include gradientBg();
  width: 100%;
  height: 100dvh;
  min-height: 100dvh;
  /* 移除 overflow-y: auto; 由子層負責滾 */
  padding: 1rem 0rem 0rem;
  display: flex;
  flex-direction: column;
}

@supports not (height: 100dvh) {
  .CSRobotWrap {
    height: var(--app-vh, 100vh);
    min-height: var(--app-vh, 100vh);
  }
}
.titleMenuWrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  min-height: 0; // 確保 flex 子層能正確縮放
}
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
  /* 移除 overflow-y: auto; 讓子層滾 */
  padding-bottom: calc(
    242px + env(safe-area-inset-bottom)
  ); /* 預留固定輸入列的高度 + 安全區域 */
  min-height: 0; /* ★ 讓子層能產生捲軸 */
}

.chat-messages {
  flex: 1;
  min-height: 0; /* ★ 關鍵：在 flex 內允許縮，才會有捲軸 */
  overflow-y: auto; /* ★ 只有這個層滾 */
  -webkit-overflow-scrolling: touch; // iOS 動量滾動
  touch-action: pan-y; // 明確允許垂直拖曳
  overscroll-behavior: contain; // 停止外層跟著被拖（避免彈跳誤觸）
  padding: 1rem 0;
  @include scrollbarStyle();
  scroll-behavior: auto;
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
  border-radius: 20px;
  word-wrap: break-word;

  &.service-bubble {
    background: white;
    color: #1e1e1e;
    border-bottom-left-radius: 0;
  }

  &.user-bubble {
    background: #74bc1f;
    color: white;
    border-bottom-right-radius: 0;

    & > .message-time {
      color: $raphael-white;
    }
  }

  &.media-bubble {
    padding: 0;
    background: transparent;
  }
}

.message-time {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.75rem;

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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 34px;
  pointer-events: auto; // 讓可互動的子層吃觸控
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
  padding-bottom: env(safe-area-inset-bottom); // 處理安全區域
  // pointer-events: none;  // 不要整層關，否則按鈕點不到
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
  pointer-events: auto; // 讓可互動的子層吃觸控
  resize:none;
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
