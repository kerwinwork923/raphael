<template>
  <div class="chat-wrapper">
    <!-- 聊天頭部 -->
    <div class="chat-header">
      <div class="avatar-container">
        <img
          class="avatar"
          :src="doctorPng"
          alt="角色頭像"
        />
      </div>
      <div class="character-name-btn">
        <span>角色姓名</span>

        <img :src="recycleSvg" alt="刷新" />
      </div>
    </div>

    <!-- 初始對話氣泡 -->
    <div class="greeting-bubble">
      <div v-if="isLoading" class="loading-indicator">
        <div class="spinner"></div>
        <span>正在思考...</span>
      </div>
      <div v-else-if="latestResponse" class="latest-response">
        {{ latestResponse }}
      </div>
      <div v-else class="greeting-text">
        嗨~~有什麼需要幫您
      </div>
      <button class="volume-control" @click="toggleVolume">
        <img :src="volumeSvg" alt="音量" />
      </button>
    </div>

    <!-- AI角色形象區域 -->
    <div class="character-section">
      <img
        :src="characterImageSrc"
        class="character-image"
        alt="AI角色"
        @click="handleCharacterClick"
      />
    </div>

    <!-- 語音控制區域 - 從下方彈出 -->
    <transition name="slide-up">
      <div v-if="showVoiceControls" class="voice-control-bar">
        <button class="control-btn history-btn" @click="showHistory">
          <img :src="timeSvg" alt="歷史紀錄" />
        </button>
        <button
          class="control-btn mic-btn"
          :class="{ listening: isListening }"
          @click="toggleListening"
          :disabled="isLoading"
        >
          <img :src="soundSvg" alt="語音" />

          <div v-if="isListening" class="pulse-ring"></div>
        </button>
        <button class="control-btn text-btn" @click="toggleTextInput">
          <img :src="keyboardSvg" alt="文字" />
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
      <div
        v-if="currentTranscript || isListening"
        class="transcript-display"
      >
        <p v-if="currentTranscript" class="transcript-text">
          {{ currentTranscript }}
        </p>
        <p v-else-if="isListening" class="transcript-text">請開始說話</p>
      </div>
    </transition>

    <!-- 底部導航列 -->
    <BottomNav />



    <!-- 錄音提示彈窗 -->
    <transition name="fade">
      <div v-if="isListening || showVoiceError" class="voice-modal" @click="closeVoiceModal">
        <div class="voice-content" @click.stop>
          <img
            :src="voiceModalImageSrc"
            alt="音波圖"
            class="voice-wave"
            @click="handleVoiceModalClick"
          />
          <p v-if="showVoiceError" class="voice-error-text">
            聽不太清楚，請再試一次
          </p>
          <p v-else-if="currentTranscript" class="transcript-text">
            {{ currentTranscript }}
          </p>
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
          <button @click="closeAudioError" class="alert-button">
            我知道了
          </button>
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
          <div
            v-for="(group, date) in groupedHistory"
            :key="date"
            class="history-group"
          >
            <div class="date-separator">{{ formatDate(date) }}</div>
            <div v-for="item in group" :key="item.id" class="history-message">
              <div class="message bot">
                <div class="avatar">🤖</div>
                <div class="bubble">{{ item.bot }}</div>
                <div class="time">{{ item.timestamp.split(" ")[1] }}</div>
              </div>
              <div class="message user">
                <div class="bubble">{{ item.user }}</div>
                <div class="time">{{ item.timestamp.split(" ")[1] }}</div>
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.greeting-bubble .loading-indicator {
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

.greeting-bubble .latest-response {
  font-size: 16px;
  line-height: 1.5;
  color: #2d3748;
  word-break: break-word;
  max-width: 100%;
}

.greeting-bubble .greeting-text {
  font-size: 16px;
  line-height: 1.5;
  color: #2d3748;
}

.volume-control {
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  position: absolute;
  right: 0;
  top: 110%;

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
    width: 100%;
    height: auto;
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
  border: 1px solid var(--Neutral-white, #fff);
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
    box-shadow: 0 0 12px 0 var(--Neutral-white, #fff),
      6px 6px 12px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
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
      background: linear-gradient(
        90deg,
        var(--primary-400-opacity-70, rgba(116, 188, 31, 0.7)) 0%,
        var(--Primary-default, #74bc1f) 100%
      );

      color: white;
      width: 60px;
      height: 60px;
      font-size: 26px;

      &.listening {
        background: linear-gradient(
          90deg,
          var(--primary-400-opacity-70, rgba(116, 188, 31, 0.7)) 0%,
          var(--Primary-default, #74bc1f) 100%
        );

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
  position: fixed;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  z-index: 10;

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

/* 語音模態框 */
.voice-modal {
  position: fixed;
  bottom: 0;
  left: 50%;

  transform: translateX(-50%);
  width: 100%;
  height: 375px;
  border-radius: 51px 51px 0 0;

  background: rgba(245, 247, 250, 0.1);
  backdrop-filter: blur(22px);
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

    .voice-error-text {
      margin-top: 16px;
      font-size: 16px;
      color: #e53e3e;
      font-weight: 600;
      text-align: center;
    }

    .transcript-text {
      margin-top: 16px;
      font-size: 16px;
      color: #2d3748;
      font-weight: 600;
      text-align: center;
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
    box-shadow: 0 4px 12px rgba(163, 177, 198, 0.6),
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
      box-shadow: 4px 4px 8px rgba(163, 177, 198, 0.6),
        -4px -4px 8px rgba(255, 255, 255, 0.8);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 6px 6px 12px rgba(163, 177, 198, 0.6),
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
      box-shadow: 4px 4px 8px rgba(163, 177, 198, 0.6),
        -4px -4px 8px rgba(255, 255, 255, 0.8);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 6px 6px 12px rgba(163, 177, 198, 0.6),
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
        box-shadow: 4px 4px 8px rgba(163, 177, 198, 0.6),
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
              box-shadow: 4px 4px 8px rgba(163, 177, 198, 0.6),
                -4px -4px 8px rgba(255, 255, 255, 0.8);
              border: 1px solid rgba(255, 255, 255, 0.3);
              margin-right: 12px;
              flex-shrink: 0;
            }

            .bubble {
              background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
              color: #2d3748;
              border-bottom-left-radius: 8px;
              box-shadow: 6px 6px 12px rgba(163, 177, 198, 0.6),
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
              box-shadow: 6px 6px 12px rgba(34, 197, 94, 0.3),
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
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import { useHead } from "#app";
import BottomNav from "~/components/BottomNav.vue";
import doctorPng from '~/assets/imgs/robot/doctor.png';
import recycleSvg from '~/assets/imgs/robot/recycle.svg';
import timeSvg from '~/assets/imgs/robot/time.svg';
import soundSvg from '~/assets/imgs/robot/sound.svg';
import keyboardSvg from '~/assets/imgs/robot/keyboard.svg';
import assistantSoundGif from '~/assets/imgs/robot/assistantSound.gif';
import assistantDefaultGif from '~/assets/imgs/robot/assistantDefault.gif';
import volumeSvg from '~/assets/imgs/robot/volume.svg';

// 響應式狀態
const isListening = ref(false);
const isLoading = ref(false);
const conversations = ref([]);
const currentTranscript = ref("");
const isSpeaking = ref(false);
const UUID = getOrCreateVisitorID();
const textInput = ref("");
const showTextInput = ref(false);
const showVoiceControls = ref(false);
const showAudioError = ref(false);
const isManuallyStopped = ref(false);
const showHistoryPage = ref(false);
const showVoiceError = ref(false);
const characterImageSrc = ref(doctorPng); // 角色圖片路徑
const voiceModalImageSrc = ref(assistantSoundGif); // 語音模態框圖片路徑
const textInputRef = ref(null); // 添加文字輸入框的 ref
const latestResponse = ref(""); // 最新回覆
let playbackConfirmed = false;
let voiceTimeout = null; // 語音識別超時計時器

// 語音識別和合成實例
let recognitionRef = null;
let synthRef = null;

// 計算屬性：按日期分組的歷史記錄
const groupedHistory = computed(() => {
  const groups = {};
  conversations.value.forEach((item) => {
    const date = item.timestamp.split(" ")[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
  });
  return groups;
});

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = weekdays[date.getDay()];
  return `${year}/${month}/${day} (${weekday})`;
};

// 設置活動標籤
const setActiveTab = (tab) => {
  if (process.client) {
    // 如果點擊首頁，顯示語音控制
    if (tab === "home") {
      showVoiceControls.value = true;
    } else {
      showVoiceControls.value = false;
    }
  }
};

// 顯示歷史記錄
const showHistory = () => {
  if (process.client) {
    showHistoryPage.value = true;
  }
};

// 關閉歷史記錄
const closeHistory = () => {
  if (process.client) {
    showHistoryPage.value = false;
  }
};

// 處理角色圖片點擊
const handleCharacterClick = () => {
  // 可以添加其他點擊處理邏輯
};

// 關閉語音模態框
const closeVoiceModal = () => {
  if (isListening.value) {
    if (process.client) {
      recognitionRef?.stop();
    }
    if (process.client) {
      isListening.value = false;
    }
  }
  if (process.client) {
    showVoiceError.value = false;
    currentTranscript.value = "";
    // 重置語音模態框圖片
    voiceModalImageSrc.value = assistantSoundGif;
  }
  // 清除超時計時器
  if (voiceTimeout) {
    clearTimeout(voiceTimeout);
    voiceTimeout = null;
  }
};

// 處理語音模態框圖片點擊
const handleVoiceModalClick = () => {
  if (showVoiceError.value && process.client) {
    showVoiceError.value = false;
    // 重新開始語音識別
    if (recognitionRef) {
      currentTranscript.value = "";
      // 切換回音波圖片
      voiceModalImageSrc.value = assistantSoundGif;
      recognitionRef.start();
      isListening.value = true;
      // 重新設置3秒超時
      startVoiceTimeout();
    }
  }
};

// 開始語音識別超時計時器
const startVoiceTimeout = () => {
  if (voiceTimeout) {
    clearTimeout(voiceTimeout);
  }
  voiceTimeout = setTimeout(() => {
    if (isListening.value && !currentTranscript.value.trim()) {
      showVoiceError.value = true;
      // 切換到預設圖片
      voiceModalImageSrc.value = assistantDefaultGif;
      if (process.client) {
        recognitionRef?.stop();
        isListening.value = false;
      }
    }
  }, 3000); // 3秒超時
};

// 切換文字輸入
const toggleTextInput = () => {
  if (process.client) {
    showTextInput.value = !showTextInput.value;
    if (showTextInput.value) {
      nextTick(() => {
        if (textInputRef.value) {
          textInputRef.value.focus();
        }
      });
    }
  }
};

// 初始化語音識別
const initSpeechRecognition = () => {
  if (process.client && typeof window !== 'undefined') {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef = new SpeechRecognition();
      recognitionRef.continuous = false;
      recognitionRef.interimResults = true;
      recognitionRef.lang = "zh-TW";

      recognitionRef.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");

        if (process.client) {
          currentTranscript.value = transcript;
        }

        if (event.results[0].isFinal) {
          // 清除超時計時器
          if (voiceTimeout) {
            clearTimeout(voiceTimeout);
            voiceTimeout = null;
          }
          handleSpeechEnd(transcript);
        }
      };

      recognitionRef.onerror = (event) => {
        if (process.client) {
          console.error("語音識別錯誤:", event.error);
        }
        if (process.client) {
          isListening.value = false;
          currentTranscript.value = "";
        }
        
        // 清除超時計時器
        if (voiceTimeout) {
          clearTimeout(voiceTimeout);
          voiceTimeout = null;
        }
        
        // 如果是沒有語音輸入的錯誤，顯示錯誤提示
        if ((event.error === 'no-speech' || event.error === 'audio-capture') && process.client) {
          showVoiceError.value = true;
          // 切換到預設圖片
          voiceModalImageSrc.value = assistantDefaultGif;
        }
      };

      recognitionRef.onend = () => {
        if (process.client) {
          isListening.value = false;
          // 如果沒有語音輸入且沒有轉錄內容，顯示錯誤提示
          if (!currentTranscript.value.trim()) {
            showVoiceError.value = true;
            // 切換到預設圖片
            voiceModalImageSrc.value = assistantDefaultGif;
          }
        }
        // 清除超時計時器
        if (voiceTimeout) {
          clearTimeout(voiceTimeout);
          voiceTimeout = null;
        }
      };
    }

    // 初始化語音合成
    if ("speechSynthesis" in window) {
      synthRef = window.speechSynthesis;
    }
  }
};

// 開始/停止語音識別
const toggleListening = () => {
  if (!recognitionRef) {
    if (process.client && typeof window !== 'undefined') {
      alert("您的瀏覽器不支援語音識別功能");
    }
    return;
  }

  if (isListening.value) {
    if (process.client) {
      recognitionRef.stop();
    }
    if (process.client) {
      isListening.value = false;
      currentTranscript.value = "";
    }
    // 清除超時計時器
    if (voiceTimeout) {
      clearTimeout(voiceTimeout);
      voiceTimeout = null;
    }
  } else {
    if (process.client) {
      currentTranscript.value = "";
      recognitionRef.start();
      isListening.value = true;
      // 開始3秒超時計時器
      startVoiceTimeout();
    }
  }
};

// 處理語音輸入結束
const handleSpeechEnd = async (transcript) => {
  if (!transcript.trim()) return;

  if (process.client) {
    isLoading.value = true;
    currentTranscript.value = "";
  }

  try {
    const response = await fetch(
      "https://aiwisebalance.com/webhook/rag_response",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatInput: transcript,
          sessionId: UUID,
          timestamp: new Date().toISOString(),
        }),
      }
    );

    const text = await response.text();
    if (process.client) {
      console.log("🔥 回傳原始內容：", text);
    }
    let botResponse = "";

    try {
      const data = JSON.parse(text);
      if (data?.result || data?.response || data?.message) {
        botResponse = data.result || data.response || data.message;
      } else {
        botResponse = "⚠️ AI 沒有提供內容。";
      }
    } catch (err) {
      botResponse = "⚠️ 無法解析伺服器回應。";
    }

    const newConversation = {
      id: Date.now(),
      user: transcript,
      bot: botResponse,
      timestamp: new Date().toLocaleString("zh-TW"),
    };

    conversations.value.unshift(newConversation);
    saveConversations();
    
    // 更新最新回覆
    if (process.client) {
      latestResponse.value = botResponse;
      speakText(botResponse);
    }
  } catch (error) {
    if (process.client) {
      console.error("API調用錯誤:", error);
    }
    const errorResponse = "抱歉，服務暫時無法使用，請稍後再試。";

    const errorConversation = {
      id: Date.now(),
      user: transcript,
      bot: errorResponse,
      timestamp: new Date().toLocaleString("zh-TW"),
    };

    conversations.value.unshift(errorConversation);
    saveConversations();
    
    // 更新最新回覆
    if (process.client) {
      latestResponse.value = errorResponse;
      speakText(errorResponse);
    }
  }
};

// 語音播放文字
const speakText = (text) => {
  if (!synthRef || !text?.trim() || !process.client) return;

  const speak = () => {
    if (!process.client) return;
    
    isManuallyStopped.value = false;
    playbackConfirmed = false;
    synthRef.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-TW";
    utterance.rate = 0.9;
    utterance.pitch = 0.85;
    utterance.volume = 1;

    const resumeHack = setInterval(() => {
      if (!synthRef || !process.client) return;
      if (synthRef.paused) synthRef.resume();
      if (!synthRef.speaking) {
        clearInterval(resumeHack);
      }
    }, 200);

    utterance.onstart = () => {
      if (!process.client) return;
      
      playbackConfirmed = true;
      isSpeaking.value = true;
    };

    utterance.onend = () => {
      if (process.client) {
        isSpeaking.value = false;
        isLoading.value = false;
      }
      clearInterval(resumeHack);
    };

    utterance.onerror = (e) => {
      if (process.client) {
        isSpeaking.value = false;
        isLoading.value = false;
        if (!isManuallyStopped.value) {
          showAudioError.value = true;
        }
        console.error("語音播放失敗", e);
      }
      clearInterval(resumeHack);
    };

    try {
      if (process.client) {
        if (synthRef.paused) synthRef.resume();
        synthRef.speak(utterance);
      }

      if (process.client) {
        setTimeout(() => {
          if (
            !playbackConfirmed &&
            !isManuallyStopped.value &&
            !synthRef.speaking
          ) {
            showAudioError.value = true;
            console.warn("裝置無法正常撥放語音");
          }
        }, 1500);
      }
    } catch (err) {
      if (process.client) {
        console.error("語音撥放錯誤", err);
        showAudioError.value = true;
      }
    }

    if (process.client) {
      console.log("🗣 準備播放文字:", text);
    }
  };

  if (process.client && synthRef && synthRef.getVoices().length === 0) {
    synthRef.onvoiceschanged = () => speak();
  } else if (process.client) {
    speak();
  }
};

// 停止語音播放
const stopSpeaking = () => {
  if (synthRef && process.client && typeof window !== 'undefined') {
    isManuallyStopped.value = true;
    showAudioError.value = false;
    synthRef.cancel();
    isSpeaking.value = false;
  }
};

// 切換音量控制
const toggleVolume = () => {
  if (process.client) {
    console.log("切換音量控制");
  }
};

// 關閉音頻錯誤提示
const closeAudioError = () => {
  if (process.client) {
    showAudioError.value = false;
  }
};

// 手動輸入處理
const handleManualInput = async () => {
  const input = textInput.value.trim();
  if (!input) return;

  if (process.client) {
    isLoading.value = true;
    currentTranscript.value = "";
    textInput.value = "";
  }

  try {
    const response = await fetch(
      "https://aiwisebalance.com/webhook/rag_response",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatInput: input,
          sessionId: UUID,
          timestamp: new Date().toISOString(),
        }),
      }
    );

    const text = await response.text();
    let botResponse = "";

    try {
      const data = JSON.parse(text);
      botResponse =
        data?.result ||
        data?.response ||
        data?.message ||
        "⚠️ AI 沒有提供內容。";
    } catch (err) {
      botResponse = "⚠️ 無法解析伺服器回應。";
    }

    const newConversation = {
      id: Date.now(),
      user: input,
      bot: botResponse,
      timestamp: new Date().toLocaleString("zh-TW"),
    };

    conversations.value.unshift(newConversation);
    saveConversations();
    
    // 更新最新回覆
    if (process.client) {
      latestResponse.value = botResponse;
      speakText(botResponse);
    }
  } catch (error) {
    if (process.client) {
      console.error("API調用錯誤:", error);
    }
    const errorResponse = "抱歉，服務暫時無法使用，請稍後再試。";
    const errorConversation = {
      id: Date.now(),
      user: input,
      bot: errorResponse,
      timestamp: new Date().toLocaleString("zh-TW"),
    };
    conversations.value.unshift(errorConversation);
    saveConversations();
    
    // 更新最新回覆
    if (process.client) {
      latestResponse.value = errorResponse;
      speakText(errorResponse);
    }
  } finally {
    if (process.client) {
      isLoading.value = false;
    }
  }
};

// 本地儲存對話記錄
const saveConversations = () => {
  if (process.client) {
    localStorage.setItem(
      "chatConversations",
      JSON.stringify(conversations.value)
    );
  }
};

// 載入本地對話記錄
const loadConversations = () => {
  if (process.client) {
    const saved = localStorage.getItem("chatConversations");
    if (saved) {
      try {
        conversations.value = JSON.parse(saved);
        // 載入最新回覆
        if (conversations.value.length > 0) {
          latestResponse.value = conversations.value[0].bot;
        }
      } catch (e) {
        if (process.client) {
          console.error("載入對話記錄失敗:", e);
        }
      }
    }
  }
};

// 組件掛載時初始化
onMounted(() => {
  if (process.client && typeof window !== "undefined" && "speechSynthesis" in window) {
    synthRef = window.speechSynthesis;
  }
  initSpeechRecognition();
  loadConversations();

  // 如果當前是首頁，顯示語音控制
  if (process.client) {
    showVoiceControls.value = true;
  }
});

// 組件卸載時清理
onUnmounted(() => {
  if (process.client && recognitionRef) {
    recognitionRef.stop();
  }
  if (process.client && synthRef) {
    synthRef.cancel();
  }
  // 清除超時計時器
  if (voiceTimeout) {
    clearTimeout(voiceTimeout);
  }
});

// SEO
useHead({
  title: "語音對話App",
  meta: [{ name: "description", content: "智能語音對話助手應用" }],
});

// 工具函數
function getOrCreateVisitorID() {
  if (typeof document === 'undefined') return 'default-session-id';
  
  const name = "WBSID";
  const existing = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];

  if (existing) return existing;

  const newID = crypto.randomUUID();
  document.cookie = `${name}=${newID}; path=/; max-age=31536000`;
  return newID;
}
</script>
