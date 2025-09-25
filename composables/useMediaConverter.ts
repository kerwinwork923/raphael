import { ref } from 'vue'

export const useMediaConverter = () => {
  const isConverting = ref(false)
  const conversionProgress = ref(0)

  const isHEICFormat = (file: File): boolean => {
    const name = (file.name || "").toLowerCase()
    const type = (file.type || "").toLowerCase()
    return name.endsWith(".heic") ||
           name.endsWith(".heif") ||
           type === "image/heic" ||
           type === "image/heif"
  }

  const filenameWithExt = (name?: string, fallback = "image.jpg") => {
    if (!name) return fallback
    if (!/\.\w+$/.test(name)) return name + ".jpg"
    return name.replace(/\.(heic|heif)$/i, ".jpg")
  }

  const blobToFile = (blob: Blob, name: string): File =>
    (blob instanceof File) ? blob : new File([blob], name, { type: blob.type || "image/jpeg" })

  // 真的做 HEIC -> JPEG（動態載入 heic2any，避免 SSR 問題）
  const convertHEICToJPG = async (file: File): Promise<File> => {
    isConverting.value = true
    conversionProgress.value = 10
    try {
      // 僅在瀏覽器端執行
      if (typeof window === 'undefined') {
        throw new Error('HEIC conversion must run in the browser.')
      }

      console.log('開始真正的 HEIC 轉換:', { name: file.name, type: file.type, size: file.size });

      // 動態 import，避免 SSR
      const mod = await import('heic2any')
      const heic2any = (mod.default ?? mod) as any

      const out = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8,
      }) as Blob | Blob[]

      const blob = Array.isArray(out) ? out[0] : out
      const jpgBlob = blob.type ? blob : new Blob([blob], { type: 'image/jpeg' })

      console.log('HEIC 轉換成功:', { type: jpgBlob.type, size: jpgBlob.size });

      conversionProgress.value = 100
      return blobToFile(jpgBlob, filenameWithExt(file.name))
    } catch (err) {
      console.error("HEIC 轉換失敗:", err)
      // 失敗時，不要假裝成 JPG！回傳原檔，讓上層決定要不要擋掉或提示
      return file
    } finally {
      isConverting.value = false
    }
  }

  // ✅ 修正：真的轉，不要只改副檔名
  const processFileFormat = async (file: File): Promise<File> => {
    console.log('processFileFormat 開始:', { name: file.name, type: file.type });
    
    if (isHEICFormat(file)) {
      console.log('檢測到 HEIC 格式，開始真正的轉換');
      return await convertHEICToJPG(file)
    }
    
    console.log('非 HEIC 格式，直接返回原檔案');
    return file
  }

  const validateFileSize = (file: File, maxSizeMB: number = 30): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes
  }

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

  const createPreviewURL = (file: File): string => URL.createObjectURL(file)
  const revokePreviewURL = (url: string): void => URL.revokeObjectURL(url)

  const isAllowedImage = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif']
    const name = (file.name || "").toLowerCase()
    const ext = name.split(".").pop() || ""
    const allowedExt = ['jpg','jpeg','png','heic','heif']
    const type = (file.type || "").toLowerCase()
    if (allowedTypes.includes(type)) return true
    if (allowedExt.includes(ext)) return true
    if (!type && !ext) return true
    return false
  }

  const getExt = (f: File): string => {
    const n = (f.name || "").toLowerCase()
    if (/\.(jpe?g|png|gif|webp)$/i.test(n)) return n.split(".").pop()!
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