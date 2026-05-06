<template>
  <div class="qrcode-page">
    <!-- Ambient background -->
    <div class="ambient" aria-hidden="true">
      <div class="ambient-orb orb-1"></div>
      <div class="ambient-orb orb-2"></div>
      <div class="ambient-orb orb-3"></div>
      <div class="grid-overlay"></div>
      <div class="scanline"></div>
    </div>

    <main class="shell">
      <!-- Header -->
      <header class="hero">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          WiseBalance Check-in System
        </div>
        <h1 class="hero-title">
          來賓報到
          <span class="title-accent">掃描專區</span>
        </h1>
   
      </header>

      <!-- Main content -->
      <div class="layout">

        <!-- Left: Scanner panel -->
        <section class="panel scanner-panel">
          <div class="panel-header">
            <div class="panel-title-group">
              <span class="panel-eyebrow">Camera</span>
              <h2 class="panel-title">掃描器</h2>
            </div>
            <div class="scan-pill" :class="{ active: isScanning }">
              <span class="scan-pill-dot"></span>
              {{ isScanning ? '掃描中' : '待機中' }}
            </div>
          </div>

          <!-- Viewfinder -->
          <div class="viewfinder-wrap">
            <div class="viewfinder" :class="{ scanning: isScanning }">
              <div class="corner c-tl"></div>
              <div class="corner c-tr"></div>
              <div class="corner c-bl"></div>
              <div class="corner c-br"></div>
              <div class="scan-beam" v-if="isScanning"></div>
              <div id="reader"></div>
              <div class="viewfinder-idle" v-if="!isScanning">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
                  <rect x="7" y="7" width="10" height="10" rx="1"/>
                </svg>
                <span>點擊「開始掃描」啟動鏡頭</span>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="status-bar" :class="statusType">
            <div class="status-icon">
              <svg v-if="statusType === 'ok'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else-if="statusType === 'err'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <span>{{ statusText }}</span>
          </div>

          <!-- Controls -->
          <div class="controls">
            <button class="btn btn-primary" :disabled="isScanning" @click="startScan">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              開始掃描
            </button>
            <button class="btn btn-ghost" :disabled="!isScanning" @click="stopScan">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              暫停掃描
            </button>
            <button class="btn btn-ghost" :disabled="!canSwitchCamera || !isScanning" @click="switchCamera">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              切換鏡頭
            </button>
            <button class="btn btn-danger" @click="clearLogs">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              清除紀錄
            </button>
          </div>

          <!-- Hint -->
          <div class="hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            將 QRCode 對準鏡頭中央，系統自動辨識並完成報到
          </div>
        </section>

        <!-- Right: Records panel -->
        <section class="panel records-panel">
          <div class="panel-header">
            <div class="panel-title-group">
              <span class="panel-eyebrow">Scan Records</span>
              <h2 class="panel-title">掃描紀錄</h2>
            </div>
            <div class="count-chip">
              <span class="count-num">{{ logs.length }}</span>
              <span class="count-label">筆</span>
            </div>
          </div>

          <div class="records-body">
            <TransitionGroup name="record-list" tag="div" class="records-list" v-if="logs.length">
              <article
                class="record-card"
                v-for="(item, idx) in logs"
                :key="`${item.text}-${item.time}-${idx}`"
                :class="{ duplicate: item.duplicate }"
              >
                <div class="record-num">#{{ logs.length - idx }}</div>
                <div class="record-info">
                  <p class="record-text">{{ item.text }}</p>
                  <time class="record-time">{{ item.time }}</time>
                </div>
                <span class="record-badge" :class="{ dup: item.duplicate }">
                  <svg v-if="!item.duplicate" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  {{ item.duplicate ? '重複' : '成功' }}
                </span>
              </article>
            </TransitionGroup>

            <div class="empty-state" v-else>
              <div class="empty-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="3" height="3"/>
                  <rect x="19" y="14" width="2" height="2"/>
                  <rect x="14" y="19" width="2" height="2"/>
                  <rect x="18" y="19" width="3" height="2"/>
                </svg>
              </div>
              <p>尚無掃描紀錄</p>
              <span>完成第一次掃描後，紀錄將顯示於此</span>
            </div>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { Html5Qrcode } from "html5-qrcode";

interface ScanLog {
  text: string;
  time: string;
  duplicate: boolean;
}

