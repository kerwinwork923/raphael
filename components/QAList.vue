<template>
    <div class="QAList">
      <!-- 分頁顯示題目 -->
      <div
        class="scoreBarGroupWrap"
        v-for="(QAData, index) in paginatedQuestions"
        :key="QAData.id"
      >
        <div class="scrollBarTitle">
          {{ startIndex + index + 1 }}. {{ QAData.question }}
        </div>
  
        <div class="scoreText">
          <!-- 顯示選到的 answers 字樣 -->
          {{ getLabel(QAData) }}
        </div>
  
        <div class="scoreBarGroup">
          <!-- 已選寬度: QAData.selectScore * 33.33% (0~3) -->
          <div
            class="scoreBar"
            :style="{
              width: QAData.selectScore !== undefined
                ? QAData.selectScore * 33.33 + '%'
                : '0%',
            }"
          ></div>
          <div
            class="remainingBar"
            :style="{
              width: QAData.selectScore !== undefined
                ? (3 - QAData.selectScore) * 33.33 + '%'
                : '100%',
            }"
          ></div>
  
          <div class="numberGroup">
            <div
              v-for="score in [0,1,2,3]"
              :key="score"
              class="number"
              :class="{ selected: QAData.selectScore === score }"
              @click="setScore(QAData, score)"
            >
              {{ score }}
            </div>
          </div>
        </div>
      </div>
  
      <!-- 頁面切換按鈕(可依需求) -->
      <!--
      <div class="pagination">
        <button @click="goPrevPage" :disabled="currentPage === 1">上一頁</button>
        <button @click="goNextPage" :disabled="!canGoNext">下一頁</button>
        <span>{{ currentPage }}/{{ totalPages }}</span>
      </div>
      -->
    </div>
  </template>
  
  <script>
  import { ref, computed, watch } from "vue";
  
  export default {
    name: "QAList",
    props: {
      questions: {
        type: Array,
        default: () => []
      }
    },
    setup(props) {
      const QUESTIONS_PER_PAGE = 7;
      const currentPage = ref(1);
  
      // 計算總頁數
      const totalPages = computed(() => {
        return Math.ceil(props.questions.length / QUESTIONS_PER_PAGE);
      });
  
      // 取得當前頁面的題目（分頁）
      const paginatedQuestions = computed(() => {
        const start = (currentPage.value - 1) * QUESTIONS_PER_PAGE;
        const end = start + QUESTIONS_PER_PAGE;
        return props.questions.slice(start, end);
      });
  
      // 顯示題號用
      const startIndex = computed(() => {
        return (currentPage.value - 1) * QUESTIONS_PER_PAGE;
      });
  
      // 是否可進入下一頁
      const canGoNext = computed(() => {
        return paginatedQuestions.value.every(q => q.selectScore !== undefined);
      });
  
      function setScore(QAData, scoreValue) {
        QAData.selectScore = scoreValue;
        // 若要即時儲存 => 在此呼叫 API
      }
  
      function getLabel(QAData) {
        if (QAData.selectScore === undefined) return "";
        const idx = QAData.selectScore;
        return QAData.answers && QAData.answers[idx] ? QAData.answers[idx] : "";
      }
  
      function goPrevPage() {
        if (currentPage.value > 1) {
          currentPage.value--;
        }
      }
  
      function goNextPage() {
        if (currentPage.value < totalPages.value) {
          currentPage.value++;
        } else {
          // 最後一頁 => 提交 or 結束動作
          console.log("✅ 完成所有題目");
        }
      }
  
      // 若外部的 questions 有變動 => 重置到第一頁
      watch(
        () => props.questions,
        () => {
          currentPage.value = 1;
        }
      );
  
      return {
        currentPage,
        totalPages,
        paginatedQuestions,
        startIndex,
        canGoNext,
        setScore,
        getLabel,
        goPrevPage,
        goNextPage
      };
    }
  };
  </script>
  
  <style lang="scss" scoped>
  .QAList {
    height: calc(100vh - 269px);
    overflow-y: auto;
    /* 這裡可自行加 scrollbar 樣式或其他排版 */
  }
  
  .scoreBarGroupWrap {
    background-color: $raphael-white;
    margin-bottom: 0.75rem;
    padding: 0.75rem;
    border-radius: 12px;
  }
  
  .scrollBarTitle {
    font-size: 20px;
    font-weight: 500;
    color: $raphael-black;
    letter-spacing: 0.15px;
    line-height: 32.36px;
  }
  
  .scoreBarGroup {
    position: relative;
    display: flex;
    align-items: center;
    height: 6px;
    width: 100%;
    margin-bottom: 10px;
  
    .scoreBar {
      height: 100%;
      background-color: $raphael-green-400;
    }
    .remainingBar {
      height: 100%;
      background-color: $raphael-gray-300;
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
      font-size: 0.875rem;
  
      .number {
        background-color: $raphael-gray-300;
        border-radius: 50%;
        color: $raphael-white;
        width: 1.5rem;
        height: 1.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: background-color 0.3s;
  
        &.selected {
          background-color: $raphael-green-400;
        }
      }
    }
  }
  
  .scoreText {
    text-align: center;
    color: $raphael-green-400;
    margin: 0.25rem 0 1rem 0;
  }
  </style>
  