// /stores/point.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePoint = defineStore('point', () => {
  // 這邊示範將 "NowBonusState" 下的欄位都切開存
  // 也可以直接把整個 response.data.NowBonusState
  // 通通存進一個物件裡，依照你的需求調整即可

  const nowBonusState = ref(null)

  // 拆解的欄位（可以自由增減）
  const bonusPaperList = ref([])
  const taskList = ref([])
  const memberGradeName = ref('')
  const memberGrade = ref('')
  const nowAvaPoints = ref('')
  const upInfo = ref('')
  const keepGrade = ref('')

  // 專門用來塞資料的函式
  function setNowBonusState(data) {
    nowBonusState.value = data
    bonusPaperList.value = data?.BonusPaperList || []
    taskList.value = data?.TaskList || []
    memberGradeName.value = data?.MemberGradeName || ''
    memberGrade.value = data?.MemberGrade || ''
    nowAvaPoints.value = data?.NowAvaPoints || ''
    upInfo.value = data?.upInfo || ''
    keepGrade.value = data?.KeepGrade || ''
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
    setNowBonusState,
  }
})
