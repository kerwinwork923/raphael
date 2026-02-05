<template>
  <transition name="fade">
    <div class="confirmModal" v-if="show" @click.self="handleClose">
      <div class="confirmModalBox">
        <!-- 白底整體卡片（內容 + 分隔線 + 按鈕） -->
        <div class="confirmModalCard">
          <div class="confirmModalContent">
            <p class="confirmModalText">{{ message }}</p>
          </div>

          <div class="confirmModalDivider"></div>

          <div class="confirmModalActions">
            <button class="btn-confirm" @click="handleConfirm">確定</button>
          </div>
        </div>

        <!-- 關閉按鈕 -->
        <div class="confirmModalClose" @click="handleClose">
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

<script setup lang="ts">
defineProps<{
  show: boolean;
  message: string;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

function handleClose() {
  emit("close");
}

function handleConfirm() {
  emit("confirm");
}
</script>

<style scoped lang="scss">
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

.confirmModal {
  position: fixed;
  inset: 0;
  background: rgba(177, 192, 216, 0.25);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.confirmModalBox {
  position: relative;
  width: 100%;
  max-width: 300px;
  border-radius: 20px;
  border: 3px solid var(--Primary-default, #1ba39b);
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0px 2px 20px rgba(27, 163, 155, 0.25);
  backdrop-filter: blur(25px);
  padding: 1.25rem;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
}

/* ✅ 讓白底是一整塊，不要上下分成兩塊 */
.confirmModalCard {
  background: #fff;
  border-radius: 20px;
  overflow: hidden; /* 讓分隔線和按鈕區被同一個圓角裁切 */
  text-align: center;
}

.confirmModalContent {
  /* ✅ 不再各自做白底/圓角，交給 confirmModalCard 統一 */
  background: transparent;
  border-radius: 0;
  padding: 2rem 1.5rem;
}

.confirmModalText {
  color: var(--Primary-300, #6d8ab6);
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: 0.5px;
}

.confirmModalDivider {
  height: 1px;
  width: 100%;
  background: #b1c0d8;
  margin: 0;
}

.confirmModalActions {
  background: transparent;
  border-radius: 0;
  overflow: visible;

  .btn-confirm {
    width: 100%;
    padding: 1rem;
    border: none;
    background: transparent;
    color: var(--Primary-default, #1ba39b);
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: 0.5px;

    &:hover {
      background: rgba(27, 163, 155, 0.1);
    }

    &:focus {
      outline: none;
    }
  }
}

.confirmModalClose {
  width: fit-content;
  margin: auto;
  margin-top: 1rem;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0px 2px 20px rgba(27, 163, 155, 0.25);
  backdrop-filter: blur(25px);
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    box-shadow: inset 0px 2px 6px rgba(27, 163, 155, 0.25);
  }

  svg {
    width: 24px;
    height: 24px;
  }
}

@media (max-width: 768px) {
  .confirmModalBox {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
}
</style>
