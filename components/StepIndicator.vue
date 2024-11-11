<template>
  <div class="subList">
    <div class="stepGroup" v-for="(text, index) in stepTexts" :key="index">
      <span
        :class="{ subListActive: isActive(index) }"
        :style="{ color: isActive(index) ? '#EC4F4F' : '#CCCCCC' }"
      >
        {{ text }}
      </span>
      <!-- 只在文字後面顯示箭頭 -->
      <svg
        v-if="index < stepTexts.length - 1"
        xmlns="http://www.w3.org/2000/svg"
        width="33"
        height="9"
        viewBox="0 0 33 9"
        :fill="isArrowActive(index) ? '#EC4F4F' : '#CCCCCC'"
      >
        <path
          d="M32.3536 4.85355C32.5488 4.65829 32.5488 4.34171 32.3536 4.14645L29.1716 0.964466C28.9763 0.769204 28.6597 0.769204 28.4645 0.964466C28.2692 1.15973 28.2692 1.47631 28.4645 1.67157L31.2929 4.5L28.4645 7.32843C28.2692 7.52369 28.2692 7.84027 28.4645 8.03553C28.6597 8.2308 28.9763 8.2308 29.1716 8.03553L32.3536 4.85355ZM0 5H32V4H0V5Z"
        />
      </svg>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    stepTexts: {
      type: Array,
      required: true,
    },
    currentStep: {
      type: Number,
      required: true,
    },
  },
  methods: {
    isActive(stepIndex) {
      return stepIndex <= this.currentStep; // 字要亮燈，包含currentStep
    },
    isArrowActive(arrowIndex) {
      return arrowIndex === this.currentStep - 1; // 箭頭亮燈的條件：只在currentStep的前一個箭頭亮燈
    },
  },
});
</script>

<style lang="scss">
.subList {
  color: #666;
  margin-top: 1rem;
  font-size: 1rem;
  display: flex;
  svg {
    margin-left: 8px;
    margin-right: 4px;
  }
  .subListActive {
    color: $raphael-red-500;
  }
}
</style>
