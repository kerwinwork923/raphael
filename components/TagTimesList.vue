<template>
  <div class="tagTimesList">
    <div
      class="timesList"
      v-for="(question, index) in paginatedQuestions"
      :key="question.id"
    >
      <h3>{{ startIndex + index + 1 }}. {{ question.question }}</h3>
      <div class="hashTag">#{{ question.category }}</div>
      <select
        @change="(event) => updateTimes(question.id, event.target.value)"
        class="timesList"
        v-model="question.times"
      >
        <option selected disabled value="">請選擇次數</option>
        <option value="4">0</option>
        <option value="3">1</option>
        <option value="2">2</option>
        <option value="1">3~4</option>
        <option value="0">>5</option>
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
    const questionsPerPage = 7;

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
  background-color: #fff;
  padding: 1rem;
  border-radius: 12px;

  .timesList {
    margin-bottom: 0.25rem;
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
    appearance: none;
    cursor: pointer;
    width: 100%;
    height: 2.5rem;
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    background-color: #fff;
    font-size: 16px;
    color: #333;
    margin-top: 0.25rem;

    &:focus {
      outline: none;
    }
  }
}
</style>
