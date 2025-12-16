<template>
  <div class="healthLogWrap">
    <div class="healthLogContent">
      <TitleMenu Text="健康日誌" positionType="sticky" link="/robotdemo" />

      <!-- 切換標籤 -->
      <div class="tab-section">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'log' }"
          @click="activeTab = 'log'"
        >
          日誌
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'summary' }"
          @click="activeTab = 'summary'"
        >
          本週摘要
        </button>
      </div>

      <!-- 週別選擇器 -->
      <div class="week-selector">
        <button class="week-nav-btn" @click="goToPreviousWeek" disabled>
          <img
            src="/assets/imgs/arrowDown2.svg"
            alt="上一週"
            class="week-arrow left disabled"
          />
        </button>
        <div class="week-range">
          {{ weekRangeText }}
        </div>
        <button class="week-nav-btn" @click="goToNextWeek" disabled>
          <img
            src="/assets/imgs/arrowDown2.svg"
            alt="下一週"
            class="week-arrow right disabled"
          />
        </button>
      </div>

      <div class="total-count" v-if="isDataReady && activeTab === 'log'">
        總共 {{ filteredLogs.length }} 筆
      </div>

      <!-- 載入狀態 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-card">
          <div class="loading-spinner"></div>
          <div class="loading-text">載入健康日誌中...</div>
        </div>
      </div>

      <!-- 日誌列表 -->
      <div
        v-else-if="
          isDataReady && activeTab === 'log' && filteredLogs.length > 0
        "
        class="log-list"
      >
        <div class="timeline-container">
          <div class="log-item" v-for="log in filteredLogs" :key="log.id">
            <div class="log-content-wrapper">
              <div class="log-date">
                {{ formatDate(log.date || log.timestamp) }}
              </div>

              <!-- 口述內容區塊 -->
              <div
                class="content-section"
                v-if="log.preSoundNote && log.preSoundNote.trim()"
              >
                <div
                  class="section-header"
                  @click="
                    isExpandable(log.id, 'oral') &&
                      toggleSection(log.id, 'oral')
                  "
                >
                  <span class="section-title">口述內容</span>
                  <img
                    v-if="isExpandable(log.id, 'oral')"
                    src="/assets/imgs/arrowDown2.svg"
                    alt="展開/收合"
                    class="section-chevron"
                    :class="{
                      rotated: !expandedSections[`${log.id}-oral`],
                    }"
                  />
                </div>

                <div
                  class="section-content"
                  :class="{
                    expanded: expandedSections[`${log.id}-oral`],
                  }"
                >
                  {{ log.preSoundNote }}
                </div>
              </div>

              <div
                class="timeline-line"
                v-if="log.preSoundNote && log.preSoundNote.trim()"
              ></div>
              <!-- AI摘要內容區塊 -->
              <div
                class="content-section"
                v-if="log.content && log.content.trim()"
              >
                <div
                  class="section-header"
                  @click="
                    isExpandable(log.id, 'ai') && toggleSection(log.id, 'ai')
                  "
                >
                  <span class="section-title">AI摘要內容</span>
                  <img
                    v-if="isExpandable(log.id, 'ai')"
                    src="/assets/imgs/arrowDown2.svg"
                    alt="展開/收合"
                    class="section-chevron"
                    :class="{
                      rotated: !expandedSections[`${log.id}-ai`],
                    }"
                  />
                </div>
                <div
                  class="section-content"
                  :class="{
                    expanded: expandedSections[`${log.id}-ai`],
                  }"
                >
                  {{ log.content }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 本週摘要 -->
      <div
        v-else-if="isDataReady && activeTab === 'summary'"
        class="summary-container"
      >
        <!-- 載入狀態 -->
        <div v-if="isSummaryLoading" class="loading-container">
          <div class="loading-card">
            <div class="loading-spinner"></div>
            <div class="loading-text">正在彙整本週摘要...</div>
          </div>
        </div>
        <!-- 摘要內容 -->
        <div v-else-if="weeklySummary" class="summary-card">
          <div class="summary-content">
            {{ weeklySummary }}
          </div>
        </div>
        <!-- 空狀態 -->
        <div v-else class="empty-state">
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
      </div>

      <!-- 空狀態 -->
      <div
        v-else-if="
          isDataReady && activeTab === 'log' && filteredLogs.length === 0
        "
        class="empty-state"
      >
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import TitleMenu from "~/components/TitleMenu.vue";
import BottomNav from "~/components/BottomNav.vue";

// 響應式數據
const localData = localStorage.getItem("userData");
const localobj = localData ? JSON.parse(localData) : null;

const activeTab = ref("log"); // 'log' 或 'summary'
const expandedSections = ref({});
const expandableSections = ref({});
const healthLogs = ref([]);
const currentWeekStart = ref(null); // 當前選中的週開始日期

// 載入狀態管理
const isLoading = ref(true);
const isDataReady = ref(false);
const isSummaryLoading = ref(false); // 本週摘要載入狀態

// API URL（參考 robotDemo.vue）
const TEXT_WEBHOOK_URL =
  "https://23700999.com:8081/push_notification/api/chatgpt/ask";

// 獲取本週的開始日期（週一）
const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 調整到週一
  return new Date(d.setDate(diff));
};

