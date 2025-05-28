import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMemberStore = defineStore('member', () => {
  // 狀態
  const member = ref<any>(null)
  const currentOrder = ref<any>(null)
  const lastUpdated = ref('')
  const hrvRecords = ref<any[]>([])
  const ansRecords = ref<any[]>([])
  const lifeRecords = ref<any[]>([])
  const childANS = ref<any[]>([])
  const homeOrders = ref<any[]>([])
  const hasFetched = ref(false)

  // 方法
  async function fetchAll(auth: any) {
    try {
      const { token, admin, sel } = auth
      if (!token || !admin || !sel.MID) return

      // 取得基本資料
      const basicRes = await fetch("https://23700999.com:8081/HMA/API_MemberDetail.jsp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          AdminID: admin,
          Token: token,
          MID: sel.MID,
          Mobile: sel.Mobile ?? "",
        }),
      })
      const basicData = await basicRes.json()
      if (basicData.Result === "OK") {
        member.value = basicData.MemberDetail.Member
        currentOrder.value = basicData.MemberDetail.NowOrderList?.[0] ?? null
      }

      // 取得其他資料
      const empty = { StartDate: "", EndDate: "" }
      const post = (url: string, extra = empty) =>
        fetch(`https://23700999.com:8081/HMA/${url}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            AdminID: admin,
            Token: token,
            MID: sel.MID,
            Mobile: sel.Mobile ?? "",
            ...extra,
          }),
        }).then((r) => r.json())

      const [useRes, hrvRes, ansRes, lifeRes, babyRes] = await Promise.all([
        post("API_MemberUseRecord.jsp"),
        post("API_MemberHRV2.jsp"),
        post("API_MemberANS.jsp"),
        post("API_MemberSleepRec.jsp"),
        post("API_MemberChildANS.jsp", { CID: "" }),
      ])

      // 加入 console.log 來檢查 API 回應
      console.log('使用紀錄 API 回應:', useRes)

      homeOrders.value = useRes?.MemberUseRecode?.UseRecodeList ?? []
      hrvRecords.value = hrvRes?.MemberHRV2?.HRV2List ?? []
      ansRecords.value = ansRes?.MemberANS?.ANSList ?? []
      lifeRecords.value = lifeRes?.MemberSleepRec?.SleepRecList ?? []
      childANS.value = babyRes?.MemberChildANS?.ChildScore ?? []

      lastUpdated.value = new Date().toLocaleString("zh-TW")
      hasFetched.value = true
    } catch (error) {
      console.error('取得會員資料失敗：', error)
    }
  }

  function clear() {
    member.value = null
    currentOrder.value = null
    lastUpdated.value = ''
    hrvRecords.value = []
    ansRecords.value = []
    lifeRecords.value = []
    childANS.value = []
    homeOrders.value = []
    hasFetched.value = false
  }

  return {
    // 狀態
    member,
    currentOrder,
    lastUpdated,
    hrvRecords,
    ansRecords,
    lifeRecords,
    childANS,
    homeOrders,
    hasFetched,
    // 方法
    fetchAll,
    clear,
  }
}) 