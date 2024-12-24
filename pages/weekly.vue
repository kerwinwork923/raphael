<template>
  <RaphaelLoading v-if="common.isLoading" />
  <div class="weeklyRecord">
    <TitleMenu :Text="h1Text" link="/user" />

    <div class="weeklyQAGroup">
      <TagList />
      <StepIndicator
        v-if="store.nowState !== 'first' && store.nowState !== 'second' && store.nowState == 'result'"
        :stepTexts="['填寫問卷', '結果分析']"
        :currentStep="1"
      />

      <StepIndicator
        v-if="store.nowState !== 'first' && store.nowState !== 'second' && store.nowState !== 'result'"
        :stepTexts="['填寫問卷', '結果分析']"
        :currentStep="0"
      />
      <div class="subListTitle" v-if="store.nowState == 'score'">
        以下問題對您的困擾程度
      </div>
      <div class="subListTitle" v-if="store.nowState == 'times'">
        以下問題上週發生幾次
      </div>
      <div class="subListTitle" v-if="store.nowState == 'choose'">
        您好, 下列為您目前覺得困擾的症狀，請從中選擇<strong
          >最多10個目前最想解決的症狀</strong
        >
      </div>

      <div class="ANSGroup" v-if="store.nowState == 'first'">
        <h4>自律神經自覺症狀量表</h4>
        <div>
          透過100種症狀的分析，全面了解您的自律神經不平衡程度。填寫量表需花費約<span>25分鐘</span>，填寫共分為三個步驟：
          <ul>
            <li>依<span>當下感覺逐題評估</span>，填寫每項症狀的嚴重程度。</li>
            <li>針對困擾您的症狀，<span>填寫每週發生的頻率</span>。</li>
            <li>挑選<span>3-10項</span>您目前最困擾的症狀。</li>
          </ul>
        </div>
      </div>
      <!-- v-if="store.nowState =='second'" -->
      <div class="AnsGroup2" v-if="store.nowState == 'second'">
        <h5>請依照您今日的需求，選擇您想要的評估方式</h5>
        <div class="chooseGroup">
          <div
            class="chooseBox"
            :class="{ active: store.version === 'tracking' }"
            @click="store.setVersion('tracking')"
          >
            <h4>症狀追蹤</h4>
            <p>只評估上次有問題的症狀，花費5-10分鐘的時間。</p>
            <div class="bgImg">
              <img src="/assets/imgs/3DMap.png" alt="症狀追蹤" />
            </div>
          </div>
          <div
            class="chooseBox"
            :class="{ active: store.version === 'full' }"
            @click="store.setVersion('full')"
          >
            <h4>完整評估</h4>
            <p>檢查所有可能的症狀，需花費約25分鐘的時間。</p>
            <div class="bgImg">
              <img src="/assets/imgs/3DTest.png" alt="完整評估" />
            </div>
          </div>
        </div>
      </div>

      <WeeklyResult v-if="store.nowState == 'result'" />
      <WeeklyScoreBar
        v-if="store.nowState == 'score'"
        :version="activeChoice === 'symptomTracking' ? 'tracking' : 'full'"
      />
      <TagTimesList v-if="store.nowState == 'times'" />
      <SymptomChoose v-if="store.nowState == 'choose'" />
    </div>

    <div
      class="weeklyBtnGroup"
      v-if="
        store.nowState === 'first' ||
        store.nowState === 'second' ||
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
          !(store.nowState === 'first') &&
          !(store.nowState === 'second') &&
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
import { useWeeklyRecord } from "~/stores/weeklyQA.js";
import WeeklyScoreBar from "~/components/WeeklyScoreBar.vue";
import TagTimesList from "~/components/TagTimesList.vue";
import SymptomChoose from "~/components/SymptomChoose.vue";
import { useCommon } from "@/stores/common";
import StepIndicator from "~/components/StepIndicator.vue";
import TitleMenu from "~/components/TitleMenu.vue";
export default {
  components: {
    Navbar,
    TagList,
    WeeklyScoreBar,
    TagTimesList,
    SymptomChoose,
    RaphaelLoading,
    StepIndicator,
    TitleMenu,
  },
  setup() {
    const router = useRouter();
    const localData = localStorage.getItem("userData");
    let MID, Token, MAID, Mobile;

    const activeChoice = ref("symptomTracking");
    const displayedQuestions = computed(
      () =>
        activeChoice.value === "symptomTracking"
          ? store.filteredQuestions // 症狀追蹤版本的題目
          : store.fullQuestions // 完整版本的題目
    );

    const setActiveChoice = (choice) => {
      activeChoice.value = choice;
    };

    try {
      if (localData) {
        ({ MID, Token, MAID, Mobile } = JSON.parse(localData));
      }
    } catch (e) {
      console.error("Error parsing localStorage data", e);
    }

    if (!MID || !Token || !MAID || !Mobile) {
      router.push("/");
      return;
    }
    const store = useWeeklyRecord();
    const common = useCommon();

    const start = async () => {
      common.startLoading();
      await store.API_API_ANSFirstDetail();

      common.stopLoading();
    };

    start();

    // store.API_API_ANSSecond()
    const h1Text = computed(() => {
      switch (store.nowState) {
        case "score":
        case "times":
        case "choose":
          return "健康紀錄";
        case "result":
          return "結果分析";
        default:
          return "健康紀錄";
      }
    });

    const resultChange = () => {
      store.nowState = "result";
    };

    return {
      store,
      h1Text,
      common,
      resultChange,
      useCommon,
      activeChoice,
      setActiveChoice,
      displayedQuestions,
    };
  },
};
</script>

