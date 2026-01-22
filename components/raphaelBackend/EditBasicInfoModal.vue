<template>
  <transition name="fade">
    <div class="editBasicInfoModal" v-if="show" @click.self="handleClose">
      <div class="editBasicInfoModalBox">
        <!-- 標題區域 -->
        <div class="editBasicInfoModalHeader">
          <div class="editBasicInfoModalIcon">
            <span>NP</span>
          </div>
          <div class="editBasicInfoModalTitleGroup">
            <h3>基本資料編輯</h3>
            <h4>info edit</h4>
          </div>
        </div>

        <!-- 表單區域 -->
        <div class="editBasicInfoModalForm">
          <div class="editBasicInfoModalField">
            <label>姓名</label>
            <input
              type="text"
              v-model="formData.name"
              placeholder="請輸入姓名"
            />
          </div>

          <div class="editBasicInfoModalField">
            <label>生日</label>
            <input
              type="text"
              v-model="formData.birthday"
              placeholder="請輸入生日"
            />
          </div>

          <div class="editBasicInfoModalField">
            <label>電話</label>
            <input
              type="text"
              v-model="formData.phone"
              placeholder="請輸入電話"
            />
          </div>
        </div>

        <!-- 按鈕區域 -->
        <div class="editBasicInfoModalActions">
          <button class="btn-close" @click="handleClose">關閉</button>
          <button class="btn-submit" @click="handleSubmit">提交</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  show: boolean;
  initialData?: {
    name?: string;
    birthday?: string;
    phone?: string;
  };
}>();

const emit = defineEmits<{
  close: [];
  submit: [data: { name: string; birthday: string; phone: string }];
}>();

const formData = ref({
  name: "",
  birthday: "",
  phone: "",
});

// 當 initialData 改變時，更新表單資料
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = {
        name: newData.name || "",
        birthday: newData.birthday || "",
        phone: newData.phone || "",
      };
    }
  },
  { immediate: true, deep: true }
);

// 當 show 變為 true 時，重置表單
watch(
  () => props.show,
  (isShow) => {
    if (isShow && props.initialData) {
      formData.value = {
        name: props.initialData.name || "",
        birthday: props.initialData.birthday || "",
        phone: props.initialData.phone || "",
      };
    }
  }
);

function handleClose() {
  emit("close");
}

function handleSubmit() {
  emit("submit", { ...formData.value });
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

.editBasicInfoModal {
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

.editBasicInfoModalBox {
  position: relative;
  width: 100%;
  max-width: 500px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
  padding: 2rem;
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

.editBasicInfoModalHeader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.editBasicInfoModalIcon {
  width: 60px;
  height: 60px;
  background: var(--Primary-default, #1ba39b);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    color: #fff;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
}

.editBasicInfoModalTitleGroup {
  text-align: center;

  h3 {
    color: #2d3047;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 0.5px;
    margin: 0 0 0.25rem 0;
  }

  h4 {
    color: #6d8ab6;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.5px;
    margin: 0;
    text-transform: lowercase;
  }
}

.editBasicInfoModalForm {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.editBasicInfoModalField {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    color: #2d3047;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #e5e9f2;
    border-radius: 8px;
    font-size: 16px;
    color: #2d3047;
    background: #fff;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--Primary-default, #1ba39b);
      box-shadow: 0 0 0 3px rgba(27, 163, 155, 0.1);
    }

    &::placeholder {
      color: #b1c0d8;
    }
  }
}

.editBasicInfoModalActions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;

  button {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: 0.5px;

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(27, 163, 155, 0.2);
    }
  }

  .btn-close {
    background: #b1c0d8;
    color: #fff;

    &:hover {
      background: #9aa8c0;
    }
  }

  .btn-submit {
    background: var(--Primary-default, #1ba39b);
    color: #fff;

    &:hover {
      background: #15968f;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(27, 163, 155, 0.3);
    }
  }
}

@media (max-width: 768px) {
  .editBasicInfoModalBox {
    padding: 1.5rem;
    margin: 1rem;
  }

  .editBasicInfoModalActions {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
}
</style>
