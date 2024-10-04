<template>
  <div class="weeklyRecord">
    <Navbar />
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
  </div>
</template>

<style lang="scss">
.weeklyRecord {
  min-height: 100vh;
  width: 100%;
  background-color: $raphael-gray-200;
  margin-bottom: 50px;
  padding-bottom: 2rem;
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
}
</style>

<script>
import Navbar from "~/components/Navbar.vue";
import TagList from "../components/TagList.vue";
import { ref } from "vue";
import { useRouter } from "vue-router"; // 引入 useRouter
import axios from "axios"; // 引入 axios
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

    // store.getQues();

    return { store };
  },
};
</script>
