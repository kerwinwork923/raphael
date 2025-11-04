<template>
  <div class="customer-support-admin">
    <!-- 左側邊欄 -->
    <Sidebar :current-page="'customerSupportAdmin'" @logout="handleLogout" />

    <!-- 主要內容區域 -->
    <div class="mainContainer">
      <DataUpdateHeader
        title="客服管理"
        :count="customers.length"
        count-unit="人"
        :last-updated="lastUpdated"
        :is-loading="isLoading"
        @refresh="fetchCustomerMessages"
      />
      <div class="mainContent">
        <!-- 頂部標題區域 -->
        <div class="header-section">
          <div class="customer-list-header">
            <h2>客戶列表</h2>
            <div class="filter-controls">
              <div class="filter-dropdown">
                <!-- 左側濾鏡 icon -->
                <img
                  src="/assets/imgs/backend/filter.svg"
                  class="fd-icon fd-icon--prefix"
                  alt=""
                />
                <!-- 自訂樣式的 select -->
                <select
                  v-model="selectedFilter"
                  class="fd-select"
                  aria-label="狀態篩選"
                >
                  <option value="all">全部</option>
                  <option value="pending">待處理</option>
                  <option value="processing">處理中</option>
                  <option value="completed">處理完畢</option>
                </select>
                <!-- 右側下拉箭頭 -->
                <img
                  src="/assets/imgs/backend/dropdown.svg"
                  class="fd-icon fd-icon--suffix"
                  alt=""
                />
              </div>

              <div class="search-box">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜尋客戶..."
                  class="search-input"
                />
                <img
                  src="/assets/imgs/backend/search.svg"
                  alt="搜尋"
                  class="search-icon"
                />
              </div>
            </div>
          </div>
          <div class="hr-line"></div>
          <!-- 客戶列表 -->
          <div class="customer-list">
            <div
              v-for="customer in filteredCustomers"
              :key="customer.id"
              class="customer-item"
              :class="{ active: selectedCustomer?.id === customer.id }"
              @click="selectCustomer(customer)"
            >
              <div class="customer-info">
                <h3>{{ customer.name }}</h3>
                <p class="last-message">{{ customer.lastMessage }}</p>
              </div>
              <div class="customer-meta">
                <span class="status-tag" :class="customer.status">
                  {{ getStatusText(customer.status) }}
                </span>
                <span class="timestamp">{{ customer.timestamp }}</span>
                <!-- <img src="/assets/imgs/backend/edit.svg" alt="編輯" class="edit-icon" /> -->
              </div>
            </div>
          </div>
        </div>

        <!-- 中間內容區域 -->
        <div class="content-section">
          <!-- 聊天介面 -->
          <div class="chat-interface">
            <div class="chat-header">
              <h3>{{ selectedCustomer?.name || "選擇客戶" }}</h3>
              <!-- <div class="chat-header-item-group">
                <div class="chat-header-item">
                  <img src="/assets/imgs/backend/media.svg" alt="" />
                  媒體庫
                </div>
                <div class="chat-header-item">
                  <img src="/assets/imgs/backend/filterGreen.svg" alt="" />
                  篩選
                </div>
              </div> -->
            </div>

            <div class="chat-messages" ref="chatMessagesEl">
              <div
                v-for="message in selectedCustomer?.messages || []"
                :key="message.id"
                class="message"
                :class="message.type"
              >
                <div class="message-content">
                  <!-- 文字訊息 -->
                  <div
                    v-if="message.messageType === 'text'"
                    class="text-message"
                  >
                    <p>{{ message.content }}</p>
                  </div>

                  <!-- 圖片訊息 -->
                  <div
                    v-else-if="message.messageType === 'image'"
                    class="image-message"
                  >
                    <img
                      :src="message.imgURL"
                      :alt="message.fileName"
                      class="message-image"
                      @load="onImgLoad"
                      @error="handleImageError"
                    />
                    <p v-if="message.content" class="image-caption">
                      {{ message.content }}
                    </p>
                  </div>

                  <!-- 其他類型訊息 -->
                  <div v-else class="other-message">
                    <p>{{ message.content || `[${message.messageType}]` }}</p>
                  </div>

                  <span class="message-time">{{
                    formatMessageTime(message.time)
                  }}</span>
                </div>

                <!-- 播放按鈕（僅限語音訊息） -->
                <div
                  v-if="
                    message.type === 'incoming' &&
                    message.messageType === 'audio'
                  "
                  class="play-icon"
                >
                  <!-- <img src="/assets/imgs/backend/play.svg" alt="播放" /> -->
                </div>
              </div>

              <!-- 貼底錨點 -->
              <div ref="messageEndEl" style="height: 1px"></div>
            </div>

            <div class="chat-input-area">
              <div class="message-input-wrapper">
                <textarea
                  v-model="newMessage"
                  placeholder="請輸入您的回覆..."
                  class="message-input"
                  @keyup.enter="sendMessage"
                  rows="5"
                  style="resize: none"
                />
              </div>
              <div class="input-controls">
                <img
                  src="/assets/imgs/backend/messageRobot.svg"
                  alt=""
                  @click="showAIAnalysis"
                />

                <img
                  src="/assets/imgs/backend/star.svg"
                  alt=""
                  @click="generateSuggestion"
                />
                <button class="send-btn" @click="sendMessage">
                  <img src="/assets/imgs/backend/send.svg" alt="傳送" />
                  <span>傳送</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右側AI分析面板 -->
        <div class="ai-analysis-panel">
          <div class="analysis-section">
            <h3>對話與分析指令</h3>
            <div class="conversation-record">
              <label>對話紀錄</label>
              <textarea
                v-model="conversationRecord"
                placeholder="自動帶入..."
                class="analysis-textarea"
              ></textarea>
            </div>
            <div class="analysis-instructions">
              <label>分析指令</label>
              <textarea
                v-model="analysisInstructions"
                placeholder="請輸入分析與評估"
                class="analysis-textarea"
              ></textarea>
            </div>
            <button
              class="suggest-btn"
              @click="generateSuggestion"
              :disabled="isGeneratingSuggestion"
            >
              {{ isGeneratingSuggestion ? "處理中..." : "建議" }}
            </button>
          </div>

          <div class="ai-suggestions">
            <h3>AI 建議</h3>
            <div class="suggestion-content">
              <textarea
                v-model="aiSuggestion"
                placeholder="自動帶入..."
                class="suggestion-textarea"
                readonly
              ></textarea>
            </div>
            <button class="copy-to-chat-btn" @click="copyToChat">
              複製到對話框
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 話術管理彈跳視窗 -->
    <transition name="fade">
      <div
        v-if="showSpeechSkillsModal"
        class="speech-skills-modal-overlay"
        @click="closeSpeechSkillsModal"
      >
        <div class="speech-skills-modal-content" @click.stop>
          <!-- 標題區域 -->
          <div class="speech-skills-header">
            <div class="speech-skills-logo">
              <div class="logo-square">NP</div>
            </div>
            <div class="speech-skills-title">
              <h2>話術管理</h2>
              <p>Speech Skills</p>
            </div>
          </div>

          <!-- 標籤頁 -->
          <div class="speech-skills-tabs">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'defaultMessage' }"
              @click="switchTab('defaultMessage')"
            >
              預設訊息
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'instructionPack' }"
              @click="switchTab('instructionPack')"
            >
              指令懶人包
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'tags' }"
              @click="switchTab('tags')"
            >
              標籤
            </button>
          </div>

          <!-- 內容區域 -->
          <div class="speech-skills-content">
            <!-- 預設訊息標籤頁 -->
            <div v-if="activeTab === 'defaultMessage'" class="tab-content">
              <div class="content-panel-left">
                <h3>建立訊息</h3>
                <div class="form-group">
                  <label>標題</label>
                  <input
                    v-model="defaultMessageTitle"
                    type="text"
                    placeholder="請輸入標題"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>內容</label>
                  <textarea
                    v-model="defaultMessageContent"
                    placeholder="請輸入內容"
                    class="form-textarea"
                    rows="5"
                  ></textarea>
                </div>
                <div class="form-actions">
                  <button class="close-btn" @click="closeSpeechSkillsModal">
                    關閉
                  </button>
                  <button class="create-btn" @click="createDefaultMessage">
                    建立
                  </button>
                </div>
              </div>
              <div class="content-panel-right">
                <div class="panel-header">
                  <h3>訊息列表</h3>
                  <span class="total-count"
                    >總共 {{ defaultMessages.length }} 筆</span
                  >
                </div>
                <div class="message-list">
                  <div
                    v-for="message in defaultMessages"
                    :key="message.id"
                    class="message-item"
                  >
                    <div class="message-info">
                      <div class="message-title">標題：{{ message.title }}</div>
                      <div class="message-content">{{ message.content }}</div>
                    </div>
                    <div class="message-actions">
                      <!-- <img
                        src="/assets/imgs/backend/delete.svg"
                        alt="刪除"
                        class="delete-icon"
                        @click="deleteDefaultMessage(message.id)"
                      /> -->
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 指令懶人包標籤頁 -->
            <div v-if="activeTab === 'instructionPack'" class="tab-content">
              <div class="content-panel-left">
                <h3>建立指令</h3>
                <div class="form-group">
                  <label>標題</label>
                  <input
                    v-model="instructionPackTitle"
                    type="text"
                    placeholder="請輸入標題"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>內容</label>
                  <textarea
                    v-model="instructionPackContent"
                    placeholder="請輸入內容"
                    class="form-textarea"
                    rows="5"
                  ></textarea>
                </div>
                <div class="form-actions">
                  <button class="close-btn" @click="closeSpeechSkillsModal">
                    關閉
                  </button>
                  <button class="create-btn" @click="createInstructionPack">
                    建立
                  </button>
                </div>
              </div>
              <div class="content-panel-right">
                <div class="panel-header">
                  <h3>指令列表</h3>
                  <span class="total-count"
                    >總共 {{ instructionPacks.length }} 筆</span
                  >
                </div>
                <div class="message-list">
                  <div
                    v-for="pack in instructionPacks"
                    :key="pack.id"
                    class="message-item"
                  >
                    <div class="message-info">
                      <div class="message-title">標題：{{ pack.title }}</div>
                      <div class="message-content">{{ pack.content }}</div>
                    </div>
                    <div class="message-actions">
                      <!-- <img
                        src="/assets/imgs/backend/delete.svg"
                        alt="刪除"
                        class="delete-icon"
                        @click="deleteInstructionPack(pack.id)"
                      /> -->
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 標籤標籤頁 -->
            <div v-if="activeTab === 'tags'" class="tab-content">
              <div class="content-panel-left">
                <h3>建立標籤</h3>
                <div class="form-group">
                  <label>標題名稱</label>
                  <input
                    v-model="tagTitle"
                    type="text"
                    placeholder="請輸入標題名稱"
                    class="form-input"
                  />
                </div>
                <div class="form-actions">
                  <button class="close-btn" @click="closeSpeechSkillsModal">
                    關閉
                  </button>
                  <button class="create-btn" @click="createTag">建立</button>
                </div>
              </div>
              <div class="content-panel-right">
                <div class="panel-header">
                  <h3>標籤列表</h3>
                  <span class="total-count">總共 {{ tags.length }} 筆</span>
                </div>
                <div class="message-list">
                  <div v-for="tag in tags" :key="tag.id" class="message-item">
                    <div class="message-info">
                      <div class="message-title">標題名稱：{{ tag.title }}</div>
                    </div>
                    <div class="message-actions">
                      <!-- <img
                        src="/assets/imgs/backend/delete.svg"
                        alt="刪除"
                        class="delete-icon"
                        @click="deleteTag(tag.id)"
                      /> -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import Sidebar from "@/components/raphaelBackend/Sidebar.vue";
