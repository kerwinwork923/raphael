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
  const healthLogRecords = ref<any[]>([])
  const weeklySummaryRecords = ref<any[]>([])
  const favoriteTPointsList = ref<any[]>([])
  const favoriteUseRecordList = ref<any[]>([])
  const optDetailList = ref<any[]>([])
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
      healthLogRecords.value = []
      weeklySummaryRecords.value = []
      favoriteTPointsList.value = []
      favoriteUseRecordList.value = []
      optDetailList.value = []

      lastUpdated.value = new Date().toLocaleString("zh-TW")
      hasFetched.value = true
    } catch (error) {
      console.error('取得會員資料失敗：', error)
    }
  }

  async function fetchHealthLog(auth: any, year: string, month: string, append = false) {
    try {
      const { token, admin, sel } = auth
      if (!token || !admin || !sel.MID) return

      const res = await fetch("https://23700999.com:8081/HMA/api/fr/getSoundNote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Token: token,
          MID: sel.MID,
          Mobile: sel.Mobile ?? "",
          MAID: admin,
          Lang: "zhtw",
          Year: year,
          Month: month,
        }),
      })

      const data = await res.json()
      if (data.Result === "OK") {
        // 轉換 API 資料格式為前端需要的格式
        const newRecords = (data.SoundNoteList || []).map((item: any) => ({
          id: item.AID,
          VerbalContent: item.PreSoundNote || "",
          VerbalDate: item.CheckTime ? item.CheckTime.split(" ")[0] : "",
          CheckTime: item.CheckTime,
          Note: item.Note,
          AID: item.AID,
        }))
        
        if (append) {
          // 合併資料，避免重複（根據 AID）
          const existingIds = new Set(healthLogRecords.value.map((r: any) => r.AID))
          const uniqueNewRecords = newRecords.filter((r: any) => !existingIds.has(r.AID))
          healthLogRecords.value = [...healthLogRecords.value, ...uniqueNewRecords]
        } else {
          healthLogRecords.value = newRecords
        }
      } else {
        if (!append) {
          healthLogRecords.value = []
        }
      }
    } catch (error) {
      console.error('取得健康日誌失敗：', error)
      if (!append) {
        healthLogRecords.value = []
      }
    }
  }

  async function fetchWeeklySummary(auth: any) {
    try {
      const { token, admin } = auth
      if (!token || !admin) return

      const res = await fetch("https://23700999.com:8081/HMA/api/bk/CaseWeeklySummarySingleWeekList", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          AdminID: admin,
          Token: token,
        }),
      })

      const data = await res.json()
      if (data.Result === "OK") {
        // API 回傳 CaseWeeklySummarySingleWeekList
        const list = data.CaseWeeklySummarySingleWeekList || data.CaseWeeklySummaryList || []
        weeklySummaryRecords.value = list.map((item: any, index: number) => {
          // 統一 DateRange 格式，避免多餘 / 或區間符號不一致
          let dateRange = (item.DatePeriod || "").trim()
          // 合併多餘斜線（修正 API 回傳如 2026//0/1/ 的錯誤）
          dateRange = dateRange.replace(/\/+/g, "/")
          // 統一區間分隔為 " - "（支援 "2026/01/26-2026/02/01" 或 "~"）
          if (dateRange.includes("~")) dateRange = dateRange.replace(/~/g, " - ")
          if (dateRange.includes("-") && !dateRange.includes(" - ")) {
            const parts = dateRange.split("-")
            if (parts.length === 2) dateRange = parts.map((p: string) => p.trim()).join(" - ")
          }
          return {
            id: item.AID || index + 1,
            SummaryContent: item.AISummary || "",
            MetaSummary: item.MetaSummary || "",
            AggregateQuantity: item.CNT || "0",
            StartDate: item.StartDate || "",
            DateRange: dateRange,
            MID: item.MID || "",
            AID: item.AID || "",
          }
        })
      } else {
        weeklySummaryRecords.value = []
      }
    } catch (error) {
      console.error('取得本周摘要失敗：', error)
      weeklySummaryRecords.value = []
    }
  }

  async function fetchFavoriteTPointsList(auth: any) {
    // 產品使用紀錄：改用 UseRecordMIDList API 做來源
    try {
      const { token, admin, sel } = auth
      if (!token || !admin || !sel.MID) return

      const res = await fetch("https://23700999.com:8081/HMA/api/bk/UseRecordMIDList", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          AdminID: admin,
          Token: token,
          MID: sel.MID,
          StartDate: "",
          EndDate: "",
        }),
      })

      const data = await res.json()
      if (data.Result === "OK") {
        const list = data.UseRecordMIDList || []
        favoriteTPointsList.value = list.map((item: any, index: number) => {
          // 從 StartTime 取出日期字串 YYYY/MM/DD
          let consultationDate = ""
          const startTime: string = item.StartTime || ""
          if (startTime.length >= 8) {
            const y = startTime.substring(0, 4)
            const m = startTime.substring(4, 6)
            const d = startTime.substring(6, 8)
            consultationDate = `${y}/${m}/${d}`
          }

          const duration = calculateDuration(item.StartTime, item.EndTime)

          return {
            id: item.UID || index + 1,
            AID: item.AID || "",
            ConsultationDate: consultationDate,
            FavoriteName: item.FavoriteName || "",
            // 新 API 沒有點位資訊，暫以產品名稱帶入或留空皆可
            TreatmentArea: item.ProductName || "",
            StartDate: consultationDate,
            StartTime: item.StartTime || "",
            EndTime: item.EndTime || "",
            PauseTime: "",
            TreatmentTime: duration,
            TotalTime: "",
            TMode: "",
            TemperatureDiff: "",
            TotalUsage: item.cntFavorite || "0",
            AccMinutes: "0",
          }
        })
      } else {
        favoriteTPointsList.value = []
      }
    } catch (error) {
      console.error("取得產品使用紀錄失敗：", error)
      favoriteTPointsList.value = []
    }
  }

  async function fetchFavoriteTPointsMIDUseRecordList(auth: any, aid: string, startDate?: string, endDate?: string) {
    try {
      const { token, admin, sel } = auth
      if (!token || !admin || !sel.MID || !aid) return

      const res = await fetch("https://23700999.com:8081/HMA/api/bk/FavoriteTPointsMIDUseRecordList", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          AdminID: admin,
          Token: token,
          MID: sel.MID,
          StartDate: startDate || "",
          EndDate: endDate || "",
        }),
      })

      const data = await res.json()
      if (data.Result === "OK") {
        // 根據 AID 篩選資料
        const targetRecord = (data.FavoriteTPointsMIDUseRecordList || []).find(
          (item: any) => item.AID === aid
        )
        
        if (targetRecord && targetRecord.UserRecordList) {
          favoriteUseRecordList.value = targetRecord.UserRecordList.map((item: any, index: number) => {
            const duration = calculateDuration(item.StartTime, item.EndTime);
            return {
              id: item.UID || item.AID + "_" + index,
              startDate: item.StartDD || "",
              startTime: item.StartTT || "",
              endDate: item.EndDD || "",
              endTime: item.EndTT || "",
              treatmentDuration: duration,
              pauseDuration: "00:00", // API 沒有提供暫停時間，暫時顯示 00:00
              totalDuration: duration,
              AID: item.AID || "",
              UID: item.UID || "",
            }
          })
        } else {
          favoriteUseRecordList.value = []
        }
      } else {
        favoriteUseRecordList.value = []
      }
    } catch (error) {
      console.error('取得使用紀錄列表失敗：', error)
      favoriteUseRecordList.value = []
    }
  }

  async function fetchOptDetailMIDList(auth: any, aid: string, startDate?: string, endDate?: string) {
    try {
      const { token, admin, sel } = auth
      if (!token || !admin || !sel.MID) return

      const res = await fetch("https://23700999.com:8081/HMA/api/bk/OptDetailMIDList", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          AdminID: admin,
          Token: token,
          MID: sel.MID,
          StartDate: startDate || "",
          EndDate: endDate || "",
        }),
      })

      const data = await res.json()
      if (data.Result === "OK") {
        // 根據 FAID (對應 AID) 篩選資料，並轉換事件類型
        // 包含 FAID === aid 的資料，也包含 FAID === "0" 的資料（可能是該會員的其他操作）
        optDetailList.value = (data.OptDetailMIDList || [])
          .filter((item: any) => item.FAID === aid || item.FAID === "0")
          .map((item: any, index: number) => {
            let eventDesc = "—"
            
            if (item.Event === "A") {
              eventDesc = getAEventDesc(item.Parameter, item.Desc)
            } else if (item.Event === "B") {
              eventDesc = getBEventDesc(item.Parameter, item.Desc)
            } else if (item.Event === "C") {
              eventDesc = getCEventDesc(item.Parameter, item.Desc)
            } else if (item.Event === "D") {
              eventDesc = getDEventDesc(item.Parameter, item.Desc)
            } else if (item.Event === "E") {
              eventDesc = getEEventDesc(item.Parameter, item.Desc)
            } else if (item.Event === "F") {
              eventDesc = getFEventDesc(item.Parameter, item.Desc)
            } else if (item.Event === "G") {
              eventDesc = getGEventDesc(item.Parameter, item.Desc)
            } else if (item.Event === "H") {
              eventDesc = getHEventDesc(item.Parameter, item.Desc)
            } else if (item.Event === "P") {
              // P 事件：套用我的最愛點位
              if (item.Parameter === "2") {
                eventDesc = "套用我的最愛點位"
              } else if (item.Parameter === "3") {
                eventDesc = item.Desc || "套用我的最愛點位"
              } else {
                eventDesc = item.Desc || "套用我的最愛點位"
              }
            } else {
              eventDesc = item.Desc || "—"
            }
            
            // 只顯示中文描述，不顯示代號
            return {
              id: item.AID || index + 1,
              date: item.DD || "",
              time: item.TT || "",
              event: eventDesc,
              AID: item.AID || "",
              FAID: item.FAID || "",
            }
          })
      } else {
        optDetailList.value = []
      }
    } catch (error) {
      console.error('取得操作紀錄失敗：', error)
      optDetailList.value = []
    }
  }

  // 輔助函數：計算時間差（從 StartTime 和 EndTime 計算）
  function calculateDuration(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return "—"
    try {
      // 時間格式：20260120100850 (YYYYMMDDHHmmss)
      const parseTime = (timeStr: string) => {
        if (timeStr.length === 14) {
          const year = timeStr.substring(0, 4)
          const month = timeStr.substring(4, 6)
          const day = timeStr.substring(6, 8)
          const hour = timeStr.substring(8, 10)
          const minute = timeStr.substring(10, 12)
          const second = timeStr.substring(12, 14)
          return new Date(`${year}-${month}-${day} ${hour}:${minute}:${second}`)
        }
        return null
      }
      
      const start = parseTime(startTime)
      const end = parseTime(endTime)
      
      if (!start || !end) return "—"
      
      const diffMs = end.getTime() - start.getTime()
      if (diffMs < 0) return "—"
      
      const totalMinutes = Math.floor(diffMs / 60000)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      
      if (hours > 0) {
        return `${hours}小時${minutes}分鐘`
      }
      return `${minutes}分鐘`
    } catch {
      return "—"
    }
  }

  // 輔助函數：轉換 A 事件描述（開關機）
  function getAEventDesc(parameter: string, desc: string): string {
    if (parameter === "1") return "開機"
    if (parameter === "2") return "關機"
    return desc || "—"
  }

  // 輔助函數：轉換 B 事件描述（治療）
  function getBEventDesc(parameter: string, desc: string): string {
    if (parameter === "1") return "治療開始"
    if (parameter === "2") return "治療暫停"
    if (parameter === "3") return "治療結束"
    if (parameter === "4") return "治療30分鐘"
    return desc || "—"
  }

  // 輔助函數：轉換 C 事件描述（電力）
  function getCEventDesc(parameter: string, desc: string): string {
    if (parameter === "1") return "充電開始"
    if (parameter === "2") return "充電完成"
    if (parameter === "3") return "充電結束"
    if (parameter === "4") return "充電過充"
    if (parameter === "5") return "低電警示"
    if (parameter === "6") return "電量不足"
    return desc || "—"
  }

  // 輔助函數：轉換 D 事件描述（接頭接觸不良）
  function getDEventDesc(parameter: string, desc: string): string {
    if (parameter === "1") return "A接頭接觸不良"
    if (parameter === "2") return "B接頭接觸不良"
    if (parameter === "3") return "C接頭接觸不良"
    if (parameter === "4") return "D接頭接觸不良"
    if (parameter === "5") return "A接頭接觸恢復"
    if (parameter === "6") return "B接頭接觸恢復"
    if (parameter === "7") return "C接頭接觸恢復"
    if (parameter === "8") return "D接頭接觸恢復"
    return desc || "—"
  }

  // 輔助函數：轉換 E 事件描述（合約到期）
  function getEEventDesc(parameter: string, desc: string): string {
    if (parameter === "1") return "超過結束日期"
    if (parameter === "2") return "治療次數不足"
    if (parameter === "3") return "今日已使用"
    return desc || "—"
  }

  // 輔助函數：轉換 F 事件描述（提示音）
  function getFEventDesc(parameter: string, desc: string): string {
    // F 事件通常是音檔名稱，優先使用 Desc，如果沒有則使用 Parameter
    return desc || parameter || "—"
  }

  // 輔助函數：轉換 G 事件描述（藍芽連線）
  function getGEventDesc(parameter: string, desc: string): string {
    if (parameter === "1") return "連線"
    return desc || "—"
  }

  // 輔助函數：轉換 H 事件描述（貼片故障）
  function getHEventDesc(parameter: string, desc: string): string {
    // H 事件：1~48=第1~48片貼片，但標註"無此功能"
    const paramNum = parseInt(parameter)
    if (paramNum >= 1 && paramNum <= 48) {
      return `第${paramNum}片貼片`
    }
    return desc || "—"
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
    healthLogRecords.value = []
    weeklySummaryRecords.value = []
    favoriteTPointsList.value = []
    favoriteUseRecordList.value = []
    optDetailList.value = []
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
    healthLogRecords,
    weeklySummaryRecords,
    favoriteTPointsList,
    favoriteUseRecordList,
    optDetailList,
    hasFetched,
    // 方法
    fetchAll,
    fetchHealthLog,
    fetchWeeklySummary,
    fetchFavoriteTPointsList,
    fetchFavoriteTPointsMIDUseRecordList,
    fetchOptDetailMIDList,
    clear,
  }
}) 