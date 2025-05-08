<template>
  <transition name="fade">
    <div class="loginPageAlert" v-if="show">
      <div class="loginPageAlertBox">
        <h4>{{ message }}</h4>
        <div class="loginPageAlertClose" @click="$emit('close')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="#B1C0D8"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  show: Boolean,
  message: {
    type: String,
    default: "帳號或密碼錯誤喔~",
  },
});
defineEmits(["close"]);
</script>

<style scoped>
/* 淡入淡出動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.loginPageAlert {
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  background: rgba(177, 192, 216, 0.25);
  z-index: 100;
}

.loginPageAlertBox {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 300px;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  border: 3px solid #1ba39b;
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0px 2px 20px rgba(27, 163, 155, 0.25);
  backdrop-filter: blur(25px);
  padding: 1.25rem;

  h4 {
    padding: 2rem;
    background-color: #fff;
    color: #6d8ab6;
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 0.5px;
    border-radius: 20px;
    text-align: center;
  }
}


.loginPageAlertClose {
  width: fit-content;
  margin: auto;
  margin-top: 1rem;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0px 2px 20px rgba(27, 163, 155, 0.25);
  -webkit-backdrop-filter: blur(25px);
  backdrop-filter: blur(25px);
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.2s ease;
  &:hover {
    box-shadow: inset 0px 2px 6px rgba(27, 163, 155, 0.25);
  }

  svg {
    width: 24px;
    height: 24px;
  }
}
</style>
