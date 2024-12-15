<template>
  <RaphaelLoading v-if="loading" />

  <div class="resultWrapDetail">
    <TitleMenu Text="結果分析" link="/weekly" :scrollToBottom="true" />
    <div class="resultTopGroup">
      <div class="resultInfo">
        <h5 class="subText">
          (本次){{ formatTimestamp(theLatestHistory?.CheckTime) }}
        </h5>

        <div class="severity">
          <div class="imgGroup">
            <img :src="computedEmoji2(theLatestData?.TotalScore)" alt="" />
            <div class="scoreText">
              <div
                class="score"
                :style="{
                  color: scoreColorFn(theLatestData?.TotalScore, sex),
                }"
              >
                {{ theLatestData?.TotalScore }}
              </div>
              <h5>分</h5>
            </div>
          </div>

          <ProgressBar
            :score="theLatestData?.TotalScore"
            :colorProp="scoreColorFn(theLatestData?.TotalScore, sex)"
          />

          <h6 class="severityText">
            嚴重程度 :
            <span
              :style="{
                color: scoreColorFn(theLatestData?.TotalScore, sex),
              }"
            >
              {{ theLatestData?.TotalRatio }}({{ theLatestData?.TotalDesc }})
            </span>
          </h6>
        </div>

        <h5 class="subText nextSunText" v-if="theLatestHistoryPre?.CheckTime">
          (前次){{ formatTimestamp(theLatestHistoryPre?.CheckTime) }}
        </h5>

        <div class="severity" v-if="theLatestDataPreData?.TotalScore">
          <div class="imgGroup">
            <img
              :src="computedEmoji2(theLatestDataPreData?.TotalScore)"
              alt=""
            />
            <div class="scoreText">
              <div
                class="score"
                :style="{
                  color: scoreColorFn(theLatestDataPreData?.TotalScore, sex),
                }"
              >
                {{ theLatestDataPreData?.TotalScore }}
              </div>
              <h5>分</h5>
            </div>
          </div>
          <ProgressBar
            :score="theLatestDataPreData.TotalScore"
            :colorProp="scoreColorFn(theLatestDataPreData?.TotalScore, sex)"
          />
          <h6 class="severityText">
            嚴重程度 :
            <span
              :style="{
                color: scoreColorFn(theLatestDataPreData?.TotalScore, sex),
              }"
            >
              {{ theLatestDataPreData?.TotalRatio }}({{
                theLatestDataPreData?.TotalDesc
              }})
            </span>
          </h6>
        </div>
      </div>
      <img class="doctorImg" src="~/assets/imgs/doctor.png" alt="" />
    </div>

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
        :theLatestHistory="theLatestHistory"
        :theLatestHistoryPre="theLatestHistoryPre"
        :sex="sex"
      />
    </div>

    <div class="backToUserBtnGroupWeekly">
      <button class="backToUserBtnWeekly" @click="backToUser">
        返回會員中心
      </button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import SymptomResult from "~/components/SymptomResult.vue";
import { useWeeklyRecord } from "~/stores/weeklyQA";
import { useRoute } from "vue-router";
import axios from "axios";
import { scoreColorFn, computedEmoji2, formatTimestamp } from "~/fn/utils";
import { formatTimestamp3 } from "~/fn/utils";
import TitleMenu from "~/components/TitleMenu.vue";

