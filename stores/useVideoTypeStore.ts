import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

interface VideoType {
  Type: string
  Name: string
}

export const useVideoTypeStore = defineStore('videoType', () => {
  // 狀態
  const videoTypeList = ref<VideoType[]>([])
  const loading = ref(false)
  const hasFetched = ref(false)

  // 方法：取得影片類型列表
  async function fetchVideoTypeList() {
    if (hasFetched.value && videoTypeList.value.length > 0) {
      return // 已經取得過資料，不需要重新取得
    }

    loading.value = true
    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem("backendToken") || sessionStorage.getItem("backendToken")
        : ""
      const adminID = typeof window !== 'undefined'
        ? localStorage.getItem("adminID") || sessionStorage.getItem("adminID")
        : ""

      if (!token || !adminID) {
        throw new Error("缺少 token 或 adminID")
      }

      const response = await axios.post(
        "https://23700999.com:8081/HMA/api/bk/getVideoTypeList",
        {
          AdminID: adminID,
          Token: token,
        }
      )

      if (response.data && response.data.Result === "OK" && response.data.VideoTypeList) {
        videoTypeList.value = response.data.VideoTypeList
        hasFetched.value = true
      } else {
        console.error("API 返回錯誤:", response.data)
        videoTypeList.value = []
      }
    } catch (error) {
      console.error("取得影片類型列表失敗:", error)
      videoTypeList.value = []
    } finally {
      loading.value = false
    }
  }

  // 清除資料
  function clear() {
    videoTypeList.value = []
    hasFetched.value = false
  }

  // 強制重新取得資料
  async function refresh() {
    hasFetched.value = false
    await fetchVideoTypeList()
  }

  return {
    // 狀態
    videoTypeList,
    loading,
    hasFetched,
    // 方法
    fetchVideoTypeList,
    clear,
    refresh,
  }
})

