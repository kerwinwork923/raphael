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
    selectQuestionPerPage: 7,
    nowState: "score",
    preDisabled: true,
    nextDisabled: false,
  }),

  getters: {
    sortedByScore: (state) => {
      return [...state.weeklyQA]
        .filter((q) => q.selectScore > 0)
        .sort((a, b) => b.selectScore - a.selectScore);
    },

    nextText: (state) => {
      if (state.nowState === "score") {
        return state.currentStep + 1 > state.totalStep
          ? "下一步"
          : `下一頁(${state.currentStep + 1}/${state.totalStep})`;
      } else if (state.nowState === "times") {
        return state.timesStep + 1 > state.totalTimesStep
          ? "下一步"
          : `下一頁(${state.timesStep + 1}/${state.totalTimesStep})`;
      } else if (state.nowState === "choose") {
        return "看報告";
      }
    },

    preText: (state) => {
      if (state.nowState === "score") {
        return state.currentStep <= 1
          ? "上一步"
          : `上一步(${state.currentStep}/${state.totalStep})`;
      } else if (state.nowState === "times") {
        return state.timesStep < 2
          ? "上一步"
          : `上一頁(${state.timesStep}/${state.totalTimesStep})`;
      } else if (state.nowState === "choose") {
        return "上一步";
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
            selectScore: 0,
            label: "未知",
            times: -1,
          }));

          this.weeklyQA = combinedData;

          this.totalStep = Math.ceil(
            combinedData.length / this.questionsPerPage
          );

          this.preDisabled = this.currentStep === 1;
          this.nextDisabled = this.totalStep <= 1;
        }
      } catch (err) {
        console.error("Error while fetching questions:", err);
        throw err;
      }
    },

    async API_ANSOnlineQSaveAns() {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile, Name, Sex } = localData
        ? JSON.parse(localData)
        : {};

      let AnsMap = new Map();
      this.weeklyQA.forEach((question, index) => {
        AnsMap.set(`key${index + 1}`, String(question.score));
      });

      const ansMapJson = JSON.stringify(Array.from(AnsMap.entries()));

      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_ANSOnlineQSaveAns.jsp",
          {
            MID: String(MID),
            Token: String(Token),
            MAID: String(MAID),
            Mobile: String(Mobile),
            name: Name,
            rbirth: "",
            Email: "",
            Area: "",
            Address: "",
            Sex: String(Sex),
            AnsMap: ansMapJson,
          }
        );

        if (response.status === 200) {
          const AID = response.data.AID;
          if (AID) {
            const updatedLocalData = {
              MID,
              Token,
              MAID,
              Mobile,
              Name,
              Sex,
              AID,
            };
            localStorage.setItem("userData", JSON.stringify(updatedLocalData));
          }
        }
      } catch (err) {
        console.error("Error while fetching questions:", err);
        throw err;
      }
    },

    async API_ANSOnlineTimesSaveTimes() {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile, Name, Sex, AID } = localData
        ? JSON.parse(localData)
        : {};

      let AnsTimesMap = new Map();
      this.sortedByScore.forEach((question, index) => {
        AnsTimesMap.set(`key${question.id + 1}`, String(question.times));
      });

      const ansMapTimesJson = JSON.stringify(Array.from(AnsTimesMap.entries()));

      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_ANSOnlineTimesSaveTimes.jsp",
          {
            MID: String(MID),
            Token: String(Token),
            MAID: String(MAID),
            Mobile: String(Mobile),
            AID: String(AID),
            AnsTimesMap: ansMapTimesJson,
          }
        );

        if (response.status === 200) {
        }
      } catch (err) {
        throw err;
      }
    },

    async API_ANSOnlineSolveSaveSolve() {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile, Name, Sex, AID } = localData
        ? JSON.parse(localData)
        : {};

      let AnsSolveArray = [];

      this.sortedByScore.forEach((question) => {
        if (question.active) {
          AnsSolveArray.push(`key${question.id + 1}`);
        }
      });

      const AnsSolveArrayJson = JSON.stringify(AnsSolveArray);
      console.log();

      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_ANSOnlineSolveSaveSolve.jsp",
          {
            MID: String(MID),
            Token: String(Token),
            MAID: String(MAID),
            Mobile: String(Mobile),
            AID: String(AID),
            AnsSolveArray: AnsSolveArrayJson,
          }
        );

        if (response.status === 200) {
        }
      } catch (err) {
        console.error("Error while fetching questions:", err);
        throw err;
      }
    },

    checkMinimumItems() {
      const itemsAboveZero = this.weeklyQA.filter((q) => q.selectScore > 0);
      if (itemsAboveZero.length < 10) {
        alert("選項項目不足，請至少選擇 10 項超過 0 分的問題");
        return false;
      }
      return true;
    },

    async handleNextStep() {
      if (this.nowState === "score") {
        const startIdx = (this.currentStep - 1) * this.questionsPerPage;
        const endIdx = Math.min(
          startIdx + this.questionsPerPage,
          this.weeklyQA.length
        );

        const allAnswered = this.weeklyQA
          .slice(startIdx, endIdx)
          .every((q) => q.score > 0);

        if (this.currentStep < this.totalStep) {
          this.currentStep += 1;
        } else {
          //判別項目是否超過10個
          const itemsAboveZero = this.weeklyQA.filter((q) => q.selectScore > 0);
          if (itemsAboveZero.length < 10) {
            alert("選項項目不足，請至少選擇 10 的項目");
            return false;
          }
          // await this.API_ANSOnlineQSaveAns();
          this.nowState = "times";

          this.totalTimesStep = Math.ceil(
            this.sortedByScore.length / this.questionsPerPage
          );
        }
      } else if (this.nowState === "times") {
        // 計算當前頁面應回答的問題總數
        const selectedCount = this.weeklyQA.filter((q) => q.times >= 0).length;
        const currentPage = this.timesStep;

        const total = this.sortedByScore.length;
        const totalPage = Math.floor(total / this.selectQuestionPerPage);

        if (currentPage > totalPage) {
          if (selectedCount  % this.selectQuestionPerPage != total % this.selectQuestionPerPage) {
            alert("尚未選擇完成");
            return;
          }
        } 
        
        
        else {
          if (selectedCount < this.selectQuestionPerPage *currentPage) {
            alert("尚未選擇完成");
            return;
          }
        }

        // 繼續下一頁或處理完成邏輯
        if (this.timesStep < this.totalTimesStep) {
          this.timesStep += 1; // 移動到下一頁
        } else {
          // 處理最後一步
          this.nowState = "choose"; // 轉換狀態
        }
      } else if (this.nowState === "choose") {
        // await this.API_ANSOnlineSolveSaveSolve();
      }

      this.preDisabled = this.currentStep === 1;
      this.nextDisabled =
        this.nowState === "score"
          ? this.currentStep === this.totalStep
          : this.timesStep === this.totalTimesStep;
    },

    handlePrevStep() {
      if (this.nowState === "times" && this.timesStep > 1) {
        this.timesStep -= 1;
      } else if (this.nowState === "score" && this.currentStep > 1) {
        this.currentStep -= 1;
      }

      this.preDisabled = this.nowState === "score" && this.currentStep === 1; // 只在 score 的第一步禁用
      this.nextDisabled = false;
    },

    toggleActive(symptomId) {
      const symptom = this.weeklyQA.find((q) => q.id === symptomId);
      if (symptom) {
        symptom.active = !symptom.active;
      }
    },
  },
});
