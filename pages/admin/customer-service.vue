<template>
  <div class="admin-wrap">
    <TitleMenu Text="客服管理" link="back" />
    <CustomerServiceAdmin />
  </div>
</template>

<script setup>
// 設定頁面標題
useHead({
  title: '客服管理 - Raphael'
})
</script>

<style lang="scss" scoped>
.admin-wrap {
  @include gradientBg();
  width: 100%;
  min-height: 100vh;
  padding: 1rem 0rem 7rem;
}
</style>
