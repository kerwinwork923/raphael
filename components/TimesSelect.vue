<template>
    <div class="tagTimesList">
      <h3>次數填寫（0=>4分,1=>3分,2=>2分,3~4=>1分,>5=>0分）</h3>
  
      <div v-for="(page, pageIndex) in pagedQuestions" :key="pageIndex">
        <div class="timesList" v-for="(q, index) in page" :key="q.id">
          <h4>{{ index + 1 + pageIndex * 7 }}. {{ q.question }}</h4>
          <select v-model="q.selectScore">
            <option v-for="(score, idx) in scoreOptions" :key="idx" :value="score.value">
              {{ score.label }}
            </option>
          </select>
        </div>
      </div>
  
      <div class="buttonGroup">
        <button
          class="pageButton"
          :disabled="currentPage === 0"
          @click="prevPage"
        >
          上一頁
        </button>
        <span class="pageIndicator">({{ currentPage + 1 }}/{{ totalPages }})</span>
        <button
          class="pageButton"
          :class="{ disabled: !canGoNext }"
          :disabled="!canGoNext"
          @click="nextPage"
        >
          {{ isLastPage ? "下一步" : "下一頁" }}
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, watch } from "vue";
  
  export default {
    name: "TimesSelect",
    props: {
      childTimesQues: {
        type: Array,
        default: () => [],
      },
    },
    setup(props) {
      const currentPage = ref(0);
  
      const scoreOptions = [
        { value: "0", label: "總是 (0 次) - 4 分" },
        { value: "1", label: "偶爾 (1 次) - 3 分" },
        { value: "2", label: "很少 (2 次) - 2 分" },
        { value: "3~4", label: "3~4 次 - 1 分" },
        { value: ">5", label: "5 次以上 - 0 分" },
      ];
  
      const pagedQuestions = computed(() => {
        const pages = [];
        for (let i = 0; i < props.childTimesQues.length; i += 7) {
          pages.push(props.childTimesQues.slice(i, i + 7));
        }
        return pages;
      });
  
      const totalPages = computed(() => pagedQuestions.value.length);
      const isLastPage = computed(() => currentPage.value === totalPages.value - 1);
  
      const canGoNext = computed(() => {
        return pagedQuestions.value[currentPage.value].every(q => q.selectScore !== undefined && q.selectScore !== "");
      });
  
      function nextPage() {
        if (canGoNext.value && currentPage.value < totalPages.value - 1) {
          currentPage.value++;
        }
      }
  
      function prevPage() {
        if (currentPage.value > 0) {
          currentPage.value--;
        }
      }
  
      // 監聽 `childTimesQues`，當切換寶貝時保留進度
      watch(() => props.childTimesQues, () => {
        currentPage.value = 0;
      });
  
      return {
        currentPage,
        pagedQuestions,
        totalPages,
        scoreOptions,
        canGoNext,
        isLastPage,
        nextPage,
        prevPage,
      };
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .tagTimesList {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  
    h3 {
      font-size: 20px;
      font-weight: 500;
      color: #1e1e1e;
      letter-spacing: 0.15px;
      margin: 0;
      margin-bottom: 0.5rem;
    }
  
    .timesList {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
  
      h4 {
        margin: 0 0 0.5rem 0;
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
  
    .buttonGroup {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 1rem;
    }
  
    .pageButton {
      background-color: #74bc1f;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: 0.2s ease-in-out;
      &:hover {
        background-color: #5a9e1c;
      }
      &.disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
    }
  
    .pageIndicator {
      font-size: 16px;
      color: #333;
    }
  }
  </style>
  