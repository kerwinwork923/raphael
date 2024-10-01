// stores/firstSleepRecord.js
import { defineStore } from "pinia";
import axios from "axios";
export const useFirstSleepRecordStore = defineStore("firstSleepRecord", {
  state: () => ({
    // 您的狀態屬性
    bedTime: null,
    layTimeToSleep: null,
    getupTime: null,
    sleepTime: null,
    sleepBreak: null,
    specialDiet: null,
    // peeTime: 0,
    medhelp: null,
    sleepProperty: "很滿意",
    emotionalState: "還不錯",
    physicalStrength: "還不錯",
    dayTimeSleepiness: "沒有嗜睡",
    workStress: "無",
    relationshipStress: "無",
    healthStress: "無",
    lifestyleChangeStress: "無",
    financialStress: "無",
    otherPressureEventt: "",
  }),

  getters: {
    sleepQualityOptions: () => [
      { label: "很滿意", value: 0 },
      { label: "有點不佳", value: 1 },
      { label: "中度不佳", value: 2 },
      { label: "嚴重不足", value: 3 },
      { label: "非常嚴重", value: 4 },
    ],
    dayEmotionOptions: () => [
      { label: "還不錯", value: 0 },
      { label: "有點下降", value: 1 },
      { label: "明顯欠佳", value: 2 },
      { label: "嚴重不足", value: 3 },
      { label: "非常嚴重", value: 4 },
    ],
    dayStateOptions: () => [
      { label: "還不錯", value: 0 },
      { label: "有點下降", value: 1 },
      { label: "明顯欠佳", value: 2 },
      { label: "嚴重不足", value: 3 },
      { label: "非常嚴重", value: 4 },
    ],
    daySleepOptions: () => [
      { label: "沒有嗜睡", value: 0 },
      { label: "少許嗜睡", value: 1 },
      { label: "輕度嗜睡", value: 2 },
      { label: "中度嗜睡", value: 3 },
      { label: "嚴重嗜睡", value: 4 },
    ],
    defaultOptions: () => [
      { label: "無", value: 0 },
      { label: "輕微", value: 1 },
      { label: "輕度", value: 2 },
      { label: "中度", value: 3 },
      { label: "嚴重", value: 4 },
    ],
  },

  actions: {
    updateScore(scoreBarValueName, newScore) {
      this[scoreBarValueName] = newScore;
      console.log("更新後的狀態:", this.$state);
    },
    async saveSleepRecord() {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile } = localData
        ? JSON.parse(localData)
        : {};

      const router = useRouter();

      try {
        if (!MID || !Token || !MAID || !Mobile) {
          router.push("/login");
          return;
        }

        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_SleepRecSave.jsp",
          {
            MID: String(MID),
            Token: String(Token),
            MAID: String(MAID),
            Mobile: String(Mobile),
            bedTime: String(this.bedTime),
            LayTimeToSleep: String(this.layTimeToSleep),
            getupTime: String(this.getupTime),
            SleepTime: String(this.sleepTime),
            SleepBreak: String(this.sleepBreak),
            SpecialDiet: String(this.specialDiet),
            MedHelp: String(this.medhelp),
            SleepProperty: String(this.sleepProperty),
            emotionalState: String(this.emotionalState),
            physicalStrength: String(this.physicalStrength),
            daytimeSleepiness: String(this.dayTimeSleepiness),
            OtherPressureEvent: String(this.otherPressureEventt),
            workStress: String(this.workStress),
            relationshipStress: String(this.relationshipStress),
            healthStress: String(this.healthStress),
            lifestyleChangeStress: String(this.lifestyleChangeStress),
            financialStress: String(this.financialStress),
          }
        );

        if (response.status === 200) {
          console.log("數據成功保存");
          // 在這裡可以重置狀態或進行其他處理
        } else {
          console.error("API 返回的狀態碼不是 200:", response.status);
        }
      } catch (err) {
        console.error("API 調用時發生錯誤:", err);
        // 顯示錯誤通知
      } finally {
        // 清理工作，如重置狀態或隱藏加載指示器
      }
    },
  },
});
