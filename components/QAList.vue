<template>

  <div class="QAList">
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
          <!-- 依 0~3 迭代，顯示對應的答案選項 -->
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
import { ref, computed, defineExpose, watch, onMounted } from "vue";
import axios from "axios";

export default {
  name: "QAList",
  props: {
    // 從上層傳入「題目陣列」與「CID」(寶貝ID)。
    questions: {
      type: Array,
      default: () => [],
    },
    CID: {
      type: String,
      default: "", // 從外層 (BabyRecord) 傳下來
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
    // ============ 1) 從 localStorage 取出 MID, Token, MAID, Mobile ============
    const localData = localStorage.getItem("userData");
    // 若 localData 有值則解析，否則給空 {}
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

    // ============ 2) 分頁控制 ============
    const localCurrentPage = ref(props.currentPage);
    const totalPages = computed(() =>
      Math.ceil(props.questions.length / props.pageSize)
    );
    const pageStartIndex = computed(
      () => (localCurrentPage.value - 1) * props.pageSize
    );

    // 取得本頁題目
    const displayedQuestions = computed(() => {
      const start = pageStartIndex.value;
      const end = start + props.pageSize;
      return props.questions.slice(start, end).map((item) => {
        if (item.selectedScore === undefined) {
          item.selectedScore = 0; // 預設0分
        }
        return item;
      });
    });

    // ============ 3) 點擊分數 =============
    function onClickScore(qItem, scoreVal) {
      qItem.selectedScore = String(scoreVal); // ✅ 轉為字串
    }

    function getAnswerText(scoreVal, answers) {
      return answers && answers[scoreVal] ? answers[scoreVal] : "未知";
    }

    // 是否填完本頁
    const isPageFilled = computed(() => {
      return displayedQuestions.value.every(
        (q) => q.selectedScore !== undefined
      );
    });

    // ============ 4) 翻頁 ============
    function goNextPage() {
      if (localCurrentPage.value < totalPages.value) {
        localCurrentPage.value++;
      }
    }
    function goPrevPage() {
      if (localCurrentPage.value > 1) {
        localCurrentPage.value--;
      }
    }

    // 頁碼改變 => 通知外層
    watch(
      () => localCurrentPage.value,
      (val) => {
        emit("update-page", val);
      }
    );

    // ============ 5) 同時呼叫 2 API：API_ChildAnsTimesSave + API_GrowthRecTimes.jsp  ============
    async function submitAllAnswers() {
  try {
    // (A) 準備傳參數
    const ansArray = props.questions.map((q) => ({
      QueSeq: q.id,
      QueAns: String(q.selectedScore), // 0~3
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

    // (B) 後端回傳的資料
    // 例如 ChildInfo, Member, ChildAns 等
    const { ChildInfo, ChildAns, Result } = resAnsSave.data;

    // 取出當前寶貝的 AID (若需要繼續呼叫 GrowthRecTimes)
    const childInfo = ChildInfo.find((child) => child.CID === props.CID);
    const AID = childInfo?.AID || "";

    // (C) 如果要再呼叫 API_GrowthRecTimes (後端另一支API)
    // 否則，你也可以直接使用 resAnsSave.data.ChildAns 作為「次數」題目
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

    // (D) 把後端回傳的資料放到 store / 或本地
    // 例如：
    // babyStore.childRecords[props.CID].childTimesQues = resGrowthRecTimes.data.ChildAns.map(...)

    // (E) 切換到 times 頁
    // 建議父層 (BabyRecord) 才能修改 flowStage
    // 所以可以 emit 到父層，讓父層去更新 flowStage
    emit("go-times", resGrowthRecTimes.data);


  } catch (err) {
    console.error("❌ 提交失敗", err);
  }
}


    // ============ 6) defineExpose 讓外層可呼叫 ============
    defineExpose({
      currentPage: localCurrentPage,
      totalPages,
      isPageFilled,
      goNextPage,
      goPrevPage,
      submitAllAnswers,
    });

    return {
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
