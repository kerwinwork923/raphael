<template>
  <div class="chat-wrapper">
    <!-- 聊天頭部 -->
    <div class="chat-header">
      <div class="avatar-container">
        <img class="avatar" src="/assets/imgs/robot/doctor.png" alt="角色頭像" />
      </div>
      <div class="character-name-btn">
        <span>角色姓名</span>
       
          <img src="/assets/imgs/robot/recycle.svg" alt="刷新">
      
      </div>
    </div>

    <!-- 初始對話氣泡 -->
    <div class="greeting-bubble">
      嗨~~有什麼需要幫您
      <button class="volume-control" @click="toggleVolume">
        <span>🔊</span>
      </button>
    </div>

    <!-- AI角色形象區域 -->
    <div class="character-section">
      <img src="/assets/imgs/robot/doctor.png" class="character-image" alt="AI角色" />
    </div>

    <!-- 語音控制區域 - 從下方彈出 -->
    <transition name="slide-up">
      <div v-if="showVoiceControls" class="voice-control-bar">
        <button class="control-btn history-btn" @click="showHistory">
          <img src="/assets/imgs/robot/time.svg" alt="歷史紀錄">
        </button>
        <button 
          class="control-btn mic-btn"
          :class="{ 'listening': isListening }"
          @click="toggleListening"
          :disabled="isLoading"
        >
        
    
            <img src="/assets/imgs/robot/sound.svg" alt="語音">
    
          <div v-if="isListening" class="pulse-ring"></div>
        </button>
        <button class="control-btn text-btn" @click="toggleTextInput">
         <img src="/assets/imgs/robot/keyboard.svg" alt="文字">
        </button>
      </div>
    </transition>

    <!-- 文字輸入區域 -->
    <transition name="slide-up">
      <div v-if="showTextInput" class="text-input-section">
        <div class="input-container">
          <input 
            v-model="textInput" 
            class="text-input" 
            placeholder="請輸入文字" 
            @keypress.enter="handleManualInput"
            ref="textInputRef"
          />
          <button class="send-btn" @click="handleManualInput">
            <span>📤</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- 當前語音輸入顯示 -->
    <transition name="fade">
      <div v-if="currentTranscript || isLoading || isListening" class="transcript-display">
        <div v-if="isLoading" class="loading-indicator">
          <div class="spinner"></div>
          <span>正在思考...</span>
        </div>
        <p v-else-if="currentTranscript" class="transcript-text">{{ currentTranscript }}</p>
        <p v-else-if="isListening" class="transcript-text">請開始說話</p>
      </div>
    </transition>

    <!-- 聊天歷史記錄 -->
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

    <!-- 底部導航列 -->
    <nav class="bottom-nav">
      <div class="nav-item" :class="{ active: activeTab === 'services' }" @click="setActiveTab('services')">
        <div class="nav-icon">
          <img v-if="activeTab === 'services'" src="/assets/imgs/robot/home-active.svg" alt="我的服務" />
          <img v-else src="/assets/imgs/robot/home.svg" alt="我的服務" />
        </div>
        <span>我的服務</span>
      </div>
      <div class="nav-item" :class="{ active: activeTab === 'record' }" @click="setActiveTab('record')">
        <div class="nav-icon">
          <img v-if="activeTab === 'record'" src="/assets/imgs/robot/cloth-active.svg" alt="我的服務" />
          <img v-else src="/assets/imgs/robot/cloth.svg" alt="我的服務" />
        </div>
        <span>穿衣紀錄</span>
      </div>
      <div class="nav-item" :class="{ active: activeTab === 'home' }" @click="setActiveTab('home')">
        <div class="nav-icon">
          <img v-if="activeTab === 'home'" src="/assets/imgs/robot/home-active.svg" alt="首頁" />
          <img v-else src="/assets/imgs/robot/home.svg" alt="首頁" />
        </div>
        <span>首頁</span>
      </div>
      <div class="nav-item" :class="{ active: activeTab === 'shop' }" @click="setActiveTab('shop')">
        <div class="nav-icon">
          <img v-if="activeTab === 'shop'" src="/assets/imgs/robot/market-active.svg" alt="我的服務" />
          <img v-else src="/assets/imgs/robot/market.svg" alt="我的服務" />
        </div>
        <span>健康好物</span>
      </div>
      <div class="nav-item" :class="{ active: activeTab === 'member' }" @click="setActiveTab('member')">
        <div class="nav-icon">
          <img v-if="activeTab === 'member'" src="/assets/imgs/robot/member-active.svg" alt="我的服務" />
          <img v-else src="/assets/imgs/robot/member.svg" alt="我的服務" />
        </div>
        <span>會員</span>
      </div>
    </nav>

    <!-- 錄音提示彈窗 -->
    <transition name="fade">
      <div v-if="isListening" class="voice-modal">
        <div class="voice-content">
          <img src="/assets/imgs/voicewave.png" alt="音波圖" class="voice-wave" />
          <p class="voice-text">請開始說話</p>
          <p v-if="currentTranscript" class="transcript-text">{{ currentTranscript }}</p>
        </div>
      </div>
    </transition>

    <!-- 語音播放錯誤提示 -->
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

    <!-- 歷史紀錄頁面 -->
    <transition name="slide-left">
      <div v-if="showHistoryPage" class="history-page">
        <div class="history-header">
          <button class="back-btn" @click="closeHistory">
            <span>←</span>
          </button>
          <h2>聊天紀錄</h2>
          <div class="header-actions">
            <button class="search-btn">🔍</button>
            <button class="calendar-btn">📅</button>
          </div>
        </div>
        
        <div class="history-content">
          <div v-for="(group, date) in groupedHistory" :key="date" class="history-group">
            <div class="date-separator">{{ formatDate(date) }}</div>
            <div v-for="item in group" :key="item.id" class="history-message">
              <div class="message bot">
                <div class="avatar">🤖</div>
                <div class="bubble">{{ item.bot }}</div>
                <div class="time">{{ item.timestamp.split(' ')[1] }}</div>
              </div>
              <div class="message user">
                <div class="bubble">{{ item.user }}</div>
                <div class="time">{{ item.timestamp.split(' ')[1] }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.chat-wrapper {
  background: linear-gradient(135deg, #e0e5ec 0%, #f0f4f8 100%);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  position: relative;

  padding-bottom: 100px;
  padding: 0 5%;
}

/* 聊天頭部 */
.chat-header {
  width: 100%;
  display: flex;

  align-items: center;

  background: transparent;
  position: relative;
  gap: 10px;
  padding-top: 1.25rem;
  .avatar-container {
    width: 40px;
    height: 40px;

    border-radius: 50%;
    box-shadow: 8px 8px 16px rgba(163, 177, 198, 0.6),
      -8px -8px 16px rgba(255, 255, 255, 0.8);

    border: 1px solid #74bc1f;
    overflow: hidden;
    img {
      transform: scale(1.5) translateY(10px);
    }
  }

  .character-name-btn {
    color: #4a5568;
    padding: 10px 16px;
    color: var(--Primary-default, #74bc1f);
    font-family: "Noto Sans";
    font-size: var(--Text-font-size-18, 18px);
    font-style: normal;
    font-weight: 400;

    letter-spacing: 2.7px;

    border-radius: var(--Radius-r-50, 50px);
    background: var(--Secondary-100, #f5f7fa);
    box-shadow: -6px -6px 12px 0 var(--Neutral-white, #fff),
      6px 6px 12px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
    display: flex;
    align-items: center;
    gap: 2px;
  }
}

/* 問候氣泡 */
.greeting-bubble {
  background: linear-gradient(145deg, #e0e5ec, #f0f4f8);

  padding: 16px;
  margin-top: 1rem;
  font-size: 16px;
  line-height: 1.5;
  color: #2d3748;
  width: 100%;

  max-width: none;
  align-self: center;
  border-radius: 20px;
  background: var(--Secondary-100, #f5f7fa);
  box-shadow: -6px -6px 12px 0 var(--Neutral-white, #fff),
    6px 6px 12px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
  position: relative;

  min-height: 120px;
}

.volume-control {
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  position: absolute;
  right: 0;
  top: 100%;

  cursor: pointer;

  transition: all 0.3s ease;

  border-radius: var(--Radius-r-50, 50px);
  background: var(--Secondary-100, #f5f7fa);
  box-shadow: -6px -6px 12px 0 var(--Neutral-white, #fff),
    6px 6px 12px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));

  &:hover {
    transform: translateY(-2px);
    box-shadow: 6px 6px 12px rgba(163, 177, 198, 0.6),
      -6px -6px 12px rgba(255, 255, 255, 0.8);
  }

  &:active {
    box-shadow: inset 4px 4px 8px rgba(163, 177, 198, 0.6),
      inset -4px -4px 8px rgba(255, 255, 255, 0.8);
    transform: translateY(0);
  }
}

/* 角色形象區域 */
.character-section {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;

  flex: 1;

  .character-image {
    img{
      
    }
  
  }
}

/* 語音控制欄 - 絕對定位擬態設計 */
.voice-control-bar {
  position: fixed;
  bottom: 18%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 4px 16px;
  border-radius: var(--Radius-r-50, 50px);
  background: rgba(255, 255, 255, 0.6);     
  -webkit-backdrop-filter: blur(22px);       
  backdrop-filter: blur(22px);
  border: 1px solid var(--Neutral-white, #FFF);
  border-radius: 50px;
 
  z-index: 10;

  

  .control-btn {
    background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
    border: none;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 20px;
    transition: all 0.3s ease;
    position: relative;
    box-shadow: 0 0 12px 0 var(--Neutral-white, #FFF), 6px 6px 12px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.40));
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
      box-shadow: 2px 2px 4px rgba(163, 177, 198, 0.6),
        -2px -2px 4px rgba(255, 255, 255, 0.8);
      transform: translateY(-2px);
    }

    &:active {
      box-shadow: inset 4px 4px 8px rgba(163, 177, 198, 0.6),
        inset -4px -4px 8px rgba(255, 255, 255, 0.8);
      transform: translateY(0);
    }

    &.mic-btn {
      background: linear-gradient(90deg, var(--primary-400-opacity-70, rgba(116, 188, 31, 0.70)) 0%, var(--Primary-default, #74BC1F) 100%);


      color: white;
      width: 60px;
      height: 60px;
      font-size: 26px;


      &.listening {
        background: linear-gradient(90deg, var(--primary-400-opacity-70, rgba(116, 188, 31, 0.70)) 0%, var(--Primary-default, #74BC1F) 100%);


        color: white;
        width: 70px;
        height: 70px;
        font-size: 26px;


      }
    }
  }

  .pulse-ring {
    position: absolute;
    width: 80px;
    height: 80px;
    border: 2px solid rgba(239, 68, 68, 0.4);
    border-radius: 50%;
    animation: pulse 1.5s infinite;
    top: -5px;
    left: -5px;
  }
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

/* 文字輸入區域 */
.text-input-section {
  width: 100%;
  padding: 0 20px;
  margin-bottom: 20px;

  .input-container {
    display: flex;
    align-items: center;
    background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
    border-radius: 30px;
    padding: 16px 20px;
    box-shadow: 8px 8px 16px rgba(163, 177, 198, 0.6),
      -8px -8px 16px rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.3);

    .text-input {
      flex: 1;
      border: none;
      font-size: 16px;
      outline: none;
      background: transparent;
      padding: 0 16px;
      color: #2d3748;

      &::placeholder {
        color: #718096;
      }
    }

    .send-btn {
      background: linear-gradient(145deg, #22c55e, #16a34a);
      border: none;
      border-radius: 50%;
      width: 45px;
      height: 45px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      color: white;
      font-size: 18px;
      box-shadow: 4px 4px 8px rgba(34, 197, 94, 0.3),
        -4px -4px 8px rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 6px 6px 12px rgba(34, 197, 94, 0.3),
          -6px -6px 12px rgba(255, 255, 255, 0.8);
      }
    }
  }
}

/* 轉錄顯示 */
.transcript-display {
  width: 100%;
  padding: 0 20px;
  margin-bottom: 20px;

  .loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #4a5568;
    font-size: 14px;

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(34, 197, 94, 0.3);
      border-top-color: #22c55e;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 8px;
    }
  }

  .transcript-text {
    text-align: center;
    font-size: 16px;
    color: #2d3748;
    background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
    padding: 16px 24px;
    border-radius: 25px;
    box-shadow: 6px 6px 12px rgba(163, 177, 198, 0.6),
      -6px -6px 12px rgba(255, 255, 255, 0.8);
    margin: 0 auto;
    max-width: 300px;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 聊天歷史 */
.chat-history {
  width: 100%;
  padding: 0 20px;
  margin-top: 20px;

  .chat-message {
    margin-bottom: 20px;

    .message {
      display: flex;
      flex-direction: column;
      max-width: 85%;

      &.bot {
        align-self: flex-start;

        .bubble {
          background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
          color: #2d3748;
          border-bottom-left-radius: 8px;
          box-shadow: 6px 6px 12px rgba(163, 177, 198, 0.6),
            -6px -6px 12px rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      }

      &.user {
        align-self: flex-end;
        align-items: flex-end;

        .bubble {
          background: linear-gradient(145deg, #22c55e, #16a34a);
          color: white;
          border-bottom-right-radius: 8px;
          box-shadow: 6px 6px 12px rgba(34, 197, 94, 0.3),
            -6px -6px 12px rgba(255, 255, 255, 0.8);
        }
      }

      .bubble {
        padding: 14px 18px;
        border-radius: 20px;
        font-size: 15px;
        line-height: 1.4;
        word-break: break-word;
      }

      .time {
        font-size: 12px;
        color: #718096;
        margin-top: 6px;
      }
    }
  }
}

/* 底部導航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 16px 0 24px;
  box-shadow: 0 -8px 16px rgba(163, 177, 198, 0.6),
    0 8px 16px rgba(255, 255, 255, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 12px;
    color: #4a5568;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 8px 12px;
    border-radius: 15px;



    &.active {
      color: #74BC1F;
      font-weight: bold;
    }

    .nav-icon {
      font-size: 22px;
      margin-bottom: 4px;
    }
  }
}

/* 語音模態框 */
.voice-modal {
  position: fixed;
  bottom: 200px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 220px;
  border-radius: 30px;
  background: linear-gradient(
    145deg,
    rgba(224, 229, 236, 0.95),
    rgba(240, 244, 248, 0.95)
  );
  backdrop-filter: blur(12px);
  box-shadow: 12px 12px 24px rgba(163, 177, 198, 0.6),
    -12px -12px 24px rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  border: 1px solid rgba(255, 255, 255, 0.3);

  .voice-content {
    display: flex;
    flex-direction: column;
    align-items: center;

    .voice-wave {
      width: 90px;
      height: 90px;
      object-fit: contain;
      animation: pulse-wave 1.6s infinite ease-in-out;
    }

    .voice-text {
      margin-top: 16px;
      font-size: 16px;
      color: #2d3748;
      font-weight: 600;
    }
  }
}

@keyframes pulse-wave {
  0%,
  100% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

/* 錯誤提示 */
.alert-dialog {
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
  padding: 28px;
  border-radius: 20px;
  box-shadow: 12px 12px 24px rgba(163, 177, 198, 0.6),
    -12px -12px 24px rgba(255, 255, 255, 0.8);
  z-index: 999;
  width: 300px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);

  .alert-content {
    p {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 16px;
    }

    ul {
      padding-left: 24px;
      font-size: 14px;
      color: #4a5568;
      text-align: left;
      margin-bottom: 24px;
    }

    .alert-button {
      background: linear-gradient(145deg, #22c55e, #16a34a);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 4px 4px 8px rgba(34, 197, 94, 0.3),
        -4px -4px 8px rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 6px 6px 12px rgba(34, 197, 94, 0.3),
          -6px -6px 12px rgba(255, 255, 255, 0.8);
      }
    }
  }
}

/* 動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* 歷史紀錄頁面 */
.history-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e0e5ec 0%, #f0f4f8 100%);
  z-index: 1000;
  display: flex;
  flex-direction: column;

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 
      0 4px 12px rgba(163, 177, 198, 0.6),
      0 -4px 12px rgba(255, 255, 255, 0.8);

    .back-btn {
      background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
      border: none;
      font-size: 24px;
      color: #4a5568;
      cursor: pointer;
      padding: 12px;
      border-radius: 12px;
      transition: all 0.3s ease;
      box-shadow: 
        4px 4px 8px rgba(163, 177, 198, 0.6),
        -4px -4px 8px rgba(255, 255, 255, 0.8);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 
          6px 6px 12px rgba(163, 177, 198, 0.6),
          -6px -6px 12px rgba(255, 255, 255, 0.8);
      }
    }

    h2 {
      font-size: 20px;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .search-btn,
    .calendar-btn {
      background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
      border: none;
      font-size: 20px;
      color: #4a5568;
      cursor: pointer;
      padding: 12px;
      border-radius: 12px;
      transition: all 0.3s ease;
      box-shadow: 
        4px 4px 8px rgba(163, 177, 198, 0.6),
        -4px -4px 8px rgba(255, 255, 255, 0.8);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 
          6px 6px 12px rgba(163, 177, 198, 0.6),
          -6px -6px 12px rgba(255, 255, 255, 0.8);
      }
    }
  }

  .history-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: transparent;

    .history-group {
      margin-bottom: 30px;

      .date-separator {
        text-align: center;
        font-size: 14px;
        color: #718096;
        margin-bottom: 20px;
        padding: 8px 16px;
        background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
        border-radius: 20px;
        box-shadow: 
          4px 4px 8px rgba(163, 177, 198, 0.6),
          -4px -4px 8px rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.3);
        display: inline-block;
        margin-left: 50%;
        transform: translateX(-50%);
      }

      .history-message {
        margin-bottom: 20px;

        .message {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;

          &.bot {
            justify-content: flex-start;

            .avatar {
              width: 36px;
              height: 36px;
              background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
              border-radius: 50%;
              display: flex;
              justify-content: center;
              align-items: center;
              font-size: 18px;
              color: #22c55e;
              box-shadow: 
                4px 4px 8px rgba(163, 177, 198, 0.6),
                -4px -4px 8px rgba(255, 255, 255, 0.8);
              border: 1px solid rgba(255, 255, 255, 0.3);
              margin-right: 12px;
              flex-shrink: 0;
            }

            .bubble {
              background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
              color: #2d3748;
              border-bottom-left-radius: 8px;
              box-shadow: 
                6px 6px 12px rgba(163, 177, 198, 0.6),
                -6px -6px 12px rgba(255, 255, 255, 0.8);
              border: 1px solid rgba(255, 255, 255, 0.3);
              max-width: 70%;
            }
          }

          &.user {
            justify-content: flex-end;

            .bubble {
              background: linear-gradient(145deg, #22c55e, #16a34a);
              color: white;
              border-bottom-right-radius: 8px;
              box-shadow: 
                6px 6px 12px rgba(34, 197, 94, 0.3),
                -6px -6px 12px rgba(255, 255, 255, 0.8);
              max-width: 70%;
            }
          }

          .bubble {
            padding: 14px 18px;
            border-radius: 20px;
            font-size: 15px;
            line-height: 1.4;
            word-break: break-word;
            position: relative;
          }

          .time {
            font-size: 12px;
            color: #718096;
            margin-top: 6px;
            text-align: right;
          }
        }
      }
    }
  }
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

</style>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { Mic, MicOff, VolumeX, Home, Heart, ShoppingBag, Monitor, User } from 'lucide-vue-next'

// 響應式狀態
const isListening = ref(false)
const isLoading = ref(false)
const conversations = ref([])
const currentTranscript = ref('')
const isSpeaking = ref(false)
const UUID = getOrCreateVisitorID()
const textInput = ref('')
const showTextInput = ref(false)
const showVoiceControls = ref(false)
const showAudioError = ref(false)
const isManuallyStopped = ref(false)
const showHistoryPage = ref(false)
const activeTab = ref('home')
let playbackConfirmed = false

// 語音識別和合成實例
let recognitionRef = null
let synthRef = null

// 計算屬性：按日期分組的歷史記錄
const groupedHistory = computed(() => {
  const groups = {}
  conversations.value.forEach(item => {
    const date = item.timestamp.split(' ')[0]
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
  })
  return groups
})

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekday = weekdays[date.getDay()]
  return `${year}/${month}/${day} (${weekday})`
}

// 設置活動標籤
const setActiveTab = (tab) => {
  activeTab.value = tab
  localStorage.setItem('activeTab', tab)
  
  // 如果點擊首頁，顯示語音控制
  if (tab === 'home') {
    showVoiceControls.value = true
  } else {
    showVoiceControls.value = false
  }
}

// 顯示歷史記錄
const showHistory = () => {
  showHistoryPage.value = true
}

// 關閉歷史記錄
const closeHistory = () => {
  showHistoryPage.value = false
}

// 切換文字輸入
const toggleTextInput = () => {
  showTextInput.value = !showTextInput.value
  if (showTextInput.value) {
    nextTick(() => {
      // 在手機上聚焦輸入框會自動彈出鍵盤
      if (textInputRef.value) {
        textInputRef.value.focus()
      }
    })
  }
}

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

  try {
    const response = await fetch("https://aiwisebalance.com/webhook/rag_response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatInput: transcript,
        sessionId: UUID,
        timestamp: new Date().toISOString()
      })
    })

    const text = await response.text()
    console.log("🔥 回傳原始內容：", text)
    let botResponse = ''

    try {
      const data = JSON.parse(text)
      if (data?.result || data?.response || data?.message) {
        botResponse = data.result || data.response || data.message
      } else {
        botResponse = '⚠️ AI 沒有提供內容。'
      }
    } catch (err) {
      botResponse = '⚠️ 無法解析伺服器回應。'
    }

    const newConversation = {
      id: Date.now(),
      user: transcript,
      bot: botResponse,
      timestamp: new Date().toLocaleString('zh-TW')
    }

    conversations.value.unshift(newConversation)
    saveConversations()
    speakText(botResponse)

  } catch (error) {
    console.error('API調用錯誤:', error)
    const errorResponse = '抱歉，服務暫時無法使用，請稍後再試。'
    
    const errorConversation = {
      id: Date.now(),
      user: transcript,
      bot: errorResponse,
      timestamp: new Date().toLocaleString('zh-TW')
    }

    conversations.value.unshift(errorConversation)
    saveConversations()
    speakText(errorResponse)
  }
}

// 語音播放文字
const speakText = (text) => {
  if (!synthRef || !text?.trim()) return

  const speak = () => {
    isManuallyStopped.value = false
    playbackConfirmed = false
    synthRef.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-TW'
    utterance.rate = 0.9
    utterance.pitch = 0.85
    utterance.volume = 1

    const resumeHack = setInterval(() => {
      if (!synthRef) return
      if (synthRef.paused) synthRef.resume()
      if (!synthRef.speaking) {
        clearInterval(resumeHack)
      }
    }, 200)

    utterance.onstart = () => {
      playbackConfirmed = true
      isSpeaking.value = true
    }
    
    utterance.onend = () => {
      isSpeaking.value = false
      isLoading.value = false
      clearInterval(resumeHack)
    }
    
    utterance.onerror = (e) => {
      isSpeaking.value = false
      isLoading.value = false
      clearInterval(resumeHack)
      if (!isManuallyStopped.value) {
        showAudioError.value = true
      }
      console.error("語音播放失敗", e)
    }

    try {
      if (synthRef.paused) synthRef.resume()
      synthRef.speak(utterance)

      setTimeout(() => {
        if (!playbackConfirmed && !isManuallyStopped.value && !synthRef.speaking) {
          showAudioError.value = true
          console.warn("裝置無法正常撥放語音")
        }
      }, 1500)

    } catch (err) {
      console.error("語音撥放錯誤", err)
      showAudioError.value = true
    }

    console.log("🗣 準備播放文字:", text)
  }

  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.onvoiceschanged = () => speak()
  } else {
    speak()
  }
}

// 停止語音播放
const stopSpeaking = () => {
  if (synthRef && process.client) {
    isManuallyStopped.value = true
    showAudioError.value = false
    synthRef.cancel()
    isSpeaking.value = false
  }
}

// 切換音量控制
const toggleVolume = () => {
  console.log('切換音量控制')
}

// 手動輸入處理
const handleManualInput = async () => {
  const input = textInput.value.trim()
  if (!input) return

  isLoading.value = true
  currentTranscript.value = ''
  textInput.value = ''

  try {
    const response = await fetch("https://aiwisebalance.com/webhook/rag_response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatInput: input,
        sessionId: UUID,
        timestamp: new Date().toISOString()
      })
    })

    const text = await response.text()
    let botResponse = ''

    try {
      const data = JSON.parse(text)
      botResponse = data?.result || data?.response || data?.message || '⚠️ AI 沒有提供內容。'
    } catch (err) {
      botResponse = '⚠️ 無法解析伺服器回應。'
    }

    const newConversation = {
      id: Date.now(),
      user: input,
      bot: botResponse,
      timestamp: new Date().toLocaleString('zh-TW')
    }

    conversations.value.unshift(newConversation)
    saveConversations()
    speakText(botResponse)

  } catch (error) {
    console.error('API調用錯誤:', error)
    const errorResponse = '抱歉，服務暫時無法使用，請稍後再試。'
    const errorConversation = {
      id: Date.now(),
      user: input,
      bot: errorResponse,
      timestamp: new Date().toLocaleString('zh-TW')
    }
    conversations.value.unshift(errorConversation)
    saveConversations()
    speakText(errorResponse)
  } finally {
    isLoading.value = false
  }
}

// 本地儲存對話記錄
const saveConversations = () => {
  if (process.client) {
    localStorage.setItem('chatConversations', JSON.stringify(conversations.value))
  }
}

// 載入本地對話記錄
const loadConversations = () => {
  if (process.client) {
    const saved = localStorage.getItem('chatConversations')
    if (saved) {
      try {
        conversations.value = JSON.parse(saved)
      } catch (e) {
        console.error('載入對話記錄失敗:', e)
      }
    }
  }
}

// 組件掛載時初始化
onMounted(() => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    synthRef = window.speechSynthesis
  }
  initSpeechRecognition()
  loadConversations()
  
  // 載入活動標籤
  const savedTab = localStorage.getItem('activeTab')
  if (savedTab) {
    activeTab.value = savedTab
  }
  
  // 如果當前是首頁，顯示語音控制
  if (activeTab.value === 'home') {
    showVoiceControls.value = true
  }
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
  const name = "WBSID"
  const existing = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1]

  if (existing) return existing

  const newID = crypto.randomUUID()
  document.cookie = `${name}=${newID}; path=/; max-age=31536000`
  return newID
}
</script>
