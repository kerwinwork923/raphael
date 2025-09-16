<template>
  <div class="HRVTest">
    <div class="scanWrap">
      <!-- 初始遮罩 -->
      <div
        class="HRVFirstCover"
        id="hrvFirstCover"
        v-if="!isStarted"
        @click="startBtnClick"
      >
        <img
          src="/vital/images/new/ball.gif"
          alt="開始檢測"
          id="start"
          :style="{
            cursor: scanning ? 'not-allowed' : 'pointer',
            opacity: scanning ? 0.5 : 1,
            width: '80px',
          }"
          :disabled="scanning"
        />
        <ul>
          <li>
            系統將在倒數<span> 3秒 </span
            >後開始偵測，請讓臉部完整對準畫面並保持不動。
          </li>
          <li><span>量測時間約 25秒</span>，完成後將顯示檢測結果。</li>
          <li>感謝您的配合！</li>
        </ul>
        <button type="button">點擊開始體驗</button>
      </div>

      <!-- 掃描系統 -->
      <div class="ai-scanner-system" v-show="isStarted">
        <div class="scanner-header">
          <div class="system-title">AI FACE SCANNER v2.0</div>
          <button type="button" class="returnBtn" @click="goBack">返回</button>
        </div>

        <div class="video-container">
          <video ref="videoElement" autoplay muted playsinline></video>
          <div class="face-blur-mask" :class="{ active: showBlurMask }"></div>
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
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
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
            background: 'none',
            boxShadow: 'none',
            border: 'none',
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
import { ref, onMounted, onUnmounted, watch } from "vue";
import * as faceapi from "@vladmandic/face-api";
import Navbar from "../components/Navbar.vue";
import { useRoute } from "vue-router";
import { useMediaCleanup } from "../composables/useMediaCleanup";

// Refs
const route = useRoute();
const videoElement = ref(null);
const scanning = ref(false);
const faces = ref([]);
const progress = ref(0);
const nn = ref(0);
const fps = ref(0);
const acc = ref(0);
const remain = ref(25);
const logs = ref("");
const metrics = ref("");
const isStarted = ref(false);
const counting = ref(false);
const countingSec = ref(3);
const tipFading = ref(false);
const aiAnalysing = ref(false);
const aiProgress = ref(0);
const showFaceGuideTip = ref(false);
const showBlurMask = ref(false);

// 變數
let userData = {};
let mediaRecorder = null;
let recordedChunks = [];
let scanInt = null;
let metricInt = null;
let stream = null;
let faceDetectTimer = null;
let hasRecorded = false;
let elapsedMs = 0;

// 使用媒體清理工具
const { forceStopAllMedia } = useMediaCleanup();

// 頁面可見性變化處理
const handleVisibilityChange = async () => {
  if (document.hidden) {
    console.log("頁面進入背景，停止錄影和相機");

    // 通知 Service Worker
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "VISIBILITY_CHANGE",
        hidden: true,
      });
    }

    // 使用穩定的停止方法關閉錄影
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      await stopRecorder(mediaRecorder);
    }

    // 使用強力媒體清理工具
    forceStopAllMedia();

    // 清除所有計時器
    if (metricInt) clearInterval(metricInt);
    if (scanInt) clearInterval(scanInt);
    if (faceDetectTimer) clearInterval(faceDetectTimer);

    // 重置狀態
    scanning.value = false;
    counting.value = false;
    isStarted.value = false;
    aiAnalysing.value = false;
    progress.value = 0;
    elapsedMs = 0;
    hasRecorded = false;

    // 清除本地變數
    mediaRecorder = null;
    stream = null;

    // 清除 video 元素
    if (videoElement.value) {
      videoElement.value.srcObject = null;
    }
  }
};

// 處理 Service Worker 訊息
const handleServiceWorkerMessage = async (event) => {
  if (event.data && event.data.type === "STOP_RECORDING") {
    console.log("收到 Service Worker 停止錄影指令:", event.data.reason);
    await handleVisibilityChange();
  }
};

