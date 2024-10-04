<template>
  <div
    class="scoreBarGroupWrap"
    v-for="(QAData, index) in store.weeklyQA"
    :key="index"
  >
    <div class="scrollBarTitle">{{ index + 1 }}. {{ QAData.question }}</div>
    <div class="hashTag">#{{ QAData.category }}</div>
    <div class="scoreBarGroup">
      <div
        class="scoreBar"
        :style="{
          width: `${(QAData.score - 1) * 25}%`,
          backgroundColor: '#74bc1f',
        }"
      ></div>
      <div
        class="remainingBar"
        :style="{
          width: `${(4 - (QAData.score - 1)) * 25}%`,
          backgroundColor: '#b3b3b3',
        }"
      ></div>

      <div class="numberGroup">
        <!-- 顯示 0 到 4 的分數按鈕 -->
        <div
          v-for="value in 5"
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
</template>

<script>
import { defineComponent } from "vue";
import { useWeeklyRecord } from "~/stores/weeklyQA.js";

export default defineComponent({
  setup() {
    const store = useWeeklyRecord();
    store.getQues();

    // 設置分數的選擇
    const setScore = (QAData, scoreValue) => {
      QAData.score = scoreValue; // 更新該問題的分數
    };

    // 根據分數返回對應的 label
    const getLabel = (score) => {
      const labels = ["無", "輕微", "輕度", "中度", "嚴重"];
      return labels[score] || "未知"; // 根據分數返回對應的 label
    };

    return { store, setScore, getLabel }; // 確保 setScore 和 getLabel 被返回
  },
});
</script>

<style scoped lang="scss">
.scoreBarGroupWrap {
  background-color: #fff;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  .hashTag {
    margin-top: 0.75rem;
    color: #666;
    font-size: 14px;
    letter-spacing: 0.1px;
  }
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
    background-color: $raphael-green-400;
  }
  .remainingBar {
    height: 100%;
    background-color: $raphael-gray-400;
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
      background-color: $raphael-gray-400;
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
        background-color: $raphael-green-400;
      }
    }
  }
}
.scoreText {
  text-align: center;
  color: $raphael-green-400;
  margin-top: 0.5rem;
}
</style>
