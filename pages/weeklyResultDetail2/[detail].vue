<template>
  <RaphaelLoading v-if="loading" />

  <div class="resultWrapDetail">
    <TitleMenu Text="結果分析" link="/weekly2" :scrollToBottom="true" />
    <div class="resultTopGroup">
      <div class="resultInfo">
        <h4>姓名 : {{ compareData.ChildInfo?.[0]?.Name || "寶貝" }}</h4>
      </div>
      <img class="doctorImg" src="~/assets/imgs/doctor.png" alt="" />
    </div>

    <h4 class="textResultText">以下為兒童指標的綜合分析結果，僅供醫師參考，不具診斷功能．</h4>
    <div class="resultListGroup">
      <SymptomResult2Compare
        v-for="(item, index) in combinedScores"
        :key="index"
        :symptomName="item.TypeName"
        :current="item.current || {}"
        :previous="item.previous || {}"
        :sex="compareData.ChildInfo?.Sex || ''"
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
import { ref, onMounted } from "vue";
import SymptomResult2Compare from "~/components/SymptomResult2Compare.vue";
import { useRoute } from "vue-router";
import axios from "axios";
import TitleMenu from "~/components/TitleMenu.vue";

export default {
  components: { SymptomResult2Compare, TitleMenu },
  setup() {
    const route = useRoute();
    const compareData = ref({});
    const combinedScores = ref([]);
    const loading = ref(true);

    const API_API_ANSFirstDetail = async () => {
      const localData = JSON.parse(localStorage.getItem("userData") || "{}");
      const { MID, Token, MAID, Mobile } = localData;
      const AID = route.params.detail;

      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_BB_GrowthCompare.jsp",
          {
            MID: String(MID),
            Token: String(Token),
            MAID: String(MAID),
            Mobile: String(Mobile),
            AID: AID,
          }
        );

        if (response.status === 200) {
          compareData.value = response.data;

          // 整合 ChildScore 和 preChildScore
          const childScore = response.data.ChildScore || [];
          const preChildScore = response.data.preChildScore || [];

          const combined = childScore.map((current) => {
            const previous = preChildScore.find(
              (prev) => prev.Type === current.Type
            );
            return {
              Type: current.Type,
              TypeName: current.TypeName,
              current: {
                CheckTime: current.CheckTime,
                Ratio: current.Ratio,
                Score: current.Score,
                Serious: current.Serious,
              },
              previous: previous
                ? {
                    CheckTime: previous.CheckTime,
                    Ratio: previous.Ratio,
                    Score: previous.Score,
                    Serious: previous.Serious,
                  }
                : null,
            };
          });

          // 加入僅在 preChildScore 中存在的指標
          preChildScore.forEach((previous) => {
            if (!combined.find((item) => item.Type === previous.Type)) {
              combined.push({
                Type: previous.Type,
                TypeName: previous.TypeName,
                current: null,
                previous: {
                  CheckTime: previous.CheckTime,
                  Ratio: previous.Ratio,
                  Score: previous.Score,
                  Serious: previous.Serious,
                },
              });
            }
          });

          combinedScores.value = combined;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      API_API_ANSFirstDetail();
    });

    const backToUser = () => {
      window.location.href = "/user";
    };

    return {
      compareData,
      combinedScores,
      loading,
      backToUser,
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
      background-color: $raphael-white;
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
          color: $raphael-red-300;
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
          color: $raphael-gray-300;
          font-size: 14px;
        }
      }
    }
  }
  .textResultText {
    color: $raphael-gray-500;
    margin-top: 1rem;
  }
  .resultListGroup {
    .resultList {
      background-color: $raphael-white;
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
          color: $raphael-red-300;
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
          color: $raphael-red-300;
          font-size: 12px;
        }
      }
      h3 {
        color: $raphael-black;
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
          color: $raphael-gray-500;
          font-size: 0.875rem;
        }
      }

      h5 {
        color: $raphael-black;
        letter-spacing: 0.1px;
        margin-top: 0.75rem;
      }
      h4 {
        color: $raphael-gray-500;
        span {
          color: $raphael-red-300;
        }
      }
    }
  }

  .symptomGroup {
    background-color: $raphael-white;
    border-radius: 12px;
    margin-top: 0.75rem;
    padding: 12px 16px;
    .symptomButtonGroup {
      display: grid;
      grid-auto-flow: column;

      button {
        background-color: transparent;
        color: $raphael-gray-300;
        font-size: 1.125rem;
        width: 100%;
        border: none;
        transition: 0.5s all ease;
        border-radius: 8px;
        padding: 0.5rem 0.75rem;

        &:hover {
          background-color: $raphael-green-300;
          color: $raphael-black;
        }
      }
      .symptomBtnActive {
        background-color: $raphael-green-400;
        color: $raphael-white;
        &:hover {
          background-color: $raphael-green-400;
          color: $raphael-white;
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
          background: $raphael-brown-400;
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
          background: $raphael-purple-200;
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
          background: $raphael-cyan-400;
          border-radius: 4px;
        }
      }
    }
  }
  .detectionWrap {
    background-color: $raphael-white;
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
            color: $raphael-gray-500;
            font-size: 16px;
            letter-spacing: 0.1px;
            font-weight: 400;
          }
          .totalScore,
          .seriousScore {
            color: $raphael-black;
            font-size: 24px;
            font-weight: bold;
          }
        }
      }
    }
    .detectionDate {
      font-size: 20px;
      color: $raphael-black;
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
  color: $raphael-white;
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