// 處理強制關閉媒體事件
const handleForceStopMedia = async (event) => {
  console.log("收到強制關閉媒體事件:", event.detail);
  await handleVisibilityChange();
};

// 頁面一載入就自動開啟鏡頭
onMounted(async () => {
  // 添加頁面可見性變化監聽器
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // 添加 Service Worker 訊息監聽器
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener(
      "message",
      handleServiceWorkerMessage
    );
  }

  // 添加強制關閉媒體事件監聽器
  window.addEventListener("force-stop-media", handleForceStopMedia);

  await initCamera();
  // 產生速度線動畫
  const speedLines = document.querySelector(".speedLines");
  if (speedLines && speedLines.children.length === 0) {
    for (let i = 0; i < 8; i++) {
      const line = document.createElement("div");
      line.className = "speed-line";
      line.style.top = `${i * 60}px`;
      line.style.width = `${Math.random() * 200 + 100}px`;
      line.style.animationDelay = `${(Math.random() * 0.8).toFixed(2)}s`;
      line.style.animationDuration = `${(Math.random() * 0.4 + 0.6).toFixed(
        2
      )}s`;
      speedLines.appendChild(line);
    }
  }
});

// 驗證 userData
function checkUserData() {
  try {
    const str = localStorage.getItem("userData");
    if (!str) throw new Error("localStorage 缺少 userData");
    userData = JSON.parse(str);
    if (!userData.Mobile || !userData.Member.Height || !userData.Member.Weight)
      throw new Error("userData 格式不完整");
  } catch (err) {
    alert("讀取使用者資料失敗，請重新登入");
    throw err;
  }
}

// 從 URL 獲取參數
function getUrlParams() {
  const uid = route.query.UID || "";
  const flag = route.query.flag || "";
  const form = route.query.form || "";
  return { uid, flag, form };
}

// 初始化相機
async function initCamera() {
  try {
    // 如果已經在錄影，不要重複初始化
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      console.log("MediaRecorder 已在錄影中，跳過初始化");
      return;
    }

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: true,
    });
    videoElement.value.srcObject = stream;
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) =>
      e.data.size > 0 && recordedChunks.push(e.data);
    mediaRecorder.onstop = onRecordStop;
  } catch (err) {
    alert("無法啟動相機/麥克風");
  }
}

// 安全數值轉換
function num(x) {
  if (x === undefined || x === null || x === "--") return null;
  const n = Number(x);
  return isNaN(n) ? null : n;
}

// 倒數動畫
function startCountdown(sec, cb) {
  if (counting.value) return;
  counting.value = true;
  countingSec.value = sec;
  const t = setInterval(() => {
    countingSec.value--;
    if (countingSec.value < 0) {
      clearInterval(t);
      counting.value = false;
      cb();
    }
  }, 1000);
}

// 錄影結束
async function onRecordStop() {
  aiAnalysing.value = true;

  // 先把資料取完
  const blob = new Blob(recordedChunks, { type: "video/webm" });
  recordedChunks = [];

  // 清掉進度 / UI
  scanning.value = false;
  counting.value = false;
  progress.value = 100;
  hasRecorded = true;

  // 關閉攝影機
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    stream = null;
  }

  // 清除 video 元素
  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }

  // 清除所有計時器
  if (metricInt) clearInterval(metricInt);
  if (scanInt) clearInterval(scanInt);
  if (faceDetectTimer) clearInterval(faceDetectTimer);

  // 重置狀態
  isStarted.value = false;
  elapsedMs = 0;

  // 清除本地變數
  mediaRecorder = null;

  // 送 API
  const reader = new FileReader();
  reader.onloadend = () => sendToAPI(reader.result.split(",")[1]);
  reader.readAsDataURL(blob);
}

