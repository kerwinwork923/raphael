<template>
    <div class="progress-container">
      <!-- 漸變條形進度條 -->
      <div class="progress-bar"></div>
      <!-- 使用 props 傳遞的 emojiSrc 來顯示表情符號 -->
      <img class="emoji-dot" :src="emojiSrc" :style="{ left: dotPosition + '%' }" alt="emoji" />
      <div class="progressText">
        <div class="progressSubText">
          <span>0%</span>
          <span>輕度</span>
        </div>
        <div class="progressSubText">
          <span>50%</span>
          <span>中度</span>
        </div>
        <div class="progressSubText">
          <span>100%</span>
          <span>重度</span>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      score: {
        type: Number,
        required: true,
      },
      emojiSrc: {
        type: String,  // 新增的 props，接收來自父組件的表情符號路徑
        required: true,
      },
    },
    computed: {
      dotPosition() {
        return (this.score / 100) * 100; // 計算表情符號的位置
      },
    },
  };
  </script>
  
  <style lang="scss">
  .progress-container {
    position: relative;
    width: 100%;
    margin: 10px 0;
  
    .progress-bar {
      width: 100%;
      height: 4px;
      border-radius: 50px;
      background: linear-gradient(90deg, #74BC1F 0%, #1FBCB3 50%, #65558F 75%, #EC4F4F 100%);
    }
  
    .emoji-dot {
      position: absolute;
      top: -7px;
      width: 18px;
      height: 18px;
      transform: translateX(-50%);
    }
  
    .progressText {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
  
      .progressSubText {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 2px;
        color: #ccc;
      }
    }
  }
  </style>
  