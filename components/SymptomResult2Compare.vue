<template>
  <div class="resultList">
    <!-- 指標名稱 -->
    <div class="titleGroup">
      <h3>{{ symptomName }}</h3>
    </div>

    <!-- 本次數據 -->
    <div v-if="current">
      <h5>(本次) {{ formatTimestamp(current.CheckTime || "") }}</h5>
      <ProgressBar2
        :score="computedScore(current.Ratio)"
        :emojiSrc="computedEmoji2(computedScore(current.Ratio))"
      />
      <h4>
        嚴重程度 :
        <span
          :style="{ color: scoreColorFn(computedScore(current.Ratio), sex) }"
        >
          {{ current.Ratio }}% ({{ current.Serious }})
        </span>
      </h4>
    </div>

    <!-- 前次數據 -->
    <div v-if="previous">
      <h5>(前次) {{ formatTimestamp(previous.CheckTime || "") }}</h5>
      <ProgressBar2
        :score="computedScore(previous.Ratio)"
        :emojiSrc="computedEmoji2(computedScore(previous.Ratio))"
      />
      <h4>
        嚴重程度 :
        <span
          :style="{ color: scoreColorFn(computedScore(previous.Ratio), sex) }"
        >
          {{ previous.Ratio }}% ({{ previous.Serious }})
        </span>
      </h4>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import ProgressBar2 from "./ProgressBar2.vue";
import { scoreColorFn, computedEmoji2, formatTimestamp } from "../fn/utils";

// 定義傳入的屬性
const props = defineProps({
  symptomName: String,
  current: {
    type: Object,
    default: null,
  },
  previous: {
    type: Object,
    default: null,
  },
  sex: String,
});

// 計算差異值
const differenceValue = computed(() => {
  if (!props.current || !props.previous) return null;
  const currentScore = parseFloat(props.current.Ratio) || 0;
  const previousScore = parseFloat(props.previous.Ratio) || 0;
  return (currentScore - previousScore).toFixed(2); // 保留兩位小數
});

// 分數處理
function computedScore(scoreStr) {
  if (!scoreStr) return 0;
  const numericScore = parseFloat(scoreStr.replace("%", "")); // 移除百分比符號並轉為數字
  return isNaN(numericScore) ? 0 : numericScore;
}
</script>