// 上傳 API
async function sendToAPI(base64) {
  const payload = {
    uuid: userData.Mobile,
    height: userData.Member.Height,
    weight: userData.Member.Weight,
    content: base64,
  };
  try {
    const res = await fetch("https://face.zconai.com/api/v1.0/measure/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    try {
      const gdata = await res.json();
      console.log("API 原始回傳資料:", gdata);
      const data = JSON.parse(gdata);
      console.log("API 原始回傳資料after parse:", data);

      // 統一安全解析
      const hbr = num(data.hbr?.[0]);
      const hrv = data.hrv?.[0] || {};
      const sdnn = num(hrv.SDNN);
      const LF = num(hrv.LF);
      const HF = num(hrv.HF);
      let lf_hf = num(hrv["LF/HF"]);
      if (lf_hf === null && LF && HF) lf_hf = LF / HF;
      const sbp = num(data.ica?.[0]?.SBP);
      const dbp = num(data.ica?.[0]?.DBP);
      const spo2 = data.sp?.[0] || "--";
      const rr = num(data.rr?.[0]);
      const af = data.af?.[0] || "--";
      const fa = data.fa?.[0] || "--";

      // 取得 userData
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");

      // 組合 HRV3Save 參數
      const hrv3Payload = {
        MID: userData.MID || "",
        MAID: userData.MAID || "",
        Token: userData.Token || "",
        Mobile: userData.Mobile || "",
        UID: "",
        HRVCalTime: userData.Member.HRVCalTime || "",
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
      };

      // 呼叫 HRV3Save API
      const saveResult = await saveHRV3ToServer(hrv3Payload);
      if (saveResult && saveResult.AID) {
        window.location.href = `/Finish?AID=${saveResult.AID}`;
      } else {
        window.location.href = "/Finish";
      }
    } catch (e) {
      aiAnalysing.value = false;
      console.error("解析錯誤:", e);
    }
  } catch (err) {
    aiAnalysing.value = false;
    console.error("API 錯誤:", err);
    alert(err.message);
  }
}

// 穩定的停止錄影器函數
function stopRecorder(recorder) {
  return new Promise((resolve) => {
    if (!recorder || recorder.state === "inactive") {
      resolve();
      return;
    }

    const handleStop = () => {
      recorder.removeEventListener("stop", handleStop);
      resolve();
    };

    recorder.addEventListener("stop", handleStop, { once: true });
    recorder.stop();
  });
}

// 開始錄影
async function startRecording() {
  recordedChunks = [];
  mediaRecorder.start();
  scanning.value = true;
  progress.value = 0;
  remain.value = 25;
  showBlurMask.value = false; // 開始掃描時隱藏模糊遮罩
  let percent = 0;
  scanInt = setInterval(async () => {
    if (mediaRecorder.state === "recording") {
      elapsedMs += 200;
      percent = Math.min(100, (elapsedMs / 25000) * 100);
      progress.value = percent;
      remain.value = Math.max(0, Math.ceil(((100 - percent) * 25) / 100));
      if (percent >= 100) {
        clearInterval(scanInt);
        // 使用穩定的停止方法
        await stopRecorder(mediaRecorder);
        scanning.value = false;
        hasRecorded = true;
      }
    }
  }, 200);
  startMetrics();
}

// 指標動畫
function startMetrics() {
  if (metricInt) clearInterval(metricInt);
  metricInt = setInterval(() => {
    nn.value = Math.floor(Math.random() * 20) + 80;
    fps.value = Math.floor(Math.random() * 10) + 25;
    acc.value = Math.floor(Math.random() * 5) + 95;
  }, 500);
}

// 返回上一頁
async function goBack() {
  // 使用穩定的停止方法
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    await stopRecorder(mediaRecorder);
  }

  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    stream = null;
  }

  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }

  window.history.back();
}

