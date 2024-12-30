import { defineStore } from "pinia";
import axios from "axios";
import { useCommon } from "./common";

export const useWeeklyRecord = defineStore("weeklyQA", {
  state: () => ({
    weeklyQA: [],
    version: "tracking",
    fullQuestions: [], // 完整的題目集合
    filteredQuestions: [], // 症狀追蹤版本的題目集合
    currentStep: 1,
    totalStep: 0,
    timesStep: 1,
    totalTimesStep: 0,
    questionsPerPage: 7,
    selectQuestionPerPage: 7,
    nowState: "",
    preDisabled: true,
    nextDisabled: false,
    theLatestHistory: {},
    theLatestData: {},
    theLatestHistoryPre: {},
    theLatestDataPreData: {},
    diffDays: "",
    diffenenceObj: {},
    History: {},
  }),

  getters: {
    sortedByScore: (state) => {
      return [...state.weeklyQA]
        .filter((q) => q.selectScore > 0)
        .sort((a, b) => b.selectScore - a.selectScore);
    },

    nextText: (state) => {
      if (state.nowState === "first") {
        return `開始檢測`;
      } else if (state.nowState === "second") {
        return `開始檢測`;
      } else if (state.nowState === "score") {
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
          : `上一頁 (${state.currentStep}/${state.totalStep})`;
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
    setVersion(newVersion) {
      // console.log("Setting version to:", newVersion);
      this.version = newVersion;
      this.updateWeeklyQA();
    },

    updateWeeklyQA() {
      // console.log("Current version:", this.version);
      this.weeklyQA =
        this.version === "tracking"
          ? this.filteredQuestions
          : this.fullQuestions;
      this.totalStep = Math.ceil(this.weeklyQA.length / this.questionsPerPage);
      this.currentStep = 1; // 重置當前分頁
      // console.log("Updated weeklyQA:", this.weeklyQA);
    },

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
          { MID, Token, MAID, Mobile }
        );

        if (response.status === 200) {
          const {
            QesCategoryArray,
            QesCategoryNameArray,
            QuesArray,
            QuesNeedAnswerArray,
          } = response.data;

          // 完整題目
          const fullQuestions = QuesArray.map((question, index) => ({
            id: index + 1,
            question,
            category: QesCategoryNameArray[QesCategoryArray[index]] || "",
            selectScore: 0,
          }));

          // 症狀追蹤題目
          const filteredQuestions = QuesNeedAnswerArray.map((id) => {
            const questionIndex = parseInt(id, 10) - 1; // 從字符串轉數字，且題目索引從 1 開始
            return questionIndex >= 0 && questionIndex < fullQuestions.length
              ? fullQuestions[questionIndex]
              : null;
          }).filter(Boolean);

          this.fullQuestions = fullQuestions;
          this.filteredQuestions = filteredQuestions;

          // 根據當前版本更新 weeklyQA
          this.updateWeeklyQA();
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
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
      const {
        MID,
        Token,
        MAID,
        Mobile,
        Name,
        Birthday,
        Mail,
        Zone,
        Address,
        Sex,
      } = localData ? JSON.parse(localData) : {};

      // 字段對應處理
      const rbirth = Birthday || ""; // 映射生日
      const Email = Mail || ""; // 映射電子郵件
      const Area = Zone || ""; // 映射地區

      // 構建答案映射
      let AnsMap = new Map();
      this.weeklyQA.forEach((question, index) => {
        const score = question.score !== undefined ? question.score : 0; // 默認值為 0
        AnsMap.set(`key${index + 1}`, String(score));
      });

      // 將答案映射轉為 JSON 格式
      const ansMapJson = JSON.stringify(Object.fromEntries(AnsMap));

      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_ANSOnlineQSaveAns.jsp",
          {
            MID: String(MID),
            Token: String(Token),
            MAID: String(MAID),
            Mobile: String(Mobile),
            name: String(Name),
            rbirth: String(rbirth),
            Email: String(Email),
            Area: String(Area),
            Address: String(Address || ""),
            Sex: String(Sex),
            AnsMap: ansMapJson,
          }
        );

        if (response.status === 200) {
          console.log("API_ANSOnlineQSaveAns response:", response.data);

          // 如果有返回 AID，更新本地存儲
          const AID = response.data.AID;
          if (AID) {
            const updatedData = { ...JSON.parse(localData), AID };
            localStorage.setItem("userData", JSON.stringify(updatedData));
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
        if (question.times < 0) {
          question.times = 0;
        }
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

      // 如果 sortedByScore 不为空，直接返回，不执行后续逻辑
      if (this.sortedByScore.length > 0) {
        console.log("sortedByScore 已有值，跳过 API 调用");
        return;
      }

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

          this.History = response1.data?.History;
          if (response1.data.AID !== "") {
            this.theLatestHistory = response1.data;
            this.theLatestData = response1.data;

            // 假如有两笔记录
            if (response1.data.History.length > 0) {
              this.theLatestHistoryPre = response1.data.History[0];
              console.log(this.theLatestHistoryPre);

              const response2 = await axios.post(
                "https://23700999.com:8081/HMA/API_ANSFirstDetail.jsp",
                {
                  MID: String(MID),
                  Token: String(Token),
                  MAID: String(MAID),
                  Mobile: String(Mobile),
                  AID: String(response1.data.History[0].preAID),
                }
              );

              this.theLatestDataPreData = response2.data;
            }

            await this.checkTestDate();
            await this.API_API_ANSSecond();
          } else if (response1.data.History.length > 0) {
            // 只有一个记录

            this.theLatestHistory = response1.data.History[0];
            const response2 = await axios.post(
              "https://23700999.com:8081/HMA/API_ANSFirstDetail.jsp",
              {
                MID: String(MID),
                Token: String(Token),
                MAID: String(MAID),
                Mobile: String(Mobile),
                AID: String(response1.data.History[0].preAID),
              }
            );
            this.theLatestData = response2.data;
            console.log(this.theLatestHistory);

            await this.checkTestDate();
          } else {
            this.nowState = "first";
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

        // 將日期和時間從格式 "2024/11/18 15:42" 中解析出來
        const [datePart, timePart] = lastTestDateStr.split(" ");
        const [year, month, day] = datePart.split("/").map(Number);
        const [hours, minutes] = timePart.split(":").map(Number);

        // 建立日期物件
        const lastTestDate = new Date(year, month - 1, day, hours, minutes);

        if (!isNaN(lastTestDate.getTime())) {
          const diffTime = currentDate - lastTestDate;

          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor(
            (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );

          const remainingDays = 6 - diffDays;
          let remainingHours = 0;

          if (remainingDays > 0) {
            if (diffDays === 0) {
              remainingHours = 6 - diffHours;
            }
            this.diffDays = `${remainingDays}天`;
          } else if (remainingDays === 0 && remainingHours > 0) {
            this.diffDays = `${remainingHours}小時`;
          } else {
            // this.diffDays = "已經超過6天";
          }

          if (diffDays < 6) {
            this.nowState = "result";
            await this.API_API_ANSSecond();
            return;
          } else {
            this.nowState = "second";
            await this.getQues();
          }
        }
      } else {
        this.nowState = "second";
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
            AID: String(this.theLatestData?.AID),
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

    //症狀追蹤版本(題目越來越少)

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
      if (this.nowState === "first") {
        try {
          this.nowState = "score";
          this.currentStep = 1; // 初始化步驟
          this.preDisabled = true; // 禁用上一步按鈕
          this.nextDisabled = false; // 啟用下一步按鈕
        } catch (error) {
          console.error("Error fetching questions:", error);
          alert("獲取題目失敗，請稍後重試。");
        }
      } else if (this.nowState === "second") {
        try {
          this.nowState = "score";
          this.currentStep = 1; // 初始化步驟
          this.preDisabled = true; // 禁用上一步按鈕
          this.nextDisabled = false; // 啟用下一步按鈕
        } catch (error) {
          console.error("Error fetching questions:", error);
          alert("獲取題目失敗，請稍後重試。");
        }
      } else if (this.nowState === "score") {
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
          const itemsAboveZero = this.weeklyQA.filter((q) => q.selectScore > 0);
          if (itemsAboveZero.length < 3) {
            alert("選項項目不足，請至少選擇3題");
            return false;
          }

          // 初始化未設置的 times 為 -1
          this.weeklyQA.forEach((q) => {
            if (q.times === undefined) {
              q.times = -1; // 保持預設值為 -1
            }
          });

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
        location.reload();
        // this.nowState = "result";
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
