<template>
  <div class="HRVTest">
    <Navbar />
    <div class="scanWrap">
      <!-- 初始遮罩 -->
      <div class="HRVFirstCover" id="hrvFirstCover" v-if="!isStarted">
        <img
          src="/vital/images/new/ball.gif"
          alt="開始檢測"
          id="start"
          @click="startBtnClick"
          :style="{
            cursor: scanning ? 'not-allowed' : 'pointer',
            opacity: scanning ? 0.5 : 1,
            width: '80px',
            height: '80px'
          }"
          :disabled="scanning"
        />
        <ul>
          <li>準備好後，<span>請點擊任意地方開始量測</span>。</li>
          <li>
            系統將在倒數
            <span>3 秒</span>後開始偵測，請讓臉部完整對準畫面並保持不動。
          </li>
          <li><span>量測時間約 15 秒</span>，完成後將顯示檢測結果。</li>
          <li>感謝您的配合！</li>
        </ul>
      </div>

      <!-- 掃描系統 -->
      <div class="ai-scanner-system" v-show="isStarted">
        <div class="scanner-header">
          <div class="system-title">AI FACE SCANNER v2.0</div>
        </div>

        <div class="video-container">
          <video ref="videoElement" autoplay muted playsinline></video>
          <div class="face-blur-mask"></div>
          <div class="face-guide"></div>
          <div
            class="face-guide-tip"
            :class="{ show: showFaceGuideTip }"
            style="z-index: 30"
          >
            請將臉部對準中央橢圓區域
          </div>
          <div class="countdown" v-show="counting">{{ countingSec }}</div>

          <!-- 掃描效果 -->
          <div class="scanning-overlay">
            <div class="scan-grid"></div>
            <div class="scan-beam" v-if="scanning"></div>
            <div class="horizontal-scan" v-if="scanning"></div>
            <div class="speed-lines" ref="speedLines"></div>
          </div>
        </div>

        <!-- 進度條 -->
        <div class="progress-section">
          <div class="progress-text">{{ Math.round(progress) }}%</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{width: progress + '%'}"></div>
          </div>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div
        id="action-tip"
        :class="['action-tip', { fade: tipFading }]"
        @click="startBtnClick"
        v-show="isStarted"
      >
        <img
          src="/vital/images/new/ball.gif"
          alt="開始檢測"
          id="start"
          :style="{
            cursor: scanning ? 'not-allowed' : 'pointer',
            opacity: scanning ? 0.5 : 1,
            width: '80px',
            height: '80px',
            background: 'none',
            boxShadow: 'none',
            border: 'none',
            marginRight: '16px'
          }"
          :disabled="scanning"
        />
        <p v-if="!counting && !scanning" class="tip-text left-align startBtn">
          開始量測
        </p>
        <p v-else-if="counting" class="tip-text left-align">倒數完即開始...</p>
        <p v-else-if="scanning" class="tip-text left-align">請盡量保持不動</p>
      </div>

      <!-- AI 分析中遮罩 -->
      <div v-if="aiAnalysing" class="AIAnalysisCover">
        <img
          src="/vital/images/new/ball.gif"
          alt="AI 分析中..."
          class="AIAnalysisCover-loading"
        />
        <div class="AIAnalysisCover-title">AI 分析中...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as faceapi from '@vladmandic/face-api'
import Navbar from '../components/Navbar.vue'

// Refs
const videoElement = ref(null)
const scanning = ref(false)
const faces = ref([])
const progress = ref(0)
const nn = ref(0)
const fps = ref(0)
const acc = ref(0)
const remain = ref(15)
const logs = ref("")
const metrics = ref("")
const isStarted = ref(false)
const counting = ref(false)
const countingSec = ref(3)
const tipFading = ref(false)
const aiAnalysing = ref(false)
const aiProgress = ref(0)
const showFaceGuideTip = ref(false)

// 變數
let userData = {}
let mediaRecorder = null
let recordedChunks = []
let scanInt = null
let metricInt = null
let stream = null
let faceDetectTimer = null
let hasRecorded = false
let elapsedMs = 0

