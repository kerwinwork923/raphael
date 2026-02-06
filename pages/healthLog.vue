<template>
  <div class="healthLogWrap">
    <div class="healthLogContent">
      <TitleMenu Text="健康日誌" positionType="sticky" link="/robot" />

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

      <!-- 篩選器區域（僅在日誌時顯示） -->
      <div class="filter-section" v-if="activeTab === 'log'">
        <div class="filter-buttons">
          <button class="filter-btn" @click="showYearPicker = !showYearPicker">
            <img
              src="/assets/imgs/filter_green.svg"
              alt="篩選"
              class="filter-icon"
            />
            {{ selectedYear }}
            <img
              src="/assets/imgs/arrowDown2.svg"
              alt="下拉"
              class="chevron-icon"
            />
          </button>
          <button
            class="filter-btn"
            @click="showMonthPicker = !showMonthPicker"
          >
            <img
              src="/assets/imgs/filter_green.svg"
              alt="篩選"
              class="filter-icon"
            />
            {{ selectedMonth }}
            <img
              src="/assets/imgs/arrowDown2.svg"
              alt="下拉"
              class="chevron-icon"
            />
          </button>
        </div>
      </div>

      <!-- 週別選擇器（僅在本週摘要時顯示） -->
      <div class="week-selector" v-if="activeTab === 'summary'">
        <button class="week-nav-btn" @click="goToPreviousWeek" :disabled="!canGoToPreviousWeek">
          <img
            src="/assets/imgs/arrowDown2.svg"
            alt="上一週"
            class="week-arrow left"
            :class="{ disabled: !canGoToPreviousWeek }"
          />
        </button>
        <div class="week-range">
          {{ weekRangeText }}
        </div>
        <button class="week-nav-btn" @click="goToNextWeek" :disabled="!canGoToNextWeek">
          <img
            src="/assets/imgs/arrowDown2.svg"
            alt="下一週"
            class="week-arrow right"
            :class="{ disabled: !canGoToNextWeek }"
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
        v-else-if="isDataReady && activeTab === 'log' && filteredLogs.length > 0"
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
                v-if="log.preSoundNote && log.preSoundNote.trim() && log.content && log.content.trim()"
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
          <div class="summary-title">本周健康狀況摘要：</div>
          <div class="summary-content">
            {{ weeklySummary }}
          </div>
          
          <!-- 已儲存的補充內容顯示 -->
          <div v-if="savedMetaSummary" class="saved-meta-section">
            <div class="saved-meta-title">補充內容</div>
            <div class="saved-meta-content">{{ savedMetaSummary }}</div>
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
            <div class="empty-message">本週目前沒有資料</div>
          </div>
        </div>

        <!-- 底部按鈕區域 -->
        <div v-if="!isSummaryLoading" class="bottom-action">
          <div class="action-buttons">
            <button 
              class="update-summary-btn" 
              @click="regenerateWeeklySummary"
              :disabled="isRegenerating"
            >
              {{ isRegenerating ? '生成中...' : (weeklySummary ? '更新摘要' : '生成摘要') }}
            </button>
            <button 
              v-if="weeklySummary" 
              class="add-meta-btn" 
              @click="openMetaModal"
            >
              補充內容
            </button>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div
        class="empty-state"
        v-else-if="isDataReady && activeTab === 'log' && filteredLogs.length === 0"
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

      <!-- 年份選擇器 -->
      <div
        class="picker-overlay"
        v-if="showYearPicker"
        @click="showYearPicker = false"
      >
        <div class="picker-modal" @click.stop>
          <div class="picker-header">
            <h3>選擇年份</h3>
            <button @click="showYearPicker = false" class="close-btn">×</button>
          </div>
          <div class="picker-content">
            <button
              v-for="year in availableYears"
              :key="year"
              class="picker-item"
              :class="{ active: selectedYear === year }"
              @click="selectYear(year)"
            >
              {{ year }}
            </button>
          </div>
        </div>
      </div>

      <!-- 月份選擇器 -->
      <div
        class="picker-overlay"
        v-if="showMonthPicker"
        @click="showMonthPicker = false"
      >
        <div class="picker-modal" @click.stop>
          <div class="picker-header">
            <h3>選擇月份</h3>
            <button @click="showMonthPicker = false" class="close-btn">
              ×
            </button>
          </div>
          <div class="picker-content">
            <button
              v-for="month in availableMonths"
              :key="month.value"
              class="picker-item"
              :class="{ active: selectedMonth === month.label }"
              @click="selectMonth(month.value)"
            >
              {{ month.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- 補充內容 Modal -->
      <transition name="slide-right">
        <div v-if="showMetaModal" class="meta-modal-overlay">
          <div class="meta-modal">
            <div class="meta-modal-header">
              <button class="back-btn" @click="closeMetaModal">
                <img src="/assets/imgs/arrowDown2.svg" alt="返回" class="back-arrow" />
              </button>
              <h3>補充內容</h3>
              <div class="header-spacer"></div>
            </div>
            <div class="meta-modal-body">
              <textarea
                v-model="metaSummary"
                class="meta-textarea"
                placeholder="請輸入補充內容..."
              ></textarea>
            </div>
            <div class="meta-modal-footer">
              <button class="cancel-btn" @click="closeMetaModal">取消</button>
              <button 
                class="confirm-btn" 
                @click="saveWeeklySummary"
                :disabled="isSaving"
              >
                {{ isSaving ? '送出中...' : '確認送出' }}
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- 儲存成功提示 -->
      <div v-if="showSaveSuccess" class="save-success-toast">
        儲存成功！
      </div>

      <!-- 底部導航 -->
      <BottomNav />
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
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(`${new Date().getMonth() + 1}月`);
const showYearPicker = ref(false);
const showMonthPicker = ref(false);
const expandedSections = ref({});
const expandableSections = ref({});
const healthLogs = ref([]);
const currentWeekStart = ref(null);

// 載入狀態管理
const isLoading = ref(true);
const isDataReady = ref(false);
const isSummaryLoading = ref(false);
const isSaving = ref(false);
const showSaveSuccess = ref(false);
const isRegenerating = ref(false); // 更新摘要狀態

// 本週摘要相關
const weeklySummary = ref("");
const metaSummary = ref(""); // 補充摘要輸入
const savedMetaSummary = ref(""); // 已儲存的補充內容
const showMetaModal = ref(false); // 補充內容 Modal
const isWeekSaved = ref(false); // 該週是否已儲存
const weeklySummaryList = ref([]); // 週期摘要列表
const currentWeekAID = ref(null); // 當週摘要 ID

// API URLs
const TEXT_WEBHOOK_URL =
  "https://23700999.com:8081/push_notification/api/chatgpt/ask";
const WEEKLY_SUMMARY_LIST_API_URL =
  "https://23700999.com:8081/HMA/TTEgetCaseWeeklySummary.jsp";
const WEEKLY_SUMMARY_SAVE_API_URL =
  "https://23700999.com:8081/HMA/TTECaseWeeklySummary.jsp";

// 可用年份和月份
const availableYears = computed(() => {
  const startYear = 2025;
  const currentYear = new Date().getFullYear();
  return Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  ).reverse();
});

const availableMonths = computed(() => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const isCurrentYear = selectedYear.value === currentYear;

  const maxMonth = isCurrentYear ? currentMonth : 12;

  return Array.from({ length: maxMonth }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}月`,
  }));
});

// 獲取週的開始日期（週一）
const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

// 獲取週的結束日期（週日）
const getWeekEnd = (weekStart) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
};

// 初始化當前週
const initCurrentWeek = () => {
  currentWeekStart.value = getWeekStart();
};

// 週範圍文字
const weekRangeText = computed(() => {
  if (!currentWeekStart.value) return "";
  const weekEnd = getWeekEnd(currentWeekStart.value);
  const startStr = formatDateRange(currentWeekStart.value);
  const endStr = formatDateRange(weekEnd);
  return `${startStr} - ${endStr}`;
});

// 是否可以切換到上一週
const canGoToPreviousWeek = computed(() => {
  if (!currentWeekStart.value) return false;
  // 限制最多往前 4 週
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  return currentWeekStart.value > fourWeeksAgo;
});

// 是否可以切換到下一週
const canGoToNextWeek = computed(() => {
  if (!currentWeekStart.value) return false;
  const today = new Date();
  const currentWeekStartDate = getWeekStart(today);
  return currentWeekStart.value < currentWeekStartDate;
});

// 格式化日期範圍（YYYY/MM/DD）
const formatDateRange = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}/${month}/${day}`;
};

// 格式化日期為 YYYYMMDD
const formatDateYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}${month}${day}`;
};

// 格式化日期時間為 YYYYMMDDHHmmss
const formatDateTimeYYYYMMDDHHmmss = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

// 篩選後的日誌
const filteredLogs = computed(() => {
  if (!healthLogs.value.length) {
    console.log("沒有健康日誌資料");
    return [];
  }

  const year = selectedYear.value;
  const month =
    availableMonths.value.find((m) => m.label === selectedMonth.value)?.value ||
    1;

  console.log(`篩選條件: ${year}年${month}月`);

  const filtered = healthLogs.value
    .filter((log) => {
      const logDate = new Date(log.date || log.timestamp);
      const logYear = logDate.getFullYear();
      const logMonth = logDate.getMonth() + 1;

      return logYear === year && logMonth === month;
    })
    .sort(
      (a, b) =>
        new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)
    );

  console.log(`篩選結果: ${filtered.length} 筆`);
  return filtered;
});

// 獲取本週的日誌
const getWeekLogs = () => {
  if (!currentWeekStart.value || !healthLogs.value.length) {
    return [];
  }

  const weekStart = new Date(currentWeekStart.value);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = getWeekEnd(weekStart);

  return healthLogs.value.filter((log) => {
    if (!log.date && !log.timestamp) return false;
    
    const logDate = new Date(log.date || log.timestamp);
    return logDate >= weekStart && logDate <= weekEnd;
  });
};

// 獲取週期摘要列表
const fetchWeeklySummaryList = async () => {
  if (!currentWeekStart.value) return;
  
  const startDate = formatDateYYYYMMDD(currentWeekStart.value);
  
  try {
    const response = await fetch(WEEKLY_SUMMARY_LIST_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Key: "qrt897hpmd",
        MID: localobj?.MID || "1",
        StartDate: startDate,
      }),
    });

    if (!response.ok) {
      throw new Error(`API 調用失敗: ${response.status}`);
    }

    const data = await response.json();
    console.log("週期摘要列表:", data);

    if (data.Result === "OK" && data.WeeklySummaryList) {
      weeklySummaryList.value = data.WeeklySummaryList;
    } else {
      weeklySummaryList.value = [];
    }
  } catch (error) {
    console.error("獲取週期摘要列表失敗:", error);
    weeklySummaryList.value = [];
  }
};

// 檢查當週是否已有儲存的摘要
const checkWeekSaved = () => {
  if (!currentWeekStart.value) return;

  const startDate = formatDateYYYYMMDD(currentWeekStart.value);
  
  // 在列表中尋找該週的摘要
  const found = weeklySummaryList.value.find(
    (item) => item.StartDate === startDate
  );

  if (found) {
    isWeekSaved.value = true;
    currentWeekAID.value = found.AID;
    // 如果有已儲存的摘要，使用已儲存的內容
    if (found.AISummary) {
      weeklySummary.value = found.AISummary;
    }
    savedMetaSummary.value = found.MetaSummary || "";
  } else {
    isWeekSaved.value = false;
    currentWeekAID.value = null;
    savedMetaSummary.value = "";
  }
};

// 調用 API 彙整本週摘要
const generateWeeklySummary = async () => {
  if (activeTab.value !== "summary") {
    weeklySummary.value = "";
    return;
  }

  // 先檢查是否已有儲存的摘要
  checkWeekSaved();
  
  // 如果已經有儲存的摘要，不需要重新生成
  if (isWeekSaved.value && weeklySummary.value) {
    isSummaryLoading.value = false;
    return;
  }

  const weekLogs = getWeekLogs();

  if (!weekLogs.length) {
    weeklySummary.value = "";
    return;
  }

  // 收集該週所有有 AI 摘要的內容
  const aiSummaries = weekLogs
    .filter((log) => log.content && log.content.trim())
    .map((log) => {
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
        systemMessage: `你是一位健康管理 app 內的對話式紀錄整理機器人。 任務是根據患者最近七天內的對話內容，整理可閱讀的一週症狀與生活摘要。