// 獲取本週的結束日期（今天，不是週日）
const getWeekEnd = (weekStart) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // 設定為今天的最後一刻
  return today;
};

// 初始化當前週
const initCurrentWeek = () => {
  currentWeekStart.value = getWeekStart();
};

// 週範圍文字（從週一到今天）
const weekRangeText = computed(() => {
  if (!currentWeekStart.value) return "";
  const today = new Date();
  const startStr = formatDateRange(currentWeekStart.value);
  const endStr = formatDateRange(today);
  return `${startStr} - ${endStr}`;
});

// 是否為當前週
const isCurrentWeek = computed(() => {
  if (!currentWeekStart.value) return true;
  const today = new Date();
  const currentWeekStartDate = getWeekStart(today);
  return currentWeekStart.value.getTime() === currentWeekStartDate.getTime();
});

// 格式化日期範圍（YYYY/MM/DD）
const formatDateRange = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}/${month}/${day}`;
};

// 篩選該週的日誌（從週一到今天）
const filteredLogs = computed(() => {
  if (!healthLogs.value.length || !currentWeekStart.value) {
    return [];
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999); // 設定為今天的最後一刻

  const filtered = healthLogs.value
    .filter((log) => {
      const logDate = new Date(log.date || log.timestamp);
      return logDate >= currentWeekStart.value && logDate <= today;
    })
    .sort(
      (a, b) =>
        new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)
    );

  return filtered;
});

// 本週摘要（使用 ref 而不是 computed，因為需要異步載入）
const weeklySummary = ref("");

// 調用 API 彙整本週摘要
const generateWeeklySummary = async () => {
  if (activeTab.value !== "summary" || !filteredLogs.value.length) {
    weeklySummary.value = "";
    return;
  }

  // 收集該週所有有 AI 摘要的內容
  const aiSummaries = filteredLogs.value
    .filter((log) => log.content && log.content.trim())
    .map((log) => {
      const date = new Date(log.date || log.timestamp);
      const dateStr = formatDate(log.date || log.timestamp);
      return {
        date: dateStr,
        content: log.content.trim(),
      };
    });

  if (aiSummaries.length === 0) {
    weeklySummary.value = "";
    return;
  }

  // 準備要送給 AI 的內容
  const summaryParts = aiSummaries.map(
    (item, index) => `${index + 1}. ${item.date}\n${item.content}`
  );
  const combinedSummary = summaryParts.join("\n\n");

  // 調用 API 彙整摘要
  isSummaryLoading.value = true;
  try {
    const response = await fetch(TEXT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemMessage: `你是一個「健康管理陪伴機器人」，你的工作是彙整本週的健康日誌摘要。

【任務】
請將以下本週（${weekRangeText.value}）的健康日誌內容，彙整成一份簡潔、有條理的週摘要。

