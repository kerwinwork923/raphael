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
              id: index,
              question,
              category: QesCategoryNameArray[QesCategoryArray[index]] || "", // 根據類別索引獲取類別名稱
              categoryIndex: QesCategoryArray[index],
              score,
              label: "未知",
            };
          });

          this.weeklyQA = combinedData;

          this.totalStep = Math.ceil(
            combinedData.length / this.questionsPerPage
          );
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

      // const ansMapObj = Object.fromEntries(AnsMap);

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
        }
      } catch (err) {
        console.error("Error while fetching questions:", err);
        throw err;
      }
    },

    handleNextStep() {
      const startIdx = (this.currentStep - 1) * this.questionsPerPage;
      const endIdx = Math.min(
        startIdx + this.questionsPerPage,
        this.weeklyQA.length
      );

      const allAnswered = this.weeklyQA
        .slice(startIdx, endIdx)
        .every((q) => q.score > 0);

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
