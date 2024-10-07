<template>
  <div class="weeklyRecord">
    <TagList />
    <div class="weeklyQAGroup">
      <div class="subList">
        <span class="subListActive">基本資料</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="34"
          height="8"
          viewBox="0 0 34 8"
          fill="none"
        >
          <path
            d="M32.988 4.22778C33.1823 4.03345 33.1823 3.71838 32.988 3.52405L29.8212 0.357228C29.6268 0.162896 29.3117 0.162896 29.1174 0.357228C28.9231 0.551559 28.9231 0.866633 29.1174 1.06097L31.9324 3.87592L29.1174 6.69087C28.9231 6.8852 28.9231 7.20027 29.1174 7.3946C29.3117 7.58894 29.6268 7.58894 29.8212 7.3946L32.988 4.22778ZM0.788574 4.37353H32.6361V3.3783H0.788574V4.37353Z"
            fill="#EC4F4F"
          />
        </svg>
        <span class="subListActive">填寫問卷</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="33"
          height="8"
          viewBox="0 0 33 8"
          fill="none"
        >
          <path
            d="M32.4972 4.22778C32.6916 4.03345 32.6916 3.71838 32.4972 3.52405L29.3304 0.357228C29.1361 0.162896 28.821 0.162896 28.6267 0.357228C28.4324 0.551559 28.4324 0.866633 28.6267 1.06097L31.4416 3.87592L28.6267 6.69087C28.4324 6.8852 28.4324 7.20027 28.6267 7.3946C28.821 7.58894 29.1361 7.58894 29.3304 7.3946L32.4972 4.22778ZM0.297852 4.37353H32.1454V3.3783H0.297852V4.37353Z"
            fill="#CCCCCC"
          />
        </svg>
        <span>結果分析</span>
      </div>
      <div class="subListTitle">以下問題對您的困擾程度</div>
      <WeeklyScoreBar />
    </div>

    <div class="weeklyBtnGroup">
      <button
        class="weeklyBtn"
        @click="store.handlePrevStep"
        :disabled="store.currentStep === 1"
      >
        上一步{{ preText }}
      </button>
      <button class="weeklyBtn" @click="store.handleNextStep">
        下一步{{ nextText }}
      </button>
    </div>
  </div>
</template>

<script>
import Navbar from "~/components/Navbar.vue";
import TagList from "../components/TagList.vue";
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useWeeklyRecord } from "~/stores/weeklyQA.js";
import WeeklyScoreBar from "~/components/WeeklyScoreBar.vue";

export default {
  components: {
    Navbar,
    TagList,
    WeeklyScoreBar,
  },
  setup() {
    const store = useWeeklyRecord();

    const preText = ref("");
    const nextText = ref("");

    watch(
      () => store.currentStep,
      (newVal) => {
        if (newVal+1 > store.totalStep) {
          nextText.value = "";
        } else {
          nextText.value = `(${newVal+1}/${store.totalStep})`;
        }

        if (newVal <= 1) {
          preText.value = "";
        } else {
          preText.value = `(${newVal }/${store.totalStep})`;
        }
      },
      { immediate: true }
    );

    return { store, preText, nextText };
  },
};
</script>

<style lang="scss">
.weeklyRecord {
  min-height: 100vh;
  width: 100%;
  background-color: $raphael-gray-200;

  padding-bottom: 150px;
  .weeklyQAGroup {
    max-width: 768px;
    margin: 0 auto;
    padding: 0 5%;
  }
  .subList {
    color: #ccc;
    font-size: 14px;
  }
  .subListTitle {
    color: #666;
    margin-top: 1.25rem;
    letter-spacing: 0.5px;
    font-weight: 40;
    margin-bottom: 0.75rem;
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
      background-color: #b3b3b3;
      cursor: not-allowed;
    }
  }
}
</style>
