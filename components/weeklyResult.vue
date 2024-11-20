<template>
  <div class="resultWrap">
    <!-- Top section: Display result info and severity -->
    <div class="resultTopGroup">
      <div class="resultInfo">
        <div class="resultHintText">
          {{
            store.diffDays >= 1 ? store.diffDays + "天" : store.diffDays
          }}後再進行檢測
        </div>
        <h5 class="subText">
          (本次){{ formatTimestamp(store.theLatestHistory.CheckTime) }}
        </h5>

        <div class="severity">
          <div class="imgGroup">
            <img :src="computedEmoji2(store.theLatestData.TotalScore)" alt="" />
            <div class="scoreText">
              <div
                class="score"
                :style="{
                  color: scoreColorFn(store.theLatestData.TotalScore, sex),
                }"
              >
                {{ store.theLatestData.TotalScore }}
              </div>
              <h5>分</h5>
            </div>
          </div>

          <ProgressBar
            :score="store.theLatestData.TotalScore"
            :colorProp="scoreColorFn(store.theLatestData.TotalScore, sex)"
          />

          <h6 class="severityText">
            嚴重程度 :
            <span
              :style="{
                color: scoreColorFn(store.theLatestData.TotalScore, sex),
              }"
            >
              {{ store.theLatestData.TotalRatio }}({{
                store.theLatestData.TotalDesc
              }})
            </span>
          </h6>
        </div>

        <h5
          class="subText nextSunText"
          v-if="store.theLatestHistoryPre.CheckTime"
        >
          (前次){{ formatTimestamp(store.theLatestHistoryPre.CheckTime) }}
        </h5>

        <!-- Previous check data -->
        <div class="severity" v-if="store.theLatestDataPreData.TotalScore">
          <div class="imgGroup">
            <img
              :src="computedEmoji2(store.theLatestDataPreData.TotalScore)"
              alt=""
            />
            <div class="scoreText">
              <div
                class="score"
                :style="{
                  color: scoreColorFn(
                    store.theLatestDataPreData.TotalScore,
                    sex
                  ),
                }"
              >
                {{ store.theLatestDataPreData?.TotalScore }}
              </div>
              <h5>分</h5>
            </div>
          </div>
          <ProgressBar
            :score="store.theLatestDataPreData.TotalScore"
            :colorProp="
              scoreColorFn(store.theLatestDataPreData.TotalScore, sex)
            "
          />
          <h6 class="severityText">
            嚴重程度 :
            <span
              :style="{
                color: scoreColorFn(store.theLatestDataPreData.TotalScore, sex),
              }"
            >
              {{ store.theLatestDataPreData.TotalRatio }}({{
                store.theLatestDataPreData.TotalDesc
              }})
            </span>
          </h6>
        </div>
      </div>
      <img class="doctorImg" src="../assets/imgs/doctor.png" alt="" />
    </div>

    <!-- Symptom analysis results -->
    <h4 class="textResultText">以下為分類系統的自律神經分析結果</h4>
    <div class="resultListGroup">
      <SymptomResult
        v-for="(symptom, index) in symptoms"
        :key="index"
        :symptomName="symptom.name"
        :symptomDifference="symptom.difference"
        :symptomSolve="symptom.solve"
        :symptomRatio="symptom.ratio"
        :symptomPreRatio="symptom.ratioPre"
        :symptomDesc="symptom.desc"
        :symptomPreDesc="symptom.descPre"
        :theLatestHistory="store.theLatestHistory"
        :theLatestHistoryPre="store.theLatestHistoryPre"
        :sex="sex"
      />
    </div>

    <!-- Symptom by severity -->
    <h4 class="textResultText">您最近常出現的症狀依困擾程度排序</h4>
    <div class="symptomWrap">
      <div class="symptomGroup">
        <div class="symptomButtonGroup">
          <button
            class="symptomBtn"
            :class="{ symptomBtnActive: selectedType === 'Serious' }"
            @click="changeSymptomLavel('Serious')"
          >
            嚴重
          </button>
          <button
            class="symptomBtn"
            :class="{ symptomBtnActive: selectedType === 'Middle' }"
            @click="changeSymptomLavel('Middle')"
          >
            中等
          </button>
          <button
            class="symptomBtn"
            :class="{ symptomBtnActive: selectedType === 'Light' }"
            @click="changeSymptomLavel('Light')"
          >
            輕微
          </button>
        </div>
        <div
          class="symptomMenuList symptomSeriousList"
          v-if="selectedType == 'Serious'"
        >
          <div
            class="symptomList"
            v-for="(item, index) in store.theLatestData.Serious"
            :key="index"
          >
            {{ item }}
          </div>
        </div>

        <div
          class="symptomMenuList symptomMeddleList"
          v-if="selectedType == 'Middle'"
        >
          <div
            class="symptomList"
            v-for="(item, index) in store.theLatestData.Middle"
            :key="index"
          >
            {{ item }}
          </div>
        </div>

        <div
          class="symptomMenuList symptomLightList"
          v-if="selectedType == 'Light'"
        >
          <div
            class="symptomList"
            v-for="(item, index) in store.theLatestData.Light"
            :key="index"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </div>

    <!-- Detection records -->
    <h4 class="textResultText" v-if="store.History.length > 0">檢測紀錄</h4>
    <!-- <h4 class="textResultText">檢測紀錄</h4> -->
    <div class="detectionWrap">
      <router-link
        class="detection"
        v-for="(history, index) in store.History"
        :key="index"
        :to="`/weeklyResultDetail/${history.preAID}`"
      >
        <div class="cGroup">
          <img class="img" src="../assets/imgs/calendar.png" alt="" />
        </div>
        <h3 class="detectionDate">
          {{ formatTimestamp3(history?.CheckTime) }}
        </h3>
        <div class="detectionGroup">
          <div class="scroeTotal">
            <h5>總分</h5>
            <div
              :style="{
                color: scoreColorFn(computedScore(history?.Score), sex),
              }"
              class="totalScore"
            >
              {{ history?.Score }}
            </div>
          </div>
          <div class="seriousDegreeGroup">
            <h5>嚴重程度</h5>
            <div
              :style="{
                color: scoreColorFn(computedScore(history?.Score), sex),
              }"
              class="seriousScore"
            >
              {{ history.Ratio }}
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
          >
            <path
              d="M5.99159 3.37719L11.4726 8.99994L5.99159 14.6227C5.89346 14.7232 5.83853 14.858 5.83853 14.9984C5.83853 15.1389 5.89346 15.2737 5.99159 15.3742C6.03925 15.4228 6.09613 15.4615 6.15891 15.4879C6.2217 15.5142 6.28911 15.5278 6.35721 15.5278C6.42531 15.5278 6.49273 15.5142 6.55551 15.4879C6.61829 15.4615 6.67518 15.4228 6.72284 15.3742L12.5548 9.39257C12.6572 9.28752 12.7145 9.14664 12.7145 8.99994C12.7145 8.85325 12.6572 8.71236 12.5548 8.60732L6.72396 2.62569C6.67627 2.57671 6.61924 2.53777 6.55625 2.51119C6.49326 2.4846 6.42558 2.4709 6.35721 2.4709C6.28884 2.4709 6.22116 2.4846 6.15817 2.51119C6.09518 2.53777 6.03816 2.57671 5.99046 2.62569C5.89234 2.72615 5.8374 2.86101 5.8374 3.00144C5.8374 3.14187 5.89234 3.27673 5.99046 3.37719L5.99159 3.37719Z"
              fill="#666666"
            />
          </svg>
        </div>
      </router-link>
    </div>

    <div class="backToUserBtnGroupWeekly">
      <button class="backToUserBtnWeekly" @click="backToUser">
        返回會員中心
      </button>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from "vue";
