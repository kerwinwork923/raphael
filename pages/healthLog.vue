<template>
  <div class="healthLogWrap">
    <div class="healthLogContent">
      <TitleMenu Text="健康日誌" positionType="sticky" link="/robot" />
      <!-- 篩選器區域 -->
      <div class="filter-section">
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
      <div class="total-count" v-if="isDataReady">
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
      <div class="log-list" v-else-if="isDataReady && filteredLogs.length > 0">
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

      <!-- 空狀態 -->
      <div
        class="empty-state"
        v-else-if="isDataReady && filteredLogs.length === 0"
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

      <!-- 底部導航 -->
      <BottomNav />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import TitleMenu from "~/components/TitleMenu.vue";
import BottomNav from "~/components/BottomNav.vue";

// 響應式數據
const localData = localStorage.getItem("userData");
const localobj = localData ? JSON.parse(localData) : null;

const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(`${new Date().getMonth() + 1}月`);
const showYearPicker = ref(false);
const showMonthPicker = ref(false);
const expandedSections = ref({}); // 已有
const expandableSections = ref({}); // ✅ 新增：是否需要展開（要不要顯示箭頭）
const healthLogs = ref([]);

// 載入狀態管理
const isLoading = ref(true);
const isDataReady = ref(false);

// 可用年份和月份
const availableYears = computed(() => {
  const startYear = 2025;
  const currentYear = new Date().getFullYear();
  return Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  ).reverse(); // 若要最新年份排最上面
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
      // 使用 log.date 或 log.timestamp 作為日期來源
      const logDate = new Date(log.date || log.timestamp);
      const logYear = logDate.getFullYear();
      const logMonth = logDate.getMonth() + 1;

      console.log(
        `檢查日誌: ${logDate.toISOString()}, 年份: ${logYear}, 月份: ${logMonth}`
      );

      return logYear === year && logMonth === month;
    })
    .sort(
      (a, b) =>
        new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)
    );

  console.log(`篩選結果: ${filtered.length} 筆`);
  return filtered;
});

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

      // ✅ 根據字數決定這一塊「需不需要展開箭頭」
      const MAX_PREVIEW_CHARS = 50; // 你可以自己調整，代表大約兩行以內

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
  // 重新載入資料
  await loadHealthLogs();
};

const selectMonth = async (month) => {
  selectedMonth.value =
    availableMonths.value.find((m) => m.value === month)?.label || "1月";
  showMonthPicker.value = false;
  // 重新載入資料
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

// 生命週期
onMounted(async () => {
  await loadHealthLogs();
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
  margin-bottom: .75rem;
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
  overflow: hidden;

  margin-top: 0.5rem;
  word-break: break-word;
  transition: all 0.3s ease;
}

.section-content.expanded {
  // ✅ 展開時取消行數限制
  -webkit-line-clamp: unset;
  max-height: none; // 保險用，可加可不加
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
