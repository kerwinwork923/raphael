<template>
  <div>
    <NuxtRouteAnnouncer />
    <!-- <NuxtWelcome /> -->
    <NuxtPage :page-key="route.fullPath" />
  </div>
</template>

<script setup>
const route = useRoute()
// deploy-cache-bust: 2026-06-26
if (import.meta.client) window.__DEPLOY_VERSION__ = "2026-06-26"
</script>

<style lang="scss">
@import "@/assets/styles/main.scss";
</style>
