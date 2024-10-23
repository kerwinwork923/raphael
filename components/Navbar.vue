<template>
  <div class="raphaelNavbar">
    <div class="logoGroup">
      <router-link to="/user">
        <img src="../assets/imgs/neuro-plus.svg" alt="" />
      </router-link>
      
    </div>
    <div class="optionGroup">
      <!-- <img class="cartIcon" src="../assets/imgs/cart.svg" alt="" />
      <img class="alertIcon" src="../assets/imgs/alert.svg" alt="" />
      <img class="settingIcon" src="../assets/imgs/setting.svg" alt="" /> -->
    </div>
  </div>
</template>

<style lang="scss">
.raphaelNavbar {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 1rem;
  display: flex;
  width: 100%;
  z-index: 999;
  align-items: center;
  max-width: 768px;
  height: 50px;
  
  // background-color: $raphael-gray-200;
  .logoGroup {
    width: 65%;
  }
  .optionGroup {
    display: flex;
    justify-content: flex-end;
    gap: 2px;
    width: 35%;
    margin-right: auto;
    img {
      cursor: pointer;
    }
  }
}
</style>
