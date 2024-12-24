import axios from "axios";
import { useCommon } from "@/stores/common";

export const useWeeklyRecord = defineStore("weeklyQA2", {
  state: () => ({
    weeklyQA: [], // 问题列表
    currentStep: 1, // 当前页数
    totalStep: 0, // 问题分页总数
    timesStep: 1, // 次数页数
    totalTimesStep: 0, // 次数总页数
    questionsPerPage: 7, // 每页问题数量
    nowState: "", // score, times, choose, result
    preDisabled: true, // 是否禁用上一步按钮
    nextDisabled: false, // 是否禁用下一步按钮
    theLatestData: {}, // 最新的数据
    babyScrollProgress: 0, // 进度条百分比
    selectQuestionPerPage: 7,
    totalQuestions: 0,
    childResultData: {},
  }),

  getters: {
    // 排序後的問題（按分數降序）
    sortedByScore: (state) => {
      return [...state.weeklyQA]
        .filter((q) => q.selectScore > 0)
        .sort((a, b) => b.selectScore - a.selectScore);
    },

    // 當前頁的問題
    currentPageQuestions: (state) => {
      const startIndex = (state.currentStep - 1) * state.questionsPerPage;
      return state.weeklyQA.slice(
        startIndex,
        startIndex + state.questionsPerPage
      );
    },

    // 下一步按鈕文字
    nextText: (state) => {
      if (state.nowState === "score") {
        return state.currentStep >= state.totalStep
          ? "下一步"
          : `下一頁(${state.currentStep}/${state.totalStep})`;
      } else if (state.nowState === "times") {
        return state.timesStep >= state.totalTimesStep
          ? "下一步"
          : `下一頁(${state.timesStep}/${state.totalTimesStep})`;
      } else if (state.nowState === "choose") {
        return "看報告";
      }
    },

    // 上一步按鈕文字
    preText: (state) => {
      if (state.nowState === "score") {
        return state.currentStep > 1
          ? `上一頁(${state.currentStep}/${state.totalStep})`
          : "上一步";
      } else if (state.nowState === "times") {
        return state.timesStep > 1
          ? `上一頁(${state.timesStep}/${state.totalTimesStep})`
          : "上一步";
      } else if (state.nowState === "choose") {
        return "上一步";
      }
    },
  },

  actions: {
    // 獲取問題數據
    async getQues() {
      const common = useCommon();
      common.startLoading();

      try {
        const localData = JSON.parse(localStorage.getItem("userData") || "{}");
        const { MID, Token, MAID, Mobile } = localData;

        if (!MID || !Token || !MAID || !Mobile) {
          throw new Error("缺少用户凭据");
        }

        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_BB_GrowthRec2.jsp",
          { MID, Token, MAID, Mobile }
        );

        if (response.data?.ChildQues) {
          const { ChildQues } = response.data;

          // this.childInfo = {
          //   CID: ChildInfo[0].CID,
          //   Name: ChildInfo[0].Name || "未命名宝贝",
          //   AID: ChildInfo[0].AID || "",
          //   MaxQ: ChildInfo[0].MaxQ,
          //   BirthDay: ChildInfo[0].BirthDay,
          //   CheckTime: ChildInfo[0].CheckTime,
          //   Sex: ChildInfo[0].Sex,
          //   Status: ChildInfo[0].Status,
          //   ratioComplete: ChildInfo[0].ratioComplete,
          //   diffDaysFromToday: ChildInfo[0].diffDaysFromToday,
          // };

          this.totalQuestions = ChildQues.length;

          this.weeklyQA = ChildQues.map((q, index) => ({
            id: index,
            question: q.Question,
            selectScore: 0, // 初始化分数
            times: -1, // 初始化次数
            active: false, // 初始化为未选中
          }));

          this.totalStep = Math.ceil(
            this.weeklyQA.length / this.questionsPerPage
          );

          this.updateProgress();
        } else {
          throw new Error("ChildQues 或 ChildInfo 数据为空");
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        common.stopLoading();
      }
    },

    toggleActive(symptomId) {
      const symptom = this.weeklyQA.find((q) => q.id === symptomId);
      if (symptom) {
        symptom.active = !symptom.active; // 切换选中状态
      }
    },

    // 保存問題回答
    async saveChildAnswers() {
      const common = useCommon();
      common.startLoading();

      const localData = JSON.parse(localStorage.getItem("userData") || "{}");
      const { MID, Token, MAID, Mobile, ChildInfo } = localData;
      if (!MID || !Token || !MAID || !Mobile) {
        throw new Error(
          "Missing authentication data (MID, Token, MAID, or Mobile)"
        );
      }

      try {
        console.log("保存答案时 Total Questions:", this.totalQuestions);

        if (this.totalQuestions === 0) {
          console.error("总问题数为 0，无法保存答案");
          return;
        }

        const answers = this.weeklyQA.map((q) => ({
          QueSeq: String(q.id + 1),
          QueAns: String(q.selectScore),
        }));

        const payload = {
          MID,
          Token,
          MAID,
          Mobile,
          CID: String(ChildInfo[0].CID),
          MaxQ: String(this.totalQuestions), // 使用正确的总问题数
          ChildAns: answers,
        };

        console.log("保存答案的 Payload:", payload);

        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_BB_ChildAnsSave.jsp",
          payload
        );

        // 检查响应数据中的 AID
        if (response.data) {
          const AID = response.data.ChildInfo[0].AID;
          console.log("Received AID:", AID);
          this.theLatestData.AID = AID;
        } else {
          console.warn("AID 未在响应中返回");
        }
      } catch (error) {
        console.error("Error saving answers:", error);
      } finally {
        common.stopLoading();
      }
    },

    // 保存次數
    async saveChildTimes() {
      try {
        const localData = JSON.parse(localStorage.getItem("userData") || "{}");
        const { MID, Token, MAID, Mobile, ChildInfo } = localData;
        if (!MID || !Token || !MAID || !Mobile) {
          throw new Error(
            "Missing authentication data (MID, Token, MAID, or Mobile)"
          );
        }

        const timesPayload = this.weeklyQA.map((q) => ({
          QSeq: String(q.id + 1),
          QTimes: String(q.times || 0),
        }));
        await axios.post(
          "https://23700999.com:8081/HMA/API_BB_GrowthRecTimes.jsp",
          {
            MID,
            Token,
            MAID,
            Mobile,
            CID: ChildInfo[0].CID,
            AID: this.theLatestData.AID || "",
            TimesData: timesPayload,
          }
        );
      } catch (error) {
        console.error("Error saving times:", error);
      }
    },

    // 保存解決方案
    async saveChildSolutions() {
      try {
        const localData = JSON.parse(localStorage.getItem("userData") || "{}");
        const { MID, Token, MAID, Mobile, ChildInfo } = localData;

        if (!MID || !Token || !MAID || !Mobile) {
          throw new Error(
            "Missing authentication data (MID, Token, MAID, or Mobile)"
          );
        }

        const solutions = this.weeklyQA
          .filter((q) => q.active)
          .map((q) => ({
            QSeq: String(q.id + 1),
            QAns: "1",
          }));

        if (solutions.length === 0) {
          console.warn("No active solutions to save");
          return;
        }

        const payload = {
          MID,
          Token,
          MAID,
          Mobile,
          AID: this.theLatestData.AID || "", // 使用最新的 AID
          CID: ChildInfo[0].CID,
          SolveData: solutions,
        };

        console.log("Saving solutions payload:", payload);

        await axios.post(
          "https://23700999.com:8081/HMA/API_BB_GrowthSolve.jsp",
          payload
        );

        console.log("Solutions saved successfully");
      } catch (error) {
        console.error("Error saving solutions:", error);
      }
    },
    // 結果分析 API
    async fetchResultAnalysis(AID) {
      if (this.sortedByScore.length > 0) {
        return;
      }

      const common = useCommon();
      common.startLoading();

      try {
        const localData = JSON.parse(localStorage.getItem("userData") || "{}");
        const { MID, Token, MAID, Mobile, ChildInfo } = localData;

        // 确保所有必要数据存在
        if (!MID || !Token || !MAID || !Mobile) {
          throw new Error("Missing required data for result analysis");
        }

        const payload = {
          MID,
          Token,
          MAID,
          Mobile,
          CID: ChildInfo[0].CID, // 使用正确的属性名
          AID: AID,
        };

        console.log("Result Analysis Payload:", payload);

        // 调用 API
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_BB_GrowthFirst.jsp",
          payload
        );

        if (response.data) {
          console.log("Result Analysis Response:", response.data);

          // 检查 diffDaysFromToday 并根据结果更新状态或决定是否再次调用 API
          if (Number(response.data.ChildInfo[0].diffDaysFromToday) < 0) {
            this.getQues();
            this.nowState = "score";
          } else {
            this.nowState = "result";
            this.babyScrollProgress = 100;
            const newAID = response.data.ChildInfo[0]?.AID;
            if (newAID && newAID !== AID) {
              // 如果新 AID 不同，则重新调用分析 API
              await this.fetchResultAnalysis(newAID);
            } else {
              this.childResultData = response.data;
            }
          }

          // 处理结果分析数据，例如存储或更新到状态
          this.theLatestData.resultAnalysis = response.data;
        } else {
          console.warn("结果分析 API 返回数据为空");
        }
      } catch (error) {
        console.error("Error fetching result analysis:", error);
      } finally {
        common.stopLoading();
      }
    },

    // 保存所有數據
    async saveAllData() {
      const common = useCommon();
      common.startLoading();

      try {
        await this.saveChildAnswers();
        await this.saveChildTimes();
        await this.saveChildSolutions();
      } catch (error) {
        console.error("保存數據時發生錯誤：", error);
      } finally {
        common.stopLoading();
      }
    },

    // 下一步處理
    async handleNextStep() {
      if (this.nowState === "score") {
        if (this.currentStep < this.totalStep) {
          this.currentStep += 1;
        } else {
          if (this.sortedByScore.length < 3) {
            alert("请至少选择3题目！");
            return;
          }
          this.nowState = "times";
          this.totalTimesStep = Math.ceil(
            this.sortedByScore.length / this.selectQuestionPerPage
          );
          this.timesStep = 1;
        }
      } else if (this.nowState === "times") {
        if (this.timesStep < this.totalTimesStep) {
          this.timesStep += 1;
        } else {
          this.nowState = "choose";
        }
      } else if (this.nowState === "choose") {
        // 保存所有數據並調用 API 判定
        await this.saveAllData(); // 保存答案、次數和解決方案
        await this.resetStateAndFetchResult(); // 調用判定邏輯並進入結果
        return;
      }

      // 更新進度條
      this.updateProgress();
    },

    async resetStateAndFetchResult() {
      const common = useCommon();
      common.startLoading();

      try {
        // 獲取本地存儲數據
        const localData = JSON.parse(localStorage.getItem("userData") || "{}");
        const { MID, Token, MAID, Mobile, ChildInfo } = localData;

        if (!MID || !Token || !MAID || !Mobile || !ChildInfo) {
          throw new Error("Missing required user data");
        }

        // 組裝 API 請求參數
        const payload = {
          MID,
          Token,
          MAID,
          Mobile,
          CID: ChildInfo[0].CID,
          AID: this.theLatestData.AID || "",
        };

        console.log("Calling API with payload:", payload);

        // 發送 API 請求
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_BB_GrowthFirst.jsp",
          payload
        );

        // 處理 API 響應
        if (response.data?.ChildInfo) {
          const diffDaysFromToday = Number(
            response.data.ChildInfo[0].diffDaysFromToday
          );

          if (diffDaysFromToday < 0) {
            // 如果條件未滿足，重新獲取問題數據
            await this.getQues();
            this.nowState = "score";
          } else {
            // 更新狀態為結果顯示
            this.nowState = "result";
            this.childResultData = response.data;
            this.babyScrollProgress = 100; // 完成進度條
          }
        } else {
          throw new Error("API response missing required data");
        }
      } catch (error) {
        console.error("Error during result analysis:", error);
      } finally {
        common.stopLoading();
      }
    },
    handlePrevStep() {
      if (this.nowState === "times") {
        if (this.timesStep > 1) {
          this.timesStep -= 1;
        } else {
          this.nowState = "score";
          this.currentStep = this.totalStep;
        }
      } else if (this.nowState === "score") {
        if (this.currentStep > 1) {
          this.currentStep -= 1;
        }
      } else if (this.nowState === "choose") {
        this.nowState = "times";
        this.timesStep = this.totalTimesStep;
      }

      this.updateProgress();
    },

    updateButtonState() {
      this.preDisabled =
        (this.nowState === "score" && this.currentStep === 1) || // score 的第一页
        (this.nowState === "times" && this.timesStep === 1); // times 的第一页

      this.nextDisabled =
        (this.nowState === "score" && this.currentStep === this.totalStep) || // score 的最后一页
        (this.nowState === "times" && this.timesStep === this.totalTimesStep) || // times 的最后一页
        this.nowState === "choose"; // choose 状态禁用
    },

    // 更新進度條
    updateProgress() {
      const scoreWeight = 60;
      const timesWeight = 30;
      const chooseWeight = 10;
      const totalWeight = scoreWeight + timesWeight + chooseWeight;

      let progress = 0;

      if (this.nowState === "score") {
        // 当前在 score 阶段，根据 currentStep 计算进度
        progress =
          ((this.currentStep / this.totalStep) * scoreWeight) / totalWeight;
      } else if (this.nowState === "times") {
        // 当前在 times 阶段，尚未完成整个 times，所以仅计算 score 阶段的进度
        progress = scoreWeight / totalWeight;
      } else if (this.nowState === "choose") {
        // 当前在 choose 阶段，完整的 times 阶段已完成
        progress = (scoreWeight + timesWeight) / totalWeight;
      }

      this.babyScrollProgress = Math.round(progress * 100);
      console.log("Progress updated:", this.babyScrollProgress, this.nowState);
    },
  },
});
