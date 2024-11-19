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

      <WeeklyResult v-if="store.nowState == 'result'" />
      <WeeklyScoreBar v-if="store.nowState == 'score'" />
      <TagTimesList v-if="store.nowState == 'times'" />
      <SymptomChoose v-if="store.nowState == 'choose'" />
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
          return "每週評估";
        case "result":
          return "結果分析";
        default:
          return "每週評估";
      }
    });

    const resultChange = () => {
      store.nowState = "result";
    };

    return { store, h1Text, common, resultChange, useCommon };
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
  padding-bottom: 66px;

  .weeklyQAGroup {
    max-width: 768px;
    width: 100%;
    padding: 0.75rem 0 64px;
  }

  .subListTitle {
    color: #666;
    margin-top: 1.25rem;
    letter-spacing: 0.5px;
    font-weight: 400;
    margin-bottom: 0.75rem;
  }
  .subListActive {
    color: #ec4f4f;
  }

  .weeklyBtnGroup {
    position: fixed;
    bottom: 0%;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    background-color: $raphael-gray-100;
    text-align: center;
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 3%;
    padding: 0.75rem 0 66px;
    max-width: 768px;
    width: 100%;
    touch-action: manipulation;
  }
  .weeklyBtn {
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
    width: 44%;
    padding: 0;
    padding: 8px;
    cursor: pointer;
    &:disabled {
      opacity: 0.5;
    }
  }
  .preBtn {
    background-color: #dfdfdf;
    color: #666;
  }
}
</style>