// 頁面一載入就自動開啟鏡頭
onMounted(async () => {
  await initCamera()
  // 產生速度線動畫
  const speedLines = document.querySelector(".speedLines")
  if (speedLines && speedLines.children.length === 0) {
    for (let i = 0; i < 8; i++) {
      const line = document.createElement("div")
      line.className = "speed-line"
      line.style.top = `${i * 60}px`
      line.style.width = `${Math.random() * 200 + 100}px`
      line.style.animationDelay = `${(Math.random() * 0.8).toFixed(2)}s`
      line.style.animationDuration = `${(Math.random() * 0.4 + 0.6).toFixed(2)}s`
      speedLines.appendChild(line)
    }
  }
})

// 驗證 userData
function checkUserData() {
  try {
    const str = localStorage.getItem("userData")
    if (!str) throw new Error("localStorage 缺少 userData")
    userData = JSON.parse(str)
    if (!userData.Mobile || !userData.Height || !userData.Weight)
      throw new Error("userData 格式不完整")
  } catch (err) {
    alert("讀取使用者資料失敗，請重新登入")
    throw err
  }
}

// 初始化相機
async function initCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: true,
    })
    videoElement.value.srcObject = stream
    mediaRecorder = new MediaRecorder(stream)
    mediaRecorder.ondataavailable = (e) =>
      e.data.size > 0 && recordedChunks.push(e.data)
    mediaRecorder.onstop = onRecordStop
  } catch (err) {
    alert("無法啟動相機/麥克風")
  }
}

// 安全數值轉換
function num(x) {
  if (x === undefined || x === null || x === "--") return null
  const n = Number(x)
  return isNaN(n) ? null : n
}

// 倒數動畫
function startCountdown(sec, cb) {
  if (counting.value) return
  counting.value = true
  countingSec.value = sec
  const t = setInterval(() => {
    countingSec.value--
    if (countingSec.value < 0) {
      clearInterval(t)
      counting.value = false
      cb()
    }
  }, 1000)
}

// 錄影結束
async function onRecordStop() {
  aiAnalysing.value = true
  const blob = new Blob(recordedChunks, { type: "video/webm" })
  const reader = new FileReader()
  reader.onloadend = () => sendToAPI(reader.result.split(",")[1])
  reader.readAsDataURL(blob)
  if (stream) stream.getTracks().forEach((t) => t.stop())
}

