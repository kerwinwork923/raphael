<template>
  <div class="symptomChoose">
    <div class="symptomChooseBox">
      <div
        class="symptomChoose"
        v-for="symptom in sortedSymptoms"
        :key="symptom.id"
        :class="{
          symptomChooseActive: symptom.active,
        }"
        @click="toggleActive(symptom.id)"
      >
        <img :src="symptom.active ? activeImage : inactiveImage" alt="" />
        <h3>{{ symptom.question }}</h3>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import activeImage from "@/assets/imgs/check.svg";
import inactiveImage from "@/assets/imgs/plus.svg";
import { useWeeklyRecord } from "~/stores/weeklyQA.js";

export default {
  setup() {
    const store = useWeeklyRecord();

    const sortedSymptoms = computed(() => {
      return store.weeklyQA
        .filter((q) => q.times >= 0 )
        .sort((a, b) => b.times - a.times);
    });

    const toggleActive = (symptomId) => {
      const selectedCount = store.weeklyQA.filter((q) => q.active).length;

      if (
        selectedCount >= 10 &&
        !store.weeklyQA.find((q) => q.id === symptomId).active
      ) {
        alert("已選擇10個最想解決的症狀了");
      } else {
        store.toggleActive(symptomId);
      }
    };

    return {
      store,
      activeImage,
      inactiveImage,
      toggleActive,
      sortedSymptoms,
    };
  },
};
</script>

<style lang="scss">
.symptomChoose {
  background-color: #fff;
  border-radius: 12px;

  .symptomChooseBox {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 12px;

    .symptomChoose {
      display: flex;
      gap: 2px;
      align-items: center;
      padding: 6px 12px;
      background-color: #eee;
      color: #ccc;
      border-radius: 8px;
      cursor: pointer;

      &.symptomChooseActive {
        background-color: #74bc1f;
        color: #fff;
      }
    }
  }
}
</style>
