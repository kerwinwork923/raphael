// /stores/point.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

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

  // 計算屬性：今日任務列表
  const todayMissionList = computed(() => {
    return taskList.value || [];
  });

  // 計算屬性：今日已獲得積分
  const todayCompletedPoints = computed(() => {
    if (!taskList.value) return 0;
    return taskList.value
      .filter(task => task.Info === "已經完成")
      .reduce((total, task) => total + (parseInt(task.Points) || 0), 0);
  });

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
    // 新增：今日任務相關的計算屬性
    todayMissionList,
    todayCompletedPoints,
    setNowBonusState
  };
});