// 上傳 API
async function sendToAPI(base64) {
  const payload = {
    uuid: userData.Mobile,
    height: userData.Height,
    weight: userData.Weight,
    content: base64,
  }
  try {
    const res = await fetch(
      "https://face.zconai.com/api/v1.0/measure/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )

    try {
      const gdata = await res.json()
      console.log("API 原始回傳資料:", gdata)
      const data = JSON.parse(gdata)
      console.log("API 原始回傳資料after parse:", data)
      
      // 統一安全解析
      const hbr = num(data.hbr?.[0])
      const hrv = data.hrv?.[0] || {}
      const sdnn = num(hrv.SDNN)
      const LF = num(hrv.LF)
      const HF = num(hrv.HF)
      let lf_hf = num(hrv["LF/HF"])
      if (lf_hf === null && LF && HF) lf_hf = LF / HF
      const sbp = num(data.ica?.[0]?.SBP)
      const dbp = num(data.ica?.[0]?.DBP)
      const spo2 = data.sp?.[0] || "--"
      const rr = num(data.rr?.[0])
      const af = data.af?.[0] || "--"
      const fa = data.fa?.[0] || "--"

      // 取得 userData
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")

      // 組合 HRV3Save 參數
      const hrv3Payload = {
        MID: userData.MID || "",
        MAID: userData.MAID || "",
        Token: userData.Token || "",
        Mobile: userData.Mobile || "",
        UID: userData.UID || "",
        HRVCalTime: userData.HRVCalTime || "",
        Flag: "",
        hbr: hbr?.toString() || "",
        rmssd: hrv.RMSSD?.toString() || "",
        sdnn: sdnn?.toString() || "",
        lf: LF?.toString() || "",
        hf: HF?.toString() || "",
        lf_hf: lf_hf?.toString() || "",
        sbp: sbp?.toString() || "",
        dbp: dbp?.toString() || "",
        spo2: spo2?.toString() || "",
        af: af?.toString() || "",
        rr: rr?.toString() || "",
        fa: fa?.toString() || "",
      }

      // 呼叫 HRV3Save API
      const saveResult = await saveHRV3ToServer(hrv3Payload)
      if (saveResult && saveResult.AID) {
        navigateTo(`/Finish?AID=${saveResult.AID}`)
      } else {
        navigateTo('/Finish')
      }

    } catch (e) {
      aiAnalysing.value = false
      console.error("解析錯誤:", e)
    }
  } catch (err) {
    aiAnalysing.value = false
    console.error("API 錯誤:", err)
    alert(err.message)
  }
}

// 開始錄影
function startRecording() {
  recordedChunks = []
  mediaRecorder.start()
  scanning.value = true
  progress.value = 0
  remain.value = 15
  let percent = 0
  scanInt = setInterval(() => {
    if (mediaRecorder.state === "recording") {
      elapsedMs += 200
      percent = Math.min(100, (elapsedMs / 15000) * 100)
      progress.value = percent
      remain.value = Math.max(0, Math.ceil(((100 - percent) * 15) / 100))
      if (percent >= 100) {
        clearInterval(scanInt)
        mediaRecorder.stop()
        scanning.value = false
        hasRecorded = true
      }
    }
  }, 200)
  startMetrics()
}

// 指標動畫
function startMetrics() {
  if (metricInt) clearInterval(metricInt)
  metricInt = setInterval(() => {
    nn.value = Math.floor(Math.random() * 20) + 80
    fps.value = Math.floor(Math.random() * 10) + 25
    acc.value = Math.floor(Math.random() * 5) + 95
  }, 500)
}

// 啟動人臉偵測
async function startFaceDetection() {
  const options = new faceapi.TinyFaceDetectorOptions()
  let faceInside = false
  faceDetectTimer = setInterval(async () => {
    if (hasRecorded) return
    const detection = await faceapi.detectSingleFace(
      videoElement.value,
      options
    )
    if (detection) {
      const box = detection.box
      faces.value = [
        {
          x: box.x,
          y: box.y,
          w: box.width,
          h: box.height,
          c: detection.score,
        },
      ]
      const cx = box.x + box.width / 2
      const cy = box.y + box.height / 2
      const inside = cx > 192 && cx < 448 && cy > 120 && cy < 360
      if (mediaRecorder && mediaRecorder.state === "paused") {
        showFaceGuideTip.value = true
      } else {
        showFaceGuideTip.value = false
      }
      if (inside && !scanning.value && mediaRecorder.state === "inactive") {
        faceInside = true
        startCountdown(3, () => {
          if (mediaRecorder.state === "inactive" && !hasRecorded) {
            startRecording()
          }
        })
      } else if (!inside && mediaRecorder.state === "recording") {
        faceInside = false
        mediaRecorder.pause()
      } else if (inside && mediaRecorder.state === "paused") {
        mediaRecorder.resume()
      }
    } else {
      faces.value = []
      showFaceGuideTip.value = false
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.pause()
      }
    }
  }, 300)
}

// 按鈕觸發
async function startBtnClick() {
  isStarted.value = true
  checkUserData()
  await initCamera()
  await faceapi.nets.tinyFaceDetector.loadFromUri(
    "https://justadudewhohacks.github.io/face-api.js/models"
  )
  startFaceDetection()
}

// 監控狀態自動觸發淡入淡出動畫
watch(
  [counting, scanning],
  ([newCounting, newScanning], [oldCounting, oldScanning]) => {
    tipFading.value = true
    setTimeout(() => {
      tipFading.value = false
    }, 500)
  }
)

