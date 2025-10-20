<template>
  <div class="babyRecord">
    <TitleMenu Text="健康紀錄" link="/user" />

    <!-- 遮罩 + Alert (新增寶貝)-->
    <div class="babyCover" v-if="showBabyCover"></div>
    <div class="babyAlert" v-if="showBabyAlert">
      <h5>
        寶貝基本資料<br />
        確認填寫正確?
      </h5>
      <div class="babyAlertBtnGroup">
        <button class="babyAlertBtn babyAlertBtnNot" @click="closeBabyAlert">
          不確定
        </button>
        <button class="babyAlertBtn babyAlertBtnRight" @click="submitBabyData">
          確定
        </button>
      </div>
    </div>

    <!-- (A) 無小孩 => 顯示寶貝簡介 or 新增表單 -->
    <template v-if="!hasChild">
      <BabyIntro v-if="!showAddBabyForm" />

      <!-- 新增寶貝表單 -->
      <BabyCreateForm
        v-else
        :babyInfos="babyInfos"
        @addBaby="addBabyInfo"
        @removeBaby="removeBaby"
      />

      <!-- 單一按鈕 -->
      <div class="babyRerordBtnGroup">
        <button
          class="babyRerordCommonBtn"
          :disabled="isDisableCommonBtn"
          :style="commonButtonStyle"
          @click="onCommonButtonClick"
        >
          {{ commonButtonLabel }}
        </button>
      </div>
    </template>

    <!-- (B) 有小孩 => flowStage: indicator / qa / times -->
    <template v-else>
      <!-- 寶貝列表進度 (上方 Tab) -->
      <BabyProgress
        :babyList="babyStore.babyAPIData"
        :selectedChildID="babyStore.selectedChildID"
        @selectChild="onClickChild"
      />

      <!-- 指標階段 -->
      <div v-if="curChildData?.flowStage === 'indicator'">
        <!-- 1) 指標選擇元件 -->
        <IndicatorSelect :ansTypes="ansTypes" :curChildData="curChildData" />
        <!-- 2) 下方按鈕群組 (單一按鈕) -->
        <div class="babyRerordBtnGroup">
          <button
            class="babyRerordCommonBtn"
            :disabled="isDisableCommonBtn"
            @click="onCommonButtonClick"
          >
            {{ commonButtonLabel }}
          </button>
        </div>
      </div>

      <!-- QA階段 -->
      <div v-else-if="curChildData?.flowStage === 'qa'">
        <p>以下問題的困擾程度</p>
        <!-- 傳入 currentPage (來自 store 的 curChildData.value.currentPage) -->
        <QAList
          ref="qaListRef"
          :questions="curChildData.childQuestions"
          :MID="MID"
          :MAID="MAID"
          :Token="Token"
          :Mobile="Mobile"
          :CID="babyStore.selectedChildID"
          :currentPage="curChildData.currentPage"
          @update-page="(val) => (curChildData.currentPage = val)"
          @go-times="onGoTimes"
        />

        <!-- (C) QA分頁控制按鈕群組：上一頁 / 下一頁 or 下一步 -->
        <div
          class="babyRerordBtnGroup"
          :class="{ 'double-btn': hasTwoButtons }"
        >
          <!-- 左邊 => 上一頁 (x/x)，若第1頁則不顯示 -->
          <button
            v-if="currentPage > 1"
            class="babyRerordCommonBtn babyRerordPrevBtn"
            @click="onPrevPageClick"
          >
            上一頁 ({{ currentPage }}/{{ totalPages }})
          </button>

          <!-- 右邊 => 下一頁 / 下一步 -->
          <button
            class="babyRerordCommonBtn"
            :disabled="isDisableNextBtn"
            @click="onNextPageClick"
          >
            {{ nextButtonLabel }}
          </button>
        </div>
      </div>

      <!-- 次數階段 -->
      <div v-else-if="curChildData?.flowStage === 'times'">
        <h3>以下問題上週發生幾次</h3>

        <!-- 次數列表: 顯示當前頁 timesDisplayedQuestions -->
        <TimesSelect
          :timesQuestions="timesDisplayedQuestions"
          :indexOnThisPage="timesStartIndex"
        />

        <!-- 分頁按鈕群組：上一頁 / 下一頁 or 完成 -->
        <div
          class="babyRerordBtnGroup"
          :class="{ 'double-btn': timesCurrentPage > 1 }"
        >
          <!-- 上一頁 (x/x) -->
          <button
            v-if="timesCurrentPage > 1"
            class="babyRerordCommonBtn babyRerordPrevBtn"
            @click="onTimesPrevPage"
          >
            上一頁 ({{ timesCurrentPage }}/{{ timesTotalPages }})
          </button>

          <!-- 右邊 => 下一頁 / 完成 -->
          <button
            class="babyRerordCommonBtn"
            :disabled="!isTimesPageFilled"
            @click="onTimesNextClick"
          >
            {{ timesNextButtonLabel }}
          </button>
        </div>
      </div>

      <!-- 最想解決階段 -->
      <div v-else-if="curChildData?.flowStage === 'priority'">
        <h3>
          下列為您目前覺得困擾的症狀，請從中選擇最多10個目前最想解決的症狀
        </h3>
        <SolvePrioritySelect
          :symptoms="curChildData.childTimesQues"
          @selection-changed="onPrioritySelectionChanged"
        />

        <div class="babyRerordBtnGroup">
          <button
            class="babyRerordCommonBtn"
            :disabled="selectedPriorityCount === 0"
            :style="priorityButtonStyle"
            @click="onPrioritySubmit"
          >
            看報告
          </button>
        </div>
      </div>

      <div v-else-if="curChildData?.flowStage === 'result'">
        <!-- 直接使用新元件 BabyReportResult -->
        <BabyReportResult :reportData="curChildData?.reportData" />
      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

