<template>
  <div class="usage-record-section">
    <!-- 標題和篩選器 -->
    <div class="section-header">
      <h3 class="section-title">使用紀錄</h3>
      <div class="filter-bar">
        <!-- 產品篩選下拉選單 -->
        <div class="filter-item" @click="toggleProductFilter">
          <img src="/assets/imgs/usage/filter-icon.svg" alt="篩選圖示" />
          <span>{{ selectedProduct }}</span>
          <img
            class="arrow"
            :class="{ rotated: showProductDropdown }"
            src="/assets/imgs/usage/chevron-down.svg"
            alt="下拉箭頭"
          />

          <div class="dropdown" v-if="showProductDropdown" @click.stop>
            <div
              v-for="option in productOptions"
              :key="option"
              class="dropdown-item"
              :class="{ selected: selectedProduct === option }"
              @click="selectProduct(option, $event)"
            >
              {{ option }}
            </div>
          </div>
        </div>

        <!-- 年份篩選下拉選單 -->
        <div class="filter-item" @click="toggleYearFilter">
          <img src="/assets/imgs/usage/filter-icon.svg" alt="篩選圖示" />
          <span>{{ selectedYear }}</span>
          <img
            class="arrow"
            :class="{ rotated: showYearDropdown }"
            src="/assets/imgs/usage/chevron-down.svg"
            alt="下拉箭頭"
          />

          <div class="dropdown" v-if="showYearDropdown" @click.stop>
            <div
              v-for="option in yearOptions"
              :key="option"
              class="dropdown-item"
              :class="{ selected: selectedYear === option }"
              @click="selectYear(option, $event)"
            >
              {{ option }}
            </div>
          </div>
        </div>

        <!-- 月份篩選下拉選單 -->
        <div class="filter-item" @click="toggleMonthFilter">
          <img src="/assets/imgs/usage/filter-icon.svg" alt="篩選圖示" />
          <span>{{ selectedMonth }}</span>
          <img
            class="arrow"
            :class="{ rotated: showMonthDropdown }"
            src="/assets/imgs/usage/chevron-down.svg"
            alt="下拉箭頭"
          />

          <div class="dropdown" v-if="showMonthDropdown" @click.stop>
            <div
              v-for="option in monthOptions"
              :key="option"
              class="dropdown-item"
              :class="{ selected: selectedMonth === option }"
              @click="selectMonth(option, $event)"
            >
              {{ option }}
            </div>
          </div>
        </div>
      </div>
      <div class="total-count">總共{{ totalRecords }}筆</div>
    </div>

    <!-- 加載狀態 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在載入使用紀錄...</div>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="error-state">
      <div class="error-text">載入失敗: {{ error }}</div>
      <button @click="fetchUsageRecords" class="retry-button">重試</button>
    </div>

    <!-- 使用紀錄列表 -->
    <div class="record-list" v-else-if="filteredRecords.length > 0">
      <div
        v-for="record in filteredRecords"
        :key="record.id"
        class="record-item"
      >
        <div class="left">
          <div class="record-date">{{ record.date }}</div>
          <div class="product-name">{{ record.productName }}</div>
        </div>

        <div class="right">
          <div class="column">
            <div class="label-start">開始時間</div>
            <div class="start-time">{{ record.startTime }}</div>
          </div>
          <div class="column">
            <div class="label-duration">總共使用</div>
            <div class="duration">{{ record.duration }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 無資料狀態 -->
    <div class="no-data-state" v-else>
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useUsageRecords } from "~/composables/useUsageRecords";

const {
  loading,
  error,
  usageRecords,
  filteredRecords,
  selectedProduct,
  selectedYear,
  selectedMonth,
  productOptions,
  yearOptions,
  monthOptions,
  totalRecords,
  todayWearTime,
  continuousDays,
  fetchUsageRecords,
  applyFilters,
} = useUsageRecords();

// 下拉選單狀態
const showProductDropdown = ref(false);
const showYearDropdown = ref(false);
const showMonthDropdown = ref(false);

// 切換下拉選單
const toggleProductFilter = (event) => {
  event.stopPropagation();
  showProductDropdown.value = !showProductDropdown.value;
  showYearDropdown.value = false;
  showMonthDropdown.value = false;
};

const toggleYearFilter = (event) => {
  event.stopPropagation();
  showYearDropdown.value = !showYearDropdown.value;
  showProductDropdown.value = false;
  showMonthDropdown.value = false;
};

const toggleMonthFilter = (event) => {
  event.stopPropagation();
  showMonthDropdown.value = !showMonthDropdown.value;
  showProductDropdown.value = false;
  showYearDropdown.value = false;
};

