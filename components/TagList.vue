<template>
  <div class="tagList">
    <!-- <router-link to="#" class="listItem" >總覽</router-link> -->
    <router-link to="/weekly" class="listItem" active-class="listActive"
      >自律神經</router-link
    >
    <router-link to="/userRecord" class="listItem" active-class="listActive"
      >生活紀錄</router-link
    >
    <router-link to="/weekly2" class="listItem" active-class="listActive"
      >寶貝紀錄</router-link
    >
    <!-- <router-link to="#" class="listItem" >寶貝紀錄</router-link> -->
  </div>
</template>

<style lang="scss">
.tagList {
  display: grid;
  grid-auto-flow: column;
  gap: 4px;

  a {
    text-decoration: none;
  }
  .listItem {
    @include tabStyle();
  }
  .listActive {
    color: $raphael-green-400;
    border-bottom: 1px solid $raphael-green-400;
    transition: all .3s ease;
    &:hover {
      filter: brightness(.95);
    }
  }
}
</style>
