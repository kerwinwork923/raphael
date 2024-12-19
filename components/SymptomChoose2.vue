<template>
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
</template>

<script>
import { computed } from "vue";
import activeImage from "@/assets/imgs/check.svg";
import inactiveImage from "@/assets/imgs/plus.svg";
import { useWeeklyRecord } from "~/stores/weeklyQA2.js";

export default {
  setup() {
    const store = useWeeklyRecord();

    // 計算已排序的症狀
    const sortedSymptoms = computed(() => {
      if (!store.weeklyQA.length || !store.sortedByScore.length) {
        return []; // 如果数据尚未加载，返回空数组，避免模板出错
      }
      return store.weeklyQA
        .filter((q) => store.sortedByScore.some((s) => s.id === q.id))
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

    // 確保 sortedSymptoms 有返回到 template 中
    return {
      store,
      activeImage,
      inactiveImage,
      toggleActive,
      sortedSymptoms, // 確保這行存在
    };
  },
};
</script>

<style lang="scss" scoped>
.symptomChooseBox {
  background-color: #fff;
  border-radius: 12px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(auto-fit, minmax(min-content,36px));
  padding: 12px;
  height: calc(100vh - 400px);
  overflow-y: auto;
  gap: 0.75rem;
  @include scrollbarStyle();

  .symptomChoose {
    @include chooseStyle(transparent,$raphael-black,$raphael-green-400);
  }
}
</style>
