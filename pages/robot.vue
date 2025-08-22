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
      <div
        v-if="showTextInput && !isListening && !showVoiceError"
        class="text-input-section"
        v-click-outside="closeTextInput"
      >
        <div class="input-container" @click.stop>
          <input
            v-model="textInput"
            class="text-input"
            placeholder="請輸入文字"
            @keypress.enter="handleManualInput"
            ref="textInputRef"
          />
          <button
            class="send-btn"
            @click="textInput.trim() ? handleManualInput() : toggleListening()"
          >
            <img
              :src="textInput.trim() ? sendSvg : soundSvg"
              :alt="textInput.trim() ? '送出' : '語音'"
            />
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
      <div v-if="isListening || showVoiceError" class="voice-modal">
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
          <div
            class="voiceModelClose"
            v-if="!isListening"
            @click="closeVoiceModal"
          >
            <div class="voiceModelImg">
              <img src="/assets/imgs/robot/close_red.svg" alt="關閉" />
            </div>
          </div>
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
              src="/assets/imgs/backArrow.svg"
              @click="closeCharacterModal"
              alt="返回"
              class="back-arrow"
            />
            <h2 class="modal-title">切換角色</h2>
          </div>

          <!-- 當前選擇角色標籤 -->
          <div class="current-character-tag" @click="showNameInputModal">
            <span
              >{{ currentCharacter.customName || currentCharacter.displayName }}
              <img
                src="/assets/imgs/robot/edit_green.svg"
                alt="編輯"
                class="edit-icon"
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
            src="/assets/imgs/backArrow.svg"
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
            <img
              :src="calendarSvg"
              alt="日曆"
              class="calendar-icon"
              @click="toggleCalendar"
            />
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
                src="/assets/imgs/close.svg"
                alt="關閉"
                @click="toggleSearch"
                class="close-search-icon"
              />
            </div>
          </transition>
        </div>

        <div
          class="history-content"
          ref="historyScrollContainer"
          @scroll="handleHistoryScroll"
        >
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
                  <div class="message user">
                    <div class="bubble">
                      {{ item.user }}
                      <div class="time">{{ formatTime(item.timestamp) }}</div>
                    </div>
                  </div>

                  <div class="message bot">
                    <div class="avatar">
                      <img :src="currentCharacter.avatar" alt="角色頭像" />
                    </div>

                    <div class="bubble">
                      {{ item.bot }}
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
                      formatDate(
                        result.dateKey || result.timestamp.split(" ")[0]
                      )
                    }}</span>
                  </div>
                  <div class="result-messages">
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
      <div
        v-if="showNameInput"
        class="name-input-overlay"
        @click="closeNameInput"
      >
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
    <transition name="calendar-expand">
      <div v-if="showCalendar" class="calendar-overlay" @click="toggleCalendar">
        <div class="calendar-modal" @click.stop>
          <div class="calendar-header">
            <h3 class="calendar-title">選擇日期</h3>
            <img
              src="/assets/imgs/close.svg"
              alt="關閉"
              @click="toggleCalendar"
              class="calendar-close"
            />
          </div>
          <div class="calendar-content">
            <VueDatePicker
              v-model="selectedDate"
              :multi-dates="false"
              teleport="body"
              cancel-text="取消"
              select-text="確定"
              :locale="'zh-TW'"
              :enable-time-picker="false"
              no-today
              :max-date="maxHistoryDate"
              :disabled-dates="isDateDisabledForMonth"
              @update:month-year="onMonthYearChange"
              @update:modelValue="handleDateChange"
              class="calendar-datepicker"
            />

            <div v-if="monthDateKeySet.size === 0" class="no-dates">
              本月暫無聊天記錄
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.chat-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: "Noto Sans";
  padding-top: 1rem;
  overflow: hidden;

  @include gradientBg();
}

/* 聊天頭部 */
.chat-header {
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
  gap: 10px;
  padding: 0 1rem;

  .avatar-container {
    width: 40px;
    height: 40px;
    border: 1px solid $raphael-green-400;
    cursor: pointer;

    @include neumorphismOuter($radius: 50%, $padding: 0);
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover,
    &:active {
      @include neumorphismOuter(
        $radius: 50%,
        $padding: 0,
        $x: 0,
        $y: 0,
        $blur: 6px
      );
    }
  }

  .character-name-btn {
    color: #4a5568;
    color: $raphael-green-400;
    font-family: "Noto Sans";
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 2.7px;
    cursor: pointer;
    @include neumorphismOuter($radius: 50px, $padding: 11px 16px);
    display: flex;
    align-items: center;
    gap: 2px;
    transition: all 0.3s ease;

    &:hover,
    &:active {
      @include neumorphismOuter(
        $radius: 50px,
        $padding: 11px 16px,
        $x: 0,
        $y: 0,
        $blur: 6px
      );
    }
  }
}

