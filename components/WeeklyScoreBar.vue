<template>
  <div
    class="scoreBarGroupWrap"
    v-for="(QAData, index) in paginatedQuestions"
    :key="QAData.question"
  >
    <div class="scrollBarTitle">
      {{ startIndex + index + 1 }}. {{ QAData.question }}
    </div>
    <div class="hashTag">#{{ QAData.category }}</div>
    <div class="scoreBarGroup">
      <div
        class="scoreBar"
        :style="{
          width: `${(QAData.score - 1) * 33.33}%`, // 分数为 1 时为 0%，2 为 33.33%，3 为 66.67%，4 为 100%
          backgroundColor: '#74bc1f',
        }"
      ></div>
      <div
        class="remainingBar"
        :style="{
          width: `${(4 - QAData.score) * 33.33}%`, // 剩余部分的宽度
          backgroundColor: '#b3b3b3',
        }"
      ></div>
      <div class="numberGroup">
        <!-- 顯示 1 到 4 的分數按鈕 -->
        <div
          v-for="value in 4"
          :key="value"
          class="number"
          :class="{ selected: QAData.score >= value }"
          @click="setScore(QAData, value)"
        >
          {{ value }}
        </div>
      </div>
    </div>
    <!-- 顯示根據選擇分數對應的 label -->
    <div class="scoreText">{{ getLabel(QAData.score) }}</div>
    
  </div>

  <button @click="store.API_ANSOnlineQSaveAns">測試按鈕</button>
</template>

<script>
import { defineComponent, computed } from "vue";
import { useWeeklyRecord } from "~/stores/weeklyQA.js";

export default defineComponent({
  setup() {
    const store = useWeeklyRecord();
    store.getQues();

    const currentPage = computed(() => store.currentStep); // 當前頁數
    const questionsPerPage = 7; // 每頁顯示 7 個問題

    // 計算當前頁面顯示的問題
    const paginatedQuestions = computed(() => {
      const start = (currentPage.value - 1) * questionsPerPage;
      const end = currentPage.value * questionsPerPage;
      return store.weeklyQA.slice(start, end);
    });

    const startIndex = computed(
      () => (currentPage.value - 1) * questionsPerPage
    );

    const setScore = (QAData, scoreValue) => {
      const index = store.weeklyQA.indexOf(QAData);
      if (index !== -1) {
        store.weeklyQA[index] = {
          ...store.weeklyQA[index],
          score: scoreValue,
        };
        QAData.score = scoreValue;
        console.log(`Updated score for question ${index + 1}: ${QAData.score}`);
      }
    };

    const getLabel = (score) => {
      const labels = ["無", "輕度", "中度", "嚴重"];
      return labels[score - 1];
    };

    // 分頁相關的邏輯
    const totalPages = computed(() =>
      Math.ceil(store.weeklyQA.length / questionsPerPage)
    );

    return {
      store,
      setScore,
      getLabel,
      paginatedQuestions,
      currentPage,
      totalPages,
      startIndex,
    };
  },
});
</script>

<style scoped lang="scss">
.scoreBarGroupWrap {
  background-color: #fff;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
}

.hashTag {
  margin-top: 0.75rem;
  color: #666;
  font-size: 14px;
  letter-spacing: 0.1px;
}

.scrollBarTitle {
  font-size: 20px;
  color: #1e1e1e;
  font-weight: bold;
  letter-spacing: 0.15px;
}

.scoreBarGroup {
  position: relative;
  margin: 1.5rem 0;
  display: flex;
  align-items: center;
  height: 6px;
  width: 100%;

  .scoreBar {
    height: 100%;
    background-color: #74bc1f; // 绿色
  }
  .remainingBar {
    height: 100%;
    background-color: #b3b3b3; // 灰色
  }

  .numberGroup {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    justify-content: space-between;
    align-items: center;

    .number {
      background-color: #b3b3b3; // 按钮的灰色背景
      border-radius: 50%;
      color: #fff;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: background-color 0.3s;

      &.selected {
        background-color: #74bc1f; // 选中时的绿色背景
      }
    }
  }
}

.scoreText {
  text-align: center;
  color: #74bc1f; // 文字颜色
  margin-top: 0.5rem;
}

.pagination {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  button {
    padding: 0.5rem 1rem;
    background-color: #74bc1f; // 按钮背景色
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    &:disabled {
      background-color: #b3b3b3; // 禁用状态的颜色
      cursor: not-allowed;
    }
  }
}
</style>
