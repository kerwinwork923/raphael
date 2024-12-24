<template>
  <RaphaelLoading v-if="common.isLoading" />
  <div class="weeklyRecord">
    <TitleMenu :Text="h1Text" link="/user" />

    <div class="weeklyQAGroup">
      <TagList />
      <StepIndicator
        v-if="
          store.nowState !== 'first' &&
          store.nowState !== 'second' &&
          store.nowState == 'result'
        "
        :stepTexts="['填寫問卷', '結果分析']"
        :currentStep="1"
      />

      <StepIndicator
        v-if="
          store.nowState !== 'first' &&
          store.nowState !== 'second' &&
          store.nowState !== 'result'
        "
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
        <div class="desCard">
            <div class="slogan">透過100種症狀的分析，全面了解您的自律神經不平衡程度。</div>
            <div class="time">
              <img src="/assets/imgs/clock-green.svg" >
              <div class="text">填寫量表需花費約<span>25分鐘</span></div>
            </div>
            <div class="hint">
              <img src="/assets/imgs/step-green.svg" >
              <div class="text">可分段填寫，進度會自動儲存</div>
            </div>
        </div>
        <div class="stepCard">
          <div class="item">
            <div class="icon">            
              <img src="/assets/imgs/brain-white.svg" >
            </div>
            <div class="content">
              <hgroup>
                <sub>Step 1</sub>
                <h3>症狀評估</h3>
              </hgroup>
              <div class="text">依當下感覺逐題評估，填寫每項症狀的嚴重程度。</div>
            </div>
          </div>
          <div class="item">
            <div class="icon">            
              <img src="/assets/imgs/heartRate-white.svg" >
            </div>
            <div class="content">
              <hgroup>
                <sub>Step 2</sub>
                <h3>頻率記錄</h3>
              </hgroup>
              <div class="text">針對困擾您的症狀，填寫每週發生的頻率。</div>
            </div>
          </div>
          <div class="item">
            <div class="icon">            
              <img src="/assets/imgs/choose-white.svg" >
            </div>
            <div class="content">
              <hgroup>
                <sub>Step 3</sub>
                <h3>重點標記</h3>
              </hgroup>
              <div class="text">挑選 3-10項 您目前最困擾的症狀</div>
            </div>
          </div>
        </div>
      </div>

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
import { ref, computed } from "vue";
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
    const store = useWeeklyRecord();
    const common = useCommon();

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

    const start = async () => {
      common.startLoading();
      await store.API_API_ANSFirstDetail();
      common.stopLoading();
    };

    start();

    return {
      store,
      h1Text,
      common,
      activeChoice,
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
    height: calc(100vh - 207px);
    margin-top: 1rem;
    padding-bottom: 0.75rem;
    overflow-y: scroll;
    @include scrollbarStyle();

    h4{
      color:$raphael-black;
      font-size: 20px;
      font-style: normal;
      font-weight: bold;
      line-height: 100%;
      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
    }
    .desCard{    
      display: grid;
      gap: 0.5rem;
      background: $raphael-white;
      color: $raphael-gray-500;
      border-radius: 0.5rem;
      margin: 0.75rem 0;
      padding: 0.75rem;
      font-size: 1.125rem;
      line-height: 29.1px;
      letter-spacing: 0.05em;

      .time{
        display: flex;
        align-items: center;
        gap: 0.5rem;
        .text{
          &>span{
            color: $raphael-red-300;
            margin-left: 0.25rem;
          }
        }
      }
      .hint{        
        @extend .time;
      }
    }
    .stepCard{    
      position: relative;
      display: grid;
      gap: 0.75rem;
      font-size: 1.125rem;
      color: $raphael-gray-500;
      line-height: 29.1px;
      letter-spacing: 0.05em;
      
      &::after{
        content: "";
        position: absolute;
        background: $raphael-white;
        width: 4px;
        height: 100%;
        border-radius: 0.5rem;
        box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.25) inset;
        left: 15px;
      }

      .item{
        display: flex;
        gap: 0.5rem;
        .icon{
          display: flex;
          align-items: center;
          justify-content: center;
          background: $raphael-cyan-400;
          border-radius: 50%;
          padding: 4px;
          height: 32px;
          z-index: 1;

          &>img{
            min-width: 24px;
          }
        }
        .content{
          display: grid;
          background: $raphael-white;
          border-radius: 0.5rem;
          width: 100%;
          gap: 0.5rem;
          padding: 0.75rem;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          &>hgroup{
            display: flex;
            flex-direction: column;
            &>sub{
              color: $raphael-cyan-400;
              font-size: 0.813rem;
              line-height: 100%;
            }
            &>h3{
              color: $raphael-black;
              font-size: 1.25rem;
            }
          }
        }
      }
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
