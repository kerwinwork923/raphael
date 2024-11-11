<template>
  <div class="userRecord">
    <RaphaelLoading v-if="loading" />

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

      <h1>
        {{
          useSleepRecordData.sleepState === "sleepResult"
            ? "結果分析"
            : "每週評估"
        }}
      </h1>
    </div>

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
  min-height: 100vh;
  width: 100%;
  background-color: $raphael-gray-100;
  padding-bottom: 66px;

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
