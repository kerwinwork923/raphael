<template>
  <div ref="qaListRef" class="QAList">
    <div
      class="scoreBarGroupWrap"
      v-for="(qItem, idx) in displayedQuestions"
      :key="qItem.id"
    >
      <!-- 題目標題 -->
      <div class="scrollBarTitle">
        {{ pageStartIndex + idx + 1 }}. {{ qItem.question }}
      </div>

      <!-- 顯示當前選擇的答案文字 -->
      <div class="scoreText">
        當前選擇：{{ getAnswerText(qItem.selectedScore, qItem.answers) }}
      </div>

      <!-- 進度條 -->
      <div class="scoreBarGroup">
        <div
          class="scoreBar"
          :style="{ width: `${qItem.selectedScore * 33.33}%` }"
        ></div>
        <div
          class="remainingBar"
          :style="{ width: `${(3 - qItem.selectedScore) * 33.33}%` }"
        ></div>

        <div class="numberGroup">
          <div
            v-for="(answer, scoreVal) in qItem.answers"
            :key="scoreVal"
            class="number"
            :class="{ selected: scoreVal <= qItem.selectedScore }"
            @click="onClickScore(qItem, scoreVal)"
          >
            {{ scoreVal }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, defineExpose, watch, nextTick } from "vue";
import axios from "axios";

export default {
  name: "QAList",
  props: {
    questions: {
      type: Array,
      default: () => [],
    },
    CID: {
      type: String,
      default: "",
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    pageSize: {
      type: Number,
      default: 7,
    },
  },
  emits: ["update-page"],
  setup(props, { emit }) {
    // 綁定 QAList 容器
    const qaListRef = ref(null);

    // 讀取使用者資料
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

    // 分頁控制
    const localCurrentPage = ref(props.currentPage);
    const totalPages = computed(() => Math.ceil(props.questions.length / props.pageSize));
    const pageStartIndex = computed(() => (localCurrentPage.value - 1) * props.pageSize);

    // 取得本頁題目
    const displayedQuestions = computed(() => {
      const start = pageStartIndex.value;
      const end = start + props.pageSize;
      return props.questions.slice(start, end).map((item) => {
        if (item.selectedScore === undefined) {
          item.selectedScore = 0;
        }
        return item;
      });
    });

    // 點擊選擇分數
    function onClickScore(qItem, scoreVal) {
      qItem.selectedScore = String(scoreVal);
    }

    function getAnswerText(scoreVal, answers) {
      return answers && answers[scoreVal] ? answers[scoreVal] : "未知";
    }

    const isPageFilled = computed(() => {
      return displayedQuestions.value.every((q) => q.selectedScore !== undefined);
    });

    // 滾動回到頂部
    function scrollToTop() {
      nextTick(() => {
        if (qaListRef.value) {
          qaListRef.value.scrollTop = 0;
        }
      });
    }

    // 翻頁控制
    function goNextPage() {
      if (localCurrentPage.value < totalPages.value) {
        localCurrentPage.value++;
        scrollToTop(); // 翻頁後滾回頂部
      }
    }

    function goPrevPage() {
      if (localCurrentPage.value > 1) {
        localCurrentPage.value--;
        scrollToTop(); // 翻頁後滾回頂部
      }
    }

    // 監聽頁碼變化，通知父層
    watch(() => localCurrentPage.value, (val) => {
      emit("update-page", val);
    });

    // 送出答案
    async function submitAllAnswers() {
      try {
        const ansArray = props.questions.map((q) => ({
          QueSeq: q.id,
          QueAns: String(q.selectedScore),
        }));

        const reqAnsSave = {
          MID,
          Token,
          MAID,
          Mobile,
          CID: props.CID,
          ChildAns: ansArray,
        };

        console.log("🚀 送出 API_ChildAnsSave", reqAnsSave);
        const resAnsSave = await axios.post(
          "https://23700999.com:8081/HMA/API_ChildAnsSave.jsp",
          reqAnsSave
        );
        console.log("✅ 收到 API_ChildAnsSave 回應", resAnsSave.data);

        if (resAnsSave.data.Result !== "OK") {
          alert("❌ API_ChildAnsSave 失敗：" + resAnsSave.data.Message);
          return;
        }

        const { ChildInfo, ChildAns } = resAnsSave.data;
        const childInfo = ChildInfo.find((child) => child.CID === props.CID);
        const AID = childInfo?.AID || "";

        const reqGrowthRecTimes = {
          MID,
          Token,
          MAID,
          Mobile,
          CID: props.CID,
          AID,
        };

        console.log("🚀 送出 API_GrowthRecTimes", reqGrowthRecTimes);
        const resGrowthRecTimes = await axios.post(
          "https://23700999.com:8081/HMA/API_GrowthRecTimes.jsp",
          reqGrowthRecTimes
        );
        console.log("✅ 收到 API_GrowthRecTimes 回應", resGrowthRecTimes.data);

        if (resGrowthRecTimes.data.Result !== "OK") {
          alert("❌ API_GrowthRecTimes 失敗：" + resGrowthRecTimes.data.Message);
          return;
        }

        emit("go-times", resGrowthRecTimes.data);
      } catch (err) {
        console.error("❌ 提交失敗", err);
      }
    }

    defineExpose({
      currentPage: localCurrentPage,
      totalPages,
      isPageFilled,
      goNextPage,
      goPrevPage,
      submitAllAnswers,
    });

    return {
      qaListRef, // 綁定滾動容器
      localCurrentPage,
      totalPages,
      pageStartIndex,
      displayedQuestions,
      isPageFilled,
      onClickScore,
      getAnswerText,
      goNextPage,
      goPrevPage,
      submitAllAnswers,
    };
  },
};
</script>


<style scoped lang="scss">
.QAList {
  // 容器高度可以依實際需要調整
  height: calc(100vh - 269px);
  overflow-y: auto;

  .scoreBarGroupWrap {
    background-color: #fff;
    margin-bottom: 0.75rem;
    padding: 0.75rem;
    border-radius: 12px;

    .scrollBarTitle {
      font-size: 20px;
      color: #000;
      margin-bottom: 0.5rem;
    }

    .scoreText {
      text-align: center;
      font-size: 16px;
      color: #74bc1f;
      margin: 0.25rem 0 1rem 0;
    }

    .scoreBarGroup {
      position: relative;
      display: flex;
      align-items: center;
      height: 6px;
      width: 100%;
      margin-bottom: 10px;

      .scoreBar {
        height: 100%;
        background-color: #74bc1f;
        transition: width 0.3s;
      }
      .remainingBar {
        height: 100%;
        background-color: #ccc;
        transition: width 0.3s;
      }

      .numberGroup {
        display: flex;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;

        .number {
          background-color: #ccc;
          border-radius: 50%;
          color: #fff;
          width: 1.5rem;
          height: 1.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: background-color 0.3s;

          &.selected {
            background-color: #74bc1f;
          }
        }
      }
    }
  }
}
</style>
