import { ref, computed } from 'vue'

export const useUsageRecords = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const usageRecords = ref<any[]>([])
  const filteredRecords = ref<any[]>([])

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear().toString()
  const currentMonth = (currentDate.getMonth() + 1) + '月'

  const selectedProduct = ref('全部產品')
  const selectedYear = ref(currentYear)
  const selectedMonth = ref(currentMonth)

  const productOptions = ref([
    '全部產品',
    '全效調節衣',
    '居家治療儀',
    '雙效紅光活力衣',
    '護您穩深眠衣'
  ])

  const generateYearOptions = () => {
    const y = new Date().getFullYear()
    const years: string[] = []
    for (let year = 2024; year <= y; year++) years.push(year.toString())
    return years
  }
  const yearOptions = ref(generateYearOptions())

  const monthOptions = ref([
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ])

  // ===== helpers =====
  const parseTS = (ts: string) => {
    const y = parseInt(ts.substring(0, 4))
    const M = parseInt(ts.substring(4, 6)) - 1
    const d = parseInt(ts.substring(6, 8))
    const h = parseInt(ts.substring(8, 10))
    const m = parseInt(ts.substring(10, 12))
    const s = parseInt(ts.substring(12, 14))
    return new Date(y, M, d, h, m, s)
  }

  const isSameYYYYMMDD = (ts: string, d: Date) => {
    const ymd = ts.substring(0, 8)
    const y = d.getFullYear().toString()
    const m = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    return ymd === `${y}${m}${day}`
  }

  const isClothing = (item: any) => {
    return item.Type === '1' || /衣/.test(item.ProductName || '')
  }

  const mergeIntervals = (intervals: Array<[Date, Date]>) => {
    if (intervals.length === 0) return []
    intervals.sort((a, b) => a[0].getTime() - b[0].getTime())
    const merged: Array<[Date, Date]> = []
    let [curStart, curEnd] = intervals[0]
    for (let i = 1; i < intervals.length; i++) {
      const [s, e] = intervals[i]
      if (s.getTime() <= curEnd.getTime()) {
        if (e.getTime() > curEnd.getTime()) curEnd = e
      } else {
        merged.push([curStart, curEnd])
        curStart = s
        curEnd = e
      }
    }
    merged.push([curStart, curEnd])
    return merged
  }

  // 格式化時間
  const formatTime = (timeString: string) => {
    if (!timeString) return ''
    const month = timeString.substring(4, 6)
    const day = timeString.substring(6, 8)
    const hour = timeString.substring(8, 10)
    const minute = timeString.substring(10, 12)
    return `${parseInt(month)}/${parseInt(day)} ${hour}:${minute}`
  }

  // 向上取整的使用時長
  const calculateDuration = (startTime: string, endTime: string) => {
    if (!startTime) return '0分鐘'
    const start = parseTS(startTime)
    const end = endTime ? parseTS(endTime) : new Date()
    let diffMs = end.getTime() - start.getTime()
    if (diffMs < 0) diffMs = 0
    const diffMinutes = Math.max(1, Math.ceil(diffMs / (1000 * 60)))
    if (diffMinutes < 60) return `${diffMinutes}分鐘`
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    return `${hours}小時${minutes}分鐘`
  }

  const transformApiData = (apiData: any[]) => {
    return apiData.map((item, index) => {
      const formattedTime = formatTime(item.StartTime)
      return {
        id: index + 1,
        date: formattedTime.split(' ')[0],
        productName: item.ProductName,
        startTime: formattedTime.split(' ')[1] || '',
        duration: calculateDuration(item.StartTime, item.EndTime),
        originalData: item
      }
    })
  }

  const applyFilters = () => {
    let filtered = [...usageRecords.value]
    if (selectedProduct.value !== '全部產品') {
      filtered = filtered.filter(r => r.productName === selectedProduct.value)
    }
    if (selectedYear.value && selectedYear.value !== '全部年份') {
      filtered = filtered.filter(r =>
        r.originalData.StartTime.substring(0, 4) === selectedYear.value
      )
    }
    if (selectedMonth.value && selectedMonth.value !== '全部月份') {
      const monthNumber = monthOptions.value.indexOf(selectedMonth.value) + 1
      const monthStr = monthNumber.toString().padStart(2, '0')
      filtered = filtered.filter(r =>
        r.originalData.StartTime.substring(4, 6) === monthStr
      )
    }
    filteredRecords.value = filtered
  }

  const fetchUsageRecords = async (userDataOverride?: any) => {
    loading.value = true
    error.value = null
    try {
      const userDataLocal = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('userData') || '{}')
        : {}
      const ud = userDataOverride || userDataLocal || {}
      const requestData = {
        MAID: ud.MAID || "NM6hKjgX93qaSap1ttRQWSft5tNzTDVl",
        MID: ud.MID || "610",
        Mobile: ud.Mobile || "0966789825",
        ProductName: "",
        Token: ud.Token || "YTYsc23rC1IrXQpaXyfNktICnKgKfGqP"
      }

      const response = await fetch('https://23700999.com:8081/HMA/API_UIDInfo_Search11A.jsp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const result = await response.json()

      if (result.Result === 'OK' && result.Data) {
        usageRecords.value = transformApiData(result.Data)
        filteredRecords.value = [...usageRecords.value]
        applyFilters()
      } else {
        throw new Error('API 返回錯誤: ' + (result.Result || '未知錯誤'))
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // ✅ 修正版：今日穿衣時間（合併區間、只算衣、限制當天）
  const todayWearTime = computed(() => {
    const now = new Date()
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    const todayClothItems = usageRecords.value
      .map(r => r.originalData)
      .filter(item => isClothing(item) && isSameYYYYMMDD(item.StartTime, now))

    if (todayClothItems.length === 0) return '0分鐘'

    const intervals: Array<[Date, Date]> = []
    for (const item of todayClothItems) {
      const s = parseTS(item.StartTime)
      const rawEnd = item.EndTime ? parseTS(item.EndTime) : now
      const e = new Date(Math.min(rawEnd.getTime(), dayEnd.getTime()))
      if (!s || !e || e.getTime() <= s.getTime()) continue
      const startClamped = new Date(Math.max(s.getTime(), dayStart.getTime()))
      const endClamped = new Date(Math.min(e.getTime(), dayEnd.getTime()))
      if (endClamped.getTime() <= startClamped.getTime()) continue
      intervals.push([startClamped, endClamped])
    }

    if (intervals.length === 0) return '0分鐘'

    const merged = mergeIntervals(intervals)
    let totalMinutes = 0
    for (const [s, e] of merged) {
      const minutes = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60))
      totalMinutes += Math.max(1, minutes)
    }

    if (totalMinutes < 60) return `${totalMinutes}分鐘`
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}小時${minutes}分鐘`
  })

  const continuousDays = computed(() => {
    if (usageRecords.value.length === 0) return 0

    const dailyRecords = new Map<string, any[]>()
    usageRecords.value.forEach(record => {
      const dateStr = record.originalData.StartTime.substring(0, 8)
      if (!dailyRecords.has(dateStr)) dailyRecords.set(dateStr, [])
      dailyRecords.get(dateStr)!.push(record)
    })

    const sortedDates = Array.from(dailyRecords.keys()).sort((a, b) => b.localeCompare(a))
    if (sortedDates.length === 0) return 0

    let continuousCount = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < sortedDates.length; i++) {
      const recordDate = new Date(
        parseInt(sortedDates[i].substring(0, 4)),
        parseInt(sortedDates[i].substring(4, 6)) - 1,
        parseInt(sortedDates[i].substring(6, 8))
      )
      recordDate.setHours(0, 0, 0, 0)

      if (i === 0) {
        const diffDays = Math.ceil(Math.abs(today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays <= 1) continuousCount = 1
        else break
      } else {
        const prevDateStr = sortedDates[i - 1]
        const prevDate = new Date(
          parseInt(prevDateStr.substring(0, 4)),
          parseInt(prevDateStr.substring(4, 6)) - 1,
          parseInt(prevDateStr.substring(6, 8))
        )
        prevDate.setHours(0, 0, 0, 0)
        const dayDiff = Math.ceil(Math.abs(recordDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
        if (dayDiff === 1) continuousCount++
        else break
      }
    }
    return continuousCount
  })

  const totalRecords = computed(() => filteredRecords.value.length)

  return {
    loading,
    error,
    usageRecords,
    filteredRecords,
    selectedProduct,
    selectedYear,
    selectedMonth,
    productOptions,
    yearOptions,
    monthOptions,
    totalRecords,
    todayWearTime,
    continuousDays,
    fetchUsageRecords,
    applyFilters
  }
}
