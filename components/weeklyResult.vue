<template>
  <div class="resultWrap">
    <div class="resultTopGroup">
      <div class="resultInfo">
        <div class="resultHintText">12天後再進行檢測</div>
        <h5 class="subText">(本次)8/01</h5>
        <div class="severity">
          <div class="imgGroup">
            <img :src="computedEmoji2(85)" alt="" />

            <div class="scoreText">
              <div class="score" :style="{ color: scoreColorFn(85) }">85</div>
              <h5>分</h5>
            </div>
          </div>

          <ProgressBar :score="85" :colorProp="scoreColorFn(85)" />

          <h6 class="severityText">
            嚴重程度 :
            <span :style="{ color: scoreColorFn(85) }"> 83.8%(嚴重失調)</span>
          </h6>
        </div>
        <div class="dashDiv">---</div>
        <div class="severity">
          <div class="imgGroup">
            <img :src="computedEmoji2(23)" alt="" />

            <div class="scoreText">
              <div class="score" :style="{ color: scoreColorFn(25) }">25</div>
              <h5>分</h5>
            </div>
          </div>

          <ProgressBar :score="25" :colorProp="scoreColorFn(25)" />

          <h6 class="severityText">
            嚴重程度 :
            <span :style="{ color: scoreColorFn(25) }"> 23.8%(嚴重失調)</span>
          </h6>
        </div>
      </div>
      <img class="doctorImg" src="../assets/imgs/doctor.png" alt="" />
    </div>

    <h4 class="textResultText">以下為分類系統的自律神經分析結果</h4>
    <div class="resultListGroup">
      <div class="resultList">
        <h3>精神系統</h3>
        <div class="resultTag">想解決的症狀名稱</div>
        <h5>(本次)8/15</h5>
        <ProgressBar2 :score="55" :emojiSrc="computedEmoji2(55)" />
        <h4>
          嚴重程度 :
          <span :style="{ color: scoreColorFn(92) }">92.3%(重度失調)</span>
        </h4>
      </div>

      <div class="resultList">
        <h3>神經系統</h3>
        <div class="resultTag">想解決的症狀名稱</div>
        <h5>(本次)8/15</h5>
        <ProgressBar2 :score="23" :emojiSrc="computedEmoji2(23)" />
        <h4>
          嚴重程度 :
          <span :style="{ color: scoreColorFn(92) }">92.3%(重度失調)</span>
        </h4>
      </div>

      <div class="resultList">
        <h3>血液循環系統</h3>
        <div class="resultTag">想解決的症狀名稱</div>
        <h5>(本次)7/15</h5>
        <ProgressBar2 :score="87" :emojiSrc="computedEmoji2(87)" />
        <h4>
          嚴重程度 :
          <span :style="{ color: scoreColorFn(92) }">92.3%(重度失調)</span>
        </h4>
      </div>

      <div class="resultList">
        <h3>感官系統</h3>
        <div class="resultTag">想解決的症狀名稱</div>
        <h5>(本次)8/15</h5>
        <ProgressBar2 :score="33" :emojiSrc="computedEmoji2(33)" />
        <h4>
          嚴重程度 :
          <span :style="{ color: scoreColorFn(92) }">92.3%(重度失調)</span>
        </h4>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import ProgressBar from "./ProgressBar.vue";
import ProgressBar2 from "./ProgressBar2.vue";
import { scoreColorFn, computedEmoji2 } from "../fn/utils";
export default {
  components: {
    ProgressBar,
    ProgressBar2,
  },
  setup() {
    return {
      scoreColorFn,
      computedEmoji2,
    };
  },
};
</script>

<style lang="scss">
.resultWrap {
  .resultTopGroup {
    display: flex;
    align-items: start;

    .resultInfo {
      background-color: #fff;
      padding: 12px;
      border-radius: 12px;
      width: 80%;
      box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.25) inset;
      .subText {
        margin-top: 8px;
        font-size: 12px;
      }

      .resultHintText {
        color: $raphael-green-400;
        font-weight: 400;
        font-size: 12px;
        letter-spacing: 0.048px;
      }

      .severityText {
        margin-top: 6px;
        font-size: 12px;
        letter-spacing: 0.048px;
        span {
          color: #ec4f4f;
        }
      }
      .dashDiv {
        margin-top: 0.5rem;
      }
    }

    .imgGroup {
      display: flex;
      align-items: center;
      margin-top: 4px;
      gap: 4px;

      img {
        width: 40px;
        height: 40px;
      }

      .scoreText {
        color: $raphael-red-300;
        font-weight: bold;
        letter-spacing: 0.09px;
        display: flex;
        align-items: center;
        gap: 4px;

        .score {
          font-size: 2rem;
        }

        h5 {
          color: #ccc;
          font-size: 14px;
        }
      }
    }
  }
  .textResultText {
    color: #666;
    margin-top: 1rem;
  }
  .resultListGroup {
    .resultList {
      background-color: #fff;
      padding: 12px;
      border-radius: 12px;
      margin-top: 0.75rem;
      h3 {
        color: #1e1e1e;
        font-size: 20px;
        font-weight: bold;
        letter-spacing: 0.15px;
        margin-bottom: 0.25rem;
      }
      .resultTag {
        display: inline;
        background: #fef1e2;
        padding: 2px 8px;
        border-radius: 8px;
        color: #666;
        font-size: 12px;
      }
      h5 {
        color: #1e1e1e;
        font-size: 14px;
        font-weight: 400;
        letter-spacing: 0.1px;
        margin-top: 0.5rem;
      }
      h4 {
        color: #666;
        font-size: 12px;
        margin-top: 0.35rem;
        span {
          color: #ec4f4f;
        }
      }
    }
  }
}

.doctorImg {
  width: 40%;
}
</style>
