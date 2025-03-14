<template>
  <div ref="timesListRef" class="tagTimesList">
    <div class="timesList" v-for="(q, index) in timesQuestions" :key="q.id">
      <h4>{{ indexOnThisPage + index + 1 }}. {{ q.question }}</h4>
      <div class="selectWrapper">
        <select
          v-model="q.selectScore"
          :style="{ color: q.selectScore ? '#74bc1f' : '#ccc' }"
        >
          <option value="" disabled hidden>請選擇次數</option>
          <option v-for="opt in scoreOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick } from "vue";

export default {
  name: "TimesSelect",
  props: {
    timesQuestions: {
      type: Array,
      default: () => [],
    },
    indexOnThisPage: {
      type: Number,
      default: 0,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
  },
  setup(props) {
    // 綁定 timesListRef 容器
    const timesListRef = ref(null);

    // 選項
    const scoreOptions = [
      { value: "0", label: "0 次" },
      { value: "1", label: "1 次" },
      { value: "2", label: "2 次" },
      { value: "3", label: "3~4 次" },
      { value: "4", label: ">5 次" },
    ];

    // 滾動回到頂部
    function scrollToTop() {
      nextTick(() => {
        if (timesListRef.value) {
          timesListRef.value.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    // 監聽翻頁變化時滾動到頂部
    watch(() => props.currentPage, () => {
      scrollToTop();
    });

    return {
      timesListRef,
      scoreOptions,
      scrollToTop,
    };
  },
};
</script>


<style scoped lang="scss">
.tagTimesList {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  margin-top: 12px;
  height: calc(100vh - 269px);

  .timesList {
    background-color: #fff;
    border-radius: 12px;
    padding: 0.75rem;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 12px;
  }

  .selectWrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  select {
    background-color: #fff;
    appearance: none;
    cursor: pointer;
    width: 100%;
    height: 2.5rem;
    border: none;
    border-bottom: #1e1e1e 1px solid;
    font-size: 16px;
    padding: 0 8px;
    padding-right: 2rem; /* 為 SVG 或 icon 留出空間 */

    option[value=""][disabled] {
      color: #999;
    }

    &:focus {
      outline: none;
      border-color: #74bc1f;
    }
  }
}
</style>
