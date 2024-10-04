import { defineStore } from "pinia";
import axios from "axios";
import { useRouter } from "vue-router";

export const useWeeklyRecord = defineStore("weeklyQA", {
  state: () => ({
    weeklyQA: null,
    defaultOptions: [
      { label: "無", value: 0 },
      { label: "輕微", value: 1 },
      { label: "輕度", value: 2 },
      { label: "中度", value: 3 },
      { label: "嚴重", value: 4 },
    ],
  }),
  actions: {
    async getQues() {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile } = localData
        ? JSON.parse(localData)
        : {};

      const router = useRouter();

      if (!MID || !Token || !MAID || !Mobile) {
        router.push("/login");
        return;
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

          const labels = [
            { label: "無", value: 0 },
            { label: "輕微", value: 1 },
            { label: "輕度", value: 2 },
            { label: "中度", value: 3 },
            { label: "嚴重", value: 4 },
          ];

          const combinedData = QuesArray.map((question, index) => {
            const score = 0;
            const label = labels[score].label;

            return {
              question,
              category: QesCategoryNameArray[QesCategoryArray[index]] || "", // 根據類別索引獲取類別名稱
              categoryIndex: QesCategoryArray[index],
              score,
              label,
            };
          });

          this.weeklyQA = combinedData;
        }
      } catch (err) {
        console.error("Error while fetching questions:", err);
      }
    },
  },
});
