<template>
  <div class="tagList">
    <!-- <router-link to="#" class="listItem" >總覽</router-link> -->
    <router-link to="/weekly" class="listItem" active-class="listActive"
      >每周量表</router-link
    >
    <router-link to="/userRecord" class="listItem" active-class="listActive"
      >睡眠紀錄</router-link
    >
    <!-- <router-link to="#" class="listItem" >兒童成長紀錄</router-link> -->
  </div>
</template>

<style lang="scss">
.tagList {
  display: grid;
  grid-auto-flow: column;
  gap: 4px;
  padding-top: 4.25rem;
  a {
    text-decoration: none;
  }
  .listItem {
    font-size: 1rem;
    font-weight: 400;
    letter-spacing: 0.1px;
    padding: 10px 12px;
    border-radius: 6px;
    color: $raphael-gray-500;
    text-align: center;
    cursor: pointer;
    transition: all .3s ease;
    &:hover {
      background-color: $raphael-green-300;
    }
  }
  .listActive {
    background-color: $raphael-green-400;
    color: #fff;
    transition: all .3s ease;
    &:hover {
      background-color: $raphael-green-400;
      color: #fff;
    }
  }
}
</style>
