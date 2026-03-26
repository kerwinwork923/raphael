<template>
  <transition name="fade">
    <div v-if="show" class="dialog-mask" @click.self="emit('close')">
      <div class="dialog-shell">
        <div class="dialog-card">
          <p class="dialog-message">{{ message }}</p>
          <div class="dialog-divider"></div>
          <button class="dialog-confirm" @click="emit('confirm')">確定</button>
        </div>

        <button class="dialog-close" @click="emit('close')" aria-label="關閉">
          <img src="/assets/imgs/backend/close.svg" alt="關閉" />
        </button>


      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  message: string;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();
</script>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(177, 192, 216, 0.2);
  backdrop-filter: blur(3px);
  padding: 1rem;
}

.dialog-shell {
  position: relative;
  width: min(280px, 100%);
  padding: 10px;
  border: 3px solid #1ba39b;
  border-radius: 18px;
  background: rgba(245, 247, 250, 0.85);
  box-shadow: 0 2px 20px rgba(27, 163, 155, 0.2);
}

.dialog-card {
  border-radius: 16px;
  background: #f7f9fb;
  box-shadow: 0 2px 20px rgba(177, 192, 216, 0.25);
  overflow: hidden;
}

.dialog-message {
  margin: 0;
  padding: 34px 16px 24px;
  text-align: center;
  color: #6d8ab6;
  font-size: 30px;
  line-height: 1.4;
  letter-spacing: 0.09px;
}

.dialog-divider {
  height: 1px;
  margin: 0 22px;
  background: #b1c0d8;
}

.dialog-confirm {
  width: 100%;
  border: none;
  background: transparent;
  color: #1ba39b;
  font-size: 35px;
  font-weight: 400;
  padding: 20px 0 22px;
  cursor: pointer;
}

.dialog-close {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  margin: 18px auto 4px;
  border: none;
  border-radius: 50%;
  background: #f7f9fb;
  box-shadow: 0 2px 20px rgba(177, 192, 216, 0.25);
  cursor: pointer;

  img {
    width: 22px;
    height: 22px;
  }
}

/* 線段以彈窗本體為相對參考，不依賴設計稿原點座標 */




@media (max-width: 960px) {
  .dialog-shell {
    width: min(240px, 100%);
  }

  .dialog-message {
    font-size: 22px;
  }

  .dialog-confirm {
    font-size: 28px;
  }


}
</style>
