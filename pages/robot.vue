<style scoped>
.chat-wrapper {
  background: #f1f5f9;
  padding: 12px;
  padding-bottom: 100px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.top-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
}

.left-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  color: #4ade80;
  font-weight: 600;
}

.chat-log {
  font-size: 14px;
  color: #6b7280;
}

.chat-bubble {
  background: white;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 16px 0;
  width: 90%;
  font-size: 16px;
  line-height: 1.4;
}

.character-section {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.character-image {
  width: 220px;
  max-width: 80%;
  border-radius: 16px;
  object-fit: cover;
}

.volume-icon {
  position: absolute;
  top: 12px;
  right: 18%;
  background: white;
  border-radius: 50%;
  padding: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-size: 18px;
  cursor: pointer;
}

.input-bar {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 30px;
  padding: 10px 16px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 16px 0;
}

.text-input {
  flex: 1;
  border: none;
  font-size: 16px;
  outline: none;
  background: transparent;
}

.mic-button {
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 20px;
  cursor: pointer;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0 12px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
}

.nav-item.active {
  color: #22c55e;
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 2px;
}

.voice-modal {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  height: 200px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.voice-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.voice-wave {
  width: 100px;
  height: 100px;
  object-fit: contain;
  animation: pulse-wave 1.6s infinite ease-in-out;
}

.voice-text {
  margin-top: 16px;
  font-size: 16px;
  color: #111827;
  font-weight: 600;
}

@keyframes pulse-wave {
  0%, 100% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

.transcript-text {
  margin-top: 8px;
  font-size: 14px;
  color: #4b5563;
  max-width: 80%;
  text-align: center;
  word-break: break-word;
}

.chat-history {
  width: 90%;
  margin-top: 12px;
}

.chat-message {
  margin-bottom: 12px;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}

.message.bot {
  align-self: flex-start;
}

.message.user {
  align-self: flex-end;
  align-items: flex-end;
}

.bubble {
  padding: 12px 16px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  font-size: 15px;
  line-height: 1.4;
  word-break: break-word;
}

.message.bot .bubble {
  background: white;
  color: #111827;
  border-bottom-left-radius: 4px;
}

.message.user .bubble {
  background: #4ade80;
  color: white;
  border-bottom-right-radius: 4px;
}

.time {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.send-button {
  background: #4ade80;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-left: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: background 0.3s ease;
}

.send-button:hover {
  background: #22c55e;
}

.send-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #4b5563;
  font-size: 14px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(34, 197, 94, 0.3);
  border-top-color: #22c55e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}


.stop-button {
  background-color: #ef4444;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background 0.3s ease;
}

.stop-button:hover {
  background-color: #dc2626;
}

.pulse-ring {
  position: absolute;
  width: 48px;
  height: 48px;
  border: 2px solid rgba(34, 197, 94, 0.5);
  border-radius: 50%;
  animation: pulse 1.5s infinite;
  top: -4px;
  left: -4px;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.2;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
}

.alert-dialog {
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 20px 24px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  z-index: 999;
  width: 280px;
  text-align: center;
}

.alert-content p {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.alert-content ul {
  padding-left: 16px;
  font-size: 14px;
  color: #4b5563;
  text-align: left;
  margin-bottom: 16px;
}

.alert-button {
  background-color: #22c55e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

</style>

<template>
  <div class="chat-wrapper">
    <!-- 頂部欄 -->
    <header class="top-header">
      <div class="left-info">
        <img class="avatar" src="/assets/imgs/character.png" alt="avatar" />
        <span class="username">如夢</span>
      </div>
      <div class="chat-log">聊天紀錄</div>
    </header>

    <!-- 對話氣泡 -->
    <div class="chat-bubble">
      嗨～～有什麼我可以幫助的，寶貝~
    </div>

    <!-- 角色形象圖 -->
    <div class="character-section">
      <img src="/assets/imgs/character.png" class="character-image" alt="角色全身照" />
    </div>

    <!-- 語音控制 -->
    <div class="voice-controls">
      <select class="voice-select" v-model="selectedVoiceName">
        <option value="">選擇語音</option>
        <option v-for="voice in voices" :key="voice.name" :value="voice.name">
          {{ voice.name }}
        </option>
      </select>
      <button class="test-voice-btn" @click="testVoice">🔊 試聽</button>
    </div>


    <!-- 當前語音輸入顯示 -->
   <!-- ✅ 統一的 transcript 顯示邏輯 -->
   <transition name="fade">
     <div v-if="currentTranscript || isLoading || isListening" class="transcript-display">
 
        <div v-if="currentTranscript || isLoading || isListening" class="transcript-display">
           <div v-if="isLoading" class="loading-indicator">
             <div class="spinner"></div>
            <span>正在思考...</span>
          </div>
          <p v-else-if="currentTranscript" class="transcript-text">{{ currentTranscript }}</p>
          <p v-else-if="isListening" class="transcript-text">請開始說話</p>
        </div>
      </div>
    </transition>
    
    <!-- ✅ 在語音控制區塊加入停止播放按鈕 -->
<div class="controls">
  <!-- 錄音按鈕 -->
  <button 
    @click="toggleListening"
    :disabled="isLoading"
    :class="['mic-button', isListening ? 'listening' : 'not-listening']"
  >
    <MicOff v-if="isListening" :size="32" color="white" />
    <Mic v-else :size="32" color="white" />
    <div v-if="isListening" class="pulse-ring"></div>
  </button>

  <!-- 停止語音播放按鈕 -->
  <button 
    v-if="isSpeaking"
    @click="stopSpeaking"
    class="stop-button"
  >
    <VolumeX :size="24" color="white" />
  </button>
</div>
    
    
    
    <!-- 輸入欄位 -->
    <div class="input-bar">
      <input v-model="textInput" class="text-input" placeholder="請輸入文字" @keypress.enter="handleManualInput" />
      <button class="send-button" @click="handleManualInput">
          <img src="/assets/imgs/breathe.svg" alt="送出" class="send-icon" />
      </button>
      <button class="mic-button" @click="toggleListening">
        <span v-if="isLoading" class="loading-spinner"></span>
        <span v-else>{{ isListening ? '🛑' : '🎤' }}</span>
      </button>
    </div>

<!-- 聊天紀錄 -->
<div class="chat-history">
  <div v-for="item in conversations" :key="item.id" class="chat-message">
    <!-- Bot 回覆 -->
    <div class="message bot">
      <div class="bubble">{{ item.bot }}</div>
      <div class="time">{{ item.timestamp.split(' ')[1] }}</div>
    </div>
    <!-- User 訊息 -->
    <div class="message user">
      <div class="bubble">{{ item.user }}</div>
      <div class="time">{{ item.timestamp.split(' ')[1] }}</div>
    </div>
  </div>
</div>



    <!-- 導航列 -->
    <nav class="bottom-nav">
      <div class="nav-item ">
        <div class="nav-icon">🏠</div>
        <span>我的服務</span>
      </div>
      <div class="nav-item ">
        <div class="nav-icon">👗</div>
        <span>穿衣紀錄</span>
      </div>
      <div class="nav-item active">
        <div class="nav-icon">🏠</div>
        <span>首頁</span>
      </div>
      <div class="nav-item">
        <div class="nav-icon">🛍️</div>
        <span>健康好物</span>
      </div>
      <div class="nav-item">
        <div class="nav-icon">👤</div>
        <span>會員</span>
      </div>
    </nav>
  </div>

<!-- 錄音提示彈窗 -->
<div v-if="isListening" class="voice-modal">
  <div class="voice-content">
    <img src="/assets/imgs/voicewave.png" alt="音波圖" class="voice-wave" />
    <p class="voice-text">請開始說話</p>
    <p v-if="currentTranscript" class="transcript-text">{{ currentTranscript }}</p>
  </div>
</div>

<!-- 🔔 撥放語音錯誤提示視窗 -->
<transition name="fade">
  <div v-if="showAudioError" class="alert-dialog">
    <div class="alert-content">
      <p>📢 您的裝置無法撥放聲音，請檢查：</p>
      <ul>
        <li>🔇 是否靜音模式</li>
        <li>🌐 是否支援中文語音撥放</li>
      </ul>
      <button @click="showAudioError = false" class="alert-button">我知道了</button>
    </div>
  </div>
</transition>


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
const textInput = ref('')
const transcriptText = ref('')
const showAudioError = ref(false) // 控制是否顯示錯誤視窗
let playbackConfirmed = false;
const isManuallyStopped = ref(false)





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
    isManuallyStopped.value = false
    playbackConfirmed = false
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
    playbackConfirmed = true
    isSpeaking.value = true
  }
  utterance.onend = () => {
    isSpeaking.value = false;
    isLoading.value = false; 

  }
  utterance.onerror = (e) => {
    isSpeaking.value = false;
    isLoading.value = false; 
    if (!isManuallyStopped.value) {
    showAudioError.value = true
  }
    console.error("語音播放失敗", e)
  }

  try {
      synthRef.speak(utterance)

      // 🧪 1 秒後檢查是否仍為 silent 狀態
      setTimeout(() => {
      if (!playbackConfirmed && !isManuallyStopped.value && isSpeaking.value === false) {
        showAudioError.value = true;
        console.warn("裝置無法正常撥放語音");
      }
    }, 1500);  // 建議縮短到 1.5 秒即可感知

    } catch (err) {
      console.error("語音撥放錯誤", err)
      showAudioError.value = true
    }

  console.log("🗣 準備播放文字:", text)
  console.log("🗣 找到語音：", utterance.voice?.name)
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
    isManuallyStopped.value = true  
    synthRef.cancel()
    isSpeaking.value = false
    console.log("🔴 使用者手動停止播放")
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

const handleManualInput = async () => {
  const input = textInput.value.trim();
  if (!input) return;

  isLoading.value = true;
  currentTranscript.value = '';
  textInput.value = '';

  try {
    const response = await fetch("https://aiwisebalance.com/webhook/rag_response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatInput: input,
        sessionId: UUID,
        timestamp: new Date().toISOString()
      })
    });

    const text = await response.text();
    let botResponse = '';

    try {
      const data = JSON.parse(text);
      botResponse = data?.result || data?.response || data?.message || '⚠️ AI 沒有提供內容。';
    } catch (err) {
      botResponse = '⚠️ 無法解析伺服器回應。';
    }

    const newConversation = {
      id: Date.now(),
      user: input,
      bot: botResponse,
      timestamp: new Date().toLocaleString('zh-TW')
    };

    conversations.value.unshift(newConversation);
    //speakText(botResponse);

  } catch (error) {
    console.error('API調用錯誤:', error);

    const errorResponse = '抱歉，服務暫時無法使用，請稍後再試。';
    const errorConversation = {
      id: Date.now(),
      user: input,
      bot: errorResponse,
      timestamp: new Date().toLocaleString('zh-TW')
    };

    conversations.value.unshift(errorConversation);
    //peakText(errorResponse);
  } finally {
    isLoading.value = false;
  }
};




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