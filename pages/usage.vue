<template>
    <TitleMenu Text="使用紀錄" link="/user" />
    <TimeRing :totalTime="90" />
  
    <div class="usageWrap"></div>
  </template>
  
  <script>
  import { useRouter } from "vue-router";
  import TitleMenu from "@/components/TitleMenu.vue";
  import TimeRing from "@/components/TimeRing.vue";
  
  export default {
    components: {
      TitleMenu,
      TimeRing,
    },
    setup() {
      const router = useRouter();
      return {};
    },
  };
  </script>
  
  <style lang="scss">
  .usageWrap {
    background-color: rgba(246, 246, 246, 1);
    min-height: 100vh;
    width: 100%;
    padding-bottom: 7rem;
  }
  </style>
  