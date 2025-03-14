<template>
  <!-- (A) Loading 元件：只有 isLoading===true 時顯示 -->
  <RaphaelLoading v-if="isLoading" />

  <div class="babyRecord">
    <TitleMenu Text="健康紀錄" link="/user" />
    <TagList />

    <!-- (A) 無小孩 => 顯示引導 / 新增寶貝 -->
    <template v-if="!hasChild">
      <BabyIntro v-if="!showAddBabyForm" />
      <BabyCreateForm
        v-else
        :babyInfos="babyInfos"
        @addBaby="addBabyInfo"
        @removeBaby="removeBaby"
      />
      <div class="babyRerordBtnGroup">
        <button
          class="babyRerordCommonBtn"
          :disabled="isDisableCommonBtn"
          @click="onCommonButtonClick"
        >
          {{ commonButtonLabel }}
        </button>
      </div>
    </template>

    <!-- (B) 有小孩 => 依 flowStage 切換各階段 -->
    <template v-else>
      <!-- 寶貝列表，可切換寶貝 -->
      <BabyProgress
        :babyList="babyStore.babyAPIData"
        :selectedChildID="babyStore.selectedChildID"
        @selectChild="onClickChild"
      />

      <!-- chooseVersion (大於二次 & diffDaysFromToday<=0) -->
      <div
        class="chooseVersion"
        v-if="curChildData?.flowStage === 'chooseVersion'"
      >
        <h3>請依照您今日的需求，選擇您想要的評估方式</h3>
        <div class="chooseGroup">
          <div
            class="chooseBox"
            :class="{ active: curChildData.version === 'tracking' }"
            @click="setVersion('tracking')"
          >
            <h4>症狀追蹤</h4>
            <p>只評估上次有問題的症狀，約5~10分鐘</p>
            <div class="bgImg">
              <img src="/assets/imgs/3DMap.png" alt="症狀追蹤" />
            </div>
          </div>
          <div
            class="chooseBox"
            :class="{ active: curChildData.version === 'full' }"
            @click="setVersion('full')"
          >
            <h4>完整評估</h4>
            <p>檢查所有可能的症狀，約25分鐘</p>
            <div class="bgImg">
              <img src="/assets/imgs/3DTest.png" alt="完整評估" />
            </div>
          </div>
        </div>
        <div class="babyRerordBtnGroup">
          <button class="babyRerordCommonBtn" @click="onChooseVersionNext">
            下一步
          </button>
        </div>
      </div>

      <!-- historyView (前一次紀錄列表) -->
      <div
        class="historyView"
        v-else-if="curChildData?.flowStage === 'historyView'"
      >
     
        <div class="historyViewGroup">
          <!-- 年份和月份選擇框 -->
          <div class="detectSelectGroup">
            <div class="yearSelectGroup">
              <img src="/assets/imgs/filter.svg" alt="年份篩選" />
              <div class="monthText" @click="toggleYearBox">
                {{ selectedYear }}年
              </div>
              <div class="yearBox" v-show="yearBoxVisible">
                <div
                  class="year"
                  v-for="year in displayYears"
                  :key="year"
                  @click="selectYear(year)"
                >
                  {{ year }}
                </div>
              </div>
            </div>
            <div class="monthSelectGroup">
              <img src="/assets/imgs/filter.svg" alt="月份篩選" />
              <div class="monthText" @click="toggleMonthBox">
                {{ selectedMonth }}月份
              </div>
              <div class="monthBox" v-show="monthBoxVisible">
                <div
                  class="month"
                  v-for="month in months"
                  :key="month"
                  @click="selectMonth(month)"
                >
                  {{ month }}月
                </div>
              </div>
            </div>
          </div>
          <!-- 篩選後的歷史清單 (filteredHistoryList) -->
          <div class="historyViewItemGroup">
            <div
              class="historyViewItem"
              v-for="(histItem, idx) in filteredHistoryList"
              :key="idx"
              @click="onClickHistoryItem(histItem)"
            >
              <div class="historyViewLeft">
                <img src="../assets/imgs/detectTime.svg" alt="" />
                <h6>{{ formatCheckTime(histItem.CheckTime) }}</h6>
              </div>
              <img src="../assets/imgs/arrowGo.svg" alt="" />
            </div>

            <!-- 沒資料時顯示提示 -->
            <div
              v-if="filteredHistoryList.length === 0"
              style="text-align: center; margin-top: 1rem; color: #999"
            >
              此月份無檢測紀錄
            </div>
          </div>
        </div>
      </div>

      <!-- result (顯示本次/前次/歷史) -->
      <div v-else-if="curChildData?.flowStage === 'result'">
        <BabyReportResult :reportData="curChildData.reportData" />
        <!-- 返回按鈕 -->
        <div class="babyRerordBtnGroup">
          <button class="babyRerordCommonBtn" @click="goBackToHistory">
            返回紀錄
          </button>
        </div>
      </div>

      <!-- indicator (第一次 or 剛選完版本) -->
      <div v-else-if="curChildData?.flowStage === 'indicator'">
        <IndicatorSelect :ansTypes="ansTypes" :curChildData="curChildData" />
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

      <!-- QA (問卷) -->
      <div class="babyQAGroup" v-else-if="curChildData?.flowStage === 'qa'">
        <p>以下問題的困擾程度</p>
        <QAList
          ref="qaListRef"
          :questions="curChildData.childQuestions"
          :CID="babyStore.selectedChildID"
          :currentPage="curChildData.currentPage"
          @update-page="(val) => (curChildData.currentPage = val)"
          @go-times="onGoTimes"
        />
        <div
          class="babyRerordBtnGroup"
          :class="{ 'double-btn': hasTwoButtons }"
        >
          <button
            v-if="currentPage > 1"
            class="babyRerordCommonBtn babyRerordPrevBtn"
            @click="onPrevPageClick"
          >
            上一頁 ({{ currentPage }}/{{ totalPages }})
          </button>
          <button
            class="babyRerordCommonBtn"
            :disabled="isDisableNextBtn"
            @click="onNextPageClick"
          >
            {{ nextButtonLabel }}
          </button>
        </div>
      </div>

      <!-- times (次數) -->
      <div
        class="babyTimesGroup"
        v-else-if="curChildData?.flowStage === 'times'"
      >
        <h3>以下問題上週發生幾次</h3>
        <TimesSelect
          :timesQuestions="timesDisplayedQuestions"
          :indexOnThisPage="timesStartIndex"
        />
        <div
          class="babyRerordBtnGroup"
          :class="{ 'double-btn': timesCurrentPage > 1 }"
        >
          <button
            v-if="timesCurrentPage > 1"
            class="babyRerordCommonBtn babyRerordPrevBtn"
            @click="onTimesPrevPage"
          >
            上一頁 ({{ timesCurrentPage }}/{{ timesTotalPages }})
          </button>
          <button
            class="babyRerordCommonBtn"
            :disabled="!isTimesPageFilled"
            @click="onTimesNextClick"
          >
            {{ timesNextButtonLabel }}
          </button>
        </div>
      </div>

      <!-- priority (最想解決) -->
      <div
        class="babyPriority"
        v-else-if="curChildData?.flowStage === 'priority'"
      >
        <h3>請從中選擇最多10個 目前最想解決的症狀</h3>
        <SolvePrioritySelect
          :symptoms="curChildData.childTimesQues"
          @selection-changed="onPrioritySelectionChanged"
        />
        <div class="babyRerordBtnGroup">
          <!-- 這裡才是「看報告」：呼叫 API_ChildAnsSolveSave + 切換至 result -->
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
    </template>

    <!-- 新增寶貝的遮罩 + Alert -->
    <div class="babyCover" v-if="showBabyCover"></div>
    <div class="babyAlert" v-if="showBabyAlert">
      <h5>寶貝基本資料<br />確認填寫正確？</h5>
      <div class="babyAlertBtnGroup">
        <button class="babyAlertBtn babyAlertBtnNot" @click="closeBabyAlert">
          不確定
        </button>
        <button class="babyAlertBtn babyAlertBtnRight" @click="submitBabyData">
          確定
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