/* 問候氣泡 */
.greeting-bubble {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: baseline;
  margin-top: 1rem;
  padding: 0 1rem;
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
  overflow-y: auto;
  max-height: 120px;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}

.greeting-bubble .greeting-text {
  font-size: 16px;
  line-height: 1.5;
  color: #2d3748;
  width: 100%;
  height: 120px;
  text-align: justify;
  @include neumorphismOuter();
  overflow: hidden;
  overflow-y: scroll;
  @include scrollbarStyle();
}

.volume-control {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  width: 40px;
  height: 40px;
  position: absolute;
  right: 16px;
  bottom: -56px;
  z-index: 2;
  cursor: pointer;
  transition: all 0.3s ease;
  @include neumorphismOuter($radius: 50%, $padding: 0);

  &:hover,
  &:active {
    @include neumorphismOuter(
      $radius: 50%,
      $padding: 0,
      $x: 0,
      $y: 0,
      $blur: 6px
    );
  }
}

/* 角色形象區域 */
.character-section {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  flex: 1;
  padding-bottom: 97px;

  .character-image {
    object-fit: cover;
  }
}

/* 語音控制欄 - 絕對定位擬態設計 */
.voice-control-bar {
  position: fixed;
  bottom: 124px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  @include liquidGlass();
  z-index: 10;

  .control-btn {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    width: 44px;
    height: 44px;
    cursor: pointer;
    transition: all 0.3s ease;
    @include neumorphismOuter($radius: 50%, $padding: 0);

    &:hover,
    &:active {
      @include neumorphismOuter(
        $radius: 50%,
        $padding: 0,
        $x: 0,
        $y: 0,
        $blur: 6px
      );
    }

    &.mic-btn {
      @include neumorphismOuter(
        $bgColor: $raphael-green-400,
        $radius: 50%,
        $padding: 0
      );

      width: 60px;
      height: 60px;
      transition: all 0.3s ease;

      &:hover,
      &:active {
        @include neumorphismOuter(
          $bgColor: $raphael-green-500,
          $radius: 50%,
          $padding: 0,
          $x: 0,
          $y: 0,
          $blur: 6px
        );
      }

      &.listening {
        background: linear-gradient(
          90deg,
          var(--primary-400-opacity-70, rgba(116, 188, 31, 0.7)) 0%,
          $raphael-green-400 100%
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
  bottom: 27.5%;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  z-index: 10;

  .input-container {
    display: flex;
    align-items: center;
    border-radius: var(--Radius-r-20, 20px);
    border: 1px solid $raphael-white;
    background: rgba(245, 247, 250, 0.65);
    backdrop-filter: blur(22px);
    padding: 8px 16px;

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
      border-radius: 50%;
      width: 45px;
      height: 45px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      color: white;
      font-size: 18px;
      border-radius: var(--Radius-r-50, 50px);
      background: linear-gradient(
        90deg,
        var(--primary-400-opacity-70, rgba(116, 188, 31, 0.7)) 0%,
        $raphael-green-400 100%
      );
      box-shadow: 0 2px 8px 0
        var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
      border: none;
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
.voiceModelClose {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 12.5%;

  padding: 4px;
  border-radius: var(--Radius-r-50, 50px);
  background: var(--Secondary-100, #f5f7fa);
  box-shadow: 0 2px 8px 0
    var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
  margin-top: 8px;

  .voiceModelImg {
    width: 30px;
    height: 30px;
    border: 1px solid var(--Warning-default, #ec4f4f);
    border-radius: 50%;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
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
  z-index: 1001;
  display: flex;
  flex-direction: column;
  inset: 0; /* 取代 top/left/width/height */
  height: 100dvh; /* 行動版更準確 */
  min-height: 0; /* ★ 沒這行 iOS 常常不滾動 */
  overflow: hidden; /* 避免背景頁跟著捲 */
  -webkit-overflow-scrolling: touch; /* ★ iOS 慣性滾動 */
  overscroll-behavior: contain; /* 防止把滾動帶到外層 */
  touch-action: pan-y; /* 明確允許垂直捲動 */

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
    box-shadow: -4px -4px 6px 0 $raphael-white inset,
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
    min-height: 0; /* 讓 flex 子項可以縮、才捲得動 */
    -webkit-overflow-scrolling: touch; /* iOS 慣性捲動 */
    touch-action: pan-y; /* 明確允許垂直捲動 */

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
              background: $raphael-white;
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
              background: $raphael-white;
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
              background: $raphael-green-400;
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
    box-shadow: -4px -4px 6px 0 $raphael-white inset,
      4px 4px 6px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4))
        inset;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: -6px -6px 8px 0 $raphael-white inset,
        6px 6px 8px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4))
          inset;
    }

    &:active {
      transform: translateY(0);
      box-shadow: -2px -2px 4px 0 $raphael-white inset,
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
              background: $raphael-white;
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
              background: $raphael-white;
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
              background: $raphael-green-400;
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
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.character-modal {
  width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  @include gradientBg();

  .character-modal-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    position: relative;

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
      font-size: 24px;
      color: #2d3748;
      margin: 0;
    }
  }

  .current-character-tag {
    padding: 16px 16px 24px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;

    span {
      display: inline-block;
      cursor: pointer;
      color: $raphael-green-400;
      width: 160px;
      font-size: 18px;
      letter-spacing: 2.7px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2px;
      transition: all 0.3s ease;
      @include neumorphismOuter($radius: 50px, $padding: 12px 16px);

      &:hover,
      &:active {
        @include neumorphismOuter(
          $radius: 50px,
          $padding: 12px 16px,
          $x: 0,
          $y: 0,
          $blur: 6px
        );
      }
    }
  }

  .main-character-area {
    flex: 1;
    min-height: 0; /* ★ 關鍵：沒有這行 iOS 常常不捲 */
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    position: relative;

    .character-display {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .character-full-image {
        object-fit: cover;
        height: 100%;
      }
    }

    .style-selector {
      position: absolute;
      right: 16px;
      top: 0;
      width: 90px;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 192px;
      @include neumorphismOuter($radius: 8px, $padding: 8px);

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
        overflow-y: auto; /* 改這個 */
        -webkit-overflow-scrolling: touch;
        transition: max-height 0.3s ease;
        @include scrollbarStyle();

        .style-item {
          background: rgba(31, 188, 179, 0.2);
          border-radius: 50%;
          width: 60px;
          height: 60px;
          cursor: pointer;
          border: none;
          margin: 0.5rem 0.5rem 0;
          overflow: hidden;
          transition: all 0.3s ease;

          &:hover,
          &:active {
            background: rgba(31, 188, 179, 0.7);
          }

          img {
            width: 100%;
            object-fit: cover;
          }
        }

        .active {
          border: 2px solid $raphael-green-400;
          @include neumorphismOuter($radius: 50%, $padding: 0, $x: 0, $y: 1px);
          &:hover,
          &:active {
            @include neumorphismOuter(
              $radius: 50%,
              $padding: 0,
              $x: 0,
              $y: 1px
            );
          }
        }
      }
    }
  }

  .confirm-btn {
    position: absolute;
    bottom: 224px;
    left: 50%;
    width: 110px;
    color: $raphael-white;
    font-size: 18px;
    letter-spacing: 2.7px;
    border: none;
    cursor: pointer;

    @include neumorphismOuter(
      $bgColor: $raphael-green-400,
      $radius: 50px,
      $padding: 8px 16px
    );

    transform: translateX(-50%);
    transition: all 0.3s ease;
    &:hover,
    &:active {
      @include neumorphismOuter(
        $bgColor: $raphael-green-500,
        $radius: 50px,
        $padding: 8px 16px,
        $x: 0,
        $y: 1px
      );
    }
  }

  .character-switch-area {
    position: relative;
    width: 100%;
    margin-bottom: 66px;
    padding: 0 1rem;

    .character-scroll-container {
      display: grid;
      grid-auto-flow: column;
      gap: 16px;
      @include neumorphismOuter();
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
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100px;
        height: 100px;

        .character-circle {
          background: rgba(31, 188, 179, 0.2);
          border-radius: 50%;
          height: 100px;
          overflow: hidden;
          transition: all 0.3s ease;

          img {
            width: 100%;
            object-fit: cover;
          }
          &:hover,
          &:active {
            background: rgba(31, 188, 179, 0.7);
          }
        }

        &.selected .character-circle {
          border: 2px solid $raphael-green-400;
          @include neumorphismOuter($radius: 50%, $padding: 0, $x: 0, $y: 1px);
          &:hover,
          &:active {
            @include neumorphismOuter(
              $radius: 50%,
              $padding: 0,
              $x: 0,
              $y: 1px
            );
          }
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
  background: rgba(50, 50, 50, 0.01);
  backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.name-input-modal {
  padding: 24px;
  border-radius: 20px;
  border-radius: var(--Radius-r-20, 20px);
  background: rgba(245, 247, 250, 0.65);
  box-shadow: -6px -6px 12px 0 $raphael-white,
    6px 6px 12px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
  backdrop-filter: blur(22px);
  width: 90%;
  max-width: 320px;
  text-align: center;

  .name-input-title {
    color: var(--Neutral-black, #1e1e1e);
    text-align: center;

    font-size: var(--Text-font-size-24, 20px);
    font-style: normal;
    font-weight: 700;
    line-height: 100%; /* 24px */
    letter-spacing: 0.12px;
    margin: 0 0 20px 0;
  }

  .name-input-field {
    width: 100%;
    padding: 12px 16px;
    border: none;
    border-radius: var(--Radius-r-50, 50px);
    background: var(--Secondary-100, #f5f7fa);
    box-shadow: -6px -6px 12px 0 $raphael-white inset,
      6px 6px 12px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4))
        inset;

    overflow: hidden;
    color: var(--Neutral-black, #1e1e1e);
    text-overflow: ellipsis;

    font-size: 18px;
    font-style: normal;
    font-weight: 700;

    letter-spacing: 2.7px;
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
        color: #718096;
        border-radius: var(--Radius-r-50, 50px);
        color: $raphael-green-400;

        font-size: 18px;
        font-style: normal;
        font-weight: 400;

        letter-spacing: 2.7px;
        background: none;
        &:hover {
          transform: translateY(-2px);
        }
      }

      &.name-input-confirm {
        border-radius: var(--Radius-r-50, 50px);
        background: linear-gradient(
          90deg,
          var(--primary-400-opacity-70, rgba(116, 188, 31, 0.7)) 0%,
          $raphael-green-400 100%
        );
        box-shadow: 0 1px 12px 0
            var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4)),
          6px 6px 12px 0
            var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));

        color: $raphael-white;

        font-size: 18px;
        font-style: normal;
        font-weight: 400;

        letter-spacing: 2.7px;

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

// 日曆展開動畫
.calendar-expand-enter-active,
.calendar-expand-leave-active {
  transition: all 0.3s ease;
}

.calendar-expand-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.calendar-expand-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.calendar-expand-enter-to,
.calendar-expand-leave-from {
  opacity: 1;
  transform: scale(1);
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
    .calendar-datepicker {
      width: 100%;

      :deep(.dp__main) {
        background: var(--Secondary-100, #f5f7fa);
        border-radius: 12px;
        box-shadow: inset 4px 4px 8px rgba(163, 177, 198, 0.6),
          inset -4px -4px 8px rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      :deep(.dp__calendar_header) {
        background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
        border-radius: 8px 8px 0 0;
      }

      :deep(.dp__calendar) {
        background: transparent;
      }

      :deep(.dp__cell_inner) {
        background: var(--Secondary-100, #f5f7fa);
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover:not(.dp__disabled) {
          background: linear-gradient(145deg, $raphael-green-400, #5a9a17);
          color: white;
          transform: translateY(-1px);
        }
      }

      :deep(.dp__active) {
        background: linear-gradient(
          145deg,
          $raphael-green-400,
          #5a9a17
        ) !important;
        color: white !important;
      }

      :deep(.dp__disabled) {
        opacity: 0.3;
        cursor: not-allowed;
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
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
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
import sendSvg from "~/assets/imgs/robot/send.svg";

// ====== 新增：你的 n8n TTS webhook（需回傳 audio/wav 二進位檔）======
const TTS_WEBHOOK_URL = "https://aiwisebalance.com/webhook/oss-gpt";
const voicegender = "female";
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

// 角色命名相關狀態
const showNameInput = ref(false); // 顯示名稱輸入彈窗
const characterNameInput = ref(""); // 角色名稱輸入
const nameInputError = ref(""); // 名稱輸入錯誤訊息

// 新增：聊天歷史改進相關變數
const historyScrollContainer = ref(null);
const isScrolling = ref(false);
const scrollTimeout = ref(null);

const isLoadingOlderMessages = ref(false);
const hasMoreMessages = ref(true);
const currentPage = ref(1);
const messagesPerPage = ref(20);

// 日曆相關
const showCalendar = ref(false);
const selectedDate = ref(null);
const calendarDatesWithHistory = ref([]);
const today = new Date();
const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

// 日曆顯示的年月（0-11）
const visibleMonth = ref(new Date().getMonth());
const visibleYear = ref(new Date().getFullYear());

// 當月有紀錄的日期清單（Set<YYYY-MM-DD> → 只保留當月）
const monthDateKeySet = computed(() => {
  const set = new Set();
  console.log(
    `計算當月日期集合 - 當前顯示: ${visibleYear.value}/${
      visibleMonth.value + 1
    }`
  );
  console.log(`所有可用日期:`, Array.from(calendarDateKeySet.value));

  calendarDateKeySet.value.forEach((key) => {
    const d = new Date(key + "T00:00:00");
    console.log(
      `檢查日期 ${key}: ${d.getFullYear()}-${d.getMonth() + 1} vs ${
        visibleYear.value
      }-${visibleMonth.value + 1}`
    );
    if (
      d.getFullYear() === visibleYear.value &&
      d.getMonth() === visibleMonth.value
    ) {
      set.add(key);
      console.log(`✓ 添加日期 ${key} 到當月集合`);
    }
  });
  console.log(
    `當月 ${visibleYear.value}/${visibleMonth.value + 1} 可用日期:`,
    Array.from(set)
  );
  return set;
});

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
    volume: 1,
  },
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
      volume: 1,
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
      volume: 1,
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
      volume: 1,
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
      volume: 1,
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
      volume: 1,
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
      volume: 1,
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
      volume: 1,
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
      volume: 1,
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
      volume: 1,
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
      volume: 1,
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
      volume: 1,
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
      volume: 1,
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
      volume: 1,
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
      volume: 1,
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
      volume: 1,
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
      volume: 1,
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
// ====== 新增：全域 Audio，集中管理播放與停止 ======
let player = null;
let currentObjectUrl = null;
function ensurePlayer() {
  if (!player) player = new Audio();
  return player;
}
function revokeObjectUrl() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

// 計算屬性：按日期分組的歷史記錄（升冪排列，最舊的在前面）
const groupedHistory = computed(() => {
  const groups = {};

  // 計算要顯示的對話數量（分頁）- 從最新的開始顯示
  const totalMessages = conversations.value.length;
  const startIndex = Math.max(
    0,
    totalMessages - currentPage.value * messagesPerPage.value
  );
  const endIndex =
    totalMessages - (currentPage.value - 1) * messagesPerPage.value;
  const displayedConversations = conversations.value.slice(
    startIndex,
    endIndex
  );

  displayedConversations.forEach((item) => {
    const date = item.dateKey || toDateKey(item.timestamp); // ← 確保有 dateKey
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
  });

  // 對每個日期組內的對話按時間排序（最新的在前面）
  Object.keys(groups).forEach((date) => {
    groups[date].sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0)); // 當日內：舊→新
  });

  // 按日期升冪排序（最舊的日期在前面）
  const sortedGroups = {};
  Object.keys(groups)
    .sort((a, b) => new Date(a) - new Date(b))
    .forEach((date) => {
      sortedGroups[date] = groups[date];
    });

  return sortedGroups;
});

// 格式化日期
const formatDate = (dateStr) => {
  // 支援 YYYY-MM-DD 格式
  if (dateStr.includes("-")) {
    const [y, m, d] = dateStr.split("-");
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    return `${y}/${m}/${d} (${weekdays[dt.getDay()]})`;
  }

  // 原有的 YYYY/MM/DD 格式
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
  }
};

const closeTextInput = () => {
  showTextInput.value = false;
};

// 處理歷史記錄滾動事件
const handleHistoryScroll = () => {
  if (!historyScrollContainer.value) return;

  const container = historyScrollContainer.value;
  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;

  // 檢查是否滾動到頂部（載入更舊訊息）
  if (
    scrollTop < 100 &&
    !isLoadingOlderMessages.value &&
    hasMoreMessages.value
  ) {
    loadOlderMessages();
  }

  // 更新 sticky header
  updateStickyHeader();

  // 設置滾動狀態
  isScrolling.value = true;

  // 清除之前的計時器
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value);
  }

  // 設置新的計時器（1.5秒後隱藏 sticky header）
  scrollTimeout.value = setTimeout(() => {
    isScrolling.value = false;
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
  const dateSeparators = container.querySelectorAll(".date-separator");
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
      loadCalendarDates(); // 更新所有有紀錄的日期

      // 設定日曆顯示的月份為最新有記錄的月份
      if (maxHistoryDate.value) {
        visibleMonth.value = maxHistoryDate.value.getMonth();
        visibleYear.value = maxHistoryDate.value.getFullYear();
      } else {
        const now = new Date();
        visibleMonth.value = now.getMonth();
        visibleYear.value = now.getFullYear();
      }

      console.log(
        `日曆開啟，顯示月份: ${visibleYear.value}/${visibleMonth.value + 1}`
      );
    }
  }
};

// 載入日曆中有聊天記錄的日期
const loadCalendarDates = () => {
  if (process.client) {
    // 清空現有數據
    calendarDateKeySet.value.clear();

    // 從對話記錄中提取日期
    conversations.value.forEach((conversation) => {
      let dateKey;
      if (conversation.dateKey) {
        dateKey = conversation.dateKey;
      } else {
        dateKey = toDateKey(conversation.timestamp);
      }
      calendarDateKeySet.value.add(dateKey);
    });

    // 更新 calendarDatesWithHistory 以保持向後兼容
    calendarDatesWithHistory.value = Array.from(
      calendarDateKeySet.value
    ).sort();

    console.log("載入的日期:", Array.from(calendarDateKeySet.value));
    console.log(
      "對話記錄:",
      conversations.value.map((c) => ({
        id: c.id,
        timestamp: c.timestamp,
        dateKey: c.dateKey || toDateKey(c.timestamp),
      }))
    );
  }
};

// 新增工具：確保日期出現在目前列表
const ensureDateVisible = (dateKey) => {
  if (!conversations.value.length) return null;

  // 先找該日期的第一則訊息
  const firstIndex = conversations.value.findIndex((c) => {
    const cDateKey = c.dateKey || toDateKey(c.timestamp);
    return cDateKey === dateKey;
  });

  if (firstIndex === -1) {
    console.log(`找不到日期 ${dateKey} 的對話記錄`);
    return null;
  }

  // 簡化分頁計算：確保該訊息在當前顯示範圍內
  const total = conversations.value.length;
  const startIndex = Math.max(
    0,
    total - currentPage.value * messagesPerPage.value
  );
  const endIndex = total;

  // 如果該訊息不在當前顯示範圍內，調整分頁
  if (firstIndex < startIndex || firstIndex >= endIndex) {
    // 計算需要顯示多少頁才能包含該訊息
    const messagesFromEnd = total - firstIndex;
    const requiredPages = Math.ceil(messagesFromEnd / messagesPerPage.value);
    currentPage.value = requiredPages;
    console.log(
      `調整分頁到第 ${currentPage.value} 頁以顯示日期 ${dateKey} 的訊息`
    );
  }

  console.log(
    `找到日期 ${dateKey} 的第一則訊息 ID: ${conversations.value[firstIndex]?.id}`
  );
  return conversations.value[firstIndex]?.id || null;
};

// 處理日期選擇變更
const handleDateChange = async (date) => {
  if (!date) return;
  const key = toDateKey(date);
  console.log(`選擇日期: ${date}, 轉換為 key: ${key}`);

  // 找到該日期第一則訊息
  const targetId = ensureDateVisible(key);

  // 關閉日曆
  showCalendar.value = false;

  // 確保 DOM 更新後再捲動
  await nextTick();
  if (targetId) {
    const el = document.getElementById(`message-${targetId}`);
    if (el) {
      console.log(`滾動到訊息 ID: ${targetId}`);
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      console.log(`找不到 DOM 元素: message-${targetId}`);
    }
  } else {
    console.log(`找不到日期 ${key} 的目標訊息`);
  }
};

// 檢查日期是否有聊天記錄
const isDateDisabled = (date) => {
  const dateStr = date.toISOString().split("T")[0];
  return !calendarDateKeySet.value.has(dateStr);
};

// 停用不在清單內的日期（只允許「該月有紀錄的日子」）
const isDateDisabledForMonth = (date) => {
  const key = toDateKey(date);
  // 限制：僅允許該月有紀錄的日期（monthDateKeySet）
  const isDisabled = !monthDateKeySet.value.has(key);
  console.log(
    `日期 ${key} 是否被停用: ${isDisabled}, 當月可用日期:`,
    Array.from(monthDateKeySet.value)
  );
  return isDisabled;
};

const onMonthYearChange = ({ month, year }) => {
  // month: 0-11
  visibleMonth.value = month;
  visibleYear.value = year;
  // 這裡不需要再算，monthDateKeySet 會自動更新
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

/** 一次呼叫 n8n，取得回覆文字（X-Answer header）+ 取得音檔 Blob 並播放 */
async function fetchTTSAndPlayAndReturnText(userText, extra = {}) {
  let res;
  try {
    res = await fetch(TTS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatInput: userText, // 你要給 n8n 的輸入
        sessionId: UUID,
        voicegender: voicegender,
        timestamp: new Date().toISOString(),
        pitch_semitones: 1.5,
      }),
    });
  } catch (e) {
    showAudioError.value = true;
    throw e;
  }

  if (!res.ok) {
    showAudioError.value = true;
    throw new Error(`TTS webhook failed: ${res.status}`);
  }

  // 1) 拿回覆文字（在 X-Answer）
  const headerText = res.headers.get("x-answer") || "";
  const answerText = decodeURIComponent(headerText);

  // 2) 讀音檔並播放
  const blob = await res.blob(); // audio/wav
  const url = URL.createObjectURL(blob);
  const audio = ensurePlayer();
  try {
    audio.pause();
  } catch {}
  revokeObjectUrl();
  audio.src = url;
  currentObjectUrl = url;

  audio.onplay = () => {
    isSpeaking.value = true;
  };
  audio.onended = () => {
    isSpeaking.value = false;
    revokeObjectUrl();
  };
  audio.onerror = () => {
    isSpeaking.value = false;
    showAudioError.value = true;
    revokeObjectUrl();
  };

  try {
    await audio.play();
  } catch (e) {
    // iOS 需要使用者手勢觸發
    showAudioError.value = true;
    throw e;
  }

  return answerText;
}

// 開始/停止語音識別
const toggleListening = () => {
  if (!recognitionRef) {
    if (process.client && typeof window !== "undefined") {
      // 檢查是否為 HTTPS 或 localhost
      if (
        window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost"
      ) {
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
  isLoading.value = true;
  currentTranscript.value = "";

  try {
    // 一次拿回覆 + 播音檔
    const botResponse = await fetchTTSAndPlayAndReturnText(transcript, {
      pitch_semitones: 1.5,
    });

    const nowTs = Date.now();
    const newConversation = {
      id: nowTs,
      ts: nowTs,
      user: transcript, // ← 修正這裡
      bot: botResponse || "（沒有回覆文字）",
      timestamp: new Date().toLocaleString("zh-TW"),
      dateKey: toDateKey(new Date(nowTs)),
    };
    conversations.value.push(newConversation); // ★ 改用 push，保持陣列「舊→新」
    latestResponse.value = botResponse || "（沒有回覆文字）";
    saveConversations();

    // 如果當前在歷史記錄頁面，確保新訊息可見
    if (showHistoryPage.value) {
      // 重置到第一頁以顯示最新訊息
      currentPage.value = 1;
      // 滾動到最新訊息
      nextTick(() => {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      });
    }

    console.log("語音輸入處理完成:", newConversation);
  } catch (error) {
    console.error("API 調用錯誤:", error);
    const errorResponse = "抱歉，服務暫時無法使用，請稍後再試。";
    const errorConversation = {
      id: Date.now(),
      user: transcript,
      bot: errorResponse,
      timestamp: new Date().toLocaleString("zh-TW"),
      dateKey: toDateKey(new Date()),
    };
    conversations.value.unshift(errorConversation);
    latestResponse.value = errorResponse;
    saveConversations();

    // 如果當前在歷史記錄頁面，確保新訊息可見
    if (showHistoryPage.value) {
      currentPage.value = 1;
      nextTick(() => {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      });
    }
  } finally {
    isLoading.value = false;
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
      volume: 1,
    };

    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    // iOS 預熱機制：先播放一個無聲的語音來激活 TTS
    if (process.client && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const warmupUtterance = new SpeechSynthesisUtterance("");
      warmupUtterance.lang = "zh-TW";
      warmupUtterance.volume = 0;
      synthRef.speak(warmupUtterance);

      // 延遲一下再播放真正的語音
      setTimeout(() => {
        synthRef.speak(utterance);
      }, 100);
    } else {
      synthRef.speak(utterance);
    }

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
  /* if (synthRef && process.client) {
    isManuallyStopped.value = true
    showAudioError.value = false  // ✅ 手動停止不顯示錯誤視窗
    synthRef.cancel()
    isSpeaking.value = false
  }*/
  const a = ensurePlayer();
  try {
    a.pause();
    a.currentTime = 0;
  } catch {}
  isSpeaking.value = false;
  revokeObjectUrl();
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

    // 如果從靜音切換到開啟，播放測試音
    if (!isMuted.value) {
      setTimeout(() => {
        speakText("語音功能已開啟");
      }, 500);
    }
  }
};

// 關閉音頻錯誤提示
const closeAudioError = () => {
  if (process.client) {
    showAudioError.value = false;
  }
};

const handleManualInput = async () => {
  const input = textInput.value.trim();
  if (!input) return;

  isLoading.value = true;
  currentTranscript.value = "";
  textInput.value = "";

  try {
    const botResponse = await fetchTTSAndPlayAndReturnText(input, {
      pitch_semitones: 1.5,
    });

    const nowTs = Date.now();
    const newConversation = {
      id: nowTs,
      ts: nowTs,
      user: input, // ← 修正這裡
      bot: botResponse || "（沒有回覆文字）",
      timestamp: new Date().toLocaleString("zh-TW"),
      dateKey: toDateKey(new Date(nowTs)),
    };
    conversations.value.push(newConversation); // ★ 改用 push，保持陣列「舊→新」
    latestResponse.value = botResponse || "（沒有回覆文字）";
    saveConversations();

    // 如果當前在歷史記錄頁面，確保新訊息可見
    if (showHistoryPage.value) {
      // 重置到第一頁以顯示最新訊息
      currentPage.value = 1;
      // 滾動到最新訊息
      nextTick(() => {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      });
    }

    console.log("文字輸入處理完成:", newConversation);
  } catch (error) {
    console.error("API 調用錯誤:", error);
    const errorResponse = "抱歉，服務暫時無法使用，請稍後再試。";
    const errorConversation = {
      id: Date.now(),
      user: input,
      bot: errorResponse,
      timestamp: new Date().toLocaleString("zh-TW"),
      dateKey: toDateKey(new Date()),
    };

    conversations.value.unshift(errorConversation);
    latestResponse.value = errorResponse;
    saveConversations();

    // 如果當前在歷史記錄頁面，確保新訊息可見
    if (showHistoryPage.value) {
      currentPage.value = 1;
      nextTick(() => {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      });
    }
  } finally {
    isLoading.value = false;
  }
};

// 本地儲存對話記錄
const saveConversations = () => {
  if (process.client) {
    localStorage.setItem(
      "chatConversations",
      JSON.stringify(conversations.value)
    );
    // 更新日曆數據
    loadCalendarDates();
  }
};

// 載入本地對話記錄
const loadConversations = () => {
  if (process.client) {
    const saved = localStorage.getItem("chatConversations");
    if (saved) {
      try {
        const raw = JSON.parse(saved);
        console.log("載入原始對話記錄:", raw);

        // 統一補上 dateKey
        conversations.value = raw
          .map((c) => {
            const ts = c.ts ?? c.id ?? Date.now(); // 舊資料沒有 ts，就用 id（你本來就用 Date.now() 當 id）
            return {
              ...c,
              ts,
              dateKey: c.dateKey || toDateKey(new Date(ts)),
            };
          })
          .sort((a, b) => a.ts - b.ts); // 保證陣列舊→新

        latestResponse.value =
          conversations.value[conversations.value.length - 1]?.bot || "";

        console.log("處理後的對話記錄:", conversations.value);

        loadCalendarDates();

        // 初始化日曆顯示月份為最新有記錄的月份
        if (conversations.value.length > 0) {
          // 使用 nextTick 確保 calendarDateKeySet 已更新
          nextTick(() => {
            const latestDate = maxHistoryDate.value;
            if (latestDate) {
              visibleMonth.value = latestDate.getMonth();
              visibleYear.value = latestDate.getFullYear();
              console.log(
                `初始化日曆顯示月份: ${visibleYear.value}/${
                  visibleMonth.value + 1
                }`
              );
            }
          });
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
  /*if (
    process.client &&
    typeof window !== "undefined" &&
    "speechSynthesis" in window
  ) {
    synthRef = window.speechSynthesis;

    // 檢查語音合成支援
    if (synthRef.getVoices().length === 0) {
      synthRef.onvoiceschanged = () => {
        const voices = synthRef.getVoices();
        const chineseVoice = voices.find(
          (voice) => voice.lang.includes("zh") || voice.lang.includes("cmn")
        );
        console.log(
          "可用語音:",
          voices.map((v) => `${v.name} (${v.lang})`)
        );
        console.log("中文語音:", chineseVoice);
      };
    }
  }*/
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

  // 添加調試函數到全局
  if (process.client) {
    window.debugCalendar = () => {
      console.log("=== 日曆調試信息 ===");
      console.log("對話記錄:", conversations.value);
      console.log("日曆日期集合:", Array.from(calendarDateKeySet.value));
      console.log("當月日期集合:", Array.from(monthDateKeySet.value));
      console.log("當前顯示月份:", visibleYear.value, visibleMonth.value + 1);
      console.log("最早日期:", minHistoryDate.value);
      console.log("最晚日期:", maxHistoryDate.value);
      console.log("分組歷史:", groupedHistory.value);
    };
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
        availableCharacters.value = availableCharacters.value.map((char) => {
          const savedChar = parsedCharacters.find((c) => c.id === char.id);
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
            customName:
              savedCharacter.customName ||
              foundCharacter.customName ||
              foundCharacter.displayName,
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
  if (recognitionRef) {
    recognitionRef.stop();
  }
  if (player) {
    try {
      player.pause();
    } catch {}
  }
  revokeObjectUrl();
  //if (process.client && synthRef) {synthRef.cancel();}
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
        volume: 1,
      },
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
    console.log(
      "角色選擇已確認:",
      currentCharacter.value.customName || currentCharacter.value.displayName
    );
    console.log("當前頭貼:", currentCharacter.value.avatar);
  }
};

// 角色名稱編輯相關函數
const showNameInputModal = () => {
  if (process.client) {
    characterNameInput.value =
      currentCharacter.value.customName || currentCharacter.value.displayName;
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
      (c) => c.id === currentCharacter.value.id
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

// --- 日期工具：統一成 YYYY-MM-DD ---
const toDateKey = (input) => {
  if (input instanceof Date) return input.toISOString().slice(0, 10);
  // input 可能是 "2025/8/20 下午 2:20:33" → 取前半段日期、轉成 YYYY-MM-DD
  const first = String(input).split(" ")[0]; // 2025/8/20
  const [y, m, d] = first.split("/");
  const pad = (n) => String(n).padStart(2, "0");
  const result = `${String(y).padStart(4, "0")}-${pad(m)}-${pad(d)}`;
  console.log(`toDateKey: ${input} → ${result}`);
  return result;
};

// 有紀錄的日期集合（Set，比 array 包含查詢快）
const calendarDateKeySet = ref(new Set());

// 動態區間（可選）
const minHistoryDate = computed(() => {
  const arr = Array.from(calendarDateKeySet.value);
  if (!arr.length) return undefined;
  const result = new Date(arr.sort()[0]); // 最早
  console.log("最早日期:", result);
  return result;
});
const maxHistoryDate = computed(() => {
  const arr = Array.from(calendarDateKeySet.value);
  if (!arr.length) return undefined;
  const result = new Date(arr.sort().slice(-1)[0]); // 最晚
  console.log("最晚日期:", result);
  return result;
});
</script>
