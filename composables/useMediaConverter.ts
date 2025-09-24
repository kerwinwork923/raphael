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
      console.log('開始 HEIC 轉換:', { name: file.name, type: file.type, size: file.size });
      
      const out = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8,
      }) as Blob
      
      console.log('HEIC 轉換成功:', { type: out.type, size: out.size });
      
      conversionProgress.value = 100
      isConverting.value = false
      return blobToFile(out, filenameWithExt(file.name))
    } catch (err) {
      console.error("HEIC 轉換失敗:", err)
      isConverting.value = false
      
      // 如果轉換失敗，嘗試直接返回原檔案（某些情況下可能可以正常處理）
      console.log('HEIC 轉換失敗，嘗試直接使用原檔案');
      return file
    }
  }

  // 處理檔案格式轉換
  const processFileFormat = async (file: File): Promise<File> => {
    console.log('processFileFormat 開始:', { name: file.name, type: file.type });
    
    // 暫時禁用 HEIC 轉換，直接返回原檔案進行測試
    if (isHEICFormat(file)) {
      console.log('檢測到 HEIC 格式，暫時跳過轉換（測試模式）');
      // 創建一個新的 File 物件，確保有正確的 MIME type
      const newFile = new File([file], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
        type: 'image/jpeg'
      });
      console.log('創建新的 JPG 檔案:', { name: newFile.name, type: newFile.type });
      return newFile;
    }
    
    console.log('非 HEIC 格式，直接返回原檔案');
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

    console.log('檢查圖片格式:', { name, ext, type, allowedTypes, allowedExt });

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