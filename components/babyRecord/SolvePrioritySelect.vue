<template>
  <div class="solvePriorityBox">
    <!-- 只顯示多個症狀 item，點擊切換 selected -->
    <div
      class="priorityItem"
      v-for="item in questions"
      :key="item.id"
      :class="{ active: item.selected }"
      @click="toggleSelect(item)"
    >
      <img :src="item.selected ? activeIcon : inactiveIcon" alt="" />
      <h3>{{ item.question }}</h3>
    </div>
  </div>
</template>

<script>
import { ref, computed, watchEffect } from "vue";
import activeIcon from "@/assets/imgs/check.svg";
import inactiveIcon from "@/assets/imgs/plus.svg";
import { useBabyStore } from "@/stores/useBabyStore";

export default {
  name: "SolvePrioritySelect",
  props: {
    symptoms: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["selection-changed"],
  setup(props, { emit }) {
    const babyStore = useBabyStore();
    const curChild = computed(() => babyStore.childRecords[babyStore.selectedChildID]);

    // 儲存題目(含 selected 狀態)
    const questions = ref([]);

    watchEffect(() => {
      if (curChild.value?.childTimesQues) {
        questions.value = curChild.value.childTimesQues.map((q) => ({
          ...q,
          selected: curChild.value.selectedPriority.has(q.id),
        }));
      }
    });

    const toggleSelect = (item) => {
      const selectedCount = questions.value.filter((q) => q.selected).length;
      if (!item.selected && selectedCount >= 10) {
        alert("已選擇10個最想解決的症狀了");
        return;
      }
      item.selected = !item.selected;

      // 同步到 store
      if (item.selected) {
        curChild.value.selectedPriority.add(item.id);
      } else {
        curChild.value.selectedPriority.delete(item.id);
      }
      emit("selection-changed", curChild.value.selectedPriority.size);
    };

    return {
      questions,
      toggleSelect,
      activeIcon,
      inactiveIcon,
    };
  },
};
</script>


<style lang="scss" scoped>
.solvePriorityBox {
  background-color: #fff;
  border-radius: 12px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  padding: 12px;
 
  overflow-y: auto;

  .priorityItem {
    display: flex;
    align-items: center;
    padding: 8px;
    border-radius: 8px;
  
    cursor: pointer;
    transition: all 0.2s;

    img {
      margin-right: 8px;
      width: 24px;
      height: 24px;
    }

    &.active {
      background-color: #74bc1f;
      color: #fff;
      border-color: #74bc1f;
    }
  }
}
</style>
