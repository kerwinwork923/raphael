<template>
  <div class="userRecord">
    <Navbar />
    <div class="userRecoreWrap">
      <div class="tagList">
        <div class="listItem">總覽</div>
        <div class="listItem">每周量表</div>
        <div class="listItem listActive">睡眠紀錄</div>
        <div class="listItem">兒童成長紀錄</div>
      </div>
      <div class="subList">
        <span class="subListActive">填寫問卷</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="33"
          height="9"
          viewBox="0 0 33 9"
          fill="none"
        >
          <path
            d="M32.3536 4.85355C32.5488 4.65829 32.5488 4.34171 32.3536 4.14645L29.1716 0.964466C28.9763 0.769204 28.6597 0.769204 28.4645 0.964466C28.2692 1.15973 28.2692 1.47631 28.4645 1.67157L31.2929 4.5L28.4645 7.32843C28.2692 7.52369 28.2692 7.84027 28.4645 8.03553C28.6597 8.2308 28.9763 8.2308 29.1716 8.03553L32.3536 4.85355ZM0 5H32V4H0V5Z"
            fill="#CCCCCC"
          />
        </svg>
        <span>結果分析</span>
      </div>

      <h5 class="pleaseWrite">請填寫以下問題</h5>
      <div class="sleepRecordWrap">
        <div class="sleepRecord">
          <h4>1.幾點上床</h4>
          <div class="sleepInputGroup">
            <img class="icon1" src="../assets/imgs/time.svg" alt="" />
            <input class="timeInput" placeholder="請選擇上床時間" />
          </div>
        </div>

        <div class="sleepRecord">
          <h4>2.需要躺多久才入睡</h4>
          <div class="sleepInputGroup">
            <img class="icon1" src="../assets/imgs/time.svg" alt="" />
            <input class="timeInput" placeholder="請選擇入睡時間" />
          </div>
        </div>

        <div class="sleepRecord">
          <h4>3.幾點起床</h4>
          <div class="sleepInputGroup">
            <img class="icon1" src="../assets/imgs/time.svg" alt="" />
            <input class="timeInput" placeholder="請選擇起床時間" />
          </div>
        </div>

        <div class="sleepRecord">
          <h4>4.實際睡眠時間</h4>
          <div class="sleepInputGroup">
            <img class="icon1" src="../assets/imgs/time.svg" alt="" />
            <input class="timeInput" placeholder="請選擇深沉睡眠時間" />
          </div>
        </div>

        <div class="sleepRecord">
          <h4>5.睡眠中斷次數</h4>
          <div class="sleepInputGroup">
            <input placeholder="請選擇睡眠中斷次數" />
          </div>
        </div>

        <div class="sleepRecord">
          <h4>6.夜尿次數</h4>
          <div class="sleepInputGroup">
            <input placeholder="請選擇夜尿次數" />
          </div>
        </div>

        <div class="sleepRecord">
          <h4>7.藥物輔助情形</h4>
          <div class="sleepInputGroup">
            <input placeholder="請選擇每週使用藥物幫助睡眠天數" />
          </div>
        </div>

        <div class="sleepRecord">
          <h4>8.自覺睡眠品質</h4>
          <ScoreBar v-model="sleepScore" :options="sleepQualityOptions" />
        </div>

        <div class="sleepRecord">
          <h4>9.白天情緒狀態</h4>
          <ScoreBar v-model="dayEmotionScore" :options="dayEmotionOptions" />
        </div>

        <div class="sleepRecord">
          <h4>10.白天體力、專注力、記憶力</h4>
          <ScoreBar v-model="dayStateScore" :options="dayStateOptions" />
        </div>

        <div class="sleepRecord">
          <h4>11.白天嗜睡程度</h4>
          <ScoreBar v-model="daySleepScore" :options="daySleepOptions" />
        </div>

        <div class="sleepRecord">
          <h4>12.其他壓力來源</h4>
          <div class="sleepInputGroup">
            <textarea
              name=""
              rows="5"
              placeholder="請簡短講述近期壓力事件"
              id=""
            ></textarea>
          </div>
        </div>
      </div>

      <button class="submitBtn">完成</button>

    </div>
  </div>
</template>

<script>
import Navbar from "~/components/Navbar.vue";
import { ref } from "vue";
import ScoreBar from "~/components/ScoreBar.vue";

