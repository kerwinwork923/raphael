import { ref } from 'vue'
import heic2any from "heic2any"

export const useMediaConverter = () => {
  const isConverting = ref(false)
  const conversionProgress = ref(0)

  // 檢查是否為 HEIC 格式
  const isHEICFormat = (file: File): boolean => {
    const name = (file.name || "").toLowerCase()
    const type = (file.type || "").toLowerCase()
    return name.endsWith(".heic") || 
           name.endsWith(".heif") || 
           type === "image/heic" || 
           type === "image/heif"
  }

  // 確保檔案名稱有副檔名
  const filenameWithExt = (name?: string, fallback = "image.jpg") => {
    if (!name) return fallback
    // 沒副檔名就補 .jpg
    if (!/\.\w+$/.test(name)) return name + ".jpg"
    return name.replace(/\.(heic|heif)$/i, ".jpg")
  }

  // 將 Blob 轉換為 File
  const blobToFile = (blob: Blob, name: string): File =>
    (blob instanceof File) ? blob : new File([blob], name, { type: blob.type || "image/jpeg" })

  // 使用 heic2any 進行真正的 HEIC 轉 JPG
  const convertHEICToJPG = async (file: File): Promise<File> => {
    isConverting.value = true
    conversionProgress.value = 10
    
    try {
      const out = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8,
      }) as Blob
      
      conversionProgress.value = 100
      isConverting.value = false
      return blobToFile(out, filenameWithExt(file.name))
    } catch (err) {
      console.error("HEIC 轉換失敗:", err)
      isConverting.value = false
      throw new Error("無法轉換 HEIC，請改用 JPG/PNG 或啟用相機拍照上傳")
    }
  }

  // 處理檔案格式轉換
  const processFileFormat = async (file: File): Promise<File> => {
    // 某些 iOS 會給空 type，但檔名是 .heic
    if (isHEICFormat(file)) {
      return await convertHEICToJPG(file)
    }
    return file
  }

  // 檢查檔案大小限制
  const validateFileSize = (file: File, maxSizeMB: number = 30): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes
  }

  // 檢查影片長度限制
  const validateVideoDuration = (file: File, maxDurationSeconds: number = 10): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('video/')) {
        resolve(true)
        return
      }

      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        resolve(video.duration <= maxDurationSeconds)
        URL.revokeObjectURL(video.src)
      }
      
      video.onerror = () => {
        resolve(false)
        URL.revokeObjectURL(video.src)
      }
      
      video.src = URL.createObjectURL(file)
    })
  }

  // 生成檔案預覽 URL
  const createPreviewURL = (file: File): string => {
    return URL.createObjectURL(file)
  }

  // 清理 URL 物件
  const revokePreviewURL = (url: string): void => {
    URL.revokeObjectURL(url)
  }

  // 檢查是否為允許的圖片格式
  const isAllowedImage = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif']
    const name = (file.name || "").toLowerCase()
    const ext = name.split(".").pop() || ""
    const allowedExt = ['jpg','jpeg','png','heic','heif']
    const type = (file.type || "").toLowerCase()

    if (allowedTypes.includes(type)) return true
    if (allowedExt.includes(ext)) return true
    // type 空而且沒副檔名 → 先讓過，丟給 processFileFormat 決定
    if (!type && !ext) return true
    return false
  }

  // 取得副檔名（處理空 type/沒副檔名）
  const getExt = (f: File): string => {
    const n = (f.name || "").toLowerCase()
    if (/\.(jpe?g|png|gif|webp)$/i.test(n)) return n.split(".").pop()!
    // 看 MIME
    const t = (f.type || "").toLowerCase()
    if (t.includes("jpeg")) return "jpg"
    if (t.includes("png")) return "png"
    if (t.includes("gif")) return "gif"
    if (t.includes("webp")) return "webp"
    // 保底
    return "jpg"
  }

  return {
    isConverting,
    conversionProgress,
    isHEICFormat,
    convertHEICToJPG,
    processFileFormat,
    validateFileSize,
    validateVideoDuration,
    createPreviewURL,
    revokePreviewURL,
    isAllowedImage,
    getExt
  }
}