<style lang="scss" scoped>
.weeklyRecord {
  background-color: $raphael-gray-100;
  display: flex;
  flex-direction: column;
  place-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 0 1rem;

  .weeklyQAGroup {
    max-width: 768px;
    width: 100%;
    padding: 0.75rem 0 0;
  }

  .subListTitle {
    color: $raphael-gray-500;
    font-weight: 400;
    line-height: 25.9px;
    letter-spacing: 0.5px;
    margin: 0.75rem 0 0.5rem 0;
  }
  .subListActive {
    color: $raphael-red-300;
  }

  .weeklyBtnGroup {
    background-color: $raphael-gray-100;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
    max-width: 768px;
    width: 100%;
    padding: 0.75rem 0 3.125rem 0;
    touch-action: manipulation;
  }
  .weeklyBtn {
    @include btnStyle($raphael-green-400, $raphael-white);
    &:disabled {
      opacity: 0.5;
    }
  }
  .preBtn {
    background-color: $raphael-gray-200;
    color: $raphael-gray-500;
  }
  .ANSGroup {
    margin-top: 1rem;
    margin-bottom: 0.75rem;
    h4 {
      color: $raphael-black;
      font-size: 20px;
      font-style: normal;
      font-weight: bold;
      line-height: 100%;
      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
    }
    & > div {
      color: $raphael-gray-500;
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      line-height: 29.1px;
      letter-spacing: 0.09px;
      margin-top: 0.5rem;
    }
    ul {
      position: relative;
      color: $raphael-gray-500;
      font-size: 18px;
      counter-reset: list-counter;
      li {
        line-height: 29.1px;
        counter-increment: list-counter;
        padding-left: 1.125rem;
        &::before {
          content: counter(list-counter) ". ";
          position: absolute;
          left: 0;
        }
      }
    }
    span {
      color: $raphael-red-300;
    }
  }
  .AnsGroup2 {
    margin-top: 1rem;
    margin-bottom: 0.75rem;
    h5 {
      color: $raphael-gray-500;
      font-size: 16px;
      line-height: 25.888px;
      letter-spacing: 0.5px;
    }
    .chooseGroup {
      margin-top: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .chooseBox {
        background-color: $raphael-white;
        cursor: pointer;
        padding: 0.75rem;
        border-radius: 8px;
        transition: all 0.2s ease;
        position: relative;

        .bgImg {
          position: absolute;
          right: 0;
          bottom: 0;
          img {
            width: 125px;
          }
        }
        &.active {
          background-color: $raphael-cyan-400;
          color: $raphael-white;

          h4 {
            color: $raphael-white;
          }

          p {
            color: $raphael-white;
          }
        }

        h4 {
          font-size: 20px;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        p {
          font-size: 18px;
          color: $raphael-gray-500;
          line-height: 1.5;
        }
      }
    }
  }
}
</style>