import SymptomResult from "./SymptomResult.vue";
import { useWeeklyRecord } from "../stores/weeklyQA";
import { useRouter } from "vue-router";
import { scoreColorFn, computedEmoji2, formatTimestamp } from "../fn/utils";
import { formatTimestamp3 } from "../fn/utils";
export default {
  components: { SymptomResult },
  setup() {
    const store = useWeeklyRecord();

    console.log(store.diffenenceObj);

    const router = useRouter();

    const backToUser = () => router.push({ name: "user" });

    const localData = localStorage.getItem("userData");
    const parsedData = localData ? JSON.parse(localData) : null;
    const sex = ref(parsedData?.Sex || null);

    const selectedType = ref("Serious");

    const changeSymptomLavel = (lavel) => {
      selectedType.value = lavel;
    };
    const symptoms = reactive([]);
    watchEffect(() => {
      symptoms.length = 0;
      for (let i = 1; i <= 9; i++) {
        symptoms.push({
          name: store.diffenenceObj[`C${i}Symptom`] || "",
          difference: store.diffenenceObj[`C${i}Difference`] || "",
          solve: store.diffenenceObj[`C${i}Solve`] || "",
          ratio: store.theLatestData[`C${i}Ratio`] || "",
          ratioPre: store.theLatestDataPreData[`C${i}Ratio`] || "",
          desc: store.theLatestData[`C${i}Desc`] || "",
          descPre: store.theLatestDataPreData[`C${i}Desc`] || "",
        });
      }
    });
    const computedScore = (scoreStr) =>
      parseFloat(scoreStr.replace("%", "")) || 0;

    return {
      store,
      formatTimestamp,
      backToUser,
      computedScore,
      selectedType,
      changeSymptomLavel,
      sex,
      symptoms,
      computedEmoji2,
      scoreColorFn,
      formatTimestamp3,
    };
  },
};
</script>

