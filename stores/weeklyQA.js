import { defineStore } from "pinia";
import axios from "axios";
import { useCommon } from "./common";

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
    theLatestHistory: {},
    theLatestData: {},
    theLatestHistoryPre: {},
    theLatestDataPreData: {},
    diffDays: "",
    diffenenceObj: {},
    History:{}
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
    // 獲取題目
    async getQues() {
      const common = useCommon();
      common.startLoading();

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
        common.setError(err);
      } finally {
        common.stopLoading();
      }
    },
    // 保存答案
    async API_ANSOnlineQSaveAns() {
      const common = useCommon();
      common.startLoading();

      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile, Name } = localData
        ? JSON.parse(localData)
        : {};
      let { Sex } = localData ? JSON.parse(localData) : {};

      if (Sex == "0") {
        Sex = 1;
      }
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
        console.error("Error while saving answers:", err);
        common.setError(err);
      } finally {
        common.stopLoading();
      }
    },
    // 儲存題目
    async API_ANSOnlineTimesSaveTimes() {
      const common = useCommon();
      common.startLoading();

      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile, Name, Sex, AID } = localData
        ? JSON.parse(localData)
        : {};

      let AnsTimesMap = new Map();
      this.sortedByScore.forEach((question) => {
        // 濾掉次數小於等於 0 的問題
        if (question.times > 0) {
          AnsTimesMap.set(`key${question.id + 1}`, String(question.times));
        }
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
          // 這裡可以處理成功的情況
        }
      } catch (err) {
        console.error("Error while saving times:", err);
        common.setError(err);
      } finally {
        common.stopLoading();
      }
    },

    // 想解決的方案
    async API_ANSOnlineSolveSaveSolve() {
      const common = useCommon(); // 引入 useCommon store
      common.startLoading();

      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile, AID } = localData
        ? JSON.parse(localData)
        : {};

      let AnsSolveArray = [];

      this.sortedByScore.forEach((question) => {
        if (question.active && question.times >= 0) {
          // 濾掉 times 小於 0 的項目
          AnsSolveArray.push(`key${question.id + 1}`);
        }
      });

      const AnsSolveArrayJson = JSON.stringify(AnsSolveArray);

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
          // 處理成功回應
        }
      } catch (err) {
        console.error("Error while saving solve:", err);
        common.setError(err);
      } finally {
        common.stopLoading();
      }
    },

    // 第一次打API並紀錄最新紀錄
    async API_API_ANSFirstDetail() {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile } = localData
        ? JSON.parse(localData)
        : {};
      try {
        const response1 = await axios.post(
          "https://23700999.com:8081/HMA/API_ANSFirstDetail.jsp",
          {
            MID: String(MID),
            Token: String(Token),
            MAID: String(MAID),
            Mobile: String(Mobile),
            AID: "",
          }
        );
        if (response1.status === 200) {
          //Pinia取得歷史紀錄
          this.History = response1.data?.History

          // 假設大於1以上，紀錄theLatestData、theLatestDataPreData
          if (response1.data.History.length > 1) {
            this.theLatestHistory = response1.data.History[0];
            const response2 = await axios.post(
              "https://23700999.com:8081/HMA/API_ANSFirstDetail.jsp",
              {
                MID: String(MID),
                Token: String(Token),
                MAID: String(MAID),
                Mobile: String(Mobile),
                AID: response1.data.History[0].preAID,
              }
            );
            this.theLatestData = response2.data;
            this.theLatestHistoryPre = response1.data.History[1];
            const response3 = await axios.post(
              "https://23700999.com:8081/HMA/API_ANSFirstDetail.jsp",
              {
                MID: String(MID),
                Token: String(Token),
                MAID: String(MAID),
                Mobile: String(Mobile),
                AID: response1.data.History[1].preAID,
              }
            );
            this.theLatestDataPreData = response3.data;
            await this.checkTestDate();
          }
          //只有一個紀錄theLatestData
          else if (response1.data.History.length > 0) {
            this.theLatestHistory = response1.data.History[0];
            const response2 = await axios.post(
              "https://23700999.com:8081/HMA/API_ANSFirstDetail.jsp",
              {
                MID: String(MID),
                Token: String(Token),
                MAID: String(MAID),
                Mobile: String(Mobile),
                AID: response1.data.History[0].preAID,
              }
            );
            this.theLatestData = response2.data;
            console.log(this.theLatestHistory);

            await this.checkTestDate();
          } else {
            await this.getQues();
          }
        }
      } catch (err) {
        console.error("Error while fetching questions:", err);
        throw err;
      }
    },
    //輔助API_API_ANSFirstDetail
    async checkTestDate() {
      if (this.theLatestHistory.CheckTime) {
        const currentDate = new Date();
        const lastTestDateStr = this.theLatestHistory.CheckTime;
        const year = parseInt(lastTestDateStr.substring(0, 4), 10);
        const month = parseInt(lastTestDateStr.substring(4, 6), 10) - 1;
        const day = parseInt(lastTestDateStr.substring(6, 8), 10);
        const hours = parseInt(lastTestDateStr.substring(8, 10), 10);
        const minutes = parseInt(lastTestDateStr.substring(10, 12), 10);
        const seconds = parseInt(lastTestDateStr.substring(12, 14), 10);

        const lastTestDate = new Date(
          year,
          month,
          day,
          hours,
          minutes,
          seconds
        );

        if (!isNaN(lastTestDate.getTime())) {
          const diffTime = currentDate - lastTestDate;

          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor(
            (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );

          const remainingDays = 12 - diffDays;
          const remainingHours = diffHours > 0 ? 24 - diffHours : 0;

          if (remainingDays > 0) {
            this.diffDays = `${remainingDays}天`;
          } else if (remainingDays === 0 && remainingHours > 0) {
            this.diffDays = `${remainingHours}小時`;
          } else {
            this.diffDays = "已經超過12天";
          }

          if (diffDays < 12) {
            this.nowState = "result";
            await this.API_API_ANSSecond();
            return;
          } else {
            await this.getQues();
          }
        }
      } else {
        await this.getQues();
      }
    },

    // 比較前後次
    async API_API_ANSSecond() {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile } = localData
        ? JSON.parse(localData)
        : {};

      try {
        const response1 = await axios.post(
          "https://23700999.com:8081/HMA/API_ANSSecond.jsp",
          {
            MID: String(MID),
            Token: String(Token),
            MAID: String(MAID),
            Mobile: String(Mobile),
            AID: String(this.theLatestHistory?.preAID),
            preAID: String(this.theLatestHistoryPre?.preAID),
          }
        );

        if (response1.status === 200) {
          console.log(response1.data);
          this.diffenenceObj = {
            ...response1.data,
            C1Symptom: "精神系統",
            C2Symptom: "神經系統",
            C3Symptom: "血液循環系統",
            C4Symptom: "感官系統",
            C5Symptom: "心肺系統",
            C6Symptom: "過敏免疫系統",
            C7Symptom: "腸胃系統",
            C8Symptom: "泌尿生殖系統",
            C9Symptom: "血液循環系統",
          };
        }
      } catch (err) {
        console.error("Error while fetching questions:", err);
        throw err;
      }
    },
    // 檢查題目是否有3題
    // checkMinimumItems() {
    //   const itemsAboveZero = this.weeklyQA.filter((q) => q.selectScore > 0);
    //   if (itemsAboveZero.length < 3) {
    //     alert("選項項目不足，請至少選擇 3 項超過 0 分的問題");
    //     return false;
    //   }
    //   return true;
    // },

    // 下一步按鈕處理
    async handleNextStep() {
      const common = useCommon();
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
          // 判别项目是否超过10个
          const itemsAboveZero = this.weeklyQA.filter((q) => q.selectScore > 0);
          if (itemsAboveZero.length < 3) {
            alert("選項項目不足，請至少選擇3題");
            return false;
          }
          // await this.API_ANSOnlineQSaveAns();
          this.nowState = "times";

          this.totalTimesStep = Math.ceil(
            this.sortedByScore.length / this.questionsPerPage
          );
        }
      } else if (this.nowState === "times") {
        // // 計算已選擇的問題數量
        // const selectedCount = this.weeklyQA.filter((q) => q.times >= 0).length;

        // // 當前頁面
        // const currentPage = this.timesStep;

        // // 總問題數量
        // const total = this.sortedByScore.length;

        // // 總頁數
        // const totalPage = Math.ceil(total / this.selectQuestionPerPage);

        // // 檢查是否為最後一頁
        // const isLastPage = currentPage === totalPage;

        // if (!isLastPage) {
        //   // 如果不是最後一頁，檢查當前頁是否選擇了足夠的問題
        //   if (selectedCount < this.selectQuestionPerPage * currentPage) {
        //     alert("尚未選擇完成");
        //     return;
        //   }
        // } else {
        //   // 如果是最後一頁，檢查選擇的問題總數是否正確
        //   if (selectedCount < total) {
        //     alert("尚未選擇完成");
        //     return;
        //   }
        // }

        // 進入下一頁或處理最後一步
        if (this.timesStep < this.totalTimesStep) {
          this.timesStep += 1;
        } else {
          this.nowState = "choose";
        }
      } else if (this.nowState === "choose") {
        await this.API_ANSOnlineQSaveAns();
        await this.API_ANSOnlineTimesSaveTimes();
        await this.API_ANSOnlineSolveSaveSolve();
        await this.API_API_ANSFirstDetail();
        this.nowState = "result";
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
