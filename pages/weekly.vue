<template>
  <RaphaelLoading v-if="common.isLoading" />
  <div class="weeklyRecord">
    <div class="titleBar">
      <router-link to="/user">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="24"
          viewBox="0 0 25 24"
          fill="none"
        >
          <path
            d="M16.313 19.497L9.00497 12L16.313 4.50299C16.4438 4.36905 16.5171 4.18923 16.5171 4.00199C16.5171 3.81475 16.4438 3.63494 16.313 3.50099C16.2494 3.43614 16.1736 3.38461 16.0899 3.34944C16.0062 3.31426 15.9163 3.29614 15.8255 3.29614C15.7347 3.29614 15.6448 3.31426 15.5611 3.34944C15.4774 3.38461 15.4015 3.43614 15.338 3.50099L7.56198 11.4765C7.42545 11.6166 7.34905 11.8044 7.34905 12C7.34905 12.1956 7.42545 12.3834 7.56198 12.5235L15.3365 20.499C15.4001 20.5643 15.4761 20.6162 15.5601 20.6517C15.6441 20.6871 15.7343 20.7054 15.8255 20.7054C15.9166 20.7054 16.0069 20.6871 16.0909 20.6517C16.1748 20.6162 16.2509 20.5643 16.3145 20.499C16.4453 20.365 16.5186 20.1852 16.5186 19.998C16.5186 19.8108 16.4453 19.6309 16.3145 19.497L16.313 19.497Z"
            fill="#666666"
          />
        </svg>
      </router-link>

      <h1>{{ h1Text }}</h1>
    </div>

    <TagList />
    <div class="weeklyQAGroup">
      
      <StepIndicator v-if="store.nowState == 'result'"
        :stepTexts="['填寫問卷', '結果分析']"
        :currentStep="1"
      />

      <StepIndicator v-if="store.nowState !== 'result'"
        :stepTexts="['填寫問卷', '結果分析']"
        :currentStep="0"
      />
      <div class="subListTitle">以下問題對您的困擾程度</div>

      <WeeklyResult v-if="store.nowState == 'result'" />
      <WeeklyScoreBar v-if="store.nowState == 'score'" />
      <TagTimesList v-if="store.nowState == 'times'" />
      <SymptomChoose v-if="store.nowState == 'choose'" />
    </div>

    <div class="weeklyBtnGroup">
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

export default {
  components: {
    Navbar,
    TagList,
    WeeklyScoreBar,
    TagTimesList,
    SymptomChoose,
    RaphaelLoading,
    StepIndicator,
  },
  setup() {
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
          return "每週評估"; // 不需要 break，因為已經 return 了
        case "result":
          return "結果分析"; // 這裡應該加冒號，並 return 正確的值
        default:
          return "每週評估"; // default 也不需要 break
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
  min-height: 100vh;
  width: 100%;
  background-color: $raphael-gray-200;

  padding-bottom: 150px;
  width: 100%;
  .titleBar {
    position: absolute;
    top: 1rem;
    display: flex;
    width: 100%;
    justify-content: center;

    svg {
      position: absolute;
      left: 3.5%;
      cursor: pointer;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 400;
      letter-spacing: 0.5px;
    }
  }

  .weeklyQAGroup {
    max-width: 768px;
    margin: 0 auto;
    padding: 0 5%;
  }

  .subListTitle {
    color: #666;
    margin-top: 1.25rem;
    letter-spacing: 0.5px;
    font-weight: 40;
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
    background-color: $raphael-gray-200;
    text-align: center;
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 3%;
    padding: 3% 0;
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
