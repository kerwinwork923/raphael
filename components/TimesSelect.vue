<template>
  <div class="tagTimesList">
    <div class="timesList" v-for="(q, index) in timesQuestions" :key="q.id">
      <h4>{{ indexOnThisPage + index + 1 }}. {{ q.question }}</h4>
      <div class="selectWrapper">
        <select
          v-model="q.selectScore"
          :style="{ color: q.selectScore ? '#74bc1f' : '#ccc' }"
        >
          <!-- 預設不選時用 disabled/hidden -->
          <option value="" disabled hidden>請選擇次數</option>
          <option
            v-for="opt in scoreOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TimesSelect",
  props: {
    timesQuestions: {
      type: Array,
      default: () => [],
    },
    // 父層傳入的這頁起始索引用來顯示題號
    indexOnThisPage: {
      type: Number,
      default: 0,
    },
  },
  setup() {
    // 舉例：後端可能想收 0,1,2,3,4
    // label 只是給使用者看；value 才是送後端的資料
    const scoreOptions = [
      { value: "0", label: "0 次" },
      { value: "1", label: "1 次" },
      { value: "2", label: "2 次" },
      { value: "3", label: "3~4 次" },
      { value: "4", label: ">5 次" },
    ];
    return {
      scoreOptions,
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
