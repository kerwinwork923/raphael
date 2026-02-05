<template>
  <div class="userRecord">
    <RaphaelLoading v-if="loading" />
    <TitleMenu
      :Text="
        useSleepRecordData.sleepState === 'sleepResult'
          ? '結果分析'
          : '健康紀錄'
      "
      link="/service"
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
import { useSeo } from "~/composables/useSeo";
export default {
  components: {
    RaphaelLoading,
    TagList,
    sleepRecordWrap,
    UserResultWrap,
    TitleMenu,
    useSeo
  },
  setup() {
    const useSleepRecordData = useSleepRecordStore();

    useSeo({
      title: "",
      description:
        "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
      url: "https://neuroplus.com.tw",
    });

    useHead({
  title: "拉菲爾人本診所",
  meta: [{ name: "description", content: "是透過相應神經調節療法，以無藥、無副作用、非侵入性的治療方式治療自律神經失調、神經痛、弱視、耳鳴、眩暈、胃食道逆流、顏面神經麻痺、失眠、過敏性鼻炎、焦慮憂鬱、胃食道逆流、三叉神經痛、帶狀皰疹神經痛等疾病。" }],
});

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

<style lang="scss" scoped>
.userRecord {
  background-color: $raphael-gray-100;
  display: flex;
  flex-direction: column;
  place-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 0 1rem;
  padding-bottom: 50px;

  .userRecoreWrap {
    max-width: 768px;
    width: 100%;
    padding-top: 0.75rem;
  }
}
.submitBtn,
.backToUserBtn {
  @include btnStyle($raphael-green-400, $raphael-white);
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
