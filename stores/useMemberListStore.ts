import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface MemberRaw {
  MID: string
  Name: string
  Birthday: string
  Mobile: string
  GradeName: string
  HRV: string
  DSPR: string
  memType: string
  TDate: string
  score: string
  totalScore: string
  Score?: string
  TotalScore?: string
  HomeOrder: { ProductName: string; Used: string; Still: string }[]
}

interface Member {
  id: string
  name: string
  birthday: string
  phone: string
  level: string
  product: string
  usageDays: number
  remainingDays: number
  hrv: string
  ans: string
  isAbnormal: boolean
  registerDate: string
  memType: string
  score: number | null
  totalScore: number | null
}

export const useMemberListStore = defineStore('memberList', () => {
  // 狀態
  const members = ref<Member[]>([])
  const lastUpdated = ref('')
  const hasFetched = ref(false)
  const keyword = ref('')
  const dateRange = ref<Date[] | null>(null)
  const productFilter = ref('')
  const statusFilter = ref('')
  const page = ref(1)
  const pageSize = 10

  // 計算屬性
  const filteredMembers = computed(() => {
    return members.value.filter((m) => {
      /* 關鍵字 */
      const kw = keyword.value.trim()
      const hit = !kw || [m.name, m.phone, m.birthday].some((v) => v.includes(kw))

      /* 產品 / 狀態 */
      const prodOk = !productFilter.value || m.product === productFilter.value
      const statusOk = !statusFilter.value || m.memType === statusFilter.value

      /* 日期 */
      let dateOk = true
      if (Array.isArray(dateRange.value) && dateRange.value[0] && dateRange.value[1]) {
        const [start, end] = dateRange.value
        const regDate = new Date(m.registerDate.replace(/-/g, "/"))
        dateOk = regDate >= start && regDate <= end
      }

      return hit && prodOk && statusOk && dateOk
    })
  })

  const total = computed(() => filteredMembers.value.length)
  const totalPages = computed(() => Math.ceil(total.value / pageSize))
  const paginatedMembers = computed(() => {
    const start = (page.value - 1) * pageSize
    return filteredMembers.value.slice(start, start + pageSize)
  })

  // 方法
  async function fetchMembers() {
    if (hasFetched.value) return

    try {
      const token = localStorage.getItem("backendToken") || sessionStorage.getItem("backendToken")
      const adminID = localStorage.getItem("adminID") || sessionStorage.getItem("adminID")
      if (!token || !adminID) throw new Error("缺少 token 或 adminID")

      const body = {
        AdminID: adminID,
        Token: token,
        Keyword: keyword.value,
        StartDate: "",
        EndDate: "",
        ProductName: productFilter.value,
        memType: statusFilter.value,
      }

      const res = await fetch("https://23700999.com:8081/HMA/API_Home.jsp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(res.statusText)
      const { MemberList }: { MemberList: MemberRaw[] } = await res.json()

      members.value = MemberList.map((r) => {
        const order = r.HomeOrder?.[0] ?? {}
        const fmt = r.TDate.includes("/")
          ? r.TDate
          : `${r.TDate.slice(0, 4)}/${r.TDate.slice(4, 6)}/${r.TDate.slice(6, 8)}`
        return {
          id: r.MID,
          name: r.Name,
          birthday: r.Birthday,
          phone: r.Mobile,
          level: r.GradeName,
          product: order.ProductName ?? "",
          usageDays: Number(order.Used ?? 0),
          remainingDays: Number(order.Still ?? 0),
          hrv: r.HRV,
          ans: r.DSPR,
          isAbnormal: Number(r.HRV) < 40,
          registerDate: fmt,
          memType: r.memType,
          score: r.Score ? Number(r.Score) : null,
          totalScore: r.TotalScore ? Number(r.TotalScore) : null,
        }
      })

      lastUpdated.value = new Date().toLocaleString("zh-TW")
      hasFetched.value = true
    } catch (e) {
      console.error("讀取 MemberList 失敗：", e)
    }
  }

  function clear() {
    members.value = []
    lastUpdated.value = ''
    hasFetched.value = false
    page.value = 1
  }

  function setKeyword(kw: string) {
    keyword.value = kw
    page.value = 1
  }

  function setDateRange(range: Date[] | null) {
    dateRange.value = range
    page.value = 1
  }

  function setProductFilter(filter: string) {
    productFilter.value = filter
    page.value = 1
  }

  function setStatusFilter(filter: string) {
    statusFilter.value = filter
    page.value = 1
  }

  function gotoPage(p: number) {
    page.value = p
  }

  function prevPage() {
    if (page.value > 1) page.value--
  }

  function nextPage() {
    if (page.value < totalPages.value) page.value++
  }

  return {
    // 狀態
    members,
    lastUpdated,
    hasFetched,
    keyword,
    dateRange,
    productFilter,
    statusFilter,
    page,
    pageSize,
    // 計算屬性
    filteredMembers,
    total,
    totalPages,
    paginatedMembers,
    // 方法
    fetchMembers,
    clear,
    setKeyword,
    setDateRange,
    setProductFilter,
    setStatusFilter,
    gotoPage,
    prevPage,
    nextPage,
  }
}) 