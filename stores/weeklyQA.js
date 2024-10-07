import { defineStore } from "pinia";
import axios from "axios";

export const useWeeklyRecord = defineStore("weeklyQA", {
  state: () => ({
    weeklyQA: [],
    currentStep: 1,
    totalStep: 0, // 初始化為0
    questionsPerPage: 7, // 每頁問題數量
  }),

  actions: {
    async getQues() {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile } = localData
        ? JSON.parse(localData)
        : {};

      // 不再使用 router

      if (!MID || !Token || !MAID || !Mobile) {
        // 由组件处理导航
        throw new Error("Missing credentials"); // 抛出错误，由组件捕获并处理导航
      }

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

          const combinedData = QuesArray.map((question, index) => {
            const score = 0;

            return {
              id: index, // 添加唯一标识符
              question,
              category: QesCategoryNameArray[QesCategoryArray[index]] || "", // 根據類別索引獲取類別名稱
              categoryIndex: QesCategoryArray[index],
              score,
              label: "未知",
            };
          });

          this.weeklyQA = combinedData;

          // 根據獲取的問題數量更新 totalStep
          this.totalStep = Math.ceil(
            combinedData.length / this.questionsPerPage
          ); // 更新 totalStep 為頁數
        }
      } catch (err) {
        console.error("Error while fetching questions:", err);
        throw err; // 抛出错误，由组件处理
      }
    },
    handleNextStep() {
      // 計算當前頁面問題的起始和結束索引
      const startIdx = (this.currentStep - 1) * this.questionsPerPage;
      const endIdx = Math.min(
        startIdx + this.questionsPerPage,
        this.weeklyQA.length
      );

      // 檢查當前頁面的問題是否都已填寫
      const allAnswered = this.weeklyQA
        .slice(startIdx, endIdx)
        .every((q) => q.score > 0); // 假設 score 為 0 表示未填寫

      if (!allAnswered) {
        alert("尚未填寫完成");
      } else if (this.currentStep < this.totalStep) {
        this.currentStep += 1;
      } else {
        alert("已經到達最後一步");
      }
    },
    handlePrevStep() {
      if (this.currentStep > 1) {
        this.currentStep -= 1;
      }
    },
  },
});
