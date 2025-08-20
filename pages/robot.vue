<template>
  <div class="chat-wrapper">
    <!-- 聊天頭部 -->
    <div class="chat-header">
      <div class="avatar-container" @click="showCharacterModal">
        <img class="avatar" :src="currentCharacter.avatar" alt="角色頭像" />
      </div>
             <div class="character-name-btn" @click="showCharacterModal">
         <span>{{ currentCharacter.customName || currentCharacter.name }}</span>
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
      <div v-else class="greeting-text">嗨~~有什麼需要幫您</div>
      <button class="volume-control" @click="toggleVolume">
        <img :src="isMuted ? mutedSvg : volumeSvg" alt="音量" />
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
      <div v-if="currentTranscript || isListening" class="transcript-display">
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
      <div
        v-if="isListening || showVoiceError"
        class="voice-modal"
        @click="closeVoiceModal"
      >
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

    <!-- 角色選擇彈窗 -->
    <transition name="fade">
      <div
        v-if="showCharacterSelection"
        class="character-modal-overlay"
        @click="closeCharacterModal"
      >
        <div class="character-modal" @click.stop>
          <!-- 彈窗頭部 -->
          <div class="character-modal-header">
            <img
              src="/_nuxt/assets/imgs/backArrow.svg"
              @click="closeCharacterModal"
              alt="返回"
              class="back-arrow"
            />
            <h2 class="modal-title">切換角色</h2>
          </div>

          <!-- 當前選擇角色標籤 -->
          <div class="current-character-tag">
            <span
              >{{ currentCharacter.customName || currentCharacter.displayName }}
              <img
                src="/assets/imgs/robot/edit_green.svg"
                alt="編輯"
                class="edit-icon"
                @click="showNameInputModal"
              />
            </span>
          </div>

          <!-- 主要角色展示區域 -->
          <div class="main-character-area">
            <div class="character-display">
              <img
                :src="currentCharacter.fullImage"
                alt="角色形象"
                class="character-full-image"
              />
            </div>

            <!-- 右側造型選擇 -->
            <div class="style-selector">
              <div class="style-header">
                <span>更換造型</span>
              </div>

              <div class="style-grid" :class="{ expanded: isStyleExpanded }">
                <div
                  v-for="style in visibleStyles"
                  :key="style.id"
                  class="style-item"
                  :class="{ active: currentCharacter.styleId === style.id }"
                  @click="selectStyle(style)"
                >
                  <img :src="style.thumbnail" alt="造型" />
                </div>
              </div>
            </div>
          </div>

          <!-- 確定按鈕 -->
          <button class="confirm-btn" @click="confirmCharacterSelection">
            確定
          </button>

          <!-- 底部角色切換區域 -->
          <div class="character-switch-area">
            <div class="character-scroll-container">
              <div
                v-for="character in availableCharacters"
                :key="character.id"
                class="character-option"
                :class="{ selected: currentCharacter.id === character.id }"
                @click="selectCharacter(character)"
              >
                <div class="character-circle">
                  <img :src="character.avatar" alt="角色" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 歷史紀錄頁面 -->
    <transition name="slide-left">
      <div v-if="showHistoryPage" class="history-page">
        <div class="history-header">
          <img
            src="/_nuxt/assets/imgs/backArrow.svg"
            @click="closeHistory"
            alt="返回"
            class="back-arrow"
          />

          <!-- 絕對置中的標題 -->
          <div class="title-center">
            <transition name="fade">
              <h2 v-if="!showSearch" class="history-title">聊天紀錄</h2>
            </transition>
          </div>

          <!-- 右側圖示群（固定寬度佔位）-->
          <div class="right-icons">
            <transition name="fade">
              <img
                v-if="!showSearch"
                :src="searchSvg"
                alt="搜尋"
                @click="toggleSearch"
                class="search-icon"
              />
            </transition>
            <img :src="calendarSvg" alt="日曆" class="calendar-icon" @click="toggleCalendar" />
          </div>

          <!-- 搜尋欄位（覆蓋整列）-->
          <transition name="slide-search">
            <div v-if="showSearch" class="search-container">
              <img :src="searchSvg" alt="搜尋" class="search-input-icon" />
              <input
                v-model="searchQuery"
                @input="performSearch"
                @keyup.enter="performSearch"
                type="text"
                placeholder="搜尋對話內容"
                class="search-input"
                ref="searchInputRef"
              />
              <img
                src="/_nuxt/assets/imgs/close.svg"
                alt="關閉"
                @click="toggleSearch"
                class="close-search-icon"
              />
            </div>
          </transition>
        </div>

        <div class="history-content" ref="historyScrollContainer" @scroll="handleHistoryScroll">
          <!-- Sticky 日期標籤 -->
          <transition name="fade">
            <div v-if="showStickyHeader && stickyDateHeader" class="sticky-date-header">
              {{ stickyDateHeader }}
            </div>
          </transition>
          
          <!-- 載入更舊訊息指示器 -->
          <transition name="fade">
            <div v-if="isLoadingOlderMessages" class="loading-older-messages">
              <div class="spinner"></div>
              <span>載入更舊的訊息...</span>
            </div>
          </transition>
          
          <!-- 一般歷史記錄 -->
          <transition name="fade">
            <div v-if="!showSearch || searchQuery === ''" class="history-list">
              <div
                v-for="(group, date) in groupedHistory"
                :key="date"
                class="history-group"
              >
                <div class="date-separator">{{ formatDate(date) }}</div>
                <div
                  v-for="item in group"
                  :key="item.id"
                  class="history-message"
                  :id="`message-${item.id}`"
                >
                  <div class="message bot">
                    <div class="avatar">
                      <img :src="currentCharacter.avatar" alt="角色頭像" />
                    </div>
                    <div class="bubble">
                      {{ item.bot }}
                      <div class="time">{{ formatTime(item.timestamp) }}</div>
                    </div>
                  </div>
                  <div class="message user">
                    <div class="bubble">
                      {{ item.user }}
                      <div class="time">{{ formatTime(item.timestamp) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <!-- 搜尋結果 -->
          <transition name="fade">
            <div
              v-if="showSearch && searchQuery && searchResults.length > 0"
              class="search-results"
            >
              <div class="search-results-header">
                <span>總共 {{ searchResults.length }}筆</span>
              </div>
              <div
                v-for="result in searchResults"
                :key="result.id"
                class="search-result-item"
                @click="scrollToMessage(result.id)"
              >
                <div class="result-content">
                  <div class="result-title">
                    <span class="user-name">{{
                      result.userName || "用戶"
                    }}</span>
                    <span class="result-date">{{
                      formatDate(result.timestamp.split(" ")[0])
                    }}</span>
                  </div>
                  <div class="result-messages">
                    <div class="message-preview bot-message">
                      <div class="avatar">
                        <img :src="currentCharacter.avatar" alt="角色頭像" />
                      </div>
                      <div class="bubble">
                        <span
                          v-html="highlightKeyword(result.bot, searchQuery)"
                        ></span>
                        <div class="time">
                          {{ formatTime(result.timestamp) }}
                        </div>
                      </div>
                    </div>
                    <div class="message-preview user-message">
                      <div class="bubble">
                        <span
                          v-html="highlightKeyword(result.user, searchQuery)"
                        ></span>
                        <div class="time">
                          {{ formatTime(result.timestamp) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <!-- 無搜尋結果 -->
          <transition name="fade">
            <div
              v-if="showSearch && searchQuery && searchResults.length === 0"
              class="no-results"
            >
              <div class="no-results-content">
                <span>沒有找到相關對話</span>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </transition>

    <!-- 角色名稱輸入彈窗 -->
    <transition name="fade">
      <div v-if="showNameInput" class="name-input-overlay" @click="closeNameInput">
        <div class="name-input-modal" @click.stop>
          <h3 class="name-input-title">幫角色取一個名字吧</h3>
          <input
            v-model="characterNameInput"
            type="text"
            class="name-input-field"
            placeholder="請輸入角色名稱"
            @keyup.enter="confirmNameInput"
            ref="nameInputRef"
          />
          <div v-if="nameInputError" class="name-input-error">
            {{ nameInputError }}
          </div>
          <div class="name-input-buttons">
            <button class="name-input-cancel" @click="closeNameInput">
              取消
            </button>
            <button class="name-input-confirm" @click="confirmNameInput">
              確定
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 日曆選擇彈窗 -->
    <transition name="fade">
      <div v-if="showCalendar" class="calendar-overlay" @click="toggleCalendar">
        <div class="calendar-modal" @click.stop>
          <div class="calendar-header">
            <h3 class="calendar-title">選擇日期</h3>
            <img
              src="/_nuxt/assets/imgs/close.svg"
              alt="關閉"
              @click="toggleCalendar"
              class="calendar-close"
            />
          </div>
          <div class="calendar-content">
            <div class="calendar-dates">
              <div
                v-for="date in calendarDatesWithHistory"
                :key="date"
                class="calendar-date-item"
                :class="{ selected: selectedDate === date }"
                @click="selectCalendarDate(date)"
              >
                {{ formatDate(date) }}
              </div>
            </div>
            <div v-if="calendarDatesWithHistory.length === 0" class="no-dates">
              暫無聊天記錄
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
      color: var(--Neutral-black, #1e1e1e);
      text-align: center;
      font-family: "Noto Sans";
      font-size: var(--Text-font-size-20, 20px);
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      text-transform: lowercase;
      position: absolute;
      bottom: 27%;
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
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;

    gap: 10px;

    .back-arrow {
      width: 24px;
      height: 24px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    .title-center {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
    }

    .history-title {
      font-size: 20px;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
      pointer-events: auto;
    }

    .right-icons {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      min-width: 56px;
    }

    .search-icon {
      width: 24px;
      height: 24px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    .calendar-icon {
      width: 24px;
      height: 24px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  /* 搜尋容器 */
  .search-container {
    position: absolute;
    inset: 8px 12px auto 20px;
    z-index: 2;
    display: flex;
    align-items: center;

    padding: 12px 16px;
    border-radius: var(--Radius-r-16, 16px);
    background: var(--Secondary-100, #f5f7fa);
    box-shadow: -4px -4px 6px 0 var(--Neutral-white, #fff) inset,
      4px 4px 6px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4))
        inset;
    transform-origin: right center;

    .search-input-icon {
      width: 20px;
      height: 20px;
      margin-right: 12px;
      opacity: 1;
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 16px;
      color: #2d3748;
      outline: none;

      &::placeholder {
        color: #718096;
      }
    }

    .clear-search-icon {
      width: 18px;
      height: 18px;
      cursor: pointer;
      opacity: 1;
      transition: opacity 0.3s ease;

      &:hover {
        opacity: 1;
      }
    }

    .close-search-icon {
      width: 24px;
      height: 24px;
      cursor: pointer;
      transition: all 0.3s ease;
      opacity: 1;
      margin-left: 12px;

      &:hover {
        opacity: 1;
        transform: scale(1.1);
      }
    }
  }

  /* 搜尋結果 */
  .search-results {
    .search-results-header {
      padding: 16px 20px;
      text-align: center;
      font-size: 14px;
      color: #718096;
      background: rgba(255, 255, 255, 0.5);
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }

    .search-result-item {
      margin-bottom: 20px;
    }
  }

  /* 無搜尋結果 */
  .no-results {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;

    .no-results-content {
      text-align: center;
      color: #718096;
      font-size: 16px;
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
        border-radius: var(--Radius-r-20, 20px);
        background: var(--Secondary-100, #f5f7fa);
        box-shadow: 0 0 6px 0
          var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
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

              margin-top: auto;
              transform: translateY(20px);
              //跟人物頭像一樣
              overflow: hidden;
              border-radius: 20px;
              background: var(--Neutral-white, #fff);
              box-shadow: 0 6px 6px 0
                var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
              border: 1px solid rgba(255, 255, 255, 0.3);
              margin-right: 12px;
              flex-shrink: 0;
              margin-top: auto;
              transform: translateY(20px);
              overflow: hidden;
              border-radius: 20px;
            }

            .bubble {
              background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
              color: #2d3748;
              border-radius: var(--Radius-r-20, 20px) var(--Radius-r-20, 20px)
                var(--Radius-r-20, 20px) 0;
              background: var(--Neutral-white, #fff);
              box-shadow: 0 6px 6px 0
                var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
              max-width: 70%;
            }
          }

          &.user {
            justify-content: flex-end;

            .bubble {
              border-radius: var(--Radius-r-20, 20px) 0 var(--Radius-r-20, 20px)
                var(--Radius-r-20, 20px);
              background: var(--Primary-default, #74bc1f);
              box-shadow: 6px 6px 12px 0
                var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
              color: white;
              width: 250px;
            }

            .time {
              color: white;
            }
          }

          .bubble {
            padding: 14px 18px 28px 18px;
            border-radius: 20px;
            font-size: 15px;
            line-height: 1.4;
            word-break: break-word;
            position: relative;
          }

          .time {
            font-size: 11px;
            color: #718096;
            position: absolute;
            bottom: 8px;
            right: 12px;
            opacity: 0.8;
          }
        }
      }
    }
  }

  // Sticky 日期標籤
  .sticky-date-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 12px 20px;
    text-align: center;
    font-size: 14px;
    color: #718096;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin: 0 -20px 20px -20px;
  }

  // 載入更舊訊息指示器
  .loading-older-messages {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: #718096;
    font-size: 14px;
    gap: 8px;

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #e2e8f0;
      border-top: 2px solid #74bc1f;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
}

/* 搜尋圖標淡入淡出動畫 */
.slide-search-icon-enter-active,
.slide-search-icon-leave-active {
  transition: opacity 0.2s ease;
}

.slide-search-icon-enter-from,
.slide-search-icon-leave-to {
  opacity: 0;
}

/* 搜尋框滑出動畫 */
.slide-search-enter-active {
  transition: all 0.5s ease;
  transition-delay: 0.2s;
}

.slide-search-leave-active {
  transition: all 0.3s ease;
}

.slide-search-enter-from {
  transform: scaleX(0);
  opacity: 0;
}

.slide-search-leave-to {
  transform: scaleX(0);
  opacity: 0;
}

/* 左滑動畫 */
.slide-left-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0.055, 0.675, 0.19);
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* 搜尋結果樣式 */
.search-results {
  .search-results-header {
    padding: 16px 20px;
    text-align: center;
    font-size: 14px;
    color: #718096;
    background: rgba(255, 255, 255, 0.5);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  }

  .search-result-item {
    margin: 12px 20px;
    padding: 16px;
    border-radius: 16px;
    background: var(--Secondary-100, #f5f7fa);
    box-shadow: -4px -4px 6px 0 var(--Neutral-white, #fff) inset,
      4px 4px 6px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4))
        inset;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: -6px -6px 8px 0 var(--Neutral-white, #fff) inset,
        6px 6px 8px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4))
          inset;
    }

    &:active {
      transform: translateY(0);
      box-shadow: -2px -2px 4px 0 var(--Neutral-white, #fff) inset,
        2px 2px 4px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4))
          inset;
    }

    .result-content {
      .result-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(177, 192, 216, 0.2);

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
        }

        .result-date {
          font-size: 12px;
          color: #718096;
        }
      }

      .result-messages {
        .message-preview {
          display: flex;
          align-items: flex-start;
          margin-bottom: 8px;

          &.bot-message {
            justify-content: flex-start;

            .avatar {
              width: 28px;
              height: 28px;
              border-radius: 14px;
              overflow: hidden;
              margin-right: 8px;
              flex-shrink: 0;
              background: var(--Neutral-white, #fff);
              box-shadow: 0 2px 4px 0
                var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
              border: 1px solid rgba(255, 255, 255, 0.3);

              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }

            .bubble {
              background: var(--Neutral-white, #fff);
              color: #2d3748;
              border-radius: 12px 12px 12px 0;
              box-shadow: 0 2px 4px 0
                var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
              max-width: 80%;
              padding: 8px 12px 20px 12px;
              font-size: 13px;
              line-height: 1.3;
              position: relative;
            }
          }

          &.user-message {
            justify-content: flex-end;

            .bubble {
              border-radius: 12px 0 12px 12px;
              background: var(--Primary-default, #74bc1f);
              box-shadow: 2px 2px 4px 0
                var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
              color: white;
              max-width: 80%;
              padding: 8px 12px 20px 12px;
              font-size: 13px;
              line-height: 1.3;
              position: relative;

              .time {
                color: rgba(255, 255, 255, 0.8);
              }
            }
          }

          .time {
            font-size: 10px;
            color: #718096;
            position: absolute;
            bottom: 4px;
            right: 8px;
            opacity: 0.8;
          }
        }
      }
    }
  }
}

/* 關鍵字高亮 */
.highlight {
  background: linear-gradient(120deg, #ffd700 0%, #ffed4e 100%);
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 600;
  color: #1a202c;
  box-shadow: 0 1px 2px rgba(255, 215, 0, 0.3);
}

/* 角色選擇彈窗樣式 */
.character-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.character-modal {
  width: 100%;

  height: 100%;
  background: linear-gradient(135deg, #e0e5ec 0%, #f0f4f8 100%);

  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);

  .character-modal-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    position: relative;
    border-bottom: 1px solid rgba(177, 192, 216, 0.2);

    .back-arrow {
      position: absolute;
      left: 20px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    .modal-title {
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }
  }

  .current-character-tag {
    padding: 12px 20px;

    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
    span {
      display: inline-block;
      padding: 4px 16px 6px;
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Secondary-100, #f5f7fa);
      box-shadow: -6px -6px 12px 0 var(--Neutral-white, #fff),
        6px 6px 12px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
      color: var(--Primary-default, #74bc1f);

      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;

      letter-spacing: 2.7px;
      display: flex;
      align-items: center;
      gap: 2px;
    }
  }

  .main-character-area {
    flex: 1;
    display: flex;
    padding: 16px;
    gap: 2px;
    position: relative;
    .character-display {
      flex: 1;
      display: flex;
      align-items: start;

      .character-full-image {
        height: auto;

        object-fit: contain;
        border-radius: 12px;
      }
    }

    .style-selector {
      position: absolute;
      right: 2.5%;
      top: 0;
      padding-bottom: 0.5rem;
      width: 80px;
      display: flex;
      flex-direction: column;
      align-items: center;
      border-radius: var(--Radius-r-8, 8px);
      background: var(--Secondary-100, #f5f7fa);
      box-shadow: -6px -6px 12px 0 var(--Neutral-white, #fff),
        6px 6px 12px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
      height: auto;
      max-height: 480px;
      .style-header {
        display: flex;
        flex-direction: column;
        align-items: center;

        gap: 8px;

        span {
          color: #4a5568;
          text-align: center;
          font-weight: 500;
          color: var(--Neutral-black, #1e1e1e);
          margin-top: 0.5rem;
          font-size: var(--Text-font-size-14, 14px);
          font-style: normal;
          font-weight: 400;

          letter-spacing: 2.1px;
        }

        .expand-icon {
          width: 20px;
          height: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          filter: opacity(0.7);

          &:hover {
            filter: opacity(1);
            transform: scale(1.1);
          }

          &.rotated {
            transform: rotate(180deg);
          }
        }
      }

      .style-grid {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 8px;

        overflow: hidden;
        transition: max-height 0.3s ease;

        .style-item {
          width: 60px;
          height: 60px;
          border-radius: 50%;

          cursor: pointer;
          transition: all 0.3s ease;
          background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
          box-shadow: 4px 4px 8px rgba(163, 177, 198, 0.6),
            -4px -4px 8px rgba(255, 255, 255, 0.8);
          border: 2px solid transparent;
          margin: 0.5rem 0.5rem 0;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 6px 6px 12px rgba(163, 177, 198, 0.6),
              -6px -6px 12px rgba(255, 255, 255, 0.8);
          }

          &.active {
            border-color: var(--Primary-default, #74bc1f);
            box-shadow: 0 0 8px rgba(116, 188, 31, 0.4),
              4px 4px 8px rgba(163, 177, 198, 0.6),
              -4px -4px 8px rgba(255, 255, 255, 0.8);
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: top;
          }
        }
      }
    }
  }

  .confirm-btn {
    position: absolute;
    bottom: 18%;
    left: 50%;
    transform: translateX(-50%);

    padding: 4px 24px;

    color: var(--Neutral-white, #fff);

    font-size: var(--Text-font-size-18, 18px);
    font-style: normal;
    font-weight: 400;

    letter-spacing: 2.7px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: var(--Radius-r-50, 50px);
    background: linear-gradient(
      90deg,
      var(--primary-400-opacity-70, rgba(116, 188, 31, 0.7)) 0%,
      var(--Primary-default, #74bc1f) 100%
    );
    box-shadow: -6px -6px 12px 0 var(--Neutral-white, #fff),
      6px 6px 12px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));

    &:hover {
      transform: translateY(-2px);
      box-shadow: 8px 8px 16px rgba(116, 188, 31, 0.3),
        -8px -8px 16px rgba(255, 255, 255, 0.8);
    }

    &:active {
      transform: translateY(0);
      box-shadow: inset 4px 4px 8px rgba(90, 154, 23, 0.6),
        inset -4px -4px 8px rgba(139, 219, 43, 0.6);
    }
  }

  .character-switch-area {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 20px 0;
    border-top: 1px solid rgba(177, 192, 216, 0.2);
    border-radius: 20px 20px 0 0;
    background: var(--Secondary-100, #f5f7fa);
    box-shadow: -6px -6px 12px 0 var(--Neutral-white, #fff),
      6px 6px 12px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));

    .character-scroll-container {
      display: flex;
      gap: 16px;
      padding: 0 20px;
      overflow-x: auto;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;

      /* 隱藏滾動條但保持功能 */
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE and Edge */
      &::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }

      /* 確保顯示3.2個角色的比例 */
      .character-option {
        flex: 0 0 calc(100% / 3.2);
        min-width: calc(100% / 3.2);
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        justify-content: center;

        .character-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
          box-shadow: 4px 4px 8px rgba(163, 177, 198, 0.6),
            -4px -4px 8px rgba(255, 255, 255, 0.8);
          border: 3px solid transparent;
          transition: all 0.3s ease;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: top;
          }
        }

        &:hover .character-circle {
          transform: translateY(-2px);
          box-shadow: 6px 6px 12px rgba(163, 177, 198, 0.6),
            -6px -6px 12px rgba(255, 255, 255, 0.8);
        }

        &.selected .character-circle {
          border-color: var(--Primary-default, #74bc1f);
          box-shadow: 0 0 12px rgba(116, 188, 31, 0.4),
            4px 4px 8px rgba(163, 177, 198, 0.6),
            -4px -4px 8px rgba(255, 255, 255, 0.8);
        }
      }
    }
  }
}

/* 淡入淡出動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 角色名稱輸入彈窗樣式 */
.name-input-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.name-input-modal {
  background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
  padding: 24px;
  border-radius: 20px;
  box-shadow: 12px 12px 24px rgba(163, 177, 198, 0.6),
    -12px -12px 24px rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  width: 90%;
  max-width: 320px;
  text-align: center;

  .name-input-title {
    font-size: 18px;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 20px 0;
  }

  .name-input-field {
    width: 100%;
    padding: 12px 16px;
    border: none;
    border-radius: 12px;
    background: var(--Secondary-100, #f5f7fa);
    box-shadow: inset 4px 4px 8px rgba(163, 177, 198, 0.6),
      inset -4px -4px 8px rgba(255, 255, 255, 0.8);
    font-size: 16px;
    color: #2d3748;
    outline: none;
    margin-bottom: 16px;

    &::placeholder {
      color: #718096;
    }
  }

  .name-input-error {
    color: #e53e3e;
    font-size: 14px;
    margin-bottom: 16px;
    min-height: 20px;
  }

  .name-input-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;

    button {
      padding: 10px 20px;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;

      &.name-input-cancel {
        background: var(--Secondary-100, #f5f7fa);
        color: #718096;
        box-shadow: 4px 4px 8px rgba(163, 177, 198, 0.6),
          -4px -4px 8px rgba(255, 255, 255, 0.8);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 6px 6px 12px rgba(163, 177, 198, 0.6),
            -6px -6px 12px rgba(255, 255, 255, 0.8);
        }
      }

      &.name-input-confirm {
        background: linear-gradient(145deg, var(--Primary-default, #74bc1f), #5a9a17);
        color: white;
        box-shadow: 4px 4px 8px rgba(116, 188, 31, 0.3),
          -4px -4px 8px rgba(255, 255, 255, 0.8);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 6px 6px 12px rgba(116, 188, 31, 0.3),
            -6px -6px 12px rgba(255, 255, 255, 0.8);
        }
      }
    }
  }
}

// 日曆選擇彈窗樣式
.calendar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.calendar-modal {
  background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
  padding: 24px;
  border-radius: 20px;
  box-shadow: 12px 12px 24px rgba(163, 177, 198, 0.6),
    -12px -12px 24px rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;

  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);

    .calendar-title {
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }

    .calendar-close {
      width: 24px;
      height: 24px;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.3s ease;

      &:hover {
        opacity: 1;
      }
    }
  }

  .calendar-content {
    .calendar-dates {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .calendar-date-item {
        padding: 12px 16px;
        border-radius: 12px;
        background: var(--Secondary-100, #f5f7fa);
        box-shadow: inset 4px 4px 8px rgba(163, 177, 198, 0.6),
          inset -4px -4px 8px rgba(255, 255, 255, 0.8);
        font-size: 14px;
        color: #2d3748;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 4px 4px 8px rgba(163, 177, 198, 0.6),
            -4px -4px 8px rgba(255, 255, 255, 0.8);
        }

        &.selected {
          background: linear-gradient(145deg, var(--Primary-default, #74bc1f), #5a9a17);
          color: white;
          box-shadow: 4px 4px 8px rgba(116, 188, 31, 0.3),
            -4px -4px 8px rgba(255, 255, 255, 0.8);
        }
      }
    }

    .no-dates {
      text-align: center;
      color: #718096;
      font-size: 14px;
      padding: 20px;
    }
  }
}
</style>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import { useHead } from "#app";
import BottomNav from "~/components/BottomNav.vue";
// 移除import，改用動態路徑
import recycleSvg from "~/assets/imgs/robot/recycle.svg";
import timeSvg from "~/assets/imgs/robot/time.svg";
import soundSvg from "~/assets/imgs/robot/sound.svg";
import keyboardSvg from "~/assets/imgs/robot/keyboard.svg";
import assistantSoundGif from "~/assets/imgs/robot/assistantSound.gif";
import assistantDefaultGif from "~/assets/imgs/robot/assistantDefault.gif";
import volumeSvg from "~/assets/imgs/robot/volume.svg";
import mutedSvg from "~/assets/imgs/robot/muted.svg";
import searchSvg from "~/assets/imgs/robot/search.svg";
import calendarSvg from "~/assets/imgs/robot/calendar.svg";

// 響應式狀態
const isListening = ref(false);
const isLoading = ref(false);
const conversations = ref([]);
const currentTranscript = ref("");
const isSpeaking = ref(false);
const isMuted = ref(false); // 靜音狀態
const UUID = getOrCreateVisitorID();
const textInput = ref("");
const showTextInput = ref(false);
const showVoiceControls = ref(false);
const showAudioError = ref(false);
const isManuallyStopped = ref(false);
const showHistoryPage = ref(false);
const showVoiceError = ref(false);
import doctor from "~/assets/imgs/robot/character/doctor.png";
import doctor2 from "~/assets/imgs/robot/character/doctor2.png";
import doctor3 from "~/assets/imgs/robot/character/doctor3.png";
import doctor4 from "~/assets/imgs/robot/character/doctor4.png";
import doctor5 from "~/assets/imgs/robot/character/doctor5.png";
import doctor6 from "~/assets/imgs/robot/character/doctor6.png";
import girl1_1 from "~/assets/imgs/robot/character/girl1_1.png";
import girl1_2 from "~/assets/imgs/robot/character/girl1_2.png";
import girl1_3 from "~/assets/imgs/robot/character/girl1_3.png";
import girl2_1 from "~/assets/imgs/robot/character/girl2_1.png";
import girl2_2 from "~/assets/imgs/robot/character/girl2_2.png";
import girl3_1 from "~/assets/imgs/robot/character/girl3_1.png";
import girl3_2 from "~/assets/imgs/robot/character/girl3_2.png";
import girl4_1 from "~/assets/imgs/robot/character/girl4_1.png";
import girl4_2 from "~/assets/imgs/robot/character/girl4_2.png";
import girl5_1 from "~/assets/imgs/robot/character/girl5_1.png";
import girl5_2 from "~/assets/imgs/robot/character/girl5_2.png";
import man1_1 from "~/assets/imgs/robot/character/man1_1.png";
import man1_2 from "~/assets/imgs/robot/character/man1_2.png";
import man2_1 from "~/assets/imgs/robot/character/man2_1.png";
import man2_2 from "~/assets/imgs/robot/character/man2_2.png";
import man3_1 from "~/assets/imgs/robot/character/man3_1.png";
import man3_2 from "~/assets/imgs/robot/character/man3_2.png";
import man3_3 from "~/assets/imgs/robot/character/man3_3.png";
import man4_1 from "~/assets/imgs/robot/character/man4_1.png";
import man4_2 from "~/assets/imgs/robot/character/man4_2.png";
import man5_1 from "~/assets/imgs/robot/character/man5_1.png";
import man5_2 from "~/assets/imgs/robot/character/man5_2.png";
import man6_1 from "~/assets/imgs/robot/character/man6_1.png";
import man6_2 from "~/assets/imgs/robot/character/man6_2.png";
import pet1_1 from "~/assets/imgs/robot/character/pet1_1.png";
import pet1_2 from "~/assets/imgs/robot/character/pet1_2.png";
import pet2_1 from "~/assets/imgs/robot/character/pet2_1.png";
import pet2_2 from "~/assets/imgs/robot/character/pet2_2.png";
import pet3_1 from "~/assets/imgs/robot/character/pet3_1.png";
import pet3_2 from "~/assets/imgs/robot/character/pet3_2.png";
import pet4_1 from "~/assets/imgs/robot/character/pet4_1.png";
import pet4_2 from "~/assets/imgs/robot/character/pet4_2.png";

const characterImageSrc = ref(doctor);

const voiceModalImageSrc = ref(assistantSoundGif); // 語音模態框圖片路徑
const textInputRef = ref(null); // 添加文字輸入框的 ref
const searchInputRef = ref(null); // 添加搜尋輸入框的 ref
const nameInputRef = ref(null); // 添加名稱輸入框的 ref
const latestResponse = ref(""); // 最新回覆
const showSearch = ref(false); // 搜尋功能開關
const searchQuery = ref(""); // 搜尋關鍵字
const searchResults = ref([]); // 搜尋結果

// 角色選擇相關狀態
const showCharacterSelection = ref(false); // 顯示角色選擇彈窗
const isStyleExpanded = ref(false); // 造型是否展開
const expandStylesIcon = ref("/_nuxt/assets/imgs/arrowDown.svg"); // 展開圖標

// 角色命名相關狀態
const showNameInput = ref(false); // 顯示名稱輸入彈窗
const characterNameInput = ref(""); // 角色名稱輸入
const nameInputError = ref(""); // 名稱輸入錯誤訊息

// 新增：聊天歷史改進相關變數
const historyScrollContainer = ref(null);
const isScrolling = ref(false);
const scrollTimeout = ref(null);
const stickyDateHeader = ref("");
const showStickyHeader = ref(false);
const isLoadingOlderMessages = ref(false);
const hasMoreMessages = ref(true);
const currentPage = ref(1);
const messagesPerPage = ref(20);

// 日曆相關
const showCalendar = ref(false);
const selectedDate = ref(null);
const calendarDatesWithHistory = ref([]);

// 角色數據
const currentCharacter = ref({
  id: 1,
  name: "芷澄",
  displayName: "芷澄",
  avatar: doctor,
  fullImage: doctor,
  styleId: 1,
  customName: "芷澄", // 自定義名稱
  voiceSettings: {
    rate: 0.9,
    pitch: 0.85,
    volume: 1
  }
});

const availableCharacters = ref([
  {
    id: 1,
    name: "芷澄",
    displayName: "芷澄",
    avatar: doctor,
    fullImage: doctor,
    customName: "芷澄",
    voiceSettings: {
      rate: 0.9,
      pitch: 0.85,
      volume: 1
    },
    styles: [
      { id: 1, thumbnail: doctor, fullImage: doctor },
      { id: 2, thumbnail: doctor2, fullImage: doctor2 },
      { id: 3, thumbnail: doctor3, fullImage: doctor3 },
      { id: 4, thumbnail: doctor4, fullImage: doctor4 },
      { id: 5, thumbnail: doctor5, fullImage: doctor5 },
      { id: 6, thumbnail: doctor6, fullImage: doctor6 },
    ],
  },
  {
    id: 2,
    name: "蕾紗",
    displayName: "蕾紗",
    avatar: girl1_1,
    fullImage: girl1_1,
    customName: "蕾紗",
    voiceSettings: {
      rate: 0.95,
      pitch: 0.9,
      volume: 1
    },
    styles: [
      { id: 1, thumbnail: girl1_1, fullImage: girl1_1 },
      { id: 2, thumbnail: girl1_2, fullImage: girl1_2 },
      { id: 3, thumbnail: girl1_3, fullImage: girl1_3 },
    ],
  },
  {
    id: 3,
    name: "沁瑤",
    displayName: "沁瑤",
    avatar: girl2_1,
    fullImage: girl2_1,
    customName: "沁瑤",
    voiceSettings: {
      rate: 0.9,
      pitch: 0.8,
      volume: 1
    },
    styles: [
      { id: 1, thumbnail: girl2_1, fullImage: girl2_1 },
      { id: 2, thumbnail: girl2_2, fullImage: girl2_2 },
    ],
  },
  {
    id: 4,
    name: "晴婕",
    displayName: "晴婕",
    avatar: girl3_1,
    fullImage: girl3_1,
    customName: "晴婕",
    voiceSettings: {
      rate: 0.95,
      pitch: 0.85,
      volume: 1
    },
    styles: [
      { id: 1, thumbnail: girl3_1, fullImage: girl3_1 },
      { id: 2, thumbnail: girl3_2, fullImage: girl3_2 },
    ],
  },
  {
    id: 5,
    name: "芮欣",
    displayName: "芮欣",
    avatar: girl4_1,
    fullImage: girl4_1,
    customName: "芮欣",
    voiceSettings: {
      rate: 0.9,
      pitch: 0.9,
      volume: 1
    },
    styles: [
      { id: 1, thumbnail: girl4_1, fullImage: girl4_1 },
      { id: 2, thumbnail: girl4_2, fullImage: girl4_2 },
    ],
  },
  {
    id: 6,
    name: "語彤",
    displayName: "語彤",
    avatar: girl5_1,
    fullImage: girl5_1,
    customName: "語彤",
    voiceSettings: {
      rate: 0.95,
      pitch: 0.8,
      volume: 1
    },
    styles: [
      { id: 1, thumbnail: girl5_1, fullImage: girl5_1 },
      { id: 2, thumbnail: girl5_2, fullImage: girl5_2 },
    ],
  },
  {
    id: 7,
    name: "澤昊",
    displayName: "澤昊",
    avatar: man1_1,
    fullImage: man1_1,
    customName: "澤昊",
    voiceSettings: {
      rate: 0.85,
      pitch: 0.7,
      volume: 1
    },
    styles: [
      { id: 1, thumbnail: man1_1, fullImage: man1_1 },
      { id: 2, thumbnail: man1_2, fullImage: man1_2 },
    ],
  },
  {
    id: 8,
    name: "亦辰",
    displayName: "亦辰",
    avatar: man2_1,
    fullImage: man2_1,
    customName: "亦辰",
    voiceSettings: {
      rate: 0.9,
      pitch: 0.75,
      volume: 1
    },
    styles: [
      { id: 1, thumbnail: man2_1, fullImage: man2_1 },
      { id: 2, thumbnail: man2_2, fullImage: man2_2 },
    ],
  },
  {
    id: 9,
    name: "曜宸",
    displayName: "曜宸",
    avatar: man3_1,
    fullImage: man3_1,
    customName: "曜宸",
    voiceSettings: {
      rate: 0.85,
      pitch: 0.8,
      volume: 1
    },
    styles: [
      { id: 1, thumbnail: man3_1, fullImage: man3_1 },
      { id: 2, thumbnail: man3_2, fullImage: man3_2 },
      { id: 3, thumbnail: man3_3, fullImage: man3_3 },
    ],
  },
  {
    id: 10,
    name: "霖澤",
    displayName: "霖澤",
    avatar: man4_1,
    fullImage: man4_1,
    customName: "霖澤",
    voiceSettings: {
      rate: 0.9,
      pitch: 0.7,
      volume: 1
    },
    styles: [
      { id: 1, thumbnail: man4_1, fullImage: man4_1 },
      { id: 2, thumbnail: man4_2, fullImage: man4_2 },
    ],
  },
  {
    id: 11,
    name: "承睿",
    displayName: "承睿",
    avatar: man5_1,
    fullImage: man5_1,
    customName: "承睿",
    voiceSettings: {
      rate: 0.85,
      pitch: 0.75,
      volume: 1
    },
    styles: [
      { id: 1, thumbnail: man5_1, fullImage: man5_1 },
      { id: 2, thumbnail: man5_2, fullImage: man5_2 },
    ],
  },
  {
    id: 12,
    name: "柏瀚",
    displayName: "柏瀚",
    avatar: man6_1,
    fullImage: man6_1,
    customName: "柏瀚",
    voiceSettings: {
      rate: 0.9,
      pitch: 0.8,
      volume: 1
    },
    styles: [
      { id: 1, thumbnail: man6_1, fullImage: man6_1 },
      { id: 2, thumbnail: man6_2, fullImage: man6_2 },
    ],
  },

  {
    id: 13,
    name: "檸檬",
    displayName: "檸檬",
    avatar: pet1_1,
    fullImage: pet1_1,
    customName: "檸檬",
    voiceSettings: {
      rate: 1.1,
      pitch: 1.2,
      volume: 1
    },
    styles: [
      { id: 1, thumbnail: pet1_1, fullImage: pet1_1 },
      { id: 2, thumbnail: pet1_2, fullImage: pet1_2 },
    ],
  },
  {
    id: 14,
    name: "芒果",
    displayName: "芒果",
    avatar: pet2_1,
    fullImage: pet2_1,
    customName: "芒果",
    voiceSettings: {
      rate: 1.0,
      pitch: 1.1,
      volume: 1
    },
    styles: [
      { id: 1, thumbnail: pet2_1, fullImage: pet2_1 },
      { id: 2, thumbnail: pet2_2, fullImage: pet2_2 },
    ],
  },
  {
    id: 15,
    name: "喵喵",
    displayName: "喵喵",
    avatar: pet3_1,
    fullImage: pet3_1,
    customName: "喵喵",
    voiceSettings: {
      rate: 1.2,
      pitch: 1.3,
      volume: 1
    },
    styles: [
      { id: 1, thumbnail: pet3_1, fullImage: pet3_1 },
      { id: 2, thumbnail: pet3_2, fullImage: pet3_2 },
    ],
  },
  {
    id: 16,
    name: "光羽",
    displayName: "光羽",
    avatar: pet4_1,
    fullImage: pet4_1,
    customName: "光羽",
    voiceSettings: {
      rate: 1.0,
      pitch: 1.0,
      volume: 1
    },
    styles: [
      { id: 1, thumbnail: pet4_1, fullImage: pet4_1 },
      { id: 2, thumbnail: pet4_2, fullImage: pet4_2 },
    ],
  },
]);

// 計算屬性：當前可見的造型
const visibleStyles = computed(() => {
  const character = availableCharacters.value.find(
    (c) => c.id === currentCharacter.value.id
  );
  if (!character) return [];

  // 全部展開
  return character.styles;
});

let playbackConfirmed = false;
let voiceTimeout = null; // 語音識別超時計時器

// 語音識別和合成實例
let recognitionRef = null;
let synthRef = null;

// 計算屬性：按日期分組的歷史記錄（升冪排列，最舊的在前面）
const groupedHistory = computed(() => {
  const groups = {};
  
  // 計算要顯示的對話數量（分頁）- 從最新的開始顯示
  const totalMessages = conversations.value.length;
  const startIndex = Math.max(0, totalMessages - (currentPage.value * messagesPerPage.value));
  const endIndex = totalMessages - ((currentPage.value - 1) * messagesPerPage.value);
  const displayedConversations = conversations.value.slice(startIndex, endIndex);
  
  displayedConversations.forEach((item) => {
    const date = item.timestamp.split(" ")[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
  });
  
  // 對每個日期組內的對話按時間排序（最舊的在前面）
  Object.keys(groups).forEach(date => {
    groups[date].sort((a, b) => {
      const timeA = new Date(a.timestamp);
      const timeB = new Date(b.timestamp);
      return timeA - timeB;
    });
  });
  
  // 按日期升冪排序（最舊的日期在前面）
  const sortedGroups = {};
  Object.keys(groups)
    .sort((a, b) => new Date(a) - new Date(b))
    .forEach(date => {
      sortedGroups[date] = groups[date];
    });
  
  return sortedGroups;
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

// 格式化時間（只顯示時:分）
const formatTime = (timestamp) => {
  const timeStr = timestamp.split(" ")[1];
  const [hours, minutes] = timeStr.split(":");
  return `${hours}:${minutes}`;
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
    // 重置分頁狀態
    currentPage.value = 1;
    hasMoreMessages.value = conversations.value.length > messagesPerPage.value;
    
    // 等待頁面渲染完成後滾動到底部
    nextTick(() => {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });
  }
};

// 關閉歷史記錄
const closeHistory = () => {
  if (process.client) {
    showHistoryPage.value = false;
    showSearch.value = false;
    searchQuery.value = "";
    searchResults.value = [];
    // 重置分頁和滾動狀態
    currentPage.value = 1;
    showStickyHeader.value = false;
    stickyDateHeader.value = "";
  }
};

// 處理歷史記錄滾動事件
const handleHistoryScroll = () => {
  if (!historyScrollContainer.value) return;
  
  const container = historyScrollContainer.value;
  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;
  
  // 檢查是否滾動到頂部（載入更舊訊息）
  if (scrollTop < 100 && !isLoadingOlderMessages.value && hasMoreMessages.value) {
    loadOlderMessages();
  }
  
  // 更新 sticky header
  updateStickyHeader();
  
  // 設置滾動狀態
  isScrolling.value = true;
  showStickyHeader.value = true;
  
  // 清除之前的計時器
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value);
  }
  
  // 設置新的計時器（1.5秒後隱藏 sticky header）
  scrollTimeout.value = setTimeout(() => {
    isScrolling.value = false;
    showStickyHeader.value = false;
  }, 1500);
};

// 載入更舊的訊息
const loadOlderMessages = () => {
  if (isLoadingOlderMessages.value || !hasMoreMessages.value) return;
  
  isLoadingOlderMessages.value = true;
  
  // 模擬載入延遲
  setTimeout(() => {
    const oldPage = currentPage.value;
    currentPage.value++;
    
    // 檢查是否還有更多訊息
    const totalMessages = conversations.value.length;
    const currentMessages = currentPage.value * messagesPerPage.value;
    
    if (currentMessages >= totalMessages) {
      hasMoreMessages.value = false;
    }
    
    isLoadingOlderMessages.value = false;
    
    // 保持滾動位置
    nextTick(() => {
      if (historyScrollContainer.value) {
        const container = historyScrollContainer.value;
        const newScrollHeight = container.scrollHeight;
        const oldScrollHeight = container.scrollHeight;
        const scrollDiff = newScrollHeight - oldScrollHeight;
        container.scrollTop = scrollDiff;
      }
    });
  }, 500);
};

// 更新 sticky header 日期
const updateStickyHeader = () => {
  if (!historyScrollContainer.value) return;
  
  const container = historyScrollContainer.value;
  const scrollTop = container.scrollTop;
  
  // 找到當前可見的第一個日期分隔器
  const dateSeparators = container.querySelectorAll('.date-separator');
  let currentDate = "";
  
  for (let i = 0; i < dateSeparators.length; i++) {
    const separator = dateSeparators[i];
    const rect = separator.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    if (rect.top >= containerRect.top) {
      currentDate = separator.textContent;
      break;
    }
  }
  
  if (currentDate && currentDate !== stickyDateHeader.value) {
    stickyDateHeader.value = currentDate;
  }
};

// 自動滾動到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (historyScrollContainer.value) {
      const container = historyScrollContainer.value;
      container.scrollTop = container.scrollHeight;
    }
  });
};

// 切換日曆顯示
const toggleCalendar = () => {
  if (process.client) {
    showCalendar.value = !showCalendar.value;
    if (showCalendar.value) {
      loadCalendarDates();
    }
  }
};

// 載入日曆中有聊天記錄的日期
const loadCalendarDates = () => {
  if (process.client) {
    const dates = new Set();
    conversations.value.forEach(conversation => {
      const date = conversation.timestamp.split(" ")[0];
      dates.add(date);
    });
    calendarDatesWithHistory.value = Array.from(dates).sort();
  }
};

// 選擇日曆日期
const selectCalendarDate = (date) => {
  if (process.client) {
    selectedDate.value = date;
    showCalendar.value = false;
    
    // 找到該日期的訊息並滾動到位置
    const targetMessage = conversations.value.find(conversation => 
      conversation.timestamp.startsWith(date)
    );
    
    if (targetMessage) {
      // 計算該訊息應該在哪一頁
      const messageIndex = conversations.value.findIndex(c => c.id === targetMessage.id);
      const targetPage = Math.floor(messageIndex / messagesPerPage.value) + 1;
      
      if (targetPage !== currentPage.value) {
        currentPage.value = targetPage;
      }
      
      // 滾動到該訊息
      nextTick(() => {
        const messageElement = document.getElementById(`message-${targetMessage.id}`);
        if (messageElement) {
          messageElement.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      });
    }
  }
};

// 切換搜尋功能
const toggleSearch = () => {
  if (process.client) {
    if (!showSearch.value) {
      // 開啟搜尋
      showSearch.value = true;
      // 延遲聚焦，等待動畫完成
      setTimeout(() => {
        if (searchInputRef.value) {
          searchInputRef.value.focus();
        }
      }, 700);
    } else {
      // 關閉搜尋
      searchQuery.value = "";
      searchResults.value = [];
      showSearch.value = false;
    }
  }
};

// 執行搜尋
const performSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  const query = searchQuery.value.toLowerCase();
  const results = [];

  conversations.value.forEach((conversation) => {
    const userMatch = conversation.user.toLowerCase().includes(query);
    const botMatch = conversation.bot.toLowerCase().includes(query);

    if (userMatch || botMatch) {
      results.push({
        ...conversation,
        matchType: userMatch ? "user" : "bot",
        matchText: userMatch ? conversation.user : conversation.bot,
        userName: "用戶", // 可以根據需要設置用戶名稱
      });
    }
  });

  // 按日期降冪排列（最新的在上面）
  searchResults.value = results.sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateB - dateA;
  });
};

// 清除搜尋（保留函數以備將來使用）
const clearSearch = () => {
  if (process.client) {
    searchQuery.value = "";
    searchResults.value = [];
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
  }, 5000); // 5秒超時
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
  if (process.client && typeof window !== "undefined") {
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

        // 處理不同的錯誤類型
        if (process.client) {
          switch (event.error) {
            case "not-allowed":
              alert("請允許麥克風權限以使用語音功能");
              break;
            case "no-speech":
            case "audio-capture":
              showVoiceError.value = true;
              voiceModalImageSrc.value = assistantDefaultGif;
              break;
            case "network":
              alert("網路連接問題，請檢查網路後重試");
              break;
            default:
              if (event.error !== "aborted") {
                showVoiceError.value = true;
                voiceModalImageSrc.value = assistantDefaultGif;
              }
          }
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
    if (process.client && typeof window !== "undefined") {
      // 檢查是否為 HTTPS 或 localhost
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        alert("語音功能需要 HTTPS 連接，請使用安全連接");
        return;
      }
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

    conversations.value.push(newConversation);
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

    conversations.value.push(errorConversation);
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
  if (!synthRef || !text?.trim() || !process.client || isMuted.value) return;

  const speak = () => {
    if (!process.client) return;

    isManuallyStopped.value = false;
    playbackConfirmed = false;
    synthRef.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-TW";
    
    // 使用角色的自定義聲音設置
    const voiceSettings = currentCharacter.value.voiceSettings || {
      rate: 0.9,
      pitch: 0.85,
      volume: 1
    };
    
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

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
  if (synthRef && process.client && typeof window !== "undefined") {
    isManuallyStopped.value = true;
    showAudioError.value = false;
    synthRef.cancel();
    isSpeaking.value = false;
  }
};

// 切換音量控制
const toggleVolume = () => {
  if (process.client) {
    // 切換靜音狀態
    isMuted.value = !isMuted.value;
    
    // 如果當前正在播放語音，立即停止
    if (synthRef && synthRef.speaking) {
      synthRef.cancel();
    }
    
    // 保存靜音狀態到本地存儲
    localStorage.setItem("isMuted", JSON.stringify(isMuted.value));
    
    console.log("音量控制切換:", isMuted.value ? "靜音" : "開啟");
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

    conversations.value.push(newConversation);
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
    conversations.value.push(errorConversation);
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
          latestResponse.value = conversations.value[conversations.value.length - 1].bot;
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
  if (
    process.client &&
    typeof window !== "undefined" &&
    "speechSynthesis" in window
  ) {
    synthRef = window.speechSynthesis;
  }
  initSpeechRecognition();
  loadConversations();
  loadSavedCharacter();
  
  // 載入靜音狀態
  if (process.client) {
    const savedMuted = localStorage.getItem("isMuted");
    if (savedMuted !== null) {
      isMuted.value = JSON.parse(savedMuted);
    }
  }

  // 如果當前是首頁，顯示語音控制
  if (process.client) {
    showVoiceControls.value = true;
  }
});

// 載入保存的角色選擇
const loadSavedCharacter = () => {
  if (process.client) {
    // 載入可用角色列表
    const savedCharacters = localStorage.getItem("availableCharacters");
    if (savedCharacters) {
      try {
        const parsedCharacters = JSON.parse(savedCharacters);
        // 合併保存的數據與默認數據
        availableCharacters.value = availableCharacters.value.map(char => {
          const savedChar = parsedCharacters.find(c => c.id === char.id);
          return savedChar ? { ...char, ...savedChar } : char;
        });
      } catch (e) {
        console.error("載入角色列表失敗:", e);
      }
    }
    
    // 載入當前選擇的角色
    const saved = localStorage.getItem("selectedCharacter");
    if (saved) {
      try {
        const savedCharacter = JSON.parse(saved);
        const foundCharacter = availableCharacters.value.find(
          (c) => c.id === savedCharacter.id
        );
        if (foundCharacter) {
          currentCharacter.value = { 
            ...foundCharacter,
            ...savedCharacter,
            customName: savedCharacter.customName || foundCharacter.customName || foundCharacter.displayName
          };
          characterImageSrc.value = savedCharacter.fullImage;
        }
      } catch (e) {
        console.error("載入角色選擇失敗:", e);
      }
    }
  }
};

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
  if (typeof document === "undefined") return "default-session-id";

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

// 搜尋結果跳轉
const scrollToMessage = (id) => {
  // 關閉搜尋
  showSearch.value = false;
  searchQuery.value = "";
  searchResults.value = [];

  // 等待動畫完成後跳轉
  setTimeout(() => {
    const messageElement = document.getElementById(`message-${id}`);
    if (messageElement) {
      messageElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // 添加高亮效果
      messageElement.style.backgroundColor = "rgba(116, 188, 31, 0.1)";
      messageElement.style.borderRadius = "12px";
      messageElement.style.transition = "background-color 0.3s ease";

      // 3秒後移除高亮
      setTimeout(() => {
        messageElement.style.backgroundColor = "";
        messageElement.style.borderRadius = "";
      }, 3000);
    }
  }, 300);
};

// 關鍵字高亮
const highlightKeyword = (text, keyword) => {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, "gi");
  return text.replace(regex, '<span class="highlight">$1</span>');
};

// 角色選擇相關函數
const showCharacterModal = () => {
  if (process.client) {
    showCharacterSelection.value = true;
  }
};

const closeCharacterModal = () => {
  if (process.client) {
    showCharacterSelection.value = false;
    isStyleExpanded.value = false;
  }
};

const toggleStyleExpansion = () => {
  if (process.client) {
    isStyleExpanded.value = !isStyleExpanded.value;
  }
};

const selectCharacter = (character) => {
  if (process.client) {
    currentCharacter.value = {
      ...character,
      styleId: 1, // 默認選擇第一個造型
      avatar: character.styles[0]?.thumbnail || character.avatar, // 更新頭貼為第一個樣式的縮圖
      fullImage: character.styles[0]?.fullImage || character.fullImage,
      customName: character.customName || character.displayName,
      voiceSettings: character.voiceSettings || {
        rate: 0.9,
        pitch: 0.85,
        volume: 1
      }
    };
    isStyleExpanded.value = false; // 切換角色時收起造型選擇

    // 更新角色圖片路徑
    characterImageSrc.value =
      character.styles[0]?.fullImage || character.fullImage;

    console.log("已選擇角色:", character.customName || character.displayName);
  }
};

const selectStyle = (style) => {
  if (process.client) {
    currentCharacter.value.styleId = style.id;
    currentCharacter.value.avatar = style.thumbnail; // 更新頭貼為選中樣式的縮圖
    currentCharacter.value.fullImage = style.fullImage;
    // 即時更新角色圖片
    characterImageSrc.value = style.fullImage;
  }
};

const confirmCharacterSelection = () => {
  if (process.client) {
    // 更新角色圖片路徑
    characterImageSrc.value = currentCharacter.value.fullImage;
    // 關閉彈窗
    closeCharacterModal();
    // 保存到本地存儲
    localStorage.setItem(
      "selectedCharacter",
      JSON.stringify(currentCharacter.value)
    );
    // 可以添加成功提示或其他確認邏輯
    console.log("角色選擇已確認:", currentCharacter.value.customName || currentCharacter.value.displayName);
    console.log("當前頭貼:", currentCharacter.value.avatar);
  }
};

// 角色名稱編輯相關函數
const showNameInputModal = () => {
  if (process.client) {
    characterNameInput.value = currentCharacter.value.customName || currentCharacter.value.displayName;
    nameInputError.value = "";
    showNameInput.value = true;
    nextTick(() => {
      if (nameInputRef.value) {
        nameInputRef.value.focus();
      }
    });
  }
};

const closeNameInput = () => {
  if (process.client) {
    showNameInput.value = false;
    characterNameInput.value = "";
    nameInputError.value = "";
  }
};

const confirmNameInput = () => {
  if (process.client) {
    const name = characterNameInput.value.trim();
    
    if (!name) {
      nameInputError.value = "角色不能沒有名字喔";
      return;
    }
    
    if (name.length > 10) {
      nameInputError.value = "名字不能超過10個字";
      return;
    }
    
    // 更新當前角色的自定義名稱
    currentCharacter.value.customName = name;
    
    // 更新可用角色列表中的對應角色
    const characterIndex = availableCharacters.value.findIndex(
      c => c.id === currentCharacter.value.id
    );
    if (characterIndex !== -1) {
      availableCharacters.value[characterIndex].customName = name;
    }
    
    // 保存到本地存儲
    localStorage.setItem(
      "selectedCharacter",
      JSON.stringify(currentCharacter.value)
    );
    localStorage.setItem(
      "availableCharacters",
      JSON.stringify(availableCharacters.value)
    );
    
    closeNameInput();
    console.log("角色名稱已更新:", name);
  }
};
</script>
