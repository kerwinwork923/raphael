<template>
  <div class="sleepIndex">
    <div class="resultTopGroup">
      <div class="resultInfo">
        <div class="resultHintText">
          {{
            useSleepRecordData.SleepRecCond == "0"
              ? "不久"
              : useSleepRecordData.SleepRecCond + "天"
          }}後再進行檢測
        </div>
        <h5 class="subText">
          (本次){{
            useSleepRecordData?.SleepRec?.length > 0
              ? formatTimestamp(useSleepRecordData.SleepRec[0].CheckTime)
              : "No data available"
          }}
        </h5>

        <div class="severity">
          <div class="imgGroup">
            <img
              :src="
                computedSleepEmoji(useSleepRecordData?.SleepRec?.[0]?.Score)
              "
              alt=""
            />

            <div class="scoreText">
              <div
                class="score"
                :style="{
                  color: scoreSleepColorFn(
                    useSleepRecordData.SleepRec?.[0]?.Score
                  ),
                }"
              >
                {{ useSleepRecordData.SleepRec?.[0]?.Score }}
              </div>
              <h5>分</h5>
            </div>
          </div>

          <!-- <ProgressBar
            :score="useSleepRecordData.SleepRec?.[0]?.Score"
            :colorProp="scoreSleepColorFn(useSleepRecordData.SleepRec?.[0]?.Score)"
          /> -->

          <!-- <h6 class="severityText">
            嚴重程度 :
             <span
              :style="{ color: scoreSleepColorFn(useSleepRecordData.SleepRec?.[0]?.Score) }"
            >
              {{ useSleepRecordData.SleepRec?.[0]?.Score }}%(嚴重失調)</span
            >
          </h6> -->
        </div>
        <!-- <div class="dashDiv" v-if="useSleepRecordData.SleepRec?.[1]?.Score">
          ---
        </div> -->
        <h5 class="subText" v-if="useSleepRecordData?.SleepRec?.[1]">
          (前次){{
            useSleepRecordData?.SleepRec?.length > 0
              ? formatTimestamp(useSleepRecordData.SleepRec[1].CheckTime)
              : "No data available"
          }}
        </h5>
        <div class="severity" v-if="useSleepRecordData.SleepRec?.[1]?.Score">
          <div class="imgGroup">
            <img
              :src="computedSleepEmoji(useSleepRecordData.SleepRec?.[1]?.Score)"
              alt=""
            />
            <div class="scoreText">
              <div
                class="score"
                :style="{
                  color: scoreSleepColorFn(
                    useSleepRecordData.SleepRec?.[1]?.Score
                  ),
                }"
              >
                {{ useSleepRecordData.SleepRec?.[1]?.Score }}
              </div>
              <h5>分</h5>
            </div>
          </div>
          <!-- <ProgressBar
            :score="useSleepRecordData.SleepRec?.[1]?.Score"
            :colorProp="scoreSleepColorFn(useSleepRecordData.SleepRec?.[1]?.Score)"
          /> -->
          <!-- <h6 class="severityText">
            嚴重程度 :
            <span
              :style="{
                color: scoreSleepColorFn(useSleepRecordData.SleepRec?.[1]?.Score),
              }"
            >
              {{ store.theLatestDataPreData.TotalRatio }}%(嚴重失調)</span
            >
          </h6> -->
        </div>
      </div>
      <img class="doctorImg" src="../assets/imgs/doctor.png" alt="" />
    </div>

    <div class="firstSleepRecord">
      <h2>檢測紀錄</h2>
      <!-- <div class="emojiGroup">
        <div class="firstScore">
          <div class="firstScoreTitle">
            <h3>第一次檢測分數</h3>
          </div>
          <div class="emojiBox">
            <img
              :src="computedSleepEmoji(useSleepRecordData.SleepRec?.[0]?.Score)"
              alt="Emotion Emoji"
            />
            <div class="score">
              {{ useSleepRecordData.SleepRec?.[0]?.Score ?? "---" }}
            </div>
          </div>
        </div>
        <div class="secScore">
          <div class="firstScoreTitle">
            <h3>第二次檢測分數</h3>
          </div>
          <div class="emojiBox">
            <img
              :src="computedSleepEmoji(useSleepRecordData.SleepRec?.[1]?.Score)"
              alt="Emotion Emoji"
            />
            <div class="score">
              {{ useSleepRecordData.SleepRec?.[1]?.Score ?? "---" }}
            </div>
          </div>
        </div>
      </div> -->
      <div class="sleepRecordListGroup">
        <h5 class="sleepRecordListDate">
          {{
            useSleepRecordData.SleepRec?.[0]?.CheckTime
              ? formatCheckTime(useSleepRecordData.SleepRec[0].CheckTime)
              : ""
          }}
        </h5>
        <div class="sleepRecordList">
          <div
            class="sleepRecordItem"
            v-for="(record, index) in useSleepRecordData.SleepRec"
            :key="index"
          >
            <h4>上床時間</h4>
            <h5>{{ record?.bedTime || "-" }}</h5>
          </div>
          <div class="sleepRecordItem">
            <h4>入睡時間</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[0]?.LayTimeToSleep || "-" }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>起床時間</h4>
            <h5>{{ useSleepRecordData?.SleepRec?.[0]?.getupTime || "-" }}</h5>
          </div>
          <div class="sleepRecordItem">
            <h4>深層睡眠時間</h4>
            <h5>{{ useSleepRecordData?.SleepRec?.[0]?.SleepTime || "-" }}</h5>
          </div>
          <div class="sleepRecordItem">
            <h4>睡眠中斷次數</h4>
            <h5>{{ useSleepRecordData?.SleepRec?.[0]?.SleepBreak || "-" }}</h5>
          </div>
          <div class="sleepRecordItem">
            <h4>特殊飲食次數</h4>
            <h5>{{ useSleepRecordData?.SleepRec?.[0]?.SpecialDiet || "-" }}</h5>
          </div>
          <div class="sleepRecordItem">
            <h4>藥物輔助天數</h4>
            <h5>{{ useSleepRecordData?.SleepRec?.[0]?.MedHelp || "-" }}</h5>
          </div>
          <div class="sleepRecordItem">
            <h4>自覺睡覺品質</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[0]?.SleepProperty || "-" }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>白天情緒狀態</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[0]?.emotionalState || "-" }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>白天體力、專注力、記憶力</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[0]?.physicalStrength || "-" }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>白天嗜睡程度</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[0]?.daytimeSleepiness || "-" }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>工作壓力、變動</h4>
            <h5>{{ useSleepRecordData?.SleepRec?.[0]?.workStress || "-" }}</h5>
          </div>
          <div class="sleepRecordItem">
            <h4>輕密關係壓力</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[0]?.relationshipStress || "-" }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>自身或家人健康狀況壓力</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[0]?.healthStress || "-" }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>生活型態變動壓力</h4>
            <h5>
              {{
                useSleepRecordData?.SleepRec?.[0]?.lifestyleChangeStress || "-"
              }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>經濟壓力</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[0]?.economicStress || "-" }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>壓力事件紀錄</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[0]?.OtherPressureEvent || "-" }}
            </h5>
          </div>
        </div>
      </div>
    </div>

    <div class="firstSleepRecord" v-if="useSleepRecordData?.SleepRec?.[1]">
      <div class="sleepRecordListGroup">
        <h5 class="sleepRecordListDate">
          {{
            useSleepRecordData?.SleepRec?.[1]?.CheckTime
              ? formatCheckTime(useSleepRecordData?.SleepRec?.[1].CheckTime)
              : ""
          }}
        </h5>
        <div class="sleepRecordList">
          <div class="sleepRecordItem">
            <h4>上床時間</h4>
            <h5>{{ useSleepRecordData?.SleepRec?.[1]?.bedTime || "-" }}</h5>
          </div>
          <div class="sleepRecordItem">
            <h4>入睡時間</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[1]?.LayTimeToSleep || "-" }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>起床時間</h4>
            <h5>{{ useSleepRecordData?.SleepRec?.[1]?.getupTime || "-" }}</h5>
          </div>
          <div class="sleepRecordItem">
            <h4>深層睡眠時間</h4>
            <h5>{{ useSleepRecordData?.SleepRec?.[1]?.SleepTime || "-" }}</h5>
          </div>
          <div class="sleepRecordItem">
            <h4>睡眠中斷次數</h4>
            <h5>{{ useSleepRecordData?.SleepRec?.[1]?.SleepBreak || "-" }}</h5>
          </div>
          <div class="sleepRecordItem">
            <h4>特殊飲食次數</h4>
            <h5>{{ useSleepRecordData?.SleepRec?.[1]?.SpecialDiet || "-" }}</h5>
          </div>
          <div class="sleepRecordItem">
            <h4>藥物輔助天數</h4>
            <h5>{{ useSleepRecordData?.SleepRec?.[1]?.MedHelp || "-" }}</h5>
          </div>
          <div class="sleepRecordItem">
            <h4>自覺睡覺品質</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[1]?.SleepProperty || "-" }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>白天情緒狀態</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[1]?.emotionalState || "-" }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>白天體力、專注力、記憶力</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[1]?.physicalStrength || "-" }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>白天嗜睡程度</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[1]?.daytimeSleepiness || "-" }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>工作壓力、變動</h4>
            <h5>{{ useSleepRecordData?.SleepRec?.[1]?.workStress || "-" }}</h5>
          </div>
          <div class="sleepRecordItem">
            <h4>輕密關係壓力</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[1]?.relationshipStress || "-" }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>自身或家人健康狀況壓力</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[1]?.healthStress || "-" }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>生活型態變動壓力</h4>
            <h5>
              {{
                useSleepRecordData?.SleepRec?.[1]?.lifestyleChangeStress || "-"
              }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>經濟壓力</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[1]?.economicStress || "-" }}
            </h5>
          </div>
          <div class="sleepRecordItem">
            <h4>壓力事件紀錄</h4>
            <h5>
              {{ useSleepRecordData?.SleepRec?.[1]?.OtherPressureEvent || "-" }}
            </h5>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
