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
          @click="setScore(0, 'sleepProperty')"
        >
          0
        </div>
        <div
          class="number"
          :class="{ selected: score >= 1 }"
          @click="setScore(1, 'emotionalState')"
        >
          1
        </div>
        <div
          class="number"
          :class="{ selected: score >= 2 }"
          @click="setScore(2, 'physicalStrength')"
        >
          2
        </div>
        <div
          class="number"
          :class="{ selected: score >= 3 }"
          @click="setScore(3, 'dayTimeSleepiness')"
        >
          3
        </div>
        <div
          class="number"
          :class="{ selected: score >= 4 }"
          @click="setScore(4, 'otherPressureEvent')"
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
import { useFirstSleepRecordStore } from "@/stores/firstSleepRecord";

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
  },
  setup(props) {
    const score = ref(props.modelValue);
    const store = useFirstSleepRecordStore();

    const setScore = (value, property) => {
      score.value = value;
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
