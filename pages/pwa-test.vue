<template>
  <div class="pwa-test">
    <h1>PWA 錄影關閉測試</h1>
    
    <div class="test-section">
      <h2>狀態檢查</h2>
      <p>PWA 模式: {{ isPWA ? '是' : '否' }}</p>
      <p>頁面可見性: {{ isVisible ? '可見' : '隱藏' }}</p>
      <p>相機狀態: {{ cameraStatus }}</p>
      <p>錄影狀態: {{ recordingStatus }}</p>
    </div>

    <div class="test-section">
      <h2>相機測試</h2>
      <video ref="testVideo" autoplay muted playsinline></video>
      <div class="controls">
        <button @click="startCamera" :disabled="cameraActive">開啟相機</button>
        <button @click="stopCamera" :disabled="!cameraActive">關閉相機</button>
        <button @click="startRecording" :disabled="!cameraActive || recording">開始錄影</button>
        <button @click="stopRecording" :disabled="!recording">停止錄影</button>
      </div>
    </div>

    <div class="test-section">
      <h2>PWA 背景測試</h2>
      <p>請切換到其他應用程式或按 Home 鍵，然後返回此頁面</p>
      <p>預期行為：相機和錄影應該自動停止</p>
    </div>

    <div class="logs">
      <h3>日誌</h3>
      <div class="log-content">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const testVideo = ref(null);
const isPWA = ref(false);
const isVisible = ref(true);
const cameraStatus = ref('未開啟');
const recordingStatus = ref('未錄影');
const cameraActive = ref(false);
const recording = ref(false);
const logs = ref([]);

let stream = null;
let mediaRecorder = null;
let recordedChunks = [];

// 添加日誌
const addLog = (message) => {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.unshift(`[${timestamp}] ${message}`);
  if (logs.value.length > 20) {
    logs.value.pop();
  }
};

// 檢查 PWA 狀態
const checkPWAStatus = () => {
  const { $pwaUtils } = useNuxtApp();
  if ($pwaUtils) {
    isPWA.value = $pwaUtils.isPWA();
  } else {
    isPWA.value = window.matchMedia('(display-mode: standalone)').matches || 
                  window.navigator.standalone;
  }
  addLog(`PWA 狀態檢查: ${isPWA.value ? 'PWA 模式' : '瀏覽器模式'}`);
};

// 頁面可見性處理
const handleVisibilityChange = () => {
  isVisible.value = !document.hidden;
  addLog(`頁面可見性變化: ${isVisible.value ? '可見' : '隱藏'}`);
  
  if (document.hidden) {
    addLog('頁面進入背景，自動停止相機和錄影');
    stopCamera();
    stopRecording();
  }
};

// 開啟相機
const startCamera = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: true
    });
    testVideo.value.srcObject = stream;
    cameraActive.value = true;
    cameraStatus.value = '已開啟';
    addLog('相機開啟成功');
  } catch (error) {
    addLog(`相機開啟失敗: ${error.message}`);
  }
};

// 關閉相機
const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  if (testVideo.value) {
    testVideo.value.srcObject = null;
  }
  cameraActive.value = false;
  cameraStatus.value = '已關閉';
  addLog('相機已關閉');
};

// 開始錄影
const startRecording = () => {
  if (!stream) {
    addLog('無法開始錄影：相機未開啟');
    return;
  }
  
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };
  mediaRecorder.onstop = () => {
    addLog('錄影已停止');
    recordingStatus.value = '已停止';
    recording.value = false;
  };
  
  mediaRecorder.start();
  recording.value = true;
  recordingStatus.value = '錄影中';
  addLog('開始錄影');
};

// 停止錄影
const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    addLog('手動停止錄影');
  }
};

onMounted(() => {
  addLog('PWA 測試頁面載入');
  checkPWAStatus();
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // 監聽全域 PWA 背景事件
  window.addEventListener('pwa-background', (event) => {
    addLog(`收到 PWA 背景事件: ${event.detail.timestamp}`);
  });
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  stopCamera();
  stopRecording();
  addLog('頁面卸載，清理資源');
});
</script>

<style lang="scss" scoped>
.pwa-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  
  h2 {
    margin-top: 0;
    color: #333;
  }
}

.controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
  
  button {
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    background: #007bff;
    color: white;
    cursor: pointer;
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    &:hover:not(:disabled) {
      background: #0056b3;
    }
  }
}

video {
  width: 100%;
  max-width: 400px;
  height: 300px;
  background: #000;
  border-radius: 8px;
  margin-bottom: 15px;
}

.logs {
  margin-top: 30px;
  
  .log-content {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 5px;
  }
  
  .log-item {
    font-family: monospace;
    font-size: 12px;
    margin-bottom: 5px;
    padding: 2px 0;
    border-bottom: 1px solid #eee;
  }
}
</style> 