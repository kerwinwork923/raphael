<template>
  <RaphaelLoading v-if="common.isLoading" />

  <div class="weeklyRecord">
    <TitleMenu :Text="h1Text" link="/user" />

    <div class="weeklyQAGroup">
      <TagList />
      <StepIndicator
        v-if="store.nowState == 'result'"
        :stepTexts="['填寫問卷', '結果分析']"
        :currentStep="1"
      />

      <StepIndicator
        v-if="store.nowState !== 'result'"
        :stepTexts="['填寫問卷', '結果分析']"
        :currentStep="0"
      />

      <div class="babyRecord">
        <div class="babyGroup">
          <h3>{{ ChildInfo[0].Name || "寶貝" }}</h3>
          <div class="subGroup">
            <p>問卷進度</p>
            <div class="number">{{ store.babyScrollProgress }}%</div>
          </div>
          <div class="QAScrollBar">
            <div
              class="progress"
              :style="{ width: store.babyScrollProgress + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <div class="subListTitle" v-if="store.nowState == 'score'">
        以下問題的困擾程度
      </div>
      <div class="subListTitle" v-if="store.nowState == 'times'">
        以下問題上週發生幾次
      </div>
      <div class="subListTitle" v-if="store.nowState == 'choose'">
        您好, 下列為您目前覺得困擾的症狀，請從中選擇<strong
          >最多10個目前最想解決的症狀</strong
        >
      </div>

      <WeeklyResult2 v-if="store.nowState == 'result'" />
      <WeeklyScoreBar2 v-if="store.nowState == 'score'" />
      <TagTimesList2 v-if="store.nowState == 'times'" />
      <SymptomChoose2 v-if="store.nowState == 'choose'" />
    </div>

    <div
      class="weeklyBtnGroup"
      v-if="
        store.nowState === 'score' ||
        store.nowState === 'times' ||
        store.nowState === 'choose'
      "
    >
      <button
        class="weeklyBtn preBtn"
        @click="store.handlePrevStep"
        :disabled="preDisabled"
        v-if="
          !(store.nowState === 'score' && store.currentStep === 1) &&
          !(store.nowState === 'times' && store.timesStep === 1) &&
          !(store.nowState === 'choose' && store.timesStep === 1)
        "
      >
        {{ store.preText }}
      </button>
      <button class="weeklyBtn" @click="store.handleNextStep">
        {{ store.nextText }}
      </button>
    </div>
  </div>
</template>

<script>
import Navbar from "~/components/Navbar.vue";
import TagList from "../components/TagList.vue";
import RaphaelLoading from "~/components/RaphaelLoading.vue";
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useWeeklyRecord } from "~/stores/weeklyQA2.js";
import WeeklyScoreBar2 from "~/components/WeeklyScoreBar2.vue";
import TagTimesList2 from "~/components/TagTimesList2.vue";
import SymptomChoose2 from "~/components/SymptomChoose2.vue";
import { useCommon } from "@/stores/common";
import StepIndicator from "~/components/StepIndicator.vue";
import TitleMenu from "~/components/TitleMenu.vue";

export default {
  components: {
    Navbar,
    TagList,
    WeeklyScoreBar2,
    TagTimesList2,
    SymptomChoose2,
    RaphaelLoading,
    StepIndicator,
    TitleMenu,
  },
  setup() {
    const router = useRouter();
    const localData = localStorage.getItem("userData");
    let MID,
      Token,
      MAID,
      Mobile,
      ChildInfo = [];

    try {
      if (localData) {
        // Parse localStorage data
        ({ MID, Token, MAID, Mobile, ChildInfo = [] } = JSON.parse(localData));
      }
    } catch (e) {
      console.error("Error parsing localStorage data", e);
    }

    // Redirect to home page if critical data is missing
    if (!MID || !Token || !MAID || !Mobile) {
      router.push("/");
      return;
    }

    const store = useWeeklyRecord();
    const common = useCommon();

    // Dynamic title based on state
    const h1Text = computed(() => {
      switch (store.nowState) {
        case "score":
        case "times":
        case "choose":
          return "寶貝紀錄";
        case "result":
          return "結果分析";
        default:
          return "健康紀錄";
      }
    });

    // Handle state changes
    const resultChange = () => {
      store.nowState = "result";
    };

    // Progress bar reference
    const progress = ref(0);

    onMounted(async () => {
      try {
        await store.fetchResultAnalysis("");
      } catch (error) {
        console.error("Error during fetchResultAnalysis:", error);
      }
    });

    return {
      store,
      h1Text,
      common,
      resultChange,
      progress,
      ChildInfo, // Ensure it's included in the returned data
    };
  },
};
</script>

<style lang="scss">
.weeklyRecord {
  background-color: $raphael-gray-100;
  display: flex;
  flex-direction: column;
  place-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 0 1rem;
  overflow-y: hidden;
  .weeklyQAGroup {
    max-width: 768px;
    width: 100%;
  }

  .subListTitle {
    color: #666;
    font-weight: 400;
    line-height: 25.9px;
    letter-spacing: 0.5px;
    margin: 0.75rem 0 0.5rem 0;
  }
  .subListActive {
    color: #ec4f4f;
  }

  .weeklyBtnGroup {
    background-color: #f6f6f6;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
    position: fixed;
    bottom: -0.15%;
    width: 100%;
    padding: 0 5%;
    height: 54px;
    line-height: 1.5;
    touch-action: manipulation;
  }
  .weeklyBtn {
    background-color: $raphael-green-400;
    color: #fff;
    padding: 12px;
    width: 100%;
    border-radius: 8px;
    border: none;
    font-size: 1.125rem;
    font-weight: 400;
    letter-spacing: 0.5px;
    transition: 0.25s ease;
    padding: 8px;
    margin-bottom: 2rem;

    cursor: pointer;
    &:disabled {
      opacity: 0.5;
    }
  }
  .preBtn {
    background-color: #dfdfdf;
    color: #666;
  }

  .babyRecord {
    width: 100%;
    margin: 1rem 0 0 0;
    .babyGroup {
      width: 100%;
      background-color: #fff;
      border-radius: 8px;
      padding: 8px 12px;
      text-align: center;
      h3 {
        font-size: 1.25rem;
        letter-spacing: 0.5px;
      }
      .subGroup {
        display: flex;
        justify-content: space-between;
      }
      .QAScrollBar {
        position: relative;
        background-color: #eee;
        border-radius: 5px;
        height: 8px;
        width: 100%;
        overflow: hidden;
        margin: 6px 0;
        .progress {
          position: absolute;
          height: 100%;
          background-color: #65558f;
          border-radius: 5px;
          transition: width 0.3s ease;
        }
      }
    }
  }
}
</style>