import DataUpdateHeader from "@/components/raphaelBackend/DataUpdateHeader.vue";

const router = useRouter();

// 響應式數據
const selectedFilter = ref("all");
const searchQuery = ref("");
const selectedScriptFilter = ref("pending");
const scriptSearchQuery = ref("");
const selectedCustomer = ref(null);
const newMessage = ref("");
const conversationRecord = ref("");
const analysisInstructions = ref("");
const aiSuggestion = ref("");
const isLoading = ref(false);
const lastUpdated = ref("");
const isGeneratingSuggestion = ref(false);
const showSpeechSkillsModal = ref(false);
const activeTab = ref("defaultMessage"); // 'defaultMessage', 'instructionPack', 'tags'

// 話術管理數據
const defaultMessages = ref([]);
const instructionPacks = ref([]);
const tags = ref([]);

// 表單數據
const defaultMessageTitle = ref("");
const defaultMessageContent = ref("");
const instructionPackTitle = ref("");
const instructionPackContent = ref("");
const tagTitle = ref("");

// 客戶數據
const customers = ref([]);

// 輪詢相關
const pollingInterval = ref(null);
const isPolling = ref(false);
const POLLING_INTERVAL = 15000; // 15秒

// 滾動相關 refs
const chatMessagesEl = ref(null);
const messageEndEl = ref(null);
const autoStickThreshold = 80; // 距離底部 80px 內才自動貼底
let ro = null; // ResizeObserver 實例