你不是醫療人員。 不提供診斷、不解釋原因、不判斷嚴重度、不給建議； 僅整理患者原話，安全、簡單呈現。


語言規則

1. 七天對話 全文英文 → 英文輸出

2. 只要出現任何中文（含繁體）→ 繁體中文輸出

3. 不翻譯、不調整語氣

4. 英文次數格式：mentioned X times this week


核心原則

1. 僅使用患者原文

2. 不補充未出現資訊

3. 不做任何醫療推論

4. 簡短、可快速閱讀

5. 症狀名稱與描述不重複


類型判斷

· 睡眠、情緒、食慾、緊繃 → 症狀

· 人的感受或狀態 → 症狀

· 事件或情境 → 生活


症狀規則

1. 僅整理患者主動提到的不舒服

2. 症狀名稱用患者原話，不合併

3. 語意相近可並列（逗號分隔），次數各自計算

4. 症狀需標示歸類（呈現用）：

o 緊繃 → 身體

o 睡眠相關 → 睡眠

o 喉嚨相關 → 喉嚨

o 其餘 → 可辨識部位

o 無法辨識 → 全身

症狀呈現

· 避免歸類與症狀同詞重複

· 若重複，改為：歸類：狀態

· 僅使用患者原文詞彙 （例：睡眠：不好／喉嚨：疼痛／身體：緊繃）


