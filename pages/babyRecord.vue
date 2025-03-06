<template>
  <div class="babyRecord">
    <TitleMenu Text="健康紀錄" link="/user" />

    <!-- 遮罩 + Alert (新增寶貝)-->
    <div class="babyCover" v-if="showBabyCover"></div>
    <div class="babyAlert" v-if="showBabyAlert">
      <h5>
        寶貝基本資料<br/>
        確認填寫正確?
      </h5>
      <div class="babyAlertBtnGroup">
        <button class="babyAlertBtn babyAlertBtnNot" @click="closeBabyAlert">不確定</button>
        <button class="babyAlertBtn babyAlertBtnRight" @click="submitBabyData">確定</button>
      </div>
    </div>

    <!-- (A) 無小孩 => 顯示寶貝簡介 or 新增表單 -->
    <template v-if="babyStore.babyAPIData.length < 1">
      <BabyIntro v-if="!showAddBabyForm" />
      <BabyCreateForm
        v-else
        :babyInfos="babyInfos"
        @addBaby="addBabyInfo"
        @removeBaby="removeBaby"
        @checkBaby="checkAndShowBabyAlert"
      />
      <div class="babyRerordBtnGroup">
        <!-- 第一次點：顯示表單；第二次點：送出 -->
        <button class="babyRerordCommonBtn" @click="onNoChildBtnClick">
          前往檢測
        </button>
      </div>
    </template>

    <!-- (B) 有小孩 => 指標 + QA + 次數 -->
    <template v-else>
      <!-- 寶貝列表進度 -->
      <BabyProgress
        :babyList="babyStore.babyAPIData"
        :selectedChildID="babyStore.selectedChildID"
        @selectChild="onClickChild"
      />

      <!-- flowStage: indicator => 指標階段 -->
      <IndicatorSelect
        v-if="curChildData?.flowStage === 'indicator'"
        :ansTypes="ansTypes"
        :curChildData="curChildData"
        @fetchQuestions="onFetchQuestions"
      />

      <!-- flowStage: qa => QAList -->
      <div v-else-if="curChildData?.flowStage === 'qa'">
        <p>以下問題的困擾程度</p>
        <QAList ref="qaListRef" :questions="curChildData.childQuestions" />
        <div class="babyRerordBtnGroup">
          <button
            class="babyRerordCommonBtn"
            :disabled="!canClickNext"
            :style="{ backgroundColor: canClickNext ? '#74bc1f' : 'gray' }"
            @click="onCommonBtnClick"
          >
            {{ commonBtnLabel }}
          </button>
        </div>
      </div>

      <!-- flowStage: times => TimesSelect -->
      <TimesSelect
        v-else-if="curChildData?.flowStage === 'times'"
        :childTimesQues="curChildData?.childTimesQues || []"
      />
    </template>

  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

import TitleMenu from "@/components/TitleMenu.vue";
import QAList from "@/components/QAList.vue";
import TimesSelect from "@/components/TimesSelect.vue";

import BabyIntro from "@/components/babyRecord/BabyIntro.vue";
import BabyCreateForm from "@/components/babyRecord/BabyCreateForm.vue";
import BabyProgress from "@/components/babyRecord/BabyProgress.vue";
import IndicatorSelect from "@/components/babyRecord/IndicatorSelect.vue";

import { useBabyStore } from "@/stores/useBabyStore";

