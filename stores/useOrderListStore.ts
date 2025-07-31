import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

interface OrderItem {
  ProductName: string;
  Price: string;
  Qty: string;
  Amount: string;
}

interface Order {
  SID: string;
  Name: string;
  TotalAmount: string;
  CNT: string;
  CheckTime: string;
  State: string;
  StateName: string;
  ItemList: OrderItem[];
}

export const useOrderListStore = defineStore('orderList', () => {
  // 狀態
  const orders = ref<Order[]>([])
  const lastUpdated = ref('')
  const hasFetched = ref(false)
  const keyword = ref('')
  const dateRange = ref<{ start: string; end: string } | null>(null)
  const statusFilter = ref('')
  const page = ref(1)
  const pageSize = 10
  const loading = ref(false)

  // 狀態代碼對應顯示文字
  const statusCodeMap: Record<string, string> = {
    "0": "未付款",
    "1": "個人化資訊", 
    "3": "待製作",
    "4": "製作中",
    "5": "待出貨",
    "6": "已出貨",
    "7": "已簽收",
    "8": "退貨申請",
    "9": "退貨處理",
    "A": "退貨完成",
    "B": "退款完成",
  }

  // 計算屬性：篩選後的訂單（按最新訂單編號排序）
  const filteredOrders = computed(() => {
    return orders.value.sort((a, b) => {
      // 按 SID 數字大小排序（最新的在前面）
      const aId = parseInt(a.SID)
      const bId = parseInt(b.SID)
      return bId - aId
    })
  })

  const total = computed(() => filteredOrders.value.length)
  const totalPages = computed(() => Math.ceil(total.value / pageSize))
  const paginatedOrders = computed(() => {
    const start = (page.value - 1) * pageSize
    return filteredOrders.value.slice(start, start + pageSize)
  })

  // 方法
  async function fetchOrders() {
    // 移除 hasFetched 檢查，確保每次都能重新獲取資料
    loading.value = true

    try {
      const token = localStorage.getItem("backendToken") || sessionStorage.getItem("backendToken")
      const adminID = localStorage.getItem("adminID") || sessionStorage.getItem("adminID")
      if (!token || !adminID) throw new Error("缺少 token 或 adminID")

      const requestBody = {
        AdminID: adminID,
        Token: token,
        Name: keyword.value || "",
        StartDate: dateRange.value?.start || "20250101",
        EndDate: dateRange.value?.end || "20991231",
        State: statusFilter.value || "",
      };

      console.log("API 請求參數:", requestBody);

      const response = await axios.post(
        "https://23700999.com:8081/HMA/api/bk/SaleQry",
        requestBody
      )

      console.log("API 回應:", response.data)

      if (response.status === 200) {
        const apiData = response.data
        if (apiData && apiData.RetSale) {
          orders.value = apiData.RetSale
          lastUpdated.value = new Date().toLocaleString("zh-TW")
          hasFetched.value = true
        } else {
          console.error("API 回傳資料格式錯誤")
          orders.value = []
        }
      } else {
        console.error("載入訂單失敗")
        orders.value = []
      }
    } catch (error) {
      console.error("載入訂單時發生錯誤:", error)
      orders.value = []
    } finally {
      loading.value = false
    }
  }

  function clear() {
    orders.value = []
    lastUpdated.value = ''
    page.value = 1
  }

  function setKeyword(kw: string) {
    keyword.value = kw
    page.value = 1
  }

  function setDateRange(range: { start: string; end: string } | null) {
    dateRange.value = range
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

  function getStatusClass(status: string) {
    const statusMap: Record<string, string> = {
      "0": "status-red", // 未付款
      "1": "status-green", // 個人化資訊
      "3": "status-red", // 待製作
      "4": "status-green", // 製作中
      "5": "status-green", // 待出貨
      "6": "status-blue", // 已出貨
      "7": "status-blue", // 已簽收
      "8": "status-red", // 退貨申請
      "9": "status-red", // 退貨處理
      A: "status-red", // 退貨完成
      B: "status-red", // 退款完成
    }
    return statusMap[status] || "status-default"
  }

  // 將 yyyyMMdd 格式轉換為可讀的日期格式
  function formatDateForDisplay(dateStr: string): string {
    if (!dateStr || dateStr.length !== 8) return '';
    
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    
    return `${year}/${month}/${day}`;
  }

  // 獲取格式化的日期範圍顯示
  function getFormattedDateRange(): string {
    if (!dateRange.value || !dateRange.value.start || !dateRange.value.end) {
      return '';
    }
    
    const startDate = formatDateForDisplay(dateRange.value.start);
    const endDate = formatDateForDisplay(dateRange.value.end);
    
    return `${startDate} - ${endDate}`;
  }

  return {
    // 狀態
    orders,
    lastUpdated,
    hasFetched,
    keyword,
    dateRange,
    statusFilter,
    page,
    pageSize,
    loading,
    // 計算屬性
    filteredOrders,
    total,
    totalPages,
    paginatedOrders,
    statusCodeMap,
    // 方法
    fetchOrders,
    clear,
    setKeyword,
    setDateRange,
    setStatusFilter,
    gotoPage,
    prevPage,
    nextPage,
    getStatusClass,
    formatDateForDisplay,
    getFormattedDateRange,
  }
}) 