<template>
  <div class="chat-wrapper">
    <!-- 首次解說覆蓋層 -->
    <div v-if="showTutorial" class="tutorial-overlay" @click="closeTutorial">
      <div class="tutorial-content">
        <div class="tutorial-text">任意點擊關閉</div>
      </div>
    </div>

    <!-- 聊天頭部 -->
    <div class="chat-header">
      <div
        v-if="showTutorial && currentTutorialStep === 4"
        class="overZIndex firstText firstText4"
      >
        這裡可以切換角色以及幫角色取名字
      </div>
      <div
        class="avatar-container"
        :class="{ overZIndex: showTutorial && currentTutorialStep === 4 }"
        @click="currentTutorialStep === 4 ? null : showCharacterModal()"
      >
        <img class="avatar" :src="currentCharacter.avatar" alt="角色頭像" />
      </div>
      <div
        class="character-name-btn"
        :class="{ overZIndex: showTutorial && currentTutorialStep === 4 }"
        @click="currentTutorialStep === 4 ? null : showCharacterModal()"
      >
        <span>{{ currentCharacter.customName || currentCharacter.name }}</span>
        <img :src="recycleSvg" alt="刷新" />
      </div>
    </div>

    <!-- 初始對話氣泡 -->
    <div
      class="greeting-bubble"
      :class="{ overZIndex: showTutorial && currentTutorialStep === 5 }"
    >
      <div
        v-if="showTutorial && currentTutorialStep === 5"
        class="firstText firstText5"
      >
        這裡可以看到回應的訊息
      </div>
      <div v-if="isLoading" class="loading-indicator">
        <div class="spinner"></div>
        <span>思考中...</span>
      </div>
      <div v-else-if="latestResponse" class="latest-response">
        {{ latestResponse }}
      </div>
      <div v-else class="greeting-text">嗨~~有什麼需要幫您</div>
    </div>

    <!-- AI角色形象區域 -->
    <div class="character-section">
      <img
        :src="uiCharacter.fullImage"
        class="character-image"
        alt="AI角色"
        @click="handleCharacterClick"
      />
    </div>

    <!-- 語音控制區域 - 從下方彈出 -->
    <transition name="slide-up">
      <div
        v-if="showVoiceControls"
        class="voice-control-bar"
        :class="{
          overZIndex:
            (showTutorial && currentTutorialStep === 1) ||
            (showTutorial && currentTutorialStep === 2) ||
            (showTutorial && currentTutorialStep === 3),
        }"
      >
        <button class="control-btn history-btn" @click="showHistory">
          <img :src="timeSvg" alt="歷史紀錄" />
        </button>
        <div
          v-if="showTutorial && currentTutorialStep === 1"
          class="firstText firstText1"
        >
          這裡可以進行對話
        </div>
        <div
          v-if="showTutorial && currentTutorialStep === 2"
          class="firstText firstText2"
        >
          可自行關閉聲音
        </div>
        <div
          v-if="showTutorial && currentTutorialStep === 3"
          class="firstText firstText3"
        >
          這裡可以切換成文字對話
        </div>
        <button
          class="control-btn mic-btn"
          :class="{ listening: isListening }"
          @click="toggleListening"
          :disabled="isLoading"
        >
          <img :src="soundSvg" alt="語音" />

          <div v-if="isListening" class="pulse-ring"></div>
        </button>
        <button class="control-btn volume-btn" @click="toggleVolume">
          <img :src="isMuted ? mutedSvg : volumeSvg" alt="音量" />
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
      <div v-if="voiceModalOpen" class="voice-modal">
        <div class="voice-content" @click.stop>
          <img
            :src="voiceModalImageSrc"
            alt="音波圖"
            class="voice-wave"
            @click="handleVoiceModalClick"
          />
          <p v-if="showVoiceError" class="voice-error-text">
            聽不太清楚，請點擊再試一次
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
          <p>您的裝置無法撥放聲音請檢查</p>
          <ul>
            <li>是否靜音模式</li>
            <li>是否支援中文語音撥放</li>
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
              >{{ uiCharacter.customName || uiCharacter.displayName }}
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
                :src="uiCharacter.fullImage"
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
                  v-for="style in uiCharacter.styles"
                  :key="`${uiCharacter.id}-${style.id}`"
                  class="style-item"
                  :class="{
                    active: uiCharacter.styleId === style.id,
                    locked: style.locked,
                  }"
                  @click="selectStyle(style)"
                >
                  <div v-if="style.locked" class="style-locked">
                    <img :src="lockSvg" alt="鎖定" class="lock-icon" />
                  </div>
                  <img
                    :src="style.thumbnail"
                    alt="造型"
                    :class="{ 'locked-image': style.locked }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 確定按鈕 -->
          <button class="confirm-btn" @click="confirmCharacterSelection">
            確定
          </button>

          <!-- 底部角色切換區域 - Swiper 版本 -->
          <div class="character-switch-area">
            <swiper
              ref="characterSwiperRef"
              :slidesPerView="3.2"
              :spaceBetween="8"
              :centeredSlides="true"
              :pagination="{
                clickable: true,
              }"
              :modules="swiperModules"
              class="character-swiper"
              @slideChange="onSlideChange"
            >
              <swiper-slide
                v-for="character in availableCharacters"
                :key="character.id"
                class="character-option"
                :class="{
                  selected: uiCharacter.id === character.id,
                  locked: isCharacterLocked(character),
                }"
                @click="onCharacterClick(character)"
              >
                <div class="character-circle">
                  <!-- Loading 效果 -->
                  <div
                    v-if="characterImageLoading.has(character.id)"
                    class="character-loading"
                  >
                    <div class="loading-spinner"></div>
                  </div>
                  <!-- 鎖定效果 -->
                  <div
                    v-if="isCharacterLocked(character)"
                    class="character-locked"
                  >
                    <img :src="lockSvg" alt="鎖定" class="lock-icon" />
                  </div>
                  <!-- 角色圖片 -->
                  <img
                    :src="character.avatar"
                    alt="角色"
                    :class="{ 'locked-image': isCharacterLocked(character) }"
                    @load="onCharacterImageLoad(character.id)"
                    @error="onCharacterImageError(character.id)"
                  />
                </div>
              </swiper-slide>
            </swiper>
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

        <div class="history-content">
          <!-- 載入更舊訊息指示器 -->
          <transition name="fade">
            <div v-if="isLoadingOlderMessages" class="loading-older-messages">
              <div class="spinner"></div>
              <span>載入更舊的訊息...</span>
            </div>
          </transition>

          <!-- 一般歷史記錄 -->
          <transition name="fade">
            <div
              v-if="!showSearch || searchQuery === ''"
              class="history-list"
              @scroll="handleHistoryScroll"
              ref="historyScrollContainer"
            >
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
                      <!-- 如果正在載入，顯示 loading.gif -->
                      <div v-if="item.isLoading" class="loading-in-message">
                        <img
                          :src="loadingGif"
                          alt="載入中"
                          class="loading-gif"
                        />
                        <span>AI 正在回覆...</span>
                      </div>
                      <!-- 否則顯示 bot 回覆 -->
                      <div v-else>
                        {{ item.bot }}
                      </div>
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
              <div class="searchList">
                <div
                  v-for="result in searchResults"
                  :key="result.id"
                  class="search-result-item"
                  @click="scrollToMessage(result.id)"
                >
                  <div class="bubble">
                    <div class="content">
                      <span class="user-name">{{
                        result.userName || "用戶"
                      }}</span>
                      <span
                        v-html="highlightKeyword(result.user, searchQuery)"
                      ></span>
                    </div>
                    <span class="result-date">{{
                      formatDate(
                        result.dateKey || result.timestamp.split(" ")[0]
                      )
                    }}</span>
                  </div>
                  <div class="bubble">
                    <div class="content">
                      <span class="bot-name">{{ currentCharacter.name }}</span>
                      <span
                        v-html="highlightKeyword(result.bot, searchQuery)"
                      ></span>
                    </div>
                    <span class="result-date">{{
                      formatDate(
                        result.dateKey || result.timestamp.split(" ")[0]
                      )
                    }}</span>
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
              <img src="/assets/imgs/robot/mascotPhone.png" />
              <span>沒有找到相關對話</span>
            </div>
          </transition>

          <!-- 歷史頁輸入列（固定在底部） -->
          <div class="history-input-bar">
            <input
              v-model="textInput"
              class="history-text-input"
              type="text"
              placeholder="請輸入訊息..."
              @keypress.enter="handleManualInput"
              ref="historyInputRef"
            />
            <button
              class="history-send-btn"
              :disabled="isLoading || !textInput.trim()"
              @click="textInput.trim() && handleManualInput()"
              aria-label="送出"
            >
              <img :src="sendSvg" alt="送出" />
            </button>
          </div>
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
            placeholder="例如：嗨嗨嗨"
            maxlength="10"
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

    <!-- 角色選擇離開確認彈窗 -->
    <Alert
      v-if="showCharacterExitConfirm"
      default-content="現在離開的話，不會變更角色喔"
      :show-click-button="true"
      click-button-text="離開"
      @click="confirmCharacterExit"
      @close="cancelCharacterExit"
    />

    <!-- 近期推出彈窗 -->
    <Alert
      v-if="showComingSoon"
      default-content="此角色即將推出，敬請期待！"
      @close="closeComingSoonModal"
    />
  </div>
