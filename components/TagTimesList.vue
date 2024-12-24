<template>
  <div class="tagTimesList" ref="tagTimesList">
    <div
      class="timesList"
      v-for="(question, index) in paginatedQuestions"
      :key="question.id"
    >
      <h3>{{ startIndex + index + 1 }}. {{ question.question }}</h3>
      <select
        @change="(event) => updateTimes(question.id, event.target.value)"
        class="timesList"
        v-model="question.times"
      >
        <option value="-1">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3~4</option>
        <option value="6">>5</option>
      </select>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch, onMounted } from "vue";
import { useWeeklyRecord } from "@/stores/weeklyQA";

export default {
  setup() {
    const store = useWeeklyRecord();
    const tagTimesList = ref(null); // 定義 tagTimesList

    const currentPage = computed(() => store.timesStep);
    const questionsPerPage = store.selectQuestionPerPage;

    const paginatedQuestions = computed(() => {
      const start = (currentPage.value - 1) * questionsPerPage;
      const end = currentPage.value * questionsPerPage;
      return store.sortedByScore.slice(start, end);
    });

    const startIndex = computed(
      () => (currentPage.value - 1) * questionsPerPage
    );

    const updateTimes = (id, times) => {
      const question = store.weeklyQA.find((q) => q.id === id);
      if (question) {
        question.times = Number(times);
      }
    };

    const scrollToTop = () => {
      if (tagTimesList.value) {
        tagTimesList.value.scrollTop = 0; // 滾動到頂部
      }
    };

    watch(currentPage, () => {
      scrollToTop(); // 當頁面切換時觸發滾動
    });

    onMounted(() => {
      scrollToTop(); // 組件掛載後觸發滾動
    });

    return {
      paginatedQuestions,
      updateTimes,
      startIndex,
      tagTimesList, // 將 tagTimesList 返回
    };
  },
};
</script>

<style lang="scss" scoped>
.tagTimesList {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: calc(100vh - 269px);
  overflow-y: auto;
  @include scrollbarStyle();

  & > .timesList {
    background-color: #fff;
    border-radius: 12px;
    padding: 0.75rem;
  }

  h3 {
    font-size: 20px;
    font-weight: 500;
    color: #1e1e1e;
    letter-spacing: 0.15px;
    line-height: 32.36px;
  }

  .hashTag {
    color: #666;
    font-size: 14px;
    letter-spacing: 0.1px;
    margin-top: 0.5rem;
  }

  select {
    background-color: #fff;
    appearance: none;
    cursor: pointer;
    width: 100%;
    height: 2.5rem;
    border: none;
    border-bottom: 1px solid #eeeeee;
    font-size: 16px;
    color: #74bc1f;
    padding: 0 8px;

    &:focus {
      outline: none;
    }
  }
}
</style>
