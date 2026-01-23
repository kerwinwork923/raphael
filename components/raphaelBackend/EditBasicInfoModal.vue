<template>
  <transition name="fade">
    <div class="editBasicInfoModal" v-if="show" @click.self="handleClose">
      <div class="editBasicInfoModalBox">
        <!-- 標題區域 -->
        <div class="editBasicInfoModalHeader">
          <img src="/assets/imgs/backend/Subtract.svg" alt="" />
          <div class="editBasicInfoModalTitleGroup">
            <h3>基本資料編輯</h3>
            <h4>info edit</h4>
          </div>
        </div>

        <div class="editBasicInfoHR"></div>
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


.editBasicInfoModal {
  position: fixed;
  inset: 0;

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

  border-radius: var(--Radius-r-20, 20px);
border: 3px solid var(--Primary-default, #1BA39B);
background: var(--neutral-white-opacity-30, rgba(255, 255, 255, 0.30));
box-shadow: 0 2px 20px 0 var(--primary-400-opacity-25, rgba(27, 163, 155, 0.25));
backdrop-filter: blur(25px);

  @keyframes slideUp {
    from {
      transform: translateY(20px);
  
    }
    to {
      transform: translateY(0);
      
    }
  }
}

.editBasicInfoModalHeader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .5rem;
  margin-bottom: .5rem;
  

  img {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 9.8px;
      border: 1px solid var(--Primary-default, #1ba39b);
      padding: 2px 4px;
    }
}

.editBasicInfoHR{
    width: 100%;
    height: 1px;
    background: var(--Primary-200, #B1C0D8);
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
    color: var(--Primary-default, #1BA39B);
font-size: var(--Text-font-size-18, 18px);
font-style: normal;
font-weight: 400;
letter-spacing: 0.09px;
  }
}

.editBasicInfoModalForm {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  margin-top: .65rem;
}

.editBasicInfoModalField {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    color: var(--Primary-600, #2D3047);

font-size: var(--Text-font-size-24, 24px);
font-style: normal;
font-weight: 400;

letter-spacing: 3.6px;
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
    overflow: hidden;
color: var(--Primary-default, #1BA39B);
text-overflow: ellipsis;

font-size: var(--Text-font-size-18, 18px);
font-style: normal;
font-weight: 400;
line-height: var(--lineHeight-line-height-18, 29.1px); /* 161.667% */
letter-spacing: 2.7px;
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
  justify-content: center;

  button {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: 0.5px;

  }

  .btn-close {
    background-color: transparent;
 

  }

  .btn-submit {
    border-radius: 6px;
    background: var(--Primary-default, #1BA39B);
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