</template>

<style lang="scss" scoped>
.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-top: 1rem;
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
  position: relative;
  .firstText4 {
    left: 170px;
    top: 200%;
    //製作往上的正三角色
    &::after {
      content: "";
      position: absolute;
      top: -7px; // 箭頭接在泡泡的「上緣」外側
      left: 25%; // 視需要微調水平位置
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-bottom: 8px solid #fff;
    }
  }
  .avatar-container {
    width: 44px;
    height: 44px;
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
    color: $raphael-green-400;
    font-size: 18px;
    letter-spacing: 2.7px;
    cursor: pointer;
    @include neumorphismOuter($radius: 50px, $padding: 13px 12px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 120px;
    gap: 8px;
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

  .firstText5 {
    left: 50%;
    bottom: -77.5%;
    //製作往上的正三角色
    &::after {
      content: "";
      position: absolute;
      top: -7px; // 箭頭接在泡泡的「上緣」外側
      left: 50%; // 視需要微調水平位置
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-bottom: 8px solid #fff;
      transform: translateX(-50%);
    }
  }
}

.greeting-bubble .loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
  line-height: 1.5;
  color: #2d3748;
  width: 100%;
  height: 120px;
  text-align: justify;
  @include neumorphismOuter();

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
  width: 100%;
  height: 120px;
  text-align: justify;
  @include neumorphismOuter();
  overflow: hidden;
  overflow-y: scroll;
  @include scrollbarStyle();
}

.greeting-bubble .greeting-text {
  @extend .latest-response;
}

/* 角色形象區域 */
.character-section {
  position: relative;
  display: flex;
  justify-content: center;
  flex: 1;
  width: 100%;
  height: 0;
  padding-bottom: 84px;

  .character-image {
    height: 100%;
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

  .firstText1 {
    top: -50%;
    left: 50%;
    //三角形
    &::after {
      content: "";
      position: absolute;
      bottom: -7px;
      left: 50%;
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-top: 8px solid #fff;
      transform: translateX(-50%);
    }
  }
  .firstText2 {
    top: -50%;
    left: 83%;
    &::after {
      content: "";
      position: absolute;
      bottom: -7px;
      left: 50%;
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-top: 8px solid #fff;
      transform: translateX(-50%);
    }
  }
  .firstText3 {
    top: -50%;
    left: 13%;
    &::after {
      content: "";
      position: absolute;
      bottom: -7px;
      left: 50%;
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-top: 8px solid #fff;
      transform: translateX(-50%);
    }
  }

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
        @include neumorphismOuter(
          $bgColor: $raphael-green-400,
          $radius: 50%,
          $padding: 0
        );

        width: 60px;
        height: 60px;
        transition: all 0.3s ease;
      }
    }
  }

  .pulse-ring {
    position: absolute;
    width: 70px;
    height: 70px;
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
  padding: 0 16px;
  position: fixed;
  bottom: 219px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;

  .input-container {
    display: flex;
    align-items: center;
    @include liquidGlass($radius: 20px, $padding: 8px 16px);

    .text-input {
      flex: 1;
      border: none;
      font-size: 16px;
      outline: none;
      background: transparent;
      padding-right: 16px;
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
      color: $raphael-white;
      font-size: 18px;
      @include neumorphismOuter(
        $bgColor: $raphael-green-400,
        $radius: 50px,
        $padding: 0
      );
      border: none;
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
    }
  }
}