// 選擇篩選選項
const selectProduct = (option, event) => {
  event.stopPropagation();
  selectedProduct.value = option;
  showProductDropdown.value = false;
};

const selectYear = (option, event) => {
  event.stopPropagation();
  selectedYear.value = option;
  showYearDropdown.value = false;
};

const selectMonth = (option, event) => {
  event.stopPropagation();
  selectedMonth.value = option;
  showMonthDropdown.value = false;
};

// 監聽篩選變化
watch([selectedProduct, selectedYear, selectedMonth], () => {
  applyFilters();
});

// 點擊外部關閉下拉選單
const handleClickOutside = (event) => {
  const target = event.target;
  if (!target.closest(".filter-item") && !target.closest(".dropdown")) {
    showProductDropdown.value = false;
    showYearDropdown.value = false;
    showMonthDropdown.value = false;
  }
};

// 組件掛載時獲取數據
onMounted(async () => {
  // 在 client 端觸發 API
  await fetchUsageRecords();
  document.addEventListener("click", handleClickOutside);
});

// 組件卸載時清理事件監聽器
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style lang="scss" scoped>
.usage-record-section {
  .section-header {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px 0;
    position: sticky;
    top: 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(4px);

    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: $raphael-black;
      margin: 0;
    }

    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;

      .filter-item {
        @include neumorphismOuter($radius: 50px, $padding: 10px 12px);
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        color: var(--neutral-500-opacity-70, rgba(102, 102, 102, 0.7));
        text-overflow: ellipsis;
        font-size: 18px;
        font-weight: 400;
        letter-spacing: 2.7px;
        position: relative;

        img {
          width: 12px;
          height: 12px;
        }
        .arrow {
          margin-left: auto;
          transition: transform 0.3s ease;

          &.rotated {
            transform: rotate(180deg);
          }
        }

        &:nth-of-type(1) {
          flex: 1 1 100%;
        }
        &:nth-of-type(2),
        &:nth-of-type(3) {
          flex: 1 1 calc(50% - 8px);
          max-width: calc(50% - 8px);
        }

        .dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #e0e0e0;

          .dropdown-item {
            padding: 12px 16px;
            cursor: pointer;
            font-size: 14px;
            color: #333;
            border-bottom: 1px solid #f0f0f0;
            transition: background-color 0.2s ease;

            &:last-child {
              border-bottom: none;
            }

            &:hover {
              background-color: #f5f7fa;
            }

            &.selected {
              background-color: #74bc1f;
              color: white;
            }
          }
        }
      }
    }

    .total-count {
      color: #b1c0d8;
      font-size: 16px;
      text-align: right;
    }
  }

  .record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .record-item {
    border-radius: 20px;
    background: #f5f7fa;
    box-shadow: 2px 4px 12px rgba(177, 192, 216, 0.7);
    padding: 1rem;


 display: flex;
 justify-content: space-between;

    align-items: flex-start;

    /* 左邊：日期 + 產品名稱 */
    .left {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      .record-date {
        font-size: 14px;
        color: #b1c0d8;
        font-weight: 500;
      }

      .product-name {
        font-size: 20px;
        font-weight: 700;
        color: #1e1e1e;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    /* 右邊：開始時間 / 總共使用 */
    .right {
      min-width: 0;
      display: flex;
      justify-content: space-between;
      width: 180px;
      gap: 1rem;

      .column {
     
        display: flex;
        flex-direction: column;
        gap: 4px;
      

     
        .label-start,
        .label-duration {
          font-size: 14px;
          color: #b1c0d8;
          font-weight: 500;
          text-align: right;
          white-space: nowrap;
        }

        .start-time,
        .duration {
          font-size: 20px;
          font-weight: 700;
          color: #1e1e1e;
          text-align: right;
          white-space: nowrap;
        }
      }
    }
  }
}


  .no-data-state {
    text-align: center;

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
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #74bc1f;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    .loading-text {
      font-size: 16px;
      color: #74bc1f;
      font-weight: 500;
    }
  }

  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;

    .error-text {
      font-size: 16px;
      color: #ff6b6b;
      font-weight: 500;
      margin-bottom: 16px;
    }

    .retry-button {
      background: #74bc1f;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background: #5a9a1a;
      }
    }
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

@media (max-width: 360px) {
  .record-list .record-item {
    grid-template-columns: 1fr; // 上下排
    row-gap: 8px;

    .right {
      justify-items: start;
    }
  }
}
</style>
