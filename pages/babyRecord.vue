<template>
   <div class="babyRecord">
      <TitleMenu Text="健康紀錄" link="/user" />
      
   </div>
 
</template>

<script>
import TitleMenu from "~/components/TitleMenu.vue";
import { useCommon } from "@/stores/common";
export default {
  setup() {
    const store = useWeeklyRecord();
    const common = useCommon();

    const h1Text = computed(() => {
      switch (store.nowState) {
        case "score":
        case "times":
        case "choose":
          return "寶貝紀錄";
        case "result":
          return "結果分析";
        default:
          return "健康紀錄";
      }
    });
    return { h1Text };
  },
};
</script>

<style lang="scss">
.babyRecord{
  background-color: $raphael-gray-100;
  min-height: 100vh;
  padding: 0 1rem;
}
</style>