// 啟動人臉偵測
async function startFaceDetection() {
  const options = new faceapi.TinyFaceDetectorOptions();
  let faceInside = false;
  faceDetectTimer = setInterval(async () => {
    if (hasRecorded) return;
    const detection = await faceapi.detectSingleFace(
      videoElement.value,
      options
    );
    if (detection) {
      const box = detection.box;
      faces.value = [
        {
          x: box.x,
          y: box.y,
          w: box.width,
          h: box.height,
          c: detection.score,
        },
      ];
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;

      // 動態計算掃描範圍，與視覺掃描框對齊
      const videoWidth = videoElement.value.videoWidth || 640;
      const videoHeight = videoElement.value.videoHeight || 480;
      const containerWidth = videoElement.value.offsetWidth;
      const containerHeight = videoElement.value.offsetHeight;

      // 掃描框的實際尺寸（與 CSS 中的 .face-guide 對應）
      const guideWidth = 200;
      const guideHeight = 250;

      // 計算掃描框在視訊中的實際位置
      const guideLeft = (containerWidth - guideWidth) / 2;
      const guideTop = (containerHeight - guideHeight) / 2;
      const guideRight = guideLeft + guideWidth;
      const guideBottom = guideTop + guideHeight;

      // 將視訊座標轉換為容器座標
      const scaleX = containerWidth / videoWidth;
      const scaleY = containerHeight / videoHeight;
      const scaledCx = cx * scaleX;
      const scaledCy = cy * scaleY;

      // 檢查臉部是否在掃描框內
      const inside =
        scaledCx >= guideLeft &&
        scaledCx <= guideRight &&
        scaledCy >= guideTop &&
        scaledCy <= guideBottom;

      // 控制模糊遮罩和提示的顯示
      if (mediaRecorder && mediaRecorder.state === "paused") {
        showFaceGuideTip.value = true;
        showBlurMask.value = true;
      } else {
        showFaceGuideTip.value = false;
        showBlurMask.value = !inside; // 臉部不在掃描框內時顯示模糊遮罩
      }
      if (
        inside &&
        !scanning.value &&
        mediaRecorder.state === "inactive" &&
        !hasRecorded
      ) {
        faceInside = true;
        startCountdown(3, () => {
          if (mediaRecorder.state === "inactive" && !hasRecorded) {
            startRecording();
          }
        });
      } else if (!inside && mediaRecorder.state === "recording") {
        faceInside = false;
        mediaRecorder.pause();
      } else if (inside && mediaRecorder.state === "paused") {
        mediaRecorder.resume();
      }
    } else {
      faces.value = [];
      showFaceGuideTip.value = false;
      showBlurMask.value = true; // 沒有偵測到臉部時顯示模糊遮罩
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.pause();
      }
    }
  }, 300);
}

// 按鈕觸發
async function startBtnClick() {
  if (scanning.value) return;
  isStarted.value = true;
  checkUserData();
  await initCamera();
  await faceapi.nets.tinyFaceDetector.loadFromUri(
    "https://justadudewhohacks.github.io/face-api.js/models"
  );
  startFaceDetection();
}

// 監控狀態自動觸發淡入淡出動畫
watch(
  [counting, scanning],
  ([newCounting, newScanning], [oldCounting, oldScanning]) => {
    tipFading.value = true;
    setTimeout(() => {
      tipFading.value = false;
    }, 500);
  }
);

onUnmounted(async () => {
  // 移除頁面可見性變化監聽器
  document.removeEventListener("visibilitychange", handleVisibilityChange);

  // 移除 Service Worker 訊息監聽器
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.removeEventListener(
      "message",
      handleServiceWorkerMessage
    );
  }

  // 移除強制關閉媒體事件監聽器
  window.removeEventListener("force-stop-media", handleForceStopMedia);

  // 使用穩定的停止方法關閉錄影
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    await stopRecorder(mediaRecorder);
  }

  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    stream = null;
  }

  // 清除 video 元素
  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }

  // 清除所有計時器
  if (metricInt) clearInterval(metricInt);
  if (scanInt) clearInterval(scanInt);
  if (faceDetectTimer) clearInterval(faceDetectTimer);
});