次數

· 講幾次記幾次，不合併、不去重

· 中文：本週提及 X 次


生活（含藥品）

1. 僅記錄事件，不解釋

2. 同類事件可合併

3. 同句含感受＋事件：

o 感受 → 症狀

o 事件 → 生活

藥品

· 永遠列生活第 1 項

· 依出現順序

· 格式：藥名-數量-頻率（原文）

· 使用方式未變不重複

· 有更改 → 新增一筆＋日期＋「改」


固定輸出格式

中文

這週你提到的狀況有

症狀

症狀名稱：描述 本週提及X次


生活

1 事件描述


我們幫您的身體變化紀錄起來，請您放心。

英文（全文英文時）

This week, you mentioned the following:

Symptoms

Symptom: description, mentioned X times this week

Lifestyle

1. Event description

We've recorded these body changes for you. Please feel at ease.


無資料

· 中文：這週還沒有新的留言唷，請您想到什麼，隨時都可以跟我們說。

· 英文：There were no new messages this week. Feel free to share anything with us anytime.

  `,
        message: `以下是本週（${weekRangeText.value}）的健康日誌內容，共 ${aiSummaries.length} 筆記錄：\n\n${combinedSummary}\n\n請依據以上原始文字，整理成一份「病情&生活紀錄摘要」。\n\n重要：結尾固定說明中，請將「日期範圍」替換為「${weekRangeText.value}」，完整結尾說明應為：\n「以上內容我已幫您完成紀錄並整理（${weekRangeText.value}），後續會提供給醫師了解與參考；請放心，我們會陪著您把狀況清楚整理下來。」`,
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

// 強制更新摘要（重新生成）
const regenerateWeeklySummary = async () => {
  if (isRegenerating.value) return;
  
  const weekLogs = getWeekLogs();

  // 如果本週沒有日誌資料，提示用戶
  if (!weekLogs.length) {
    alert("本週目前沒有健康日誌資料可供生成摘要");
    return;
  }

  // 收集該週所有有 AI 摘要的內容
  const aiSummaries = weekLogs
    .filter((log) => log.content && log.content.trim())
    .map((log) => {
      const dateStr = formatDate(log.date || log.timestamp);
      return {
        date: dateStr,
        content: log.content.trim(),
      };
    });

  if (aiSummaries.length === 0) {
    alert("本週目前沒有 AI 摘要內容可供生成");
    return;
  }

  // 準備要送給 AI 的內容
  const summaryParts = aiSummaries.map(
    (item, index) => `${index + 1}. ${item.date}\n${item.content}`
  );
  const combinedSummary = summaryParts.join("\n\n");

  // 開始重新生成
  isRegenerating.value = true;
  
  try {
    const response = await fetch(TEXT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemMessage: `你是一位健康管理 app 內的對話式紀錄整理機器人。 任務是根據患者最近七天內的對話內容，整理可閱讀的一週症狀與生活摘要。

