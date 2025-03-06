<template>
  <div class="QAList">
    <!-- 分頁顯示題目，一頁七題 -->
    <div
      v-for="(qItem, idx) in paginatedQuestions"
      :key="qItem.id"
      class="qaItem"
    >
      <p>{{ startIndex + idx + 1 }}. {{ qItem.question }}</p>
      <!-- 下拉選單 (您要"總是->偶爾->很少->...")可依需要定義 -->
      <!-- 這裡示範4個value: 0=總是,1=偶爾,2=很少,3=沒有 -->
      <select v-model="qItem.selectScore" @change="emitUpdate">
        <option disabled value="">請選擇</option>
        <option value="0">總是</option>
        <option value="1">偶爾</option>
        <option value="2">很少</option>
        <option value="3">沒有</option>
      </select>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";

export default {
  name: "QAList",
  emits: ["update"],
  props: {
    questions: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const QUESTIONS_PER_PAGE = 7;
    const currentPage = ref(1);

    // 總頁數
    const totalPages = computed(() => {
      return Math.ceil(props.questions.length / QUESTIONS_PER_PAGE);
    });

    // 當前頁面題目
    const paginatedQuestions = computed(() => {
      const start = (currentPage.value - 1) * QUESTIONS_PER_PAGE;
      const end = start + QUESTIONS_PER_PAGE;
      return props.questions.slice(start, end);
    });

    // 頁面起始題號
    const startIndex = computed(() => {
      return (currentPage.value - 1) * QUESTIONS_PER_PAGE;
    });

    // 檢查當前頁面是否每題都有填
    const canGoNext = computed(() => {
      return paginatedQuestions.value.every((q) => q.selectScore !== "");
    });

    // 通知父層
    function emitUpdate() {
      emit("update");
    }

    // 切到下一頁 (若 needed)
    function goNextPage() {
      // 如果不強制檢查 => 也可自動帶預設
      if (!canGoNext.value) {
        alert("本頁尚有題目未填寫");
        return;
      }
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
        emitUpdate();
      }
    }

    // 當外部 questions 改變 => 重新頁碼
    watch(
      () => props.questions,
      () => {
        currentPage.value = 1;
      }
    );

    return {
      QUESTIONS_PER_PAGE,
      currentPage,
      totalPages,
      paginatedQuestions,
      startIndex,
      canGoNext,

      emitUpdate,
      goNextPage,
    };
  },
};
</script>



<style lang="scss" scoped>
.QAList {
  /* 您的列表容器樣式 */
}

.scoreBarGroupWrap {
  background-color: #fff;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  /* ... 其他樣式可自行調整 */
}

.scrollBarTitle {
  font-size: 20px;
  margin-bottom: 0.5rem;
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
    background-color: #74bc1f; /* 綠色 */
  }
  .remainingBar {
    height: 100%;
    background-color: #ccc; /* 灰色 */
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
      background-color: #ccc; /* 預設灰 */
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
        background-color: #74bc1f; /* 選中後綠色 */
      }
    }
  }
}

.scoreText {
  text-align: center;
  color: #74bc1f;
  margin: 0.25rem 0 1rem 0;
}
</style>
