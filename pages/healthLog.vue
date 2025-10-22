<template>
  <div class="healthLogWrap">
    <TitleMenu Text="健康日誌" positionType="absolute" link="/robot" />

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
        <button class="filter-btn" @click="showMonthPicker = !showMonthPicker">
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
    <div class="total-count">總共 {{ filteredLogs.length }} 筆</div>

    <!-- 日誌列表 -->
    <div class="log-list" v-if="filteredLogs.length > 0">
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
              log.content.length > 20
                ? log.content.substring(0, 20) + "..."
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
          <button @click="showMonthPicker = false" class="close-btn">×</button>
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
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import TitleMenu from "~/components/TitleMenu.vue";
import BottomNav from "~/components/BottomNav.vue";

// 響應式數據
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(`${new Date().getMonth() + 1}月`);
const showYearPicker = ref(false);
const showMonthPicker = ref(false);
const expandedItems = ref([]);
const healthLogs = ref([]);

// 可用年份和月份
const availableYears = computed(() => {
  const startYear = 2025
  const currentYear = new Date().getFullYear()
  return Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  ).reverse() // 若要最新年份排最上面
})


const availableMonths = computed(() => {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const isCurrentYear = selectedYear.value === currentYear

  const maxMonth = isCurrentYear ? currentMonth : 12

  return Array.from({ length: maxMonth }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}月`
  }))
})


// 篩選後的日誌
const filteredLogs = computed(() => {
  if (!healthLogs.value.length) {
    console.log("沒有健康日誌資料");
    return [];
  }

  const year = selectedYear.value;
  const month =
  availableMonths.value.find((m) => m.label === selectedMonth.value)?.value || 1;


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
const loadHealthLogs = () => {
  try {
    const stored = localStorage.getItem("healthLog");
    console.log("從 localStorage 讀取的資料:", stored);

    if (stored) {
      healthLogs.value = JSON.parse(stored);
      console.log("解析後的健康日誌:", healthLogs.value);
      console.log("健康日誌總數:", healthLogs.value.length);

      // 檢查資料格式
      if (healthLogs.value.length > 0) {
        console.log("第一筆資料格式:", healthLogs.value[0]);
        console.log("第一筆資料的 date:", healthLogs.value[0].date);
        console.log("第一筆資料的 timestamp:", healthLogs.value[0].timestamp);
      }
    } else {
      console.log("localStorage 中沒有健康日誌資料");
      healthLogs.value = [];
    }
  } catch (error) {
    console.error("載入健康日誌失敗:", error);
    healthLogs.value = [];
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

const selectYear = (year) => {
  selectedYear.value = year;
  showYearPicker.value = false;
};

const selectMonth = (month) => {
  selectedMonth.value =
    availableMonths.value.find((m) => m.value === month)?.label || "1月";
  showMonthPicker.value = false;
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
onMounted(() => {
  loadHealthLogs();
});
</script>

<style lang="scss" scoped>
.healthLogWrap {
  @include gradientBg();
  width: 100%;
  min-height: 100vh;
  padding: 16px 0 104px 0;
  position: relative;
}

.filter-section {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 3rem 1rem 0;
  margin-bottom: 1rem;

  .filter-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .filter-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;

    border-radius: var(--Radius-r-50, 50px);
    background: var(--Secondary-100, #f5f7fa);
    box-shadow: 2px 4px 12px 0
      var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
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
    padding: 10px 12px !important;
    @include neumorphismOuter(
      $bgColor: var(--Secondary-100, #f5f7fa),
      $radius: 20px,
      $x: 2px,
      $y: 2px,
      $blur: 4px
    );

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

.log-list {
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.log-item {
  background: var(--Neutral-white, #fff);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  @include neumorphismOuter(
    $bgColor: var(--Neutral-white, #fff),
    $radius: 12px,
    $x: 0,
    $y: 2px,
    $blur: 8px
  );

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
    margin-bottom: 0.5rem;
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
  padding: 2rem;
  width: 100%;
  max-width: 100%;
}

.empty-card {
  background: var(--Neutral-white, #fff);
  border-radius: 20px;
  padding: 3rem 2rem;

  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  text-align: center;
  @include neumorphismOuter(
    $bgColor: var(--Neutral-white, #ffffff),
    $radius: 20px,
    $x: 0,
    $y: 4px,
    $blur: 12px
  );

  .empty-character {
    margin-bottom: 1.5rem;

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
      background: #74BC1F;
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
