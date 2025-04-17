<template>
  <div>
    <NuxtRouteAnnouncer />
    <!-- <NuxtWelcome /> -->
    <NuxtPage :page-key="route.fullPath" />
  </div>
</template>

<script setup>
const route = useRoute()
</script>

<style lang="scss">
@import "@/assets/styles/main.scss";
</style>
