<template>
  <div class="resultWrap">
    <!-- (1) 上方：本次 & 前次 整體評估 -->
    <div class="resultTopGroup">
      <div class="resultInfo">
        <!-- (本次) -->

        <div v-if="latestScore">
          <h5 class="subText">(本次){{ removeTime(latestScore.CheckTime) }}</h5>

          <div class="severity">
            <div class="imgGroup">
              <!-- 依分數顯示表情圖 (ALL_Score為整體分數) -->
              <img :src="computedEmoji2(latestScore.ALL_Score)" alt="" />
              <div class="scoreText">
                <div
                  class="score"
                  :style="{ color: scoreColorFn(latestScore.ALL_Score) }"
                >
                  {{ latestScore.ALL_Score }}
                </div>
                <h5>分</h5>
              </div>
            </div>

            <!-- 進度條 (這裡用 ALL_Ratio 作為百分比) -->
            <ProgressBar
              :score="Number(latestScore.ALL_Ratio)"
              :colorProp="scoreColorFn(latestScore.ALL_Score)"
            />

            <h6 class="severityText">
              嚴重程度 :
              <span :style="{ color: scoreColorFn(latestScore.ALL_Score) }">
                {{ latestScore.ALL_Ratio }}% ({{ latestScore.ALL_Serious }})
              </span>
            </h6>
          </div>
        </div>

        <!-- (前次) -->
        <h5 class="subText nextSunText" v-if="previousScore">
          (前次){{ removeTime(previousScore.CheckTime) }}
        </h5>
        <div class="severity" v-if="previousScore">
          <div class="imgGroup">
            <img :src="computedEmoji2(previousScore.ALL_Score)" alt="" />
            <div class="scoreText">
              <div
                class="score"
                :style="{ color: scoreColorFn(previousScore.ALL_Score) }"
              >
                {{ previousScore.ALL_Score }}
              </div>
              <h5>分</h5>
            </div>
          </div>
          <ProgressBar
            :score="Number(previousScore.ALL_Ratio)"
            :colorProp="scoreColorFn(previousScore.ALL_Score)"
          />
          <h6 class="severityText">
            嚴重程度 :
            <span :style="{ color: scoreColorFn(previousScore.ALL_Score) }">
              {{ previousScore.ALL_Ratio }}% ({{ previousScore.ALL_Serious }})
            </span>
          </h6>
        </div>
      </div>

      <!-- 右邊醫生圖片 (如需要可保留) -->
      <img class="doctorImg" src="../../assets/imgs/doctor.png" alt="" />
    </div>

    <!-- (2) 說明文字 -->
    <h4 class="textResultText">以下為兒童指標的綜合分析結果</h4>

    <!-- (3) 列出每個指標（SymptomResultBaby） -->
    <div class="resultListGroup">
      <SymptomResultBaby
        v-for="(item, index) in latestChildScore"
        :key="item.Type"
        :symptomName="item.TypeName"
        :symptomSolve="item.Solve"
        :symptomRatio="item.Ratio + '%'"
        :symptomDesc="item.Serious"
        :symptomPreRatio="previousChildScore[index]?.Ratio + '%'"
        :symptomPreDesc="previousChildScore[index]?.Serious"
        :symptomDifference="computeDifference(index)"
        :theLatestHistory="{ CheckTime: item.CheckTime }"
        :theLatestHistoryPre="{
          CheckTime: previousChildScore[index]?.CheckTime,
        }"
        :sex="''"
      />
    </div>

    <!-- (4) 症狀依困擾程度排序 (若後端無資料，可先隱藏或給空陣列) -->
    <h4 class="textResultText" v-if="hasSeverityData">
      您最近常出現的症狀依困擾程度排序
    </h4>
    <div class="symptomWrap" v-if="hasSeverityData">
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

        <!-- 三種症狀列表 -->
        <div
          class="symptomMenuList symptomSeriousList"
          v-if="selectedType === 'Serious'"
        >
          <div
            class="symptomList"
            v-for="(item, idx) in seriousList"
            :key="idx"
          >
            {{ item }}
          </div>
        </div>
        <div
          class="symptomMenuList symptomMeddleList"
          v-if="selectedType === 'Middle'"
        >
          <div class="symptomList" v-for="(item, idx) in middleList" :key="idx">
            {{ item }}
          </div>
        </div>
        <div
          class="symptomMenuList symptomLightList"
          v-if="selectedType === 'Light'"
        >
          <div class="symptomList" v-for="(item, idx) in lightList" :key="idx">
            {{ item }}
          </div>
        </div>
      </div>
    </div>

    <!-- (5) 檢測紀錄 -->
    <h4 class="textResultText" v-if="historyList.length > 0">檢測紀錄</h4>
    <div class="detectionWrap" v-if="historyList.length > 0">
      <div
        class="detection"
        v-for="(history, idx) in historyList"
        :key="idx"
        @click="goDetail(history)"
      >
        <div class="cGroup">
          <img class="img" src="../assets/imgs/calendar.png" alt="" />
        </div>
        <h3 class="detectionDate">{{ history.CheckTime }}</h3>
        <div class="detectionGroup">
          <div class="scroeTotal">
            <h5>總分</h5>
            <div
              class="totalScore"
              :style="{ color: scoreColorFn(Number(history.Score)) }"
            >
              {{ history.Score }}
            </div>
          </div>
          <div class="seriousDegreeGroup">
            <h5>嚴重程度</h5>
            <div
              class="seriousScore"
              :style="{ color: scoreColorFn(Number(history.Score)) }"
            >
              {{ history.Ratio }}
            </div>
          </div>
          <!-- 可自行加箭頭 icon 或 SVG -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import SymptomResultBaby from "../SymptomResultBaby.vue";
