<template>
    <div class="sleepInputGroup">
      <!-- 顯示選擇次數或打開彈窗的按鈕 -->
      <button 
        @click="showModal = true" 
        class="number-picker-btn"
        :class="{'number-picked': selectedInterruptions !== ''}" 
      >
        <img src="../assets/imgs/time.svg" alt="" />
        {{ selectedInterruptions !== "" ? selectedInterruptions : placeholder }}
      </button>
  
      <!-- 彈窗模態框 -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="select-group">
            <div class="modalTitle">{{ placeholder }}</div>
            <input
              type="number"
              v-model.number="selectedInterruptions"
              :min="minValue"
              :max="maxValue"
              class="number-input"
            />
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
          </div>
          <div class="modal-actions">
            <button @click="confirmSelection">確認</button>
            <button @click="closeModal">取消</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from "vue";
  
  export default {
    props: {
      placeholder: {
        type: String,
        default: "請選擇睡眠中斷次數", // 預設佔位文字
      },
      minValue: {
        type: Number,
        default: 0, // 預設最小值
      },
      maxValue: {
        type: Number,
        default: 20, // 預設最大值
      },
    },
    setup(props) {
      const showModal = ref(false);
      const selectedInterruptions = ref(""); // 用戶選擇的次數
      const errorMessage = ref(""); // 用來顯示錯誤訊息
  
      const confirmSelection = () => {
        if (selectedInterruptions.value < props.minValue) {
          selectedInterruptions.value = props.minValue; // 如果小於最小值，設為最小值
        } else if (selectedInterruptions.value > props.maxValue) {
          selectedInterruptions.value = props.maxValue; // 如果大於最大值，設為最大值
        }
  
        if (selectedInterruptions.value < props.minValue || selectedInterruptions.value > props.maxValue) {
          errorMessage.value = `次數必須在 ${props.minValue} 到 ${props.maxValue} 之間`;
        } else {
          errorMessage.value = ""; // 清空錯誤訊息
          showModal.value = false;
        }
      };
  
      const closeModal = () => {
        showModal.value = false;
        errorMessage.value = ""; // 當關閉彈窗時，清空錯誤訊息
      };
  
      return {
        showModal,
        selectedInterruptions,
        confirmSelection,
        closeModal,
        errorMessage,
        placeholder: props.placeholder,
        minValue: props.minValue,
        maxValue: props.maxValue,
      };
    },
  };
  </script>
  
  <style scoped>
  .number-picker-btn {
    background-color: transparent !important;
    color: #ccc !important;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0;
    gap: 4px;
    width: 100%;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
  
  .number-picker-btn.number-picked { /* 當選擇次數後改變顏色 */
    background-color: #4a90e2;
    color: #666 !important; 
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99;
  }
  
  .modal-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    width: 80%;
    max-width: 400px;
    transform: translateY(-50%);
  }
  
  .modalTitle {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  
  .number-input {
    width: 50%;
    padding: 8px;
    font-size: 16px;
    border: 2px solid #ccc;
    border-radius: 5px;
  }
  
  .error {
    color: red;
    margin-top: 10px;
  }
  
  .modal-actions {
    display: flex;
    justify-content: center;
    gap: 10%;
    margin-top: 20px;
  }
  
  .modal-actions button {
    padding: .5rem 1rem;
    width: 40%;
    cursor: pointer;
    white-space: nowrap;
  }
  
  button:first-of-type {
    background-color: #4a90e2;
    color: #fff;
    border-radius: 5px;
  }
  
  button:last-of-type {
    background-color: #f5f5f5;
    color: #333;
    border-radius: 5px;
  }
  </style>
  