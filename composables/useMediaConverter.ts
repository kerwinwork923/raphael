import { ref } from 'vue'

export const useMediaConverter = () => {
  const isConverting = ref(false)
  const conversionProgress = ref(0)

  // 檢查是否為 HEIC 格式
  const isHEICFormat = (file: File): boolean => {
    const fileName = file.name.toLowerCase()
    const mimeType = file.type.toLowerCase()
    
    return fileName.endsWith('.heic') || 
           fileName.endsWith('.heif') || 
           mimeType === 'image/heic' || 
           mimeType === 'image/heif'
  }

  // 將 HEIC 轉換為 JPG（使用 Canvas API）
  const convertHEICToJPG = async (file: File): Promise<File> => {
    isConverting.value = true
    conversionProgress.value = 0

    try {
      // 創建圖片元素來載入 HEIC 檔案
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('無法創建 Canvas 上下文')
      }

      // 使用 Promise 來處理圖片載入
      const loadImage = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          img.onload = () => {
            conversionProgress.value = 50
            
            // 設定 Canvas 尺寸
            canvas.width = img.width
            canvas.height = img.height
            
            // 繪製圖片到 Canvas
            ctx.drawImage(img, 0, 0)
            conversionProgress.value = 100
            resolve()
          }
          
          img.onerror = () => {
            reject(new Error('無法載入 HEIC 圖片'))
          }
          
          // 創建 URL 並載入圖片
          const url = URL.createObjectURL(file)
          img.src = url
        })
      }

      await loadImage()
      
      // 將 Canvas 轉換為 Blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            throw new Error('Canvas 轉換失敗')
          }
        }, 'image/jpeg', 0.8)
      })
      
      // 創建新的 JPG 檔案
      const jpgFile = new File([blob], 
        file.name.replace(/\.(heic|heif)$/i, '.jpg'), 
        { type: 'image/jpeg' }
      )
      
      // 清理 URL
      URL.revokeObjectURL(img.src)
      
      isConverting.value = false
      return jpgFile
    } catch (error) {
      console.error('HEIC 轉換失敗:', error)
      isConverting.value = false
      
      // 如果轉換失敗，提示用戶並返回原檔案
      alert('HEIC 格式轉換失敗，請使用 JPG 或 PNG 格式的圖片')
      return file
    }
  }

  // 處理檔案格式轉換
  const processFileFormat = async (file: File): Promise<File> => {
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

  return {
    isConverting,
    conversionProgress,
    isHEICFormat,
    convertHEICToJPG,
    processFileFormat,
    validateFileSize,
    validateVideoDuration,
    createPreviewURL,
    revokePreviewURL
  }
}