interface CameraItem {
  id: string;
  label: string;
}

const CHECKIN_API = "https://23700999.com:8081/HMA/000TTEupdateQRCodeCheck.jsp";
const CHECKIN_KEY = "qrt897hpmd";

const scanner = ref<Html5Qrcode | null>(null);
const cameras = ref<CameraItem[]>([]);
const currentCameraIndex = ref(0);
const isScanning = ref(false);
const isProcessingScan = ref(false);
const logs = ref<ScanLog[]>([]);
const scannedSet = ref(new Set<string>());
const statusText = ref("尚未開始掃描");
const statusType = ref<"default" | "ok" | "err">("default");

const canSwitchCamera = computed(() => cameras.value.length > 1);

const scanConfig = {
  fps: 10,
  aspectRatio: 1.0,
  qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
    const size = Math.floor(Math.min(300, minEdge * 0.72));
    return { width: size, height: size };
  },
};

function nowString() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function updateStatus(text: string, type: "default" | "ok" | "err" = "default") {
  statusText.value = text;
  statusType.value = type;
}

function cameraFacingText() {
  if (!cameras.value.length) return "";
  const label = (cameras.value[currentCameraIndex.value]?.label || "").toLowerCase();
  if (label.includes("back") || label.includes("environment")) return "後鏡頭";
  if (label.includes("front") || label.includes("user")) return "前鏡頭";
  return `鏡頭 ${currentCameraIndex.value + 1}`;
}

async function ensureCameras() {
  if (cameras.value.length) return;
  const list = (await Html5Qrcode.getCameras()) as CameraItem[];
  if (!list?.length) throw new Error("找不到可用相機");
  cameras.value = list;

  let backIndex = list.findIndex((c) => {
    const label = (c.label || "").toLowerCase();
    return label.includes("back") || label.includes("environment");
  });
  if (backIndex < 0) backIndex = 0;
  currentCameraIndex.value = backIndex;
}

function initScanner() {
  if (!scanner.value) {
    scanner.value = new Html5Qrcode("reader", false);
  }
}

function extractFields(decodedText: string) {
  let aid: string | null = null;
  let name: string | null = null;

  try {
    const url = new URL(decodedText);
    aid = url.searchParams.get("AID") || url.searchParams.get("aid");
    name = url.searchParams.get("name");
  } catch {}

  if (!aid) {
    const aidMatch = decodedText.match(/AID=([^&]+)/i);
    if (aidMatch) aid = aidMatch[1];
  }

  if (!name) {
    const nameMatch = decodedText.match(/name=([^&]+)/i);
    if (nameMatch) name = decodeURIComponent(nameMatch[1]);
  }

  return { aid, name };
}

