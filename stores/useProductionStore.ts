/**
 * 生產管理 Store
 * 
 * 功能：
 * - 串接 /api/bk/MakeQry API 取得生產資料
 * - 串接 /api/bk/MakeBegin API 開始製作
 * - 串接 /api/bk/MakeComplete API 製作完成
 * - 串接 /api/bk/Home_CProduct API 取得商品選項
 * - 支援關鍵字搜尋（訂單編號、訂購姓名、商品名稱）
 * - 支援商品篩選（動態載入）
 * - 支援狀態篩選
 * - 支援分頁功能
 * - 支援最新訂單排序
 * - 支援生產狀態更新（開始製作、製作完成）
 * 
 * 狀態流程：
 * - 個人化資訊 (1) → 開始製作 → 製作中 (4) → 製作完成 → 移除
 * - 待製作 (3) → 開始製作 → 製作中 (4) → 製作完成 → 移除
 * 
 * API 規格：
 * MakeQry 請求：{ "AdminID": "mushen", "Token": "xxx", "Name": "搜尋關鍵字" }
 * MakeQry 回應：{ "RetMake": [...], "Result": "OK" }
 * MakeBegin 請求：{ "AdminID": "mushen", "Token": "xxx", "SALEID": "訂單編號", "ProductID": "商品ID" }
 * MakeBegin 回應：{ "Result": "OK" }
 * MakeComplete 請求：{ "AdminID": "mushen", "Token": "xxx", "SALEID": "訂單編號", "ProductID": "商品ID" }
 * MakeComplete 回應：{ "Result": "OK" }
 * Home_CProduct 請求：{ "AdminID": "mushen", "Token": "xxx" }
 * Home_CProduct 回應：{ "RetMaProduct": [...], "Result": "OK" }
 * 
 * 使用方式：
 * const store = useProductionStore()
 * await store.fetchProductionData()
 * await store.fetchProductOptions()
 * await store.startProductionAPI("訂單編號", "商品ID")
 * await store.completeProductionAPI("訂單編號", "商品ID")
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

interface ProductionItem {
  SID: string;
  Name: string;
  ProductID: string;
  ProductName: string;
  PdtSize: string;
  BodySize: string;
  State: string;
  StateName: string;
}

export const useProductionStore = defineStore('production', () => {
  // 狀態
  const productionData = ref<ProductionItem[]>([])
  const lastUpdated = ref('')
  const hasFetched = ref(false)
  const keyword = ref('')
  const productFilter = ref('')
  const statusFilter = ref('')
  const page = ref(1)
  const pageSize = 10
  const loading = ref(false)
  const productOptions = ref<{ label: string; value: string }[]>([])

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

  // 計算屬性：篩選後的生產資料（按最新訂單排序）
  const filteredData = computed(() => {
    let filtered = productionData.value

    // 關鍵字搜尋
    if (keyword.value) {
      filtered = filtered.filter(item => 
        item.SID.includes(keyword.value) ||
        item.Name.includes(keyword.value) ||
        item.ProductName.includes(keyword.value)
      )
    }

    // 商品篩選
    if (productFilter.value) {
      filtered = filtered.filter(item => 
        item.ProductName.includes(productFilter.value)
      )
    }

    // 狀態篩選
    if (statusFilter.value) {
      if (statusFilter.value.includes(',')) {
        // 多狀態篩選（用逗號分隔）
        const states = statusFilter.value.split(',')
        filtered = filtered.filter(item => 
          states.includes(item.State)
        )
      } else {
        // 單狀態篩選
        filtered = filtered.filter(item => 
          item.State === statusFilter.value
        )
      }
    }

    // 按最新訂單排序（SID 數字越大越新）
    return filtered.sort((a, b) => {
      const aId = parseInt(a.SID)
      const bId = parseInt(b.SID)
      return bId - aId
    })
  })

  const total = computed(() => filteredData.value.length)
  const totalPages = computed(() => Math.ceil(total.value / pageSize))
  const paginatedData = computed(() => {
    const start = (page.value - 1) * pageSize
    return filteredData.value.slice(start, start + pageSize)
  })

  // 方法
  async function fetchProductOptions() {
    try {
      const token = localStorage.getItem("backendToken") || sessionStorage.getItem("backendToken")
      const adminID = localStorage.getItem("adminID") || sessionStorage.getItem("adminID")
      if (!token || !adminID) throw new Error("缺少 token 或 adminID")

      const requestBody = {
        AdminID: adminID,
        Token: token
      }

      console.log("商品篩選 API 請求參數:", requestBody)

      const response = await axios.post(
        "https://23700999.com:8081/HMA/api/bk/Home_CProduct",
        requestBody
      )

      console.log("商品篩選 API 回應:", response.data)

      if (response.status === 200 && response.data.Result === "OK" && response.data.RetMaProduct) {
        productOptions.value = response.data.RetMaProduct.map((product: any) => ({
          label: product.ProductName,
          value: product.ProductName
        }))
        console.log("成功載入商品選項:", productOptions.value.length, "個")
      } else {
        console.error("商品篩選 API 回傳資料格式錯誤")
        productOptions.value = []
      }
    } catch (error: any) {
      console.error("載入商品選項時發生錯誤:", error)
      if (error.response) {
        console.error("錯誤回應:", error.response.data)
      }
      productOptions.value = []
    }
  }

  async function fetchProductionData() {
    // 如果 API 還沒準備好，可以使用測試資料
    if (process.env.NODE_ENV === 'development' && false) { // 設為 false 來使用真實 API
      console.log("使用測試資料")
      productionData.value = [
        {
          SID: "00000001",
          Name: "王先生",
          ProductID: "P001",
          ProductName: "護您穩1型(XXXXX) L",
          PdtSize: "35cm",
          BodySize: "35cm",
          State: "1",
          StateName: "個人化資訊"
        },
        {
          SID: "00000002",
          Name: "李小姐",
          ProductID: "P001",
          ProductName: "護您穩1型(XXXXX) M",
          PdtSize: "32cm",
          BodySize: "32cm",
          State: "3",
          StateName: "待製作"
        },
        {
          SID: "00000003",
          Name: "張先生",
          ProductID: "P002",
          ProductName: "護您穩2型(XXXXX) L",
          PdtSize: "38cm",
          BodySize: "38cm",
          State: "4",
          StateName: "製作中"
        }
      ]
      lastUpdated.value = new Date().toLocaleString("zh-TW")
      hasFetched.value = true
      loading.value = false
      return
    }

    loading.value = true

    try {
      const token = localStorage.getItem("backendToken") || sessionStorage.getItem("backendToken")
      const adminID = localStorage.getItem("adminID") || sessionStorage.getItem("adminID")
      if (!token || !adminID) throw new Error("缺少 token 或 adminID")

      const requestBody = {
        AdminID: adminID,
        Token: token,
        Name: keyword.value || "", // 訂單姓名或商品名稱搜尋
      };

      console.log("生產管理 API 請求參數:", requestBody);

      const response = await axios.post(
        "https://23700999.com:8081/HMA/api/bk/MakeQry",
        requestBody
      )

      console.log("生產管理 API 回應:", response.data)

      if (response.status === 200) {
        const apiData = response.data
        if (apiData && apiData.Result === "OK" && apiData.RetMake) {
          productionData.value = apiData.RetMake
          lastUpdated.value = new Date().toLocaleString("zh-TW")
          hasFetched.value = true
          console.log("成功載入生產資料，共", apiData.RetMake.length, "筆")
        } else {
          console.error("API 回傳資料格式錯誤:", apiData)
          productionData.value = []
        }
      } else {
        console.error("載入生產資料失敗，HTTP 狀態碼:", response.status)
        productionData.value = []
      }
    } catch (error: any) {
      console.error("載入生產資料時發生錯誤:", error)
      if (error.response) {
        console.error("錯誤回應:", error.response.data)
      }
      productionData.value = []
    } finally {
      loading.value = false
    }
  }

  function clear() {
    productionData.value = []
    lastUpdated.value = ''
    page.value = 1
  }

  function setKeyword(kw: string) {
    keyword.value = kw
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
      "A": "status-red", // 退貨完成
      "B": "status-red", // 退款完成
    }
    return statusMap[status] || "status-default"
  }

  // 開始製作 API 調用
  async function startProductionAPI(sid: string, productId: string) {
    try {
      const token = localStorage.getItem("backendToken") || sessionStorage.getItem("backendToken")
      const adminID = localStorage.getItem("adminID") || sessionStorage.getItem("adminID")
      if (!token || !adminID) throw new Error("缺少 token 或 adminID")

      const requestBody = {
        AdminID: adminID,
        Token: token,
        SALEID: sid,
        ProductID: productId
      }

      console.log("開始製作 API 請求參數:", requestBody)

      const response = await axios.post(
        "https://23700999.com:8081/HMA/api/bk/MakeBegin",
        requestBody
      )

      console.log("開始製作 API 回應:", response.data)

      if (response.status === 200 && response.data.Result === "OK") {
        console.log("開始製作成功")
        return true
      } else {
        console.error("開始製作失敗:", response.data)
        return false
      }
    } catch (error: any) {
      console.error("開始製作 API 調用失敗:", error)
      if (error.response) {
        console.error("錯誤回應:", error.response.data)
      }
      return false
    }
  }

  // 製作完成 API 調用
  async function completeProductionAPI(sid: string, productId: string) {
    try {
      const token = localStorage.getItem("backendToken") || sessionStorage.getItem("backendToken")
      const adminID = localStorage.getItem("adminID") || sessionStorage.getItem("adminID")
      if (!token || !adminID) throw new Error("缺少 token 或 adminID")

      const requestBody = {
        AdminID: adminID,
        Token: token,
        SALEID: sid,
        ProductID: productId
      }

      console.log("製作完成 API 請求參數:", requestBody)

      const response = await axios.post(
        "https://23700999.com:8081/HMA/api/bk/MakeComplete",
        requestBody
      )

      console.log("製作完成 API 回應:", response.data)

      if (response.status === 200 && response.data.Result === "OK") {
        console.log("製作完成成功")
        return true
      } else {
        console.error("製作完成失敗:", response.data)
        return false
      }
    } catch (error: any) {
      console.error("製作完成 API 調用失敗:", error)
      if (error.response) {
        console.error("錯誤回應:", error.response.data)
      }
      return false
    }
  }

  // 更新生產狀態
  function updateProductionStatus(sid: string, newStatus: string) {
    const item = productionData.value.find(item => item.SID === sid)
    if (item) {
      item.State = newStatus
      item.StateName = statusCodeMap[newStatus] || newStatus
      console.log(`更新訂單 ${sid} 狀態: ${item.StateName} (${newStatus})`)
    }
  }

  // 移除生產項目
  function removeProductionItem(sid: string) {
    const index = productionData.value.findIndex(item => item.SID === sid)
    if (index !== -1) {
      productionData.value.splice(index, 1)
    }
  }

  return {
    // 狀態
    productionData,
    lastUpdated,
    hasFetched,
    keyword,
    productFilter,
    statusFilter,
    page,
    pageSize,
    loading,
    productOptions,
    // 計算屬性
    filteredData,
    total,
    totalPages,
    paginatedData,
    statusCodeMap,
    // 方法
    fetchProductionData,
    fetchProductOptions,
    clear,
    setKeyword,
    setProductFilter,
    setStatusFilter,
    gotoPage,
    prevPage,
    nextPage,
    getStatusClass,
    updateProductionStatus,
    removeProductionItem,
    startProductionAPI,
    completeProductionAPI,
  }
}) 