// API 調用函數
const fetchCustomerMessages = async (
  selectedCustomer = null,
  isPollingCall = false
) => {
  // 如果正在輪詢且已經有輪詢請求在進行中，則跳過
  if (isPollingCall && isPolling.value) {
    console.log("輪詢請求已進行中，跳過此次請求");
    return;
  }

  if (isPollingCall) {
    isPolling.value = true;
  }

  isLoading.value = true;

  try {
    const token =
      localStorage.getItem("backendToken") ||
      sessionStorage.getItem("backendToken");
    const adminID =
      localStorage.getItem("adminID") || sessionStorage.getItem("adminID");

    if (!token || !adminID) {
      throw new Error("缺少 token 或 adminID");
    }

    // 如果沒有指定客戶，則取得所有客戶列表
    if (!selectedCustomer) {
      const requestBody = {
        AdminID: adminID,
        Token: token,
      };

      console.log("API 請求參數 (取得客戶列表):", requestBody);

      const response = await fetch(
        "https://23700999.com:8081/HMA/api/bk/bkGetLineMemberList",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API 回應 (客戶列表):", data);

      if (data.Result === "OK" && data.LineList) {
        // 轉換 API 數據格式
        const customerMap = new Map();

        data.LineList.forEach((item, index) => {
          const customerId = item.MID;
          const customerName = item.Name;

          if (!customerMap.has(customerId)) {
            customerMap.set(customerId, {
              id: customerId,
              name: customerName,
              mobile: item.Mobile,
              lastMessage: "",
              status: "pending",
              timestamp: item.CheckTime,
              messages: [],
            });
          }

          const customer = customerMap.get(customerId);

          // 添加訊息
          const message = {
            id: item.AID,
            type: item.Mode === "Input" ? "incoming" : "outgoing",
            content:
              item.messageType === "text"
                ? item.Content
                : item.messageType === "image"
                ? `[圖片] ${item.FileName}`
                : item.Content,
            time: item.CheckTime.split(" ")[1] || item.CheckTime,
            messageType: item.messageType,
            fileName: item.FileName,
            imgURL: item.ImgURL,
          };

          customer.messages.push(message);

          // 更新最後訊息
          if (item.Mode === "Input") {
            customer.lastMessage = message.content;
            customer.timestamp = item.CheckTime;
          }
        });

        customers.value = Array.from(customerMap.values());
        lastUpdated.value = new Date().toLocaleString("zh-TW");

        // 預設選擇第一個客戶
        if (customers.value.length > 0) {
          await selectCustomer(customers.value[0], true); // 跳過 API 調用，因為已經有訊息了
        }
      } else {
        console.error("API 回傳資料格式錯誤");
        customers.value = [];
      }
    } else {
      // 取得特定客戶的詳細訊息
      const requestBody = {
        AdminID: adminID,
        Token: token,
        MID: selectedCustomer.id,
        Mobile: selectedCustomer.mobile,
      };

      console.log("API 請求參數 (取得特定客戶訊息):", requestBody);

      const response = await fetch(
        "https://23700999.com:8081/HMA/api/bk/bkGetLineOneMember",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API 回應 (特定客戶訊息):", data);

      if (data.Result === "OK" && data.LineList) {
        // 更新選中客戶的訊息
        const messages = data.LineList.map((item) => ({
          id: item.AID,
          type: item.Mode === "Input" ? "incoming" : "outgoing",
          content:
            item.messageType === "text"
              ? item.Content
              : item.messageType === "image"
              ? `[圖片] ${item.FileName}`
              : item.Content,
          time: item.CheckTime.split(" ")[1] || item.CheckTime,
          messageType: item.messageType,
          fileName: item.FileName,
          imgURL: item.ImgURL,
        }));

        // 更新選中客戶的訊息
        selectedCustomer.messages = messages;

        // 更新最後訊息
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          selectedCustomer.lastMessage = lastMessage.content;
          selectedCustomer.timestamp = lastMessage.time;
        }
      } else {
        console.error("取得特定客戶訊息失敗");
      }
    }
  } catch (error) {
    console.error("載入客戶訊息時發生錯誤:", error);
    if (!selectedCustomer) {
      customers.value = [];
    }
  } finally {
    isLoading.value = false;
    if (isPollingCall) {
      isPolling.value = false;
    }
  }
};

// 計算屬性
const filteredCustomers = computed(() => {
  let filtered = customers.value;

  // 狀態篩選
  if (selectedFilter.value !== "all") {
    filtered = filtered.filter(
      (customer) => customer.status === selectedFilter.value
    );
  }

  // 搜尋篩選
  if (searchQuery.value) {
    filtered = filtered.filter((customer) =>
      customer.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  return filtered;
});

// 方法
const getStatusText = (status) => {
  const statusMap = {
    pending: "待處理",
    unprocessed: "未處理",
    completed: "處理完畢",
  };
  return statusMap[status] || status;
};

const selectCustomer = async (customer, skipAPI = false) => {
  selectedCustomer.value = customer;

  // 如果不是跳過 API 調用，則取得該會員的詳細訊息
  if (!skipAPI) {
    await fetchCustomerMessages(customer);
  }

  // 自動帶入對話紀錄到分析面板
  conversationRecord.value =
    customer.messages
      ?.map(
        (msg) => `${msg.type === "incoming" ? "客戶" : "客服"}: ${msg.content}`
      )
      .join("\n") || "";

  // 等待 DOM 更新和圖片載入完成後瞬間滾動到底部
  await nextTick();
  await waitImagesDecoded();
  scrollToBottomInstant();
};

// 傳送訊息的 API 函數
const sendMessageToAPI = async (content) => {
  try {
    const token =
      localStorage.getItem("backendToken") ||
      sessionStorage.getItem("backendToken");
    const adminID =
      localStorage.getItem("adminID") || sessionStorage.getItem("adminID");

    if (!token || !adminID) {
      throw new Error("缺少 token 或 adminID");
    }

    const requestBody = {
      AdminID: adminID,
      Token: token,
      MID: selectedCustomer.value.id,
      Mobile: selectedCustomer.value.mobile,
      Content: content,
    };

    console.log("API 請求參數 (傳送訊息):", requestBody);

    const response = await fetch(
      "https://23700999.com:8081/HMA/api/bk/bkSendLineText",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API 回應 (傳送訊息):", data);

    return data.Result === "OK";
  } catch (error) {
    console.error("傳送訊息時發生錯誤:", error);
    return false;
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedCustomer.value) return;

  const shouldStick = isNearBottom(); // 先記錄是否靠近底部
  const messageContent = newMessage.value.trim();

  // 先清空輸入框
  newMessage.value = "";

  // 立即在 UI 中顯示訊息
  const message = {
    id: Date.now(),
    type: "outgoing",
    content: messageContent,
    time: new Date().toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    messageType: "text",
  };

  if (!selectedCustomer.value.messages) {
    selectedCustomer.value.messages = [];
  }

  selectedCustomer.value.messages.push(message);

  // 更新最後訊息
  selectedCustomer.value.lastMessage = message.content;

  await nextTick();
  if (shouldStick) {
    await waitImagesDecoded();
    scrollToBottomInstant();
  }

  // 調用 API 傳送訊息
  const success = await sendMessageToAPI(messageContent);

  if (!success) {
    // 如果傳送失敗，可以顯示錯誤訊息或將訊息標記為失敗
    console.error("訊息傳送失敗");
    // 可以在這裡添加錯誤處理，例如顯示 toast 訊息
  }
};

// 檢查是否接近底部
const isNearBottom = () => {
  const el = chatMessagesEl.value;
  if (!el) return true;
  return el.scrollHeight - el.scrollTop - el.clientHeight <= autoStickThreshold;
};

// 絕對瞬間貼底（無動畫）
const scrollToBottomInstant = () => {
  const el = chatMessagesEl.value;
  if (!el) return;
  // 方式一：錨點（處理圖片高度變動最穩）
  if (messageEndEl.value?.scrollIntoView) {
    messageEndEl.value.scrollIntoView({ block: "end", behavior: "auto" });
  } else {
    // 方式二：直接設定 scrollTop
    el.scrollTop = el.scrollHeight;
  }
};

// 等容器裡所有 <img> 都完成 decode
const waitImagesDecoded = async () => {
  const el = chatMessagesEl.value;
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

// 舊的滾動函數（保留作為備用）
const scrollToBottom = () => {
  scrollToBottomInstant();
};

// 格式化訊息時間
const formatMessageTime = (timeString) => {
  if (!timeString) return "";

  try {
    // 如果時間格式是 "HH:MM" 或 "HH:MM:SS"
    if (timeString.includes(":")) {
      const timeParts = timeString.split(":");
      if (timeParts.length >= 2) {
        return `${timeParts[0]}:${timeParts[1]}`;
      }
    }

    // 如果是完整日期時間格式
    if (timeString.includes("/")) {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("zh-TW", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }

    return timeString;
  } catch (error) {
    console.error("格式化時間錯誤:", error);
    return timeString;
  }
};

// 處理圖片載入錯誤
const handleImageError = (event) => {
  console.error("圖片載入失敗:", event.target.src);
  event.target.style.display = "none";
  // 可以顯示一個預設的圖片或錯誤訊息
  const parent = event.target.parentElement;
  if (parent) {
    parent.innerHTML = '<div class="image-error">圖片載入失敗</div>';
  }
};

const showAIAnalysis = () => {
  showSpeechSkillsModal.value = true;
};

const closeSpeechSkillsModal = () => {
  showSpeechSkillsModal.value = false;
};

const switchTab = (tab) => {
  activeTab.value = tab;
};

// 創建預設訊息
const createDefaultMessage = () => {
  if (
    !defaultMessageTitle.value.trim() ||
    !defaultMessageContent.value.trim()
  ) {
    alert("請輸入標題和內容");
    return;
  }
  defaultMessages.value.push({
    id: Date.now(),
    title: defaultMessageTitle.value,
    content: defaultMessageContent.value,
  });
  defaultMessageTitle.value = "";
  defaultMessageContent.value = "";
};

// 刪除預設訊息
const deleteDefaultMessage = (id) => {
  defaultMessages.value = defaultMessages.value.filter((msg) => msg.id !== id);
};

// 創建指令懶人包
const createInstructionPack = () => {
  if (
    !instructionPackTitle.value.trim() ||
    !instructionPackContent.value.trim()
  ) {
    alert("請輸入標題和內容");
    return;
  }
  instructionPacks.value.push({
    id: Date.now(),
    title: instructionPackTitle.value,
    content: instructionPackContent.value,
  });
  instructionPackTitle.value = "";
  instructionPackContent.value = "";
};

// 刪除指令懶人包
const deleteInstructionPack = (id) => {
  instructionPacks.value = instructionPacks.value.filter(
    (pack) => pack.id !== id
  );
};

// 創建標籤
const createTag = () => {
  if (!tagTitle.value.trim()) {
    alert("請輸入標題名稱");
    return;
  }
  tags.value.push({
    id: Date.now(),
    title: tagTitle.value,
  });
  tagTitle.value = "";
};

// 刪除標籤
const deleteTag = (id) => {
  tags.value = tags.value.filter((tag) => tag.id !== id);
};

const generateSuggestion = async () => {
  const transcript = conversationRecord.value.trim();
  const prompt = analysisInstructions.value.trim();

  if (!transcript || !prompt) {
    alert("請確認【對話紀錄】和【分析指令】都不為空！");
    return;
  }

  isGeneratingSuggestion.value = true;
  aiSuggestion.value = "正在與 ChatGPT 互動，請稍候...";

  try {
    const response = await fetch(
      "https://23700999.com:8081/push_notification/api/chatgpt/ask",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: transcript,
          systemMessage: prompt,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`伺服器返回錯誤：${response.status}`);
    }

    const data = await response.json();

    if (data.response) {
      aiSuggestion.value = data.response;
    } else {
      aiSuggestion.value = "未收到有效的 ChatGPT 回應。";
    }
  } catch (error) {
    aiSuggestion.value = `發生錯誤：${error.message}`;
    console.error("生成 AI 建議時發生錯誤:", error);
  } finally {
    isGeneratingSuggestion.value = false;
  }
};

const copyToChat = () => {
  if (aiSuggestion.value) {
    newMessage.value = aiSuggestion.value;
  }
};

// 啟動輪詢機制
const startPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }

  console.log("啟動 15 秒輪詢機制");
  pollingInterval.value = setInterval(() => {
    console.log("執行輪詢檢查新訊息");
    // 如果有選中的客戶，則更新該客戶的訊息；否則更新所有客戶列表
    if (selectedCustomer.value) {
      fetchCustomerMessages(selectedCustomer.value, true);
    } else {
      fetchCustomerMessages(null, true);
    }
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

const handleLogout = () => {
  router.push("/raphaelBackend");
};

// 初始化
onMounted(() => {
  // 載入客戶訊息數據
  fetchCustomerMessages();

  // 啟動輪詢機制
  startPolling();

  // 建立 ResizeObserver：只要內容高度增加，且使用者接近底部，就瞬間貼底
  ro = new ResizeObserver(() => {
    if (isNearBottom()) scrollToBottomInstant();
  });
  if (chatMessagesEl.value) ro.observe(chatMessagesEl.value);
});

onBeforeUnmount(() => {
  // 停止輪詢機制
  stopPolling();

  if (ro && chatMessagesEl.value) ro.unobserve(chatMessagesEl.value);
  ro = null;
});
</script>

<style scoped lang="scss">
.customer-support-admin {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;

  .mainContainer {
    flex: 1;

    padding: 16px;

    @include respond-to(lg) {
      margin-left: 0;
      padding: 16px;
    }
  }

  .mainContent {
    display: flex;
    gap: 24px;
    margin-top: 1rem;
    .hr-line {
      width: 100%;
      height: 1px;
      background: #e5e9f2;
      margin: 1rem 0;
    }
  }

  .header-section {
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    border-radius: var(--Radius-r-20, 20px);
    background: var(--Neutral-white, #fff);
    box-shadow: 0 2px 20px 0
      var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    padding: 24px;
    max-width: 400px;
    @include respond-to(lg) {
      flex-direction: column;
      gap: 16px;
    }

    .customer-list-header,
    .scripts-header {
      h2 {
        color: #2d3047;
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 16px;
      }

      .filter-controls {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;

        .filter-dropdown {
          position: relative;

          min-width: 180px;

          flex-shrink: 0;
          border-radius: var(--Radius-r-50, 50px);
          background: var(--Neutral-white, #fff);
          box-shadow: 0 2px 20px 0
            var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
        }

        /* 自訂 select 樣式 */
        .fd-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;

          width: 100%;
          height: 100%;
          padding: 0.5rem;
          padding-left: 40px;
          border: 1px solid #e5e9f2;
          border-radius: 8px;
          background: #fff;
          color: #2d3047;
          font-size: 14px;

          cursor: pointer;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;

          &:hover {
            border-color: #cfd6e4;
          }

          &:focus {
            outline: none;
            border-color: #1ba39b;
            box-shadow: 0 0 0 3px rgba(27, 163, 155, 0.15);
          }

          &:disabled {
            background: #f6f8fb;
            color: #9aa3b2;
            cursor: not-allowed;
          }
        }

        /* 左右兩側 icon */
        .fd-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          opacity: 0.7;
          pointer-events: none; // 避免擋到點擊
          user-select: none;
        }

        .fd-icon--prefix {
          left: 12px;
        }

        .fd-icon--suffix {
          right: 12px;
          transition: transform 0.15s ease, opacity 0.15s ease;
        }

        /* focus 時小小動畫（利用鄰接選擇器） */
        .fd-select:focus + .fd-icon--suffix {
          transform: translateY(-50%) rotate(180deg);
          opacity: 0.9;
        }

        /* 小尺寸螢幕適配 */
        @include respond-to(lg) {
          .filter-dropdown {
            width: 100%;
            min-width: 0;
          }
        }

        .search-box {
          position: relative;
          flex: 1;

          .search-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #e5e9f2;
            border-radius: 6px;
            font-size: 14px;
            color: #2d3047;

            background: var(--Neutral-white, #fff);
            box-shadow: 0 2px 20px 0
              var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));

            &:focus {
              outline: none;
              border-color: #1ba39b;
            }
          }

          .search-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            opacity: 0.6;
          }
        }

        .media-library-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #1ba39b;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: #00877f;
          }

          img {
            width: 16px;
            height: 16px;
          }
        }
      }
    }
    .customer-list {
      margin-top: 1rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow-y: auto;
      max-height: 660px;

      @include respond-to(lg) {
        width: 100%;
        max-height: 500px;
      }

      .customer-item {
        padding: 16px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: #f8f9fa;
        }

        &.active {
          background: #e8f5f4;
        }

        .customer-info {
          margin-bottom: 8px;

          h3 {
            color: var(--Primary-600, #2d3047);
            font-size: var(--Text-font-size-20, 20px);
            font-style: normal;
            font-weight: 400;
            letter-spacing: 0.1px;
          }

          .last-message {
            color: var(--Neutral-500, #666);

            font-size: var(--Text-font-size-14, 14px);
            font-style: normal;
            font-weight: 400;
            line-height: 100%; /* 14px */
            letter-spacing: 0.07px;
            margin-top: 0.35rem;
          }
        }

        .customer-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          gap: 4px;

          .status-tag {
            font-size: var(--Text-font-size-12, 12px);
            font-style: normal;
            font-weight: 400;

            letter-spacing: 0.06px;
            border-radius: var(--Radius-r-50, 50px);
            padding: 4px;
            &.pending {
              border: 1px solid var(--Secondary-default, #74bc1f);
              color: #74bc1f;
            }

            &.unprocessed {
              border: 1px solid var(--Warning-default, #ec4f4f);
              color: #ec4f4f;
            }

            &.completed {
              border: 1px solid #ccc;
              color: #ccc;
            }
          }

          .timestamp {
            color: var(--Neutral-500, #666);
            font-size: var(--Text-font-size-14, 14px);
            font-style: normal;
            font-weight: 400;
            letter-spacing: 0.07px;
          }

          .edit-icon {
            width: 16px;
            height: 16px;
            opacity: 0.6;
            cursor: pointer;

            &:hover {
              opacity: 1;
            }
          }
        }
      }
    }
  }

  .content-section {
    display: flex;
    gap: 24px;
    flex: 1;
    min-height: 0;

    @include respond-to(lg) {
      flex-direction: column;
    }

    .chat-interface {
      flex: 1;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      min-height: 0;
      padding: 1rem 1.5rem;
      .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        h3 {
          color: #2d3047;
          font-size: 18px;
          font-weight: 600;
        }
        .chat-header-item-group {
          display: flex;
          align-items: center;
          gap: 8px;
          .chat-header-item {
            display: flex;
            align-items: center;
            gap: 2px;
            border-radius: var(--Radius-r-50, 50px);
            background: var(--Neutral-white, #fff);
            box-shadow: 0 2px 20px 0
              var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
            padding: 4px 10px;
            cursor: pointer;
            &:hover {
              opacity: 0.8;
            }
          }
        }
      }

      .chat-messages {
        flex: 1;
        padding: 16px 24px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        border: 1px solid #e5e9f2;
        border-radius: 12px;
        margin-top: 0.75rem;
        max-height: 550px;
        scroll-behavior: auto;

        .message {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          margin-bottom: 0.5rem;

          &.incoming {
            justify-content: flex-start;

            .message-content {
              background: #f0f0f0;
              color: #2d3047;
              border-radius: 18px 18px 18px 4px;
            }
          }

          &.outgoing {
            justify-content: flex-end;

            .message-content {
              background: #1ba39b;
              color: white;
              border-radius: 18px 18px 4px 18px;
            }
          }

          .message-content {
            max-width: 70%;
            padding: 12px 16px;
            position: relative;
            word-wrap: break-word;

            .text-message p {
              margin: 0;
              font-size: 14px;
              line-height: 1.4;
            }

            .image-message {
              .message-image {
                max-width: 200px;
                max-height: 200px;
                border-radius: 8px;
                object-fit: cover;
                cursor: pointer;
                transition: transform 0.2s ease;

                &:hover {
                  transform: scale(1.05);
                }
              }

              .image-caption {
                margin: 8px 0 0 0;
                font-size: 14px;
                line-height: 1.4;
              }
            }

            .other-message p {
              margin: 0;
              font-size: 14px;
              line-height: 1.4;
              font-style: italic;
            }

            .image-error {
              padding: 20px;
              text-align: center;
              color: #999;
              font-size: 12px;
              background: #f5f5f5;
              border-radius: 8px;
              border: 1px dashed #ddd;
            }

            .message-time {
              font-size: 11px;
              opacity: 0.6;
              margin-top: 4px;
              display: block;
              text-align: right;
            }
          }

          .play-icon {
            width: 32px;
            height: 32px;
            background: #1ba39b;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            margin-left: 8px;
            transition: all 0.2s ease;

            &:hover {
              background: #00877f;
              transform: scale(1.1);
            }

            img {
              width: 14px;
              height: 14px;
              filter: brightness(0) invert(1);
            }
          }
        }
      }

      .chat-input-area {
        border: 1px solid #e5e9f2;
        border-radius: 12px;
        padding: 0.25rem 1.5rem;
        margin-top: 0.75rem;

        .input-controls {
          display: flex;
          gap: 12px;
          margin-top: 0.5rem;
          img {
            cursor: pointer;
          }
        }

        .message-input-wrapper {
          display: flex;
          gap: 12px;

          .message-input {
            flex: 1;
            padding: 12px 0;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            color: #2d3047;

            &:focus {
              outline: none;
              border-color: #1ba39b;
            }
          }
        }
      }
      .send-btn {
        padding: 9px 12px;
        border-radius: 6px;
        background: var(--Secondary-default, #74bc1f);
        color: var(--Primary-100, #f5f7fa);

        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 400;

        letter-spacing: 2.7px;
        border: none;

        cursor: pointer;
        transition: all 0.2s ease;
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 4px;
        &:hover {
          background: var(--Secondary-600, #589a1b);
        }

        img {
          width: 16px;
          height: 16px;
          filter: brightness(0) invert(1);
        }
      }
    }
  }

  .ai-analysis-panel {
    width: 320px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;

    @include respond-to(lg) {
      width: 100%;
    }

    .analysis-section,
    .ai-suggestions {
      display: flex;
      flex-direction: column;
      h3 {
        color: var(--Primary-600, #2d3047);
        font-size: var(--Text-font-size-24, 20px);
        font-style: normal;
        font-weight: 700;

        letter-spacing: 0.12px;
        margin-bottom: 0.5rem;
      }

      .conversation-record,
      .analysis-instructions,
      .suggestion-content {
        margin-bottom: 16px;

        label {
          color: var(--Primary-300, #6d8ab6);

          font-size: 18px;
          font-style: normal;
          font-weight: 400;

          letter-spacing: 2.7px;
        }

        .analysis-textarea,
        .suggestion-textarea {
          width: 100%;
          min-height: 150px;
          padding: 12px;
          border: 1px solid #e5e9f2;
          border-radius: 8px;
          font-size: 14px;
          color: #2d3047;
          resize: vertical;
          font-family: inherit;
          margin-top: 0.5rem;
          &:focus {
            outline: none;
            border-color: #1ba39b;
          }
        }

        .suggestion-textarea {
          background: #f8f9fa;
        }
      }

      .suggest-btn,
      .copy-to-chat-btn {
        border-radius: 6px;
        background: var(--Secondary-default, #74bc1f);
        border: none;
        color: #fff;
        padding: 0.5rem 1rem;
        color: var(--Primary-100, #f5f7fa);
        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 400;
        letter-spacing: 2.7px;
        cursor: pointer;
        transition: all 0.2s ease;
        align-self: center;
        &:hover {
          background: var(--Secondary-600, #589a1b);
        }
        &:disabled {
          background: #ccc;
          cursor: not-allowed;
          opacity: 0.7;
          &:hover {
            background: #ccc;
          }
        }
      }
    }
  }
}

// 響應式設計
// @include respond-to(xl) {
//   .customer-support-admin {
//     .mainContainer {
//       // 暫時不要有邊欄  margin-left: 180px;
//     }
//   }
// }

@include respond-to(lg) {
  .customer-support-admin {
    flex-direction: column;

    .main-content {
      margin-left: 0;
    }
  }
}

// 話術管理彈跳視窗樣式
.speech-skills-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.speech-skills-modal-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px;
  position: relative;
}

.speech-skills-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e9f2;

  .speech-skills-logo {
    .logo-square {
      width: 48px;
      height: 48px;
      background: #1ba39b;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-weight: 700;
      font-size: 18px;
    }
  }

  .speech-skills-title {
    h2 {
      color: #2d3047;
      font-size: 24px;
      font-weight: 700;
      margin: 0;
    }

    p {
      color: #1ba39b;
      font-size: 14px;
      margin: 4px 0 0 0;
    }
  }
}

.speech-skills-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e5e9f2;

  .tab-btn {
    padding: 12px 24px;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    color: #666;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    top: 2px;

    &:hover {
      color: #1ba39b;
    }

    &.active {
      color: #1ba39b;
      border-bottom-color: #1ba39b;
      font-weight: 600;
    }
  }
}

.speech-skills-content {
  .tab-content {
    display: flex;
    gap: 24px;
    min-height: 400px;

    .content-panel-left {
      flex: 1;
      max-width: 400px;

      h3 {
        color: #2d3047;
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 20px;
      }

      .form-group {
        margin-bottom: 20px;

        label {
          display: block;
          color: #2d3047;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #e5e9f2;
          border-radius: 8px;
          font-size: 14px;
          color: #2d3047;
          font-family: inherit;

          &:focus {
            outline: none;
            border-color: #1ba39b;
            box-shadow: 0 0 0 3px rgba(27, 163, 155, 0.1);
          }

          &::placeholder {
            color: #999;
          }
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }
      }

      .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;

        .close-btn {
          flex: 1;
          padding: 12px;
          background: white;
          border: 1px solid #e5e9f2;
          border-radius: 8px;
          color: #666;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: #f5f7fa;
            border-color: #cfd6e4;
          }
        }

        .create-btn {
          flex: 1;
          padding: 12px;
          background: #74bc1f;
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;

          &:hover {
            background: #589a1b;
          }

          &::after {
            content: "";
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            width: 8px;
            height: 8px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
          }
        }
      }
    }

    .content-panel-right {
      flex: 1;
      border-left: 1px solid #e5e9f2;
      padding-left: 24px;

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h3 {
          color: #2d3047;
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .total-count {
          color: #666;
          font-size: 14px;
        }
      }

      .message-list {
        max-height: 500px;
        overflow-y: auto;

        .message-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.2s ease;

          &:hover {
            background: #f8f9fa;
          }

          .message-info {
            flex: 1;

            .message-title {
              color: #2d3047;
              font-size: 14px;
              font-weight: 500;
              margin-bottom: 8px;
            }

            .message-content {
              color: #666;
              font-size: 14px;
              line-height: 1.5;
              word-break: break-word;
            }
          }

          .message-actions {
            .delete-icon {
              width: 20px;
              height: 20px;
              cursor: pointer;
              opacity: 0.6;
              transition: opacity 0.2s ease;

              &:hover {
                opacity: 1;
              }
            }
          }
        }
      }
    }
  }
}

// 淡入淡出動畫
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