async function logEvent(aid: string, name: string, checkinTime: string) {
  const payload = {
    Key: CHECKIN_KEY,
    AID: aid,
    Name: name,
    Qrcodecheck: "true",
    Qrcodetime: checkinTime,
  };

  const response = await fetch(CHECKIN_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return true;
}

async function onScanSuccess(decodedText: string) {
  if (isProcessingScan.value || !scanner.value) return;
  isProcessingScan.value = true;

  if (isScanning.value) await stopScan();

  const time = nowString();
  const duplicate = scannedSet.value.has(decodedText);
  logs.value.unshift({ text: decodedText, time, duplicate });
  if (!duplicate) scannedSet.value.add(decodedText);

  const { aid, name } = extractFields(decodedText);
  if (!aid) {
    updateStatus("找不到 AID 參數，請確認 QRCode 內容", "err");
    alert("QRCode 內容缺少 AID，請確認是否為正確報到碼。");
    isProcessingScan.value = false;
    await restartScanAfterDialog();
    return;
  }

  const displayName = name || "來賓";
  updateStatus(`已掃描 AID=${aid}（${displayName}），送出報到中…`, "ok");

  try {
    await logEvent(aid, displayName, time);
    alert(`報到成功！\n${displayName} 已完成報到`);
    updateStatus(`${displayName} 報到成功，請掃描下一位`, "ok");
  } catch (error) {
    console.error("報到 API 失敗:", error);
    alert("報到失敗，請再試一次");
    updateStatus("報到送出失敗", "err");
  } finally {
    isProcessingScan.value = false;
    await restartScanAfterDialog();
  }
}

function onScanFailure() {}

async function startScan() {
  if (isScanning.value) return;
  try {
    initScanner();
    await ensureCameras();
    await scanner.value?.start(
      cameras.value[currentCameraIndex.value].id,
      scanConfig,
      onScanSuccess,
      onScanFailure
    );
    isScanning.value = true;
    updateStatus(`正在掃描中（${cameraFacingText()}）`, "ok");
  } catch (error) {
    console.error("啟動掃描失敗:", error);
    updateStatus("啟動相機失敗，請確認權限與 HTTPS", "err");
  }
}

async function stopScan() {
  if (!isScanning.value || !scanner.value) return;
  try {
    await scanner.value.stop();
    isScanning.value = false;
    updateStatus("已暫停掃描");
  } catch (error) {
    console.error("停止掃描失敗:", error);
    updateStatus("停止掃描失敗", "err");
  }
}

async function switchCamera() {
  if (!canSwitchCamera.value || !isScanning.value || !scanner.value) return;
  try {
    await scanner.value.stop();
    isScanning.value = false;
    currentCameraIndex.value = (currentCameraIndex.value + 1) % cameras.value.length;
    await scanner.value.start(
      cameras.value[currentCameraIndex.value].id,
      scanConfig,
      onScanSuccess,
      onScanFailure
    );
    isScanning.value = true;
    updateStatus(`已切換鏡頭（${cameraFacingText()}）`, "ok");
  } catch (error) {
    console.error("切換鏡頭失敗:", error);
    updateStatus("切換鏡頭失敗", "err");
  }
}

function clearLogs() {
  logs.value = [];
  scannedSet.value.clear();
  updateStatus("掃描紀錄已清除");
}

async function restartScanAfterDialog() {
  try {
    await startScan();
  } catch (error) {
    console.error("重新啟動掃描失敗:", error);
  }
}

onBeforeUnmount(async () => {
  if (scanner.value && isScanning.value) {
    try {
      await scanner.value.stop();
    } catch {}
  }
});
</script>

<style scoped lang="scss">
/* ── Tokens ─────────────────────────────────────────── */
:root {
  /* Backgrounds */
  --bg-base: #060c18;
  --bg-panel: rgba(255, 255, 255, 0.04);
  --bg-panel-hover: rgba(255, 255, 255, 0.065);

  /* Borders */
  --border: rgba(255, 255, 255, 0.09);
  --border-accent: rgba(99, 161, 255, 0.32);

  /* Primary accent — cool indigo-blue */
  --accent: #7aaeff;
  --accent-dim: rgba(122, 174, 255, 0.12);
  --accent-glow: rgba(122, 174, 255, 0.35);

  /* Semantic colours */
  --green: #34d399;
  --green-dim: rgba(52, 211, 153, 0.12);
  --green-border: rgba(52, 211, 153, 0.28);

  --red: #f87171;
  --red-dim: rgba(248, 113, 113, 0.11);
  --red-border: rgba(248, 113, 113, 0.28);

  /* Info hint — slate-blue, no yellow */
  --info: #93c5fd;
  --info-dim: rgba(147, 197, 253, 0.08);
  --info-border: rgba(147, 197, 253, 0.18);

  /* Text */
  --text-1: #f0f6ff;
  --text-2: #8ca3c4;
  --text-3: #445369;

  /* Radius scale */
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 22px;
  --radius-xl: 30px;
}

/* ── Reset & Base ───────────────────────────────────── */
* { box-sizing: border-box; margin: 0; padding: 0; }

.qrcode-page {
  min-height: 100dvh;
  background: var(--bg-base);
  color: var(--text-1);
  font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* ── Ambient Background ─────────────────────────────── */
.ambient {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.ambient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.orb-1 {
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(99, 131, 255, 0.16) 0%, transparent 70%);
  top: -260px;
  left: -200px;
  animation: drift 20s ease-in-out infinite alternate;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.13) 0%, transparent 70%);
  bottom: -160px;
  right: -120px;
  animation: drift 24s ease-in-out infinite alternate-reverse;
}

.orb-3 {
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, rgba(56, 182, 255, 0.09) 0%, transparent 70%);
  top: 38%;
  left: 48%;
  animation: drift 28s ease-in-out infinite alternate;
}

@keyframes drift {
  from { transform: translate(0, 0); }
  to   { transform: translate(40px, 30px); }
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 48px 48px;
}