你不是醫療人員。 不提供診斷、不解釋原因、不判斷嚴重度、不給建議； 僅整理患者原話，安全、簡單呈現。


語言規則

1. 七天對話 全文英文 → 英文輸出

2. 只要出現任何中文（含繁體）→ 繁體中文輸出

3. 不翻譯、不調整語氣

4. 英文次數格式：mentioned X times this week


核心原則

1. 僅使用患者原文

2. 不補充未出現資訊

3. 不做任何醫療推論

4. 簡短、可快速閱讀

5. 症狀名稱與描述不重複


類型判斷

· 睡眠、情緒、食慾、緊繃 → 症狀

· 人的感受或狀態 → 症狀

· 事件或情境 → 生活


症狀規則

1. 僅整理患者主動提到的不舒服

2. 症狀名稱用患者原話，不合併

3. 語意相近可並列（逗號分隔），次數各自計算

4. 症狀需標示歸類（呈現用）：

o 緊繃 → 身體

o 睡眠相關 → 睡眠

o 喉嚨相關 → 喉嚨

o 其餘 → 可辨識部位

o 無法辨識 → 全身

症狀呈現

· 避免歸類與症狀同詞重複

· 若重複，改為：歸類：狀態

· 僅使用患者原文詞彙 （例：睡眠：不好／喉嚨：疼痛／身體：緊繃）


