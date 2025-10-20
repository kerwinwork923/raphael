<template>
  <div class="raphaelCover"></div>
  <div class="raphaelAlert">
    <div class="content">
      <slot>{{ defaultContent }}</slot>
    </div>
    <div class="btnGroup">
      <button class="closeBtn" @click="handleClose">關閉</button>
      <button v-if="showRedirectButton" class="redirectBtn" @click="handleRedirect">
        跳轉
      </button>
      <button v-if="showClickButton" class="closeBtn" @click="$emit('click')">
        {{ clickButtonText }}
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent, toRefs } from "vue";

export default defineComponent({
  name: "RaphaelAlert",
  props: {
    defaultContent: {
      type: String,
      default:
        "您的回答顯示沒有健康問題，是否確認送出問卷？如果不確定，可以返回修改答案。",
    },
    showRedirectButton: {
      type: Boolean,
      default: false, // 默認為不顯示跳轉按鈕
    },
    redirectTarget: {
      type: Function,
      default: () => {}, // 默認為空函數
    },
    showClickButton: {
      type: Boolean,
      default: false,
    },
    clickButtonText: {
      type: String,
      default: "確定",
    },
  },
  emits: ["close", "click"],
  setup(props, { emit }) {
    const { defaultContent, showRedirectButton, redirectTarget, showClickButton, clickButtonText } = toRefs(props);

    const handleClose = () => {
      emit("close"); // 通知父組件關閉
    };

    const handleRedirect = () => {
      redirectTarget.value(); // 調用自定義跳轉行為
    };

    return {
      defaultContent,
      showRedirectButton,
      showClickButton,
      clickButtonText,
      handleClose,
      handleRedirect,
    };
  },
});
</script>

<style scoped>
.raphaelCover {
  background: rgba(217, 217, 217, 0.5);
  backdrop-filter: blur(2.5px);
  width: 110%;
  height: 100%;
  left: -5%;
  top:0%;
  position: fixed;
  z-index: 12000;
 
}
.raphaelAlert {
  background: #fbfbfb;
  color: var(--shade-black, #1e1e1e);
  border-radius: 14px;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  width: 270px;
  margin: 0 auto;
  margin-top: 1rem;
  position: fixed;
  min-height: 120px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -60%);
  z-index: 13300;
  transition: 0.35s ease;
}
.raphaelAlert .content {
  text-align: center;
  color: #1e1e1e;
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0.5px;
  padding: 1rem;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -75%);
  width: 100%;
  font-size: 1rem;

  line-height: 1.2;
  display: flex;
  justify-content: center;
  align-items: center;
}
.raphaelAlert .btnGroup {
  display: flex;
  justify-content: center;
  border-top: #aaa 1px solid;
  position: absolute;
  bottom: 0;
  width: 100%;
}
.raphaelAlert .btnGroup button {
  border: none;
  width: 100%;
  color: #74bc1f;
  padding: 6px;
  cursor: pointer;
  font-size: 1rem;
}
.raphaelAlert .btnGroup .redirectBtn,
.raphaelAlert .btnGroup .closeBtn {
  border-left: 1px solid #aaa;
}
</style>
