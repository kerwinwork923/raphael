<template>
   <div class="tagList">
    <router-link to="#" class="listItem" >總覽</router-link>
    <router-link to="/weekly" class="listItem" active-class="listActive">每周量表</router-link>
    <router-link to="/userRecord" class="listItem" active-class="listActive">睡眠紀錄</router-link>
    <router-link to="#" class="listItem" >兒童成長紀錄</router-link>
  </div>
</template>

<style lang="scss">
.tagList {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75%;
  padding-top: 4.5rem;
  a{
    text-decoration: none;
  }
  .listItem {
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.1px;
    padding: 10px 12px;
    border-radius: 6px;
    color: $raphael-gray-500;
    cursor: pointer;

    &:hover {
      background-color: $raphael-green-400;
      color: #fff;
    }
  }
  .listActive {
    background-color: $raphael-green-400;
    color: #fff;
  }
}
</style>