<style lang="scss">
.resultWrap {
  .resultTopGroup {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: calc(100% - 120px) max-content;
    margin-top: 0.5rem;
    overflow: hidden;

    .resultInfo {
      background-color: #fff;
      padding: 12px;
      border-radius: 12px;
      box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.25) inset;

      .subText {
        margin-bottom: 0.5rem;
      }

      .nextSunText {
        margin-top: 1rem;
      }

      .resultHintText {
        color: $raphael-green-400;
        font-weight: 400;
        font-size: 16px;
        letter-spacing: 0.048px;
        margin-bottom: 0.75rem;
      }

      .severityText {
        color: $raphael-gray-500;
        letter-spacing: 0.048px;
        span {
          color: #ec4f4f;
        }
      }
      .dashDiv {
        margin-top: 0.5rem;
      }
    }
    .pGroup {
      display: flex;
      align-items: center;
    }

    .imgGroup {
      display: flex;
      align-items: center;
      gap: 4px;

      img {
        width: 2.25rem;
        height: 2.25rem;
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
      .nextGroup {
        margin-top: 0.75rem;
      }
      .titleGroup {
        display: flex;
        align-items: center;
        gap: 2px;
        margin-bottom: 0.5rem;
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
        font-size: 20px;
        letter-spacing: 0.15px;
      }
      .resultTagGroup {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .resultTag {
          background: #fef1e2;
          padding: 4px 8px;
          border-radius: 12px;
          color: #666;
          font-size: 0.875rem;
        }
      }

      h5 {
        color: #1e1e1e;
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
  }

  .symptomGroup {
    background-color: #fff;
    border-radius: 12px;
    margin-top: 0.75rem;
    padding: 12px 16px;
    .symptomButtonGroup {
      display: flex;
      justify-content: space-between;
      gap: 3.5%;

      button {
        background-color: #f6f6f6;
        color: #666;
        font-size: 1rem;
        width: 32.5%;
        border: none;
        transition: 0.5s all ease;
        border-radius: 8px;
        padding: 6px 12px;

        &:hover {
          background-color: $raphael-green-400;
          color: #fff;
        }
      }
      .symptomBtnActive {
        background-color: $raphael-green-400;
        color: #fff;
      }
    }
    .symptomMenuList {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-gap: 0.5rem;
      margin-top: 0.25rem;
      @include fade-in;
      &:nth-child(1) {
        animation-delay: 0.1s;
      }
      .symptomList {
        display: flex;
        align-items: center;

        margin-top: 0.5rem;
      }
    }

    .symptomSeriousList {
      .symptomList {
        &::before {
          content: "";
          width: 4px;
          height: 100%;
          margin-right: 4px;
          display: inline-block;
          background: #bc581f;
          border-radius: 4px;
        }
      }
    }

    .symptomMeddleList {
      .symptomList {
        &::before {
          content: "";
          width: 4px;
          height: 100%;
          margin-right: 4px;
          display: inline-block;
          background: #65558f;
          border-radius: 4px;
        }
      }
    }

    .symptomLightList {
      .symptomList {
        &::before {
          content: "";
          width: 4px;
          height: 100%;
          margin-right: 4px;
          display: inline-block;
          background: #1fbcb3;
          border-radius: 4px;
        }
      }
    }
  }
  .detectionWrap {
    background-color: #fff;
    border-radius: 12px;

    margin-top: 0.85rem;
    max-height: 400px;
    overflow-y: auto; /* 超出高度時顯示滾動條 */
    .detection {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 16px;
      cursor: pointer;
      &:hover {
        background-color: #f4f4f4;
      }
      height: 80px;
      .cGroup {
        border: 2px solid $raphael-green-400;
        padding: 0.25rem;
        border-radius: 7px;
        img {
          width: 1rem;
          height: 1rem;
        }
      }

      .detectionGroup {
        margin-left: auto;
        display: flex;
        justify-content: center;
        align-items: center;

        gap: 14px;

        .scroeTotal,
        .seriousDegreeGroup {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          h5 {
            color: #666;
            font-size: 16px;
            letter-spacing: 0.1px;
            font-weight: 400;
          }
          .totalScore,
          .seriousScore {
            color: #1e1e1e;
            font-size: 24px;
            font-weight: bold;
          }
        }
      }
    }
    .detectionDate {
      font-size: 20px;
      color: #1e1e1e;
      letter-spacing: 0.15px;
    }
  }
}

.doctorImg {
  height: 174px;
}

.backToUserBtnGroupWeekly {
  width: 100%;
  margin-top: 1.5rem;
  padding-bottom: 4.25rem;
}
.backToUserBtnWeekly {
  background-color: $raphael-green-400;
  color: #fff;
  cursor: pointer;
  padding: 12px;
  width: 100%;
  border-radius: 8px;
  border: none;
  font-size: 1.125rem;
  font-weight: 400;
  letter-spacing: 0.5px;
  transition: 0.25s ease;
  &:hover {
    background-color: $raphael-green-500;
  }
}
</style>