import ProgressBar2 from "../ProgressBar2.vue";
import { scoreColorFn, computedEmoji2 } from "@/fn/utils";

export default {
  name: "BabyReportResult",
  components: {
    SymptomResultBaby,
    ProgressBar2,
  },
  props: {
    // 後端回傳的報告資料
    reportData: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    // 1) 取代舊的 ChildScore / preChildScore => Data / PreData
    const latestChildScore = computed(() => props.reportData?.Data || []);
    const previousChildScore = computed(() => props.reportData?.PreData || []);

    // 2) 以陣列第一筆作為「整體分數」(ALL_Score / ALL_Ratio / ALL_Serious / CheckTime)
    const latestScore = computed(() => latestChildScore.value[0] || null);
    const previousScore = computed(() => previousChildScore.value[0] || null);

    // 3) 若後端有「症狀嚴重度」的三個陣列 (Serious / Middle / Light) 可放這裡
    //    目前用空陣列示範
    const seriousList = computed(() => []);
    const middleList = computed(() => []);
    const lightList = computed(() => []);

    // 如果想顯示「症狀依困擾程度」區塊，請確保後端有提供對應陣列
    // 這邊簡單用布林來判斷是否顯示
    const hasSeverityData = computed(() => {
      return (
        seriousList.value.length > 0 ||
        middleList.value.length > 0 ||
        lightList.value.length > 0
      );
    });
   
    // 4) 檢測紀錄
    const historyList = computed(() => props.reportData?.History || []);

    // 5) 計算每個指標 (本次 vs 前次) 的差值 (以 Score)
    const computeDifference = (idx) => {
      const cur = latestChildScore.value[idx];
      const pre = previousChildScore.value[idx];
      if (!cur || !pre) return "0分";
      const diff = Number(cur.Score) - Number(pre.Score);
      if (diff === 0) return "0分";
      return (diff > 0 ? "+" : "") + diff + "分";
    };

    // 切換症狀顯示：嚴重 / 中等 / 輕微
    const selectedType = ref("Serious");
    function changeSymptomLavel(val) {
      selectedType.value = val;
    }

    // 事件：返回 & 查看紀錄詳情
    function goHome() {
      // 範例：router.push({ name: 'user' })
      console.log("返回會員中心");
    }
    function goDetail(item) {
      console.log("查看檢測紀錄：", item);
      // 範例：router.push(`/weeklyResultDetail/${item.AID}`)
    }

    const removeTime = (timestampStr) => {
      if (typeof timestampStr !== "string") {
        console.error("Invalid timestamp:", timestampStr);
        return "";
      }
      // 分割字串，取第一個部分
      const parts = timestampStr.split(" ");
      return parts[0] || "";
    };

    return {
      latestChildScore,
      previousChildScore,
      latestScore,
      previousScore,
      historyList,

      seriousList,
      middleList,
      lightList,
      selectedType,
      hasSeverityData,
      changeSymptomLavel,

      computeDifference,
      goHome,
      goDetail,

      // 工具方法
      scoreColorFn,
      computedEmoji2,
      removeTime
    };
  },
};
</script>