async function saveHRV3ToServer(data) {
  try {
    const { uid, flag } = getUrlParams();
    const payload = {
      ...data,
      UID: uid,
      Flag: flag,
    };

    const res = await fetch("https://23700999.com:8081/HMA/api/fr/HRV3Save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    console.log("HRV3Save 回傳：", result);
    return result;
  } catch (err) {
    console.error("HRV3Save API 錯誤：", err);
    return null;
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
  background: linear-gradient(
    135deg,
    rgba($primary-color, 0.1),
    rgba($primary-color, 0.05)
  );
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
  gap: 1rem;
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
  background: linear-gradient(
    90deg,
    rgba($primary-color, 0.2),
    rgba($primary-color, 0.1)
  );
  border-bottom: 1px solid rgba($primary-color, 0.5);
  @include flex-center;
  justify-content: space-between;
  padding: 1rem;
  z-index: 10;
  .returnBtn {
    background: rgba($primary-color, 0.75);
    border: none;
    color: $text-color;
    border-radius: 8px;
    padding: 2px 8px;
    cursor: pointer;
    transition: all ease 0.2s;
    &:hover {
      box-shadow: 0 0 6px 0px $primary-color;
    }
  }
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
    transform: scaleX(-1); /* 水平翻轉鏡頭 */
  }
}

.face-blur-mask {
  position: absolute;
  inset: 0;
  pointer-events: none;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.25);
  opacity: 0; /* 預設隱藏模糊遮罩 */
  --cx: 50%;
  --cy: 50%;
  --rx: 100px;
  --ry: 125px;
  transform: scaleX(-1); /* 跟著視訊翻轉 */
  -webkit-mask-image: radial-gradient(
    ellipse var(--rx) var(--ry) at var(--cx) var(--cy),
    transparent 0%,
    transparent 98%,
    black 100%
  );
  mask-image: radial-gradient(
    ellipse var(--rx) var(--ry) at var(--cx) var(--cy),
    transparent 0%,
    transparent 98%,
    black 100%
  );
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  transition: opacity 0.3s ease;

  &.active {
    opacity: 1;
  }
}

.face-guide {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 250px;
  transform: translate(-50%, -50%) scaleX(-1); /* 跟著視訊翻轉 */
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
  text-align: center;
  transform-origin: center center;

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
  background-image: linear-gradient(
      rgba($primary-color, 0.08) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba($primary-color, 0.08) 1px, transparent 1px);
  background-size: 25px 25px;
  animation: gridFlow 8s linear infinite;
  transform: scaleX(-1); /* 跟著視訊翻轉 */
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
  transform: scaleX(-1); /* 跟著視訊翻轉 */
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
  gap: 1.5rem;
  cursor: pointer;

  img {
    max-width: 175px;
    pointer-events: none;
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
    pointer-events: none;

    li {
      margin-bottom: 10px;
      color: $text-color;
      font-size: 1.5rem;
      line-height: 1.3em;
      text-align: justify;

      span {
        color: $error-color;
      }
    }
  }

  & > button {
    background: rgba(31, 188, 179, 0.4);
    border: 1px solid $raphael-cyan-400;
    border-radius: 0.5rem;
    color: $raphael-cyan-400;
    cursor: pointer;
    font-size: 1.5rem;
    font-weight: bold;
    width: 80%;
    padding: 0.5rem 0.75rem;
    letter-spacing: 3px;
    transition: all ease 0.2s;
  }

  &:hover {
    & > button {
      text-shadow: 0px 0px 4px #fcfff7;
    }
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
  gap: 1rem;
  min-height: 80px;
  min-width: 220px;
  padding: 0 20px;
  border: 2px solid $primary-color;
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
  0%,
  100% {
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

@media screen and (max-width: 576px) {
  .system-title {
    text-align: center;
    font-size: 1.25rem;
  }

  .progress-text {
    font-size: 1.25rem;
    min-width: 0px;
  }
}

@media (orientation: landscape) and (max-height: 480px) {
  .scanWrap {
    grid-auto-flow: column;
    grid-template-columns: 1fr min-content;
    grid-template-rows: auto;
  }
  .action-tip {
    flex-direction: column;
    justify-content: center;
  }
}
</style>