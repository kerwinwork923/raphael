<template>
  <transition name="fade">
    <div class="deleteMemberModal" v-if="show" @click.self="handleClose">
      <div class="deleteMemberModalBox">
        <!-- 內容區域 -->
        <div class="deleteMemberModalContent">
          <p class="deleteMemberModalText">確定要刪除此會員嗎~?</p>
        </div>

        <!-- 分隔線 -->
        <div class="deleteMemberModalDivider"></div>

        <!-- 按鈕區域 -->
        <div class="deleteMemberModalActions">
          <button class="btn-cancel" @click="handleClose">取消</button>
          <button class="btn-confirm" @click="handleConfirm">確定</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean;
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
// 淡入淡出動畫
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

.deleteMemberModal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.deleteMemberModalBox {
  position: relative;
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 20px;
  border: 2px solid var(--Primary-default, #1ba39b);
  box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
  padding: 0;
  animation: slideUp 0.3s ease;
  overflow: hidden;

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

.deleteMemberModalContent {
  padding: 2rem;
  text-align: center;
}

.deleteMemberModalText {
  color: var(--Primary-300, #6d8ab6);

  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 25.888px; /* 161.8% */
  letter-spacing: 0.5px;
}

.deleteMemberModalDivider {
  height: 1px;
  width: 100%;
  background: #e5e9f2;
  margin: 0;
}

.deleteMemberModalActions {
  display: flex;
  gap: 0;
  border-top: none;

  button {
    flex: 1;
    padding: 1rem;
    border: none;
    background: transparent;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: 0.5px;

    &:focus {
      outline: none;
    }

    &:first-child {
      border-right: 1px solid #e5e9f2;
      border-radius: 0 0 0 20px;
    }

    &:last-child {
      border-radius: 0 0 20px 0;
    }
  }

  .btn-cancel {
    color: var(--shade-gray-300, #ccc);
    text-align: center;

    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 100%; /* 16px */
    letter-spacing: 0.5px;

    &:hover {
      background: #f5f7fa;
    }
  }

  .btn-confirm {
    color: var(--Primary-default, #1ba39b);

    &:hover {
      background: rgba(27, 163, 155, 0.1);
    }
  }
}

@media (max-width: 768px) {
  .deleteMemberModalBox {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }

  .deleteMemberModalContent {
    padding: 1.5rem;
  }

  .deleteMemberModalText {
    font-size: 16px;
  }
}
</style>
