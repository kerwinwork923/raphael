<template>
    <div>
      <!-- 顯示選擇的時間或打開彈窗的按鈕 -->
      <button 
        @click="showModal = true" 
        class="time-picker-btn"
        :class="{'time-picked': formattedTime}" 
      >
        <img src="../assets/imgs/time.svg" alt="" />
        {{ formattedTime || label }}
      </button>
  
      <!-- 模態窗 -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h3>{{ label }}</h3>
          <div class="select-group">
            <!-- 小時選擇 -->
            <select v-model="selectedHour">
              <option disabled value="">小時</option>
              <option v-for="hour in hours" :key="hour" :value="hour">
                {{ hour }}
              </option>
            </select>
            <span>:</span>
            <!-- 分鐘選擇 -->
            <select v-model="selectedMinute">
              <option disabled value="">分鐘</option>
              <option v-for="minute in minutes" :key="minute" :value="minute">
                {{ minute }}
              </option>
            </select>
          </div>
          <div class="modal-actions">
            <button @click="confirmTime">確認</button>
            <button @click="closeModal">取消</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      value: {
        type: String,
        default: "",
      },
      label: {
        type: String,
        default: "選擇時間",
      },
    },
    data() {
      return {
        showModal: false,
        selectedHour: "",
        selectedMinute: "",
        hours: Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")),
        minutes: Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")),
      };
    },
    computed: {
      formattedTime() {
        if (this.selectedHour && this.selectedMinute) {
          return `${this.selectedHour}:${this.selectedMinute}`;
        }
        return this.value;
      },
      isTimePicked() {
        return !!this.formattedTime; // 判斷是否已選擇時間
      },
    },
    watch: {
      value(newValue) {
        if (newValue) {
          const [hour, minute] = newValue.split(":");
          this.selectedHour = hour;
          this.selectedMinute = minute;
        }
      },
    },
    methods: {
      confirmTime() {
        if (this.selectedHour && this.selectedMinute) {
          const time = `${this.selectedHour}:${this.selectedMinute}`;
          this.$emit("input", time);
          this.closeModal();
        }
      },
      closeModal() {
        this.showModal = false;
      },
    },
  };
  </script>
  
  <style scoped>
  .time-picker-btn {
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
  
  .time-picker-btn.time-picked { 

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
    width: 60%;
    max-width: 400px;
  }
  
  .select-group {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    margin-top: 20px;
  }
  
  select {
    padding: 8px;
    font-size: 16px;
    border: 2px solid #ccc;
    border-radius: 5px;
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
  