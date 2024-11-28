<template>
  <div class="scoreBarGroupWrap">
    <div class="scoreText">{{ getScoreText(score) }}</div>
    <div class="scoreBarGroup">

      <div
        class="scoreBar"
        :style="{ width: `${score * 33.3333}%`, backgroundColor: '#74bc1f' }"
      ></div>

      <div
        class="remainingBar"
        :style="{ width: `${(3 - score) * 33.3333}%`, backgroundColor: '#b3b3b3' }"
      ></div>
      <div class="numberGroup">
        <div
          v-for="(option, index) in options"
          :key="index"
          class="number"
          :class="{ selected: score >= index }"
          @click="setScore(option.label, property, index)"
        >
          {{ index }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, defineComponent } from "vue";
import { useSleepRecordStore } from "../stores/sleepRecord";

export default defineComponent({
  props: {
    modelValue: {
      type: Number,
      default: 0,
    },
    options: {
      type: Array,
      required: true,
    },
    property: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const score = ref(props.modelValue);
    const store = useSleepRecordStore();

    const setScore = (value, property, index) => {
      score.value = index;
      store.updateScore(property, value);
    };

    const getScoreText = (scoreValue) => {
      return props.options[scoreValue]?.label || "";
    };

    return { score, setScore, getScoreText };
  },
});
</script>

<style scoped lang="scss">
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
    font-size: 0.875rem;

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
  margin: 0.25rem 0 1rem 0;
}
</style>
