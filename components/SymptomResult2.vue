<template>
  <div class="resultList">
    <div class="titleGroup">
      <h3>{{ symptomName }}</h3>

      <!-- <div class="pGroup" v-if="theLatestHistoryPre?.CheckTime">
        <p v-if="differenceValue > 0" class="upIcon">▲</p>
        <p v-else-if="differenceValue < 0" class="downIcon">▼</p>
        <div v-if="differenceValue > 0" class="titleScoreUp">
          {{ symptomDifference }}
        </div>
        <div v-else-if="differenceValue < 0" class="titleScoreDown">
          {{ symptomDifference }}
        </div>
      </div> -->
    </div>

    <!-- <div class="resultTagGroup">
      <div class="resultTag" v-for="item in symptomSolve || []" :key="item">
        {{ item }}
      </div>
    </div> -->

    <h5>(本次){{ formatTimestamp(symptomCheckTime || "") }}</h5>
    <ProgressBar2
      :score="computedScore(symptomRatio)"
      :emojiSrc="computedEmoji2(computedScore(symptomRatio))"
    />
    <h4>
      嚴重程度 :
      <span
        :style="{
          color: scoreColorFn(computedScore(symptomRatio), sex),
        }"
      >
        {{ symptomRatio }}({{ symptomSerious }})
      </span>
    </h4>

    <!-- <div class="nextGroup" v-if="theLatestHistoryPre?.CheckTime">
      <h5>(前次){{ formatTimestamp(theLatestHistoryPre?.CheckTime || "") }}</h5>
      <ProgressBar2
        :score="computedScore(symptomPreRatio)"
        :emojiSrc="computedEmoji2(computedScore(symptomPreRatio))"
      />
      <h4>
        嚴重程度 :
        <span
          :style="{
            color: scoreColorFn(computedScore(symptomPreRatio), sex),
          }"
        >
          {{ symptomPreRatio }}({{ symptomPreDesc }})
        </span>
      </h4>
    </div> -->
  </div>
</template>

<script setup>
import { computed } from "vue";
import ProgressBar2 from "./ProgressBar2.vue";
import { scoreColorFn, computedEmoji2, formatTimestamp } from "../fn/utils";

// Define props
const props = defineProps({
  symptomName: String,
  symptomRatio: String,
  symptomScore: String,
  symptomSerious: String,
  symptomCheckTime: String,
  sex: String,
});

const differenceValue = computed(() => {
  // 確保 symptomDifference 存在且為字串
  return props.symptomDifference
    ? Number(props.symptomDifference.replace("%", ""))
    : 0;
});

// Compute the difference value
// const differenceValue = computed(() => {
//   return Number(differenceValue.replace("%", ""));
// });

// Compute the score
function computedScore(scoreStr) {
  // Ensure scoreStr is valid before calling replace
  if (!scoreStr) return 0;
  const numericScore = parseFloat(scoreStr.replace("%", "")); // Remove "%" and parse as float
  return isNaN(numericScore) ? 0 : numericScore;
}
</script>

<style scoped>
/* Your styles */
</style>
