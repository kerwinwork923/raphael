<template>
  <div class="raphaelNavbar">
    <div class="logoGroup">
      <router-link to="/user">
        <img src="../assets/imgs/neuro-plus.svg" alt="" />
      </router-link>
    </div>
    <div class="optionGroup">
      <img class="cartIcon" src="../assets/imgs/cart.svg" alt="" />
       <!--<img class="alertIcon" src="../assets/imgs/alert.svg" alt="" />-->
      <a href="/ChangeMember">
        <img class="settingIcon" src="../assets/imgs/setting.svg" alt="" />
      </a>
    </div>
  </div>
</template>

<style lang="scss">
.raphaelNavbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem;
  max-width: 768px;

  .optionGroup {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
    img {
      cursor: pointer;
    }
  }
}
</style>
