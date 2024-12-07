<template>
  <div class="QAList" ref="qaList">
    <div
      class="scoreBarGroupWrap"
      v-for="(QAData, index) in paginatedQuestions"
      :key="QAData.question"
    >
      <div class="scrollBarTitle">
        {{ startIndex + index + 1 }}. {{ QAData.question }}
      </div>
      <div class="scoreText">{{ getLabel(QAData.selectScore) }}</div>
      <div class="scoreBarGroup">
        <div
          class="scoreBar"
          :style="{
            width:
              QAData.selectScore !== undefined
                ? `${QAData.selectScore * 33.33}%`
                : '0%',
            backgroundColor: '#74bc1f',
          }"
        ></div>
        <div
          class="remainingBar"
          :style="{
            width:
              QAData.selectScore !== undefined
                ? `${(3 - QAData.selectScore) * 33.33}%`
                : '100%',
            backgroundColor: '#b3b3b3',
          }"
        ></div>
        <div class="numberGroup">
          <div
            v-for="value in 4"
            :key="value"
            class="number"
            :class="{ selected: QAData.selectScore >= value - 1 }"
            @click="setScore(QAData, value - 1)"
          >
            {{ value - 1 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, watch, onMounted, ref } from "vue";
import { useWeeklyRecord } from "~/stores/weeklyQA.js";

export default defineComponent({
  setup() {
    const store = useWeeklyRecord();
    const qaList = ref(null);

    const currentPage = computed(() => store.currentStep);
    const questionsPerPage = 7;

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
          selectScore: scoreValue,
          score: scoreValue,
        };
      }
    };

    const getLabel = (score) => {
      const labels = ["無", "輕微", "中等", "嚴重"];
      return labels[score] || "";
    };

    const scrollToTop = () => {
      if (qaList.value) {
    
        qaList.value.scrollTop = 0;


        const rect = qaList.value.getBoundingClientRect();
        const offsetTop = rect.top + window.scrollY;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    };

    watch(currentPage, () => {
      scrollToTop(); // 當頁面切換時觸發滾動
    });

    onMounted(() => {
      scrollToTop(); // 初始化時滾動到頂部
    });

    return {
      store,
      setScore,
      getLabel,
      paginatedQuestions,
      currentPage,
      startIndex,
      qaList,
    };
  },
});
</script>

<style lang="scss" scoped>
.QAList {
  height: calc(100vh - 293px);
  overflow-y: auto;
}
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
  font-weight: 500;
  color: #1e1e1e;
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
    background-color: #74bc1f;
  }
  .remainingBar {
    height: 100%;
    background-color: #b3b3b3;
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
      background-color: #b3b3b3;
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
        background-color: #74bc1f;
      }
    }
  }
}

.scoreText {
  text-align: center;
  color: #74bc1f;
  margin: 0.25rem 0 1rem 0;
}

.pagination {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  button {
    padding: 0.5rem 1rem;
    background-color: #74bc1f;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    &:disabled {
      background-color: #b3b3b3;
      cursor: not-allowed;
    }
  }
}
</style>