import TitleMenu from "@/components/TitleMenu.vue";
import BabyIntro from "@/components/babyRecord/BabyIntro.vue";
import BabyCreateForm from "@/components/babyRecord/BabyCreateForm.vue";
import BabyProgress from "@/components/babyRecord/BabyProgress.vue";
import IndicatorSelect from "@/components/babyRecord/IndicatorSelect.vue";
import QAList from "@/components/QAList.vue";
import TimesSelect from "@/components/TimesSelect.vue";
import SolvePrioritySelect from "@/components/babyRecord/SolvePrioritySelect.vue";
import BabyReportResult from "@/components/babyRecord/BabyReportResult.vue"
import { useBabyStore } from "@/stores/useBabyStore";

export default {
  name: "BabyRecord",
  components: {
    TitleMenu,
    BabyIntro,
    BabyCreateForm,
    BabyProgress,
    IndicatorSelect,
    QAList,
    TimesSelect,
    SolvePrioritySelect,
    BabyReportResult
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

    // 進入畫面後，抓寶貝列表
    onMounted(() => {
      babyStore.fetchGrowth();
    });

    // UI 狀態
    const showBabyCover = ref(false);
    const showBabyAlert = ref(false);
    const showAddBabyForm = ref(false);

    // 寶貝表單
    const babyInfos = ref([{ name: "", gender: "", birthDate: null }]);
    const qaListRef = ref(null); // 操作 QAList 分頁

    // pinia store 資料
    const hasChild = computed(() => babyStore.babyAPIData.length > 0); // 是否有寶貝
    const curChildData = computed(() => {
      const cid = babyStore.selectedChildID;
      return babyStore.childRecords[cid];
    });

    const ansTypes = computed(() => {
      return curChildData.value?.growthRec?.ChildAnsAllType || null;
    });

    // ========== QA 分頁相關 ==========
    const currentPage = computed(() => qaListRef.value?.currentPage || 1);
    const totalPages = computed(() => qaListRef.value?.totalPages || 1);
    // 判斷本頁是否都填完
    const isPageFilled = computed(() => qaListRef.value?.isPageFilled);

    // ========== times 分頁相關 ==========
    const timesCurrentPage = ref(1);
    const pageSize = 7;

    const timesQuestions = computed(
      () => curChildData.value?.childTimesQues || []
    );

    // 總頁數
    const timesTotalPages = computed(() => {
      if (!timesQuestions.value.length) return 1;
      return Math.ceil(timesQuestions.value.length / pageSize);
    });
    // 目前頁面的起始 index
    const timesStartIndex = computed(
      () => (timesCurrentPage.value - 1) * pageSize
    );
    // 切出當前頁的 7 題
    const timesDisplayedQuestions = computed(() => {
      const start = timesStartIndex.value;
      const end = start + pageSize;
      return timesQuestions.value.slice(start, end);
    });

    // 是否填完本頁
    const isTimesPageFilled = computed(() => {
      return timesDisplayedQuestions.value.every((q) => q.selectScore !== "");
    });

    // 上一頁
    function onTimesPrevPage() {
      if (timesCurrentPage.value > 1) {
        timesCurrentPage.value--;
      }
    }

    // 右邊按鈕顯示文字：若還有下一頁 => 「下一頁」，最後一頁 => 「完成」
    const timesNextButtonLabel = computed(() => {
      if (timesCurrentPage.value < timesTotalPages.value) {
        return `下一頁 (${timesCurrentPage.value}/${timesTotalPages.value})`;
      } else {
        return `完成 (${timesCurrentPage.value}/${timesTotalPages.value})`;
      }
    });

    // 點擊「下一頁 / 完成」
    async function onTimesNextClick() {
      if (!isTimesPageFilled.value) {
        alert("請先填完本頁次數");
        return;
      }

      if (timesCurrentPage.value < timesTotalPages.value) {
        timesCurrentPage.value++;
      } else {
        // ★ 已到最後一頁 => 送 API_ChildAnsTimesSave 後，再呼叫 API_GrowthSolve
        const cid = babyStore.selectedChildID;
        const aid = curChildData.value.growthRec?.CIDChildAnsLast?.AID || "";

        const requestDataTimes = {
          MID,
          MAID,
          Token,
          Mobile,
          CID: cid,
          AID: aid,
          ChildAnsTimes: curChildData.value.childTimesQues.map((q) => ({
            QueSeq: q.id,
            QueTimesAns: q.selectScore,
          })),
        };

        try {
          // 1) 先送出次數
          const responseTimes = await axios.post(
            "https://23700999.com:8081/HMA/API_ChildAnsTimesSave.jsp",
            requestDataTimes
          );
          if (responseTimes.data.Result !== "OK") {
            alert("次數答案送出失敗：" + responseTimes.data.Message);
            return;
          }

          // 2) 再呼叫分析 API => API_GrowthSolve
          const requestDataSolve = {
            MID,
            MAID,
            Token,
            Mobile,
            CID: cid,
            AID: aid,
          };
          const responseSolve = await axios.post(
            "https://23700999.com:8081/HMA/API_GrowthSolve.jsp",
            requestDataSolve
          );

          if (responseSolve.data.Result === "OK") {
            alert("次數答案已成功送出並取得分析結果！");

            // **重點**：把 API_GrowthSolve 回傳的 ChildAns 放到 pinia 裡
            if (Array.isArray(responseSolve.data.ChildAns)) {
              babyStore.childRecords[cid].childTimesQues =
                responseSolve.data.ChildAns.map((q) => {
                  return {
                    id: q.QueSeq,
                    question: q.Question,
                    selectScore:  "",
                    answers: [
                      q.AnswerName_0,
                      q.AnswerName_1,
                      q.AnswerName_2,
                      q.AnswerName_3,
                    ],
                    Type: q.Type,
                    TypeName: q.TypeName,
                    // 如果你希望在最想解決階段預設都沒被選，就自行加個 selected: false
                    selected: false,
                  };
                });
            }

            // 3) 切換到最想解決階段
            curChildData.value.flowStage = "priority";
          } else {
            alert("取得分析結果失敗：" + responseSolve.data.Message);
          }
        } catch (error) {
          console.error("送出或取得分析發生錯誤", error);
          alert("伺服器錯誤，請稍後再試！");
        }
      }
    }

    // 上一頁
    function onPrevPageClick() {
      qaListRef.value?.goPrevPage();
    }
    // 下一頁 / 下一步
    async function onNextPageClick() {
      if (!qaListRef.value.isPageFilled) {
        alert("請先填完題目");
        return;
      }
      if (qaListRef.value.currentPage < qaListRef.value.totalPages) {
        qaListRef.value.goNextPage();
      } else {
        // 最後一頁 => 同時呼叫
        await qaListRef.value.submitAllAnswers();
        // flowStage => 'times' or ...
      }
    }

    // 按鈕文字
    const nextButtonLabel = computed(() => {
      if (currentPage.value < totalPages.value) {
        return `下一頁 (${currentPage.value}/${totalPages.value})`;
      } else {
        return `下一步 (${currentPage.value}/${totalPages.value})`;
      }
    });
    // 是否 disable 下一頁
    const isDisableNextBtn = computed(() => !isPageFilled.value);
    // 是否有兩顆按鈕
    const hasTwoButtons = computed(() => currentPage.value > 1);

    // 提交 QA => 進入 times
    async function submitChildAnswers() {
      const cid = babyStore.selectedChildID;
      if (!cid) return;
      // ...可做 API 送出
      curChildData.value.flowStage = "times";
    }

    // ========== 其他階段：單一按鈕 ==========
    const commonButtonLabel = computed(() => {
      // A) 如果沒有寶貝
      if (!hasChild.value) {
        return showAddBabyForm.value ? "送出寶貝" : "前往檢測";
      }
      // B) 有寶貝
      const stage = curChildData.value?.flowStage;
      if (stage === "indicator") return "前往檢測";
      if (stage === "times") return "次數填寫中";
      return "下一步";
    });
    // 是否禁用單一按鈕
    const isDisableCommonBtn = computed(() => {
      // times 階段可禁用
      if (curChildData.value?.flowStage === "times") return true;
      return false;
    });
    // 單一按鈕行為
    async function onCommonButtonClick() {
      const stage = curChildData.value?.flowStage;

      if (stage === "times") {
        if (!isTimesAllFilled.value) {
          alert("請先填寫所有次數問題");
          return;
        }

        console.log("✅ 次數填寫完成，準備送出或進入下一階段");
        return;
      }

      if (!hasChild.value) {
        if (!showAddBabyForm.value) {
          showAddBabyForm.value = true;
        } else {
          checkAndShowBabyAlert();
        }
      } else {
        if (stage === "indicator") {
          const selectedSet = curChildData.value.selectedAnsTypes;

          // 防呆：檢查是否至少選擇了一個大項目
          if (!selectedSet || selectedSet.size === 0) {
            alert("請至少選擇一個大項目以繼續");
            return;
          }

          // 如果有選擇指標，繼續下一步
          await babyStore.fetchChildQuestions(babyStore.selectedChildID);
        } else if (stage === "times") {
          alert("現在是次數階段，正在填寫中...");
        }
      }
    }

    // ========== 新增寶貝表單行為 ==========
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
      try {
        if (babyInfos.value.length === 0) {
          alert("請至少新增一筆寶貝資料");
          return;
        }
        for (const b of babyInfos.value) {
          if (!b.name || !b.gender || !b.birthDate) {
            alert("請完整填寫所有寶貝資料！");
            return;
          }
        }
        const requestData = {
          MID,
          Token,
          MAID,
          Mobile,
          Child: babyInfos.value.map((b) => ({
            Name: b.name,
            Sex: b.gender === "male" ? "1" : "2",
            BirthDay: formatDateToYYYYMMDD(b.birthDate),
          })),
        };
        console.log("📤 API_ChildSave 請求", requestData);

        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_ChildSave.jsp",
          requestData
        );
        console.log("📩 API_ChildSave 回應", response.data);

        if (response.data.Result === "OK") {
          alert("✅ 新增寶貝成功！");
          closeBabyAlert();
          await babyStore.fetchGrowth();
          showAddBabyForm.value = false;
        } else {
          alert("❌ 新增寶貝失敗：" + response.data.Message);
        }
      } catch (error) {
        console.error("🚨 submitBabyData 錯誤", error);
        alert("❌ 伺服器錯誤，請稍後再試！");
      }
    }

    // ========== 其他輔助 ==========
    function formatDateToYYYYMMDD(date) {
      if (!date) return "";
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}${mm}${dd}`;
    }
    function onClickChild(cid) {
      babyStore.selectedChildID = cid;
      babyStore.fetchGrowthRecord(cid);
    }

    function onGoTimes(data) {
      // 確保 `data.ChildAns` 存在，並且是陣列
      if (!data.ChildAns || !Array.isArray(data.ChildAns)) {
        console.error("❌ API 回應格式錯誤，沒有 ChildAns 陣列", data);
        return;
      }

      // 解析 `ChildAns`，轉成 `childTimesQues`
      babyStore.childRecords[babyStore.selectedChildID].childTimesQues =
        data.ChildAns.map((q) => ({
          id: q.QueSeq,
          question: q.Question,
          selectScore: "",
          answers: [
            q.AnswerName_0,
            q.AnswerName_1,
            q.AnswerName_2,
            q.AnswerName_3,
          ],
          Type: q.Type,
          TypeName: q.TypeName,
        }));

      // 切換 flowStage 到 "times"
      babyStore.childRecords[babyStore.selectedChildID].flowStage = "times";

      console.log(
        "✅ 已切換到次數頁，題目:",
        babyStore.childRecords[babyStore.selectedChildID].childTimesQues
      );
    }

    // 在 setup() 內
    const isTimesAllFilled = computed(() => {
      if (curChildData.value?.flowStage === "times") {
        const arr = curChildData.value.childTimesQues || [];
        // 若有任何一題的 `selectScore` 是 `""` (空值)，則返回 `false`
        return arr.every((q) => q.selectScore !== "");
      }
      return true; // 不是 times 階段，按鈕不受影響
    });

    // 按鈕的背景顏色
    const commonButtonStyle = computed(() => {
      // 如果 isDisableCommonBtn => 背景灰色
      return {
        backgroundColor: isDisableCommonBtn.value ? "#bdbdbd" : "#74bc1f",
      };
    });

    //最想解決
    const selectedPriorityCount = ref(0);
    // 接收元件回傳選擇數量的變化
    function onPrioritySelectionChanged(count) {
      selectedPriorityCount.value = count;
    }

    // 動態按鈕顏色
    const priorityButtonStyle = computed(() => ({
      backgroundColor: selectedPriorityCount.value > 0 ? "#74bc1f" : "#bdbdbd",
    }));

    // 最後提交選擇
    // 最後提交選擇 => 「看報告」按鈕
    async function onPrioritySubmit() {
      if (selectedPriorityCount.value === 0) {
        alert("請至少選擇一項最想解決的問題！");
        return;
      }

      const cid = babyStore.selectedChildID;
      const record = babyStore.childRecords[cid];
      const aid = record.growthRec?.CIDChildAnsLast?.AID || "";

      // 1) API_ChildAnsSolveSave => 將「最想解決的問題」送到後端
      //    假設您要傳遞 'selectedPriority' (Set形式) 的題目清單
      const requestDataSolve = {
        MID,
        MAID,
        Token,
        Mobile,
        CID: cid,
        AID: aid,
        ChildAnsSolve: [...record.selectedPriority].map((queSeq) => ({
          QueSeq: queSeq, // 您在 selectedPriority 存的題目 id
        })),
      };

      try {
        const resSolve = await axios.post(
          "https://23700999.com:8081/HMA/API_ChildAnsSolveSave.jsp",
          requestDataSolve
        );
        if (resSolve.data.Result !== "OK") {
          alert("API_ChildAnsSolveSave 失敗：" + resSolve.data.Message);
          return;
        }
        alert("最想解決的問題已送出！");

        // 2) API_GrowthCompare => 拿報告分析
        const requestDataCompare = {
          MID,
          MAID,
          Token,
          Mobile,
          CID: cid,
          AID: aid,
        };
        const resCompare = await axios.post(
          "https://23700999.com:8081/HMA/API_GrowthCompare.jsp",
          requestDataCompare
        );
        if (resCompare.data.Result !== "OK") {
          alert("API_GrowthCompare 失敗：" + resCompare.data.Message);
          return;
        }
        // 將完整回傳塞進 pinia
        babyStore.childRecords[cid].reportData = resCompare.data;

        // 4) 切換 flowStage => "result"
        record.flowStage = "result";
      } catch (error) {
        console.error("onPrioritySubmit error:", error);
        alert("伺服器錯誤，請稍後再試！");
      }
    }

    return {
      babyStore,

      // UI
      showBabyCover,
      showBabyAlert,
      showAddBabyForm,
      babyInfos,
      qaListRef,

      // 計算值
      hasChild,
      curChildData,
      ansTypes,

      // QA 分頁
      currentPage,
      totalPages,
      isPageFilled,
      nextButtonLabel,
      isDisableNextBtn,
      hasTwoButtons,

      // QA 分頁方法
      onPrevPageClick,
      onNextPageClick,
      submitChildAnswers,

      // 其他階段按鈕
      commonButtonLabel,
      onCommonButtonClick,
      isDisableCommonBtn,

      // 新增寶貝
      addBabyInfo,
      removeBaby,
      checkAndShowBabyAlert,
      closeBabyAlert,
      submitBabyData,
      formatDateToYYYYMMDD,

      // 切換寶貝
      onClickChild,
      onGoTimes,
      isTimesAllFilled,
      commonButtonStyle,

      // 次數階段相關
      timesCurrentPage, // ✅ 補上
      timesTotalPages, // ✅ 補上
      timesStartIndex, // ✅ 補上
      timesDisplayedQuestions, // 你已經有 return，這部分沒問題
      isTimesPageFilled, // ✅ 補上
      timesQuestions, // ✅ 補上

      // 次數階段的按鈕
      timesNextButtonLabel,
      onTimesPrevPage,
      onTimesNextClick,

      selectedPriorityCount,
      onPrioritySelectionChanged,
      priorityButtonStyle,
      onPrioritySubmit,
    };
  },
};
</script>

<style lang="scss">
.babyRecord {
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  padding: 0 1rem;
  position: relative;

  .babyCover {
    position: fixed;
    width: 100%;
    height: 100%;
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
    background-color: #fff;
    width: 60%;
    text-align: center;
    border-radius: 14px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

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
        font-size: 16px;
        letter-spacing: 0.5px;
      }
      .babyAlertBtnRight {
        color: #74bc1f;
        border-left: 1px solid #ccc;
      }
    }
  }
}

/* 下方按鈕 */
.babyRerordBtnGroup {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  max-width: 768px;
  width: 100%;
  padding: 0.75rem 0 3.125rem 0;

  .babyRerordCommonBtn {
    background-color: #74bc1f;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%; // 預設 100% (單一按鈕)
    border: none;
    border-radius: 0.5rem;
    color: #fff;
    cursor: pointer;
    font-size: 1.125rem;
    font-weight: 400;
    padding: 0.5rem 0.75rem;
    transition: all 0.2s ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  /* QA階段：有兩顆按鈕時 => 各 50% */
  &.double-btn .babyRerordCommonBtn {
    width: 50%;
  }

  .babyRerordPrevBtn {
    background: #eee;
    color: #333;
  }
}
</style>
