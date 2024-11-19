<template>
  <div class="userRecord">
    <RaphaelLoading v-if="loading" />
    <TitleMenu
      :Text="
        useSleepRecordData.sleepState === 'sleepResult'
          ? '結果分析'
          : '每週評估'
      "
      link="/"
    />

    <div class="userRecoreWrap">
      <tagList />
      <StepIndicator
        v-if="useSleepRecordData.sleepState === 'sleepRecord'"
        :stepTexts="['填寫問卷', '結果分析']"
        :currentStep="0"
      />
      <StepIndicator
        v-if="useSleepRecordData.sleepState === 'sleepResult'"
        :stepTexts="['填寫問卷', '結果分析']"
        :currentStep="1"
      />
      <SleepRecordWrap v-if="useSleepRecordData.sleepState === 'sleepRecord'" />
      <UserResultWrap v-if="useSleepRecordData.sleepState === 'sleepResult'" />
    </div>
  </div>
</template>

<script>
import Navbar from "~/components/Navbar.vue";
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

import axios from "axios";
import { useRouter } from "vue-router";

import RaphaelLoading from "../components/RaphaelLoading";
import TitleMenu from "~/components/TitleMenu.vue";
import StepIndicator from "~/components/StepIndicator.vue";
import TagList from "../components/TagList.vue";
import sleepRecordWrap from "~/components/SleepRecordWrap.vue";
import { useSleepRecordStore } from "../stores/sleepRecord";
import UserResultWrap from "~/components/UserInfoWrap.vue";
export default {
  components: {
    RaphaelLoading,
    TagList,
    sleepRecordWrap,
    UserResultWrap,
    TitleMenu,
  },
  setup() {
    const useSleepRecordData = useSleepRecordStore();

    const loading = ref(false);
    const cc = async () => {
      try {
        loading.value = true;
        await useSleepRecordData.getIndexSleepRecData();
        await useSleepRecordData.getSleepRecData();
      } catch (err) {
        console.log("Error in cc function:", err);
      }
      loading.value = false;
    };
    cc();
    return {
      loading,
      useSleepRecordData,
    };
  },
};
</script>

<style lang="scss">
.userRecord {
  background-color: $raphael-gray-100;
  display: flex;
  flex-direction: column;
  place-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 0 1rem;
  padding-bottom: 66px;
  
  .userRecoreWrap{
    max-width: 768px;
    width: 100%;
    padding: 0.75rem 0;
  }
}

.pleaseWrite {
  margin: 1rem 0 0.75rem 0;
  color: $raphael-gray-500;
  font-size: 1rem;
}

.submitBtn,
.backToUserBtn {
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

  cursor: pointer;
  &:hover {
    background-color: $raphael-green-500;
  }
}

.backToUserBtnGroup {
  position: fixed;
  bottom: 0%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  background-color: $raphael-gray-100;
  text-align: center;
  z-index: 100;

  padding: 3% 0;
}
.backToUserBtn {
  width: 90%;
  padding: 0;
  padding: 8px;
}
</style>
