<template>
  <div class="scoreBarGroupWrap">
    <div class="scoreBarGroup">
      <div
        class="scoreBar"
        :style="{ width: `${score * 25}%`, backgroundColor: '#74bc1f' }"
      ></div>
      <div
        class="remainingBar"
        :style="{ width: `${(4 - score) * 25}%`, backgroundColor: '#b3b3b3' }"
      ></div>
      <div class="numberGroup">
        <div
          class="number"
          :class="{ selected: score >= 0 }"
          @click="setScore(0)"
        >
          0
        </div>
        <div
          class="number"
          :class="{ selected: score >= 1 }"
          @click="setScore(1)"
        >
          1
        </div>
        <div
          class="number"
          :class="{ selected: score >= 2 }"
          @click="setScore(2)"
        >
          2
        </div>
        <div
          class="number"
          :class="{ selected: score >= 3 }"
          @click="setScore(3)"
        >
          3
        </div>
        <div
          class="number"
          :class="{ selected: score >= 4 }"
          @click="setScore(4)"
        >
          4
        </div>
      </div>
    </div>
    <div class="scoreText">{{ getScoreText(score) }}</div>
  </div>
</template>

<script>
import { ref, defineComponent } from "vue";

export default defineComponent({
  props: {
    modelValue: {
      type: Number,
      default: 0,
    },
    options: {
      type: Array,
      required: true, // Ensure that options are provided
    },
  },
  setup(props, { emit }) {
    const score = ref(props.modelValue);

    const setScore = (value) => {
      score.value = value;
      emit("update:modelValue", value);
    };

    const getScoreText = (scoreValue) => {
      // Use the options prop to get the score text
      return props.options[scoreValue]?.label || ""; // Return label or empty if undefined
    };

    return { score, setScore, getScoreText };
  },
});
</script>

<style scoped lang="scss">
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