<style lang="scss">
.resultWrap {
  /* 上方：本次+前次 */
  margin-bottom:1rem;
  .resultTopGroup {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    .resultInfo {
      background-color: #fff;
      padding: 12px;
      border-radius: 12px;
      box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.25) inset;
      margin-top: 12px;
      .subText {
        margin-bottom: 0.5rem;
      }
      .nextSunText {
        margin-top: 1rem;
      }
      .severityText {
        color: #666;
        span {
          color: #ec4f4f;
        }
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
          display: flex;
          align-items: center;
          gap: 4px;
          .score {
            font-size: 2.25rem;
            font-weight: bold;
          }
          h5 {
            color: #ccc;
            font-size: 14px;
          }
        }
      }
    }

    .doctorImg {
      height: 174px; /* 看需求調整 */
    }
  }

  .textResultText {
    color: #666;
    margin-top: 1rem;
  }

  /* 各指標 SymptomResultBaby 列表 */
  .resultListGroup {
    margin-top: 0.75rem;
  }

  /* 症狀嚴重度切換區 */
  .symptomWrap {
    margin-top: 1rem;
    .symptomGroup {
      background-color: #fff;
      border-radius: 12px;
      margin-top: 0.75rem;
      padding: 12px 16px;

      .symptomButtonGroup {
        display: flex;
        button {
          background: transparent;
          border: none;
          padding: 4px 12px;
          cursor: pointer;
          font-size: 1rem;
          color: #666;
          &:hover {
            filter: brightness(0.9);
          }
        }
        .symptomBtnActive {
          border-bottom: 2px solid #74bc1f;
          color: #74bc1f;
        }
      }

      .symptomMenuList {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 0.5rem;
        margin-top: 0.25rem;
        .symptomList {
          display: flex;
          align-items: center;
          margin-top: 0.5rem;
        }
      }
      .symptomSeriousList .symptomList::before {
        content: "";
        width: 4px;
        height: 100%;
        margin-right: 4px;
        display: inline-block;
        background: #bc581f;
        border-radius: 4px;
      }
      .symptomMeddleList .symptomList::before {
        content: "";
        width: 4px;
        height: 100%;
        margin-right: 4px;
        display: inline-block;
        background: #65558f;
        border-radius: 4px;
      }
      .symptomLightList .symptomList::before {
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

  /* 檢測紀錄 */
  .detectionWrap {
    background-color: #fff;
    border-radius: 12px;
    margin-top: 0.85rem;
    max-height: 400px;
    overflow-y: auto;

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
        border: 2px solid #74bc1f;
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
        gap: 14px;
        align-items: center;

        .scroeTotal,
        .seriousDegreeGroup {
          display: flex;
          flex-direction: column;
          align-items: baseline;
          gap: 8px;
          h5 {
            color: #666;
            font-size: 16px;
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
      .detectionDate {
        font-size: 20px;
        color: #1e1e1e;
      }
    }
  }

  /* 返回會員中心按鈕 */
  .backToUserBtnGroupWeekly {
    width: 100%;
    margin-top: 1.5rem;
    padding-bottom: 3.125rem;
    text-align: center;
    .backToUserBtnWeekly {
      background: #74bc1f;
      border: none;
      border-radius: 4px;
      color: #fff;
      padding: 0.5rem 1.25rem;
      cursor: pointer;
      font-size: 1rem;
      &:hover {
        filter: brightness(0.95);
      }
    }
  }
}
</style>
