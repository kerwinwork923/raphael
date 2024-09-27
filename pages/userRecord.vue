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

      <div class="sleepRecordWrap" v-if="sleepState === 'firstTest'">
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
        <div class="sleepRecord">
          <h4>1.幾點上床</h4>
          <div class="sleepInputGroup">
            <!-- <input class="timeInput" placeholder="請選擇上床時間" /> -->
            <TimePicker2 v-model="bedTime" label="請選擇上床時間" />
          </div>
        </div>

        <div class="sleepRecord">
          <h4>2.需要躺多久才入睡</h4>
          <div class="sleepInputGroup">
            <TimePicker v-model="layTimeToSleep" placeholder="請選擇入睡時間" />
          </div>
        </div>

        <div class="sleepRecord">
          <h4>3.幾點起床</h4>
          <div class="sleepInputGroup">
            <TimePicker2 v-model="bedTime" label="請選擇起床時間" />
          </div>
        </div>

        <div class="sleepRecord">
          <h4>4.實際睡眠時間</h4>
          <div class="sleepInputGroup">
            <TimePicker v-model="sleepTime" placeholder="請選擇深沉睡眠時間" />
          </div>
        </div>

        <div class="sleepRecord">
          <h4>5.睡眠中斷次數</h4>
          <div class="sleepInputGroup">
            <TimesOption
              placeholder="請選擇睡眠中斷次數"
              :minValue="0"
              :maxValue="20"
            />
          </div>
        </div>

        <div class="sleepRecord">
          <h4>6.夜尿次數</h4>
          <div class="sleepInputGroup">
            <TimesOption
              placeholder="請選擇夜尿次數"
              :minValue="0"
              :maxValue="20"
            />
          </div>
        </div>

        <div class="sleepRecord">
          <h4>7.藥物輔助情形</h4>
          <div class="sleepInputGroup">
            <TimesOption
              placeholder="請選擇每週使用藥物幫助睡眠天數"
              :minValue="0"
              :maxValue="7"
            />
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
        <button class="submitBtn" @click="firstTest">完成</button>
      </div>

      <div class="sleepIndex1" v-if="sleepState === 'sleepRecord1'">
        <div class="floatGroup">
          <div class="floatLeft">
            感謝您使用我們的系統請等待<span>12天</span>後再進行第二次檢測
          </div>
          <img src="../assets/imgs/doctor.png" alt="" />
        </div>
        <div class="firstSleepRecord">
          <h2>檢測紀錄</h2>
          <div class="emojiGroup">
            <div class="firstScore">
              <div class="firstScoreTitle">
                <h3>第一次檢測分數</h3>
              </div>
              <div class="emojiBox">
                <img src="../assets/imgs/smile.png" alt="" />
                <div class="score">80</div>
              </div>
            </div>
            <div class="secScore">
              <div class="firstScoreTitle">
                <h3>第二次檢測分數</h3>
              </div>
              <div class="emojiBox">
                <img src="../assets/imgs/unSmile.png" alt="" />
                <div class="score">---</div>
              </div>
            </div>
          </div>
          <div class="sleepRecordListGroup">
            <h5 class="sleepRecordListDate">8/24</h5>
            <div class="sleepRecordList">
              <div class="sleepRecordItem">
                <h4>上床時間</h4>
                <h5>23:10 pm</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>入睡時間</h4>
                <h5>00:15 am</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>起床時間</h4>
                <h5>07:20 am</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>深層睡眠時間</h4>
                <h5>1hr 20分min</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>睡眠中斷次數</h4>
                <h5>3</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>夜尿次數</h4>
                <h5>-</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>整體睡眠品質</h4>
                <h5>中度不足</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>白天美好感</h4>
                <h5>還不錯</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>白天身心功能</h4>
                <h5>還不錯</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>白天嗜睡程度</h4>
                <h5>輕度</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>近期壓力事件</h4>
                <h5>-</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "~/components/Navbar.vue";