export default {
  components: { SymptomResult },
  setup() {
    const store = useWeeklyRecord();
    console.log(store.diffenenceObj);
    const route = useRoute();
    const theLatestHistory = ref();
    const theLatestHistoryPre = ref();
    const theLatestData = ref();
    const theLatestDataPreData = ref();
    const preAID = ref();
    const diffenenceObj = ref();
    const loading  = ref();

    const AID = route.params.detail;

    const API_API_ANSFirstDetail = async () => {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile } = localData
        ? JSON.parse(localData)
        : {};
      try {
        const response1 = await axios.post(
          "https://23700999.com:8081/HMA/API_ANSFirstDetail.jsp",
          {
            MID: String(MID),
            Token: String(Token),
            MAID: String(MAID),
            Mobile: String(Mobile),
            AID: AID,
          }
        );
        if (response1.status === 200) {
          console.log(response1);

          // 儲存目前資料
          theLatestData.value = response1.data;
          theLatestHistory.value = {
            CheckTime: response1.data.CheckTime,
          };

          // 檢查 History 是否存在且有內容
          if (response1.data.History.length>0)  {
        

            try {
              // 發送第二次請求
              const response2 = await axios.post(
                "https://23700999.com:8081/HMA/API_ANSFirstDetail.jsp",
                {
                  MID: String(MID),
                  Token: String(Token),
                  MAID: String(MAID),
                  Mobile: String(Mobile),
                  AID: response1.data.History[0].preAID, 
                }
              );

              // 處理第二次請求的回應
              if (response2.status === 200) {
                theLatestDataPreData.value = response2.data;
                theLatestHistoryPre.value = {
                  CheckTime: response2.data.CheckTime,
                };
              } else {
                console.error("Response2 status not OK:", response2.status);
              }
            } catch (error) {
              console.error("Error in response2 request:", error);
            }
          } else {
            console.warn("No History data available.");
          }

          // 印出目前資料
          console.log(theLatestData.value);
        }
      } catch (err) {
        console.error("Error while fetching questions:", err);
        throw err;
      }
    };

    const API_API_ANSSecond = async () => {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile } = localData
        ? JSON.parse(localData)
        : {};

      try {
        const response1 = await axios.post(
          "https://23700999.com:8081/HMA/API_ANSSecond.jsp",
          {
            MID: String(MID),
            Token: String(Token),
            MAID: String(MAID),
            Mobile: String(Mobile),
            AID: AID,
            preAID: preAID?.value,
          }
        );

        if (response1.status === 200) {
          console.log(response1.data);
          diffenenceObj.value = {
            ...response1.data,
            C1Symptom: "精神系統",
            C2Symptom: "神經系統",
            C3Symptom: "血液循環系統",
            C4Symptom: "感官系統",
            C5Symptom: "心肺系統",
            C6Symptom: "過敏免疫系統",
            C7Symptom: "腸胃系統",
            C8Symptom: "泌尿生殖系統",
            C9Symptom: "血液循環系統",
          };
        }
      } catch (err) {
        console.error("Error while fetching questions:", err);
        throw err;
      }
    };

    const fetchAPI = async () => {
      loading.value = true
      await API_API_ANSFirstDetail();
      await API_API_ANSSecond();
      loading.value = false
    };

    fetchAPI();

    const backToUser = () => {window.location.href="/user"};
    const localData = localStorage.getItem("userData");
    const parsedData = localData ? JSON.parse(localData) : null;
    const sex = ref(parsedData?.Sex || null);
    const selectedType = ref("Serious");
    const changeSymptomLavel = (lavel) => {
      selectedType.value = lavel;
    };
    const symptoms = reactive([]);
    watchEffect(() => {
      // 清空 symptoms
      symptoms.length = 0;
      console.log(diffenenceObj.value);

      // 確保 diffenenceObj 和 theLatestData 等有數據時才進行處理
      if (diffenenceObj.value && theLatestData.value) {
        for (let i = 1; i <= 9; i++) {
          symptoms.push({
            name: diffenenceObj.value[`C${i}Symptom`] || "",
            difference: diffenenceObj.value[`C${i}Difference`] || "",
            solve: diffenenceObj.value[`C${i}Solve`] || "",
            ratio: theLatestData.value[`C${i}Ratio`] || "",
            ratioPre: theLatestDataPreData.value?.[`C${i}Ratio`] || "",
            desc: theLatestData.value[`C${i}Desc`] || "",
            descPre: theLatestDataPreData.value?.[`C${i}Desc`] || "",
          });
        }
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
      TitleMenu,
      theLatestData,
      diffenenceObj,
      theLatestDataPreData,
      theLatestDataPreData,
      theLatestHistory,
      theLatestHistoryPre,
      loading
    };
  },
};
</script>

<style lang="scss">
.resultWrapDetail {
  padding: 0 5% 2rem;
  background-color: $raphael-gray-100;
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
        margin-bottom: 0.75rem;
      }

      .nextSunText {
        margin-top: 0.75rem;
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
        color: #1e1e1e;
        letter-spacing: 0.1px;
        margin-top: 0.75rem;
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
      display: grid;
      grid-auto-flow: column;

      button {
        background-color: transparent;
        color: #ddd;
        font-size: 1.125rem;
        width: 100%;
        border: none;
        transition: 0.5s all ease;
        border-radius: 8px;
        padding: 0.5rem 0.75rem;

        &:hover {
          background-color: $raphael-green-300;
          color: #1e1e1e;
        }
      }
      .symptomBtnActive {
        background-color: $raphael-green-400;
        color: #fff;     
        &:hover {
          background-color: $raphael-green-400;
          color: #fff;
        }
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
          align-items: baseline;
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
  margin-top: 1.25rem;
  width: 100%;
}
.backToUserBtnWeekly {
  background-color: $raphael-green-400;
  color: #fff;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
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