export default {
  name: "BabyRecord",
  components: {
    TitleMenu,
    QAList,
    TimesSelect,
    BabyIntro,
    BabyCreateForm,
    BabyProgress,
    IndicatorSelect,
  },
  setup() {
    const router = useRouter();
    const babyStore = useBabyStore();

    // 驗證登入
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};
    if (!MID || !Token || !MAID || !Mobile) {
      router.push("/");
    }

    // UI state
    const showBabyCover = ref(false);
    const showBabyAlert = ref(false);
    const showAddBabyForm = ref(false);

    // 新增寶貝暫存
    const babyInfos = ref([{ name: "", gender: "", birthDate: null }]);
    const qaListRef = ref(null);

    onMounted(() => {
      babyStore.fetchGrowth();
    });

    // 當前寶貝詳細
    const curChildData = computed(() => {
      const cid = babyStore.selectedChildID;
      return babyStore.childRecords[cid];
    });

    // 後端指標
    const ansTypes = computed(() => curChildData.value?.growthRec?.ChildAnsAllType || null);

    // QA分頁
    const currentPage = computed(() => qaListRef.value?.currentPage || 1);
    const totalPages = computed(() => qaListRef.value?.totalPages || 1);

    // 按鈕文字
    const showTimesStage = ref(false); // 顯示「次數」
    const isQAStage = computed(() => !!curChildData.value?.childQuestions?.length);

    const commonBtnLabel = computed(() => {
      if (!isQAStage.value && !showTimesStage.value) {
        return "前往檢測";
      }
      if (showTimesStage.value) {
        return "次數填寫中";
      }
      if (currentPage.value < totalPages.value) {
        return `下一頁 (${currentPage.value}/${totalPages.value})`;
      } else {
        return `下一步 (${currentPage.value}/${totalPages.value})`;
      }
    });

    const canClickNext = computed(() => {
      if (!qaListRef.value) return false;
      return qaListRef.value.canGoNext;
    });

    // ============== (A) 沒小孩 => 新增寶貝 ==============
    function onNoChildBtnClick() {
      if (!showAddBabyForm.value) {
        showAddBabyForm.value = true;
      } else {
        checkAndShowBabyAlert();
      }
    }

    function addBabyInfo() {
      babyInfos.value.push({ name: "", gender: "", birthDate: null });
    }
    function removeBaby(idx) {
      if (babyInfos.value.length > 1) {
        babyInfos.value.splice(idx, 1);
      }
    }

    function checkAndShowBabyAlert() {
      for (const b of babyInfos.value) {
        if (!b.name || !b.gender || !b.birthDate) {
          alert("請完整填寫所有寶貝資料");
          return;
        }
      }
      showBabyCover.value = true;
      showBabyAlert.value = true;
    }
    function closeBabyAlert() {
      showBabyCover.value = false;
      showBabyAlert.value = false;
    }
    async function submitBabyData() {
      // call API
      // ...
      closeBabyAlert();
      babyStore.fetchGrowth();
    }

    // ============== (B) 有小孩 => 指標/QA/次數 ==============
    function onClickChild(cid) {
      showTimesStage.value = false;
      babyStore.selectedChildID = cid;
      babyStore.fetchGrowthRecord(cid);
    }

    // 指標 => 取題目
    async function onFetchQuestions() {
      const cid = babyStore.selectedChildID;
      if (!cid) return;
      await babyStore.fetchChildQuestions(cid);
    }

    function onCommonBtnClick() {
      // QA中 => 分頁 or 提交
      if (currentPage.value < totalPages.value) {
        qaListRef.value.goNextPage();
      } else {
        // 最後一頁 => 提交
        submitChildAnswers();
      }
    }

    async function submitChildAnswers() {
      // 組裝 => call API => fetchTimes => showTimesStage
      const cid = babyStore.selectedChildID;
      // ...
      // call babyStore.fetchGrowthRecTimes
      showTimesStage.value = true;
    }

    return {
      // state
      babyStore,
      babyInfos,
      qaListRef,
      showBabyCover,
      showBabyAlert,
      showAddBabyForm,
      showTimesStage,

      // computed
      curChildData,
      ansTypes,
      currentPage,
      totalPages,
      commonBtnLabel,
      canClickNext,
      isQAStage,

      // methods
      onNoChildBtnClick,
      addBabyInfo,
      removeBaby,
      checkAndShowBabyAlert,
      closeBabyAlert,
      submitBabyData,

      onClickChild,
      onFetchQuestions,
      onCommonBtnClick,
      submitChildAnswers,
    };
  },
};
</script>



<style lang="scss">
.babyRecord {
  background-color: #f5f5f5; /* 原本 $raphael-gray-100 */
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 0 1rem;
  position: relative; /* 讓 .babyAlert 可以絕對定位在中間 */

  .dp__input_wrap {
    border-bottom: 1px solid #cccccc; /* 原 $raphael-gray-300 */
    padding: 0.6rem 0;

    .dp__pointer {
      border: none;
      background-color: transparent;
      width: 100%;
      outline: none;
      font-size: 1.2rem;

      &::placeholder {
        color: #aaa;
        font-family: Inter, sans-serif;
        font-size: 1.2rem;
        font-weight: 400;
      }
    }
    svg {
      display: none;
    }
  }

  .babyCover {
    width: 100%;
    height: 100%;
    position: fixed;
    background: rgba(217, 217, 217, 0.5);
    backdrop-filter: blur(2.5px);
    top: 0;
    left: 0;
    z-index: 99;
  }

  .babyAlert {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
    background-color: #ffffff; /* 原 $raphael-white */
    width: 60%;
    text-align: center;
    border-radius: 14px;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);

    h5 {
      line-height: 1.5;
      padding: 1.25rem;
      margin: 0;
    }
    .babyAlertBtnGroup {
      display: flex;
      justify-content: center;
      border-top: 1px solid #ccc;
      .babyAlertBtn {
        background-color: transparent;
        border: none;
        width: 50%;
        padding: 0.75rem;
        cursor: pointer;
        color: #ccc;
        text-align: center;
        font-family: "Noto Sans", sans-serif;
        font-size: 16px;
        font-weight: 400;
        line-height: 100%; /* 16px */
        letter-spacing: 0.5px;
      }
      .babyAlertBtnRight {
        color: #74bc1f; /* 原 var(--brand-green-400) */
        border-left: 1px solid #ccc;
      }
    }
  }
}


/* 問卷區塊 */
.babyRecordQAGroup {
  width: 100%;
}







/* 下方按鈕 */
.babyRerordBtnGroup {
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  max-width: 768px;
  width: 100%;
  padding: 0.75rem 0 3.125rem 0;
  touch-action: manipulation;

  .babyRerordCommonBtn {
    background-color: #74bc1f;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border: none;
    border-radius: 0.5rem;
    color: #ffffff;
    cursor: pointer;
    font-size: 1.125rem;
    font-weight: 400;
    padding: 0.5rem 0.75rem;
    line-height: 1;
    letter-spacing: 0.5px;
    transition: all 0.2s ease;

    &:disabled {
      opacity: 0.5;
    }
  }
}
</style>