import { ref } from "vue";
import ScoreBar from "~/components/ScoreBar.vue";
import TimePicker from "../components/TimePicker.vue";
import TimePicker2 from "../components/TimePicker2.vue";
import TimesOption from "../components/TimesOption.vue";
export default {
  components: {
    Navbar,
    ScoreBar,
    TimePicker,
    TimePicker2,
    TimesOption,
  },
  setup() {
    const sleepScore = ref(0);
    const dayEmotionScore = ref(0);
    const dayStateScore = ref(0);
    const daySleepScore = ref(0);
    const selectedBedTime = ref("");
    const sleepState = ref("firstTest");

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

    const firstTest = () => {
      sleepState.value = "sleepRecord1";
      window.scrollTo(0, 0);
      // window.scrollTo({
      //   top: 0,
      //   behavior: "smooth",
      // });
    };

    return {
      sleepScore,
      dayEmotionScore,
      dayStateScore,
      daySleepScore,
      sleepQualityOptions,
      dayEmotionOptions,
      dayStateOptions,
      daySleepOptions,
      sleepState,
      firstTest,
      selectedBedTime,
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
  padding-bottom: 2rem;
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
    cursor: pointer;
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
  margin: 1rem 0 0.75rem 0;
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

        textarea {
        width: 100%;
        border: none;
        outline: none;
        border: 1px solid #666;
        border-radius: 8px;
        padding: 0.5rem 1rem;
        margin-top: .85rem;
      }
      .timeInput {
        padding-left: 1.5rem;
      }
      .icon1 {
        position: absolute;
        top: 5%;
        left: 2px;
      }
    
    // .sleepInputGroup {
    //   margin-top: 1rem;
    //   position: relative;

    //   input {
    //     border: none;
    //     outline: none;
    //     border-bottom: 1px solid #666;
    //     width: 100%;
    //     padding-bottom: 0.25rem;
    //   }

    //   textarea {
    //     width: 100%;
    //     border: none;
    //     outline: none;
    //     border: 1px solid #666;
    //     border-radius: 8px;
    //     padding: 0.5rem 1rem;
    //   }
    //   .timeInput {
    //     padding-left: 1.5rem;
    //   }
    //   .icon1 {
    //     position: absolute;
    //     top: 5%;
    //     left: 2px;
    //   }
    // }
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

.sleepIndex1 {
  max-width: 768px;
  margin: 0 auto;

  @keyframes fade {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
      z-index: 2;
    }
  }

  .floatGroup {
    display: flex;
    margin-top: 20px;
    opacity: 0;
    animation: fade 0.5s forwards ease;
    animation-delay: 0.25s;
    position: relative;

    z-index: 2;
    .floatLeft {
      width: 50%;
      height: 40%;
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.25) inset;
      padding: 12px;

      font-size: 1rem;
      color: #666;
      letter-spacing: 0.5px;
      font-weight: 400;
      line-height: 1.5;
      @include respond-to("tablet") {
        width: 100%;
      }
      span {
        color: $raphael-green-400;
        font-weight: bold;
        font-size: 1.5rem;
      }
    }
    img {
      z-index: 2;
      @include respond-to("tablet") {
        display: none;
      }
    }
  }

  .firstSleepRecord {
    background-color: #fff;
    border-radius: 12px;
    padding: 1rem 1rem 2rem 1rem;
    transform: translateY(-3%);
    animation: fade 0.5s forwards ease;
    animation-delay: 0.5s;
    opacity: 0;
    @include respond-to("tablet") {
      width: 100%;
      transform: translateY(0%);
      margin-top: 2rem;
    }
    h2 {
      color: #1e1e1e;
      font-size: 1.5rem;
      letter-spacing: 0.5px;

      text-align: center;
    }
    .emojiGroup {
      display: flex;
      justify-content: center;
      gap: 10%;
      .emojiBox {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 3%;
      }
      h3 {
        color: $raphael-gray-500;
      }
      .firstScore,
      .secScore {
        margin-top: 1rem;
        .emojiBox {
          margin-top: 0.5rem;
        }
      }
      .firstScore {
        .score {
          font-size: 2rem;
          font-weight: bold;
          letter-spacing: 0.09px;
          color: $raphael-purple-200;
        }
      }
      .secScore {
        .score {
          font-size: 2.25rem;
          font-weight: bold;
          color: $raphael-cyan-400;
          letter-spacing: 0.09px;
          white-space: nowrap;
        }
      }
    }

    .sleepRecordListGroup {
      margin-top: 1.5rem;
      .sleepRecordListDate {
        text-align: center;
        color: #1e1e1e;
        font-size: 20px;
        font-weight: 400;
        letter-spacing: 0.15px;
      }
      .sleepRecordList {
        margin-top: 0.75rem;
        .sleepRecordItem {
          margin-top: 0.5rem;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #b3b3b3;
          padding-bottom: 0.75rem;
          h4 {
            color: $raphael-gray-500;
            font-size: 1rem;
            font-weight: 400;
            letter-spacing: 0.5px;
          }
          h5 {
            color: $raphael-green-400;
          }
        }
      }
    }
  }
}
</style>
