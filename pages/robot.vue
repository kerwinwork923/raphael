<style lang="scss">

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #4c1d95 0%, #1e3a8a 50%, #312e81 100%);
  display: flex;
  flex-direction: column;
  position: relative;
}

.top-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 128px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.1), transparent);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 32px;
  padding: 0 16px;
  position: relative;
  z-index: 10;
}

.avatar-container {
  position: relative;
  margin-bottom: 32px;
}

.avatar-outer {
  width: 256px;
  height: 256px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f472b6, #a855f7, #6366f1);
  padding: 4px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #fce7f3, #e9d5ff);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-face {
  position: relative;
  width: 192px;
  height: 192px;
}

.face-base {
  position: absolute;
  inset: 16px;
  background: linear-gradient(to bottom, #fce7f3, #fbcfe8);
  border-radius: 50%;
}

.hair {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, #92400e, #d97706);
  border-radius: 50%;
}

.eyes {
  position: absolute;
  top: 64px;
}

.eye-left {
  position: absolute;
  left: 56px;
  width: 16px;
  height: 24px;
  background: white;
  border-radius: 50%;
}

.eye-right {
  position: absolute;
  right: 56px;
  width: 16px;
  height: 24px;
  background: white;
  border-radius: 50%;
}

.pupil-left {
  position: absolute;
  top: 72px;
  left: 64px;
  width: 8px;
  height: 12px;
  background: #1f2937;
  border-radius: 50%;
}

.pupil-right {
  position: absolute;
  top: 72px;
  right: 64px;
  width: 8px;
  height: 12px;
  background: #1f2937;
  border-radius: 50%;
}

.mouth {
  position: absolute;
  bottom: 64px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 12px;
  background: #f472b6;
  border-radius: 50%;
}

.blush-left {
  position: absolute;
  top: 80px;
  left: 40px;
  width: 24px;
  height: 16px;
  background: #fbb6ce;
  border-radius: 50%;
  opacity: 0.6;
}

.blush-right {
  position: absolute;
  top: 80px;
  right: 40px;
  width: 24px;
  height: 16px;
  background: #fbb6ce;
  border-radius: 50%;
  opacity: 0.6;
}

.speaking-indicator {
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.transcript-display {
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 384px;
  width: 100%;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.transcript-text {
  color: white;
  text-align: center;
}

.controls {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.mic-button {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
  transform: scale(1);
  cursor: pointer;
}

.mic-button:hover {
  transform: scale(1.05);
}

.mic-button.listening {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.mic-button.not-listening {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
}

.mic-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pulse-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #ef4444;
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  opacity: 0.75;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.stop-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
  cursor: pointer;
}

.stop-button:hover {
  background: linear-gradient(135deg, #ea580c, #dc2626);
}

.instruction-text {
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin-bottom: 24px;
  max-width: 384px;
}

.conversation-history {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  max-height: 384px;
  overflow-y: auto;
}

.history-content {
  padding: 16px;
}

.history-title {
  color: white;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
}

.no-conversations {
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 32px 0;
}

.conversation-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 16px;
}

.conversation-user {
  margin-bottom: 8px;
}

.conversation-bot {
  margin-bottom: 8px;
}

.speaker-label {
  font-weight: 500;
}

.user-label {
  color: #93c5fd;
}

.bot-label {
  color: #f9a8d4;
}

.message-text {
  color: white;
  margin-top: 4px;
}

.timestamp {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  text-align: right;
}

.bottom-nav {
  background: rgba(255, 255, 255, 0.95);
  padding: 16px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: #6b7280;
  font-size: 12px;
  transition: color 0.3s ease;
}

.nav-item.active {
  color: #10b981;
}

.nav-item:hover {
  color: #374151;
}

.nav-icon {
  width: 24px;
  height: 24px;
}
</style>

<template>
  <div class="app-container">
    <div class="top-decoration"></div>
    
    <div class="main-content">
      <!-- 美女人像區域 -->
      <div class="avatar-container">
        <div class="avatar-outer">
          <div class="avatar-inner">
            <div class="avatar-face">
              <div class="hair"></div>
              <div class="face-base"></div>
              <div class="eyes">
                <div class="eye-left"></div>
                <div class="eye-right"></div>
              </div>
              <div class="pupil-left"></div>
              <div class="pupil-right"></div>
              <div class="mouth"></div>
              <div class="blush-left"></div>
              <div class="blush-right"></div>
            </div>
          </div>
        </div>
        
        <!-- 說話指示器 -->
        <div v-if="isListening || isSpeaking" class="speaking-indicator">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>

      <!-- 當前語音輸入顯示 -->
      <div v-if="currentTranscript || isLoading" class="transcript-display">
        <div v-if="isLoading" class="loading-indicator">
          <div class="spinner"></div>
          <span>正在思考...</span>
        </div>
        <p v-else class="transcript-text">{{ currentTranscript }}</p>
      </div>

      <!-- 語音控制按鈕 -->
      <div class="controls">
        <button 
          @click="toggleListening"
          :disabled="isLoading"
          :class="['mic-button', isListening ? 'listening' : 'not-listening']"
        >
          <MicOff v-if="isListening" :size="32" color="white" />
          <Mic v-else :size="32" color="white" />
          
          <div v-if="isListening" class="pulse-ring"></div>
        </button>

        <button 
          v-if="isSpeaking"
          @click="stopSpeaking"
          class="stop-button"
        >
          <VolumeX :size="24" color="white" />
        </button>
      </div>

      <!-- 使用說明 -->
      <p class="instruction-text">
        {{ isListening ? '正在聆聽中，請說話...' : '點擊麥克風開始對話' }}
      </p>
      <select v-model="selectedVoiceName">
        <option
            v-for="v in voiceList.filter(voice => voice.lang?.toLowerCase().includes('zh-tw'))"
                  :key="v.name"
                   :value="v.name"
            >
          {{ v.name }}
       </option>
     </select>
     <button @click="testVoice">🔊 試聽</button>
    </div>
    
    

    <!-- 對話記錄區域 -->
    <div class="conversation-history">
      <div class="history-content">
        <h3 class="history-title">對話記錄</h3>
        
        <div v-if="conversations.length === 0" class="no-conversations">
          還沒有對話記錄
        </div>
        
        <div v-else>
          <div 
            v-for="conv in conversations" 
            :key="conv.id" 
            class="conversation-item"
          >
            <div class="conversation-user">
              <span class="speaker-label user-label">您:</span>
              <p class="message-text">{{ conv.user }}</p>
            </div>
            <div class="conversation-bot">
              <span class="speaker-label bot-label">助手:</span>
              <p class="message-text">{{ conv.bot }}</p>
            </div>
            <p class="timestamp">{{ conv.timestamp }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部導航 -->
    <div class="bottom-nav">
      <NuxtLink to="/" class="nav-item active">
        <Home class="nav-icon" />
        <span>首頁</span>
      </NuxtLink>
      <NuxtLink to="/UsageHistory" class="nav-item">
        <Heart class="nav-icon" />
        <span>穿衣紀錄</span>
      </NuxtLink>
      <NuxtLink to="/cart" class="nav-item">
        <ShoppingBag class="nav-icon" />
        <span>健康好物</span>
      </NuxtLink>
      <NuxtLink to="/services" class="nav-item">
        <Monitor class="nav-icon" />
        <span>我的服務</span>
      </NuxtLink>
      <NuxtLink to="/ChangeMember" class="nav-item">
        <User class="nav-icon" />
        <span>會員</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Mic, MicOff, VolumeX, Home, Heart, ShoppingBag, Monitor, User } from 'lucide-vue-next'

// 響應式狀態
const isListening = ref(false)
const isLoading = ref(false)
const conversations = ref([])
const currentTranscript = ref('')
const isSpeaking = ref(false)
const UUID = getOrCreateVisitorID(); // 將 UUID 定義為全域變數
	
// 語音識別和合成實例
let recognitionRef = null
let synthRef = null

const selectedVoiceName = ref("")
const voiceList = ref([])

onMounted(() => {
  const loadVoices = () => {
    voiceList.value = speechSynthesis.getVoices()
  }

  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.onvoiceschanged = loadVoices
  } else {
    loadVoices()
  }
})

// 語音試聽函數
const testVoice = () => {
  const text = "你好，我是你的語音助手";
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-TW';
  utterance.voice = speechSynthesis.getVoices().find(v => v.name === selectedVoiceName.value);
  utterance.rate = 0.9;
  utterance.pitch = 0.85;
  synthRef.speak(utterance);
};


// 初始化語音識別
const initSpeechRecognition = () => {
  if (process.client) {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef = new SpeechRecognition()
      recognitionRef.continuous = false
      recognitionRef.interimResults = true
      recognitionRef.lang = 'zh-TW'

      recognitionRef.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')
        
        currentTranscript.value = transcript
        
        if (event.results[0].isFinal) {
          handleSpeechEnd(transcript)
        }
      }

      recognitionRef.onerror = (event) => {
        console.error('語音識別錯誤:', event.error)
        isListening.value = false
        currentTranscript.value = ''
      }

      recognitionRef.onend = () => {
        isListening.value = false
      }
    }

    // 初始化語音合成
    if ('speechSynthesis' in window) {
      synthRef = window.speechSynthesis
    }
  }
}

// 開始/停止語音識別
const toggleListening = () => {
  if (!recognitionRef) {
    alert('您的瀏覽器不支援語音識別功能')
    return
  }

  if (isListening.value) {
    recognitionRef.stop()
    isListening.value = false
    currentTranscript.value = ''
  } else {
    currentTranscript.value = ''
    recognitionRef.start()
    isListening.value = true
  }
}

// 處理語音輸入結束
const handleSpeechEnd = async (transcript) => {
  if (!transcript.trim()) return

  isLoading.value = true
  currentTranscript.value = ''

    // 調用API - 請替換為您的n8n API端點
  try {
    const response = await fetch("https://aiwisebalance.com/webhook/rag_response", {
      method: "POST",
      headers: {"Content-Type": "application/json"
      },
      body: JSON.stringify({
        chatInput: transcript,
        sessionId: UUID,
        timestamp: new Date().toISOString()
      })
    });

    const text = await response.text();
    console.log("🔥 回傳原始內容：", text);
    let botResponse = '';

    try {
        const data = JSON.parse(text);
        if (data?.result || data?.response || data?.message) {
              botResponse = data.result || data.response || data.message;
            } else {
              botResponse = '⚠️ AI 沒有提供內容。';
            }
      } catch (err) {
        botResponse = '⚠️ 無法解析伺服器回應。'; 
       }
    
    const newConversation = {
      id: Date.now(),
      user: transcript,
      bot: botResponse,
      timestamp: new Date().toLocaleString('zh-TW')
     }

    conversations.value.unshift(newConversation);
    speakText(botResponse);

  } catch (error) {
      console.error('API調用錯誤:', error);
      const errorResponse = '抱歉，服務暫時無法使用，請稍後再試。';
      
      const errorConversation = {
          id: Date.now(),
          user: transcript,
          bot: errorResponse,
          timestamp: new Date().toLocaleString('zh-TW')
         }

      conversations.value.unshift(errorConversation);
      speakText(errorResponse);
      }
    }

// 語音播放文字
const speakText = (text) => {
  if (!synthRef || !process.client) return

  const speak = () => {
    synthRef.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-TW'

    const voices = speechSynthesis.getVoices()
    utterance.voice = voices.find(v =>
      v.name.includes("Google 國語") || v.name.includes("Ting-Ting")
    )

  utterance.rate = 0.9;
  utterance.pitch = 0.85;

  utterance.onstart = () => {
    isSpeaking.value = true
  }
  utterance.onend = () => {
    isSpeaking.value = false;
    isLoading.value = false; 

  }
  utterance.onerror = () => {
    isSpeaking.value = false;
    isLoading.value = false; 
  }
  console.log("🗣 準備播放文字:", text)
  console.log("🗣 找到語音：", utterance.voice?.name)
  synthRef.speak(utterance)
}
 // ⏳ 如果語音尚未載入，先等一下
 if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.onvoiceschanged = () => {
      speak()
    }
  } else {
    speak()
  }


}

// 停止語音播放
const stopSpeaking = () => {
  if (synthRef && process.client) {
    synthRef.cancel()
    isSpeaking.value = false
  }
}

// 組件掛載時初始化
onMounted(() => {
  initSpeechRecognition()
})

// 組件卸載時清理
onUnmounted(() => {
  if (recognitionRef) {
    recognitionRef.stop()
  }
  if (synthRef) {
    synthRef.cancel()
  }
})

// SEO
useHead({
  title: '語音對話App',
  meta: [
    { name: 'description', content: '智能語音對話助手應用' }
  ]
})

// 工具函數
function getOrCreateVisitorID() {
          const name = "WBSID";
          const existing = document.cookie
            .split("; ")
            .find((row) => row.startsWith(name + "="))
            ?.split("=")[1];

          if (existing) return existing;

          const newID = crypto.randomUUID();
          document.cookie = `${name}=${newID}; path=/; max-age=31536000`; // 儲存 1 年
          return newID;
        }
</script>