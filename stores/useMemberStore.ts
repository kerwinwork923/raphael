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
  const videoRecords = ref<any[]>([])
  const appRecords = ref<any[]>([])
  const hasFetched = ref(false)

  // 方法
  async function fetchAll(auth: any) {
    try {
      const { token, admin, sel } = auth
      if (!token || !admin || !sel.MID) return

      // 只使用 API_MemberDetail.jsp
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

      // 取得自律神經和生活檢測資料
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

      const [ansRes, lifeRes] = await Promise.all([
        post("API_MemberANS.jsp"),
        post("API_MemberSleepRec.jsp"),
      ])

      // 設定資料
      ansRecords.value = ansRes?.MemberANS?.ANSList ?? []
      lifeRecords.value = lifeRes?.MemberSleepRec?.SleepRecList ?? []

      // 清空其他資料
      homeOrders.value = []
      hrvRecords.value = []
      childANS.value = []
      videoRecords.value = []
      appRecords.value = []

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
    videoRecords.value = []
    appRecords.value = []
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
    videoRecords,
    appRecords,
    hasFetched,
    // 方法
    fetchAll,
    clear,
  }
}) 