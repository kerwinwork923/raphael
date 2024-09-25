<template>
  <div class="raphaelLoading">
    <img src="../assets/imgs/spinner.gif" alt="" />
  </div>
</template>

<style scoped lang="scss">
.raphaelLoading {
  width: 100%;
  height: 100vh;
  position: fixed;
  justify-content: center;
  align-items: center;
  z-index: 99;

  background: rgba(217, 217, 217, 0.5);
  backdrop-filter: blur(2.5px);
  img {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