.userRecoreWrap {
  max-width: 768px;
  margin: 0 auto;
  padding: 0 1rem;
}
.sleepIndex {
  max-width: 768px;
  margin: 0 auto;
  animation: fade 0.5s forwards ease;
  .resultTopGroup {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: calc(100% - 120px) max-content;
    margin-top: 0.5rem;
    overflow: hidden;
    .doctorImg {
      height:174px;
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
          font-size: 2.25rem;
        }

        h5 {
          color: #ccc;
          font-size: 14px;
        }
      }
    }
  }
  @keyframes fade {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
      z-index: 2;
    }
  }

  .resultInfo {
    background-color: #fff;
    padding: 12px;
    border-radius: 12px;
    box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.25) inset;
    .subText {
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }

    .resultHintText {
        color: $raphael-green-400;
        font-weight: 400;
        font-size: 16px;
        letter-spacing: 0.048px;
        margin-bottom: 0.75rem;
    }

    .severityText {
        font-size: 0.875rem;
        letter-spacing: 0.048px;
      span {
        color: #ec4f4f;
      }
    }
    .dashDiv {
      margin-top: 0.5rem;
    }
  }

  .firstSleepRecord {
    background-color: #fff;
    border-radius: 12px;
    padding: 1rem 1rem 2rem 1rem;

    animation: fade 0.5s forwards ease;
    animation-delay: 0.5s;
    opacity: 0;
    margin-bottom: 0.5rem;
    margin-top: 0.75rem;
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
        img {
          width: 36px;
          height: 36px;
        }
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
      margin-top: 0.5rem;
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
            width: 40%;
            white-space: nowrap;
          }
          h5 {
            color: $raphael-green-400;
            width: 60%;
            display: flex;
            justify-content: end;
          }
        }
      }
    }
  }
}
</style>