次數

· 講幾次記幾次，不合併、不去重

· 中文：本週提及 X 次


生活（含藥品）

1. 僅記錄事件，不解釋

2. 同類事件可合併

3. 同句含感受＋事件：

o 感受 → 症狀

o 事件 → 生活

藥品

· 永遠列生活第 1 項

· 依出現順序

· 格式：藥名-數量-頻率（原文）

· 使用方式未變不重複

· 有更改 → 新增一筆＋日期＋「改」


固定輸出格式

中文

這週你提到的狀況有

症狀

症狀名稱：描述 本週提及X次


生活

1 事件描述


我們幫您的身體變化紀錄起來，請您放心。

英文（全文英文時）

This week, you mentioned the following:

Symptoms

Symptom: description, mentioned X times this week

Lifestyle

1. Event description

We've recorded these body changes for you. Please feel at ease.


無資料

· 中文：這週還沒有新的留言唷，請您想到什麼，隨時都可以跟我們說。

· 英文：There were no new messages this week. Feel free to share anything with us anytime.

  `,
        message: `以下是本週（${weekRangeText.value}）的健康日誌內容，共 ${aiSummaries.length} 筆記錄：\n\n${combinedSummary}\n\n請依據以上原始文字，整理成一份「病情&生活紀錄摘要」。\n\n重要：結尾固定說明中，請將「日期範圍」替換為「${weekRangeText.value}」，完整結尾說明應為：\n「以上內容我已幫您完成紀錄並整理（${weekRangeText.value}），後續會提供給醫師了解與參考；請放心，我們會陪著您把狀況清楚整理下來。」`,
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
    
    // 重置儲存狀態，讓用戶可以重新儲存
    isWeekSaved.value = false;
    
    // 顯示成功提示
    showSaveSuccess.value = true;
    setTimeout(() => {
      showSaveSuccess.value = false;
    }, 2000);
    
  } catch (error) {
    console.error("更新摘要失敗:", error);
    alert("更新摘要失敗，請稍後再試");
  } finally {
    isRegenerating.value = false;
  }
};

// 開啟補充內容 Modal
const openMetaModal = () => {
  metaSummary.value = savedMetaSummary.value || "";
  showMetaModal.value = true;
};

// 關閉補充內容 Modal
const closeMetaModal = () => {
  showMetaModal.value = false;
  metaSummary.value = "";
};

// 儲存每週摘要到 API
const saveWeeklySummary = async () => {
  if (!weeklySummary.value || isSaving.value) return;

  isSaving.value = true;
  try {
    const now = new Date();
    const startDate = formatDateYYYYMMDD(currentWeekStart.value);
    const aiStime = formatDateTimeYYYYMMDDHHmmss(now);
    const updateTime = formatDateTimeYYYYMMDDHHmmss(now);

    const requestBody = {
      Key: "qrt897hpmd",
      MID: localobj?.MID || "1",
      StartDate: startDate,
      AISummary: weeklySummary.value,
      MetaSummary: metaSummary.value || "",
      AIStime: aiStime,
      Updatetime: updateTime,
    };

    console.log("儲存每週摘要請求:", requestBody);

    const response = await fetch(WEEKLY_SUMMARY_SAVE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API 調用失敗: ${response.status}`);
    }

    const data = await response.json();
    console.log("儲存每週摘要回應:", data);

    if (data.Result === "OK") {
      // 更新狀態
      isWeekSaved.value = true;
      currentWeekAID.value = data.AID;
      savedMetaSummary.value = metaSummary.value;
      
      // 關閉 Modal
      closeMetaModal();
      
      // 重新獲取列表
      await fetchWeeklySummaryList();
      
      // 顯示儲存成功提示
      showSaveSuccess.value = true;
      setTimeout(() => {
        showSaveSuccess.value = false;
      }, 2000);
    } else {
      throw new Error(data.Message || "儲存失敗");
    }
  } catch (error) {
    console.error("儲存每週摘要失敗:", error);
    alert("儲存失敗，請稍後再試");
  } finally {
    isSaving.value = false;
  }
};

