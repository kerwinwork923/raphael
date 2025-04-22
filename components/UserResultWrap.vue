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
              ? formatCheckTime2(useSleepRecordData.SleepRec[0].CheckTime)
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

          <ProgressBar
            :score="useSleepRecordData.SleepRec?.[0]?.Score"
            :colorProp="
              scoreColorFn(useSleepRecordData.SleepRec?.[0]?.Score, 0)
            "
          />

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
            useSleepRecordData?.SleepRec?.length > 1
              ? formatCheckTime2(useSleepRecordData.SleepRec[1].CheckTime)
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
        <ProgressBar
          :score="useSleepRecordData.SleepRec?.[1]?.Score"
          :colorProp="scoreColorFn(useSleepRecordData.SleepRec?.[0]?.Score, 0)"
        />
      </div>
      <img class="doctorImg" src="../assets/imgs/doctor.png" alt="" />
    </div>

    <div class="sleepDetectResultWrap">
      <h6>以下為您的睡眠分析結果</h6>
      <div
        class="sleepDetectResultDIV"
        v-if="useSleepRecordData?.SleepRec?.[0]"
      >
        <h3>睡眠周期</h3>
        <h5>
          (本次){{ formatTimestamp(useSleepRecordData.SleepRec[0]?.CheckTime) }}
        </h5>
        <section>
          <div class="sleepDetectItem">
            <h4>入睡時間</h4>
            <p>
              {{ useSleepRecordData.SleepRec[0]?.bedTime || "" }}
              <span>{{
                getAmPm(useSleepRecordData.SleepRec[0]?.bedTime)
              }}</span>
            </p>
          </div>
          <div class="sleepDetectItem">
            <h4>離床時間</h4>
            <p>
              {{ useSleepRecordData.SleepRec[0]?.getupTime || "" }}
              <span>{{
                getAmPm(useSleepRecordData.SleepRec[0]?.getupTime)
              }}</span>
            </p>
          </div>
          <div class="sleepDetectItem">
            <h4>睡眠時長</h4>
            <p>
              {{ useSleepRecordData.SleepRec[0]?.ccSleepExact || "" }}
            </p>
            <h5>
              醒來次數 :
              {{ useSleepRecordData.SleepRec[0]?.SleepBreak ?? "未填寫" }}
            </h5>
          </div>
        </section>

        <div v-if="useSleepRecordData?.SleepRec?.[1]">
          <h5>
            (前次){{
              formatTimestamp(useSleepRecordData.SleepRec[1]?.CheckTime)
            }}
          </h5>
          <section>
            <div class="sleepDetectItem">
              <h4>入睡時間</h4>
              <p>
                {{ useSleepRecordData.SleepRec[1]?.bedTime || "" }}
                <span>{{
                  getAmPm(useSleepRecordData.SleepRec[1]?.bedTime)
                }}</span>
              </p>
            </div>
            <div class="sleepDetectItem">
              <h4>離床時間</h4>
              <p>
                {{ useSleepRecordData.SleepRec[1]?.getupTime || "" }}
                <span>{{
                  getAmPm(useSleepRecordData.SleepRec[1]?.getupTime)
                }}</span>
              </p>
            </div>
            <div class="sleepDetectItem">
              <h4>睡眠時長</h4>
              <p>
                {{ useSleepRecordData.SleepRec[1]?.ccSleepExact || "" }}
              </p>
              <h5>
                醒來次數 :
                {{ useSleepRecordData.SleepRec[1]?.SleepBreak ?? "未填寫" }}
              </h5>
            </div>
          </section>
        </div>
      </div>

      <!-- 身心指數 -->
      <div
        class="sleepDetectResultList"
        v-if="useSleepRecordData?.SleepRec?.[0]"
      >
        <div class="titleGroup">
          <h3>身心指數</h3>
        </div>
        <h5>
          (本次){{ formatTimestamp(useSleepRecordData.SleepRec[0]?.CheckTime) }}
        </h5>
        <ProgressBar2
          :score="useSleepRecordData.SleepRec[0]?.HMindexRatio"
          :emojiSrc="
            computedEmoji2(useSleepRecordData.SleepRec[0]?.HMindexRatio)
          "
        />
        <h4>
          嚴重程度 :
          <span
            :style="{
              color: scoreColorFn(
                useSleepRecordData.SleepRec[0]?.HMindexRatio,
                0
              ),
            }"
          >
            {{ useSleepRecordData.SleepRec[0]?.HMindexRatio }}%
          </span>
        </h4>

        <div class="nextGroup" v-if="useSleepRecordData?.SleepRec?.[1]">
          <h5>
            (前次){{
              formatTimestamp(useSleepRecordData.SleepRec[1]?.CheckTime)
            }}
          </h5>
          <ProgressBar2
            :score="useSleepRecordData.SleepRec[1]?.HMindexRatio"
            :emojiSrc="
              computedEmoji2(useSleepRecordData.SleepRec[1]?.HMindexRatio)
            "
          />
          <h4>
            嚴重程度 :
            <span
              :style="{
                color: scoreColorFn(
                  useSleepRecordData.SleepRec[1]?.HMindexRatio,
                  0
                ),
              }"
            >
              {{ useSleepRecordData.SleepRec[1]?.HMindexRatio }}%
            </span>
          </h4>
        </div>
      </div>

      <!-- 壓力指數（這邊以示意用途，也取 Score，實際請看 API 是否分開欄位） -->
      <div
        class="sleepDetectResultList"
        v-if="useSleepRecordData?.SleepRec?.[0]"
      >
        <div class="titleGroup">
          <h3>壓力指數</h3>
        </div>
        <h5>
          (本次){{ formatTimestamp(useSleepRecordData.SleepRec[0]?.CheckTime) }}
        </h5>
        <ProgressBar2
          :score="useSleepRecordData.SleepRec[0]?.PressureindexRatio"
          :emojiSrc="
            computedEmoji2(useSleepRecordData.SleepRec[0]?.PressureindexRatio)
          "
        />
        <h4>
          嚴重程度 :
          <span
            :style="{
              color: scoreColorFn(
                useSleepRecordData.SleepRec[0]?.PressureindexRatio,
                1
              ), // 第二個參數改為 1 假設壓力類別
            }"
          >
            {{ useSleepRecordData.SleepRec[0]?.PressureindexRatio }}%
          </span>
        </h4>

        <div class="nextGroup" v-if="useSleepRecordData?.SleepRec?.[1]">
          <h5>
            (前次){{
              formatTimestamp(useSleepRecordData.SleepRec[1]?.CheckTime)
            }}
          </h5>
          <ProgressBar2
            :score="useSleepRecordData.SleepRec[1]?.PressureindexRatio"
            :emojiSrc="
              computedEmoji2(useSleepRecordData.SleepRec[1]?.PressureindexRatio)
            "
          />
          <h4>
            嚴重程度 :
            <span
              :style="{
                color: scoreColorFn(
                  useSleepRecordData.SleepRec[1]?.PressureindexRatio,
                  1
                ),
              }"
            >
              {{ useSleepRecordData.SleepRec[1]?.PressureindexRatio }}%
            </span>
          </h4>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
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
      height: 174px;
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
          color: $raphael-gray-300;
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
    background-color: $raphael-white;
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
        color: $raphael-red-300;
      }
    }
    .dashDiv {
      margin-top: 0.5rem;
    }
  }

  h6 {
    color: #666;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.5px;
    margin-top: 0.75rem;
  }

  .sleepDetectResultWrap {
    h6 {
      margin-bottom: 0.75rem;
    }
    .sleepDetectResultDIV {
      background-color: #fff;
      padding: 1rem;
      border-radius: 8px;

      h3 {
        color: var(--Neutral-black, #1e1e1e);
        font-size: 20px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: var(--Title-Medium-Tracking, 0.15px);
      }
      h5 {
        color: var(--Neutral-black, #1e1e1e);
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.5px;
        margin-top: 0.5rem;
        margin-bottom: 0.4rem;
      }
      section {
        display: flex;
        justify-content: space-between;
        h4 {
          color: var(--Neutral-500, #666);

          font-size: 16px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.5px;
        }
        p {
          color: var(--Neutral-300, #ccc);
          font-size: 16px;
          font-style: normal;
          letter-spacing: 0.5px;
        }
      }
      .sleepDetectItem {
        margin-top: 0.25rem;
        p {
          color: var(--Neutral-black, #1e1e1e);

          font-size: 24px;
          font-style: normal;
          font-weight: 700;

          letter-spacing: 0.12px;
          margin-top: 0.2rem;
          span {
            color: var(--Neutral-300, #ccc);

            font-size: 16px;
            font-style: normal;
            font-weight: 400;

            letter-spacing: 0.5px;
          }
        }
        h5 {
          margin-top: 0.25rem;
        }
      }
    }
  }

  .sleepDetectResultList {
    background-color: #fff;
    margin-top: 1rem;
    padding: 12px;
    border-radius: 8px;

    .titleGroup {
      color: var(--Neutral-black, #1e1e1e);
      font-size: 20px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
    }
    h5 {
      margin-top: 1rem;
      margin-bottom: 1rem;
    }
  }
}
</style>

<script>
import { defineComponent } from "@vue/composition-api";
import { scoreSleepColorFn, computedSleepEmoji } from "../fn/utils";
import { useSleepRecordStore } from "../stores/sleepRecord";
import { useRouter } from "vue-router";
import RaphaelLoading from "../components/RaphaelLoading";
import { scoreColorFn, computedEmoji2 } from "../fn/utils";

import {} from "../fn/utils";
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

    console.log(useSleepRecordData);

    const backToUser = () => {
      router.push({ name: "user" });
    };

    const formatCheckTime2 = (timestamp) => {
      if (!timestamp || timestamp.length !== 14) return "--";
      const year = timestamp.slice(0, 4);
      const month = timestamp.slice(4, 6);
      const day = timestamp.slice(6, 8);
      const hour = timestamp.slice(8, 10);
      const minute = timestamp.slice(10, 12);
      return `${year}/${month}/${day} ${hour}:${minute}`;
    };

    const formatTimestamp = (timestamp) => {
      if (!timestamp || timestamp.length !== 14) return "--";
      const year = timestamp.slice(0, 4);
      const month = timestamp.slice(4, 6);
      const day = timestamp.slice(6, 8);
      const hour = timestamp.slice(8, 10);
      const minute = timestamp.slice(10, 12);
      return `${year}/${month}/${day} ${hour}:${minute}`;
    };

    const getAmPm = (timeStr) => {
      if (!timeStr || typeof timeStr !== "string") return "";
      const hour = parseInt(timeStr.split(":")[0], 10);
      if (isNaN(hour)) return "";
      return hour >= 12 ? "pm" : "am";
    };

    return {
      useSleepRecordData,
      backToUser,
      scoreSleepColorFn,
      computedSleepEmoji,
      formatCheckTime2,
      scoreColorFn,
      formatTimestamp,
      computedEmoji2,
      getAmPm,
    };
  },
});
</script>
