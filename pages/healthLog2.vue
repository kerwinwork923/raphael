<template>
  <div class="healthLogWrap">
    <div class="healthLogContent">
      <TitleMenu Text="健康日誌" positionType="sticky" link="/robotdemo" />
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
        <div
          class="log-item"
          v-for="log in filteredLogs"
          :key="log.id"
          :class="{ expanded: expandedItems.includes(log.id) }"
        >
          <div class="log-header" @click="toggleExpand(log.id)">
            <div class="log-date">
              {{ formatDate(log.date || log.timestamp) }}
            </div>
            <div class="log-preview" v-if="!expandedItems.includes(log.id)">
              {{
                log.content.length > 30
                  ? log.content.substring(0, 30) + "..."
                  : log.content
              }}
            </div>
            <div class="log-content" v-else>
              {{ log.content }}
            </div>
            <img
              src="/assets/imgs/arrowDown2.svg"
              alt="展開/收合"
              class="expand-icon"
              :class="{ rotated: expandedItems.includes(log.id) }"
            />
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
const expandedItems = ref([]);
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
    // 從 localStorage 讀取健康日誌
    const storageKey = "robotDemo_healthLogs";
    const existingData = localStorage.getItem(storageKey);
    const allLogs = existingData ? JSON.parse(existingData) : [];

    console.log("從 localStorage 讀取的資料:", allLogs);

    // 篩選指定年份和月份的日誌
    const year = selectedYear.value;
    const month =
      availableMonths.value.find((m) => m.label === selectedMonth.value)?.value ||
      1;

    const filteredLogs = allLogs
      .filter((log) => {
        const logDate = new Date(log.date || log.timestamp);
        const logYear = logDate.getFullYear();
        const logMonth = logDate.getMonth() + 1;
        return logYear === year && logMonth === month;
      })
      .map((item, index) => ({
        id: item.id || Date.now() + index,
        date: item.date || item.timestamp,
        timestamp: item.timestamp || item.date,
        type: item.type || "summary",
        content: item.content || item.Note || "",
      }))
      .sort(
        (a, b) =>
          new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)
      );

    healthLogs.value = filteredLogs;

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

const toggleExpand = (logId) => {
  const index = expandedItems.value.indexOf(logId);
  if (index > -1) {
    expandedItems.value.splice(index, 1);
  } else {
    expandedItems.value.push(logId);
  }
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
  max-height: calc(70vh - 32px); /* 設定最大高度 */
  overflow-y: auto; /* 開啟垂直滾動 */
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
}

.log-item {
  @include neumorphismOuter($radius: 20px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.expanded {
    .log-content {
      display: block;
    }
    .log-preview {
      display: none;
    }
  }

  .log-header {
    cursor: pointer;
    position: relative;
  }

  .log-date {
    color: var(--Neutral-black, #1e1e1e);
    font-size: var(--Text-font-size-20, 20px);
    font-style: normal;
    font-weight: 500;
    letter-spacing: 0.1px;
    margin-bottom: 0.5rem;
  }

  .log-preview {
    color: var(--Neutral-500, #666);
    font-size: var(--Text-font-size-18, 18px);
    font-style: normal;
    font-weight: 400;
    line-height: 120%;
    letter-spacing: 0.072px;
  }

  .log-content {
    color: var(--Neutral-500, #666);
    font-size: var(--Text-font-size-18, 18px);
    font-style: normal;
    font-weight: 400;
    line-height: 120%;
    letter-spacing: 0.072px;
    margin-bottom: 0.5rem;
  }

  .expand-icon {
    position: absolute;
    top: 0;
    right: 0;
    width: 16px;
    height: 16px;
    transition: transform 0.3s ease;

    &.rotated {
      transform: rotate(180deg);
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