.scanline {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.04) 2px,
    rgba(0, 0, 0, 0.04) 4px
  );
}

/* ── Shell ──────────────────────────────────────────── */
.shell {
  position: relative;
  z-index: 1;
  max-width: 1160px;
  margin: 0 auto;
  padding: clamp(32px, 5vw, 56px) clamp(16px, 3vw, 32px) 48px;
}

/* ── Hero ───────────────────────────────────────────── */
.hero {
  text-align: center;
  margin-bottom: clamp(28px, 4vw, 44px);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border: 1px solid var(--border-accent);
  border-radius: 999px;
  background: var(--accent-dim);
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--accent);
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.7); }
}

.hero-title {
  font-size: clamp(2.2rem, 5.5vw, 4rem);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: #1e1e1e;
  margin-bottom: 14px;

}

.title-accent {
  display: inline-block;
  color: #1e1e1e;

}

.hero-sub {
  color: var(--text-2);
  font-size: clamp(0.9rem, 1.8vw, 1.05rem);
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ── Layout ─────────────────────────────────────────── */
.layout {
  display: grid;
  grid-template-columns: 420px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

/* ── Panel ──────────────────────────────────────────── */
.panel {
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  background: var(--bg-panel);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
  transition: border-color 0.3s;

  &:hover {
    border-color: rgba(255,255,255,0.12);
  }
}

.scanner-panel {
  padding: 24px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
}

.panel-eyebrow {
  display: block;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 4px;
}

.panel-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.01em;
}

/* ── Scan Pill ──────────────────────────────────────── */
.scan-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: rgba(0,0,0,0.25);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-2);
  white-space: nowrap;
  transition: all 0.3s;
}

.scan-pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-3);
  transition: all 0.3s;
}

.scan-pill.active {
  border-color: rgba(74, 222, 128, 0.35);
  background: var(--green-dim);
  color: var(--green);

  .scan-pill-dot {
    background: var(--green);
    box-shadow: 0 0 8px var(--green);
    animation: blink 1.2s ease-in-out infinite;
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* ── Viewfinder ─────────────────────────────────────── */
.viewfinder-wrap {
  margin-bottom: 16px;
}

.viewfinder {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #020b14;
  border: 1px solid var(--border);
  transition: border-color 0.3s;

  &.scanning {
    border-color: var(--border-accent);
  }
}

/* Corner brackets */
.corner {
  position: absolute;
  width: 26px;
  height: 26px;
  z-index: 10;
  transition: opacity 0.3s;
}

.c-tl { top: 14px; left: 14px; border-top: 2.5px solid var(--accent); border-left: 2.5px solid var(--accent); border-radius: 4px 0 0 0; }
.c-tr { top: 14px; right: 14px; border-top: 2.5px solid var(--accent); border-right: 2.5px solid var(--accent); border-radius: 0 4px 0 0; }
.c-bl { bottom: 14px; left: 14px; border-bottom: 2.5px solid var(--accent); border-left: 2.5px solid var(--accent); border-radius: 0 0 0 4px; }
.c-br { bottom: 14px; right: 14px; border-bottom: 2.5px solid var(--accent); border-right: 2.5px solid var(--accent); border-radius: 0 0 4px 0; }

/* Scan beam */
.scan-beam {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  box-shadow: 0 0 10px var(--accent-glow);
  z-index: 9;
  animation: beam 2.4s ease-in-out infinite;
}

@keyframes beam {
  0%   { top: 15%; opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 85%; opacity: 0; }
}

/* Reader element */
#reader {
  width: 100%;
  height: 100%;
  min-height: 0;
  background: #020b14;

  :deep(video) {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
  }

  :deep(img)    { max-width: 100%; }
  :deep(button) { border-radius: 999px !important; padding: 8px 12px !important; font-weight: 700 !important; }
  :deep(select) { max-width: 100%; }
}

/* Idle placeholder */
.viewfinder-idle {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: var(--text-3);
  font-size: 0.88rem;
  z-index: 2;

  svg { opacity: 0.6; }
}

/* ── Status Bar ─────────────────────────────────────── */
.status-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: rgba(0,0,0,0.22);
  border: 1px solid var(--border);
  font-size: 0.875rem;
  color: var(--text-2);
  margin-bottom: 14px;
  transition: all 0.3s;

  &.ok {
    background: var(--green-dim);
    border-color: var(--green-border);
    color: #6ee7b7;
    .status-icon { color: var(--green); }
  }

  &.err {
    background: var(--red-dim);
    border-color: var(--red-border);
    color: #fca5a5;
    .status-icon { color: var(--red); }
  }
}

