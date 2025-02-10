// /stores/point.js
import { defineStore } from "pinia";
import { ref } from "vue";

export const usePoint = defineStore("point", () => {
  const nowBonusState = ref(null);

  const bonusPaperList = ref([]);
  const taskList = ref([]);
  const memberGradeName = ref("");
  const memberGrade = ref("");
  const nowAvaPoints = ref("");
  const upInfo = ref("");
  const keepGrade = ref("");

  // 新增：存 Privillage 資訊
  const privillage = ref("");

  function setNowBonusState(data) {
    nowBonusState.value = data;
    bonusPaperList.value = data?.BonusPaperList || [];
    taskList.value = data?.TaskList || [];
    memberGradeName.value = data?.MemberGradeName || "";
    memberGrade.value = data?.MemberGrade || "";
    nowAvaPoints.value = data?.NowAvaPoints || "";
    upInfo.value = data?.upInfo || "";
    keepGrade.value = data?.KeepGrade || "";

    // 關鍵：將 API 回傳的 Privillage 存進 store
    // 大小寫要注意：API 回傳是 data.Privillage
    privillage.value = data?.Privillage || "";
  }

  return {
    nowBonusState,
    bonusPaperList,
    taskList,
    memberGrade,
    memberGradeName,
    nowAvaPoints,
    upInfo,
    keepGrade,

    // 新增：把 privillage 也 return 出去
    privillage,

    setNowBonusState
  };
});