// 載入你的Loading元件
import RaphaelLoading from "@/components/RaphaelLoading.vue";
import TitleMenu from "@/components/TitleMenu.vue";
import TagList from "@/components/TagList.vue";
import BabyIntro from "@/components/babyRecord/BabyIntro.vue";
import BabyCreateForm from "@/components/babyRecord/BabyCreateForm.vue";
import BabyProgress from "@/components/babyRecord/BabyProgress.vue";
import IndicatorSelect from "@/components/babyRecord/IndicatorSelect.vue";
import QAList from "@/components/QAList.vue";
import TimesSelect from "@/components/TimesSelect.vue";
import SolvePrioritySelect from "@/components/babyRecord/SolvePrioritySelect.vue";
import BabyReportResult from "@/components/babyRecord/BabyReportResult.vue";

import { useBabyStore } from "@/stores/useBabyStore";

export default {
  name: "BabyRecord",
  components: {
    RaphaelLoading,
    TitleMenu,
    TagList,
    BabyIntro,
    BabyCreateForm,
    BabyProgress,
    IndicatorSelect,
    QAList,
    TimesSelect,
    SolvePrioritySelect,
    BabyReportResult,
  },
  setup() {
    const router = useRouter();
    const babyStore = useBabyStore();

    // Loading
    const isLoading = ref(false);

    // 檢查登入
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};
    if (!MID || !Token || !MAID || !Mobile) {
      router.push("/");
    }

    // 進入畫面 => 先抓寶貝
    onMounted(() => {
      isLoading.value = true;
      babyStore
        .fetchGrowth()
        .then(() => {
          babyStore.babyAPIData.forEach((child) => {
            const cid = child.CID;
            const rec = babyStore.childRecords[cid];
            // 初次 or 大於一次
            if (!child.ChildANSTime) {
              rec.flowStage = "indicator";
            } else {
              if (Number(child.diffDaysFromToday) > 0) {
                rec.flowStage = "historyView";
                babyStore.fetchGrowthFirst(cid);
              } else {
                rec.flowStage = "chooseVersion";
              }
            }
          });
        })
        .finally(() => {
          isLoading.value = false;
        });
    });

    // 取得當前寶貝
    const hasChild = computed(() => babyStore.babyAPIData.length > 0);
    const curChildData = computed(
      () => babyStore.childRecords[babyStore.selectedChildID]
    );

    // ====== 新增寶貝 ======
    const showBabyCover = ref(false);
    const showBabyAlert = ref(false);
    const showAddBabyForm = ref(false);
    const babyInfos = ref([{ name: "", gender: "", birthDate: null }]);

    function onCommonButtonClick() {
      if (!hasChild.value) {
        if (!showAddBabyForm.value) {
          showAddBabyForm.value = true;
        } else {
          checkAndShowBabyAlert();
        }
      } else {
        const stage = curChildData.value?.flowStage;
        if (stage === "indicator") {
          const cid = babyStore.selectedChildID;
          const set = curChildData.value?.selectedAnsTypes;
          if (!set || set.size === 0) {
            alert("請至少選一個指標");
            return;
          }
          isLoading.value = true;
          babyStore.fetchChildQuestions(cid).finally(() => {
            isLoading.value = false;
          });
        }
      }
    }
    const commonButtonLabel = computed(() => {
      if (!hasChild.value) {
        return showAddBabyForm.value ? "送出寶貝" : "前往檢測";
      }
      const stage = curChildData.value?.flowStage;
      if (stage === "indicator") return "前往檢測";
      if (stage === "times") return "次數填寫中";
      return "下一步";
    });
    const isDisableCommonBtn = computed(() => {
      return curChildData.value?.flowStage === "times";
    });

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
          alert("請完整填寫寶貝資料");
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
        for (const b of babyInfos.value) {
          if (!b.name || !b.gender || !b.birthDate) {
            alert("請完整填寫寶貝資料");
            return;
          }
        }
        isLoading.value = true;
        const req = {
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
        const resp = await axios.post(
          "https://23700999.com:8081/HMA/API_ChildSave.jsp",
          req
        );
        if (resp.data.Result === "OK") {
          alert("新增寶貝成功");
          showBabyAlert.value = false;
          showBabyCover.value = false;
          showAddBabyForm.value = false;
          await babyStore.fetchGrowth();
        } else {
          alert("新增寶貝失敗：" + resp.data.Message);
        }
      } catch (err) {
        console.error(err);
        alert("伺服器錯誤");
      } finally {
        isLoading.value = false;
      }
    }

    // ========== chooseVersion ==========
    function setVersion(val) {
      curChildData.value.version = val;
    }
    async function onChooseVersionNext() {
      if (!curChildData.value.version) {
        alert("請選擇評估方式");
        return;
      }
      const cid = babyStore.selectedChildID;
      isLoading.value = true;
      await babyStore.fetchGrowthRecord(cid);
      isLoading.value = false;
      curChildData.value.flowStage = "indicator";
    }
    const ansTypes = computed(() => {
      const cid = babyStore.selectedChildID;
      return babyStore.childRecords[cid]?.growthRec?.ChildAnsAllType || {};
    });

    // QA 分頁
    const qaListRef = ref(null);
    const currentPage = computed(() => qaListRef.value?.currentPage || 1);
    const totalPages = computed(() => qaListRef.value?.totalPages || 1);
    const isPageFilled = computed(() => qaListRef.value?.isPageFilled);

    function onPrevPageClick() {
      qaListRef.value?.goPrevPage();
    }
    function onNextPageClick() {
      if (!qaListRef.value.isPageFilled) {
        alert("請先填完題目");
        return;
      }
      if (qaListRef.value.currentPage < qaListRef.value.totalPages) {
        qaListRef.value.goNextPage();
      } else {
        qaListRef.value.submitAllAnswers(); // -> onGoTimes
      }
    }
    const nextButtonLabel = computed(() => {
      if (currentPage.value < totalPages.value) {
        return `下一頁 (${currentPage.value}/${totalPages.value})`;
      }
      return `下一步 (${currentPage.value}/${totalPages.value})`;
    });
    const isDisableNextBtn = computed(() => !isPageFilled.value);
    const hasTwoButtons = computed(() => currentPage.value > 1);

    function onGoTimes(data) {
      const cid = babyStore.selectedChildID;
      const currentInfo = data.ChildInfo?.find((x) => x.CID === cid);
      if (currentInfo?.AID) {
        babyStore.childRecords[cid].AID = currentInfo.AID;
      }
      // 將後端回傳的 ChildAns => times
      babyStore.childRecords[cid].childTimesQues = data.ChildAns.map((q) => ({
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
      babyStore.childRecords[cid].flowStage = "times";
    }

    // times 分頁
    const timesCurrentPage = ref(1);
    const pageSize = 7;
    const timesQuestions = computed(
      () => curChildData.value?.childTimesQues || []
    );
    const timesTotalPages = computed(() =>
      Math.ceil(timesQuestions.value.length / pageSize || 1)
    );
    const timesStartIndex = computed(
      () => (timesCurrentPage.value - 1) * pageSize
    );
    const timesDisplayedQuestions = computed(() =>
      timesQuestions.value.slice(
        timesStartIndex.value,
        timesStartIndex.value + pageSize
      )
    );
    const isTimesPageFilled = computed(() =>
      timesDisplayedQuestions.value.every((q) => q.selectScore !== "")
    );

    function onTimesPrevPage() {
      if (timesCurrentPage.value > 1) timesCurrentPage.value--;
    }
    const timesNextButtonLabel = computed(() => {
      if (timesCurrentPage.value < timesTotalPages.value) {
        return `下一頁 (${timesCurrentPage.value}/${timesTotalPages.value})`;
      }
      return `下一步`;
    });
    async function onTimesNextClick() {
      if (!isTimesPageFilled.value) {
        alert("請先填完本頁");
        return;
      }
      if (timesCurrentPage.value < timesTotalPages.value) {
        timesCurrentPage.value++;
      } else {
        // 送次數 => priority
        isLoading.value = true;
        await saveTimesData();
        await submitGrowthSolve();
        isLoading.value = false;
        curChildData.value.flowStage = "priority";
      }
    }
    async function saveTimesData() {
      const cid = babyStore.selectedChildID;
      const rec = babyStore.childRecords[cid];
      const timesData = rec.childTimesQues.map((q) => ({
        QueSeq: q.id,
        QueTimesAns: q.selectScore,
      }));
      if (!timesData.length) return;

      try {
        const req = {
          MID,
          MAID,
          Token,
          Mobile,
          AID: rec.AID,
          CID: cid,
          ChildAnsTimes: timesData,
        };
        const resp = await axios.post(
          "https://23700999.com:8081/HMA/API_ChildAnsTimesSave.jsp",
          req
        );
        if (resp.data.Result === "OK") {
          if (resp.data.AID) {
            rec.AID = resp.data.AID;
          }
        } else {
          alert("儲存次數失敗：" + resp.data.Message);
        }
      } catch (err) {
        console.error("times error:", err);
      }
    }
    async function submitGrowthSolve() {
      const cid = babyStore.selectedChildID;
      const rec = babyStore.childRecords[cid];
      if (!rec.AID) {
        alert("缺少 AID");
        return;
      }
      try {
        const req = {
          MID,
          MAID,
          Token,
          Mobile,
          CID: cid,
          AID: rec.AID,
        };
        const resp = await axios.post(
          "https://23700999.com:8081/HMA/API_GrowthSolve.jsp",
          req
        );
        if (resp.data.Result !== "OK") {
          alert("送出解決方案失敗：" + resp.data.Message);
        }
      } catch (err) {
        console.error(err);
      }
    }

    // priority
    const selectedPriorityCount = ref(0);
    function onPrioritySelectionChanged(count) {
      selectedPriorityCount.value = count;
    }
    const priorityButtonStyle = computed(() => ({
      backgroundColor: selectedPriorityCount.value > 0 ? "#74bc1f" : "#bdbdbd",
    }));

    async function onPrioritySubmit() {
      if (selectedPriorityCount.value === 0) {
        alert("至少選一項");
        return;
      }
      isLoading.value = true;

      const cid = babyStore.selectedChildID;
      const success = await saveSolveData();
      if (!success) {
        isLoading.value = false;
        return;
      }
      await babyStore.fetchGrowthFirst(cid);

      const rec = babyStore.childRecords[cid];
      const AID = rec.AID || rec?.growthRec?.CIDChildAnsLast?.AID;
      if (!AID) {
        alert("目前無檢測資料");
        isLoading.value = false;
        return;
      }

      let preAID = "";
      const historyGroups = rec.reportData?.History || [];
      const groupIndex = historyGroups.findIndex(
        (group) => group.length > 0 && group[0].AID === AID
      );
      if (groupIndex >= 0 && groupIndex < historyGroups.length - 1) {
        preAID = historyGroups[groupIndex + 1][0]?.AID || "";
      }

      await babyStore.fetchGrowthCompare(cid, AID, preAID);
      rec.flowStage = "result";
      isLoading.value = false;
    }

    async function saveSolveData() {
      const cid = babyStore.selectedChildID;
      const rec = babyStore.childRecords[cid];
      if (!rec.AID) {
        alert("缺少 AID");
        return false;
      }
      const solveItems = rec.childTimesQues
        .filter((q) => rec.selectedPriority.has(q.id))
        .map((q) => ({ QueSeq: q.id }));

      try {
        const req = {
          MID,
          MAID,
          Token,
          Mobile,
          CID: cid,
          AID: rec.AID,
          ChildAnsSolve: solveItems,
        };
        const resp = await axios.post(
          "https://23700999.com:8081/HMA/API_ChildAnsSolveSave.jsp",
          req
        );
        if (resp.data.Result === "OK") {
          return true;
        } else {
          alert("儲存想解決的症狀失敗：" + resp.data.Message);
          return false;
        }
      } catch (err) {
        console.error(err);
        alert("儲存想解決的症狀錯誤");
        return false;
      }
    }

    // 切換寶貝
    function onClickChild(cid) {
      babyStore.selectedChildID = cid;
      const rec = babyStore.childRecords[cid];
      if (rec.flowStage === "historyView") {
        isLoading.value = true;
        babyStore.fetchGrowthFirst(cid).finally(() => {
          isLoading.value = false;
        });
      }
    }

    // 返回紀錄
    function goBackToHistory() {
      curChildData.value.flowStage = "historyView";
    }

    // 工具
    function formatDateToYYYYMMDD(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}${m}${d}`;
    }
    function formatCheckTime(str) {
      if (!str) return "";
      const M = Number(str.slice(5, 7));
      const D = Number(str.slice(8, 10));
      const hm = str.slice(11, 16);
      return `${M}/${D} ${hm}`;
    }
    function parseCheckTime(str) {
      if (!str) return null;
      const [datePart, timePart] = str.split(" ");
      if (!datePart) return null;
      const [yy, mm, dd] = datePart.split("/");
      return {
        year: Number(yy),
        month: Number(mm),
        day: Number(dd),
        timeStr: timePart || "",
      };
    }

    // 年/月篩選
    const selectedYear = ref(new Date().getFullYear());
    const selectedMonth = ref(new Date().getMonth() + 1);
    const yearBoxVisible = ref(false);
    const monthBoxVisible = ref(false);

    function toggleYearBox() {
      yearBoxVisible.value = !yearBoxVisible.value;
      if (yearBoxVisible.value) monthBoxVisible.value = false;
    }
    function toggleMonthBox() {
      monthBoxVisible.value = !monthBoxVisible.value;
      if (monthBoxVisible.value) yearBoxVisible.value = false;
    }
    function selectYear(y) {
      selectedYear.value = y;
      yearBoxVisible.value = false;
    }
    function selectMonth(m) {
      selectedMonth.value = m;
      monthBoxVisible.value = false;
    }

    const currentYear = new Date().getFullYear();
    const rawHistoryList = computed(() => curChildData.value?.reportData?.History || []);
    const displayYears = computed(() => {
      const yearsSet = new Set();
      rawHistoryList.value.flat().forEach((item) => {
        if (item.CheckTime) {
          const parsedTime = parseCheckTime(item.CheckTime);
          if (parsedTime && parsedTime.year) {
            yearsSet.add(parsedTime.year);
          }
        }
      });
      return Array.from(yearsSet).sort((a, b) => b - a);
    });
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const filteredHistoryList = computed(() => {
      return rawHistoryList.value.flat().filter((item) => {
        const parsed = parseCheckTime(item.CheckTime);
        if (!parsed) return false;
        return (
          parsed.year === selectedYear.value &&
          parsed.month === selectedMonth.value
        );
      });
    });

    async function onClickHistoryItem(histItem) {
      if (!histItem?.AID) return;
      const cid = babyStore.selectedChildID;
      const groups = curChildData.value?.reportData?.History || [];
      let preAID = "";
      const groupIndex = groups.findIndex((group) =>
        group.some(
          (item) =>
            item.AID === histItem.AID && item.CheckTime === histItem.CheckTime
        )
      );
      if (groupIndex >= 0 && groupIndex < groups.length - 1) {
        preAID = groups[groupIndex + 1][0]?.AID || "";
      }
      isLoading.value = true;
      await babyStore.fetchGrowthCompare(cid, histItem.AID, preAID);
      isLoading.value = false;
      curChildData.value.flowStage = "result";
    }

    return {
      // store
      babyStore,
      curChildData,

      // states
      isLoading,
      hasChild,
      babyInfos,
      showBabyCover,
      showBabyAlert,
      showAddBabyForm,

      // methods
      onCommonButtonClick,
      commonButtonLabel,
      isDisableCommonBtn,
      addBabyInfo,
      removeBaby,
      checkAndShowBabyAlert,
      closeBabyAlert,
      submitBabyData,
      setVersion,
      onChooseVersionNext,

      // QA
      qaListRef,
      currentPage,
      totalPages,
      isPageFilled,
      onPrevPageClick,
      onNextPageClick,
      nextButtonLabel,
      isDisableNextBtn,
      hasTwoButtons,
      onGoTimes,

      // times
      timesCurrentPage,
      timesTotalPages,
      timesStartIndex,
      timesDisplayedQuestions,
      isTimesPageFilled,
      timesNextButtonLabel,
      onTimesPrevPage,
      onTimesNextClick,

      // priority
      selectedPriorityCount,
      onPrioritySelectionChanged,
      priorityButtonStyle,
      onPrioritySubmit,

      // switch baby
      onClickChild,
      goBackToHistory,

      // utils
      formatDateToYYYYMMDD,
      formatCheckTime,
      parseCheckTime,

      // history
      selectedYear,
      selectedMonth,
      yearBoxVisible,
      monthBoxVisible,
      toggleYearBox,
      toggleMonthBox,
      selectYear,
      selectMonth,
      currentYear,
      displayYears,
      months,
      rawHistoryList,
      filteredHistoryList,
      onClickHistoryItem,

      // PINIA store getters
      ansTypes,
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
  padding-bottom: 4rem;
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
  // padding: 0.75rem 0 3.125rem 0;
  position: fixed;
  bottom: 0;
  left: 0;
  padding-bottom: 1rem;
  padding-top: 0.75rem;
  background-color: #f5f5f5;

  .babyRerordCommonBtn {
    background-color: #74bc1f;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 90%; // 預設 100% (單一按鈕)
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

  &.double-btn .babyRerordCommonBtn {
    width: 45%;
  }

  .babyRerordPrevBtn {
    background: #eee;
    color: #333;
  }
}

.chooseVersion {
  margin-top: 1rem;
  margin-bottom: 0.75rem;
  h3 {
    color: var(--shade-gray-500, #666);

    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.5px;
  }
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

.historyView {
  width: 100%;
  margin-top: .75rem;
}
.historyViewGroup {
  background-color: #fff;
  width: 100%;
  border-radius: 12px;
  padding: 12px 1rem;
  .historyViewItemGroup {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .historyViewItem {
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    .historyViewLeft {
      display: flex;
      align-items: center;
      img {
        border-radius: 7px;
        padding: 6px;
        border: 1px solid $raphael-green-400;
        margin-right: 6px;
      }
      h6 {
        color: var(--shade-black, #1e1e1e);

        /* Typographic/medium-r-20 */
        font-family: "Noto Sans";
        font-size: 20px;
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 20px */
        letter-spacing: var(--Title-Medium-Tracking, 0.15px);
      }
    }
  }
  .detectSelectGroup {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 0.75rem;
    padding: 0.75rem 0;
    color: $raphael-gray-500;
    margin-top: 0.25rem;
  }

  .yearSelectGroup {
    display: flex;
    align-items: center;
    gap: 2px;
    position: relative;
    cursor: pointer;
    .yearBox {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      position: absolute;
      top: 100%;
      right: 0;
      background: rgba(255, 255, 255, 0.85);
      width: 200%;
      border-radius: 8px;
      text-align: center;
      padding: 0.75rem;
      font-size: 18px;
      max-height: 200px;
      backdrop-filter: blur(6px);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
      overflow-y: auto;
      transform: 0.25s all ease;
      animation: 0.3s fadeIn forwards;
      z-index: 10;
      .year {
        transform: 0.25s all ease;
        &:hover {
          color: $raphael-green-400;
        }
      }
    }
  }
  .monthSelectGroup {
    display: flex;
    align-items: center;
    gap: 2px;
    position: relative;
    cursor: pointer;

    .monthBox {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      position: absolute;
      top: 100%;
      right: 0;
      background: rgba(255, 255, 255, 0.85);
      width: 200%;
      border-radius: 8px;
      text-align: center;
      padding: 0.75rem;
      font-size: 18px;
      max-height: 200px;
      backdrop-filter: blur(6px);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
      overflow-y: auto;
      transform: 0.25s all ease;
      opacity: 0;
      animation: 0.3s fadeIn forwards;
      z-index: 10;
      .month {
        transform: 0.25s all ease;
        &:hover {
          color: $raphael-green-400;
        }
      }
    }
  }
}
.babyQAGroup {
  p {
    padding-top: 0.25rem;
    padding-bottom: 0.5rem;
    color: var(--shade-gray-500, #666);

    font-size: 16px;
    font-style: normal;
    font-weight: 400;

    letter-spacing: 0.5px;
  }
}
.babyTimesGroup {
  h3 {
    padding-top: 0.5rem;

    color: var(--shade-gray-500, #666);

    font-size: 16px;
    font-style: normal;
    font-weight: 400;

    letter-spacing: 0.5px;
  }
}
.babyPriority {
  h3 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    color: var(--shade-gray-500, #666);

    font-size: 16px;
    font-style: normal;
    font-weight: 400;

    letter-spacing: 0.5px;
  }
}
</style>