/* 轉錄顯示 */
.transcript-display {
  display: none; //暫時不顯示
  width: 100%;
  padding: 0 20px;
  margin-bottom: 20px;

  .transcript-text {
    text-align: center;
    font-size: 16px;
    color: #2d3748;
    @include neumorphismOuter();
    background: linear-gradient(145deg, #e0e5ec, #f0f4f8);
    margin: 0 auto;
    max-width: 300px;
  }
}
.voiceModelClose {
  @include neumorphismOuter($radius: 50%, $padding: 4px);
  margin-top: 44px;
  transition: all 0.3s ease;

  &:hover,
  &:active {
    @include neumorphismOuter(
      $radius: 50%,
      $padding: 4px,
      $x: 0,
      $y: 0,
      $blur: 6px
    );
  }

  .voiceModelImg {
    border: 1px solid var(--Warning-default, #ec4f4f);
    border-radius: 50%;
    padding: 8px;
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
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 50%;

  transform: translateX(-50%);
  width: 100%;
  height: 375px;

  background: rgba(245, 247, 250, 0.1);
  backdrop-filter: blur(22px);
  z-index: 100;
  @include neumorphismOuter(
    $bgColor: rgba(245, 247, 250, 0.1),
    $radius: 50px 50px 0 0,
    $x: 0,
    $y: -2px,
    $blur: 12px,
    $color: $raphael-white
  );

  .voice-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .voice-wave {
      width: 115px;
      height: 115px;
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
      color: $raphael-black;
      text-align: center;
      font-size: 20px;
      font-weight: 600;
      text-transform: lowercase;
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
  width: 251px;
  transform: translateX(-50%);
  @include neumorphismOuter($bgColor: rgba(255, 255, 255, 0.65));
  -webkit-backdrop-filter: blur(50px);
  backdrop-filter: blur(50px);
  z-index: 999;

  .alert-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;

    p {
      font-size: 20px;
      font-weight: 700;
      line-height: 24px;
      color: #2d3748;
    }

    ul {
      display: flex;
      flex-direction: column;
      align-self: start;
      gap: 8px;
      font-size: 18px;
      color: #4a5568;
      padding-left: 24px;
      list-style: disc;
    }

    .alert-button {
      color: $raphael-white;
      border: none;
      cursor: pointer;
      font-size: 18px;
      width: 110px;
      margin-top: 16px;

      @include neumorphismOuter(
        $bgColor:
          linear-gradient(
            90deg,
            var(--primary-400-opacity-40, rgba(116, 188, 31, 0.4)) 0%,
            var(--primary-400-opacity-70, rgba(116, 188, 31, 0.7)) 100%
          ),
        $radius: 50px,
        $padding: 11px 16px
      );

      transition: all 0.3s ease;

      &:hover,
      &:active {
        @include neumorphismOuter(
          $bgColor:
            linear-gradient(
              90deg,
              var(--primary-400-opacity-70, rgba(116, 188, 31, 0.7)) 0%,
              var(--Primary-default, #74bc1f) 100%
            ),
          $radius: 50px,
          $padding: 11px 16px,
          $x: 0,
          $y: 0,
          $blur: 6px
        );
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
      gap: 16px;
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
    display: flex;
    align-items: center;
    @include neumorphismOuter($radius: 50px, $padding: 8px);
    width: -webkit-fill-available;
    left: 0;
    right: 0;
    margin: 0 16px;
    z-index: 2;
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

  /* 無搜尋結果 */
  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 24px;
    font-weight: bold;
    height: 100%;
    @include neumorphismOuter();
  }

  .history-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    flex: 1;

    padding-bottom: 56px;
    background: transparent;
    min-height: 0; /* 讓 flex 子項可以縮、才捲得動 */
    .history-list {
      padding: 16px;
      flex: 1;
      min-height: 0;
      padding-bottom: 16px;
      overflow-y: auto;
      touch-action: pan-y;
      -webkit-overflow-scrolling: touch;
    }
    .history-group {
      .date-separator {
        text-align: center;
        font-size: 14px;
        color: #718096;
        margin-bottom: 20px;
        @include neumorphismOuter(
          $radius: 20px,
          $padding: 8px 16px,
          $x: 0,
          $y: 0,
          $blur: 6px
        );
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
              //跟人物頭像一樣
              margin-right: 12px;
              flex-shrink: 0;
              margin-top: auto;
              transform: translateY(20px);
              @include neumorphismOuter($radius: 50%, $padding: 0);
              overflow: hidden;
            }

            .bubble {
              display: flex;
              flex-direction: column;
              gap: 8px;
              @include neumorphismOuter($radius: 20px 20px 20px 0);
              color: #2d3748;
              max-width: 70%;
            }
          }

          &.user {
            justify-content: flex-end;

            .bubble {
              display: flex;
              flex-direction: column;
              gap: 8px;

              @include neumorphismOuter(
                $bgColor: $raphael-green-400,
                $radius: 20px 0 20px 20px
              );
              color: $raphael-white;
              width: 250px;
            }

            .time {
              color: $raphael-white;
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
            align-self: flex-end;
            opacity: 0.8;
          }

          .loading-in-message {
            display: flex;
            align-items: center;
            gap: 8px;

            .loading-gif {
              width: 20px;
              height: 20px;
            }

            span {
              font-size: 14px;
              color: #718096;
            }
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

/* 歷史頁底部輸入列---wing 20250829 */
.history-input-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  @include neumorphismOuter($radius: 20px, $padding: 8px 12px);
  margin: 0 1rem;
}

.history-text-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 18px;
  outline: none;
  color: #2d3748;

  &::placeholder {
    color: #718096;
  }
}

.history-send-btn {
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  @include neumorphismOuter(
    $bgColor: $raphael-green-400,
    $radius: 50px,
    $padding: 0
  );
  transition: all 0.2s ease;

  &:hover,
  &:active {
    @include neumorphismOuter(
      $bgColor: $raphael-green-500,
      $radius: 50px,
      $padding: 0,
      $x: 0,
      $y: 0,
      $blur: 6px
    );
  }

  &:disabled {
    @include neumorphismOuter(
      $bgColor: $raphael-green-400,
      $radius: 50px,
      $padding: 0
    );
    opacity: 0.5;
    cursor: not-allowed;
  }

  img {
    width: 22px;
    height: 22px;
  }
}
/* 歷史頁底部輸入列---wing 20250829 */

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
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;

  .search-results-header {
    align-self: flex-end;
    font-size: 18px;
    color: #718096;
  }

  .searchList {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    padding: 8px;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    .search-result-item {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      cursor: pointer;

      .bubble {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        @include neumorphismOuter();
        .content {
          display: flex;
          flex-direction: column;
          gap: 16px;
          .user-name,
          .bot-name {
            color: #b1c0d8;
            font-size: 18px;
          }
          & > span {
            font-size: 16px;
            line-height: 15px;
            letter-spacing: 1px;
          }
        }
        .result-date {
          color: #b1c0d8;
          font-size: 14px;
          word-break: keep-all;
          white-space: nowrap;
        }
      }
    }
  }
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
      @include neumorphismOuter($radius: 50px, $padding: 13px 12px);

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
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 90px;
      height: 220px;
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
          color: $raphael-black;
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
          position: relative;

          &.locked {
            cursor: not-allowed;
            border: 2px solid rgba(255, 255, 255, 0.3);
          }

          &:hover,
          &:active {
            background: rgba(31, 188, 179, 0.7);
          }

          img {
            width: 100%;

            object-fit: cover;
          }

          .style-locked {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(3.5px);
            border-radius: 50%;
            z-index: 2;

            .lock-icon {
              width: 16px;
              height: 16px;
              filter: brightness(0) saturate(100%) invert(20%) sepia(0%)
                saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%);
            }
          }

          .locked-image {
            filter: blur(3.5px);
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
      $padding: 9px 16px
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

    .character-swiper {
      @include neumorphismOuter();
      padding: 8px;

      /* 自定義 Swiper 樣式 */
      :deep(.swiper-wrapper) {
        align-items: center;
      }

      :deep(.swiper-slide) {
        width: 100px;
        height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-shrink: 0; /* 防止被壓縮 */
      }

      :deep(.swiper-pagination) {
        bottom: -20px;

        .swiper-pagination-bullet {
          background: rgba(116, 188, 31, 0.3);
          opacity: 1;

          &.swiper-pagination-bullet-active {
            background: $raphael-green-400;
          }
        }
      }

      .character-option {
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
        height: 100%;

        .character-circle {
          background: rgba(31, 188, 179, 0.2);
          border-radius: 50%;
          width: 100px;
          height: 100px;
          cursor: pointer;
          border: none;
          overflow: hidden;
          transition: all 0.3s ease;
          position: relative;

          &:hover,
          &:active {
            background: rgba(31, 188, 179, 0.7);
          }

          img {
            object-fit: cover;
            border-radius: 50%;
          }

          .character-loading {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(31, 188, 179, 0.2);
            border-radius: 50%;

            .loading-spinner {
              width: 24px;
              height: 24px;
              border: 3px solid rgba(116, 188, 31, 0.3);
              border-top: 3px solid $raphael-green-400;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
          }

          .character-locked {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(3.5px);
            border-radius: 50%;
            z-index: 2;

            .lock-icon {
              width: 20px;
              height: 20px;
              filter: brightness(0) saturate(100%) invert(20%) sepia(0%)
                saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%);
            }
          }

          .locked-image {
            filter: blur(3.5px);
          }
        }

        &.selected .character-circle {
          border: 2px solid $raphael-green-400;
          @include neumorphismOuter($radius: 50%, $padding: 0, $x: 0, $y: 6px);

          &:hover,
          &:active {
            @include neumorphismOuter(
              $radius: 50%,
              $padding: 0,
              $x: 0,
              $y: 6px
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
  @include blurOverlay();
}

.name-input-modal {
  @include neumorphismOuter($bgColor: rgba(245, 247, 250, 0.65));
  backdrop-filter: blur(44px);
  width: 90%;
  max-width: 361px;
  text-align: center;

  .name-input-title {
    color: $raphael-black;
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
    @include neumorphismOuter($radius: 50px, $padding: 10px 12px);
    border: none;
    overflow: hidden;
    color: $raphael-black;
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
      width: 110px;
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
          color: $raphael-green-500;
        }
      }

      &.name-input-confirm {
        @include neumorphismOuter(
          $bgColor: $raphael-green-400,
          $radius: 50px,
          $padding: 10px 20px
        );
        color: $raphael-white;
        font-size: 18px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 2.7px;

        &:hover {
          @include neumorphismOuter(
            $bgColor: $raphael-green-500,
            $radius: 50px,
            $padding: 10px 20px,
            $x: 0,
            $y: 0,
            $blur: 6px
          );
        }
      }
    }
  }
}

// 日曆選擇彈窗樣式
.calendar-overlay {
  @include blurOverlay();
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
  @include neumorphismOuter($bgColor: rgba(245, 247, 250, 0.65));
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;

  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

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
          color: $raphael-white;
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

.firstText {
  position: absolute;

  border-radius: var(--Radius-r-20, 20px);
  background: var(--Neutral-white, #fff);
  padding: 1rem;
  transform: translate(-50%, -50%);

  white-space: nowrap;
}
.overZIndex {
  z-index: 10000;
}

/* 首次登入解說覆蓋層樣式 */
.tutorial-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.tutorial-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.tutorial-text {
  color: #fff;
  text-align: center;
  font-size: var(--Text-font-size-20, 20px);
  font-style: normal;
  font-weight: 700;
  line-height: 120%; /* 24px */
  pointer-events: none;
}
</style>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import { useHead } from "#app";
import BottomNav from "~/components/BottomNav.vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from "swiper/vue";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
// import required modules
import { Pagination } from "swiper/modules";
// 移除import，改用動態路徑
import recycleSvg from "~/assets/imgs/robot/recycle.svg";
import timeSvg from "~/assets/imgs/robot/time.svg";
import soundSvg from "~/assets/imgs/robot/sound.svg";
import assistantSoundGif from "~/assets/imgs/robot/assistantSound.gif";
import assistantDefaultGif from "~/assets/imgs/robot/assistantDefault.gif";
import loadingGif from "~/assets/imgs/robot/loading.gif";
import lockSvg from "~/assets/imgs/robot/lock.svg";
import Alert from "~/components/Alert.vue";
import volumeSvg from "~/assets/imgs/robot/volume.svg";
import mutedSvg from "~/assets/imgs/robot/muted.svg";
import searchSvg from "~/assets/imgs/robot/search.svg";
import calendarSvg from "~/assets/imgs/robot/calendar.svg";
import sendSvg from "~/assets/imgs/robot/send.svg";

// ====== 新增：你的 n8n TTS webhook（需回傳 audio/wav 二進位檔）======
const TTS_WEBHOOK_URL = "https://aiwisebalance.com/webhook/oss-gpt";
const TEXT_WEBHOOK_URL = "https://aiwisebalance.com/webhook/Textchat"; // ← 你的「純文字」端點（若同一支就跟 TTS_URL 相同）
const TEXT_MESSAGE_URL =
  "https://23700999.com:8081/HMA/TTEsaveChatMessageHistory.jsp"; // ← 你的「純文字」端點（若同一支就跟 TTS_URL 相同）
const GET_CHAT_HISTORY_URL =
  "https://23700999.com:8081/HMA/TTEgetChatMessageHistoryList.jsp"; // ← 獲取聊天記錄的端點
const voicegender = "female";
const historyInputRef = ref(null);

// Swiper modules
const swiperModules = [Pagination];
const characterSwiperRef = ref(null);

// 角色圖片載入狀態
const characterImageLoading = ref(new Set());

// 檢查角色是否被鎖定
const isCharacterLocked = (character) => {
  return character.locked === true;
};

// 響應式狀態
const router = useRouter();
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

// 首次登入解說相關狀態
const showTutorial = ref(false);
const currentTutorialStep = ref(1);
const tutorialSteps = [1, 2, 3, 4, 5]; // 解說步驟順序
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
import pet4_3 from "~/assets/imgs/robot/character/pet4_3.png";

const characterImageSrc = ref(doctor);

// UI 目前應該顯示誰的 computed
const uiCharacter = computed(() =>
  showCharacterSelection.value && tempSelectedCharacter.value
    ? tempSelectedCharacter.value
    : currentCharacter.value
);

const voiceModalImageSrc = ref(assistantSoundGif); // 語音模態框圖片路徑
const textInputRef = ref(null); // 添加文字輸入框的 ref
const searchInputRef = ref(null); // 添加搜尋輸入框的 ref
const nameInputRef = ref(null); // 添加名稱輸入框的 ref
const latestResponse = ref(""); // 最新回覆
const showSearch = ref(false); // 搜尋功能開關
const searchQuery = ref(""); // 搜尋關鍵字
const searchResults = ref([]); // 搜尋結果
// 從 localStorage 獲取用戶資料
const localData = localStorage.getItem("userData");
const localobj = localData ? JSON.parse(localData) : null;
console.log("localobj=", localobj?.Mobile);

if (!localData) {
  router.push("/");
}

// 角色選擇相關狀態
const showCharacterSelection = ref(false); // 顯示角色選擇彈窗
const showComingSoon = ref(false); // 顯示近期推出彈窗
const showCharacterExitConfirm = ref(false); // 顯示角色選擇離開確認彈窗
const tempSelectedCharacter = ref(null); // 臨時選擇的角色
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
      { id: 5, thumbnail: doctor5, fullImage: doctor5, locked: true },
      { id: 6, thumbnail: doctor6, fullImage: doctor6, locked: true },
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
      { id: 3, thumbnail: girl1_3, fullImage: girl1_3, locked: true },
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
      { id: 2, thumbnail: girl2_2, fullImage: girl2_2, locked: true },
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
      { id: 3, thumbnail: man3_3, fullImage: man3_3, locked: true },
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
      { id: 3, thumbnail: pet4_3, fullImage: pet4_3 },
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
const voiceModalOpen = ref(false);
let voiceTimeout = null; // 語音識別超時計時器
let hasFinalResult = false; // 確保只處理一次 final
let finalizedByUs = false;

function clearVoiceTimeout() {
  if (voiceTimeout) {
    clearTimeout(voiceTimeout);
    voiceTimeout = null;
  }
}

function reallyCloseVoiceModal() {
  clearVoiceTimeout();
  isListening.value = false;
  showVoiceError.value = false;
  currentTranscript.value = "";
  voiceModalImageSrc.value = assistantSoundGif;
  voiceModalOpen.value = false; // ← 真正關窗
}

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
const showHistory = async () => {
  if (process.client) {
    showHistoryPage.value = true;

    // 禁用背景滾動
    document.body.style.overflow = "hidden";

    // 重新獲取最新的聊天記錄
    await fetchChatHistory();

    // 重置分頁狀態
    currentPage.value = 1;
    hasMoreMessages.value = conversations.value.length > messagesPerPage.value;

    // 等待頁面渲染完成後滾動到底部
    nextTick(() => {
      setTimeout(() => {
        scrollToBottom();
        historyInputRef.value?.focus(); // ★ 新增：自動聚焦輸入框
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

    // 恢復背景滾動
    document.body.style.overflow = "";
  }
};

const closeTextInput = () => {
  showTextInput.value = false;
};

// 首次登入解說相關函數
const checkTutorialStatus = () => {
  if (process.client) {
    const hasSeenTutorial = localStorage.getItem("robotTutorialSeen");
    if (!hasSeenTutorial) {
      showTutorial.value = true;
      currentTutorialStep.value = 1;
    }
  }
};

const closeTutorial = () => {
  if (process.client) {
    const currentIndex = tutorialSteps.indexOf(currentTutorialStep.value);
    if (currentIndex < tutorialSteps.length - 1) {
      // 如果還有下一步，切換到下一步
      currentTutorialStep.value = tutorialSteps[currentIndex + 1];
    } else {
      // 如果是最後一步，關閉解說
      showTutorial.value = false;
      localStorage.setItem("robotTutorialSeen", "true");
    }
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
const toggleCalendar = async () => {
  if (process.client) {
    showCalendar.value = !showCalendar.value;
    if (showCalendar.value) {
      // 重新獲取聊天記錄以確保日期是最新的
      await fetchChatHistory();
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
      console.log("當月可用日期:", Array.from(monthDateKeySet.value));
    }
  }
};

// 載入日曆中有聊天記錄的日期
const loadCalendarDates = () => {
  if (process.client) {
    // 清空現有數據
    calendarDateKeySet.value.clear();

    console.log("開始載入日曆日期，對話記錄數量:", conversations.value.length);

    // 從對話記錄中提取日期
    conversations.value.forEach((conversation, index) => {
      let dateKey;
      if (conversation.dateKey) {
        dateKey = conversation.dateKey;
      } else {
        dateKey = toDateKey(conversation.timestamp);
      }
      console.log(`對話 ${index}:`, {
        timestamp: conversation.timestamp,
        dateKey: dateKey,
        originalDateKey: conversation.dateKey,
      });
      calendarDateKeySet.value.add(dateKey);
    });

    // 更新 calendarDatesWithHistory 以保持向後兼容
    calendarDatesWithHistory.value = Array.from(
      calendarDateKeySet.value
    ).sort();

    console.log("最終載入的日期:", Array.from(calendarDateKeySet.value));
    console.log("排序後的日期:", calendarDatesWithHistory.value);
  }
};

// 處理日期選擇變更
const handleDateChange = async (date) => {
  if (!date) return;
  const key = toDateKey(date);
  console.log(`選擇日期: ${date}, 轉換為 key: ${key}`);

  // 關閉日曆
  showCalendar.value = false;

  // 找到該日期的第一則訊息
  const targetMessage = conversations.value.find((msg) => {
    const msgDateKey = msg.dateKey || toDateKey(msg.timestamp);
    return msgDateKey === key;
  });

  if (targetMessage) {
    console.log(`找到目標訊息 ID: ${targetMessage.id}`);

    // 確保該訊息在當前顯示範圍內
    const totalMessages = conversations.value.length;
    const messageIndex = conversations.value.findIndex(
      (msg) => msg.id === targetMessage.id
    );

    if (messageIndex !== -1) {
      // 計算需要顯示多少頁才能包含該訊息
      const messagesFromEnd = totalMessages - messageIndex;
      const requiredPages = Math.ceil(messagesFromEnd / messagesPerPage.value);
      currentPage.value = requiredPages;

      console.log(
        `調整分頁到第 ${currentPage.value} 頁以顯示日期 ${key} 的訊息`
      );

      // 等待 DOM 更新後滾動到目標訊息
      await nextTick();
      setTimeout(() => {
        const el = document.getElementById(`message-${targetMessage.id}`);
        if (el) {
          console.log(`滾動到訊息 ID: ${targetMessage.id}`);
          el.scrollIntoView({ behavior: "smooth", block: "start" });

          // 添加高亮效果
          el.style.backgroundColor = "rgba(116, 188, 31, 0.1)";
          el.style.borderRadius = "12px";
          el.style.transition = "background-color 0.3s ease";

          // 3秒後移除高亮
          setTimeout(() => {
            el.style.backgroundColor = "";
            el.style.borderRadius = "";
          }, 3000);
        } else {
          console.log(`找不到 DOM 元素: message-${targetMessage.id}`);
        }
      }, 100);
    }
  } else {
    console.log(`找不到日期 ${key} 的訊息`);
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
  reallyCloseVoiceModal();
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
      // 3秒沒聲音直接顯示有關閉按鈕的提示
      showVoiceError.value = true;
      voiceModalImageSrc.value = assistantDefaultGif;
      isListening.value = false; // 停止語音識別
      if (process.client) {
        recognitionRef?.stop();
      }
    }
  }, 3000); // 3秒超時顯示提示
};

// 獲取聊天記錄
const fetchChatHistory = async () => {
  if (!localobj) {
    console.error("用戶資料不存在");
    return;
  }

  try {
    const response = await fetch(GET_CHAT_HISTORY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Key: "qrt897hpmd",
        MID: localobj.MID,
        Mobile: localobj.Mobile,
        CallTime: "1",
      }),
    });

    if (!response.ok) {
      throw new Error(`API 調用失敗: ${response.status}`);
    }

    const data = await response.json();
    console.log("獲取到的聊天記錄:", data);

    if (
      data.Result === "OK" &&
      data.ChatMessage &&
      Array.isArray(data.ChatMessage)
    ) {
      // 轉換 API 資料格式為本地格式
      const convertedMessages = data.ChatMessage.map((msg, index) => {
        const inputTime = new Date(msg.Inputtime);
        const outputTime = new Date(msg.Outputtime);

        console.log(`處理訊息 ${index}:`, {
          Inputtime: msg.Inputtime,
          parsedDate: inputTime,
          dateKey: toDateKey(inputTime),
        });

        return {
          id: Date.now() + index, // 生成唯一 ID
          ts: inputTime.getTime(),
          user: msg.Inmessage || "",
          bot: msg.Outmessage || "",
          timestamp: inputTime.toLocaleString("zh-TW"),
          dateKey: toDateKey(inputTime),
        };
      });

      // 按時間排序（舊到新）
      convertedMessages.sort((a, b) => a.ts - b.ts);

      conversations.value = convertedMessages;

      // 更新最新回覆
      if (convertedMessages.length > 0) {
        latestResponse.value =
          convertedMessages[convertedMessages.length - 1].bot;
      }

      // 更新日曆數據
      loadCalendarDates();

      console.log("聊天記錄載入完成:", convertedMessages);
    }
  } catch (error) {
    console.error("獲取聊天記錄失敗:", error);
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

        // 一旦拿到 final，就立刻關視窗 & 只處理一次
        if (
          event.results[event.results.length - 1].isFinal &&
          !hasFinalResult
        ) {
          hasFinalResult = true;
          clearVoiceTimeout();
          finalizedByUs = true; // ← 標記為我們主動收尾
          reallyCloseVoiceModal(); // ← 先把 UI 關乾淨
          handleSpeechEnd(transcript); // 非同步處理對話
          try {
            recognitionRef.stop();
          } catch {}
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
              closeVoiceModal();
              break;
            case "no-speech":
            case "audio-capture":
              // 如果還沒有顯示錯誤提示，則顯示
              if (!showVoiceError.value) {
                showVoiceError.value = true;
                voiceModalImageSrc.value = assistantDefaultGif;
              }
              break;
            case "network":
              alert("網路連接問題，請檢查網路後重試");
              closeVoiceModal();
              break;
            default:
              if (event.error !== "aborted") {
                // 如果還沒有顯示錯誤提示，則顯示
                if (!showVoiceError.value) {
                  showVoiceError.value = true;
                  voiceModalImageSrc.value = assistantDefaultGif;
                }
              }
          }
        }
      };

      recognitionRef.onend = () => {
        if (finalizedByUs) {
          finalizedByUs = false;
          hasFinalResult = false;
          return;
        }
        if (!hasFinalResult) {
          // ← 沒拿到 final 才給提示
          isListening.value = false;
          showVoiceError.value = true;
          voiceModalImageSrc.value = assistantDefaultGif;
          voiceModalOpen.value = true; // 保持彈窗開著讓使用者點關閉
        }
        hasFinalResult = false;
      };
    }

    // 初始化語音合成
    if ("speechSynthesis" in window) {
      synthRef = window.speechSynthesis;
    }
  }
};

/** 統一呼叫 n8n：可選擇是否播放音檔 */
async function sendViaN8n(userText, { playAudio = false, extra = {} } = {}) {
  const url = playAudio ? TTS_WEBHOOK_URL : TEXT_WEBHOOK_URL;
  const nowtime = new Date().toISOString();
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatInput: userText,
        sessionId: UUID,
        voicegender,
        timestamp: nowtime,
        pitch_semitones: 1.5,
        ...extra,
      }),
    });
  } catch (e) {
    showAudioError.value = true;
    throw e;
  }

  if (!res.ok) {
    showAudioError.value = true;
    throw new Error(`webhook failed: ${res.status}`);
  }

  // 先嘗試從 Header 取回文字（X-Answer）
  let answerText = "";
  const rawHeader = res.headers.get("x-answer");
  if (rawHeader) {
    try {
      answerText = decodeURIComponent(rawHeader);
    } catch {
      // 後端若沒做 encodeURIComponent，就直接用原值
      answerText = rawHeader;
    }
  }

  const ct = (res.headers.get("content-type") || "").toLowerCase();

  // 若是音訊回應
  if (ct.includes("audio/")) {
    const blob = await res.blob();
    if (playAudio) {
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
      } catch {
        /* iOS 未互動可能失敗 */
      }
    }
    // 音訊情境下，若 header 沒文字，就維持空字串，最後會交給預設備援
  } else {
    // 非音訊：嘗試解析 JSON / 純文字
    let data = null;
    try {
      data = await res.clone().json();
    } catch {
      try {
        const txt = await res.text();
        if (!answerText) answerText = txt || "";
      } catch {}
    }

    if (data && !answerText) {
      // 兼容多種欄位：bot / answer / text / message / content / output...
      const pick = (obj) => {
        if (!obj) return "";
        if (typeof obj === "string") return obj;
        const keys = ["bot", "answer", "text", "message", "content", "output"];
        for (const k of keys) {
          const v = obj[k];
          if (typeof v === "string" && v.trim()) return v;
          if (v && typeof v === "object") {
            const inner = pick(v);
            if (inner) return inner;
          }
        }
        return "";
      };
      answerText = pick(data);
    }
  }

  //寫入np資料庫
  if (localobj) {
    try {
      res = await fetch(TEXT_MESSAGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Key: "qrt897hpmd",
          MID: localobj.MID,
          Mobile: localobj.Mobile,
          Type: "P",
          Inmessage: userText,
          Outmessage: answerText,
          Inputtime: nowtime,
          Outputtime: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error("保存聊天記錄失敗:", e);
    }
  }

  return (
    (answerText && String(answerText).trim()) ||
    "（親愛的:您的問題我目前沒辦法回答）"
  );
}

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
    reallyCloseVoiceModal();
  } else {
    if (process.client) {
      showVoiceError.value = false;
      voiceModalImageSrc.value = assistantSoundGif;
      currentTranscript.value = "";
      hasFinalResult = false;
      finalizedByUs = false;
      voiceModalOpen.value = true; // ← 開窗
      isListening.value = true;
      recognitionRef.start();
      startVoiceTimeout();
    }
  }
};

// 處理語音輸入結束
const handleSpeechEnd = async (transcript) => {
  if (!transcript.trim()) return;

  // 語音輸入：顯示 "思考中..." 而不是用戶輸入
  isLoading.value = true;
  currentTranscript.value = "";

  try {
    // 一次拿回覆 + 播音檔
    const botResponse = await sendViaN8n(transcript, { playAudio: true });
    console.log("botResponse", botResponse);
    const nowTs = Date.now();
    const newConversation = {
      id: nowTs,
      ts: nowTs,
      user: transcript,
      bot: botResponse || "（親愛的:您的問題我目前沒辦法回答）",
      timestamp: new Date().toLocaleString("zh-TW"),
      dateKey: toDateKey(new Date(nowTs)),
    };
    console.log("newConversation", newConversation);

    conversations.value.push(newConversation);
    latestResponse.value = botResponse || "（親愛的:您的問題我目前沒辦法回答）";
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
    conversations.value.push(errorConversation);
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

async function handleManualInput() {
  const input = textInput.value.trim();
  if (!input) return;

  // 文字輸入：立即將用戶輸入添加到聊天記錄中
  const nowTs = Date.now();
  const userMessage = {
    id: nowTs,
    ts: nowTs,
    user: input,
    bot: "", // 暫時為空，等待 API 回傳
    timestamp: new Date().toLocaleString("zh-TW"),
    dateKey: toDateKey(new Date(nowTs)),
    isLoading: true, // 標記為載入中
  };

  // 立即添加到聊天記錄
  conversations.value.push(userMessage);
  currentTranscript.value = "";
  textInput.value = "";

  // 如果當前在歷史記錄頁面，滾動到底部
  if (showHistoryPage.value) {
    currentPage.value = 1;
    nextTick(() => {
      setTimeout(() => {
        scrollToBottom();
        historyInputRef.value?.focus();
      }, 100);
    });
  }

  try {
    const botResponse = await sendViaN8n(input, { playAudio: false });
    console.log(botResponse);

    // 更新聊天記錄中的 bot 回覆
    const messageIndex = conversations.value.findIndex(
      (msg) => msg.id === nowTs
    );
    if (messageIndex !== -1) {
      conversations.value[messageIndex].bot =
        botResponse || "（親愛的:您的問題我目前沒辦法回答）";
      conversations.value[messageIndex].isLoading = false;
    }

    latestResponse.value = botResponse || "（親愛的:您的問題我目前沒辦法回答）";
    saveConversations();

    console.log("文字輸入處理完成:", userMessage);
  } catch (error) {
    console.error("API 調用錯誤:", error);
    const errorResponse = "抱歉，服務暫時無法使用，請稍後再試。";

    // 更新聊天記錄中的錯誤回覆
    const messageIndex = conversations.value.findIndex(
      (msg) => msg.id === nowTs
    );
    if (messageIndex !== -1) {
      conversations.value[messageIndex].bot = errorResponse;
      conversations.value[messageIndex].isLoading = false;
    }

    latestResponse.value = errorResponse;
    saveConversations();
  }
}

// 本地儲存對話記錄（現在主要用於日曆數據更新）
const saveConversations = () => {
  if (process.client) {
    // 更新日曆數據
    loadCalendarDates();
  }
};

// 載入對話記錄（從 API 獲取）
const loadConversations = async () => {
  if (process.client) {
    // 從 API 獲取聊天記錄
    await fetchChatHistory();

    // 初始化日曆顯示月份為最新有記錄的月份
    if (conversations.value.length > 0) {
      // 使用 nextTick 確保 calendarDateKeySet 已更新
      nextTick(() => {
        const latestDate = maxHistoryDate.value;
        if (latestDate) {
          visibleMonth.value = latestDate.getMonth();
          visibleYear.value = latestDate.getFullYear();
          console.log(
            `初始化日曆顯示月份: ${visibleYear.value}/${visibleMonth.value + 1}`
          );
        }
      });
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

  // 檢查首次登入解說狀態
  checkTutorialStatus();

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
  return text.replace(
    regex,
    '<span class="highlight" style="color:#74bc1f">$1</span>'
  );
};

// 角色選擇相關函數
const showCharacterModal = () => {
  if (process.client) {
    showCharacterSelection.value = true;
    // 初始化臨時選擇狀態為當前角色
    tempSelectedCharacter.value = { ...currentCharacter.value };
    // 初始化角色圖片載入狀態
    initCharacterImageLoading();
    // 初始化 Swiper 到當前選中的角色
    nextTick(() => {
      initSwiperToCurrentCharacter();
    });
  }
};

const closeCharacterModal = () => {
  if (process.client) {
    // 獲取原始保存的角色
    const savedCharacter = localStorage.getItem("selectedCharacter")
      ? JSON.parse(localStorage.getItem("selectedCharacter"))
      : { id: "doctor", styleId: "doctor1" };

    // 檢查臨時選擇的角色是否與當前角色不同
    const hasUnsavedChanges =
      tempSelectedCharacter.value &&
      (tempSelectedCharacter.value.id !== currentCharacter.value.id ||
        tempSelectedCharacter.value.styleId !== currentCharacter.value.styleId);

    if (hasUnsavedChanges) {
      showCharacterExitConfirm.value = true;
    } else {
      showCharacterSelection.value = false;
      isStyleExpanded.value = false;
      tempSelectedCharacter.value = null;
    }
  }
};

// 近期推出彈窗相關函數
const showComingSoonModal = () => {
  if (process.client) {
    showComingSoon.value = true;
  }
};

const closeComingSoonModal = () => {
  if (process.client) {
    showComingSoon.value = false;
  }
};

// 角色選擇離開確認彈窗相關函數
const confirmCharacterExit = () => {
  if (process.client) {
    showCharacterExitConfirm.value = false;
    showCharacterSelection.value = false;
    isStyleExpanded.value = false;
    tempSelectedCharacter.value = null;
  }
};

const cancelCharacterExit = () => {
  if (process.client) {
    showCharacterExitConfirm.value = false;
  }
};

const toggleStyleExpansion = () => {
  if (process.client) {
    isStyleExpanded.value = !isStyleExpanded.value;
  }
};

// Swiper 滑動事件處理
const onSlideChange = (swiper) => {
  const activeIndex = swiper.activeIndex;
  const character = availableCharacters.value[activeIndex];
  if (character) {
    // 更新臨時選擇狀態
    tempSelectedCharacter.value = { ...character };
  }
};

// 角色點擊事件處理
const onCharacterClick = (character) => {
  // 如果是鎖定的角色，顯示"近期推出"彈窗
  if (isCharacterLocked(character)) {
    showComingSoonModal();
    return;
  }

  const characterIndex = availableCharacters.value.findIndex(
    (c) => c.id === character.id
  );
  if (characterIndex !== -1 && characterSwiperRef.value) {
    // 滑動到選中的角色並置中
    characterSwiperRef.value.$el.swiper.slideTo(characterIndex);
    // 更新臨時選擇狀態
    tempSelectedCharacter.value = { ...character };
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
    console.log("選擇樣式:", style.id, "鎖定狀態:", style.locked);
    // 如果是鎖定的樣式，顯示"近期推出"彈窗
    if (style.locked) {
      showComingSoonModal();
      return;
    }

    // 更新臨時選擇狀態
    if (tempSelectedCharacter.value) {
      tempSelectedCharacter.value.styleId = style.id;
      tempSelectedCharacter.value.avatar = style.thumbnail;
      tempSelectedCharacter.value.fullImage = style.fullImage;
    }
  }
};

const confirmCharacterSelection = () => {
  if (process.client) {
    // 確認保存臨時選擇的角色
    if (tempSelectedCharacter.value) {
      currentCharacter.value = { ...tempSelectedCharacter.value };
    }

    // 更新角色圖片路徑
    characterImageSrc.value = currentCharacter.value.fullImage;

    // 保存到本地存儲
    localStorage.setItem(
      "selectedCharacter",
      JSON.stringify(currentCharacter.value)
    );

    // 關閉彈窗
    showCharacterSelection.value = false;
    isStyleExpanded.value = false;
    tempSelectedCharacter.value = null;

    // 可以添加成功提示或其他確認邏輯
    console.log(
      "角色選擇已確認:",
      currentCharacter.value.customName || currentCharacter.value.displayName
    );
    console.log("當前頭貼:", currentCharacter.value.avatar);
  }
};

// 角色圖片載入事件處理
const onCharacterImageLoad = (characterId) => {
  characterImageLoading.value.delete(characterId);
};

const onCharacterImageError = (characterId) => {
  characterImageLoading.value.delete(characterId);
  console.error(`角色圖片載入失敗: ${characterId}`);
};

// 初始化角色圖片載入狀態
const initCharacterImageLoading = () => {
  availableCharacters.value.forEach((character) => {
    characterImageLoading.value.add(character.id);
  });
};

// 初始化 Swiper 到當前選中的角色
const initSwiperToCurrentCharacter = () => {
  if (process.client && characterSwiperRef.value && currentCharacter.value) {
    const characterIndex = availableCharacters.value.findIndex(
      (c) => c.id === currentCharacter.value.id
    );
    if (characterIndex !== -1) {
      // 等待 Swiper 初始化完成後滑動到指定位置
      nextTick(() => {
        setTimeout(() => {
          if (characterSwiperRef.value && characterSwiperRef.value.$el) {
            characterSwiperRef.value.$el.swiper.slideTo(characterIndex, 0);
          }
        }, 100);
      });
    }
  }
};

// 角色名稱編輯相關函數
const showNameInputModal = () => {
  if (process.client) {
    characterNameInput.value =
      uiCharacter.value.customName || uiCharacter.value.displayName;
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
    // 重置為原始名稱，不儲存修改
    characterNameInput.value =
      uiCharacter.value.customName || uiCharacter.value.displayName;
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

    // 目標為畫面上正在預覽/編輯的角色（在角色彈窗中就是 tempSelectedCharacter）
    const targetId = uiCharacter.value.id;
    // 更新可用角色列表中的對應角色
    const characterIndex = availableCharacters.value.findIndex(
      (c) => c.id === targetId
    );
    if (characterIndex !== -1) {
      availableCharacters.value[characterIndex] = {
        ...availableCharacters.value[characterIndex],
        customName: name,
      };
    }

    // 若彈窗中正在編輯的就是 tempSelectedCharacter，也同步更新它（讓畫面即時反映）
    if (
      tempSelectedCharacter.value &&
      tempSelectedCharacter.value.id === targetId
    ) {
      tempSelectedCharacter.value.customName = name;
    }

    // 若此角色同時也是當前使用中的角色，順便同步到 currentCharacter 與 localStorage
    if (currentCharacter.value.id === targetId) {
      currentCharacter.value.customName = name;
      localStorage.setItem(
        "selectedCharacter",
        JSON.stringify(currentCharacter.value)
      );
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
  if (input instanceof Date) {
    // 使用本地時間避免時區問題
    const year = input.getFullYear();
    const month = String(input.getMonth() + 1).padStart(2, "0");
    const day = String(input.getDate()).padStart(2, "0");
    const result = `${year}-${month}-${day}`;
    console.log(`toDateKey (Date): ${input} → ${result}`);
    return result;
  }
  // input 可能是 "2025/8/20 下午 2:20:33" → 取前半段日期、轉成 YYYY-MM-DD
  const first = String(input).split(" ")[0]; // 2025/8/20
  const [y, m, d] = first.split("/");
  const pad = (n) => String(n).padStart(2, "0");
  const result = `${String(y).padStart(4, "0")}-${pad(m)}-${pad(d)}`;
  console.log(`toDateKey (String): ${input} → ${result}`);
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

// 本地指令：v-click-outside
const vClickOutside = {
  mounted(el, binding) {
    el.__clickOutside__ = (e) => {
      if (!(el === e.target || el.contains(e.target))) {
        typeof binding.value === "function" && binding.value(e);
      }
    };
    document.addEventListener("click", el.__clickOutside__);
  },
  unmounted(el) {
    document.removeEventListener("click", el.__clickOutside__);
    delete el.__clickOutside__;
  },
};
</script>