// 監聽 activeTab 和 currentWeekStart 變化
watch(
  [() => activeTab.value, () => healthLogs.value.length, () => currentWeekStart.value],
  async () => {
    if (!currentWeekStart.value) {
      initCurrentWeek();
    }
    
    if (activeTab.value === "summary") {
      metaSummary.value = "";
      savedMetaSummary.value = "";
      weeklySummary.value = "";
      isWeekSaved.value = false;
      
      // 先獲取列表再生成摘要
      await fetchWeeklySummaryList();
      await generateWeeklySummary();
    }
  },
  { immediate: true }
);

// 方法
const loadHealthLogs = async () => {
  isLoading.value = true;
  isDataReady.value = false;

  try {
    // 從 API 讀取健康日誌
    const response = await fetch(
      "https://23700999.com:8081/HMA/api/fr/getSoundNote",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MID: localobj?.MID || "1",
          Token: localobj?.Token || "kRwzQVDP8T4XQVcBBF8llJVMOirIxvf7",
          MAID: localobj?.MAID || "mFjpTsOmYmjhzvfDKwdjkzyBGEZwFd4J",
          Mobile: localobj?.Mobile || "0968324056",
          Lang: "zhtw",
          Year: selectedYear.value.toString(),
          Month: selectedMonth.value.replace("月", "").padStart(2, "0"),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`讀取健康日誌 API 失敗: ${response.status}`);
    }

    const data = await response.json();
    console.log("從 API 讀取的資料:", data);

    if (data.Result === "OK" && data.SoundNoteList) {
      healthLogs.value = data.SoundNoteList.map((item, index) => ({
        id: Date.now() + index,
        date: item.CheckTime,
        timestamp: item.CheckTime,
        type: "summary",
        content: item.Note || "", // AI 摘要內容
        preSoundNote: item.PreSoundNote || "", // 口述內容
      }));

      // 根據字數決定這一塊「需不需要展開箭頭」
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
    } else {
      console.log("API 回應無效或無資料");
      healthLogs.value = [];
    }
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

const selectYear = async (year) => {
  selectedYear.value = year;
  showYearPicker.value = false;
  await loadHealthLogs();
};

const selectMonth = async (month) => {
  selectedMonth.value =
    availableMonths.value.find((m) => m.value === month)?.label || "1月";
  showMonthPicker.value = false;
  await loadHealthLogs();
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
};

const isExpandable = (logId, sectionType) => {
  const key = `${logId}-${sectionType}`;
  return !!expandableSections.value[key];
};

// 切換到上一週
const goToPreviousWeek = () => {
  if (!canGoToPreviousWeek.value) return;
  const newWeekStart = new Date(currentWeekStart.value);
  newWeekStart.setDate(newWeekStart.getDate() - 7);
  currentWeekStart.value = newWeekStart;
};

// 切換到下一週
const goToNextWeek = () => {
  if (!canGoToNextWeek.value) return;
  const newWeekStart = new Date(currentWeekStart.value);
  newWeekStart.setDate(newWeekStart.getDate() + 7);
  currentWeekStart.value = newWeekStart;
};

// 生命週期
onMounted(async () => {
  initCurrentWeek();
  await loadHealthLogs();
  await fetchWeeklySummaryList();
});
</script>

<style lang="scss" scoped>
.healthLogWrap {
  @include gradientBg();
  width: 100%;
  min-height: 100vh;
  padding: 16px 0 104px 0;
  position: relative;
  .healthLogContent {
    max-width: 768px;
    margin: 0 auto;
    .titleMenu:deep > div {
      left: 16px;
    }
  }
  .timeline-line {
    background: var(--Secondary-300, #b1c0d8);
    height: 1px;
    width: 100%;
    margin: 1rem 0;
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
    padding: 0.35rem;
    border: none;
    background: #f5f7fa;
    border-radius: 50px;
    color: var(--Primary-default, #74bc1f);
    font-size: var(--Text-font-size-18, 18px);
    font-style: normal;
    font-weight: 400;
    letter-spacing: 2.7px;
    cursor: pointer;
    transition: all 0.2s ease;

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

.filter-section {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1rem 1rem 0;
  margin-bottom: 1rem;

  .filter-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .filter-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    @include neumorphismOuter($radius: 50px, $padding: 10px 12px);
    border: none;
    cursor: pointer;
    color: var(--neutral-500-opacity-70, rgba(102, 102, 102, 0.7));
    text-overflow: ellipsis;
    font-size: var(--Text-font-size-18, 18px);
    font-style: normal;
    font-weight: 400;
    letter-spacing: 2.7px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--Secondary-200, #e2e8f0);
    }

    .filter-icon {
      width: 16px;
      height: 16px;
    }

    .chevron-icon {
      width: 16px;
      height: 16px;
    }
  }
}

.week-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 1rem;
  margin: 0.5rem 0 1rem;

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
    transform: rotate(180deg);

    &.rotated {
      transform: rotate(0deg);
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

  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;

  margin-top: 0.5rem;
  word-break: break-word;
  transition: all 0.3s ease;
}

.section-content.expanded {
  -webkit-line-clamp: unset;
  line-clamp: unset;
  max-height: none;
}

.summary-container {
  padding: 1rem;
  min-height: 60vh;
  display: flex;
  flex-direction: column;

  .summary-card {
    @include neumorphismOuter($radius: 20px);
    padding: 1.5rem;
    background: var(--Neutral-white, #fff);
    flex: 1;

    .summary-title {
      color: var(--Neutral-800, #2d3748);
      font-size: var(--Text-font-size-18, 18px);
      font-weight: 600;
      margin-bottom: 1rem;
    }

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

.saved-meta-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--Secondary-200, #e2e8f0);

  .saved-meta-title {
    color: var(--Neutral-800, #2d3748);
    font-size: var(--Text-font-size-16, 16px);
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .saved-meta-content {
    color: var(--Neutral-600, #718096);
    font-size: var(--Text-font-size-16, 16px);
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.bottom-action {
  padding: 1rem;
  margin-top: auto;

  .action-buttons {
    display: flex;
    gap: 0.75rem;
    width: 100%;
  }

  .update-summary-btn {
    flex: 1;
    padding: 1rem;
    background: var(--Secondary-100, #f5f7fa);
    color: var(--Primary-default, #74bc1f);
    border: 2px solid var(--Primary-default, #74bc1f);
    border-radius: 50px;
    font-size: var(--Text-font-size-18, 18px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: var(--Primary-default, #74bc1f);
      color: #fff;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .add-meta-btn {
    flex: 1;
    padding: 1rem;
    background: var(--Primary-default, #74bc1f);
    color: #fff;
    border: none;
    border-radius: 50px;
    font-size: var(--Text-font-size-18, 18px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #5fa018;
    }
  }
}

// 補充內容 Modal
.meta-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--Secondary-100, #f5f7fa);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.meta-modal {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 768px;
  margin: 0 auto;
  width: 100%;

  .meta-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid var(--Secondary-200, #e2e8f0);

    .back-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;

      .back-arrow {
        width: 20px;
        height: 20px;
        transform: rotate(90deg);
      }
    }

    h3 {
      color: var(--Neutral-800, #2d3748);
      font-size: var(--Text-font-size-18, 18px);
      font-weight: 600;
      margin: 0;
    }

    .header-spacer {
      width: 36px;
    }
  }

  .meta-modal-body {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;

    .meta-textarea {
      width: 100%;
      height: 100%;
      min-height: 300px;
      padding: 1rem;
      border: none;
      border-radius: 12px;
      background: var(--Secondary-50, #fafbfc);
      font-size: var(--Text-font-size-16, 16px);
      line-height: 1.6;
      resize: none;
      font-family: inherit;

      &:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(--Primary-default, #74bc1f);
      }

      &::placeholder {
        color: var(--Secondary-300, #b1c0d8);
      }
    }
  }

  .meta-modal-footer {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-top: 1px solid var(--Secondary-200, #e2e8f0);

    .cancel-btn {
      flex: 1;
      padding: 0.875rem;
      background: var(--Secondary-100, #f5f7fa);
      color: var(--Neutral-600, #718096);
      border: 1px solid var(--Secondary-300, #b1c0d8);
      border-radius: 50px;
      font-size: var(--Text-font-size-16, 16px);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--Secondary-200, #e2e8f0);
      }
    }

    .confirm-btn {
      flex: 1;
      padding: 0.875rem;
      background: var(--Primary-default, #74bc1f);
      color: #fff;
      border: none;
      border-radius: 50px;
      font-size: var(--Text-font-size-16, 16px);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: #5fa018;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}

// Modal 動畫
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}

.save-success-toast {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--Primary-default, #74bc1f);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-size: var(--Text-font-size-16, 16px);
  font-weight: 500;
  z-index: 9999;
  animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  15% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  85% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
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
