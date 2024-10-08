import { defineStore } from "pinia";
import axios from "axios";

export const useWeeklyRecord = defineStore("weeklyQA", {
  state: () => ({
    weeklyQA: [],
    currentStep: 1,
    totalStep: 0,
    timesStep: 1,
    totalTimesStep: 0,
    questionsPerPage: 7,
    nowState: "score",
    preDisabled: true, // Initially disabled
    nextDisabled: false, // Initially enabled
  }),

  getters: {
    sortedByScore: (state) => {
      return [...state.weeklyQA]
        .filter((q) => q.score > 0)
        .sort((a, b) => b.score - a.score);
    },

    nextText: (state) => {
      if (state.nowState === "score") {
        return state.currentStep + 1 > state.totalStep
          ? ""
          : `(${state.currentStep + 1}/${state.totalStep})`;
      } else if (state.nowState === "times") {
        return state.timesStep + 1 > state.totalTimesStep
          ? ""
          : `(${state.timesStep + 1}/${state.totalTimesStep})`;
      }
    },

    preText: (state) => {
      if (state.nowState === "score") {
        return state.currentStep <= 1
          ? ""
          : `(${state.currentStep}/${state.totalStep})`;
      } else if (state.nowState === "times") {
        return state.timesStep < 2
          ? ""
          : `(${state.timesStep}/${state.totalTimesStep})`;
      }
    },
  },

  actions: {
    async getQues() {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile } = localData
        ? JSON.parse(localData)
        : {};

      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_ANSOnlineGetQues.jsp",
          {
            MID: String(MID),
            Token: String(Token),
            MAID: String(MAID),
            Mobile: String(Mobile),
          }
        );

        if (response.status === 200) {
          console.log(response.data);
          const { QesCategoryArray, QesCategoryNameArray, QuesArray } =
            response.data;

          if (!QuesArray || !Array.isArray(QuesArray)) {
            throw new Error("QuesArray is undefined or not an array");
          }

          const combinedData = QuesArray.map((question, index) => ({
            id: index,
            question,
            category: QesCategoryNameArray[QesCategoryArray[index]] || "",
            categoryIndex: QesCategoryArray[index],
            score: 0,
            label: "未知",
            times: 0,
          }));

          this.weeklyQA = combinedData;

          this.totalStep = Math.ceil(
            combinedData.length / this.questionsPerPage
          );

          // Set initial button states
          this.preDisabled = this.currentStep === 1;
          this.nextDisabled = this.totalStep <= 1;
        }
      } catch (err) {
        console.error("Error while fetching questions:", err);
        throw err;
      }
    },

    handleNextStep() {
      if (this.nowState === "score") {
        const startIdx = (this.currentStep - 1) * this.questionsPerPage;
        const endIdx = Math.min(
          startIdx + this.questionsPerPage,
          this.weeklyQA.length
        );

        const allAnswered = this.weeklyQA
          .slice(startIdx, endIdx)
          .every((q) => q.score > 0);

        // Move to the next step
        if (this.currentStep < this.totalStep) {
          this.currentStep += 1;
        } else {
          // If on the last step of scores, switch to times
          this.nowState = "times";
          this.totalTimesStep = Math.ceil(
            this.sortedByScore.length / this.questionsPerPage
          );
        }
      } else if (this.nowState === "times") {
        if (this.timesStep < this.totalTimesStep) {
          this.timesStep += 1;
        }
      }

      // Update button states
      this.preDisabled = this.currentStep === 1;
      this.nextDisabled =
        this.nowState === "score"
          ? this.currentStep === this.totalStep
          : this.timesStep === this.totalTimesStep;
    },

    handlePrevStep() {
      if (this.nowState === "times") {
        // 在 times 階段時不做任何操作
        return; // 直接返回，防止回到 score 階段
      } else if (this.nowState === "score" && this.currentStep > 1) {
        // 如果在 score 階段且還有前一步，則回到前一步
        this.currentStep -= 1;
      }

      // 更新按鈕狀態
      this.preDisabled = this.nowState === "score" && this.currentStep === 1; // 只在 score 的第一步禁用
      this.nextDisabled = false;
    },
  },
});
