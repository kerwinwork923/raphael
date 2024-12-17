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
    font-size: 1.125rem;
    font-weight: 400;
    letter-spacing: 0.1px;
    padding: 0.5rem;
    border-radius: 6px;
    color: $raphael-gray-500;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    &:hover {
      background-color: $raphael-green-300;
    }
  }
  .listActive {
    background-color: $raphael-green-400;
    color: #fff;
    transition: all 0.3s ease;
    &:hover {
      background-color: $raphael-green-400;
      color: #fff;
    }
  }
}
</style>
