<template>
  <div class="raphaelAlert">
    <div class="content">
      <slot>{{ defaultContent }}</slot>
      <!-- 使用插槽顯示內容 -->
    </div>
    <div class="btnGroup">
      <!-- 關閉按鈕始終顯示 -->
      <button class="closeBtn" @click="onClose">關閉</button>
      <button v-if="showRedirectButton" class="redirectBtn" @click="onRedirect">
        跳轉
      </button>
    </div>
  </div>
</template>

<style scoped>
.raphaelAlert {
  background: #fbfbfb;
  color: var(--shade-black, #1e1e1e);
  border-radius: 14px;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  width: 270px;
  margin: 0 auto;
  margin-top: 1rem;
}
.raphaelAlert .content {
  text-align: center;
  color: #1e1e1e;
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0.5px;
  padding: 1rem;
  min-height: 80px;
  border-bottom: #aaa 1px solid;
  line-height: 1.2;
}
.raphaelAlert .btnGroup {
  display: flex;
  justify-content: center;
}
.raphaelAlert .btnGroup button {
  border: none;
  width: 100%;
  color: #007aff;
  padding: 6px;
  cursor: pointer;
}
.raphaelAlert .btnGroup .redirectBtn {
  border-left: 1px solid #aaa;
}
</style>

<script>
export default {
  name: "RaphaelAlert",
  props: {
    defaultContent: {
      type: String,
      default:
        "您的回答顯示沒有健康問題，是否確認送出問卷？如果不確定，可以返回修改答案。",
    },
    showRedirectButton: {
      // 將 showButtons 改為 showRedirectButton
      type: Boolean,
      default: false, // 默認為不顯示跳轉按鈕
    },
    redirectTarget: {
      // 接受一個自定義的跳轉行為
      type: Function,
      default: () => {}, // 默認為空函數
    },
  },
  methods: {
    onClose() {
      this.$emit("close"); // 向父組件發送關閉事件
    },
    onRedirect() {
      this.redirectTarget(); // 調用自定義的跳轉行為
    },
  },
};
</script>