onUnmounted(() => {
  if (stream) stream.getTracks().forEach((t) => t.stop())
  if (metricInt) clearInterval(metricInt)
  if (scanInt) clearInterval(scanInt)
  if (faceDetectTimer) clearInterval(faceDetectTimer)
})

async function saveHRV3ToServer(data) {
  try {
    const res = await fetch("https://23700999.com:8081/HMA/api/fr/HRV3Save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    console.log("HRV3Save 回傳：", result)
    return result
  } catch (err) {
    console.error("HRV3Save API 錯誤：", err)
    return null
  }
}
</script>

<style lang="scss" scoped>
// 變數定義
$primary-color: #1fbcb3;
$background-color: #050709;
$text-color: #fff;
$error-color: #ec4f4f;
$border-radius: 20px;
$transition-duration: 0.3s;

// 混合器
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-column {
  display: flex;
  flex-direction: column;
}

@mixin gradient-background {
  background: linear-gradient(135deg, rgba($primary-color, 0.1), rgba($primary-color, 0.05));
}

@mixin glow-effect {
  box-shadow: 0 0 50px rgba($primary-color, 0.3),
    inset 0 0 50px rgba($primary-color, 0.1);
}

// 主要樣式
.HRVTest {
  background: $background-color;
  min-height: 100vh;
  width: 100%;
  @include flex-column;
  align-items: center;
  justify-content: center;
  font-family: "Orbitron", monospace;
  color: $primary-color;
}

.scanWrap {
  width: 100%;
  max-width: 800px;
  height: 100vh;
  padding: 1rem;
  display: grid;
  grid-template-rows: 1fr min-content;
}

.ai-scanner-system {
  @include flex-column;
  position: relative;
  width: 100%;
  height: 100%;
  @include gradient-background;
  border: 2px solid $primary-color;
  border-radius: $border-radius;
  @include glow-effect;
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.scanner-header {
  position: absolute;
  inset: 0 0 auto 0;
  background: linear-gradient(90deg, rgba($primary-color, 0.2), rgba($primary-color, 0.1));
  border-bottom: 1px solid rgba($primary-color, 0.5);
  @include flex-center;
  justify-content: space-between;
  padding: 16px 30px;
  z-index: 10;
}

.system-title {
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 2px;
  text-shadow: 0 0 10px $primary-color;
}

.video-container {
  position: relative;
  overflow: hidden;
  background: #000;
  height: 100%;

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.face-blur-mask {
  position: absolute;
  inset: 0;
  pointer-events: none;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.25);
  opacity: 1;
  --cx: 50%;
  --cy: 50%;
  --rx: 100px;
  --ry: 125px;
  -webkit-mask-image: radial-gradient(
    ellipse var(--rx) var(--ry) at var(--cx) var(--cy),
    transparent 98%,
    black 100%
  );
  mask-image: radial-gradient(
    ellipse var(--rx) var(--ry) at var(--cx) var(--cy),
    transparent 98%,
    black 100%
  );
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.face-guide {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 250px;
  transform: translate(-50%, -50%);
  border: 2px solid rgba($primary-color, 0.5);
  border-radius: 50%;
  background: rgba($primary-color, 0.03);
  animation: guideGlow 4s ease-in-out infinite;
}

.face-guide-tip {
  position: absolute;
  left: 50%;
  top: calc(50% + 140px);
  transform: translateX(-50%);
  font-size: 16px;
  font-weight: 700;
  color: $primary-color;
  text-shadow: 0 0 8px $background-color;
  white-space: nowrap;
  z-index: 30;
  pointer-events: none;
  display: none;

  &.show {
    display: block;
  }
}

.scanning-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.scan-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba($primary-color, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba($primary-color, 0.08) 1px, transparent 1px);
  background-size: 25px 25px;
  animation: gridFlow 8s linear infinite;
}

.scan-beam {
  position: absolute;
  width: 100%;
  height: 4px;
  left: 0;
  top: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba($primary-color, 0.6) 30%,
    #fff 50%,
    rgba($primary-color, 0.6) 70%,
    transparent
  );
  box-shadow: 0 0 20px rgba($primary-color, 0.6),
    0 0 40px rgba($primary-color, 0.4);
  animation: scanBeam 3s ease-in-out infinite;
}

.progress-section {
  position: relative;
  background: rgba($primary-color, 0.1);
  border: 1px solid rgba($primary-color, 0.3);
  border-radius: 10px;
  margin: 1rem;
  padding: 15px;
  @include flex-center;
  gap: 20px;
}

.progress-text {
  color: $primary-color;
  font-size: 1.8rem;
  min-width: 90px;
  text-align: right;
  font-family: Orbitron;
  font-weight: 900;
  letter-spacing: 2px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba($primary-color, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $primary-color, $primary-color);
}

.HRVFirstCover {
  background-color: $background-color;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  @include flex-column;
  align-items: center;
  justify-content: center;

  img {
    max-width: 175px;
  }

  ul {
    list-style: disc;
    padding: 0;
    margin: 0;
    color: $text-color;
    @include flex-column;
    width: 80%;
    justify-content: center;
    margin-left: 1.25rem;

    li {
      margin-bottom: 10px;
      color: $text-color;
      font-size: 1.5rem;

      span {
        color: $error-color;
      }
    }
  }

  &.fadeOut {
    animation: hrvcoverFadeOut 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
}

.action-tip {
  position: relative;
  background: $background-color;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba($primary-color, 0.27);
  transition: background $transition-duration;
  @include flex-center;
  justify-content: flex-start;
  min-height: 80px;
  min-width: 220px;
  padding: 10px 20px;
  border: 2px solid $primary-color;
  margin-top: 20px;
}

.tip-text {
  font-size: 1.5rem;
  color: $primary-color;
  white-space: nowrap;
  text-shadow: 0px 0px 2px #fcfff7;
  font-weight: 700;
  letter-spacing: 2.4px;
  margin-left: 10px;
  transition: opacity $transition-duration;

  &.left-align {
    text-align: left;
    margin-left: 0;
    width: 100%;
    display: block;
  }
}

.startBtn {
  cursor: pointer;
  transition: opacity $transition-duration;

  &:hover {
    text-shadow: $primary-color 0px 0px 24px;
  }
}

.AIAnalysisCover {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: $background-color;
  z-index: 9999;
  @include flex-column;
  align-items: center;
  justify-content: center;

  img {
    max-width: 175px;
  }
}

.AIAnalysisCover-title {
  font-size: 1.5rem;
  color: $primary-color;
  white-space: nowrap;
  text-shadow: 0px 0px 2px #fcfff7;
  font-weight: 700;
  letter-spacing: 2.4px;
  margin-left: 10px;
  transition: opacity $transition-duration;
}

.countdown {
  position: absolute;
  inset: 0;
  @include flex-center;
  font-size: 96px;
  font-weight: 900;
  color: $primary-color;
  text-shadow: 0 0 20px $primary-color;
  background: rgba(0, 0, 0, 0.4);
  z-index: 20;
}

// 動畫定義
@keyframes guideGlow {
  0%, 100% {
    box-shadow: 0 0 15px rgba($primary-color, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba($primary-color, 0.4);
  }
}

@keyframes gridFlow {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(25px, 25px);
  }
}

@keyframes scanBeam {
  0% {
    top: 0;
  }
  100% {
    top: calc(100% - 4px);
  }
}

@keyframes hrvcoverFadeOut {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-80px) scale(0.98);
    pointer-events: none;
  }
}

// 響應式設計
@media screen and (max-width: 1024px) {
  .ai-scanner-system {
    width: 70vw;
    min-height: 400px;
  }

  .face-guide {
    width: 180px;
    height: 220px;
  }
}

@media screen and (max-width: 576px) {
  .ai-scanner-system {
    width: 80vw;
    min-height: 60vh;
  }

  .face-guide {
    width: 180px;
    height: 220px;
  }

  .system-title {
    text-align: center;
    font-size: 1.25rem;
  }

  .progress-text {
    font-size: 1.25rem;
    min-width: 0px;
  }
}
</style>
