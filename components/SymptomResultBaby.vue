<template>
  <div class="resultList">
    <div class="titleGroup">
      <h3>{{ symptomName }}</h3>

      <div class="pGroup" v-if="theLatestHistoryPre?.CheckTime">
        <p v-if="differenceValue > 0" class="upIcon">▲</p>
        <p v-else-if="differenceValue < 0" class="downIcon">▼</p>
        <div v-if="differenceValue > 0" class="titleScoreUp">
          {{ symptomDifference }}
        </div>
        <div v-else-if="differenceValue < 0" class="titleScoreDown">
          {{ symptomDifference }}
        </div>
      </div>
    </div>

    <!-- <div class="resultTagGroup">
      <div class="resultTag" v-for="item in symptomSolve || []" :key="item">
        {{ item }}
      </div>
    </div> -->

    <h5>(本次){{ formatTimestamp(theLatestHistory.CheckTime || "") }}</h5>
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
        {{ symptomRatio }}({{ symptomDesc }})
      </span>
    </h4>

  <!-- 修改：加上 v-if -->
<div class="nextGroup" 
     v-if="theLatestHistoryPre && theLatestHistoryPre.CheckTime">
  <h5>(前次){{ formatTimestamp(theLatestHistoryPre.CheckTime) }}</h5>
  <ProgressBar2
    :score="computedScore(symptomPreRatio)"
    :emojiSrc="computedEmoji2(computedScore(symptomPreRatio))"
  />
  <h4>
    嚴重程度 :
    <span :style="{ color: scoreColorFn(computedScore(symptomPreRatio), sex) }">
      {{ symptomPreRatio }}({{ symptomPreDesc }})
    </span>
  </h4>
</div>

  </div>

</template>

<script setup>
import { computed } from "vue";
import ProgressBar2 from "./ProgressBar2.vue";
import { scoreColorFn, computedEmoji2, formatTimestamp } from "../fn/utils";

// Define props
const props = defineProps({
  symptomName: String,
  symptomDifference: String,
  symptomSolve: Array,
  symptomRatio: String,
  symptomPreRatio: String,

  symptomDesc: String,
  symptomPreDesc: String,

  theLatestHistory: Object,
  theLatestHistoryPre: Object,

  sex: String,
});

const differenceValue = computed(() => {
  // 確保 symptomDifference 存在且為字串
  return props.symptomDifference
    ? Number(props.symptomDifference.replace("%", ""))
    : 0;
});



// Compute the score
function computedScore(scoreStr) {
  // Ensure scoreStr is valid before calling replace
  if (!scoreStr) return 0;
  const numericScore = parseFloat(scoreStr.replace("%", "")); // Remove "%" and parse as float
  return isNaN(numericScore) ? 0 : numericScore;
}
</script>

<style lang="scss">
  .resultListGroup {
    .resultList {
      background-color: #fff;
      padding: 12px;
      border-radius: 12px;
      margin-top: 0.75rem;
      .nextGroup {
        margin-top: 0.75rem;
      }
      .titleGroup {
        display: flex;
        align-items: center;
        gap: 2px;
        .pGroup {
          display: flex;
          align-items: center;
        }
        .upIcon {
          color: #ec4f4f;
          font-size: 10px;
        }
        .downIcon {
          color: $raphael-green-400;
          font-size: 10px;
        }
        .titleScoreDown {
          color: $raphael-green-400;
          font-size: 12px;
        }
        .titleScoreUp {
          color: #ec4f4f;
          font-size: 12px;
        }
      }
      h3 {
        color: #1e1e1e;
        font-size: 22px;
        font-weight: 500;
        letter-spacing: 0.15px;
      }
      .resultTagGroup {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 0.375rem;
        
        .resultTag {
          background: #fef1e2;
          padding: 4px 8px;
          border-radius: 12px;
          color: #666;
          font-size: 0.875rem;
        }
      }

      h5 {
        color: #666666;
        letter-spacing: 0.1px;
        margin-top: 1rem;
        margin-bottom: 0.75rem;
      }
      h4 {
        color: #666;
        span {
          color: #ec4f4f;
        }
      }
    }
  }</style>

