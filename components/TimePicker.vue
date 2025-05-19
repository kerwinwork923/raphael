<template>
  <div class="time-picker" ref="timePicker">
    <div
      class="time-display"
      @click="toggleDropdown"
      :class="{ 'time-picked': selectedTime !== '' }"
    >
      <img src="../assets/imgs/time.svg" alt="Time Icon" />
      <span :class="{ 'picked-text': selectedTime !== '' }">{{
        formattedTime
      }}</span>
    </div>
    <div class="dropdown" v-if="showDropdown">
      <div
        v-for="time in availableTimes"
        :key="time"
        class="time-option"
        @click="selectTime(time)"
      >
        {{ time }}
      </div>
    </div>
  </div>
</template>

<script>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  defineEmits,
} from "vue";
import { useSleepRecordStore } from "../stores/sleepRecord";

export default {
  props: {
    modelValue: {
      // 使用 v-model 時需要的 props
      type: String,
      default: "",
    },
    currentTimeMode: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: "請選擇時間",
    },
  },
  setup(props, { emit }) {
    const sleepStore = useSleepRecordStore();
    const showDropdown = ref(false);
    const selectedTime = ref(props.modelValue);
    const timePicker = ref(null); // 定義 timePicker

    /* 父層 v-model 改變時同步到內部 */
    watch(
      () => props.modelValue,
      (v) => {
        if (v !== selectedTime.value) selectedTime.value = v;
      }
    );
    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
    };

    const selectTime = (time) => {
      selectedTime.value = time;
      emit("update:modelValue", time);
      // 根據傳來的 currentTimeMode 更新對應的 Pinia store 值
      if (props.currentTimeMode === "layTime") {
        sleepStore.layTimeToSleep = time; // 更新 layTimeToSleep
      } else if (props.currentTimeMode === "sleepTime") {
        sleepStore.sleepTime = time;
      } else if (props.currentTimeMode === "sleepAgainTime") {
        sleepStore.SleepAgainTime = time; // 更新 SleepAgainTime
      }
      showDropdown.value = false; // 關閉下拉選單
    };

    const handleClickOutside = (event) => {
      if (timePicker.value && !timePicker.value.contains(event.target)) {
        showDropdown.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener("click", handleClickOutside);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", handleClickOutside);
    });

    const availableTimes = [];
    for (let i = 0; i < 4 * 8; i++) {
      const hours = String(Math.floor(i / 4)).padStart(2, "0");
      const minutes = String((i % 4) * 15).padStart(2, "0");
      availableTimes.push(`${hours}:${minutes}`);
    }

    const formattedTime = computed(() => {
      return selectedTime.value || props.placeholder;
    });

    return {
      showDropdown,
      toggleDropdown,
      selectTime,
      availableTimes,
      formattedTime,
      selectedTime,
      timePicker, // 確保返回 timePicker
    };
  },
};
</script>

<style scoped lang="scss">
.time-picker {
  position: relative;
  width: 100%;
  border-bottom: 1px solid #eee;
}

.time-display {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 6px;
  padding-top: 1.25rem;
  padding-bottom: 0.5rem;
  transition: background-color 0.3s;
}

.time-display span {
  color: #ccc;
}

.picked-text {
  color: $raphael-green-400 !important;
  letter-spacing: 1.25px;
  font-weight: bold;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(6px);
  border-radius: 8px;
  color: $raphael-gray-500;
  font-size: 1.125rem;
  z-index: 10;
  width: 100%;
  max-height: 200px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  overflow-y: auto;
}

.time-option {
  padding: 10px;
  cursor: pointer;
}

.time-option:hover {
  background-color: #f0f0f0;
}
</style>
