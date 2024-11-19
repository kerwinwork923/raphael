<template>
  <div class="tagTimesList">
    <div
      class="timesList"
      v-for="(question, index) in paginatedQuestions"
      :key="question.id"
    >
      <h3>{{ startIndex + index + 1 }}. {{ question.question }}</h3>
      <!-- <div class="hashTag">#{{ question.category }}</div> -->
      <select
        @change="(event) => updateTimes(question.id, event.target.value)"
        class="timesList"
        v-model="question.times"
      >
        <!-- <option selected disabled value="-1">請選擇次數</option> -->
        <option value="-1">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3~4</option>
        <option value="6">>5</option>
      </select>
    </div>
  </div>

  <!-- <button @click="store.API_ANSOnlineTimesSaveTimes">Test</button> -->
</template>

<script>
import { computed } from "vue";
import { useWeeklyRecord } from "@/stores/weeklyQA";

export default {
  setup() {
    const store = useWeeklyRecord();

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

    return {
      paginatedQuestions,
      updateTimes,
      startIndex,
      store,
    };
  },
};
</script>

<style lang="scss">
.tagTimesList {
  display: grid;
  gap: 0.75rem;
  height: calc(100vh - 290px);
  overflow-y: auto;

  &>.timesList {
    background-color: #fff;
    border-radius: 12px;
    padding: 0.375rem 0.75rem;
  }

  h3 {
    font-size: 20px;
    font-weight: 400;
    color: #1e1e1e;
    letter-spacing: 0.15px;
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
