import { defineStore } from "pinia";
import axios from "axios";
import { useRouter } from "vue-router";

export const useSleepRecordStore = defineStore("sleepRecord", {
  state: () => ({
    sleepState: "",
    bedTime: null,
    layTimeToSleep: null,
    getupTime: null,
    leaveTime: null,
    sleepTime: null,
    sleepBreak: null,
    specialDiet: null,
    medhelp: null,
    SleepAgainTime: null,
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
    sleepRecData: null,
    sleepRecIndexData: null,
    SleepText: "",
    SleepRecCond: null,
    SleepRec: null,
  }),

  getters: {
    sleepQualityOptions: () => [
      { label: "睡得不好", value: 0 },
      { label: "睡眠一般", value: 1 },
      { label: "睡眠尚可", value: 2 },
      { label: "睡得很好", value: 3 },
    ],
    dayEmotionOptions: () => [
      { label: "情緒低落", value: 0 },
      { label: "情緒不穩", value: 1 },
      { label: "情緒正常", value: 2 },
      { label: "情緒愉快", value: 3 },
    ],
    dayStateOptions: () => [
      { label: "嚴重不足", value: 0 },
      { label: "明顯欠佳", value: 1 },
      { label: "有點下降", value: 2 },
      { label: "還不錯", value: 3 },
    ],
    daySleepOptions: () => [
      { label: "嚴重嗜睡", value: 0 },
      { label: "中度嗜睡", value: 1 },
      { label: "輕度嗜睡", value: 2 },
      { label: "沒有嗜睡", value: 3 },
    ],
    workStressOptions: () => [
      { label: "嚴重影響", value: 0 },
      { label: "中度影響", value: 1 },
      { label: "輕微影響", value: 2 },
      { label: "沒有影響", value: 3 },
    ],
    relationshipStressOptions: () => [
      { label: "非常不順利", value: 0 },
      { label: "有些困難", value: 1 },
      { label: "稍微順利", value: 2 },
      { label: "非常順利", value: 3 },
    ],
    healthStressOptions: () => [
      { label: "嚴重影響", value: 0 },
      { label: "中度影響", value: 1 },
      { label: "輕微影響", value: 2 },
      { label: "沒有影響", value: 3 },
    ],
    lifestyleChangeStressOptions: () => [
      { label: "嚴重影響", value: 0 },
      { label: "中度影響", value: 1 },
      { label: "輕微影響", value: 2 },
      { label: "未調整生活習慣", value: 3 },
    ],
    financialStressOptions: () => [
      { label: "嚴重壓力", value: 0 },
      { label: "中度壓力", value: 1 },
      { label: "輕微壓力", value: 2 },
      { label: "沒有壓力", value: 3 },
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
          router.push("/");
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
            leaveTime: String(this.leaveTime),
            SleepTime: String(this.sleepTime),
            SleepBreak: String(this.sleepBreak),
            SpecialDiet: String(this.specialDiet),
            SleepAgainTime: String(this.SleepAgainTime),
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
      }
    },

    async getSleepRecData() {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile } = localData
        ? JSON.parse(localData)
        : {};

      const router = useRouter();

      if (!MID || !Token || !MAID || !Mobile) {
        router.push("/");
        return;
      }

      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_SleepRecDetail.jsp",
          {
            MID: String(MID),
            Token: String(Token),
            MAID: String(MAID),
            Mobile: String(Mobile),
          }
        );
        // alert("Asd")
        if (response.status === 200) {
          console.log(response.data);
          this.SleepRec = response.data.SleepRec;
          // response.data?.SleepRec?.reverse();
          // this.sleepRecData = response.data;
          // console.log(response.data);

          // this.SleepRecCond = this.sleepRecIndexData.SleepRecCond;
          // if (this.sleepRecData.SleepRec.length >= 2) {
          //   this.SleepText = `
          //     感謝您使用我們的系統恭喜您已完成了兩次測驗 !
          //   `;
          // } else {
          //   this.SleepText = `
          //     感謝您使用我們的系統請等待<span>${this.SleepRecCond}天</span>後再進行第二次檢測
          //   `;
          // }

          // if (
          //   this.sleepRecData?.SleepRec?.length < 2 &&
          //   this.SleepRecCond === "-1"
          // ) {
          //   this.sleepState = "sleepRecord";
          // } else if (
          //   this.sleepRecData?.SleepRec?.length < 1 &&
          //   this.SleepRecCond === "-1"
          // ) {
          //   this.sleepState = "sleepRecord";
          // } else {
          //   this.sleepState = "sleepResult";
          // }
        }
      } catch (err) {
        console.log(err);
      }
    },

    async getIndexSleepRecData() {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile } = localData
        ? JSON.parse(localData)
        : {};

      const router = useRouter();

      if (!MID || !Token || !MAID || !Mobile) {
        router.push("/");
        return;
      }

      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_SleepRec.jsp",
          {
            MID: String(MID),
            Token: String(Token),
            MAID: String(MAID),
            Mobile: String(Mobile),
          }
        );

        if (response.status === 200) {
          // this.sleepRecIndexData = response.data;
          console.log(response.data);
          this.SleepRec = response.data.SleepRec;
          this.SleepRecCond = response.data.SleepRecCond;
          if (Number(response.data.SleepRecCond) <= -1) {
            this.sleepState = "sleepRecord";
          } else {
            this.sleepState = "sleepResult";
          }
          // this.sleepState = "sleepRecord";
        }
      } catch (err) {
        console.log(err);
      }
    },
  },
});