【輸出格式要求】
1. 以自然、流暢的語句呈現，不要使用條列式或編號
2. 重點整理本週的健康狀況變化、症狀發展、改善或惡化情況
3. 保持客觀記錄，不提供醫療建議或診斷
4. 不要使用 *、#、-、>、Markdown 格式符號
5. 輸出內容應該是一段完整的文字，讓使用者能快速了解本週整體健康狀況

【限制規則】
1. 不可推理或猜測病因
2. 不可加入任何建議、分析、評論或衛教
3. 不可使用條列符號，全部以自然語句呈現
4. 忠實反映日誌內容，不添加未提及的資訊

請嚴格遵守以上格式與規則，開始後不需要再次重述任務或格式。`,
        message: `以下是本週（${weekRangeText.value}）的健康日誌內容，共 ${aiSummaries.length} 筆記錄：\n\n${combinedSummary}\n\n請幫我彙整成本週的健康狀況摘要。`,
        model: "gpt-5-mini",
      }),
    });

    if (!response.ok) {
      throw new Error(`API 調用失敗: ${response.status}`);
    }

    let answerText = "";

    // 嘗試從 Header 取回文字（X-Answer）
    const rawHeader = response.headers.get("x-answer");
    if (rawHeader) {
      try {
        answerText = decodeURIComponent(rawHeader);
      } catch {
        answerText = rawHeader;
      }
    }

    // 如果 Header 沒有，嘗試從 JSON 回應中取得
    if (!answerText) {
      let data = null;
      try {
        data = await response.clone().json();
      } catch {
        try {
          const txt = await response.text();
          if (txt) answerText = txt;
        } catch {}
      }

      if (data) {
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
    }

    weeklySummary.value =
      answerText.trim() ||
      `本週健康狀況摘要\n\n${combinedSummary}\n\n---\n以上為本週（${weekRangeText.value}）的健康日誌彙整，共 ${aiSummaries.length} 筆記錄。`;
  } catch (error) {
    console.error("彙整本週摘要失敗:", error);
    // 如果 API 失敗，使用簡單的彙整
    weeklySummary.value = `本週健康狀況摘要\n\n${combinedSummary}\n\n---\n以上為本週（${weekRangeText.value}）的健康日誌彙整，共 ${aiSummaries.length} 筆記錄。`;
  } finally {
    isSummaryLoading.value = false;
  }
};

// 監聽 activeTab 和 filteredLogs 變化，自動生成摘要
watch(
  [() => activeTab.value, () => filteredLogs.value.length],
  () => {
    if (activeTab.value === "summary") {
      generateWeeklySummary();
    }
  },
  { immediate: true }
);

// 方法
const loadHealthLogs = async () => {
  isLoading.value = true;
  isDataReady.value = false;

  try {
    // 從 localStorage 讀取健康日誌
    const storageKey = "robotDemo_healthLogs";
    const existingData = localStorage.getItem(storageKey);
    const allLogs = existingData ? JSON.parse(existingData) : [];

    console.log("從 localStorage 讀取的資料:", allLogs);

    // 轉換所有日誌資料
    healthLogs.value = allLogs
      .map((item, index) => ({
        id: item.id || Date.now() + index,
        date: item.date || item.timestamp,
        timestamp: item.timestamp || item.date,
        type: item.type || "summary",
        content: item.content || item.Note || "", // AI 摘要內容
        preSoundNote: item.preSoundNote || item.originalInput || "", // 口述內容
      }))
      .sort(
        (a, b) =>
          new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)
      );

    // ✅ 根據字數決定這一塊「需不需要展開箭頭」
    const MAX_PREVIEW_CHARS = 50;

    healthLogs.value.forEach((log) => {
      if (log.preSoundNote && log.preSoundNote.trim()) {
        const key = `${log.id}-oral`;
        expandableSections.value[key] =
          log.preSoundNote.trim().length > MAX_PREVIEW_CHARS;
      }

      if (log.content && log.content.trim()) {
        const key = `${log.id}-ai`;
        expandableSections.value[key] =
          log.content.trim().length > MAX_PREVIEW_CHARS;
      }
    });

    console.log("轉換後的健康日誌:", healthLogs.value);
    console.log("健康日誌總數:", healthLogs.value.length);
  } catch (error) {
    console.error("讀取健康日誌失敗:", error);
    healthLogs.value = [];
  } finally {
    isLoading.value = false;
    isDataReady.value = true;
  }
};

const toggleSection = (logId, sectionType) => {
  const key = `${logId}-${sectionType}`;
  expandedSections.value[key] = !expandedSections.value[key];
};

const isExpandable = (logId, sectionType) => {
  const key = `${logId}-${sectionType}`;
  return !!expandableSections.value[key];
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
};

// 切換到上一週（Demo 版本：不允許切換到過去）
const goToPreviousWeek = () => {
  // Demo 版本不允許切換到過去的週
  return;
};

// 切換到下一週（Demo 版本：不允許切換到未來）
const goToNextWeek = () => {
  // Demo 版本不允許切換到未來的週
  return;
};

// 生命週期
onMounted(async () => {
  initCurrentWeek();
  await loadHealthLogs();
});
</script>

<style lang="scss" scoped>
.healthLogWrap {
  @include gradientBg();
  width: 100%;
  max-height: 100vh;
  padding: 16px 0 104px 0;
  position: relative;
  overflow-y:  hidden;
  @media (min-width: 667px) {
    max-height: none;
    overflow-y: visible;
  }
  .healthLogContent {
    max-width: 768px;
    margin: 0 auto;
    .titleMenu:deep > div {
      left: 16px;
    }
  }
}

.tab-section {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  margin: 0.25rem 1rem;
  border-radius: var(--Radius-r-50, 50px);
  background: var(--Secondary-100, #f5f7fa);
  box-shadow: 2px 4px 12px 0
    var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
  .tab-btn {
    flex: 1;
    padding: .35rem;
    border: none;
    background: var(--Neutral-white, #fff);
    border-radius: 50px;
    color: var(--neutral-500-opacity-70, rgba(102, 102, 102, 0.7));
    font-size: var(--Text-font-size-18, 18px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    color: var(--Primary-default, #74bc1f);
    font-size: var(--Text-font-size-18, 18px);
    font-style: normal;
    font-weight: 400;

    letter-spacing: 2.7px;

    &.active {
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Secondary-100, #f5f7fa);
      box-shadow: 2px 4px 12px 0
        var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7)) inset;
    }

    &:hover:not(.active) {
      background: var(--Secondary-100, #f5f7fa);
    }
  }
}

.week-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
 
  padding: .25rem;
  margin-bottom: 1rem;

  .week-nav-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s ease;

    &:disabled {
      cursor: not-allowed;
    }

    .week-arrow {
      width: 20px;
      height: 20px;
      transition: opacity 0.2s ease;

      &.left {
        transform: rotate(90deg);
      }

      &.right {
        transform: rotate(-90deg);
      }

      &.disabled {
        opacity: 0.3;
        filter: grayscale(100%);
      }
    }
  }

  .week-range {
    color: var(--Neutral-700, #4a5568);
    font-size: var(--Text-font-size-18, 18px);
    font-weight: 500;
    min-width: 200px;
    text-align: center;
  }
}

.total-count {
  color: var(--Secondary-300, #b1c0d8);
  text-align: right;
  font-size: var(--Text-font-size-18, 18px);
  font-style: normal;
  font-weight: 400;

  letter-spacing: 0.072px;
  padding-right: 1.25rem;
  margin-bottom: 0.75rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
  width: 100%;
  max-width: 100%;
}

.loading-card {
  @include neumorphismOuter($radius: 20px, $padding: 3rem 2rem);
  width: 100%;
  text-align: center;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(116, 188, 31, 0.3);
    border-top: 3px solid #74bc1f;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1.5rem;
  }

  .loading-text {
    color: var(--Neutral-700, #4a5568);
    font-size: 18px;
    font-weight: 500;
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

.log-list {
  padding: 1rem;
  max-height: calc(70vh - 32px);
  overflow-y: auto;
  @include scrollbarStyle();
}

.timeline-container {
  position: relative;
}

.log-item {
  position: relative;
  margin-bottom: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.log-content-wrapper {
  flex: 1;
  @include neumorphismOuter($radius: 20px);
  padding: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
  }
}

.log-date {
  color: var(--Neutral-black, #1e1e1e);
  font-size: var(--Text-font-size-18, 18px);
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0.1px;
  margin-bottom: 0.75rem;
}

.content-section {
  &:last-child {
    margin-bottom: 0;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;

  .section-title {
    color: var(--Neutral-500, #666);
    text-align: center;
    font-size: var(--Text-font-size-18, 18px);
    font-style: normal;
    font-weight: 700;

    letter-spacing: 0.09px;
  }

  .section-chevron {
    width: 16px;
    height: 16px;
    transition: transform 0.3s ease;
    filter: brightness(0) saturate(100%) invert(58%) sepia(95%) saturate(2000%)
      hue-rotate(60deg) brightness(100%) contrast(85%);
    transform: rotate(180deg); // 預設向上（綠色向上箭頭）

    &.rotated {
      transform: rotate(0deg); // 收合時向下
    }
  }
}

.section-content {
  color: var(--Neutral-500, #666);
  font-size: var(--Text-font-size-16, 16px);
  font-style: normal;
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: 0.064px;

  // ✅ 預設兩行截斷
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; // 顯示 2 行
  line-clamp: 2; // 標準屬性
  overflow: hidden;

  margin-top: 0.5rem;
  word-break: break-word;
  transition: all 0.3s ease;
}

.section-content.expanded {
  // ✅ 展開時取消行數限制
  -webkit-line-clamp: unset;
  line-clamp: unset; // 標準屬性
  max-height: none; // 保險用，可加可不加
}

.timeline-line {
  background: var(--Secondary-300, #b1c0d8);
  height: 1px;
  width: 100%;
  margin: 1rem 0;
}

.summary-container {
  padding: 1rem;
  min-height: 60vh;

  .summary-card {
    @include neumorphismOuter($radius: 20px);
    padding: 1.5rem;
    background: var(--Neutral-white, #fff);

    .summary-content {
      color: var(--Neutral-700, #4a5568);
      font-size: var(--Text-font-size-16, 16px);
      font-style: normal;
      font-weight: 400;
      line-height: 1.8;
      letter-spacing: 0.064px;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 1rem;
  width: 100%;
  max-width: 100%;
}

.empty-card {
  @include neumorphismOuter();

  width: 100%;
  text-align: center;

  .empty-character {
    .character-img {
      object-fit: contain;
    }
  }

  .empty-message {
    color: var(--Neutral-700, #4a5568);
    font-size: 18px;
    font-weight: 500;
  }
}

.picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.picker-modal {
  background: var(--Neutral-white, #fff);
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 300px;
  width: 90%;
  max-height: 400px;
  overflow-y: auto;
  @include neumorphismOuter(
    $bgColor: var(--Neutral-white, #fff),
    $radius: 16px,
    $x: 0,
    $y: 4px,
    $blur: 12px
  );

  .picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    h3 {
      color: var(--Neutral-800, #2d3748);
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: var(--Neutral-500, #666);
      cursor: pointer;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s ease;

      &:hover {
        background: var(--Secondary-100, #f5f7fa);
      }
    }
  }

  .picker-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .picker-item {
    padding: 0.75rem 1rem;
    border: none;
    background: var(--Secondary-50, #fafbfc);
    border-radius: 8px;
    color: var(--Neutral-700, #4a5568);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;

    &:hover {
      background: var(--Secondary-100, #f5f7fa);
    }

    &.active {
      background: #74bc1f;
      color: #fff;
      font-weight: 600;
    }
  }
}

@include respond-to(md) {
  .healthLogWrap {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>
