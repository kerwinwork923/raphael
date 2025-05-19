<template>
  <div class="progress2-container">
    <div class="progress">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 157 3" fill="none">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M0.785 0C0.351457 0 0 0.351456 0 0.785V1V2V2.215C0 2.64854 0.351457 3 0.785 3C1.21854 3 1.57 2.64854 1.57 2.215V2H76.9285V2.215C76.9285 2.64854 77.2799 3 77.7135 3C78.147 3 78.4985 2.64854 78.4985 2.215V2H155.428V2.215C155.428 2.64854 155.78 3 156.213 3C156.647 3 156.998 2.64854 156.998 2.215V2H157V1H156.998V0.785C156.998 0.351456 156.647 0 156.213 0C155.78 0 155.428 0.351456 155.428 0.785V1H78.4985V0.785C78.4985 0.351456 78.147 0 77.7135 0C77.2799 0 76.9285 0.351456 76.9285 0.785V1H1.57V0.785C1.57 0.351456 1.21854 0 0.785 0Z"
          fill="#CCCCCC"
        />
      </svg>
      <div class="emoji" :class="{ rightEdge: dotPosition > 95 }" :style="{ left: dotPosition + '%' }">
    <img :src="emoji" alt="表情" />
  </div>
    </div>
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
    colorProp: {
      type: String,
      default: "#ec4f4f",
    },
  },
  computed: {
    dotPosition() {
      return Math.min(Math.max((this.score / 100) * 100, 0), 100);
    },
    emoji() {
      return this.getEmojiByScore(this.score);
    },
  },
  methods: {
    getEmojiByScore(score) {
      if (score <= 25) {
        return new URL("@/assets/imgs/smile.png", import.meta.url).href;
      } else if (score <= 45) {
        return new URL("@/assets/imgs/happy.png", import.meta.url).href;
      } else if (score <= 71) {
        return new URL("@/assets/imgs/sad.png", import.meta.url).href;
      } else {
        return new URL("@/assets/imgs/unSmile.png", import.meta.url).href;
      }
    },
  },
};
</script>

<style lang="scss">
.progress2-container {
  position: relative;
  display: grid;
  gap: 4px;
  margin: 0.5rem 0;
  .progress {
    position: relative;
    display: grid;
    align-items: center;
    margin: 0 1rem;
  }
  .progressText {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;

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

.emoji {
  position: absolute;
  transform: translateX(-50%);
 
  img {
    width: 24px;
    height: 24px;
  }

  &.rightEdge {
    left: auto !important;
    right: 0;
    transform: translateX(0);
  }
}
</style>