.status-icon {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  color: var(--text-3);
}

/* ── Controls ───────────────────────────────────────── */
.controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 14px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 44px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s, box-shadow 0.2s;
  white-space: nowrap;

  &:not(:disabled):hover { transform: translateY(-1px); }
  &:not(:disabled):active { transform: translateY(0); }
  &:disabled { opacity: 0.38; cursor: not-allowed; }
}

.btn-primary {
  background: linear-gradient(135deg, #3b6fd4, #5a4fcf);
  color: #ffffff;
  box-shadow: 0 4px 20px rgba(59, 111, 212, 0.35);
  border-color: rgba(122, 174, 255, 0.3);

  &:not(:disabled):hover { box-shadow: 0 6px 28px rgba(59, 111, 212, 0.5); }
}

.btn-ghost {
  background: rgba(255,255,255,0.05);
  color: var(--text-2);
  border-color: var(--border);

  &:not(:disabled):hover { background: rgba(255,255,255,0.09); color: var(--text-1); }
}

.btn-danger {
  background: rgba(255,255,255,0.04);
  color: var(--text-2);
  border-color: var(--border);

  &:not(:disabled):hover {
    background: rgba(248, 113, 113, 0.1);
    color: #fca5a5;
    border-color: rgba(248, 113, 113, 0.25);
  }
}

/* ── Hint ───────────────────────────────────────────── */
.hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--info-dim);
  border: 1px solid var(--info-border);
  color: var(--info);
  font-size: 0.845rem;
  line-height: 1.55;

  svg { flex: 0 0 auto; margin-top: 1px; opacity: 0.8; }
}

/* ── Records Panel ──────────────────────────────────── */
.records-panel {
  display: flex;
  flex-direction: column;
}

.records-panel .panel-header {
  padding: 22px 22px 20px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0;
}

.count-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: rgba(0,0,0,0.25);
}

.count-num {
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.count-label {
  font-size: 0.78rem;
  color: var(--text-3);
  font-weight: 600;
}

/* ── Records Body ───────────────────────────────────── */
.records-body {
  flex: 1;
  min-height: 0;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  max-height: 540px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 999px; }
}

/* ── Record Card ────────────────────────────────────── */
.record-card {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: rgba(255,255,255,0.025);
  transition: background 0.2s, border-color 0.2s;

  &:hover {
    background: rgba(255,255,255,0.045);
    border-color: rgba(255,255,255,0.12);
  }

  &.duplicate {
    border-color: rgba(248,113,113,0.15);
    background: rgba(248,113,113,0.04);
  }
}

.record-num {
  font-size: 0.8rem;
  font-weight: 900;
  color: var(--accent);
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.record-text {
  color: var(--text-1);
  font-size: 0.875rem;
  word-break: break-all;
  line-height: 1.4;
  margin-bottom: 5px;
}

.record-time {
  display: block;
  color: var(--text-3);
  font-size: 0.76rem;
  font-variant-numeric: tabular-nums;
}

.record-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  border: 1px solid var(--green-border);
  background: var(--green-dim);
  color: #6ee7b7;

  &.dup {
    border-color: var(--red-border);
    background: var(--red-dim);
    color: #fca5a5;
  }
}

/* ── Empty State ────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 24px;
  gap: 10px;

  p {
    color: var(--text-2);
    font-weight: 700;
    font-size: 1rem;
  }

  span {
    color: var(--text-3);
    font-size: 0.85rem;
  }
}

.empty-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: rgba(255,255,255,0.025);
  color: var(--text-3);
  margin-bottom: 6px;
}

/* ── List Transition ────────────────────────────────── */
.record-list-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.record-list-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

/* ── Responsive ─────────────────────────────────────── */
@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .records-list {
    max-height: none;
  }
}

@media (max-width: 600px) {
  .shell {
    padding-left: 14px;
    padding-right: 14px;
  }

  .hero-title { letter-spacing: -0.01em; }

  .controls {
    grid-template-columns: 1fr 1fr;
  }

  .record-card {
    grid-template-columns: 1fr auto;

    .record-num { display: none; }
  }
}
</style>