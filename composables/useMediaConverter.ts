import { ref } from 'vue'

export const useMediaConverter = () => {
  const isConverting = ref(false)
  const conversionProgress = ref(0)

  // ====================== helpers ======================

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

  const replaceExt = (name: string | undefined, newExt: string, fallbackBase = "image"): string => {
    const base = (name && name.replace(/\.\w+$/,'').trim()) || fallbackBase
    const clean = newExt.replace(/^\./,'')
    return `${base}.${clean}`
  }

  const blobToFile = (blob: Blob, name: string): File =>
    (blob instanceof File) ? blob : new File([blob], name, { type: blob.type || "image/jpeg" })

  const mimeFromErrMessage = (msg?: string): string | null => {
    if (!msg) return null
    const m = msg.match(/image\/[a-z0-9+.\-]+/i)
    return m ? m[0].toLowerCase() : null
  }

  const extFromMime = (mime: string): string => {
    const sub = mime.split('/')[1]?.toLowerCase() || 'jpg'
    if (sub === 'jpeg') return 'jpg'
    return sub
  }

  // Base64 長度 ~= 原始 bytes * 4/3，反推 blob 最大 bytes
  const maxBlobBytesFromBase64MB = (maxBase64MB: number) =>
    Math.floor(maxBase64MB * 1024 * 1024 * 0.75)

  // 用 canvas 重新編碼（並可縮圖）
  const drawToCanvas = async (blob: Blob, maxSide = 4096): Promise<HTMLCanvasElement> => {
    const url = URL.createObjectURL(blob)
    try {
      const img = await loadImage(url)
      const { width, height } = fitSize(img.width, img.height, maxSide)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      return canvas
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.decoding = 'async'
      img.src = src
    })

  const fitSize = (w: number, h: number, maxSide: number) => {
    if (Math.max(w, h) <= maxSide) return { width: w, height: h }
    const scale = maxSide / Math.max(w, h)
    return { width: Math.round(w * scale), height: Math.round(h * scale) }
  }

  // canvas 轉 blob，帶 fallback
  const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> =>
    new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) return resolve(b)
        try {
          // iOS 部分情況 toBlob 可能回 null，用 dataURL fallback
          const dataUrl = canvas.toDataURL(type, quality)
          const bin = atob(dataUrl.split(',')[1] || '')
          const arr = new Uint8Array(bin.length)
          for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
          resolve(new Blob([arr], { type }))
        } catch (e) {
          reject(e)
        }
      }, type, quality)
    })

  // 反覆降畫質 / 縮邊讓 blob 體積落在 Base64 上限內
  const enforceSize = async (
    input: Blob,
    {
      maxBase64MB = 25,      // 依你後端允許的 Base64 字串上限調整；30MB 字串 ≈ 22.5MB blob
      startQuality = 0.85,
      minQuality = 0.5,
      step = 0.1,
      maxSide = 4096,        // 先不大幅縮圖，只在必要時縮
      minSide = 1600         // 若畫質降到 min 還超重，開始縮到此較小邊
    } = {}
  ): Promise<Blob> => {
    const targetBytes = maxBlobBytesFromBase64MB(maxBase64MB)
    if (input.size <= targetBytes) return input

    let quality = startQuality
    let currentCanvas = await drawToCanvas(input, maxSide)

    // 先嘗試只降畫質
    while (quality >= minQuality) {
      const b = await canvasToBlob(currentCanvas, 'image/jpeg', quality)
      if (b.size <= targetBytes) return b
      quality = +(quality - step).toFixed(2)
    }

    // 畫質降到 minQuality 仍超標 → 逐步縮邊
    let side = Math.max(currentCanvas.width, currentCanvas.height)
    while (side > minSide) {
      side = Math.floor(side * 0.85)
      currentCanvas = await drawToCanvas(await canvasToBlob(currentCanvas, 'image/jpeg', minQuality), side)
      const b = await canvasToBlob(currentCanvas, 'image/jpeg', minQuality)
      if (b.size <= targetBytes) return b
    }

    // 還是超標就回最後結果（已盡力壓縮）
    return await canvasToBlob(currentCanvas, 'image/jpeg', minQuality)
  }

  // ====================== conversion ======================

  // HEIC -> JPEG（或把「已可讀」的影像轉成 JPEG + 壓縮）
  const convertHEICToJPG = async (file: File): Promise<File> => {
    isConverting.value = true
    conversionProgress.value = 10
    try {
      if (typeof window === 'undefined') {
        throw new Error('HEIC conversion must run in the browser.')
      }

      console.log('開始真正的 HEIC 轉換:', { name: file.name, type: file.type || '(empty)', size: file.size })

      const mod = await import('heic2any')
      const heic2any = (mod.default ?? mod) as any

      const out = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8,
      }) as Blob | Blob[]

      const first = Array.isArray(out) ? out[0] : out
      const jpgBlob = first.type ? first : new Blob([first], { type: 'image/jpeg' })

      // 壓到可控大小（避免 Base64 膨脹）
      const compact = await enforceSize(jpgBlob, { maxBase64MB: 25 })
      conversionProgress.value = 100
      return blobToFile(compact, filenameWithExt(file.name))
    } catch (err: any) {
      const msg: string = err?.message || ''
      const code: number | undefined = err?.code

      // heic2any 提示已可讀（多見於實際是 PNG）
      if (code === 1 && /already browser readable/i.test(msg)) {
        const detectedMime = mimeFromErrMessage(msg) || 'image/png'
        console.warn(`heic2any: 已可被瀏覽器直接讀取（${detectedMime}），改用 Canvas 重新編碼為 JPEG。`)
        const buf = await file.arrayBuffer()
        const detectedBlob = new Blob([buf], { type: detectedMime })

        // 直接重編成 JPEG 並壓縮
        const canvas = await drawToCanvas(detectedBlob, 4096)
        let jpg = await canvasToBlob(canvas, 'image/jpeg', 0.85)
        jpg = await enforceSize(jpg, { maxBase64MB: 25 }) // 控制 Base64 長度

        return new File([jpg], replaceExt(file.name, 'jpg'), { type: 'image/jpeg' })
      }

      console.error("HEIC 轉換失敗:", err)
      // 回傳原檔，讓上層決定是否擋掉
      return file
    } finally {
      isConverting.value = false
    }
  }

  // 真的轉，不只改副檔名
  const processFileFormat = async (file: File): Promise<File> => {
    console.log('processFileFormat 開始:', { name: file.name, type: file.type || '(empty)' })

    if (isHEICFormat(file)) {
      console.log('檢測到 HEIC/HEIF，開始轉換 → JPEG（含壓縮）')
      return await convertHEICToJPG(file)
    }

    // 非 HEIC，但若是超大 PNG/WebP，也可視需要轉成 JPEG 壓一下（選配）
    // 這裡保守處理：只記錄 log，不自動轉，避免影響預期色彩/透明背景
    console.log('非 HEIC，直接返回原檔案')
    return file
  }

  // ====================== validations & utils ======================

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
