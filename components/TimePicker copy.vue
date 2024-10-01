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
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

export default {
  props: {
    placeholder: {
      type: String,
      default: "請選擇時間",
    },
  },
  setup(props) {
    const showDropdown = ref(false);
    const selectedTime = ref("");
    const timePicker = ref(null);

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
    };

    const selectTime = (time) => {
      selectedTime.value = time;
      showDropdown.value = false;
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
    for (let i = 0; i < 4 * 4; i++) {
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
      timePicker,
    };
  },
};
</script>

<style scoped>
.time-picker {
  position: relative;
  width: 100%;
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
  color: #1e1e1e !important;
  font-size: 1.075rem !important;


  letter-spacing: 1.25px;
  font-weight: bold;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border: 1px solid #666;
  border-radius: 8px;
  z-index: 10;
  width: 100%;
  max-height: 200px;
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
