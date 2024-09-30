// stores/firstSleepRecord.js
import { defineStore } from "pinia";

export const useFirstSleepRecordStore = defineStore("firstSleepRecord", {
  state: () => ({
    // 您的狀態屬性
    bedTime: null,
    layTimeToSleep: null,
    getupTime: null,
    sleepTime: null,
    sleepBreak: 0,
    peeTimes: 0,
    medhelp: 0,
    sleepProperty: 0,
    emotionalState: 0,
    physicalStrength: 0,
    dayTimeSleepiness: 0,
    otherPressureEvent: "",
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
  },

  actions: {
    updateScore(scoreBarValueName, newScore) {
      this[scoreBarValueName] = newScore; 
 
    },
  },
});