export default {
  components: {
    Navbar,
    ScoreBar,
  },
  setup() {
    const sleepScore = ref(0);
    const dayEmotionScore = ref(0);
    const dayStateScore = ref(0);
    const daySleepScore = ref(0);

    // 定義各個問題的選項
    const sleepQualityOptions = [
      { label: "很滿意", value: 0 },
      { label: "有點不佳", value: 1 },
      { label: "中度不佳", value: 2 },
      { label: "嚴重不足", value: 3 },
      { label: "非常嚴重", value: 4 },
    ];

    const dayEmotionOptions = [
      { label: "還不錯", value: 0 },
      { label: "有點下降", value: 1 },
      { label: "明顯欠佳", value: 2 },
      { label: "嚴重不足", value: 3 },
      { label: "非常嚴重", value: 4 },
    ];

    const dayStateOptions = [
      { label: "還不錯", value: 0 },
      { label: "有點下降", value: 1 },
      { label: "明顯欠佳", value: 2 },
      { label: "嚴重不足", value: 3 },
      { label: "非常嚴重", value: 4 },
    ];

    const daySleepOptions = [
      { label: "沒有嗜睡", value: 0 },
      { label: "少許嗜睡", value: 1 },
      { label: "輕度嗜睡", value: 2 },
      { label: "中度嗜睡", value: 3 },
      { label: "嚴重嗜睡", value: 4 },
    ];

    return {
      sleepScore,
      dayEmotionScore,
      dayStateScore,
      daySleepScore,
      sleepQualityOptions,
      dayEmotionOptions,
      dayStateOptions,
      daySleepOptions,
    };
  },
};
</script>

<style lang="scss">
.userRecord {
  min-height: 100vh;
  width: 100%;
  background-color: $raphael-gray-200;
  margin-bottom: 50px;
}
.userRecoreWrap {
  padding: 0 5%;
}
.tagList {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75%;
  padding-top: 4.5rem;
  .listItem {
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.1px;
    padding: 10px 12px;
    border-radius: 6px;
    color: $raphael-gray-500;
  }
  .listActive {
    background-color: $raphael-green-400;
    color: #fff;
  }
}
.subList {
  color: #666;
  font-family: 14px;
  margin-top: 1rem;
  svg {
    margin-left: 8px;
    margin-right: 4px;
  }
  .subListActive {
    color: $raphael-red-500;
  }
}
.pleaseWrite {
  margin-top: 1rem;
  color: $raphael-gray-500;
  font-size: 1rem;
}
.sleepRecordWrap {
  margin-top: 0.75rem;
  .sleepRecord {
    background-color: #fff;
    margin-bottom: 1rem;
    padding: 0.75rem;
    border-radius: 12px;
    .sleepInputGroup {
      margin-top: 1rem;
      position: relative;

      input {
        border: none;
        outline: none;
        border-bottom: 1px solid #666;
        width: 90%;
        padding-bottom: 0.25rem;
      }

      textarea {
        width: 100%;
        border: none;
        outline: none;
        border: 1px solid #666;
        border-radius: 8px;
        padding: 0.5rem 1rem;
      }
      .timeInput {
        padding-left: 1.5rem;
      }
      .icon1 {
        position: absolute;
        top: 5%;
        left: 2px;
      }
    }
    // .scoreBarGroup {
    //   position: relative;
    //   margin: 1.5rem 0;
    //   display: flex;
    //   align-items: center;
    //   height: 6px;
    //   width: 100%;

    //   .scoreBar {
    //     height: 100%;
    //     background-color: $raphael-green-400; /* 绿色 */
    //   }
    //   .remainingBar {
    //     height: 100%;
    //     background-color: $raphael-gray-400; /* 灰色 */
    //   }

    //   .numberGroup {
    //     display: flex;
    //     position: absolute;
    //     top: 0;
    //     left: 0;
    //     width: 100%;
    //     height: 100%;
    //     justify-content: space-between;
    //     align-items: center;
    //     .number {
    //       background-color: $raphael-gray-400; /* 默认颜色 */
    //       border-radius: 50%;
    //       color: #fff;
    //       width: 1.5rem;
    //       height: 1.5rem;
    //       display: flex;
    //       justify-content: center;
    //       align-items: center;
    //       cursor: pointer; /* 添加鼠标指针效果 */
    //       transition: background-color 0.3s; /* 添加过渡效果 */

    //       &.selected {
    //         background-color: $raphael-green-400; /* 选中时的颜色 */
    //       }
    //     }
    //   }
    // }
    // .scoreText {
    //   text-align: center;
    //   color: $raphael-green-400;
    //   margin-top: 0.5rem;
    // }
  }
  
}
.submitBtn {
    background-color: $raphael-green-400;
    color: #fff;
    padding: 12px;
    width: 100%;
    border-radius: 8px;
    border: none;
    font-size: 1rem;
    font-weight: 400;
    letter-spacing: 0.5px;
    transition: 0.25s ease;

    cursor: pointer;
    &:hover {
      background-color: $raphael-green-500;
    }
  }
</style>