<script>
import { defineComponent } from "@vue/composition-api";
import {
  scoreSleepColorFn,
  computedSleepEmoji,
  formatTimestamp,
} from "../fn/utils";
import { useSleepRecordStore } from "../stores/sleepRecord";
import { useRouter } from "vue-router";
import RaphaelLoading from "../components/RaphaelLoading";
export default defineComponent({
  components: {
    RaphaelLoading,
  },
  setup() {
    const useSleepRecordData = useSleepRecordStore();
    const router = useRouter();

    const sleepRecIndexData = ref(null);
    const SleepRecCond = ref(null);
    const SleepText = ref(`
    感謝您使用我們的系統請等待<span>${SleepRecCond.value}天</span>後再進行第二次檢測
    `);

    const backToUser = () => {
      router.push({ name: "user" });
    };

    const formatCheckTime = (timeString) => {
      const year = timeString.substring(0, 4);
      const month = timeString.substring(4, 6);
      const day = timeString.substring(6, 8);

      // Return formatted date as MM/DD (remove leading zeros from month and day)
      return `${parseInt(month)}/${parseInt(day)}`;
    };

    return {
      useSleepRecordData,
      formatCheckTime,
      backToUser,
      scoreSleepColorFn,
      computedSleepEmoji,
      formatTimestamp,
    };
  },
});
</script>
